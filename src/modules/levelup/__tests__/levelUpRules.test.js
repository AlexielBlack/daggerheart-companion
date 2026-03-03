/**
 * @module levelup/__tests__/levelUpRules.test
 * @description Tests exhaustifs pour le composable useLevelUpRules.
 *
 * Couvre :
 *   - Calcul des tiers
 *   - Tier Achievements
 *   - Pools d'advancements et slots
 *   - Validation des choix
 *   - Application d'un level up complet
 *   - Rollback (annulation)
 *   - Cas limites et erreurs
 */

import { describe, it, expect } from 'vitest'
import {
  // Constantes
  MAX_LEVEL,
  TIER_ACHIEVEMENT_LEVELS,
  TRAIT_CLEAR_LEVELS,
  ADVANCEMENT_TYPES,
  TRAIT_IDS,
  TIER_ADVANCEMENT_POOLS,

  // Tiers & Niveaux
  getTierForLevel,
  hasTierAchievement,
  shouldClearTraits,
  getTierAchievement,
  canLevelUp,

  // Slots
  getUsedSlots,
  getAdvancementDef,
  getRemainingSlots,

  // Advancements
  getAvailableAdvancements,
  validateAdvancementChoices,

  // Application
  buildLevelUpEntry,
  applyLevelUp,

  // Rollback
  canRollback,
  rollbackLevelUp,

  // Composable
  useLevelUpRules
} from '../composables/useLevelUpRules'

// ── Helpers ──────────────────────────────────────────────

/**
 * Crée un personnage de test minimal.
 * @param {Object} overrides
 * @returns {Object}
 */
function makeCharacter(overrides = {}) {
  return {
    id: 'test-1',
    level: 1,
    proficiency: 1,
    traits: {
      agility: 2,
      strength: 1,
      finesse: 0,
      instinct: 1,
      presence: -1,
      knowledge: 0
    },
    evasion: 11,
    maxHP: 6,
    maxStress: 6,
    experiences: [
      { name: 'Combat', bonus: 0 },
      { name: 'Exploration', bonus: 0 }
    ],
    markedTraits: [],
    levelHistory: [],
    subclassProgression: 'foundation',
    domainCards: { loadout: [], vault: [] },
    ...overrides
  }
}

// ═══════════════════════════════════════════════════════════
//  1. Tiers & Niveaux
// ═══════════════════════════════════════════════════════════

describe('getTierForLevel', () => {
  it('niveau 1 → tier 1', () => {
    expect(getTierForLevel(1)).toBe(1)
  })

  it('niveaux 2-4 → tier 2', () => {
    expect(getTierForLevel(2)).toBe(2)
    expect(getTierForLevel(3)).toBe(2)
    expect(getTierForLevel(4)).toBe(2)
  })

  it('niveaux 5-7 → tier 3', () => {
    expect(getTierForLevel(5)).toBe(3)
    expect(getTierForLevel(6)).toBe(3)
    expect(getTierForLevel(7)).toBe(3)
  })

  it('niveaux 8-10 → tier 4', () => {
    expect(getTierForLevel(8)).toBe(4)
    expect(getTierForLevel(9)).toBe(4)
    expect(getTierForLevel(10)).toBe(4)
  })

  it('niveaux invalides → 0', () => {
    expect(getTierForLevel(0)).toBe(0)
    expect(getTierForLevel(-1)).toBe(0)
    expect(getTierForLevel(11)).toBe(0)
  })
})

describe('hasTierAchievement', () => {
  it('niveaux 2, 5, 8 déclenchent un tier achievement', () => {
    expect(hasTierAchievement(2)).toBe(true)
    expect(hasTierAchievement(5)).toBe(true)
    expect(hasTierAchievement(8)).toBe(true)
  })

  it('autres niveaux ne déclenchent pas de tier achievement', () => {
    expect(hasTierAchievement(1)).toBe(false)
    expect(hasTierAchievement(3)).toBe(false)
    expect(hasTierAchievement(4)).toBe(false)
    expect(hasTierAchievement(6)).toBe(false)
    expect(hasTierAchievement(7)).toBe(false)
    expect(hasTierAchievement(9)).toBe(false)
    expect(hasTierAchievement(10)).toBe(false)
  })
})

