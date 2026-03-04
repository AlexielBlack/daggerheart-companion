/**
 * @module equipment/classRecommendations
 * @description Recommandations d'équipement de départ par classe — SRD Daggerheart.
 * Source : CharacterSheets_SRD.pdf (fiches personnage de chaque classe)
 *
 * Chaque classe possède : arme primaire suggérée, arme secondaire suggérée (optionnelle),
 * armure suggérée, et consommables de départ (Potion mineure de santé OU de vigueur).
 *
 * Les IDs correspondent aux données de src/data/equipment/.
 */

export const CLASS_EQUIPMENT_RECOMMENDATIONS = {
  // ═══ Classes SRD ═══
  guardian: {
    primaryWeapon: ['battleaxe-t1'],
    secondaryWeapon: [],
    armor: ['chainmail-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08'] // Minor Health Potion OU Minor Stamina Potion
  },
  seraph: {
    primaryWeapon: ['hallowed-axe-t1'],
    secondaryWeapon: ['round-shield-t1'],
    armor: ['chainmail-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  warrior: {
    primaryWeapon: ['longsword-t1'],
    secondaryWeapon: [],
    armor: ['chainmail-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  rogue: {
    primaryWeapon: ['dagger-t1'],
    secondaryWeapon: ['small-dagger-t1'],
    armor: ['gambeson-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  bard: {
    primaryWeapon: ['rapier-t1'],
    secondaryWeapon: ['small-dagger-t1'],
    armor: ['gambeson-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  druid: {
    primaryWeapon: ['shortstaff-t1'],
    secondaryWeapon: ['round-shield-t1'],
    armor: ['leather-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  ranger: {
    primaryWeapon: ['shortbow-t1'],
    secondaryWeapon: [],
    armor: ['leather-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  wizard: {
    primaryWeapon: ['greatstaff-t1'],
    secondaryWeapon: [],
    armor: ['leather-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  sorcerer: {
    primaryWeapon: ['dualstaff-t1'],
    secondaryWeapon: [],
    armor: ['gambeson-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },

  // ═══ Classes personnalisées ═══
  assassin: {
    primaryWeapon: ['broadsword-t1'],
    secondaryWeapon: ['shortsword-t1'],
    armor: ['leather-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  },
  duellist: {
    primaryWeapon: ['rapier-t1'],
    secondaryWeapon: ['small-dagger-t1'],
    armor: ['leather-t1'],
    loot: [],
    consumable: ['cons-07', 'cons-08']
  }
}

/**
 * Retourne les IDs recommandés pour une classe et un type d'équipement.
 * @param {string} classId
 * @param {string} equipType - 'primaryWeapon' | 'secondaryWeapon' | 'armor' | 'loot' | 'consumable'
 * @returns {string[]}
 */
export function getRecommendedIds(classId, equipType) {
  const recs = CLASS_EQUIPMENT_RECOMMENDATIONS[classId]
  if (!recs) return []
  return recs[equipType] || []
}

/**
 * Vérifie si un item est recommandé pour une classe donnée.
 * @param {string} classId
 * @param {string} equipType
 * @param {string} itemId
 * @returns {boolean}
 */
export function isRecommended(classId, equipType, itemId) {
  return getRecommendedIds(classId, equipType).includes(itemId)
}
