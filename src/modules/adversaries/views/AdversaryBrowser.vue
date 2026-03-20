<template>
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

      <!-- Filtre par source + bouton creation -->
      <div class="adversary-browser__toolbar">
        <SourceFilter v-model="store.sourceFilter" />
        <router-link
          to="/compendium/adversaires/new"
          class="btn btn--secondary btn--sm adversary-browser__create-btn"
          aria-label="Créer un adversaire custom"
        >
          + Créer un custom
        </router-link>
      </div>

      <!-- Content area: list + detail -->
      <div class="adversary-browser__content">
        <!-- List panel -->
        <div
          class="adversary-browser__list"
          :class="{
            'adversary-browser__list--collapsed': showDetail,
            'adversary-browser__list--grid': compendiumColumns > 0
          }"
          :style="listGridStyle"
          role="list"
          aria-label="Liste des adversaires"
        >
          <div
            v-if="store.filteredCount === 0"
            class="adversary-browser__empty"
            role="status"
          >
            <p aria-hidden="true">&#x2694;&#xFE0F;</p>
            <p>Aucun adversaire trouvé avec ces filtres.</p>
            <button
              v-if="store.hasActiveFilters"
              class="btn btn--secondary btn--sm"
              @click="store.clearFilters"
            >
              Effacer les filtres
            </button>
          </div>

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
          v-if="showDetail || editingInline"
          class="adversary-browser__detail"
          aria-label="Détail de l'adversaire"
        >
          <!-- Mode lecture -->
          <template v-if="!editingInline">
            <StatBlock
              :adversary="store.selectedAdversary"
              :closable="true"
              @close="store.clearSelection"
            />
            <button
              v-if="store.selectedAdversary?.source === 'custom'"
              class="btn btn--secondary btn--sm adversary-browser__edit-btn"
              aria-label="Modifier cet adversaire custom"
              @click="startEdit"
            >
              Modifier
            </button>
            <button
              class="btn btn--secondary btn--sm adversary-browser__duplicate-btn"
              @click="duplicateToHomebrew(store.selectedAdversary)"
            >
              Dupliquer en homebrew
            </button>
          </template>

          <!-- Mode edition inline -->
          <template v-else>
            <div
              ref="editPanel"
              class="adversary-browser__edit-panel"
            >
              <h3>{{ creatingNew ? 'Nouvel adversaire custom' : 'Modifier' }}</h3>
              <HomebrewForm
                :schema="adversarySchema"
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
          class="adversary-browser__detail adversary-browser__detail--empty"
          aria-hidden="true"
        >
          <div class="adversary-browser__detail-placeholder">
            <p>&#x2694;&#xFE0F;</p>
            <p>Sélectionnez un adversaire pour voir sa fiche complète</p>
          </div>
        </aside>
      </div>
  </div>
</template>

<script>
import { ref, inject, computed, nextTick } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import AdversaryFilters from '../components/AdversaryFilters.vue'
import AdversaryCard from '../components/AdversaryCard.vue'
import StatBlock from '../components/StatBlock.vue'
import SourceFilter from '@core/components/SourceFilter.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { adversarySchema } from '@modules/homebrew/schemas/adversarySchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'
import { useAdversaryStore } from '../stores/adversaryStore.js'
import { useAdversaryHomebrewStore } from '@modules/homebrew/categories/adversary/useAdversaryHomebrewStore.js'

/**
 * @component AdversaryBrowser
 * @description Vue principale de la bibliothèque d'adversaires.
 * Layout split : liste filtrable à gauche, fiche détaillée à droite.
 * Supporte le deep-linking, le filtrage par source, et l'édition inline.
 */
export default {
  name: 'AdversaryBrowser',
  components: {
    AdversaryFilters,
    AdversaryCard,
    StatBlock,
    SourceFilter,
    HomebrewForm
  },
  setup() {
    const store = useAdversaryStore()
    const homebrewStore = useAdversaryHomebrewStore()
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
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(adversarySchema)

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
      store.selectAdversary(id)
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
      adversarySchema,
      editPanel,
      scrollToEditPanel,
      compendiumColumns,
      listGridStyle
    }
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
      const result = this.homebrewStore.createFromTemplate(item)
      if (result.success) {
        this.$router.push(`/compendium/adversaires/${result.id}`)
      }
    },

    // --- Edition inline ---
    startEdit() {
      if (this.store.selectedAdversary) {
        this.hydrate(this.store.selectedAdversary)
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
          this.store.selectAdversary(result.id)
        }
        this.creatingNew = false
      } else {
        this.homebrewStore.update(this.store.selectedAdversary.id, data)
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
.adversary-browser {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
}

.adversary-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.adversary-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
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

.adversary-browser__empty p:first-child {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-sm);
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

.adversary-browser__edit-btn {
  margin-top: var(--space-sm);
  width: 100%;
}

.adversary-browser__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}

.adversary-browser__edit-panel {
  padding: var(--space-md);
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
  border-radius: var(--radius-md, 8px);
}

.adversary-browser__edit-panel h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-family-heading);
}

.adversary-browser__list--grid {
  display: grid;
  gap: var(--space-sm);
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
</style>
