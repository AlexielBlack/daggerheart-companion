/**
 * @module encounter/stores/encounterLiveStore
 * @description Store Pinia pour le mode « live play » d'une rencontre.
 *
 * Responsabilités :
 *  - Initialisation depuis le builder (encounterStore.serializeEncounter)
 *  - Suivi HP / Stress / conditions des adversaires en temps réel
 *  - Mode de scène actif (PJ Attaque, Adversaire Attaque)
 *  - Projecteur (PJ actif / MJ)
 *  - Persistance localStorage pour résilience
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { allAdversaries } from '@data/adversaries'
import { allEnvironments } from '@data/environments'
import { useStorage } from '@core/composables/useStorage'
import { useCharacterStore } from '@modules/characters/stores/characterStore'
import { computeStatBonuses } from '@data/statModifiers'
import { getClassById } from '@data/classes'
import {
  SCENE_MODE_PC_ATTACK,
  SCENE_MODE_ADVERSARY_ATTACK,
  SCENE_MODE_META,
  SPOTLIGHT_PC,
  SPOTLIGHT_GM,
  isValidSceneMode
} from '@data/encounters/liveConstants'

/**
 * Crée un état live pour un adversaire depuis ses données SRD.
 * @param {Object} adversary - Données SRD complètes
 * @param {number} instanceIndex - Index d'instance (0, 1, 2…) pour les multiples
 * @returns {Object} État live de l'adversaire
 */
function createLiveAdversary(adversary, instanceIndex = 0) {
  return {
    instanceId: `${adversary.id}_${instanceIndex}`,
    adversaryId: adversary.id,
    name: adversary.name,
    type: adversary.type,
    tier: adversary.tier,
    // Stats de base (lecture seule)
    maxHP: adversary.hp,
    maxStress: adversary.stress,
    difficulty: adversary.difficulty,
    thresholds: { ...adversary.thresholds },
    attack: adversary.attack ? { ...adversary.attack } : null,
    features: adversary.features ? [...adversary.features] : [],
    motives: adversary.motives ? [...adversary.motives] : [],
    experiences: adversary.experiences ? [...adversary.experiences] : [],
    focusProfile: adversary.focusProfile ? { ...adversary.focusProfile } : null,
    // État live (mutable)
    markedHP: 0,
    markedStress: 0,
    conditions: [],
    isDefeated: false,
    notes: ''
  }
}

