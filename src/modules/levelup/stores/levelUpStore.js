/**
 * @module levelup/stores/levelUpStore
 * @description Store Pinia pour le wizard de level up.
 *
 * Gère :
 *   - L'état du wizard multi-étapes (4 étapes séquentielles)
 *   - Les sélections du joueur à chaque étape
 *   - La validation en temps réel
 *   - L'application du level up au personnage (via characterStore)
 *   - Le rollback du dernier level up
 *
 * Dépend de :
 *   - characterStore (personnage sélectionné, mutation, persistance)
 *   - useLevelUpRules (logique pure de règles SRD)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCharacterStore } from '@modules/characters'
import {
  getTierForLevel,
  getTierAchievement,
  canLevelUp,
  getAvailableAdvancements,
  validateAdvancementChoices,
  buildLevelUpEntry,
  applyLevelUp,
  canRollback,
  rollbackLevelUp,
  ADVANCEMENT_TYPES
} from '../composables/useLevelUpRules'

// ═══════════════════════════════════════════════════════════
//  Constantes du Wizard
// ═══════════════════════════════════════════════════════════

/** Étapes du wizard de level up */
export const WIZARD_STEPS = Object.freeze({
  TIER_ACHIEVEMENT: 'tier_achievement',
  ADVANCEMENTS: 'advancements',
  THRESHOLDS: 'thresholds',
  DOMAIN_CARD: 'domain_card'
})

/** Ordre des étapes */
export const STEP_ORDER = Object.freeze([
  WIZARD_STEPS.TIER_ACHIEVEMENT,
  WIZARD_STEPS.ADVANCEMENTS,
  WIZARD_STEPS.THRESHOLDS,
  WIZARD_STEPS.DOMAIN_CARD
])

/** Labels des étapes (pour l'UI) */
export const STEP_LABELS = Object.freeze({
  [WIZARD_STEPS.TIER_ACHIEVEMENT]: 'Tier Achievement',
  [WIZARD_STEPS.ADVANCEMENTS]: 'Advancements',
  [WIZARD_STEPS.THRESHOLDS]: 'Seuils de dégâts',
  [WIZARD_STEPS.DOMAIN_CARD]: 'Carte de domaine'
})

// ═══════════════════════════════════════════════════════════
//  Store
// ═══════════════════════════════════════════════════════════

