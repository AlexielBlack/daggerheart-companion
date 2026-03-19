// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

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
  classData: { name: 'Gardien', emoji: '\uD83D\uDEE1\uFE0F' }
}

// ── Stubs pour router-link ──────────────────────────────
const stubs = {
  'router-link': {
    template: '<a><slot /></a>'
  }
}

describe('PcGroupPanel — vue unifiee', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche la grille quand des PJ sont presents', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-group__grid').exists()).toBe(true)
  })

  it('affiche le message vide quand aucun PJ', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-group__empty').exists()).toBe(true)
  })

  it('affiche le nom et la classe du personnage', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.text()).toContain('Eldara')
    expect(wrapper.find('.pc-card__identity').exists()).toBe(true)
  })

  it('affiche toujours les traits', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-card__traits').exists()).toBe(true)
    expect(wrapper.findAll('.pc-card__trait').length).toBe(6)
  })

  it('affiche le footer combat avec HP et Stress', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-card__combat-footer').exists()).toBe(true)
    expect(wrapper.find('.pc-card__stat-chip--hp').exists()).toBe(true)
    expect(wrapper.find('.pc-card__stat-chip--stress').exists()).toBe(true)
  })

  it('affiche evasion et seuils dans le footer', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-card__stat-readonly').exists()).toBe(true)
    expect(wrapper.find('.pc-card__stat-readonly').text()).toContain('10')
    expect(wrapper.find('.pc-card__stat-readonly').text()).toContain('5')
    expect(wrapper.find('.pc-card__stat-readonly').text()).toContain('9')
  })

  it('affiche les onglets Capacites / Inventaire / Notes', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    const tabs = wrapper.findAll('.pc-card__tab')
    const tabTexts = tabs.map(t => t.text())
    const allText = tabTexts.join(' ')
    expect(allText).toContain('Inventaire')
    expect(allText).toContain('Notes')
  })

  it('ne contient plus de bouton mode de vue', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-group__mode-btn').exists()).toBe(false)
  })

  it('ne contient plus de selecteur de colonnes', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-group__col-selector').exists()).toBe(false)
  })
})

describe('Saisie directe HP/Stress', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche un element clickable pour la valeur HP', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-card__stat-text--clickable').exists()).toBe(true)
  })

  it('bascule vers un input au clic sur la valeur HP', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    const clickable = wrapper.find('.pc-card__stat-text--clickable')
    await clickable.trigger('click')
    expect(wrapper.find('.pc-card__stat-input').exists()).toBe(true)
  })
})

describe('Onglet Notes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche un textarea quand l\'onglet Notes est actif', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    // Trouver l'onglet Notes et cliquer dessus
    const tabs = wrapper.findAll('.pc-card__tab')
    const notesTab = tabs.find(t => t.text().includes('Notes'))
    expect(notesTab).toBeTruthy()
    await notesTab.trigger('click')
    expect(wrapper.find('.pc-card__notes-textarea').exists()).toBe(true)
  })
})
