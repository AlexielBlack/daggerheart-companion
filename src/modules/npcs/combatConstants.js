/**
 * @module npcs/combatConstants
 * @description Constantes de combat pour les PNJs.
 *
 * Couvre :
 *  - Types d'adversaire SRD (Bruiser, Leader, etc.)
 *  - Thèmes de features (humanoïde, bestial, etc.)
 *  - Conditions étendues (standard + spéciales SRD)
 *  - Proficiency par tier (fourchette ajustable)
 *  - Modes de profil combat (lié, custom, aucun)
 *  - Cooldowns alliés (conversion Hope/Fear → cooldown)
 *  - Countdowns (modèle de données)
 */

// ═══════════════════════════════════════════════════════════
//  Types d'adversaire SRD
// ═══════════════════════════════════════════════════════════

export const ADVERSARY_TYPE_BRUISER = 'bruiser'
export const ADVERSARY_TYPE_HORDE = 'horde'
export const ADVERSARY_TYPE_LEADER = 'leader'
export const ADVERSARY_TYPE_MINION = 'minion'
export const ADVERSARY_TYPE_RANGED = 'ranged'
export const ADVERSARY_TYPE_SKULK = 'skulk'
export const ADVERSARY_TYPE_SOCIAL = 'social'
export const ADVERSARY_TYPE_SOLO = 'solo'
export const ADVERSARY_TYPE_STANDARD = 'standard'
export const ADVERSARY_TYPE_SUPPORT = 'support'

export const ALL_ADVERSARY_TYPES = [
  ADVERSARY_TYPE_BRUISER,
  ADVERSARY_TYPE_HORDE,
  ADVERSARY_TYPE_LEADER,
  ADVERSARY_TYPE_MINION,
  ADVERSARY_TYPE_RANGED,
  ADVERSARY_TYPE_SKULK,
  ADVERSARY_TYPE_SOCIAL,
  ADVERSARY_TYPE_SOLO,
  ADVERSARY_TYPE_STANDARD,
  ADVERSARY_TYPE_SUPPORT
]

export const ADVERSARY_TYPE_META = {
  [ADVERSARY_TYPE_BRUISER]: {
    label: 'Cogneur',
    labelEn: 'Bruiser',
    emoji: '💥',
    description: 'Résistant et frappe fort'
  },
  [ADVERSARY_TYPE_HORDE]: {
    label: 'Horde',
    labelEn: 'Horde',
    emoji: '🐺',
    description: 'Groupe de créatures identiques agissant ensemble'
  },
  [ADVERSARY_TYPE_LEADER]: {
    label: 'Meneur',
    labelEn: 'Leader',
    emoji: '👑',
    description: 'Commande et invoque d\'autres adversaires'
  },
  [ADVERSARY_TYPE_MINION]: {
    label: 'Sbire',
    labelEn: 'Minion',
    emoji: '💀',
    description: 'Facile à éliminer mais dangereux en nombre'
  },
  [ADVERSARY_TYPE_RANGED]: {
    label: 'Tireur',
    labelEn: 'Ranged',
    emoji: '🏹',
    description: 'Fragile au contact mais attaque à distance'
  },
  [ADVERSARY_TYPE_SKULK]: {
    label: 'Rôdeur',
    labelEn: 'Skulk',
    emoji: '🗡️',
    description: 'Manœuvre et exploite les ouvertures'
  },
  [ADVERSARY_TYPE_SOCIAL]: {
    label: 'Social',
    labelEn: 'Social',
    emoji: '🎭',
    description: 'Défis à résoudre par la conversation'
  },
  [ADVERSARY_TYPE_SOLO]: {
    label: 'Solo',
    labelEn: 'Solo',
    emoji: '🐉',
    description: 'Menace redoutable pour tout un groupe'
  },
  [ADVERSARY_TYPE_STANDARD]: {
    label: 'Standard',
    labelEn: 'Standard',
    emoji: '⚔️',
    description: 'Combattant de base représentatif de sa faction'
  },
  [ADVERSARY_TYPE_SUPPORT]: {
    label: 'Soutien',
    labelEn: 'Support',
    emoji: '🛡️',
    description: 'Renforce ses alliés et perturbe ses adversaires'
  }
}

// ═══════════════════════════════════════════════════════════
//  Thèmes de features
// ═══════════════════════════════════════════════════════════

