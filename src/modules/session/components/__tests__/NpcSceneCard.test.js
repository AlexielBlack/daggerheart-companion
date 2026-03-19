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

vi.mock('@modules/environments', () => ({
  useEnvironmentStore: () => ({ allItems: [] })
}))

const mockGetById = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@modules/npcs', () => ({
  useNpcStore: () => ({
    getById: mockGetById,
    update: mockUpdate
  }),
  NPC_STATUS_META: {
    ally: { label: 'Allie', emoji: '🤝', color: '#059669' },
    neutral: { label: 'Neutre', emoji: '😐', color: '#6b7280' },
    hostile: { label: 'Hostile', emoji: '⚠️', color: '#dc2626' },
    dead: { label: 'Mort', emoji: '💀', color: '#374151' },
    missing: { label: 'Disparu', emoji: '❓', color: '#7c3aed' }
  },
  DISPOSITION_META: {
    '-2': { label: 'Hostile', color: '#dc2626' },
    '-1': { label: 'Mefiant', color: '#f59e0b' },
    0: { label: 'Neutre', color: '#6b7280' },
    1: { label: 'Amical', color: '#3b82f6' },
    2: { label: 'Allie', color: '#059669' }
  },
  RELATION_TYPE_META: {
    ally: { label: 'Allie' },
    enemy: { label: 'Ennemi' },
    rival: { label: 'Rival' },
    other: { label: 'Autre' }
  }
}))

import NpcSceneCard from '../NpcSceneCard.vue'

const fullNpc = {
  id: 'npc-1',
  name: 'Grendak',
  title: 'le Forgeron',
  status: 'hostile',
  faction: 'Guilde des Marteaux',
  notes: 'A un secret'
}

const minimalNpc = {
  id: 'npc-2',
  name: 'Lyra',
  title: '',
  status: 'ally',
  faction: '',
  notes: ''
}

const mockNpcWithRelations = {
  id: 'npc-rel', name: 'Aldric', title: 'Capitaine', status: 'neutral',
  faction: 'Garde Royale', location: '', description: '', personality: '',
  motives: '', tactics: '', notes: '',
  pcRelations: [{ pcId: 'pc-1', disposition: 1, note: 'Allie de confiance' }],
  npcRelations: []
}

const detailedNpc = {
  id: 'npc-3', name: 'Thorne', title: 'Alchimiste',
  status: 'neutral', faction: 'Cercle Arcane', location: 'Tour Nord',
  description: 'Un vieil homme mysterieux', personality: 'Curieux et distant',
  motives: 'Decouvrir la verite', tactics: 'Manipulation subtile',
  notes: 'Possede un artefact', pcRelations: [], npcRelations: []
}

describe('NpcSceneCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockGetById.mockReset()
    mockUpdate.mockReset()
  })

  it('affiche le nom, titre, statut et faction complets', () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    expect(wrapper.text()).toContain('Grendak')
    expect(wrapper.text()).toContain('le Forgeron')
    expect(wrapper.text()).toContain('Hostile')
    expect(wrapper.text()).toContain('Guilde des Marteaux')
  })

  it('affiche sans titre ni faction quand ils sont vides', () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: minimalNpc } })
    expect(wrapper.text()).toContain('Lyra')
    expect(wrapper.text()).not.toContain('·')
  })

  it('affiche la pastille statut avec la bonne couleur', () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    const dot = wrapper.find('.npc-scene-card__dot')
    expect(dot.exists()).toBe(true)
    expect(dot.attributes('style')).toContain('#dc2626')
  })

  it('affiche la valeur existante des notes dans le textarea', async () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    // Deplier la carte pour acceder au textarea
    await wrapper.find('.npc-scene-card__expand-btn').trigger('click')
    const textarea = wrapper.find('textarea')
    expect(textarea.element.value).toBe('A un secret')
  })

  it('emet remove au clic sur le bouton supprimer', async () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    await wrapper.find('[aria-label*="Retirer"]').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')[0]).toEqual(['npc-1'])
  })

  it('emet open-details au clic sur le nom', async () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    await wrapper.find('.npc-scene-card__name-btn').trigger('click')
    expect(wrapper.emitted('open-details')).toBeTruthy()
    expect(wrapper.emitted('open-details')[0]).toEqual(['npc-1'])
  })

  it('affiche le style spotlight quand isSpotlight est true', () => {
    const wrapper = mount(NpcSceneCard, {
      props: { npc: fullNpc, isSpotlight: true }
    })
    expect(wrapper.find('.npc-scene-card--spotlight').exists()).toBe(true)
  })

  it('n affiche pas le style spotlight par defaut', () => {
    const wrapper = mount(NpcSceneCard, {
      props: { npc: fullNpc }
    })
    expect(wrapper.find('.npc-scene-card--spotlight').exists()).toBe(false)
  })

  it('emet spotlight au clic sur le bouton spotlight', async () => {
    const wrapper = mount(NpcSceneCard, {
      props: { npc: fullNpc, isSpotlight: false }
    })
    await wrapper.find('.npc-scene-card__spotlight-btn').trigger('click')
    expect(wrapper.emitted('spotlight')).toBeTruthy()
    expect(wrapper.emitted('spotlight')[0]).toEqual(['npc-1'])
  })

  it('declenche la sauvegarde debounced des notes', async () => {
    vi.useFakeTimers()
    mockGetById.mockReturnValue({ ...fullNpc })
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    // Deplier la carte pour acceder au textarea
    await wrapper.find('.npc-scene-card__expand-btn').trigger('click')
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Nouvelle note')
    vi.advanceTimersByTime(600)
    expect(mockGetById).toHaveBeenCalledWith('npc-1')
    expect(mockUpdate).toHaveBeenCalledWith('npc-1', expect.objectContaining({ notes: 'Nouvelle note' }))
    vi.useRealTimers()
  })

  describe('mode collapse', () => {
    it('masque les details par defaut (description, personnalite, motifs, tactiques)', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: detailedNpc, isSpotlight: false }
      })
      expect(wrapper.find('.npc-scene-card__field').exists()).toBe(false)
      expect(wrapper.find('.npc-scene-card__notes').exists()).toBe(false)
    })

    it('affiche le header et le subheader meme en collapse', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: detailedNpc, isSpotlight: false }
      })
      expect(wrapper.find('.npc-scene-card__name').exists()).toBe(true)
      expect(wrapper.find('.npc-scene-card__subheader').exists()).toBe(true)
    })

    it('affiche les relations PJ en collapse (info critique)', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: mockNpcWithRelations, isSpotlight: false }
      })
      expect(wrapper.find('.npc-scene-card__relations').exists()).toBe(true)
    })

    it('deplie les details au clic sur le bouton expand', async () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: detailedNpc, isSpotlight: false }
      })
      await wrapper.find('.npc-scene-card__expand-btn').trigger('click')
      expect(wrapper.find('.npc-scene-card__field').exists()).toBe(true)
      expect(wrapper.find('.npc-scene-card__notes').exists()).toBe(true)
    })
  })
})
