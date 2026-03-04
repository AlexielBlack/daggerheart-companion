<template>
  <ModuleBoundary
    module-name="Environnements"
    module-id="environments"
  >
    <div class="env-browser">
      <!-- Filters -->
      <EnvironmentFilters
        :search-query="store.searchQuery"
        :selected-tiers="store.selectedTiers"
        :selected-types="store.selectedTypes"
        :sort-field="store.sortField"
        :sort-direction="store.sortDirection"
        :has-active-filters="store.hasActiveFilters"
        :filtered-count="store.filteredCount"
        :total-count="store.totalCount"
        :tiers="store.availableTiers"
        :types="store.availableTypes"
        @update:search-query="store.setSearch"
        @update:sort-field="store.setSort"
        @toggle-tier="store.toggleTier"
        @toggle-type="store.toggleType"
        @toggle-sort-direction="toggleDirection"
        @clear-filters="store.clearFilters"
      />

      <!-- Content area: list + detail -->
      <div class="env-browser__content">
        <!-- List panel -->
        <div
          class="env-browser__list"
          :class="{ 'env-browser__list--collapsed': showDetail }"
          role="list"
          aria-label="Liste des environnements"
        >
          <p
            v-if="store.filteredCount === 0"
            class="env-browser__empty"
            role="status"
          >
            Aucun environnement trouvé avec ces filtres.
          </p>

          <EnvironmentCard
            v-for="environment in store.filteredEnvironments"
            :key="environment.id"
            :environment="environment"
            :selected="store.selectedEnvironmentId === environment.id"
            @select="handleSelect"
          />
        </div>

        <!-- Detail panel -->
        <aside
          v-if="showDetail"
          class="env-browser__detail"
          aria-label="Détail de l'environnement"
        >
          <EnvironmentStatBlock
            :environment="store.selectedEnvironment"
            :closable="true"
            @close="store.clearSelection"
          />
          <button
            class="btn btn--secondary btn--sm env-browser__duplicate-btn"
            @click="duplicateToHomebrew(store.selectedEnvironment)"
          >
            ✎ Dupliquer en homebrew
          </button>
        </aside>

        <!-- Placeholder when no detail -->
        <aside
          v-else
          class="env-browser__detail env-browser__detail--empty"
          aria-hidden="true"
        >
          <div class="env-browser__detail-placeholder">
            <p>🌍</p>
            <p>Sélectionnez un environnement pour voir sa fiche complète</p>
          </div>
        </aside>
      </div>
    </div>
  </ModuleBoundary>
</template>

<script>
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import EnvironmentFilters from '../components/EnvironmentFilters.vue'
import EnvironmentCard from '../components/EnvironmentCard.vue'
import EnvironmentStatBlock from '../components/EnvironmentStatBlock.vue'
import { useEnvironmentStore } from '../stores/environmentStore.js'
import { useEnvironmentHomebrewStore } from '@modules/homebrew/categories/environment/useEnvironmentHomebrewStore.js'

/**
 * @component EnvironmentBrowser
 * @description Vue principale de la bibliothèque d'environnements.
 * Layout split : liste filtrable à gauche, fiche détaillée à droite.
 */
export default {
  name: 'EnvironmentBrowser',
  components: {
    ModuleBoundary,
    EnvironmentFilters,
    EnvironmentCard,
    EnvironmentStatBlock
  },
  setup() {
    const store = useEnvironmentStore()
    return { store }
  },
  computed: {
    showDetail() {
      return !!this.store.selectedEnvironment
    }
  },
  methods: {
    handleSelect(id) {
      if (this.store.selectedEnvironmentId === id) {
        this.store.clearSelection()
      } else {
        this.store.selectEnvironment(id)
      }
    },
    toggleDirection() {
      this.store.setSort(this.store.sortField)
    },
    duplicateToHomebrew(item) {
      const homebrewStore = useEnvironmentHomebrewStore()
      const result = homebrewStore.createFromTemplate(item)
      if (result.success) {
        this.$router.push(`/homebrew/environment/${result.id}`)
      }
    }
  }
}
</script>

<style scoped>
.env-browser {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.env-browser__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  align-items: start;
}

.env-browser__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: var(--space-sm);
}

/* Scrollbar styling */
.env-browser__list::-webkit-scrollbar { width: 6px; }
.env-browser__list::-webkit-scrollbar-track { background: transparent; }
.env-browser__list::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-full);
}

.env-browser__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-2xl) var(--space-md);
}

.env-browser__detail {
  position: sticky;
  top: var(--space-md);
}

.env-browser__detail--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.env-browser__detail-placeholder {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.env-browser__detail-placeholder p:first-child {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-sm);
}

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .env-browser__content {
    grid-template-columns: 1fr;
  }

  .env-browser__list--collapsed {
    display: none;
  }

  .env-browser__list {
    max-height: none;
  }

  .env-browser__detail {
    position: static;
  }
}

.env-browser__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}
</style>
