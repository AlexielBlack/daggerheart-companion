/**
 * @module encounter/stores/encounterLiveStore
 * @description Store Pinia pour le mode « live play » d'une rencontre.
 *
 * Responsabilités :
 *  - Initialisation depuis le builder (encounterStore.serializeEncounter)
 *  - Fear / Hope pools avec historique
 *  - Suivi HP / Stress / conditions des adversaires en temps réel
 *  - Mode de scène actif (PJ Attaque, Adversaire Attaque, Social, Traversal)
 *  - Projecteur (PJ actif / MJ)
 *  - Compteur de rounds
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
  INITIAL_FEAR,
  MAX_FEAR,
  MAX_HOPE,
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

  // ── Fear / Hope ────────────────────────────────────────
  const fear = ref(INITIAL_FEAR)
  const hope = ref(0)
  const fearHopeHistory = ref([])

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

  // ── Compteur de rounds ─────────────────────────────────
  const round = ref(1)

  // ── Spotlight Tracker (tokens par PJ) ──────────────────
  /** Nombre de fois que chaque PJ a eu le projecteur ce round { pcId: count } */
  const spotlightTokens = ref({})

  // ── Spotlight tracking ce round { [id]: count } ────────
  /** Nombre de fois que chaque PJ a eu le projecteur ce round */
  const pcSpotlights = ref({})
  /** Nombre de fois que chaque adversaire (par adversaryId) a eu le projecteur ce round */
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

    // Hope initial : 1 par PJ participant (convention courante)
    hope.value = participantPcIds.value.length || 0

    // Activer
    isActive.value = true
    round.value = 1

    // Persister
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Fear / Hope
  // ═══════════════════════════════════════════════════════

  /**
   * Ajoute de la Fear.
   * @param {number} [amount=1]
   * @param {string} [reason=''] - Raison pour l'historique
   */
  function addFear(amount = 1, reason = '') {
    const prev = fear.value
    fear.value = Math.min(MAX_FEAR, fear.value + amount)
    const actual = fear.value - prev
    if (actual > 0) {
      fearHopeHistory.value.push({
        type: 'fear',
        delta: actual,
        newValue: fear.value,
        reason,
        round: round.value,
        timestamp: Date.now()
      })
      persistState()
    }
  }

  /**
   * Dépense de la Fear.
   * @param {number} [amount=1]
   * @param {string} [reason='']
   * @returns {boolean} true si la dépense a réussi
   */
  function spendFear(amount = 1, reason = '') {
    if (fear.value < amount) return false
    fear.value -= amount
    fearHopeHistory.value.push({
      type: 'fear',
      delta: -amount,
      newValue: fear.value,
      reason,
      round: round.value,
      timestamp: Date.now()
    })
    persistState()
    return true
  }

  /**
   * Ajoute de la Hope.
   * @param {number} [amount=1]
   * @param {string} [reason='']
   */
  function addHope(amount = 1, reason = '') {
    const prev = hope.value
    hope.value = Math.min(MAX_HOPE, hope.value + amount)
    const actual = hope.value - prev
    if (actual > 0) {
      fearHopeHistory.value.push({
        type: 'hope',
        delta: actual,
        newValue: hope.value,
        reason,
        round: round.value,
        timestamp: Date.now()
      })
      persistState()
    }
  }

  /**
   * Dépense de la Hope.
   * @param {number} [amount=1]
   * @param {string} [reason='']
   * @returns {boolean} true si la dépense a réussi
   */
  function spendHope(amount = 1, reason = '') {
    if (hope.value < amount) return false
    hope.value -= amount
    fearHopeHistory.value.push({
      type: 'hope',
      delta: -amount,
      newValue: hope.value,
      reason,
      round: round.value,
      timestamp: Date.now()
    })
    persistState()
    return true
  }

  // ── Dernière catégorie cliquée (pour la logique cross-projecteur) ──
  /** 'pc' ou 'adversary' — détermine le sens de l'affrontement */
  const lastClickCategory = ref('pc')

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
   * - Clic PJ quand dernier clic était adversaire → bascule en adversaryAttack (PJ = cible)
   * - Clic PJ quand dernier clic était PJ → simple swap PJ
   * - Double-clic sur le PJ déjà actif → swap le mode
   * @param {string} pcId
   */
  function selectPc(pcId) {
    if (!participantPcIds.value.includes(pcId)) return

    const isSameEntity = activePcId.value === pcId && lastClickCategory.value === 'pc'

    if (isSameEntity) {
      // Double-clic sur le même PJ : swap le mode
      swapSpotlight()
    } else if (lastClickCategory.value === 'adversary') {
      // Cross-catégorie : adversaire → PJ = l'adversaire attaque ce PJ
      activePcId.value = pcId
      sceneMode.value = SCENE_MODE_ADVERSARY_ATTACK
      spotlight.value = SPOTLIGHT_GM
      lastClickCategory.value = 'pc'
    } else {
      // Même catégorie : simple changement de PJ actif
      activePcId.value = pcId
      lastClickCategory.value = 'pc'
    }
    persistState()
  }

  /**
   * Sélectionne un groupe d'adversaires avec logique cross-catégorie.
   * - Clic adversaire quand dernier clic était PJ → bascule en pcAttack (adversaire = cible)
   * - Clic adversaire quand dernier clic était adversaire → simple swap cible
   * - Double-clic sur le même adversaire → swap le mode
   * @param {string} adversaryId
   */
  function selectAdversaryGroup(adversaryId) {
    const currentAdvId = activeAdversary.value?.adversaryId
    const isSameEntity = currentAdvId === adversaryId && lastClickCategory.value === 'adversary'

    if (isSameEntity) {
      // Double-clic sur le même adversaire : swap le mode
      swapSpotlight()
    } else if (lastClickCategory.value === 'pc') {
      // Cross-catégorie : PJ → adversaire = le PJ attaque cet adversaire
      setActiveAdversaryGroupInternal(adversaryId)
      sceneMode.value = SCENE_MODE_PC_ATTACK
      spotlight.value = SPOTLIGHT_PC
      lastClickCategory.value = 'adversary'
    } else {
      // Même catégorie : simple changement d'adversaire cible
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
        round: round.value,
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
        round: round.value,
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
        round: round.value,
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
        round: round.value,
        timestamp: Date.now()
      })
    }
    persistState()
  }
  // ═══════════════════════════════════════════════════════

  /**
   * Marque des HP sur un adversaire.
   * @param {string} instanceId
   * @param {number} [amount=1]
   */
  function markAdversaryHP(instanceId, amount = 1) {
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv || adv.isDefeated) return
    const prev = adv.markedHP
    adv.markedHP = Math.min(adv.maxHP, adv.markedHP + amount)
    const actual = adv.markedHP - prev
    // Logger le PJ source
    if (actual > 0 && activePcId.value) {
      const pc = participantPcs.value.find((p) => p.id === activePcId.value)
      const entry = {
        pcId: activePcId.value,
        pcName: pc ? pc.name : '?',
        instanceId,
        advName: adv.name,
        type: 'hp',
        amount: actual,
        round: round.value,
        timestamp: Date.now()
      }
      combatLog.value.push(entry)
      encounterLog.value.push({ ...entry, action: 'damage' })
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
        round: round.value,
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
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.markedHP = Math.max(0, adv.markedHP - amount)
    // Réanimer si plus de HP marqués
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
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv || adv.isDefeated) return
    const prev = adv.markedStress
    adv.markedStress = Math.min(adv.maxStress, adv.markedStress + amount)
    const actual = adv.markedStress - prev
    if (actual > 0 && activePcId.value) {
      const pc = participantPcs.value.find((p) => p.id === activePcId.value)
      const entry = {
        pcId: activePcId.value,
        pcName: pc ? pc.name : '?',
        instanceId,
        advName: adv.name,
        type: 'stress',
        amount: actual,
        round: round.value,
        timestamp: Date.now()
      }
      combatLog.value.push(entry)
      encounterLog.value.push({ ...entry, action: 'damage' })
    }
    persistState()
  }

  /**
   * Retire du Stress marqué sur un adversaire.
   * @param {string} instanceId
   * @param {number} [amount=1]
   */
  function clearAdversaryStress(instanceId, amount = 1) {
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.markedStress = Math.max(0, adv.markedStress - amount)
    persistState()
  }

  /**
   * Supprime une entrée du combat log (pastille cliquée par erreur).
   * Supprime aussi l'entrée correspondante dans l'encounterLog.
   * @param {number} index - Index dans combatLog
   */
  function removeCombatLogEntry(index) {
    if (index < 0 || index >= combatLog.value.length) return
    const entry = combatLog.value[index]
    combatLog.value.splice(index, 1)
    // Enregistrer l'annulation dans l'encounterLog
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
      round: round.value,
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
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return false

    if (pcDownStatus.value[pcId]) {
      // Annuler le down
      delete pcDownStatus.value[pcId]
      pcDownStatus.value = { ...pcDownStatus.value }
      encounterLog.value.push({
        action: 'pc_down_cancelled',
        pcId,
        pcName: pc.name,
        round: round.value,
        timestamp: Date.now()
      })
      persistState()
      return false
    }

    // Mettre à terre
    pcDownStatus.value[pcId] = true
    pcDownStatus.value = { ...pcDownStatus.value }
    encounterLog.value.push({
      action: 'pc_down',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      round: round.value,
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
    const pc = participantPcs.value.find((p) => p.id === pcId)
    if (!pc || !pcDownStatus.value[pcId]) return
    delete pcDownStatus.value[pcId]
    pcDownStatus.value = { ...pcDownStatus.value }
    encounterLog.value.push({
      action: 'pc_revive',
      pcId,
      pcName: pc.name,
      round: round.value,
      timestamp: Date.now()
    })
    persistState()
  }

  /**
   * Enregistre qu'un PJ a utilisé un slot d'armure.
   * @param {string} pcId
   */
  function logPcArmorUsed(pcId) {
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return
    const entry = {
      action: 'pc_armor',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      round: round.value,
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
        round: round.value,
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
        round: round.value,
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
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.isDefeated = true
    // Logger qui l'a abattu
    const pc = participantPcs.value.find((p) => p.id === activePcId.value)
    encounterLog.value.push({
      action: 'adv_down',
      instanceId,
      advName: adv.name,
      pcId: activePcId.value || null,
      pcName: pc ? pc.name : '?',
      round: round.value,
      timestamp: Date.now()
    })
    // Si c'était l'adversaire actif, sélectionner le prochain non vaincu
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
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.isDefeated = false
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Rounds & Spotlight Tracker
  // ═══════════════════════════════════════════════════════

  /**
   * Enregistre un usage du projecteur pour un PJ.
   * @param {string} pcId
   */
  function giveSpotlight(pcId) {
    if (!participantPcIds.value.includes(pcId)) return
    if (!spotlightTokens.value[pcId]) {
      spotlightTokens.value[pcId] = 0
    }
    spotlightTokens.value[pcId]++
    activePcId.value = pcId
    spotlight.value = SPOTLIGHT_PC
    persistState()
  }

  /**
   * Retire un token de projecteur d'un PJ.
   * @param {string} pcId
   */
  function removeSpotlightToken(pcId) {
    if (spotlightTokens.value[pcId] > 0) {
      spotlightTokens.value[pcId]--
      persistState()
    }
  }

  /**
   * Réinitialise les tokens de projecteur (début de round).
   */
  function resetSpotlightTokens() {
    spotlightTokens.value = {}
    pcSpotlights.value = {}
    advSpotlights.value = {}
    persistState()
  }

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

    // Logger dans encounterLog si multi-spotlight
    const pc = participantPcs.value.find((p) => p.id === pcId)
    if (pcSpotlights.value[pcId] > 1) {
      encounterLog.value.push({
        action: 'multi_spotlight',
        entityType: 'pc',
        entityId: pcId,
        entityName: pc ? pc.name : '?',
        count: pcSpotlights.value[pcId],
        round: round.value,
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

    // Logger dans encounterLog si multi-spotlight
    const group = groupedAdversaries.value.find((g) => g.adversaryId === adversaryId)
    if (advSpotlights.value[adversaryId] > 1) {
      encounterLog.value.push({
        action: 'multi_spotlight',
        entityType: 'adversary',
        entityId: adversaryId,
        entityName: group ? group.name : '?',
        count: advSpotlights.value[adversaryId],
        round: round.value,
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

  /** Nombre total de tokens distribués ce round */
  const totalSpotlightTokens = computed(() => {
    return Object.values(spotlightTokens.value).reduce((s, v) => s + v, 0)
  })

  /**
   * Passe au round suivant (reset tokens projecteur).
   */
  function nextRound() {
    round.value++
    resetSpotlightTokens()
    persistState()
  }

  /**
   * Revient au round précédent.
   */
  function previousRound() {
    if (round.value > 1) {
      round.value--
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
      fear: fear.value,
      hope: hope.value,
      fearHopeHistory: [...fearHopeHistory.value],
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
      round: round.value,
      spotlightTokens: { ...spotlightTokens.value },
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
   * Persiste l'état dans le localStorage.
   */
  function persistState() {
    if (!isActive.value) return
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
    fear.value = data.fear || 0
    hope.value = data.hope || 0
    fearHopeHistory.value = Array.isArray(data.fearHopeHistory) ? [...data.fearHopeHistory] : []
    sceneMode.value = isValidSceneMode(data.sceneMode) ? data.sceneMode : SCENE_MODE_PC_ATTACK
    spotlight.value = [SPOTLIGHT_PC, SPOTLIGHT_GM].includes(data.spotlight) ? data.spotlight : SPOTLIGHT_PC
    participantPcIds.value = Array.isArray(data.participantPcIds) ? [...data.participantPcIds] : []
    activePcId.value = data.activePcId || null
    liveAdversaries.value = Array.isArray(data.liveAdversaries) ? data.liveAdversaries : []
    activeAdversaryId.value = data.activeAdversaryId || null
    environmentId.value = data.environmentId || null
    round.value = data.round || 1
    spotlightTokens.value = data.spotlightTokens && typeof data.spotlightTokens === 'object'
      ? { ...data.spotlightTokens }
      : {}
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
    fear.value = INITIAL_FEAR
    hope.value = 0
    fearHopeHistory.value = []
    sceneMode.value = SCENE_MODE_PC_ATTACK
    spotlight.value = SPOTLIGHT_PC
    participantPcIds.value = []
    activePcId.value = null
    liveAdversaries.value = []
    activeAdversaryId.value = null
    environmentId.value = null
    round.value = 1
    spotlightTokens.value = {}
    lastClickCategory.value = 'pc'
    pcSpotlights.value = {}
    advSpotlights.value = {}
    combatLog.value = []
    encounterLog.value = []
    pcDownStatus.value = {}
    pcConditions.value = {}
    liveStorage.remove()
  }

  /**
   * Termine la rencontre et nettoie la persistence.
   */
  function endEncounter() {
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
    fear,
    hope,
    fearHopeHistory,
    sceneMode,
    spotlight,
    participantPcIds,
    activePcId,
    liveAdversaries,
    activeAdversaryId,
    environmentId,
    round,
    spotlightTokens,
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
    totalSpotlightTokens,

    // Actions — Initialisation
    startEncounter,

    // Actions — Fear / Hope
    addFear,
    spendFear,
    addHope,
    spendHope,

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

    // Actions — Rounds & Spotlight
    nextRound,
    previousRound,
    giveSpotlight,
    removeSpotlightToken,
    resetSpotlightTokens,
    togglePcSpotlight,
    decrementPcSpotlight,
    toggleAdvSpotlight,
    decrementAdvSpotlight,

    // Actions — Persistence
    serializeLiveState,
    persistState,
    restoreState,
    resetLive,
    endEncounter
  }
})
