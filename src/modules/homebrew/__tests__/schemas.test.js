import { describe, it, expect } from 'vitest'
import { adversarySchema, ADVERSARY_TIER_BENCHMARKS } from '../schemas/adversarySchema.js'
import { isValidFieldType } from '../core/utils/schemaTypes.js'
import { buildDefaults } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'

describe('adversarySchema', () => {
  it('a les proprietes requises', () => {
    expect(adversarySchema.key).toBe('adversary')
    expect(adversarySchema.label).toBeTruthy()
    expect(adversarySchema.storageKey).toBeTruthy()
    expect(Array.isArray(adversarySchema.fields)).toBe(true)
    expect(adversarySchema.fields.length).toBeGreaterThan(0)
  })

  it('chaque champ a un key, type et label valides', () => {
    function checkFields(fields, parentPath = '') {
      for (const field of fields) {
        const path = parentPath ? `${parentPath}.${field.key}` : field.key
        expect(field.key, `${path} : key manquant`).toBeTruthy()
        expect(field.type, `${path} : type manquant`).toBeTruthy()
        expect(isValidFieldType(field.type), `${path} : type "${field.type}" invalide`).toBe(true)
        expect(field.label, `${path} : label manquant`).toBeTruthy()

        // Recursion pour les groupes
        if (field.children) {
          checkFields(field.children, path)
        }
        // Recursion pour les array item schemas
        if (field.itemSchema?.fields) {
          checkFields(field.itemSchema.fields, `${path}[]`)
        }
      }
    }

    checkFields(adversarySchema.fields)
  })

  it('peut construire des valeurs par defaut valides', () => {
    const defaults = buildDefaults(adversarySchema.fields)

    expect(defaults).toHaveProperty('name')
    expect(defaults).toHaveProperty('tier')
    expect(defaults).toHaveProperty('difficulty')
    expect(defaults).toHaveProperty('hp')
    expect(defaults).toHaveProperty('stress')
    expect(defaults).toHaveProperty('thresholds')
    expect(defaults.thresholds).toHaveProperty('major')
    expect(defaults.thresholds).toHaveProperty('severe')
    expect(defaults).toHaveProperty('attack')
    expect(defaults.attack).toHaveProperty('modifier')
  })

  it('valide un adversaire complet construit depuis les benchmarks T1', () => {
    const benchmarks = ADVERSARY_TIER_BENCHMARKS[1]
    const adversary = {
      name: 'Test Gobelin',
      tier: 1,
      type: 'Standard',
      description: 'Un gobelin standard.',
      motives: ['Attaquer', 'Fuir'],
      difficulty: benchmarks.difficulty,
      thresholds: benchmarks.thresholds,
      hp: benchmarks.hp,
      stress: benchmarks.stress,
      attack: {
        modifier: benchmarks.attack.modifier,
        name: 'Dague',
        range: 'Melee',
        damage: benchmarks.attack.damage,
        damageType: benchmarks.attack.damageType
      },
      experiences: [{ name: 'Stealth', modifier: 2 }],
      features: [
        { name: 'Embuscade', type: 'passive', description: 'Avantage si cache.' }
      ]
    }

    const result = validateHomebrewData(adversary, adversarySchema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('ADVERSARY_TIER_BENCHMARKS', () => {
  it('contient des benchmarks pour les tiers 1 a 4', () => {
    for (const tier of [1, 2, 3, 4]) {
      expect(ADVERSARY_TIER_BENCHMARKS[tier]).toBeDefined()
      expect(ADVERSARY_TIER_BENCHMARKS[tier].difficulty).toBeGreaterThan(0)
      expect(ADVERSARY_TIER_BENCHMARKS[tier].thresholds.major).toBeGreaterThan(0)
      expect(ADVERSARY_TIER_BENCHMARKS[tier].thresholds.severe).toBeGreaterThan(0)
      expect(ADVERSARY_TIER_BENCHMARKS[tier].hp).toBeGreaterThan(0)
    }
  })

  it('les stats augmentent avec le tier', () => {
    for (let t = 1; t < 4; t++) {
      const current = ADVERSARY_TIER_BENCHMARKS[t]
      const next = ADVERSARY_TIER_BENCHMARKS[t + 1]
      expect(next.difficulty).toBeGreaterThan(current.difficulty)
      expect(next.thresholds.major).toBeGreaterThan(current.thresholds.major)
      expect(next.thresholds.severe).toBeGreaterThan(current.thresholds.severe)
    }
  })
})