describe('shouldClearTraits', () => {
  it('niveaux 5 et 8 effacent les traits', () => {
    expect(shouldClearTraits(5)).toBe(true)
    expect(shouldClearTraits(8)).toBe(true)
  })

  it('niveau 2 ne clear pas les traits', () => {
    expect(shouldClearTraits(2)).toBe(false)
  })

  it('autres niveaux ne clear pas', () => {
    expect(shouldClearTraits(1)).toBe(false)
    expect(shouldClearTraits(3)).toBe(false)
    expect(shouldClearTraits(10)).toBe(false)
  })
})

describe('getTierAchievement', () => {
  it('niveau 2 : nouvelle expérience + proficiency, pas de clear', () => {
    const ta = getTierAchievement(2)
    expect(ta).toEqual({
      newExperience: true,
      proficiencyIncrease: true,
      traitsCleared: false
    })
  })

  it('niveau 5 : inclut le clear des traits', () => {
    const ta = getTierAchievement(5)
    expect(ta.traitsCleared).toBe(true)
  })

  it('niveau 8 : inclut le clear des traits', () => {
    const ta = getTierAchievement(8)
    expect(ta.traitsCleared).toBe(true)
  })

  it('niveau sans tier achievement → null', () => {
    expect(getTierAchievement(1)).toBeNull()
    expect(getTierAchievement(3)).toBeNull()
    expect(getTierAchievement(10)).toBeNull()
  })
})

