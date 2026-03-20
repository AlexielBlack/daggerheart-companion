// Tests du composable useActionBar — logique bandeau de ciblage

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActionBar, _resetActionBar } from '../useActionBar'
import { useEncounterLiveStore } from '../../stores/encounterLiveStore'
import { ACTION_EFFECTS } from '@data/encounters/actionEffects'

// Mock characterStore — données PJ pour les tests d'actions sur personnages
const mockCharacters = [
  { id: 'kael', name: 'Kael', currentHP: 2, maxHP: 15, currentStress: 1, maxStress: 6, hope: 2 },
  { id: 'lyra', name: 'Lyra', currentHP: 5, maxHP: 12, currentStress: 3, maxStress: 4, hope: 0 }
]

const mockCharStore = {
  patchCharacterById: vi.fn(),
  characters: mockCharacters
}

vi.mock('@modules/characters/stores/characterStore', () => ({
  useCharacterStore: () => mockCharStore
}))

// Mock encounterLiveStore — singleton partagé entre composable et tests
// Valeurs directes (pas de ref), car le composable accède aux propriétés comme un store Pinia (auto-unwrap)
const mockStore = {
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
  togglePcSpotlight: vi.fn(),
  logActionEntry: vi.fn()
}

vi.mock('../../stores/encounterLiveStore', () => ({
  useEncounterLiveStore: () => mockStore
}))

describe('useActionBar', () => {
  let bar

  beforeEach(() => {
    setActivePinia(createPinia())
    _resetActionBar()
    vi.clearAllMocks()
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

describe('applyAction dispatch', () => {
  let bar

  beforeEach(() => {
    setActivePinia(createPinia())
    _resetActionBar()
    vi.clearAllMocks()
    bar = useActionBar()
  })

  it('damage_hp sur adversaire appelle markAdversaryHP avec skipUndo', () => {
    const store = useEncounterLiveStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.setDefaultAmount(3)
    bar.applyAction()

    expect(store.pushUndo).toHaveBeenCalledTimes(1)
    expect(store.markAdversaryHP).toHaveBeenCalledWith('goblin_0', 3, { skipUndo: true, skipLog: true })
    expect(store.logActionEntry).toHaveBeenCalled()
    expect(bar.isOpen.value).toBe(false)
  })

  it('damage_hp AoE multi-cibles appelle markAdversaryHP pour chaque cible', () => {
    const store = useEncounterLiveStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.toggleTarget('goblin_1', 'adversary')
    bar.setDefaultAmount(2)
    bar.applyAction()

    expect(store.pushUndo).toHaveBeenCalledTimes(1)
    expect(store.markAdversaryHP).toHaveBeenCalledTimes(2)
    expect(store.logActionEntry).toHaveBeenCalledTimes(2)
  })

  it('miss log directement et ferme le bandeau sans pushUndo', () => {
    const store = useEncounterLiveStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.MISS)
    bar.applyAction()

    expect(store.pushUndo).not.toHaveBeenCalled()
    expect(store.logActionEntry).toHaveBeenCalledWith(expect.objectContaining({ action: 'miss' }))
    expect(bar.isOpen.value).toBe(false)
  })

  it('condition sur adversaire appelle toggleAdversaryCondition avec skipUndo', () => {
    const store = useEncounterLiveStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.CONDITION)
    bar.setCondition('vulnerable')
    bar.toggleTarget('goblin_0', 'adversary')
    bar.applyAction()

    expect(store.toggleAdversaryCondition).toHaveBeenCalledWith('goblin_0', 'vulnerable', { skipUndo: true })
    expect(store.logActionEntry).toHaveBeenCalled()
  })

  it('down sur adversaire non-vaincu appelle defeatAdversary', () => {
    const store = useEncounterLiveStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DOWN)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.applyAction()

    expect(store.defeatAdversary).toHaveBeenCalledWith('goblin_0', { skipUndo: true, skipLog: true })
  })
})

describe('applyAction effets PJ', () => {
  let bar

  beforeEach(() => {
    setActivePinia(createPinia())
    _resetActionBar()
    vi.clearAllMocks()
    // Réinitialiser les valeurs des personnages mock
    mockCharacters[0].currentHP = 2
    mockCharacters[0].currentStress = 1
    mockCharacters[0].hope = 2
    mockCharacters[1].currentHP = 5
    mockCharacters[1].currentStress = 3
    mockCharacters[1].hope = 0
    bar = useActionBar()
  })

  it('damage_hp sur PJ augmente currentHP (dégâts marqués)', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('lyra', 'pc')
    bar.setDefaultAmount(2)
    bar.applyAction()

    // currentHP=5, damage +2 → 7 (plafonné à maxHP=12)
    expect(mockCharStore.patchCharacterById).toHaveBeenCalledWith('lyra', { currentHP: 7 })
  })

  it('heal_hp sur PJ diminue currentHP (retire des dégâts marqués)', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.HEAL_HP)
    bar.toggleTarget('kael', 'pc')
    bar.setDefaultAmount(1)
    bar.applyAction()

    // currentHP=2, heal -1 → 1 (plancher à 0)
    expect(mockCharStore.patchCharacterById).toHaveBeenCalledWith('kael', { currentHP: 1 })
  })

  it('damage_stress sur PJ augmente currentStress', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_STRESS)
    bar.toggleTarget('kael', 'pc')
    bar.setDefaultAmount(2)
    bar.applyAction()

    // currentStress=1, damage +2 → 3 (plafonné à maxStress=6)
    expect(mockCharStore.patchCharacterById).toHaveBeenCalledWith('kael', { currentStress: 3 })
  })

  it('heal_stress sur PJ diminue currentStress', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.HEAL_STRESS)
    bar.toggleTarget('lyra', 'pc')
    bar.setDefaultAmount(2)
    bar.applyAction()

    // currentStress=3, heal -2 → 1 (plancher à 0)
    expect(mockCharStore.patchCharacterById).toHaveBeenCalledWith('lyra', { currentStress: 1 })
  })

  it('hope sur PJ ajoute au hope existant', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.HOPE)
    bar.toggleTarget('kael', 'pc')
    bar.setDefaultAmount(1)
    bar.applyAction()

    expect(mockCharStore.patchCharacterById).toHaveBeenCalledWith('kael', { hope: 3 })
  })

  it('down sur PJ toggle pcDownStatus', () => {
    const store = useEncounterLiveStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DOWN)
    bar.toggleTarget('kael', 'pc')
    bar.applyAction()

    expect(store.pcDownStatus['kael']).toBe(true)
  })
})
