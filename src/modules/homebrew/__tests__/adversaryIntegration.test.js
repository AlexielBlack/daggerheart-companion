// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdversaryStore, useAdversaryHomebrewStore } from '@modules/adversaries/stores/adversaryStore.js'
import { allAdversaries } from '@data/adversaries'

/**
 * @tests Intégration adversaryStore + homebrew
 * @description Vérifie que le store principal fusionne correctement
 * les adversaires SRD et les adversaires custom homebrew.
 */
describe('adversaryStore — intégration homebrew', () => {
  let store
  let homebrewStore

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    setActivePinia(createPinia())
    store = useAdversaryStore()
    homebrewStore = useAdversaryHomebrewStore()
  })

  describe('fusion SRD + custom', () => {
    it('contient uniquement les SRD quand le homebrew est vide', () => {
      expect(store.allItems.length).toBe(allAdversaries.length)
      expect(store.totalCount).toBe(allAdversaries.length)
    })

    it('ajoute les adversaires custom a allItems', () => {
      homebrewStore.create({
        name: 'Dragon Custom',
        tier: 2,
        type: 'Solo',
        difficulty: 14,
        thresholds: { major: 10, severe: 20 },
        hp: 5,
        stress: 3,
        attack: { modifier: 2, name: 'Griffe', range: 'Melee', damage: '2d8+3', damageType: 'phy' }
      })

      expect(store.allItems.length).toBe(allAdversaries.length + 1)
      expect(store.totalCount).toBe(allAdversaries.length + 1)
    })

    it('les items custom ont source "custom"', () => {
      homebrewStore.create({
        name: 'Gobelin maison',
        tier: 1,
        type: 'Minion',
        difficulty: 11,
        thresholds: { major: 7, severe: 12 },
        hp: 3,
        stress: 1,
        attack: { modifier: 1, name: 'Dague', range: 'Melee', damage: '1d6+2', damageType: 'phy' }
      })

      const customItems = store.allItems.filter((a) => a.source === 'custom')
      expect(customItems).toHaveLength(1)
      expect(customItems[0].name).toBe('Gobelin maison')
    })

    it('les items SRD n ont pas de source "custom"', () => {
      const srdItems = store.allItems.filter((a) => a.source !== 'custom')
      expect(srdItems.length).toBe(allAdversaries.length)
    })
  })

  describe('filtrage mixte', () => {
    beforeEach(() => {
      homebrewStore.create({
        name: 'Zzz Custom Boss',
        tier: 3,
        type: 'Solo',
        difficulty: 17,
        thresholds: { major: 20, severe: 32 },
        hp: 7,
        stress: 4,
        attack: { modifier: 3, name: 'Frappe', range: 'Melee', damage: '3d8+4', damageType: 'phy' }
      })
    })

    it('la recherche trouve les adversaires custom', () => {
      store.setSearch('Zzz Custom Boss')
      expect(store.filteredAdversaries.some((a) => a.name === 'Zzz Custom Boss')).toBe(true)
    })

    it('le filtre par tier inclut les custom', () => {
      store.toggleTier(3)
      expect(store.filteredAdversaries.some((a) => a.name === 'Zzz Custom Boss')).toBe(true)
    })

    it('le filtre par type inclut les custom', () => {
      store.toggleType('Solo')
      expect(store.filteredAdversaries.some((a) => a.name === 'Zzz Custom Boss')).toBe(true)
    })
  })

  describe('getAdversaryById mixte', () => {
    it('trouve un adversaire SRD par id', () => {
      const srdAdversary = allAdversaries[0]
      const found = store.getAdversaryById(srdAdversary.id)
      expect(found).not.toBeNull()
      expect(found.name).toBe(srdAdversary.name)
    })

    it('trouve un adversaire custom par id', () => {
      const created = homebrewStore.create({
        name: 'Trouver moi',
        tier: 1,
        type: 'Standard',
        difficulty: 11,
        thresholds: { major: 7, severe: 12 },
        hp: 5,
        stress: 3,
        attack: { modifier: 1, name: 'Test', range: 'Melee', damage: '1d8+2', damageType: 'phy' }
      })

      const found = store.getAdversaryById(created.id)
      expect(found).not.toBeNull()
      expect(found.name).toBe('Trouver moi')
    })

    it('retourne null pour un id inexistant', () => {
      expect(store.getAdversaryById('fake-id-999')).toBeNull()
    })
  })

  describe('selection mixte', () => {
    it('peut selectionner un adversaire custom', () => {
      const created = homebrewStore.create({
        name: 'Sélectionnable',
        tier: 2,
        type: 'Leader',
        difficulty: 14,
        thresholds: { major: 10, severe: 20 },
        hp: 5,
        stress: 3,
        attack: { modifier: 2, name: 'Ordre', range: 'Far', damage: '2d6+3', damageType: 'mag' }
      })

      store.selectAdversary(created.id)
      expect(store.selectedAdversary).not.toBeNull()
      expect(store.selectedAdversary.name).toBe('Sélectionnable')
    })
  })

  describe('homebrewStore partagé', () => {
    it('est la même instance via adversaryStore et import direct', () => {
      homebrewStore.create({
        name: 'Shared Test',
        tier: 1,
        type: 'Minion',
        difficulty: 11,
        thresholds: { major: 7, severe: 12 },
        hp: 3,
        stress: 1,
        attack: { modifier: 1, name: 'Test', range: 'Melee', damage: '1d6+2', damageType: 'phy' }
      })

      // Les items ajoutés via homebrewStore doivent apparaître dans allItems
      expect(store.allItems.some((a) => a.name === 'Shared Test')).toBe(true)
    })
  })
})