describe('canLevelUp', () => {
  it('personnage niveau 1 peut level up', () => {
    const char = makeCharacter()
    expect(canLevelUp(char)).toEqual({ canLevel: true, reason: '' })
  })

  it('personnage niveau 9 peut level up', () => {
    const char = makeCharacter({ level: 9 })
    expect(canLevelUp(char)).toEqual({ canLevel: true, reason: '' })
  })

  it('personnage niveau 10 ne peut pas level up', () => {
    const char = makeCharacter({ level: 10 })
    expect(canLevelUp(char).canLevel).toBe(false)
  })

  it('personnage null ne peut pas level up', () => {
    expect(canLevelUp(null).canLevel).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  2. Slots d'advancement
// ═══════════════════════════════════════════════════════════

describe('getUsedSlots', () => {
  it('retourne 0 pour un historique vide', () => {
    expect(getUsedSlots([], 2, ADVANCEMENT_TYPES.HP)).toBe(0)
  })

  it('retourne 0 pour un historique null', () => {
    expect(getUsedSlots(null, 2, ADVANCEMENT_TYPES.HP)).toBe(0)
  })

  it('compte correctement les slots utilisés', () => {
    const history = [
      { advancements: [{ type: 'hp', tier: 2 }, { type: 'stress', tier: 2 }] },
      { advancements: [{ type: 'hp', tier: 2 }, { type: 'evasion', tier: 2 }] }
    ]
    expect(getUsedSlots(history, 2, 'hp')).toBe(2)
    expect(getUsedSlots(history, 2, 'stress')).toBe(1)
    expect(getUsedSlots(history, 2, 'evasion')).toBe(1)
    expect(getUsedSlots(history, 2, 'traits')).toBe(0)
  })

  it('ne compte que le tier demandé', () => {
    const history = [
      { advancements: [{ type: 'hp', tier: 2 }, { type: 'hp', tier: 3 }] }
    ]
    expect(getUsedSlots(history, 2, 'hp')).toBe(1)
    expect(getUsedSlots(history, 3, 'hp')).toBe(1)
  })
})

describe('getAdvancementDef', () => {
  it('retourne la définition pour un type valide', () => {
    const def = getAdvancementDef(2, ADVANCEMENT_TYPES.HP)
    expect(def).toBeDefined()
    expect(def.maxSlots).toBe(2)
  })

  it('retourne null pour un tier invalide', () => {
    expect(getAdvancementDef(1, ADVANCEMENT_TYPES.HP)).toBeNull()
    expect(getAdvancementDef(5, ADVANCEMENT_TYPES.HP)).toBeNull()
  })

  it('retourne null pour un type inexistant dans le tier', () => {
    // Subclass n'existe pas en T2
    expect(getAdvancementDef(2, ADVANCEMENT_TYPES.SUBCLASS)).toBeNull()
  })

  it('proficiency est doubleSlot en T3 et T4', () => {
    expect(getAdvancementDef(3, ADVANCEMENT_TYPES.PROFICIENCY).doubleSlot).toBe(true)
    expect(getAdvancementDef(4, ADVANCEMENT_TYPES.PROFICIENCY).doubleSlot).toBe(true)
  })

  it('domain card a un maxCardLevel en T2 et T3', () => {
    expect(getAdvancementDef(2, ADVANCEMENT_TYPES.DOMAIN_CARD).maxCardLevel).toBe(4)
    expect(getAdvancementDef(3, ADVANCEMENT_TYPES.DOMAIN_CARD).maxCardLevel).toBe(7)
    expect(getAdvancementDef(4, ADVANCEMENT_TYPES.DOMAIN_CARD).maxCardLevel).toBeNull()
  })
})

describe('getRemainingSlots', () => {
  it('retourne maxSlots quand aucun n\'est utilisé', () => {
    expect(getRemainingSlots([], 2, ADVANCEMENT_TYPES.HP)).toBe(2)
    expect(getRemainingSlots([], 2, ADVANCEMENT_TYPES.TRAITS)).toBe(3)
    expect(getRemainingSlots([], 2, ADVANCEMENT_TYPES.EVASION)).toBe(1)
  })

  it('retourne 0 quand tous les slots sont utilisés', () => {
    const history = [
      { advancements: [{ type: 'hp', tier: 2 }, { type: 'hp', tier: 2 }] }
    ]
    expect(getRemainingSlots(history, 2, ADVANCEMENT_TYPES.HP)).toBe(0)
  })

  it('retourne la différence correcte', () => {
    const history = [
      { advancements: [{ type: 'traits', tier: 2 }] }
    ]
    expect(getRemainingSlots(history, 2, ADVANCEMENT_TYPES.TRAITS)).toBe(2)
  })
})

// ═══════════════════════════════════════════════════════════
//  3. Advancements disponibles
// ═══════════════════════════════════════════════════════════

describe('getAvailableAdvancements', () => {
  it('retourne les options T2 pour un personnage niveau 1 (→ 2)', () => {
    const char = makeCharacter({ level: 1 })
    const options = getAvailableAdvancements(char)

    const types = options.map((o) => o.type)
    expect(types).toContain(ADVANCEMENT_TYPES.TRAITS)
    expect(types).toContain(ADVANCEMENT_TYPES.HP)
    expect(types).toContain(ADVANCEMENT_TYPES.STRESS)
    expect(types).toContain(ADVANCEMENT_TYPES.EXPERIENCES)
    expect(types).toContain(ADVANCEMENT_TYPES.DOMAIN_CARD)
    expect(types).toContain(ADVANCEMENT_TYPES.EVASION)
    // Pas de subclass ni proficiency en T2
    expect(types).not.toContain(ADVANCEMENT_TYPES.SUBCLASS)
    expect(types).not.toContain(ADVANCEMENT_TYPES.PROFICIENCY)
  })

  it('tous les options sont du tier 2 pour un personnage niveau 1', () => {
    const char = makeCharacter({ level: 1 })
    const options = getAvailableAdvancements(char)
    for (const opt of options) {
      expect(opt.tier).toBe(2)
    }
  })

  it('inclut T2 et T3 pour un personnage niveau 4 (→ 5)', () => {
    const char = makeCharacter({ level: 4 })
    const options = getAvailableAdvancements(char)
    const tiers = [...new Set(options.map((o) => o.tier))]
    expect(tiers).toContain(2)
    expect(tiers).toContain(3)
  })

  it('inclut T2, T3 et T4 pour un personnage niveau 7 (→ 8)', () => {
    const char = makeCharacter({ level: 7 })
    const options = getAvailableAdvancements(char)
    const tiers = [...new Set(options.map((o) => o.tier))]
    expect(tiers).toContain(2)
    expect(tiers).toContain(3)
    expect(tiers).toContain(4)
  })

  it('T3 inclut subclass et proficiency', () => {
    const char = makeCharacter({ level: 4 })
    const options = getAvailableAdvancements(char)
    const t3Types = options.filter((o) => o.tier === 3).map((o) => o.type)
    expect(t3Types).toContain(ADVANCEMENT_TYPES.SUBCLASS)
    expect(t3Types).toContain(ADVANCEMENT_TYPES.PROFICIENCY)
  })

  it('n\'affiche pas les options dont tous les slots sont utilisés', () => {
    const history = [
      { advancements: [{ type: 'evasion', tier: 2 }, { type: 'hp', tier: 2 }] }
    ]
    const char = makeCharacter({ level: 1, levelHistory: history })
    const options = getAvailableAdvancements(char)
    const t2Evasion = options.find((o) => o.type === ADVANCEMENT_TYPES.EVASION && o.tier === 2)
    // Evasion T2 n'a qu'un seul slot — doit être absent
    expect(t2Evasion).toBeUndefined()
  })

  it('désactive traits si moins de 2 traits non marqués', () => {
    // Marquer 5 traits sur 6 → il reste 1 non marqué → disabled
    const char = makeCharacter({
      level: 1,
      markedTraits: ['agility', 'strength', 'finesse', 'instinct', 'presence']
    })
    const options = getAvailableAdvancements(char)
    const traitsOpt = options.find((o) => o.type === ADVANCEMENT_TYPES.TRAITS && o.tier === 2)
    expect(traitsOpt.disabled).toBe(true)
    expect(traitsOpt.disabledReason).toBeTruthy()
  })

  it('réactive traits si le tier achievement clear les marks (→ niveau 5)', () => {
    const char = makeCharacter({
      level: 4,
      markedTraits: ['agility', 'strength', 'finesse', 'instinct', 'presence']
    })
    const options = getAvailableAdvancements(char)
    // Niveau 5 clear les traits → effectiveMarkedTraits = []
    const traitsOpts = options.filter((o) => o.type === ADVANCEMENT_TYPES.TRAITS)
    for (const opt of traitsOpts) {
      expect(opt.disabled).toBe(false)
    }
  })

  it('retourne un tableau vide pour un personnage null', () => {
    expect(getAvailableAdvancements(null)).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
//  4. Validation des choix d'advancement
// ═══════════════════════════════════════════════════════════

describe('validateAdvancementChoices', () => {
  it('valide 2 choix simples corrects', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('valide un choix double-slot seul', () => {
    const char = makeCharacter({ level: 4 }) // → niveau 5, tier 3
    const choices = [
      { type: ADVANCEMENT_TYPES.PROFICIENCY, tier: 3 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(true)
  })

  it('rejette un double-slot combiné avec un autre choix', () => {
    const char = makeCharacter({ level: 4 })
    const choices = [
      { type: ADVANCEMENT_TYPES.PROFICIENCY, tier: 3 },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('double-slot'))).toBe(true)
  })

  it('rejette 0 choix', () => {
    const char = makeCharacter({ level: 1 })
    const result = validateAdvancementChoices(char, [])
    expect(result.valid).toBe(false)
  })

  it('rejette 3 choix simples (trop de points)', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 },
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('2 points'))).toBe(true)
  })

  it('rejette un tier inaccessible', () => {
    const char = makeCharacter({ level: 1 }) // → niveau 2, tier 2
    const choices = [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.SUBCLASS, tier: 3 } // T3 inaccessible
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('tier 3'))).toBe(true)
  })

  it('rejette quand pas assez de slots restants', () => {
    const history = [
      { advancements: [{ type: 'evasion', tier: 2 }] }
    ]
    const char = makeCharacter({ level: 2, levelHistory: history })
    const choices = [
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 }, // Plus de slot
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
  })

  it('valide le choix de traits avec 2 traits non marqués', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(true)
  })

  it('rejette traits sans la propriété traits', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2 }, // Manque traits
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('exactement 2 traits'))).toBe(true)
  })

  it('rejette traits déjà marqués', () => {
    const char = makeCharacter({ level: 1, markedTraits: ['agility'] })
    const choices = [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('agility'))).toBe(true)
  })

  it('rejette deux fois le même trait dans deux choix traits séparés', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'finesse'] } // agility déjà marqué
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('agility'))).toBe(true)
  })

  it('rejette un trait ID inconnu', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'charisma'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('charisma'))).toBe(true)
  })

  it('valide les traits cleared au niveau 5 (les marks sont effacés avant)', () => {
    const char = makeCharacter({
      level: 4,
      markedTraits: ['agility', 'strength', 'finesse', 'instinct']
    })
    // Niveau 5 clear les traits → agility et strength redeviennent disponibles
    const choices = [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 3, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(true)
  })

  it('rejette avec un personnage null', () => {
    const result = validateAdvancementChoices(null, [])
    expect(result.valid).toBe(false)
  })

  it('valide 2 choix du même type si assez de slots', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ]
    // HP a 2 slots en T2 → valide
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(true)
  })

  it('rejette 2 choix du même type si pas assez de slots', () => {
    const char = makeCharacter({ level: 1 })
    const choices = [
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 }
    ]
    // Evasion n'a qu'1 slot en T2 → invalide
    const result = validateAdvancementChoices(char, choices)
    expect(result.valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  5. Construction d'entrée level up
// ═══════════════════════════════════════════════════════════

describe('buildLevelUpEntry', () => {
  it('crée une entrée correcte avec tier achievement', () => {
    const advancements = [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ]
    const entry = buildLevelUpEntry(2, getTierAchievement(2), advancements, 'grace-1')

    expect(entry.level).toBe(2)
    expect(entry.tier).toBe(2)
    expect(entry.tierAchievement).toEqual({
      newExperience: true,
      proficiencyIncrease: true,
      traitsCleared: false
    })
    expect(entry.advancements).toHaveLength(2)
    expect(entry.domainCard).toBe('grace-1')
    expect(entry.timestamp).toBeTruthy()
  })

  it('crée une entrée sans tier achievement', () => {
    const advancements = [{ type: ADVANCEMENT_TYPES.HP, tier: 2 }]
    const entry = buildLevelUpEntry(3, null, advancements, null)
    expect(entry.tierAchievement).toBeNull()
    expect(entry.domainCard).toBeNull()
  })

  it('ne mute pas le tableau d\'advancements original', () => {
    const advancements = [{ type: ADVANCEMENT_TYPES.HP, tier: 2, extra: 'data' }]
    const entry = buildLevelUpEntry(2, null, advancements, null)
    expect(entry.advancements[0]).not.toBe(advancements[0])
    expect(entry.advancements[0].extra).toBe('data')
  })
})

// ═══════════════════════════════════════════════════════════
//  6. Application d'un level up
// ═══════════════════════════════════════════════════════════

describe('applyLevelUp', () => {
  it('incrémente le niveau', () => {
    const char = makeCharacter()
    const entry = buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null)
    applyLevelUp(char, entry)
    expect(char.level).toBe(2)
  })

  it('applique le tier achievement : nouvelle expérience +2', () => {
    const char = makeCharacter()
    const entry = buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null)
    applyLevelUp(char, entry)
    expect(char.experiences).toHaveLength(3)
    expect(char.experiences[2].bonus).toBe(2)
    expect(char.experiences[2].name).toBe('')
  })

  it('applique le tier achievement : +1 proficiency', () => {
    const char = makeCharacter()
    applyLevelUp(char, buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null))
    expect(char.proficiency).toBe(2) // 1 + 1
  })

  it('applique le tier achievement : clear traits au niveau 5', () => {
    const char = makeCharacter({ level: 4, markedTraits: ['agility', 'strength'] })
    applyLevelUp(char, buildLevelUpEntry(5, getTierAchievement(5), [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null))
    // Traits effacés AVANT les advancements
    expect(char.markedTraits).toEqual([])
  })

  it('applique advancement HP : +1 maxHP', () => {
    const char = makeCharacter({ maxHP: 6 })
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 }
    ], null))
    expect(char.maxHP).toBe(7)
  })

  it('applique advancement Stress : +1 maxStress', () => {
    const char = makeCharacter({ maxStress: 6 })
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))
    expect(char.maxStress).toBe(7)
  })

  it('applique advancement Evasion : +1', () => {
    const char = makeCharacter({ evasion: 11 })
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))
    expect(char.evasion).toBe(12)
  })

  it('applique advancement Traits : +1 à 2 traits et les marque', () => {
    const char = makeCharacter()
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'finesse'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))
    expect(char.traits.agility).toBe(3)  // 2 + 1
    expect(char.traits.finesse).toBe(1)  // 0 + 1
    expect(char.markedTraits).toContain('agility')
    expect(char.markedTraits).toContain('finesse')
  })

  it('applique advancement Expériences : +1 à 2 expériences', () => {
    const char = makeCharacter()
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.EXPERIENCES, tier: 2, experiences: [0, 1] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))
    expect(char.experiences[0].bonus).toBe(1) // 0 + 1
    expect(char.experiences[1].bonus).toBe(1) // 0 + 1
  })

  it('applique advancement Proficiency (double-slot) : +1', () => {
    const char = makeCharacter({ level: 4, proficiency: 2 })
    applyLevelUp(char, buildLevelUpEntry(5, null, [
      { type: ADVANCEMENT_TYPES.PROFICIENCY, tier: 3 }
    ], null))
    expect(char.proficiency).toBe(3)
  })

  it('applique advancement Subclass : avance la progression', () => {
    const char = makeCharacter({ subclassProgression: 'foundation' })
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.SUBCLASS, tier: 3 },
      // C'est un cas hypothétique pour le test
    ], null))
    expect(char.subclassProgression).toBe('specialization')
  })

  it('ajoute l\'entrée dans levelHistory', () => {
    const char = makeCharacter()
    const entry = buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], 'blade-2')
    applyLevelUp(char, entry)
    expect(char.levelHistory).toHaveLength(1)
    expect(char.levelHistory[0].level).toBe(2)
    expect(char.levelHistory[0].domainCard).toBe('blade-2')
  })

  it('gère un personnage sans levelHistory initial', () => {
    const char = makeCharacter()
    delete char.levelHistory
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null))
    expect(char.levelHistory).toHaveLength(1)
  })

  it('gère un personnage sans markedTraits initial', () => {
    const char = makeCharacter()
    delete char.markedTraits
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))
    expect(char.markedTraits).toContain('agility')
  })

  it('retourne le personnage pour chaînage', () => {
    const char = makeCharacter()
    const result = applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null))
    expect(result).toBe(char)
  })
})

