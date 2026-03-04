/**
 * @module characters/__tests__/mixedAncestry.test
 * @description Tests pour la fonctionnalité Mixed Ancestry :
 * sélection de 2 ascendances parentes, choix libre d'une feature par ascendance,
 * résolution dans selectedAncestryData, et calcul des bonus de stats.
 *
 * Modèle : ancestry1Feature / ancestry2Feature = 'top' | 'bottom'
 * Toutes les combinaisons top-top, top-bottom, bottom-top, bottom-bottom sont valides.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'
import { computeStatBonuses, ANCESTRY_MODIFIERS } from '@data/statModifiers'

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

/** Crée un store avec un personnage Mixed Ancestry prêt */
function setupMixedCharacter() {
  const store = useCharacterStore()
  store.createCharacter('warrior')
  store.applySelection('ancestryId', 'mixed-ancestry')
  return store
}

/** Crée un personnage brut pour computeStatBonuses */
function makeMixedChar(overrides = {}) {
  return {
    ancestryId: 'mixed-ancestry',
    subclassId: '',
    level: 1,
    proficiency: 1,
    traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
    domainCards: { loadout: [], vault: [] },
    activeEffects: {},
    permanentCardEffects: [],
    mixedAncestryConfig: {
      ancestry1Id: '', ancestry2Id: '',
      ancestry1Feature: '', ancestry2Feature: ''
    },
    ...overrides
  }
}

// ═══════════════════════════════════════════════════════════
//  ANCESTRY_MODIFIERS — featurePosition
// ═══════════════════════════════════════════════════════════

describe('ANCESTRY_MODIFIERS — featurePosition', () => {
  it('chaque modificateur d\'ascendance a un featurePosition top ou bottom', () => {
    for (const [key, mod] of Object.entries(ANCESTRY_MODIFIERS)) {
      expect(
        mod.featurePosition === 'top' || mod.featurePosition === 'bottom',
        `${key} devrait avoir featurePosition 'top' ou 'bottom', reçu : ${mod.featurePosition}`
      ).toBe(true)
    }
  })

  it('Giant a featurePosition top (Endurance)', () => {
    expect(ANCESTRY_MODIFIERS.giant.featurePosition).toBe('top')
  })

  it('Simiah a featurePosition bottom (Nimble)', () => {
    expect(ANCESTRY_MODIFIERS.simiah.featurePosition).toBe('bottom')
  })

  it('Galapa a featurePosition top (Shell)', () => {
    expect(ANCESTRY_MODIFIERS.galapa.featurePosition).toBe('top')
  })

  it('Human a featurePosition top (High Stamina)', () => {
    expect(ANCESTRY_MODIFIERS.human.featurePosition).toBe('top')
  })
})

// ═══════════════════════════════════════════════════════════
//  Schema — mixedAncestryConfig
// ═══════════════════════════════════════════════════════════

describe('schéma personnage — mixedAncestryConfig', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('contient mixedAncestryConfig par défaut avec champs vides', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    const char = store.selectedCharacter
    expect(char.mixedAncestryConfig).toBeDefined()
    expect(char.mixedAncestryConfig.ancestry1Id).toBe('')
    expect(char.mixedAncestryConfig.ancestry2Id).toBe('')
    expect(char.mixedAncestryConfig.ancestry1Feature).toBe('')
    expect(char.mixedAncestryConfig.ancestry2Feature).toBe('')
  })
})

// ═══════════════════════════════════════════════════════════
//  updateMixedAncestry — action du store
// ═══════════════════════════════════════════════════════════

describe('updateMixedAncestry', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('met à jour ancestry1Id', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry1Id).toBe('giant')
  })

  it('met à jour ancestry2Id', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry2Id).toBe('simiah')
  })

  it('met à jour ancestry1Feature', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry1Feature', 'top')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry1Feature).toBe('top')
  })

  it('met à jour ancestry2Feature', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry2Feature', 'bottom')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry2Feature).toBe('bottom')
  })

  it('réinitialise les features quand on change ancestry1Id', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry1Feature', 'top')
    store.updateMixedAncestry('ancestry2Feature', 'bottom')

    store.updateMixedAncestry('ancestry1Id', 'elf')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry1Feature).toBe('')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry2Feature).toBe('')
  })

  it('réinitialise les features quand on change ancestry2Id', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry1Feature', 'top')
    store.updateMixedAncestry('ancestry2Feature', 'bottom')

    store.updateMixedAncestry('ancestry2Id', 'elf')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry1Feature).toBe('')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry2Feature).toBe('')
  })

  it('ne fait rien si ascendance non mixed', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    store.applySelection('ancestryId', 'giant')
    store.updateMixedAncestry('ancestry1Id', 'elf')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry1Id).toBe('')
  })
})

// ═══════════════════════════════════════════════════════════
//  applySelection('ancestryId') — reset de la config Mixed
// ═══════════════════════════════════════════════════════════

describe('applySelection ancestryId — reset mixedAncestryConfig', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('réinitialise mixedAncestryConfig quand on quitte mixed-ancestry', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry1Feature', 'top')
    store.updateMixedAncestry('ancestry2Feature', 'bottom')

    store.applySelection('ancestryId', 'elf')
    const config = store.selectedCharacter.mixedAncestryConfig
    expect(config.ancestry1Id).toBe('')
    expect(config.ancestry2Id).toBe('')
    expect(config.ancestry1Feature).toBe('')
    expect(config.ancestry2Feature).toBe('')
  })

  it('ne réinitialise PAS quand on sélectionne mixed-ancestry', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')

    store.applySelection('ancestryId', 'mixed-ancestry')
    expect(store.selectedCharacter.mixedAncestryConfig.ancestry1Id).toBe('giant')
  })
})

