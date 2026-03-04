// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImportExportPanel from '../core/components/ImportExportPanel.vue'

describe('ImportExportPanel', () => {
  const mountPanel = (extras = {}) => {
    return mount(ImportExportPanel, {
      props: {
        label: 'Adversaires',
        itemCount: 5,
        categoryKey: 'adversary',
        showClearAll: false,
        ...extras
      }
    })
  }

  describe('rendu de base', () => {
    it('affiche le titre Import / Export', () => {
      const wrapper = mountPanel()
      expect(wrapper.find('.import-export__title').text()).toBe('Import / Export')
    })

    it('affiche le bouton export avec le compteur', () => {
      const wrapper = mountPanel()
      const exportBtn = wrapper.findAll('.btn')[0]
      expect(exportBtn.text()).toContain('Exporter')
      expect(exportBtn.text()).toContain('5')
    })

    it('desactive export si aucun item', () => {
      const wrapper = mountPanel({ itemCount: 0 })
      const exportBtn = wrapper.findAll('.btn')[0]
      expect(exportBtn.attributes('disabled')).toBeDefined()
    })

    it('affiche le bouton import', () => {
      const wrapper = mountPanel()
      expect(wrapper.text()).toContain('Importer')
    })

    it('masque le bouton clear-all par defaut', () => {
      const wrapper = mountPanel()
      expect(wrapper.find('.import-export__clear-btn').exists()).toBe(false)
    })

    it('affiche le bouton clear-all si active', () => {
      const wrapper = mountPanel({ showClearAll: true })
      expect(wrapper.find('.import-export__clear-btn').exists()).toBe(true)
    })
  })

  describe('export', () => {
    it('emet export au clic', async () => {
      const wrapper = mountPanel()
      await wrapper.findAll('.btn')[0].trigger('click')
      expect(wrapper.emitted('export')).toBeTruthy()
    })

    it('affiche un message de succes apres export', async () => {
      const wrapper = mountPanel()
      await wrapper.findAll('.btn')[0].trigger('click')
      expect(wrapper.find('.import-export__status--success').exists()).toBe(true)
      expect(wrapper.text()).toContain('exporté')
    })
  })

  describe('import', () => {
    it('emet import a la selection d un fichier JSON', async () => {
      const wrapper = mountPanel()
      const fileInput = wrapper.find('input[type="file"]')

      // Simuler un FileReader
      const mockFile = new File(['{"test": true}'], 'data.json', { type: 'application/json' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })

      await fileInput.trigger('change')

      // Le FileReader est async, on attend un tick
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(wrapper.emitted('import')).toBeTruthy()
    })

    it('affiche une erreur pour un fichier non-json', async () => {
      const wrapper = mountPanel()
      const fileInput = wrapper.find('input[type="file"]')

      const mockFile = new File(['data'], 'data.txt', { type: 'text/plain' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [mockFile],
        writable: false
      })

      await fileInput.trigger('change')
      expect(wrapper.find('.import-export__status--error').exists()).toBe(true)
      expect(wrapper.text()).toContain('invalide')
    })
  })

  describe('showImportResult', () => {
    it('affiche le resultat de succes', async () => {
      const wrapper = mountPanel()
      wrapper.vm.showImportResult({ success: true, imported: 3, skipped: 1 })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.import-export__status--success').exists()).toBe(true)
      expect(wrapper.text()).toContain('3')
      expect(wrapper.text()).toContain('1')
    })

    it('affiche le resultat d erreur', async () => {
      const wrapper = mountPanel()
      wrapper.vm.showImportResult({ success: false, error: 'Format invalide' })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.import-export__status--error').exists()).toBe(true)
      expect(wrapper.text()).toContain('Format invalide')
    })
  })

  describe('suppression totale', () => {
    it('demande confirmation avant clear-all', async () => {
      const wrapper = mountPanel({ showClearAll: true })
      await wrapper.find('.import-export__clear-btn').trigger('click')
      expect(wrapper.find('.import-export__confirm').exists()).toBe(true)
      expect(wrapper.text()).toContain('irréversible')
    })

    it('emet clear-all a la confirmation', async () => {
      const wrapper = mountPanel({ showClearAll: true })
      await wrapper.find('.import-export__clear-btn').trigger('click')
      await wrapper.find('.btn--danger').trigger('click')
      expect(wrapper.emitted('clear-all')).toBeTruthy()
    })

    it('annule la confirmation', async () => {
      const wrapper = mountPanel({ showClearAll: true })
      await wrapper.find('.import-export__clear-btn').trigger('click')
      expect(wrapper.find('.import-export__confirm').exists()).toBe(true)

      // Bouton annuler dans la confirmation
      const cancelBtn = wrapper.findAll('.import-export__confirm-actions .btn')[1]
      await cancelBtn.trigger('click')
      expect(wrapper.find('.import-export__confirm').exists()).toBe(false)
      expect(wrapper.emitted('clear-all')).toBeFalsy()
    })
  })

  describe('messages ephemeres', () => {
    it('le message disparait apres un delai', async () => {
      vi.useFakeTimers()
      const wrapper = mountPanel()
      await wrapper.findAll('.btn')[0].trigger('click')
      expect(wrapper.find('.import-export__status').exists()).toBe(true)

      vi.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.import-export__status').exists()).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('accessibilite', () => {
    it('a role region avec aria-label', () => {
      const wrapper = mountPanel()
      expect(wrapper.find('[role="region"]').attributes('aria-label')).toContain('Adversaires')
    })

    it('la confirmation a role alertdialog', async () => {
      const wrapper = mountPanel({ showClearAll: true })
      await wrapper.find('.import-export__clear-btn').trigger('click')
      expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    })

    it('les messages ont role alert', async () => {
      const wrapper = mountPanel()
      await wrapper.findAll('.btn')[0].trigger('click')
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })
  })
})
