/**
 * @module npcs/__tests__/combatConstants.test
 * @description Tests des constantes et fonctions utilitaires
 * du système de combat PNJ : types, thèmes, conditions,
 * proficiency, cooldowns, countdowns, validation.
 */

import { describe, it, expect } from 'vitest'
import {
  // Types d'adversaire
  ALL_ADVERSARY_TYPES,
  ADVERSARY_TYPE_META,
  ADVERSARY_TYPE_BRUISER,
  ADVERSARY_TYPE_SOLO,
  isValidAdversaryType,

  // Thèmes
  ALL_THEMES,
  THEME_META,
  THEME_HUMANOID,
  THEME_BESTIAL,
  isValidTheme,

  // Conditions
  ALL_CONDITIONS,
  STANDARD_CONDITIONS,
  SPECIAL_CONDITIONS,
  CONDITION_META,
  CONDITION_VULNERABLE,
  CONDITION_STUNNED,
  isValidCondition,

  // Proficiency
  PROFICIENCY_BY_TIER,
  TIER_BENCHMARKS,
  isValidTier,
  isValidProficiency,

  // Profils combat
  ALL_COMBAT_PROFILES,
  COMBAT_PROFILE_NONE,
  COMBAT_PROFILE_LINKED,
  COMBAT_PROFILE_CUSTOM,
  COMBAT_PROFILE_META,
  isValidCombatProfile,

  // Cooldowns
  ALL_COOLDOWNS,
  COOLDOWN_NONE,
  COOLDOWN_2_SPOTLIGHTS,
  COOLDOWN_PER_SCENE,
  COOLDOWN_PER_REST,
  COOLDOWN_PER_LONG_REST,
  COOLDOWN_META,
  computeAllyCooldown,
  computeEnemyResolution,
  isValidCooldown,

  // Countdowns
  createCountdown,

  // Combat features
  ALL_FEATURE_SOURCES,
  FEATURE_SOURCE_ADVERSARY,
  FEATURE_SOURCE_DOMAIN,
  FEATURE_SOURCE_HOMEBREW,
  createCombatFeature,
  validateCombatFeature
} from '../combatConstants.js'

// ═══════════════════════════════════════════════════════════
//  Types d'adversaire
// ═══════════════════════════════════════════════════════════