// ═══════════════════════════════════════════════════════════
//  7. Scénario complet multi-niveaux
// ═══════════════════════════════════════════════════════════

describe('scénario : level 1 → 5', () => {
  it('progression complète de 4 levels', () => {
    const char = makeCharacter()

    // ── Level 2 (tier achievement) ──
    let entry = buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], 'grace-1')
    applyLevelUp(char, entry)

    expect(char.level).toBe(2)
    expect(char.proficiency).toBe(2) // tier achievement
    expect(char.experiences).toHaveLength(3) // +1 tier achievement
    expect(char.traits.agility).toBe(3)
    expect(char.maxHP).toBe(7)
    expect(char.markedTraits).toEqual(['agility', 'strength'])

    // ── Level 3 ──
    entry = buildLevelUpEntry(3, null, [
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 },
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 }
    ], 'blade-2')
    applyLevelUp(char, entry)

    expect(char.level).toBe(3)
    expect(char.maxStress).toBe(7)
    expect(char.evasion).toBe(12)

    // ── Level 4 ──
    entry = buildLevelUpEntry(4, null, [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['finesse', 'instinct'] }
    ], 'valor-3')
    applyLevelUp(char, entry)

    expect(char.level).toBe(4)
    expect(char.maxHP).toBe(8)
    expect(char.traits.finesse).toBe(1)
    expect(char.markedTraits).toEqual(['agility', 'strength', 'finesse', 'instinct'])

    // ── Level 5 (tier achievement + clear traits) ──
    entry = buildLevelUpEntry(5, getTierAchievement(5), [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 3, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 3 }
    ], 'sage-4')
    applyLevelUp(char, entry)

    expect(char.level).toBe(5)
    expect(char.proficiency).toBe(3) // +1 tier achievement
    expect(char.experiences).toHaveLength(4) // +1 tier achievement
    expect(char.traits.agility).toBe(4) // 3 + 1 (traits cleared puis re-augmenté)
    expect(char.maxStress).toBe(8)
    // markedTraits effacés puis re-marqués : seulement agility et strength
    expect(char.markedTraits).toEqual(['agility', 'strength'])

    // Vérification de l'historique complet
    expect(char.levelHistory).toHaveLength(4)
  })
})

