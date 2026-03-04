/**
 * @file environmentStore.test.js
 * @description Tests du store Pinia pour les environnements.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEnvironmentStore } from '../stores/environmentStore.js'
import { allEnvironments, ENVIRONMENT_TYPES, TIERS, FEATURE_TYPES } from '@data/environments'

describe('environmentStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEnvironmentStore()
  })

  // ── Initialisation ──────────────────────────────────────

  describe('initialisation', () => {
    it('charge tous les environnements', () => {
      expect(store.totalCount).toBeGreaterThan(0)
      expect(store.totalCount).toBe(allEnvironments.length)
    })

    it('expose les types et tiers disponibles', () => {
      expect(store.availableTypes).toEqual(ENVIRONMENT_TYPES)
      expect(store.availableTiers).toEqual(TIERS)
    })

    it('n\'a pas de filtres actifs initialement', () => {
      expect(store.hasActiveFilters).toBe(false)
      expect(store.filteredCount).toBe(store.totalCount)
    })

    it('n\'a pas de sélection initiale', () => {
      expect(store.selectedEnvironmentId).toBeNull()
      expect(store.selectedEnvironment).toBeNull()
    })

    it('tri par nom ascendant par défaut', () => {
      expect(store.sortField).toBe('name')
      expect(store.sortDirection).toBe('asc')
    })
  })

  // ── Recherche ───────────────────────────────────────────

  describe('recherche', () => {
    it('filtre par nom', () => {
      store.setSearch('Raging')
      expect(store.filteredAdversaries || store.filteredEnvironments).toBeTruthy()
      expect(store.filteredEnvironments.some((e) => e.name === 'Raging River')).toBe(true)
      expect(store.filteredCount).toBeLessThan(store.totalCount)
    })

    it('filtre par description (insensible à la casse)', () => {
      store.setSearch('tavern')
      const results = store.filteredEnvironments
      expect(results.length).toBeGreaterThan(0)
      results.forEach((e) => {
        const matchesName = e.name.toLowerCase().includes('tavern')
        const matchesDesc = e.description.toLowerCase().includes('tavern')
        const matchesImpulses = e.impulses.some((i) => i.toLowerCase().includes('tavern'))
        expect(matchesName || matchesDesc || matchesImpulses).toBe(true)
      })
    })

    it('filtre par impulsions', () => {
      store.setSearch('Convertir')
      const results = store.filteredEnvironments
      expect(results.length).toBeGreaterThan(0)
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
      store.filteredEnvironments.forEach((e) => {
        expect(e.tier).toBe(1)
      })
    })

    it('filtre par plusieurs tiers', () => {
      store.toggleTier(1)
      store.toggleTier(3)
      expect(store.selectedTiers).toEqual([1, 3])
      store.filteredEnvironments.forEach((e) => {
        expect([1, 3]).toContain(e.tier)
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
      store.toggleType('Social')
      store.filteredEnvironments.forEach((e) => {
        expect(e.type).toBe('Social')
      })
    })

    it('combine tier + type', () => {
      store.toggleTier(1)
      store.toggleType('Traversal')
      store.filteredEnvironments.forEach((e) => {
        expect(e.tier).toBe(1)
        expect(e.type).toBe('Traversal')
      })
    })
  })

  // ── Tri ─────────────────────────────────────────────────

  describe('tri', () => {
    it('trie par nom (asc) par défaut', () => {
      const names = store.filteredEnvironments.map((e) => e.name)
      const sorted = [...names].sort((a, b) => a.localeCompare(b))
      expect(names).toEqual(sorted)
    })

    it('change de direction en appelant setSort sur le même champ', () => {
      store.setSort('name') // déjà name → toggle direction
      expect(store.sortDirection).toBe('desc')
      const names = store.filteredEnvironments.map((e) => e.name)
      const sorted = [...names].sort((a, b) => b.localeCompare(a))
      expect(names).toEqual(sorted)
    })

    it('trie par tier', () => {
      store.setSort('tier')
      const tiers = store.filteredEnvironments.map((e) => e.tier)
      for (let i = 1; i < tiers.length; i++) {
        expect(tiers[i]).toBeGreaterThanOrEqual(tiers[i - 1])
      }
    })

    it('trie par type', () => {
      store.setSort('type')
      const types = store.filteredEnvironments.map((e) => e.type)
      for (let i = 1; i < types.length; i++) {
        expect(types[i].localeCompare(types[i - 1])).toBeGreaterThanOrEqual(0)
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
    it('sélectionne un environnement par id', () => {
      const firstId = allEnvironments[0].id
      store.selectEnvironment(firstId)
      expect(store.selectedEnvironmentId).toBe(firstId)
      expect(store.selectedEnvironment).toEqual(allEnvironments[0])
    })

    it('retourne null pour un id invalide', () => {
      store.selectEnvironment('nonexistent-id')
      expect(store.selectedEnvironment).toBeNull()
    })

    it('efface la sélection', () => {
      store.selectEnvironment(allEnvironments[0].id)
      store.clearSelection()
      expect(store.selectedEnvironmentId).toBeNull()
      expect(store.selectedEnvironment).toBeNull()
    })
  })

  // ── Lookup direct ───────────────────────────────────────

  describe('getEnvironmentById', () => {
    it('trouve un environnement existant', () => {
      const result = store.getEnvironmentById('raging-river')
      expect(result).not.toBeNull()
      expect(result.name).toBe('Raging River')
    })

    it('retourne null pour un id inconnu', () => {
      expect(store.getEnvironmentById('fake')).toBeNull()
    })
  })

  // ── Réinitialisation ────────────────────────────────────

  describe('réinitialisation', () => {
    it('clearFilters efface les filtres mais pas la sélection', () => {
      store.setSearch('river')
      store.toggleTier(1)
      store.toggleType('Social')
      store.selectEnvironment(allEnvironments[0].id)
      store.clearFilters()
      expect(store.searchQuery).toBe('')
      expect(store.selectedTiers).toEqual([])
      expect(store.selectedTypes).toEqual([])
      expect(store.selectedEnvironmentId).toBe(allEnvironments[0].id)
    })

    it('resetAll remet tout à zéro', () => {
      store.setSearch('river')
      store.toggleTier(1)
      store.setSort('tier')
      store.selectEnvironment(allEnvironments[0].id)
      store.resetAll()
      expect(store.searchQuery).toBe('')
      expect(store.selectedTiers).toEqual([])
      expect(store.selectedTypes).toEqual([])
      expect(store.selectedEnvironmentId).toBeNull()
      expect(store.sortField).toBe('name')
      expect(store.sortDirection).toBe('asc')
    })
  })

  // ── Intégrité des données ───────────────────────────────

  describe('intégrité des données', () => {
    it('contient exactement 19 environnements SRD', () => {
      expect(allEnvironments.length).toBe(19)
    })

    it('tous les environnements ont un id unique', () => {
      const ids = allEnvironments.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('tous les environnements ont les champs requis', () => {
      allEnvironments.forEach((e) => {
        expect(typeof e.id).toBe('string')
        expect(typeof e.name).toBe('string')
        expect(typeof e.tier).toBe('number')
        expect([1, 2, 3, 4]).toContain(e.tier)
        expect(typeof e.type).toBe('string')
        expect(typeof e.description).toBe('string')
        expect(Array.isArray(e.impulses)).toBe(true)
        expect(e.impulses.length).toBeGreaterThan(0)
        expect(Array.isArray(e.potentialAdversaries)).toBe(true)
        expect(Array.isArray(e.features)).toBe(true)
        expect(e.features.length).toBeGreaterThan(0)
      })
    })

    it('tous les types d\'environnements sont valides', () => {
      allEnvironments.forEach((e) => {
        expect(ENVIRONMENT_TYPES).toContain(e.type)
      })
    })

    it('les features ont un type valide', () => {
      allEnvironments.forEach((e) => {
        e.features.forEach((f) => {
          expect(FEATURE_TYPES).toContain(f.type)
          expect(typeof f.name).toBe('string')
          expect(typeof f.description).toBe('string')
        })
      })
    })

    it('les fearCosts sont null ou un nombre positif', () => {
      allEnvironments.forEach((e) => {
        e.features.forEach((f) => {
          if (f.fearCost !== null) {
            expect(typeof f.fearCost).toBe('number')
            expect(f.fearCost).toBeGreaterThan(0)
          }
        })
      })
    })

    it('les questions sont des chaînes non vides quand présentes', () => {
      allEnvironments.forEach((e) => {
        e.features.forEach((f) => {
          if (f.questions) {
            expect(typeof f.questions).toBe('string')
            expect(f.questions.length).toBeGreaterThan(0)
          }
        })
      })
    })

    it('les difficultés sont null ou des nombres raisonnables', () => {
      allEnvironments.forEach((e) => {
        if (e.difficulty !== null) {
          expect(typeof e.difficulty).toBe('number')
          expect(e.difficulty).toBeGreaterThanOrEqual(10)
          expect(e.difficulty).toBeLessThanOrEqual(25)
        }
      })
    })

    it('les répartitions par tier sont correctes', () => {
      const t1 = allEnvironments.filter((e) => e.tier === 1)
      const t2 = allEnvironments.filter((e) => e.tier === 2)
      const t3 = allEnvironments.filter((e) => e.tier === 3)
      const t4 = allEnvironments.filter((e) => e.tier === 4)
      expect(t1.length).toBe(8)
      expect(t2.length).toBe(4)
      expect(t3.length).toBe(3)
      expect(t4.length).toBe(4)
    })

    it('les potentialAdversaries ont la bonne structure', () => {
      allEnvironments.forEach((e) => {
        e.potentialAdversaries.forEach((pa) => {
          expect(Array.isArray(pa.names)).toBe(true)
          expect(pa.names.length).toBeGreaterThan(0)
        })
      })
    })
  })
})
