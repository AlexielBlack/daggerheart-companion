import { describe, it, expect } from 'vitest'

describe('sync module index', () => {
  it('exporte useFileSync', async () => {
    const mod = await import('../index.js')
    expect(mod.useFileSync).toBeDefined()
    expect(typeof mod.useFileSync).toBe('function')
  })

  it('exporte useGistSync', async () => {
    const mod = await import('../index.js')
    expect(mod.useGistSync).toBeDefined()
    expect(typeof mod.useGistSync).toBe('function')
  })

  it('exporte useSyncStore', async () => {
    const mod = await import('../index.js')
    expect(mod.useSyncStore).toBeDefined()
    expect(typeof mod.useSyncStore).toBe('function')
  })

  it('exporte les composants Vue', async () => {
    const mod = await import('../index.js')
    expect(mod.FileSyncPanel).toBeDefined()
    expect(mod.GistSyncPanel).toBeDefined()
    expect(mod.SyncHistory).toBeDefined()
    expect(mod.SyncManager).toBeDefined()
  })
})
