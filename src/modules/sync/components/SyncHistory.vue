<template>
  <section
    class="sync-history"
    aria-labelledby="sync-history-heading"
  >
    <div class="sync-history__header">
      <h2
        id="sync-history-heading"
        class="sync-history__title"
      >
        📋 Historique
      </h2>
      <button
        v-if="history.length > 0"
        class="sync-history__clear-btn"
        @click="handleClear"
      >
        Vider
      </button>
    </div>

    <p
      v-if="history.length === 0"
      class="sync-history__empty"
    >
      Aucune synchronisation effectuée.
    </p>

    <ul
      v-else
      class="sync-history__list"
      aria-label="Historique des synchronisations"
    >
      <li
        v-for="entry in history"
        :key="entry.id"
        class="sync-history__item"
        :class="{ 'sync-history__item--error': !entry.success }"
      >
        <span
          class="sync-history__icon"
          aria-hidden="true"
        >{{ entryIcon(entry) }}</span>
        <span class="sync-history__label">{{ entryLabel(entry) }}</span>
        <span class="sync-history__date">{{ formatDate(entry.date) }}</span>
        <span
          class="sync-history__badge"
          :class="entry.success ? 'sync-history__badge--ok' : 'sync-history__badge--fail'"
        >
          {{ entry.success ? '✓' : '✗' }}
        </span>
      </li>
    </ul>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useSyncStore } from '../stores/syncStore.js'

export default {
  name: 'SyncHistory',

  setup() {
    const syncStore = useSyncStore()

    const history = computed(() =>
      Array.isArray(syncStore.history) ? syncStore.history : []
    )

    function entryIcon(entry) {
      if (entry.method === 'gist') {
        return entry.type === 'push' ? '⬆️' : '⬇️'
      }
      return entry.type === 'export' ? '📥' : '📤'
    }

    function entryLabel(entry) {
      const method = entry.method === 'gist' ? 'Gist' : 'Fichier'
      const type = entry.type === 'push' || entry.type === 'export' ? 'Export' : 'Import'
      return `${type} (${method})`
    }

    function formatDate(iso) {
      if (!iso) return '—'
      try {
        return new Date(iso).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return iso
      }
    }

    function handleClear() {
      syncStore.clearHistory()
    }

    return {
      history,
      entryIcon,
      entryLabel,
      formatDate,
      handleClear
    }
  }
}
</script>

<style scoped>
.sync-history {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.sync-history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.sync-history__title {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  margin: 0;
}

.sync-history__clear-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  padding: var(--space-xs) var(--space-sm);
  cursor: pointer;
  font-family: inherit;
}

.sync-history__clear-btn:hover {
  color: var(--color-accent-danger);
  border-color: var(--color-accent-danger);
}

.sync-history__empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
  margin: 0;
}

.sync-history__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.sync-history__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.sync-history__item--error {
  opacity: 0.6;
}

.sync-history__icon {
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.sync-history__label {
  flex: 1;
}

.sync-history__date {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.sync-history__badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sync-history__badge--ok {
  background-color: rgba(76, 175, 80, 0.2);
  color: var(--color-accent-success);
}

.sync-history__badge--fail {
  background-color: rgba(244, 67, 54, 0.2);
  color: var(--color-accent-danger);
}
</style>
