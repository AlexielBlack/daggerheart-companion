// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PcSummaryStrip from '../PcSummaryStrip.vue'

// ── Donnees de test ──────────────────────────────────────
const mockPcs = [
  {
    id: 'pc-1', name: 'Kael', level: 3,
    currentHP: 2, effectiveMaxHP: 6,
    currentStress: 1, effectiveMaxStress: 5,
    armorSlotsMarked: 1, effectiveArmorScore: 3,
    hope: 2, conditions: ['frightened'],
    classData: { emoji: '\u2694\uFE0F', name: 'Guerrier' }
  },
  {
    id: 'pc-2', name: 'Lyra', level: 2,
    currentHP: 0, effectiveMaxHP: 4,
    currentStress: 3, effectiveMaxStress: 4,
    armorSlotsMarked: 0, effectiveArmorScore: 1,
    hope: 4, conditions: [],
    classData: { emoji: '\uD83D\uDD2E', name: 'Sorcier' }
  }
]

describe('PcSummaryStrip', () => {
  it('affiche une ligne par PJ', () => {
    const wrapper = mount(PcSummaryStrip, { props: { characters: mockPcs } })
    const rows = wrapper.findAll('.pc-strip__row')
    expect(rows).toHaveLength(2)
  })

  it('affiche le nom et les stats critiques de chaque PJ', () => {
    const wrapper = mount(PcSummaryStrip, { props: { characters: mockPcs } })
    const firstRow = wrapper.find('.pc-strip__row')
    expect(firstRow.text()).toContain('Kael')
    expect(firstRow.text()).toContain('2/6')
    expect(firstRow.text()).toContain('1/5')
  })

  it('affiche les conditions actives', () => {
    const wrapper = mount(PcSummaryStrip, { props: { characters: mockPcs } })
    expect(wrapper.find('.pc-strip__condition').exists()).toBe(true)
  })

  it('emet select-pc au clic sur le nom', async () => {
    const wrapper = mount(PcSummaryStrip, { props: { characters: mockPcs } })
    await wrapper.find('.pc-strip__name-btn').trigger('click')
    expect(wrapper.emitted('select-pc')[0]).toEqual(['pc-1'])
  })

  it('affiche un tiret quand pas de conditions', () => {
    const wrapper = mount(PcSummaryStrip, { props: { characters: mockPcs } })
    expect(wrapper.find('.pc-strip__no-cond').exists()).toBe(true)
  })
})
