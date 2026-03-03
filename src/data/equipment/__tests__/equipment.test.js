/**
 * @module equipment/__tests__
 * @description Tests unitaires pour les données d'équipement SRD Daggerheart.
 */

import { describe, it, expect } from 'vitest'
import {
  PRIMARY_WEAPONS,
  SECONDARY_WEAPONS,
  ARMOR,
  LOOT,
  CONSUMABLES,
  ALL_WEAPONS,
  ALL_EQUIPMENT,
  EQUIPMENT_COUNTS,
  RANGES,
  TIERS,
  BURDENS,
  RARITIES,
  getRarityFromRoll,
  getEquipmentById,
  getPrimaryWeaponsByTier,
  getPrimaryWeaponsByDamageType,
  getPrimaryWeaponById,
  getSecondaryWeaponsByTier,
  getSecondaryWeaponById,
  getArmorByTier,
  getArmorById,
  getLootByRarity,
  getLootByRoll,
  getConsumablesByRarity,
  getConsumableByRoll
} from '@/data/equipment/index.js'

// ═══════════════════════════════════════════
//  CONSTANTES
// ═══════════════════════════════════════════

describe('Equipment Constants', () => {
  it('définit les 5 portées SRD', () => {
    expect(Object.keys(RANGES)).toHaveLength(5)
    expect(RANGES).toHaveProperty('Melee')
    expect(RANGES).toHaveProperty('Very Far')
  })

  it('définit les 4 tiers', () => {
    expect(Object.keys(TIERS)).toHaveLength(4)
  })

  it('définit les 2 types de burden', () => {
    expect(Object.keys(BURDENS)).toHaveLength(2)
  })

  it('définit les 4 raretés', () => {
    expect(Object.keys(RARITIES)).toHaveLength(4)
  })

  it('calcule les raretés correctement', () => {
    expect(getRarityFromRoll(1)).toBe('common')
    expect(getRarityFromRoll(12)).toBe('common')
    expect(getRarityFromRoll(13)).toBe('uncommon')
    expect(getRarityFromRoll(24)).toBe('uncommon')
    expect(getRarityFromRoll(25)).toBe('rare')
    expect(getRarityFromRoll(36)).toBe('rare')
    expect(getRarityFromRoll(37)).toBe('legendary')
    expect(getRarityFromRoll(60)).toBe('legendary')
  })
})

// ═══════════════════════════════════════════
//  ARMES PRIMAIRES
// ═══════════════════════════════════════════

