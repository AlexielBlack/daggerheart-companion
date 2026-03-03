/**
 * @module dice
 * @description Module de lancer de des Daggerheart (dualite, degats, rapide).
 */

// Store
export { useDiceStore } from './stores/diceStore'

// Constantes
export {
  DUALITY_OUTCOMES,
  resolveDualityOutcome,
  calculateCriticalDamage,
  QUICK_DICE,
  ROLL_PRESETS,
  MAX_HISTORY
} from './constants'

// Composants
export { default as DamagePanel } from './components/DamagePanel.vue'
export { default as DiceHistory } from './components/DiceHistory.vue'
export { default as DualityPanel } from './components/DualityPanel.vue'
export { default as QuickDice } from './components/QuickDice.vue'

// Vues
export { default as DiceRoller } from './views/DiceRoller.vue'
