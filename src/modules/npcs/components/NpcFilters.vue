<!--
  NpcFilters.vue — Barre de filtres pour la liste des PNJs.
  Recherche textuelle + filtres par statut, faction, lieu.
-->
<template>
  <div
    class="npc-filters"
    role="search"
    aria-label="Filtrer les PNJs"
  >
    <div class="npc-filters__row">
      <label
        for="npc-search"
        class="sr-only"
      >Rechercher un PNJ</label>
      <input
        id="npc-search"
        type="search"
        class="npc-filters__search"
        placeholder="Rechercher un PNJ…"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
      />

      <label
        for="npc-status"
        class="sr-only"
      >Filtrer par statut</label>
      <select
        id="npc-status"
        class="npc-filters__select"
        :value="filterStatus || ''"
        @change="$emit('update:filterStatus', $event.target.value || null)"
      >
        <option value="">
          Tous les statuts
        </option>
        <option
          v-for="s in statuses"
          :key="s.value"
          :value="s.value"
        >
          {{ s.emoji }} {{ s.label }}
        </option>
      </select>
    </div>

    <div class="npc-filters__row">
      <label
        for="npc-faction"
        class="sr-only"
      >Filtrer par faction</label>
      <select
        id="npc-faction"
        class="npc-filters__select"
        :value="filterFaction || ''"
        @change="$emit('update:filterFaction', $event.target.value || null)"
      >
        <option value="">
          Toutes les factions
        </option>
        <option
          v-for="f in factions"
          :key="f"
          :value="f"
        >
          {{ f }}
        </option>
      </select>

      <label
        for="npc-location"
        class="sr-only"
      >Filtrer par lieu</label>
      <select
        id="npc-location"
        class="npc-filters__select"
        :value="filterLocation || ''"
        @change="$emit('update:filterLocation', $event.target.value || null)"
      >
        <option value="">
          Tous les lieux
        </option>
        <option
          v-for="l in locations"
          :key="l"
          :value="l"
        >
          {{ l }}
        </option>
      </select>

      <button
        v-if="hasActiveFilters"
        class="npc-filters__clear"
        type="button"
        aria-label="Réinitialiser les filtres"
        @click="$emit('clear')"
      >
        ✕ Réinitialiser
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { ALL_NPC_STATUSES, NPC_STATUS_META } from '../constants.js'

export default {
  name: 'NpcFilters',

  props: {
    searchQuery: { type: String, default: '' },
    filterStatus: { type: String, default: null },
    filterFaction: { type: String, default: null },
    filterLocation: { type: String, default: null },
    factions: { type: Array, default: () => [] },
    locations: { type: Array, default: () => [] }
  },

  emits: [
    'update:searchQuery',
    'update:filterStatus',
    'update:filterFaction',
    'update:filterLocation',
    'clear'
  ],

  setup(props) {
    const statuses = ALL_NPC_STATUSES.map((s) => ({
      value: s,
      label: NPC_STATUS_META[s].label,
      emoji: NPC_STATUS_META[s].emoji
    }))

    const hasActiveFilters = computed(() =>
      !!(props.searchQuery || props.filterStatus || props.filterFaction || props.filterLocation)
    )

    return { statuses, hasActiveFilters }
  }
}
</script>

<style scoped>
.npc-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.npc-filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.npc-filters__search {
  flex: 1;
  min-width: 180px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.875rem;
}

.npc-filters__search::placeholder {
  color: var(--color-text-muted, #6b7280);
}

.npc-filters__select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.8rem;
  min-width: 140px;
}

.npc-filters__clear {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted, #9ca3af);
  font-size: 0.8rem;
  cursor: pointer;
}

.npc-filters__clear:hover {
  color: var(--color-text, #f9fafb);
  border-color: var(--color-text-muted, #9ca3af);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
