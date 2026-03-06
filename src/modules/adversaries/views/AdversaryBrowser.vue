<template>
  <ModuleBoundary
    module-name="Adversaires"
    module-id="adversaries"
  >
    <div class="adversary-browser">
      <!-- Filters -->
      <AdversaryFilters
        :search-query="store.searchQuery"
        :selected-tiers="store.selectedTiers"
        :selected-types="store.selectedTypes"
        :selected-genres="store.selectedGenres"
        :sort-field="store.sortField"
        :sort-direction="store.sortDirection"
        :has-active-filters="store.hasActiveFilters"
        :filtered-count="store.filteredCount"
        :total-count="store.totalCount"
        :tiers="store.availableTiers"
        :types="store.availableTypes"
        :genres="store.availableGenres"
        @update:search-query="store.setSearch"
        @update:sort-field="store.setSort"
        @toggle-tier="store.toggleTier"
        @toggle-type="store.toggleType"
        @toggle-genre="store.toggleGenre"
        @toggle-sort-direction="toggleDirection"
        @clear-filters="store.clearFilters"
      />

      <!-- Content area: list + detail -->
      <div class="adversary-browser__content">
        <!-- List panel -->
        <div
          class="adversary-browser__list"
          :class="{ 'adversary-browser__list--collapsed': showDetail }"
          role="list"
          aria-label="Liste des adversaires"
        >
          <p
            v-if="store.filteredCount === 0"
            class="adversary-browser__empty"
            role="status"
          >
            Aucun adversaire trouvé avec ces filtres.
          </p>

          <AdversaryCard
            v-for="adversary in store.filteredAdversaries"
            :key="adversary.id"
            :adversary="adversary"
            :selected="store.selectedAdversaryId === adversary.id"
            @select="handleSelect"
          />
        </div>

        <!-- Detail panel -->
        <aside
          v-if="showDetail"
          class="adversary-browser__detail"
          aria-label="Détail de l'adversaire"
        >
          <StatBlock
            :adversary="store.selectedAdversary"
            :closable="true"
            @close="store.clearSelection"
          />
          <button
            class="btn btn--secondary btn--sm adversary-browser__duplicate-btn"
            @click="duplicateToHomebrew(store.selectedAdversary)"
          >
            ✎ Dupliquer en homebrew
          </button>
        </aside>

        <!-- Placeholder when no detail -->
        <aside
          v-else
          class="adversary-browser__detail adversary-browser__detail--empty"
          aria-hidden="true"
        >
          <div class="adversary-browser__detail-placeholder">
            <p>⚔️</p>
            <p>Sélectionnez un adversaire pour voir sa fiche complète</p>
          </div>
        </aside>
      </div>
    </div>
  </ModuleBoundary>
</template>

<script>
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import AdversaryFilters from '../components/AdversaryFilters.vue'
import AdversaryCard from '../components/AdversaryCard.vue'
import StatBlock from '../components/StatBlock.vue'
import { useAdversaryStore } from '../stores/adversaryStore.js'
import { useAdversaryHomebrewStore } from '@modules/homebrew/categories/adversary/useAdversaryHomebrewStore.js'

/**
 * @component AdversaryBrowser
 * @description Vue principale de la bibliothèque d'adversaires.
 * Layout split : liste filtrable à gauche, fiche détaillée à droite.
 */
export default {
  name: 'AdversaryBrowser',
  components: {
    ModuleBoundary,
    AdversaryFilters,
    AdversaryCard,
    StatBlock
  },
  setup() {
    const store = useAdversaryStore()
    return { store }
  },
  computed: {
    showDetail() {
      return !!this.store.selectedAdversary
    }
  },
  methods: {
    handleSelect(id) {
      if (this.store.selectedAdversaryId === id) {
        this.store.clearSelection()
      } else {
        this.store.selectAdversary(id)
      }
    },
    toggleDirection() {
      this.store.setSort(this.store.sortField)
    },
    duplicateToHomebrew(item) {
      const homebrewStore = useAdversaryHomebrewStore()
      const result = homebrewStore.createFromTemplate(item)
      if (result.success) {
        this.$router.push(`/edition/homebrew/adversary/${result.id}`)
      }
    }
  }
}
</script>

<style scoped>
.adversary-browser {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
}

.adversary-browser__content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-md);
  align-items: start;
}

.adversary-browser__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: var(--space-sm);
}

/* Scrollbar styling */
.adversary-browser__list::-webkit-scrollbar {
  width: 6px;
}

.adversary-browser__list::-webkit-scrollbar-track {
  background: transparent;
}

.adversary-browser__list::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-full);
}

.adversary-browser__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-2xl) var(--space-md);
}

.adversary-browser__detail {
  position: sticky;
  top: var(--space-md);
}

.adversary-browser__detail--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.adversary-browser__detail-placeholder {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.adversary-browser__detail-placeholder p:first-child {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-sm);
}

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .adversary-browser__content {
    grid-template-columns: 1fr;
  }

  .adversary-browser__list--collapsed {
    display: none;
  }

  .adversary-browser__list {
    max-height: none;
  }

  .adversary-browser__detail {
    position: static;
  }
}

.adversary-browser__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}
</style>
