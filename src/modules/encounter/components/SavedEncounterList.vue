<template>
  <div
    class="saved-list"
    aria-label="Rencontres sauvegardées"
  >
    <div
      v-if="encounters.length === 0"
      class="saved-list__empty"
    >
      Aucune rencontre sauvegardée.
    </div>

    <ul
      v-else
      class="saved-list__items"
    >
      <li
        v-for="enc in encounters"
        :key="enc.id"
        class="saved-item"
      >
        <div
          class="saved-item__info"
          role="button"
          tabindex="0"
          @click="$emit('load', enc)"
          @keydown.enter="$emit('load', enc)"
        >
          <span class="saved-item__name">{{ enc.name }}</span>
          <span class="saved-item__meta">
            T{{ enc.tier }} · {{ enc.pcCount }} PJ
            · {{ enc.adversarySlots ? enc.adversarySlots.reduce((s, sl) => s + sl.quantity, 0) : 0 }} adversaires
          </span>
          <span class="saved-item__date">{{ formatDate(enc.createdAt) }}</span>
        </div>
        <button
          class="saved-item__delete"
          :aria-label="`Supprimer ${enc.name}`"
          title="Supprimer"
          @click.stop="$emit('delete', enc.id)"
        >
          ✕
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SavedEncounterList',
  props: {
    encounters: { type: Array, default: () => [] }
  },
  emits: ['load', 'delete'],
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
.saved-list__empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--text-muted, #6b7280);
  font-size: 0.85rem;
}

.saved-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.saved-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 6px;
  transition: border-color var(--transition-fast, 150ms);
}

.saved-item:hover { border-color: var(--accent-hope, #53a8b6); }

.saved-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.saved-item__name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saved-item__meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.saved-item__date {
  font-size: 0.7rem;
  color: var(--text-muted, #6b7280);
}

.saved-item__delete {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-muted, #6b7280);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast, 150ms);
}

.saved-item__delete:hover {
  color: var(--accent-fear, #c84b31);
  border-color: var(--accent-fear, #c84b31);
  background: rgba(200, 75, 49, 0.1);
}
</style>
