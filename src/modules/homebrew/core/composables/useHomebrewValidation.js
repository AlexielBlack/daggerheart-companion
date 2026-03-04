/**
 * @module homebrew/core/composables/useHomebrewValidation
 * @description Validation générique de données homebrew pilotée par un schéma déclaratif.
 *
 * Parcourt récursivement les champs du schéma pour produire une liste
 * d'erreurs structurées { field, message }.
 *
 * Utilisé par useHomebrewStore pour valider avant création/mise à jour
 * et par HomebrewForm pour la validation en temps réel.
 */

import { FIELD_TYPES } from '../utils/schemaTypes.js'

/**
 * @typedef {object} ValidationError
 * @property {string} field - Chemin du champ (ex: 'attack.modifier')
 * @property {string} message - Message d'erreur lisible
 */

/**
 * @typedef {object} ValidationResult
 * @property {boolean} valid - true si aucune erreur
 * @property {ValidationError[]} errors - Liste des erreurs
 */

/**
 * Valide une valeur scalaire selon la définition du champ.
 *
 * @param {*} value - Valeur à valider
 * @param {object} fieldDef - Définition du champ (issu du schéma)
 * @param {string} path - Chemin complet du champ (pour les messages d'erreur)
 * @returns {ValidationError[]}
 */
function validateScalar(value, fieldDef, path) {
  const errors = []
  const label = fieldDef.label || path

  // Champ requis
  if (fieldDef.required) {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')

    if (isEmpty) {
      errors.push({ field: path, message: `${label} est requis.` })
      return errors // Pas besoin de valider plus si vide et requis
    }
  }

  // Si la valeur est vide et non requise, pas de validation supplémentaire
  if (value === null || value === undefined || value === '') {
    return errors
  }

  switch (fieldDef.type) {
  case FIELD_TYPES.TEXT:
  case FIELD_TYPES.TEXTAREA:
    if (typeof value !== 'string') {
      errors.push({ field: path, message: `${label} doit être du texte.` })
    } else {
      if (fieldDef.minLength && value.length < fieldDef.minLength) {
        errors.push({ field: path, message: `${label} doit contenir au moins ${fieldDef.minLength} caractères.` })
      }
      if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
        errors.push({ field: path, message: `${label} ne doit pas dépasser ${fieldDef.maxLength} caractères.` })
      }
      if (fieldDef.pattern && !new RegExp(fieldDef.pattern).test(value)) {
        errors.push({ field: path, message: `${label} a un format invalide.` })
      }
    }
    break

  case FIELD_TYPES.NUMBER:
    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors.push({ field: path, message: `${label} doit être un nombre.` })
    } else {
      if (fieldDef.min !== undefined && value < fieldDef.min) {
        errors.push({ field: path, message: `${label} doit être au minimum ${fieldDef.min}.` })
      }
      if (fieldDef.max !== undefined && value > fieldDef.max) {
        errors.push({ field: path, message: `${label} ne doit pas dépasser ${fieldDef.max}.` })
      }
      if (fieldDef.integer && !Number.isInteger(value)) {
        errors.push({ field: path, message: `${label} doit être un nombre entier.` })
      }
    }
    break

  case FIELD_TYPES.SELECT:
    // Si optionsSource, les options sont dynamiques → pas de validation statique
    if (fieldDef.optionsSource) break
    if (fieldDef.options && fieldDef.options.length > 0) {
      // Extraire les valeurs possibles (support {value,label} et {group,items})
      const allowedValues = fieldDef.options.flatMap((opt) => {
        if (opt && typeof opt === 'object' && opt.group && Array.isArray(opt.items)) {
          return opt.items.map((i) => (i && typeof i === 'object' && 'value' in i) ? i.value : i)
        }
        return [(opt && typeof opt === 'object' && 'value' in opt) ? opt.value : opt]
      })
      if (!allowedValues.includes(value)) {
        errors.push({ field: path, message: `${label} : valeur "${value}" non autorisée.` })
      }
    }
    break

  case FIELD_TYPES.MULTI_SELECT:
    if (!Array.isArray(value)) {
      errors.push({ field: path, message: `${label} doit être une liste.` })
    } else if (fieldDef.options) {
      const invalid = value.filter((v) => !fieldDef.options.includes(v))
      if (invalid.length > 0) {
        errors.push({ field: path, message: `${label} : valeurs non autorisées : ${invalid.join(', ')}.` })
      }
    }
    break

  case FIELD_TYPES.BOOLEAN:
    if (typeof value !== 'boolean') {
      errors.push({ field: path, message: `${label} doit être vrai ou faux.` })
    }
    break

  case FIELD_TYPES.TAGS:
    if (!Array.isArray(value)) {
      errors.push({ field: path, message: `${label} doit être une liste.` })
    } else {
      if (fieldDef.minItems && value.length < fieldDef.minItems) {
        errors.push({ field: path, message: `${label} doit contenir au moins ${fieldDef.minItems} élément(s).` })
      }
      if (fieldDef.maxItems && value.length > fieldDef.maxItems) {
        errors.push({ field: path, message: `${label} ne doit pas dépasser ${fieldDef.maxItems} élément(s).` })
      }
    }
    break
  }

  return errors
}

/**
 * Valide un groupe de sous-champs (objet imbriqué).
 *
 * @param {object} value - Objet à valider
 * @param {object} fieldDef - Définition du champ GROUP avec children[]
 * @param {string} path - Chemin complet
 * @returns {ValidationError[]}
 */
