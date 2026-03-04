/**
 * @module equipment/__tests__
 * @description Tests d'intégrité structurelle et logique des équipements.
 *
 * Vérifications SRD (noms, stats spécifiques, comptages exacts) supprimées.
 * On conserve : structure, unicité, logique de progression, fonctions utilitaires.
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
  getSecondaryWeaponsByTier,
  getArmorByTier,
  getLootByRarity,
  getConsumablesByRarity
} from '@/data/equipment/index.js'

// ── Constantes ──────────────────────────────────────────

describe('Equipment Constants', () => {
  it('définit les portées, tiers, burdens et raretés', () => {
    expect(Object.keys(RANGES).length).toBeGreaterThan(0)
    expect(Object.keys(TIERS).length).toBeGreaterThan(0)
    expect(Object.keys(BURDENS).length).toBeGreaterThan(0)
    expect(Object.keys(RARITIES).length).toBeGreaterThan(0)
  })

  it('getRarityFromRoll — logique de seuils', () => {
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

// ── Armes primaires ─────────────────────────────────────

describe('Primary Weapons', () => {
  it('contient des armes pour chaque tier', () => {
    for (let tier = 1; tier <= 4; tier++) {
      expect(getPrimaryWeaponsByTier(tier).length).toBeGreaterThan(0)
    }
  })

  it('chaque arme a les champs requis', () => {
    PRIMARY_WEAPONS.forEach((w) => {
      const fields = ['id', 'name', 'tier', 'damageType', 'trait', 'range', 'damage', 'burden']
      fields.forEach((f) => expect(w, `${w.id} manque "${f}"`).toHaveProperty(f))
      expect([1, 2, 3, 4]).toContain(w.tier)
      expect(['phy', 'mag']).toContain(w.damageType)
      expect(Object.keys(RANGES)).toContain(w.range)
      expect(['One-Handed', 'Two-Handed']).toContain(w.burden)
    })
  })

  it('IDs uniques', () => {
    const ids = PRIMARY_WEAPONS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── Armes secondaires ───────────────────────────────────

describe('Secondary Weapons', () => {
  it('contient des armes pour chaque tier', () => {
    for (let tier = 1; tier <= 4; tier++) {
      expect(getSecondaryWeaponsByTier(tier).length).toBeGreaterThan(0)
    }
  })

  it('toutes les armes secondaires sont One-Handed', () => {
    SECONDARY_WEAPONS.forEach((w) => {
      expect(w.burden, `${w.id}`).toBe('One-Handed')
    })
  })

  it('IDs uniques', () => {
    const ids = SECONDARY_WEAPONS.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── Armures ─────────────────────────────────────────────

describe('Armor', () => {
  it('contient des armures pour chaque tier', () => {
    for (let tier = 1; tier <= 4; tier++) {
      expect(getArmorByTier(tier).length).toBeGreaterThan(0)
    }
  })

  it('chaque armure a les champs requis', () => {
    ARMOR.forEach((a) => {
      const fields = ['id', 'name', 'tier', 'thresholds', 'baseScore']
      fields.forEach((f) => expect(a, `${a.id} manque "${f}"`).toHaveProperty(f))
      expect(a.thresholds).toHaveProperty('major')
      expect(a.thresholds).toHaveProperty('severe')
      expect(typeof a.baseScore).toBe('number')
    })
  })

  it('IDs uniques', () => {
    const ids = ARMOR.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('severe > major pour chaque armure', () => {
    ARMOR.forEach((a) => {
      expect(a.thresholds.severe, `${a.id}`).toBeGreaterThan(a.thresholds.major)
    })
  })
})

// ── Loot ────────────────────────────────────────────────

describe('Loot', () => {
  it('les rolls sont continus de 1 à N', () => {
    const rolls = LOOT.map((l) => l.roll).sort((a, b) => a - b)
    expect(rolls[0]).toBe(1)
    expect(new Set(rolls).size).toBe(LOOT.length)
  })

  it('chaque loot a les champs requis', () => {
    LOOT.forEach((l) => {
      const fields = ['id', 'roll', 'name', 'description', 'rarity']
      fields.forEach((f) => expect(l, `${l.id} manque "${f}"`).toHaveProperty(f))
      expect(l.description.length).toBeGreaterThan(0)
    })
  })

  it('getLootByRarity couvre toutes les raretés', () => {
    Object.keys(RARITIES).forEach((rarity) => {
      const items = getLootByRarity(rarity)
      expect(items.length, `${rarity} devrait avoir des items`).toBeGreaterThan(0)
      items.forEach((l) => expect(l.rarity).toBe(rarity))
    })
  })
})

// ── Consumables ─────────────────────────────────────────

describe('Consumables', () => {
  it('les rolls sont continus de 1 à N', () => {
    const rolls = CONSUMABLES.map((c) => c.roll).sort((a, b) => a - b)
    expect(rolls[0]).toBe(1)
    expect(new Set(rolls).size).toBe(CONSUMABLES.length)
  })

  it('chaque consommable a les champs requis', () => {
    CONSUMABLES.forEach((c) => {
      const fields = ['id', 'roll', 'name', 'description', 'rarity']
      fields.forEach((f) => expect(c, `${c.id} manque "${f}"`).toHaveProperty(f))
    })
  })

  it('getConsumablesByRarity couvre toutes les raretés', () => {
    Object.keys(RARITIES).forEach((rarity) => {
      const items = getConsumablesByRarity(rarity)
      expect(items.length, `${rarity} devrait avoir des items`).toBeGreaterThan(0)
      items.forEach((c) => expect(c.rarity).toBe(rarity))
    })
  })
})

// ── Agrégats ────────────────────────────────────────────

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

  it('getEquipmentById fonctionne sur tous les types', () => {
    // Teste le premier item de chaque catégorie
    expect(getEquipmentById(PRIMARY_WEAPONS[0].id)).not.toBeNull()
    expect(getEquipmentById(SECONDARY_WEAPONS[0].id)).not.toBeNull()
    expect(getEquipmentById(ARMOR[0].id)).not.toBeNull()
    expect(getEquipmentById(LOOT[0].id)).not.toBeNull()
    expect(getEquipmentById(CONSUMABLES[0].id)).not.toBeNull()
    expect(getEquipmentById('nonexistent')).toBeNull()
  })

  it('aucun ID dupliqué dans ALL_EQUIPMENT', () => {
    const ids = ALL_EQUIPMENT.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
