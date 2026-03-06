// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { useEncounterHistoryStore } from '../stores/encounterHistoryStore'
import EncounterHistory from '../components/EncounterHistory.vue'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ── Données de test ──────────────────────────────────

const makeSummary = (overrides = {}) => ({
  name: 'Embuscade gobeline',
  tier: 1,
  totalAdversaries: 3,
  defeated: [{ name: 'Gobelin A' }, { name: 'Gobelin B' }],
  surviving: [{ name: 'Gobelin C' }],
  pcsFallen: [],
  totalHPMarked: 12,
  totalStressMarked: 3,
  hitCount: 8,
  missCount: 4,
  pcHitCount: 2,
  endedAt: new Date().toISOString(),
  ...overrides
})

// ── Store ─────────────────────────────────────────────

describe('encounterHistoryStore', () => {
  let store

  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
    store = useEncounterHistoryStore()
  })

  describe('etat initial', () => {
    it('demarre avec un historique vide', () => {
      expect(store.all).toEqual([])
      expect(store.count).toBe(0)
    })

    it('stats a zero quand vide', () => {
      expect(store.stats.totalEncounters).toBe(0)
      expect(store.stats.hitRatio).toBe(0)
    })
  })

  describe('add', () => {
    it('ajoute un resume a l historique', () => {
      store.add(makeSummary())
      expect(store.count).toBe(1)
      expect(store.all[0].name).toBe('Embuscade gobeline')
    })

    it('genere un id unique', () => {
      store.add(makeSummary())
      expect(store.all[0].id).toBeTruthy()
    })

    it('ignore les valeurs null', () => {
      store.add(null)
      expect(store.count).toBe(0)
    })

    it('ordonne du plus recent au plus ancien', () => {
      store.add(makeSummary({ name: 'Premier' }))
      store.add(makeSummary({ name: 'Deuxieme' }))
      expect(store.all[0].name).toBe('Deuxieme')
      expect(store.all[1].name).toBe('Premier')
    })
  })

  describe('remove', () => {
    it('supprime par id', () => {
      store.add(makeSummary({ name: 'A' }))
      store.add(makeSummary({ name: 'B' }))
      const idToRemove = store.all[0].id
      store.remove(idToRemove)
      expect(store.count).toBe(1)
    })

    it('ne fait rien si id inexistant', () => {
      store.add(makeSummary())
      store.remove('inexistant')
      expect(store.count).toBe(1)
    })
  })

  describe('clear', () => {
    it('vide tout l historique', () => {
      store.add(makeSummary())
      store.add(makeSummary())
      store.clear()
      expect(store.count).toBe(0)
    })
  })

  describe('stats agregees', () => {
    it('calcule les totaux sur plusieurs rencontres', () => {
      store.add(makeSummary({ hitCount: 10, missCount: 5, defeated: [{ name: 'A' }], pcsFallen: [] }))
      store.add(makeSummary({ hitCount: 6, missCount: 4, defeated: [{ name: 'B' }, { name: 'C' }], pcsFallen: [{ name: 'PJ1' }] }))

      const s = store.stats
      expect(s.totalEncounters).toBe(2)
      expect(s.totalDefeated).toBe(3)
      expect(s.totalPcsFallen).toBe(1)
      expect(s.totalHits).toBe(16)
      expect(s.totalMisses).toBe(9)
      expect(s.hitRatio).toBe(64) // 16/(16+9) = 64%
    })
  })
})

// ── Composant ─────────────────────────────────────────

describe('EncounterHistory composant', () => {
  const defaultStats = { totalEncounters: 0, totalDefeated: 0, hitRatio: 0, totalPcsFallen: 0 }

  const mountHistory = (entries = [], stats = defaultStats) => {
    return mount(EncounterHistory, {
      props: { entries, stats }
    })
  }

  describe('empty state', () => {
    it('affiche le message vide', () => {
      const wrapper = mountHistory()
      expect(wrapper.text()).toContain('Aucune rencontre terminée')
    })

    it('masque le bouton vider', () => {
      const wrapper = mountHistory()
      expect(wrapper.find('.history-clear').exists()).toBe(false)
    })
  })

  describe('avec des entrees', () => {
    const entries = [
      {
        id: 'a1',
        name: 'Combat de boss',
        tier: 3,
        defeated: [{ name: 'Boss' }],
        totalAdversaries: 2,
        hitCount: 10,
        missCount: 3,
        pcsFallen: [],
        endedAt: '2026-03-01T14:00:00Z'
      }
    ]
    const stats = { totalEncounters: 1, totalDefeated: 1, hitRatio: 77, totalPcsFallen: 0 }

    it('affiche le nom de la rencontre', () => {
      const wrapper = mountHistory(entries, stats)
      expect(wrapper.text()).toContain('Combat de boss')
    })

    it('affiche les stat chips', () => {
      const wrapper = mountHistory(entries, stats)
      const chips = wrapper.findAll('.stat-chip__value')
      expect(chips.length).toBe(4)
    })

    it('affiche les tags hit/miss', () => {
      const wrapper = mountHistory(entries, stats)
      expect(wrapper.find('.tag--hit').text()).toContain('10')
      expect(wrapper.find('.tag--miss').text()).toContain('3')
    })

    it('affiche le bouton vider', () => {
      const wrapper = mountHistory(entries, stats)
      expect(wrapper.find('.history-clear').exists()).toBe(true)
    })
  })

  describe('evenements', () => {
    const entries = [{ id: 'x1', name: 'Test', tier: 1, defeated: [], totalAdversaries: 1, endedAt: '2026-01-01T00:00:00Z' }]
    const stats = { totalEncounters: 1, totalDefeated: 0, hitRatio: 0, totalPcsFallen: 0 }

    it('emet remove au clic supprimer', async () => {
      const wrapper = mountHistory(entries, stats)
      await wrapper.find('.history-item__delete').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
      expect(wrapper.emitted('remove')[0]).toEqual(['x1'])
    })

    it('emet clear au clic vider', async () => {
      const wrapper = mountHistory(entries, stats)
      await wrapper.find('.history-clear').trigger('click')
      expect(wrapper.emitted('clear')).toBeTruthy()
    })
  })

  describe('accessibilite', () => {
    it('a role region', () => {
      const wrapper = mountHistory()
      expect(wrapper.find('[role="region"]').exists()).toBe(true)
    })

    it('a aria-label', () => {
      const wrapper = mountHistory()
      expect(wrapper.find('[aria-label]').exists()).toBe(true)
    })
  })
})
