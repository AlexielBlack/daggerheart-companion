import { describe, it, expect } from 'vitest'
import {
  generateId,
  slugify,
  getCategoryFromId,
  isHomebrewId,
  CATEGORY_PREFIXES
} from '../core/utils/idGenerator.js'

describe('slugify', () => {
  it('convertit un nom simple en slug', () => {
    expect(slugify('Dragon de Givre')).toBe('dragon-de-givre')
  })

  it('supprime les accents', () => {
    expect(slugify('Elementaire du Feu')).toBe('elementaire-du-feu')
  })

  it('supprime les caracteres speciaux', () => {
    expect(slugify("L'ombre & la Lumiere!")).toBe('l-ombre-la-lumiere')
  })

  it('tronque au maxLength', () => {
    const result = slugify('Un nom extremement long pour un adversaire', 10)
    expect(result.length).toBeLessThanOrEqual(10)
  })

  it('retourne "unnamed" pour une entree vide', () => {
    expect(slugify('')).toBe('unnamed')
    expect(slugify(null)).toBe('unnamed')
    expect(slugify(undefined)).toBe('unnamed')
  })

  it('supprime les tirets en debut et fin', () => {
    expect(slugify('--test--')).toBe('test')
  })
})

describe('generateId', () => {
  it('genere un ID avec le bon prefixe', () => {
    const id = generateId('adversary', 'Dragon')
    expect(id.startsWith('adv-')).toBe(true)
  })

  it('inclut le slug du nom', () => {
    const id = generateId('adversary', 'Goblin Shaman')
    expect(id).toContain('goblin-shaman')
  })

  it('genere des IDs uniques', () => {
    const ids = new Set()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId('adversary', 'Test'))
    }
    expect(ids.size).toBe(100)
  })

  it('fonctionne pour toutes les categories', () => {
    for (const [category, prefix] of Object.entries(CATEGORY_PREFIXES)) {
      const id = generateId(category, 'Test')
      expect(id.startsWith(`${prefix}-`)).toBe(true)
    }
  })

  it('lance une erreur pour une categorie inconnue', () => {
    expect(() => generateId('invalid', 'Test')).toThrow('inconnue')
  })

  it('gere un nom vide', () => {
    const id = generateId('adversary')
    expect(id.startsWith('adv-unnamed-')).toBe(true)
  })
})

describe('getCategoryFromId', () => {
  it('retrouve la categorie depuis un ID valide', () => {
    expect(getCategoryFromId('adv-dragon-abc123')).toBe('adversary')
    expect(getCategoryFromId('env-foret-xyz789')).toBe('environment')
    expect(getCategoryFromId('cls-guerrier-def456')).toBe('class')
  })

  it('retourne null pour un ID non homebrew', () => {
    expect(getCategoryFromId('acid-burrower')).toBeNull()
    expect(getCategoryFromId('some-random-id')).toBeNull()
  })

  it('retourne null pour une entree invalide', () => {
    expect(getCategoryFromId(null)).toBeNull()
    expect(getCategoryFromId('')).toBeNull()
    expect(getCategoryFromId(42)).toBeNull()
  })
})

describe('isHomebrewId', () => {
  it('reconnait un ID homebrew', () => {
    expect(isHomebrewId('adv-dragon-abc123')).toBe(true)
    expect(isHomebrewId('env-foret-xyz789')).toBe(true)
  })

  it('rejette un ID non homebrew', () => {
    expect(isHomebrewId('acid-burrower')).toBe(false)
    expect(isHomebrewId(null)).toBe(false)
  })
})
