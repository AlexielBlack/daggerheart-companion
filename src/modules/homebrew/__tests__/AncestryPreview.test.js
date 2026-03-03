import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AncestryPreview from '../categories/ancestry/AncestryPreview.vue'

describe('AncestryPreview', () => {
  const baseData = {
    name: 'Lithborn',
    emoji: '🪨',
    description: 'Des êtres de pierre vivante, nés de la roche elle-même.',
    topFeature: {
      name: 'Stone Resilience',
      description: 'Vous pouvez marquer 2 Stress pour réduire les dégâts physiques entrants de 3.'
    },
    bottomFeature: {
      name: 'Tremor Sense',
      description: 'Vous sentez les vibrations du sol. Vous avez l\'avantage sur les jets pour détecter des créatures au sol à portée Proche.'
    }
  }

  const mountPreview = (data = baseData) => {
    return mount(AncestryPreview, { props: { data } })
  }

  describe('rendu de base', () => {
    it('affiche le nom de l ascendance', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.ancestry-preview__name').text()).toBe('Lithborn')
    })

    it('affiche l emoji', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.ancestry-preview__emoji').text()).toBe('🪨')
    })

    it('affiche la description', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.ancestry-preview__description').text()).toContain('pierre vivante')
    })

    it('affiche un nom par defaut si vide', () => {
      const wrapper = mountPreview({ ...baseData, name: '' })
      expect(wrapper.find('.ancestry-preview__name').text()).toBe('Nouvelle ascendance')
    })

    it('affiche le message vide sans description', () => {
      const wrapper = mountPreview({ ...baseData, description: '' })
      expect(wrapper.find('.ancestry-preview__empty').text()).toContain('Aucune description')
    })
  })

  describe('top feature', () => {
    it('affiche le nom de la top feature', () => {
      const wrapper = mountPreview()
      const topSection = wrapper.find('.ancestry-preview__feature--top')
      expect(topSection.find('.ancestry-preview__feature-name').text()).toBe('Stone Resilience')
    })

    it('affiche la description de la top feature', () => {
      const wrapper = mountPreview()
      const topSection = wrapper.find('.ancestry-preview__feature--top')
      expect(topSection.find('.ancestry-preview__feature-desc').text()).toContain('marquer 2 Stress')
    })

    it('affiche le badge top (triangle haut)', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.ancestry-preview__feature-badge--top').text()).toBe('▲')
    })

    it('affiche un placeholder si top feature vide', () => {
      const wrapper = mountPreview({ ...baseData, topFeature: {} })
      const topSection = wrapper.find('.ancestry-preview__feature--top')
      expect(topSection.find('.ancestry-preview__feature-name').text()).toBe('Feature haute')
    })
  })

  describe('bottom feature', () => {
    it('affiche le nom de la bottom feature', () => {
      const wrapper = mountPreview()
      const bottomSection = wrapper.find('.ancestry-preview__feature--bottom')
      expect(bottomSection.find('.ancestry-preview__feature-name').text()).toBe('Tremor Sense')
    })

    it('affiche la description de la bottom feature', () => {
      const wrapper = mountPreview()
      const bottomSection = wrapper.find('.ancestry-preview__feature--bottom')
      expect(bottomSection.find('.ancestry-preview__feature-desc').text()).toContain('vibrations')
    })

    it('affiche le badge bottom (triangle bas)', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.ancestry-preview__feature-badge--bottom').text()).toBe('▼')
    })
  })

  describe('mixed ancestry note', () => {
    it('affiche la note sur les ascendances mixtes', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.ancestry-preview__mixed-note').text()).toContain('ascendance mixte')
    })
  })

  describe('accessibilite', () => {
    it('a role region avec aria-label', () => {
      const wrapper = mountPreview()
      const region = wrapper.find('[role="region"]')
      expect(region.attributes('aria-label')).toContain('Lithborn')
    })

    it('les sections features ont aria-label', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('[aria-label="Feature haute"]').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Feature basse"]').exists()).toBe(true)
    })

    it('l emoji a aria-hidden', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.ancestry-preview__emoji').attributes('aria-hidden')).toBe('true')
    })
  })
})
