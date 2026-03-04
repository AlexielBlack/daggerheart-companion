import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFileSync } from '../composables/useFileSync.js'

// Mock useStorage exports
vi.mock('@core/composables/useStorage.js', () => ({
  exportAllData: vi.fn(() => JSON.stringify({ 'dh-characters': [] })),
  importAllData: vi.fn(() => ({ success: true }))
}))

describe('useFileSync', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('generateFilename', () => {
    it('produit un nom horodaté au format attendu', () => {
      const { generateFilename } = useFileSync()
      const name = generateFilename()

      expect(name).toMatch(/^daggerheart-backup-\d{8}-\d{4}\.json$/)
    })
  })

  describe('exportToFile', () => {
    it('passe le statut à success après export', () => {
      // Stub DOM : createElement, appendChild, click, removeChild
      const clickSpy = vi.fn()
      const linkEl = {
        href: '',
        download: '',
        style: {},
        click: clickSpy
      }
      vi.spyOn(document, 'createElement').mockReturnValue(linkEl)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      // Stub URL
      globalThis.URL = globalThis.URL || {}
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:test')
      globalThis.URL.revokeObjectURL = vi.fn()

      // Stub Blob
      globalThis.Blob = globalThis.Blob || vi.fn()

      const { exportToFile, status, lastAction } = useFileSync()
      exportToFile()

      expect(status.value).toBe('success')
      expect(lastAction.value).not.toBeNull()
      expect(lastAction.value.type).toBe('export')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('passe le statut à error en cas d\'échec', () => {
      vi.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('DOM indisponible')
      })

      const { exportToFile, status, error } = useFileSync()
      exportToFile()

      expect(status.value).toBe('error')
      expect(error.value).toBeTruthy()
    })
  })

  describe('importFromFile', () => {
    it('refuse un fichier null', async () => {
      const { importFromFile, status, error } = useFileSync()
      const result = await importFromFile(null)

      expect(result.success).toBe(false)
      expect(status.value).toBe('error')
      expect(error.value).toContain('Aucun fichier')
    })

    it('refuse un fichier non-JSON', async () => {
      const file = new File(['data'], 'test.txt', { type: 'text/plain' })
      // Override name property for test
      Object.defineProperty(file, 'name', { value: 'test.txt' })

      const { importFromFile, error } = useFileSync()
      const result = await importFromFile(file)

      expect(result.success).toBe(false)
      expect(error.value).toContain('.json')
    })

    it('importe un fichier JSON valide', async () => {
      const { importAllData } = await import('@core/composables/useStorage.js')
      importAllData.mockReturnValue({ success: true })

      const jsonContent = JSON.stringify({ 'dh-characters': [] })
      const file = { name: 'backup.json' }

      // Mock FileReader avec une classe
      const originalFileReader = globalThis.FileReader
      class MockFileReader {
        readAsText() {
          this.result = jsonContent
          this.onload()
        }
      }
      globalThis.FileReader = MockFileReader

      const { importFromFile, status, lastAction } = useFileSync()
      const result = await importFromFile(file)

      expect(result.success).toBe(true)
      expect(status.value).toBe('success')
      expect(lastAction.value.type).toBe('import')

      globalThis.FileReader = originalFileReader
    })

    it('gère les erreurs d\'import', async () => {
      const { importAllData } = await import('@core/composables/useStorage.js')
      importAllData.mockReturnValue({ success: false, error: 'Format invalide' })

      const jsonContent = '{"bad": "data"}'
      const file = { name: 'backup.json' }

      const originalFileReader = globalThis.FileReader
      class MockFileReader {
        readAsText() {
          this.result = jsonContent
          this.onload()
        }
      }
      globalThis.FileReader = MockFileReader

      const { importFromFile, error } = useFileSync()
      const result = await importFromFile(file)

      expect(result.success).toBe(false)
      expect(error.value).toContain('Format')

      globalThis.FileReader = originalFileReader
    })
  })

  describe('resetStatus', () => {
    it('remet le statut à idle', () => {
      const { status, error, resetStatus } = useFileSync()
      status.value = 'error'
      error.value = 'test'

      resetStatus()

      expect(status.value).toBe('idle')
      expect(error.value).toBeNull()
    })
  })
})
