import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CommunityPreview from '../categories/community/CommunityPreview.vue'

describe('CommunityPreview', () => {
  const baseData = {
    name: 'Duneborne',
    emoji: '🏜️',
    description: 'Communauté nomade du désert, endurcis par le sable et le soleil brûlant.',
    feature: {
      name: 'Sand Walker',
      description: 'Vous avez l\'avantage sur les jets de survie en milieu aride et pour naviguer dans les tempêtes de sable.'
    },
    adjectives: ['adaptable', 'endurant', 'rusé', 'loyal', 'méfiant', 'sage'],
    flavor: 'Je suis Duneborne, alors bien sûr que je sais survivre dans le désert.'
  }

  const mountPreview = (data = baseData) => {
    return mount(CommunityPreview, { props: { data } })
  }

  describe('rendu de base', () => {
    it('affiche le nom de la communaute', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.community-preview__name').text()).toBe('Duneborne')
    })

    it('affiche l emoji', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.community-preview__emoji').text()).toBe('🏜️')
    })

    it('affiche la description', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.community-preview__description').text()).toContain('nomade du désert')
    })

    it('affiche un nom par defaut si vide', () => {
      const wrapper = mountPreview({ ...baseData, name: '' })
      expect(wrapper.find('.community-preview__name').text()).toBe('Nouvelle communauté')
    })

    it('affiche le message vide sans description', () => {
      const wrapper = mountPreview({ ...baseData, description: '' })
      expect(wrapper.find('.community-preview__empty').text()).toContain('Aucune description')
    })
  })

  describe('feature', () => {
    it('affiche le nom de la feature', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.community-preview__feature-name').text()).toBe('Sand Walker')
    })

    it('affiche la description de la feature', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.community-preview__feature-desc').text()).toContain('avantage sur les jets')
    })

    it('affiche un placeholder si feature vide', () => {
      const wrapper = mountPreview({ ...baseData, feature: {} })
      expect(wrapper.find('.community-preview__feature-name').text()).toBe('Feature')
    })
  })

  describe('adjectifs', () => {
    it('affiche les 6 adjectifs en chips', () => {
      const wrapper = mountPreview()
      const chips = wrapper.findAll('.community-preview__adjective-chip')
      expect(chips.length).toBe(6)
    })

    it('affiche chaque adjectif', () => {
      const wrapper = mountPreview()
      const text = wrapper.find('.community-preview__adjective-list').text()
      expect(text).toContain('adaptable')
      expect(text).toContain('sage')
    })

    it('masque la section si pas d adjectifs', () => {
      const wrapper = mountPreview({ ...baseData, adjectives: [] })
      expect(wrapper.find('.community-preview__adjectives').exists()).toBe(false)
    })

    it('affiche le titre de section', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.community-preview__section-title').text()).toBe('Adjectifs suggérés')
    })
  })

  describe('flavor', () => {
    it('affiche la phrase d exemple entre guillemets', () => {
      const wrapper = mountPreview()
      const flavor = wrapper.find('.community-preview__flavor-text')
      expect(flavor.text()).toContain('survivre dans le désert')
    })

    it('masque la section si pas de flavor', () => {
      const wrapper = mountPreview({ ...baseData, flavor: '' })
      expect(wrapper.find('.community-preview__flavor').exists()).toBe(false)
    })
  })

  describe('accessibilite', () => {
    it('a role region avec aria-label', () => {
      const wrapper = mountPreview()
      const region = wrapper.find('[role="region"]')
      expect(region.attributes('aria-label')).toContain('Duneborne')
    })

    it('la section feature a aria-label', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('[aria-label="Feature de communauté"]').exists()).toBe(true)
    })

    it('la section adjectifs a aria-label', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('[aria-label="Adjectifs suggérés"]').exists()).toBe(true)
    })

    it('l emoji a aria-hidden', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.community-preview__emoji').attributes('aria-hidden')).toBe('true')
    })
  })
})
