// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FearHopeTracker from '../components/FearHopeTracker.vue'

// ── Helpers ──────────────────────────────────────────────

/**
 * Monte le composant FearHopeTracker avec les props fournies.
 * @param {Object} propsData - Props a passer au composant
 * @returns {import('@vue/test-utils').VueWrapper}
 */
function mountTracker(propsData = {}) {
  return mount(FearHopeTracker, {
    props: {
      fear: 0,
      hope: 0,
      fearSpent: 0,
      hopeSpent: 0,
      ...propsData
    }
  })
}

// ── Tests ────────────────────────────────────────────────

describe('FearHopeTracker', () => {
  // ── Rendu ────────────────────────────────────────────

  describe('rendu', () => {
    it('affiche le label Hope', () => {
      const wrapper = mountTracker()
      expect(wrapper.text()).toContain('Hope')
    })

    it('affiche le label Fear', () => {
      const wrapper = mountTracker()
      expect(wrapper.text()).toContain('Fear')
    })

    it('affiche les tokens remplis pour hope', () => {
      const wrapper = mountTracker({ hope: 3 })
      const tokens = wrapper.findAll('.fh__token--hope')
      expect(tokens).toHaveLength(3)
    })

    it('affiche les tokens remplis pour fear', () => {
      const wrapper = mountTracker({ fear: 2 })
      const tokens = wrapper.findAll('.fh__token--fear')
      expect(tokens).toHaveLength(2)
    })

    it('affiche les compteurs de depenses', () => {
      const wrapper = mountTracker({ hopeSpent: 5, fearSpent: 3 })
      const text = wrapper.text()
      expect(text).toContain('5')
      expect(text).toContain('3')
    })

    it('affiche les 5 boutons de jet', () => {
      const wrapper = mountTracker()
      const rollBtns = wrapper.findAll('.fh__roll-btn')
      expect(rollBtns).toHaveLength(5)
    })
  })

  // ── Evenements ───────────────────────────────────────

  describe('evenements', () => {
    it('emet add-hope au clic +', async () => {
      const wrapper = mountTracker()
      const btn = wrapper.find('[aria-label="Ajouter 1 Hope"]')
      expect(btn.exists()).toBe(true)
      await btn.trigger('click')
      expect(wrapper.emitted('add-hope')).toBeTruthy()
      expect(wrapper.emitted('add-hope')).toHaveLength(1)
    })

    it('emet spend-fear au clic -', async () => {
      const wrapper = mountTracker({ fear: 3 })
      const btn = wrapper.find('[aria-label="Dépenser 1 Fear"]')
      expect(btn.exists()).toBe(true)
      await btn.trigger('click')
      expect(wrapper.emitted('spend-fear')).toBeTruthy()
      expect(wrapper.emitted('spend-fear')).toHaveLength(1)
    })

    it('desactive le bouton spend si hope=0', () => {
      const wrapper = mountTracker({ hope: 0 })
      const btn = wrapper.find('[aria-label="Dépenser 1 Hope"]')
      expect(btn.exists()).toBe(true)
      expect(btn.attributes('disabled')).toBeDefined()
    })

    it('emet roll-result au clic bouton jet', async () => {
      const wrapper = mountTracker()
      const rollBtns = wrapper.findAll('.fh__roll-btn')
      expect(rollBtns.length).toBeGreaterThan(0)
      await rollBtns[0].trigger('click')
      expect(wrapper.emitted('roll-result')).toBeTruthy()
      // Le premier bouton correspond a 'criticalSuccess'
      expect(wrapper.emitted('roll-result')[0]).toEqual(['criticalSuccess'])
    })
  })

  // ── Accessibilite ────────────────────────────────────

  describe('accessibilite', () => {
    it('a role region', () => {
      const wrapper = mountTracker()
      expect(wrapper.find('[role="region"]').exists()).toBe(true)
    })

    it('a aria-label sur le wrapper', () => {
      const wrapper = mountTracker()
      expect(wrapper.find('[aria-label]').exists()).toBe(true)
    })
  })
})
