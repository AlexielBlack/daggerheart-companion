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

  it('affiche la valeur existante des notes dans le textarea', () => {
    const wrapper = mount(NpcSceneCard, { props: { npc: fullNpc } })
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
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Nouvelle note')
    vi.advanceTimersByTime(600)
    expect(mockGetById).toHaveBeenCalledWith('npc-1')
    expect(mockUpdate).toHaveBeenCalledWith('npc-1', expect.objectContaining({ notes: 'Nouvelle note' }))
    vi.useRealTimers()
  })
})
