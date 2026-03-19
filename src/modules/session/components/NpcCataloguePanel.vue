<template>
  <section
    class="npc-catalogue"
    aria-label="Catalogue des PNJs"
  >
    <h3 class="npc-catalogue__title">
      Catalogue PNJs
    </h3>

    <input
      v-model="search"
      type="text"
      class="npc-catalogue__search"
      placeholder="Chercher par nom, titre, faction, lieu..."
      aria-label="Rechercher un PNJ"
    />

    <p
      v-if="npcStore.npcs.length === 0"
      class="npc-catalogue__empty-all"
    >
      Aucun PNJ cree.
      <router-link to="/table/pnjs">
        Creer un PNJ
      </router-link>
    </p>

    <ul
      v-else
      class="npc-catalogue__list"
      role="listbox"
      aria-label="Liste des PNJs"
    >
      <li
        v-for="npc in filteredNpcs"
        :key="npc.id"
        class="npc-catalogue__item"
        role="option"
        tabindex="0"
        :aria-selected="false"
        @click="selectNpc(npc.id)"
        @keydown.enter="selectNpc(npc.id)"
        @keydown.space.prevent="selectNpc(npc.id)"
      >
        <span
          class="npc-catalogue__badge"
          :class="`npc-catalogue__badge--${npc.status}`"
          aria-hidden="true"
        ></span>
        <span class="npc-catalogue__name">{{ npc.name }}</span>
        <span
          v-if="npc.title"
          class="npc-catalogue__item-title"
        >
          {{ npc.title }}
        </span>
        <span
          v-if="npc.faction"
          class="npc-catalogue__faction"
        >
          {{ npc.faction }}
        </span>
        <span
          class="npc-catalogue__status"
          :class="`npc-status--${npc.status}`"
        >
          {{ statusLabel(npc.status) }}
        </span>
      </li>
      <li
        v-if="filteredNpcs.length === 0"
        class="npc-catalogue__empty"
      >
        Aucun PNJ trouve.
      </li>
    </ul>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import { useNpcStore } from '@modules/npcs'

/** Labels de statut en francais */
const STATUS_LABELS = {
  ally: 'Allie',
  neutral: 'Neutre',
  hostile: 'Hostile',
  dead: 'Mort',
  missing: 'Disparu'
}

/**
 * NpcCataloguePanel — Catalogue PNJ recherchable en lecture seule.
 * Affiche tous les PNJs avec badge de statut couleur.
 * Emet `select-npc` avec l'id du PNJ au clic.
 */
export default {
  name: 'NpcCataloguePanel',
  emits: ['select-npc'],

  setup(props, { emit }) {
    const npcStore = useNpcStore()
    const search = ref('')

    /**
     * Liste des PNJs filtres par la recherche textuelle.
     * Recherche sur le nom, titre, faction et lieu.
     */
    const filteredNpcs = computed(() => {
      const q = search.value.trim().toLowerCase()
      if (!q) return npcStore.npcs
      return npcStore.npcs.filter(npc =>
        (npc.name || '').toLowerCase().includes(q) ||
        (npc.title || '').toLowerCase().includes(q) ||
        (npc.faction || '').toLowerCase().includes(q) ||
        (npc.location || '').toLowerCase().includes(q)
      )
    })

    /**
     * Retourne le label francais d'un statut PNJ.
     * @param {string} status — Statut du PNJ
     * @returns {string}
     */
    function statusLabel(status) {
      return STATUS_LABELS[status] || status
    }

    /**
     * Emet l'evenement de selection d'un PNJ.
     * @param {string} id — Identifiant du PNJ
     */
    function selectNpc(id) {
      emit('select-npc', id)
    }

    return { npcStore, search, filteredNpcs, statusLabel, selectNpc }
  }
}
</script>

<style scoped>
.npc-catalogue__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
}

.npc-catalogue__search {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  box-sizing: border-box;
}

.npc-catalogue__empty-all {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-sm) 0;
}

.npc-catalogue__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.npc-catalogue__item {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.npc-catalogue__item:hover {
  background: var(--color-bg-elevated);
}

.npc-catalogue__item:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 2px;
}

.npc-catalogue__badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.npc-catalogue__badge--ally {
  background: var(--color-accent-success);
}

.npc-catalogue__badge--neutral {
  background: var(--color-text-muted);
}

.npc-catalogue__badge--hostile {
  background: var(--color-accent-danger);
}

.npc-catalogue__badge--dead {
  background: var(--color-text-muted);
  opacity: 0.4;
}

.npc-catalogue__badge--missing {
  background: var(--color-accent-warning);
}

.npc-catalogue__name {
  font-weight: var(--font-weight-medium);
}

.npc-catalogue__item-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.npc-catalogue__faction {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.npc-catalogue__status {
  font-size: var(--font-size-xs);
  margin-left: auto;
  white-space: nowrap;
}

.npc-status--ally {
  color: var(--color-accent-success);
}

.npc-status--hostile {
  color: var(--color-accent-danger);
}

.npc-status--neutral {
  color: var(--color-text-muted);
}

.npc-status--dead {
  color: var(--color-text-muted);
  opacity: 0.4;
}

.npc-status--missing {
  color: var(--color-accent-warning);
}

.npc-catalogue__empty {
  padding: var(--space-md);
  color: var(--color-text-muted);
  text-align: center;
  font-size: var(--font-size-sm);
}
</style>
