/**
 * @module characters/__tests__/characterStore.test
 * @description Tests unitaires du module Personnages (Sprint 4).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────────
const mockStore = { value: [] }
vi.mock('@core/composables/useStorage', () => ({
  useStorage: () => ({
    data: mockStore,
    save: (val) => { mockStore.value = JSON.parse(JSON.stringify(val)) },
    error: null
  })
}))

import { useCharacterStore } from '../stores/characterStore'
import {
  CLASSES,
  SRD_CLASSES,
  TRAITS,
  CONDITIONS,
  DOMAINS,
  MAX_HP,
  MAX_STRESS,
  MAX_ARMOR,
  MAX_CHARACTERS,
  MAX_HOPE,
  getClassById,
  createDefaultCharacter
} from '@data/classes'

// ═════════════════════════════════════════════════════════
// DATA : Classes & Constants
// ═════════════════════════════════════════════════════════

describe('Classes SRD data', () => {
  it('should have 9 official SRD classes', () => {
    expect(SRD_CLASSES).toHaveLength(9)
  })

  it('CLASSES includes homebrew (>= 9 entries)', () => {
    expect(CLASSES.length).toBeGreaterThanOrEqual(9)
  })

  it('should have all expected SRD class IDs', () => {
    const ids = SRD_CLASSES.map((c) => c.id)
    expect(ids).toContain('guardian')
    expect(ids).toContain('seraph')
    expect(ids).toContain('warrior')
    expect(ids).toContain('rogue')
    expect(ids).toContain('bard')
    expect(ids).toContain('druid')
    expect(ids).toContain('ranger')
    expect(ids).toContain('wizard')
    expect(ids).toContain('sorcerer')
  })

  it('each class (SRD + homebrew) has required fields', () => {
    for (const cls of CLASSES) {
      expect(cls.id).toBeTruthy()
      expect(cls.name).toBeTruthy()
      expect(cls.emoji).toBeTruthy()
      expect(cls.domains).toBeInstanceOf(Array)
      expect(cls.domains.length).toBeGreaterThanOrEqual(2)
      expect(typeof cls.baseEvasion).toBe('number')
      expect(typeof cls.baseHP).toBe('number')
      expect(typeof cls.baseStress).toBe('number')
      expect(cls.hopeFeature).toBeTruthy()
      expect(cls.classFeatures.length).toBeGreaterThanOrEqual(1)
      expect(cls.suggestedTraits).toBeDefined()
      expect(cls.suggestedArmor).toBeTruthy()
    }
  })

  it('evasion + HP ~16 for all classes (balance check)', () => {
    for (const cls of CLASSES) {
      const total = cls.baseEvasion + cls.baseHP
      expect(total).toBeGreaterThanOrEqual(14)
      expect(total).toBeLessThanOrEqual(18)
    }
  })

  it('evasion ranges from 9 to 12 per SRD', () => {
    for (const cls of CLASSES) {
      expect(cls.baseEvasion).toBeGreaterThanOrEqual(9)
      expect(cls.baseEvasion).toBeLessThanOrEqual(12)
    }
  })

  it('HP ranges from 5 to 7 per SRD', () => {
    for (const cls of CLASSES) {
      expect(cls.baseHP).toBeGreaterThanOrEqual(5)
      expect(cls.baseHP).toBeLessThanOrEqual(7)
    }
  })

  it('all classes start with 6 Stress', () => {
    for (const cls of CLASSES) {
      expect(cls.baseStress).toBe(6)
    }
  })

  it('Guardian: Evasion 9, HP 7, Valor & Blade', () => {
    const g = getClassById('guardian')
    expect(g.baseEvasion).toBe(9)
    expect(g.baseHP).toBe(7)
    expect(g.domains).toEqual(['Valor', 'Blade'])
  })

  it('Rogue: Evasion 12, HP 6, Midnight & Grace', () => {
    const r = getClassById('rogue')
    expect(r.baseEvasion).toBe(12)
    expect(r.baseHP).toBe(6)
    expect(r.domains).toEqual(['Midnight', 'Grace'])
  })

  it('Wizard: Evasion 11, HP 5, Codex & Splendor', () => {
    const w = getClassById('wizard')
    expect(w.baseEvasion).toBe(11)
    expect(w.baseHP).toBe(5)
    expect(w.domains).toEqual(['Codex', 'Splendor'])
  })
})

describe('Constants', () => {
  it('should have 6 traits', () => {
    expect(TRAITS).toHaveLength(6)
    expect(TRAITS.map((t) => t.id)).toEqual([
      'agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'
    ])
  })

  it('each trait has 3 skills', () => {
    for (const trait of TRAITS) {
      expect(trait.skills).toHaveLength(3)
    }
  })

  it('should have 3 standard SRD conditions', () => {
    expect(CONDITIONS).toHaveLength(3)
    expect(CONDITIONS.find((c) => c.id === 'vulnerable')).toBeTruthy()
    expect(CONDITIONS.find((c) => c.id === 'restrained')).toBeTruthy()
    expect(CONDITIONS.find((c) => c.id === 'hidden')).toBeTruthy()
  })

  it('should have 9 domains', () => {
    expect(DOMAINS).toHaveLength(9)
  })

  it('max constants are correct', () => {
    expect(MAX_HP).toBe(12)
    expect(MAX_STRESS).toBe(12)
    expect(MAX_ARMOR).toBe(12)
    expect(MAX_HOPE).toBe(6)
    expect(MAX_CHARACTERS).toBe(8)
  })
})

describe('getClassById', () => {
  it('returns class by valid ID', () => {
    expect(getClassById('bard')).toBeTruthy()
    expect(getClassById('bard').name).toBe('Bard')
  })

  it('returns null for invalid ID', () => {
    expect(getClassById('paladin')).toBeNull()
    expect(getClassById('')).toBeNull()
  })
})

describe('createDefaultCharacter', () => {
  it('creates character with correct class defaults', () => {
    const char = createDefaultCharacter('guardian')
    expect(char.classId).toBe('guardian')
    expect(char.className).toBe('Guardian')
    expect(char.evasion).toBe(9)
    expect(char.maxHP).toBe(7)
    expect(char.maxStress).toBe(6)
    expect(char.level).toBe(1)
    expect(char.proficiency).toBe(1)
  })

  it('pre-fills suggested traits', () => {
    const char = createDefaultCharacter('rogue')
    expect(char.traits.agility).toBe(1)
    expect(char.traits.strength).toBe(-1)
    expect(char.traits.finesse).toBe(2)
  })

  it('has unique ID', () => {
    const c1 = createDefaultCharacter('bard')
    const c2 = createDefaultCharacter('bard')
    expect(c1.id).not.toBe(c2.id)
  })

  it('returns null for invalid class', () => {
    expect(createDefaultCharacter('paladin')).toBeNull()
  })

  it('initializes empty equipment', () => {
    const char = createDefaultCharacter('warrior')
    expect(char.primaryWeapon.name).toBe('')
    expect(char.secondaryWeapon.name).toBe('')
    expect(char.inventory).toEqual([])
    expect(char.conditions).toEqual([])
  })

  it('starts with 2 empty experiences', () => {
    const char = createDefaultCharacter('druid')
    expect(char.experiences).toHaveLength(2)
    expect(char.experiences[0]).toEqual({ name: '', bonus: 0 })
  })
})

// ═════════════════════════════════════════════════════════
// STORE : Character Store
// ═════════════════════════════════════════════════════════

describe('characterStore', () => {
  let store

  beforeEach(() => {
    mockStore.value = []
    setActivePinia(createPinia())
    store = useCharacterStore()
    store.resetAll()
  })

  describe('initial state', () => {
    it('starts with no characters', () => {
      expect(store.characters).toEqual([])
      expect(store.characterCount).toBe(0)
    })

    it('no character selected', () => {
      expect(store.selectedCharacterId).toBeNull()
      expect(store.selectedCharacter).toBeNull()
    })

    it('can add characters', () => {
      expect(store.canAddCharacter).toBe(true)
    })
  })

  describe('createCharacter', () => {
    it('creates a character and selects it', () => {
      const id = store.createCharacter('warrior')
      expect(id).toBeTruthy()
      expect(store.characterCount).toBe(1)
      expect(store.selectedCharacterId).toBe(id)
      expect(store.selectedCharacter.classId).toBe('warrior')
    })

    it('can create multiple characters', () => {
      store.createCharacter('warrior')
      store.createCharacter('rogue')
      store.createCharacter('bard')
      expect(store.characterCount).toBe(3)
    })

    it('returns null for invalid class', () => {
      expect(store.createCharacter('paladin')).toBeNull()
      expect(store.characterCount).toBe(0)
    })

    it('enforces max 8 characters', () => {
      for (let i = 0; i < 8; i++) {
        store.createCharacter('warrior')
      }
      expect(store.characterCount).toBe(8)
      expect(store.canAddCharacter).toBe(false)
      expect(store.createCharacter('bard')).toBeNull()
      expect(store.characterCount).toBe(8)
    })
  })

  describe('deleteCharacter', () => {
    it('removes the character', () => {
      const id = store.createCharacter('warrior')
      store.deleteCharacter(id)
      expect(store.characterCount).toBe(0)
    })

    it('selects another character after delete', () => {
      const id1 = store.createCharacter('warrior')
      const id2 = store.createCharacter('rogue')
      store.selectCharacter(id1)
      store.deleteCharacter(id1)
      expect(store.selectedCharacterId).toBe(id2)
    })

    it('clears selection if no characters left', () => {
      const id = store.createCharacter('bard')
      store.deleteCharacter(id)
      expect(store.selectedCharacterId).toBeNull()
    })
  })

  describe('selectCharacter', () => {
    it('selects an existing character', () => {
      const id1 = store.createCharacter('warrior')
      const id2 = store.createCharacter('rogue')
      store.selectCharacter(id1)
      expect(store.selectedCharacterId).toBe(id1)
      store.selectCharacter(id2)
      expect(store.selectedCharacterId).toBe(id2)
    })

    it('ignores non-existent ID', () => {
      const id = store.createCharacter('warrior')
      store.selectCharacter('nonexistent')
      expect(store.selectedCharacterId).toBe(id)
    })
  })

  describe('updateField', () => {
    beforeEach(() => {
      store.createCharacter('guardian')
    })

    it('updates simple field', () => {
      store.updateField('name', 'Torvin')
      expect(store.selectedCharacter.name).toBe('Torvin')
    })

    it('updates nested field with dot notation', () => {
      store.updateField('traits.strength', 4)
      expect(store.selectedCharacter.traits.strength).toBe(4)
    })

    it('updates gold', () => {
      store.updateField('gold.bags', 3)
      expect(store.selectedCharacter.gold.bags).toBe(3)
    })

    it('updates level and recalculates thresholds', () => {
      store.updateField('armorBaseThresholds.major', 7)
      store.updateField('armorBaseThresholds.severe', 15)
      store.updateField('level', 3)
      expect(store.selectedThresholds.major).toBe(10) // 7 + 3
      expect(store.selectedThresholds.severe).toBe(18) // 15 + 3
    })

    it('does nothing without selected character', () => {
      store.selectedCharacterId = null
      store.updateField('name', 'Test')
      // Should not throw
    })
  })

  describe('HP management', () => {
    beforeEach(() => {
      store.createCharacter('guardian') // 7 HP
    })

    it('marks HP', () => {
      store.markHP()
      expect(store.selectedCharacter.currentHP).toBe(1)
      store.markHP(2)
      expect(store.selectedCharacter.currentHP).toBe(3)
    })

    it('clears HP', () => {
      store.markHP(3)
      store.clearHP()
      expect(store.selectedCharacter.currentHP).toBe(2)
    })

    it('clamps HP to max', () => {
      store.markHP(100)
      expect(store.selectedCharacter.currentHP).toBe(7)
    })

    it('clamps HP to 0', () => {
      store.clearHP(100)
      expect(store.selectedCharacter.currentHP).toBe(0)
    })
  })

  describe('Stress management', () => {
    beforeEach(() => {
      store.createCharacter('bard') // 6 Stress
    })

    it('marks and clears stress', () => {
      store.markStress(4)
      expect(store.selectedCharacter.currentStress).toBe(4)
      store.clearStress(2)
      expect(store.selectedCharacter.currentStress).toBe(2)
    })

    it('clamps stress to max', () => {
      store.markStress(100)
      expect(store.selectedCharacter.currentStress).toBe(6)
    })
  })

  describe('Armor management', () => {
    beforeEach(() => {
      store.createCharacter('guardian')
      store.updateField('armorScore', 4)
    })

    it('marks and clears armor', () => {
      store.markArmor()
      expect(store.selectedCharacter.armorSlotsMarked).toBe(1)
      store.clearArmor()
      expect(store.selectedCharacter.armorSlotsMarked).toBe(0)
    })

    it('clamps armor to score', () => {
      store.markArmor(100)
      expect(store.selectedCharacter.armorSlotsMarked).toBe(4)
    })
  })

  describe('Hope', () => {
    beforeEach(() => {
      store.createCharacter('wizard')
    })

    it('sets hope', () => {
      store.setHope(5)
      expect(store.selectedCharacter.hope).toBe(5)
    })

    it('clamps hope 0-MAX_HOPE', () => {
      store.setHope(-5)
      expect(store.selectedCharacter.hope).toBe(0)
      store.setHope(99)
      expect(store.selectedCharacter.hope).toBe(MAX_HOPE)
    })
  })

  describe('Conditions', () => {
    beforeEach(() => {
      store.createCharacter('rogue')
    })

    it('adds a condition', () => {
      store.addCondition('hidden')
      expect(store.selectedCharacter.conditions).toContain('hidden')
    })

    it('does not duplicate conditions', () => {
      store.addCondition('hidden')
      store.addCondition('hidden')
      expect(store.selectedCharacter.conditions.filter((c) => c === 'hidden')).toHaveLength(1)
    })

    it('removes a condition', () => {
      store.addCondition('vulnerable')
      store.addCondition('hidden')
      store.removeCondition('vulnerable')
      expect(store.selectedCharacter.conditions).not.toContain('vulnerable')
      expect(store.selectedCharacter.conditions).toContain('hidden')
    })
  })

  describe('Experiences', () => {
    beforeEach(() => {
      store.createCharacter('bard')
    })

    it('starts with 2 experiences', () => {
      expect(store.selectedCharacter.experiences).toHaveLength(2)
    })

    it('adds an experience', () => {
      store.addExperience()
      expect(store.selectedCharacter.experiences).toHaveLength(3)
    })

    it('removes an experience by index', () => {
      store.updateField('experiences.0.name', 'Acrobatie')
      store.updateField('experiences.1.name', 'Diplomatie')
      store.removeExperience(0)
      expect(store.selectedCharacter.experiences).toHaveLength(1)
      expect(store.selectedCharacter.experiences[0].name).toBe('Diplomatie')
    })

    it('ignores invalid index', () => {
      store.removeExperience(99)
      expect(store.selectedCharacter.experiences).toHaveLength(2)
    })
  })

  describe('Inventory', () => {
    beforeEach(() => {
      store.createCharacter('ranger')
    })

    it('adds items with structured format', () => {
      store.addInventoryItem('loot')
      store.addInventoryItem('consumable')
      const inv = store.selectedCharacter.inventory
      expect(inv).toHaveLength(2)
      expect(inv[0].type).toBe('loot')
      expect(inv[0].itemId).toBe('')
      expect(inv[0].quantity).toBe(1)
      expect(inv[1].type).toBe('consumable')
    })

    it('removes items by index', () => {
      store.addInventoryItem('loot')
      store.addInventoryItem('custom')
      store.removeInventoryItem(0)
      const inv = store.selectedCharacter.inventory
      expect(inv).toHaveLength(1)
      expect(inv[0].type).toBe('custom')
    })

    it('updates inventory item fields', () => {
      store.addInventoryItem('consumable')
      store.updateInventoryItem(0, 'itemId', 'cons-07')
      store.updateInventoryItem(0, 'quantity', 3)
      const slot = store.selectedCharacter.inventory[0]
      expect(slot.itemId).toBe('cons-07')
      expect(slot.quantity).toBe(3)
    })

    it('resets fields when changing type', () => {
      store.addInventoryItem('loot')
      store.updateInventoryItem(0, 'itemId', 'loot-01')
      store.updateInventoryItem(0, 'type', 'custom')
      const slot = store.selectedCharacter.inventory[0]
      expect(slot.type).toBe('custom')
      expect(slot.itemId).toBe('')
    })

    it('updates gold', () => {
      store.updateGold('handfuls', 5)
      store.updateGold('bags', 2)
      store.updateGold('chests', 1)
      const gold = store.selectedCharacter.gold
      expect(gold.handfuls).toBe(5)
      expect(gold.bags).toBe(2)
      expect(gold.chests).toBe(1)
    })

    it('clamps gold to minimum 0', () => {
      store.updateGold('handfuls', -3)
      expect(store.selectedCharacter.gold.handfuls).toBe(0)
    })

    it('clamps quantity to minimum 1', () => {
      store.addInventoryItem('consumable')
      store.updateInventoryItem(0, 'quantity', 0)
      expect(store.selectedCharacter.inventory[0].quantity).toBe(1)
    })

    it('migrates legacy string items', () => {
      // Simuler un inventaire legacy
      store.selectedCharacter.inventory = ['Rope 50ft', 'Torch']
      store.addInventoryItem('loot')
      const inv = store.selectedCharacter.inventory
      expect(inv[0].type).toBe('custom')
      expect(inv[0].customName).toBe('Rope 50ft')
      expect(inv[1].customName).toBe('Torch')
      expect(inv[2].type).toBe('loot')
    })

    it('adds primaryWeapon type items', () => {
      store.addInventoryItem('primaryWeapon')
      store.updateInventoryItem(0, 'itemId', 'broadsword-t1')
      const slot = store.selectedCharacter.inventory[0]
      expect(slot.type).toBe('primaryWeapon')
      expect(slot.itemId).toBe('broadsword-t1')
    })

    it('adds secondaryWeapon type items', () => {
      store.addInventoryItem('secondaryWeapon')
      store.updateInventoryItem(0, 'itemId', 'round-shield-t1')
      const slot = store.selectedCharacter.inventory[0]
      expect(slot.type).toBe('secondaryWeapon')
      expect(slot.itemId).toBe('round-shield-t1')
    })

    it('adds armor type items', () => {
      store.addInventoryItem('armor')
      store.updateInventoryItem(0, 'itemId', 'leather-t1')
      const slot = store.selectedCharacter.inventory[0]
      expect(slot.type).toBe('armor')
      expect(slot.itemId).toBe('leather-t1')
    })

    it('resets itemId when switching from weapon to loot', () => {
      store.addInventoryItem('primaryWeapon')
      store.updateInventoryItem(0, 'itemId', 'broadsword-t1')
      store.updateInventoryItem(0, 'type', 'loot')
      const slot = store.selectedCharacter.inventory[0]
      expect(slot.type).toBe('loot')
      expect(slot.itemId).toBe('')
    })
  })

  describe('Level up helpers', () => {
    beforeEach(() => {
      store.createCharacter('warrior')
    })

    it('increases max HP (capped at 12)', () => {
      expect(store.selectedCharacter.maxHP).toBe(6)
      store.increaseMaxHP()
      expect(store.selectedCharacter.maxHP).toBe(7)
    })

    it('caps max HP at 12', () => {
      for (let i = 0; i < 20; i++) store.increaseMaxHP()
      expect(store.selectedCharacter.maxHP).toBe(12)
    })

    it('increases max Stress (capped at 12)', () => {
      expect(store.selectedCharacter.maxStress).toBe(6)
      store.increaseMaxStress()
      expect(store.selectedCharacter.maxStress).toBe(7)
    })

    it('caps max Stress at 12', () => {
      for (let i = 0; i < 20; i++) store.increaseMaxStress()
      expect(store.selectedCharacter.maxStress).toBe(12)
    })
  })

  describe('Computed getters', () => {
    beforeEach(() => {
      store.createCharacter('guardian')
      store.updateField('armorBaseThresholds.major', 7)
      store.updateField('armorBaseThresholds.severe', 15)
      store.updateField('level', 3)
    })

    it('computes thresholds = base + level', () => {
      expect(store.selectedThresholds).toEqual({ major: 10, severe: 18 })
    })

    it('computes effective evasion = base + bonus', () => {
      expect(store.selectedEffectiveEvasion).toBe(9) // Guardian base
      store.updateField('evasionBonus', 2)
      expect(store.selectedEffectiveEvasion).toBe(11)
    })

    it('selectedCharacterClass returns class data', () => {
      expect(store.selectedCharacterClass.id).toBe('guardian')
      expect(store.selectedCharacterClass.name).toBe('Guardian')
    })
  })

  describe('resetAll', () => {
    it('clears everything', () => {
      store.createCharacter('warrior')
      store.createCharacter('rogue')
      store.resetAll()
      expect(store.characterCount).toBe(0)
      expect(store.selectedCharacterId).toBeNull()
    })
  })

  describe('patchCharacterById', () => {
    let charId

    beforeEach(() => {
      store.createCharacter('guardian')
      charId = store.selectedCharacterId
      // Creer un second personnage pour verifier que selectedCharacterId ne change pas
      store.createCharacter('warrior')
    })

    it('met a jour un PJ par ID sans changer selectedCharacterId', () => {
      const currentSelected = store.selectedCharacterId
      store.patchCharacterById(charId, { currentHP: 3 })
      expect(store.selectedCharacterId).toBe(currentSelected)
      const patched = store.characters.find(c => c.id === charId)
      expect(patched.currentHP).toBe(3)
    })

    it('met a jour updatedAt', () => {
      // Force un updatedAt connu avant le patch
      const char = store.characters.find(c => c.id === charId)
      char.updatedAt = '2020-01-01T00:00:00.000Z'
      store.patchCharacterById(charId, { currentStress: 2 })
      expect(char.updatedAt).not.toBe('2020-01-01T00:00:00.000Z')
    })

    it('ne fait rien avec un ID invalide', () => {
      const countBefore = store.characterCount
      store.patchCharacterById('id-inexistant', { currentHP: 99 })
      expect(store.characterCount).toBe(countBefore)
    })

    it('persiste les modifications', () => {
      store.patchCharacterById(charId, { currentHP: 5, currentStress: 1 })
      const patched = store.characters.find(c => c.id === charId)
      expect(patched.currentHP).toBe(5)
      expect(patched.currentStress).toBe(1)
    })
  })
})
