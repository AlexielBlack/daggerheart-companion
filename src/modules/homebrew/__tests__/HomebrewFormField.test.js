// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomebrewFormField from '../core/components/HomebrewFormField.vue'
import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

describe('HomebrewFormField', () => {
  const mountField = (field, modelValue = null, extras = {}) => {
    return mount(HomebrewFormField, {
      props: {
        field,
        modelValue,
        path: field.key,
        errors: [],
        ...extras
      }
    })
  }

  describe('TEXT', () => {
    const field = { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true, placeholder: 'Enter name' }

    it('affiche un input text avec le label', () => {
      const wrapper = mountField(field, 'Dragon')
      expect(wrapper.find('label').text()).toContain('Nom')
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('input').element.value).toBe('Dragon')
    })

    it('emet update:modelValue a la saisie', async () => {
      const wrapper = mountField(field, '')
      await wrapper.find('input').setValue('Test')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Test'])
    })

    it('affiche le marqueur requis', () => {
      const wrapper = mountField(field)
      expect(wrapper.find('.form-field__required').exists()).toBe(true)
    })

    it('utilise aria-required pour les champs requis', () => {
      const wrapper = mountField(field)
      expect(wrapper.find('input').attributes('aria-required')).toBe('true')
    })

    it('affiche le placeholder', () => {
      const wrapper = mountField(field)
      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter name')
    })
  })

  describe('TEXTAREA', () => {
    const field = { key: 'desc', type: FIELD_TYPES.TEXTAREA, label: 'Description' }

    it('affiche un textarea', () => {
      const wrapper = mountField(field, 'Some text')
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('textarea').element.value).toBe('Some text')
    })

    it('emet a la saisie', async () => {
      const wrapper = mountField(field, '')
      await wrapper.find('textarea').setValue('Updated')
      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['Updated'])
    })
  })

  describe('NUMBER', () => {
    const field = { key: 'hp', type: FIELD_TYPES.NUMBER, label: 'HP', min: 1, max: 30, integer: true }

    it('affiche un input number', () => {
      const wrapper = mountField(field, 5)
      const input = wrapper.find('input[type="number"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('min')).toBe('1')
      expect(input.attributes('max')).toBe('30')
    })

    it('emet un nombre parse', async () => {
      const wrapper = mountField(field, 5)
      const input = wrapper.find('input[type="number"]')
      await input.setValue('12')
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(typeof emitted[0][0]).toBe('number')
      expect(emitted[0][0]).toBe(12)
    })
  })

  describe('SELECT', () => {
    const field = { key: 'tier', type: FIELD_TYPES.SELECT, label: 'Tier', options: [1, 2, 3, 4], required: true }

    it('affiche un select avec les options', () => {
      const wrapper = mountField(field, 2)
      expect(wrapper.find('select').exists()).toBe(true)
      const options = wrapper.findAll('option')
      expect(options.length).toBe(4) // pas de "Choisir" car required
    })

    it('affiche "Choisir" si non requis', () => {
      const optionalField = { ...field, required: false }
      const wrapper = mountField(optionalField, null)
      const options = wrapper.findAll('option')
      expect(options.length).toBe(5) // 4 + "Choisir"
      expect(options[0].text()).toContain('Choisir')
    })

    it('emet la valeur convertie en nombre si options sont des nombres', async () => {
      const wrapper = mountField(field, 1)
      await wrapper.find('select').setValue('3')
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toBe(3)
    })
  })

  describe('BOOLEAN', () => {
    const field = { key: 'active', type: FIELD_TYPES.BOOLEAN, label: 'Actif' }

    it('affiche un checkbox', () => {
      const wrapper = mountField(field, true)
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
      expect(wrapper.find('input[type="checkbox"]').element.checked).toBe(true)
    })

    it('emet le toggle', async () => {
      const wrapper = mountField(field, false)
      await wrapper.find('input[type="checkbox"]').setValue(true)
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([true])
    })
  })

  describe('TAGS', () => {
    const field = { key: 'motives', type: FIELD_TYPES.TAGS, label: 'Motifs', maxItems: 3 }

    it('affiche les tags existants', () => {
      const wrapper = mountField(field, ['Tag1', 'Tag2'])
      const tags = wrapper.findAll('.form-field__tag')
      expect(tags.length).toBe(2)
      expect(tags[0].text()).toContain('Tag1')
    })

    it('ajoute un tag via Enter', async () => {
      const wrapper = mountField(field, ['Existing'])
      const input = wrapper.find('.form-field__tags input')
      input.element.value = 'NewTag'
      await input.trigger('keydown.enter')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual(['Existing', 'NewTag'])
    })

    it('supprime un tag', async () => {
      const wrapper = mountField(field, ['A', 'B', 'C'])
      const removeButtons = wrapper.findAll('.form-field__tag-remove')
      await removeButtons[1].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted[0][0]).toEqual(['A', 'C'])
    })
  })

  describe('GROUP', () => {
    const field = {
      key: 'thresholds',
      type: FIELD_TYPES.GROUP,
      label: 'Seuils',
      children: [
        { key: 'major', type: FIELD_TYPES.NUMBER, label: 'Majeur' },
        { key: 'severe', type: FIELD_TYPES.NUMBER, label: 'Severe' }
      ]
    }

    it('affiche un fieldset avec les sous-champs', () => {
      const wrapper = mountField(field, { major: 7, severe: 12 })
      expect(wrapper.find('fieldset').exists()).toBe(true)
      expect(wrapper.find('legend').text()).toContain('Seuils')
      // 2 sous-champs recursivement rendus
      const subFields = wrapper.findAllComponents(HomebrewFormField)
      // Le composant parent + 2 enfants
      expect(subFields.length).toBe(2)
    })

    it('emet une mise a jour du sous-champ', async () => {
      const wrapper = mountField(field, { major: 7, severe: 12 })
      const numberInputs = wrapper.findAll('input[type="number"]')
      await numberInputs[0].setValue('20')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0].major).toBe(20)
      expect(emitted[0][0].severe).toBe(12)
    })
  })

  describe('erreurs', () => {
    const field = { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true }

    it('affiche les erreurs de validation', () => {
      const wrapper = mountField(field, '', {
        errors: [{ field: 'name', message: 'Nom est requis.' }]
      })
      expect(wrapper.find('.form-field--error').exists()).toBe(true)
      expect(wrapper.find('.form-field__error-msg').text()).toBe('Nom est requis.')
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })

    it('masque les erreurs quand aucune', () => {
      const wrapper = mountField(field, 'Valid', { errors: [] })
      expect(wrapper.find('.form-field__errors').exists()).toBe(false)
    })
  })

  describe('helpText', () => {
    it('affiche le texte d aide', () => {
      const field = { key: 'test', type: FIELD_TYPES.TEXT, label: 'Test', helpText: 'Aide contextuelle' }
      const wrapper = mountField(field)
      expect(wrapper.find('.form-field__help').text()).toBe('Aide contextuelle')
    })

    it('lie aria-describedby au helpText', () => {
      const field = { key: 'test', type: FIELD_TYPES.TEXT, label: 'Test', helpText: 'Aide' }
      const wrapper = mountField(field)
      const input = wrapper.find('input')
      expect(input.attributes('aria-describedby')).toContain('help')
    })
  })
})
