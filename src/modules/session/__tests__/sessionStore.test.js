import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────────
// Chaque appel cree un objet de stockage independant avec la valeur par defaut.
// Utilise de vrais ref() Vue pour que Pinia les unwrap correctement.
vi.mock('@core/composables/useStorage', async () => {
  const { ref: vueRef } = await import('vue')
  return {
    useStorage: (_key, defaultValue) => {
      const data = vueRef(JSON.parse(JSON.stringify(defaultValue)))
      return {
        data,
        save: (val) => { data.value = JSON.parse(JSON.stringify(val)) },
        remove: () => { data.value = JSON.parse(JSON.stringify(defaultValue)) },
        error: vueRef(null)
      }
    }
  }
})

// ── Mocks des stores dependants ──────────────────────────

const mockEnvironments = [
  { id: 'env-1', name: 'Foret sombre', tier: 1 },
  { id: 'env-2', name: 'Donjon oublie', tier: 2 }
]

const mockNpcs = [
  { id: 'npc-1', name: 'Aldric le sage' },
  { id: 'npc-2', name: 'Bruna la guerriere' },
  { id: 'npc-3', name: 'Cedric le voleur' }
]

vi.mock('@modules/environments', () => ({
  useEnvironmentStore: () => ({
    allItems: mockEnvironments
  })
}))

vi.mock('@modules/npcs', () => ({
  useNpcStore: () => ({
    getById: (id) => mockNpcs.find(n => n.id === id) || null
  })
}))

import { useSessionStore } from '../stores/sessionStore'

// ── Tests ─────────────────────────────────────────────

describe('sessionStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSessionStore()
  })

  // ── Etat initial ──────────────────────────────────

  describe('etat initial', () => {
    it('a environmentId null par defaut', () => {
      expect(store.environmentId).toBeNull()
    })

    it('a une liste de PNJs vide', () => {
      expect(store.loadedNpcIds).toEqual([])
    })

    it('a des notes de session vides', () => {
      expect(store.sessionNotes).toBe('')
    })

    it('a lastLaunchedEncounterId null', () => {
      expect(store.lastLaunchedEncounterId).toBeNull()
    })
  })

  // ── Environnement ─────────────────────────────────

  describe('setEnvironment / clearEnvironment', () => {
    it('definit l\'environnement actif', () => {
      store.setEnvironment('env-1')
      expect(store.environmentId).toBe('env-1')
    })

    it('change l\'environnement', () => {
      store.setEnvironment('env-1')
      store.setEnvironment('env-2')
      expect(store.environmentId).toBe('env-2')
    })

    it('efface l\'environnement via clearEnvironment', () => {
      store.setEnvironment('env-1')
      store.clearEnvironment()
      expect(store.environmentId).toBeNull()
    })
  })

  // ── PNJs ──────────────────────────────────────────

  describe('addNpc / removeNpc / toggleNpc / clearNpcs', () => {
    it('ajoute un PNJ', () => {
      store.addNpc('npc-1')
      expect(store.loadedNpcIds).toEqual(['npc-1'])
    })

    it('empeche les doublons', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-1')
      expect(store.loadedNpcIds).toEqual(['npc-1'])
    })

    it('ajoute plusieurs PNJs distincts', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-2')
      expect(store.loadedNpcIds).toEqual(['npc-1', 'npc-2'])
    })

    it('retire un PNJ', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-2')
      store.removeNpc('npc-1')
      expect(store.loadedNpcIds).toEqual(['npc-2'])
    })

    it('ignore le retrait d\'un PNJ absent', () => {
      store.addNpc('npc-1')
      store.removeNpc('npc-inexistant')
      expect(store.loadedNpcIds).toEqual(['npc-1'])
    })

    it('toggleNpc ajoute si absent', () => {
      store.toggleNpc('npc-1')
      expect(store.loadedNpcIds).toEqual(['npc-1'])
    })

    it('toggleNpc retire si present', () => {
      store.addNpc('npc-1')
      store.toggleNpc('npc-1')
      expect(store.loadedNpcIds).toEqual([])
    })

    it('clearNpcs vide la liste', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-2')
      store.clearNpcs()
      expect(store.loadedNpcIds).toEqual([])
    })
  })

  // ── Notes de session ──────────────────────────────

  describe('setSessionNotes', () => {
    it('definit les notes de session', () => {
      store.setSessionNotes('La taverne brule')
      expect(store.sessionNotes).toBe('La taverne brule')
    })

    it('remplace les notes precedentes', () => {
      store.setSessionNotes('Premier texte')
      store.setSessionNotes('Deuxieme texte')
      expect(store.sessionNotes).toBe('Deuxieme texte')
    })
  })

  // ── resetSession ──────────────────────────────────

  describe('resetSession', () => {
    it('reinitialise tous les champs', () => {
      store.setEnvironment('env-1')
      store.addNpc('npc-1')
      store.addNpc('npc-2')
      store.setSessionNotes('Notes importantes')
      store.lastLaunchedEncounterId = 'enc-42'

      store.resetSession()

      expect(store.environmentId).toBeNull()
      expect(store.loadedNpcIds).toEqual([])
      expect(store.sessionNotes).toBe('')
      expect(store.lastLaunchedEncounterId).toBeNull()
    })
  })

  // ── Getters booleens ──────────────────────────────

  describe('hasEnvironment / hasNpcs', () => {
    it('hasEnvironment est false sans environnement', () => {
      expect(store.hasEnvironment).toBe(false)
    })

    it('hasEnvironment est true avec un environnement', () => {
      store.setEnvironment('env-1')
      expect(store.hasEnvironment).toBe(true)
    })

    it('hasNpcs est false sans PNJs', () => {
      expect(store.hasNpcs).toBe(false)
    })

    it('hasNpcs est true avec des PNJs', () => {
      store.addNpc('npc-1')
      expect(store.hasNpcs).toBe(true)
    })
  })

  // ── Getters computed ──────────────────────────────

  describe('loadedEnvironment', () => {
    it('retourne null sans environnement selectionne', () => {
      expect(store.loadedEnvironment).toBeNull()
    })

    it('retourne l\'environnement correspondant', () => {
      store.setEnvironment('env-1')
      expect(store.loadedEnvironment).toEqual({ id: 'env-1', name: 'Foret sombre', tier: 1 })
    })

    it('retourne null pour un ID invalide', () => {
      store.setEnvironment('env-inexistant')
      expect(store.loadedEnvironment).toBeNull()
    })
  })

  describe('loadedNpcs', () => {
    it('retourne un tableau vide sans PNJs charges', () => {
      expect(store.loadedNpcs).toEqual([])
    })

    it('retourne les PNJs correspondants', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-2')
      expect(store.loadedNpcs).toHaveLength(2)
      expect(store.loadedNpcs[0].name).toBe('Aldric le sage')
      expect(store.loadedNpcs[1].name).toBe('Bruna la guerriere')
    })

    it('filtre les IDs invalides', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-inexistant')
      expect(store.loadedNpcs).toHaveLength(1)
      expect(store.loadedNpcs[0].name).toBe('Aldric le sage')
    })
  })

  describe('loadedNpcCount', () => {
    it('retourne 0 sans PNJs', () => {
      expect(store.loadedNpcCount).toBe(0)
    })

    it('retourne le nombre de PNJs resolus', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-2')
      expect(store.loadedNpcCount).toBe(2)
    })

    it('ne compte pas les IDs invalides', () => {
      store.addNpc('npc-1')
      store.addNpc('npc-inexistant')
      expect(store.loadedNpcCount).toBe(1)
    })
  })
})
