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
 *
 * Actions déléguées aux composables :
 *  - useUndoStack  → pile d'annulation (Ctrl+Z)
 *  - useCombatLog  → journal de combat, conditions, événements PJ
 *  - useSpotlights → compteurs spotlight couche 1
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
import { useUndoStack } from '../composables/useUndoStack'
import { useCombatLog } from '../composables/useCombatLog'
import { useSpotlights } from '../composables/useSpotlights'

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
    maxHP: adversary.hp,
    maxStress: adversary.stress,
    difficulty: adversary.difficulty,
    thresholds: { ...adversary.thresholds },
    attack: adversary.attack ? { ...adversary.attack } : null,
    features: adversary.features ? [...adversary.features] : [],
    motives: adversary.motives ? [...adversary.motives] : [],
    experiences: adversary.experiences ? [...adversary.experiences] : [],
    focusProfile: adversary.focusProfile ? { ...adversary.focusProfile } : null,
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

  // ── PJs participants ───────────────────────────────────
  const participantPcIds = ref([])
  const activePcId = ref(null)

  // ── Adversaires live ──────────────────────────────────
  const liveAdversaries = ref([])
  const activeAdversaryId = ref(null)

  // ── Environnement ──────────────────────────────────────
  const environmentId = ref(null)

  // ── Spotlight tracking (couche 1) ──────────────────────
  const pcSpotlights = ref({})
  const advSpotlights = ref({})

  // ── Historique de combat ───────────────────────────────
  const combatLog = ref([])
  const encounterLog = ref([])
  const pcDownStatus = ref({})
  const pcConditions = ref({})

  // ── Cross-projecteur ──────────────────────────────────
  const lastClickCategory = ref('pc')

  // ═══════════════════════════════════════════════════════
  //  Getters
  // ═══════════════════════════════════════════════════════

  const currentSceneModeMeta = computed(() => {
    return SCENE_MODE_META[sceneMode.value] || SCENE_MODE_META[SCENE_MODE_PC_ATTACK]
  })

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

  const activePc = computed(() => {
    if (!activePcId.value) return null
    return participantPcs.value.find((pc) => pc.id === activePcId.value) || null
  })

  const activeAdversaries = computed(() => liveAdversaries.value.filter((a) => !a.isDefeated))
  const defeatedAdversaries = computed(() => liveAdversaries.value.filter((a) => a.isDefeated))

  const activeAdversary = computed(() => {
    if (!activeAdversaryId.value) return null
    return liveAdversaries.value.find((a) => a.instanceId === activeAdversaryId.value) || null
  })

  const groupedAdversaries = computed(() => {
    const groups = {}
    for (const adv of liveAdversaries.value) {
      if (!groups[adv.adversaryId]) {
        groups[adv.adversaryId] = {
          adversaryId: adv.adversaryId, name: adv.name, type: adv.type,
          instances: [], activeCount: 0, defeatedCount: 0
        }
      }
      const g = groups[adv.adversaryId]
      g.instances.push(adv)
      if (adv.isDefeated) g.defeatedCount++
      else g.activeCount++
    }
    return Object.values(groups)
  })

  const activeAdversarySiblings = computed(() => {
    if (!activeAdversary.value) return []
    return liveAdversaries.value.filter((a) => a.adversaryId === activeAdversary.value.adversaryId)
  })

  const activeEnvironment = computed(() => {
    if (!environmentId.value) return null
    return allEnvironments.find((e) => e.id === environmentId.value) || null
  })

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

  const isPlayerSpotlight = computed(() => spotlight.value === SPOTLIGHT_PC)
  const isGmSpotlight = computed(() => spotlight.value === SPOTLIGHT_GM)

  // ═══════════════════════════════════════════════════════
  //  Persistence (déclaré avant les composables qui en dépendent)
  // ═══════════════════════════════════════════════════════

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

  let _persistTimer = null
  function persistState() {
    if (!isActive.value) return
    if (_persistTimer) clearTimeout(_persistTimer)
    _persistTimer = setTimeout(() => {
      liveStorage.save(serializeLiveState())
      _persistTimer = null
    }, 300)
  }

  function persistStateNow() {
    if (!isActive.value) return
    if (_persistTimer) clearTimeout(_persistTimer)
    _persistTimer = null
    liveStorage.save(serializeLiveState())
  }

  // ═══════════════════════════════════════════════════════
  //  Composables injectés
  // ═══════════════════════════════════════════════════════

  const { undoStack, pushUndo, undo, clearUndo } = useUndoStack({
    isActive, liveAdversaries, combatLog, encounterLog,
    pcDownStatus, pcConditions, activeAdversaryId, persistState
  })

  const {
    togglePcCondition, toggleAdversaryCondition, removeCombatLogEntry,
    logPcHit, logPcDown, logPcRevive, logPcArmorUsed, logMiss
  } = useCombatLog({
    combatLog, encounterLog, liveAdversaries, activePcId,
    participantPcs, activeAdversary, pcDownStatus, pcConditions,
    pushUndo, persistState
  })

  const {
    togglePcSpotlight, decrementPcSpotlight,
    toggleAdvSpotlight, decrementAdvSpotlight
  } = useSpotlights({
    pcSpotlights, advSpotlights, participantPcIds,
    groupedAdversaries, participantPcs, encounterLog, persistState
  })

  // ═══════════════════════════════════════════════════════
  //  Actions — Initialisation
  // ═══════════════════════════════════════════════════════

  function startEncounter(builderData) {
    if (!builderData) return
    resetLive()

    encounterName.value = builderData.name || ''
    encounterTier.value = builderData.tier || 1

    participantPcIds.value = Array.isArray(builderData.selectedPcIds)
      ? [...builderData.selectedPcIds] : []
    if (participantPcIds.value.length > 0) {
      activePcId.value = participantPcIds.value[0]
    }

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

    if (liveAdversaries.value.length > 0) {
      activeAdversaryId.value = liveAdversaries.value[0].instanceId
    }

    environmentId.value = builderData.environmentId || null
    isActive.value = true
    persistStateNow()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Mode de scène & Projecteur
  // ═══════════════════════════════════════════════════════

  function setSceneMode(mode) {
    if (isValidSceneMode(mode)) {
      sceneMode.value = mode
      spotlight.value = mode === SCENE_MODE_PC_ATTACK ? SPOTLIGHT_PC : SPOTLIGHT_GM
      persistState()
    }
  }

  function setPlayerSpotlight() {
    spotlight.value = SPOTLIGHT_PC
    persistState()
  }

  function setGmSpotlight() {
    spotlight.value = SPOTLIGHT_GM
    persistState()
  }

  function toggleSpotlight() {
    spotlight.value = spotlight.value === SPOTLIGHT_PC ? SPOTLIGHT_GM : SPOTLIGHT_PC
    persistState()
  }

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

  function setActivePc(pcId) {
    if (participantPcIds.value.includes(pcId)) {
      activePcId.value = pcId
      persistState()
    }
  }

  function setActiveAdversary(instanceId) {
    if (liveAdversaries.value.some((a) => a.instanceId === instanceId)) {
      activeAdversaryId.value = instanceId
      persistState()
    }
  }

  function setActiveAdversaryGroupInternal(adversaryId) {
    const firstActive = liveAdversaries.value.find((a) => a.adversaryId === adversaryId && !a.isDefeated)
    const fallback = liveAdversaries.value.find((a) => a.adversaryId === adversaryId)
    const target = firstActive || fallback
    if (target) activeAdversaryId.value = target.instanceId
  }

  function setActiveAdversaryGroup(adversaryId) {
    setActiveAdversaryGroupInternal(adversaryId)
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — HP / Stress / Défaite adversaire
  // ═══════════════════════════════════════════════════════

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
        if (lastEnc) { lastEnc.amount += actual; lastEnc.timestamp = Date.now() }
      } else {
        const pc = participantPcs.value.find((p) => p.id === activePcId.value)
        const entry = {
          action: 'damage', pcId: activePcId.value, pcName: pc ? pc.name : '?',
          instanceId, advName: adv.name, type: 'hp', amount: actual, timestamp: Date.now()
        }
        combatLog.value.push(entry)
        encounterLog.value.push({ ...entry })
      }
    }
    if (adv.type === 'Minion' && adv.markedHP > 0) {
      adv.isDefeated = true
      const pcDown = participantPcs.value.find((p) => p.id === activePcId.value)
      encounterLog.value.push({
        action: 'adv_down', instanceId, advName: adv.name,
        pcId: activePcId.value || null, pcName: pcDown ? pcDown.name : '?', timestamp: Date.now()
      })
    }
    persistState()
  }

  function clearAdversaryHP(instanceId, amount = 1) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.markedHP = Math.max(0, adv.markedHP - amount)
    if (adv.isDefeated && adv.markedHP < adv.maxHP) adv.isDefeated = false
    persistState()
  }

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
        if (lastEnc) { lastEnc.amount += actual; lastEnc.timestamp = Date.now() }
      } else {
        const pc = participantPcs.value.find((p) => p.id === activePcId.value)
        const entry = {
          action: 'damage', pcId: activePcId.value, pcName: pc ? pc.name : '?',
          instanceId, advName: adv.name, type: 'stress', amount: actual, timestamp: Date.now()
        }
        combatLog.value.push(entry)
        encounterLog.value.push({ ...entry })
      }
    }
    persistState()
  }

  function clearAdversaryStress(instanceId, amount = 1) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.markedStress = Math.max(0, adv.markedStress - amount)
    persistState()
  }

  function addAdversaryCondition(instanceId, condition) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv || adv.conditions.includes(condition)) return
    adv.conditions.push(condition)
    persistState()
  }

  function removeAdversaryCondition(instanceId, condition) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    const idx = adv.conditions.indexOf(condition)
    if (idx >= 0) { adv.conditions.splice(idx, 1); persistState() }
  }

  function defeatAdversary(instanceId) {
    pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.isDefeated = true
    const pc = participantPcs.value.find((p) => p.id === activePcId.value)
    encounterLog.value.push({
      action: 'adv_down', instanceId, advName: adv.name,
      pcId: activePcId.value || null, pcName: pc ? pc.name : '?', timestamp: Date.now()
    })
    if (activeAdversaryId.value === instanceId) {
      const next = activeAdversaries.value[0]
      activeAdversaryId.value = next ? next.instanceId : null
    }
    persistState()
  }

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

  function addReinforcement(adversaryId, quantity = 1) {
    pushUndo()
    const adversaryData = allAdversaries.find((a) => a.id === adversaryId)
    if (!adversaryData) return []

    const existingCount = liveAdversaries.value.filter((a) => a.adversaryId === adversaryId).length
    const newIds = []
    for (let i = 0; i < quantity; i++) {
      const instance = createLiveAdversary(adversaryData, existingCount + i)
      liveAdversaries.value.push(instance)
      newIds.push(instance.instanceId)
    }

    encounterLog.value.push({
      action: 'reinforcement', adversaryId, advName: adversaryData.name,
      quantity, instanceIds: newIds, timestamp: Date.now()
    })

    if (!activeAdversaryId.value && newIds.length > 0) {
      activeAdversaryId.value = newIds[0]
    }
    persistState()
    return newIds
  }

  // ═══════════════════════════════════════════════════════
  //  Actions — Notes adversaires
  // ═══════════════════════════════════════════════════════

  function setAdversaryNotes(instanceId, text) {
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    adv.notes = text
    persistState()
  }

  // ═══════════════════════════════════════════════════════
  //  Persistence — Restore / Reset / End
  // ═══════════════════════════════════════════════════════

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
    pcSpotlights.value = data.pcSpotlights && typeof data.pcSpotlights === 'object' ? { ...data.pcSpotlights } : {}
    advSpotlights.value = data.advSpotlights && typeof data.advSpotlights === 'object' ? { ...data.advSpotlights } : {}
    combatLog.value = Array.isArray(data.combatLog) ? [...data.combatLog] : []
    encounterLog.value = Array.isArray(data.encounterLog) ? [...data.encounterLog] : []
    pcDownStatus.value = data.pcDownStatus && typeof data.pcDownStatus === 'object' ? { ...data.pcDownStatus } : {}
    pcConditions.value = data.pcConditions && typeof data.pcConditions === 'object'
      ? JSON.parse(JSON.stringify(data.pcConditions)) : {}

    return true
  }

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
    clearUndo()
    liveStorage.remove()
  }

  /** Dernier résumé de rencontre (survit au reset, pas persisté) */
  const lastEncounterSummary = ref(null)

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

    const damageByPc = {}
    for (const entry of encounterLog.value) {
      if (entry.action === 'damage' && entry.pcId) {
        if (!damageByPc[entry.pcId]) damageByPc[entry.pcId] = { pcName: entry.pcName, hp: 0, stress: 0 }
        if (entry.type === 'hp') damageByPc[entry.pcId].hp += entry.amount
        if (entry.type === 'stress') damageByPc[entry.pcId].stress += entry.amount
      }
    }

    const killsByPc = {}
    for (const entry of encounterLog.value) {
      if (entry.action === 'adv_down' && entry.pcId) {
        if (!killsByPc[entry.pcId]) killsByPc[entry.pcId] = { pcName: entry.pcName, count: 0, names: [] }
        killsByPc[entry.pcId].count++
        killsByPc[entry.pcId].names.push(entry.advName)
      }
    }

    return {
      name: encounterName.value, tier: encounterTier.value,
      totalAdversaries: liveAdversaries.value.length,
      defeated: defeated.map((a) => ({ name: a.name, instanceId: a.instanceId })),
      surviving: surviving.map((a) => ({ name: a.name, markedHP: a.markedHP, maxHP: a.maxHP })),
      pcsFallen, totalHPMarked, totalStressMarked,
      hitCount, missCount, pcHitCount, damageByPc, killsByPc,
      logEntries: encounterLog.value.length, endedAt: new Date().toISOString()
    }
  }

  function endEncounter() {
    lastEncounterSummary.value = generateSummary()
    resetLive()
  }

  // ═══════════════════════════════════════════════════════
  //  Export
  // ═══════════════════════════════════════════════════════

  return {
    // État
    isActive, encounterName, encounterTier,
    sceneMode, spotlight,
    participantPcIds, activePcId,
    liveAdversaries, activeAdversaryId,
    environmentId, lastClickCategory,
    pcSpotlights, advSpotlights,
    combatLog, encounterLog, pcDownStatus, pcConditions,

    // Getters
    currentSceneModeMeta, participantPcs, activePc,
    activeAdversaries, defeatedAdversaries,
    activeAdversary, groupedAdversaries, activeAdversarySiblings,
    activeEnvironment, adversaryCombatSummary,
    isPlayerSpotlight, isGmSpotlight,

    // Actions — Initialisation
    startEncounter,

    // Actions — Mode & Projecteur
    setSceneMode, setPlayerSpotlight, setGmSpotlight, toggleSpotlight,
    setActivePc, setActiveAdversary, setActiveAdversaryGroup,
    selectPc, selectAdversaryGroup, swapSpotlight,

    // Actions — Adversaire live (HP/Stress/Défaite)
    markAdversaryHP, clearAdversaryHP,
    markAdversaryStress, clearAdversaryStress,
    addAdversaryCondition, removeAdversaryCondition,
    defeatAdversary, reviveAdversary,
    addReinforcement, setAdversaryNotes,

    // Actions — Combat log & conditions (composable)
    removeCombatLogEntry,
    logPcHit, logPcDown, logPcRevive, logPcArmorUsed, logMiss,
    togglePcCondition, toggleAdversaryCondition,

    // Actions — Spotlight (composable)
    togglePcSpotlight, decrementPcSpotlight,
    toggleAdvSpotlight, decrementAdvSpotlight,

    // Actions — Persistence
    serializeLiveState, persistState, restoreState,
    resetLive, endEncounter,

    // Actions — Undo (composable)
    undo, undoStack,

    // Actions — Résumé
    lastEncounterSummary, generateSummary
  }
})
