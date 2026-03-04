/**
 * @module characters/__tests__/domainCards
 * @description Tests for domain card management in character store.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'

// Known card IDs from blade/bone domains (Warrior class)
const BLADE_L1 = ['blade-get-back-up', 'blade-not-good-enough', 'blade-whirlwind']
const BONE_L1 = ['bone-deft-maneuvers', 'bone-i-see-it-coming', 'bone-untouchable']
const ALL_L1 = [...BLADE_L1, ...BONE_L1]

describe('Domain Cards Management', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useCharacterStore()
    store.createCharacter('warrior')
  })

  describe('Initial state', () => {
    it('should have empty domainCards on new character', () => {
      const char = store.selectedCharacter
      expect(char.domainCards).toBeDefined()
      expect(char.domainCards.loadout).toEqual([])
      expect(char.domainCards.vault).toEqual([])
    })

    it('should have available domains matching class', () => {
      expect(store.availableDomains.length).toBe(2)
      const domainIds = store.availableDomains.map((d) => d.id)
      expect(domainIds).toContain('blade')
      expect(domainIds).toContain('bone')
    })

    it('should have available cards filtered by level', () => {
      const cards = store.availableDomainCards
      expect(cards.length).toBeGreaterThan(0)
      expect(cards.every((c) => c.level <= 1)).toBe(true)
    })

    it('should not be loadout full initially', () => {
      expect(store.isLoadoutFull).toBe(false)
    })
  })

  describe('addCardToLoadout', () => {
    it('should add a card to loadout', () => {
      const result = store.addCardToLoadout(ALL_L1[0])
      expect(result).toBe(true)
      expect(store.selectedCharacter.domainCards.loadout).toContain(ALL_L1[0])
    })

    it('should not add duplicate card to loadout', () => {
      store.addCardToLoadout(ALL_L1[0])
      const result = store.addCardToLoadout(ALL_L1[0])
      expect(result).toBe(false)
      expect(
        store.selectedCharacter.domainCards.loadout.filter((id) => id === ALL_L1[0]).length
      ).toBe(1)
    })

    it('should not exceed max loadout at level 1 (2 cards)', () => {
      store.addCardToLoadout(ALL_L1[0])
      store.addCardToLoadout(ALL_L1[1])
      expect(store.isLoadoutFull).toBe(true)
      const result = store.addCardToLoadout(ALL_L1[2])
      expect(result).toBe(false)
    })

    it('should allow 5 cards at level 4+', () => {
      store.updateField('level', 4)
      for (let i = 0; i < 5; i++) {
        store.addCardToLoadout(ALL_L1[i])
      }
      expect(store.isLoadoutFull).toBe(true)
      const result = store.addCardToLoadout(ALL_L1[5])
      expect(result).toBe(false)
    })
  })

  describe('addCardToVault', () => {
    it('should add a card to vault', () => {
      const result = store.addCardToVault(ALL_L1[0])
      expect(result).toBe(true)
      expect(store.selectedCharacter.domainCards.vault).toContain(ALL_L1[0])
    })

    it('should not add duplicate card to vault', () => {
      store.addCardToVault(ALL_L1[0])
      const result = store.addCardToVault(ALL_L1[0])
      expect(result).toBe(false)
    })
  })

  describe('moveCardToVault', () => {
    it('should move card from loadout to vault', () => {
      store.addCardToLoadout(ALL_L1[0])
      const result = store.moveCardToVault(ALL_L1[0])
      expect(result).toBe(true)
      expect(store.selectedCharacter.domainCards.loadout).not.toContain(ALL_L1[0])
      expect(store.selectedCharacter.domainCards.vault).toContain(ALL_L1[0])
    })
  })

  describe('moveCardToLoadout', () => {
    it('should move card from vault to loadout', () => {
      store.addCardToVault(ALL_L1[0])
      const result = store.moveCardToLoadout(ALL_L1[0])
      expect(result).toBe(true)
      expect(store.selectedCharacter.domainCards.vault).not.toContain(ALL_L1[0])
      expect(store.selectedCharacter.domainCards.loadout).toContain(ALL_L1[0])
    })

    it('should not move to loadout if full', () => {
      store.addCardToLoadout(ALL_L1[0])
      store.addCardToLoadout(ALL_L1[1])
      store.addCardToVault(ALL_L1[2])
      const result = store.moveCardToLoadout(ALL_L1[2])
      expect(result).toBe(false)
    })
  })

  describe('removeCard', () => {
    it('should remove card from loadout', () => {
      store.addCardToLoadout(ALL_L1[0])
      store.removeCard(ALL_L1[0])
      expect(store.selectedCharacter.domainCards.loadout).not.toContain(ALL_L1[0])
    })

    it('should remove card from vault', () => {
      store.addCardToVault(ALL_L1[0])
      store.removeCard(ALL_L1[0])
      expect(store.selectedCharacter.domainCards.vault).not.toContain(ALL_L1[0])
    })
  })

  describe('hasCard', () => {
    it('should detect card in loadout', () => {
      store.addCardToLoadout(ALL_L1[0])
      expect(store.hasCard(ALL_L1[0])).toBe(true)
    })

    it('should detect card in vault', () => {
      store.addCardToVault(ALL_L1[1])
      expect(store.hasCard(ALL_L1[1])).toBe(true)
    })

    it('should return false for unknown card', () => {
      expect(store.hasCard('nonexistent')).toBe(false)
    })
  })

  describe('Computed card data', () => {
    it('should return enriched loadout card data', () => {
      store.addCardToLoadout(ALL_L1[0])
      expect(store.selectedLoadoutCards.length).toBe(1)
      expect(store.selectedLoadoutCards[0].name).toBeDefined()
      expect(store.selectedLoadoutCards[0].domainColor).toBeDefined()
    })

    it('should return enriched vault card data', () => {
      store.addCardToVault(ALL_L1[0])
      expect(store.selectedVaultCards.length).toBe(1)
      expect(store.selectedVaultCards[0].name).toBeDefined()
    })
  })

  describe('Cross-class validation', () => {
    it('should have different domains for sorcerer', () => {
      store.createCharacter('sorcerer')
      const sorcerer = store.characters[store.characters.length - 1]
      store.selectCharacter(sorcerer.id)
      const domainIds = store.availableDomains.map((d) => d.id)
      expect(domainIds).toContain('arcana')
      expect(domainIds).toContain('midnight')
    })
  })

  describe('Level-gated cards', () => {
    it('should show more cards at higher levels', () => {
      const cardsLvl1 = store.availableDomainCards.length
      store.updateField('level', 5)
      const cardsLvl5 = store.availableDomainCards.length
      expect(cardsLvl5).toBeGreaterThan(cardsLvl1)
    })
  })

  describe('Dynamic max loadout', () => {
    it('should have max loadout of 2 at level 1', () => {
      expect(store.selectedMaxLoadout).toBe(2)
    })

    it('should scale loadout max with level (level+1, cap 5)', () => {
      store.updateField('level', 2)
      expect(store.selectedMaxLoadout).toBe(3)
      store.updateField('level', 3)
      expect(store.selectedMaxLoadout).toBe(4)
      store.updateField('level', 4)
      expect(store.selectedMaxLoadout).toBe(5)
      store.updateField('level', 10)
      expect(store.selectedMaxLoadout).toBe(5)
    })

    it('should increase max loadout with domain_card advancements', () => {
      // Niv. 1 sans bonus → 2
      expect(store.selectedMaxLoadout).toBe(2)

      // Simuler un levelHistory avec 1 avancement domain_card
      const char = store.selectedCharacter
      char.level = 2
      char.levelHistory = [{
        level: 2,
        tier: 2,
        advancements: [{ type: 'domain_card', tier: 2 }],
        domainCard: null,
        timestamp: new Date().toISOString()
      }]
      // Niv. 2 base = 3, + 1 bonus = 4
      expect(store.selectedMaxLoadout).toBe(4)
    })

    it('should cap max loadout at 5 even with many bonuses', () => {
      const char = store.selectedCharacter
      char.level = 4
      char.levelHistory = [
        { level: 2, tier: 2, advancements: [{ type: 'domain_card', tier: 2 }], domainCard: null, timestamp: '' },
        { level: 3, tier: 2, advancements: [{ type: 'domain_card', tier: 2 }], domainCard: null, timestamp: '' },
        { level: 4, tier: 2, advancements: [{ type: 'domain_card', tier: 2 }], domainCard: null, timestamp: '' }
      ]
      // Niv. 4 base = 5, + 3 bonus = 8 → plafond 5
      expect(store.selectedMaxLoadout).toBe(5)
    })

    it('should grant +1 from School of Knowledge foundation (Prepared)', () => {
      // Créer un wizard avec School of Knowledge
      store.createCharacter('wizard')
      const wizard = store.characters[store.characters.length - 1]
      store.selectCharacter(wizard.id)
      store.applySelection('subclassId', 'school_of_knowledge')

      // Niv. 1, foundation → base 2 + 1 bonus sous-classe = 3
      expect(store.selectedMaxLoadout).toBe(3)
    })

    it('should grant +2 from School of Knowledge specialization', () => {
      store.createCharacter('wizard')
      const wizard = store.characters[store.characters.length - 1]
      store.selectCharacter(wizard.id)
      store.applySelection('subclassId', 'school_of_knowledge')
      wizard.level = 5
      wizard.subclassProgression = 'specialization'

      // Niv. 5 base = 5 (capped), + 2 bonus → 5 (plafond)
      // Vérifions plutôt à niv. 2 pour voir l'effet
      wizard.level = 2
      // Niv. 2 base = 3, + 2 bonus = 5
      expect(store.selectedMaxLoadout).toBe(5)
    })

    it('should grant +3 from School of Knowledge mastery', () => {
      store.createCharacter('wizard')
      const wizard = store.characters[store.characters.length - 1]
      store.selectCharacter(wizard.id)
      store.applySelection('subclassId', 'school_of_knowledge')
      wizard.level = 1
      wizard.subclassProgression = 'mastery'

      // Niv. 1 base = 2, + 3 bonus = 5
      expect(store.selectedMaxLoadout).toBe(5)
    })

    it('should not grant subclass bonus for School of War', () => {
      store.createCharacter('wizard')
      const wizard = store.characters[store.characters.length - 1]
      store.selectCharacter(wizard.id)
      store.applySelection('subclassId', 'school_of_war')

      // Niv. 1, pas de domainCardBonuses → base 2
      expect(store.selectedMaxLoadout).toBe(2)
    })
  })
})
