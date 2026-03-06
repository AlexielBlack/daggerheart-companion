/**
 * @module characters/__tests__/domainCardModifiers.test
 * @description Tests pour le système de modificateurs de cartes de domaine.
 * Couvre : passifs, conditionnels, touched, toggles, activables, permanents.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '../stores/characterStore'
import { computeStatBonuses } from '@data/statModifiers'
import {
  DOMAIN_CARD_MODIFIERS,
  getTier,
  BARE_BONES_THRESHOLDS,
  isTouchedActive,
  countDomainCardsInLoadout,
  getModifierCardIds
} from '@data/domainCardModifiers'
import { getCardById } from '@data/domains'

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

/** Crée un personnage minimal avec les champs nécessaires */
function makeChar(overrides = {}) {
  return {
    ancestryId: '',
    subclassId: '',
    level: 1,
    proficiency: 1,
    traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
    armorId: '',
    armorScore: 0,
    armorBaseThresholds: { major: 0, severe: 0 },
    maxHP: 6,
    currentHP: 0,
    maxStress: 6,
    currentStress: 0,
    domainCards: { loadout: [], vault: [] },
    activeEffects: {},
    permanentCardEffects: [],
    ...overrides
  }
}

// ═══════════════════════════════════════════════════════════
//  Tests du registre domainCardModifiers
// ═══════════════════════════════════════════════════════════

