import { describe, it, expect } from 'vitest'
import { generateEncounter } from '../useEncounterGenerator'

describe('generateEncounter', () => {
  const mockAdversaries = [
    { id: 'goblin-scout', name: 'Eclaireur gobelin', type: 'Minion', tier: 2, genres: ['humanoide'] },
    { id: 'goblin-warrior', name: 'Guerrier gobelin', type: 'Standard', tier: 2, genres: ['humanoide'] },
    { id: 'goblin-shaman', name: 'Shamane gobelin', type: 'Leader', tier: 2, genres: ['humanoide'] },
    { id: 'wolf', name: 'Loup sauvage', type: 'Standard', tier: 1, genres: ['bete'] },
    { id: 'dire-wolf', name: 'Loup terrible', type: 'Bruiser', tier: 2, genres: ['bete'] },
    { id: 'skeleton', name: 'Squelette', type: 'Minion', tier: 1, genres: ['mort-vivant'] },
    { id: 'zombie', name: 'Zombie', type: 'Standard', tier: 1, genres: ['mort-vivant'] },
    { id: 'necro', name: 'Necromancien', type: 'Leader', tier: 2, genres: ['mort-vivant', 'humanoide'] }
  ]

  it('genere une rencontre avec le bon budget BP', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'humanoide',
      difficulty: 'standard',
      pcCount: 3
    })
    expect(result.slots.length).toBeGreaterThan(0)
    expect(result.totalBP).toBeLessThanOrEqual(result.budgetBP)
    expect(result.totalBP).toBeGreaterThan(0)
  })

  it('respecte le filtre de genre', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'bete',
      difficulty: 'standard',
      pcCount: 3
    })
    result.slots.forEach(slot => {
      expect(slot.adversary.genres).toContain('bete')
    })
  })

  it('ne genere pas plus d un Leader', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: null,
      difficulty: 'standard',
      pcCount: 4
    })
    const leaders = result.slots.filter(s => s.adversary.type === 'Leader')
    expect(leaders.length).toBeLessThanOrEqual(1)
  })

  it('groupe les Minions par pcCount', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'humanoide',
      difficulty: 'standard',
      pcCount: 3
    })
    result.slots
      .filter(s => s.adversary.type === 'Minion')
      .forEach(slot => {
        expect(slot.quantity % 3).toBe(0)
      })
  })

  it('retourne un objet avec les champs attendus', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'humanoide',
      difficulty: 'standard',
      pcCount: 3
    })
    expect(result).toHaveProperty('slots')
    expect(result).toHaveProperty('totalBP')
    expect(result).toHaveProperty('budgetBP')
    expect(result).toHaveProperty('tier')
    expect(result).toHaveProperty('theme')
  })

  it('ajuste le budget selon la difficulte', () => {
    const easy = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: null,
      difficulty: 'easy',
      pcCount: 3
    })
    const hard = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: null,
      difficulty: 'hard',
      pcCount: 3
    })
    expect(easy.budgetBP).toBeLessThan(hard.budgetBP)
  })

  it('retourne un resultat vide si aucun adversaire ne correspond', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 4,
      theme: 'dragon',
      difficulty: 'standard',
      pcCount: 3
    })
    expect(result.slots).toHaveLength(0)
    expect(result.totalBP).toBe(0)
  })
})
