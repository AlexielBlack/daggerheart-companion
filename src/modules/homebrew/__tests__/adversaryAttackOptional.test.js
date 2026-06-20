import { describe, it, expect } from 'vitest'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { adversarySchema } from '../schemas/adversarySchema.js'

/**
 * Régression : l'attaque d'un adversaire custom est OPTIONNELLE (adversaires
 * sans combat / Social), et le champ Dégâts accepte soit la notation de dés
 * (XdY, XdY+Z) soit un nombre simple (X).
 */
const base = {
  name: 'Test',
  tier: 1,
  type: 'Standard',
  description: 'x',
  difficulty: 11,
  thresholds: { major: 7, severe: 12 },
  hp: 5,
  stress: 3,
  motives: ['m'],
  features: [],
  experiences: []
}

const fields = (data) => validateHomebrewData(data, adversarySchema).errors.map((e) => e.field)

describe('adversaire custom — attaque optionnelle', () => {
  it('accepte un adversaire sans attaque (nom/dégâts vides)', () => {
    const result = validateHomebrewData(
      { ...base, attack: { modifier: 1, name: '', range: 'Melee', damage: '', damageType: 'phy' } },
      adversarySchema
    )
    expect(result.valid).toBe(true)
  })

  it('accepte des dégâts en nombre simple ("5")', () => {
    expect(fields({ ...base, attack: { modifier: 1, name: 'Coup', range: 'Melee', damage: '5', damageType: 'phy' } }))
      .not.toContain('attack.damage')
  })

  it('accepte la notation de dés ("2d8+4")', () => {
    expect(fields({ ...base, attack: { modifier: 1, name: 'Coup', range: 'Melee', damage: '2d8+4', damageType: 'phy' } }))
      .not.toContain('attack.damage')
  })

  it('rejette un format de dégâts invalide ("abc")', () => {
    expect(fields({ ...base, attack: { modifier: 1, name: 'Coup', range: 'Melee', damage: 'abc', damageType: 'phy' } }))
      .toContain('attack.damage')
  })
})
