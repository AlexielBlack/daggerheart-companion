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

    <!-- Etat vide -->
    <p
      v-if="npcs.length === 0"
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
        v-for="npc in npcs"
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
import { computed } from 'vue'
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

    const npcs = computed(() => {
      return sessionStore.loadedNpcIds
        .map(id => npcStore.getById(id))
        .filter(Boolean)
    })

    return { sessionStore, npcs }
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
