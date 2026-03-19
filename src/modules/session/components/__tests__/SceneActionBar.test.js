// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────
vi.mock('@core/composables/useStorage', async () => {
  const { ref: vueRef } = await import('vue')
  return {
    useStorage: (_key, defaultValue) => {
      const data = vueRef(defaultValue === null ? null : JSON.parse(JSON.stringify(defaultValue)))
      return {
        data,
        save: (val) => { data.value = JSON.parse(JSON.stringify(val)) },
        remove: () => { data.value = defaultValue === null ? null : JSON.parse(JSON.stringify(defaultValue)) },
        error: vueRef(null)
      }
    }
  }
})

// ── Mocks des stores dependants ──────────────────────────
vi.mock('@modules/environments', () => ({
  useEnvironmentStore: () => ({ allItems: [] })
}))

vi.mock('@modules/npcs', () => ({
  useNpcStore: () => ({ getById: (id) => (id ? { id, name: `PNJ ${id}` } : null) })
}))

import SceneActionBar from '../SceneActionBar.vue'
import { useSessionStore } from '../../stores/sessionStore'

/** Monte le composant avec la prop activeTab requise */
function mountBar(props = {}) {
  return mount(SceneActionBar, {
    props: { activeTab: 'personnages', ...props }
  })
}

describe('SceneActionBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── Onglets ────────────────────────────

  it('affiche les trois onglets de scene', () => {
    const wrapper = mountBar()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[0].text()).toContain('Personnages')
    expect(tabs[1].text()).toContain('PNJs')
    expect(tabs[2].text()).toContain('Environnement')
  })

  it('marque l\'onglet actif avec aria-selected', () => {
    const wrapper = mountBar({ activeTab: 'pnjs' })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[2].attributes('aria-selected')).toBe('false')
  })

  it('emet change-tab au clic sur un onglet', async () => {
    const wrapper = mountBar()
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.emitted('change-tab')).toBeTruthy()
    expect(wrapper.emitted('change-tab')[0]).toEqual(['environnement'])
  })

  it('a un tablist avec aria-label', () => {
    const wrapper = mountBar()
    const tablist = wrapper.find('[role="tablist"]')
    expect(tablist.exists()).toBe(true)
    expect(tablist.attributes('aria-label')).toBe('Onglets de scene')
  })

  // ── Compteur Fear / Hope ────────────────────────────

  it('affiche le compteur Fear/Hope avec les valeurs du store', () => {
    const sessionStore = useSessionStore()
    sessionStore.incrementFear()
    sessionStore.incrementFear()
    sessionStore.incrementHopeGlobal()
    const wrapper = mountBar()
    expect(wrapper.find('[aria-label="Compteur Fear"]').text()).toContain('2')
    expect(wrapper.find('[aria-label="Compteur Hope"]').text()).toContain('1')
  })

  it('incremente fear au clic sur le bouton +', async () => {
    const sessionStore = useSessionStore()
    const wrapper = mountBar()
    await wrapper.find('[aria-label="Ajouter 1 Fear"]').trigger('click')
    expect(sessionStore.fear).toBe(1)
  })

  it('incremente hope au clic sur le bouton +', async () => {
    const sessionStore = useSessionStore()
    const wrapper = mountBar()
    await wrapper.find('[aria-label="Ajouter 1 Hope"]').trigger('click')
    expect(sessionStore.hope).toBe(1)
  })

  // ── Badge PNJ ────────────────────────────

  it('affiche le nombre de PNJs charges dans le badge', () => {
    const sessionStore = useSessionStore()
    sessionStore.addNpc('npc-1')
    sessionStore.addNpc('npc-2')
    const wrapper = mountBar()
    const badge = wrapper.find('.scene-action-bar__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('2')
  })

  it('masque le badge quand aucun PNJ charge', () => {
    const wrapper = mountBar()
    expect(wrapper.find('.scene-action-bar__badge').exists()).toBe(false)
  })
})
