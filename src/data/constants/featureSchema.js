/**
 * @module constants/featureSchema
 * @description Schéma unifié pour les features mécaniques Daggerheart.
 *
 * Définit le « FeatureDescriptor » — noyau commun partagé par toutes
 * les sources de features (classes, sous-classes, ascendances, communautés,
 * cartes de domaine, adversaires, environnements, équipement).
 *
 * Trois exports principaux :
 *  - Constantes (enums, métadonnées d'affichage)
 *  - validateFeatureDescriptor() — validation stricte
 *  - normalizeFeature()          — conversion depuis les formats hérités
 */

import { ALL_TAGS, validateTags } from './tags.js'

// ═══════════════════════════════════════════════════════════
//  Constantes — Types d'activation
// ═══════════════════════════════════════════════════════════

/** Types d'activation d'une feature */
export const ACTIVATION_TYPES = ['passive', 'action', 'reaction']

/** Métadonnées d'affichage des types d'activation */
export const ACTIVATION_META = {
  passive: {
    label: 'Passive',
    emoji: '♾️',
    color: '#6b7280',
    description: 'Toujours active tant que les conditions sont remplies'
  },
  action: {
    label: 'Action',
    emoji: '⚡',
    color: '#f59e0b',
    description: 'Nécessite le projecteur ou un tour pour être utilisée'
  },
  reaction: {
    label: 'Réaction',
    emoji: '🔄',
    color: '#8b5cf6',
    description: 'Se déclenche automatiquement quand un trigger survient'
  }
}

// ═══════════════════════════════════════════════════════════
//  Constantes — Types de coût
// ═══════════════════════════════════════════════════════════

/** Types de coût possibles pour activer une feature */
export const COST_TYPES = ['hope', 'stress', 'fear', 'armor', 'free']

/** Métadonnées d'affichage des types de coût */
export const COST_META = {
  hope: { label: 'Espoir', emoji: '✨', color: '#eab308' },
  stress: { label: 'Stress', emoji: '💢', color: '#ef4444' },
  fear: { label: 'Peur', emoji: '😱', color: '#7c3aed' },
  armor: { label: 'Armure', emoji: '🛡️', color: '#3b82f6' },
  free: { label: 'Gratuit', emoji: '🆓', color: '#22c55e' }
}

// ═══════════════════════════════════════════════════════════
//  Constantes — Traits
// ═══════════════════════════════════════════════════════════

/** Traits mécaniques utilisables par une feature */
export const FEATURE_TRAITS = [
  'agility', 'strength', 'finesse',
  'instinct', 'presence', 'knowledge',
  'spellcast'
]

/** Métadonnées d'affichage des traits */
export const TRAIT_META = {
  agility: { label: 'Agilité', emoji: '💨' },
  strength: { label: 'Force', emoji: '💪' },
  finesse: { label: 'Finesse', emoji: '🎯' },
  instinct: { label: 'Instinct', emoji: '👁️' },
  presence: { label: 'Présence', emoji: '👑' },
  knowledge: { label: 'Savoir', emoji: '📖' },
  spellcast: { label: 'Sort', emoji: '🔮' }
}

// ═══════════════════════════════════════════════════════════
//  Constantes — Portées
// ═══════════════════════════════════════════════════════════

/** Portées possibles (normalisées en camelCase) */
export const RANGE_VALUES = ['self', 'melee', 'veryClose', 'close', 'far', 'veryFar']

/** Métadonnées d'affichage des portées */
export const RANGE_META = {
  self: { label: 'Soi', emoji: '🧍', order: 0 },
  melee: { label: 'Mêlée', emoji: '🤜', order: 1 },
  veryClose: { label: 'Très Proche', emoji: '📍', order: 2 },
  close: { label: 'Proche', emoji: '📏', order: 3 },
  far: { label: 'Loin', emoji: '🏹', order: 4 },
  veryFar: { label: 'Très Loin', emoji: '🌄', order: 5 }
}

/**
 * Table de conversion des portées héritées vers le format normalisé.
 * Les données existantes utilisent 'Melee', 'Very Close', etc.
 */
