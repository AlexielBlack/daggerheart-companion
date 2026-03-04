/**
 * @module characters/__tests__/statModifiers.test
 * @description Tests pour le système de modificateurs de stats (ascendance + sous-classe).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'
import {
  computeStatBonuses,
  hasStatBonuses,
  ANCESTRY_MODIFIERS,
  SUBCLASS_MODIFIERS
} from '@data/statModifiers'

// ═══════════════════════════════════════════════════════════
//  Tests du module utilitaire computeStatBonuses
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — module utilitaire', () => {
  it('retourne des bonus vides pour un personnage null', () => {
    const bonuses = computeStatBonuses(null)
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.maxStress).toBe(0)
    expect(bonuses.evasion).toBe(0)
    expect(bonuses.thresholds.major).toBe(0)
    expect(bonuses.thresholds.severe).toBe(0)
    expect(bonuses.sources).toHaveLength(0)
  })

  it('retourne des bonus vides pour un personnage sans ancestryId ni subclassId', () => {
    const char = { ancestryId: '', subclassId: '', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(0)
    expect(bonuses.evasion).toBe(0)
  })

  // ── Ascendances ──────────────────────────────────────

  it('Giant : +1 maxHP', () => {
    const char = { ancestryId: 'giant', subclassId: '', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)
    expect(bonuses.sources).toContain('Endurance (Giant)')
  })

  it('Simiah : +1 évasion', () => {
    const char = { ancestryId: 'simiah', subclassId: '', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(1)
    expect(bonuses.sources).toContain('Nimble (Simiah)')
  })

  it('Galapa : bonus aux seuils = proficiency', () => {
    const char = { ancestryId: 'galapa', subclassId: '', level: 1, proficiency: 2 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(2)
    expect(bonuses.thresholds.severe).toBe(2)
    expect(bonuses.sources).toContain('Shell (Galapa)')
  })

  it('Galapa : le bonus augmente avec la proficiency', () => {
    const char = { ancestryId: 'galapa', subclassId: '', level: 5, proficiency: 4 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(4)
    expect(bonuses.thresholds.severe).toBe(4)
  })

  it('Skjalma : +1 maxHP', () => {
    const char = { ancestryId: 'skjalma', subclassId: '', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)
    expect(bonuses.sources).toContain('Endurance (Skjalma)')
  })

  it('Plassédien·ne : +1 maxStress', () => {
    const char = { ancestryId: 'plassedien', subclassId: '', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxStress).toBe(1)
    expect(bonuses.sources).toContain('Endurance Élevée (Plassédien·ne)')
  })

  // ── Sous-classes ─────────────────────────────────────

  it('Stalwart foundation : +1 aux seuils', () => {
    const char = { ancestryId: '', subclassId: 'stalwart', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(1)
    expect(bonuses.thresholds.severe).toBe(1)
  })

  it('Stalwart specialization (niv 5) : +1 +2 = +3 aux seuils', () => {
    const char = { ancestryId: '', subclassId: 'stalwart', level: 5, proficiency: 2 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(3)
    expect(bonuses.thresholds.severe).toBe(3)
  })

  it('Stalwart mastery (niv 8) : +1 +2 +3 = +6 aux seuils', () => {
    const char = { ancestryId: '', subclassId: 'stalwart', level: 8, proficiency: 3 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(6)
    expect(bonuses.thresholds.severe).toBe(6)
  })

  it('Stalwart niv 4 : specialization non active', () => {
    const char = { ancestryId: '', subclassId: 'stalwart', level: 4, proficiency: 2 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(1)
  })

  it('Vengeance foundation : +1 maxStress', () => {
    const char = { ancestryId: '', subclassId: 'vengeance', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxStress).toBe(1)
    expect(bonuses.sources).toContain('At Ease (Vengeance)')
  })

  it('School of War foundation : +1 maxHP', () => {
    const char = { ancestryId: '', subclassId: 'school_of_war', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)
    expect(bonuses.sources).toContain('Battlemage (School of War)')
  })

  it('Nightwalker mastery (niv 8) : +1 évasion', () => {
    const char = { ancestryId: '', subclassId: 'nightwalker', level: 8, proficiency: 3 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(1)
  })

  it('Nightwalker niv 7 : mastery non active', () => {
    const char = { ancestryId: '', subclassId: 'nightwalker', level: 7, proficiency: 3 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(0)
  })

  it('Winged Sentinel mastery (niv 8) : +4 seuil Sévère seulement', () => {
    const char = { ancestryId: '', subclassId: 'winged_sentinel', level: 8, proficiency: 3 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(0)
    expect(bonuses.thresholds.severe).toBe(4)
  })

  // ── Cumul ascendance + sous-classe ───────────────────

  it('Giant + Stalwart : cumule +1 maxHP et +1 seuils', () => {
    const char = { ancestryId: 'giant', subclassId: 'stalwart', level: 1, proficiency: 1 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)
    expect(bonuses.thresholds.major).toBe(1)
    expect(bonuses.thresholds.severe).toBe(1)
    expect(bonuses.sources).toHaveLength(2)
  })

  it('Galapa + Stalwart niv 8 : cumule proficiency + 6 aux seuils', () => {
    const char = { ancestryId: 'galapa', subclassId: 'stalwart', level: 8, proficiency: 4 }
    const bonuses = computeStatBonuses(char)
    // Galapa: +4 (proficiency) + Stalwart: +1 +2 +3 = +6
    expect(bonuses.thresholds.major).toBe(10)
    expect(bonuses.thresholds.severe).toBe(10)
  })

  it('Simiah + Nightwalker niv 8 : cumule +1 +1 = +2 évasion', () => {
    const char = { ancestryId: 'simiah', subclassId: 'nightwalker', level: 8, proficiency: 3 }
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(2)
  })

  // ── hasStatBonuses ───────────────────────────────────

  it('hasStatBonuses : faux sans modificateurs', () => {
    const char = { ancestryId: 'elf', subclassId: 'call_of_the_brave', level: 1, proficiency: 1 }
    expect(hasStatBonuses(char)).toBe(false)
  })

  it('hasStatBonuses : vrai pour Giant', () => {
    const char = { ancestryId: 'giant', subclassId: '', level: 1, proficiency: 1 }
    expect(hasStatBonuses(char)).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════
//  Tests d'intégration avec le store Pinia
// ═══════════════════════════════════════════════════════════

describe('statModifiers — intégration store', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useCharacterStore()
  })

  it('sélectionner Giant augmente effectiveMaxHP de 1', () => {
    store.createCharacter('warrior') // Warrior baseHP = 6
    store.applySelection('ancestryId', 'giant')
    expect(store.selectedEffectiveMaxHP).toBe(7) // 6 + 1
    // maxHP du personnage est aussi mis à jour directement
    expect(store.selectedCharacter.maxHP).toBe(7)
  })

  it('sélectionner Skjalma augmente effectiveMaxHP de 1', () => {
    store.createCharacter('guardian') // Guardian baseHP = 7
    store.applySelection('ancestryId', 'skjalma')
    expect(store.selectedEffectiveMaxHP).toBe(8) // 7 + 1
  })

  it('sélectionner Simiah augmente effectiveEvasion de 1', () => {
    store.createCharacter('warrior') // Warrior baseEvasion = 11
    store.applySelection('ancestryId', 'simiah')
    expect(store.selectedEffectiveEvasion).toBe(12) // 11 + 1
  })

  it('sélectionner Plassédien·ne augmente effectiveMaxStress de 1', () => {
    store.createCharacter('warrior') // Warrior baseStress = 6
    store.applySelection('ancestryId', 'plassedien')
    expect(store.selectedEffectiveMaxStress).toBe(7) // 6 + 1
    expect(store.selectedCharacter.maxStress).toBe(7)
  })

  it('sélectionner Galapa augmente les seuils selon proficiency', () => {
    store.createCharacter('warrior')
    store.applySelection('armorId', 'leather-t1') // thresholds 6/13
    store.applySelection('ancestryId', 'galapa')
    // Thresholds = armor base + level (1) + proficiency (1)
    expect(store.selectedThresholds.major).toBe(6 + 1 + 1)
    expect(store.selectedThresholds.severe).toBe(13 + 1 + 1)
  })

  it('sélectionner Stalwart augmente les seuils de +1 (foundation)', () => {
    store.createCharacter('guardian')
    store.applySelection('armorId', 'chainmail-t1') // thresholds 7/15
    store.applySelection('subclassId', 'stalwart')
    // Thresholds = armor base + level (1) + stalwart foundation (+1)
    expect(store.selectedThresholds.major).toBe(7 + 1 + 1)
    expect(store.selectedThresholds.severe).toBe(15 + 1 + 1)
  })

  it('Vengeance augmente maxStress de +1', () => {
    store.createCharacter('guardian') // Guardian baseStress = 6
    store.applySelection('subclassId', 'vengeance')
    expect(store.selectedEffectiveMaxStress).toBe(7)
    expect(store.selectedCharacter.maxStress).toBe(7)
  })

  it('School of War augmente maxHP de +1', () => {
    store.createCharacter('wizard') // Wizard baseHP = 5
    store.applySelection('subclassId', 'school_of_war')
    expect(store.selectedEffectiveMaxHP).toBe(6)
    expect(store.selectedCharacter.maxHP).toBe(6)
  })

  it('changer le niveau recalcule les bonus de sous-classe', () => {
    store.createCharacter('guardian')
    store.applySelection('armorId', 'chainmail-t1')
    store.applySelection('subclassId', 'stalwart')

    // Niveau 1 : foundation +1
    expect(store.selectedStatBonuses.thresholds.major).toBe(1)

    // Niveau 5 : +1 (foundation) + 2 (specialization) = +3
    store.updateField('level', 5)
    expect(store.selectedStatBonuses.thresholds.major).toBe(3)

    // Niveau 8 : +1 + 2 + 3 = +6
    store.updateField('level', 8)
    expect(store.selectedStatBonuses.thresholds.major).toBe(6)
  })

  it('changer d\'ascendance retire les anciens bonus et applique les nouveaux', () => {
    store.createCharacter('warrior') // baseHP = 6
    store.applySelection('ancestryId', 'giant')
    expect(store.selectedCharacter.maxHP).toBe(7)

    // Changer pour Elf (pas de bonus HP)
    store.applySelection('ancestryId', 'elf')
    expect(store.selectedCharacter.maxHP).toBe(6)
  })

  it('changer de sous-classe retire les anciens bonus et applique les nouveaux', () => {
    store.createCharacter('guardian') // baseStress = 6
    store.applySelection('subclassId', 'vengeance')
    expect(store.selectedCharacter.maxStress).toBe(7) // +1

    store.applySelection('subclassId', 'stalwart')
    expect(store.selectedCharacter.maxStress).toBe(6) // pas de bonus stress
  })

  it('cumul ascendance + sous-classe fonctionne', () => {
    store.createCharacter('guardian') // baseHP = 7, baseStress = 6
    store.applySelection('ancestryId', 'giant') // +1 HP
    store.applySelection('subclassId', 'vengeance') // +1 Stress
    expect(store.selectedCharacter.maxHP).toBe(8)
    expect(store.selectedCharacter.maxStress).toBe(7)
  })

  it('les sources sont correctement listées', () => {
    store.createCharacter('guardian')
    store.applySelection('ancestryId', 'giant')
    store.applySelection('subclassId', 'stalwart')
    const sources = store.selectedStatBonuses.sources
    expect(sources).toContain('Endurance (Giant)')
    expect(sources).toContain('Unwavering (Stalwart)')
  })

  it('données de référence : ANCESTRY_MODIFIERS et SUBCLASS_MODIFIERS sont définis', () => {
    expect(ANCESTRY_MODIFIERS.giant).toBeDefined()
    expect(ANCESTRY_MODIFIERS.simiah).toBeDefined()
    expect(ANCESTRY_MODIFIERS.galapa).toBeDefined()
    expect(ANCESTRY_MODIFIERS.skjalma).toBeDefined()
    expect(ANCESTRY_MODIFIERS.plassedien).toBeDefined()
    expect(SUBCLASS_MODIFIERS.stalwart).toBeDefined()
    expect(SUBCLASS_MODIFIERS.vengeance).toBeDefined()
    expect(SUBCLASS_MODIFIERS.school_of_war).toBeDefined()
    expect(SUBCLASS_MODIFIERS.nightwalker).toBeDefined()
    expect(SUBCLASS_MODIFIERS.winged_sentinel).toBeDefined()
  })
})
