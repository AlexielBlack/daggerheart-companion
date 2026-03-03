import { describe, it, expect } from 'vitest'
import {
  FIELD_TYPES,
  SCALAR_TYPES,
  COMPOSITE_TYPES,
  getDefaultForType,
  isValidFieldType
} from '../core/utils/schemaTypes.js'

describe('schemaTypes', () => {
  describe('FIELD_TYPES', () => {
    it('contient tous les types attendus', () => {
      const expected = [
        'text', 'textarea', 'number', 'select', 'multi_select',
        'boolean', 'tags', 'group', 'array', 'features'
      ]
      const values = Object.values(FIELD_TYPES)
      for (const type of expected) {
        expect(values).toContain(type)
      }
    })

    it('est immuable (frozen)', () => {
      expect(() => { FIELD_TYPES.NEW_TYPE = 'new' }).toThrow()
    })
  })

  describe('SCALAR_TYPES / COMPOSITE_TYPES', () => {
    it('les types scalaires ne chevauchent pas les composites', () => {
      for (const type of SCALAR_TYPES) {
        expect(COMPOSITE_TYPES.has(type)).toBe(false)
      }
    })

    it('ensemble complet : chaque FIELD_TYPE est scalaire ou composite', () => {
      for (const type of Object.values(FIELD_TYPES)) {
        const isScalar = SCALAR_TYPES.has(type)
        const isComposite = COMPOSITE_TYPES.has(type)
        expect(isScalar || isComposite).toBe(true)
      }
    })
  })

  describe('getDefaultForType', () => {
    it('retourne une chaine vide pour TEXT et TEXTAREA', () => {
      expect(getDefaultForType(FIELD_TYPES.TEXT)).toBe('')
      expect(getDefaultForType(FIELD_TYPES.TEXTAREA)).toBe('')
    })

    it('retourne 0 pour NUMBER', () => {
      expect(getDefaultForType(FIELD_TYPES.NUMBER)).toBe(0)
    })

    it('retourne null pour SELECT', () => {
      expect(getDefaultForType(FIELD_TYPES.SELECT)).toBeNull()
    })

    it('retourne un tableau vide pour MULTI_SELECT, TAGS, ARRAY, FEATURES', () => {
      expect(getDefaultForType(FIELD_TYPES.MULTI_SELECT)).toEqual([])
      expect(getDefaultForType(FIELD_TYPES.TAGS)).toEqual([])
      expect(getDefaultForType(FIELD_TYPES.ARRAY)).toEqual([])
      expect(getDefaultForType(FIELD_TYPES.FEATURES)).toEqual([])
    })

    it('retourne false pour BOOLEAN', () => {
      expect(getDefaultForType(FIELD_TYPES.BOOLEAN)).toBe(false)
    })

    it('retourne un objet vide pour GROUP', () => {
      expect(getDefaultForType(FIELD_TYPES.GROUP)).toEqual({})
    })

    it('retourne null pour un type inconnu', () => {
      expect(getDefaultForType('unknown')).toBeNull()
    })
  })

  describe('isValidFieldType', () => {
    it('reconnait tous les types valides', () => {
      for (const type of Object.values(FIELD_TYPES)) {
        expect(isValidFieldType(type)).toBe(true)
      }
    })

    it('rejette les types inconnus', () => {
      expect(isValidFieldType('unknown')).toBe(false)
      expect(isValidFieldType('')).toBe(false)
      expect(isValidFieldType(null)).toBe(false)
    })
  })
})
