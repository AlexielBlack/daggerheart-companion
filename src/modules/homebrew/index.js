/**
 * @module homebrew
 * @description Module de création de contenu custom (homebrew) pour Daggerheart.
 *
 * Architecture schema-driven : chaque catégorie (adversaire, environnement,
 * ascendance, etc.) est définie par un schéma déclaratif qui pilote
 * automatiquement le store CRUD, la validation et le formulaire.
 */

// ── Utilitaires ────────────────────────────────────────────
export { FIELD_TYPES, SCALAR_TYPES, COMPOSITE_TYPES, getDefaultForType, isValidFieldType } from './core/utils/schemaTypes.js'
export { generateId, slugify, getCategoryFromId, isHomebrewId, CATEGORY_PREFIXES } from './core/utils/idGenerator.js'

// ── Composables ────────────────────────────────────────────
export { createHomebrewStore } from './core/composables/useHomebrewStore.js'
export { useFormSchema, buildDefaults, mergeWithDefaults } from './core/composables/useFormSchema.js'
export { validateHomebrewData, getFieldErrors } from './core/composables/useHomebrewValidation.js'

// ── Schémas ────────────────────────────────────────────────
export { adversarySchema, ADVERSARY_TIER_BENCHMARKS } from './schemas/adversarySchema.js'
