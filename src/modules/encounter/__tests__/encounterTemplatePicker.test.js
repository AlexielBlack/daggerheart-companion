// @vitest-environment happy-dom
/**
 * Tests pour le composant EncounterTemplatePicker.
 * Vérifie le rendu des templates, le filtrage par tier/tag,
 * les émissions d'événements et l'accessibilité ARIA.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EncounterTemplatePicker from '../components/EncounterTemplatePicker.vue'
import { ENCOUNTER_TEMPLATES } from '@data/encounters/templates'

const TOTAL_TEMPLATES = 21
const TIER_1_COUNT = 6
const TIER_2_COUNT = 5
const TOTAL_TAGS = 17

const mountPicker = (props = {}) => mount(EncounterTemplatePicker, {
  props: { currentTier: 1, currentPcCount: 4, ...props }
})

describe('EncounterTemplatePicker', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mountPicker()
  })

  // ── Rendu initial ─────────────────────────────────────────

  describe('rendu initial', () => {
    it('affiche tous les templates au chargement (21 cartes)', () => {
      const cards = wrapper.findAll('.template-card')
      expect(cards).toHaveLength(TOTAL_TEMPLATES)
    })

    it('chaque carte affiche le nom du template', () => {
      const names = wrapper.findAll('.template-card__name')
      expect(names).toHaveLength(TOTAL_TEMPLATES)
      expect(names[0].text()).toBe(ENCOUNTER_TEMPLATES[0].name)
    })

    it('chaque carte affiche les meta-informations (tier, PJ, adversaires)', () => {
      const metas = wrapper.findAll('.template-card__meta')
      expect(metas).toHaveLength(TOTAL_TEMPLATES)
      // Premier template : T1 - 4 PJ - 5 adversaires
      expect(metas[0].text()).toContain('T1')
      expect(metas[0].text()).toContain('4 PJ')
      expect(metas[0].text()).toContain('5 adv.')
    })

    it('chaque carte affiche la description', () => {
      const descs = wrapper.findAll('.template-card__desc')
      expect(descs).toHaveLength(TOTAL_TEMPLATES)
      expect(descs[0].text()).toBe(ENCOUNTER_TEMPLATES[0].description)
    })

    it('chaque carte affiche les tags sous forme de chips', () => {
      const firstCard = wrapper.findAll('.template-card')[0]
      const chips = firstCard.findAll('.template-card__tag-chip')
      expect(chips).toHaveLength(ENCOUNTER_TEMPLATES[0].tags.length)
      expect(chips[0].text()).toBe(ENCOUNTER_TEMPLATES[0].tags[0])
    })
  })

  // ── Select de tier ────────────────────────────────────────

  describe('select de tier', () => {
    it('le select est présent avec 5 options (tous + 4 tiers)', () => {
      const select = wrapper.find('.template-picker__select')
      expect(select.exists()).toBe(true)
      const options = select.findAll('option')
      expect(options).toHaveLength(5)
    })

    it('la première option est "Tous les tiers"', () => {
      const options = wrapper.find('.template-picker__select').findAll('option')
      expect(options[0].text()).toContain('Tous les tiers')
    })

    it('les options de tier 1 à 4 sont présentes', () => {
      const options = wrapper.find('.template-picker__select').findAll('option')
      expect(options[1].text()).toContain('Tier 1')
      expect(options[2].text()).toContain('Tier 2')
      expect(options[3].text()).toContain('Tier 3')
      expect(options[4].text()).toContain('Tier 4')
    })

    it('le select a un aria-label descriptif', () => {
      const select = wrapper.find('.template-picker__select')
      expect(select.attributes('aria-label')).toBe('Filtrer par tier')
    })
  })

  // ── Filtrage par tier ─────────────────────────────────────

  describe('filtrage par tier', () => {
    it('sélectionner tier 1 ne montre que les templates tier 1', async () => {
      wrapper.vm.filterTier = 1
      await wrapper.vm.$nextTick()
      const cards = wrapper.findAll('.template-card')
      expect(cards).toHaveLength(TIER_1_COUNT)
    })

    it('sélectionner tier 2 ne montre que les templates tier 2', async () => {
      wrapper.vm.filterTier = 2
      await wrapper.vm.$nextTick()
      const cards = wrapper.findAll('.template-card')
      expect(cards).toHaveLength(TIER_2_COUNT)
    })

    it('revenir à "Tous les tiers" restaure tous les templates', async () => {
      wrapper.vm.filterTier = 1
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.template-card')).toHaveLength(TIER_1_COUNT)
      wrapper.vm.filterTier = null
      await wrapper.vm.$nextTick()
      expect(wrapper.findAll('.template-card')).toHaveLength(TOTAL_TEMPLATES)
    })
  })

  // ── Boutons de tags ───────────────────────────────────────

  describe('boutons de tags', () => {
    it('affiche tous les tags disponibles triés', () => {
      const tagButtons = wrapper.findAll('.template-picker__tag')
      expect(tagButtons).toHaveLength(TOTAL_TAGS)
    })

    it('les tags sont triés alphabétiquement', () => {
      const tagButtons = wrapper.findAll('.template-picker__tag')
      const tagTexts = tagButtons.map((b) => b.text())
      const sorted = [...tagTexts].sort()
      expect(tagTexts).toEqual(sorted)
    })

    it('aucun tag n\'est actif par défaut', () => {
      const activeButtons = wrapper.findAll('.template-picker__tag--active')
      expect(activeButtons).toHaveLength(0)
    })

    it('tous les tags ont aria-pressed="false" par défaut', () => {
      const tagButtons = wrapper.findAll('.template-picker__tag')
      tagButtons.forEach((btn) => {
        expect(btn.attributes('aria-pressed')).toBe('false')
      })
    })
  })

  // ── Filtrage par tag ──────────────────────────────────────

  describe('filtrage par tag', () => {
    it('cliquer sur un tag filtre les templates correspondants', async () => {
      // Cliquer sur le tag "boss" (9 templates)
      const tagButtons = wrapper.findAll('.template-picker__tag')
      const bossButton = tagButtons.find((b) => b.text() === 'boss')
      expect(bossButton).toBeTruthy()

      await bossButton.trigger('click')
      const cards = wrapper.findAll('.template-card')
      expect(cards).toHaveLength(9)
    })

    it('le tag actif a la classe template-picker__tag--active', async () => {
      const tagButtons = wrapper.findAll('.template-picker__tag')
      const bossButton = tagButtons.find((b) => b.text() === 'boss')
      await bossButton.trigger('click')

      expect(bossButton.classes()).toContain('template-picker__tag--active')
    })

    it('le tag actif a aria-pressed="true"', async () => {
      const tagButtons = wrapper.findAll('.template-picker__tag')
      const bossButton = tagButtons.find((b) => b.text() === 'boss')
      await bossButton.trigger('click')

      expect(bossButton.attributes('aria-pressed')).toBe('true')
    })

    it('double clic sur un tag désactive le filtre', async () => {
      const tagButtons = wrapper.findAll('.template-picker__tag')
      const bossButton = tagButtons.find((b) => b.text() === 'boss')

      await bossButton.trigger('click')
      expect(wrapper.findAll('.template-card')).toHaveLength(9)

      await bossButton.trigger('click')
      expect(wrapper.findAll('.template-card')).toHaveLength(TOTAL_TEMPLATES)
      expect(bossButton.attributes('aria-pressed')).toBe('false')
    })

    it('cliquer sur un autre tag change le filtre actif', async () => {
      const tagButtons = wrapper.findAll('.template-picker__tag')
      const bossButton = tagButtons.find((b) => b.text() === 'boss')
      const donjonButton = tagButtons.find((b) => b.text() === 'donjon')

      await bossButton.trigger('click')
      expect(wrapper.findAll('.template-card')).toHaveLength(9)

      await donjonButton.trigger('click')
      expect(wrapper.findAll('.template-card')).toHaveLength(5)
      expect(bossButton.attributes('aria-pressed')).toBe('false')
      expect(donjonButton.attributes('aria-pressed')).toBe('true')
    })
  })

  // ── Combinaison tier + tag ────────────────────────────────

  describe('combinaison de filtres tier + tag', () => {
    it('filtrer par tier et tag combine les deux critères', async () => {
      // Tier 1 + donjon = skeleton-crypt-t1 + cave-ogre-boss-t1 = 2
      wrapper.vm.filterTier = 1
      await wrapper.vm.$nextTick()

      const tagButtons = wrapper.findAll('.template-picker__tag')
      const donjonButton = tagButtons.find((b) => b.text() === 'donjon')
      await donjonButton.trigger('click')

      const cards = wrapper.findAll('.template-card')
      expect(cards).toHaveLength(2)
    })
  })

  // ── Message vide ──────────────────────────────────────────

  describe('message vide', () => {
    it('affiche un message quand aucun template ne correspond', async () => {
      // Tier 1 + tag "horreur" = 0 template
      wrapper.vm.filterTier = 1
      await wrapper.vm.$nextTick()

      const tagButtons = wrapper.findAll('.template-picker__tag')
      const horreurButton = tagButtons.find((b) => b.text() === 'horreur')
      await horreurButton.trigger('click')

      const empty = wrapper.find('.template-picker__empty')
      expect(empty.exists()).toBe(true)
      expect(empty.text()).toContain('Aucun template ne correspond')
    })

    it('la liste n\'est pas rendue quand le message vide est affiché', async () => {
      wrapper.vm.filterTier = 1
      await wrapper.vm.$nextTick()

      const tagButtons = wrapper.findAll('.template-picker__tag')
      const horreurButton = tagButtons.find((b) => b.text() === 'horreur')
      await horreurButton.trigger('click')

      expect(wrapper.find('.template-picker__list').exists()).toBe(false)
    })
  })

  // ── Emission d'événements ─────────────────────────────────

  describe('émission load-template', () => {
    it('cliquer sur "Charger" émet load-template avec le template', async () => {
      const loadButton = wrapper.find('.template-card__load')
      await loadButton.trigger('click')

      expect(wrapper.emitted('load-template')).toBeTruthy()
      expect(wrapper.emitted('load-template')).toHaveLength(1)
      expect(wrapper.emitted('load-template')[0][0]).toEqual(ENCOUNTER_TEMPLATES[0])
    })

    it('chaque bouton Charger émet le bon template', async () => {
      const loadButtons = wrapper.findAll('.template-card__load')
      // Cliquer sur le 3e bouton (index 2) — Marée de zombies
      await loadButtons[2].trigger('click')

      const emitted = wrapper.emitted('load-template')
      expect(emitted).toHaveLength(1)
      expect(emitted[0][0].id).toBe(ENCOUNTER_TEMPLATES[2].id)
      expect(emitted[0][0].name).toBe(ENCOUNTER_TEMPLATES[2].name)
    })
  })

  // ── Accessibilité ─────────────────────────────────────────

  describe('accessibilité', () => {
    it('le conteneur principal a role="region"', () => {
      const region = wrapper.find('[role="region"]')
      expect(region.exists()).toBe(true)
    })

    it('le conteneur principal a un aria-label descriptif', () => {
      const region = wrapper.find('[role="region"]')
      expect(region.attributes('aria-label')).toBe('Templates de rencontres')
    })

    it('chaque bouton Charger a un aria-label avec le nom du template', () => {
      const loadButtons = wrapper.findAll('.template-card__load')
      expect(loadButtons).toHaveLength(TOTAL_TEMPLATES)

      loadButtons.forEach((btn, index) => {
        const expectedLabel = 'Charger ' + ENCOUNTER_TEMPLATES[index].name
        expect(btn.attributes('aria-label')).toBe(expectedLabel)
      })
    })

    it('les boutons Charger affichent le texte "Charger"', () => {
      const loadButtons = wrapper.findAll('.template-card__load')
      loadButtons.forEach((btn) => {
        expect(btn.text()).toBe('Charger')
      })
    })
  })
})
