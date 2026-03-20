/**
 * @module encounter/composables/useSessionTimer
 * @description Minuteur de session avec compteur de rounds.
 * Persiste via useStorage pour survivre aux rechargements de page.
 * Utilise Date.now() anchoring pour un chronométrage précis.
 */

import { ref, computed, onScopeDispose } from 'vue'
import { useStorage } from '@core/composables/useStorage'

const DEFAULT_STATE = {
  startedAt: null,
  pausedAt: null,
  accumulatedMs: 0,
  currentRound: 1,
  isRunning: false
}

/**
 * Composable pour le minuteur de session.
 * @returns {Object} API du minuteur
 */
export function useSessionTimer() {
  const storage = useStorage('session-timer', { ...DEFAULT_STATE })

  // ── État réactif ──────────────────────────────────────
  const elapsed = ref(0)
  let intervalId = null

  // ── Computed ──────────────────────────────────────────

  const isRunning = computed(() => storage.data.value.isRunning)

  const isPaused = computed(() =>
    !storage.data.value.isRunning && storage.data.value.accumulatedMs > 0
  )

  const currentRound = computed(() => storage.data.value.currentRound)

  /**
   * Temps formaté en MM:SS ou HH:MM:SS si ≥ 1 heure.
   */
  const formattedTime = computed(() => {
    const totalSeconds = Math.floor(elapsed.value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pad = (n) => String(n).padStart(2, '0')

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
  })

  // ── Méthodes internes ─────────────────────────────────

  function calculateElapsed() {
    const state = storage.data.value
    if (state.isRunning && state.startedAt) {
      elapsed.value = state.accumulatedMs + (Date.now() - state.startedAt)
    } else {
      elapsed.value = state.accumulatedMs
    }
  }

  function startTicking() {
    stopTicking()
    calculateElapsed()
    intervalId = setInterval(calculateElapsed, 1000)
  }

  function stopTicking() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // ── Actions ───────────────────────────────────────────

  /**
   * Démarre ou reprend le minuteur.
   */
  function start() {
    const state = storage.data.value
    storage.save({
      ...state,
      startedAt: Date.now(),
      pausedAt: null,
      isRunning: true
    })
    startTicking()
  }

  /**
   * Met en pause le minuteur, accumule le temps écoulé.
   */
  function pause() {
    const state = storage.data.value
    if (!state.isRunning) return

    const now = Date.now()
    const totalAccumulated = state.accumulatedMs + (now - (state.startedAt || now))

    storage.save({
      ...state,
      pausedAt: now,
      accumulatedMs: totalAccumulated,
      startedAt: null,
      isRunning: false
    })
    stopTicking()
    calculateElapsed()
  }

  /**
   * Réinitialise le minuteur à zéro.
   */
  function reset() {
    stopTicking()
    storage.save({ ...DEFAULT_STATE })
    elapsed.value = 0
  }

  /**
   * Retourne le temps écoulé en ms et redémarre le timer à zéro.
   * Utile pour capturer le temps d'un tour avant reset.
   * @returns {number} Temps écoulé en millisecondes
   */
  function lapAndRestart() {
    // Calculer le temps directement depuis le storage (partagé entre instances)
    const state = storage.data.value
    let currentElapsed = state.accumulatedMs || 0
    if (state.isRunning && state.startedAt) {
      currentElapsed += Date.now() - state.startedAt
    }
    const currentRound = state.currentRound || 1
    stopTicking()
    storage.save({
      ...DEFAULT_STATE,
      startedAt: Date.now(),
      isRunning: true,
      currentRound: currentRound + 1
    })
    elapsed.value = 0
    startTicking()
    return currentElapsed
  }

  /**
   * Avance au round suivant.
   */
  function advanceRound() {
    const state = storage.data.value
    storage.save({
      ...state,
      currentRound: state.currentRound + 1
    })
  }

  /**
   * Recule d'un round (minimum 1).
   */
  function decrementRound() {
    const state = storage.data.value
    if (state.currentRound <= 1) return
    storage.save({
      ...state,
      currentRound: state.currentRound - 1
    })
  }

  /**
   * Réinitialise le compteur de rounds à 1.
   */
  function resetRounds() {
    const state = storage.data.value
    storage.save({
      ...state,
      currentRound: 1
    })
  }

  // ── Restauration ──────────────────────────────────────

  // Si le minuteur était actif, restaurer l'interval
  if (storage.data.value.isRunning) {
    startTicking()
  } else {
    calculateElapsed()
  }

  // ── Nettoyage ─────────────────────────────────────────
  onScopeDispose(() => {
    stopTicking()
  })

  return {
    elapsed,
    formattedTime,
    isRunning,
    isPaused,
    currentRound,
    start,
    pause,
    reset,
    lapAndRestart,
    advanceRound,
    decrementRound,
    resetRounds
  }
}
