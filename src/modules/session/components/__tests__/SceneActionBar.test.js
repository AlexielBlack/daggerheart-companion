// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────────
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
  useNpcStore: () => ({ getById: () => null })
}))

import SceneActionBar from '../SceneActionBar.vue'
import { useSessionStore } from '../../stores/sessionStore'

describe('SceneActionBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche le bouton Catalogue PNJ', () => {
    const wrapper = mount(SceneActionBar)
    expect(wrapper.find('[aria-label="Ouvrir le catalogue PNJ"]').exists()).toBe(true)
  })

  it('affiche le bouton Rencontres', () => {
    const wrapper = mount(SceneActionBar)
    expect(wrapper.find('[aria-label="Aller aux rencontres"]').exists()).toBe(true)
  })

  it('affiche le bouton Notes', () => {
    const wrapper = mount(SceneActionBar)
    expect(wrapper.find('[aria-label="Aller aux notes"]').exists()).toBe(true)
  })

  it('emet open-catalogue au clic sur le bouton PNJ', async () => {
    const wrapper = mount(SceneActionBar)
    await wrapper.find('[aria-label="Ouvrir le catalogue PNJ"]').trigger('click')
    expect(wrapper.emitted('open-catalogue')).toBeTruthy()
  })

  it('a le role toolbar avec aria-label', () => {
    const wrapper = mount(SceneActionBar)
    const toolbar = wrapper.find('[role="toolbar"]')
    expect(toolbar.exists()).toBe(true)
    expect(toolbar.attributes('aria-label')).toBe('Actions rapides de scene')
  })

  // ── Compteur Fear / Hope ────────────────────────────

  it('affiche le compteur Fear/Hope avec les valeurs du store', () => {
    const sessionStore = useSessionStore()
    sessionStore.incrementFear()
    sessionStore.incrementFear()
    sessionStore.incrementHopeGlobal()
    const wrapper = mount(SceneActionBar)
    expect(wrapper.find('[aria-label="Compteur Fear"]').text()).toContain('2')
    expect(wrapper.find('[aria-label="Compteur Hope"]').text()).toContain('1')
  })

  it('incremente fear au clic sur le bouton +', async () => {
    const sessionStore = useSessionStore()
    const wrapper = mount(SceneActionBar)
    await wrapper.find('[aria-label="Ajouter 1 Fear"]').trigger('click')
    expect(sessionStore.fear).toBe(1)
  })

  it('incremente hope au clic sur le bouton +', async () => {
    const sessionStore = useSessionStore()
    const wrapper = mount(SceneActionBar)
    await wrapper.find('[aria-label="Ajouter 1 Hope"]').trigger('click')
    expect(sessionStore.hope).toBe(1)
  })
})
