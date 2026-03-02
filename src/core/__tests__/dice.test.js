import { describe, it, expect } from 'vitest'
import {
  rollDie,
  rollDice,
  rollDualityDice,
  rollExpression,
  rollWithAdvantage,
  rollWithDisadvantage
} from '../utils/dice.js'

describe('rollDie', () => {
  it('retourne un nombre entre 1 et le nombre de faces', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDie(6)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(6)
    }
  })

  it('retourne un entier', () => {
    const result = rollDie(20)
    expect(Number.isInteger(result)).toBe(true)
  })

  it('lève une erreur pour des faces invalides', () => {
    expect(() => rollDie(0)).toThrow()
    expect(() => rollDie(-1)).toThrow()
    expect(() => rollDie(1.5)).toThrow()
  })
})

describe('rollDice', () => {
  it('retourne le bon nombre de résultats', () => {
    const results = rollDice(4, 8)
    expect(results).toHaveLength(4)
    results.forEach((r) => {
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(8)
    })
  })

  it('lève une erreur pour un count invalide', () => {
    expect(() => rollDice(0, 6)).toThrow()
    expect(() => rollDice(-1, 6)).toThrow()
  })
})

describe('rollDualityDice', () => {
  it('retourne hope, fear, total, modifier et result', () => {
    const roll = rollDualityDice(3)
    expect(roll).toHaveProperty('hope')
    expect(roll).toHaveProperty('fear')
    expect(roll).toHaveProperty('total')
    expect(roll).toHaveProperty('modifier')
    expect(roll).toHaveProperty('result')
    expect(roll.modifier).toBe(3)
    expect(roll.total).toBe(roll.hope + roll.fear + 3)
  })

  it('hope et fear sont entre 1 et 12', () => {
    for (let i = 0; i < 100; i++) {
      const roll = rollDualityDice()
      expect(roll.hope).toBeGreaterThanOrEqual(1)
      expect(roll.hope).toBeLessThanOrEqual(12)
      expect(roll.fear).toBeGreaterThanOrEqual(1)
      expect(roll.fear).toBeLessThanOrEqual(12)
    }
  })

  it('résout correctement hope > fear', () => {
    // On ne peut pas contrôler les dés, donc on vérifie la logique
    const roll = rollDualityDice()
    if (roll.hope > roll.fear) {
      expect(roll.result).toBe('hope')
    } else if (roll.fear > roll.hope) {
      expect(roll.result).toBe('fear')
    } else {
      expect(roll.result).toBe('critical')
    }
  })

  it('utilise un modificateur par défaut de 0', () => {
    const roll = rollDualityDice()
    expect(roll.modifier).toBe(0)
    expect(roll.total).toBe(roll.hope + roll.fear)
  })
})

describe('rollExpression', () => {
  it('parse et lance "2d8+4"', () => {
    const result = rollExpression('2d8+4')
    expect(result.rolls).toHaveLength(2)
    expect(result.modifier).toBe(4)
    expect(result.expression).toBe('2d8+4')
    result.rolls.forEach((r) => {
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(8)
    })
    const sum = result.rolls.reduce((a, b) => a + b, 0)
    expect(result.total).toBe(sum + 4)
  })

  it('parse "1d10" sans modificateur', () => {
    const result = rollExpression('1d10')
    expect(result.rolls).toHaveLength(1)
    expect(result.modifier).toBe(0)
  })

  it('parse les modificateurs négatifs "3d6-2"', () => {
    const result = rollExpression('3d6-2')
    expect(result.modifier).toBe(-2)
    expect(result.rolls).toHaveLength(3)
  })

  it('ignore les espaces', () => {
    const result = rollExpression(' 2d6 + 3 ')
    expect(result.rolls).toHaveLength(2)
    expect(result.modifier).toBe(3)
  })

  it('lève une erreur pour une expression invalide', () => {
    expect(() => rollExpression('abc')).toThrow()
    expect(() => rollExpression('d6')).toThrow()
    expect(() => rollExpression('2d')).toThrow()
  })
})

describe('rollWithAdvantage', () => {
  it('retourne le meilleur des deux lancers', () => {
    const result = rollWithAdvantage('1d20')
    expect(result.type).toBe('advantage')
    expect(result.chosen.total).toBeGreaterThanOrEqual(result.discarded.total)
  })
})

describe('rollWithDisadvantage', () => {
  it('retourne le pire des deux lancers', () => {
    const result = rollWithDisadvantage('1d20')
    expect(result.type).toBe('disadvantage')
    expect(result.chosen.total).toBeLessThanOrEqual(result.discarded.total)
  })
})
