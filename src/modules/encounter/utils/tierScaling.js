/**
 * @module encounter/utils/tierScaling
 * @description Fonctions pures pour le scaling d'adversaires entre tiers.
 *
 * Approche delta-based : statScalée = statOriginale + (benchmarkCible - benchmarkSource)
 * Utilise les benchmarks SRD par type/tier de adversaryTypeBenchmarks.js.
 *
 * Ce qui est scalé : difficulty, thresholds, hp, stress, attack.modifier, attack.damage
 * Ce qui ne l'est PAS : features, motives, experiences, description, focusProfile, attack.name/range/damageType
 */

import { getBenchmarkForTypeTier } from '@modules/homebrew/data/adversaryTypeBenchmarks'

// ── Parsing de dégâts ──────────────────────────────────

/**
 * Parse une chaîne de dégâts en composantes.
 * @param {string} damageStr - Ex: '2d10+4', '6', '3d8+2', '1d12'
 * @returns {{ count: number, size: number, bonus: number, isFlat: boolean }|null}
 */
export function parseDamage(damageStr) {
  if (!damageStr) return null
  const str = String(damageStr).trim()

  // Dégâts fixes (Minions) : juste un nombre
  const flatMatch = /^(\d+)$/.exec(str)
  if (flatMatch) {
    return { count: 0, size: 0, bonus: parseInt(flatMatch[1], 10), isFlat: true }
  }

  // Format dés : NdX+Y ou NdX
  const diceMatch = /^(\d+)d(\d+)(?:\+(\d+))?$/.exec(str)
  if (diceMatch) {
    return {
      count: parseInt(diceMatch[1], 10),
      size: parseInt(diceMatch[2], 10),
      bonus: diceMatch[3] ? parseInt(diceMatch[3], 10) : 0,
      isFlat: false
    }
  }

  return null
}

/**
 * Reconstruit une chaîne de dégâts depuis les composantes.
 * @param {{ count: number, size: number, bonus: number, isFlat: boolean }} parsed
 * @returns {string}
 */
export function buildDamage(parsed) {
  if (!parsed) return '0'
  if (parsed.isFlat) return String(Math.max(1, parsed.bonus))
  const base = `${Math.max(1, parsed.count)}d${parsed.size}`
  return parsed.bonus > 0 ? `${base}+${parsed.bonus}` : base
}

// ── Scaling unitaire ───────────────────────────────────

/**
 * Scale un stat scalaire via delta benchmarks.
 * @param {number} actual - Valeur originale de l'adversaire
 * @param {number|{ default: number }} sourceBM - Benchmark source
 * @param {number|{ default: number }} targetBM - Benchmark cible
 * @param {number} [min=0] - Minimum garanti
 * @returns {number}
 */
export function scaleStat(actual, sourceBM, targetBM, min = 0) {
  const src = (sourceBM !== null && sourceBM !== undefined && typeof sourceBM === 'object') ? sourceBM.default : sourceBM
  const tgt = (targetBM !== null && targetBM !== undefined && typeof targetBM === 'object') ? targetBM.default : targetBM
  if (src === null || src === undefined || tgt === null || tgt === undefined) return actual
  return Math.max(min, actual + (tgt - src))
}

/**
 * Scale une chaîne de dégâts d'un tier source vers un tier cible.
 * - Dés : count = targetTier, size = originale, bonus += delta benchmarks
 * - Flat (Minions) : bonus += delta benchmarks, clamp ≥ 1
 *
 * @param {string} originalDamage - Dégâts originaux
 * @param {string} sourceBenchmarkDamage - Dégâts benchmark du tier source
 * @param {string} targetBenchmarkDamage - Dégâts benchmark du tier cible
 * @param {number} targetTier - Tier cible (1-4)
 * @returns {string}
 */
export function scaleDamage(originalDamage, sourceBenchmarkDamage, targetBenchmarkDamage, targetTier) {
  const original = parseDamage(originalDamage)
  const sourceBM = parseDamage(sourceBenchmarkDamage)
  const targetBM = parseDamage(targetBenchmarkDamage)

  if (!original || !sourceBM || !targetBM) return originalDamage

  // Dégâts fixes (Minions)
  if (original.isFlat) {
    const delta = targetBM.bonus - sourceBM.bonus
    return buildDamage({ ...original, bonus: Math.max(1, original.bonus + delta) })
  }

  // Dégâts à dés
  const bonusDelta = targetBM.bonus - sourceBM.bonus
  return buildDamage({
    count: targetTier,
    size: original.size,
    bonus: Math.max(0, original.bonus + bonusDelta),
    isFlat: false
  })
}

// ── Scaling principal ──────────────────────────────────

/**
 * Scale un adversaire vers un tier cible.
 * Retourne un NOUVEL objet — ne mute pas l'original.
 *
 * @param {Object} adversary - Objet adversaire complet (SRD ou homebrew)
 * @param {number} targetTier - Tier cible (1-4)
 * @returns {Object} Adversaire scalé
 */
export function scaleAdversaryToTier(adversary, targetTier) {
  if (!adversary || targetTier < 1 || targetTier > 4) return adversary
  if (adversary.tier === targetTier) return { ...adversary }

  const sourceTier = adversary.tier
  const type = adversary.type
  const sourceBM = getBenchmarkForTypeTier(type, sourceTier)
  const targetBM = getBenchmarkForTypeTier(type, targetTier)

  // Type inconnu dans les benchmarks → on change juste le tier
  if (!sourceBM || !targetBM) return { ...adversary, tier: targetTier }

  const isMinion = type === 'Minion'

  // Difficulty
  const scaledDifficulty = scaleStat(adversary.difficulty, sourceBM.difficulty, targetBM.difficulty, 5)

  // Thresholds (Minions : toujours null)
  let scaledThresholds = adversary.thresholds
  if (!isMinion && adversary.thresholds && sourceBM.thresholds && targetBM.thresholds) {
    scaledThresholds = {
      major: adversary.thresholds.major !== null && adversary.thresholds.major !== undefined
        ? scaleStat(adversary.thresholds.major, sourceBM.thresholds.major, targetBM.thresholds.major, 1)
        : null,
      severe: adversary.thresholds.severe !== null && adversary.thresholds.severe !== undefined
        ? scaleStat(adversary.thresholds.severe, sourceBM.thresholds.severe, targetBM.thresholds.severe, 1)
        : null
    }
  }

  // HP (Minions : toujours 1)
  const scaledHP = isMinion ? 1 : scaleStat(adversary.hp, sourceBM.hp, targetBM.hp, 1)

  // Stress
  const scaledStress = scaleStat(adversary.stress, sourceBM.stress, targetBM.stress, 1)

  // Attack
  let scaledAttack = adversary.attack
  if (adversary.attack && sourceBM.attack && targetBM.attack) {
    scaledAttack = {
      ...adversary.attack,
      modifier: scaleStat(adversary.attack.modifier, sourceBM.attack.modifier, targetBM.attack.modifier),
      damage: scaleDamage(
        adversary.attack.damage,
        sourceBM.attack.damage,
        targetBM.attack.damage,
        targetTier
      )
    }
  }

  return {
    ...adversary,
    tier: targetTier,
    difficulty: scaledDifficulty,
    thresholds: scaledThresholds,
    hp: scaledHP,
    stress: scaledStress,
    attack: scaledAttack
  }
}
