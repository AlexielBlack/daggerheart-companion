<template>
  <div
    class="homebrew-list"
    role="region"
    :aria-label="`Liste ${label}`"
  >
    <!-- Toolbar: search + sort + actions -->
    <div
      class="homebrew-list__toolbar"
      role="search"
      :aria-label="`Filtrer ${label}`"
    >
      <div class="homebrew-list__search">
        <label
          :for="`${listId}-search`"
          class="sr-only"
        >
          Rechercher
        </label>
        <input
          :id="`${listId}-search`"
          type="search"
          class="homebrew-list__search-input"
          :placeholder="`Rechercher un ${labelSingular}…`"
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
        />
      </div>

      <div class="homebrew-list__controls">
        <!-- Sort -->
        <div class="homebrew-list__sort">
          <label
            :for="`${listId}-sort`"
            class="homebrew-list__control-label"
          >
            Tri
          </label>
          <select
            :id="`${listId}-sort`"
            class="homebrew-list__select"
            :value="sortField"
            @change="$emit('update:sortField', $event.target.value)"
          >
            <option
              v-for="opt in sortOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          <button
            class="btn btn--ghost btn--sm"
            :aria-label="`Tri ${sortDirection === 'asc' ? 'croissant' : 'décroissant'}`"
            @click="$emit('toggle-sort-direction')"
          >
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </button>
        </div>

        <!-- Slot for custom filters (tier chips, type chips, etc.) -->
        <slot name="filters"></slot>
      </div>

      <!-- Results count + global actions -->
      <div class="homebrew-list__status">
        <span
          class="homebrew-list__count"
          aria-live="polite"
        >
          {{ filteredCount }} {{ labelSingular }}{{ filteredCount !== 1 ? 's' : '' }}
          <span
            v-if="filteredCount !== totalCount"
            class="text-muted"
          >/ {{ totalCount }}</span>
        </span>

        <div class="homebrew-list__global-actions">
          <button
            type="button"
            class="btn btn--primary btn--sm"
            @click="$emit('create')"
          >
            + Nouveau
          </button>
          <slot name="toolbar-actions"></slot>
        </div>
      </div>
    </div>

    <!-- Grid / liste de cartes -->
    <div
      v-if="items.length > 0"
      class="homebrew-list__grid"
      role="list"
    >
      <slot
        name="item"
        :items="items"
      >
        <!-- Fallback : HomebrewCard par défaut -->
        <HomebrewCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :selected="selectedId === item.id"
          :show-actions="showItemActions"
          @select="$emit('select', $event)"
          @edit="$emit('edit', $event)"
          @duplicate="$emit('duplicate', $event)"
          @delete="$emit('delete', $event)"
        />
      </slot>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="homebrew-list__empty"
    >
      <p
        v-if="searchQuery || hasActiveFilters"
        class="homebrew-list__empty-text"
      >
        Aucun résultat pour cette recherche.
        <button
          type="button"
          class="homebrew-list__empty-link"
          @click="$emit('clear-filters')"
        >
          Réinitialiser les filtres
        </button>
      </p>
      <p
        v-else
        class="homebrew-list__empty-text"
      >
        Aucun {{ labelSingular }} créé.
        <button
          type="button"
          class="homebrew-list__empty-link"
          @click="$emit('create')"
        >
          Créer le premier
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import HomebrewCard from './HomebrewCard.vue'

/**
 * @component HomebrewList
 * @description Liste filtrable et triable d'items homebrew avec barre d'outils.
 * Utilise HomebrewCard par défaut, mais accepte un slot `item` pour un rendu personnalisé.
 */
export default {
  name: 'HomebrewList',

  components: {
    HomebrewCard
  },

  props: {
    /** Items à afficher (déjà filtrés/triés) */
    items: {
      type: Array,
      required: true
    },
    /** Label pluriel (ex: 'Adversaires') */
    label: {
      type: String,
      default: 'Éléments'
    },
    /** Label singulier (ex: 'adversaire') */
    labelSingular: {
      type: String,
      default: 'élément'
    },
    /** Requête de recherche */
    searchQuery: {
      type: String,
      default: ''
    },
    /** Champ de tri actif */
    sortField: {
      type: String,
      default: 'updatedAt'
    },
    /** Direction du tri */
    sortDirection: {
      type: String,
      default: 'desc'
    },
    /** Options de tri disponibles */
    sortOptions: {
      type: Array,
      default: () => [
        { value: 'name', label: 'Nom' },
        { value: 'updatedAt', label: 'Date de modification' },
        { value: 'createdAt', label: 'Date de création' }
      ]
    },
    /** ID de l'item sélectionné */
    selectedId: {
      type: String,
      default: null
    },
    /** Nombre filtré */
    filteredCount: {
      type: Number,
      default: 0
    },
    /** Nombre total */
    totalCount: {
      type: Number,
      default: 0
    },
    /** Des filtres sont actifs */
    hasActiveFilters: {
      type: Boolean,
      default: false
    },
    /** Afficher les boutons d'action sur les cartes */
    showItemActions: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'update:searchQuery',
    'update:sortField',
    'toggle-sort-direction',
    'clear-filters',
    'create',
    'select',
    'edit',
    'duplicate',
    'delete'
  ],

  computed: {
    listId() {
      return `hb-list-${this.label.toLowerCase().replace(/\s+/g, '-')}`
    }
  }
}
</script>

<style scoped>
.homebrew-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Toolbar */
.homebrew-list__toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.homebrew-list__search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: border-color var(--transition-fast);
}

.homebrew-list__search-input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
}

.homebrew-list__search-input::placeholder {
  color: var(--color-text-muted);
}

.homebrew-list__controls {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  align-items: flex-end;
}

.homebrew-list__sort {
  display: flex;
  align-items: flex-end;
  gap: var(--space-xs);
}

.homebrew-list__control-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.homebrew-list__select {
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
}

.homebrew-list__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.homebrew-list__count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.homebrew-list__global-actions {
  display: flex;
  gap: var(--space-sm);
}

/* Grid */
.homebrew-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

/* Empty state */
.homebrew-list__empty {
  text-align: center;
  padding: var(--space-2xl) var(--space-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.homebrew-list__empty-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.homebrew-list__empty-link {
  color: var(--color-accent-hope);
  font-size: var(--font-size-sm);
  text-decoration: underline;
  transition: color var(--transition-fast);
}

.homebrew-list__empty-link:hover {
  color: var(--color-accent-gold);
}

/* Accessibility */
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
