<template>
  <div
    class="env-picker"
    role="search"
    aria-label="Choisir un environnement"
  >
    <input
      v-model="search"
      type="text"
      class="env-picker__search"
      placeholder="Chercher un environnement…"
      aria-label="Rechercher un environnement"
    />

    <ul
      class="env-picker__list"
      role="listbox"
      aria-label="Environnements disponibles"
    >
      <li
        v-for="env in filteredEnvironments"
        :key="env.id"
        class="env-picker__item"
        :class="{ 'env-picker__item--selected': selectedId === env.id }"
        role="option"
        tabindex="0"
        :aria-selected="selectedId === env.id ? 'true' : 'false'"
        @click="$emit('select', selectedId === env.id ? null : env.id)"
        @keydown.enter="$emit('select', selectedId === env.id ? null : env.id)"
        @keydown.space.prevent="$emit('select', selectedId === env.id ? null : env.id)"
      >
        <div class="env-picker__item-header">
          <span
            class="env-picker__tier"
            :class="`tier-badge--${env.tier}`"
          >T{{ env.tier }}</span>
          <span class="env-picker__type-icon">{{ typeIcon(env.type) }}</span>
          <span class="env-picker__name">{{ env.name }}</span>
        </div>
        <p class="env-picker__desc">
          {{ env.description }}
        </p>
      </li>
      <li
        v-if="filteredEnvironments.length === 0"
        class="env-picker__empty"
      >
        Aucun environnement trouvé.
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { allEnvironments, ENVIRONMENT_TYPE_ICONS } from '@data/environments'

export default {
  name: 'EnvironmentPicker',
  props: {
    selectedId: { type: String, default: null }
  },
  emits: ['select'],
  setup() {
    const search = ref('')

    const filteredEnvironments = computed(() => {
      let result = allEnvironments

      if (search.value.trim()) {
        const q = search.value.trim().toLowerCase()
        result = result.filter((e) =>
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        )
      }

      return result
    })

    function typeIcon(type) {
      return ENVIRONMENT_TYPE_ICONS[type] || '🌍'
    }

    return { search, filteredEnvironments, typeIcon }
  }
}
</script>

<style scoped>
.env-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 300px;
}

.env-picker__search {
  padding: 6px 10px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.85rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.env-picker__search::placeholder { color: var(--text-muted, #6b7280); }
.env-picker__search:focus { outline: 2px solid var(--accent-hope, #53a8b6); outline-offset: 1px; }

.env-picker__list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.env-picker__item {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.env-picker__item:hover {
  background: var(--bg-tertiary, #2a2a4a);
  border-color: var(--border-color, #3a3a5a);
}

.env-picker__item--selected {
  border-color: var(--accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.08);
}

.env-picker__item-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.env-picker__tier {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
}

.tier-badge--1 { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.tier-badge--2 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.tier-badge--3 { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
.tier-badge--4 { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.env-picker__type-icon { font-size: 0.9rem; }

.env-picker__name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
}

.env-picker__desc {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
  line-height: 1.3;
}

.env-picker__empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--text-muted, #6b7280);
  font-size: 0.85rem;
}
</style>
