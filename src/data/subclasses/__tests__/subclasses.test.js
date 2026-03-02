import { describe, it, expect } from 'vitest'
import {
  SUBCLASSES,
  getSubclassesForClass,
  getSubclassById
} from '../index.js'

// ── Données de référence SRD ───────────────────────────
const EXPECTED_CLASSES = [
  'guardian', 'seraph', 'warrior', 'rogue', 'bard',
  'druid', 'ranger', 'wizard', 'sorcerer',
  'assassin', 'duellist'
]

const EXPECTED_SUBCLASS_NAMES = {
  guardian: ['Stalwart', 'Vengeance'],
  seraph: ['Divine Wielder', 'Winged Sentinel'],
  warrior: ['Call of the Brave', 'Call of the Slayer'],
  rogue: ['Nightwalker', 'Syndicate'],
  bard: ['Troubadour', 'Wordsmith'],
  druid: ['Warden of the Elements', 'Warden of Renewal'],
  ranger: ['Beastbound', 'Wayfinder'],
  wizard: ['School of Knowledge', 'School of War'],
  sorcerer: ['Elemental Origin', 'Primal Origin'],
  assassin: ['Executioners Guild', 'Poisoners Guild'],
  duellist: ['Swashbuckler', 'Acrobat']
}

const EXPECTED_SPELLCAST_TRAITS = {
  guardian: [null, null],
  seraph: ['Strength', 'Strength'],
  warrior: [null, null],
  rogue: ['Finesse', 'Finesse'],
  bard: ['Presence', 'Presence'],
  druid: ['Instinct', 'Instinct'],
  ranger: ['Agility', 'Agility'],
  wizard: ['Knowledge', 'Knowledge'],
  sorcerer: ['Instinct', 'Instinct'],
  assassin: [null, 'Knowledge'],
  duellist: ['Presence', 'Agility']
}

// ── Structure & complétude ─────────────────────────────
describe('SUBCLASSES — structure globale', () => {
  it('contient exactement les 11 classes attendues', () => {
    const classIds = Object.keys(SUBCLASSES)
    expect(classIds.sort()).toEqual(EXPECTED_CLASSES.sort())
  })

  it('contient exactement 22 sous-classes au total (2 par classe)', () => {
    const totalSubclasses = Object.values(SUBCLASSES)
      .reduce((sum, subs) => sum + subs.length, 0)
    expect(totalSubclasses).toBe(22)
  })

  it('chaque classe a exactement 2 sous-classes', () => {
    for (const classId of EXPECTED_CLASSES) {
      expect(SUBCLASSES[classId]).toHaveLength(2)
    }
  })
})

// ── Noms corrects SRD ──────────────────────────────────
describe('SUBCLASSES — noms SRD corrects', () => {
  for (const [classId, expectedNames] of Object.entries(EXPECTED_SUBCLASS_NAMES)) {
    it(`${classId} → ${expectedNames.join(' / ')}`, () => {
      const names = SUBCLASSES[classId].map((s) => s.name)
      expect(names).toEqual(expectedNames)
    })
  }
})

// ── Spellcast Traits ───────────────────────────────────
describe('SUBCLASSES — spellcast traits corrects', () => {
  for (const [classId, expectedTraits] of Object.entries(EXPECTED_SPELLCAST_TRAITS)) {
    it(`${classId} → traits [${expectedTraits.join(', ')}]`, () => {
      const traits = SUBCLASSES[classId].map((s) => s.spellcastTrait)
      expect(traits).toEqual(expectedTraits)
    })
  }
})

// ── Schéma par sous-classe ─────────────────────────────
describe('SUBCLASSES — schéma de chaque sous-classe', () => {
  for (const [classId, subclasses] of Object.entries(SUBCLASSES)) {
    for (const sub of subclasses) {
      describe(`${classId} / ${sub.name}`, () => {
        it('possède un id string non vide', () => {
          expect(typeof sub.id).toBe('string')
          expect(sub.id.length).toBeGreaterThan(0)
        })

        it('possède un name string non vide', () => {
          expect(typeof sub.name).toBe('string')
          expect(sub.name.length).toBeGreaterThan(0)
        })

        it('possède une description string non vide', () => {
          expect(typeof sub.description).toBe('string')
          expect(sub.description.length).toBeGreaterThan(0)
        })

        it('spellcastTrait est null ou un trait valide', () => {
          const validTraits = [
            null, 'Agility', 'Strength', 'Finesse',
            'Instinct', 'Presence', 'Knowledge'
          ]
          expect(validTraits).toContain(sub.spellcastTrait)
        })

        it('foundation est un tableau non vide de strings', () => {
          expect(Array.isArray(sub.foundation)).toBe(true)
          expect(sub.foundation.length).toBeGreaterThanOrEqual(1)
          for (const f of sub.foundation) {
            expect(typeof f).toBe('string')
            expect(f.length).toBeGreaterThan(0)
          }
        })

        it('specialization est un tableau non vide de strings', () => {
          expect(Array.isArray(sub.specialization)).toBe(true)
          expect(sub.specialization.length).toBeGreaterThanOrEqual(1)
          for (const s of sub.specialization) {
            expect(typeof s).toBe('string')
            expect(s.length).toBeGreaterThan(0)
          }
        })

        it('mastery est un tableau non vide de strings', () => {
          expect(Array.isArray(sub.mastery)).toBe(true)
          expect(sub.mastery.length).toBeGreaterThanOrEqual(1)
          for (const m of sub.mastery) {
            expect(typeof m).toBe('string')
            expect(m.length).toBeGreaterThan(0)
          }
        })
      })
    }
  }
})

