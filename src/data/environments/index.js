/**
 * @module environments/data
 * @description Index des données d'environnements — agrège tous les tiers et fournit les constantes.
 */

import tier1 from './tier1.json'
import tier2 from './tier2.json'
import tier3 from './tier3.json'
import tier4 from './tier4.json'

/** Tous les environnements de tous les tiers */
export const allEnvironments = [...tier1, ...tier2, ...tier3, ...tier4]

/** Constantes de type d'environnement */
export const ENVIRONMENT_TYPES = [
  'Exploration',
  'Event',
  'Social',
  'Traversal'
]

/** Constantes de type de feature d'environnement */
export const FEATURE_TYPES = ['passive', 'action', 'reaction']

/** Définitions des tiers avec plages de niveaux */
export const TIERS = [
  { value: 1, label: 'Tier 1', levels: '1' },
  { value: 2, label: 'Tier 2', levels: '2–4' },
  { value: 3, label: 'Tier 3', levels: '5–7' },
  { value: 4, label: 'Tier 4', levels: '8–10' }
]

/** Emojis par type d'environnement */
export const ENVIRONMENT_TYPE_ICONS = {
  Exploration: '🔍',
  Event: '⚡',
  Social: '🗣️',
  Traversal: '🥾'
}

/** Labels français pour les types d'environnement */
export const ENVIRONMENT_TYPE_LABELS = {
  Exploration: 'Exploration',
  Event: 'Événement',
  Social: 'Social',
  Traversal: 'Traversée'
}

/** Statistiques par tier — référence pour le calibrage */
export const TIER_BENCHMARKS = {
  1: { damageDice: '1d6+1 to 1d8+3', difficulty: 11 },
  2: { damageDice: '2d6+3 to 2d10+2', difficulty: 14 },
  3: { damageDice: '3d8+3 to 3d10+1', difficulty: 17 },
  4: { damageDice: '4d8+3 to 4d10+10', difficulty: 20 }
}

export { tier1, tier2, tier3, tier4 }
