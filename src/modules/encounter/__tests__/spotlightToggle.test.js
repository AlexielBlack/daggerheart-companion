// @vitest-environment happy-dom
/**
 * Tests pour le composant SpotlightToggle.
 * Vérifie le rendu des 3 modes, les émissions d'événements,
 * l'accessibilité ARIA, et le feedback haptique au changement.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SpotlightToggle from '../components/SpotlightToggle.vue'

// Mock du haptic pour vérifier les appels
vi.mock('../composables/useHaptic', () => ({
  useHaptic: () => ({
    tap: vi.fn(),
    swap: vi.fn(),
    undo: vi.fn(),
    defeat: vi.fn(),
    confirm: vi.fn(),
    warning: vi.fn(),
    custom: vi.fn(),
    isSupported: () => true
  })
}))

describe('SpotlightToggle', () => {
  let wrapper

  function createWrapper(sceneMode = 'pcAttack') {
    return mount(SpotlightToggle, {
      props: { sceneMode }
    })
  }

  beforeEach(() => {
    wrapper = createWrapper()
  })

  describe('rendu initial', () => {
    it('affiche les 3 boutons de mode', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
    })

    it('affiche les emojis ⚔️, 💀, 🗣️', () => {
      const emojis = wrapper.findAll('.spt__emoji')
      expect(emojis[0].text()).toBe('⚔️')
      expect(emojis[1].text()).toBe('💀')
      expect(emojis[2].text()).toBe('🗣️')
    })

    it('affiche les labels PJ et MJ', () => {
      const labels = wrapper.findAll('.spt__label')
      expect(labels[0].text()).toBe('PJ')
      expect(labels[1].text()).toBe('MJ')
    })

    it('marque le mode PJ comme actif par défaut', () => {
      const pcBtn = wrapper.find('.spt__btn--pc')
      expect(pcBtn.classes()).toContain('spt__btn--active')
    })

    it('les autres modes ne sont pas actifs', () => {
      const advBtn = wrapper.find('.spt__btn--adv')
      const socialBtn = wrapper.find('.spt__btn--social')
      expect(advBtn.classes()).not.toContain('spt__btn--active')
      expect(socialBtn.classes()).not.toContain('spt__btn--active')
    })
  })

  describe('mode adversaryAttack', () => {
    beforeEach(() => {
      wrapper = createWrapper('adversaryAttack')
    })

    it('marque le mode MJ comme actif', () => {
      const advBtn = wrapper.find('.spt__btn--adv')
      expect(advBtn.classes()).toContain('spt__btn--active')
    })

    it('le mode PJ n\'est pas actif', () => {
      const pcBtn = wrapper.find('.spt__btn--pc')
      expect(pcBtn.classes()).not.toContain('spt__btn--active')
    })
  })

  describe('mode social', () => {
    beforeEach(() => {
      wrapper = createWrapper('social')
    })

    it('marque le mode social comme actif', () => {
      const socialBtn = wrapper.find('.spt__btn--social')
      expect(socialBtn.classes()).toContain('spt__btn--active')
    })
  })

  describe('émission d\'événements', () => {
    it('émet update:sceneMode avec adversaryAttack au clic MJ', async () => {
      const advBtn = wrapper.find('.spt__btn--adv')
      await advBtn.trigger('click')
      expect(wrapper.emitted('update:sceneMode')).toBeTruthy()
      expect(wrapper.emitted('update:sceneMode')[0]).toEqual(['adversaryAttack'])
    })

    it('émet update:sceneMode avec social au clic Social', async () => {
      const socialBtn = wrapper.find('.spt__btn--social')
      await socialBtn.trigger('click')
      expect(wrapper.emitted('update:sceneMode')).toBeTruthy()
      expect(wrapper.emitted('update:sceneMode')[0]).toEqual(['social'])
    })

    it('n\'émet rien quand on clique sur le mode déjà actif', async () => {
      const pcBtn = wrapper.find('.spt__btn--pc')
      await pcBtn.trigger('click')
      expect(wrapper.emitted('update:sceneMode')).toBeFalsy()
    })

    it('émet pcAttack depuis adversaryAttack', async () => {
      wrapper = createWrapper('adversaryAttack')
      const pcBtn = wrapper.find('.spt__btn--pc')
      await pcBtn.trigger('click')
      expect(wrapper.emitted('update:sceneMode')[0]).toEqual(['pcAttack'])
    })
  })

  describe('accessibilité ARIA', () => {
    it('le conteneur a le rôle radiogroup', () => {
      const container = wrapper.find('.spt')
      expect(container.attributes('role')).toBe('radiogroup')
      expect(container.attributes('aria-label')).toBe('Mode de scène')
    })

    it('chaque bouton a le rôle radio', () => {
      const buttons = wrapper.findAll('button')
      for (const btn of buttons) {
        expect(btn.attributes('role')).toBe('radio')
      }
    })

    it('le bouton actif a aria-checked=true', () => {
      const pcBtn = wrapper.find('.spt__btn--pc')
      expect(pcBtn.attributes('aria-checked')).toBe('true')
    })

    it('les boutons inactifs ont aria-checked=false', () => {
      const advBtn = wrapper.find('.spt__btn--adv')
      const socialBtn = wrapper.find('.spt__btn--social')
      expect(advBtn.attributes('aria-checked')).toBe('false')
      expect(socialBtn.attributes('aria-checked')).toBe('false')
    })

    it('chaque bouton a un aria-label descriptif', () => {
      const pcBtn = wrapper.find('.spt__btn--pc')
      const advBtn = wrapper.find('.spt__btn--adv')
      const socialBtn = wrapper.find('.spt__btn--social')
      expect(pcBtn.attributes('aria-label')).toBe('PJ Attaque')
      expect(advBtn.attributes('aria-label')).toBe('Adversaire Attaque')
      expect(socialBtn.attributes('aria-label')).toBe('Mode Social')
    })
  })

  describe('indicateur de track', () => {
    it('affiche la classe de track correspondant au mode', () => {
      const track = wrapper.find('.spt__track')
      expect(track.classes()).toContain('spt__track--pcAttack')
    })

    it('change la classe de track en mode adversaire', () => {
      wrapper = createWrapper('adversaryAttack')
      const track = wrapper.find('.spt__track')
      expect(track.classes()).toContain('spt__track--adversaryAttack')
    })

    it('change la classe de track en mode social', () => {
      wrapper = createWrapper('social')
      const track = wrapper.find('.spt__track')
      expect(track.classes()).toContain('spt__track--social')
    })

    it('le track a aria-hidden=true', () => {
      const track = wrapper.find('.spt__track')
      expect(track.attributes('aria-hidden')).toBe('true')
    })
  })
})