// ═══════════════════════════════════════════════════════════
//  8. Rollback
// ═══════════════════════════════════════════════════════════

describe('canRollback', () => {
  it('impossible sans historique', () => {
    const char = makeCharacter()
    expect(canRollback(char).canRollback).toBe(false)
  })

  it('impossible au niveau 1', () => {
    const char = makeCharacter({ levelHistory: [{}] })
    expect(canRollback(char).canRollback).toBe(false)
  })

  it('possible avec historique et niveau > 1', () => {
    const char = makeCharacter({ level: 2, levelHistory: [{ level: 2, advancements: [] }] })
    expect(canRollback(char).canRollback).toBe(true)
  })

  it('impossible avec personnage null', () => {
    expect(canRollback(null).canRollback).toBe(false)
  })
})

describe('rollbackLevelUp', () => {
  it('annule un simple level up HP + Stress', () => {
    const char = makeCharacter()
    const entry = buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null)
    applyLevelUp(char, entry)

    // Vérifier l'état post-level up
    expect(char.level).toBe(2)
    expect(char.maxHP).toBe(7)
    expect(char.maxStress).toBe(7)
    expect(char.proficiency).toBe(2)
    expect(char.experiences).toHaveLength(3)

    // Rollback
    const result = rollbackLevelUp(char)
    expect(result.success).toBe(true)
    expect(result.removedEntry.level).toBe(2)

    // Vérifier l'état post-rollback
    expect(char.level).toBe(1)
    expect(char.maxHP).toBe(6)
    expect(char.maxStress).toBe(6)
    expect(char.proficiency).toBe(1)
    expect(char.experiences).toHaveLength(2) // expérience ajoutée retirée
    expect(char.levelHistory).toHaveLength(0)
  })

  it('annule un level up avec traits', () => {
    const char = makeCharacter()
    const entry = buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'finesse'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null)
    applyLevelUp(char, entry)

    expect(char.traits.agility).toBe(3)
    expect(char.traits.finesse).toBe(1)
    expect(char.markedTraits).toEqual(['agility', 'finesse'])

    rollbackLevelUp(char)

    expect(char.traits.agility).toBe(2) // restauré
    expect(char.traits.finesse).toBe(0) // restauré
    expect(char.markedTraits).toEqual([]) // traits unmarked
  })

  it('annule un level up avec evasion', () => {
    const char = makeCharacter({ evasion: 11 })
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))

    expect(char.evasion).toBe(12)
    rollbackLevelUp(char)
    expect(char.evasion).toBe(11)
  })

  it('annule un level up avec proficiency (double-slot)', () => {
    const char = makeCharacter({ level: 4, proficiency: 2 })
    applyLevelUp(char, buildLevelUpEntry(5, null, [
      { type: ADVANCEMENT_TYPES.PROFICIENCY, tier: 3 }
    ], null))

    expect(char.proficiency).toBe(3)
    rollbackLevelUp(char)
    expect(char.proficiency).toBe(2)
  })

  it('annule un level up avec subclass progression', () => {
    const char = makeCharacter({ subclassProgression: 'foundation' })
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.SUBCLASS, tier: 3 },
    ], null))

    expect(char.subclassProgression).toBe('specialization')
    rollbackLevelUp(char)
    expect(char.subclassProgression).toBe('foundation')
  })

  it('annule correctement un level 5 avec clear traits', () => {
    const char = makeCharacter()

    // Level 2 : marquer agility + strength
    applyLevelUp(char, buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'strength'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))
    // Level 3
    applyLevelUp(char, buildLevelUpEntry(3, null, [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['finesse', 'instinct'] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))
    // Level 4
    applyLevelUp(char, buildLevelUpEntry(4, null, [
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 },
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 }
    ], null))

    // Level 5 : tier achievement clear les traits, puis on re-marque
    applyLevelUp(char, buildLevelUpEntry(5, getTierAchievement(5), [
      { type: ADVANCEMENT_TYPES.TRAITS, tier: 3, traits: ['agility', 'presence'] },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 3 }
    ], null))

    expect(char.level).toBe(5)
    expect(char.markedTraits).toEqual(['agility', 'presence'])

    // Rollback du level 5
    rollbackLevelUp(char)

    expect(char.level).toBe(4)
    // Les traits marqués doivent être restaurés depuis l'historique restant
    // Levels 2+3 ont marqué : agility, strength, finesse, instinct
    expect(char.markedTraits).toContain('agility')
    expect(char.markedTraits).toContain('strength')
    expect(char.markedTraits).toContain('finesse')
    expect(char.markedTraits).toContain('instinct')
    expect(char.markedTraits).toHaveLength(4)
  })

  it('retourne une erreur pour un personnage sans historique', () => {
    const char = makeCharacter()
    const result = rollbackLevelUp(char)
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('annule un level up avec expériences', () => {
    const char = makeCharacter()
    applyLevelUp(char, buildLevelUpEntry(2, null, [
      { type: ADVANCEMENT_TYPES.EXPERIENCES, tier: 2, experiences: [0, 1] },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))

    expect(char.experiences[0].bonus).toBe(1)
    expect(char.experiences[1].bonus).toBe(1)

    rollbackLevelUp(char)

    expect(char.experiences[0].bonus).toBe(0)
    expect(char.experiences[1].bonus).toBe(0)
  })

  it('rollback multiple : 2 level ups annulés en séquence', () => {
    const char = makeCharacter()

    applyLevelUp(char, buildLevelUpEntry(2, getTierAchievement(2), [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ], null))

    applyLevelUp(char, buildLevelUpEntry(3, null, [
      { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
      { type: ADVANCEMENT_TYPES.HP, tier: 2 }
    ], null))

    expect(char.level).toBe(3)

    rollbackLevelUp(char)
    expect(char.level).toBe(2)
    expect(char.evasion).toBe(11) // restauré
    expect(char.maxHP).toBe(7) // seulement le +1 du level 2

    rollbackLevelUp(char)
    expect(char.level).toBe(1)
    expect(char.maxHP).toBe(6)
    expect(char.maxStress).toBe(6)
    expect(char.proficiency).toBe(1)
  })
})

// ═══════════════════════════════════════════════════════════
//  9. Constantes & Cohérence des données
// ═══════════════════════════════════════════════════════════

describe('constantes et cohérence', () => {
  it('MAX_LEVEL est 10', () => {
    expect(MAX_LEVEL).toBe(10)
  })

  it('TIER_ACHIEVEMENT_LEVELS contient 2, 5, 8', () => {
    expect(TIER_ACHIEVEMENT_LEVELS).toEqual([2, 5, 8])
  })

  it('TRAIT_CLEAR_LEVELS contient 5, 8', () => {
    expect(TRAIT_CLEAR_LEVELS).toEqual([5, 8])
  })

  it('TRAIT_IDS contient les 6 traits', () => {
    expect(TRAIT_IDS).toHaveLength(6)
    expect(TRAIT_IDS).toContain('agility')
    expect(TRAIT_IDS).toContain('knowledge')
  })

  it('chaque tier a un pool d\'advancements défini', () => {
    expect(TIER_ADVANCEMENT_POOLS[2]).toBeDefined()
    expect(TIER_ADVANCEMENT_POOLS[3]).toBeDefined()
    expect(TIER_ADVANCEMENT_POOLS[4]).toBeDefined()
    expect(TIER_ADVANCEMENT_POOLS[1]).toBeUndefined()
  })

  it('T2 n\'a pas subclass ni proficiency', () => {
    const t2Types = TIER_ADVANCEMENT_POOLS[2].map((a) => a.type)
    expect(t2Types).not.toContain(ADVANCEMENT_TYPES.SUBCLASS)
    expect(t2Types).not.toContain(ADVANCEMENT_TYPES.PROFICIENCY)
  })

  it('T3 et T4 ont subclass et proficiency', () => {
    const t3Types = TIER_ADVANCEMENT_POOLS[3].map((a) => a.type)
    const t4Types = TIER_ADVANCEMENT_POOLS[4].map((a) => a.type)
    expect(t3Types).toContain(ADVANCEMENT_TYPES.SUBCLASS)
    expect(t3Types).toContain(ADVANCEMENT_TYPES.PROFICIENCY)
    expect(t4Types).toContain(ADVANCEMENT_TYPES.SUBCLASS)
    expect(t4Types).toContain(ADVANCEMENT_TYPES.PROFICIENCY)
  })

  it('le composable useLevelUpRules expose toutes les fonctions', () => {
    const rules = useLevelUpRules()
    expect(typeof rules.getTierForLevel).toBe('function')
    expect(typeof rules.hasTierAchievement).toBe('function')
    expect(typeof rules.shouldClearTraits).toBe('function')
    expect(typeof rules.canLevelUp).toBe('function')
    expect(typeof rules.getAvailableAdvancements).toBe('function')
    expect(typeof rules.validateAdvancementChoices).toBe('function')
    expect(typeof rules.applyLevelUp).toBe('function')
    expect(typeof rules.rollbackLevelUp).toBe('function')
    expect(typeof rules.canRollback).toBe('function')
    expect(typeof rules.buildLevelUpEntry).toBe('function')
    expect(typeof rules.getUsedSlots).toBe('function')
    expect(typeof rules.getRemainingSlots).toBe('function')
    expect(typeof rules.getAdvancementDef).toBe('function')
    expect(rules.MAX_LEVEL).toBe(10)
    expect(rules.ADVANCEMENT_TYPES).toBeDefined()
  })
})
