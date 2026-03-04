import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSyncStore } from '../stores/syncStore.js'

describe('useSyncStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('initialise avec un historique vide', () => {
    const store = useSyncStore()
    expect(store.history).toEqual([])
  })

  describe('addHistoryEntry', () => {
    it('ajoute une entrée à l\'historique', () => {
      const store = useSyncStore()
      store.addHistoryEntry({
        type: 'export',
        method: 'file',
        date: '2025-01-01T00:00:00Z',
        success: true
      })

      expect(store.history).toHaveLength(1)
      expect(store.history[0].type).toBe('export')
      expect(store.history[0].id).toBeTruthy()
    })

    it('insère les entrées en tête (plus récent d\'abord)', () => {
      const store = useSyncStore()
      store.addHistoryEntry({
        type: 'export',
        method: 'file',
        date: '2025-01-01T00:00:00Z',
        success: true
      })
      store.addHistoryEntry({
        type: 'push',
        method: 'gist',
        date: '2025-01-02T00:00:00Z',
        success: true
      })

      expect(store.history[0].type).toBe('push')
      expect(store.history[1].type).toBe('export')
    })

    it('limite l\'historique à 20 entrées', () => {
      const store = useSyncStore()

      for (let i = 0; i < 25; i++) {
        store.addHistoryEntry({
          type: 'export',
          method: 'file',
          date: new Date().toISOString(),
          success: true
        })
      }

      expect(store.history).toHaveLength(20)
    })
  })

  describe('clearHistory', () => {
    it('vide l\'historique', () => {
      const store = useSyncStore()
      store.addHistoryEntry({
        type: 'export',
        method: 'file',
        date: '2025-01-01T00:00:00Z',
        success: true
      })

      store.clearHistory()
      expect(store.history).toEqual([])
    })
  })

  describe('getLastSuccessfulSync', () => {
    it('retourne null sans historique', () => {
      const store = useSyncStore()
      expect(store.getLastSuccessfulSync()).toBeNull()
    })

    it('retourne la dernière sync réussie', () => {
      const store = useSyncStore()
      store.addHistoryEntry({
        type: 'export',
        method: 'file',
        date: '2025-01-01T00:00:00Z',
        success: true
      })
      store.addHistoryEntry({
        type: 'push',
        method: 'gist',
        date: '2025-01-02T00:00:00Z',
        success: false
      })

      const last = store.getLastSuccessfulSync()
      expect(last).not.toBeNull()
      expect(last.type).toBe('export')
      expect(last.success).toBe(true)
    })
  })

  describe('persistance localStorage', () => {
    it('persiste l\'historique via useStorage', () => {
      const store = useSyncStore()
      store.addHistoryEntry({
        type: 'push',
        method: 'gist',
        date: '2025-06-01T00:00:00Z',
        success: true
      })

      // Vérifier que localStorage contient les données
      const raw = localStorage.getItem('dh-sync-history')
      expect(raw).toBeTruthy()

      const parsed = JSON.parse(raw)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].method).toBe('gist')
    })
  })
})
