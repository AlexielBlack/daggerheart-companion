/**
 * @module core/__tests__/moduleIndexes.test
 * @description Valide que chaque module exporte correctement
 * ses composants, stores et constantes via son index.js.
 *
 * Approche : on verifie la forme (typeof) de chaque export
 * sans instancier les stores (evite les dependances circulaires).
 */

import { describe, it, expect } from 'vitest'

// ══════════════════════════════════════════════════════
//  adversaries
// ══════════════════════════════════════════════════════

describe('adversaries module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/adversaries')
    expect(typeof mod.useAdversaryStore).toBe('function')
  })

  it('exporte les composants', async () => {
    const mod = await import('@modules/adversaries')
    expect(mod.AdversaryCard).toBeDefined()
    expect(mod.AdversaryFilters).toBeDefined()
    expect(mod.FeatureBlock).toBeDefined()
    expect(mod.StatBlock).toBeDefined()
  })

  it('exporte la vue', async () => {
    const mod = await import('@modules/adversaries')
    expect(mod.AdversaryBrowser).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════
//  characters
// ══════════════════════════════════════════════════════

describe('characters module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/characters')
    expect(typeof mod.useCharacterStore).toBe('function')
  })

  it('exporte les composants', async () => {
    const mod = await import('@modules/characters')
    expect(mod.CharacterList).toBeDefined()
    expect(mod.CharacterSelectors).toBeDefined()
    expect(mod.CharacterSheet).toBeDefined()
    expect(mod.ClassPicker).toBeDefined()
    expect(mod.DomainCardPicker).toBeDefined()
    expect(mod.SlotTracker).toBeDefined()
    expect(mod.TraitBlock).toBeDefined()
  })

  it('exporte les vues', async () => {
    const mod = await import('@modules/characters')
    expect(mod.CharacterBuilder).toBeDefined()
    expect(mod.ClassBrowser).toBeDefined()
    expect(mod.AncestryBrowser).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════
//  communities
// ══════════════════════════════════════════════════════

describe('communities module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/communities')
    expect(typeof mod.useCommunityStore).toBe('function')
  })

  it('exporte les composants', async () => {
    const mod = await import('@modules/communities')
    expect(mod.CommunityCard).toBeDefined()
  })

  it('exporte la vue', async () => {
    const mod = await import('@modules/communities')
    expect(mod.CommunityBrowser).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════
//  dice
// ══════════════════════════════════════════════════════

describe('dice module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/dice')
    expect(typeof mod.useDiceStore).toBe('function')
  })

  it('exporte les constantes', async () => {
    const mod = await import('@modules/dice')
    expect(mod.DUALITY_OUTCOMES).toBeDefined()
    expect(typeof mod.resolveDualityOutcome).toBe('function')
    expect(typeof mod.calculateCriticalDamage).toBe('function')
    expect(mod.QUICK_DICE).toBeDefined()
    expect(mod.ROLL_PRESETS).toBeDefined()
    expect(typeof mod.MAX_HISTORY).toBe('number')
  })

  it('exporte les composants', async () => {
    const mod = await import('@modules/dice')
    expect(mod.DamagePanel).toBeDefined()
    expect(mod.DiceHistory).toBeDefined()
    expect(mod.DualityPanel).toBeDefined()
    expect(mod.QuickDice).toBeDefined()
  })

  it('exporte la vue', async () => {
    const mod = await import('@modules/dice')
    expect(mod.DiceRoller).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════
//  domains
// ══════════════════════════════════════════════════════

describe('domains module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/domains')
    expect(typeof mod.useDomainStore).toBe('function')
  })

  it('exporte les composants', async () => {
    const mod = await import('@modules/domains')
    expect(mod.DomainCardItem).toBeDefined()
  })

  it('exporte la vue', async () => {
    const mod = await import('@modules/domains')
    expect(mod.DomainBrowser).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════
//  encounter
// ══════════════════════════════════════════════════════

describe('encounter module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/encounter')
    expect(typeof mod.useEncounterStore).toBe('function')
  })

  it('exporte les composants', async () => {
    const mod = await import('@modules/encounter')
    expect(mod.AdversaryPicker).toBeDefined()
    expect(mod.BattlePointsBar).toBeDefined()
    expect(mod.EncounterConfig).toBeDefined()
    expect(mod.EncounterSlotList).toBeDefined()
    expect(mod.EncounterSummary).toBeDefined()
    expect(mod.EnvironmentPicker).toBeDefined()
    expect(mod.SavedEncounterList).toBeDefined()
  })

  it('exporte la vue', async () => {
    const mod = await import('@modules/encounter')
    expect(mod.EncounterBuilder).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════
//  environments
// ══════════════════════════════════════════════════════

describe('environments module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/environments')
    expect(typeof mod.useEnvironmentStore).toBe('function')
  })

  it('exporte les composants', async () => {
    const mod = await import('@modules/environments')
    expect(mod.EnvironmentCard).toBeDefined()
    expect(mod.EnvironmentFeatureBlock).toBeDefined()
    expect(mod.EnvironmentFilters).toBeDefined()
    expect(mod.EnvironmentStatBlock).toBeDefined()
  })

  it('exporte la vue', async () => {
    const mod = await import('@modules/environments')
    expect(mod.EnvironmentBrowser).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════
//  equipment
// ══════════════════════════════════════════════════════

describe('equipment module index', () => {
  it('exporte le store', async () => {
    const mod = await import('@modules/equipment')
    expect(typeof mod.useEquipmentStore).toBe('function')
  })

  it('exporte la vue', async () => {
    const mod = await import('@modules/equipment')
    expect(mod.EquipmentBrowser).toBeDefined()
  })
})
