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
    expect(mod.useEncounterHistoryStore).toBeDefined()
  })

  it('exporte les composants Builder', async () => {
    const mod = await import('../index.js')
    const builderComponents = [
      'AdversaryPicker', 'BattlePointsBar', 'EncounterConfig',
      'EncounterSlotList', 'EncounterSummary', 'EnvironmentPicker',
      'PcPicker', 'SavedEncounterList', 'EncounterHistory',
      'EncounterSharePanel', 'EncounterTemplatePicker'
    ]
    for (const name of builderComponents) {
      expect(mod[name]).toBeDefined()
      expect(mod[name].name || mod[name].__name).toBeTruthy()
    }
  })

  it('exporte les composants Live Play', async () => {
    const mod = await import('../index.js')
    const liveComponents = [
      'PcSidebarCard', 'AdversaryGroupCard', 'ContextPanel', 'CountdownTracker',
      'FeatureCard', 'EnvironmentPanel',
      'SceneModeSelector', 'AdversaryLiveCard', 'PcLivePanel', 'AdversaryTargetPanel',
      'SpotlightToggle', 'CombatLogDrawer',
      'SessionTimer', 'QuickReferencePanel',
      'CombatDashboard', 'FearHopeTracker', 'BattlefieldOverview'
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
    expect(typeof mod.useHaptic).toBe('function')
    expect(mod.HAPTIC_PATTERNS).toBeDefined()
    expect(typeof mod.useSessionTimer).toBe('function')
    expect(typeof mod.useFearHope).toBe('function')
    expect(typeof mod.useLiveStats).toBe('function')
    expect(typeof mod.usePlayerActions).toBe('function')
  })

  it('exporte les vues', async () => {
    const mod = await import('../index.js')
    expect(mod.EncounterBuilder).toBeDefined()
    expect(mod.EncounterLive).toBeDefined()
  })

  it('exporte exactement 44 éléments', async () => {
    const mod = await import('../index.js')
    // 3 stores + 11 builder + 17 live + 11 composables + 2 vues = 44
    const exportNames = Object.keys(mod)
    expect(exportNames.length).toBe(44)
  })
})
