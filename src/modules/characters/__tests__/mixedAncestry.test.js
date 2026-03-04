/**
 * @module characters/__tests__/mixedAncestry.test
 * @description Tests pour la fonctionnalité Mixed Ancestry :
 * sélection de 2 ascendances parentes, choix croisé des features,
 * résolution dans selectedAncestryData, et calcul des bonus de stats.
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
    expect(char.mixedAncestryConfig.topFeatureSource).toBe('')
    expect(char.mixedAncestryConfig.bottomFeatureSource).toBe('')
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

  it('réinitialise les features quand on change ancestry1Id', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('topFeatureSource', 'giant')
    store.updateMixedAncestry('bottomFeatureSource', 'simiah')

    // Changer ancestry1 doit réinitialiser les features
    store.updateMixedAncestry('ancestry1Id', 'elf')
    expect(store.selectedCharacter.mixedAncestryConfig.topFeatureSource).toBe('')
    expect(store.selectedCharacter.mixedAncestryConfig.bottomFeatureSource).toBe('')
  })

  it('réinitialise les features quand on change ancestry2Id', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('topFeatureSource', 'giant')
    store.updateMixedAncestry('bottomFeatureSource', 'simiah')

    store.updateMixedAncestry('ancestry2Id', 'elf')
    expect(store.selectedCharacter.mixedAncestryConfig.topFeatureSource).toBe('')
    expect(store.selectedCharacter.mixedAncestryConfig.bottomFeatureSource).toBe('')
  })

  it('contrainte SRD : top et bottom ne peuvent pas venir de la même ascendance', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')

    // Top = giant
    store.updateMixedAncestry('topFeatureSource', 'giant')
    // Bottom = giant → doit effacer top
    store.updateMixedAncestry('bottomFeatureSource', 'giant')
    expect(store.selectedCharacter.mixedAncestryConfig.topFeatureSource).toBe('')
    expect(store.selectedCharacter.mixedAncestryConfig.bottomFeatureSource).toBe('giant')
  })

  it('ne fait rien si ascendance non mixed', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    store.applySelection('ancestryId', 'giant')
    store.updateMixedAncestry('ancestry1Id', 'elf')
    // Pas de crash, pas de modification
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
    store.updateMixedAncestry('topFeatureSource', 'giant')
    store.updateMixedAncestry('bottomFeatureSource', 'simiah')

    // Changer pour une ascendance non-mixed
    store.applySelection('ancestryId', 'elf')
    const config = store.selectedCharacter.mixedAncestryConfig
    expect(config.ancestry1Id).toBe('')
    expect(config.ancestry2Id).toBe('')
    expect(config.topFeatureSource).toBe('')
    expect(config.bottomFeatureSource).toBe('')
  })

  it('ne réinitialise PAS quand on sélectionne mixed-ancestry', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')

    // Re-sélectionner mixed-ancestry ne doit pas effacer
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

  it('résout la top feature de l\'ascendance sélectionnée', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('topFeatureSource', 'giant')

    const data = store.selectedAncestryData
    expect(data.topFeature.name).toBe('Endurance')
  })

  it('résout la bottom feature de l\'ascendance sélectionnée', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('bottomFeatureSource', 'simiah')

    const data = store.selectedAncestryData
    expect(data.bottomFeature.name).toBe('Nimble')
  })

  it('résout les deux features correctement (Giant top, Simiah bottom)', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('topFeatureSource', 'giant')
    store.updateMixedAncestry('bottomFeatureSource', 'simiah')

    const data = store.selectedAncestryData
    expect(data.topFeature.name).toBe('Endurance') // Giant top
    expect(data.bottomFeature.name).toBe('Nimble')  // Simiah bottom
    expect(data._resolved).toBe(true)
  })

  it('résout l\'inverse (Simiah top, Giant bottom)', () => {
    const store = setupMixedCharacter()
    store.updateMixedAncestry('ancestry1Id', 'giant')
    store.updateMixedAncestry('ancestry2Id', 'simiah')
    store.updateMixedAncestry('topFeatureSource', 'simiah')
    store.updateMixedAncestry('bottomFeatureSource', 'giant')

    const data = store.selectedAncestryData
    expect(data.topFeature.name).toBe('Natural Climber') // Simiah top
    expect(data.bottomFeature.name).toBe('Reach')        // Giant bottom
  })
})

// ═══════════════════════════════════════════════════════════
//  computeStatBonuses — Mixed Ancestry
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — Mixed Ancestry', () => {
  it('applique le bonus Giant (top) quand topFeatureSource = giant', () => {
    const char = {
      ancestryId: 'mixed-ancestry',
      subclassId: '',
      level: 1,
      proficiency: 1,
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: [], vault: [] },
      activeEffects: {},
      permanentCardEffects: [],
      mixedAncestryConfig: {
        ancestry1Id: 'giant',
        ancestry2Id: 'simiah',
        topFeatureSource: 'giant',
        bottomFeatureSource: 'simiah'
      }
    }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)        // Giant Endurance (top)
    expect(bonuses.evasion).toBe(1)      // Simiah Nimble (bottom)
    expect(bonuses.sources).toContain('Endurance (Giant)')
    expect(bonuses.sources).toContain('Nimble (Simiah)')
  })

  it('n\'applique PAS le bonus Giant quand bottomFeatureSource = giant (wrong position)', () => {
    const char = {
      ancestryId: 'mixed-ancestry',
      subclassId: '',
      level: 1,
      proficiency: 1,
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: [], vault: [] },
      activeEffects: {},
      permanentCardEffects: [],
      mixedAncestryConfig: {
        ancestry1Id: 'giant',
        ancestry2Id: 'simiah',
        topFeatureSource: 'simiah',
        bottomFeatureSource: 'giant'
      }
    }
    const bonuses = computeStatBonuses(char)
    // Giant Endurance est un top feature → pas appliqué si bottomFeatureSource = giant
    expect(bonuses.maxHP).toBe(0)
    // Simiah Nimble est un bottom feature → pas appliqué si topFeatureSource = simiah
    expect(bonuses.evasion).toBe(0)
  })

  it('applique Galapa Shell (top) + Simiah Nimble (bottom)', () => {
    const char = {
      ancestryId: 'mixed-ancestry',
      subclassId: '',
      level: 1,
      proficiency: 3,
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: [], vault: [] },
      activeEffects: {},
      permanentCardEffects: [],
      mixedAncestryConfig: {
        ancestry1Id: 'galapa',
        ancestry2Id: 'simiah',
        topFeatureSource: 'galapa',
        bottomFeatureSource: 'simiah'
      }
    }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(3)  // Galapa Shell = proficiency
    expect(bonuses.thresholds.severe).toBe(3)
    expect(bonuses.evasion).toBe(1)            // Simiah Nimble
  })

  it('n\'applique rien sans features sélectionnées', () => {
    const char = {
      ancestryId: 'mixed-ancestry',
      subclassId: '',
      level: 1,
      proficiency: 1,
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: [], vault: [] },
      activeEffects: {},
      permanentCardEffects: [],
      mixedAncestryConfig: {
        ancestry1Id: 'giant',
        ancestry2Id: 'simiah',
        topFeatureSource: '',
        bottomFeatureSource: ''
      }
    }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.evasion).toBe(0)
  })

  it('gère Human (top: +1 stress) + Giant (top: +1 HP) — seul le bon feature s\'applique', () => {
    const char = {
      ancestryId: 'mixed-ancestry',
      subclassId: '',
      level: 1,
      proficiency: 1,
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: [], vault: [] },
      activeEffects: {},
      permanentCardEffects: [],
      mixedAncestryConfig: {
        ancestry1Id: 'human',
        ancestry2Id: 'giant',
        topFeatureSource: 'human',   // High Stamina (top) → +1 stress
        bottomFeatureSource: 'giant' // Giant bottom = Reach (pas de stat bonus)
      }
    }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxStress).toBe(1)  // Human High Stamina
    expect(bonuses.maxHP).toBe(0)      // Giant Endurance NOT applied (it's a top, but bottom is selected)
  })

  it('ascendance sans modificateur de stats ne cause pas d\'erreur', () => {
    const char = {
      ancestryId: 'mixed-ancestry',
      subclassId: '',
      level: 1,
      proficiency: 1,
      traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: [], vault: [] },
      activeEffects: {},
      permanentCardEffects: [],
      mixedAncestryConfig: {
        ancestry1Id: 'elf',
        ancestry2Id: 'dwarf',
        topFeatureSource: 'elf',
        bottomFeatureSource: 'dwarf'
      }
    }
    const bonuses = computeStatBonuses(char)
    // Ni Elf ni Dwarf n'ont de modificateur permanent de stats
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.evasion).toBe(0)
    expect(bonuses.maxStress).toBe(0)
  })
})