// ═══════════════════════════════════════════════════════════
//  selectedAncestryData — résolution des features
// ═══════════════════════════════════════════════════════════

describe('selectedAncestryData — Mixed Ancestry résolution', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('retourne base mixed-ancestry sans config', () => {
    const store = setupMixedCharacter()
    const data = store.selectedAncestryData
    expect(data).toBeTruthy()
    expect(data.id).toBe('mixed-ancestry')
    expect(data.topFeature.name).toBe('Mixed Top Feature')
  })

  it('résout le nom composite avec les 2 ascendances', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')

    const data = store.selectedAncestryData
    expect(data.name).toBe('Mixed (Giant / Simiah)')
  })

  // ── Toutes les 4 combinaisons de features ──

  it('combo top-bottom : Giant(top=Endurance) + Simiah(bottom=Nimble)', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry1Feature', 'top')
    store.updateMixedAncestry('ancestry2Feature', 'bottom')

    const data = store.selectedAncestryData
    expect(data.topFeature.name).toBe('Endurance')
    expect(data.bottomFeature.name).toBe('Nimble')
    expect(data._resolved).toBe(true)
  })

  it('combo bottom-top : Giant(bottom=Reach) + Simiah(top=Natural Climber)', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry1Feature', 'bottom')
    store.updateMixedAncestry('ancestry2Feature', 'top')

    const data = store.selectedAncestryData
    expect(data.topFeature.name).toBe('Reach')
    expect(data.bottomFeature.name).toBe('Natural Climber')
  })

  it('combo top-top : Giant(top=Endurance) + Simiah(top=Natural Climber)', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry1Feature', 'top')
    store.updateMixedAncestry('ancestry2Feature', 'top')

    const data = store.selectedAncestryData
    expect(data.topFeature.name).toBe('Endurance')
    expect(data.bottomFeature.name).toBe('Natural Climber')
  })

  it('combo bottom-bottom : Giant(bottom=Reach) + Simiah(bottom=Nimble)', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('ancestry1Feature', 'bottom')
    store.updateMixedAncestry('ancestry2Feature', 'bottom')

    const data = store.selectedAncestryData
    expect(data.topFeature.name).toBe('Reach')
    expect(data.bottomFeature.name).toBe('Nimble')
  })
})

// ═══════════════════════════════════════════════════════════
//  computeStatBonuses — Mixed Ancestry (toutes combinaisons)
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — Mixed Ancestry', () => {
  it('top-bottom : Giant(top=+1HP) + Simiah(bottom=+1Eva)', () => {
    const char = makeMixedChar({
      mixedAncestryConfig: {
        ancestry1Id: 'giant', ancestry2Id: 'simiah',
        ancestry1Feature: 'top', ancestry2Feature: 'bottom'
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)
    expect(bonuses.evasion).toBe(1)
    expect(bonuses.sources).toContain('Endurance (Giant)')
    expect(bonuses.sources).toContain('Nimble (Simiah)')
  })

  it('bottom-top : pas de bonus stat (Giant bottom=Reach, Simiah top=Natural Climber)', () => {
    const char = makeMixedChar({
      mixedAncestryConfig: {
        ancestry1Id: 'giant', ancestry2Id: 'simiah',
        ancestry1Feature: 'bottom', ancestry2Feature: 'top'
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.evasion).toBe(0)
  })

  it('top-top : Giant(top=+1HP) + Human(top=+1Stress)', () => {
    const char = makeMixedChar({
      mixedAncestryConfig: {
        ancestry1Id: 'giant', ancestry2Id: 'human',
        ancestry1Feature: 'top', ancestry2Feature: 'top'
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)
    expect(bonuses.maxStress).toBe(1)
    expect(bonuses.sources).toContain('Endurance (Giant)')
    expect(bonuses.sources).toContain('High Stamina (Human)')
  })

  it('bottom-bottom : Giant(bottom) + Simiah(bottom=+1Eva)', () => {
    const char = makeMixedChar({
      mixedAncestryConfig: {
        ancestry1Id: 'giant', ancestry2Id: 'simiah',
        ancestry1Feature: 'bottom', ancestry2Feature: 'bottom'
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.evasion).toBe(1)
  })

  it('Galapa(top=Shell) + Simiah(bottom=Nimble)', () => {
    const char = makeMixedChar({
      proficiency: 3,
      mixedAncestryConfig: {
        ancestry1Id: 'galapa', ancestry2Id: 'simiah',
        ancestry1Feature: 'top', ancestry2Feature: 'bottom'
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(3)
    expect(bonuses.thresholds.severe).toBe(3)
    expect(bonuses.evasion).toBe(1)
  })

  it('n\'applique rien sans features sélectionnées', () => {
    const char = makeMixedChar({
      mixedAncestryConfig: {
        ancestry1Id: 'giant', ancestry2Id: 'simiah',
        ancestry1Feature: '', ancestry2Feature: ''
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.evasion).toBe(0)
  })

  it('n\'applique pas le bonus si la mauvaise position est choisie', () => {
    const char = makeMixedChar({
      mixedAncestryConfig: {
        ancestry1Id: 'giant', ancestry2Id: 'elf',
        ancestry1Feature: 'bottom', ancestry2Feature: 'top'
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(0)
  })

  it('ascendances sans modificateur ne causent pas d\'erreur', () => {
    const char = makeMixedChar({
      mixedAncestryConfig: {
        ancestry1Id: 'elf', ancestry2Id: 'dwarf',
        ancestry1Feature: 'top', ancestry2Feature: 'bottom'
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.evasion).toBe(0)
    expect(bonuses.maxStress).toBe(0)
  })
})
