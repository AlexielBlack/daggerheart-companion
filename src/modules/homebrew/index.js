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

// ── Composants génériques ────────────────────────────────────
export { default as HomebrewFormField } from './core/components/HomebrewFormField.vue'
export { default as FeatureEditor } from './core/components/FeatureEditor.vue'
export { default as ArrayFieldEditor } from './core/components/ArrayFieldEditor.vue'
export { default as HomebrewForm } from './core/components/HomebrewForm.vue'
export { default as HomebrewCard } from './core/components/HomebrewCard.vue'
export { default as HomebrewList } from './core/components/HomebrewList.vue'
export { default as ImportExportPanel } from './core/components/ImportExportPanel.vue'

// ── Composants spécialisés ──────────────────────────────────
export { default as AdversaryPreview } from './categories/adversary/AdversaryPreview.vue'

// ── Vues ────────────────────────────────────────────────────
export { default as HomebrewAdversaryList } from './views/HomebrewAdversaryList.vue'
export { default as HomebrewAdversaryEditor } from './views/HomebrewAdversaryEditor.vue'

// ── Schémas ────────────────────────────────────────────────
export { adversarySchema, ADVERSARY_TIER_BENCHMARKS } from './schemas/adversarySchema.js'
