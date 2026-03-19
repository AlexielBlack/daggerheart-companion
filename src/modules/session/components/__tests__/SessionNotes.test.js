// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────────
// Meme pattern que sessionStore.test.js
vi.mock('@core/composables/useStorage', async () => {
  const { ref: vueRef } = await import('vue')
  return {
    useStorage: (_key, defaultValue) => {
      const data = vueRef(
        defaultValue === null ? null : JSON.parse(JSON.stringify(defaultValue))
      )
      return {
        data,
        save: (val) => { data.value = JSON.parse(JSON.stringify(val)) },
        remove: () => { data.value = defaultValue === null ? null : JSON.parse(JSON.stringify(defaultValue)) },
        error: vueRef(null)
      }
    }
  }
})

// ── Mocks des stores dependants de sessionStore ──────────
vi.mock('@modules/environments', () => ({
  useEnvironmentStore: () => ({ allItems: [] })
}))

vi.mock('@modules/npcs', () => ({
  useNpcStore: () => ({ getById: () => null })
}))

import SessionNotes from '../SessionNotes.vue'

describe('SessionNotes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche un textarea', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('affiche le placeholder', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('textarea').attributes('placeholder')).toContain('Quêtes')
  })

  it('demarre en mode compact', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('.session-notes--expanded').exists()).toBe(false)
  })

  it('bascule en mode etendu au clic sur le bouton', async () => {
    const wrapper = mount(SessionNotes)
    await wrapper.find('[aria-label="Agrandir les notes"]').trigger('click')
    expect(wrapper.find('.session-notes--expanded').exists()).toBe(true)
  })

  it('a un label accessible', () => {
    const wrapper = mount(SessionNotes)
    const textarea = wrapper.find('textarea')
    const id = textarea.attributes('id')
    expect(id).toBeTruthy()
    const label = wrapper.find(`label[for="${id}"]`)
    expect(label.exists()).toBe(true)
  })
})
