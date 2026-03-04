/**
 * @module adversaries/__tests__
 * @description Tests de logique et d'intégrité structurelle des données adversaires.
 *
 * Tests SRD de conformité valeur-par-valeur supprimés (pas de logique critique).
 * On conserve : unicité des IDs, présence des champs requis, cohérence des seuils,
 * règles par type (minions, solos, tier scaling).
 */

import { describe, it, expect } from 'vitest'
import { allAdversaries, ADVERSARY_TYPES, RANGES } from '../index.js'

// ── Tests — Intégrité structurelle ─────────────────────────────────────────

describe('Adversaires — intégrité structurelle', () => {
  it('contient des adversaires', () => {
    expect(allAdversaries.length).toBeGreaterThan(0)
  })

  it('chaque adversaire a un id unique', () => {
    const ids = allAdversaries.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque adversaire a les champs requis', () => {
    const requiredFields = ['id', 'name', 'tier', 'type', 'difficulty', 'hp', 'stress', 'motives']
    allAdversaries.forEach((a) => {
      requiredFields.forEach((field) => {
        expect(a, `${a.id} manque le champ "${field}"`).toHaveProperty(field)
      })
      expect(Array.isArray(a.motives), `${a.id} motives doit être un tableau`).toBe(true)
      expect(a.motives.length, `${a.id} doit avoir au moins 1 motive`).toBeGreaterThan(0)
    })
  })

  it('tous les types sont valides', () => {
    allAdversaries.forEach((a) => {
      expect(ADVERSARY_TYPES, `${a.id} type "${a.type}" invalide`).toContain(a.type)
    })
  })

  it('tous les tiers sont entre 1 et 4', () => {
    allAdversaries.forEach((a) => {
      expect(a.tier).toBeGreaterThanOrEqual(1)
      expect(a.tier).toBeLessThanOrEqual(4)
    })
  })

  it('les seuils de dégâts sont cohérents (severe > major)', () => {
    allAdversaries.forEach((a) => {
      if (a.type === 'Minion' || !a.thresholds) return
      const { major, severe } = a.thresholds
      if (major !== null && major !== undefined && severe !== null && severe !== undefined) {
        expect(severe, `${a.id} severe doit > major`).toBeGreaterThan(major)
      }
    })
  })

  it('les attaques sont bien formées', () => {
    allAdversaries.filter((a) => a.attack).forEach((a) => {
      const atk = a.attack
      expect(typeof atk.modifier, `${a.id} attack.modifier`).toBe('number')
      expect(atk, `${a.id} attack.name`).toHaveProperty('name')
      expect(RANGES, `${a.id} attack.range "${atk.range}" invalide`).toContain(atk.range)
      expect(atk, `${a.id} attack.damage`).toHaveProperty('damage')
      expect(atk, `${a.id} attack.damageType`).toHaveProperty('damageType')
    })
  })
})

// ── Tests — Règles par type ────────────────────────────────────────────────

describe('Adversaires — règles par type', () => {
  const minions = allAdversaries.filter((a) => a.type === 'Minion')
  const nonMinions = allAdversaries.filter((a) => a.type !== 'Minion')

  it('les minions ont 1 HP (sauf exceptions documentées)', () => {
    const EXCEPTIONS = new Set(['Tiny Green Ooze', 'Tiny Red Ooze'])
    minions.forEach((a) => {
      if (EXCEPTIONS.has(a.name)) return
      expect(a.hp, `${a.name} devrait avoir 1 HP`).toBe(1)
    })
  })

  it('les non-minions ont plus de 1 HP', () => {
    nonMinions.forEach((a) => {
      expect(a.hp, `${a.name} devrait avoir > 1 HP`).toBeGreaterThan(1)
    })
  })

  it('les solos ont plus de HP moyens que les standards (tiers 1–3)', () => {
    for (let tier = 1; tier <= 3; tier++) {
      const solos = allAdversaries.filter((a) => a.tier === tier && a.type === 'Solo')
      const standards = allAdversaries.filter((a) => a.tier === tier && a.type === 'Standard')
      if (solos.length > 0 && standards.length > 0) {
        const avgSoloHp = solos.reduce((s, a) => s + a.hp, 0) / solos.length
        const avgStdHp = standards.reduce((s, a) => s + a.hp, 0) / standards.length
        expect(avgSoloHp, `Tier ${tier}: solos HP moyen > standards`).toBeGreaterThan(avgStdHp)
      }
    }
  })

  it('la difficulté moyenne augmente avec le tier', () => {
    const avgDiff = [1, 2, 3, 4].map((tier) => {
      const entries = allAdversaries.filter((a) => a.tier === tier && a.type !== 'Minion')
      return entries.reduce((s, a) => s + a.difficulty, 0) / entries.length
    })
    for (let i = 1; i < avgDiff.length; i++) {
      expect(avgDiff[i], `Tier ${i + 1} difficulté > Tier ${i}`).toBeGreaterThan(avgDiff[i - 1])
    }
  })
})
