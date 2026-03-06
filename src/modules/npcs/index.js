/**
 * @module npcs
 * @description Module PNJ — Gestion des personnages non-joueurs.
 * Fournit store, constantes et composants pour le CRUD des PNJs,
 * le système relationnel PNJ↔PJ et PNJ↔PNJ, le filtrage avancé,
 * et le système de combat (types adversaire, thèmes, conditions,
 * proficiency, cooldowns, combat features).
 *
 * API publique :
 *  - useNpcStore        : Store Pinia CRUD + relations
 *  - constantes         : Statuts, dispositions, types de relation
 *  - combatConstants    : Types adversaire, thèmes, conditions, proficiency
 *  - NpcCard            : Carte compacte pour liste
 *  - NpcFilters         : Barre de filtres
 *  - NpcSheet           : Fiche complète avec édition
 *  - NpcManager         : Vue principale (liste + fiche)
 */

// Store
export { useNpcStore } from './stores/npcStore.js'
export { useHomebrewCombatFeatureStore } from './stores/homebrewCombatFeatureStore.js'

// Constantes
export {
  ALL_NPC_STATUSES,
  NPC_STATUS_META,
  NPC_STATUS_ALLY,
  NPC_STATUS_NEUTRAL,
  NPC_STATUS_HOSTILE,
  NPC_STATUS_DEAD,
  NPC_STATUS_MISSING,
  ALL_DISPOSITIONS,
  DISPOSITION_META,
  DISPOSITION_HOSTILE,
  DISPOSITION_SUSPICIOUS,
  DISPOSITION_NEUTRAL,
  DISPOSITION_FRIENDLY,
  DISPOSITION_ALLIED,
  ALL_RELATION_TYPES,
  RELATION_TYPE_META,
  isValidStatus,
  isValidDisposition,
  isValidRelationType,
  createDefaultNpc
} from './constants.js'

// Constantes combat
export {
  ALL_ADVERSARY_TYPES,
  ADVERSARY_TYPE_META,
  ALL_THEMES,
  THEME_META,
  ALL_CONDITIONS,
  STANDARD_CONDITIONS,
  SPECIAL_CONDITIONS,
  CONDITION_META,
  PROFICIENCY_BY_TIER,
  TIER_BENCHMARKS,
  ALL_COMBAT_PROFILES,
  COMBAT_PROFILE_NONE,
  COMBAT_PROFILE_LINKED,
  COMBAT_PROFILE_CUSTOM,
  COMBAT_PROFILE_META,
  ALL_COOLDOWNS,
  COOLDOWN_META,
  computeAllyCooldown,
  computeEnemyResolution,
  createCountdown,
  ALL_FEATURE_SOURCES,
  createCombatFeature,
  validateCombatFeature,
  isValidAdversaryType,
  isValidTheme,
  isValidCondition,
  isValidCombatProfile,
  isValidCooldown,
  isValidTier,
  isValidProficiency
} from './combatConstants.js'

// Catalogue de combat features
export {
  ADVERSARY_FEATURES,
  DOMAIN_CARD_FEATURES,
  ALL_COMBAT_FEATURES,
  getFeatureById,
  filterFeatures,
  groupByActivationType
} from './combatFeatureCatalogue.js'

// Composants
export { default as NpcCard } from './components/NpcCard.vue'
export { default as NpcFilters } from './components/NpcFilters.vue'
export { default as NpcSheet } from './components/NpcSheet.vue'
export { default as NpcBuildPanel } from './components/NpcBuildPanel.vue'
export { default as NpcCombatPanel } from './components/NpcCombatPanel.vue'

// Vue
export { default as NpcManager } from './views/NpcManager.vue'