describe('domainCardModifiers — registre', () => {
  it('contient 21 cartes modificatrices', () => {
    expect(getModifierCardIds().length).toBe(21)
  })

  it('chaque entrée a un cardId, name, domain, type et icon', () => {
    for (const [key, mod] of Object.entries(DOMAIN_CARD_MODIFIERS)) {
      expect(mod.cardId).toBe(key)
      expect(mod.name).toBeTruthy()
      expect(mod.domain).toBeTruthy()
      expect(mod.type).toBeTruthy()
      expect(mod.icon).toBeTruthy()
    }
  })

  it('les types sont valides', () => {
    const validTypes = ['passive', 'conditional', 'touched', 'toggle', 'activable', 'permanent']
    for (const mod of Object.values(DOMAIN_CARD_MODIFIERS)) {
      expect(validTypes).toContain(mod.type)
    }
  })

  it('les cartes non-permanent ont toutes une fonction compute', () => {
    for (const mod of Object.values(DOMAIN_CARD_MODIFIERS)) {
      if (mod.type !== 'permanent') {
        expect(typeof mod.compute).toBe('function')
      }
    }
  })

  it('les cartes permanent ont des choices avec effect', () => {
    for (const mod of Object.values(DOMAIN_CARD_MODIFIERS)) {
      if (mod.type === 'permanent') {
        expect(Array.isArray(mod.choices)).toBe(true)
        expect(mod.choices.length).toBeGreaterThan(0)
        for (const choice of mod.choices) {
          expect(choice.id).toBeTruthy()
          expect(choice.label).toBeTruthy()
          expect(choice.effect).toBeTruthy()
        }
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  getTier
// ═══════════════════════════════════════════════════════════

describe('getTier', () => {
  it('niveau 1 → tier 1', () => { expect(getTier(1)).toBe(1) })
  it('niveau 2 → tier 2', () => { expect(getTier(2)).toBe(2) })
  it('niveau 4 → tier 2', () => { expect(getTier(4)).toBe(2) })
  it('niveau 5 → tier 3', () => { expect(getTier(5)).toBe(3) })
  it('niveau 7 → tier 3', () => { expect(getTier(7)).toBe(3) })
  it('niveau 8 → tier 4', () => { expect(getTier(8)).toBe(4) })
  it('niveau 10 → tier 4', () => { expect(getTier(10)).toBe(4) })
})

// ═══════════════════════════════════════════════════════════
//  countDomainCardsInLoadout / isTouchedActive
// ═══════════════════════════════════════════════════════════

describe('countDomainCardsInLoadout', () => {
  it('retourne 0 pour un loadout vide', () => {
    expect(countDomainCardsInLoadout([], 'blade', getCardById)).toBe(0)
  })

  it('compte les cartes du domaine spécifié', () => {
    // 3 cartes blade level 1
    const loadout = ['blade-onslaught', 'blade-deadly-focus', 'blade-fortified-armor']
    expect(countDomainCardsInLoadout(loadout, 'blade', getCardById)).toBe(3)
  })

  it('ignore les cartes d\'autres domaines', () => {
    const loadout = ['blade-onslaught', 'valor-bare-bones']
    expect(countDomainCardsInLoadout(loadout, 'blade', getCardById)).toBe(1)
  })
})

describe('isTouchedActive', () => {
  it('retourne false si < 4 cartes du domaine', () => {
    const mod = DOMAIN_CARD_MODIFIERS['blade-blade-touched']
    const loadout = ['blade-onslaught', 'blade-deadly-focus', 'blade-blade-touched']
    expect(isTouchedActive(mod, loadout, getCardById)).toBe(false)
  })

  it('retourne true si 4+ cartes du domaine', () => {
    const mod = DOMAIN_CARD_MODIFIERS['blade-blade-touched']
    const loadout = ['blade-onslaught', 'blade-deadly-focus', 'blade-fortified-armor', 'blade-blade-touched']
    expect(isTouchedActive(mod, loadout, getCardById)).toBe(true)
  })

  it('retourne false pour un mod non-touched', () => {
    const mod = DOMAIN_CARD_MODIFIERS['bone-untouchable']
    expect(isTouchedActive(mod, [], getCardById)).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  PASSIFS PURS — computeStatBonuses avec cartes
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — passifs purs', () => {
  it('Untouchable : +½ Agilité en évasion', () => {
    const char = makeChar({
      traits: { agility: 4, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: ['bone-untouchable'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(2)
    expect(bonuses.sources).toContain('Untouchable (+2 Évasion)')
  })

  it('Untouchable : agilité impaire arrondie au supérieur', () => {
    const char = makeChar({
      traits: { agility: 3, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: ['bone-untouchable'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(2)
  })

  it('Untouchable : agilité 0 → pas de bonus', () => {
    const char = makeChar({
      domainCards: { loadout: ['bone-untouchable'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(0)
  })

  it('Rise Up : seuil sévère +proficiency', () => {
    const char = makeChar({
      proficiency: 3,
      domainCards: { loadout: ['valor-rise-up'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.severe).toBe(3)
    expect(bonuses.thresholds.major).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════
//  CONDITIONNELS
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — conditionnels', () => {
  it('Bare Bones : actif sans armure, override seuils + armorScore', () => {
    const char = makeChar({
      traits: { agility: 0, strength: 2, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      armorId: '',
      level: 1,
      domainCards: { loadout: ['valor-bare-bones'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.armorScoreOverride).toBe(5) // 3 + strength 2
    expect(bonuses.thresholdsOverride).toEqual({ major: 9, severe: 19 }) // tier 1
  })

  it('Bare Bones : inactif avec armure', () => {
    const char = makeChar({
      traits: { agility: 0, strength: 2, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      armorId: 'some-armor',
      domainCards: { loadout: ['valor-bare-bones'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.armorScoreOverride).toBeNull()
    expect(bonuses.thresholdsOverride).toBeNull()
  })

  it('Bare Bones : seuils changent par tier', () => {
    for (const [tier, expected] of Object.entries(BARE_BONES_THRESHOLDS)) {
      const level = tier === '1' ? 1 : tier === '2' ? 2 : tier === '3' ? 5 : 8
      const char = makeChar({
        traits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
        armorId: '',
        level,
        domainCards: { loadout: ['valor-bare-bones'], vault: [] }
      })
      const bonuses = computeStatBonuses(char)
      expect(bonuses.thresholdsOverride.major).toBe(expected.major)
      expect(bonuses.thresholdsOverride.severe).toBe(expected.severe)
    }
  })

  it('Fortified Armor : actif avec armure (+2 seuils)', () => {
    const char = makeChar({
      armorId: 'some-armor',
      domainCards: { loadout: ['blade-fortified-armor'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(2)
    expect(bonuses.thresholds.severe).toBe(2)
  })

  it('Fortified Armor : inactif sans armure', () => {
    const char = makeChar({
      armorId: '',
      domainCards: { loadout: ['blade-fortified-armor'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(0)
    expect(bonuses.thresholds.severe).toBe(0)
  })

  it('Armorer : +1 armorScore quand armure portée', () => {
    const char = makeChar({
      armorId: 'some-armor',
      domainCards: { loadout: ['valor-armorer'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.armorScore).toBe(1)
  })

  it('Voice of Reason : actif quand tout le stress est marqué', () => {
    const char = makeChar({
      maxStress: 6,
      currentStress: 6,
      domainCards: { loadout: ['splendor-voice-of-reason'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.proficiencyDamage).toBe(1)
  })

  it('Voice of Reason : inactif quand stress non max', () => {
    const char = makeChar({
      maxStress: 6,
      currentStress: 3,
      domainCards: { loadout: ['splendor-voice-of-reason'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.proficiencyDamage).toBe(0)
  })

  it('On the Brink : actif quand ≤2 HP libres', () => {
    const char = makeChar({
      maxHP: 6,
      currentHP: 5, // 1 HP non marqué
      domainCards: { loadout: ['bone-on-the-brink'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.immuneMinor).toBe(true)
  })

  it('On the Brink : inactif quand >2 HP libres', () => {
    const char = makeChar({
      maxHP: 6,
      currentHP: 2, // 4 HP non marqués
      domainCards: { loadout: ['bone-on-the-brink'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.immuneMinor).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  TOGGLES
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — toggles', () => {
  it('Shadowhunter : inactif par défaut', () => {
    const char = makeChar({
      domainCards: { loadout: ['midnight-shadowhunter'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(0)
    expect(bonuses.attackAdvantage).toBe(false)
  })

  it('Shadowhunter : actif quand toggle ON', () => {
    const char = makeChar({
      domainCards: { loadout: ['midnight-shadowhunter'], vault: [] },
      activeEffects: { 'midnight-shadowhunter': true }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(1)
    expect(bonuses.attackAdvantage).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════
//  TOUCHED
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — touched', () => {
  it('Blade-Touched : inactif si < 4 cartes blade', () => {
    const char = makeChar({
      domainCards: { loadout: ['blade-blade-touched', 'blade-onslaught'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.attackBonus).toBe(0)
    expect(bonuses.thresholds.severe).toBe(0)
  })

  it('Blade-Touched : actif si 4+ cartes blade', () => {
    const char = makeChar({
      domainCards: {
        loadout: ['blade-blade-touched', 'blade-onslaught', 'blade-deadly-focus', 'blade-fortified-armor'],
        vault: []
      },
      armorId: 'some-armor' // pour que fortified-armor soit aussi actif
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.attackBonus).toBe(2)
    expect(bonuses.thresholds.severe).toBe(4 + 2) // blade-touched +4 severe + fortified +2
  })

  it('Bone-Touched : +1 Agilité si 4+ cartes bone', () => {
    const char = makeChar({
      domainCards: {
        loadout: ['bone-bone-touched', 'bone-untouchable', 'bone-deft-maneuvers', 'bone-i-see-it-coming'],
        vault: []
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.traitBonus).toEqual({ agility: 1 })
  })

  it('Valor-Touched : +1 armorScore si 4+ cartes valor', () => {
    const char = makeChar({
      domainCards: {
        loadout: ['valor-valor-touched', 'valor-bare-bones', 'valor-forceful-push', 'valor-i-am-your-shield'],
        vault: []
      }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.armorScore).toBe(1)
  })

  it('Sage-Touched : nécessite toggle EN PLUS des 4 cartes', () => {
    const char = makeChar({
      domainCards: {
        loadout: ['sage-sage-touched', 'sage-gifted-tracker', 'sage-natures-tongue', 'sage-vicious-entangle'],
        vault: []
      },
      activeEffects: {} // toggle OFF
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.spellcastBonus).toBe(0)

    // Maintenant toggle ON
    char.activeEffects['sage-sage-touched'] = true
    const bonuses2 = computeStatBonuses(char)
    expect(bonuses2.spellcastBonus).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════
//  ACTIVABLES
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — activables', () => {
  it('Deadly Focus : inactif par défaut', () => {
    const char = makeChar({
      domainCards: { loadout: ['blade-deadly-focus'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.proficiency).toBe(0)
  })

  it('Deadly Focus : +1 proficiency quand activé', () => {
    const char = makeChar({
      domainCards: { loadout: ['blade-deadly-focus'], vault: [] },
      activeEffects: { 'blade-deadly-focus': true }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.proficiency).toBe(1)
  })

  it('Frenzy : +10 dégâts, +8 sévère, disable armor quand activé', () => {
    const char = makeChar({
      domainCards: { loadout: ['blade-frenzy'], vault: [] },
      activeEffects: { 'blade-frenzy': true }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.damageBonus).toBe(10)
    expect(bonuses.thresholds.severe).toBe(8)
    expect(bonuses.disableArmor).toBe(true)
  })

  it('Full Surge : +2 tous traits quand activé', () => {
    const char = makeChar({
      domainCards: { loadout: ['valor-full-surge'], vault: [] },
      activeEffects: { 'valor-full-surge': true }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.traitBonus).toEqual({
      agility: 2, strength: 2, finesse: 2,
      instinct: 2, presence: 2, knowledge: 2
    })
  })

  it('Notorious : +10 rollBonus quand activé', () => {
    const char = makeChar({
      domainCards: { loadout: ['grace-notorious'], vault: [] },
      activeEffects: { 'grace-notorious': true }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.rollBonus).toBe(10)
  })
})

// ═══════════════════════════════════════════════════════════
//  PERMANENTS
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — permanents', () => {
  it('applique les effets permanents depuis permanentCardEffects', () => {
    const char = makeChar({
      permanentCardEffects: [
        { cardId: 'blade-vitality', choiceId: 'hp', maxHP: 1, source: 'Vitality (+1 HP slot)' },
        { cardId: 'blade-vitality', choiceId: 'thresholds', thresholds: { major: 2, severe: 2 }, source: 'Vitality (+2 seuils)' }
      ]
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.maxHP).toBe(1)
    expect(bonuses.thresholds.major).toBe(2)
    expect(bonuses.thresholds.severe).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════
//  CUMUL de plusieurs modificateurs
// ═══════════════════════════════════════════════════════════

describe('computeStatBonuses — cumul multi-sources', () => {
  it('cumule ascendance + sous-classe + carte passive', () => {
    const char = makeChar({
      ancestryId: 'simiah', // +1 évasion
      subclassId: '',
      traits: { agility: 4, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      domainCards: { loadout: ['bone-untouchable'], vault: [] } // +2 évasion (agility 4)
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.evasion).toBe(3) // 1 simiah + 2 untouchable
  })

  it('cumule Rise Up + Fortified Armor sur les seuils', () => {
    const char = makeChar({
      proficiency: 2,
      armorId: 'some-armor',
      domainCards: { loadout: ['valor-rise-up', 'blade-fortified-armor'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.thresholds.major).toBe(2) // fortified
    expect(bonuses.thresholds.severe).toBe(4) // 2 rise up + 2 fortified
  })

  it('les cartes non-modificatrices sont ignorées silencieusement', () => {
    const char = makeChar({
      domainCards: { loadout: ['valor-forceful-push', 'bone-deft-maneuvers'], vault: [] }
    })
    const bonuses = computeStatBonuses(char)
    expect(bonuses.sources).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════
//  Tests du store — actions toggle/permanent
// ═══════════════════════════════════════════════════════════

describe('characterStore — actions effets de cartes', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('toggleEffect : active/désactive un effet', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    const char = store.selectedCharacter
    char.domainCards = { loadout: ['midnight-shadowhunter'], vault: [] }

    expect(store.toggleEffect('midnight-shadowhunter')).toBe(true)
    expect(char.activeEffects['midnight-shadowhunter']).toBe(true)

    expect(store.toggleEffect('midnight-shadowhunter')).toBe(false)
    expect(char.activeEffects['midnight-shadowhunter']).toBe(false)
  })

  it('deactivateEffect : désactive un effet spécifique', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    const char = store.selectedCharacter
    char.domainCards = { loadout: ['blade-deadly-focus'], vault: [] }
    char.activeEffects = { 'blade-deadly-focus': true }

    store.deactivateEffect('blade-deadly-focus')
    expect(char.activeEffects['blade-deadly-focus']).toBe(false)
  })

  it('deactivateRestEffects : désactive tous les activables', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    const char = store.selectedCharacter
    char.domainCards = {
      loadout: ['blade-deadly-focus', 'blade-frenzy', 'midnight-shadowhunter'],
      vault: []
    }
    char.activeEffects = {
      'blade-deadly-focus': true,
      'blade-frenzy': true,
      'midnight-shadowhunter': true
    }

    store.deactivateRestEffects()
    // Activables désactivés
    expect(char.activeEffects['blade-deadly-focus']).toBe(false)
    expect(char.activeEffects['blade-frenzy']).toBe(false)
    // Toggle non affecté
    expect(char.activeEffects['midnight-shadowhunter']).toBe(true)
  })

  it('applyPermanentEffect : applique Vitality avec 2 choix', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    const char = store.selectedCharacter
    char.domainCards = { loadout: ['blade-vitality'], vault: [] }

    const result = store.applyPermanentEffect('blade-vitality', ['hp', 'stress'])
    expect(result).toBe(true)
    expect(char.permanentCardEffects).toHaveLength(2)
    expect(char.permanentCardEffects[0].maxHP).toBe(1)
    expect(char.permanentCardEffects[1].maxStress).toBe(1)
    // Carte déplacée en vault
    expect(char.domainCards.loadout).not.toContain('blade-vitality')
    expect(char.domainCards.vault).toContain('blade-vitality')
  })

  it('applyPermanentEffect : empêche la double application', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    const char = store.selectedCharacter
    char.domainCards = { loadout: ['blade-vitality'], vault: [] }

    store.applyPermanentEffect('blade-vitality', ['hp', 'stress'])
    // Seconde tentative avec la carte déjà en vault
    char.domainCards.loadout.push('blade-vitality')
    const result2 = store.applyPermanentEffect('blade-vitality', ['hp', 'thresholds'])
    expect(result2).toBe(false)
  })

  it('hasPermanentEffect : détecte un permanent déjà appliqué', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')

    expect(store.hasPermanentEffect('blade-vitality')).toBe(false)

    const char = store.selectedCharacter
    char.domainCards = { loadout: ['blade-vitality'], vault: [] }
    store.applyPermanentEffect('blade-vitality', ['hp'])
    expect(store.hasPermanentEffect('blade-vitality')).toBe(true)
  })

  it('activeModifiersList : retourne la liste correcte', () => {
    const store = useCharacterStore()
    store.createCharacter('warrior')
    const char = store.selectedCharacter
    char.domainCards = {
      loadout: ['bone-untouchable', 'blade-deadly-focus'],
      vault: []
    }
    char.traits = { agility: 2, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 }

    const list = store.activeModifiersList
    expect(list).toHaveLength(2)

    const untouchable = list.find((m) => m.cardId === 'bone-untouchable')
    expect(untouchable.active).toBe(true)
    expect(untouchable.type).toBe('passive')
    expect(untouchable.canToggle).toBe(false)

    const deadly = list.find((m) => m.cardId === 'blade-deadly-focus')
    expect(deadly.active).toBe(false)
    expect(deadly.type).toBe('activable')
    expect(deadly.canToggle).toBe(true)
  })

  it('selectedEffectiveArmorScore : intègre les bonus de cartes', () => {
    const store = useCharacterStore()
    store.createCharacter('guardian')
    const char = store.selectedCharacter
    char.armorId = 'some-armor'
    char.armorScore = 6
    char.domainCards = { loadout: ['valor-armorer'], vault: [] }

    expect(store.selectedEffectiveArmorScore).toBe(7) // 6 base + 1 armorer
  })
})
