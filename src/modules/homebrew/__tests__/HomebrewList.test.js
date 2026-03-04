// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomebrewList from '../core/components/HomebrewList.vue'
import HomebrewCard from '../core/components/HomebrewCard.vue'

const sampleItems = [
  { id: '1', name: 'Dragon', type: 'Solo', tier: 3, source: 'custom', updatedAt: '2025-01-01T00:00:00Z' },
  { id: '2', name: 'Gobelin', type: 'Minion', tier: 1, source: 'custom', updatedAt: '2025-02-01T00:00:00Z' },
  { id: '3', name: 'Liche', type: 'Leader', tier: 4, source: 'custom', updatedAt: '2025-03-01T00:00:00Z' }
]

describe('HomebrewList', () => {
  const mountList = (items = sampleItems, extras = {}) => {
    return mount(HomebrewList, {
      props: {
        items,
        label: 'Adversaires',
        labelSingular: 'adversaire',
        searchQuery: '',
        sortField: 'name',
        sortDirection: 'asc',
        filteredCount: items.length,
        totalCount: items.length,
        ...extras
      }
    })
  }

  describe('rendu de base', () => {
    it('affiche la barre de recherche', () => {
      const wrapper = mountList()
      expect(wrapper.find('input[type="search"]').exists()).toBe(true)
    })

    it('affiche le compteur', () => {
      const wrapper = mountList()
      expect(wrapper.find('.homebrew-list__count').text()).toContain('3')
      expect(wrapper.find('.homebrew-list__count').text()).toContain('adversaires')
    })

    it('affiche le singulier pour 1 item', () => {
      const wrapper = mountList([sampleItems[0]], { filteredCount: 1, totalCount: 1 })
      const text = wrapper.find('.homebrew-list__count').text()
      expect(text).toContain('1')
      // Pas de 's' final
      expect(text).not.toContain('adversaires')
    })

    it('affiche le rapport filtre/total', () => {
      const wrapper = mountList(sampleItems, { filteredCount: 2, totalCount: 3 })
      expect(wrapper.find('.homebrew-list__count').text()).toContain('/ 3')
    })

    it('masque le rapport si egal', () => {
      const wrapper = mountList(sampleItems, { filteredCount: 3, totalCount: 3 })
      expect(wrapper.find('.homebrew-list__count').text()).not.toContain('/')
    })
  })

  describe('cartes', () => {
    it('affiche une carte par item', () => {
      const wrapper = mountList()
      const cards = wrapper.findAllComponents(HomebrewCard)
      expect(cards.length).toBe(3)
    })

    it('selectionne la carte correspondante', () => {
      const wrapper = mountList(sampleItems, { selectedId: '2' })
      const cards = wrapper.findAllComponents(HomebrewCard)
      expect(cards[1].props('selected')).toBe(true)
      expect(cards[0].props('selected')).toBe(false)
    })
  })

  describe('empty state', () => {
    it('affiche le message vide sans items', () => {
      const wrapper = mountList([], { filteredCount: 0, totalCount: 0 })
      expect(wrapper.find('.homebrew-list__empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('Aucun adversaire créé')
    })

    it('affiche le message filtre sans resultats', () => {
      const wrapper = mountList([], {
        searchQuery: 'xyz',
        filteredCount: 0,
        totalCount: 3,
        hasActiveFilters: true
      })
      expect(wrapper.text()).toContain('Aucun résultat')
    })
  })

  describe('evenements', () => {
    it('emet update:searchQuery a la saisie', async () => {
      const wrapper = mountList()
      await wrapper.find('input[type="search"]').setValue('Dragon')
      expect(wrapper.emitted('update:searchQuery')[0]).toEqual(['Dragon'])
    })

    it('emet create au clic sur Nouveau', async () => {
      const wrapper = mountList()
      await wrapper.find('.btn--primary').trigger('click')
      expect(wrapper.emitted('create')).toBeTruthy()
    })

    it('emet toggle-sort-direction au clic', async () => {
      const wrapper = mountList()
      const sortBtn = wrapper.findAll('.homebrew-list__sort .btn')[0]
      await sortBtn.trigger('click')
      expect(wrapper.emitted('toggle-sort-direction')).toBeTruthy()
    })

    it('emet clear-filters depuis l empty state', async () => {
      const wrapper = mountList([], {
        searchQuery: 'xyz',
        filteredCount: 0,
        totalCount: 3,
        hasActiveFilters: true
      })
      await wrapper.find('.homebrew-list__empty-link').trigger('click')
      expect(wrapper.emitted('clear-filters')).toBeTruthy()
    })

    it('propage select depuis une carte', async () => {
      const wrapper = mountList()
      const clickArea = wrapper.find('.homebrew-card__click-area')
      await clickArea.trigger('click')
      expect(wrapper.emitted('select')).toBeTruthy()
    })
  })

  describe('accessibilite', () => {
    it('a role region', () => {
      const wrapper = mountList()
      expect(wrapper.find('[role="region"]').exists()).toBe(true)
    })

    it('a un label sr-only pour la recherche', () => {
      const wrapper = mountList()
      expect(wrapper.find('.sr-only').exists()).toBe(true)
    })

    it('le compteur a aria-live', () => {
      const wrapper = mountList()
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    })

    it('la grille a role list', () => {
      const wrapper = mountList()
      expect(wrapper.find('[role="list"]').exists()).toBe(true)
    })
  })
})
