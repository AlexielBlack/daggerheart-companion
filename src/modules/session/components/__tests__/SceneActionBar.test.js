// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SceneActionBar from '../SceneActionBar.vue'

describe('SceneActionBar', () => {
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
})
