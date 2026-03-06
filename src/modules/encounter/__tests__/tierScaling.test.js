/**
 * @module encounter/__tests__/tierScaling.test
 * @description Tests du système de scaling d'adversaires entre tiers.
 *
 * Approche delta-based : statScalée = statOriginale + (benchmarkCible - benchmarkSource)
 * Vérifications : fonctions pures, cas Bruiser, cas Minion, bidirectionnalité, null-safety.
 */

import { describe, it, expect } from 'vitest'
import {
  parseDamage,
  buildDamage,
  scaleStat,
  scaleDamage,
  scaleAdversaryToTier
} from '../utils/tierScaling'

// ═══════════════════════════════════════════════════════
//  parseDamage
// ═══════════════════════════════════════════════════════

describe('parseDamage', () => {
  it('parse un format NdX+Y', () => {
    const result = parseDamage('2d10+4')
    expect(result).toEqual({ count: 2, size: 10, bonus: 4, isFlat: false })
  })

  it('parse un format NdX sans bonus', () => {
    const result = parseDamage('3d8')
    expect(result).toEqual({ count: 3, size: 8, bonus: 0, isFlat: false })
  })

  it('parse un format 1d12', () => {
    const result = parseDamage('1d12')
    expect(result).toEqual({ count: 1, size: 12, bonus: 0, isFlat: false })
  })

  it('parse des dégâts fixes (Minions)', () => {
    const result = parseDamage('6')
    expect(result).toEqual({ count: 0, size: 0, bonus: 6, isFlat: true })
  })

  it('retourne null pour null', () => {
    expect(parseDamage(null)).toBeNull()
  })

  it('retourne null pour une chaîne vide', () => {
    expect(parseDamage('')).toBeNull()
  })

  it('retourne null pour un format invalide', () => {
    expect(parseDamage('abc')).toBeNull()
  })

  it('gère les espaces autour', () => {
    const result = parseDamage(' 2d10+4 ')
    expect(result).toEqual({ count: 2, size: 10, bonus: 4, isFlat: false })
  })

  it('gère un nombre passé comme Number', () => {
    const result = parseDamage(6)
    expect(result).toEqual({ count: 0, size: 0, bonus: 6, isFlat: true })
  })
})

// ═══════════════════════════════════════════════════════
//  buildDamage
// ═══════════════════════════════════════════════════════

describe('buildDamage', () => {
  it('reconstruit NdX+Y', () => {
    expect(buildDamage({ count: 3, size: 10, bonus: 4, isFlat: false })).toBe('3d10+4')
  })

  it('reconstruit NdX sans bonus', () => {
    expect(buildDamage({ count: 2, size: 8, bonus: 0, isFlat: false })).toBe('2d8')
  })

  it('reconstruit un dégât fixe', () => {
    expect(buildDamage({ count: 0, size: 0, bonus: 6, isFlat: true })).toBe('6')
  })

  it('clamp le dice count minimum à 1', () => {
    expect(buildDamage({ count: 0, size: 10, bonus: 2, isFlat: false })).toBe('1d10+2')
  })

  it('clamp le dégât fixe minimum à 1', () => {
    expect(buildDamage({ count: 0, size: 0, bonus: 0, isFlat: true })).toBe('1')
  })

  it('retourne "0" pour null', () => {
    expect(buildDamage(null)).toBe('0')
  })
})

// ═══════════════════════════════════════════════════════
//  scaleStat
// ═══════════════════════════════════════════════════════

