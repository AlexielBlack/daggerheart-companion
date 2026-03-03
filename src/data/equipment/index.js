/**
 * @module equipment/data
 * @description Point d'entrée pour toutes les données d'équipement SRD Daggerheart.
 * Sources : SRD_EQUIPMENT.pdf, SRD_LOOTCONSUMABLES.pdf
 */

export {
  EQUIPMENT_CATEGORIES,
  DAMAGE_TYPES,
  RANGES,
  TIERS,
  BURDENS,
  RARITIES,
  RARITY_RANGES,
  getRarityFromRoll
} from './constants.js'

export {
  PRIMARY_WEAPONS,
  getPrimaryWeaponsByTier,
  getPrimaryWeaponsByDamageType,
  getPrimaryWeaponById
} from './primaryWeapons.js'

export {
  SECONDARY_WEAPONS,
  getSecondaryWeaponsByTier,
  getSecondaryWeaponById
} from './secondaryWeapons.js'

export {
  ARMOR,
  getArmorByTier,
  getArmorById
} from './armor.js'

export {
  LOOT,
  getLootByRarity,
  getLootByRoll,
  getLootById
} from './loot.js'

export {
  CONSUMABLES,
  getConsumablesByRarity,
  getConsumableByRoll,
  getConsumableById
} from './consumables.js'

// ─── Agrégats utilitaires ───

import { PRIMARY_WEAPONS } from './primaryWeapons.js'
import { SECONDARY_WEAPONS } from './secondaryWeapons.js'
import { ARMOR } from './armor.js'
import { LOOT } from './loot.js'
import { CONSUMABLES } from './consumables.js'

/** Toutes les armes (primaires + secondaires) */
export const ALL_WEAPONS = [...PRIMARY_WEAPONS, ...SECONDARY_WEAPONS]

/** Tout l'équipement combiné (armes + armures + loot + consommables) */
export const ALL_EQUIPMENT = [...PRIMARY_WEAPONS, ...SECONDARY_WEAPONS, ...ARMOR, ...LOOT, ...CONSUMABLES]

/**
 * Retourne n'importe quel équipement par ID (recherche globale).
 * @param {string} id
 * @returns {Object|null}
 */
export function getEquipmentById(id) {
  return ALL_EQUIPMENT.find((e) => e.id === id) || null
}

/**
 * Compteurs pour validation et affichage.
 */
export const EQUIPMENT_COUNTS = {
  primaryWeapons: PRIMARY_WEAPONS.length,
  secondaryWeapons: SECONDARY_WEAPONS.length,
  armor: ARMOR.length,
  loot: LOOT.length,
  consumables: CONSUMABLES.length,
  get total() {
    return this.primaryWeapons + this.secondaryWeapons + this.armor + this.loot + this.consumables
  }
}