export const RANGE_ALIASES = {
  'Melee': 'melee',
  'melee': 'melee',
  'Very Close': 'veryClose',
  'very close': 'veryClose',
  'veryClose': 'veryClose',
  'Close': 'close',
  'close': 'close',
  'Far': 'far',
  'far': 'far',
  'Very Far': 'veryFar',
  'very far': 'veryFar',
  'veryFar': 'veryFar',
  'Self': 'self',
  'self': 'self'
}

// ═══════════════════════════════════════════════════════════
//  Constantes — Fréquences
// ═══════════════════════════════════════════════════════════

/** Fréquences d'utilisation */
export const FREQUENCY_VALUES = [
  'atWill', 'oncePerShortRest', 'oncePerLongRest', 'oncePerSession', 'special'
]

/** Métadonnées d'affichage des fréquences */
export const FREQUENCY_META = {
  atWill: { label: 'À volonté', emoji: '♻️' },
  oncePerShortRest: { label: '1× / repos court', emoji: '⏸️' },
  oncePerLongRest: { label: '1× / repos long', emoji: '🌙' },
  oncePerSession: { label: '1× / session', emoji: '📅' },
  special: { label: 'Spécial', emoji: '⭐' }
}

// ═══════════════════════════════════════════════════════════
//  Constantes — Conditions
// ═══════════════════════════════════════════════════════════

/** Conditions standard du SRD */
export const STANDARD_CONDITIONS = ['vulnerable', 'restrained', 'hidden']

// ═══════════════════════════════════════════════════════════
//  Validation
// ═══════════════════════════════════════════════════════════

/**
 * Valide un objet coût.
 * @param {*} cost
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCost(cost) {
  const errors = []
  if (cost === null || cost === undefined) return { valid: true, errors }

  if (typeof cost !== 'object' || Array.isArray(cost)) {
    return { valid: false, errors: ['cost doit être un objet { type, amount }'] }
  }
  if (!COST_TYPES.includes(cost.type)) {
    errors.push(`cost.type invalide : « ${cost.type} » (attendu : ${COST_TYPES.join(', ')})`)
  }
  if (typeof cost.amount !== 'number' || cost.amount < 0 || !Number.isInteger(cost.amount)) {
    errors.push(`cost.amount doit être un entier ≥ 0 (reçu : ${cost.amount})`)
  }
  return { valid: errors.length === 0, errors }
}

/**
 * Valide un objet conditions.
 * @param {*} conditions
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateConditions(conditions) {
  const errors = []
  if (conditions === null || conditions === undefined) return { valid: true, errors }

  if (typeof conditions !== 'object' || Array.isArray(conditions)) {
    return { valid: false, errors: ['conditions doit être un objet { applies, clears }'] }
  }

  for (const key of ['applies', 'clears']) {
    if (conditions[key] !== undefined && conditions[key] !== null) {
      if (!Array.isArray(conditions[key])) {
        errors.push(`conditions.${key} doit être un tableau`)
      } else {
        for (const c of conditions[key]) {
          if (typeof c !== 'string' || c.length === 0) {
            errors.push(`conditions.${key} contient une valeur invalide : « ${c} »`)
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valide un FeatureDescriptor complet.
 * Retourne un objet { valid, errors } pour un reporting détaillé.
 *
 * @param {*} feature - L'objet à valider
 * @param {{ strict: boolean }} [options] - En mode strict, les champs optionnels
 *   doivent être présents (utile pour les données enrichies vague 3)
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFeatureDescriptor(feature, options = {}) {
  const errors = []
  const strict = options.strict === true

  if (!feature || typeof feature !== 'object' || Array.isArray(feature)) {
    return { valid: false, errors: ['feature doit être un objet non-null'] }
  }

  // ── Champs obligatoires ──
  if (typeof feature.name !== 'string' || feature.name.trim().length === 0) {
    errors.push('name est requis (string non vide)')
  }
  if (typeof feature.description !== 'string' || feature.description.trim().length === 0) {
    errors.push('description est requis (string non vide)')
  }
  if (!Array.isArray(feature.tags) || feature.tags.length === 0) {
    errors.push('tags est requis (tableau non vide)')
  } else if (!validateTags(feature.tags)) {
    errors.push(`tags contient des valeurs invalides : ${feature.tags.join(', ')} (attendu : ${ALL_TAGS.join(', ')})`)
  }

  // ── Champs optionnels avec validation si présents ──

  // activationType
  if (feature.activationType !== undefined && feature.activationType !== null) {
    if (!ACTIVATION_TYPES.includes(feature.activationType)) {
      errors.push(`activationType invalide : « ${feature.activationType} » (attendu : ${ACTIVATION_TYPES.join(', ')})`)
    }
  } else if (strict) {
    errors.push('activationType est requis en mode strict')
  }

  // cost
  const costResult = validateCost(feature.cost)
  if (!costResult.valid) errors.push(...costResult.errors)
  if (strict && feature.cost === undefined) {
    errors.push('cost est requis en mode strict')
  }

  // trait
  if (feature.trait !== undefined && feature.trait !== null) {
    if (!FEATURE_TRAITS.includes(feature.trait)) {
      errors.push(`trait invalide : « ${feature.trait} » (attendu : ${FEATURE_TRAITS.join(', ')})`)
    }
  }

  // range
  if (feature.range !== undefined && feature.range !== null) {
    if (!RANGE_VALUES.includes(feature.range)) {
      errors.push(`range invalide : « ${feature.range} » (attendu : ${RANGE_VALUES.join(', ')})`)
    }
  }

  // frequency
  if (feature.frequency !== undefined && feature.frequency !== null) {
    if (!FREQUENCY_VALUES.includes(feature.frequency)) {
      errors.push(`frequency invalide : « ${feature.frequency} » (attendu : ${FREQUENCY_VALUES.join(', ')})`)
    }
  }

  // conditions
  const condResult = validateConditions(feature.conditions)
  if (!condResult.valid) errors.push(...condResult.errors)

  // trigger (pour les réactions)
  if (feature.trigger !== undefined && feature.trigger !== null) {
    if (typeof feature.trigger !== 'string') {
      errors.push('trigger doit être une string')
    }
  }

  return { valid: errors.length === 0, errors }
}

// ═══════════════════════════════════════════════════════════
//  Normalisation
// ═══════════════════════════════════════════════════════════

/**
 * Normalise une portée depuis les formats hérités.
 * @param {string|null|undefined} range
 * @returns {string|null}
 */
