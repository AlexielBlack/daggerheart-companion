<template>
  <div
    class="session-timer"
    role="timer"
    aria-label="Minuteur de session"
  >
    <!-- Affichage du temps -->
    <span class="session-timer__time">
      {{ formattedTime }}
    </span>

    <!-- Compteur de rounds -->
    <div class="session-timer__round">
      <button
        type="button"
        class="session-timer__round-btn"
        :disabled="currentRound <= 1"
        aria-label="Round précédent"
        @click="decrementRound"
      >
        −
      </button>
      <span class="session-timer__round-label">
        T{{ currentRound }}
      </span>
      <button
        type="button"
        class="session-timer__round-btn"
        aria-label="Round suivant"
        @click="advanceRound"
      >
        +
      </button>
    </div>

    <!-- Contrôles -->
    <div class="session-timer__controls">
      <button
        v-if="!isRunning"
        type="button"
        class="session-timer__btn session-timer__btn--play"
        aria-label="Démarrer le minuteur"
        @click="start"
      >
        ▶
      </button>
      <button
        v-else
        type="button"
        class="session-timer__btn session-timer__btn--pause"
        aria-label="Mettre en pause"
        @click="pause"
      >
        ⏸
      </button>
      <button
        type="button"
        class="session-timer__btn session-timer__btn--reset"
        aria-label="Réinitialiser le minuteur"
        @click="reset"
      >
        ⟳
      </button>
    </div>
  </div>
</template>

<script>
import { useSessionTimer } from '../composables/useSessionTimer'

/**
 * @component SessionTimer
 * @description Minuteur de session compact avec compteur de rounds.
 * Affiche le temps écoulé, permet de démarrer/pauser/réinitialiser,
 * et de suivre les tours de combat.
 */
export default {
  name: 'SessionTimer',

  setup() {
    const {
      formattedTime,
      isRunning,
      currentRound,
      start,
      pause,
      reset,
      advanceRound,
      decrementRound
    } = useSessionTimer()

    return {
      formattedTime,
      isRunning,
      currentRound,
      start,
      pause,
      reset,
      advanceRound,
      decrementRound
    }
  }
}
</script>

<style scoped>
.session-timer {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: var(--radius-md, 6px);
  font-size: 0.8rem;
}

.session-timer__time {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-accent-hope, #53a8b6);
  min-width: 50px;
  text-align: center;
}

.session-timer__round {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.session-timer__round-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 24px;
  text-align: center;
}

.session-timer__round-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  line-height: 1;
}

.session-timer__round-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.session-timer__round-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.session-timer__controls {
  display: inline-flex;
  gap: 4px;
}

.session-timer__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  font-size: 0.7rem;
  cursor: pointer;
  line-height: 1;
}

.session-timer__btn--play {
  color: var(--color-accent-success, #22c55e);
}

.session-timer__btn--pause {
  color: var(--color-accent-warning, #f59e0b);
}

.session-timer__btn--reset {
  color: var(--color-text-secondary);
}

.session-timer__btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
