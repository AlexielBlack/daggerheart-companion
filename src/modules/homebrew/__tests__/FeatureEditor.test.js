// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FeatureEditor from '../core/components/FeatureEditor.vue'

describe('FeatureEditor', () => {
  const mountEditor = (modelValue = [], extras = {}) => {
    return mount(FeatureEditor, {
      props: {
        modelValue,
        label: 'Features',
        path: 'features',
        errors: [],
        ...extras
      }
    })
  }

  describe('etat initial', () => {
    it('affiche le message vide sans features', () => {
      const wrapper = mountEditor([])
      expect(wrapper.find('.feature-editor__empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('Aucune feature')
    })

    it('affiche les features existantes', () => {
      const features = [
        { name: 'Charge', activationType: 'action', description: 'Charge en avant.', cost: '' },
        { name: 'Armure', activationType: 'passive', description: 'Reduit les degats.', cost: '' }
      ]
      const wrapper = mountEditor(features)
      const items = wrapper.findAll('.feature-editor__item')
      expect(items.length).toBe(2)
    })

    it('affiche le label', () => {
      const wrapper = mountEditor([], { label: 'Capacités' })
      expect(wrapper.find('.feature-editor__title').text()).toBe('Capacités')
    })
  })

  describe('ajout', () => {
    it('ajoute une feature vide', async () => {
      const wrapper = mountEditor([])
      await wrapper.find('.feature-editor__header .btn').trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0].length).toBe(1)
      expect(emitted[0][0][0].activationType).toBe('action')
      expect(emitted[0][0][0].name).toBe('')
    })

    it('desactive le bouton au maxItems', () => {
      const features = [
        { name: 'A', activationType: 'action', description: 'Desc', cost: '' },
        { name: 'B', activationType: 'passive', description: 'Desc', cost: '' }
      ]
      const wrapper = mountEditor(features, { maxItems: 2 })
      const addBtn = wrapper.find('.feature-editor__header .btn')
      expect(addBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('suppression', () => {
    it('supprime une feature', async () => {
      const features = [
        { name: 'A', activationType: 'action', description: 'Desc A', cost: '' },
        { name: 'B', activationType: 'passive', description: 'Desc B', cost: '' }
      ]
      const wrapper = mountEditor(features)
      const removeButtons = wrapper.findAll('.feature-editor__remove-btn')
      await removeButtons[0].trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted[0][0].length).toBe(1)
      expect(emitted[0][0][0].name).toBe('B')
    })
  })

  describe('edition', () => {
    it('met a jour le nom d une feature', async () => {
      const features = [
        { name: 'Original', activationType: 'action', description: 'Desc', cost: '' }
      ]
      const wrapper = mountEditor(features)
      const nameInput = wrapper.find('input[placeholder="Ex: Charge furieuse"]')
      await nameInput.setValue('Updated')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted[0][0][0].name).toBe('Updated')
    })

    it('met a jour le type d une feature', async () => {
      const features = [
        { name: 'Test', activationType: 'action', description: 'Desc', cost: '' }
      ]
      const wrapper = mountEditor(features)
      const select = wrapper.find('.feature-editor__select')
      await select.setValue('reaction')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted[0][0][0].activationType).toBe('reaction')
    })
  })

  describe('reordonnement', () => {
    it('deplace une feature vers le bas', async () => {
      const features = [
        { name: 'First', activationType: 'action', description: 'D1', cost: '' },
        { name: 'Second', activationType: 'passive', description: 'D2', cost: '' }
      ]
      const wrapper = mountEditor(features)
      // Le bouton ↓ du premier item
      const downButton = wrapper.findAll('.feature-editor__move-btn')[0]
      await downButton.trigger('click')

      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted[0][0][0].name).toBe('Second')
      expect(emitted[0][0][1].name).toBe('First')
    })
  })

  describe('bordure couleur par type', () => {
    it('applique la classe action', () => {
      const wrapper = mountEditor([
        { name: 'Test', activationType: 'action', description: 'Desc', cost: '' }
      ])
      expect(wrapper.find('.feature-editor__item--action').exists()).toBe(true)
    })

    it('applique la classe reaction', () => {
      const wrapper = mountEditor([
        { name: 'Test', activationType: 'reaction', description: 'Desc', cost: '' }
      ])
      expect(wrapper.find('.feature-editor__item--reaction').exists()).toBe(true)
    })

    it('applique la classe passive', () => {
      const wrapper = mountEditor([
        { name: 'Test', activationType: 'passive', description: 'Desc', cost: '' }
      ])
      expect(wrapper.find('.feature-editor__item--passive').exists()).toBe(true)
    })
  })

  describe('erreurs', () => {
    it('affiche les erreurs d une feature', () => {
      const features = [
        { name: '', activationType: 'action', description: '', cost: '' }
      ]
      const errors = [
        { field: 'features[0].name', message: 'Le nom est requis.' }
      ]
      const wrapper = mountEditor(features, { errors })
      expect(wrapper.find('.feature-editor__error-msg').text()).toBe('Le nom est requis.')
    })

    it('marque le champ en erreur avec aria-invalid', () => {
      const features = [
        { name: '', activationType: 'action', description: 'Desc', cost: '' }
      ]
      const errors = [
        { field: 'features[0].name', message: 'Requis' }
      ]
      const wrapper = mountEditor(features, { errors })
      const nameInput = wrapper.find('input[placeholder="Ex: Charge furieuse"]')
      expect(nameInput.attributes('aria-invalid')).toBe('true')
    })
  })

  describe('accessibilite', () => {
    it('a un role region avec aria-label', () => {
      const wrapper = mountEditor([], { label: 'Features' })
      expect(wrapper.find('[role="region"]').attributes('aria-label')).toBe('Éditeur de Features')
    })

    it('les items ont role listitem', () => {
      const features = [
        { name: 'Test', activationType: 'action', description: 'Desc', cost: '' }
      ]
      const wrapper = mountEditor(features)
      expect(wrapper.find('[role="listitem"]').exists()).toBe(true)
    })

    it('les boutons ont des aria-labels', () => {
      const features = [
        { name: 'Test', activationType: 'action', description: 'Desc', cost: '' }
      ]
      const wrapper = mountEditor(features)
      expect(wrapper.find('.feature-editor__remove-btn').attributes('aria-label')).toContain('Supprimer')
    })
  })
})
