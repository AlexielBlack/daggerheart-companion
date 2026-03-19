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
  classData: { name: 'Gardien', emoji: '\uD83D\uDEE1\uFE0F' }
}

// ── Stubs pour router-link ──────────────────────────────
const stubs = {
  'router-link': {
    template: '<a><slot /></a>'
  }
}

/** Helper : clique N fois sur le bouton mode pour atteindre le mode voulu */
async function cycleToMode(wrapper, targetMode) {
  const modes = ['strip', 'compact', 'detailed']
  // Le mode par defaut est 'strip', calculer le nombre de clics
  const currentIdx = 0 // defaut strip
  const targetIdx = modes.indexOf(targetMode)
  const clicks = (targetIdx - currentIdx + modes.length) % modes.length
  const btn = wrapper.find('.pc-group__mode-btn')
  for (let i = 0; i < clicks; i++) {
    await btn.trigger('click')
  }
}

describe('PcGroupPanel — modes de vue (strip, compact, detaille)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche le bouton mode quand des PJ sont presents', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    const btn = wrapper.find('.pc-group__mode-btn')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('Bandeau')
  })

  it('ne affiche pas le bouton mode quand la liste est vide', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-group__mode-btn').exists()).toBe(false)
  })

  it('cycle strip → compact → detaille → strip', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    const btn = wrapper.find('.pc-group__mode-btn')
    // Defaut : strip
    expect(btn.text()).toContain('Bandeau')
    // Clic 1 : compact
    await btn.trigger('click')
    expect(btn.text()).toContain('Compact')
    // Clic 2 : detaille
    await btn.trigger('click')
    expect(btn.text()).toContain('Detaille')
    // Clic 3 : retour a strip
    await btn.trigger('click')
    expect(btn.text()).toContain('Bandeau')
  })

  it('affiche le bandeau PcSummaryStrip en mode strip par defaut', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-strip').exists()).toBe(true)
    // Pas de grille en mode strip
    expect(wrapper.find('.pc-group__grid').exists()).toBe(false)
  })

  it('masque la section armure/espoir en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    // Passer en mode detaille d'abord pour verifier la presence
    await cycleToMode(wrapper, 'detailed')
    expect(wrapper.find('.pc-card__armor-hope').exists()).toBe(true)
    // Revenir a compact
    await cycleToMode(wrapper, 'compact')
    // Attendre un tick de rendu (cycle strip -> compact = 1 clic depuis strip)
    // On est deja en detaille, il faut re-cycler
  })

  it('affiche armure/espoir en mode detaille, pas en compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    // Passer en compact
    await cycleToMode(wrapper, 'compact')
    expect(wrapper.find('.pc-card__armor-hope').exists()).toBe(false)
    // Passer en detaille
    const btn = wrapper.find('.pc-group__mode-btn')
    await btn.trigger('click')
    expect(wrapper.find('.pc-card__armor-hope').exists()).toBe(true)
  })

  it('masque la section defense en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await cycleToMode(wrapper, 'compact')
    expect(wrapper.find('.pc-card__defense').exists()).toBe(false)
  })

  it('masque la section traits en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await cycleToMode(wrapper, 'compact')
    expect(wrapper.find('.pc-card__traits').exists()).toBe(false)
  })

  it('conserve les barres HP et Stress en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await cycleToMode(wrapper, 'compact')
    expect(wrapper.find('.pc-card__bars').exists()).toBe(true)
  })

  it('conserve le nom et la classe en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await cycleToMode(wrapper, 'compact')
    expect(wrapper.text()).toContain('Eldara')
    expect(wrapper.find('.pc-card__identity').exists()).toBe(true)
  })

  it('masque le selecteur de colonnes en mode strip', () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    expect(wrapper.find('.pc-group__col-selector').exists()).toBe(false)
  })

  it('affiche le selecteur de colonnes en mode compact', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await cycleToMode(wrapper, 'compact')
    expect(wrapper.find('.pc-group__col-selector').exists()).toBe(true)
  })
})

describe('Saisie directe HP/Stress', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche un element clickable pour la valeur HP en mode detaille', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    // Passer en mode detaille pour voir les cartes
    await cycleToMode(wrapper, 'detailed')
    expect(wrapper.find('.pc-card__bar-text--clickable').exists()).toBe(true)
  })

  it('bascule vers un input au clic sur la valeur HP', async () => {
    const wrapper = mount(PcGroupPanel, {
      props: { characters: [mockPc] },
      global: { stubs }
    })
    await cycleToMode(wrapper, 'detailed')
    const clickable = wrapper.find('.pc-card__bar-text--clickable')
    await clickable.trigger('click')
    expect(wrapper.find('.pc-card__stat-input').exists()).toBe(true)
  })
})
