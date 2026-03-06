// @vitest-environment happy-dom
/**
 * Tests pour le composant EncounterSharePanel.
 * Verifie le rendu, les boutons export/copier, la validation d'import,
 * les messages de statut et l'accessibilite ARIA.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EncounterSharePanel from '../components/EncounterSharePanel.vue'

const VALID_ENCOUNTER = {
  name: 'Embuscade forestiere',
  adversarySlots: [{ id: 'slot-1', adversaryId: 'goblin' }],
  pcCount: 4,
  tier: 1
}

const mountPanel = (props = {}) => mount(EncounterSharePanel, {
  props: {
    encounterData: { ...VALID_ENCOUNTER },
    isValid: true,
    ...props
  }
})

describe('EncounterSharePanel', () => {
  let wrapper

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // -----------------------------------------------------------
  // 1. Rendu initial avec props par defaut
  // -----------------------------------------------------------
  describe('rendu initial', () => {
    it('affiche le panneau avec les props par defaut', () => {
      wrapper = mount(EncounterSharePanel)
      expect(wrapper.find('.share-panel').exists()).toBe(true)
    })

    it('contient un bouton exporter, un label importer et un bouton copier', () => {
      wrapper = mountPanel()
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(2)
      expect(buttons[0].text()).toContain('Exporter')
      expect(buttons[1].text()).toContain('Copier')
      const label = wrapper.find('.share-panel__import-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('Importer')
    })
  })

  // -----------------------------------------------------------
  // 2. Bouton export desactive quand isValid=false
  // -----------------------------------------------------------
  it('desactive le bouton exporter quand isValid est false', () => {
    wrapper = mountPanel({ isValid: false })
    const exportBtn = wrapper.findAll('button')[0]
    expect(exportBtn.attributes('disabled')).toBeDefined()
  })

  // -----------------------------------------------------------
  // 3. Bouton export active quand isValid=true
  // -----------------------------------------------------------
  it('active le bouton exporter quand isValid est true', () => {
    wrapper = mountPanel({ isValid: true })
    const exportBtn = wrapper.findAll('button')[0]
    expect(exportBtn.attributes('disabled')).toBeUndefined()
  })

  // -----------------------------------------------------------
  // 4. Bouton copier desactive quand isValid=false
  // -----------------------------------------------------------
  it('desactive le bouton copier quand isValid est false', () => {
    wrapper = mountPanel({ isValid: false })
    const copyBtn = wrapper.findAll('button')[1]
    expect(copyBtn.attributes('disabled')).toBeDefined()
  })

  // -----------------------------------------------------------
  // 5. validateAndImport rejette JSON invalide
  // -----------------------------------------------------------
  describe('validateAndImport — validation', () => {
    beforeEach(() => {
      wrapper = mountPanel()
    })

    it('rejette du JSON invalide', () => {
      const result = wrapper.vm.validateAndImport('ceci nest pas du json')
      expect(result.success).toBe(false)
      expect(result.error).toBe('JSON invalide.')
    })

    // -----------------------------------------------------------
    // 6. validateAndImport rejette donnees sans adversarySlots
    // -----------------------------------------------------------
    it('rejette des donnees sans adversarySlots', () => {
      const data = JSON.stringify({ pcCount: 4, tier: 1 })
      const result = wrapper.vm.validateAndImport(data)
      expect(result.success).toBe(false)
      expect(result.error).toContain('adversarySlots')
    })

    // -----------------------------------------------------------
    // 7. validateAndImport rejette pcCount hors limites
    // -----------------------------------------------------------
    it('rejette pcCount inferieur a 2', () => {
      const data = JSON.stringify({ adversarySlots: [], pcCount: 1, tier: 2 })
      const result = wrapper.vm.validateAndImport(data)
      expect(result.success).toBe(false)
      expect(result.error).toContain('PJ')
    })

    it('rejette pcCount superieur a 8', () => {
      const data = JSON.stringify({ adversarySlots: [], pcCount: 10, tier: 2 })
      const result = wrapper.vm.validateAndImport(data)
      expect(result.success).toBe(false)
      expect(result.error).toContain('PJ')
    })

    // -----------------------------------------------------------
    // 8. validateAndImport rejette tier hors limites
    // -----------------------------------------------------------
    it('rejette tier inferieur a 1', () => {
      const data = JSON.stringify({ adversarySlots: [], pcCount: 4, tier: 0 })
      const result = wrapper.vm.validateAndImport(data)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Tier')
    })

    it('rejette tier superieur a 4', () => {
      const data = JSON.stringify({ adversarySlots: [], pcCount: 4, tier: 5 })
      const result = wrapper.vm.validateAndImport(data)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Tier')
    })

    // -----------------------------------------------------------
    // 9. validateAndImport accepte donnees valides et emet 'import'
    // -----------------------------------------------------------
    it('accepte des donnees valides et emet import', () => {
      const validData = { name: 'Test', adversarySlots: [], pcCount: 4, tier: 2 }
      const result = wrapper.vm.validateAndImport(JSON.stringify(validData))
      expect(result.success).toBe(true)
      expect(result.name).toBe('Test')
      expect(wrapper.emitted('import')).toBeTruthy()
      expect(wrapper.emitted('import')[0][0]).toEqual(validData)
    })
  })

  // -----------------------------------------------------------
  // 10. Message de statut affiche apres action
  // -----------------------------------------------------------
  describe('messages de statut', () => {
    it('affiche un message de statut apres setStatus', async () => {
      wrapper = mountPanel()
      wrapper.vm.setStatus('Operation reussie.', 'success')
      await wrapper.vm.$nextTick()
      const status = wrapper.find('[role="alert"]')
      expect(status.exists()).toBe(true)
      expect(status.text()).toBe('Operation reussie.')
      expect(status.classes()).toContain('share-panel__status--success')
    })

    it('efface le message de statut apres 5 secondes', async () => {
      wrapper = mountPanel()
      wrapper.vm.setStatus('Temporaire.', 'info')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="alert"]').exists()).toBe(true)

      vi.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })
  })

  // -----------------------------------------------------------
  // 11. Accessibilite: role="region" et aria-label presents
  // -----------------------------------------------------------
  describe('accessibilite', () => {
    it('le conteneur a role="region" et aria-label', () => {
      wrapper = mountPanel()
      const panel = wrapper.find('.share-panel')
      expect(panel.attributes('role')).toBe('region')
      expect(panel.attributes('aria-label')).toBe('Partage de rencontre')
    })
  })

  // -----------------------------------------------------------
  // 12. Le label import contient un input file
  // -----------------------------------------------------------
  it('le label importer contient un input file avec accept .json', () => {
    wrapper = mountPanel()
    const label = wrapper.find('.share-panel__import-label')
    const input = label.find('input[type="file"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('accept')).toContain('.json')
  })
})