export const useEncounterLiveStore = defineStore('encounter-live', () => {
  // ── Persistence ────────────────────────────────────────
  const liveStorage = useStorage('encounter-live', null)

  // ── État de la rencontre ───────────────────────────────
  const isActive = ref(false)
  const encounterName = ref('')
  const encounterTier = ref(1)

  // ── Mode de scène et projecteur ────────────────────────
  const sceneMode = ref(SCENE_MODE_PC_ATTACK)
  const spotlight = ref(SPOTLIGHT_PC)

  // ── PJs participants (IDs depuis le characterStore) ────
  const participantPcIds = ref([])
  /** ID du PJ actif (celui qui a le projecteur ou est ciblé) */
  const activePcId = ref(null)

  // ── Adversaires live ──────────────────────────────────
  const liveAdversaries = ref([])
  /** ID d'instance de l'adversaire actif */
  const activeAdversaryId = ref(null)

  // ── Environnement ──────────────────────────────────────
  const environmentId = ref(null)

  // ── Spotlight tracking (couche 1 — compteurs par entité) ──
  /** Nombre de fois que chaque PJ a eu le projecteur ce cycle { [id]: count } */
  const pcSpotlights = ref({})
  /** Nombre de fois que chaque adversaire (par adversaryId) a eu le projecteur ce cycle */
  const advSpotlights = ref({})

  // ── Historique de combat ───────────────────────────────
  /** Journal visible des dégâts infligés (pastilles) */
  const combatLog = ref([])
  /** Journal complet de la rencontre (invisible, persisté) */
  const encounterLog = ref([])
  /** PJs à terre { pcId: true } */
  const pcDownStatus = ref({})
  /** Conditions actives des PJs { pcId: ['hidden', 'vulnerable', ...] } */
  const pcConditions = ref({})

  // ── Dernière catégorie cliquée (pour la logique cross-projecteur) ──
  /** 'pc' ou 'adversary' — détermine le sens de l'affrontement */
  const lastClickCategory = ref('pc')

  // ── Pile d'annulation (Ctrl+Z) — non persistée ──────
  /** Snapshots d'état avant chaque action mutante */
  const undoStack = ref([])
  /** Taille maximale de la pile */
  const UNDO_MAX = 50

  /**
   * Sauvegarde un snapshot de l'état actuel dans la pile d'undo.
   * Appelé avant chaque action qui modifie les données de combat.
   */
  function pushUndo() {
    if (!isActive.value) return
    const snapshot = {
      liveAdversaries: JSON.parse(JSON.stringify(liveAdversaries.value)),
      combatLog: JSON.parse(JSON.stringify(combatLog.value)),
      encounterLog: JSON.parse(JSON.stringify(encounterLog.value)),
      pcDownStatus: { ...pcDownStatus.value },
      pcConditions: JSON.parse(JSON.stringify(pcConditions.value)),
      activeAdversaryId: activeAdversaryId.value
    }
    undoStack.value.push(snapshot)
    if (undoStack.value.length > UNDO_MAX) {
      undoStack.value.shift()
    }
  }

  /**
   * Annule la dernière action de combat (Ctrl+Z).
   * @returns {boolean} true si un undo a été effectué
   */
  function undo() {
    if (undoStack.value.length === 0) return false
    const snapshot = undoStack.value.pop()
    liveAdversaries.value = snapshot.liveAdversaries
    combatLog.value = snapshot.combatLog
    encounterLog.value = snapshot.encounterLog
    pcDownStatus.value = snapshot.pcDownStatus
    pcConditions.value = snapshot.pcConditions
    activeAdversaryId.value = snapshot.activeAdversaryId
    persistState()
    return true
  }

  // ═══════════════════════════════════════════════════════
  //  Getters
  // ═══════════════════════════════════════════════════════

  /** Métadonnées du mode de scène actif */
  const currentSceneModeMeta = computed(() => {
    return SCENE_MODE_META[sceneMode.value] || SCENE_MODE_META[SCENE_MODE_PC_ATTACK]
  })

  /** PJs participants avec données enrichies et valeurs effectives */
  const participantPcs = computed(() => {
    try {
      const charStore = useCharacterStore()
      return participantPcIds.value
        .map((id) => {
          const c = charStore.characters.find((ch) => ch.id === id)
          if (!c) return null
          const bonuses = computeStatBonuses(c)
          const cls = getClassById(c.classId)
          const baseHP = cls ? cls.baseHP : 6
          const baseStress = cls ? cls.baseStress : 6

          // Seuils effectifs (avec Bare Bones override + niveau + bonus cartes)
          let effectiveThresholds
          if (bonuses.thresholdsOverride) {
            effectiveThresholds = {
              major: bonuses.thresholdsOverride.major + bonuses.thresholds.major,
              severe: bonuses.thresholdsOverride.severe + bonuses.thresholds.severe
            }
          } else {
            effectiveThresholds = {
              major: (c.armorBaseThresholds?.major || 0) + c.level + bonuses.thresholds.major,
              severe: (c.armorBaseThresholds?.severe || 0) + c.level + bonuses.thresholds.severe
            }
          }

          // Score d'armure effectif (avec Bare Bones override + bonus cartes)
          let effectiveArmorScore
          if (bonuses.armorScoreOverride !== null) {
            effectiveArmorScore = bonuses.armorScoreOverride + bonuses.armorScore
          } else {
            effectiveArmorScore = (c.armorScore || 0) + bonuses.armorScore
          }

          return {
            id: c.id,
            name: c.name || 'PJ sans nom',
            classId: c.classId || '',
            className: c.className || '—',
            subclassId: c.subclassId || '',
            level: c.level || 1,
            maxHP: baseHP + bonuses.maxHP,
            maxStress: baseStress + bonuses.maxStress,
            evasion: c.evasion || 10,
            evasionBonus: (c.evasionBonus || 0) + bonuses.evasion,
            armorScore: effectiveArmorScore,
            armorName: c.armorName || '',
            armorBaseThresholds: effectiveThresholds,
            domainCards: c.domainCards || { loadout: [], vault: [] },
            ancestryId: c.ancestryId || '',
            communityId: c.communityId || '',
            mixedAncestryData: c.mixedAncestryData || null,
            proficiency: (c.proficiency || 1) + bonuses.proficiency,
            primaryWeaponId: c.primaryWeaponId || '',
            secondaryWeaponId: c.secondaryWeaponId || '',
            experiences: Array.isArray(c.experiences) ? c.experiences.filter((e) => e.name) : [],
            subclassProgression: c.subclassProgression || 'foundation'
          }
        })
        .filter(Boolean)
    } catch {
      return []
    }
  })

  /** PJ actuellement actif (données enrichies) */
  const activePc = computed(() => {
    if (!activePcId.value) return null
    return participantPcs.value.find((pc) => pc.id === activePcId.value) || null
  })

  /** Adversaires non vaincus */
  const activeAdversaries = computed(() => {
    return liveAdversaries.value.filter((a) => !a.isDefeated)
  })

  /** Adversaires vaincus */
  const defeatedAdversaries = computed(() => {
    return liveAdversaries.value.filter((a) => a.isDefeated)
  })

  /** Adversaire actuellement actif (celui qui a le projecteur ou est ciblé) */
  const activeAdversary = computed(() => {
    if (!activeAdversaryId.value) return null
    return liveAdversaries.value.find((a) => a.instanceId === activeAdversaryId.value) || null
  })

  /** Adversaires groupés par type (adversaryId) pour affichage compact */
  const groupedAdversaries = computed(() => {
    const groups = {}
    for (const adv of liveAdversaries.value) {
      if (!groups[adv.adversaryId]) {
        groups[adv.adversaryId] = {
          adversaryId: adv.adversaryId,
          name: adv.name,
          type: adv.type,
          instances: [],
          activeCount: 0,
          defeatedCount: 0
        }
      }
      const g = groups[adv.adversaryId]
      g.instances.push(adv)
      if (adv.isDefeated) {
        g.defeatedCount++
      } else {
        g.activeCount++
      }
    }
    return Object.values(groups)
  })

  /** Toutes les instances du même type que l'adversaire actif */
  const activeAdversarySiblings = computed(() => {
    if (!activeAdversary.value) return []
    return liveAdversaries.value.filter(
      (a) => a.adversaryId === activeAdversary.value.adversaryId
    )
  })

  /** Environnement complet */
  const activeEnvironment = computed(() => {
    if (!environmentId.value) return null
    return allEnvironments.find((e) => e.id === environmentId.value) || null
  })

  /** Résumé combat : HP/Stress restants côté adversaires */
  const adversaryCombatSummary = computed(() => {
    const active = activeAdversaries.value
    return {
      count: active.length,
      totalHP: active.reduce((s, a) => s + a.maxHP, 0),
      markedHP: active.reduce((s, a) => s + a.markedHP, 0),
      totalStress: active.reduce((s, a) => s + a.maxStress, 0),
      markedStress: active.reduce((s, a) => s + a.markedStress, 0)
    }
  })

  /** Le projecteur est-il côté PJ ? */
  const isPlayerSpotlight = computed(() => spotlight.value === SPOTLIGHT_PC)

  /** Le projecteur est-il côté MJ ? */
  const isGmSpotlight = computed(() => spotlight.value === SPOTLIGHT_GM)

  // ═══════════════════════════════════════════════════════
  //  Actions — Initialisation
  // ═══════════════════════════════════════════════════════

  /**
   * Lance une rencontre live depuis les données du builder.
   * @param {Object} builderData - Résultat de encounterStore.serializeEncounter()
   */
  function startEncounter(builderData) {
    if (!builderData) return

    // Reset
    resetLive()

    encounterName.value = builderData.name || ''
    encounterTier.value = builderData.tier || 1

    // PJs
    participantPcIds.value = Array.isArray(builderData.selectedPcIds)
      ? [...builderData.selectedPcIds]
      : []

    // Sélectionner le premier PJ par défaut
    if (participantPcIds.value.length > 0) {
      activePcId.value = participantPcIds.value[0]
    }

    // Adversaires : créer les instances live
    if (Array.isArray(builderData.adversarySlots)) {
      const instances = []
      for (const slot of builderData.adversarySlots) {
        const adversaryData = allAdversaries.find((a) => a.id === slot.adversaryId)
        if (!adversaryData) continue
        for (let i = 0; i < slot.quantity; i++) {
          instances.push(createLiveAdversary(adversaryData, i))
        }
      }
      liveAdversaries.value = instances
    }

    // Sélectionner le premier adversaire par défaut
    if (liveAdversaries.value.length > 0) {
      activeAdversaryId.value = liveAdversaries.value[0].instanceId
    }

    // Environnement
    environmentId.value = builderData.environmentId || null

    // Activer
    isActive.value = true

    // Persister immédiatement (action critique)
    persistStateNow()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Mode de scène & Projecteur
  // ═══════════════════════════════════════════════════════

  /**
   * Change le mode de scène.
   * @param {string} mode
   */
  function setSceneMode(mode) {
    if (isValidSceneMode(mode)) {
      sceneMode.value = mode
      spotlight.value = mode === SCENE_MODE_PC_ATTACK ? SPOTLIGHT_PC : SPOTLIGHT_GM
      persistState()
    }
  }

  /**
   * Donne le projecteur aux PJs.
   */
  function setPlayerSpotlight() {
    spotlight.value = SPOTLIGHT_PC
    persistState()
  }

  /**
   * Donne le projecteur au MJ.
   */
  function setGmSpotlight() {
    spotlight.value = SPOTLIGHT_GM
    persistState()
  }

  /**
   * Bascule le projecteur PJ ↔ MJ.
   */
  function toggleSpotlight() {
    spotlight.value = spotlight.value === SPOTLIGHT_PC ? SPOTLIGHT_GM : SPOTLIGHT_PC
    persistState()
  }

  /**
   * Sélectionne un PJ avec logique cross-catégorie.
   * @param {string} pcId
   */
  function selectPc(pcId) {
    if (!participantPcIds.value.includes(pcId)) return

    const isSameEntity = activePcId.value === pcId && lastClickCategory.value === 'pc'

    if (isSameEntity) {
      swapSpotlight()
    } else if (lastClickCategory.value === 'adversary') {
      activePcId.value = pcId
      sceneMode.value = SCENE_MODE_ADVERSARY_ATTACK
      spotlight.value = SPOTLIGHT_GM
      lastClickCategory.value = 'pc'
    } else {
      activePcId.value = pcId
      lastClickCategory.value = 'pc'
    }
    persistState()
  }

  /**
   * Sélectionne un groupe d'adversaires avec logique cross-catégorie.
   * @param {string} adversaryId
   */
  function selectAdversaryGroup(adversaryId) {
    const currentAdvId = activeAdversary.value?.adversaryId
    const isSameEntity = currentAdvId === adversaryId && lastClickCategory.value === 'adversary'

    if (isSameEntity) {
      swapSpotlight()
    } else if (lastClickCategory.value === 'pc') {
      setActiveAdversaryGroupInternal(adversaryId)
      sceneMode.value = SCENE_MODE_PC_ATTACK
      spotlight.value = SPOTLIGHT_PC
      lastClickCategory.value = 'adversary'
    } else {
      setActiveAdversaryGroupInternal(adversaryId)
      lastClickCategory.value = 'adversary'
    }
    persistState()
  }

  /**
   * Inverse le projecteur sans changer la sélection.
   */
  function swapSpotlight() {
    if (sceneMode.value === SCENE_MODE_PC_ATTACK) {
      sceneMode.value = SCENE_MODE_ADVERSARY_ATTACK
      spotlight.value = SPOTLIGHT_GM
    } else {
      sceneMode.value = SCENE_MODE_PC_ATTACK
      spotlight.value = SPOTLIGHT_PC
    }
    persistState()
  }

  /**
   * Sélectionne un PJ comme actif (interne, sans logique cross-catégorie).
   * @param {string} pcId
   */
  function setActivePc(pcId) {
    if (participantPcIds.value.includes(pcId)) {
      activePcId.value = pcId
      persistState()
    }
  }

  /**
   * Sélectionne un adversaire comme actif (interne).
   * @param {string} instanceId
   */
  function setActiveAdversary(instanceId) {
    const exists = liveAdversaries.value.some((a) => a.instanceId === instanceId)
    if (exists) {
      activeAdversaryId.value = instanceId
      persistState()
    }
  }

  /**
   * Sélectionne un groupe d'adversaires par adversaryId (interne).
   * @param {string} adversaryId
   */
  function setActiveAdversaryGroupInternal(adversaryId) {
    const firstActive = liveAdversaries.value.find(
      (a) => a.adversaryId === adversaryId && !a.isDefeated
    )
    const fallback = liveAdversaries.value.find(
      (a) => a.adversaryId === adversaryId
    )
    const target = firstActive || fallback
    if (target) {
      activeAdversaryId.value = target.instanceId
    }
  }

  /**
   * Sélectionne un groupe d'adversaires (API publique legacy).
   * @param {string} adversaryId
   */
  function setActiveAdversaryGroup(adversaryId) {
    setActiveAdversaryGroupInternal(adversaryId)
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Conditions (PJ et Adversaire)
  // ═══════════════════════════════════════════════════════

  /**
   * Toggle une condition sur un PJ.
   * @param {string} pcId
   * @param {string} condition
   */
  function togglePcCondition(pcId, condition) {
    pushUndo()
    if (!pcConditions.value[pcId]) {
      pcConditions.value[pcId] = []
    }
    const idx = pcConditions.value[pcId].indexOf(condition)
    const pc = participantPcs.value.find((p) => p.id === pcId)
    if (idx >= 0) {
      pcConditions.value[pcId].splice(idx, 1)
      encounterLog.value.push({
        action: 'condition_removed',
        entityType: 'pc',
        entityId: pcId,
        entityName: pc ? pc.name : '?',
        condition,
        timestamp: Date.now()
      })
    } else {
      pcConditions.value[pcId].push(condition)
      encounterLog.value.push({
        action: 'condition_added',
        entityType: 'pc',
        entityId: pcId,
        entityName: pc ? pc.name : '?',
        condition,
        timestamp: Date.now()
      })
    }
    pcConditions.value = { ...pcConditions.value }
    persistState()
  }

  /**
   * Toggle une condition sur un adversaire.
   * @param {string} instanceId
   * @param {string} condition
   */
  function toggleAdversaryCondition(instanceId, condition) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    const idx = adv.conditions.indexOf(condition)
    if (idx >= 0) {
      adv.conditions.splice(idx, 1)
      encounterLog.value.push({
        action: 'condition_removed',
        entityType: 'adversary',
        entityId: instanceId,
        entityName: adv.name,
        condition,
        timestamp: Date.now()
      })
    } else {
      adv.conditions.push(condition)
      encounterLog.value.push({
        action: 'condition_added',
        entityType: 'adversary',
        entityId: instanceId,
        entityName: adv.name,
        condition,
        timestamp: Date.now()
      })
    }
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — HP / Stress adversaire
  // ═══════════════════════════════════════════════════════

  /**
   * Marque des HP sur un adversaire.
   * @param {string} instanceId
   * @param {number} [amount=1]
   */
  function markAdversaryHP(instanceId, amount = 1) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv || adv.isDefeated) return
    const prev = adv.markedHP
    adv.markedHP = Math.min(adv.maxHP, adv.markedHP + amount)
    const actual = adv.markedHP - prev
    if (actual > 0 && activePcId.value) {
      const last = combatLog.value[combatLog.value.length - 1]
      if (last && last.action === 'damage' && last.type === 'hp'
        && last.pcId === activePcId.value && last.instanceId === instanceId) {
        last.amount += actual
        last.timestamp = Date.now()
        const lastEnc = encounterLog.value.findLast(
          (e) => e.action === 'damage' && e.type === 'hp'
            && e.pcId === activePcId.value && e.instanceId === instanceId
        )
        if (lastEnc) {
          lastEnc.amount += actual
          lastEnc.timestamp = Date.now()
        }
      } else {
        const pc = participantPcs.value.find((p) => p.id === activePcId.value)
        const entry = {
          action: 'damage',
          pcId: activePcId.value,
          pcName: pc ? pc.name : '?',
          instanceId,
          advName: adv.name,
          type: 'hp',
          amount: actual,
          timestamp: Date.now()
        }
        combatLog.value.push(entry)
        encounterLog.value.push({ ...entry })
      }
    }
    // Vérifier défaite : Minions n'ont pas de seuils
    if (adv.type === 'Minion' && adv.markedHP > 0) {
      adv.isDefeated = true
      const pcDown = participantPcs.value.find((p) => p.id === activePcId.value)
      encounterLog.value.push({
        action: 'adv_down',
        instanceId,
        advName: adv.name,
        pcId: activePcId.value || null,
        pcName: pcDown ? pcDown.name : '?',
        timestamp: Date.now()
      })
    }
    persistState()
  }

  /**
   * Retire des HP marqués sur un adversaire.
   * @param {string} instanceId
   * @param {number} [amount=1]
   */
  function clearAdversaryHP(instanceId, amount = 1) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.markedHP = Math.max(0, adv.markedHP - amount)
    if (adv.isDefeated && adv.markedHP < adv.maxHP) {
      adv.isDefeated = false
    }
    persistState()
  }

  /**
   * Marque du Stress sur un adversaire.
   * @param {string} instanceId
   * @param {number} [amount=1]
   */
  function markAdversaryStress(instanceId, amount = 1) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv || adv.isDefeated) return
    const prev = adv.markedStress
    adv.markedStress = Math.min(adv.maxStress, adv.markedStress + amount)
    const actual = adv.markedStress - prev
    if (actual > 0 && activePcId.value) {
      const last = combatLog.value[combatLog.value.length - 1]
      if (last && last.action === 'damage' && last.type === 'stress'
        && last.pcId === activePcId.value && last.instanceId === instanceId) {
        last.amount += actual
        last.timestamp = Date.now()
        const lastEnc = encounterLog.value.findLast(
          (e) => e.action === 'damage' && e.type === 'stress'
            && e.pcId === activePcId.value && e.instanceId === instanceId
        )
        if (lastEnc) {
          lastEnc.amount += actual
          lastEnc.timestamp = Date.now()
        }
      } else {
        const pc = participantPcs.value.find((p) => p.id === activePcId.value)
        const entry = {
          action: 'damage',
          pcId: activePcId.value,
          pcName: pc ? pc.name : '?',
          instanceId,
          advName: adv.name,
          type: 'stress',
          amount: actual,
          timestamp: Date.now()
        }
        combatLog.value.push(entry)
        encounterLog.value.push({ ...entry })
      }
    }
    persistState()
  }

  /**
   * Retire du Stress marqué sur un adversaire.
   * @param {string} instanceId
   * @param {number} [amount=1]
   */
  function clearAdversaryStress(instanceId, amount = 1) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.markedStress = Math.max(0, adv.markedStress - amount)
    persistState()
  }

  /**
   * Supprime une entrée du combat log (pastille cliquée par erreur).
   * @param {number} index - Index dans combatLog
   */
  function removeCombatLogEntry(index) {
    pushUndo()
    if (index < 0 || index >= combatLog.value.length) return
    const entry = combatLog.value[index]
    combatLog.value.splice(index, 1)
    encounterLog.value.push({
      ...entry,
      action: 'damage_removed',
      timestamp: Date.now()
    })
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — PJ touché (par un adversaire)
  // ═══════════════════════════════════════════════════════

  /**
   * Enregistre qu'un PJ a pris des dégâts de l'adversaire actif.
   * @param {string} pcId
   * @param {number} hpAmount - Nombre de HP marqués (1 à 4)
   */
  function logPcHit(pcId, hpAmount) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return
    const entry = {
      action: 'pc_hit',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      hpMarked: hpAmount,
      timestamp: Date.now()
    }
    combatLog.value.push(entry)
    encounterLog.value.push(entry)
    persistState()
  }

  /**
   * Met un PJ à terre (ou annule si déjà à terre).
   * @param {string} pcId
   * @returns {boolean} true si mis à terre, false si annulé
   */
  function logPcDown(pcId) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return false

    if (pcDownStatus.value[pcId]) {
      delete pcDownStatus.value[pcId]
      pcDownStatus.value = { ...pcDownStatus.value }
      encounterLog.value.push({
        action: 'pc_down_cancelled',
        pcId,
        pcName: pc.name,
        timestamp: Date.now()
      })
      persistState()
      return false
    }

    pcDownStatus.value[pcId] = true
    pcDownStatus.value = { ...pcDownStatus.value }
    encounterLog.value.push({
      action: 'pc_down',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      timestamp: Date.now()
    })
    persistState()
    return true
  }

  /**
   * Réanime un PJ à terre.
   * @param {string} pcId
   */
  function logPcRevive(pcId) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    if (!pc || !pcDownStatus.value[pcId]) return
    delete pcDownStatus.value[pcId]
    pcDownStatus.value = { ...pcDownStatus.value }
    encounterLog.value.push({
      action: 'pc_revive',
      pcId,
      pcName: pc.name,
      timestamp: Date.now()
    })
    persistState()
  }

  /**
   * Enregistre qu'un PJ a utilisé un slot d'armure.
   * @param {string} pcId
   */
  function logPcArmorUsed(pcId) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return
    const entry = {
      action: 'pc_armor',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      timestamp: Date.now()
    }
    combatLog.value.push(entry)
    encounterLog.value.push(entry)
    persistState()
  }

  /**
   * Enregistre une attaque ratée.
   * @param {string} attackerType - 'pc' ou 'adversary'
   */
  function logMiss(attackerType) {
    pushUndo()
    if (attackerType === 'pc') {
      const pc = participantPcs.value.find((p) => p.id === activePcId.value)
      const adv = activeAdversary.value
      const entry = {
        action: 'miss',
        attackerType: 'pc',
        pcId: activePcId.value || null,
        pcName: pc ? pc.name : '?',
        instanceId: adv ? adv.instanceId : null,
        advName: adv ? adv.name : '?',
        timestamp: Date.now()
      }
      combatLog.value.push(entry)
      encounterLog.value.push(entry)
    } else {
      const adv = activeAdversary.value
      const pc = participantPcs.value.find((p) => p.id === activePcId.value)
      const entry = {
        action: 'miss',
        attackerType: 'adversary',
        pcId: activePcId.value || null,
        pcName: pc ? pc.name : '?',
        instanceId: adv ? adv.instanceId : null,
        advName: adv ? adv.name : '?',
        timestamp: Date.now()
      }
      combatLog.value.push(entry)
      encounterLog.value.push(entry)
    }
    persistState()
  }

  /**
   * Ajoute une condition à un adversaire.
   * @param {string} instanceId
   * @param {string} condition
   */
  function addAdversaryCondition(instanceId, condition) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv || adv.conditions.includes(condition)) return
    adv.conditions.push(condition)
    persistState()
  }

  /**
   * Retire une condition d'un adversaire.
   * @param {string} instanceId
   * @param {string} condition
   */
  function removeAdversaryCondition(instanceId, condition) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    const idx = adv.conditions.indexOf(condition)
    if (idx >= 0) {
      adv.conditions.splice(idx, 1)
      persistState()
    }
  }

  /**
   * Marque un adversaire comme vaincu.
   * @param {string} instanceId
   */
  function defeatAdversary(instanceId) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.isDefeated = true
    const pc = participantPcs.value.find((p) => p.id === activePcId.value)
    encounterLog.value.push({
      action: 'adv_down',
      instanceId,
      advName: adv.name,
      pcId: activePcId.value || null,
      pcName: pc ? pc.name : '?',
      timestamp: Date.now()
    })
    if (activeAdversaryId.value === instanceId) {
      const next = activeAdversaries.value[0]
      activeAdversaryId.value = next ? next.instanceId : null
    }
    persistState()
  }

  /**
   * Réanime un adversaire vaincu.
   * @param {string} instanceId
   */
  function reviveAdversary(instanceId) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.isDefeated = false
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Renforts mid-combat
  // ═══════════════════════════════════════════════════════

  /**
   * Ajoute des renforts en cours de combat.
   * @param {string} adversaryId - ID SRD de l'adversaire
   * @param {number} [quantity=1] - Nombre d'instances à ajouter
   * @returns {string[]} instanceIds créés
   */
  function addReinforcement(adversaryId, quantity = 1) {
    pushUndo()
    const adversaryData = allAdversaries.find((a) => a.id === adversaryId)
    if (!adversaryData) return []

    // Trouver le prochain index d'instance pour cet adversaire
    const existingCount = liveAdversaries.value.filter(
      (a) => a.adversaryId === adversaryId
    ).length

    const newIds = []
    for (let i = 0; i < quantity; i++) {
      const instance = createLiveAdversary(adversaryData, existingCount + i)
      liveAdversaries.value.push(instance)
      newIds.push(instance.instanceId)
    }

    encounterLog.value.push({
      action: 'reinforcement',
      adversaryId,
      advName: adversaryData.name,
      quantity,
      instanceIds: newIds,
      timestamp: Date.now()
    })

    // Sélectionner le premier renfort si aucun adversaire actif
    if (!activeAdversaryId.value && newIds.length > 0) {
      activeAdversaryId.value = newIds[0]
    }

    persistState()
    return newIds
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Notes adversaires
  // ═══════════════════════════════════════════════════════

  /**
   * Met à jour les notes d'un adversaire.
   * @param {string} instanceId
   * @param {string} text
   */
  function setAdversaryNotes(instanceId, text) {
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.notes = text
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Spotlight (couche 1 uniquement)
  // ═══════════════════════════════════════════════════════

  /**
   * Incrémente le compteur spotlight d'un PJ.
   * Si tous les PJs ont joué au moins une fois, reset automatique.
   * @param {string} pcId
   */
  function togglePcSpotlight(pcId) {
    if (!pcSpotlights.value[pcId]) {
      pcSpotlights.value[pcId] = 0
    }
    pcSpotlights.value[pcId]++
    pcSpotlights.value = { ...pcSpotlights.value }

    if (pcSpotlights.value[pcId] > 1) {
      const pc = participantPcs.value.find((p) => p.id === pcId)
      encounterLog.value.push({
        action: 'multi_spotlight',
        entityType: 'pc',
        entityId: pcId,
        entityName: pc ? pc.name : '?',
        count: pcSpotlights.value[pcId],
        timestamp: Date.now()
      })
    }

    // Auto-reset si tous les PJs ont joué au moins une fois
    const allPlayed = participantPcIds.value.length > 0 &&
      participantPcIds.value.every((id) => pcSpotlights.value[id] >= 1)
    if (allPlayed) {
      pcSpotlights.value = {}
    }
    persistState()
  }

  /**
   * Décrémente le compteur spotlight d'un PJ (correction d'erreur).
   * @param {string} pcId
   */
  function decrementPcSpotlight(pcId) {
    if (pcSpotlights.value[pcId] > 0) {
      pcSpotlights.value[pcId]--
      if (pcSpotlights.value[pcId] === 0) {
        delete pcSpotlights.value[pcId]
      }
      pcSpotlights.value = { ...pcSpotlights.value }
      persistState()
    }
  }

  /**
   * Incrémente le compteur spotlight d'un adversaire.
   * Si tous les adversaires actifs ont joué au moins une fois, reset automatique.
   * @param {string} adversaryId
   */
  function toggleAdvSpotlight(adversaryId) {
    if (!advSpotlights.value[adversaryId]) {
      advSpotlights.value[adversaryId] = 0
    }
    advSpotlights.value[adversaryId]++
    advSpotlights.value = { ...advSpotlights.value }

    if (advSpotlights.value[adversaryId] > 1) {
      const group = groupedAdversaries.value.find((g) => g.adversaryId === adversaryId)
      encounterLog.value.push({
        action: 'multi_spotlight',
        entityType: 'adversary',
        entityId: adversaryId,
        entityName: group ? group.name : '?',
        count: advSpotlights.value[adversaryId],
        timestamp: Date.now()
      })
    }

    // Auto-reset si tous les groupes actifs ont joué au moins une fois
    const activeGroups = groupedAdversaries.value.filter((g) => g.activeCount > 0)
    const allPlayed = activeGroups.length > 0 &&
      activeGroups.every((g) => advSpotlights.value[g.adversaryId] >= 1)
    if (allPlayed) {
      advSpotlights.value = {}
    }
    persistState()
  }

  /**
   * Décrémente le compteur spotlight d'un adversaire (correction d'erreur).
   * @param {string} adversaryId
   */
  function decrementAdvSpotlight(adversaryId) {
    if (advSpotlights.value[adversaryId] > 0) {
      advSpotlights.value[adversaryId]--
      if (advSpotlights.value[adversaryId] === 0) {
        delete advSpotlights.value[adversaryId]
      }
      advSpotlights.value = { ...advSpotlights.value }
      persistState()
    }
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Persistence
  // ═══════════════════════════════════════════════════════

  /**
   * Sérialise l'état live pour la persistence.
   * @returns {Object}
   */
  function serializeLiveState() {
    return {
      isActive: isActive.value,
      encounterName: encounterName.value,
      encounterTier: encounterTier.value,
      sceneMode: sceneMode.value,
      spotlight: spotlight.value,
      participantPcIds: [...participantPcIds.value],
      activePcId: activePcId.value,
      liveAdversaries: liveAdversaries.value.map((a) => ({
        ...a,
        features: [...a.features],
        motives: [...a.motives],
        experiences: [...a.experiences],
        conditions: [...a.conditions],
        thresholds: { ...a.thresholds },
        attack: a.attack ? { ...a.attack } : null,
        focusProfile: a.focusProfile ? { ...a.focusProfile } : null
      })),
      activeAdversaryId: activeAdversaryId.value,
      environmentId: environmentId.value,
      lastClickCategory: lastClickCategory.value,
      pcSpotlights: { ...pcSpotlights.value },
      advSpotlights: { ...advSpotlights.value },
      combatLog: [...combatLog.value],
      encounterLog: [...encounterLog.value],
      pcDownStatus: { ...pcDownStatus.value },
      pcConditions: JSON.parse(JSON.stringify(pcConditions.value))
    }
  }

  /**
   * Persiste l'état dans le localStorage (debounced 300ms).
   * Évite les écritures excessives lors d'actions rapides en combat.
   */
  let _persistTimer = null
  function persistState() {
    if (!isActive.value) return
    if (_persistTimer) clearTimeout(_persistTimer)
    _persistTimer = setTimeout(() => {
      liveStorage.save(serializeLiveState())
      _persistTimer = null
    }, 300)
  }

  /**
   * Persiste immédiatement (sans debounce).
   * Utilisé pour les actions critiques : startEncounter, endEncounter.
   */
  function persistStateNow() {
    if (!isActive.value) return
    if (_persistTimer) clearTimeout(_persistTimer)
    _persistTimer = null
    liveStorage.save(serializeLiveState())
  }

  /**
   * Restaure l'état depuis le localStorage.
   * @returns {boolean} true si un état a été restauré
   */
  function restoreState() {
    const data = liveStorage.data.value
    if (!data || !data.isActive) return false

    isActive.value = true
    encounterName.value = data.encounterName || ''
    encounterTier.value = data.encounterTier || 1
    sceneMode.value = isValidSceneMode(data.sceneMode) ? data.sceneMode : SCENE_MODE_PC_ATTACK
    spotlight.value = [SPOTLIGHT_PC, SPOTLIGHT_GM].includes(data.spotlight) ? data.spotlight : SPOTLIGHT_PC
    participantPcIds.value = Array.isArray(data.participantPcIds) ? [...data.participantPcIds] : []
    activePcId.value = data.activePcId || null
    liveAdversaries.value = Array.isArray(data.liveAdversaries) ? data.liveAdversaries : []
    activeAdversaryId.value = data.activeAdversaryId || null
    environmentId.value = data.environmentId || null
    lastClickCategory.value = data.lastClickCategory || 'pc'
    pcSpotlights.value = data.pcSpotlights && typeof data.pcSpotlights === 'object'
      ? { ...data.pcSpotlights }
      : {}
    advSpotlights.value = data.advSpotlights && typeof data.advSpotlights === 'object'
      ? { ...data.advSpotlights }
      : {}
    combatLog.value = Array.isArray(data.combatLog) ? [...data.combatLog] : []
    encounterLog.value = Array.isArray(data.encounterLog) ? [...data.encounterLog] : []
    pcDownStatus.value = data.pcDownStatus && typeof data.pcDownStatus === 'object'
      ? { ...data.pcDownStatus }
      : {}
    pcConditions.value = data.pcConditions && typeof data.pcConditions === 'object'
      ? JSON.parse(JSON.stringify(data.pcConditions))
      : {}

    return true
  }

  /**
   * Réinitialise complètement l'état live.
   */
  function resetLive() {
    isActive.value = false
    encounterName.value = ''
    encounterTier.value = 1
    sceneMode.value = SCENE_MODE_PC_ATTACK
    spotlight.value = SPOTLIGHT_PC
    participantPcIds.value = []
    activePcId.value = null
    liveAdversaries.value = []
    activeAdversaryId.value = null
    environmentId.value = null
    lastClickCategory.value = 'pc'
    pcSpotlights.value = {}
    advSpotlights.value = {}
    combatLog.value = []
    encounterLog.value = []
    pcDownStatus.value = {}
    pcConditions.value = {}
    undoStack.value = []
    liveStorage.remove()
  }

  /** Dernier résumé de rencontre (survit au reset, pas persisté) */
  const lastEncounterSummary = ref(null)

  /**
   * Génère un résumé de la rencontre en cours.
   * @returns {Object|null}
   */
  function generateSummary() {
    if (!isActive.value && liveAdversaries.value.length === 0) return null

    const defeated = liveAdversaries.value.filter((a) => a.isDefeated)
    const surviving = liveAdversaries.value.filter((a) => !a.isDefeated)
    const pcsFallen = Object.keys(pcDownStatus.value).filter((id) => pcDownStatus.value[id])
    const totalHPMarked = liveAdversaries.value.reduce((s, a) => s + a.markedHP, 0)
    const totalStressMarked = liveAdversaries.value.reduce((s, a) => s + a.markedStress, 0)
    const hitCount = encounterLog.value.filter((e) => e.action === 'damage').length
    const missCount = encounterLog.value.filter((e) => e.action === 'miss').length
    const pcHitCount = encounterLog.value.filter((e) => e.action === 'pc_hit').length

    // Dégâts par PJ
    const damageByPc = {}
    for (const entry of encounterLog.value) {
      if (entry.action === 'damage' && entry.pcId) {
        if (!damageByPc[entry.pcId]) {
          damageByPc[entry.pcId] = { pcName: entry.pcName, hp: 0, stress: 0 }
        }
        if (entry.type === 'hp') damageByPc[entry.pcId].hp += entry.amount
        if (entry.type === 'stress') damageByPc[entry.pcId].stress += entry.amount
      }
    }

    // Kills par PJ
    const killsByPc = {}
    for (const entry of encounterLog.value) {
      if (entry.action === 'adv_down' && entry.pcId) {
        if (!killsByPc[entry.pcId]) {
          killsByPc[entry.pcId] = { pcName: entry.pcName, count: 0, names: [] }
        }
        killsByPc[entry.pcId].count++
        killsByPc[entry.pcId].names.push(entry.advName)
      }
    }

    return {
      name: encounterName.value,
      tier: encounterTier.value,
      totalAdversaries: liveAdversaries.value.length,
      defeated: defeated.map((a) => ({ name: a.name, instanceId: a.instanceId })),
      surviving: surviving.map((a) => ({ name: a.name, markedHP: a.markedHP, maxHP: a.maxHP })),
      pcsFallen,
      totalHPMarked,
      totalStressMarked,
      hitCount,
      missCount,
      pcHitCount,
      damageByPc,
      killsByPc,
      logEntries: encounterLog.value.length,
      endedAt: new Date().toISOString()
    }
  }

  /**
   * Termine la rencontre, génère le résumé, puis nettoie.
   */
  function endEncounter() {
    lastEncounterSummary.value = generateSummary()
    resetLive()
  }

  // ═══════════════════════════════════════════════════════
  //  Export
  // ═══════════════════════════════════════════════════════

  return {
    // État
    isActive,
    encounterName,
    encounterTier,
    sceneMode,
    spotlight,
    participantPcIds,
    activePcId,
    liveAdversaries,
    activeAdversaryId,
    environmentId,
    lastClickCategory,
    pcSpotlights,
    advSpotlights,
    combatLog,
    encounterLog,
    pcDownStatus,
    pcConditions,

    // Getters
    currentSceneModeMeta,
    participantPcs,
    activePc,
    activeAdversaries,
    defeatedAdversaries,
    activeAdversary,
    groupedAdversaries,
    activeAdversarySiblings,
    activeEnvironment,
    adversaryCombatSummary,
    isPlayerSpotlight,
    isGmSpotlight,

    // Actions — Initialisation
    startEncounter,

    // Actions — Mode & Projecteur
    setSceneMode,
    setPlayerSpotlight,
    setGmSpotlight,
    toggleSpotlight,
    setActivePc,
    setActiveAdversary,
    setActiveAdversaryGroup,
    selectPc,
    selectAdversaryGroup,
    swapSpotlight,

    // Actions — Adversaire live
    markAdversaryHP,
    clearAdversaryHP,
    markAdversaryStress,
    clearAdversaryStress,
    addAdversaryCondition,
    removeAdversaryCondition,
    removeCombatLogEntry,
    logPcHit,
    logPcDown,
    logPcRevive,
    logPcArmorUsed,
    logMiss,
    togglePcCondition,
    toggleAdversaryCondition,
    defeatAdversary,
    reviveAdversary,
    addReinforcement,
    setAdversaryNotes,

    // Actions — Spotlight (couche 1)
    togglePcSpotlight,
    decrementPcSpotlight,
    toggleAdvSpotlight,
    decrementAdvSpotlight,

    // Actions — Persistence
    serializeLiveState,
    persistState,
    restoreState,
    resetLive,
    endEncounter,

    // Actions — Undo
    undo,
    undoStack,

    // Actions — Résumé
    lastEncounterSummary,
    generateSummary
  }
})
