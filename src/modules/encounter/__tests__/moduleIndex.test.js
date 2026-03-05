/**
 * @module encounter/__tests__/moduleIndex
 * @description Vérifie les exports publics du module encounter.
 */

import { describe, it, expect } from 'vitest'

describe('encounter module index', () => {
  it('exporte tous les stores', async () => {
    const mod = await import('../index.js')
    expect(mod.useEncounterStore).toBeDefined()
    expect(mod.useEncounterLiveStore).toBeDefined()
  })

  it('exporte les composants Builder', async () => {
    const mod = await import('../index.js')
    const builderComponents = [
      'AdversaryPicker', 'BattlePointsBar', 'EncounterConfig',
      'EncounterSlotList', 'EncounterSummary', 'EnvironmentPicker',
      'PcPicker', 'SavedEncounterList'
    ]
    for (const name of builderComponents) {
      expect(mod[name]).toBeDefined()
      expect(mod[name].name || mod[name].__name).toBeTruthy()
    }
  })

  it('exporte les composants Live Play', async () => {
    const mod = await import('../index.js')
    const liveComponents = [
      'PcSidebarCard', 'AdversaryGroupCard', 'ContextPanel',
      'FeatureCard', 'EnvironmentPanel',
      'SceneModeSelector', 'AdversaryLiveCard', 'PcLivePanel', 'AdversaryTargetPanel'
    ]
    for (const name of liveComponents) {
      expect(mod[name]).toBeDefined()
      expect(mod[name].name || mod[name].__name).toBeTruthy()
    }
  })

  it('exporte les composables', async () => {
    const mod = await import('../index.js')
    expect(typeof mod.useEncounterFeatures).toBe('function')
    expect(typeof mod.classifyAdversaryFeatures).toBe('function')
    expect(typeof mod.useUndoStack).toBe('function')
    expect(typeof mod.useCombatLog).toBe('function')
    expect(typeof mod.useSpotlights).toBe('function')
  })

  it('exporte les vues', async () => {
    const mod = await import('../index.js')
    expect(mod.EncounterBuilder).toBeDefined()
    expect(mod.EncounterLive).toBeDefined()
  })

  it('exporte exactement 26 éléments', async () => {
    const mod = await import('../index.js')
    // 2 stores + 8 builder + 9 live + 5 composables + 2 vues = 26
    const exportNames = Object.keys(mod)
    expect(exportNames.length).toBe(26)
  })
})
