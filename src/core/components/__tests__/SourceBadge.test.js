// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceBadge from '../SourceBadge.vue'

describe('SourceBadge', () => {
  it('affiche le badge pour source="custom"', () => {
    const wrapper = mount(SourceBadge, {
      props: { source: 'custom' }
    })
    const badge = wrapper.find('.source-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('CUSTOM')
  })

  it('n\'affiche rien pour source="srd"', () => {
    const wrapper = mount(SourceBadge, {
      props: { source: 'srd' }
    })
    expect(wrapper.find('.source-badge').exists()).toBe(false)
  })

  it('n\'affiche rien sans prop source', () => {
    const wrapper = mount(SourceBadge)
    expect(wrapper.find('.source-badge').exists()).toBe(false)
  })
})
