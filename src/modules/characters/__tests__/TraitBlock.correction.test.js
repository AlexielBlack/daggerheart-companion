// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TraitBlock from '../components/TraitBlock.vue'

/**
 * @tests TraitBlock — mode correction manuelle
 * @description Vérifie que l'édition manuelle des traits (steppers + saisie),
 * révélée par le mode « Corriger », émet bien des valeurs absolues bornées.
 * Sert à corriger les erreurs de montée de niveau.
 */
const allAssigned = { agility: 2, strength: 1, finesse: 1, instinct: 0, presence: 0, knowledge: -1 }

function mountBlock(values = allAssigned) {
  return mount(TraitBlock, { props: { values: { ...values } } })
}

describe('TraitBlock — correction manuelle', () => {
  it('les contrôles de correction sont masqués par défaut', () => {
    const wrapper = mountBlock()
    expect(wrapper.find('.trait-correct').exists()).toBe(false)
  })

  it('le bouton « Corriger » révèle les contrôles sur chaque trait', async () => {
    const wrapper = mountBlock()
    await wrapper.find('.trait-action-btn--correct').trigger('click')
    expect(wrapper.findAll('.trait-correct')).toHaveLength(6)
  })

  it('le stepper + incrémente le trait de 1 (valeur absolue)', async () => {
    const wrapper = mountBlock()
    await wrapper.find('.trait-action-btn--correct').trigger('click')
    // 1er trait = agility (valeur 2) → +1 doit émettre 3
    const plusBtn = wrapper.findAll('.trait-correct__btn')[1] // [−, +] du 1er trait
    await plusBtn.trigger('click')
    const events = wrapper.emitted('update')
    expect(events[events.length - 1]).toEqual(['agility', 3])
  })

  it('le stepper − décrémente le trait de 1', async () => {
    const wrapper = mountBlock()
    await wrapper.find('.trait-action-btn--correct').trigger('click')
    const minusBtn = wrapper.findAll('.trait-correct__btn')[0] // − du 1er trait (agility=2)
    await minusBtn.trigger('click')
    const events = wrapper.emitted('update')
    expect(events[events.length - 1]).toEqual(['agility', 1])
  })

  it('la saisie directe définit la valeur absolue', async () => {
    const wrapper = mountBlock()
    await wrapper.find('.trait-action-btn--correct').trigger('click')
    const input = wrapper.findAll('.trait-correct__input')[0]
    input.element.value = '4'
    await input.trigger('change')
    const events = wrapper.emitted('update')
    expect(events[events.length - 1]).toEqual(['agility', 4])
  })

  it('borne les valeurs hors limites (saisie aberrante)', async () => {
    const wrapper = mountBlock()
    await wrapper.find('.trait-action-btn--correct').trigger('click')
    const input = wrapper.findAll('.trait-correct__input')[0]
    input.element.value = '999'
    await input.trigger('change')
    const events = wrapper.emitted('update')
    expect(events[events.length - 1]).toEqual(['agility', 12]) // MAX_TRAIT
  })

  it('une saisie non numérique retombe sur 0', async () => {
    const wrapper = mountBlock()
    await wrapper.find('.trait-action-btn--correct').trigger('click')
    const input = wrapper.findAll('.trait-correct__input')[0]
    input.element.value = 'abc'
    await input.trigger('change')
    const events = wrapper.emitted('update')
    expect(events[events.length - 1]).toEqual(['agility', 0])
  })
})
