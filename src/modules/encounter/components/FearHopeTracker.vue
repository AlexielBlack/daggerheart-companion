<template>
  <div
    class="fh-tracker"
    role="region"
    aria-label="Tracker Fear et Hope"
  >
    <!-- Hope Pool -->
    <div class="fh-tracker__pool fh-tracker__pool--hope">
      <div class="fh-tracker__header">
        <span class="fh-tracker__emoji">✨</span>
        <span class="fh-tracker__label">Hope</span>
        <span class="fh-tracker__value fh-tracker__value--hope">{{ hope }}</span>
      </div>
      <div class="fh-tracker__controls">
        <button
          class="fh-tracker__btn fh-tracker__btn--minus"
          :disabled="hope <= 0"
          aria-label="Dépenser 1 Hope"
          @click="$emit('spend-hope', 1)"
        >
          −
        </button>
        <div
          class="fh-tracker__tokens"
          aria-hidden="true"
        >
          <span
            v-for="i in Math.min(hope, 12)"
            :key="'h' + i"
            class="fh-tracker__token fh-tracker__token--hope"
          ></span>
          <span
            v-if="hope > 12"
            class="fh-tracker__overflow"
          >+{{ hope - 12 }}</span>
        </div>
        <button
          class="fh-tracker__btn fh-tracker__btn--plus"
          :disabled="hope >= maxHope"
          aria-label="Ajouter 1 Hope"
          @click="$emit('add-hope', 1)"
        >
          +
        </button>
      </div>
    </div>

    <!-- Séparateur visuel -->
    <div
      class="fh-tracker__divider"
      aria-hidden="true"
    >
      <span
        class="fh-tracker__round"
        aria-label="Round actuel"
      >R{{ round }}</span>
    </div>

    <!-- Fear Pool -->
    <div class="fh-tracker__pool fh-tracker__pool--fear">
      <div class="fh-tracker__header">
        <span class="fh-tracker__emoji">😱</span>
        <span class="fh-tracker__label">Fear</span>
        <span class="fh-tracker__value fh-tracker__value--fear">{{ fear }}</span>
      </div>
      <div class="fh-tracker__controls">
        <button
          class="fh-tracker__btn fh-tracker__btn--minus"
          :disabled="fear <= 0"
          aria-label="Dépenser 1 Fear"
          @click="$emit('spend-fear', 1)"
        >
          −
        </button>
        <div
          class="fh-tracker__tokens"
          aria-hidden="true"
        >
          <span
            v-for="i in Math.min(fear, 12)"
            :key="'f' + i"
            class="fh-tracker__token fh-tracker__token--fear"
          ></span>
          <span
            v-if="fear > 12"
            class="fh-tracker__overflow"
          >+{{ fear - 12 }}</span>
        </div>
        <button
          class="fh-tracker__btn fh-tracker__btn--plus"
          :disabled="fear >= maxFear"
          aria-label="Ajouter 1 Fear"
          @click="$emit('add-fear', 1)"
        >
          +
        </button>
      </div>
    </div>

    <!-- Historique compact (toggle) -->
    <div
      v-if="showHistory && history.length > 0"
      class="fh-tracker__history"
    >
      <div
        v-for="(entry, idx) in recentHistory"
        :key="idx"
        class="fh-tracker__history-entry"
        :class="'fh-tracker__history-entry--' + entry.type"
      >
        <span class="fh-tracker__history-icon">{{ entry.type === 'hope' ? '✨' : '😱' }}</span>
        <span class="fh-tracker__history-delta">{{ entry.delta > 0 ? '+' : '' }}{{ entry.delta }}</span>
        <span
          v-if="entry.reason"
          class="fh-tracker__history-reason"
        >{{ entry.reason }}</span>
        <span class="fh-tracker__history-round">R{{ entry.round }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { MAX_FEAR, MAX_HOPE } from '@data/encounters/liveConstants'

export default {
  name: 'FearHopeTracker',
  props: {
    fear: { type: Number, required: true },
    hope: { type: Number, required: true },
    round: { type: Number, default: 1 },
    history: { type: Array, default: () => [] },
    showHistory: { type: Boolean, default: false },
    maxHistoryEntries: { type: Number, default: 5 }
  },
  emits: ['add-fear', 'spend-fear', 'add-hope', 'spend-hope'],
  computed: {
    maxFear() { return MAX_FEAR },
    maxHope() { return MAX_HOPE },
    recentHistory() {
      return this.history.slice(-this.maxHistoryEntries).reverse()
    }
  }
}
</script>

<style scoped>
.fh-tracker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: stretch;
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.fh-tracker__pool {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
}

.fh-tracker__pool--hope {
  border-left: 3px solid var(--color-accent-hope);
}

.fh-tracker__pool--fear {
  border-left: 3px solid var(--color-accent-fear);
}

.fh-tracker__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.fh-tracker__emoji {
  font-size: 1.2rem;
  line-height: 1;
}

.fh-tracker__label {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fh-tracker__value {
  margin-left: auto;
  font-size: var(--font-xl, 1.5rem);
  font-weight: var(--font-bold);
  font-variant-numeric: tabular-nums;
}

.fh-tracker__value--hope {
  color: var(--color-accent-hope);
}

.fh-tracker__value--fear {
  color: var(--color-accent-fear);
}

.fh-tracker__controls {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.fh-tracker__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.fh-tracker__btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.fh-tracker__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.fh-tracker__tokens {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  flex: 1;
  min-height: 24px;
  align-items: center;
  justify-content: center;
}

.fh-tracker__token {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
}

.fh-tracker__token--hope {
  background: var(--color-accent-hope);
  box-shadow: 0 0 4px var(--color-accent-hope);
}

.fh-tracker__token--fear {
  background: var(--color-accent-fear);
  box-shadow: 0 0 4px var(--color-accent-fear);
}

.fh-tracker__overflow {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-semibold);
}

.fh-tracker__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-xs);
}

.fh-tracker__round {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-accent-gold);
}

/* ── Historique ── */

.fh-tracker__history {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: var(--space-xs);
  border-top: 1px solid var(--color-border);
}

.fh-tracker__history-entry {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
}

.fh-tracker__history-entry--hope {
  background: rgba(83, 168, 182, 0.08);
}

.fh-tracker__history-entry--fear {
  background: rgba(200, 75, 49, 0.08);
}

.fh-tracker__history-icon {
  font-size: 0.75rem;
}

.fh-tracker__history-delta {
  font-weight: var(--font-bold);
  font-variant-numeric: tabular-nums;
  min-width: 24px;
}

.fh-tracker__history-entry--hope .fh-tracker__history-delta {
  color: var(--color-accent-hope);
}

.fh-tracker__history-entry--fear .fh-tracker__history-delta {
  color: var(--color-accent-fear);
}

.fh-tracker__history-reason {
  color: var(--color-text-secondary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fh-tracker__history-round {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

/* ── Responsive ── */

@media (max-width: 480px) {
  .fh-tracker {
    flex-direction: column;
  }

  .fh-tracker__divider {
    padding: var(--space-xs) 0;
  }

  .fh-tracker__pool {
    min-width: unset;
  }
}
</style>
