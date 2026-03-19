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
    ally: { label: 'Allie', emoji: '\uD83E\uDD1D', color: '#059669' },
    neutral: { label: 'Neutre', emoji: '\uD83D\uDE10', color: '#6b7280' },
    hostile: { label: 'Hostile', emoji: '\u26A0\uFE0F', color: '#dc2626' },
    dead: { label: 'Mort', emoji: '\uD83D\uDC80', color: '#374151' },
    missing: { label: 'Disparu', emoji: '\u2753', color: '#7c3aed' }
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
  })

  it('affiche la pastille statut avec la bonne couleur', () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    const dot = wrapper.find('.npc-scene-card__dot')
    expect(dot.exists()).toBe(true)
    expect(dot.attributes('style')).toContain('#dc2626')
  })

  it('affiche les notes dans le textarea via l\'onglet Notes', async () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
    // Cliquer sur l'onglet Notes
    const tabs = wrapper.findAll('.npc-scene-card__tab')
    const notesTab = tabs.find(t => t.text().includes('Notes'))
    expect(notesTab).toBeTruthy()
    await notesTab.trigger('click')
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
    // Aller sur l'onglet Notes
    const tabs = wrapper.findAll('.npc-scene-card__tab')
    const notesTab = tabs.find(t => t.text().includes('Notes'))
    await notesTab.trigger('click')
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Nouvelle note')
    vi.advanceTimersByTime(600)
    expect(mockGetById).toHaveBeenCalledWith('npc-1')
    expect(mockUpdate).toHaveBeenCalledWith('npc-1', expect.objectContaining({ notes: 'Nouvelle note' }))
    vi.useRealTimers()
  })

  describe('onglets integres', () => {
    it('ne contient plus de bouton expand/collapse', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: detailedNpc, isSpotlight: false }
      })
      expect(wrapper.find('.npc-scene-card__expand-btn').exists()).toBe(false)
    })

    it('affiche l\'onglet Profil quand le PNJ a du contenu profil', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: detailedNpc, isSpotlight: false }
      })
      const tabs = wrapper.findAll('.npc-scene-card__tab')
      const allText = tabs.map(t => t.text()).join(' ')
      expect(allText).toContain('Profil')
      expect(allText).toContain('Notes')
    })

    it('n\'affiche pas l\'onglet Profil quand pas de contenu profil', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: minimalNpc, isSpotlight: false }
      })
      const tabs = wrapper.findAll('.npc-scene-card__tab')
      const allText = tabs.map(t => t.text()).join(' ')
      expect(allText).not.toContain('Profil')
      expect(allText).toContain('Notes')
    })

    it('affiche le header et subheader directement', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: detailedNpc, isSpotlight: false }
      })
      expect(wrapper.find('.npc-scene-card__name').exists()).toBe(true)
      expect(wrapper.find('.npc-scene-card__subheader').exists()).toBe(true)
    })

    it('affiche les relations PJ en dehors des onglets', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: mockNpcWithRelations, isSpotlight: false }
      })
      expect(wrapper.find('.npc-scene-card__relations').exists()).toBe(true)
    })

    it('affiche la description dans l\'onglet Profil', () => {
      const wrapper = mount(NpcSceneCard, {
        props: { npc: detailedNpc, isSpotlight: false }
      })
      // L'onglet profil est actif par defaut quand du contenu existe
      expect(wrapper.text()).toContain('Un vieil homme mysterieux')
      expect(wrapper.text()).toContain('Curieux et distant')
    })
  })
})
