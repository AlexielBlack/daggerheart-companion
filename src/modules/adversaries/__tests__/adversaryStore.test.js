/**
 * @file adversaryStore.test.js
 * @description Tests du store Pinia pour les adversaires.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdversaryStore } from '../stores/adversaryStore.js'
import { allAdversaries, ADVERSARY_TYPES, TIERS } from '@data/adversaries'

describe('adversaryStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAdversaryStore()
  })

  // ── Initialisation ──────────────────────────────────────

  describe('initialisation', () => {
    it('charge tous les adversaires', () => {
      expect(store.totalCount).toBeGreaterThan(0)
      expect(store.totalCount).toBe(allAdversaries.length)
    })

    it('expose les types et tiers disponibles', () => {
      expect(store.availableTypes).toEqual(ADVERSARY_TYPES)
      expect(store.availableTiers).toEqual(TIERS)
    })

    it('n\'a pas de filtres actifs initialement', () => {
      expect(store.hasActiveFilters).toBe(false)
      expect(store.filteredCount).toBe(store.totalCount)
    })

    it('n\'a pas de sélection initiale', () => {
      expect(store.selectedAdversaryId).toBeNull()
      expect(store.selectedAdversary).toBeNull()
    })

    it('tri par nom ascendant par défaut', () => {
      expect(store.sortField).toBe('name')
      expect(store.sortDirection).toBe('asc')
    })
  })

  // ── Recherche ───────────────────────────────────────────

  describe('recherche', () => {
    it('filtre par nom', () => {
      store.setSearch('Bear')
      expect(store.filteredAdversaries.some((a) => a.name === 'Bear')).toBe(true)
      expect(store.filteredCount).toBeLessThan(store.totalCount)
    })

    it('filtre par description (insensible à la casse)', () => {
      store.setSearch('skeleton')
      const results = store.filteredAdversaries
      expect(results.length).toBeGreaterThan(0)
      results.forEach((a) => {
        const matchesName = a.name.toLowerCase().includes('skeleton')
        const matchesDesc = a.description.toLowerCase().includes('skeleton')
        const matchesMotives = a.motives.some((m) => m.toLowerCase().includes('skeleton'))
        expect(matchesName || matchesDesc || matchesMotives).toBe(true)
      })
    })

    it('retourne aucun résultat pour un terme inexistant', () => {
      store.setSearch('xyznonexistent123')
      expect(store.filteredCount).toBe(0)
    })

    it('ignore les espaces vides', () => {
      store.setSearch('   ')
      expect(store.filteredCount).toBe(store.totalCount)
    })
  })

  // ── Filtres par Tier ────────────────────────────────────

  describe('filtres par tier', () => {
    it('filtre par un seul tier', () => {
      store.toggleTier(1)
      expect(store.selectedTiers).toEqual([1])
      store.filteredAdversaries.forEach((a) => {
        expect(a.tier).toBe(1)
      })
    })

    it('filtre par plusieurs tiers', () => {
      store.toggleTier(1)
      store.toggleTier(3)
      expect(store.selectedTiers).toEqual([1, 3])
      store.filteredAdversaries.forEach((a) => {
        expect([1, 3]).toContain(a.tier)
      })
    })

    it('désactive un tier en re-cliquant', () => {
      store.toggleTier(1)
      store.toggleTier(1)
      expect(store.selectedTiers).toEqual([])
      expect(store.filteredCount).toBe(store.totalCount)
    })
  })

  // ── Filtres par Type ────────────────────────────────────

  describe('filtres par type', () => {
    it('filtre par type', () => {
      store.toggleType('Solo')
      store.filteredAdversaries.forEach((a) => {
        expect(a.type).toBe('Solo')
      })
    })

    it('combine tier + type', () => {
      store.toggleTier(1)
      store.toggleType('Bruiser')
      store.filteredAdversaries.forEach((a) => {
        expect(a.tier).toBe(1)
        expect(a.type).toBe('Bruiser')
      })
    })
  })

  // ── Tri ─────────────────────────────────────────────────

  describe('tri', () => {
    it('trie par nom (asc) par défaut', () => {
      const names = store.filteredAdversaries.map((a) => a.name)
      const sorted = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sorted)
    })

    it('change de direction en appelant setSort sur le même champ', () => {
      store.setSort('name') // déjà name → toggle direction
      expect(store.sortDirection).toBe('desc')
      const names = store.filteredAdversaries.map((a) => a.name)
      const sorted = [...names].sort((a, b) => b.localeCompare(a))
      expect(names).toEqual(sorted)
    })

    it('trie par tier', () => {
      store.setSort('tier')
      const tiers = store.filteredAdversaries.map((a) => a.tier)
      for (let i = 1; i < tiers.length; i++) {
        expect(tiers[i]).toBeGreaterThanOrEqual(tiers[i - 1])
      }
    })

    it('trie par difficulté', () => {
      store.setSort('difficulty')
      const diffs = store.filteredAdversaries.map((a) => a.difficulty)
      for (let i = 1; i < diffs.length; i++) {
        expect(diffs[i]).toBeGreaterThanOrEqual(diffs[i - 1])
      }
    })

    it('trie par HP', () => {
      store.setSort('hp')
      const hps = store.filteredAdversaries.map((a) => a.hp)
      for (let i = 1; i < hps.length; i++) {
        expect(hps[i]).toBeGreaterThanOrEqual(hps[i - 1])
      }
    })

    it('change de champ de tri et remet asc', () => {
      store.setSort('name') // toggle → desc
      store.setSort('tier') // nouveau champ → asc
      expect(store.sortField).toBe('tier')
      expect(store.sortDirection).toBe('asc')
    })
  })

  // ── Sélection ───────────────────────────────────────────

  describe('sélection', () => {
    it('sélectionne un adversaire par id', () => {
      const firstId = allAdversaries[0].id
      store.selectAdversary(firstId)
      expect(store.selectedAdversaryId).toBe(firstId)
      expect(store.selectedAdversary).toEqual(allAdversaries[0])
    })

    it('retourne null pour un id invalide', () => {
      store.selectAdversary('nonexistent-id')
      expect(store.selectedAdversary).toBeNull()
    })

    it('efface la sélection', () => {
      store.selectAdversary(allAdversaries[0].id)
      store.clearSelection()
      expect(store.selectedAdversaryId).toBeNull()
      expect(store.selectedAdversary).toBeNull()
    })
  })

  // ── Lookup direct ───────────────────────────────────────

  describe('getAdversaryById', () => {
    it('trouve un adversaire existant', () => {
      const result = store.getAdversaryById('bear')
      expect(result).not.toBeNull()
      expect(result.name).toBe('Bear')
    })

    it('retourne null pour un id inconnu', () => {
      expect(store.getAdversaryById('fake')).toBeNull()
    })
  })

  // ── Réinitialisation ────────────────────────────────────

  describe('réinitialisation', () => {
    it('clearFilters efface les filtres mais pas la sélection', () => {
      store.setSearch('bear')
      store.toggleTier(1)
      store.toggleType('Solo')
      store.selectAdversary(allAdversaries[0].id)
      store.clearFilters()
      expect(store.searchQuery).toBe('')
      expect(store.selectedTiers).toEqual([])
      expect(store.selectedTypes).toEqual([])
      expect(store.selectedAdversaryId).toBe(allAdversaries[0].id)
    })

    it('resetAll remet tout à zéro', () => {
      store.setSearch('bear')
      store.toggleTier(1)
      store.setSort('hp')
      store.selectAdversary(allAdversaries[0].id)
      store.resetAll()
      expect(store.searchQuery).toBe('')
      expect(store.selectedTiers).toEqual([])
      expect(store.selectedTypes).toEqual([])
      expect(store.selectedAdversaryId).toBeNull()
      expect(store.sortField).toBe('name')
      expect(store.sortDirection).toBe('asc')
    })
  })

  // ── Intégrité des données ───────────────────────────────

  describe('intégrité des données', () => {
    it('tous les adversaires ont un id unique', () => {
      const ids = allAdversaries.map((a) => a.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('tous les adversaires ont les champs requis', () => {
      allAdversaries.forEach((a) => {
        expect(typeof a.id).toBe('string')
        expect(typeof a.name).toBe('string')
        expect(typeof a.tier).toBe('number')
        expect([1, 2, 3, 4]).toContain(a.tier)
        expect(typeof a.type).toBe('string')
        expect(typeof a.difficulty).toBe('number')
        expect(typeof a.hp).toBe('number')
        expect(typeof a.stress).toBe('number')
        if (a.attack !== null) {
          expect(typeof a.attack.name).toBe('string')
          expect(typeof a.attack.range).toBe('string')
        }
        expect(Array.isArray(a.features)).toBe(true)
        expect(Array.isArray(a.experiences)).toBe(true)
      })
    })

    it('tous les types d\'adversaires sont valides', () => {
      allAdversaries.forEach((a) => {
        expect(ADVERSARY_TYPES).toContain(a.type)
      })
    })

    it('les features ont un activationType valide', () => {
      allAdversaries.forEach((a) => {
        a.features.forEach((f) => {
          expect(['passive', 'action', 'reaction']).toContain(f.activationType)
          expect(typeof f.name).toBe('string')
          expect(typeof f.description).toBe('string')
        })
      })
    })

    it('les thresholds sont cohérents', () => {
      allAdversaries.forEach((a) => {
        if (a.thresholds && a.thresholds.major !== null && a.thresholds.severe !== null) {
          expect(a.thresholds.severe).toBeGreaterThan(a.thresholds.major)
        }
      })
    })
  })
})
