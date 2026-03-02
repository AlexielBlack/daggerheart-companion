import { describe, it, expect } from 'vitest'
import {
  SRD_ANCESTRIES,
  CUSTOM_ANCESTRIES,
  TRANSFORMATIONS,
  ALL_ANCESTRIES,
  getAncestryById,
  getTransformationById
} from '../index.js'

// ── Données de référence SRD (OfficialAncestries_SRD.pdf) ──

const EXPECTED_SRD_IDS = [
  'clank', 'drakona', 'dwarf', 'elf', 'faerie', 'faun',
  'firbolg', 'fungril', 'galapa', 'giant', 'goblin',
  'halfling', 'human', 'infernis', 'katari', 'orc',
  'ribbet', 'simiah', 'mixed-ancestry'
]

const EXPECTED_CUSTOM_IDS = [
  'ael', 'nuur', 'iries', 'liane', 'plassedien', 'skjalma'
]

const EXPECTED_TRANSFORMATION_IDS = [
  'vampire', 'werewolf', 'reanimated', 'shapeshifter', 'ghost', 'demigod'
]

/** Noms de features officiels (Homebrew Kit + OfficialAncestries_SRD.pdf) */
const EXPECTED_FEATURES = {
  clank: { top: 'Purposeful Design', bottom: 'Efficient' },
  drakona: { top: 'Scales', bottom: 'Elemental Breath' },
  dwarf: { top: 'Thick Skin', bottom: 'Increased Fortitude' },
  elf: { top: 'Quick Reactions', bottom: 'Celestial Trance' },
  faerie: { top: 'Luckbender', bottom: 'Wings' },
  faun: { top: 'Caprine Leap', bottom: 'Kick' },
  firbolg: { top: 'Charge', bottom: 'Unshakable' },
  fungril: { top: 'Fungril Network', bottom: 'Death Connection' },
  galapa: { top: 'Shell', bottom: 'Retract' },
  giant: { top: 'Endurance', bottom: 'Reach' },
  goblin: { top: 'Surefooted', bottom: 'Danger Sense' },
  halfling: { top: 'Luckbringer', bottom: 'Internal Compass' },
  human: { top: 'High Stamina', bottom: 'Adaptability' },
  infernis: { top: 'Fearless', bottom: 'Dread Visage' },
  katari: { top: 'Feline Instincts', bottom: 'Retracting Claws' },
  orc: { top: 'Sturdy', bottom: 'Tusks' },
  ribbet: { top: 'Amphibious', bottom: 'Long Tongue' },
  simiah: { top: 'Natural Climber', bottom: 'Nimble' }
}

// ── Structure des données ───────────────────────────────

describe('Ancestries — structure de données', () => {
  const allEntries = [...SRD_ANCESTRIES, ...CUSTOM_ANCESTRIES, ...TRANSFORMATIONS]

  it.each(allEntries.map((a) => [a.id, a]))('%s a tous les champs requis', (_id, entry) => {
    expect(entry).toHaveProperty('id')
    expect(entry).toHaveProperty('name')
    expect(entry).toHaveProperty('emoji')
    expect(entry).toHaveProperty('source')
    expect(entry).toHaveProperty('description')
    expect(entry).toHaveProperty('topFeature')
    expect(entry).toHaveProperty('bottomFeature')
    expect(entry.topFeature).toHaveProperty('name')
    expect(entry.topFeature).toHaveProperty('description')
    expect(entry.bottomFeature).toHaveProperty('name')
    expect(entry.bottomFeature).toHaveProperty('description')
  })

  it('pas d\'IDs dupliqués dans ALL_ANCESTRIES', () => {
    const ids = ALL_ANCESTRIES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('pas d\'IDs dupliqués dans TRANSFORMATIONS', () => {
    const ids = TRANSFORMATIONS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('les descriptions ne sont pas vides', () => {
    for (const entry of allEntries) {
      expect(entry.description.length).toBeGreaterThan(10)
      expect(entry.topFeature.description.length).toBeGreaterThan(10)
      expect(entry.bottomFeature.description.length).toBeGreaterThan(10)
    }
  })
})

// ── Ancestries SRD officielles ──────────────────────────

describe('Ancestries SRD — complétude', () => {
  it('contient les 19 ancestries officielles (18 + Mixed)', () => {
    expect(SRD_ANCESTRIES).toHaveLength(19)
  })

  it.each(EXPECTED_SRD_IDS)('contient l\'ancestry SRD : %s', (id) => {
    const found = SRD_ANCESTRIES.find((a) => a.id === id)
    expect(found).toBeDefined()
    expect(found.source).toBe('srd')
  })
})

describe('Ancestries SRD — noms de features', () => {
  it.each(Object.entries(EXPECTED_FEATURES))(
    '%s a les bons noms de features',
    (id, expected) => {
      const ancestry = SRD_ANCESTRIES.find((a) => a.id === id)
      expect(ancestry).toBeDefined()
      expect(ancestry.topFeature.name).toBe(expected.top)
      expect(ancestry.bottomFeature.name).toBe(expected.bottom)
    }
  )
})

// ── Ancestries Custom ───────────────────────────────────

describe('Ancestries Custom — complétude', () => {
  it('contient les 6 ancestries custom', () => {
    expect(CUSTOM_ANCESTRIES).toHaveLength(6)
  })

  it.each(EXPECTED_CUSTOM_IDS)('contient l\'ancestry custom : %s', (id) => {
    const found = CUSTOM_ANCESTRIES.find((a) => a.id === id)
    expect(found).toBeDefined()
    expect(found.source).toBe('custom')
  })
})

// ── Transformations ─────────────────────────────────────

describe('Transformations — complétude', () => {
  it('contient les 6 transformations', () => {
    expect(TRANSFORMATIONS).toHaveLength(6)
  })

  it.each(EXPECTED_TRANSFORMATION_IDS)('contient la transformation : %s', (id) => {
    const found = TRANSFORMATIONS.find((t) => t.id === id)
    expect(found).toBeDefined()
    expect(found.source).toBe('transformation')
  })
})

// ── Fonctions utilitaires ───────────────────────────────

describe('getAncestryById', () => {
  it('retourne un SRD ancestry', () => {
    const result = getAncestryById('elf')
    expect(result).toBeDefined()
    expect(result.name).toBe('Elf')
  })

  it('retourne un custom ancestry', () => {
    const result = getAncestryById('ael')
    expect(result).toBeDefined()
    expect(result.name).toBe('Aêl')
  })

  it('retourne null pour un ID inconnu', () => {
    expect(getAncestryById('inexistant')).toBeNull()
  })
})

describe('getTransformationById', () => {
  it('retourne une transformation', () => {
    const result = getTransformationById('vampire')
    expect(result).toBeDefined()
    expect(result.name).toBe('Vampire')
  })

  it('retourne null pour un ID inconnu', () => {
    expect(getTransformationById('inexistant')).toBeNull()
  })
})

// ── ALL_ANCESTRIES combine bien SRD + Custom ────────────

describe('ALL_ANCESTRIES', () => {
  it('combine SRD et Custom (pas les Transformations)', () => {
    expect(ALL_ANCESTRIES).toHaveLength(SRD_ANCESTRIES.length + CUSTOM_ANCESTRIES.length)
  })

  it('ne contient pas les transformations', () => {
    for (const t of TRANSFORMATIONS) {
      expect(ALL_ANCESTRIES.find((a) => a.id === t.id)).toBeUndefined()
    }
  })
})
