/**
 * @module domains/__tests__/domains.test
 * @description Tests for domain data integrity and store functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { arcana } from '../arcana.js'
import { blade } from '../blade.js'
import {
  DOMAINS,
  CARD_TYPES,
  RECALL_COSTS,
  getDomainById,
  getDomainsForClass,
  getCardsForDomain,
  getCardById,
  getCardsByLevel,
  getCardsByType
} from '../index.js'
import { useDomainStore } from '@/modules/domains/stores/domainStore.js'

// ═══════════════════════════════════════════════════════════
// DOMAIN DATA STRUCTURE
// ═══════════════════════════════════════════════════════════

describe('Domain data — structure', () => {
  it('should have exactly 9 domains', () => {
    expect(DOMAINS).toHaveLength(9)
  })

  it('should have the 9 correct domain IDs', () => {
    const ids = DOMAINS.map((d) => d.id).sort()
    expect(ids).toEqual([
      'arcana',
      'blade',
      'bone',
      'codex',
      'grace',
      'midnight',
      'sage',
      'splendor',
      'valor'
    ])
  })

  it('should have unique IDs', () => {
    const ids = DOMAINS.map((d) => d.id)
    expect(new Set(ids).size).toBe(9)
  })

  it.each(DOMAINS.map((d) => [d.id, d]))('domain %s — has required fields', (_id, domain) => {
    expect(domain).toHaveProperty('id')
    expect(domain).toHaveProperty('name')
    expect(domain).toHaveProperty('emoji')
    expect(domain).toHaveProperty('color')
    expect(domain).toHaveProperty('description')
    expect(domain).toHaveProperty('classes')
    expect(domain).toHaveProperty('themes')
    expect(domain).toHaveProperty('hasSpells')
    expect(domain).toHaveProperty('cardCount')
    expect(domain).toHaveProperty('cards')
    expect(Array.isArray(domain.classes)).toBe(true)
    expect(Array.isArray(domain.themes)).toBe(true)
    expect(Array.isArray(domain.cards)).toBe(true)
    expect(domain.cardCount).toBe(21)
  })

  it('should have valid CARD_TYPES', () => {
    expect(CARD_TYPES).toHaveProperty('spell')
    expect(CARD_TYPES).toHaveProperty('grimoire')
    expect(CARD_TYPES).toHaveProperty('ability')
  })

  it('should have valid RECALL_COSTS', () => {
    expect(Object.keys(RECALL_COSTS).length).toBeGreaterThanOrEqual(4)
    expect(RECALL_COSTS[0]).toBe('Free')
  })
})

// ═══════════════════════════════════════════════════════════
// CLASS-DOMAIN ASSOCIATIONS
// ═══════════════════════════════════════════════════════════

describe('Domain data — class associations', () => {
  it('Arcana should be linked to Druid, Sorcerer', () => {
    expect(arcana.classes.sort()).toEqual(['Druid', 'Sorcerer'])
  })

  it('Blade should be linked to Guardian, Warrior, Assassin', () => {
    expect(blade.classes.sort()).toEqual(['Assassin', 'Guardian', 'Warrior'])
  })

  it('every domain should have at least 2 classes', () => {
    DOMAINS.forEach((d) => {
      expect(d.classes.length).toBeGreaterThanOrEqual(2)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// ARCANA DOMAIN — 21 CARDS
// ═══════════════════════════════════════════════════════════

describe('Arcana domain — SRD cards', () => {
  it('should have 21 cards', () => {
    expect(arcana.cards).toHaveLength(21)
  })

  it('should have unique card IDs', () => {
    const ids = arcana.cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(21)
  })

  it('should have 3 level-1 cards and 2 cards per level 2-10', () => {
    const byLevel = {}
    arcana.cards.forEach((c) => {
      byLevel[c.level] = (byLevel[c.level] || 0) + 1
    })
    expect(byLevel[1]).toBe(3)
    for (let lv = 2; lv <= 10; lv++) {
      expect(byLevel[lv]).toBe(2)
    }
  })

  it('should only have spell and ability types', () => {
    const types = new Set(arcana.cards.map((c) => c.type))
    types.forEach((t) => {
      expect(['spell', 'ability']).toContain(t)
    })
  })

  it('should have all SRD card names', () => {
    const names = arcana.cards.map((c) => c.name)
    expect(names).toContain('Rune Ward')
    expect(names).toContain('Unleash Chaos')
    expect(names).toContain('Wall Walk')
    expect(names).toContain('Cinder Grasp')
    expect(names).toContain('Floating Eye')
    expect(names).toContain('Counterspell')
    expect(names).toContain('Flight')
    expect(names).toContain('Blink Out')
    expect(names).toContain('Preservation Blast')
    expect(names).toContain('Chain Lightning')
    expect(names).toContain('Premonition')
    expect(names).toContain('Rift Walker')
    expect(names).toContain('Telekinesis')
    expect(names).toContain('Arcana-Touched')
    expect(names).toContain('Cloaking Blast')
    expect(names).toContain('Arcane Reflection')
    expect(names).toContain('Confusing Aura')
    expect(names).toContain('Earthquake')
    expect(names).toContain('Sensory Projection')
    expect(names).toContain('Adjust Reality')
    expect(names).toContain('Falling Sky')
  })

  it('Arcana-Touched should be level 7 ability', () => {
    const touched = arcana.cards.find((c) => c.name === 'Arcana-Touched')
    expect(touched.level).toBe(7)
    expect(touched.type).toBe('ability')
    expect(touched.feature).toContain('4 or more')
    expect(touched.feature).toContain('+1 bonus to your Spellcast Rolls')
  })

  it('each card should have required fields', () => {
    arcana.cards.forEach((card) => {
      expect(card).toHaveProperty('id')
      expect(card).toHaveProperty('name')
      expect(card).toHaveProperty('level')
      expect(card).toHaveProperty('type')
      expect(card).toHaveProperty('recallCost')
      expect(card).toHaveProperty('feature')
      expect(card.level).toBeGreaterThanOrEqual(1)
      expect(card.level).toBeLessThanOrEqual(10)
      expect(card.recallCost).toBeGreaterThanOrEqual(0)
      expect(card.feature.length).toBeGreaterThan(10)
    })
  })

  it('hasSpells should be true', () => {
    expect(arcana.hasSpells).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════
// BLADE DOMAIN — 21 CARDS
// ═══════════════════════════════════════════════════════════

describe('Blade domain — SRD cards', () => {
  it('should have 21 cards', () => {
    expect(blade.cards).toHaveLength(21)
  })

  it('should have unique card IDs', () => {
    const ids = blade.cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(21)
  })

  it('should have 3 level-1 cards and 2 cards per level 2-10', () => {
    const byLevel = {}
    blade.cards.forEach((c) => {
      byLevel[c.level] = (byLevel[c.level] || 0) + 1
    })
    expect(byLevel[1]).toBe(3)
    for (let lv = 2; lv <= 10; lv++) {
      expect(byLevel[lv]).toBe(2)
    }
  })

  it('should only have ability type (no spells)', () => {
    const types = new Set(blade.cards.map((c) => c.type))
    expect(types.size).toBe(1)
    expect(types.has('ability')).toBe(true)
  })

  it('should have all SRD card names', () => {
    const names = blade.cards.map((c) => c.name)
    expect(names).toContain('Get Back Up')
    expect(names).toContain('Not Good Enough')
    expect(names).toContain('Whirlwind')
    expect(names).toContain("A Soldier's Bond")
    expect(names).toContain('Reckless')
    expect(names).toContain('Scramble')
    expect(names).toContain('Versatile Fighter')
    expect(names).toContain('Deadly Focus')
    expect(names).toContain('Fortified Armor')
    expect(names).toContain("Champion's Edge")
    expect(names).toContain('Vitality')
    expect(names).toContain('Battle-Hardened')
    expect(names).toContain('Rage Up')
    expect(names).toContain('Blade-Touched')
    expect(names).toContain('Glancing Blow')
    expect(names).toContain('Battle Cry')
    expect(names).toContain('Frenzy')
    expect(names).toContain('Gore and Glory')
    expect(names).toContain("Reaper's Strike")
    expect(names).toContain('Battle Monster')
    expect(names).toContain('Onslaught')
  })

  it('Blade-Touched should be level 7 ability', () => {
    const touched = blade.cards.find((c) => c.name === 'Blade-Touched')
    expect(touched.level).toBe(7)
    expect(touched.type).toBe('ability')
    expect(touched.feature).toContain('4 or more')
    expect(touched.feature).toContain('+2 bonus to your attack rolls')
  })

  it('hasSpells should be false', () => {
    expect(blade.hasSpells).toBe(false)
  })

  it('each card should have required fields', () => {
    blade.cards.forEach((card) => {
      expect(card).toHaveProperty('id')
      expect(card).toHaveProperty('name')
      expect(card).toHaveProperty('level')
      expect(card).toHaveProperty('type')
      expect(card).toHaveProperty('recallCost')
      expect(card).toHaveProperty('feature')
      expect(card.level).toBeGreaterThanOrEqual(1)
      expect(card.level).toBeLessThanOrEqual(10)
      expect(card.recallCost).toBeGreaterThanOrEqual(0)
      expect(card.feature.length).toBeGreaterThan(10)
    })
  })
})

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

describe('Domain utility functions', () => {
  it('getDomainById — finds arcana', () => {
    const d = getDomainById('arcana')
    expect(d).not.toBeNull()
    expect(d.name).toBe('Arcana')
  })

  it('getDomainById — returns null for unknown', () => {
    expect(getDomainById('nonexistent')).toBeNull()
  })

  it('getDomainsForClass — Guardian should have Valor and Blade', () => {
    const domains = getDomainsForClass('Guardian')
    const ids = domains.map((d) => d.id).sort()
    expect(ids).toEqual(['blade', 'valor'])
  })

  it('getDomainsForClass — Druid should have Arcana and Sage', () => {
    const domains = getDomainsForClass('Druid')
    const ids = domains.map((d) => d.id).sort()
    expect(ids).toEqual(['arcana', 'sage'])
  })

  it('getCardsForDomain — arcana returns 21 cards', () => {
    const cards = getCardsForDomain('arcana')
    expect(cards).toHaveLength(21)
  })

  it('getCardsForDomain — unknown returns empty', () => {
    expect(getCardsForDomain('fake')).toEqual([])
  })

  it('getCardById — finds Rune Ward', () => {
    const card = getCardById('arcana-rune-ward')
    expect(card).not.toBeNull()
    expect(card.name).toBe('Rune Ward')
    expect(card.domain).toBe('arcana')
  })

  it('getCardById — returns null for unknown', () => {
    expect(getCardById('nonexistent')).toBeNull()
  })

  it('getCardsByLevel — level 1 should have at least 6 cards (arcana 3 + blade 3)', () => {
    const cards = getCardsByLevel(1)
    expect(cards.length).toBeGreaterThanOrEqual(6)
  })

  it('getCardsByType — spell should contain Arcana spells', () => {
    const cards = getCardsByType('spell')
    const names = cards.map((c) => c.name)
    expect(names).toContain('Rune Ward')
    expect(names).toContain('Chain Lightning')
  })

  it('getCardsByType — ability should contain Blade abilities', () => {
    const cards = getCardsByType('ability')
    const names = cards.map((c) => c.name)
    expect(names).toContain('Get Back Up')
    expect(names).toContain('Whirlwind')
  })
})

// ═══════════════════════════════════════════════════════════
// CROSS-DOMAIN CARD ID UNIQUENESS
// ═══════════════════════════════════════════════════════════

describe('Domain data — cross-domain integrity', () => {
  it('all card IDs should be unique across all domains', () => {
    const allIds = []
    DOMAINS.forEach((d) => {
      d.cards.forEach((c) => allIds.push(c.id))
    })
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('card IDs should be prefixed with their domain', () => {
    DOMAINS.forEach((d) => {
      d.cards.forEach((c) => {
        expect(c.id.startsWith(d.id + '-')).toBe(true)
      })
    })
  })
})

// ═══════════════════════════════════════════════════════════
// DOMAIN STORE
// ═══════════════════════════════════════════════════════════

describe('Domain store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDomainStore()
  })

  it('should initialize with 9 domains', () => {
    expect(store.allDomains).toHaveLength(9)
    expect(store.domainCount).toBe(9)
  })

  it('should count total cards', () => {
    // At least arcana (21) + blade (21) = 42
    expect(store.totalCardCount).toBeGreaterThanOrEqual(42)
  })

  it('should filter domains by search query', () => {
    store.setSearch('arcana')
    expect(store.filteredDomains.length).toBeGreaterThanOrEqual(1)
    expect(store.filteredDomains[0].id).toBe('arcana')
  })

  it('should filter by class name in search', () => {
    store.setSearch('Guardian')
    const ids = store.filteredDomains.map((d) => d.id)
    expect(ids).toContain('blade')
    expect(ids).toContain('valor')
  })

  it('should filter by spell type', () => {
    store.setFilterSpell('spells')
    const allHaveSpells = store.filteredDomains.every((d) => d.hasSpells)
    expect(allHaveSpells).toBe(true)

    store.setFilterSpell('martial')
    const noneHaveSpells = store.filteredDomains.every((d) => !d.hasSpells)
    expect(noneHaveSpells).toBe(true)
  })

  it('should select and deselect a domain', () => {
    expect(store.selectedDomainId).toBeNull()
    store.selectDomain('arcana')
    expect(store.selectedDomainId).toBe('arcana')
    expect(store.selectedDomain.name).toBe('Arcana')

    store.selectDomain('arcana') // toggle off
    expect(store.selectedDomainId).toBeNull()
  })

  it('should show cards for selected domain', () => {
    store.selectDomain('arcana')
    expect(store.selectedDomainCards).toHaveLength(21)
  })

  it('should filter cards by type', () => {
    store.selectDomain('arcana')
    store.setFilterType('ability')
    const allAbilities = store.selectedDomainCards.every((c) => c.type === 'ability')
    expect(allAbilities).toBe(true)
  })

  it('should filter cards by level', () => {
    store.selectDomain('arcana')
    store.setFilterLevel(1)
    expect(store.selectedDomainCards).toHaveLength(3)
    expect(store.selectedDomainCards.every((c) => c.level === 1)).toBe(true)
  })

  it('should list available levels', () => {
    store.selectDomain('arcana')
    expect(store.availableLevels).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('should list available types', () => {
    store.selectDomain('arcana')
    expect(store.availableTypes).toContain('spell')
    expect(store.availableTypes).toContain('ability')
  })

  it('should reset all filters', () => {
    store.setSearch('test')
    store.selectDomain('arcana')
    store.setFilterType('spell')
    store.setFilterLevel(3)
    store.setFilterSpell('spells')

    store.resetFilters()

    expect(store.searchQuery).toBe('')
    expect(store.selectedDomainId).toBeNull()
    expect(store.filterType).toBe('all')
    expect(store.filterLevel).toBe(0)
    expect(store.filterSpell).toBe('all')
  })

  it('should search within card names and features', () => {
    store.setSearch('teleport')
    const results = store.filteredDomains
    // Should find arcana (Blink Out teleports)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })
})
