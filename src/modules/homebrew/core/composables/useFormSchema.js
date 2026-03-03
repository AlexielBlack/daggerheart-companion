/**
 * @module homebrew/core/composables/useFormSchema
 * @description Composable qui interprète un schéma déclaratif pour produire :
 *  - un modèle de données réactif (formData)
 *  - des méthodes de reset / hydratation
 *  - un état dirty (modifications non sauvegardées)
 *
 * Utilisé par HomebrewForm.vue pour piloter dynamiquement le formulaire.
 */

import { ref, computed } from 'vue'
import { FIELD_TYPES, getDefaultForType } from '../utils/schemaTypes.js'

/**
 * Deep clone sûr pour les proxies Vue réactifs.
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Construit un objet de valeurs par défaut à partir des champs d'un schéma.
 * Gère la récursion pour les GROUP et les valeurs par défaut explicites.
 *
 * @param {object[]} fields - Tableau de définitions de champs
 * @returns {object} Objet avec les valeurs par défaut
 */
export function buildDefaults(fields) {
  if (!Array.isArray(fields)) {
    return {}
  }

  const defaults = {}

  for (const field of fields) {
    if (!field.key) {
      continue
    }

    // Valeur par défaut explicite dans le schéma
    if (field.defaultValue !== undefined) {
      defaults[field.key] = deepClone(field.defaultValue)
      continue
    }

    // Groupe : construire récursivement
    if (field.type === FIELD_TYPES.GROUP && Array.isArray(field.children)) {
      defaults[field.key] = buildDefaults(field.children)
      continue
    }

    // Valeur par défaut du type
    defaults[field.key] = getDefaultForType(field.type)
  }

  return defaults
}

/**
 * Fusionne des données existantes avec les valeurs par défaut du schéma.
 * Les clés présentes dans `data` priment sur les défauts.
 * Les clés manquantes dans `data` sont complétées par les défauts.
 *
 * @param {object} data - Données existantes (ex: item à éditer)
 * @param {object[]} fields - Champs du schéma
 * @returns {object} Données fusionnées
 */
export function mergeWithDefaults(data, fields) {
  const defaults = buildDefaults(fields)
  if (!data || typeof data !== 'object') {
    return defaults
  }

  const merged = { ...defaults }

  for (const field of fields) {
    if (!field.key) {
      continue
    }

    const value = data[field.key]

    if (value === undefined) {
      continue
    }

    // Groupe : fusion récursive
    if (field.type === FIELD_TYPES.GROUP && Array.isArray(field.children) && typeof value === 'object' && !Array.isArray(value)) {
      merged[field.key] = mergeWithDefaults(value, field.children)
    } else {
      merged[field.key] = deepClone(value)
    }
  }

  return merged
}

/**
 * Composable de gestion du formulaire piloté par schéma.
 *
 * @param {object} schema - Schéma déclaratif { key, label, fields[] }
 * @param {object} [initialData=null] - Données initiales (mode édition)
 * @returns {object} API du formulaire
 */
export function useFormSchema(schema, initialData = null) {
  if (!schema?.fields || !Array.isArray(schema.fields)) {
    throw new Error(`[useFormSchema] Schéma invalide : "fields" manquant ou non-tableau.`)
  }

  const defaults = buildDefaults(schema.fields)
  const initial = initialData
    ? mergeWithDefaults(initialData, schema.fields)
    : deepClone(defaults)

  /** Données réactives du formulaire */
  const formData = ref(deepClone(initial))

  /** Snapshot de l'état initial pour la détection dirty */
  const snapshot = ref(JSON.stringify(initial))

  /** true si le formulaire a été modifié depuis le dernier reset/hydrate */
  const isDirty = computed(() => {
    return JSON.stringify(formData.value) !== snapshot.value
  })

  /** Mode édition (true si des données initiales ont été fournies) */
  const isEditMode = computed(() => initialData !== null)

  /**
   * Réinitialise le formulaire aux valeurs par défaut du schéma.
   */
  function reset() {
    const freshDefaults = buildDefaults(schema.fields)
    formData.value = deepClone(freshDefaults)
    snapshot.value = JSON.stringify(freshDefaults)
  }

  /**
   * Hydrate le formulaire avec des données existantes (mode édition).
   * Les champs manquants sont complétés par les défauts du schéma.
   *
   * @param {object} data - Données à charger
   */
  function hydrate(data) {
    const merged = mergeWithDefaults(data, schema.fields)
    formData.value = deepClone(merged)
    snapshot.value = JSON.stringify(merged)
  }

  /**
   * Met à jour un champ spécifique par son chemin.
   * Supporte les chemins simples ('name') et imbriqués ('attack.modifier').
   *
   * @param {string} path - Chemin du champ (dot-notation)
   * @param {*} value - Nouvelle valeur
   */
  function setField(path, value) {
    const keys = path.split('.')
    let target = formData.value

    for (let i = 0; i < keys.length - 1; i++) {
      if (target[keys[i]] === undefined || target[keys[i]] === null) {
        target[keys[i]] = {}
      }
      target = target[keys[i]]
    }

    target[keys[keys.length - 1]] = value
  }

  /**
   * Lit la valeur d'un champ par son chemin.
   *
   * @param {string} path - Chemin du champ (dot-notation)
   * @returns {*} Valeur actuelle
   */
  function getField(path) {
    const keys = path.split('.')
    let target = formData.value

    for (const key of keys) {
      if (target === undefined || target === null) {
        return undefined
      }
      target = target[key]
    }

    return target
  }

  /**
   * Retourne un objet propre (sans métadonnées) prêt pour la sauvegarde.
   * @returns {object}
   */
  function toRawData() {
    return deepClone(formData.value)
  }

  return {
    formData,
    isDirty,
    isEditMode,
    reset,
    hydrate,
    setField,
    getField,
    toRawData,
    /** Expose les champs du schéma pour le rendu dynamique */
    fields: schema.fields,
    /** Expose la clé du schéma */
    schemaKey: schema.key
  }
}
