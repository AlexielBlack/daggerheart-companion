/**
 * @module homebrew/core/utils/schemaTypes
 * @description Types de champs supportés par le système de formulaires
 * piloté par schéma (schema-driven forms).
 *
 * Chaque type correspond à un rendu spécifique dans HomebrewFormField.vue
 * et à une logique de validation dans useHomebrewValidation.js.
 */

/**
 * Énumération des types de champs supportés.
 * @readonly
 * @enum {string}
 */
export const FIELD_TYPES = Object.freeze({
  /** Champ texte simple (input text) */
  TEXT: 'text',

  /** Zone de texte multiligne (textarea) */
  TEXTAREA: 'textarea',

  /** Champ numérique (input number) */
  NUMBER: 'number',

  /** Sélecteur à choix unique (select / dropdown) */
  SELECT: 'select',

  /** Sélecteur à choix multiples (multi-select / checkboxes) */
  MULTI_SELECT: 'multi_select',

  /** Interrupteur booléen (checkbox / toggle) */
  BOOLEAN: 'boolean',

  /** Saisie de tags libres (tableau de chaînes, ex: motives) */
  TAGS: 'tags',

  /** Groupe de sous-champs (objet imbriqué, ex: thresholds) */
  GROUP: 'group',

  /** Tableau d'objets avec un sous-schéma répétable (ex: experiences) */
  ARRAY: 'array',

  /**
   * Éditeur spécialisé de features Daggerheart
   * (actions / réactions / passifs avec coût optionnel et question narrative).
   */
  FEATURES: 'features'
})

/**
 * Ensemble des types considérés comme scalaires (valeur simple, pas d'enfants).
 * Utilisé pour déterminer la stratégie de validation et de rendu.
 * @type {ReadonlySet<string>}
 */
export const SCALAR_TYPES = Object.freeze(new Set([
  FIELD_TYPES.TEXT,
  FIELD_TYPES.TEXTAREA,
  FIELD_TYPES.NUMBER,
  FIELD_TYPES.SELECT,
  FIELD_TYPES.MULTI_SELECT,
  FIELD_TYPES.BOOLEAN,
  FIELD_TYPES.TAGS
]))

/**
 * Ensemble des types composites (contiennent des enfants ou sous-schémas).
 * @type {ReadonlySet<string>}
 */
export const COMPOSITE_TYPES = Object.freeze(new Set([
  FIELD_TYPES.GROUP,
  FIELD_TYPES.ARRAY,
  FIELD_TYPES.FEATURES
]))

/**
 * Valeur par défaut associée à chaque type de champ.
 * Utilisée par useFormSchema pour initialiser les données réactives.
 *
 * @param {string} fieldType - Un des FIELD_TYPES
 * @returns {*} Valeur par défaut appropriée
 */
export function getDefaultForType(fieldType) {
  switch (fieldType) {
  case FIELD_TYPES.TEXT:
  case FIELD_TYPES.TEXTAREA:
    return ''
  case FIELD_TYPES.NUMBER:
    return 0
  case FIELD_TYPES.SELECT:
    return null
  case FIELD_TYPES.MULTI_SELECT:
    return []
  case FIELD_TYPES.BOOLEAN:
    return false
  case FIELD_TYPES.TAGS:
    return []
  case FIELD_TYPES.GROUP:
    return {}
  case FIELD_TYPES.ARRAY:
    return []
  case FIELD_TYPES.FEATURES:
    return []
  default:
    return null
  }
}

/**
 * Vérifie qu'un type de champ est valide.
 * @param {string} type
 * @returns {boolean}
 */
export function isValidFieldType(type) {
  return Object.values(FIELD_TYPES).includes(type)
}

/**
 * Tags de gameplay applicables aux features homebrew.
 * Multi-assignables : une feature peut être à la fois offensif et utilitaire.
 * @type {ReadonlyArray<string>}
 */
export const FEATURE_TAGS = Object.freeze([
  'offensif',
  'défensif',
  'social',
  'utilitaire'
])

/**
 * Définition de champ MULTI_SELECT réutilisable pour les tags de features.
 * À insérer dans les children d'un GROUP ou dans un itemSchema ARRAY.
 * @returns {Object} Définition de champ prête à l'emploi
 */
export function tagsFieldDef() {
  return {
    key: 'tags',
    type: FIELD_TYPES.MULTI_SELECT,
    label: 'Tags',
    required: false,
    options: [...FEATURE_TAGS],
    minItems: 0,
    maxItems: 4,
    helpText: 'Catégorie(s) de gameplay de cette feature.'
  }
}
