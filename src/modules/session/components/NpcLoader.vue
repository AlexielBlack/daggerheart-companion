<template>
  <section
    class="npc-loader"
    aria-label="PNJs de session"
  >
    <h3 class="npc-loader__title">
      <span aria-hidden="true">&#x1F3AD;</span>
      PNJs ({{ sessionStore.loadedNpcCount }})
    </h3>

    <!-- PNJs charges : chips -->
    <div
      v-if="sessionStore.hasNpcs"
      class="npc-loader__loaded"
    >
      <div class="npc-loader__chips">
        <span
          v-for="npc in sessionStore.loadedNpcs"
          :key="npc.id"
          class="npc-chip"
          :class="`npc-chip--${npc.status}`"
        >
          <span
            class="npc-chip__dot"
            aria-hidden="true"
          ></span>
          {{ npc.name }}
          <button
            class="npc-chip__remove"
            :aria-label="`Retirer ${npc.name}`"
            @click="sessionStore.removeNpc(npc.id)"
          >
            &#x2715;
          </button>
        </span>
      </div>
      <button
        class="npc-loader__clear btn btn--sm btn--ghost"
        aria-label="Retirer tous les PNJs"
        @click="sessionStore.clearNpcs()"
      >
        Tout retirer
      </button>
    </div>

    <!-- Selecteur multi-select -->
    <details class="npc-loader__picker">
      <summary class="npc-loader__summary">
        Ajouter des PNJs
      </summary>

      <input
        v-model="search"
        type="text"
        class="npc-loader__search"
        placeholder="Chercher un PNJ..."
        aria-label="Rechercher un PNJ"
      />

      <p
        v-if="npcStore.npcs.length === 0"
        class="npc-loader__empty-all"
      >
        Aucun PNJ cree.
        <router-link to="/edition/pnjs">
          Creer un PNJ
        </router-link>
      </p>

      <ul
        v-else
        class="npc-loader__list"
        role="listbox"
        aria-label="PNJs disponibles"
        aria-multiselectable="true"
      >
        <li
          v-for="npc in filteredNpcs"
          :key="npc.id"
          class="npc-loader__item"
          :class="{ 'npc-loader__item--selected': isLoaded(npc.id) }"
          role="option"
          tabindex="0"
          :aria-selected="isLoaded(npc.id) ? 'true' : 'false'"
          @click="sessionStore.toggleNpc(npc.id)"
          @keydown.enter="sessionStore.toggleNpc(npc.id)"
          @keydown.space.prevent="sessionStore.toggleNpc(npc.id)"
        >
          <span
            class="npc-loader__check"
            aria-hidden="true"
          >
            {{ isLoaded(npc.id) ? '&#x2611;' : '&#x2610;' }}
          </span>
          <span class="npc-loader__item-name">{{ npc.name }}</span>
          <span
            v-if="npc.title"
            class="npc-loader__item-title"
          >
            {{ npc.title }}
          </span>
          <span
            class="npc-loader__item-status"
            :class="`npc-status--${npc.status}`"
          >
            {{ statusLabel(npc.status) }}
          </span>
        </li>
        <li
          v-if="filteredNpcs.length === 0"
          class="npc-loader__empty"
        >
          Aucun PNJ trouve.
        </li>
      </ul>
    </details>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/sessionStore'
import { useNpcStore } from '@modules/npcs'

/**
 * NpcLoader — Charge un ou plusieurs PNJs dans la session (multi-select).
 * Affiche les PNJs actifs sous forme de chips avec indicateur de statut,
 * et un selecteur avec recherche pour ajouter/retirer des PNJs.
 */
export default {
  name: 'NpcLoader',

  setup() {
    const sessionStore = useSessionStore()
    const npcStore = useNpcStore()
    const search = ref('')

    /**
     * Liste des PNJs filtres par la recherche textuelle.
     * Recherche sur le nom, titre, faction et lieu.
     */
    const filteredNpcs = computed(() => {
      let result = npcStore.npcs
      if (search.value.trim()) {
        const q = search.value.trim().toLowerCase()
        result = result.filter(n =>
          n.name.toLowerCase().includes(q) ||
          (n.title || '').toLowerCase().includes(q) ||
          (n.faction || '').toLowerCase().includes(q) ||
          (n.location || '').toLowerCase().includes(q)
        )
      }
      return result
    })

    /**
     * Verifie si un PNJ est deja charge dans la session.
     * @param {string} id — Identifiant du PNJ
     * @returns {boolean}
     */
    function isLoaded(id) {
      return sessionStore.loadedNpcIds.includes(id)
    }

    /** Labels de statut en francais */
    const STATUS_LABELS = {
      ally: 'Allie',
      neutral: 'Neutre',
      hostile: 'Hostile',
      dead: 'Mort',
      missing: 'Disparu'
    }

    /**
     * Retourne le label francais d'un statut PNJ.
     * @param {string} status — Statut du PNJ
     * @returns {string}
     */
    function statusLabel(status) {
      return STATUS_LABELS[status] || status
    }

    return { sessionStore, npcStore, search, filteredNpcs, isLoaded, statusLabel }
  }
}
</script>

<style scoped>
.npc-loader__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
}

.npc-loader__loaded {
  margin-bottom: var(--space-sm);
}

.npc-loader__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.npc-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.npc-chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.npc-chip--ally .npc-chip__dot {
  background: var(--color-accent-success);
}

.npc-chip--neutral .npc-chip__dot {
  background: var(--color-text-muted);
}

.npc-chip--hostile .npc-chip__dot {
  background: var(--color-accent-danger);
}

.npc-chip--dead .npc-chip__dot {
  background: var(--color-text-muted);
  opacity: 0.4;
}

.npc-chip--missing .npc-chip__dot {
  background: var(--color-accent-warning);
}

.npc-chip__remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0 2px;
  font-size: 0.8em;
}

.npc-loader__clear {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.npc-loader__summary {
  cursor: pointer;
  color: var(--color-accent-hope);
  font-size: var(--font-size-sm);
  padding: var(--space-xs) 0;
}

.npc-loader__search {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: var(--space-sm) 0;
}

.npc-loader__empty-all {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-sm) 0;
}

.npc-loader__list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
}

.npc-loader__item {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.npc-loader__item:hover {
  background: var(--color-bg-elevated);
}

.npc-loader__item--selected {
  background: var(--color-bg-surface);
  color: var(--color-accent-hope);
}

.npc-loader__check {
  width: 1.2em;
  text-align: center;
}

.npc-loader__item-name {
  font-weight: var(--font-weight-medium);
}

.npc-loader__item-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.npc-loader__item-status {
  font-size: var(--font-size-xs);
  margin-left: auto;
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

.npc-loader__empty {
  padding: var(--space-md);
  color: var(--color-text-muted);
  text-align: center;
  font-size: var(--font-size-sm);
}
</style>