export const THEME_HUMANOID = 'humanoid'
export const THEME_BESTIAL = 'bestial'
export const THEME_UNDEAD = 'undead'
export const THEME_ELEMENTAL = 'elemental'
export const THEME_MONSTROUS = 'monstrous'
export const THEME_SOCIAL_INTRIGUE = 'socialIntrigue'

export const ALL_THEMES = [
  THEME_HUMANOID,
  THEME_BESTIAL,
  THEME_UNDEAD,
  THEME_ELEMENTAL,
  THEME_MONSTROUS,
  THEME_SOCIAL_INTRIGUE
]

export const THEME_META = {
  [THEME_HUMANOID]: {
    label: 'Humanoïde',
    emoji: '🧑',
    description: 'Bandits, gardes, assassins, soldats, nobles',
    examples: 'Coups d\'épée, tactiques de groupe, commandement'
  },
  [THEME_BESTIAL]: {
    label: 'Bestial',
    emoji: '🐻',
    description: 'Ours, loups, scorpions, serpents',
    examples: 'Morsures, griffes, charges, instinct de meute'
  },
  [THEME_UNDEAD]: {
    label: 'Mort-vivant',
    emoji: '🧟',
    description: 'Zombies, squelettes, spectres',
    examples: 'Résistances spéciales, peur, drain'
  },
  [THEME_ELEMENTAL]: {
    label: 'Élémentaire',
    emoji: '🔥',
    description: 'Élémentaires, chaos skulls, démons',
    examples: 'Magie brute, formes alternatives, résistances magiques'
  },
  [THEME_MONSTROUS]: {
    label: 'Monstrueux',
    emoji: '👹',
    description: 'Ogres, treants, oozes, expériences ratées',
    examples: 'Capacités physiques extrêmes, formes uniques'
  },
  [THEME_SOCIAL_INTRIGUE]: {
    label: 'Social / Intrigue',
    emoji: '🎩',
    description: 'Courtisans, marchands, nobles manipulateurs',
    examples: 'Manipulation, négociation, influence'
  }
}

// ═══════════════════════════════════════════════════════════
//  Conditions étendues
// ═══════════════════════════════════════════════════════════

/** Conditions standard du SRD (déjà dans featureSchema) */
export const CONDITION_VULNERABLE = 'vulnerable'
export const CONDITION_RESTRAINED = 'restrained'
export const CONDITION_HIDDEN = 'hidden'

/** Conditions spéciales fréquentes dans les stat blocks SRD */
export const CONDITION_STUNNED = 'stunned'
export const CONDITION_CURSED = 'cursed'
export const CONDITION_ENRAPTURED = 'enraptured'
export const CONDITION_HORRIFIED = 'horrified'
export const CONDITION_INVISIBLE = 'invisible'

export const STANDARD_CONDITIONS = [
  CONDITION_VULNERABLE,
  CONDITION_RESTRAINED,
  CONDITION_HIDDEN
]

export const SPECIAL_CONDITIONS = [
  CONDITION_STUNNED,
  CONDITION_CURSED,
  CONDITION_ENRAPTURED,
  CONDITION_HORRIFIED,
  CONDITION_INVISIBLE
]

export const ALL_CONDITIONS = [...STANDARD_CONDITIONS, ...SPECIAL_CONDITIONS]

export const CONDITION_META = {
  [CONDITION_VULNERABLE]: {
    label: 'Vulnérable',
    emoji: '⚠️',
    description: 'Jets contre cette cible avec avantage',
    temporary: true
  },
  [CONDITION_RESTRAINED]: {
    label: 'Entravé',
    emoji: '⛓️',
    description: 'Ne peut pas se déplacer, peut agir sur place',
    temporary: true
  },
  [CONDITION_HIDDEN]: {
    label: 'Caché',
    emoji: '👤',
    description: 'Jets contre cette cible avec désavantage',
    temporary: false
  },
  [CONDITION_STUNNED]: {
    label: 'Étourdi',
    emoji: '💫',
    description: 'Ne peut pas utiliser de réactions ni agir',
    temporary: true
  },
  [CONDITION_CURSED]: {
    label: 'Maudit',
    emoji: '🔮',
    description: 'Effet variable selon la source de la malédiction',
    temporary: true
  },
  [CONDITION_ENRAPTURED]: {
    label: 'Captivé',
    emoji: '😵',
    description: 'Attention fixée, champ de vision réduit',
    temporary: true
  },
  [CONDITION_HORRIFIED]: {
    label: 'Horrifié',
    emoji: '😱',
    description: 'Vulnérable, envahi par la terreur',
    temporary: true
  },
  [CONDITION_INVISIBLE]: {
    label: 'Invisible',
    emoji: '👻',
    description: 'Attaques contre la cible avec désavantage',
    temporary: true
  }
}

