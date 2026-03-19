import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useSceneDrawer', () => {
  let drawer, useSceneDrawer

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../useSceneDrawer')
    useSceneDrawer = mod.useSceneDrawer
    drawer = useSceneDrawer()
  })

  it('demarre ferme', () => {
    expect(drawer.isOpen.value).toBe(false)
    expect(drawer.mode.value).toBe(null)
    expect(drawer.targetId.value).toBe(null)
  })

  it('ouvre en mode npc avec un id', () => {
    drawer.openNpc('npc-1')
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('npc')
    expect(drawer.targetId.value).toBe('npc-1')
  })

  it('ouvre en mode pc avec un id', () => {
    drawer.openPc('pc-1')
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('pc')
    expect(drawer.targetId.value).toBe('pc-1')
  })

  it('ouvre en mode catalogue', () => {
    drawer.openCatalogue()
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('catalogue')
    expect(drawer.targetId.value).toBe(null)
  })

  it('ouvre en mode generator', () => {
    drawer.openGenerator()
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('generator')
    expect(drawer.targetId.value).toBe(null)
  })

  it('ferme et reinitialise', () => {
    drawer.openNpc('npc-1')
    drawer.close()
    expect(drawer.isOpen.value).toBe(false)
    expect(drawer.mode.value).toBe(null)
    expect(drawer.targetId.value).toBe(null)
  })

  it('change de cible sans fermer', () => {
    drawer.openNpc('npc-1')
    drawer.openNpc('npc-2')
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.targetId.value).toBe('npc-2')
  })

  it('change de mode sans fermer', () => {
    drawer.openNpc('npc-1')
    drawer.openCatalogue()
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('catalogue')
    expect(drawer.targetId.value).toBe(null)
  })
})
