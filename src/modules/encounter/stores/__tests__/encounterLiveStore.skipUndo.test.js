// Tests pour les paramètres skipUndo/skipLog des fonctions de mutation

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterLiveStore } from '../encounterLiveStore'

describe('skipUndo/skipLog parameter', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEncounterLiveStore()
    store.liveAdversaries = [{
      instanceId: 'goblin_0',
      adversaryId: 'goblin',
      name: 'Gobelin',
      type: 'Standard',
      tier: 1,
      maxHP: 5,
      maxStress: 3,
      markedHP: 0,
      markedStress: 0,
      conditions: [],
      isDefeated: false,
      difficulty: 10,
      thresholds: { major: 3, severe: 5 }
    }]
    store.isActive = true
  })

  it('markAdversaryHP avec skipUndo ne push pas dans le undo stack', () => {
    const undoBefore = store.undoStack.length
    store.markAdversaryHP('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].markedHP).toBe(1)
  })

  it('markAdversaryHP avec skipLog ne log pas dans combatLog', () => {
    const logBefore = store.combatLog.length
    store.markAdversaryHP('goblin_0', 1, { skipLog: true })
    expect(store.combatLog.length).toBe(logBefore)
    expect(store.liveAdversaries[0].markedHP).toBe(1)
  })

  it('markAdversaryHP sans options conserve le comportement existant', () => {
    const undoBefore = store.undoStack.length
    store.markAdversaryHP('goblin_0', 1)
    expect(store.undoStack.length).toBe(undoBefore + 1)
  })

  it('clearAdversaryHP avec skipUndo ne push pas', () => {
    store.liveAdversaries[0].markedHP = 3
    const undoBefore = store.undoStack.length
    store.clearAdversaryHP('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].markedHP).toBe(2)
  })

  it('markAdversaryStress avec skipUndo ne push pas', () => {
    const undoBefore = store.undoStack.length
    store.markAdversaryStress('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
  })

  it('clearAdversaryStress avec skipUndo ne push pas', () => {
    store.liveAdversaries[0].markedStress = 2
    const undoBefore = store.undoStack.length
    store.clearAdversaryStress('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
  })

  it('defeatAdversary avec skipUndo ne push pas', () => {
    const undoBefore = store.undoStack.length
    store.defeatAdversary('goblin_0', { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].isDefeated).toBe(true)
  })

  it('toggleAdversaryCondition avec skipUndo ne push pas', () => {
    const undoBefore = store.undoStack.length
    store.toggleAdversaryCondition('goblin_0', 'vulnerable', { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].conditions).toContain('vulnerable')
  })
})
