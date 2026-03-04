// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdversaryPreview from '../categories/adversary/AdversaryPreview.vue'

/**
 * @tests AdversaryPreview
 * @description Vérifie le rendu du stat block d'aperçu avec des données partielles et complètes.
 */

const fullAdversary = {
  name: 'Dragon de Givre',
  tier: 3,
  type: 'Solo',
  description: 'Un dragon ancien qui hante les montagnes gelées.',
  motives: ['Défendre son territoire', 'Accumuler des richesses'],
  difficulty: 17,
  thresholds: { major: 20, severe: 32 },
  hp: 7,
  stress: 4,
  attack: {
    modifier: 3,
    name: 'Souffle de givre',
    range: 'Close',
    damage: '3d8+4',
    damageType: 'mag'
  },
  experiences: [
    { name: 'Intimidation', modifier: 4 },
    { name: 'Vol', modifier: 3 }
  ],
  features: [
    { activationType: 'passive', name: 'Résistance au froid', description: 'Immunité aux dégâts de givre.' },
    { activationType: 'action', name: 'Souffle dévastateur', cost: '2 stress', description: 'Inflige 5d10 dans un cône.' },
    { activationType: 'reaction', name: 'Queue balayante', description: 'Repousse les ennemis proches.' }
  ]
}

const emptyAdversary = {}

describe('AdversaryPreview', () => {
  const mountPreview = (data = fullAdversary) => {
    return mount(AdversaryPreview, { props: { data } })
  }

  describe('rendu complet', () => {
    it('affiche le nom de l adversaire', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.adv-preview__name').text()).toBe('Dragon de Givre')
    })

    it('affiche le badge tier', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.badge--tier3').text()).toBe('Tier 3')
    })

    it('affiche le type', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.adv-preview__type').text()).toBe('Solo')
    })

    it('affiche la description', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.adv-preview__description').text()).toContain('montagnes gelées')
    })

    it('affiche les motifs', () => {
      const wrapper = mountPreview()
      const motives = wrapper.find('.adv-preview__motives').text()
      expect(motives).toContain('Défendre son territoire')
      expect(motives).toContain('Accumuler des richesses')
    })

    it('affiche les stats principales', () => {
      const wrapper = mountPreview()
      const statValues = wrapper.findAll('.adv-preview__stat-value').map((s) => s.text())
      expect(statValues).toContain('17')     // difficulty
      expect(statValues).toContain('20/32')  // thresholds
      expect(statValues).toContain('7')      // hp
      expect(statValues).toContain('4')      // stress
    })

    it('affiche l attaque avec modificateur formate', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.adv-preview__attack-mod').text()).toBe('ATK +3')
      expect(wrapper.find('.adv-preview__attack-name').text()).toBe('Souffle de givre')
      expect(wrapper.find('.adv-preview__attack-range').text()).toBe('Close')
      expect(wrapper.find('.adv-preview__attack-damage').text()).toContain('3d8+4')
      expect(wrapper.find('.adv-preview__attack-damage').text()).toContain('Magique')
    })

    it('affiche les experiences avec modificateurs', () => {
      const wrapper = mountPreview()
      const tags = wrapper.findAll('.adv-preview__exp-tag')
      expect(tags).toHaveLength(2)
      expect(tags[0].text()).toContain('Intimidation')
      expect(tags[0].text()).toContain('+4')
    })

    it('affiche les features avec types et couleurs', () => {
      const wrapper = mountPreview()
      const features = wrapper.findAll('.adv-preview__feature')
      expect(features).toHaveLength(3)

      expect(features[0].classes()).toContain('adv-preview__feature--passive')
      expect(features[0].text()).toContain('Résistance au froid')

      expect(features[1].classes()).toContain('adv-preview__feature--action')
      expect(features[1].text()).toContain('Souffle dévastateur')
      expect(features[1].text()).toContain('2 stress')

      expect(features[2].classes()).toContain('adv-preview__feature--reaction')
    })
  })

  describe('rendu partiel (donnees vides)', () => {
    it('affiche Nouvel adversaire si pas de nom', () => {
      const wrapper = mountPreview(emptyAdversary)
      expect(wrapper.find('.adv-preview__name').text()).toBe('Nouvel adversaire')
    })

    it('n affiche pas le tier si absent', () => {
      const wrapper = mountPreview(emptyAdversary)
      expect(wrapper.find('[class*="badge--tier"]').exists()).toBe(false)
    })

    it('n affiche pas les motifs si vides', () => {
      const wrapper = mountPreview(emptyAdversary)
      expect(wrapper.find('.adv-preview__motives').exists()).toBe(false)
    })

    it('affiche des tirets pour les stats manquantes', () => {
      const wrapper = mountPreview(emptyAdversary)
      const statValues = wrapper.findAll('.adv-preview__stat-value').map((s) => s.text())
      expect(statValues.every((v) => v === '—')).toBe(true)
    })

    it('n affiche pas la section attaque si vide', () => {
      const wrapper = mountPreview(emptyAdversary)
      expect(wrapper.findAll('[aria-label="Attaque standard"]')).toHaveLength(0)
    })

    it('n affiche pas les experiences si vides', () => {
      const wrapper = mountPreview(emptyAdversary)
      expect(wrapper.findAll('[aria-label="Expériences"]')).toHaveLength(0)
    })

    it('n affiche pas les features si vides', () => {
      const wrapper = mountPreview(emptyAdversary)
      expect(wrapper.findAll('[aria-label="Capacités"]')).toHaveLength(0)
    })
  })

  describe('modificateurs', () => {
    it('formate les positifs avec +', () => {
      const wrapper = mountPreview({ attack: { modifier: 5, name: 'Test', damage: '1d6' } })
      expect(wrapper.find('.adv-preview__attack-mod').text()).toBe('ATK +5')
    })

    it('formate les negatifs avec -', () => {
      const wrapper = mountPreview({ attack: { modifier: -2, name: 'Test', damage: '1d6' } })
      expect(wrapper.find('.adv-preview__attack-mod').text()).toBe('ATK -2')
    })

    it('formate zero avec +0', () => {
      const wrapper = mountPreview({ attack: { modifier: 0, name: 'Test', damage: '1d6' } })
      expect(wrapper.find('.adv-preview__attack-mod').text()).toBe('ATK +0')
    })
  })

  describe('accessibilite', () => {
    it('a un aria-label sur l article', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('article').attributes('aria-label')).toBe('Aperçu : Dragon de Givre')
    })

    it('les features ont role list et listitem', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('.adv-preview__features').attributes('role')).toBe('list')
      expect(wrapper.findAll('[role="listitem"]').length).toBe(3)
    })

    it('les sections ont aria-label', () => {
      const wrapper = mountPreview()
      expect(wrapper.find('[aria-label="Statistiques principales"]').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Attaque standard"]').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Expériences"]').exists()).toBe(true)
      expect(wrapper.find('[aria-label="Capacités"]').exists()).toBe(true)
    })
  })
})