export function normalizeRange(range) {
  if (range === null || range === undefined) return null
  return RANGE_ALIASES[range] ?? null
}

/**
 * Tente d'extraire un coût structuré depuis un texte libre.
 * Gère les formulations SRD courantes :
 *  - « Cochez un Stress » / « Mark a Stress » → { type: 'stress', amount: 1 }
 *  - « Dépensez une Peur » / « Spend a Fear »  → { type: 'fear', amount: 1 }
 *  - « Dépensez 3 Espoir » / « Spend 3 Hope »  → { type: 'hope', amount: 3 }
 *  - « Cochez un Emplacement d'armure »         → { type: 'armor', amount: 1 }
 *
 * @param {string|null|undefined} text
 * @returns {{ type: string, amount: number }|null}
 */
export function parseCostFromText(text) {
  if (!text || typeof text !== 'string') return null

  const lower = text.toLowerCase()

  // Peur / Fear
  const fearMatch = lower.match(/(?:dépensez|spend)\s+(\d+)?\s*(?:une?\s+|a\s+)?(?:peur|fear)/i)
  if (fearMatch) return { type: 'fear', amount: parseInt(fearMatch[1], 10) || 1 }

  // Espoir / Hope
  const hopeMatch = lower.match(/(?:dépensez|spend)\s+(\d+)?\s*(?:une?\s+|a\s+)?(?:espoir|hope)/i)
  if (hopeMatch) return { type: 'hope', amount: parseInt(hopeMatch[1], 10) || 1 }

  // Stress (cocher / mark)
  const stressMatch = lower.match(/(?:cochez|marquez|mark)\s+(\d+)?\s*(?:une?\s+|a\s+)?stress/i)
  if (stressMatch) return { type: 'stress', amount: parseInt(stressMatch[1], 10) || 1 }

  // Emplacement d'armure / Armor Slot
  const armorMatch = lower.match(/(?:cochez|marquez|mark)\s+(\d+)?\s*(?:une?\s+|an?\s+)?(?:emplacement|armor\s*slot)/i)
  if (armorMatch) return { type: 'armor', amount: parseInt(armorMatch[1], 10) || 1 }

  return null
}

