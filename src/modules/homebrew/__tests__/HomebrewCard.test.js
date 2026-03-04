// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomebrewCard from '../core/components/HomebrewCard.vue'

const sampleItem = {
  id: 'adv-dragon-abc123',
  name: 'Dragon de Givre',
  description: 'Un dragon redoutable qui crache de la glace.',
  tier: 3,
  type: 'Solo',
  source: 'custom',
  createdAt: '2025-01-15T10:00:00.000Z',
  updatedAt: '2025-02-20T14:30:00.000Z'
}

describe('HomebrewCard', () => {
  const mountCard = (item = sampleItem, extras = {}) => {
    return mount(HomebrewCard, {
      props: { item, ...extras }
    })
  }

  describe('rendu de base', () => {
    it('affiche le nom de l item', () => {
      const wrapper = mountCard()
      expect(wrapper.find('.homebrew-card__name').text()).toBe('Dragon de Givre')
    })

    it('affiche le badge tier', () => {
      const wrapper = mountCard()
      const badge = wrapper.find('.badge')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('T3')
      expect(badge.classes()).toContain('badge--tier3')
    })

    it('masque le badge si pas de tier', () => {
      const item = { ...sampleItem, tier: undefined }
      const wrapper = mountCard(item)
      expect(wrapper.find('.badge').exists()).toBe(false)
    })

    it('affiche le type', () => {
      const wrapper = mountCard()
      expect(wrapper.find('.homebrew-card__type').text()).toBe('Solo')
    })

    it('affiche la source custom', () => {
      const wrapper = mountCard()
      expect(wrapper.find('.homebrew-card__source').text()).toContain('Custom')
    })

    it('tronque la description longue', () => {
      const longDesc = 'A'.repeat(150)
      const item = { ...sampleItem, description: longDesc }
      const wrapper = mountCard(item)
      const desc = wrapper.find('.homebrew-card__desc').text()
      expect(desc.length).toBeLessThan(longDesc.length)
      expect(desc.endsWith('…')).toBe(true)
    })

    it('affiche la date de mise a jour', () => {
      const wrapper = mountCard()
      const date = wrapper.find('.homebrew-card__date')
      expect(date.exists()).toBe(true)
      expect(date.text()).toBeTruthy()
    })
  })

  describe('interactions', () => {
    it('emet select au clic sur la click-area', async () => {
      const wrapper = mountCard()
      await wrapper.find('.homebrew-card__click-area').trigger('click')
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')[0]).toEqual(['adv-dragon-abc123'])
    })

    it('emet select via Enter sur la click-area', async () => {
      const wrapper = mountCard()
      await wrapper.find('.homebrew-card__click-area').trigger('keydown.enter')
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('emet edit au clic sur le bouton editer', async () => {
      const wrapper = mountCard()
      const editBtn = wrapper.findAll('.homebrew-card__action-btn')[0]
      await editBtn.trigger('click')
      expect(wrapper.emitted('edit')[0]).toEqual(['adv-dragon-abc123'])
    })

    it('emet duplicate au clic', async () => {
      const wrapper = mountCard()
      const dupBtn = wrapper.findAll('.homebrew-card__action-btn')[1]
      await dupBtn.trigger('click')
      expect(wrapper.emitted('duplicate')[0]).toEqual(['adv-dragon-abc123'])
    })

    it('emet delete au clic', async () => {
      const wrapper = mountCard()
      const delBtn = wrapper.findAll('.homebrew-card__action-btn')[2]
      await delBtn.trigger('click')
      expect(wrapper.emitted('delete')[0]).toEqual(['adv-dragon-abc123'])
    })

    it('ne propage pas le clic des actions au select', async () => {
      const wrapper = mountCard()
      const editBtn = wrapper.findAll('.homebrew-card__action-btn')[0]
      await editBtn.trigger('click')
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('select')).toBeFalsy()
    })
  })

  describe('selection', () => {
    it('applique la classe selected', () => {
      const wrapper = mountCard(sampleItem, { selected: true })
      expect(wrapper.find('.homebrew-card--selected').exists()).toBe(true)
    })
  })

  describe('affichage actions', () => {
    it('masque les actions si showActions false', () => {
      const wrapper = mountCard(sampleItem, { showActions: false })
      expect(wrapper.find('.homebrew-card__actions').exists()).toBe(false)
    })
  })

  describe('accessibilite', () => {
    it('a role article', () => {
      const wrapper = mountCard()
      expect(wrapper.find('[role="article"]').exists()).toBe(true)
    })

    it('a aria-label avec le nom', () => {
      const wrapper = mountCard()
      expect(wrapper.find('[aria-label="Dragon de Givre"]').exists()).toBe(true)
    })

    it('est focusable via le bouton click-area', () => {
      const wrapper = mountCard()
      expect(wrapper.find('.homebrew-card__click-area').exists()).toBe(true)
    })

    it('les boutons d action ont des aria-labels', () => {
      const wrapper = mountCard()
      const buttons = wrapper.findAll('.homebrew-card__action-btn')
      expect(buttons[0].attributes('aria-label')).toBe('Modifier')
      expect(buttons[1].attributes('aria-label')).toBe('Dupliquer')
      expect(buttons[2].attributes('aria-label')).toBe('Supprimer')
    })
  })
})
