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
export { default as AncestryPreview } from './categories/ancestry/AncestryPreview.vue'
export { default as CommunityPreview } from './categories/community/CommunityPreview.vue'
export { default as EnvironmentPreview } from './categories/environment/EnvironmentPreview.vue'
export { default as EquipmentPreview } from './categories/equipment/EquipmentPreview.vue'

// ── Stores par catégorie ────────────────────────────────────
export { useAdversaryHomebrewStore } from './categories/adversary/useAdversaryHomebrewStore.js'
export { useAncestryHomebrewStore } from './categories/ancestry/useAncestryHomebrewStore.js'
export { useCommunityHomebrewStore } from './categories/community/useCommunityHomebrewStore.js'
export { useEnvironmentHomebrewStore } from './categories/environment/useEnvironmentHomebrewStore.js'
export { useEquipmentHomebrewStore } from './categories/equipment/useEquipmentHomebrewStore.js'

// ── Vues ────────────────────────────────────────────────────
export { default as HomebrewHub } from './views/HomebrewHub.vue'
export { default as HomebrewAdversaryList } from './views/HomebrewAdversaryList.vue'
export { default as HomebrewAdversaryEditor } from './views/HomebrewAdversaryEditor.vue'
export { default as HomebrewAncestryList } from './views/HomebrewAncestryList.vue'
export { default as HomebrewAncestryEditor } from './views/HomebrewAncestryEditor.vue'
export { default as HomebrewCommunityList } from './views/HomebrewCommunityList.vue'
export { default as HomebrewCommunityEditor } from './views/HomebrewCommunityEditor.vue'
export { default as HomebrewEnvironmentList } from './views/HomebrewEnvironmentList.vue'
export { default as HomebrewEnvironmentEditor } from './views/HomebrewEnvironmentEditor.vue'
export { default as HomebrewEquipmentList } from './views/HomebrewEquipmentList.vue'
export { default as HomebrewEquipmentEditor } from './views/HomebrewEquipmentEditor.vue'

// ── Schémas ────────────────────────────────────────────────
export { adversarySchema, ADVERSARY_TIER_BENCHMARKS } from './schemas/adversarySchema.js'
export { ancestrySchema, ANCESTRY_EMOJIS } from './schemas/ancestrySchema.js'
export { communitySchema, COMMUNITY_EMOJIS } from './schemas/communitySchema.js'
export { environmentSchema, ENVIRONMENT_TYPES, ENVIRONMENT_TIER_BENCHMARKS } from './schemas/environmentSchema.js'
export { equipmentSchema, EQUIPMENT_CATEGORIES, WEAPON_TRAITS, getRelevantFields } from './schemas/equipmentSchema.js'

// ── Phase F : Classe & Domaine ──────────────────────────
export { default as ClassPreview } from './categories/class/ClassPreview.vue'
export { default as DomainPreview } from './categories/domain/DomainPreview.vue'

export { useClassHomebrewStore } from './categories/class/useClassHomebrewStore.js'
export { useDomainHomebrewStore } from './categories/domain/useDomainHomebrewStore.js'

export { default as HomebrewClassList } from './views/HomebrewClassList.vue'
export { default as HomebrewClassEditor } from './views/HomebrewClassEditor.vue'
export { default as HomebrewDomainList } from './views/HomebrewDomainList.vue'
export { default as HomebrewDomainEditor } from './views/HomebrewDomainEditor.vue'

export { classSchema, AVAILABLE_DOMAINS, CLASS_EMOJIS, TRAIT_KEYS } from './schemas/classSchema.js'
export { domainSchema, CARD_TYPES, CARD_LEVELS, DOMAIN_COLORS } from './schemas/domainSchema.js'
