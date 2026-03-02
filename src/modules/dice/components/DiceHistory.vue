<template>
  <aside
    class="dice-history"
    aria-label="Historique des lancers"
  >
    <div class="history-header">
      <h3 class="panel-title">
        📜 Historique
      </h3>
      <span class="history-count">{{ entries.length }}</span>
      <button
        v-if="entries.length > 0"
        class="clear-btn"
        @click="$emit('clear')"
      >
        Effacer
      </button>
    </div>

    <div
      v-if="entries.length === 0"
      class="history-empty"
    >
      <p>
        Aucun lancer enregistré.
      </p>
    </div>

    <TransitionGroup
      v-else
      name="list"
      tag="ul"
      class="history-list"
    >
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="history-entry"
        :class="`history-entry--${entry.type}`"
      >
        <div class="entry-header">
          <span class="entry-label">{{ entry.label }}</span>
          <time
            class="entry-time"
            :datetime="new Date(entry.timestamp).toISOString()"
          >{{ formatTime(entry.timestamp) }}</time>
        </div>

        <!-- Duality -->
        <div
          v-if="entry.type === 'duality'"
          class="entry-body"
        >
          <span
            class="entry-badge"
            :style="{ background: entry.outcomeData.color }"
          >{{ entry.outcomeData.icon }} {{ entry.outcomeData.shortLabel }}</span>
          <span class="entry-total">{{ entry.total }}</span>
          <span class="entry-detail">
            ({{ entry.hopeValue }}+{{ entry.fearValue }}{{ entry.modifier ? `${entry.modifier > 0 ? '+' : ''}${entry.modifier}` : '' }})
          </span>
        </div>

        <!-- GM d20 -->
        <div
          v-else-if="entry.type === 'gm-d20'"
          class="entry-body"
        >
          <span
            v-if="entry.natural20"
            class="entry-badge entry-badge--crit"
          >NAT 20</span>
          <span
            v-else-if="entry.success === true"
            class="entry-badge entry-badge--hit"
          >Touché</span>
          <span
            v-else-if="entry.success === false"
            class="entry-badge entry-badge--miss"
          >Raté</span>
          <span class="entry-total">{{ entry.total }}</span>
          <span class="entry-detail">(d20: {{ entry.value }}{{ entry.modifier ? `${entry.modifier > 0 ? '+' : ''}${entry.modifier}` : '' }})</span>
        </div>

        <!-- Damage -->
        <div
          v-else-if="entry.type === 'damage'"
          class="entry-body"
        >
          <span
            v-if="entry.critical"
            class="entry-badge entry-badge--crit"
          >CRIT</span>
          <span class="entry-total entry-total--damage">{{ entry.total }}</span>
          <span class="entry-detail">[{{ entry.rolls.join(', ') }}]{{ entry.modifier ? `${entry.modifier > 0 ? '+' : ''}${entry.modifier}` : '' }}</span>
        </div>

        <!-- Quick -->
        <div
          v-else
          class="entry-body"
        >
          <span class="entry-total">{{ entry.total }}</span>
          <span
            v-if="entry.rolls && entry.rolls.length > 1"
            class="entry-detail"
          >[{{ entry.rolls.join(', ') }}]</span>
        </div>
      </li>
    </TransitionGroup>
  </aside>
</template>

<script>
export default {
  name: 'DiceHistory',
  props: {
    entries: { type: Array, required: true }
  },
  emits: ['clear'],
  methods: {
    formatTime(ts) {
      return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  }
}
</script>

<style scoped>
.dice-history {
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 8px;
  padding: var(--space-md);
  max-height: 500px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.panel-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1rem;
  margin: 0;
  color: var(--text-primary);
  flex: 1;
}

.history-count {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
  background: var(--bg-tertiary, #2a2a4a);
  padding: 1px 6px;
  border-radius: 8px;
}

.clear-btn {
  padding: 2px 8px;
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted, #6b7280);
  font-size: 0.7rem;
  cursor: pointer;
}

.clear-btn:hover { color: var(--accent-fear, #c84b31); border-color: var(--accent-fear, #c84b31); }

.history-empty {
  text-align: center;
  padding: var(--space-md);
  color: var(--text-muted, #6b7280);
  font-size: 0.85rem;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-entry {
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 4px;
  border-left: 3px solid var(--border-color, #3a3a5a);
}

.history-entry--duality { border-left-color: var(--accent-hope, #53a8b6); }
.history-entry--gm-d20 { border-left-color: #ef4444; }
.history-entry--damage { border-left-color: var(--accent-fear, #c84b31); }
.history-entry--quick { border-left-color: #a855f7; }

.entry-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.entry-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.entry-time {
  font-size: 0.65rem;
  color: var(--text-muted, #6b7280);
  font-variant-numeric: tabular-nums;
}

.entry-body {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.entry-badge {
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
}

.entry-badge--crit { background: #eab308; color: #000; }
.entry-badge--hit { background: #22c55e; color: #000; }
.entry-badge--miss { background: var(--accent-fear, #c84b31); }

.entry-total {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.entry-total--damage { color: var(--accent-fear, #c84b31); }

.entry-detail {
  font-size: 0.7rem;
  color: var(--text-muted, #6b7280);
  font-family: monospace;
}

/* Transitions */
.list-enter-active { animation: slideIn 0.25s ease; }
.list-leave-active { animation: slideIn 0.15s ease reverse; }

@keyframes slideIn {
  0% { opacity: 0; transform: translateX(-8px); }
  100% { opacity: 1; transform: translateX(0); }
}
</style>
