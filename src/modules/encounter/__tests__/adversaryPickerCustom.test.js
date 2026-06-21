// @vitest-environment happy-dom
/**
 * @tests AdversaryPicker — adversaires personnalisés (homebrew)
 * @description Vérifie que les adversaires homebrew apparaissent dans le picker
 * de rencontre, qu'un filtre « Perso » les isole, et que le compteur est exact.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AdversaryPicker from '../components/AdversaryPicker.vue'
import { useAdversaryHomebrewStore } from '@modules/homebrew/categories/adversary/useAdversaryHomebrewStore.js'

const customAdv = {
  name: 'Golem de Cristal Perso',
  tier: 2,
  type: 'Bruiser',
  difficulty: 14,
  thresholds: { major: 10, severe: 20 },
  hp: 6,
  stress: 3,
  attack: { modifier: 2, name: 'Poing', range: 'Melee', damage: '2d8+3', damageType: 'phy' }
}

const mountPicker = () =>
  mount(AdversaryPicker, {
    props: { currentSlots: [] },
    global: { stubs: { 'router-link': { template: '<a><slot /></a>' } } }
  })

describe('AdversaryPicker — adversaires personnalisés', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
    setActivePinia(createPinia())
  })

  it('aucun adversaire perso quand le store homebrew est vide', () => {
    const wrapper = mountPicker()
    expect(wrapper.findAll('.picker-item__custom')).toHaveLength(0)
    expect(wrapper.find('.filter-chip__count').exists()).toBe(false)
  })

  it('affiche les adversaires homebrew avec un badge ✦', () => {
    const store = useAdversaryHomebrewStore()
    store.create({ ...customAdv })
    const wrapper = mountPicker()
    const badges = wrapper.findAll('.picker-item__custom')
    expect(badges.length).toBeGreaterThanOrEqual(1)
    expect(wrapper.find('.filter-chip__count').text()).toBe('1')
  })

  it('le filtre « Perso » n\'affiche que les adversaires homebrew', async () => {
    const store = useAdversaryHomebrewStore()
    store.create({ ...customAdv })
    const wrapper = mountPicker()
    await wrapper.find('.filter-chip--custom').trigger('click')
    const names = wrapper.findAll('.picker-item__name')
    expect(names).toHaveLength(1)
    expect(names[0].text()).toBe('Golem de Cristal Perso')
  })

  it('émet « add » avec l\'id de l\'adversaire perso', async () => {
    const store = useAdversaryHomebrewStore()
    const created = store.create({ ...customAdv })
    const wrapper = mountPicker()
    await wrapper.find('.filter-chip--custom').trigger('click')
    await wrapper.find('.picker-btn--add').trigger('click')
    expect(wrapper.emitted('add')[0]).toEqual([created.id])
  })

  it('le filtre « Perso » actif, sans aucun perso, propose d\'en créer', async () => {
    const wrapper = mountPicker()
    await wrapper.find('.filter-chip--custom').trigger('click')
    expect(wrapper.find('.picker-empty').exists()).toBe(true)
    expect(wrapper.find('.picker-empty').text()).toContain('Aucun adversaire personnalisé')
  })
})
