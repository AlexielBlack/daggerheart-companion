/**
 * @module domains/__tests__/domains.test
 * @description Tests d'intégrité structurelle, logique utilitaire et store des domaines.
 *
 * Vérifications SRD carte-par-carte supprimées (9 blocs × ~80 lignes).
 * On conserve : structure, cross-domain integrity, fonctions utilitaires, store.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  DOMAINS,
  CARD_TYPES,
  getDomainById,
  getDomainsForClass,
  getCardsForDomain,
  getCardById,
  getCardsByLevel,
  getCardsByType
} from '../index.js'
import { useDomainStore } from '@/modules/domains/stores/domainStore.js'

// ── Structure ───────────────────────────────────────────

describe('Domain data — structure', () => {
  it('contient des domaines', () => {
    expect(DOMAINS.length).toBeGreaterThan(0)
  })

  it('IDs uniques', () => {
    const ids = DOMAINS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque domaine a les champs requis', () => {
    DOMAINS.forEach((d) => {
      const fields = ['id', 'name', 'emoji', 'color', 'description', 'classes', 'themes', 'hasSpells', 'cardCount', 'cards']
      fields.forEach((f) => expect(d, `${d.id} manque "${f}"`).toHaveProperty(f))
      expect(Array.isArray(d.classes)).toBe(true)
      expect(Array.isArray(d.cards)).toBe(true)
      expect(d.classes.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('chaque domaine a le bon nombre de cartes', () => {
    DOMAINS.forEach((d) => {
      expect(d.cards.length, `${d.id} cards.length vs cardCount`).toBe(d.cardCount)
    })
  })

  it('chaque carte a les champs requis', () => {
    DOMAINS.forEach((d) => {
      d.cards.forEach((c) => {
        const fields = ['id', 'name', 'level', 'type']
        fields.forEach((f) => expect(c, `${c.id} manque "${f}"`).toHaveProperty(f))
        expect(c.level).toBeGreaterThanOrEqual(1)
        expect(c.level).toBeLessThanOrEqual(10)
      })
    })
  })

  it('CARD_TYPES valides', () => {
    expect(CARD_TYPES).toHaveProperty('spell')
    expect(CARD_TYPES).toHaveProperty('grimoire')
    expect(CARD_TYPES).toHaveProperty('ability')
  })
})

// ── Cross-domain integrity ──────────────────────────────

describe('Domain data — cross-domain integrity', () => {
  it('tous les card IDs sont uniques entre domaines', () => {
    const allIds = DOMAINS.flatMap((d) => d.cards.map((c) => c.id))
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('les card IDs sont préfixés par leur domaine', () => {
    DOMAINS.forEach((d) => {
      d.cards.forEach((c) => {
        expect(c.id.startsWith(d.id + '-'), `${c.id} devrait commencer par ${d.id}-`).toBe(true)
      })
    })
  })
})

// ── Utility functions ───────────────────────────────────

describe('Domain utility functions', () => {
  const firstDomain = DOMAINS[0]
  const firstCard = firstDomain.cards[0]
  const firstClass = firstDomain.classes[0]

  it('getDomainById — trouve un domaine existant', () => {
    const d = getDomainById(firstDomain.id)
    expect(d).not.toBeNull()
    expect(d.id).toBe(firstDomain.id)
  })

  it('getDomainById — retourne null pour inconnu', () => {
    expect(getDomainById('nonexistent')).toBeNull()
  })

  it('getDomainsForClass — retourne les domaines associés', () => {
    const domains = getDomainsForClass(firstClass)
    expect(domains.length).toBeGreaterThanOrEqual(1)
    expect(domains.some((d) => d.id === firstDomain.id)).toBe(true)
  })

  it('getCardsForDomain — retourne les cartes du domaine', () => {
    const cards = getCardsForDomain(firstDomain.id)
    expect(cards).toHaveLength(firstDomain.cardCount)
  })

  it('getCardsForDomain — retourne vide pour inconnu', () => {
    expect(getCardsForDomain('fake')).toEqual([])
  })

  it('getCardById — trouve une carte existante', () => {
    const card = getCardById(firstCard.id)
    expect(card).not.toBeNull()
    expect(card.name).toBe(firstCard.name)
    expect(card.domain).toBe(firstDomain.id)
  })

  it('getCardById — retourne null pour inconnu', () => {
    expect(getCardById('nonexistent')).toBeNull()
  })

  it('getCardsByLevel — retourne des cartes pour un niveau valide', () => {
    const cards = getCardsByLevel(1)
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every((c) => c.level === 1)).toBe(true)
  })

  it('getCardsByType — filtre par type', () => {
    const types = Object.keys(CARD_TYPES)
    types.forEach((type) => {
      const cards = getCardsByType(type)
      if (cards.length > 0) {
        expect(cards.every((c) => c.type === type)).toBe(true)
      }
    })
  })
})

// ── Domain store ────────────────────────────────────────

describe('Domain store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDomainStore()
  })

  it('initialise avec tous les domaines', () => {
    expect(store.allDomains).toHaveLength(DOMAINS.length)
    expect(store.domainCount).toBe(DOMAINS.length)
  })

  it('compte le total de cartes', () => {
    const expected = DOMAINS.reduce((sum, d) => sum + d.cardCount, 0)
    expect(store.totalCardCount).toBe(expected)
  })

  it('filtre par recherche (nom de domaine)', () => {
    const first = DOMAINS[0]
    store.setSearch(first.id)
    expect(store.filteredDomains.length).toBeGreaterThanOrEqual(1)
    expect(store.filteredDomains[0].id).toBe(first.id)
  })

  it('filtre par classe dans la recherche', () => {
    const domainWithClass = DOMAINS[0]
    const className = domainWithClass.classes[0]
    store.setSearch(className)
    expect(store.filteredDomains.some((d) => d.id === domainWithClass.id)).toBe(true)
  })

  it('filtre par type spell/martial', () => {
    store.setFilterSpell('spells')
    expect(store.filteredDomains.every((d) => d.hasSpells)).toBe(true)

    store.setFilterSpell('martial')
    expect(store.filteredDomains.every((d) => !d.hasSpells)).toBe(true)
  })

  it('sélectionne et désélectionne un domaine', () => {
    const first = DOMAINS[0]
    expect(store.selectedDomainId).toBeNull()

    store.selectDomain(first.id)
    expect(store.selectedDomainId).toBe(first.id)

    store.selectDomain(first.id) // toggle off
    expect(store.selectedDomainId).toBeNull()
  })

  it('affiche les cartes du domaine sélectionné', () => {
    const first = DOMAINS[0]
    store.selectDomain(first.id)
    expect(store.selectedDomainCards).toHaveLength(first.cardCount)
  })

  it('filtre les cartes par type', () => {
    store.selectDomain(DOMAINS[0].id)
    store.setFilterType('ability')
    expect(store.selectedDomainCards.every((c) => c.type === 'ability')).toBe(true)
  })

  it('filtre les cartes par niveau', () => {
    store.selectDomain(DOMAINS[0].id)
    store.setFilterLevel(1)
    expect(store.selectedDomainCards.every((c) => c.level === 1)).toBe(true)
  })

  it('liste les niveaux disponibles', () => {
    store.selectDomain(DOMAINS[0].id)
    expect(store.availableLevels.length).toBeGreaterThan(0)
    expect(store.availableLevels).toEqual([...store.availableLevels].sort((a, b) => a - b))
  })

  it('reset tous les filtres', () => {
    store.setSearch('test')
    store.selectDomain(DOMAINS[0].id)
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
})
