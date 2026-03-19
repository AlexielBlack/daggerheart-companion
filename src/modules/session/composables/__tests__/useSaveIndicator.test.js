import { describe, it, expect, vi } from 'vitest'
import { useSaveIndicator } from '../useSaveIndicator'

describe('useSaveIndicator', () => {
  it('retourne isSaving=false par defaut', () => {
    const { isSaving } = useSaveIndicator()
    expect(isSaving.value).toBe(false)
  })

  it('passe isSaving=true apres markDirty', () => {
    const { isSaving, markDirty } = useSaveIndicator()
    markDirty()
    expect(isSaving.value).toBe(true)
  })

  it('passe isSaving=false apres markSaved + delai', async () => {
    vi.useFakeTimers()
    const { isSaving, markDirty, markSaved } = useSaveIndicator()
    markDirty()
    expect(isSaving.value).toBe(true)
    markSaved()
    expect(isSaving.value).toBe(true) // encore true pendant le delai
    vi.advanceTimersByTime(600)
    expect(isSaving.value).toBe(false)
    vi.useRealTimers()
  })
})
