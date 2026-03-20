// Tests du composable useActionBar — logique bandeau de ciblage

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActionBar, _resetActionBar } from '../useActionBar'
import { ACTION_EFFECTS } from '@data/encounters/actionEffects'

// Mock encounterLiveStore — valeurs directes (pas de ref),
// car le composable accède aux propriétés comme un store Pinia (auto-unwrap)
vi.mock('../../stores/encounterLiveStore', () => ({
  useEncounterLiveStore: () => ({
    activePcId: 'kael',
    activeAdversaryId: null,
    spotlight: 'pc',
    liveAdversaries: [
      { instanceId: 'goblin_0', name: 'Gobelin A', isDefeated: false },
      { instanceId: 'goblin_1', name: 'Gobelin B', isDefeated: false },
      { instanceId: 'troll_0', name: 'Troll', isDefeated: true }
    ],
    participantPcs: [
      { id: 'kael', name: 'Kael' },
      { id: 'lyra', name: 'Lyra' }
    ],
    pcDownStatus: {},
    combatLog: [],
    markAdversaryHP: vi.fn(),
    clearAdversaryHP: vi.fn(),
    markAdversaryStress: vi.fn(),
    clearAdversaryStress: vi.fn(),
    defeatAdversary: vi.fn(),
    reviveAdversary: vi.fn(),
    pushUndo: vi.fn(),
    toggleAdversaryCondition: vi.fn(),
    togglePcCondition: vi.fn(),
    logActionEntry: vi.fn()
  })
}))

describe('useActionBar', () => {
  let bar

  beforeEach(() => {
    setActivePinia(createPinia())
    _resetActionBar()
    bar = useActionBar()
  })

  it('est fermé par défaut', () => {
    expect(bar.isOpen.value).toBe(false)
    expect(bar.pendingAction.value).toBeNull()
  })

  it('openAction initialise avec l acteur spotlight', () => {
    bar.openAction()
    expect(bar.isOpen.value).toBe(true)
    expect(bar.pendingAction.value.actorId).toBe('kael')
    expect(bar.pendingAction.value.actorType).toBe('pc')
  })

  it('setEffect change l effet', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    expect(bar.pendingAction.value.effect).toBe('damage_hp')
  })

  it('toggleTarget ajoute et retire une cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.pendingAction.value.targets).toHaveLength(1)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.pendingAction.value.targets).toHaveLength(0)
  })

  it('selectAllAdversaries sélectionne tous les non-vaincus', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.selectAllAdversaries()
    expect(bar.pendingAction.value.targets).toHaveLength(2)
    expect(bar.pendingAction.value.targets.map(t => t.id)).toEqual(['goblin_0', 'goblin_1'])
  })

  it('setDefaultAmount change le montant de toutes les cibles', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.toggleTarget('goblin_1', 'adversary')
    bar.setDefaultAmount(5)
    expect(bar.pendingAction.value.targets[0].amount).toBe(5)
    expect(bar.pendingAction.value.targets[1].amount).toBe(5)
  })

  it('setTargetAmount override le montant d une seule cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.toggleTarget('goblin_1', 'adversary')
    bar.setDefaultAmount(3)
    bar.setTargetAmount('goblin_1', 1)
    expect(bar.pendingAction.value.targets[0].amount).toBe(3)
    expect(bar.pendingAction.value.targets[1].amount).toBe(1)
  })

  it('cancelAction remet tout à null', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.cancelAction()
    expect(bar.isOpen.value).toBe(false)
    expect(bar.pendingAction.value).toBeNull()
  })

  it('canApply est false sans cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    expect(bar.canApply.value).toBe(false)
  })

  it('canApply est true avec au moins une cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.canApply.value).toBe(true)
  })

  it('canApply est true pour miss sans cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.MISS)
    expect(bar.canApply.value).toBe(true)
  })

  it('isTargetSelected retourne true si la cible est sélectionnée', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.isTargetSelected('goblin_0')).toBe(true)
    expect(bar.isTargetSelected('goblin_1')).toBe(false)
  })
})
