<template>
  <ModuleBoundary
    module-name="Environnements homebrew"
    module-id="homebrew-environment-list"
  >
    <div class="hb-env-list">
      <HomebrewList
        back-route="/homebrew"
        :items="store.filteredItems"
        label="Environnements custom"
        label-singular="environnement"
        :search-query="store.searchQuery"
        :sort-field="store.sortField"
        :sort-direction="store.sortDirection"
        :sort-options="sortOptions"
        :selected-id="selectedId"
        :filtered-count="store.filteredItems.length"
        :total-count="store.items.length"
        :has-active-filters="hasActiveFilters"
        @update:search-query="store.searchQuery = $event"
        @update:sort-field="store.sortField = $event"
        @toggle-sort-direction="toggleSortDirection"
        @clear-filters="clearFilters"
        @create="goCreate"
        @select="onSelect"
        @edit="goEdit"
        @duplicate="onDuplicate"
        @delete="onDelete"
      >
        <!-- Filtres : Tier + Type -->
        <template #filters>
          <fieldset class="hb-env-list__filter-group">
            <legend class="hb-env-list__filter-legend">
              Tier
            </legend>
            <div class="hb-env-list__chips">
              <button
                v-for="tier in [1, 2, 3, 4]"
                :key="tier"
                class="hb-env-list__chip"
                :class="{
                  'hb-env-list__chip--active': store.filterCriteria.tier?.includes(tier),
                  [`hb-env-list__chip--tier${tier}`]: store.filterCriteria.tier?.includes(tier)
                }"
                :aria-pressed="store.filterCriteria.tier?.includes(tier) || false"
                @click="toggleTierFilter(tier)"
              >
                T{{ tier }}
              </button>
            </div>
          </fieldset>

          <fieldset class="hb-env-list__filter-group">
            <legend class="hb-env-list__filter-legend">
              Type
            </legend>
            <div class="hb-env-list__chips">
              <button
                v-for="type in environmentTypes"
                :key="type"
                class="hb-env-list__chip"
                :class="{ 'hb-env-list__chip--active': store.filterCriteria.type?.includes(type) }"
                :aria-pressed="store.filterCriteria.type?.includes(type) || false"
                @click="toggleTypeFilter(type)"
              >
                {{ typeIcon(type) }} {{ type }}
              </button>
            </div>
          </fieldset>
        </template>

        <template #toolbar-actions>
          <!-- Intentionnellement vide -->
        </template>
      </HomebrewList>

      <!-- Import / Export -->
      <ImportExportPanel
        ref="importExportRef"
        label="Environnements"
        :item-count="store.items.length"
        category-key="environment"
        :show-clear-all="true"
        @export="onExport"
        @import="onImport"
        @clear-all="onClearAll"
      />

      <!-- Aperçu rapide -->
      <aside
        v-if="selectedItem"
        class="hb-env-list__detail"
        aria-label="Aperçu de l'environnement sélectionné"
      >
        <div class="hb-env-list__detail-header">
          <h3 class="hb-env-list__detail-title">
            Aperçu
          </h3>
          <button
            class="btn btn--ghost btn--sm"
            aria-label="Fermer l'aperçu"
            @click="selectedId = null"
          >
            ✕
          </button>
        </div>
        <EnvironmentPreview :data="selectedItem" />
      </aside>

      <!-- Confirmation suppression -->
      <div
        v-if="deleteTarget"
        class="hb-env-list__delete-confirm"
        role="alertdialog"
        :aria-label="`Confirmer la suppression de ${deleteTarget.name}`"
      >
        <p class="hb-env-list__delete-text">
          Supprimer <strong>{{ deleteTarget.name }}</strong> définitivement ?
        </p>
        <div class="hb-env-list__delete-actions">
          <button
            class="btn btn--danger btn--sm"
            @click="confirmDelete"
          >
            Supprimer
          </button>
          <button
            class="btn btn--ghost btn--sm"
            @click="deleteTarget = null"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  </ModuleBoundary>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import HomebrewList from '../core/components/HomebrewList.vue'
import ImportExportPanel from '../core/components/ImportExportPanel.vue'
import EnvironmentPreview from '../categories/environment/EnvironmentPreview.vue'
import { useEnvironmentHomebrewStore } from '../categories/environment/useEnvironmentHomebrewStore.js'
import { ENVIRONMENT_TYPES } from '../schemas/environmentSchema.js'

const TYPE_ICONS = {
  Exploration: '🔍',
  Social: '🗣️',
  Traversal: '🥾',
  Event: '⚡'
}

/**
 * @component HomebrewEnvironmentList
 * @description Vue de navigation / gestion des environnements homebrew.
 * Filtres par tier et type, recherche, tri, import/export.
 */
