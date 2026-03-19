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

  describe('tri et filtre PNJs', () => {
    beforeEach(() => {
      mockNpcs = [
        { id: 'npc-1', name: 'Grendak', title: 'le Forgeron', status: 'hostile', faction: 'Guilde', notes: '' },
        { id: 'npc-2', name: 'Lyra', title: '', status: 'ally', faction: '', notes: '' },
        { id: 'npc-3', name: 'Korbin', title: 'le Sage', status: 'neutral', faction: 'Temple', notes: '' }
      ]
    })

    it('affiche les boutons de filtre quand 3+ PNJs', () => {
      const session = useSessionStore()
      session.addNpc('npc-1')
      session.addNpc('npc-2')
      session.addNpc('npc-3')
      const wrapper = mount(NpcGroupPanel)
      expect(wrapper.find('.npc-group__filters').exists()).toBe(true)
      expect(wrapper.findAll('.npc-group__filter-btn')).toHaveLength(4)
    })

    it('masque les filtres quand 2 ou moins PNJs', () => {
      const session = useSessionStore()
      session.addNpc('npc-1')
      session.addNpc('npc-2')
      const wrapper = mount(NpcGroupPanel)
      expect(wrapper.find('.npc-group__filters').exists()).toBe(false)
    })

    it('filtre par statut au clic', async () => {
      const session = useSessionStore()
      session.addNpc('npc-1')
      session.addNpc('npc-2')
      session.addNpc('npc-3')
      const wrapper = mount(NpcGroupPanel)

      // Cliquer sur le filtre "Hostiles"
      const hostileBtn = wrapper.findAll('.npc-group__filter-btn').find(b => b.text() === 'Hostiles')
      await hostileBtn.trigger('click')

      // Seul le PNJ hostile doit etre visible
      const cards = wrapper.findAll('[role="listitem"]')
      expect(cards).toHaveLength(1)
      expect(wrapper.text()).toContain('Grendak')
      expect(wrapper.text()).not.toContain('Lyra')
      expect(wrapper.text()).not.toContain('Korbin')
    })

    it('tri spotlight-first puis par priorite de statut', async () => {
      const { nextTick } = await import('vue')
      const session = useSessionStore()
      session.addNpc('npc-1')
      session.addNpc('npc-2')
      session.addNpc('npc-3')
      // Mettre en spotlight le PNJ allie (normalement en bas)
      session.setSpotlight('npc-2')
      await nextTick()
      const wrapper = mount(NpcGroupPanel)

      const cards = wrapper.findAll('[role="listitem"]')
      // Le spotlight (Lyra, ally) doit etre en premier
      expect(cards[0].text()).toContain('Lyra')
      // Puis hostile avant neutral
      expect(cards[1].text()).toContain('Grendak')
      expect(cards[2].text()).toContain('Korbin')
    })

    it('conserve le total dans le titre meme avec filtre actif', async () => {
      const session = useSessionStore()
      session.addNpc('npc-1')
      session.addNpc('npc-2')
      session.addNpc('npc-3')
      const wrapper = mount(NpcGroupPanel)

      // Filtrer sur hostiles uniquement
      const hostileBtn = wrapper.findAll('.npc-group__filter-btn').find(b => b.text() === 'Hostiles')
      await hostileBtn.trigger('click')

      // Le titre affiche toujours le total (3), pas le filtre (1)
      expect(wrapper.text()).toContain('PNJs (3)')
    })
  })
})
