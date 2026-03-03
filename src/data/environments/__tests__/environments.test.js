/**
 * @module environments/__tests__
 * @description Tests d'intégrité des données environnements — vérification contre le SRD officiel.
 *
 * Source : ENV_sheetsSRD.pdf (Daggerheart SRD)
 */

import { describe, it, expect } from 'vitest'
import { allEnvironments, ENVIRONMENT_TYPES, FEATURE_TYPES, tier1, tier2, tier3, tier4 } from '../index.js'

// ── Référence SRD — vérifiée contre ENV_sheetsSRD.pdf ─────────────────────
//
// Notes spéciales :
// - Ambushed / Ambushers : difficulty=null par règle SRD ("égale la Difficulty
//   de l'adversaire le plus élevé"). Champ difficultySpecial documenté.
// - impulseCount : Ambushed=3, Ambushers=3 (exception, pas 2)
// - featureCount : variable selon l'environnement (2–6 selon le SRD)

const SRD_ENVIRONMENTS = [
  // Tier 1
  { name: 'Abandoned Grove',      tier: 1, type: 'Exploration', difficulty: 11,   impulseCount: 2, featureCount: 4 },
  { name: 'Ambushed',             tier: 1, type: 'Event',       difficulty: null,  impulseCount: 3, featureCount: 2 },
  { name: 'Ambushers',            tier: 1, type: 'Event',       difficulty: null,  impulseCount: 3, featureCount: 2 },
  { name: 'Bustling Marketplace', tier: 1, type: 'Social',      difficulty: 10,    impulseCount: 2, featureCount: 4 },
  { name: 'Cliffside Ascent',     tier: 1, type: 'Traversal',   difficulty: 12,    impulseCount: 2, featureCount: 3 },
  { name: 'Local Tavern',         tier: 1, type: 'Social',      difficulty: 10,    impulseCount: 2, featureCount: 5 },
  { name: 'Outpost Town',         tier: 1, type: 'Social',      difficulty: 12,    impulseCount: 2, featureCount: 5 },
  { name: 'Raging River',         tier: 1, type: 'Traversal',   difficulty: 10,    impulseCount: 3, featureCount: 3 },
  // Tier 2
  { name: 'Cult Ritual',          tier: 2, type: 'Event',       difficulty: 14,    impulseCount: 2, featureCount: 4 },
  { name: 'Hallowed Temple',      tier: 2, type: 'Social',      difficulty: 13,    impulseCount: 3, featureCount: 4 },
  { name: 'Haunted City',         tier: 2, type: 'Exploration', difficulty: 14,    impulseCount: 2, featureCount: 4 },
  { name: 'Mountain Pass',        tier: 2, type: 'Traversal',   difficulty: 15,    impulseCount: 3, featureCount: 4 },
  // Tier 3
  { name: 'Burning Heart of the Woods', tier: 3, type: 'Exploration', difficulty: 16, impulseCount: 2, featureCount: 5 },
  { name: 'Castle Siege',               tier: 3, type: 'Event',       difficulty: 17, impulseCount: 3, featureCount: 4 },
  { name: 'Pitched Battle',             tier: 3, type: 'Event',       difficulty: 17, impulseCount: 2, featureCount: 4 },
  // Tier 4
  { name: 'Chaos Realm',           tier: 4, type: 'Traversal',   difficulty: 20,   impulseCount: 3, featureCount: 5 },
  { name: 'Divine Usurpation',     tier: 4, type: 'Event',       difficulty: 20,   impulseCount: 3, featureCount: 6 },
  { name: 'Imperial Court',        tier: 4, type: 'Social',      difficulty: 20,   impulseCount: 2, featureCount: 5 },
  { name: "Necromancer's Ossuary", tier: 4, type: 'Exploration', difficulty: 19,   impulseCount: 4, featureCount: 5 },
]

// ── Tests — Structure générale ─────────────────────────────────────────────