export const useLevelUpStore = defineStore('levelUp', () => {
  const characterStore = useCharacterStore()

  // ── État du Wizard ──────────────────────────────────────

  /** Le wizard est-il ouvert ? */
  const isOpen = ref(false)

  /** Étape courante */
  const currentStep = ref(WIZARD_STEPS.TIER_ACHIEVEMENT)

  /** Le tier achievement a-t-il été confirmé par le joueur ? */
  const tierAchievementConfirmed = ref(false)

  /**
   * Advancements sélectionnés par le joueur.
   * Chaque entrée : { type, tier, traits?, experiences? }
   */
  const selectedAdvancements = ref([])

  /** Les seuils de dégâts ont-ils été confirmés ? */
  const thresholdsConfirmed = ref(false)

  /** ID de la carte de domaine choisie à l'étape 4 */
  const selectedDomainCardId = ref(null)

  /** Message d'erreur global du wizard */
  const wizardError = ref('')

  // ── Getters dérivés ─────────────────────────────────────

  /** Personnage cible (celui du characterStore) */
  const character = computed(() => characterStore.selectedCharacter)

  /** Le personnage peut-il level up ? */
  const levelUpStatus = computed(() => {
    return canLevelUp(character.value)
  })

  /** Niveau cible si on level up */
  const targetLevel = computed(() => {
    if (!character.value) return 0
    return character.value.level + 1
  })

  /** Tier cible */
  const targetTier = computed(() => getTierForLevel(targetLevel.value))

  /** Tier Achievement pour ce niveau (ou null) */
  const tierAchievement = computed(() => getTierAchievement(targetLevel.value))

  /** Y a-t-il un tier achievement à cette étape ? */
  const hasTierAchievementStep = computed(() => tierAchievement.value !== null)

  /** Index numérique de l'étape courante (0-based) */
  const currentStepIndex = computed(() => STEP_ORDER.indexOf(currentStep.value))

  /** Nombre total d'étapes */
  const totalSteps = computed(() => STEP_ORDER.length)

  /** L'étape courante est-elle la première ? */
  const isFirstStep = computed(() => currentStepIndex.value === 0)

  /** L'étape courante est-elle la dernière ? */
  const isLastStep = computed(() => currentStepIndex.value === STEP_ORDER.length - 1)

  // ── Advancements ────────────────────────────────────────

  /** Options d'advancement disponibles pour le personnage */
  const availableAdvancementOptions = computed(() => {
    if (!character.value) return []
    return getAvailableAdvancements(character.value)
  })

  /**
   * Points d'advancement consommés par les sélections actuelles.
   * Un advancement simple = 1 point, un doubleSlot = 2 points.
   */
  const advancementPointsUsed = computed(() => {
    let total = 0
    for (const adv of selectedAdvancements.value) {
      const option = availableAdvancementOptions.value.find(
        (o) => o.type === adv.type && o.tier === adv.tier
      )
      total += (option && option.doubleSlot) ? 2 : 1
    }
    return total
  })

  /** Points d'advancement restants (objectif : 2) */
  const advancementPointsRemaining = computed(() => {
    return 2 - advancementPointsUsed.value
  })

  /** Résultat de validation des advancements sélectionnés */
  const advancementValidation = computed(() => {
    if (selectedAdvancements.value.length === 0) {
      return { valid: false, errors: ['Sélectionnez vos advancements.'] }
    }
    return validateAdvancementChoices(character.value, selectedAdvancements.value)
  })

  // ── Validation par étape ────────────────────────────────

  /** L'étape tier achievement est-elle complète ? */
  const isTierAchievementComplete = computed(() => {
    // Si pas de tier achievement pour ce niveau, c'est automatiquement valide
    if (!hasTierAchievementStep.value) return true
    return tierAchievementConfirmed.value
  })

  /** L'étape advancements est-elle complète ? */
  const isAdvancementsComplete = computed(() => {
    return advancementValidation.value.valid
  })

  /** L'étape thresholds est-elle complète ? (toujours valide — confirmation seulement) */
  const isThresholdsComplete = computed(() => {
    return thresholdsConfirmed.value
  })

  /** L'étape domain card est-elle complète ? */
  const isDomainCardComplete = computed(() => {
    // La carte de domaine est obligatoire
    return selectedDomainCardId.value !== null
  })

  /** L'étape courante est-elle valide pour avancer ? */
  const isCurrentStepValid = computed(() => {
    switch (currentStep.value) {
      case WIZARD_STEPS.TIER_ACHIEVEMENT:
        return isTierAchievementComplete.value
      case WIZARD_STEPS.ADVANCEMENTS:
        return isAdvancementsComplete.value
      case WIZARD_STEPS.THRESHOLDS:
        return isThresholdsComplete.value
      case WIZARD_STEPS.DOMAIN_CARD:
        return isDomainCardComplete.value
      default:
        return false
    }
  })

  /** Le wizard entier est-il prêt à être finalisé ? */
  const canFinalize = computed(() => {
    return isTierAchievementComplete.value
      && isAdvancementsComplete.value
      && isThresholdsComplete.value
      && isDomainCardComplete.value
  })

  /** Résumé complet du level up pour l'aperçu avant finalisation */
  const summary = computed(() => {
    if (!character.value) return null
    return {
      characterName: character.value.name || 'Sans nom',
      currentLevel: character.value.level,
      targetLevel: targetLevel.value,
      targetTier: targetTier.value,
      tierAchievement: tierAchievement.value,
      advancements: selectedAdvancements.value.map((a) => ({ ...a })),
      domainCardId: selectedDomainCardId.value
    }
  })

  /** Le rollback est-il possible pour le personnage courant ? */
  const rollbackStatus = computed(() => {
    return canRollback(character.value)
  })

  // ── Actions : navigation ────────────────────────────────

  /**
   * Ouvre le wizard de level up.
   * Réinitialise toutes les sélections.
   * @returns {boolean} true si le wizard s'est ouvert
   */
  function open() {
    if (!levelUpStatus.value.canLevel) {
      wizardError.value = levelUpStatus.value.reason
      return false
    }
    _resetSelections()
    isOpen.value = true
    wizardError.value = ''
    return true
  }

  /**
   * Ferme le wizard sans appliquer.
   */
  function close() {
    isOpen.value = false
    _resetSelections()
    wizardError.value = ''
  }

  /**
   * Passe à l'étape suivante si l'étape courante est valide.
   * @returns {boolean} true si la navigation a réussi
   */
  function nextStep() {
    if (!isCurrentStepValid.value) return false
    const idx = currentStepIndex.value
    if (idx < STEP_ORDER.length - 1) {
      currentStep.value = STEP_ORDER[idx + 1]
      return true
    }
    return false
  }

  /**
   * Revient à l'étape précédente.
   * @returns {boolean} true si la navigation a réussi
   */
  function prevStep() {
    const idx = currentStepIndex.value
    if (idx > 0) {
      currentStep.value = STEP_ORDER[idx - 1]
      return true
    }
    return false
  }

  /**
   * Va directement à une étape (seulement si les étapes précédentes sont valides).
   * @param {string} stepId - Une valeur de WIZARD_STEPS
   * @returns {boolean}
   */
  function goToStep(stepId) {
    const targetIdx = STEP_ORDER.indexOf(stepId)
    if (targetIdx < 0) return false

    // Vérifier que toutes les étapes précédentes sont complètes
    for (let i = 0; i < targetIdx; i++) {
      if (!_isStepComplete(STEP_ORDER[i])) return false
    }

    currentStep.value = stepId
    return true
  }

  // ── Actions : sélections ────────────────────────────────

  /**
   * Confirme le tier achievement.
   */
  function confirmTierAchievement() {
    tierAchievementConfirmed.value = true
  }

  /**
   * Ajoute un advancement à la sélection.
   * @param {Object} advancement - { type, tier, traits?, experiences? }
   * @returns {boolean} true si ajouté
   */
  function addAdvancement(advancement) {
    if (!advancement || !advancement.type || !advancement.tier) return false

    // Vérifier qu'on n'a pas déjà 2 points consommés
    const option = availableAdvancementOptions.value.find(
      (o) => o.type === advancement.type && o.tier === advancement.tier
    )
    if (!option) return false

    const pointCost = option.doubleSlot ? 2 : 1
    if (advancementPointsUsed.value + pointCost > 2) return false

    // Un doubleSlot doit être le seul choix
    if (option.doubleSlot && selectedAdvancements.value.length > 0) return false
    if (!option.doubleSlot && selectedAdvancements.value.some((a) => {
      const opt = availableAdvancementOptions.value.find(
        (o) => o.type === a.type && o.tier === a.tier
      )
      return opt && opt.doubleSlot
    })) return false

    selectedAdvancements.value.push({ ...advancement })
    return true
  }

  /**
   * Retire un advancement de la sélection par index.
   * @param {number} index
   */
  function removeAdvancement(index) {
    if (index >= 0 && index < selectedAdvancements.value.length) {
      selectedAdvancements.value.splice(index, 1)
    }
  }

  /**
   * Remplace toute la sélection d'advancements.
   * Utile pour les choix double-slot.
   * @param {Array<Object>} advancements
   */
  function setAdvancements(advancements) {
    selectedAdvancements.value = Array.isArray(advancements)
      ? advancements.map((a) => ({ ...a }))
      : []
  }

  /**
   * Confirme l'étape des seuils de dégâts.
   */
  function confirmThresholds() {
    thresholdsConfirmed.value = true
  }

  /**
   * Sélectionne une carte de domaine pour l'étape 4.
   * @param {string|null} cardId
   */
  function selectDomainCard(cardId) {
    selectedDomainCardId.value = cardId
  }

  // ── Actions : finalisation ──────────────────────────────

  /**
   * Applique le level up au personnage.
   * Construit l'entrée, la valide, et mute le personnage.
   *
   * @returns {{ success: boolean, error: string }}
   */
  function finalize() {
    if (!canFinalize.value) {
      return { success: false, error: 'Toutes les étapes ne sont pas complètes.' }
    }

    const char = character.value
    if (!char) {
      return { success: false, error: 'Aucun personnage sélectionné.' }
    }

    // Valider les advancements une dernière fois
    const validation = validateAdvancementChoices(char, selectedAdvancements.value)
    if (!validation.valid) {
      wizardError.value = validation.errors.join(' ')
      return { success: false, error: wizardError.value }
    }

    try {
      // Construire l'entrée d'historique
      const entry = buildLevelUpEntry(
        targetLevel.value,
        tierAchievement.value,
        selectedAdvancements.value,
        selectedDomainCardId.value
      )

      // Appliquer au personnage (mutation directe du reactive object)
      applyLevelUp(char, entry)

      // Gérer la carte de domaine de l'étape 4 via le characterStore
      // La carte gratuite de l'étape 4 est ajoutée au vault
      if (selectedDomainCardId.value) {
        _addDomainCardIfNeeded(char, selectedDomainCardId.value)
      }

      // Gérer les cartes de domaine des advancements "domain_card"
      for (const adv of selectedAdvancements.value) {
        if (adv.type === ADVANCEMENT_TYPES.DOMAIN_CARD && adv.cardId) {
          _addDomainCardIfNeeded(char, adv.cardId)
        }
      }

      // Persister
      char.updatedAt = new Date().toISOString()
      characterStore.persist()

      // Fermer le wizard
      close()

      return { success: true, error: '' }
    } catch (err) {
      const msg = `Erreur lors du level up : ${err.message || err}`
      wizardError.value = msg
      console.error('[levelUpStore] finalize error:', err)
      return { success: false, error: msg }
    }
  }

  /**
   * Annule le dernier level up du personnage sélectionné.
   * @returns {{ success: boolean, error: string }}
   */
  function rollback() {
    const char = character.value
    if (!char) {
      return { success: false, error: 'Aucun personnage sélectionné.' }
    }

    const result = rollbackLevelUp(char)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Retirer la carte de domaine de l'étape 4 si présente
    if (result.removedEntry && result.removedEntry.domainCard) {
      _removeDomainCard(char, result.removedEntry.domainCard)
    }

    // Retirer les cartes de domaine des advancements
    if (result.removedEntry && Array.isArray(result.removedEntry.advancements)) {
      for (const adv of result.removedEntry.advancements) {
        if (adv.type === ADVANCEMENT_TYPES.DOMAIN_CARD && adv.cardId) {
          _removeDomainCard(char, adv.cardId)
        }
      }
    }

    // Persister
    char.updatedAt = new Date().toISOString()
    characterStore.persist()

    return { success: true, error: '' }
  }

  // ── Utilitaires internes ────────────────────────────────

  /**
   * Réinitialise toutes les sélections du wizard.
   * @private
   */
  function _resetSelections() {
    currentStep.value = WIZARD_STEPS.TIER_ACHIEVEMENT
    tierAchievementConfirmed.value = false
    selectedAdvancements.value = []
    thresholdsConfirmed.value = false
    selectedDomainCardId.value = null
  }

  /**
   * Vérifie si une étape est complète.
   * @param {string} stepId
   * @returns {boolean}
   * @private
   */
  function _isStepComplete(stepId) {
    switch (stepId) {
      case WIZARD_STEPS.TIER_ACHIEVEMENT:
        return isTierAchievementComplete.value
      case WIZARD_STEPS.ADVANCEMENTS:
        return isAdvancementsComplete.value
      case WIZARD_STEPS.THRESHOLDS:
        return isThresholdsComplete.value
      case WIZARD_STEPS.DOMAIN_CARD:
        return isDomainCardComplete.value
      default:
        return false
    }
  }

  /**
   * Ajoute une carte de domaine au vault du personnage si non présente.
   * @param {Object} char
   * @param {string} cardId
   * @private
   */
  function _addDomainCardIfNeeded(char, cardId) {
    if (!char.domainCards) {
      char.domainCards = { loadout: [], vault: [] }
    }
    if (!Array.isArray(char.domainCards.vault)) char.domainCards.vault = []
    if (!Array.isArray(char.domainCards.loadout)) char.domainCards.loadout = []

    const alreadyOwned = char.domainCards.loadout.includes(cardId)
      || char.domainCards.vault.includes(cardId)
    if (!alreadyOwned) {
      char.domainCards.vault.push(cardId)
    }
  }

  /**
   * Retire une carte de domaine du vault ou du loadout.
   * @param {Object} char
   * @param {string} cardId
   * @private
   */
  function _removeDomainCard(char, cardId) {
    if (!char.domainCards) return
    if (Array.isArray(char.domainCards.vault)) {
      char.domainCards.vault = char.domainCards.vault.filter((id) => id !== cardId)
    }
    if (Array.isArray(char.domainCards.loadout)) {
      char.domainCards.loadout = char.domainCards.loadout.filter((id) => id !== cardId)
    }
  }

  // ── Exposition ──────────────────────────────────────────

  return {
    // Constantes
    WIZARD_STEPS,
    STEP_ORDER,
    STEP_LABELS,

    // État du wizard
    isOpen,
    currentStep,
    tierAchievementConfirmed,
    selectedAdvancements,
    thresholdsConfirmed,
    selectedDomainCardId,
    wizardError,

    // Getters
    character,
    levelUpStatus,
    targetLevel,
    targetTier,
    tierAchievement,
    hasTierAchievementStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,

    // Getters advancements
    availableAdvancementOptions,
    advancementPointsUsed,
    advancementPointsRemaining,
    advancementValidation,

    // Getters validation
    isTierAchievementComplete,
    isAdvancementsComplete,
    isThresholdsComplete,
    isDomainCardComplete,
    isCurrentStepValid,
    canFinalize,
    summary,
    rollbackStatus,

    // Actions navigation
    open,
    close,
    nextStep,
    prevStep,
    goToStep,

    // Actions sélections
    confirmTierAchievement,
    addAdvancement,
    removeAdvancement,
    setAdvancements,
    confirmThresholds,
    selectDomainCard,

    // Actions finalisation
    finalize,
    rollback
  }
})
