import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCommunityStore } from '../stores/communityStore.js'

describe('communityStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCommunityStore()
  })

  // ── État initial ──────────────────────────────────────

  describe('état initial', () => {
    it('searchQuery est vide', () => {
      expect(store.searchQuery).toBe('')
    })

    it('expandedId est null', () => {
      expect(store.expandedId).toBeNull()
    })

    it('totalCount est 9', () => {
      expect(store.totalCount).toBe(9)
    })

    it('filteredCount est 9 sans filtres', () => {
      expect(store.filteredCount).toBe(9)
    })

    it('hasActiveFilters est false', () => {
      expect(store.hasActiveFilters).toBe(false)
    })
  })

  // ── Recherche ─────────────────────────────────────────

  describe('setSearch', () => {
    it('filtre par nom', () => {
      store.setSearch('Highborne')
      expect(store.filteredCount).toBeGreaterThanOrEqual(1)
      expect(store.hasActiveFilters).toBe(true)
    })

    it('filtre par feature name', () => {
      store.setSearch('Lightfoot')
      expect(store.filteredCount).toBe(1)
      expect(store.filteredCommunities[0].id).toBe('wildborne')
    })

    it('filtre par adjectif', () => {
      store.setSearch('sardonic')
      expect(store.filteredCount).toBe(1)
      expect(store.filteredCommunities[0].id).toBe('orderborne')
    })

    it('est insensible à la casse', () => {
      store.setSearch('SCOUNDREL')
      expect(store.filteredCount).toBe(1)
    })

    it('retourne tout si query est vide', () => {
      store.setSearch('test')
      store.setSearch('')
      expect(store.filteredCount).toBe(9)
      expect(store.hasActiveFilters).toBe(false)
    })

    it('gère les inputs invalides', () => {
      store.setSearch(null)
      expect(store.searchQuery).toBe('')
      store.setSearch(42)
      expect(store.searchQuery).toBe('')
    })
  })

  // ── Expand / Collapse ─────────────────────────────────

  describe('toggleExpand', () => {
    it('développe une communauté', () => {
      store.toggleExpand('highborne')
      expect(store.expandedId).toBe('highborne')
    })

    it('bascule la même communauté (collapse)', () => {
      store.toggleExpand('highborne')
      store.toggleExpand('highborne')
      expect(store.expandedId).toBeNull()
    })

    it('change de communauté', () => {
      store.toggleExpand('highborne')
      store.toggleExpand('wildborne')
      expect(store.expandedId).toBe('wildborne')
    })
  })

  describe('collapseAll', () => {
    it('ferme la communauté développée', () => {
      store.toggleExpand('highborne')
      store.collapseAll()
      expect(store.expandedId).toBeNull()
    })
  })

  // ── expandedCommunity ─────────────────────────────────

  describe('expandedCommunity', () => {
    it('retourne null sans sélection', () => {
      expect(store.expandedCommunity).toBeNull()
    })

    it('retourne la communauté développée', () => {
      store.toggleExpand('seaborne')
      expect(store.expandedCommunity).toBeDefined()
      expect(store.expandedCommunity.name).toBe('Seaborne')
    })
  })

  // ── Reset ─────────────────────────────────────────────

  describe('resetAll', () => {
    it('réinitialise recherche et expansion', () => {
      store.setSearch('Highborne')
      store.toggleExpand('highborne')
      store.resetAll()
      expect(store.searchQuery).toBe('')
      expect(store.expandedId).toBeNull()
      expect(store.filteredCount).toBe(9)
    })
  })

  describe('clearFilters', () => {
    it('efface uniquement la recherche', () => {
      store.setSearch('test')
      store.toggleExpand('highborne')
      store.clearFilters()
      expect(store.searchQuery).toBe('')
      expect(store.expandedId).toBe('highborne')
    })
  })
})
