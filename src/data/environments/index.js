/**
 * @module environments/data
 * @description Environment data index — aggregates all tier data and provides constants.
 */

import tier1 from './tier1.json'
import tier2 from './tier2.json'
import tier3 from './tier3.json'
import tier4 from './tier4.json'

/** All environments from all tiers */
export const allEnvironments = [...tier1, ...tier2, ...tier3, ...tier4]

/** Environment type constants */
export const ENVIRONMENT_TYPES = [
  'Exploration',
  'Event',
  'Social',
  'Traversal'
]

/** Environment feature type constants */
export const FEATURE_TYPES = ['passive', 'action', 'reaction']

/** Tier definitions with level ranges */
export const TIERS = [
  { value: 1, label: 'Tier 1', levels: '1' },
  { value: 2, label: 'Tier 2', levels: '2–4' },
  { value: 3, label: 'Tier 3', levels: '5–7' },
  { value: 4, label: 'Tier 4', levels: '8–10' }
]

/** Environment type emoji mapping */
export const ENVIRONMENT_TYPE_ICONS = {
  Exploration: '🔍',
  Event: '⚡',
  Social: '🗣️',
  Traversal: '🥾'
}

/** Environment statistics by tier — for scaling reference */
export const TIER_BENCHMARKS = {
  1: { damageDice: '1d6+1 to 1d8+3', difficulty: 11 },
  2: { damageDice: '2d6+3 to 2d10+2', difficulty: 14 },
  3: { damageDice: '3d8+3 to 3d10+1', difficulty: 17 },
  4: { damageDice: '4d8+3 to 4d10+10', difficulty: 20 }
}

export { tier1, tier2, tier3, tier4 }