// ═══════════════════════════════════════════════════════════
//  Proficiency par tier
// ═══════════════════════════════════════════════════════════

/**
 * Fourchette de Proficiency par tier pour les PNJs.
 * Tier 1 = 1, Tier 2 = 2, Tier 3 = 3-4, Tier 4 = 5-6.
 */
export const PROFICIENCY_BY_TIER = {
  1: { min: 1, max: 1, default: 1 },
  2: { min: 2, max: 2, default: 2 },
  3: { min: 3, max: 4, default: 3 },
  4: { min: 5, max: 6, default: 5 }
}

/**
 * Benchmarks de stat adversaire par tier (tiré du SRD).
 */
export const TIER_BENCHMARKS = {
  1: { attackModifier: 1, difficulty: 11, thresholds: { major: 7, severe: 12 } },
  2: { attackModifier: 2, difficulty: 14, thresholds: { major: 10, severe: 20 } },
  3: { attackModifier: 3, difficulty: 17, thresholds: { major: 20, severe: 32 } },
  4: { attackModifier: 4, difficulty: 20, thresholds: { major: 25, severe: 45 } }
}

// ═══════════════════════════════════════════════════════════
//  Modes de profil combat
// ═══════════════════════════════════════════════════════════

/** Profil combat lié à un adversaire existant */
export const COMBAT_PROFILE_LINKED = 'linked'
/** Profil combat custom (features piochées dans le catalogue) */
export const COMBAT_PROFILE_CUSTOM = 'custom'
/** Pas de profil combat (PNJ non-combattant) */
export const COMBAT_PROFILE_NONE = 'none'

export const ALL_COMBAT_PROFILES = [
  COMBAT_PROFILE_NONE,
  COMBAT_PROFILE_LINKED,
  COMBAT_PROFILE_CUSTOM
]

export const COMBAT_PROFILE_META = {
  [COMBAT_PROFILE_NONE]: {
    label: 'Aucun',
    emoji: '🚫',
    description: 'PNJ non-combattant'
  },
  [COMBAT_PROFILE_LINKED]: {
    label: 'Lié à un adversaire',
    emoji: '🔗',
    description: 'Utilise le stat block d\'un adversaire SRD ou homebrew'
  },
  [COMBAT_PROFILE_CUSTOM]: {
    label: 'Profil custom',
    emoji: '🛠️',
    description: 'Features piochées dans le catalogue de combat'
  }
}

// ═══════════════════════════════════════════════════════════
//  Cooldowns alliés
// ═══════════════════════════════════════════════════════════

/**
 * Systéme de cooldown pour les PNJs alliés.
 * Remplace le coût Hope/Fear par un cooldown entre utilisations.
 */
export const COOLDOWN_NONE = 'none'
export const COOLDOWN_2_SPOTLIGHTS = '2_spotlights'
export const COOLDOWN_PER_SCENE = 'per_scene'
export const COOLDOWN_PER_REST = 'per_rest'
export const COOLDOWN_PER_LONG_REST = 'per_long_rest'

export const ALL_COOLDOWNS = [
  COOLDOWN_NONE,
  COOLDOWN_2_SPOTLIGHTS,
  COOLDOWN_PER_SCENE,
  COOLDOWN_PER_REST,
  COOLDOWN_PER_LONG_REST
]

export const COOLDOWN_META = {
  [COOLDOWN_NONE]: { label: 'Aucun', emoji: '♻️', description: 'Utilisable à chaque spotlight' },
  [COOLDOWN_2_SPOTLIGHTS]: { label: '2 spotlights', emoji: '⏳', description: 'Disponible après 2 spotlights alliés' },
  [COOLDOWN_PER_SCENE]: { label: 'Par scène', emoji: '🎬', description: 'Une fois par scène' },
  [COOLDOWN_PER_REST]: { label: 'Par repos', emoji: '⏸️', description: 'Une fois par repos (court ou long)' },
  [COOLDOWN_PER_LONG_REST]: { label: 'Par repos long', emoji: '🌙', description: 'Une fois par repos long' }
}

