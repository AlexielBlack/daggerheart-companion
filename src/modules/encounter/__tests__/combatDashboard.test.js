// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CombatDashboard from '../components/CombatDashboard.vue'
import FearHopeTracker from '../components/FearHopeTracker.vue'
import BattlefieldOverview from '../components/BattlefieldOverview.vue'

// ── Mock localStorage ────────────────────────────────────

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ── Helpers ──────────────────────────────────────────────

/**
 * Monte le composant CombatDashboard avec Teleport stubbe.
 * @returns {import('@vue/test-utils').VueWrapper}
 */
function mountDashboard() {
  return mount(CombatDashboard, {
    global: {
      stubs: { Teleport: true }
    }
  })
}

// ── Tests ────────────────────────────────────────────────

describe('CombatDashboard', () => {
  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
  })

  // ── Toggle ───────────────────────────────────────────

  describe('toggle', () => {
    it('affiche le bouton toggle', () => {
      const wrapper = mountDashboard()
      expect(wrapper.find('.cdash__toggle').exists()).toBe(true)
    })

    it('le panneau est ferme par defaut', () => {
      const wrapper = mountDashboard()
      expect(wrapper.find('#combat-dashboard-panel').exists()).toBe(false)
    })

    it('ouvre le panneau au clic', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('.cdash__toggle').trigger('click')
      expect(wrapper.find('#combat-dashboard-panel').exists()).toBe(true)
    })
  })

  // ── Contenu ──────────────────────────────────────────

  describe('contenu', () => {
    it('contient FearHopeTracker quand ouvert', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('.cdash__toggle').trigger('click')
      expect(wrapper.findComponent(FearHopeTracker).exists()).toBe(true)
    })

    it('contient BattlefieldOverview quand ouvert', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('.cdash__toggle').trigger('click')
      expect(wrapper.findComponent(BattlefieldOverview).exists()).toBe(true)
    })
  })

  // ── ARIA ─────────────────────────────────────────────

  describe('accessibilite', () => {
    it('le bouton a aria-expanded', () => {
      const wrapper = mountDashboard()
      expect(wrapper.find('.cdash__toggle').attributes('aria-expanded')).toBe('false')
    })

    it('le panneau a role dialog', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('.cdash__toggle').trigger('click')
      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    })

    it('le panneau a aria-modal', async () => {
      const wrapper = mountDashboard()
      await wrapper.find('.cdash__toggle').trigger('click')
      expect(wrapper.find('[aria-modal="true"]').exists()).toBe(true)
    })
  })
})