describe('Primary Weapons', () => {
  it('contient au moins 25 armes par tier', () => {
    for (let tier = 1; tier <= 4; tier++) {
      const tierWeapons = getPrimaryWeaponsByTier(tier)
      expect(tierWeapons.length).toBeGreaterThanOrEqual(25)
    }
  })

  it('total >= 100 armes primaires', () => {
    expect(PRIMARY_WEAPONS.length).toBeGreaterThanOrEqual(100)
  })

  it('chaque arme a les champs requis', () => {
    PRIMARY_WEAPONS.forEach((w) => {
      expect(w).toHaveProperty('id')
      expect(w).toHaveProperty('name')
      expect(w).toHaveProperty('tier')
      expect(w).toHaveProperty('damageType')
      expect(w).toHaveProperty('trait')
      expect(w).toHaveProperty('range')
      expect(w).toHaveProperty('damage')
      expect(w).toHaveProperty('burden')
      expect(typeof w.id).toBe('string')
      expect(typeof w.name).toBe('string')
      expect([1, 2, 3, 4]).toContain(w.tier)
      expect(['phy', 'mag']).toContain(w.damageType)
      expect(Object.keys(RANGES)).toContain(w.range)
      expect(['One-Handed', 'Two-Handed']).toContain(w.burden)
    })
  })

  it('tous les IDs sont uniques', () => {
    const ids = PRIMARY_WEAPONS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('contient les 15 armes physiques de base au tier 1', () => {
    const t1phy = PRIMARY_WEAPONS.filter((w) => w.tier === 1 && w.damageType === 'phy')
    expect(t1phy.length).toBe(15)
    const names = t1phy.map((w) => w.name)
    expect(names).toContain('Broadsword')
    expect(names).toContain('Longsword')
    expect(names).toContain('Dagger')
    expect(names).toContain('Rapier')
    expect(names).toContain('Longbow')
  })

  it('contient les 10 armes magiques de base au tier 1', () => {
    const t1mag = PRIMARY_WEAPONS.filter((w) => w.tier === 1 && w.damageType === 'mag')
    expect(t1mag.length).toBe(10)
    const names = t1mag.map((w) => w.name)
    expect(names).toContain('Arcane Gauntlets')
    expect(names).toContain('Wand')
    expect(names).toContain('Greatstaff')
  })

  it('le Broadsword Tier 1 a les bonnes stats', () => {
    const broadsword = getPrimaryWeaponById('broadsword-t1')
    expect(broadsword).not.toBeNull()
    expect(broadsword.trait).toBe('Agility')
    expect(broadsword.damage).toBe('d8')
    expect(broadsword.burden).toBe('One-Handed')
    expect(broadsword.featureKey).toBe('Reliable')
  })

  it('les armes magiques requièrent un Spellcast trait (implicite via damageType)', () => {
    const magWeapons = getPrimaryWeaponsByDamageType('mag')
    expect(magWeapons.length).toBeGreaterThan(0)
    magWeapons.forEach((w) => {
      expect(w.damageType).toBe('mag')
    })
  })

  it('le Greatsword a la feature Massive à chaque tier', () => {
    for (let tier = 1; tier <= 4; tier++) {
      const gs = getPrimaryWeaponById(`greatsword-t${tier}`)
      expect(gs).not.toBeNull()
      expect(gs.featureKey).toBe('Massive')
    }
  })

  it('les dégâts des armes de base augmentent avec le tier', () => {
    const daggerDmg = [1, 2, 3, 4].map((t) => {
      const w = getPrimaryWeaponById(`dagger-t${t}`)
      const match = w.damage.match(/\+(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
    for (let i = 1; i < daggerDmg.length; i++) {
      expect(daggerDmg[i]).toBeGreaterThan(daggerDmg[i - 1])
    }
  })

  it('contient les armes uniques de T2 (Gilded Falchion, Blunderbuss, etc.)', () => {
    expect(getPrimaryWeaponById('gilded-falchion-t2')).not.toBeNull()
    expect(getPrimaryWeaponById('blunderbuss-t2')).not.toBeNull()
    expect(getPrimaryWeaponById('ego-blade-t2')).not.toBeNull()
  })

  it('contient les armes uniques de T3 (Flickerfly Blade, Ghostblade, etc.)', () => {
    expect(getPrimaryWeaponById('flickerfly-blade-t3')).not.toBeNull()
    expect(getPrimaryWeaponById('ghostblade-t3')).not.toBeNull()
    expect(getPrimaryWeaponById('runes-of-ruination-t3')).not.toBeNull()
  })

  it('contient les armes uniques de T4 (Sledge Axe, Wand of Essek, etc.)', () => {
    expect(getPrimaryWeaponById('sledge-axe-t4')).not.toBeNull()
    expect(getPrimaryWeaponById('wand-of-essek-t4')).not.toBeNull()
    expect(getPrimaryWeaponById('fusion-gloves-t4')).not.toBeNull()
  })
})

// ═══════════════════════════════════════════
//  ARMES SECONDAIRES
// ═══════════════════════════════════════════

describe('Secondary Weapons', () => {
  it('contient au moins 7 armes par tier', () => {
    for (let tier = 1; tier <= 4; tier++) {
      const tierWeapons = getSecondaryWeaponsByTier(tier)
      expect(tierWeapons.length).toBeGreaterThanOrEqual(7)
    }
  })

  it('total >= 37 armes secondaires', () => {
    expect(SECONDARY_WEAPONS.length).toBeGreaterThanOrEqual(37)
  })

  it('toutes les armes secondaires sont One-Handed', () => {
    SECONDARY_WEAPONS.forEach((w) => {
      expect(w.burden).toBe('One-Handed')
    })
  })

  it('tous les IDs sont uniques', () => {
    const ids = SECONDARY_WEAPONS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('le Round Shield Tier 1 a les bonnes stats', () => {
    const shield = getSecondaryWeaponById('round-shield-t1')
    expect(shield).not.toBeNull()
    expect(shield.trait).toBe('Strength')
    expect(shield.damage).toBe('d4')
    expect(shield.featureKey).toBe('Protective')
  })

  it('le Paired bonus augmente par tier pour Shortsword', () => {
    const features = [1, 2, 3, 4].map((t) => {
      const w = getSecondaryWeaponById(`shortsword-t${t}`)
      const match = w.feature.match(/\+(\d+)/)
      return parseInt(match[1], 10)
    })
    expect(features).toEqual([2, 3, 4, 5])
  })

  it('contient les armes uniques T2 (Spiked Shield, Parrying Dagger, Returning Axe)', () => {
    expect(getSecondaryWeaponById('spiked-shield-t2')).not.toBeNull()
    expect(getSecondaryWeaponById('parrying-dagger-t2')).not.toBeNull()
    expect(getSecondaryWeaponById('returning-axe-t2')).not.toBeNull()
  })

  it('contient les armes uniques T3 (Buckler, Powered Gauntlet, Hand Sling)', () => {
    expect(getSecondaryWeaponById('buckler-t3')).not.toBeNull()
    expect(getSecondaryWeaponById('powered-gauntlet-t3')).not.toBeNull()
    expect(getSecondaryWeaponById('hand-sling-t3')).not.toBeNull()
  })

  it('contient les armes uniques T4 (Braveshield, Knuckle Claws, Primer Shard)', () => {
    expect(getSecondaryWeaponById('braveshield-t4')).not.toBeNull()
    expect(getSecondaryWeaponById('knuckle-claws-t4')).not.toBeNull()
    expect(getSecondaryWeaponById('primer-shard-t4')).not.toBeNull()
  })
})

// ═══════════════════════════════════════════
//  ARMURES
// ═══════════════════════════════════════════

describe('Armor', () => {
  it('contient 4 armures de base par tier', () => {
    for (let tier = 1; tier <= 4; tier++) {
      const tierArmor = getArmorByTier(tier)
      expect(tierArmor.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('total >= 34 armures', () => {
    expect(ARMOR.length).toBeGreaterThanOrEqual(34)
  })

  it('chaque armure a les champs requis', () => {
    ARMOR.forEach((a) => {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('name')
      expect(a).toHaveProperty('tier')
      expect(a).toHaveProperty('thresholds')
      expect(a.thresholds).toHaveProperty('major')
      expect(a.thresholds).toHaveProperty('severe')
      expect(a).toHaveProperty('baseScore')
      expect(typeof a.baseScore).toBe('number')
    })
  })

  it('tous les IDs sont uniques', () => {
    const ids = ARMOR.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('les seuils de Gambeson T1 sont 5/11', () => {
    const gambeson = getArmorById('gambeson-t1')
    expect(gambeson).not.toBeNull()
    expect(gambeson.thresholds.major).toBe(5)
    expect(gambeson.thresholds.severe).toBe(11)
    expect(gambeson.baseScore).toBe(3)
    expect(gambeson.featureKey).toBe('Flexible')
  })

  it('les seuils augmentent par tier pour chaque armure de base', () => {
    const bases = ['gambeson', 'leather', 'chainmail', 'full-plate']
    bases.forEach((base) => {
      const majors = [1, 2, 3, 4].map((t) => getArmorById(`${base}-t${t}`).thresholds.major)
      for (let i = 1; i < majors.length; i++) {
        expect(majors[i]).toBeGreaterThan(majors[i - 1])
      }
    })
  })

  it('contient les armures uniques T2', () => {
    expect(getArmorById('elundrian-chain-t2')).not.toBeNull()
    expect(getArmorById('rosewild-t2')).not.toBeNull()
  })

  it('contient les armures uniques T3', () => {
    expect(getArmorById('dragonscale-t3')).not.toBeNull()
    expect(getArmorById('bladefare-t3')).not.toBeNull()
  })

  it('contient les armures uniques T4', () => {
    expect(getArmorById('dunamis-silkchain-t4')).not.toBeNull()
    expect(getArmorById('savior-chainmail-t4')).not.toBeNull()
    expect(getArmorById('savior-chainmail-t4').baseScore).toBe(8)
  })
})

// ═══════════════════════════════════════════
//  LOOT
// ═══════════════════════════════════════════

describe('Loot', () => {
  it('contient exactement 60 items', () => {
    expect(LOOT).toHaveLength(60)
  })

  it('les rolls vont de 1 à 60', () => {
    const rolls = LOOT.map((l) => l.roll).sort((a, b) => a - b)
    expect(rolls[0]).toBe(1)
    expect(rolls[59]).toBe(60)
    expect(new Set(rolls).size).toBe(60)
  })

  it('chaque loot a les champs requis', () => {
    LOOT.forEach((l) => {
      expect(l).toHaveProperty('id')
      expect(l).toHaveProperty('roll')
      expect(l).toHaveProperty('name')
      expect(l).toHaveProperty('description')
      expect(l).toHaveProperty('rarity')
      expect(typeof l.description).toBe('string')
      expect(l.description.length).toBeGreaterThan(0)
    })
  })

  it('les raretés sont correctement attribuées', () => {
    expect(getLootByRarity('common')).toHaveLength(12)
    expect(getLootByRarity('uncommon')).toHaveLength(12)
    expect(getLootByRarity('rare')).toHaveLength(12)
    expect(getLootByRarity('legendary')).toHaveLength(24)
  })

  it('getLootByRoll retourne le bon item', () => {
    const bedroll = getLootByRoll(1)
    expect(bedroll.name).toBe('Premium Bedroll')
    const belt = getLootByRoll(60)
    expect(belt.name).toBe('Belt of Unity')
  })

  it('contient les reliques (rolls 41–47)', () => {
    const relics = LOOT.filter((l) => l.name.includes('Relic'))
    expect(relics).toHaveLength(7)
  })

  it('contient les gemmes (rolls 53–58)', () => {
    const gems = LOOT.filter((l) => l.name.startsWith('Gem of'))
    expect(gems).toHaveLength(6)
  })
})

// ═══════════════════════════════════════════
//  CONSOMMABLES
// ═══════════════════════════════════════════

describe('Consumables', () => {
  it('contient exactement 60 items', () => {
    expect(CONSUMABLES).toHaveLength(60)
  })

  it('les rolls vont de 1 à 60', () => {
    const rolls = CONSUMABLES.map((c) => c.roll).sort((a, b) => a - b)
    expect(rolls[0]).toBe(1)
    expect(rolls[59]).toBe(60)
    expect(new Set(rolls).size).toBe(60)
  })

  it('chaque consommable a les champs requis', () => {
    CONSUMABLES.forEach((c) => {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('roll')
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('description')
      expect(c).toHaveProperty('rarity')
    })
  })

  it('les raretés sont correctement attribuées', () => {
    expect(getConsumablesByRarity('common')).toHaveLength(12)
    expect(getConsumablesByRarity('uncommon')).toHaveLength(12)
    expect(getConsumablesByRarity('rare')).toHaveLength(12)
    expect(getConsumablesByRarity('legendary')).toHaveLength(24)
  })

  it('contient les 6 potions de trait (Stride, Bolster, etc.)', () => {
    const traitPotions = CONSUMABLES.filter((c) =>
      ['Stride Potion', 'Bolster Potion', 'Control Potion', 'Attune Potion', 'Charm Potion', 'Enlighten Potion'].includes(c.name)
    )
    expect(traitPotions).toHaveLength(6)
  })

  it('contient les potions de santé/stamina dans les bonnes raretés', () => {
    const minorHP = getConsumableByRoll(7)
    expect(minorHP.name).toBe('Minor Health Potion')
    expect(minorHP.rarity).toBe('common')

    const majorHP = getConsumableByRoll(43)
    expect(majorHP.name).toBe('Major Health Potion')
    expect(majorHP.rarity).toBe('legendary')
  })

  it('le Stardrop est le dernier consommable (roll 60)', () => {
    const stardrop = getConsumableByRoll(60)
    expect(stardrop.name).toBe('Stardrop')
    expect(stardrop.rarity).toBe('legendary')
  })
})

// ═══════════════════════════════════════════
//  AGRÉGATS
// ═══════════════════════════════════════════

describe('Equipment Aggregates', () => {
  it('ALL_WEAPONS = primary + secondary', () => {
    expect(ALL_WEAPONS.length).toBe(PRIMARY_WEAPONS.length + SECONDARY_WEAPONS.length)
  })

  it('ALL_EQUIPMENT contient tout', () => {
    const expected = PRIMARY_WEAPONS.length + SECONDARY_WEAPONS.length + ARMOR.length + LOOT.length + CONSUMABLES.length
    expect(ALL_EQUIPMENT.length).toBe(expected)
  })

  it('EQUIPMENT_COUNTS.total est cohérent', () => {
    expect(EQUIPMENT_COUNTS.total).toBe(ALL_EQUIPMENT.length)
  })

  it('getEquipmentById fonctionne globalement', () => {
    expect(getEquipmentById('broadsword-t1')).not.toBeNull()
    expect(getEquipmentById('round-shield-t1')).not.toBeNull()
    expect(getEquipmentById('gambeson-t1')).not.toBeNull()
    expect(getEquipmentById('loot-01')).not.toBeNull()
    expect(getEquipmentById('cons-01')).not.toBeNull()
    expect(getEquipmentById('nonexistent')).toBeNull()
  })

  it('aucun ID dupliqué dans ALL_EQUIPMENT', () => {
    const ids = ALL_EQUIPMENT.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