/**
 * Normalise n'importe quel format de feature vers un FeatureDescriptor.
 *
 * Formats supportés :
 *  1. FeatureDescriptor complet   → retourné tel quel (avec defaults)
 *  2. Objet adversaire/env        → { name, type, description, tags, cost? }
 *  3. Objet ancestry/communauté   → { name, description, tags }
 *  4. String brut (classes)        → « Name : description »
 *  5. Objet domain card            → { name, feature (string), tags }
 *
 * @param {Object|string} input         - La feature à normaliser
 * @param {Object}        [context={}]  - Contexte additionnel
 * @param {string[]}      [context.tags]  - Tags par défaut si absents
 * @param {string}        [context.activationType] - Type d'activation par défaut
 * @param {string}        [context.source] - Source (pour traçabilité)
 * @returns {Object} FeatureDescriptor normalisé
 */
export function normalizeFeature(input, context = {}) {
  // Cas 4 : string brut « Name : description »
  if (typeof input === 'string') {
    const colonIndex = input.indexOf(':')
    let name, description
    if (colonIndex > 0 && colonIndex < 60) {
      name = input.substring(0, colonIndex).trim()
      description = input.substring(colonIndex + 1).trim()
    } else {
      name = input.substring(0, 40).trim()
      description = input
    }

    return buildDescriptor({
      name,
      description,
      tags: context.tags || [],
      activationType: context.activationType || null,
      source: context.source || null
    })
  }

  if (!input || typeof input !== 'object') {
    return buildDescriptor({
      name: 'Inconnu',
      description: '',
      tags: context.tags || [],
      source: context.source || null
    })
  }

  // Cas 5 : domain card avec champ « feature » en string
  if (typeof input.feature === 'string' && input.name && input.tags) {
    return buildDescriptor({
      name: input.name,
      description: input.feature,
      tags: input.tags,
      activationType: context.activationType || null,
      source: context.source || 'domainCard'
    })
  }

  // Cas 2 : adversaire/environnement avec champ « type » pour activationType
  // Cas 3 : ancestry/communauté avec { name, description, tags }
  // Cas 1 : FeatureDescriptor déjà formé
  const activationType = input.activationType
    || (ACTIVATION_TYPES.includes(input.type) ? input.type : null)
    || context.activationType
    || null

  // Extraire le coût depuis le champ cost structuré ou texte
  let cost = null
  if (input.cost && typeof input.cost === 'object' && input.cost.type) {
    cost = input.cost
  } else if (typeof input.cost === 'string') {
    cost = parseCostFromText(input.cost)
  } else if (typeof input.fearCost === 'number' && input.fearCost > 0) {
    cost = { type: 'fear', amount: input.fearCost }
  }

  // Extraire la portée en normalisant
  const range = normalizeRange(input.range) || null

  return buildDescriptor({
    name: input.name || 'Inconnu',
    description: input.description || '',
    tags: input.tags || context.tags || [],
    activationType,
    cost,
    trait: input.trait && FEATURE_TRAITS.includes(input.trait) ? input.trait : (input.trait || null),
    range,
    frequency: input.frequency && FREQUENCY_VALUES.includes(input.frequency) ? input.frequency : null,
    conditions: input.conditions || null,
    trigger: input.trigger || null,
    source: input.source || context.source || null
  })
}

/**
 * Construit un FeatureDescriptor avec des defaults sûrs.
 * @param {Object} fields
 * @returns {Object} FeatureDescriptor
 */
function buildDescriptor(fields) {
  return {
    name: fields.name || 'Inconnu',
    description: fields.description || '',
    tags: Array.isArray(fields.tags) && fields.tags.length > 0 ? [...fields.tags] : [],
    activationType: fields.activationType || null,
    cost: fields.cost || null,
    trait: fields.trait || null,
    range: fields.range || null,
    frequency: fields.frequency || null,
    conditions: fields.conditions || null,
    trigger: fields.trigger || null,
    source: fields.source || null
  }
}
