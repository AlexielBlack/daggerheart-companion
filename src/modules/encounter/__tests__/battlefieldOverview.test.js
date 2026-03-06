// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BattlefieldOverview from '../components/BattlefieldOverview.vue'

// ── Helpers ──────────────────────────────────────────────

/**
 * Monte le composant BattlefieldOverview avec les props fournies.
 * @param {Object} propsData - Props a passer au composant
 * @returns {import('@vue/test-utils').VueWrapper}
 */
function mountOverview(propsData = {}) {
  return mount(BattlefieldOverview, {
    props: {
      pcs: [],
      pcDownStatus: {},
      pcConditions: {},
      groups: [],
      stats: {},
      ...propsData
    }
  })
}

/**
 * Cree un groupe d'adversaires pour les tests.
 * @param {Object} overrides - Proprietes a surcharger
 * @returns {Object} Groupe d'adversaires
 */
function makeGroup(overrides = {}) {
  return {
    adversaryId: 'goblin',
    name: 'Gobelin',
    type: 'Standard',
    instances: [
      { instanceId: 'goblin_0', maxHP: 10, markedHP: 2, isDefeated: false },
      { instanceId: 'goblin_1', maxHP: 10, markedHP: 10, isDefeated: true },
      { instanceId: 'goblin_2', maxHP: 10, markedHP: 0, isDefeated: false }
    ],
    activeCount: 2,
    defeatedCount: 1,
    ...overrides
  }
}

// ── Tests ────────────────────────────────────────────────

describe('BattlefieldOverview', () => {
  // ── Rendu vide ───────────────────────────────────────

  describe('rendu vide', () => {
    it('affiche "Aucun PJ" si pcs vide', () => {
      const wrapper = mountOverview()
      expect(wrapper.text()).toContain('Aucun PJ')
    })

    it('affiche "Aucun adversaire" si groups vide', () => {
      const wrapper = mountOverview()
      expect(wrapper.text()).toContain('Aucun adversaire')
    })
  })

  // ── PJs ──────────────────────────────────────────────

  describe('PJs', () => {
    it('affiche les noms des PJ', () => {
      const wrapper = mountOverview({
        pcs: [{ id: '1', name: 'Alice', className: 'Guardian' }]
      })
      expect(wrapper.text()).toContain('Alice')
      expect(wrapper.text()).toContain('Guardian')
    })

    it('marque les PJ a terre', () => {
      const wrapper = mountOverview({
        pcs: [{ id: '1', name: 'Bob', className: 'Bard' }],
        pcDownStatus: { '1': true }
      })
      expect(wrapper.find('.bo__pc--down').exists()).toBe(true)
    })

    it('affiche les conditions PJ', () => {
      const wrapper = mountOverview({
        pcs: [{ id: '1', name: 'Alice', className: 'Guardian' }],
        pcConditions: { '1': ['hidden', 'vulnerable'] }
      })
      expect(wrapper.text()).toContain('hidden')
      expect(wrapper.text()).toContain('vulnerable')
    })
  })

  // ── Adversaires ──────────────────────────────────────

  describe('adversaires', () => {
    it('affiche les noms de groupes adversaires', () => {
      const wrapper = mountOverview({
        groups: [makeGroup({ name: 'Squelette' })]
      })
      expect(wrapper.text()).toContain('Squelette')
    })

    it('affiche les compteurs actifs/vaincus', () => {
      const group = makeGroup({ activeCount: 2 })
      // 3 instances au total (defini dans makeGroup)
      const wrapper = mountOverview({ groups: [group] })
      const text = wrapper.text()
      expect(text).toContain('2')
      expect(text).toContain('3')
    })

    it('affiche la barre HP', () => {
      const wrapper = mountOverview({
        groups: [makeGroup()]
      })
      expect(wrapper.find('.bo__hp-bar').exists()).toBe(true)
    })
  })

  // ── Stats live ───────────────────────────────────────

  describe('stats live', () => {
    it('affiche les stats live', () => {
      const wrapper = mountOverview({
        stats: {
          hitCount: 10,
          missCount: 2,
          hitRatio: 83,
          totalDamageDealt: 45,
          totalStressDealt: 12,
          pcHitCount: 3
        }
      })
      const text = wrapper.text()
      expect(text).toContain('10')
      expect(text).toContain('83%')
      expect(text).toContain('45')
    })
  })

  // ── Accessibilite ────────────────────────────────────

  describe('accessibilite', () => {
    it('a role region', () => {
      const wrapper = mountOverview()
      expect(wrapper.find('[role="region"]').exists()).toBe(true)
    })
  })
})