// ── IDs uniques ────────────────────────────────────────
describe('SUBCLASSES — unicité des IDs', () => {
  it('aucun id dupliqué parmi toutes les sous-classes', () => {
    const allIds = Object.values(SUBCLASSES)
      .flat()
      .map((s) => s.id)
    const uniqueIds = new Set(allIds)
    expect(uniqueIds.size).toBe(allIds.length)
  })
})

// ── Fonctions utilitaires ──────────────────────────────
describe('getSubclassesForClass', () => {
  it('retourne les sous-classes du guardian', () => {
    const result = getSubclassesForClass('guardian')
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Stalwart')
    expect(result[1].name).toBe('Vengeance')
  })

  it('retourne un tableau vide pour une classe inconnue', () => {
    expect(getSubclassesForClass('inexistant')).toEqual([])
  })

  it('retourne les sous-classes du sorcerer (auparavant manquant)', () => {
    const result = getSubclassesForClass('sorcerer')
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Elemental Origin')
    expect(result[1].name).toBe('Primal Origin')
  })
})

describe('getSubclassById', () => {
  it('retourne la bonne sous-classe', () => {
    const sub = getSubclassById('wizard', 'school_of_war')
    expect(sub).not.toBeNull()
    expect(sub.name).toBe('School of War')
    expect(sub.spellcastTrait).toBe('Knowledge')
  })

  it('retourne null pour un id inexistant', () => {
    expect(getSubclassById('wizard', 'inexistant')).toBeNull()
  })

  it('retourne null pour une classe inexistante', () => {
    expect(getSubclassById('inexistant', 'stalwart')).toBeNull()
  })

  it('retourne les sous-classes homebrew (assassin)', () => {
    const exec = getSubclassById('assassin', 'executioners_guild')
    expect(exec).not.toBeNull()
    expect(exec.name).toBe('Executioners Guild')

    const poison = getSubclassById('assassin', 'poisoners_guild')
    expect(poison).not.toBeNull()
    expect(poison.name).toBe('Poisoners Guild')
    expect(poison.spellcastTrait).toBe('Knowledge')
  })
})

// ── Vérifications de contenu clé (spot checks SRD) ────
describe('SUBCLASSES — vérifications de contenu SRD', () => {
  it('Guardian Stalwart foundation mentionne "Unwavering"', () => {
    const sub = getSubclassById('guardian', 'stalwart')
    expect(sub.foundation[0]).toMatch(/Unwavering/)
  })

  it('Sorcerer Elemental Origin foundation mentionne "Elementalist"', () => {
    const sub = getSubclassById('sorcerer', 'elemental_origin')
    expect(sub.foundation[0]).toMatch(/Elementalist/)
  })

  it('Ranger Beastbound foundation mentionne "Companion"', () => {
    const sub = getSubclassById('ranger', 'beastbound')
    expect(sub.foundation[0]).toMatch(/Companion/)
  })

  it('Wizard School of War mastery mentionne "Thrive in Chaos"', () => {
    const sub = getSubclassById('wizard', 'school_of_war')
    expect(sub.mastery[0]).toMatch(/Thrive in Chaos/)
  })

  it('Assassin Executioners Guild foundation mentionne "First Strike"', () => {
    const sub = getSubclassById('assassin', 'executioners_guild')
    expect(sub.foundation[0]).toMatch(/First Strike/)
  })

  it('Duellist Swashbuckler foundation mentionne "Roiling Braggart"', () => {
    const sub = getSubclassById('duellist', 'swashbuckler')
    expect(sub.foundation[0]).toMatch(/Roiling Braggart/)
  })

  it('Bard Wordsmith mastery mentionne "Epic Poetry"', () => {
    const sub = getSubclassById('bard', 'wordsmith')
    expect(sub.mastery[0]).toMatch(/Epic Poetry/)
  })
})
