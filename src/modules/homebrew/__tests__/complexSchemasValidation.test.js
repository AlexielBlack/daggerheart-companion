import { describe, it, expect } from 'vitest'
import { classSchema, AVAILABLE_DOMAINS, CLASS_EMOJIS, TRAIT_KEYS } from '../schemas/classSchema.js'
import { domainSchema, CARD_TYPES, CARD_LEVELS, DOMAIN_COLORS } from '../schemas/domainSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'

// ── Helpers ──────────────────────────────────────────────
const validClass = {
  name: 'Psion',
  description: 'Un guerrier psychique qui manipule les esprits.',
  domains: ['Arcana', 'Sage'],
  baseEvasion: 11,
  baseHP: 5,
  baseStress: 6,
  hopeFeature: 'Dépensez 3 Hope pour projeter une onde psychique.',
  classFeatures: [{ name: 'Télékinésie', description: 'Déplacez un objet à distance.' }],
  suggestedTraits: { agility: 0, strength: -1, finesse: 0, instinct: 1, presence: 2, knowledge: 1 }
}

const validDomain = {
  name: 'Forge',
  description: 'Le domaine du feu et de la création.',
  hasSpells: true,
  cards: [
    { name: 'Flamme', level: 1, type: 'spell', recallCost: 1, feature: 'Lancez une flamme qui inflige 1d8.' }
  ]
}

// ── classSchema ──────────────────────────────────────────
describe('classSchema', () => {
  it('a les métadonnées correctes', () => {
    expect(classSchema.key).toBe('class')
    expect(classSchema.label).toBe('Classe')
    expect(classSchema.storageKey).toBe('homebrew-classes')
    expect(classSchema.icon).toBe('⚔️')
  })

  it('contient les champs obligatoires', () => {
    const keys = classSchema.fields.map((f) => f.key)
    expect(keys).toContain('name')
    expect(keys).toContain('description')
    expect(keys).toContain('domains')
    expect(keys).toContain('baseEvasion')
    expect(keys).toContain('baseHP')
    expect(keys).toContain('baseStress')
    expect(keys).toContain('hopeFeature')
    expect(keys).toContain('classFeatures')
    expect(keys).toContain('suggestedTraits')
  })

  it('contient les champs optionnels', () => {
    const keys = classSchema.fields.map((f) => f.key)
    expect(keys).toContain('emoji')
    expect(keys).toContain('suggestedArmor')
    expect(keys).toContain('classItems')
  })

  it('exporte les 9 domaines SRD', () => {
    expect(AVAILABLE_DOMAINS).toHaveLength(9)
    expect(AVAILABLE_DOMAINS).toContain('Arcana')
    expect(AVAILABLE_DOMAINS).toContain('Valor')
  })

  it('exporte les emojis de classe', () => {
    expect(CLASS_EMOJIS.length).toBeGreaterThan(5)
  })

  it('exporte les 6 clés de trait', () => {
    expect(TRAIT_KEYS).toEqual(['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'])
  })

  it('le champ domains requiert exactement 2', () => {
    const domainsField = classSchema.fields.find((f) => f.key === 'domains')
    expect(domainsField.minItems).toBe(2)
    expect(domainsField.maxItems).toBe(2)
  })

  it('evasion a les bornes correctes', () => {
    const field = classSchema.fields.find((f) => f.key === 'baseEvasion')
    expect(field.min).toBe(7)
    expect(field.max).toBe(14)
    expect(field.integer).toBe(true)
  })

  it('HP a les bornes correctes', () => {
    const field = classSchema.fields.find((f) => f.key === 'baseHP')
    expect(field.min).toBe(3)
    expect(field.max).toBe(10)
  })

  it('suggestedTraits a 6 children', () => {
    const group = classSchema.fields.find((f) => f.key === 'suggestedTraits')
    expect(group.children).toHaveLength(6)
    expect(group.children.map((c) => c.key)).toEqual(TRAIT_KEYS)
  })

  it('valide une classe complète', () => {
    const result = validateHomebrewData(validClass, classSchema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejette une classe sans nom', () => {
    const data = { ...validClass, name: '' }
    const result = validateHomebrewData(data, classSchema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'name')).toBe(true)
  })

  it('rejette une classe sans description', () => {
    const data = { ...validClass, description: '' }
    const result = validateHomebrewData(data, classSchema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'description')).toBe(true)
  })

  it('rejette une hopeFeature trop courte', () => {
    const data = { ...validClass, hopeFeature: 'Court' }
    const result = validateHomebrewData(data, classSchema)
    expect(result.valid).toBe(false)
  })
})

// ── domainSchema ─────────────────────────────────────────
describe('domainSchema', () => {
  it('a les métadonnées correctes', () => {
    expect(domainSchema.key).toBe('domain')
    expect(domainSchema.label).toBe('Domaine')
    expect(domainSchema.storageKey).toBe('homebrew-domains')
    expect(domainSchema.icon).toBe('🃏')
  })

  it('contient les champs obligatoires', () => {
    const keys = domainSchema.fields.map((f) => f.key)
    expect(keys).toContain('name')
    expect(keys).toContain('description')
    expect(keys).toContain('cards')
    expect(keys).toContain('hasSpells')
  })

  it('contient les champs optionnels', () => {
    const keys = domainSchema.fields.map((f) => f.key)
    expect(keys).toContain('emoji')
    expect(keys).toContain('color')
    expect(keys).toContain('classes')
    expect(keys).toContain('themes')
  })

  it('exporte les types de cartes', () => {
    expect(CARD_TYPES).toEqual(['ability', 'spell', 'grimoire'])
  })

  it('exporte les niveaux 1-10', () => {
    expect(CARD_LEVELS).toHaveLength(10)
    expect(CARD_LEVELS[0]).toBe(1)
    expect(CARD_LEVELS[9]).toBe(10)
  })

  it('exporte les couleurs', () => {
    expect(DOMAIN_COLORS.length).toBeGreaterThan(5)
    expect(DOMAIN_COLORS[0]).toMatch(/^#/)
  })

  it('les cartes ont le bon itemSchema', () => {
    const cardsField = domainSchema.fields.find((f) => f.key === 'cards')
    const cardKeys = cardsField.itemSchema.fields.map((f) => f.key)
    expect(cardKeys).toContain('name')
    expect(cardKeys).toContain('level')
    expect(cardKeys).toContain('type')
    expect(cardKeys).toContain('recallCost')
    expect(cardKeys).toContain('feature')
  })

  it('recallCost bornes 0-5', () => {
    const cardsField = domainSchema.fields.find((f) => f.key === 'cards')
    const costField = cardsField.itemSchema.fields.find((f) => f.key === 'recallCost')
    expect(costField.min).toBe(0)
    expect(costField.max).toBe(5)
  })

  it('valide un domaine complet', () => {
    const result = validateHomebrewData(validDomain, domainSchema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejette un domaine sans nom', () => {
    const data = { ...validDomain, name: '' }
    const result = validateHomebrewData(data, domainSchema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'name')).toBe(true)
  })

  it('rejette un domaine sans description', () => {
    const data = { ...validDomain, description: '' }
    const result = validateHomebrewData(data, domainSchema)
    expect(result.valid).toBe(false)
  })
})
