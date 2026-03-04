import { describe, it, expect, beforeEach } from 'vitest'
import { useStorage, exportAllData, importAllData } from '../composables/useStorage.js'

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retourne la valeur par défaut si la clé n\'existe pas', () => {
    const { data } = useStorage('test-key', 'default')
    expect(data.value).toBe('default')
  })

  it('sauvegarde et charge une valeur', () => {
    const { data, save } = useStorage('test-save', null)
    save({ name: 'Kaelith', level: 3 })
    expect(data.value).toEqual({ name: 'Kaelith', level: 3 })

    // Recharger depuis le storage
    const { data: reloaded } = useStorage('test-save', null)
    expect(reloaded.value).toEqual({ name: 'Kaelith', level: 3 })
  })

  it('préfixe la clé avec "dh-"', () => {
    const { save } = useStorage('my-key', 'default')
    save('value')
    expect(localStorage.getItem('dh-my-key')).toBe('"value"')
  })

  it('supprime une clé', () => {
    const { remove } = useStorage('to-delete', 'data')
    remove()
    expect(localStorage.getItem('dh-to-delete')).toBeNull()
  })

  it('gère les données corrompues gracieusement', () => {
    localStorage.setItem('dh-corrupted', '{invalid json')
    const { data, error } = useStorage('corrupted', 'fallback')
    expect(data.value).toBe('fallback')
    expect(error.value).toBeTruthy()
  })
})

describe('exportAllData / importAllData', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exporte toutes les données dh-*', () => {
    localStorage.setItem('dh-enc-1', JSON.stringify({ name: 'Test' }))
    localStorage.setItem('dh-char-1', JSON.stringify({ name: 'Hero' }))
    localStorage.setItem('other-key', 'ignored')

    const exported = exportAllData()
    const parsed = JSON.parse(exported)

    expect(parsed['dh-enc-1']).toEqual({ name: 'Test' })
    expect(parsed['dh-char-1']).toEqual({ name: 'Hero' })
    expect(parsed['other-key']).toBeUndefined()
  })

  it('importe des données correctement', () => {
    const backup = JSON.stringify({
      'dh-enc-1': { name: 'Imported' },
      'dh-char-1': { name: 'Imported Hero' }
    })

    const result = importAllData(backup)
    expect(result.success).toBe(true)
    expect(JSON.parse(localStorage.getItem('dh-enc-1'))).toEqual({ name: 'Imported' })
  })

  it('rejette un JSON invalide à l\'import', () => {
    const result = importAllData('not valid json')
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
})
