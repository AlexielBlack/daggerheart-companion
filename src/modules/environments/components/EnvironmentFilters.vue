<template>
  <div
    class="env-filters"
    role="search"
    aria-label="Filtrer les environnements"
  >
    <!-- Search -->
    <div class="env-filters__search">
      <label
        for="env-search"
        class="sr-only"
      >
        Rechercher un environnement
      </label>
      <input
        id="env-search"
        type="search"
        class="env-filters__input"
        placeholder="Rechercher un environnement…"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
      />
    </div>

    <!-- Tier filters -->
    <fieldset class="env-filters__group">
      <legend class="env-filters__legend">
        Tier
      </legend>
      <div class="env-filters__chips">
        <button
          v-for="tier in tiers"
          :key="tier.value"
          class="env-filters__chip"
          :class="{
            'env-filters__chip--active': selectedTiers.includes(tier.value),
            [`env-filters__chip--tier${tier.value}`]: selectedTiers.includes(tier.value)
          }"
          :aria-pressed="selectedTiers.includes(tier.value)"
          @click="$emit('toggle-tier', tier.value)"
        >
          {{ tier.label }}
          <span class="env-filters__chip-detail">{{ tier.levels }}</span>
        </button>
      </div>
    </fieldset>

    <!-- Type filters -->
    <fieldset class="env-filters__group">
      <legend class="env-filters__legend">
        Type
      </legend>
      <div class="env-filters__chips">
        <button
          v-for="type in types"
          :key="type"
          class="env-filters__chip"
          :class="{ 'env-filters__chip--active': selectedTypes.includes(type) }"
          :aria-pressed="selectedTypes.includes(type)"
          @click="$emit('toggle-type', type)"
        >
          {{ typeIcons[type] }} {{ type }}
        </button>
      </div>
    </fieldset>

    <!-- Sort + Clear -->
    <div class="env-filters__actions">
      <div class="env-filters__sort">
        <label
          for="env-sort"
          class="env-filters__legend"
        >
          Tri
        </label>
        <select
          id="env-sort"
          class="env-filters__select"
          :value="sortField"
          @change="$emit('update:sortField', $event.target.value)"
        >
          <option value="name">
            Nom
          </option>
          <option value="tier">
            Tier
          </option>
          <option value="difficulty">
            Difficulté
          </option>
          <option value="type">
            Type
          </option>
        </select>
        <button
          class="env-filters__sort-dir btn btn--ghost btn--sm"
          :aria-label="`Tri ${sortDirection === 'asc' ? 'croissant' : 'décroissant'}`"
          @click="$emit('toggle-sort-direction')"
        >
          {{ sortDirection === 'asc' ? '↑' : '↓' }}
        </button>
      </div>

      <button
        v-if="hasActiveFilters"
        class="btn btn--ghost btn--sm"
        @click="$emit('clear-filters')"
      >
        Réinitialiser
      </button>
    </div>

    <!-- Results count -->
    <div
      class="env-filters__count"
      aria-live="polite"
    >
      {{ filteredCount }} environnement{{ filteredCount !== 1 ? 's' : '' }}
      <span
        v-if="filteredCount !== totalCount"
        class="text-muted"
      >
        / {{ totalCount }}
      </span>
    </div>
  </div>
</template>

<script>
import { ENVIRONMENT_TYPE_ICONS } from '@data/environments'

/**
 * @component EnvironmentFilters
 * @description Barre de filtres pour la bibliothèque d'environnements.
 */
export default {
  name: 'EnvironmentFilters',
  props: {
    searchQuery: { type: String, default: '' },
    selectedTiers: { type: Array, default: () => [] },
    selectedTypes: { type: Array, default: () => [] },
    sortField: { type: String, default: 'name' },
    sortDirection: { type: String, default: 'asc' },
    hasActiveFilters: { type: Boolean, default: false },
    filteredCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    tiers: { type: Array, required: true },
    types: { type: Array, required: true }
  },
  emits: [
    'update:searchQuery',
    'update:sortField',
    'toggle-tier',
    'toggle-type',
    'toggle-sort-direction',
    'clear-filters'
  ],
  computed: {
    typeIcons() {
      return ENVIRONMENT_TYPE_ICONS
    }
  }
}
</script>

<style scoped>
.env-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.env-filters__search { width: 100%; }

.env-filters__input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.env-filters__input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
}

.env-filters__input::placeholder { color: var(--color-text-muted); }

.env-filters__group { border: none; padding: 0; margin: 0; }

.env-filters__legend {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xs);
}

.env-filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.env-filters__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.env-filters__chip:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.env-filters__chip--active {
  background-color: var(--color-accent-hope);
  border-color: var(--color-accent-hope);
  color: var(--color-text-inverse);
}

.env-filters__chip--tier1.env-filters__chip--active { background-color: #2e7d32; border-color: #2e7d32; }
.env-filters__chip--tier2.env-filters__chip--active { background-color: #1565c0; border-color: #1565c0; }
.env-filters__chip--tier3.env-filters__chip--active { background-color: #6a1b9a; border-color: #6a1b9a; }
.env-filters__chip--tier4.env-filters__chip--active { background-color: #c62828; border-color: #c62828; }

.env-filters__chip-detail { font-size: 0.65rem; opacity: 0.7; }

.env-filters__actions {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.env-filters__sort {
  display: flex;
  align-items: flex-end;
  gap: var(--space-xs);
}

.env-filters__select {
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
}

.env-filters__sort-dir {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
  min-width: 32px;
}

.env-filters__count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