/**
 * Calcule le cooldown allié à partir du coût d'origine et de la fréquence SRD.
 * Si une fréquence SRD est déjà définie, elle prend le dessus.
 *
 * @param {{ type: string, amount: number }|null} cost - Coût d'origine
 * @param {string|null} frequency - Fréquence SRD (atWill, oncePerShortRest, etc.)
 * @returns {string} Cooldown allié calculé
 */
export function computeAllyCooldown(cost, frequency) {
  // Les fréquences SRD intégrées prennent le dessus
  if (frequency === 'oncePerLongRest') return COOLDOWN_PER_LONG_REST
  if (frequency === 'oncePerShortRest') return COOLDOWN_PER_REST
  if (frequency === 'oncePerSession') return COOLDOWN_PER_SCENE

  // Sinon, calcul basé sur le coût
  if (!cost || cost.type === 'free') return COOLDOWN_NONE
  if (cost.type === 'stress' && cost.amount <= 1) return COOLDOWN_NONE

  // Hope ou Fear ≥ 2, ou stress ≥ 2 → grosse feature
  if (cost.amount >= 2) return COOLDOWN_PER_SCENE

  // Hope ou Fear = 1 → feature intermédiaire
  return COOLDOWN_2_SPOTLIGHTS
}

/**
 * Calcule la résolution de coût pour un PNJ ennemi.
 * Hope → Fear, Fear reste Fear, Stress reste Stress, Free reste Free.
 *
 * @param {{ type: string, amount: number }|null} cost
 * @returns {{ type: string, amount: number }|null}
 */
export function computeEnemyResolution(cost) {
  if (!cost) return null
  if (cost.type === 'hope') return { type: 'fear', amount: cost.amount }
  return { ...cost }
}

// ═══════════════════════════════════════════════════════════
//  Countdowns
// ═══════════════════════════════════════════════════════════

/**
 * Crée un objet Countdown par défaut.
 * @param {Partial<object>} overrides
 * @returns {{ value: number, loop: boolean, current: number }}
 */
export function createCountdown(overrides = {}) {
  return {
    value: overrides.value || 6,
    loop: overrides.loop || false,
    current: overrides.current ?? overrides.value ?? 6
  }
}

// ═══════════════════════════════════════════════════════════
//  Combat Feature — Modèle de données
// ═══════════════════════════════════════════════════════════

/** Sources possibles d'une combat feature */
export const FEATURE_SOURCE_ADVERSARY = 'adversary'
export const FEATURE_SOURCE_DOMAIN = 'domain_card'
export const FEATURE_SOURCE_HOMEBREW = 'homebrew'

export const ALL_FEATURE_SOURCES = [
  FEATURE_SOURCE_ADVERSARY,
  FEATURE_SOURCE_DOMAIN,
  FEATURE_SOURCE_HOMEBREW
]

/**
 * Crée un objet CombatFeature par défaut.
 * @param {Partial<object>} overrides
 * @returns {object} CombatFeature
 */
export function createCombatFeature(overrides = {}) {
  return {
    id: overrides.id || '',
    name: overrides.name || '',
    description: overrides.description || '',

    // Classification
    source: overrides.source || FEATURE_SOURCE_HOMEBREW,
    sourceRef: overrides.sourceRef || null,
    activationType: overrides.activationType || 'action',
    tier: overrides.tier || 1,
    tags: Array.isArray(overrides.tags) ? [...overrides.tags] : [],
    themes: Array.isArray(overrides.themes) ? [...overrides.themes] : [],
    adversaryTypes: Array.isArray(overrides.adversaryTypes) ? [...overrides.adversaryTypes] : [],

    // Coût & résolution
    cost: overrides.cost || { type: 'free', amount: 0 },
    frequency: overrides.frequency || null,
    allyCooldown: overrides.allyCooldown || null,

    // Mécanique
    countdown: overrides.countdown || null,
    conditions: overrides.conditions || null,
    range: overrides.range || null,
    trigger: overrides.trigger || null,
    trait: overrides.trait || null,
    damageFormula: overrides.damageFormula || null,
    damageType: overrides.damageType || null
  }
}

