/**
 * @module domains/__tests__/domains.test
 * @description Tests for domain data integrity and store functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { arcana } from '../arcana.js'
import { blade } from '../blade.js'
import { bone } from '../bone.js'
import { codex } from '../codex.js'
import { grace } from '../grace.js'
import { midnight } from '../midnight.js'
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
    expect(touched.feature).toContain('4 ou plus')
    expect(touched.feature).toContain('+1 aux jets de Sort')
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
    expect(touched.feature).toContain('4 ou plus')
    expect(touched.feature).toContain('+2 à vos jets d\'attaque')
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
// BONE DOMAIN — 21 CARDS
// ═══════════════════════════════════════════════════════════

describe('Bone domain — SRD cards', () => {
  it('should have 21 cards', () => {
    expect(bone.cards).toHaveLength(21)
  })

  it('should have unique card IDs', () => {
    const ids = bone.cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(21)
  })

  it('should have 3 level-1 cards and 2 cards per level 2-10', () => {
    const byLevel = {}
    bone.cards.forEach((c) => {
      byLevel[c.level] = (byLevel[c.level] || 0) + 1
    })
    expect(byLevel[1]).toBe(3)
    for (let lv = 2; lv <= 10; lv++) {
      expect(byLevel[lv]).toBe(2)
    }
  })

  it('should only have ability type (no spells)', () => {
    const types = new Set(bone.cards.map((c) => c.type))
    expect(types.size).toBe(1)
    expect(types.has('ability')).toBe(true)
  })

  it('should have all SRD card names', () => {
    const names = bone.cards.map((c) => c.name)
    expect(names).toContain('Deft Maneuvers')
    expect(names).toContain('I See It Coming')
    expect(names).toContain('Untouchable')
    expect(names).toContain('Ferocity')
    expect(names).toContain('Strategic Approach')
    expect(names).toContain('Brace')
    expect(names).toContain('Tactician')
    expect(names).toContain('Boost')
    expect(names).toContain('Redirect')
    expect(names).toContain('Know Thy Enemy')
    expect(names).toContain('Signature Move')
    expect(names).toContain('Rapid Riposte')
    expect(names).toContain('Recovery')
    expect(names).toContain('Bone-Touched')
    expect(names).toContain('Cruel Precision')
    expect(names).toContain('Breaking Blow')
    expect(names).toContain('Wrangle')
    expect(names).toContain('On The Brink')
    expect(names).toContain('Splintering Strike')
    expect(names).toContain('Deathrun')
    expect(names).toContain('Swift Step')
  })

  it('Bone-Touched should be level 7 ability', () => {
    const touched = bone.cards.find((c) => c.name === 'Bone-Touched')
    expect(touched.level).toBe(7)
    expect(touched.type).toBe('ability')
    expect(touched.feature).toContain('4 ou plus')
    expect(touched.feature).toContain('+1 à l\'Agilité')
  })

  it('hasSpells should be false', () => {
    expect(bone.hasSpells).toBe(false)
  })

  it('classes should be Warrior, Ranger, Duellist', () => {
    expect(bone.classes.sort()).toEqual(['Duellist', 'Ranger', 'Warrior'])
  })
})

// ═══════════════════════════════════════════════════════════
// CODEX DOMAIN — 21 CARDS
// ═══════════════════════════════════════════════════════════

describe('Codex domain — SRD cards', () => {
  it('should have 21 cards', () => {
    expect(codex.cards).toHaveLength(21)
  })

  it('should have unique card IDs', () => {
    const ids = codex.cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(21)
  })

  it('should have 3 level-1 cards and 2 cards per level 2-10', () => {
    const byLevel = {}
    codex.cards.forEach((c) => {
      byLevel[c.level] = (byLevel[c.level] || 0) + 1
    })
    expect(byLevel[1]).toBe(3)
    for (let lv = 2; lv <= 10; lv++) {
      expect(byLevel[lv]).toBe(2)
    }
  })

  it('should have grimoire, spell, and ability types', () => {
    const types = new Set(codex.cards.map((c) => c.type))
    expect(types.has('grimoire')).toBe(true)
    expect(types.has('spell')).toBe(true)
    expect(types.has('ability')).toBe(true)
  })

  it('grimoire cards should be the majority (Codex is the only domain with grimoires)', () => {
    const grimoires = codex.cards.filter((c) => c.type === 'grimoire')
    expect(grimoires.length).toBeGreaterThanOrEqual(10)
  })

  it('should have all SRD card names', () => {
    const names = codex.cards.map((c) => c.name)
    expect(names).toContain('Book of Ava')
    expect(names).toContain('Book of Illiat')
    expect(names).toContain('Book of Tyfar')
    expect(names).toContain('Book of Sitil')
    expect(names).toContain('Book of Vagras')
    expect(names).toContain('Book of Korvax')
    expect(names).toContain('Book of Norai')
    expect(names).toContain('Book of Exota')
    expect(names).toContain('Book of Grynn')
    expect(names).toContain('Manifest Wall')
    expect(names).toContain('Teleport')
    expect(names).toContain('Banish')
    expect(names).toContain('Sigil of Retribution')
    expect(names).toContain('Book of Homet')
    expect(names).toContain('Codex-Touched')
    expect(names).toContain('Book of Vyola')
    expect(names).toContain('Safe Haven')
    expect(names).toContain('Book of Ronin')
    expect(names).toContain('Disintegration Wave')
    expect(names).toContain('Book of Yarrow')
    expect(names).toContain('Transcendent Union')
  })

  it('Codex-Touched should be level 7 ability', () => {
    const touched = codex.cards.find((c) => c.name === 'Codex-Touched')
    expect(touched.level).toBe(7)
    expect(touched.type).toBe('ability')
    expect(touched.feature).toContain('4 ou plus')
    expect(touched.feature).toContain('Maîtrise à un jet de Sort')
  })

  it('Disintegration Wave should have recallCost 4', () => {
    const card = codex.cards.find((c) => c.name === 'Disintegration Wave')
    expect(card.recallCost).toBe(4)
  })

  it('hasSpells should be true', () => {
    expect(codex.hasSpells).toBe(true)
  })

  it('classes should be Bard, Wizard', () => {
    expect(codex.classes.sort()).toEqual(['Bard', 'Wizard'])
  })
})

// ═══════════════════════════════════════════════════════════
// GRACE DOMAIN
// ═══════════════════════════════════════════════════════════

describe('Grace domain', () => {
  it('should have 21 cards', () => {
    expect(grace.cards).toHaveLength(21)
  })

  it('all card IDs should be unique', () => {
    const ids = grace.cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(21)
  })

  it('level distribution: 3 at level 1, 2 each for levels 2-10', () => {
    const byLevel = {}
    grace.cards.forEach((c) => {
      byLevel[c.level] = (byLevel[c.level] || 0) + 1
    })
    expect(byLevel[1]).toBe(3)
    for (let l = 2; l <= 10; l++) {
      expect(byLevel[l]).toBe(2)
    }
  })

  it('card types should be spell or ability', () => {
    grace.cards.forEach((c) => {
      expect(['spell', 'ability']).toContain(c.type)
    })
  })

  it('should contain all SRD card names', () => {
    const names = grace.cards.map((c) => c.name)
    expect(names).toContain('Deft Deceiver')
    expect(names).toContain('Enrapture')
    expect(names).toContain('Inspirational Words')
    expect(names).toContain('Tell No Lies')
    expect(names).toContain('Troublemaker')
    expect(names).toContain('Hypnotic Shimmer')
    expect(names).toContain('Invisibility')
    expect(names).toContain('Soothing Speech')
    expect(names).toContain('Through Your Eyes')
    expect(names).toContain('Thought Delver')
    expect(names).toContain('Words of Discord')
    expect(names).toContain('Never Upstaged')
    expect(names).toContain('Share the Burden')
    expect(names).toContain('Endless Charisma')
    expect(names).toContain('Grace-Touched')
    expect(names).toContain('Astral Projection')
    expect(names).toContain('Mass Enrapture')
    expect(names).toContain('Copycat')
    expect(names).toContain('Master of the Craft')
    expect(names).toContain('Encore')
    expect(names).toContain('Notorious')
  })

  it('Grace-Touched should be level 7 with correct feature', () => {
    const touched = grace.cards.find((c) => c.name === 'Grace-Touched')
    expect(touched.level).toBe(7)
    expect(touched.type).toBe('ability')
    expect(touched.feature).toContain('4 ou plus')
    expect(touched.feature).toContain('Emplacement d\'Armure')
  })

  it('hasSpells should be true', () => {
    expect(grace.hasSpells).toBe(true)
  })

  it('classes should be Bard, Rogue, Duellist', () => {
    expect(grace.classes.sort()).toEqual(['Bard', 'Duellist', 'Rogue'])
  })
})

// ═══════════════════════════════════════════════════════════
// MIDNIGHT DOMAIN
// ═══════════════════════════════════════════════════════════

describe('Midnight domain', () => {
  it('should have 21 cards', () => {
    expect(midnight.cards).toHaveLength(21)
  })

  it('all card IDs should be unique', () => {
    const ids = midnight.cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(21)
  })

  it('level distribution: 3 at level 1, 2 each for levels 2-10', () => {
    const byLevel = {}
    midnight.cards.forEach((c) => {
      byLevel[c.level] = (byLevel[c.level] || 0) + 1
    })
    expect(byLevel[1]).toBe(3)
    for (let l = 2; l <= 10; l++) {
      expect(byLevel[l]).toBe(2)
    }
  })

  it('card types should be spell or ability', () => {
    midnight.cards.forEach((c) => {
      expect(['spell', 'ability']).toContain(c.type)
    })
  })

  it('should contain all SRD card names', () => {
    const names = midnight.cards.map((c) => c.name)
    expect(names).toContain('Pick and Pull')
    expect(names).toContain('Rain of Blades')
    expect(names).toContain('Uncanny Disguise')
    expect(names).toContain('Midnight Spirit')
    expect(names).toContain('Shadowbind')
    expect(names).toContain('Chokehold')
    expect(names).toContain('Veil of Night')
    expect(names).toContain('Stealth Expertise')
    expect(names).toContain('Glyph of Nightfall')
    expect(names).toContain('Hush')
    expect(names).toContain('Phantom Retreat')
    expect(names).toContain('Dark Whispers')
    expect(names).toContain('Mass Disguise')
    expect(names).toContain('Midnight-Touched')
    expect(names).toContain('Vanishing Dodge')
    expect(names).toContain('Shadowhunter')
    expect(names).toContain('Spellcharge')
    expect(names).toContain('Night Terror')
    expect(names).toContain('Twilight Toll')
    expect(names).toContain('Eclipse')
    expect(names).toContain('Specter of the Dark')
  })

  it('Midnight-Touched should be level 7 with correct feature', () => {
    const touched = midnight.cards.find((c) => c.name === 'Midnight-Touched')
    expect(touched.level).toBe(7)
    expect(touched.type).toBe('ability')
    expect(touched.feature).toContain('4 ou plus')
    expect(touched.feature).toContain('Dé de Peur')
  })

  it('hasSpells should be true', () => {
    expect(midnight.hasSpells).toBe(true)
  })

  it('classes should be Rogue, Sorcerer, Assassin', () => {
    expect(midnight.classes.sort()).toEqual(['Assassin', 'Rogue', 'Sorcerer'])
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
    expect(store.totalCardCount).toBeGreaterThanOrEqual(126)
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