function validateGroup(value, fieldDef, path) {
  const errors = []
  const label = fieldDef.label || path

  if (fieldDef.required && (!value || typeof value !== 'object')) {
    errors.push({ field: path, message: `${label} est requis.` })
    return errors
  }

  if (!value || typeof value !== 'object') {
    return errors
  }

  if (Array.isArray(fieldDef.children)) {
    for (const child of fieldDef.children) {
      const childPath = `${path}.${child.key}`
      const childValue = value[child.key]
      errors.push(...validateField(childValue, child, childPath))
    }
  }

  return errors
}

/**
 * Valide un tableau d'objets répétables (ARRAY).
 *
 * @param {Array} value - Tableau à valider
 * @param {object} fieldDef - Définition du champ ARRAY avec itemSchema
 * @param {string} path - Chemin complet
 * @returns {ValidationError[]}
 */
function validateArray(value, fieldDef, path) {
  const errors = []
  const label = fieldDef.label || path

  if (fieldDef.required && (!Array.isArray(value) || value.length === 0)) {
    errors.push({ field: path, message: `${label} doit contenir au moins un élément.` })
    return errors
  }

  if (!Array.isArray(value)) {
    if (value !== undefined && value !== null) {
      errors.push({ field: path, message: `${label} doit être un tableau.` })
    }
    return errors
  }

  if (fieldDef.minItems && value.length < fieldDef.minItems) {
    errors.push({ field: path, message: `${label} doit contenir au moins ${fieldDef.minItems} élément(s).` })
  }
  if (fieldDef.maxItems && value.length > fieldDef.maxItems) {
    errors.push({ field: path, message: `${label} ne doit pas dépasser ${fieldDef.maxItems} élément(s).` })
  }

  // Validation de chaque item selon le sous-schéma
  if (fieldDef.itemSchema?.fields) {
    value.forEach((item, index) => {
      const itemPath = `${path}[${index}]`
      for (const subField of fieldDef.itemSchema.fields) {
        const subPath = `${itemPath}.${subField.key}`
        const subValue = item?.[subField.key]
        errors.push(...validateField(subValue, subField, subPath))
      }
    })
  }

  return errors
}

/**
 * Valide un tableau de features Daggerheart (FEATURES).
 * Chaque feature doit avoir au minimum un name, un type et une description.
 *
 * @param {Array} value - Tableau de features
 * @param {object} fieldDef - Définition du champ
 * @param {string} path - Chemin complet
 * @returns {ValidationError[]}
 */
function validateFeatures(value, fieldDef, path) {
  const errors = []
  const label = fieldDef.label || path
  const validFeatureTypes = ['action', 'reaction', 'passive']

  if (fieldDef.required && (!Array.isArray(value) || value.length === 0)) {
    errors.push({ field: path, message: `${label} doit contenir au moins une feature.` })
    return errors
  }

  if (!Array.isArray(value)) {
    return errors
  }

  value.forEach((feature, index) => {
    const featurePath = `${path}[${index}]`

    if (!feature.name || typeof feature.name !== 'string' || !feature.name.trim()) {
      errors.push({ field: `${featurePath}.name`, message: `Feature #${index + 1} : le nom est requis.` })
    }

    if (!feature.type || !validFeatureTypes.includes(feature.type)) {
      errors.push({
        field: `${featurePath}.type`,
        message: `Feature #${index + 1} : type invalide ("${feature.type}"). Attendu : ${validFeatureTypes.join(', ')}.`
      })
    }

    if (!feature.description || typeof feature.description !== 'string' || !feature.description.trim()) {
      errors.push({
        field: `${featurePath}.description`,
        message: `Feature #${index + 1} : la description est requise.`
      })
    }
  })

  return errors
}

/**
 * Point d'entrée de validation pour un champ unique.
 * Dispatch vers le bon validateur selon le type.
 *
 * @param {*} value
 * @param {object} fieldDef
 * @param {string} path
 * @returns {ValidationError[]}
 */
function validateField(value, fieldDef, path) {
  if (!fieldDef || !fieldDef.type) {
    return []
  }

  switch (fieldDef.type) {
  case FIELD_TYPES.GROUP:
    return validateGroup(value, fieldDef, path)
  case FIELD_TYPES.ARRAY:
    return validateArray(value, fieldDef, path)
  case FIELD_TYPES.FEATURES:
    return validateFeatures(value, fieldDef, path)
  default:
    return validateScalar(value, fieldDef, path)
  }
}

/**
 * Valide un objet complet contre un schéma homebrew.
 *
 * @param {object} data - Données à valider
 * @param {object} schema - Schéma déclaratif avec fields[]
 * @returns {ValidationResult}
 */
export function validateHomebrewData(data, schema) {
  if (!schema?.fields || !Array.isArray(schema.fields)) {
    return { valid: false, errors: [{ field: '_schema', message: 'Schéma invalide ou sans champs.' }] }
  }

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: '_data', message: 'Les données doivent être un objet.' }] }
  }

  const errors = []

  for (const fieldDef of schema.fields) {
    const value = data[fieldDef.key]
    errors.push(...validateField(value, fieldDef, fieldDef.key))
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Retourne les erreurs pour un champ spécifique à partir d'un résultat de validation.
 * Utile pour l'affichage inline des erreurs dans le formulaire.
 *
 * @param {ValidationError[]} errors - Liste d'erreurs complète
 * @param {string} fieldPath - Chemin du champ (ex: 'attack.modifier')
 * @returns {ValidationError[]}
 */
export function getFieldErrors(errors, fieldPath) {
  if (!Array.isArray(errors)) {
    return []
  }
  return errors.filter((e) => e.field === fieldPath || e.field.startsWith(`${fieldPath}.`) || e.field.startsWith(`${fieldPath}[`))
}
