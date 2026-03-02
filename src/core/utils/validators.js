/**
 * Validation de données pour les modèles Daggerheart.
 * Utilisé pour valider les JSON statiques et les données utilisateur.
 */

/**
 * Vérifie qu'un objet possède les clés requises.
 * @param {object} obj - Objet à valider
 * @param {string[]} requiredKeys - Clés obligatoires
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequiredKeys(obj, requiredKeys) {
  if (!obj || typeof obj !== 'object') {
    return { valid: false, missing: requiredKeys }
  }
  const missing = requiredKeys.filter((key) => !(key in obj))
  return { valid: missing.length === 0, missing }
}

const ADVERSARY_REQUIRED_KEYS = [
  'id', 'name', 'tier', 'type', 'difficulty', 'hp', 'stress'
]

/**
 * Valide un objet adversaire.
 * @param {object} adversary
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAdversary(adversary) {
  const errors = []
  const { valid, missing } = validateRequiredKeys(adversary, ADVERSARY_REQUIRED_KEYS)

  if (!valid) {
    errors.push(`Clés manquantes: ${missing.join(', ')}`)
  }

  if (adversary.tier && (adversary.tier < 1 || adversary.tier > 4)) {
    errors.push(`Tier invalide: ${adversary.tier} (doit être 1-4)`)
  }

  if (adversary.hp !== undefined && (!Number.isInteger(adversary.hp) || adversary.hp < 0)) {
    errors.push(`HP invalide: ${adversary.hp}`)
  }

  if (adversary.stress !== undefined && (!Number.isInteger(adversary.stress) || adversary.stress < 0)) {
    errors.push(`Stress invalide: ${adversary.stress}`)
  }

  if (adversary.difficulty !== undefined && (!Number.isInteger(adversary.difficulty) || adversary.difficulty < 1)) {
    errors.push(`Difficulté invalide: ${adversary.difficulty}`)
  }

  if (adversary.features && !Array.isArray(adversary.features)) {
    errors.push('Les features doivent être un tableau')
  }

  return { valid: errors.length === 0, errors }
}

const CHARACTER_REQUIRED_KEYS = [
  'id', 'name', 'ancestry', 'className', 'level', 'traits'
]

/**
 * Valide un objet personnage joueur.
 * @param {object} character
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCharacter(character) {
  const errors = []
  const { valid, missing } = validateRequiredKeys(character, CHARACTER_REQUIRED_KEYS)

  if (!valid) {
    errors.push(`Clés manquantes: ${missing.join(', ')}`)
  }

  if (character.level !== undefined && (!Number.isInteger(character.level) || character.level < 1 || character.level > 16)) {
    errors.push(`Niveau invalide: ${character.level} (doit être 1-16)`)
  }

  if (character.traits && typeof character.traits === 'object') {
    const traitKeys = ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge']
    for (const trait of traitKeys) {
      if (!(trait in character.traits)) {
        errors.push(`Trait manquant: ${trait}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Valide un objet rencontre.
 * @param {object} encounter
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateEncounter(encounter) {
  const errors = []
  const required = ['id', 'name']
  const { valid, missing } = validateRequiredKeys(encounter, required)

  if (!valid) {
    errors.push(`Clés manquantes: ${missing.join(', ')}`)
  }

  if (encounter.slots && !Array.isArray(encounter.slots)) {
    errors.push('Les slots doivent être un tableau')
  }

  if (encounter.tier && (encounter.tier < 1 || encounter.tier > 4)) {
    errors.push(`Tier invalide: ${encounter.tier}`)
  }

  return { valid: errors.length === 0, errors }
}
