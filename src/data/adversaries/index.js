/**
 * @module adversaries/data
 * @description Adversary data index — aggregates all tier data and provides constants.
 */

import tier1 from './tier1.json'
import tier2 from './tier2.json'
import tier3 from './tier3.json'
import tier4 from './tier4.json'

/** All adversaries from all tiers */
export const allAdversaries = [...tier1, ...tier2, ...tier3, ...tier4]

/** Adversary type constants */
export const ADVERSARY_TYPES = [
  'Bruiser',
  'Horde',
  'Leader',
  'Minion',
  'Ranged',
  'Skulk',
  'Social',
  'Solo',
  'Standard',
  'Support'
]

/** Tier definitions with level ranges */
export const TIERS = [
  { value: 1, label: 'Tier 1', levels: '1' },
  { value: 2, label: 'Tier 2', levels: '2–4' },
  { value: 3, label: 'Tier 3', levels: '5–7' },
  { value: 4, label: 'Tier 4', levels: '8–10' }
]

/** Feature type constants */
export const FEATURE_TYPES = ['passive', 'action', 'reaction']

/** Range constants */
export const RANGES = ['Melee', 'Very Close', 'Close', 'Far', 'Very Far']

/** Damage type labels (FR) */
export const DAMAGE_TYPE_LABELS = {
  phy: 'Physique',
  mag: 'Magique',
  'phy/mag': 'Physique/Magique'
}

/** Benchmark stats by tier — for improvisation reference */
export const TIER_BENCHMARKS = {
  1: { atkMod: '+1', damage: '1d6+2 à 1d12+4', difficulty: 11, thresholds: '7/12' },
  2: { atkMod: '+2', damage: '2d6+3 à 2d12+4', difficulty: 14, thresholds: '10/20' },
  3: { atkMod: '+3', damage: '3d8+3 à 3d12+5', difficulty: 17, thresholds: '20/32' },
  4: { atkMod: '+4', damage: '4d8+10 à 4d12+15', difficulty: 20, thresholds: '25/45' }
}

export { tier1, tier2, tier3, tier4 }