export default {
  name: 'HomebrewEnvironmentList',

  components: {
    ModuleBoundary,
    HomebrewList,
    ImportExportPanel,
    EnvironmentPreview
  },

  setup() {
    const router = useRouter()
    const store = useEnvironmentHomebrewStore()

    const selectedId = ref(null)
    const deleteTarget = ref(null)
    const importExportRef = ref(null)

    const environmentTypes = ENVIRONMENT_TYPES

    const sortOptions = [
      { value: 'name', label: 'Nom' },
      { value: 'tier', label: 'Tier' },
      { value: 'updatedAt', label: 'Dernière modification' }
    ]

    const selectedItem = computed(() => {
      if (!selectedId.value) return null
      return store.getById(selectedId.value)
    })

    const hasActiveFilters = computed(() => {
      return store.searchQuery.trim().length > 0 ||
        (store.filterCriteria.tier?.length > 0) ||
        (store.filterCriteria.type?.length > 0)
    })

    function typeIcon(type) {
      return TYPE_ICONS[type] || '📍'
    }

    function toggleTierFilter(tier) {
      const current = store.filterCriteria.tier || []
      const idx = current.indexOf(tier)
      if (idx === -1) {
        store.filterCriteria = { ...store.filterCriteria, tier: [...current, tier] }
      } else {
        store.filterCriteria = { ...store.filterCriteria, tier: current.filter((t) => t !== tier) }
      }
    }

    function toggleTypeFilter(type) {
      const current = store.filterCriteria.type || []
      const idx = current.indexOf(type)
      if (idx === -1) {
        store.filterCriteria = { ...store.filterCriteria, type: [...current, type] }
      } else {
        store.filterCriteria = { ...store.filterCriteria, type: current.filter((t) => t !== type) }
      }
    }

    function toggleSortDirection() {
      store.sortDirection = store.sortDirection === 'asc' ? 'desc' : 'asc'
    }

    function clearFilters() {
      store.searchQuery = ''
      store.filterCriteria = {}
    }

    function goCreate() {
      router.push('/homebrew/environment/new')
    }

    function goEdit(id) {
      router.push(`/homebrew/environment/${id}`)
    }

    function onSelect(id) {
      selectedId.value = selectedId.value === id ? null : id
    }

    function onDuplicate(id) {
      store.duplicate(id)
    }

    function onDelete(id) {
      deleteTarget.value = store.getById(id)
    }

    function confirmDelete() {
      if (deleteTarget.value) {
        store.remove(deleteTarget.value.id)
        if (selectedId.value === deleteTarget.value.id) {
          selectedId.value = null
        }
        deleteTarget.value = null
      }
    }

    function onExport() {
      const json = store.exportItems()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dh-homebrew-environments-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    function onImport(jsonString) {
      const result = store.importItems(jsonString)
      if (importExportRef.value) {
        importExportRef.value.showImportResult(result)
      }
    }

    function onClearAll() {
      store.clearAll()
      selectedId.value = null
    }

    return {
      store,
      selectedId,
      selectedItem,
      deleteTarget,
      importExportRef,
      sortOptions,
      environmentTypes,
      hasActiveFilters,
      typeIcon,
      toggleTierFilter,
      toggleTypeFilter,
      toggleSortDirection,
      clearFilters,
      goCreate,
      goEdit,
      onSelect,
      onDuplicate,
      onDelete,
      confirmDelete,
      onExport,
      onImport,
      onClearAll
    }
  }
}
</script>

<style scoped>
.hb-env-list {
  padding: var(--space-md);
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.hb-env-list__filter-group {
  border: none;
  padding: 0;
  margin: 0;
}

.hb-env-list__filter-legend {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-xs);
}

.hb-env-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.hb-env-list__chip {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hb-env-list__chip:hover {
  border-color: var(--color-accent-hope);
  color: var(--color-text-primary);
}

.hb-env-list__chip--active {
  background: var(--color-accent-hope);
  color: var(--color-bg-primary);
  border-color: var(--color-accent-hope);
  font-weight: var(--font-weight-bold);
}

.hb-env-list__chip--tier1.hb-env-list__chip--active { background: var(--color-tier1, #4ade80); border-color: var(--color-tier1, #4ade80); }
.hb-env-list__chip--tier2.hb-env-list__chip--active { background: var(--color-tier2, #60a5fa); border-color: var(--color-tier2, #60a5fa); }
.hb-env-list__chip--tier3.hb-env-list__chip--active { background: var(--color-tier3, #c084fc); border-color: var(--color-tier3, #c084fc); }
.hb-env-list__chip--tier4.hb-env-list__chip--active { background: var(--color-tier4, #f97316); border-color: var(--color-tier4, #f97316); }

.hb-env-list__detail {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.hb-env-list__detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.hb-env-list__detail-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.hb-env-list__delete-confirm {
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-danger);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  text-align: center;
}

.hb-env-list__delete-text {
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.hb-env-list__delete-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
}
</style>
