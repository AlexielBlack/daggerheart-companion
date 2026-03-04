/**
 * @module encounter/stores/encounterStore
 * @description Store Pinia pour le constructeur de rencontres.
 * Gère la composition d'adversaires, l'environnement,
 * le calcul de Battle Points, la persistance et l'historique.
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { allAdversaries } from '@data/adversaries'
import { allEnvironments } from '@data/environments'
import {
  BATTLE_POINT_COSTS,
  BP_ADJUSTMENTS,
  AUTO_DETECTABLE_ADJUSTMENTS,
  SCENE_INTENSITY,
  HEAVY_HITTER_TYPES,
  PC_COUNT_MIN,
  PC_COUNT_MAX,
  calculateBaseBattlePoints
} from '@data/encounters/constants'
import { useStorage } from '@core/composables/useStorage'
import { useCharacterStore } from '@modules/characters/stores/characterStore'

/**
 * Calcule le tier d'un personnage selon son niveau.
 * @param {number} level
 * @returns {number}
 */
function getTierForLevel(level) {
  if (level < 1 || level > 10) return 1
  if (level <= 1) return 1
  if (level <= 4) return 2
  if (level <= 7) return 3
  return 4
}

export const useEncounterStore = defineStore('encounter', () => {
  // ── Persistence ────────────────────────────────────────
  const savedEncountersStorage = useStorage('encounters', [])
  const currentEncounterStorage = useStorage('encounter-current', null)

  // ── Configuration ──────────────────────────────────────
  const pcCount = ref(4)
  const selectedTier = ref(1)
  const encounterName = ref('')
  const selectedIntensity = ref('standard')
  const activeAdjustments = ref([])

  /** IDs des PJ sélectionnés depuis le module personnages */
  const selectedPcIds = ref([])

  // ── Composition ────────────────────────────────────────
  /**
   * Slots d'adversaires ajoutés à la rencontre.
   * Chaque slot : { adversaryId: string, quantity: number }
   */
  const adversarySlots = ref([])

  /** ID de l'environnement sélectionné (null = aucun) */
  const selectedEnvironmentId = ref(null)

  // ── Constantes exposées ────────────────────────────────
  const adjustmentOptions = BP_ADJUSTMENTS
  const intensityOptions = SCENE_INTENSITY
  const minPcCount = PC_COUNT_MIN
  const maxPcCount = PC_COUNT_MAX

  // ── Getters ────────────────────────────────────────────

  /** Battle Points de base : (3 × PJ) + 2 */
  const baseBattlePoints = computed(() => calculateBaseBattlePoints(pcCount.value))

  /** Budget total de Battle Points (base + ajustements) */
  const totalBattlePoints = computed(() => {
    return Math.max(0, baseBattlePoints.value + adjustmentTotal.value)
  })

  /** Détail des slots avec données complètes d'adversaire */
  const adversarySlotsDetailed = computed(() => {
    return adversarySlots.value
      .map((slot) => {
        const adversary = allAdversaries.find((a) => a.id === slot.adversaryId)
        if (!adversary) return null
        const cost = (BATTLE_POINT_COSTS[adversary.type] ?? 2) * slot.quantity
        return {
          ...slot,
          adversary,
          unitCost: BATTLE_POINT_COSTS[adversary.type] ?? 2,
          totalCost: cost
        }
      })
      .filter(Boolean)
  })

  /** Battle Points dépensés */
  const spentBattlePoints = computed(() => {
    return adversarySlotsDetailed.value.reduce((sum, slot) => sum + slot.totalCost, 0)
  })

  /** Battle Points restants */
  const remainingBattlePoints = computed(() => {
    return totalBattlePoints.value - spentBattlePoints.value
  })

  /** Nombre total d'adversaires individuels */
  const totalAdversaryCount = computed(() => {
    return adversarySlots.value.reduce((sum, slot) => sum + slot.quantity, 0)
  })

  /** HP totaux estimés des adversaires */
  const totalAdversaryHP = computed(() => {
    return adversarySlotsDetailed.value.reduce((sum, slot) => {
      return sum + (slot.adversary.hp * slot.quantity)
    }, 0)
  })

  /** Stress total estimé des adversaires */
  const totalAdversaryStress = computed(() => {
    return adversarySlotsDetailed.value.reduce((sum, slot) => {
      return sum + (slot.adversary.stress * slot.quantity)
    }, 0)
  })

  /** Environnement sélectionné (objet complet) */
  const selectedEnvironment = computed(() => {
    if (!selectedEnvironmentId.value) return null
    return allEnvironments.find((e) => e.id === selectedEnvironmentId.value) || null
  })

  /** Personnages disponibles depuis le store characters */
  const availableCharacters = computed(() => {
    try {
      const charStore = useCharacterStore()
      return Array.isArray(charStore.characters) ? charStore.characters : []
    } catch {
      return []
    }
  })

  /** Personnages sélectionnés avec données enrichies (nom, classe, niveau, tier) */
  const selectedPcCharacters = computed(() => {
    return selectedPcIds.value
      .map((id) => {
        const c = availableCharacters.value.find((ch) => ch.id === id)
        if (!c) return null
        return {
          id: c.id,
          name: c.name || 'PJ sans nom',
          className: c.className || '—',
          level: c.level || 1,
          tier: getTierForLevel(c.level || 1)
        }
      })
      .filter(Boolean)
  })

  /** Tier dérivé du PJ de plus haut niveau parmi la sélection */
  const derivedPcTier = computed(() => {
    if (selectedPcCharacters.value.length === 0) return null
    return Math.max(...selectedPcCharacters.value.map((c) => c.tier))
  })

  /** Intensité sélectionnée (objet complet) */
  const currentIntensity = computed(() => {
    return SCENE_INTENSITY.find((s) => s.id === selectedIntensity.value) || SCENE_INTENSITY[2]
  })

  /** Présence de types lourds dans la composition */
  const hasHeavyHitters = computed(() => {
    return adversarySlotsDetailed.value.some(
      (slot) => HEAVY_HITTER_TYPES.includes(slot.adversary.type)
    )
  })

  /** Nombre d'adversaires Solo */
  const soloCount = computed(() => {
    return adversarySlotsDetailed.value
      .filter((slot) => slot.adversary.type === 'Solo')
      .reduce((sum, slot) => sum + slot.quantity, 0)
  })

  /** Informations sur les adversaires de tier inférieur */
  const lowerTierInfo = computed(() => {
    if (adversarySlotsDetailed.value.length === 0) {
      return { count: 0, total: 0, percentage: 0 }
    }
    const total = adversarySlotsDetailed.value.length
    const count = adversarySlotsDetailed.value.filter(
      (slot) => slot.adversary.tier < selectedTier.value
    ).length
    return {
      count,
      total,
      percentage: Math.round((count / total) * 100)
    }
  })

  /**
   * Ajustements auto-détectés selon la composition actuelle.
   * Ces ajustements sont calculés automatiquement et ne nécessitent
   * pas d'activation manuelle.
   */
  const autoAdjustments = computed(() => {
    if (adversarySlots.value.length === 0) return []

    const result = []

    // 2+ adversaires Solo → -2 BP
    if (soloCount.value >= 2) {
      result.push('multi-solo')
    }

    // Adversaire(s) de tier inférieur → +1 BP
    if (lowerTierInfo.value.count > 0) {
      result.push('lower-tier')
    }

    // Pas de Bruiser / Horde / Leader / Solo → +1 BP
    if (!hasHeavyHitters.value) {
      result.push('no-heavy-hitters')
    }

    return result
  })

  /** Total des ajustements (manuels + auto-détectés) */
  const adjustmentTotal = computed(() => {
    // Ajustements manuels (excluant ceux qui sont auto-détectables)
    const manualSum = activeAdjustments.value.reduce((sum, adjId) => {
      if (AUTO_DETECTABLE_ADJUSTMENTS.includes(adjId)) return sum
      const adj = BP_ADJUSTMENTS.find((a) => a.id === adjId)
      return sum + (adj ? adj.value : 0)
    }, 0)

    // Ajustements auto-détectés
    const autoSum = autoAdjustments.value.reduce((sum, adjId) => {
      const adj = BP_ADJUSTMENTS.find((a) => a.id === adjId)
      return sum + (adj ? adj.value : 0)
    }, 0)

    return manualSum + autoSum
  })

  /** Alertes et conseils pour le MJ */
  const warnings = computed(() => {
    const result = []

    if (remainingBattlePoints.value < 0) {
      result.push({
        type: 'error',
        message: `Budget dépassé de ${Math.abs(remainingBattlePoints.value)} BP. Retirez des adversaires ou augmentez le budget.`
      })
    }

    if (remainingBattlePoints.value > 3 && adversarySlots.value.length > 0) {
      result.push({
        type: 'warning',
        message: `${remainingBattlePoints.value} BP restants. Ajoutez des adversaires ou réduisez le budget.`
      })
    }

    const tierMismatch = adversarySlotsDetailed.value.filter(
      (slot) => slot.adversary.tier !== selectedTier.value
    )
    if (tierMismatch.length > 0) {
      const tiers = [...new Set(tierMismatch.map((s) => s.adversary.tier))].sort()
      result.push({
        type: 'warning',
        message: `Adversaires de tier${tiers.length > 1 ? 's' : ''} ${tiers.join(', ')} dans une rencontre tier ${selectedTier.value}. Ajustez la difficulté si nécessaire.`
      })
    }

    if (!selectedEnvironmentId.value && adversarySlots.value.length > 0) {
      result.push({
        type: 'info',
        message: 'Aucun environnement sélectionné. Un environnement enrichit la scène.'
      })
    }

    return result
  })

  /** La rencontre est-elle valide (budget non dépassé, au moins 1 adversaire) ? */
  const isValid = computed(() => {
    return adversarySlots.value.length > 0 && remainingBattlePoints.value >= 0
  })

  /** Liste des rencontres sauvegardées */
  const savedEncountersList = computed(() => {
    const val = savedEncountersStorage.data.value
    return Array.isArray(val) ? val : []
  })

  // ── Actions ────────────────────────────────────────────

  /**
   * Définit le nombre de PJ.
   * @param {number} count
   */
  function setPcCount(count) {
    pcCount.value = Math.max(PC_COUNT_MIN, Math.min(PC_COUNT_MAX, count))
  }

  /**
   * Définit le tier de la rencontre.
   * @param {number} tier
   */
  function setTier(tier) {
    if (tier >= 1 && tier <= 4) {
      selectedTier.value = tier
    }
  }

  /**
   * Définit l'intensité de scène.
   * @param {string} intensityId
   */
  function setIntensity(intensityId) {
    if (SCENE_INTENSITY.some((s) => s.id === intensityId)) {
      selectedIntensity.value = intensityId
    }
  }

  /**
   * Active/désactive un ajustement de BP (manuels uniquement).
   * Les ajustements auto-détectables sont ignorés.
   * @param {string} adjustmentId
   */
  function toggleAdjustment(adjustmentId) {
    if (AUTO_DETECTABLE_ADJUSTMENTS.includes(adjustmentId)) return
    const idx = activeAdjustments.value.indexOf(adjustmentId)
    if (idx >= 0) {
      activeAdjustments.value.splice(idx, 1)
    } else {
      activeAdjustments.value.push(adjustmentId)
    }
  }

  /**
   * Ajoute un adversaire à la rencontre (ou incrémente sa quantité).
   * @param {string} adversaryId
   * @param {number} [quantity=1]
   */
  function addAdversary(adversaryId, quantity = 1) {
    const existing = adversarySlots.value.find((s) => s.adversaryId === adversaryId)
    if (existing) {
      existing.quantity += quantity
    } else {
      adversarySlots.value.push({ adversaryId, quantity })
    }
  }

  /**
   * Retire un adversaire (ou décrémente sa quantité).
   * @param {string} adversaryId
   * @param {number} [quantity=1]
   */
  function removeAdversary(adversaryId, quantity = 1) {
    const idx = adversarySlots.value.findIndex((s) => s.adversaryId === adversaryId)
    if (idx < 0) return

    adversarySlots.value[idx].quantity -= quantity
    if (adversarySlots.value[idx].quantity <= 0) {
      adversarySlots.value.splice(idx, 1)
    }
  }

  /**
   * Définit la quantité exacte d'un adversaire.
   * @param {string} adversaryId
   * @param {number} quantity
   */
  function setAdversaryQuantity(adversaryId, quantity) {
    if (quantity <= 0) {
      const idx = adversarySlots.value.findIndex((s) => s.adversaryId === adversaryId)
      if (idx >= 0) adversarySlots.value.splice(idx, 1)
      return
    }
    const existing = adversarySlots.value.find((s) => s.adversaryId === adversaryId)
    if (existing) {
      existing.quantity = quantity
    } else {
      adversarySlots.value.push({ adversaryId, quantity })
    }
  }

  /**
   * Sélectionne un environnement.
   * @param {string|null} environmentId
   */
  function setEnvironment(environmentId) {
    selectedEnvironmentId.value = environmentId
  }

  /**
   * Met à jour les PJ sélectionnés et synchronise pcCount + tier.
   * @param {string[]} ids - Liste d'IDs de personnages
   */
  function setSelectedPcIds(ids) {
    selectedPcIds.value = Array.isArray(ids) ? [...ids] : []
    // Synchronisation automatique si des PJ sont sélectionnés
    if (selectedPcIds.value.length > 0) {
      setPcCount(selectedPcIds.value.length)
      const tier = derivedPcTier.value
      if (tier) {
        setTier(tier)
      }
    }
  }

  /**
   * Réinitialise la rencontre en cours.
   */
  function resetEncounter() {
    encounterName.value = ''
    adversarySlots.value = []
    selectedEnvironmentId.value = null
    activeAdjustments.value = []
    selectedIntensity.value = 'standard'
    selectedPcIds.value = []
  }

  /**
   * Exporte l'état actuel de la rencontre comme objet sérialisable.
   * @returns {Object}
   */
  function serializeEncounter() {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: encounterName.value || `Rencontre ${new Date().toLocaleDateString('fr-FR')}`,
      pcCount: pcCount.value,
      tier: selectedTier.value,
      intensity: selectedIntensity.value,
      adjustments: [...activeAdjustments.value],
      adversarySlots: adversarySlots.value.map((s) => ({ ...s })),
      environmentId: selectedEnvironmentId.value,
      selectedPcIds: [...selectedPcIds.value],
      createdAt: new Date().toISOString()
    }
  }

  /**
   * Charge une rencontre depuis un objet sérialisé.
   * @param {Object} data
   */
  function loadEncounter(data) {
    if (!data) return
    encounterName.value = data.name || ''
    pcCount.value = data.pcCount || 4
    selectedTier.value = data.tier || 1
    selectedIntensity.value = data.intensity || 'standard'
    activeAdjustments.value = Array.isArray(data.adjustments) ? [...data.adjustments] : []
    adversarySlots.value = Array.isArray(data.adversarySlots)
      ? data.adversarySlots.map((s) => ({ ...s }))
      : []
    selectedEnvironmentId.value = data.environmentId || null
    selectedPcIds.value = Array.isArray(data.selectedPcIds) ? [...data.selectedPcIds] : []
  }

  /**
   * Sauvegarde la rencontre actuelle dans la liste persistée.
   * @returns {string} ID de la rencontre sauvegardée
   */
  function saveEncounter() {
    const encounter = serializeEncounter()
    const list = Array.isArray(savedEncountersStorage.data.value)
      ? [...savedEncountersStorage.data.value]
      : []

    // Évite les doublons par nom — remplace si même nom
    const existingIdx = list.findIndex((e) => e.name === encounter.name)
    if (existingIdx >= 0) {
      list[existingIdx] = encounter
    } else {
      list.push(encounter)
    }

    savedEncountersStorage.save(list)
    return encounter.id
  }

  /**
   * Supprime une rencontre sauvegardée par ID.
   * @param {string} encounterId
   */
  function deleteSavedEncounter(encounterId) {
    const list = Array.isArray(savedEncountersStorage.data.value)
      ? [...savedEncountersStorage.data.value]
      : []

    const filtered = list.filter((e) => e.id !== encounterId)
    savedEncountersStorage.save(filtered)
  }

  // ── Auto-save du brouillon en cours ────────────────────
  function saveDraft() {
    if (adversarySlots.value.length > 0 || encounterName.value) {
      currentEncounterStorage.save(serializeEncounter())
    }
  }

  function loadDraft() {
    const draft = currentEncounterStorage.data.value
    if (draft && typeof draft === 'object' && draft.adversarySlots) {
      loadEncounter(draft)
    }
  }

  // Restaure le brouillon au démarrage
  loadDraft()

  // Auto-save brouillon sur changement (debounced via watch)
  watch(
    [adversarySlots, encounterName, selectedEnvironmentId, pcCount, selectedTier, selectedIntensity, activeAdjustments, selectedPcIds],
    () => { saveDraft() },
    { deep: true }
  )

  return {
    // État
    pcCount,
    selectedTier,
    encounterName,
    selectedIntensity,
    activeAdjustments,
    adversarySlots,
    selectedEnvironmentId,
    selectedPcIds,
    storageError: savedEncountersStorage.error,

    // Constantes
    adjustmentOptions,
    intensityOptions,
    minPcCount,
    maxPcCount,

    // Getters
    baseBattlePoints,
    adjustmentTotal,
    totalBattlePoints,
    adversarySlotsDetailed,
    spentBattlePoints,
    remainingBattlePoints,
    totalAdversaryCount,
    totalAdversaryHP,
    totalAdversaryStress,
    selectedEnvironment,
    availableCharacters,
    selectedPcCharacters,
    derivedPcTier,
    currentIntensity,
    hasHeavyHitters,
    soloCount,
    lowerTierInfo,
    autoAdjustments,
    warnings,
    isValid,
    savedEncountersList,

    // Actions
    setPcCount,
    setTier,
    setIntensity,
    toggleAdjustment,
    addAdversary,
    removeAdversary,
    setAdversaryQuantity,
    setEnvironment,
    setSelectedPcIds,
    resetEncounter,
    serializeEncounter,
    loadEncounter,
    saveEncounter,
    deleteSavedEncounter,
    saveDraft,
    loadDraft
  }
})