describe('Types d\'adversaire SRD', () => {
  it('expose les 10 types du SRD', () => {
    expect(ALL_ADVERSARY_TYPES).toHaveLength(10)
  })

  it('chaque type a des métadonnées complètes', () => {
    for (const type of ALL_ADVERSARY_TYPES) {
      const meta = ADVERSARY_TYPE_META[type]
      expect(meta).toBeDefined()
      expect(meta.label).toBeTruthy()
      expect(meta.labelEn).toBeTruthy()
      expect(meta.emoji).toBeTruthy()
      expect(meta.description).toBeTruthy()
    }
  })

  it('isValidAdversaryType accepte les types valides', () => {
    expect(isValidAdversaryType(ADVERSARY_TYPE_BRUISER)).toBe(true)
    expect(isValidAdversaryType(ADVERSARY_TYPE_SOLO)).toBe(true)
  })

  it('isValidAdversaryType rejette les valeurs invalides', () => {
    expect(isValidAdversaryType('dragon')).toBe(false)
    expect(isValidAdversaryType('')).toBe(false)
    expect(isValidAdversaryType(null)).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  Thèmes
// ═══════════════════════════════════════════════════════════

describe('Thèmes de features', () => {
  it('expose les 6 thèmes', () => {
    expect(ALL_THEMES).toHaveLength(6)
  })

  it('chaque thème a des métadonnées complètes', () => {
    for (const theme of ALL_THEMES) {
      const meta = THEME_META[theme]
      expect(meta).toBeDefined()
      expect(meta.label).toBeTruthy()
      expect(meta.emoji).toBeTruthy()
      expect(meta.description).toBeTruthy()
      expect(meta.examples).toBeTruthy()
    }
  })

  it('isValidTheme valide correctement', () => {
    expect(isValidTheme(THEME_HUMANOID)).toBe(true)
    expect(isValidTheme(THEME_BESTIAL)).toBe(true)
    expect(isValidTheme('alien')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  Conditions
// ═══════════════════════════════════════════════════════════

describe('Conditions', () => {
  it('les conditions standard sont au nombre de 3', () => {
    expect(STANDARD_CONDITIONS).toHaveLength(3)
    expect(STANDARD_CONDITIONS).toContain(CONDITION_VULNERABLE)
  })

  it('les conditions spéciales incluent stunned, cursed, etc.', () => {
    expect(SPECIAL_CONDITIONS).toContain(CONDITION_STUNNED)
    expect(SPECIAL_CONDITIONS.length).toBeGreaterThanOrEqual(4)
  })

  it('ALL_CONDITIONS = standard + spéciales', () => {
    expect(ALL_CONDITIONS).toHaveLength(STANDARD_CONDITIONS.length + SPECIAL_CONDITIONS.length)
    for (const c of STANDARD_CONDITIONS) {
      expect(ALL_CONDITIONS).toContain(c)
    }
    for (const c of SPECIAL_CONDITIONS) {
      expect(ALL_CONDITIONS).toContain(c)
    }
  })

  it('chaque condition a des métadonnées complètes', () => {
    for (const cond of ALL_CONDITIONS) {
      const meta = CONDITION_META[cond]
      expect(meta).toBeDefined()
      expect(meta.label).toBeTruthy()
      expect(meta.emoji).toBeTruthy()
      expect(meta.description).toBeTruthy()
      expect(typeof meta.temporary).toBe('boolean')
    }
  })

  it('isValidCondition valide correctement', () => {
    expect(isValidCondition(CONDITION_VULNERABLE)).toBe(true)
    expect(isValidCondition(CONDITION_STUNNED)).toBe(true)
    expect(isValidCondition('petrified')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  Proficiency & Tiers
// ═══════════════════════════════════════════════════════════

describe('Proficiency par tier', () => {
  it('couvre les 4 tiers', () => {
    expect(Object.keys(PROFICIENCY_BY_TIER)).toHaveLength(4)
  })

  it('Tier 1 = fourchette 1-1', () => {
    expect(PROFICIENCY_BY_TIER[1]).toEqual({ min: 1, max: 1, default: 1 })
  })

  it('Tier 2 = fourchette 2-2', () => {
    expect(PROFICIENCY_BY_TIER[2]).toEqual({ min: 2, max: 2, default: 2 })
  })

  it('Tier 3 = fourchette 3-4', () => {
    expect(PROFICIENCY_BY_TIER[3]).toEqual({ min: 3, max: 4, default: 3 })
  })

  it('Tier 4 = fourchette 5-6', () => {
    expect(PROFICIENCY_BY_TIER[4]).toEqual({ min: 5, max: 6, default: 5 })
  })

  it('isValidTier accepte 1-4', () => {
    expect(isValidTier(1)).toBe(true)
    expect(isValidTier(4)).toBe(true)
    expect(isValidTier(0)).toBe(false)
    expect(isValidTier(5)).toBe(false)
    expect(isValidTier(1.5)).toBe(false)
  })

  it('isValidProficiency respecte la fourchette du tier', () => {
    // Tier 1 : seulement 1
    expect(isValidProficiency(1, 1)).toBe(true)
    expect(isValidProficiency(2, 1)).toBe(false)
    // Tier 3 : 3 ou 4
    expect(isValidProficiency(3, 3)).toBe(true)
    expect(isValidProficiency(4, 3)).toBe(true)
    expect(isValidProficiency(5, 3)).toBe(false)
    // Tier 4 : 5 ou 6
    expect(isValidProficiency(5, 4)).toBe(true)
    expect(isValidProficiency(6, 4)).toBe(true)
    expect(isValidProficiency(4, 4)).toBe(false)
  })

  it('isValidProficiency rejette un tier invalide', () => {
    expect(isValidProficiency(1, 0)).toBe(false)
    expect(isValidProficiency(1, 5)).toBe(false)
  })
})

describe('Benchmarks par tier', () => {
  it('couvre les 4 tiers', () => {
    expect(Object.keys(TIER_BENCHMARKS)).toHaveLength(4)
  })

  it('le modificateur d\'attaque augmente avec le tier', () => {
    expect(TIER_BENCHMARKS[1].attackModifier).toBe(1)
    expect(TIER_BENCHMARKS[2].attackModifier).toBe(2)
    expect(TIER_BENCHMARKS[3].attackModifier).toBe(3)
    expect(TIER_BENCHMARKS[4].attackModifier).toBe(4)
  })

  it('la difficulté augmente avec le tier', () => {
    expect(TIER_BENCHMARKS[1].difficulty).toBe(11)
    expect(TIER_BENCHMARKS[4].difficulty).toBe(20)
  })

  it('les seuils de dégâts augmentent avec le tier', () => {
    expect(TIER_BENCHMARKS[1].thresholds.major).toBeLessThan(TIER_BENCHMARKS[4].thresholds.major)
    expect(TIER_BENCHMARKS[1].thresholds.severe).toBeLessThan(TIER_BENCHMARKS[4].thresholds.severe)
  })
})

// ═══════════════════════════════════════════════════════════
//  Profils combat
// ═══════════════════════════════════════════════════════════

describe('Modes de profil combat', () => {
  it('expose 3 modes', () => {
    expect(ALL_COMBAT_PROFILES).toHaveLength(3)
    expect(ALL_COMBAT_PROFILES).toContain(COMBAT_PROFILE_NONE)
    expect(ALL_COMBAT_PROFILES).toContain(COMBAT_PROFILE_LINKED)
    expect(ALL_COMBAT_PROFILES).toContain(COMBAT_PROFILE_CUSTOM)
  })

  it('chaque mode a des métadonnées', () => {
    for (const mode of ALL_COMBAT_PROFILES) {
      expect(COMBAT_PROFILE_META[mode]).toBeDefined()
      expect(COMBAT_PROFILE_META[mode].label).toBeTruthy()
    }
  })

  it('isValidCombatProfile valide correctement', () => {
    expect(isValidCombatProfile(COMBAT_PROFILE_LINKED)).toBe(true)
    expect(isValidCombatProfile('magic')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  Cooldowns alliés
// ═══════════════════════════════════════════════════════════

describe('Cooldowns alliés', () => {
  it('expose 5 niveaux de cooldown', () => {
    expect(ALL_COOLDOWNS).toHaveLength(5)
  })

  it('chaque cooldown a des métadonnées', () => {
    for (const cd of ALL_COOLDOWNS) {
      expect(COOLDOWN_META[cd]).toBeDefined()
      expect(COOLDOWN_META[cd].label).toBeTruthy()
    }
  })

  it('isValidCooldown valide correctement', () => {
    expect(isValidCooldown(COOLDOWN_NONE)).toBe(true)
    expect(isValidCooldown(COOLDOWN_PER_SCENE)).toBe(true)
    expect(isValidCooldown('instant')).toBe(false)
  })
})

describe('computeAllyCooldown', () => {
  it('coût gratuit → pas de cooldown', () => {
    expect(computeAllyCooldown({ type: 'free', amount: 0 }, null)).toBe(COOLDOWN_NONE)
    expect(computeAllyCooldown(null, null)).toBe(COOLDOWN_NONE)
  })

  it('1 stress → pas de cooldown', () => {
    expect(computeAllyCooldown({ type: 'stress', amount: 1 }, null)).toBe(COOLDOWN_NONE)
  })

  it('2+ stress → cooldown par scène', () => {
    expect(computeAllyCooldown({ type: 'stress', amount: 2 }, null)).toBe(COOLDOWN_PER_SCENE)
  })

  it('1 hope → cooldown 2 spotlights', () => {
    expect(computeAllyCooldown({ type: 'hope', amount: 1 }, null)).toBe(COOLDOWN_2_SPOTLIGHTS)
  })

  it('1 fear → cooldown 2 spotlights', () => {
    expect(computeAllyCooldown({ type: 'fear', amount: 1 }, null)).toBe(COOLDOWN_2_SPOTLIGHTS)
  })

  it('2+ hope → cooldown par scène', () => {
    expect(computeAllyCooldown({ type: 'hope', amount: 2 }, null)).toBe(COOLDOWN_PER_SCENE)
    expect(computeAllyCooldown({ type: 'hope', amount: 3 }, null)).toBe(COOLDOWN_PER_SCENE)
  })

  it('2+ fear → cooldown par scène', () => {
    expect(computeAllyCooldown({ type: 'fear', amount: 2 }, null)).toBe(COOLDOWN_PER_SCENE)
  })

  it('la fréquence SRD prend le dessus sur le coût', () => {
    const costHope = { type: 'hope', amount: 1 }
    expect(computeAllyCooldown(costHope, 'oncePerLongRest')).toBe(COOLDOWN_PER_LONG_REST)
    expect(computeAllyCooldown(costHope, 'oncePerShortRest')).toBe(COOLDOWN_PER_REST)
    expect(computeAllyCooldown(costHope, 'oncePerSession')).toBe(COOLDOWN_PER_SCENE)
  })

  it('fréquence atWill ne prend pas le dessus', () => {
    expect(computeAllyCooldown({ type: 'hope', amount: 1 }, 'atWill')).toBe(COOLDOWN_2_SPOTLIGHTS)
  })
})

describe('computeEnemyResolution', () => {
  it('null → null', () => {
    expect(computeEnemyResolution(null)).toBeNull()
  })

  it('hope → fear (même montant)', () => {
    expect(computeEnemyResolution({ type: 'hope', amount: 2 })).toEqual({ type: 'fear', amount: 2 })
  })

  it('fear reste fear', () => {
    expect(computeEnemyResolution({ type: 'fear', amount: 1 })).toEqual({ type: 'fear', amount: 1 })
  })

  it('stress reste stress', () => {
    expect(computeEnemyResolution({ type: 'stress', amount: 1 })).toEqual({ type: 'stress', amount: 1 })
  })

  it('free reste free', () => {
    expect(computeEnemyResolution({ type: 'free', amount: 0 })).toEqual({ type: 'free', amount: 0 })
  })

  it('ne mute pas l\'objet original', () => {
    const original = { type: 'hope', amount: 1 }
    const result = computeEnemyResolution(original)
    expect(result).not.toBe(original)
    expect(original.type).toBe('hope')
  })
})

// ═══════════════════════════════════════════════════════════
//  Countdowns
// ═══════════════════════════════════════════════════════════

describe('createCountdown', () => {
  it('crée un countdown avec defaults (6, non-loop)', () => {
    const cd = createCountdown()
    expect(cd.value).toBe(6)
    expect(cd.loop).toBe(false)
    expect(cd.current).toBe(6)
  })

  it('respecte les overrides', () => {
    const cd = createCountdown({ value: 4, loop: true })
    expect(cd.value).toBe(4)
    expect(cd.loop).toBe(true)
    expect(cd.current).toBe(4)
  })

  it('current peut être initialisé indépendamment', () => {
    const cd = createCountdown({ value: 8, current: 3 })
    expect(cd.value).toBe(8)
    expect(cd.current).toBe(3)
  })
})

// ═══════════════════════════════════════════════════════════
//  Combat Features — Modèle
// ═══════════════════════════════════════════════════════════

describe('Sources de features', () => {
  it('expose 3 sources', () => {
    expect(ALL_FEATURE_SOURCES).toHaveLength(3)
    expect(ALL_FEATURE_SOURCES).toContain(FEATURE_SOURCE_ADVERSARY)
    expect(ALL_FEATURE_SOURCES).toContain(FEATURE_SOURCE_DOMAIN)
    expect(ALL_FEATURE_SOURCES).toContain(FEATURE_SOURCE_HOMEBREW)
  })
})

describe('createCombatFeature', () => {
  it('crée une feature avec tous les champs par défaut', () => {
    const f = createCombatFeature()
    expect(f.id).toBe('')
    expect(f.name).toBe('')
    expect(f.description).toBe('')
    expect(f.source).toBe(FEATURE_SOURCE_HOMEBREW)
    expect(f.sourceRef).toBeNull()
    expect(f.activationType).toBe('action')
    expect(f.tier).toBe(1)
    expect(f.tags).toEqual([])
    expect(f.themes).toEqual([])
    expect(f.cost).toEqual({ type: 'free', amount: 0 })
    expect(f.frequency).toBeNull()
    expect(f.allyCooldown).toBeNull()
    expect(f.countdown).toBeNull()
    expect(f.conditions).toBeNull()
    expect(f.range).toBeNull()
    expect(f.trigger).toBeNull()
    expect(f.trait).toBeNull()
    expect(f.damageFormula).toBeNull()
    expect(f.damageType).toBeNull()
  })

  it('respecte les overrides', () => {
    const f = createCombatFeature({
      id: 'haymaker',
      name: 'Haymaker',
      description: 'Coup puissant au corps à corps.',
      source: FEATURE_SOURCE_ADVERSARY,
      sourceRef: 'jagged-knife-kneebreaker',
      activationType: 'action',
      tier: 1,
      tags: ['offensif'],
      themes: ['humanoid'],
      cost: { type: 'free', amount: 0 },
      range: 'veryClose',
      damageFormula: '1d10+3',
      damageType: 'physical'
    })

    expect(f.id).toBe('haymaker')
    expect(f.name).toBe('Haymaker')
    expect(f.source).toBe(FEATURE_SOURCE_ADVERSARY)
    expect(f.themes).toEqual(['humanoid'])
    expect(f.damageFormula).toBe('1d10+3')
  })

  it('copie les tableaux (pas de référence partagée)', () => {
    const tags = ['offensif']
    const themes = ['humanoid']
    const f = createCombatFeature({ tags, themes })
    tags.push('défensif')
    themes.push('bestial')
    expect(f.tags).toEqual(['offensif'])
    expect(f.themes).toEqual(['humanoid'])
  })
})

// ═══════════════════════════════════════════════════════════
//  Validation de CombatFeature
// ═══════════════════════════════════════════════════════════

describe('validateCombatFeature', () => {
  const validFeature = {
    id: 'test-feature',
    name: 'Test Feature',
    description: 'Une feature de test.',
    source: FEATURE_SOURCE_ADVERSARY,
    activationType: 'action',
    tier: 2,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'fear', amount: 1 }
  }

  it('accepte une feature valide', () => {
    const result = validateCombatFeature(validFeature)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejette null', () => {
    expect(validateCombatFeature(null).valid).toBe(false)
  })

  it('rejette un id manquant', () => {
    const result = validateCombatFeature({ ...validFeature, id: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('id'))).toBe(true)
  })

  it('rejette un name manquant', () => {
    const result = validateCombatFeature({ ...validFeature, name: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('name'))).toBe(true)
  })

  it('rejette une source invalide', () => {
    const result = validateCombatFeature({ ...validFeature, source: 'magic' })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('source'))).toBe(true)
  })

  it('rejette un activationType invalide', () => {
    const result = validateCombatFeature({ ...validFeature, activationType: 'spell' })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('activationType'))).toBe(true)
  })

  it('rejette un tier invalide', () => {
    const result = validateCombatFeature({ ...validFeature, tier: 5 })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('tier'))).toBe(true)
  })

  it('rejette un thème invalide', () => {
    const result = validateCombatFeature({ ...validFeature, themes: ['alien'] })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('thème'))).toBe(true)
  })

  it('valide un countdown correct', () => {
    const result = validateCombatFeature({
      ...validFeature,
      countdown: { value: 6, loop: true, current: 6 }
    })
    expect(result.valid).toBe(true)
  })

  it('rejette un countdown mal formé', () => {
    const result = validateCombatFeature({
      ...validFeature,
      countdown: { value: 0, loop: 'yes' }
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('countdown'))).toBe(true)
  })

  it('accepte une feature sans countdown (null)', () => {
    const result = validateCombatFeature({ ...validFeature, countdown: null })
    expect(result.valid).toBe(true)
  })
})
