/**
 * @module characters/__tests__/characterSelectors.test
 * @description Tests pour les fonctionnalités de sélection déroulante du character store.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'

describe('characterStore — sélections déroulantes', () => {
  let store

  beforeEach(() => {
    // Nettoyer le localStorage pour éviter les interférences entre tests
    localStorage.clear()
    setActivePinia(createPinia())
    store = useCharacterStore()
    // Créer un personnage Warrior pour les tests
    store.createCharacter('warrior')
  })

  // ── Sous-classe ────────────────────────────────────────

  describe('applySelection — subclassId', () => {
    it('sélectionne une sous-classe et met à jour le champ subclass', () => {
      store.applySelection('subclassId', 'call_of_the_brave')
      const char = store.selectedCharacter
      expect(char.subclassId).toBe('call_of_the_brave')
      expect(char.subclass).toBe('Call of the Brave')
    })

    it('désélectionne la sous-classe en passant une chaîne vide', () => {
      store.applySelection('subclassId', 'call_of_the_brave')
      store.applySelection('subclassId', '')
      const char = store.selectedCharacter
      expect(char.subclassId).toBe('')
      expect(char.subclass).toBe('')
    })

    it('retourne les sous-classes correctes pour Warrior', () => {
      expect(store.availableSubclasses).toHaveLength(2)
      expect(store.availableSubclasses[0].id).toBe('call_of_the_brave')
      expect(store.availableSubclasses[1].id).toBe('call_of_the_slayer')
    })

    it('retourne les données de sous-classe sélectionnée', () => {
      store.applySelection('subclassId', 'call_of_the_slayer')
      const data = store.selectedSubclassData
      expect(data).not.toBeNull()
      expect(data.name).toBe('Call of the Slayer')
      expect(data.foundation.length).toBeGreaterThan(0)
    })
  })

  // ── Armure ─────────────────────────────────────────────

  describe('applySelection — armorId', () => {
    it('sélectionne une armure et met à jour les champs de combat', () => {
      store.applySelection('armorId', 'chainmail-t1')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.armorId).toBe('chainmail-t1')
      expect(char.armorName).toBe('Chainmail Armor')
      expect(char.armorBaseThresholds.major).toBe(7)
      expect(char.armorBaseThresholds.severe).toBe(15)
      expect(char.armorScore).toBe(4)
      expect(char.evasionBonus).toBe(-1) // Heavy
    })

    it('applique le bonus Flexible correctement', () => {
      store.applySelection('armorId', 'gambeson-t1')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.evasionBonus).toBe(1) // Flexible: +1
    })

    it('applique le malus Very Heavy correctement', () => {
      store.applySelection('armorId', 'full-plate-t1')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.evasionBonus).toBe(-2) // Very Heavy: -2
    })

    it('réinitialise les champs armure en désélectionnant', () => {
      store.applySelection('armorId', 'chainmail-t1')
      store.applySelection('armorId', '')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.armorName).toBe('')
      expect(char.armorScore).toBe(0)
      expect(char.evasionBonus).toBe(0)
    })

    it('retourne les données d\'armure sélectionnée via getter', () => {
      store.applySelection('armorId', 'leather-t1')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.armorId).toBe('leather-t1')
      expect(char.armorName).toBe('Leather Armor')
    })
  })

  // ── Arme primaire ──────────────────────────────────────

  describe('applySelection — primaryWeaponId', () => {
    it('sélectionne une arme primaire et met à jour les champs', () => {
      store.applySelection('primaryWeaponId', 'broadsword-t1')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.primaryWeaponId).toBe('broadsword-t1')
      expect(char.primaryWeapon.name).toBe('Broadsword')
      expect(char.primaryWeapon.trait).toBe('Agility')
      expect(char.primaryWeapon.range).toBe('Melee')
      expect(char.primaryWeapon.damage).toBe('d8')
      expect(char.primaryWeapon.feature).toBe('Reliable : +1 aux jets d\u2019attaque')
    })

    it('réinitialise les champs arme en désélectionnant', () => {
      store.applySelection('primaryWeaponId', 'broadsword-t1')
      store.applySelection('primaryWeaponId', '')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.primaryWeapon.name).toBe('')
    })
  })

  // ── Arme secondaire ────────────────────────────────────

  describe('applySelection — secondaryWeaponId', () => {
    it('sélectionne une arme secondaire et met à jour les champs', () => {
      store.applySelection('secondaryWeaponId', 'round-shield-t1')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.secondaryWeaponId).toBe('round-shield-t1')
      expect(char.secondaryWeapon.name).toBe('Round Shield')
      expect(char.secondaryWeapon.feature).toBe('Protective : +1 au Score d\u2019armure')
    })
  })

  // ── Ascendance ─────────────────────────────────────────

  describe('applySelection — ancestryId', () => {
    it('sélectionne une ascendance', () => {
      store.applySelection('ancestryId', 'elf')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.ancestryId).toBe('elf')
    })

    it('retourne les données d\'ascendance sélectionnée', () => {
      store.applySelection('ancestryId', 'dwarf')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.ancestryId).toBe('dwarf')
    })

    it('retourne null si aucune ascendance sélectionnée', () => {
      expect(store.selectedAncestryData).toBeNull()
    })
  })

  // ── Communauté ─────────────────────────────────────────

  describe('applySelection — communityId', () => {
    it('sélectionne une communauté', () => {
      store.applySelection('communityId', 'seaborne')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.communityId).toBe('seaborne')
    })

    it('retourne les données de communauté sélectionnée', () => {
      store.applySelection('communityId', 'wildborne')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.communityId).toBe('wildborne')
    })

    it('retourne null si aucune communauté sélectionnée', () => {
      expect(store.selectedCommunityData).toBeNull()
    })
  })

  // ── Listes de référence ────────────────────────────────

  describe('listes de référence', () => {
    it('expose les ancestries', () => {
      expect(store.allAncestries.length).toBeGreaterThan(0)
    })

    it('expose les communautés', () => {
      expect(store.allCommunities.length).toBe(9)
    })

    it('expose les armures', () => {
      expect(store.allArmor.length).toBeGreaterThan(0)
    })

    it('expose les armes primaires', () => {
      expect(store.allPrimaryWeapons.length).toBeGreaterThan(0)
    })

    it('expose les armes secondaires', () => {
      expect(store.allSecondaryWeapons.length).toBeGreaterThan(0)
    })
  })

  // ── Robustesse ─────────────────────────────────────────

  describe('robustesse', () => {
    it('ne plante pas avec un ID invalide', () => {
      expect(() => store.applySelection('armorId', 'inexistant')).not.toThrow()
      expect(() => store.applySelection('primaryWeaponId', 'inexistant')).not.toThrow()
      expect(() => store.applySelection('subclassId', 'inexistant')).not.toThrow()
    })

    it('ne plante pas sans personnage sélectionné', () => {
      store.selectedCharacterId = null
      expect(() => store.applySelection('armorId', 'chainmail-t1')).not.toThrow()
    })

    it('persiste les sélections correctement', () => {
      store.applySelection('ancestryId', 'human')
      store.applySelection('communityId', 'highborne')
      store.applySelection('subclassId', 'call_of_the_brave')
      const char = store.characters.find((c) => c.id === store.selectedCharacterId)
      expect(char.ancestryId).toBe('human')
      expect(char.communityId).toBe('highborne')
      expect(char.subclassId).toBe('call_of_the_brave')
    })
  })
})
