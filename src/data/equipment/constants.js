/**
 * @module equipment/constants
 * @description Constantes partagées pour l'équipement Daggerheart SRD.
 */

/** Catégories d'équipement */
export const EQUIPMENT_CATEGORIES = {
  primaryWeapon: 'Arme Primaire',
  secondaryWeapon: 'Arme Secondaire',
  armor: 'Armure',
  loot: 'Loot',
  consumable: 'Consommable'
}

/** Types de dégâts */
export const DAMAGE_TYPES = {
  phy: 'Physique',
  mag: 'Magique'
}

/** Portées SRD */
export const RANGES = {
  Melee: 'Mêlée',
  'Very Close': 'Très Proche',
  Close: 'Proche',
  Far: 'Loin',
  'Very Far': 'Très Loin'
}

/** Tiers de jeu */
export const TIERS = {
  1: { label: 'Tier 1', levels: '1' },
  2: { label: 'Tier 2', levels: '2–4' },
  3: { label: 'Tier 3', levels: '5–7' },
  4: { label: 'Tier 4', levels: '8–10' }
}

/** Burden (mains occupées) */
export const BURDENS = {
  'One-Handed': 'Une main',
  'Two-Handed': 'Deux mains'
}

/** Raretés de loot/consommables */
export const RARITIES = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  legendary: 'Légendaire'
}

/** Plages de roll par rareté */
export const RARITY_RANGES = {
  common: { min: 1, max: 12, dice: '1d12' },
  uncommon: { min: 13, max: 24, dice: '2d12' },
  rare: { min: 25, max: 36, dice: '3d12' },
  legendary: { min: 37, max: 60, dice: '4d12' }
}

/**
 * Déduit la rareté d'un roll.
 * @param {number} roll
 * @returns {string}
 */
export function getRarityFromRoll(roll) {
  if (roll <= 12) return 'common'
  if (roll <= 24) return 'uncommon'
  if (roll <= 36) return 'rare'
  return 'legendary'
}
