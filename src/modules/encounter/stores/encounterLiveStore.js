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
import {
  SCENE_MODE_PC_ATTACK,
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

  // ═══════════════════════════════════════════════════════
  //  Getters
  // ═══════════════════════════════════════════════════════

  /** Métadonnées du mode de scène actif */
  const currentSceneModeMeta = computed(() => {
    return SCENE_MODE_META[sceneMode.value] || SCENE_MODE_META[SCENE_MODE_PC_ATTACK]
  })

  /** PJs participants avec données enrichies depuis le characterStore */
  const participantPcs = computed(() => {
    try {
      const charStore = useCharacterStore()
      return participantPcIds.value
        .map((id) => {
          const c = charStore.characters.find((ch) => ch.id === id)
          if (!c) return null
          return {
            id: c.id,
            name: c.name || 'PJ sans nom',
            classId: c.classId || '',
            className: c.className || '—',
            subclassId: c.subclassId || '',
            level: c.level || 1,
            // Stats live calculées depuis le store characters
            maxHP: c.maxHP || 6,
            maxStress: c.maxStress || 6,
            evasion: c.evasion || 10,
            evasionBonus: c.evasionBonus || 0,
            armorScore: c.armorScore || 0,
            armorName: c.armorName || '',
            armorBaseThresholds: c.armorBaseThresholds || { major: 0, severe: 0 },
            // Données de domaine pour les features
            domainCards: c.domainCards || { loadout: [], vault: [] },
            // Ascendance et communauté pour les features
            ancestryId: c.ancestryId || '',
            communityId: c.communityId || '',
            mixedAncestryData: c.mixedAncestryData || null,
            // Proficiency pour les dégâts
            proficiency: c.proficiency || 1,
            // Armes
            primaryWeaponId: c.primaryWeaponId || '',
            secondaryWeaponId: c.secondaryWeaponId || '',
            // Expériences (pour mode Social)
            experiences: Array.isArray(c.experiences) ? c.experiences.filter((e) => e.name) : [],
            // Progression sous-classe (pour filtrage features)
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
   * Sélectionne un PJ comme actif.
   * @param {string} pcId
   */
  function setActivePc(pcId) {
    if (participantPcIds.value.includes(pcId)) {
      activePcId.value = pcId
      persistState()
    }
  }

  /**
   * Sélectionne un adversaire comme actif.
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
   * Sélectionne un groupe d'adversaires (par adversaryId).
   * Sélectionne la première instance non vaincue du groupe.
   * @param {string} adversaryId
   */
  function setActiveAdversaryGroup(adversaryId) {
    const firstActive = liveAdversaries.value.find(
      (a) => a.adversaryId === adversaryId && !a.isDefeated
    )
    const fallback = liveAdversaries.value.find(
      (a) => a.adversaryId === adversaryId
    )
    const target = firstActive || fallback
    if (target) {
      activeAdversaryId.value = target.instanceId
      persistState()
    }
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Adversaire live (HP / Stress / Conditions)
  // ═══════════════════════════════════════════════════════

  /**
   * Marque des HP sur un adversaire.
   * @param {string} instanceId
   * @param {number} [amount=1]
   */
  function markAdversaryHP(instanceId, amount = 1) {
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv || adv.isDefeated) return
    adv.markedHP = Math.min(adv.maxHP, adv.markedHP + amount)
    // Vérifier défaite : Minions n'ont pas de seuils
    if (adv.type === 'Minion' && adv.markedHP > 0) {
      adv.isDefeated = true
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
    adv.markedStress = Math.min(adv.maxStress, adv.markedStress + amount)
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
    persistState()
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
      spotlightTokens: { ...spotlightTokens.value }
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

    // Actions — Adversaire live
    markAdversaryHP,
    clearAdversaryHP,
    markAdversaryStress,
    clearAdversaryStress,
    addAdversaryCondition,
    removeAdversaryCondition,
    defeatAdversary,
    reviveAdversary,

    // Actions — Rounds & Spotlight
    nextRound,
    previousRound,
    giveSpotlight,
    removeSpotlightToken,
    resetSpotlightTokens,

    // Actions — Persistence
    serializeLiveState,
    persistState,
    restoreState,
    resetLive,
    endEncounter
  }
})
