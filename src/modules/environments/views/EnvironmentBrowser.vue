<template>
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

    <!-- Filtre par source + bouton creation -->
    <div class="env-browser__toolbar">
      <SourceFilter v-model="store.sourceFilter" />
      <router-link
        to="/compendium/environnements/new"
        class="btn btn--secondary btn--sm env-browser__create-btn"
        aria-label="Créer un environnement custom"
      >
        + Créer un custom
      </router-link>
    </div>

    <!-- Content area: list + detail -->
    <div class="env-browser__content">
      <!-- List panel -->
      <div
        class="env-browser__list"
        :class="{
          'env-browser__list--collapsed': showDetail,
          'env-browser__list--grid': compendiumColumns > 0
        }"
        :style="listGridStyle"
        role="list"
        aria-label="Liste des environnements"
      >
        <div
          v-if="store.filteredCount === 0"
          class="env-browser__empty"
          role="status"
        >
          <p aria-hidden="true">&#127757;</p>
          <p>Aucun environnement trouvé avec ces filtres.</p>
          <button
            v-if="store.hasActiveFilters"
            class="btn btn--secondary btn--sm"
            @click="store.clearFilters"
          >
            Effacer les filtres
          </button>
        </div>

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
        v-if="showDetail || editingInline"
        class="env-browser__detail"
        aria-label="Détail de l'environnement"
      >
        <!-- Mode lecture -->
        <template v-if="!editingInline">
          <EnvironmentStatBlock
            :environment="store.selectedEnvironment"
            :closable="true"
            @close="store.clearSelection"
          />
          <button
            v-if="store.selectedEnvironment?.source === 'custom'"
            class="btn btn--secondary btn--sm env-browser__edit-btn"
            aria-label="Modifier cet environnement custom"
            @click="startEdit"
          >
            Modifier
          </button>
          <button
            class="btn btn--secondary btn--sm env-browser__duplicate-btn"
            @click="duplicateToHomebrew(store.selectedEnvironment)"
          >
            Dupliquer en homebrew
          </button>
        </template>

        <!-- Mode edition inline -->
        <template v-else>
          <div
            ref="editPanel"
            class="env-browser__edit-panel"
          >
            <h3>{{ creatingNew ? 'Nouvel environnement custom' : 'Modifier' }}</h3>
            <HomebrewForm
              :schema="environmentSchema"
              :form-data="formData"
              :is-dirty="isDirty"
              :is-edit-mode="!creatingNew"
              :errors="[]"
              @submit="onSaveInline"
              @cancel="onCancelEdit"
              @update:field="onFieldUpdate"
            />
          </div>
        </template>
      </aside>

      <!-- Placeholder when no detail -->
      <aside
        v-else
        class="env-browser__detail env-browser__detail--empty"
        aria-hidden="true"
      >
        <div class="env-browser__detail-placeholder">
          <p>&#127757;</p>
          <p>Sélectionnez un environnement pour voir sa fiche complète</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { ref, inject, computed, nextTick } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import EnvironmentFilters from '../components/EnvironmentFilters.vue'
import EnvironmentCard from '../components/EnvironmentCard.vue'
import EnvironmentStatBlock from '../components/EnvironmentStatBlock.vue'
import SourceFilter from '@core/components/SourceFilter.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { environmentSchema } from '@modules/homebrew/schemas/environmentSchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'
import { useEnvironmentStore } from '../stores/environmentStore.js'
import { useEnvironmentHomebrewStore } from '@modules/homebrew/categories/environment/useEnvironmentHomebrewStore.js'
import { useNotification } from '@core/composables/useNotification.js'

/**
 * @component EnvironmentBrowser
 * @description Vue principale de la bibliothèque d'environnements.
 * Layout split : liste filtrable à gauche, fiche détaillée à droite.
 * Supporte le deep-linking, le filtrage par source, et l'édition inline.
 */
export default {
  name: 'EnvironmentBrowser',
  components: {
    EnvironmentFilters,
    EnvironmentCard,
    EnvironmentStatBlock,
    SourceFilter,
    HomebrewForm
  },
  setup() {
    const store = useEnvironmentStore()
    const homebrewStore = useEnvironmentHomebrewStore()
    const { success: notifySuccess } = useNotification()
    const route = useRoute()
    const compendiumColumns = inject('compendiumColumns', ref(0))
    const listGridStyle = computed(() => {
      if (!compendiumColumns.value || compendiumColumns.value === 0) return {}
      return { 'grid-template-columns': `repeat(${compendiumColumns.value}, 1fr)` }
    })

    // --- Refs pour l'édition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editPanel = ref(null)

    function scrollToEditPanel() {
      nextTick(() => {
        editPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    // --- Composable formulaire ---
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(environmentSchema)

    // --- Deep-linking : sélection depuis la route ---
    function selectFromRoute(id) {
      if (!id) return
      if (id === 'new') {
        editingInline.value = true
        creatingNew.value = true
        reset()
        scrollToEditPanel()
        return
      }
      store.selectEnvironment(id)
    }

    // Sélection initiale au montage
    selectFromRoute(route.params.id)

    // Mise à jour lors de la navigation intra-route
    onBeforeRouteUpdate((to) => selectFromRoute(to.params.id))

    return {
      store,
      homebrewStore,
      editingInline,
      creatingNew,
      formData,
      isDirty,
      hydrate,
      setField,
      toRawData,
      reset,
      environmentSchema,
      editPanel,
      scrollToEditPanel,
      compendiumColumns,
      listGridStyle,
      notifySuccess
    }
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
      const result = this.homebrewStore.createFromTemplate(item)
      if (result.success) {
        this.notifySuccess(`\u00ab ${item.name} \u00bb dupliqu\u00e9 en homebrew`)
        this.$router.push(`/compendium/environnements/${result.id}`)
      }
    },

    // --- Edition inline ---
    startEdit() {
      if (this.store.selectedEnvironment) {
        this.hydrate(this.store.selectedEnvironment)
        this.editingInline = true
        this.creatingNew = false
        this.scrollToEditPanel()
      }
    },
    onFieldUpdate({ field, value }) {
      this.setField(field, value)
    },
    onSaveInline() {
      const data = this.toRawData()
      if (this.creatingNew) {
        const result = this.homebrewStore.create(data)
        if (result.success) {
          this.store.selectEnvironment(result.id)
        }
        this.creatingNew = false
      } else {
        this.homebrewStore.update(this.store.selectedEnvironment.id, data)
      }
      this.editingInline = false
    },
    onCancelEdit() {
      this.editingInline = false
      this.creatingNew = false
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
}

.env-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.env-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-medium);
}

.env-browser__content {
  display: grid;
  grid-template-columns: 3fr 2fr;
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

.env-browser__empty p:first-child {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-sm);
}

.env-browser__detail {
  position: sticky;
  top: 0;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.env-browser__detail::-webkit-scrollbar {
  width: 6px;
}

.env-browser__detail::-webkit-scrollbar-track {
  background: transparent;
}

.env-browser__detail::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-full);
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

.env-browser__edit-btn {
  margin-top: var(--space-sm);
  width: 100%;
}

.env-browser__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}

.env-browser__edit-panel {
  padding: var(--space-md);
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
  border-radius: var(--radius-md, 8px);
}

.env-browser__edit-panel h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-family-heading);
}

.env-browser__list--grid {
  display: grid;
  gap: var(--space-sm);
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
</style>
