/**
 * @module levelup
 * @description Module de progression (Level Up) pour Daggerheart.
 *
 * Point d'entrée centralisé — tous les consommateurs externes
 * importent depuis cet index plutôt que des chemins profonds.
 *
 * @example
 * // Store
 * import { useLevelUpStore, WIZARD_STEPS } from '@modules/levelup'
 *
 * // Composant wizard (pour intégration dans une vue)
 * import { LevelUpWizard } from '@modules/levelup'
 *
 * // Règles pures (pour logique métier ou tests)
 * import { canLevelUp, applyLevelUp, ADVANCEMENT_TYPES } from '@modules/levelup'
 */

// ═══════════════════════════════════════════════════════════
//  Store
// ═══════════════════════════════════════════════════════════

export {
  useLevelUpStore,
  WIZARD_STEPS,
  STEP_ORDER,
  STEP_LABELS
} from './stores/levelUpStore'

// ═══════════════════════════════════════════════════════════
//  Composables (règles pures)
// ═══════════════════════════════════════════════════════════

export {
  // Tiers & niveaux
  getTierForLevel,
  hasTierAchievement,
  shouldClearTraits,
  getTierAchievement,
  canLevelUp,

  // Slots & advancements
  getUsedSlots,
  getAdvancementDef,
  getRemainingSlots,
  getAvailableAdvancements,
  validateAdvancementChoices,

  // Application & rollback
  buildLevelUpEntry,
  applyLevelUp,
  canRollback,
  rollbackLevelUp,

  // Constantes
  MAX_LEVEL,
  TIER_ACHIEVEMENT_LEVELS,
  TRAIT_CLEAR_LEVELS,
  ADVANCEMENT_TYPES,
  TRAIT_IDS,
  TIER_ADVANCEMENT_POOLS
} from './composables/useLevelUpRules'

// ═══════════════════════════════════════════════════════════
//  Composants Vue
// ═══════════════════════════════════════════════════════════

export { default as LevelUpWizard } from './components/LevelUpWizard.vue'
export { default as TierAchievementStep } from './components/TierAchievementStep.vue'
export { default as AdvancementStep } from './components/AdvancementStep.vue'
export { default as ThresholdStep } from './components/ThresholdStep.vue'
export { default as DomainCardStep } from './components/DomainCardStep.vue'
export { default as LevelUpSummary } from './components/LevelUpSummary.vue'
