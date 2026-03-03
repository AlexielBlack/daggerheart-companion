import { describe, it, expect } from 'vitest'
import {
  buildDefaults,
  mergeWithDefaults,
  useFormSchema
} from '../core/composables/useFormSchema.js'
import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

const testSchema = {
  key: 'test',
  label: 'Test',
  storageKey: 'homebrew-test',
  fields: [
    { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true },
    { key: 'tier', type: FIELD_TYPES.SELECT, label: 'Tier', options: [1, 2, 3, 4], defaultValue: 1 },
    { key: 'hp', type: FIELD_TYPES.NUMBER, label: 'HP', defaultValue: 5 },
    { key: 'active', type: FIELD_TYPES.BOOLEAN, label: 'Actif' },
    { key: 'motives', type: FIELD_TYPES.TAGS, label: 'Motifs' },
    {
      key: 'thresholds',
      type: FIELD_TYPES.GROUP,
      label: 'Seuils',
      children: [
        { key: 'major', type: FIELD_TYPES.NUMBER, label: 'Majeur', defaultValue: 7 },
        { key: 'severe', type: FIELD_TYPES.NUMBER, label: 'Severe', defaultValue: 12 }
      ]
    },
    {
      key: 'experiences',
      type: FIELD_TYPES.ARRAY,
      label: 'Experiences',
      itemSchema: {
        fields: [
          { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom' },
          { key: 'modifier', type: FIELD_TYPES.NUMBER, label: 'Mod' }
        ]
      }
    }
  ]
}

describe('buildDefaults', () => {
  it('construit un objet de valeurs par defaut', () => {
    const defaults = buildDefaults(testSchema.fields)

    expect(defaults.name).toBe('')
    expect(defaults.tier).toBe(1)
    expect(defaults.hp).toBe(5)
    expect(defaults.active).toBe(false)
    expect(defaults.motives).toEqual([])
    expect(defaults.thresholds).toEqual({ major: 7, severe: 12 })
    expect(defaults.experiences).toEqual([])
  })

  it('retourne un objet vide pour un tableau vide', () => {
    expect(buildDefaults([])).toEqual({})
  })

  it('retourne un objet vide pour une entree non-tableau', () => {
    expect(buildDefaults(null)).toEqual({})
    expect(buildDefaults(undefined)).toEqual({})
  })
})

describe('mergeWithDefaults', () => {
  it('fusionne les donnees existantes avec les defauts', () => {
    const data = { name: 'Dragon', hp: 10 }
    const merged = mergeWithDefaults(data, testSchema.fields)

    expect(merged.name).toBe('Dragon')
    expect(merged.hp).toBe(10)
    expect(merged.tier).toBe(1) // defaut
    expect(merged.thresholds).toEqual({ major: 7, severe: 12 }) // defaut
  })

  it('fusionne recursivement les groupes', () => {
    const data = { name: 'Test', thresholds: { major: 20 } }
    const merged = mergeWithDefaults(data, testSchema.fields)

    expect(merged.thresholds.major).toBe(20)
    expect(merged.thresholds.severe).toBe(12) // defaut
  })

  it('retourne les defauts si data est null', () => {
    const merged = mergeWithDefaults(null, testSchema.fields)
    expect(merged.name).toBe('')
    expect(merged.tier).toBe(1)
  })

  it('ne modifie pas le tableau original', () => {
    const data = { name: 'Original', motives: ['a', 'b'] }
    const merged = mergeWithDefaults(data, testSchema.fields)
    merged.motives.push('c')
    expect(data.motives).toHaveLength(2)
  })
})

describe('useFormSchema', () => {
  describe('initialisation', () => {
    it('cree un formData avec les valeurs par defaut', () => {
      const { formData } = useFormSchema(testSchema)
      expect(formData.value.name).toBe('')
      expect(formData.value.tier).toBe(1)
      expect(formData.value.hp).toBe(5)
    })

    it('cree un formData hydrate si initialData fourni', () => {
      const { formData } = useFormSchema(testSchema, { name: 'Dragon', hp: 12 })
      expect(formData.value.name).toBe('Dragon')
      expect(formData.value.hp).toBe(12)
      expect(formData.value.tier).toBe(1) // defaut comble
    })

    it('lance une erreur si schema invalide', () => {
      expect(() => useFormSchema({})).toThrow()
      expect(() => useFormSchema({ fields: 'not-array' })).toThrow()
    })
  })

  describe('isDirty', () => {
    it('est false au demarrage', () => {
      const { isDirty } = useFormSchema(testSchema)
      expect(isDirty.value).toBe(false)
    })

    it('devient true apres modification', () => {
      const { formData, isDirty } = useFormSchema(testSchema)
      formData.value.name = 'Changed'
      expect(isDirty.value).toBe(true)
    })
  })

  describe('isEditMode', () => {
    it('est false sans initialData', () => {
      const { isEditMode } = useFormSchema(testSchema)
      expect(isEditMode.value).toBe(false)
    })

    it('est true avec initialData', () => {
      const { isEditMode } = useFormSchema(testSchema, { name: 'Edit' })
      expect(isEditMode.value).toBe(true)
    })
  })

  describe('reset', () => {
    it('reinitialise aux valeurs par defaut', () => {
      const { formData, reset, isDirty } = useFormSchema(testSchema)
      formData.value.name = 'Changed'
      expect(isDirty.value).toBe(true)

      reset()
      expect(formData.value.name).toBe('')
      expect(formData.value.tier).toBe(1)
      expect(isDirty.value).toBe(false)
    })
  })

  describe('hydrate', () => {
    it('charge de nouvelles donnees et reset le dirty', () => {
      const { formData, hydrate, isDirty } = useFormSchema(testSchema)
      hydrate({ name: 'Hydrated', hp: 20 })

      expect(formData.value.name).toBe('Hydrated')
      expect(formData.value.hp).toBe(20)
      expect(isDirty.value).toBe(false)
    })
  })

  describe('setField / getField', () => {
    it('met a jour un champ simple', () => {
      const { setField, getField } = useFormSchema(testSchema)
      setField('name', 'Updated')
      expect(getField('name')).toBe('Updated')
    })

    it('met a jour un champ imbrique', () => {
      const { setField, getField } = useFormSchema(testSchema)
      setField('thresholds.major', 25)
      expect(getField('thresholds.major')).toBe(25)
    })

    it('retourne undefined pour un chemin inexistant', () => {
      const { getField } = useFormSchema(testSchema)
      expect(getField('nonexistent.path')).toBeUndefined()
    })
  })

  describe('toRawData', () => {
    it('retourne une copie independante', () => {
      const { formData, toRawData } = useFormSchema(testSchema)
      formData.value.name = 'Original'
      const raw = toRawData()
      raw.name = 'Modified'
      expect(formData.value.name).toBe('Original')
    })
  })
})
