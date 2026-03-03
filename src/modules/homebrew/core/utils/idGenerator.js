/**
 * @module homebrew/core/utils/idGenerator
 * @description Génération d'identifiants uniques pour le contenu homebrew.
 *
 * Format : `{prefix}-{slug}-{timestamp36}`
 * Exemple : `adv-dragon-de-givre-m5k8r2`
 *
 * Le slug est dérivé du nom pour faciliter la lecture dans le stockage,
 * le timestamp base36 garantit l'unicité.
 */

/**
 * Préfixes par catégorie de contenu homebrew.
 * @readonly
 * @enum {string}
 */
export const CATEGORY_PREFIXES = Object.freeze({
  adversary: 'adv',
  environment: 'env',
  ancestry: 'anc',
  community: 'com',
  domain: 'dom',
  class: 'cls',
  equipment: 'eqp'
})

/**
 * Transforme un nom en slug URL-friendly.
 * Supprime les accents, caractères spéciaux, espaces multiples.
 *
 * @param {string} name - Nom à transformer
 * @param {number} [maxLength=30] - Longueur max du slug
 * @returns {string} Slug normalisé
 */
export function slugify(name, maxLength = 30) {
  if (!name || typeof name !== 'string') {
    return 'unnamed'
  }

  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength) || 'unnamed'
}

/**
 * Génère un suffixe unique basé sur le timestamp + aléatoire en base36.
 * @returns {string} Suffixe de 8 caractères
 */
function uniqueSuffix() {
  const time = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 6)
  return `${time.slice(-4)}${rand}`
}

/**
 * Génère un identifiant unique pour un item homebrew.
 *
 * @param {string} category - Clé de catégorie (ex: 'adversary')
 * @param {string} [name=''] - Nom de l'item (utilisé pour le slug)
 * @returns {string} Identifiant unique (ex: 'adv-dragon-m5k8r2ab')
 * @throws {Error} Si la catégorie est inconnue
 */
export function generateId(category, name = '') {
  const prefix = CATEGORY_PREFIXES[category]
  if (!prefix) {
    throw new Error(
      `Catégorie inconnue : "${category}". ` +
      `Catégories valides : ${Object.keys(CATEGORY_PREFIXES).join(', ')}`
    )
  }

  const slug = slugify(name)
  const suffix = uniqueSuffix()

  return `${prefix}-${slug}-${suffix}`
}

/**
 * Extrait la catégorie d'un ID homebrew à partir de son préfixe.
 *
 * @param {string} id - Identifiant homebrew
 * @returns {string|null} Clé de catégorie ou null si non reconnu
 */
export function getCategoryFromId(id) {
  if (!id || typeof id !== 'string') {
    return null
  }

  const prefix = id.split('-')[0]
  const entry = Object.entries(CATEGORY_PREFIXES)
    .find(([_key, val]) => val === prefix)

  return entry ? entry[0] : null
}

/**
 * Vérifie si un identifiant est un ID homebrew valide.
 *
 * @param {string} id
 * @returns {boolean}
 */
export function isHomebrewId(id) {
  return getCategoryFromId(id) !== null
}