describe('scaleStat', () => {
  it('applique le delta benchmark', () => {
    // actual=14, sourceBM=13, targetBM=17 → 14+(17-13) = 18
    expect(scaleStat(14, 13, 17)).toBe(18)
  })

  it('gère le format objet {min,max,default}', () => {
    expect(scaleStat(14, { min: 12, max: 14, default: 13 }, { min: 16, max: 18, default: 17 })).toBe(18)
  })

  it('clamp au minimum par défaut (0)', () => {
    // actual=2, sourceBM=10, targetBM=3 → 2+(3-10) = -5 → clamp à 0
    expect(scaleStat(2, 10, 3)).toBe(0)
  })

  it('clamp au minimum spécifié', () => {
    expect(scaleStat(2, 10, 3, 1)).toBe(1)
  })

  it('retourne actual si sourceBM est null', () => {
    expect(scaleStat(5, null, 10)).toBe(5)
  })

  it('retourne actual si targetBM est null', () => {
    expect(scaleStat(5, 10, null)).toBe(5)
  })

  it('gère un delta négatif (downscaling)', () => {
    // actual=18, sourceBM=17, targetBM=13 → 18+(13-17) = 14
    expect(scaleStat(18, 17, 13)).toBe(14)
  })

  it('gère un delta nul (même benchmark)', () => {
    expect(scaleStat(10, 5, 5)).toBe(10)
  })
})

// ═══════════════════════════════════════════════════════
//  scaleDamage
// ═══════════════════════════════════════════════════════

describe('scaleDamage', () => {
  it('scale les dés : count=targetTier, size=préservée, bonus+=delta', () => {
    // original: 1d12+2, sourceBM: 1d10+4, targetBM: 3d10+4, targetTier: 3
    // → count=3, size=12, bonus=2+(4-4)=2 → '3d12+2'
    expect(scaleDamage('1d12+2', '1d10+4', '3d10+4', 3)).toBe('3d12+2')
  })

  it('scale un bonus positif vers T4', () => {
    // original: 1d10+4, sourceBM: 1d10+4, targetBM: 4d10+10, targetTier: 4
    // → count=4, size=10, bonus=4+(10-4)=10 → '4d10+10'
    expect(scaleDamage('1d10+4', '1d10+4', '4d10+10', 4)).toBe('4d10+10')
  })

  it('scale des dégâts fixes (Minions)', () => {
    // original: 3, sourceBM: 2, targetBM: 6, targetTier: 3
    // → flat: bonus=3+(6-2)=7 → '7'
    expect(scaleDamage('3', '2', '6', 3)).toBe('7')
  })

  it('préserve le bonus quand les benchmarks sont identiques', () => {
    // original: 1d10+1, sourceBM: 1d10+4, targetBM: 2d10+4, targetTier: 2
    // → count=2, size=10, bonus=1+(4-4)=1 → '2d10+1'
    expect(scaleDamage('1d10+1', '1d10+4', '2d10+4', 2)).toBe('2d10+1')
  })

  it('clamp dégâts fixes au minimum 1', () => {
    // original: 1, sourceBM: 6, targetBM: 2, targetTier: 1
    // → flat: bonus=1+(2-6)=-3 → clamp à 1 → '1'
    expect(scaleDamage('1', '6', '2', 1)).toBe('1')
  })

  it('retourne l\'original si le parsing échoue', () => {
    expect(scaleDamage('abc', '1d10+4', '3d10+4', 3)).toBe('abc')
  })

  it('retourne l\'original si le benchmark source est invalide', () => {
    expect(scaleDamage('1d10+4', null, '3d10+4', 3)).toBe('1d10+4')
  })

  it('supprime le bonus quand il tombe à 0', () => {
    // original: 1d8+3, sourceBM: 1d8+3, targetBM: 3d8+3, targetTier: 3
    // bonus delta = 0, original bonus = 3 → bonus reste 3 → '3d8+3'
    expect(scaleDamage('1d8+3', '1d8+3', '3d8+3', 3)).toBe('3d8+3')

    // original: 1d8+0 → sourceBM bonus=3, targetBM bonus=3 → delta=0 → bonus=0 → '3d8'
    expect(scaleDamage('1d8', '1d8+3', '3d8+3', 3)).toBe('3d8')
  })
})

// ═══════════════════════════════════════════════════════
//  scaleAdversaryToTier — cas concrets
// ═══════════════════════════════════════════════════════

