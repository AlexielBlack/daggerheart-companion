// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

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

vi.mock('@modules/environments', () => ({
  useEnvironmentStore: () => ({ allItems: [] })
}))

vi.mock('@modules/npcs', () => ({
  useNpcStore: () => ({ getById: () => null })
}))

import SessionNotes from '../SessionNotes.vue'

describe('SessionNotes — entrees structurees', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche un bouton pour ajouter une entree horodatee', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('[aria-label="Ajouter une entree horodatee"]').exists()).toBe(true)
  })

  it('affiche un input inline au clic sur le bouton ajouter', async () => {
    const wrapper = mount(SessionNotes)
    await wrapper.find('[aria-label="Ajouter une entree horodatee"]').trigger('click')
    expect(wrapper.find('.session-notes__entry-input').exists()).toBe(true)
  })

  it('masque l input au clic sur annuler', async () => {
    const wrapper = mount(SessionNotes)
    await wrapper.find('[aria-label="Ajouter une entree horodatee"]').trigger('click')
    await wrapper.find('[aria-label="Annuler"]').trigger('click')
    expect(wrapper.find('.session-notes__entry-input').exists()).toBe(false)
  })

  it('conserve le textarea avec le placeholder existant', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('textarea').attributes('placeholder')).toContain('Quêtes')
  })
})
