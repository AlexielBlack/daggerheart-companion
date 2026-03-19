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

vi.mock('@modules/npcs', () => ({
  useNpcStore: () => ({
    getById: (id) => mockNpcs.find(n => n.id === id) || null
  }),
  NPC_STATUS_META: {
    ally: { label: 'Allie', emoji: '🤝', color: '#059669' },
    neutral: { label: 'Neutre', emoji: '😐', color: '#6b7280' },
    hostile: { label: 'Hostile', emoji: '⚠️', color: '#dc2626' },
    dead: { label: 'Mort', emoji: '💀', color: '#374151' },
    missing: { label: 'Disparu', emoji: '❓', color: '#7c3aed' }
  }
}))

import NpcGroupPanel from '../NpcGroupPanel.vue'
import { useSessionStore } from '../../stores/sessionStore'

let mockNpcs = []

describe('NpcGroupPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockNpcs = [
      { id: 'npc-1', name: 'Grendak', title: 'le Forgeron', status: 'hostile', faction: 'Guilde', notes: '' },
      { id: 'npc-2', name: 'Lyra', title: '', status: 'ally', faction: '', notes: '' }
    ]
  })

  it('affiche les cartes quand des PNJs sont charges', () => {
    const session = useSessionStore()
    session.addNpc('npc-1')
    session.addNpc('npc-2')
    const wrapper = mount(NpcGroupPanel)
    expect(wrapper.text()).toContain('PNJs (2)')
    expect(wrapper.text()).toContain('Grendak')
    expect(wrapper.text()).toContain('Lyra')
  })

  it('affiche le message vide quand aucun PNJ', () => {
    const wrapper = mount(NpcGroupPanel)
    expect(wrapper.text()).toContain('Aucun PNJ')
  })

  it('emet open-catalogue au clic sur Ajouter', async () => {
    const wrapper = mount(NpcGroupPanel)
    await wrapper.find('[aria-label*="Ajouter"]').trigger('click')
    expect(wrapper.emitted('open-catalogue')).toBeTruthy()
  })

  it('appelle clearNpcs au clic sur Tout retirer', async () => {
    const session = useSessionStore()
    session.addNpc('npc-1')
    const wrapper = mount(NpcGroupPanel)
    await wrapper.find('[aria-label*="Retirer tous"]').trigger('click')
    expect(session.loadedNpcIds).toHaveLength(0)
  })

  it('affiche le compteur dynamique dans le titre', () => {
    const session = useSessionStore()
    session.addNpc('npc-1')
    const wrapper = mount(NpcGroupPanel)
    expect(wrapper.text()).toContain('PNJs (1)')
  })
})