describe('scaleAdversaryToTier', () => {
  // ── Données de test ────────────────────────────────
  // Bear : Bruiser T1, stats légèrement au-dessus des benchmarks
  // Benchmarks Bruiser T1 : diff=13, major=8, severe=15, hp=6, stress=3, atk=+1, dmg=1d10+4
  // Benchmarks Bruiser T3 : diff=17, major=21, severe=37, hp=7, stress=5, atk=+4, dmg=3d10+4
  const bear = {
    id: 'bear',
    name: 'Bear',
    type: 'Bruiser',
    tier: 1,
    difficulty: 14,
    thresholds: { major: 8, severe: 15 },
    hp: 8,
    stress: 3,
    attack: { name: 'Claw', modifier: 3, damage: '1d12+2', damageType: 'phy', range: 'Melee' },
    features: [{ name: 'Momentum', description: 'Gain Fear on hit' }],
    motives: [{ name: 'Territorial' }],
    experiences: [],
    description: 'A big bear',
    focusProfile: null
  }

  // Goblin : Minion T1
  // Benchmarks Minion T1 : diff=11, thresholds=null, hp=1, stress=1, atk=-1, dmg=2 (flat)
  // Benchmarks Minion T3 : diff=15, thresholds=null, hp=1, stress=1, atk=+1, dmg=6 (flat)
  const minionGoblin = {
    id: 'goblin-minion',
    name: 'Goblin Minion',
    type: 'Minion',
    tier: 1,
    difficulty: 12,
    thresholds: null,
    hp: 1,
    stress: 1,
    attack: { name: 'Shiv', modifier: 0, damage: '3', damageType: 'phy', range: 'Melee' },
    features: [{ name: 'Minion (4)', description: 'Killed by any damage' }],
    motives: [],
    experiences: [],
    description: 'A goblin minion',
    focusProfile: null
  }

  // ── Identité (même tier) ─────────────────────────────

  it('retourne une copie identique si le tier est le même', () => {
    const result = scaleAdversaryToTier(bear, 1)
    expect(result).toEqual(bear)
    expect(result).not.toBe(bear) // copie, pas la même référence
  })

  it('retourne l\'adversaire tel quel si null', () => {
    expect(scaleAdversaryToTier(null, 3)).toBeNull()
  })

  it('retourne l\'adversaire tel quel si tier invalide (0)', () => {
    expect(scaleAdversaryToTier(bear, 0)).toBe(bear)
  })

  it('retourne l\'adversaire tel quel si tier invalide (5)', () => {
    expect(scaleAdversaryToTier(bear, 5)).toBe(bear)
  })

  // ── Bruiser T1 → T3 (le "Bear test") ────────────────

  it('scale un Bruiser T1→T3 — difficulty', () => {
    const scaled = scaleAdversaryToTier(bear, 3)
    expect(scaled.tier).toBe(3)
    // difficulty: 14 + (17-13) = 18
    expect(scaled.difficulty).toBe(18)
  })

  it('scale un Bruiser T1→T3 — thresholds', () => {
    const scaled = scaleAdversaryToTier(bear, 3)
    // thresholds.major: 8 + (21-8) = 21
    expect(scaled.thresholds.major).toBe(21)
    // thresholds.severe: 15 + (37-15) = 37
    expect(scaled.thresholds.severe).toBe(37)
  })

  it('scale un Bruiser T1→T3 — hp et stress', () => {
    const scaled = scaleAdversaryToTier(bear, 3)
    // hp: 8 + (7-6) = 9
    expect(scaled.hp).toBe(9)
    // stress: 3 + (5-3) = 5
    expect(scaled.stress).toBe(5)
  })

  it('scale un Bruiser T1→T3 — attack', () => {
    const scaled = scaleAdversaryToTier(bear, 3)
    // attack.modifier: 3 + (4-1) = 6
    expect(scaled.attack.modifier).toBe(6)
    // damage: 1d12+2 → count=3, size=12, bonus=2+(4-4)=2 → '3d12+2'
    expect(scaled.attack.damage).toBe('3d12+2')
  })

  // ── Bruiser T3 → T1 (bidirectionnel) ────────────────

  it('scale un Bruiser T3→T1 et revient aux valeurs originales', () => {
    const bearT3 = scaleAdversaryToTier(bear, 3)
    const backToT1 = scaleAdversaryToTier(bearT3, 1)
    expect(backToT1.tier).toBe(1)
    expect(backToT1.difficulty).toBe(bear.difficulty)
    expect(backToT1.hp).toBe(bear.hp)
    expect(backToT1.stress).toBe(bear.stress)
    expect(backToT1.thresholds.major).toBe(bear.thresholds.major)
    expect(backToT1.thresholds.severe).toBe(bear.thresholds.severe)
    expect(backToT1.attack.modifier).toBe(bear.attack.modifier)
    // Damage : count=1 (tier 1), size=12 (préservée), bonus=2
    expect(backToT1.attack.damage).toBe('1d12+2')
  })

  // ── Minion : HP toujours 1, thresholds null ──────────

  it('scale un Minion — HP reste à 1', () => {
    const scaled = scaleAdversaryToTier(minionGoblin, 3)
    expect(scaled.hp).toBe(1)
  })

  it('scale un Minion — thresholds reste null', () => {
    const scaled = scaleAdversaryToTier(minionGoblin, 3)
    expect(scaled.thresholds).toBeNull()
  })

  it('scale un Minion T1→T3 — difficulty', () => {
    const scaled = scaleAdversaryToTier(minionGoblin, 3)
    expect(scaled.tier).toBe(3)
    // difficulty: 12 + (15-11) = 16
    expect(scaled.difficulty).toBe(16)
  })

  it('scale un Minion T1→T3 — stress', () => {
    const scaled = scaleAdversaryToTier(minionGoblin, 3)
    // stress: 1 + (1-1) = 1 (min 1)
    expect(scaled.stress).toBe(1)
  })

  it('scale un Minion T1→T3 — attack', () => {
    const scaled = scaleAdversaryToTier(minionGoblin, 3)
    // attack.modifier: 0 + (1-(-1)) = 2
    expect(scaled.attack.modifier).toBe(2)
    // damage (flat): 3 + (6-2) = 7
    expect(scaled.attack.damage).toBe('7')
  })

  // ── Préservation des champs narratifs ────────────────

  it('préserve les features, motives, description', () => {
    const scaled = scaleAdversaryToTier(bear, 4)
    expect(scaled.features).toEqual(bear.features)
    expect(scaled.motives).toEqual(bear.motives)
    expect(scaled.experiences).toEqual(bear.experiences)
    expect(scaled.description).toBe(bear.description)
    expect(scaled.focusProfile).toBe(bear.focusProfile)
  })

  it('préserve attack.name, attack.range, attack.damageType', () => {
    const scaled = scaleAdversaryToTier(bear, 3)
    expect(scaled.attack.name).toBe('Claw')
    expect(scaled.attack.range).toBe('Melee')
    expect(scaled.attack.damageType).toBe('phy')
  })

  // ── Type inconnu ─────────────────────────────────────

  it('retourne une copie avec le tier modifié si le type est inconnu', () => {
    const unknown = { ...bear, type: 'CustomType' }
    const scaled = scaleAdversaryToTier(unknown, 3)
    expect(scaled.tier).toBe(3)
    // Stats non modifiées car pas de benchmarks
    expect(scaled.difficulty).toBe(bear.difficulty)
    expect(scaled.hp).toBe(bear.hp)
  })

  // ── Null-safety ──────────────────────────────────────

  it('gère un adversaire sans attack', () => {
    const noAttack = { ...bear, attack: null }
    const scaled = scaleAdversaryToTier(noAttack, 3)
    expect(scaled.attack).toBeNull()
    expect(scaled.tier).toBe(3)
    // Les autres stats sont quand même scalées
    expect(scaled.difficulty).toBe(18)
  })

  it('ne mute pas l\'adversaire original', () => {
    const originalDifficulty = bear.difficulty
    const originalHP = bear.hp
    scaleAdversaryToTier(bear, 4)
    expect(bear.difficulty).toBe(originalDifficulty)
    expect(bear.hp).toBe(originalHP)
  })
})