describe('Environnements — structure de données', () => {
  it('contient 19 environnements au total', () => {
    expect(allEnvironments.length).toBe(19)
  })

  it('répartition par tiers : 8 / 4 / 3 / 4', () => {
    expect(tier1.length).toBe(8)
    expect(tier2.length).toBe(4)
    expect(tier3.length).toBe(3)
    expect(tier4.length).toBe(4)
  })

  it('chaque environnement a un id unique', () => {
    const ids = allEnvironments.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(allEnvironments.map((e) => [e.id, e]))('%s — champs requis présents', (_id, e) => {
    expect(e).toHaveProperty('id')
    expect(e).toHaveProperty('name')
    expect(e).toHaveProperty('tier')
    expect(e).toHaveProperty('type')
    expect(e).toHaveProperty('difficulty')
    expect(e).toHaveProperty('description')
    expect(e).toHaveProperty('impulses')
    expect(e).toHaveProperty('features')
    expect(Array.isArray(e.impulses)).toBe(true)
    expect(Array.isArray(e.features)).toBe(true)
  })

  it.each(allEnvironments.map((e) => [e.id, e]))('%s — type valide', (_id, e) => {
    expect(ENVIRONMENT_TYPES).toContain(e.type)
  })

  it.each(allEnvironments.map((e) => [e.id, e]))('%s — tier entre 1 et 4', (_id, e) => {
    expect(e.tier).toBeGreaterThanOrEqual(1)
    expect(e.tier).toBeLessThanOrEqual(4)
  })

  it.each(allEnvironments.map((e) => [e.id, e]))('%s — features bien formées', (_id, e) => {
    e.features.forEach((f) => {
      expect(f).toHaveProperty('name')
      expect(f).toHaveProperty('type')
      expect(f).toHaveProperty('description')
      expect(typeof f.name).toBe('string')
      expect(typeof f.description).toBe('string')
      expect(FEATURE_TYPES).toContain(f.type)
    })
  })
})

// ── Tests — Conformité SRD ─────────────────────────────────────────────────

describe('Environnements — conformité SRD', () => {
  const byName = Object.fromEntries(allEnvironments.map((e) => [e.name, e]))

  it.each(SRD_ENVIRONMENTS.map((s) => [s.name, s]))('%s — données SRD correctes', (name, expected) => {
    const e = byName[name]
    expect(e, `Environnement introuvable : "${name}"`).toBeTruthy()
    expect(e.tier).toBe(expected.tier)
    expect(e.type).toBe(expected.type)
    expect(e.difficulty).toBe(expected.difficulty)
    expect(e.impulses.length).toBe(expected.impulseCount)
    expect(e.features.length).toBe(expected.featureCount)
  })

  it('Ambushed et Ambushers ont une difficulté dynamique (null + difficultySpecial)', () => {
    const ambushed  = byName['Ambushed']
    const ambushers = byName['Ambushers']
    expect(ambushed.difficulty).toBeNull()
    expect(typeof ambushed.difficultySpecial).toBe('string')
    expect(ambushers.difficulty).toBeNull()
    expect(typeof ambushers.difficultySpecial).toBe('string')
  })

  it('la difficulté moyenne augmente avec le tier (environnements à difficulty fixe)', () => {
    const avgDiff = [1, 2, 3, 4].map((tier) => {
      const entries = allEnvironments.filter((e) => e.tier === tier && e.difficulty !== null)
      return entries.reduce((s, e) => s + e.difficulty, 0) / entries.length
    })
    for (let i = 1; i < avgDiff.length; i++) {
      expect(avgDiff[i]).toBeGreaterThan(avgDiff[i - 1])
    }
  })
})

// ── Tests — Features par type ──────────────────────────────────────────────

describe('Environnements — features', () => {
  it('chaque environnement a au moins une feature passive', () => {
    allEnvironments.forEach((e) => {
      const passives = e.features.filter((f) => f.type === 'passive')
      expect(passives.length, `${e.name} doit avoir au moins 1 feature passive`).toBeGreaterThanOrEqual(1)
    })
  })

  it('les features avec fearCost ont un coût positif', () => {
    allEnvironments.forEach((e) => {
      e.features.forEach((f) => {
        if (f.fearCost !== null && f.fearCost !== undefined) {
          expect(f.fearCost, `${e.name} > ${f.name}: fearCost doit être > 0`).toBeGreaterThan(0)
        }
      })
    })
  })

  it('FEATURE_TYPES exporte les 3 types valides', () => {
    expect(FEATURE_TYPES).toContain('passive')
    expect(FEATURE_TYPES).toContain('action')
    expect(FEATURE_TYPES).toContain('reaction')
  })
})
