import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useGistSync } from '../composables/useGistSync.js'

// Mock useStorage exports
vi.mock('@core/composables/useStorage.js', () => ({
  exportAllData: vi.fn(() => JSON.stringify({ 'dh-characters': [] })),
  importAllData: vi.fn(() => ({ success: true }))
}))

describe('useGistSync', () => {
  let originalFetch

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  describe('getToken / setToken / clearToken', () => {
    it('retourne null sans token configuré', () => {
      const { getToken } = useGistSync()
      expect(getToken()).toBeNull()
    })

    it('sauvegarde et récupère un token', () => {
      const { getToken, setToken } = useGistSync()
      setToken('ghp_test123')
      expect(getToken()).toBe('ghp_test123')
    })

    it('supprime le token', () => {
      const { getToken, setToken, clearToken } = useGistSync()
      setToken('ghp_test123')
      clearToken()
      expect(getToken()).toBeNull()
    })
  })

  describe('getGistId / setGistId', () => {
    it('retourne null sans gist ID', () => {
      const { getGistId } = useGistSync()
      expect(getGistId()).toBeNull()
    })

    it('sauvegarde et récupère un gist ID', () => {
      const { getGistId, setGistId } = useGistSync()
      setGistId('abc123')
      expect(getGistId()).toBe('abc123')
    })
  })

  describe('isConfigured', () => {
    it('retourne false sans configuration', () => {
      const { isConfigured } = useGistSync()
      expect(isConfigured.value).toBe(false)
    })

    it('retourne true avec token et gist ID', () => {
      const { isConfigured, setToken, setGistId } = useGistSync()
      setToken('ghp_test')
      setGistId('gist123')
      // Computed recalcule à la lecture
      expect(isConfigured.value).toBe(true)
    })
  })

  describe('validateToken', () => {
    it('retourne valid avec un token valide', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser' })
      })

      const { validateToken } = useGistSync()
      const result = await validateToken('ghp_valid')

      expect(result.valid).toBe(true)
      expect(result.username).toBe('testuser')
    })

    it('retourne invalid avec un token expiré', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      })

      const { validateToken } = useGistSync()
      const result = await validateToken('ghp_expired')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('invalide')
    })

    it('gère les erreurs réseau', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { validateToken } = useGistSync()
      const result = await validateToken('ghp_test')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('connexion')
    })
  })

  describe('push', () => {
    it('échoue sans token', async () => {
      const { push, status, error } = useGistSync()
      const result = await push()

      expect(result.success).toBe(false)
      expect(status.value).toBe('error')
      expect(error.value).toContain('Token')
    })

    it('crée un gist automatiquement au premier push', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'new-gist-id' })
      })

      const { push, setToken, getGistId, status, lastSync } = useGistSync()
      setToken('ghp_test')

      const result = await push()

      expect(result.success).toBe(true)
      expect(getGistId()).toBe('new-gist-id')
      expect(status.value).toBe('success')
      expect(lastSync.value.type).toBe('push')
    })

    it('met à jour un gist existant', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      })

      const { push, setToken, setGistId, status } = useGistSync()
      setToken('ghp_test')
      setGistId('existing-gist')

      const result = await push()

      expect(result.success).toBe(true)
      expect(status.value).toBe('success')
      // Vérifie que PATCH a été utilisé
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('existing-gist'),
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('recrée le gist si 404', async () => {
      let callCount = 0
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // Premier appel : PATCH retourne 404
          return Promise.resolve({ ok: false, status: 404 })
        }
        // Deuxième appel : POST crée un nouveau gist
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'recreated-gist' })
        })
      })

      const { push, setToken, setGistId, getGistId } = useGistSync()
      setToken('ghp_test')
      setGistId('deleted-gist')

      const result = await push()

      expect(result.success).toBe(true)
      expect(getGistId()).toBe('recreated-gist')
    })

    it('gère les erreurs réseau', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { push, setToken, setGistId, status, error } = useGistSync()
      setToken('ghp_test')
      setGistId('test-gist')

      const result = await push()

      expect(result.success).toBe(false)
      expect(status.value).toBe('error')
      expect(error.value).toContain('Impossible')
    })
  })

  describe('pull', () => {
    it('échoue sans configuration', async () => {
      const { pull, status, error } = useGistSync()
      const result = await pull()

      expect(result.success).toBe(false)
      expect(status.value).toBe('error')
      expect(error.value).toContain('Configuration')
    })

    it('importe les données distantes', async () => {
      const payload = {
        version: 1,
        appName: 'daggerheart-companion',
        syncDate: '2025-01-01T00:00:00Z',
        data: { 'dh-characters': [{ name: 'Theron' }] }
      }

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          updated_at: '2025-01-01T00:00:00Z',
          description: 'test',
          files: {
            'daggerheart-companion-sync.json': {
              content: JSON.stringify(payload)
            }
          }
        })
      })

      const { importAllData } = await import('@core/composables/useStorage.js')
      importAllData.mockReturnValue({ success: true })

      const { pull, setToken, setGistId, status, lastSync } = useGistSync()
      setToken('ghp_test')
      setGistId('test-gist')

      const result = await pull()

      expect(result.success).toBe(true)
      expect(status.value).toBe('success')
      expect(lastSync.value.type).toBe('pull')
      expect(importAllData).toHaveBeenCalled()
    })

    it('rejette un format invalide', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          updated_at: '2025-01-01T00:00:00Z',
          description: 'test',
          files: {
            'daggerheart-companion-sync.json': {
              content: JSON.stringify({ bad: 'format' })
            }
          }
        })
      })

      const { pull, setToken, setGistId, status, error } = useGistSync()
      setToken('ghp_test')
      setGistId('test-gist')

      const result = await pull()

      expect(result.success).toBe(false)
      expect(status.value).toBe('error')
      expect(error.value).toContain('invalide')
    })

    it('gère un gist supprimé (404)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      const { pull, setToken, setGistId, error } = useGistSync()
      setToken('ghp_test')
      setGistId('deleted-gist')

      const result = await pull()

      expect(result.success).toBe(false)
      expect(error.value).toContain('introuvable')
    })
  })

  describe('disconnect', () => {
    it('supprime token, gist ID et réinitialise l\'état', () => {
      const { disconnect, setToken, setGistId, getToken, getGistId, status, error } = useGistSync()
      setToken('ghp_test')
      setGistId('gist123')

      disconnect()

      expect(getToken()).toBeNull()
      expect(getGistId()).toBeNull()
      expect(status.value).toBe('idle')
      expect(error.value).toBeNull()
    })
  })

  describe('fetchRemoteInfo', () => {
    it('échoue sans configuration', async () => {
      const { fetchRemoteInfo } = useGistSync()
      const result = await fetchRemoteInfo()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Configuration')
    })

    it('récupère les infos distantes', async () => {
      const payload = {
        version: 1,
        syncDate: '2025-06-15T10:00:00Z',
        data: {}
      }

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          updated_at: '2025-06-15T10:00:00Z',
          description: 'Daggerheart Companion',
          html_url: 'https://gist.github.com/abc123',
          files: {
            'daggerheart-companion-sync.json': {
              content: JSON.stringify(payload)
            }
          }
        })
      })

      const { fetchRemoteInfo, setToken, setGistId, remoteInfo } = useGistSync()
      setToken('ghp_test')
      setGistId('gist123')

      const result = await fetchRemoteInfo()

      expect(result.success).toBe(true)
      expect(result.info.syncDate).toBe('2025-06-15T10:00:00Z')
      expect(result.info.url).toBe('https://gist.github.com/abc123')
      expect(remoteInfo.value).toBeTruthy()
    })
  })
})
