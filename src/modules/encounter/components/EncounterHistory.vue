<template>
  <div
    class="encounter-history"
    role="region"
    aria-label="Historique des rencontres"
  >
    <!-- Stats agrégées -->
    <div
      v-if="stats.totalEncounters > 0"
      class="history-stats"
      aria-label="Statistiques de campagne"
    >
      <div class="stat-chip">
        <span class="stat-chip__value">{{ stats.totalEncounters }}</span>
        <span class="stat-chip__label">{{ stats.totalEncounters === 1 ? 'combat' : 'combats' }}</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip__value">{{ stats.totalDefeated }}</span>
        <span class="stat-chip__label">vaincus</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip__value">{{ stats.hitRatio }}%</span>
        <span class="stat-chip__label">précision</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip__value">{{ stats.totalPcsFallen }}</span>
        <span class="stat-chip__label">PJ tombés</span>
      </div>
    </div>

    <!-- Liste vide -->
    <div
      v-if="entries.length === 0"
      class="history-empty"
    >
      Aucune rencontre terminée enregistrée.
    </div>

    <!-- Liste des rencontres -->
    <ul
      v-else
      class="history-list"
    >
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="history-item"
      >
        <div class="history-item__header">
          <span class="history-item__name">{{ entry.name || 'Rencontre sans nom' }}</span>
          <button
            class="history-item__delete"
            :aria-label="`Supprimer ${entry.name || 'cette entrée'}`"
            title="Supprimer"
            @click="$emit('remove', entry.id)"
          >
            ✕
          </button>
        </div>
        <div class="history-item__meta">
          <span>T{{ entry.tier }}</span>
          <span>{{ entry.defeated?.length || 0 }}/{{ entry.totalAdversaries || 0 }} vaincus</span>
          <span>{{ formatDate(entry.endedAt) }}</span>
        </div>
        <div
          v-if="entry.hitCount || entry.missCount"
          class="history-item__stats"
        >
          <span class="tag tag--hit">{{ entry.hitCount }} hits</span>
          <span class="tag tag--miss">{{ entry.missCount }} miss</span>
          <span
            v-if="entry.pcsFallen?.length > 0"
            class="tag tag--fallen"
          >{{ entry.pcsFallen.length }} PJ tombé{{ entry.pcsFallen.length > 1 ? 's' : '' }}</span>
        </div>
      </li>
    </ul>

    <!-- Bouton vider -->
    <button
      v-if="entries.length > 0"
      class="history-clear"
      @click="$emit('clear')"
    >
      Vider l'historique
    </button>
  </div>
</template>

<script>
export default {
  name: 'EncounterHistory',
  props: {
    entries: { type: Array, default: () => [] },
    stats: { type: Object, default: () => ({ totalEncounters: 0, totalDefeated: 0, hitRatio: 0, totalPcsFallen: 0 }) }
  },
  emits: ['remove', 'clear'],
  methods: {
    formatDate(iso) {
      if (!iso) return ''
      try {
        return new Date(iso).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.encounter-history {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.history-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border, #3a3a5a);
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 8px;
  min-width: 56px;
}

.stat-chip__value {
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-accent-hope, #53a8b6);
}

.stat-chip__label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted, #6b7280);
}

.history-empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.85rem;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.history-item {
  padding: 8px 10px;
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-item__name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item__meta {
  display: flex;
  gap: var(--space-sm);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.history-item__stats {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag--hit {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.tag--miss {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.tag--fallen {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.history-item__delete {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast, 150ms);
}

.history-item__delete:hover {
  color: var(--color-accent-fear, #c84b31);
  border-color: var(--color-accent-fear, #c84b31);
  background: rgba(200, 75, 49, 0.1);
}

.history-clear {
  align-self: center;
  padding: 6px 16px;
  background: transparent;
  border: 1px solid var(--color-text-muted, #6b7280);
  border-radius: 6px;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.history-clear:hover {
  color: var(--color-accent-fear, #c84b31);
  border-color: var(--color-accent-fear, #c84b31);
}
</style>
