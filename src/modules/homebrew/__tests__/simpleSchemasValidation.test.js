import { describe, it, expect } from 'vitest'
import { ancestrySchema } from '../schemas/ancestrySchema.js'
import { communitySchema } from '../schemas/communitySchema.js'
import { FIELD_TYPES, isValidFieldType } from '../core/utils/schemaTypes.js'
import { buildDefaults } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'

describe('ancestrySchema', () => {
  it('a les proprietes requises', () => {
    expect(ancestrySchema.key).toBe('ancestry')
    expect(ancestrySchema.label).toBe('Ascendance')
    expect(ancestrySchema.icon).toBe('🧬')
    expect(ancestrySchema.storageKey).toBe('homebrew-ancestries')
    expect(Array.isArray(ancestrySchema.fields)).toBe(true)
    expect(ancestrySchema.fields.length).toBeGreaterThan(0)
  })

  it('chaque champ a un key, type et label valides', () => {
    const checkFields = (fields) => {
      for (const field of fields) {
        expect(field.key).toBeTruthy()
        expect(field.label).toBeTruthy()
        expect(isValidFieldType(field.type)).toBe(true)
        if (field.children) {
          checkFields(field.children)
        }
      }
    }
    checkFields(ancestrySchema.fields)
  })

  it('contient les champs name, emoji, description, topFeature, bottomFeature', () => {
    const keys = ancestrySchema.fields.map((f) => f.key)
    expect(keys).toContain('name')
    expect(keys).toContain('emoji')
    expect(keys).toContain('description')
    expect(keys).toContain('topFeature')
    expect(keys).toContain('bottomFeature')
  })

  it('topFeature est un GROUP avec name et description', () => {
    const topField = ancestrySchema.fields.find((f) => f.key === 'topFeature')
    expect(topField.type).toBe(FIELD_TYPES.GROUP)
    const childKeys = topField.children.map((c) => c.key)
    expect(childKeys).toContain('name')
    expect(childKeys).toContain('description')
  })

  it('peut construire des valeurs par defaut valides', () => {
    const defaults = buildDefaults(ancestrySchema.fields)
    expect(defaults.name).toBe('')
    expect(defaults.emoji).toBe('')
    expect(defaults.description).toBe('')
    expect(defaults.topFeature).toEqual({ name: '', description: '' })
    expect(defaults.bottomFeature).toEqual({ name: '', description: '' })
  })

  it('valide une ascendance complete', () => {
    const data = {
      name: 'Lithborn',
      emoji: '🪨',
      description: 'Des êtres nés de la roche elle-même, solides et impassibles.',
      topFeature: {
        name: 'Stone Resilience',
        description: 'Réduisez les dégâts physiques entrants de 3 en marquant 2 Stress.'
      },
      bottomFeature: {
        name: 'Tremor Sense',
        description: 'Sentez les vibrations du sol et détectez les créatures à portée Proche.'
      }
    }
    const result = validateHomebrewData(data, ancestrySchema)
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('rejette une ascendance sans nom', () => {
    const data = {
      name: '',
      description: 'Une description valide pour cette ascendance.',
      topFeature: { name: 'Feat', description: 'Description de la feature haute.' },
      bottomFeature: { name: 'Feat2', description: 'Description de la feature basse.' }
    }
    const result = validateHomebrewData(data, ancestrySchema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'name')).toBe(true)
  })
})

describe('communitySchema', () => {
  it('a les proprietes requises', () => {
    expect(communitySchema.key).toBe('community')
    expect(communitySchema.label).toBe('Communauté')
    expect(communitySchema.icon).toBe('🏘️')
    expect(communitySchema.storageKey).toBe('homebrew-communities')
    expect(Array.isArray(communitySchema.fields)).toBe(true)
    expect(communitySchema.fields.length).toBeGreaterThan(0)
  })

  it('chaque champ a un key, type et label valides', () => {
    const checkFields = (fields) => {
      for (const field of fields) {
        expect(field.key).toBeTruthy()
        expect(field.label).toBeTruthy()
        expect(isValidFieldType(field.type)).toBe(true)
        if (field.children) {
          checkFields(field.children)
        }
      }
    }
    checkFields(communitySchema.fields)
  })

  it('contient les champs name, emoji, description, feature, adjectives, flavor', () => {
    const keys = communitySchema.fields.map((f) => f.key)
    expect(keys).toContain('name')
    expect(keys).toContain('emoji')
    expect(keys).toContain('description')
    expect(keys).toContain('feature')
    expect(keys).toContain('adjectives')
    expect(keys).toContain('flavor')
  })

  it('feature est un GROUP avec name et description', () => {
    const featureField = communitySchema.fields.find((f) => f.key === 'feature')
    expect(featureField.type).toBe(FIELD_TYPES.GROUP)
    const childKeys = featureField.children.map((c) => c.key)
    expect(childKeys).toContain('name')
    expect(childKeys).toContain('description')
  })

  it('adjectives est de type TAGS', () => {
    const adjField = communitySchema.fields.find((f) => f.key === 'adjectives')
    expect(adjField.type).toBe(FIELD_TYPES.TAGS)
  })

  it('peut construire des valeurs par defaut valides', () => {
    const defaults = buildDefaults(communitySchema.fields)
    expect(defaults.name).toBe('')
    expect(defaults.feature).toEqual({ name: '', description: '' })
    expect(defaults.adjectives).toEqual([])
    expect(defaults.flavor).toBe('')
  })

  it('valide une communaute complete', () => {
    const data = {
      name: 'Duneborne',
      emoji: '🏜️',
      description: 'Communauté nomade du désert, forgée par le sable et la chaleur.',
      feature: {
        name: 'Sand Walker',
        description: 'Avantage sur les jets de survie en milieu aride et tempêtes de sable.'
      },
      adjectives: ['adaptable', 'endurant'],
      flavor: 'Je suis Duneborne, alors bien sûr que je sais survivre dans le désert.'
    }
    const result = validateHomebrewData(data, communitySchema)
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('rejette une communaute sans description', () => {
    const data = {
      name: 'Duneborne',
      description: '',
      feature: { name: 'Sand Walker', description: 'Effet mécanique de la feature.' },
      adjectives: [],
      flavor: ''
    }
    const result = validateHomebrewData(data, communitySchema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'description')).toBe(true)
  })
})
