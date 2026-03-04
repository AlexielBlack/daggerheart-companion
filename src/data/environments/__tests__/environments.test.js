/**
 * @module environments/__tests__
 * @description Tests d'intégrité structurelle et logique des environnements.
 *
 * Vérifications SRD valeur-par-valeur supprimées.
 * On conserve : structure, règles de cohérence, logique de features.
 */

import { describe, it, expect } from 'vitest'
import { allEnvironments, ENVIRONMENT_TYPES, FEATURE_TYPES } from '../index.js'

// ── Structure ───────────────────────────────────────────

describe('Environnements — intégrité structurelle', () => {
  it('contient des environnements', () => {
    expect(allEnvironments.length).toBeGreaterThan(0)
  })

  it('chaque environnement a un id unique', () => {
    const ids = allEnvironments.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque environnement a les champs requis', () => {
    allEnvironments.forEach((e) => {
      const fields = ['id', 'name', 'tier', 'type', 'difficulty', 'description', 'impulses', 'features']
      fields.forEach((f) => expect(e, `${e.id} manque "${f}"`).toHaveProperty(f))
      expect(Array.isArray(e.impulses), `${e.id} impulses`).toBe(true)
      expect(Array.isArray(e.features), `${e.id} features`).toBe(true)
    })
  })

  it('tous les types sont valides', () => {
    allEnvironments.forEach((e) => {
      expect(ENVIRONMENT_TYPES, `${e.id} type "${e.type}"`).toContain(e.type)
    })
  })

  it('tous les tiers sont entre 1 et 4', () => {
    allEnvironments.forEach((e) => {
      expect(e.tier).toBeGreaterThanOrEqual(1)
      expect(e.tier).toBeLessThanOrEqual(4)
    })
  })

  it('les features sont bien formées', () => {
    allEnvironments.forEach((e) => {
      e.features.forEach((f) => {
        expect(typeof f.name, `${e.id} feature name`).toBe('string')
        expect(typeof f.description, `${e.id} feature description`).toBe('string')
        expect(FEATURE_TYPES, `${e.id} feature type "${f.type}"`).toContain(f.type)
      })
    })
  })
})

// ── Règles de cohérence ─────────────────────────────────

describe('Environnements — logique', () => {
  it('la difficulté moyenne augmente avec le tier', () => {
    const avgDiff = [1, 2, 3, 4].map((tier) => {
      const entries = allEnvironments.filter((e) => e.tier === tier && e.difficulty !== null)
      return entries.reduce((s, e) => s + e.difficulty, 0) / entries.length
    })
    for (let i = 1; i < avgDiff.length; i++) {
      expect(avgDiff[i], `Tier ${i + 1} > Tier ${i}`).toBeGreaterThan(avgDiff[i - 1])
    }
  })

  it('chaque environnement a au moins une feature passive', () => {
    allEnvironments.forEach((e) => {
      const passives = e.features.filter((f) => f.type === 'passive')
      expect(passives.length, `${e.name} doit avoir >= 1 passive`).toBeGreaterThanOrEqual(1)
    })
  })

  it('les features avec fearCost ont un coût positif', () => {
    allEnvironments.forEach((e) => {
      e.features.forEach((f) => {
        if (f.fearCost !== null && f.fearCost !== undefined) {
          expect(f.fearCost, `${e.name} > ${f.name} fearCost > 0`).toBeGreaterThan(0)
        }
      })
    })
  })

  it('FEATURE_TYPES exporte les 3 types valides', () => {
    expect(FEATURE_TYPES).toContain('passive')
    expect(FEATURE_TYPES).toContain('action')
    expect(FEATURE_TYPES).toContain('reaction')
  })

  it('les environnements sans difficulté fixe ont difficultySpecial', () => {
    allEnvironments.forEach((e) => {
      if (e.difficulty === null) {
        expect(typeof e.difficultySpecial, `${e.name} manque difficultySpecial`).toBe('string')
      }
    })
  })
})
