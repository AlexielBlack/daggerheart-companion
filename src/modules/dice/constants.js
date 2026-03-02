/**
 * @module dice/constants
 * @description Constantes spécifiques aux dés Daggerheart.
 * Source : CoreMechanics_SRD.pdf — Action Rolls, Damage, Hope/Fear
 */

/**
 * 5 résultats possibles d'un jet d'action Daggerheart (2d12 vs Difficulté).
 */
export const DUALITY_OUTCOMES = {
  critical: {
    id: 'critical',
    label: 'Succès Critique',
    shortLabel: 'Crit !',
    description: 'Succès auto + bonus, gain Hope, clear Stress.',
    color: '#eab308',
    icon: '⚡'
  },
  successHope: {
    id: 'successHope',
    label: 'Succès avec Espoir',
    shortLabel: 'Succès + Hope',
    description: 'Succès, gain Hope.',
    color: '#53a8b6',
    icon: '✦'
  },
  successFear: {
    id: 'successFear',
    label: 'Succès avec Peur',
    shortLabel: 'Succès + Fear',
    description: 'Succès avec coût/complication, MJ gagne Fear.',
    color: '#f97316',
    icon: '⚠'
  },
  failureHope: {
    id: 'failureHope',
    label: 'Échec avec Espoir',
    shortLabel: 'Échec + Hope',
    description: 'Échec mineur, gain Hope, spotlight → MJ.',
    color: '#60a5fa',
    icon: '↻'
  },
  failureFear: {
    id: 'failureFear',
    label: 'Échec avec Peur',
    shortLabel: 'Échec + Fear',
    description: 'Échec majeur, MJ gagne Fear, spotlight → MJ.',
    color: '#c84b31',
    icon: '✗'
  }
}

/**
 * Résout un jet de Duality Dice selon les règles SRD.
 * @param {number} hopeValue - Valeur du dé Hope (1-12)
 * @param {number} fearValue - Valeur du dé Fear (1-12)
 * @param {number} total - Total après modificateurs
 * @param {number|null} difficulty - Difficulté (null = pas de comparaison)
 * @returns {string} Clé de DUALITY_OUTCOMES
 */
export function resolveDualityOutcome(hopeValue, fearValue, total, difficulty) {
  if (hopeValue === fearValue) return 'critical'
  if (difficulty === null || difficulty === undefined) {
    return hopeValue > fearValue ? 'successHope' : 'successFear'
  }
  const success = total >= difficulty
  const hopeDominant = hopeValue > fearValue
  if (success && hopeDominant) return 'successHope'
  if (success && !hopeDominant) return 'successFear'
  if (!success && hopeDominant) return 'failureHope'
  return 'failureFear'
}

/**
 * Calcule les dégâts critiques SRD :
 * Jet normal + maximum possible des dés.
 * Ex: 2d8+1 crit → 2d8+1+16
 * @param {number[]} rolls - Résultats des dés
 * @param {number} sides - Faces des dés
 * @param {number} modifier - Modificateur plat
 * @returns {{ rolls: number[], maxBonus: number, modifier: number, total: number }}
 */
export function calculateCriticalDamage(rolls, sides, modifier) {
  const maxBonus = rolls.length * sides
  const rollTotal = rolls.reduce((s, r) => s + r, 0)
  return {
    rolls,
    maxBonus,
    modifier,
    total: rollTotal + modifier + maxBonus
  }
}

/**
 * Dés rapides disponibles.
 */
export const QUICK_DICE = [
  { sides: 4, label: 'd4', color: '#a855f7' },
  { sides: 6, label: 'd6', color: '#22c55e' },
  { sides: 8, label: 'd8', color: '#3b82f6' },
  { sides: 10, label: 'd10', color: '#f97316' },
  { sides: 12, label: 'd12', color: '#eab308' },
  { sides: 20, label: 'd20', color: '#ef4444' }
]

/** Presets de lancers courants */
export const ROLL_PRESETS = [
  { id: 'duality', label: 'Jet d\'action', icon: '🎲', description: 'Duality Dice (2d12)' },
  { id: 'gm-d20', label: 'Dé du MJ', icon: '🎯', description: 'd20 + modificateur' },
  { id: 'damage', label: 'Dégâts', icon: '💥', description: 'Expression libre (ex: 2d8+4)' },
  { id: 'advantage', label: 'Avantage', icon: '⬆️', description: 'd6 bonus' },
  { id: 'disadvantage', label: 'Désavantage', icon: '⬇️', description: 'd6 malus' }
]

/** Taille max de l'historique */
export const MAX_HISTORY = 50
