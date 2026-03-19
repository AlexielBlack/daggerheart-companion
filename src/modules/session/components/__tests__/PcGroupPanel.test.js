// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────────
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

// ── Mock characters ──────────────────────────────────────
vi.mock('@modules/characters', () => ({
  useCharacterStore: () => ({
    patchCharacterById: vi.fn(),
    toggleHidden: vi.fn()
  })
}))

vi.mock('@modules/characters/composables/useCharacterComputed', () => ({
  resolveCharacterDisplay: (pc) => ({
    ...pc,
    effectiveMaxHP: 10,
    effectiveMaxStress: 6,
    effectiveArmorScore: 3,
    effectiveEvasion: 10,
    thresholds: { major: 5, severe: 9 },
    classData: pc.classData || null,
    subclassData: null,
    ancestryData: null,
    communityData: null,
    primaryWeaponData: null,
    secondaryWeaponData: null,
    loadoutCards: [],
    traits: { agility: 1, strength: 0, finesse: -1, instinct: 2, presence: 0, knowledge: 1 }
  })
}))

vi.mock('@data/domains', () => ({
  getDomainById: () => null
}))

import PcGroupPanel from '../PcGroupPanel.vue'

// ── Donnees de test ──────────────────────────────────────
const mockPc = {
  id: 'pc-1',
  name: 'Eldara',
  level: 3,
  hidden: false,
  currentHP: 2,
  currentStress: 1,
  armorSlotsMarked: 0,
  hope: 3,
  conditions: [],
  classData: { name: 'Gardien', emoji: '🛡️' }
}

const mockPcMinimal = {
  id: 'pc-2',
  name: 'Brynn',
  level: 1,
  hidden: false,
  currentHP: 0,
  currentStress: 0,
  armorSlotsMarked: 0,
  hope: 0,
  conditions: []
}

// ── Stubs pour router-link ──────────────────────────────
const stubs = {
  'router-link': {
    template: '<a><slot /></a>'
  }
}

describe('PcGroupPanel — mode compact', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche le bouton compact quand des PJ sont presents', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    const btn = wrapper.find('.pc-group__compact-btn')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-pressed')).toBe('false')
    expect(btn.attributes('aria-label')).toBe('Basculer en mode compact')
  })

  it('ne affiche pas le bouton compact quand la liste est vide', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-group__compact-btn').exists()).toBe(false)
  })

  it('bascule aria-pressed et aria-label au clic', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    const btn = wrapper.find('.pc-group__compact-btn')
    await btn.trigger('click')
    expect(btn.attributes('aria-pressed')).toBe('true')
    expect(btn.attributes('aria-label')).toBe('Basculer en mode detaille')
  })

  it('ajoute la classe active quand compact est actif', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    const btn = wrapper.find('.pc-group__compact-btn')
    expect(btn.classes()).not.toContain('pc-group__compact-btn--active')
    await btn.trigger('click')
    expect(btn.classes()).toContain('pc-group__compact-btn--active')
  })

  it('masque la section armure/espoir en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    // Visible par defaut
    expect(wrapper.find('.pc-card__armor-hope').exists()).toBe(true)
    // Activer le mode compact
    await wrapper.find('.pc-group__compact-btn').trigger('click')
    expect(wrapper.find('.pc-card__armor-hope').exists()).toBe(false)
  })

  it('masque la section defense en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-card__defense').exists()).toBe(true)
    await wrapper.find('.pc-group__compact-btn').trigger('click')
    expect(wrapper.find('.pc-card__defense').exists()).toBe(false)
  })

  it('masque la section traits en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-card__traits').exists()).toBe(true)
    await wrapper.find('.pc-group__compact-btn').trigger('click')
    expect(wrapper.find('.pc-card__traits').exists()).toBe(false)
  })

  it('conserve les barres HP et Stress en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await wrapper.find('.pc-group__compact-btn').trigger('click')
    expect(wrapper.find('.pc-card__bars').exists()).toBe(true)
  })

  it('conserve le nom et la classe en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await wrapper.find('.pc-group__compact-btn').trigger('click')
    expect(wrapper.text()).toContain('Eldara')
    expect(wrapper.find('.pc-card__identity').exists()).toBe(true)
  })
})
