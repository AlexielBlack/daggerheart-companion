// @vitest-environment happy-dom
/**
 * @module core/__tests__/moduleIndexes.test
 * @description Valide que chaque module exporte correctement
 * ses composants, stores et constantes via son index.js.
 *
 * Approche : un seul import dynamique par module (beforeAll),
 * toutes les vérifications groupées pour minimiser le coût d'import.
 */

import { describe, it, expect, beforeAll } from 'vitest'

const expectDefined = (mod, keys) =>
  keys.forEach((k) => expect(mod[k], `export "${k}" should be defined`).toBeDefined())

const expectFunctions = (mod, keys) =>
  keys.forEach((k) => expect(typeof mod[k], `export "${k}" should be a function`).toBe('function'))

describe('adversaries module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/adversaries') })
  it('exporte le store', () => expectFunctions(mod, ['useAdversaryStore']))
  it('exporte les composants', () => expectDefined(mod, ['AdversaryCard', 'AdversaryFilters', 'FeatureBlock', 'StatBlock']))
  it('exporte la vue', () => expectDefined(mod, ['AdversaryBrowser']))
})

describe('characters module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/characters') })
  it('exporte le store', () => expectFunctions(mod, ['useCharacterStore']))
  it('exporte les composants', () => expectDefined(mod, ['CharacterList', 'CharacterSelectors', 'CharacterSheet', 'ClassPicker', 'DomainCardPicker', 'SlotTracker', 'TraitBlock']))
  it('exporte les vues', () => expectDefined(mod, ['CharacterBuilder', 'ClassBrowser', 'AncestryBrowser']))
})

describe('communities module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/communities') })
  it('exporte le store', () => expectFunctions(mod, ['useCommunityStore']))
  it('exporte les composants', () => expectDefined(mod, ['CommunityCard']))
  it('exporte la vue', () => expectDefined(mod, ['CommunityBrowser']))
})

describe('dice module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/dice') })
  it('exporte le store', () => expectFunctions(mod, ['useDiceStore']))
  it('exporte les constantes', () => {
    expectDefined(mod, ['DUALITY_OUTCOMES', 'QUICK_DICE', 'ROLL_PRESETS'])
    expectFunctions(mod, ['resolveDualityOutcome', 'calculateCriticalDamage'])
    expect(typeof mod.MAX_HISTORY).toBe('number')
  })
  it('exporte les composants', () => expectDefined(mod, ['DamagePanel', 'DiceHistory', 'DualityPanel', 'QuickDice']))
  it('exporte la vue', () => expectDefined(mod, ['DiceRoller']))
})

describe('domains module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/domains') })
  it('exporte le store', () => expectFunctions(mod, ['useDomainStore']))
  it('exporte les composants', () => expectDefined(mod, ['DomainCardItem']))
  it('exporte la vue', () => expectDefined(mod, ['DomainBrowser']))
})

describe('encounter module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/encounter') })
  it('exporte le store', () => expectFunctions(mod, ['useEncounterStore']))
  it('exporte les composants', () => expectDefined(mod, ['AdversaryPicker', 'BattlePointsBar', 'EncounterConfig', 'EncounterSlotList', 'EncounterSummary', 'EnvironmentPicker', 'SavedEncounterList']))
  it('exporte la vue', () => expectDefined(mod, ['EncounterBuilder']))
})

describe('environments module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/environments') })
  it('exporte le store', () => expectFunctions(mod, ['useEnvironmentStore']))
  it('exporte les composants', () => expectDefined(mod, ['EnvironmentCard', 'EnvironmentFeatureBlock', 'EnvironmentFilters', 'EnvironmentStatBlock']))
  it('exporte la vue', () => expectDefined(mod, ['EnvironmentBrowser']))
})

describe('equipment module index', () => {
  let mod
  beforeAll(async () => { mod = await import('@modules/equipment') })
  it('exporte le store', () => expectFunctions(mod, ['useEquipmentStore']))
  it('exporte la vue', () => expectDefined(mod, ['EquipmentBrowser']))
})
