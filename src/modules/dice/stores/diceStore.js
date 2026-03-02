/**
 * @module dice/stores/diceStore
 * @description Store Pinia pour le lanceur de dés Daggerheart.
 * Gère les lancers, l'historique et la persistence.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { rollDie, rollDice, rollExpression } from '@core/utils/dice'
import {
  DUALITY_OUTCOMES,
  resolveDualityOutcome,
  calculateCriticalDamage,
  MAX_HISTORY
} from '../constants'
import { useStorage } from '@core/composables/useStorage'

export const useDiceStore = defineStore('dice', () => {
  // ── Persistence ────────────────────────────────────────
  const storage = useStorage('dice-history', [])

  // ── État ────────────────────────────────────────────────
  const history = ref(Array.isArray(storage.data.value) ? storage.data.value : [])
  const lastResult = ref(null)

  // ── Getters ────────────────────────────────────────────
  const historyCount = computed(() => history.value.length)

  // ── Actions : lancers ──────────────────────────────────

  /**
   * Lance les Duality Dice (jet d'action).
   * @param {Object} options
   * @param {number} [options.modifier=0] - Modificateur trait
   * @param {number|null} [options.difficulty=null] - Difficulté cible
   * @param {boolean} [options.advantage=false] - Avantage (ajoute d6)
   * @param {boolean} [options.disadvantage=false] - Désavantage (soustrait d6)
   * @param {string} [options.label=''] - Description du jet
   * @returns {Object} Résultat complet
   */
  function rollDuality(options = {}) {
    const {
      modifier = 0,
      difficulty = null,
      advantage = false,
      disadvantage = false,
      label = ''
    } = options

    const hopeValue = rollDie(12)
    const fearValue = rollDie(12)
    let advDie = null
    let advMod = 0

    if (advantage && !disadvantage) {
      advDie = rollDie(6)
      advMod = advDie
    } else if (disadvantage && !advantage) {
      advDie = rollDie(6)
      advMod = -advDie
    }

    const total = hopeValue + fearValue + modifier + advMod
    const outcome = resolveDualityOutcome(hopeValue, fearValue, total, difficulty)

    const result = {
      id: uid(),
      type: 'duality',
      timestamp: Date.now(),
      label: label || 'Jet d\'action',
      hopeValue,
      fearValue,
      modifier,
      advantageDie: advDie,
      advantageModifier: advMod,
      difficulty,
      total,
      outcome,
      outcomeData: DUALITY_OUTCOMES[outcome]
    }

    pushResult(result)
    return result
  }

  /**
   * Lance le dé du MJ (d20 + modificateur).
   * @param {Object} options
   * @param {number} [options.modifier=0]
   * @param {number|null} [options.target=null] - Évasion ou difficulté cible
   * @param {string} [options.label='']
   * @returns {Object}
   */
  function rollGM(options = {}) {
    const { modifier = 0, target = null, label = '' } = options
    const value = rollDie(20)
    const total = value + modifier
    const natural20 = value === 20
    const success = target !== null ? total >= target : null

    const result = {
      id: uid(),
      type: 'gm-d20',
      timestamp: Date.now(),
      label: label || 'Dé du MJ',
      value,
      modifier,
      total,
      target,
      natural20,
      success
    }

    pushResult(result)
    return result
  }

  /**
   * Lance une expression de dégâts (ex: "2d8+4").
   * @param {Object} options
   * @param {string} options.expression - Expression (ex: "2d8+4")
   * @param {boolean} [options.critical=false] - Dégâts critiques
   * @param {string} [options.label='']
   * @returns {Object}
   */
  function rollDamage(options = {}) {
    const { expression, critical = false, label = '' } = options

    if (!expression) return null

    try {
      const base = rollExpression(expression)
      let critData = null

      if (critical) {
        const match = expression.replace(/\s/g, '').toLowerCase().match(/^\d+d(\d+)/)
        const sides = match ? parseInt(match[1], 10) : 0
        critData = calculateCriticalDamage(base.rolls, sides, base.modifier)
      }

      const result = {
        id: uid(),
        type: 'damage',
        timestamp: Date.now(),
        label: label || `Dégâts ${expression}`,
        expression: base.expression,
        rolls: base.rolls,
        modifier: base.modifier,
        total: critical && critData ? critData.total : base.total,
        critical,
        criticalData: critData
      }

      pushResult(result)
      return result
    } catch {
      return null
    }
  }

  /**
   * Lance un dé rapide (d4, d6, d8, d10, d12, d20).
   * @param {number} sides
   * @param {number} [count=1]
   * @param {string} [label='']
   * @returns {Object}
   */
  function rollQuick(sides, count = 1, label = '') {
    const rolls = rollDice(count, sides)
    const total = rolls.reduce((s, r) => s + r, 0)

    const result = {
      id: uid(),
      type: 'quick',
      timestamp: Date.now(),
      label: label || `${count}d${sides}`,
      sides,
      count,
      rolls,
      total
    }

    pushResult(result)
    return result
  }

  // ── Historique ─────────────────────────────────────────

  function pushResult(result) {
    lastResult.value = result
    history.value.unshift(result)
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    persist()
  }

  function clearHistory() {
    history.value = []
    lastResult.value = null
    persist()
  }

  function persist() {
    storage.save(history.value)
  }

  // ── Utilitaires ────────────────────────────────────────

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  }

  return {
    // État
    history,
    lastResult,

    // Getters
    historyCount,

    // Actions
    rollDuality,
    rollGM,
    rollDamage,
    rollQuick,
    clearHistory
  }
})