// ═══════════════════════════════════════════════════════════
//  Validation
// ═══════════════════════════════════════════════════════════

/**
 * Valide un type d'adversaire.
 * @param {string} type
 * @returns {boolean}
 */
export function isValidAdversaryType(type) {
  return ALL_ADVERSARY_TYPES.includes(type)
}

/**
 * Valide un thème.
 * @param {string} theme
 * @returns {boolean}
 */
export function isValidTheme(theme) {
  return ALL_THEMES.includes(theme)
}

/**
 * Valide une condition.
 * @param {string} condition
 * @returns {boolean}
 */
export function isValidCondition(condition) {
  return ALL_CONDITIONS.includes(condition)
}

/**
 * Valide un mode de profil combat.
 * @param {string} mode
 * @returns {boolean}
 */
export function isValidCombatProfile(mode) {
  return ALL_COMBAT_PROFILES.includes(mode)
}

/**
 * Valide un cooldown allié.
 * @param {string} cooldown
 * @returns {boolean}
 */
export function isValidCooldown(cooldown) {
  return ALL_COOLDOWNS.includes(cooldown)
}

/**
 * Valide un tier (1-4).
 * @param {number} tier
 * @returns {boolean}
 */
export function isValidTier(tier) {
  return Number.isInteger(tier) && tier >= 1 && tier <= 4
}

/**
 * Valide une proficiency pour un tier donné.
 * @param {number} proficiency
 * @param {number} tier
 * @returns {boolean}
 */
export function isValidProficiency(proficiency, tier) {
  if (!isValidTier(tier)) return false
  const range = PROFICIENCY_BY_TIER[tier]
  return Number.isInteger(proficiency) && proficiency >= range.min && proficiency <= range.max
}

/**
 * Valide un objet CombatFeature.
 * @param {object} feature
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCombatFeature(feature) {
  const errors = []

  if (!feature || typeof feature !== 'object') {
    return { valid: false, errors: ['feature doit être un objet non-null'] }
  }

  if (!feature.id || typeof feature.id !== 'string') {
    errors.push('id est requis (string non vide)')
  }
  if (!feature.name || typeof feature.name !== 'string') {
    errors.push('name est requis (string non vide)')
  }
  if (!feature.description || typeof feature.description !== 'string') {
    errors.push('description est requis (string non vide)')
  }

  if (!ALL_FEATURE_SOURCES.includes(feature.source)) {
    errors.push(`source invalide : « ${feature.source} »`)
  }

  if (!['passive', 'action', 'reaction'].includes(feature.activationType)) {
    errors.push(`activationType invalide : « ${feature.activationType} »`)
  }

  if (!isValidTier(feature.tier)) {
    errors.push(`tier invalide : ${feature.tier} (attendu 1-4)`)
  }

  if (!Array.isArray(feature.tags)) {
    errors.push('tags doit être un tableau')
  }

  if (!Array.isArray(feature.themes)) {
    errors.push('themes doit être un tableau')
  } else {
    for (const t of feature.themes) {
      if (!isValidTheme(t)) {
        errors.push(`thème invalide : « ${t} »`)
      }
    }
  }

  if (feature.adversaryTypes !== undefined && feature.adversaryTypes !== null) {
    if (!Array.isArray(feature.adversaryTypes)) {
      errors.push('adversaryTypes doit être un tableau')
    } else {
      for (const at of feature.adversaryTypes) {
        if (!isValidAdversaryType(at)) {
          errors.push(`type d'adversaire invalide : « ${at} »`)
        }
      }
    }
  }

  // Coût
  if (feature.cost) {
    if (typeof feature.cost !== 'object' || !feature.cost.type) {
      errors.push('cost doit être un objet { type, amount }')
    }
  }

  // Countdown
  if (feature.countdown) {
    if (typeof feature.countdown !== 'object') {
      errors.push('countdown doit être un objet { value, loop }')
    } else {
      if (typeof feature.countdown.value !== 'number' || feature.countdown.value < 1) {
        errors.push('countdown.value doit être un nombre ≥ 1')
      }
      if (typeof feature.countdown.loop !== 'boolean') {
        errors.push('countdown.loop doit être un booléen')
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
