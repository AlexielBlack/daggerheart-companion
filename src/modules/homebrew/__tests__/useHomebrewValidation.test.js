import { describe, it, expect } from 'vitest'
import {
  validateHomebrewData,
  getFieldErrors
} from '../core/composables/useHomebrewValidation.js'
import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

/** Schema minimal pour les tests */
const minimalSchema = {
  key: 'test',
  fields: [
    { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true, minLength: 2 },
    { key: 'level', type: FIELD_TYPES.NUMBER, label: 'Niveau', min: 1, max: 10, integer: true },
    { key: 'type', type: FIELD_TYPES.SELECT, label: 'Type', options: ['A', 'B', 'C'] }
  ]
}

/** Schema avec champs imbriques */
const nestedSchema = {
  key: 'nested',
  fields: [
    { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true },
    {
      key: 'stats',
      type: FIELD_TYPES.GROUP,
      label: 'Stats',
      required: true,
      children: [
        { key: 'hp', type: FIELD_TYPES.NUMBER, label: 'HP', required: true, min: 1 },
        { key: 'stress', type: FIELD_TYPES.NUMBER, label: 'Stress', min: 0 }
      ]
    },
    {
      key: 'tags',
      type: FIELD_TYPES.TAGS,
      label: 'Tags',
      minItems: 1,
      maxItems: 3
    },
    {
      key: 'items',
      type: FIELD_TYPES.ARRAY,
      label: 'Items',
      itemSchema: {
        fields: [
          { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true },
          { key: 'value', type: FIELD_TYPES.NUMBER, label: 'Valeur', min: 0 }
        ]
      }
    },
    {
      key: 'features',
      type: FIELD_TYPES.FEATURES,
      label: 'Features'
    }
  ]
}

describe('validateHomebrewData', () => {
  describe('validation basique (scalaires)', () => {
    it('valide des donnees correctes', () => {
      const result = validateHomebrewData(
        { name: 'Dragon', level: 5, type: 'A' },
        minimalSchema
      )
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('detecte un champ requis manquant', () => {
      const result = validateHomebrewData(
        { name: '', level: 5 },
        minimalSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'name')).toBe(true)
    })

    it('detecte un texte trop court (minLength)', () => {
      const result = validateHomebrewData(
        { name: 'A', level: 5 },
        minimalSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'name')).toBe(true)
    })

    it('detecte un nombre hors limites (min/max)', () => {
      const result = validateHomebrewData(
        { name: 'Test', level: 15 },
        minimalSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'level')).toBe(true)
    })

    it('detecte un nombre non entier quand integer: true', () => {
      const result = validateHomebrewData(
        { name: 'Test', level: 3.5 },
        minimalSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'level')).toBe(true)
    })

    it('detecte une valeur SELECT non autorisee', () => {
      const result = validateHomebrewData(
        { name: 'Test', type: 'Z' },
        minimalSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'type')).toBe(true)
    })

    it('accepte un champ optionnel absent', () => {
      const result = validateHomebrewData(
        { name: 'Test' },
        minimalSchema
      )
      expect(result.valid).toBe(true)
    })
  })

  describe('validation GROUP', () => {
    it('valide un groupe correct', () => {
      const result = validateHomebrewData(
        { name: 'Test', stats: { hp: 5, stress: 2 }, tags: ['a'], items: [], features: [] },
        nestedSchema
      )
      expect(result.valid).toBe(true)
    })

    it('detecte un sous-champ requis manquant dans un groupe', () => {
      const result = validateHomebrewData(
        { name: 'Test', stats: { stress: 2 } },
        nestedSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'stats.hp')).toBe(true)
    })

    it('detecte un groupe requis absent', () => {
      const result = validateHomebrewData(
        { name: 'Test' },
        nestedSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'stats')).toBe(true)
    })
  })

  describe('validation TAGS', () => {
    it('detecte un nombre de tags insuffisant (minItems)', () => {
      const result = validateHomebrewData(
        { name: 'Test', stats: { hp: 5 }, tags: [] },
        nestedSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'tags')).toBe(true)
    })

    it('detecte trop de tags (maxItems)', () => {
      const result = validateHomebrewData(
        { name: 'Test', stats: { hp: 5 }, tags: ['a', 'b', 'c', 'd'] },
        nestedSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'tags')).toBe(true)
    })
  })

  describe('validation ARRAY', () => {
    it('valide un tableau avec items corrects', () => {
      const result = validateHomebrewData(
        {
          name: 'Test',
          stats: { hp: 5 },
          tags: ['a'],
          items: [{ name: 'Epee', value: 10 }],
          features: []
        },
        nestedSchema
      )
      expect(result.valid).toBe(true)
    })

    it('detecte une erreur dans un item du tableau', () => {
      const result = validateHomebrewData(
        {
          name: 'Test',
          stats: { hp: 5 },
          tags: ['a'],
          items: [{ name: '', value: 10 }]
        },
        nestedSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'items[0].name')).toBe(true)
    })
  })

  describe('validation FEATURES', () => {
    it('valide des features correctes', () => {
      const result = validateHomebrewData(
        {
          name: 'Test',
          stats: { hp: 5 },
          tags: ['a'],
          items: [],
          features: [
            { name: 'Charge', type: 'action', description: 'Charge en avant.' }
          ]
        },
        nestedSchema
      )
      expect(result.valid).toBe(true)
    })

    it('detecte une feature sans nom', () => {
      const result = validateHomebrewData(
        {
          name: 'Test',
          stats: { hp: 5 },
          tags: ['a'],
          items: [],
          features: [
            { name: '', type: 'action', description: 'Desc' }
          ]
        },
        nestedSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'features[0].name')).toBe(true)
    })

    it('detecte une feature avec type invalide', () => {
      const result = validateHomebrewData(
        {
          name: 'Test',
          stats: { hp: 5 },
          tags: ['a'],
          items: [],
          features: [
            { name: 'Test', type: 'invalid', description: 'Desc' }
          ]
        },
        nestedSchema
      )
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'features[0].type')).toBe(true)
    })
  })

  describe('cas limites', () => {
    it('rejette un schema sans fields', () => {
      const result = validateHomebrewData({}, { key: 'bad' })
      expect(result.valid).toBe(false)
    })

    it('rejette des donnees null', () => {
      const result = validateHomebrewData(null, minimalSchema)
      expect(result.valid).toBe(false)
    })
  })
})

describe('getFieldErrors', () => {
  it('filtre les erreurs par chemin exact', () => {
    const errors = [
      { field: 'name', message: 'requis' },
      { field: 'stats.hp', message: 'min' },
      { field: 'stats.stress', message: 'max' }
    ]
    expect(getFieldErrors(errors, 'name')).toHaveLength(1)
  })

  it('inclut les erreurs des sous-champs', () => {
    const errors = [
      { field: 'stats.hp', message: 'min' },
      { field: 'stats.stress', message: 'max' },
      { field: 'name', message: 'requis' }
    ]
    expect(getFieldErrors(errors, 'stats')).toHaveLength(2)
  })

  it('inclut les erreurs des items de tableau', () => {
    const errors = [
      { field: 'features[0].name', message: 'requis' },
      { field: 'features[1].type', message: 'invalide' },
      { field: 'name', message: 'requis' }
    ]
    expect(getFieldErrors(errors, 'features')).toHaveLength(2)
  })

  it('retourne un tableau vide pour une entree invalide', () => {
    expect(getFieldErrors(null, 'name')).toEqual([])
    expect(getFieldErrors(undefined, 'name')).toEqual([])
  })
})
