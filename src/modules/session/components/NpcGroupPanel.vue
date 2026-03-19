<template>
  <section
    class="npc-group"
    aria-label="PNJs de session"
  >
    <!-- Header -->
    <div class="npc-group__header">
      <h3 class="npc-group__title">
        <span aria-hidden="true">&#x1F3AD;</span>
        PNJs ({{ npcs.length }})
      </h3>
      <div class="npc-group__actions">
        <button
          v-if="npcs.length > 0"
          class="btn btn--sm btn--ghost"
          aria-label="Retirer tous les PNJs de la session"
          @click="sessionStore.clearNpcs()"
        >
          Tout retirer
        </button>
        <button
          class="btn btn--sm btn--primary"
          aria-label="Ajouter des PNJs a la session"
          @click="$emit('open-catalogue')"
        >
          + Ajouter
        </button>
      </div>
    </div>

    <!-- Filtres par statut -->
    <div
      v-if="npcs.length > 2"
      class="npc-group__filters"
      role="radiogroup"
      aria-label="Filtrer les PNJs par statut"
    >
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        class="npc-group__filter-btn"
        :class="{ 'npc-group__filter-btn--active': statusFilter === opt.value }"
        role="radio"
        :aria-checked="String(statusFilter === opt.value)"
        @click="statusFilter = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Etat vide -->
    <p
      v-if="sortedNpcs.length === 0"
      class="npc-group__empty"
    >
      Aucun PNJ charge.
    </p>

    <!-- Grille -->
    <div
      v-else
      class="npc-group__grid"
      role="list"
      aria-label="Liste des PNJs"
    >
      <div
        v-for="npc in sortedNpcs"
        :key="npc.id"
        role="listitem"
      >
        <NpcSceneCard
          :npc="npc"
          :is-spotlight="sessionStore.spotlightNpcId === npc.id"
          @remove="sessionStore.removeNpc($event)"
          @open-details="$emit('open-npc', $event)"
          @spotlight="sessionStore.setSpotlight($event)"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/sessionStore'
import { useNpcStore } from '@modules/npcs'
import NpcSceneCard from './NpcSceneCard.vue'

export default {
  name: 'NpcGroupPanel',

  components: { NpcSceneCard },

  emits: ['open-catalogue', 'open-npc'],

  setup() {
    const sessionStore = useSessionStore()
    const npcStore = useNpcStore()

    // Ordre de priorite des statuts pour le tri
    const statusOrder = { hostile: 0, neutral: 1, ally: 2, missing: 3, dead: 4 }
    const statusFilter = ref('all')

    const filterOptions = [
      { value: 'all', label: 'Tous' },
      { value: 'hostile', label: 'Hostiles' },
      { value: 'neutral', label: 'Neutres' },
      { value: 'ally', label: 'Allies' }
    ]

    const npcs = computed(() => {
      return sessionStore.loadedNpcIds
        .map(id => npcStore.getById(id))
        .filter(Boolean)
    })

    // Tri spotlight-first puis par priorite de statut, avec filtre optionnel
    const sortedNpcs = computed(() => {
      let list = [...npcs.value]
      if (statusFilter.value !== 'all') {
        list = list.filter(n => n.status === statusFilter.value)
      }
      list.sort((a, b) => {
        const aSpot = sessionStore.spotlightNpcId === a.id ? -1 : 0
        const bSpot = sessionStore.spotlightNpcId === b.id ? -1 : 0
        if (aSpot !== bSpot) return aSpot - bSpot
        return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
      })
      return list
    })

    return { sessionStore, npcs, statusFilter, filterOptions, sortedNpcs }
  }
}
</script>

<style scoped>
.npc-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm, 0.5rem);
}

.npc-group__title {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-bold, 700);
  margin: 0;
}

.npc-group__actions {
  display: flex;
  gap: var(--space-xs, 0.25rem);
}

.npc-group__empty {
  color: var(--color-text-muted, #888);
  font-size: var(--font-size-sm, 0.875rem);
  text-align: center;
  padding: var(--space-md, 1rem) 0;
}

.npc-group__filters {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.npc-group__filter-btn {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-xs);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.npc-group__filter-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.npc-group__filter-btn--active {
  background: var(--color-accent-hope);
  color: var(--color-text-inverse, #1a1a2e);
  border-color: var(--color-accent-hope);
}

.npc-group__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-sm, 0.5rem);
}

@media (min-width: 640px) {
  .npc-group__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .npc-group__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
