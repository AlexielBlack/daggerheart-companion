// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceFilter from '../SourceFilter.vue'

describe('SourceFilter', () => {
  it('affiche 3 boutons : Tous, SRD, Custom', () => {
    const wrapper = mount(SourceFilter)
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('Tous')
    expect(buttons[1].text()).toBe('SRD')
    expect(buttons[2].text()).toBe('Custom')
  })

  it('emet update:modelValue au clic', async () => {
    const wrapper = mount(SourceFilter, {
      props: { modelValue: 'all' }
    })
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['srd'])
  })

  it('marque le bouton actif avec la classe correcte', () => {
    const wrapper = mount(SourceFilter, {
      props: { modelValue: 'custom' }
    })
    const buttons = wrapper.findAll('button')
    expect(buttons[2].classes()).toContain('source-filter__btn--active')
    expect(buttons[0].classes()).not.toContain('source-filter__btn--active')
    expect(buttons[1].classes()).not.toContain('source-filter__btn--active')
  })
})
