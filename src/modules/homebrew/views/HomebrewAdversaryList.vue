<template>
  <ModuleBoundary
    module-name="Adversaires homebrew"
    module-id="homebrew-adversary-list"
  >
    <div class="hb-adv-list">
      <HomebrewList
        back-route="/edition/homebrew"
        :items="store.filteredItems"
        label="Adversaires custom"
        label-singular="adversaire"
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
        <!-- Filtres spécifiques : Tier chips -->
        <template #filters>
          <fieldset class="hb-adv-list__filter-group">
            <legend class="hb-adv-list__filter-legend">
              Tier
            </legend>
            <div class="hb-adv-list__chips">
              <button
                v-for="tier in [1, 2, 3, 4]"
                :key="tier"
                class="hb-adv-list__chip"
                :class="{
                  'hb-adv-list__chip--active': store.filterCriteria.tier?.includes(tier),
                  [`hb-adv-list__chip--tier${tier}`]: store.filterCriteria.tier?.includes(tier)
                }"
                :aria-pressed="store.filterCriteria.tier?.includes(tier) || false"
                @click="toggleTierFilter(tier)"
              >
                T{{ tier }}
              </button>
            </div>
          </fieldset>

          <fieldset class="hb-adv-list__filter-group">
            <legend class="hb-adv-list__filter-legend">
              Type
            </legend>
            <div class="hb-adv-list__chips">
              <button
                v-for="type in adversaryTypes"
                :key="type"
                class="hb-adv-list__chip"
                :class="{ 'hb-adv-list__chip--active': store.filterCriteria.type?.includes(type) }"
                :aria-pressed="store.filterCriteria.type?.includes(type) || false"
                @click="toggleTypeFilter(type)"
              >
                {{ type }}
              </button>
            </div>
          </fieldset>
        </template>

        <!-- Slot toolbar-actions pour import/export -->
        <template #toolbar-actions>
          <!-- Intentionnellement vide ici — l'import/export est en bas -->
        </template>
      </HomebrewList>

      <!-- Import / Export -->
      <ImportExportPanel
        ref="importExportRef"
        label="Adversaires"
        :item-count="store.items.length"
        category-key="adversary"
        :show-clear-all="true"
        @export="onExport"
        @import="onImport"
        @clear-all="onClearAll"
      />

      <!-- Panneau de détail en bas (optionnel : aperçu rapide) -->
      <aside
        v-if="selectedItem"
        class="hb-adv-list__detail"
        aria-label="Aperçu de l'adversaire sélectionné"
      >
        <div class="hb-adv-list__detail-header">
          <h3 class="hb-adv-list__detail-title">
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
        <AdversaryPreview :data="selectedItem" />
      </aside>
    </div>
  </ModuleBoundary>
</template>

<script>
import { ref, computed } from 'vue'
import { useConfirmDialog } from '@core/composables/useConfirmDialog.js'
import { useRouter } from 'vue-router'
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import HomebrewList from '../core/components/HomebrewList.vue'
import ImportExportPanel from '../core/components/ImportExportPanel.vue'
import AdversaryPreview from '../categories/adversary/AdversaryPreview.vue'
import { ADVERSARY_TYPES } from '../schemas/adversarySchema.js'
import { useAdversaryHomebrewStore } from '../categories/adversary/useAdversaryHomebrewStore.js'

/**
 * @component HomebrewAdversaryList
 * @description Vue de navigation / gestion des adversaires homebrew.
 * Utilise HomebrewList avec filtres Tier/Type spécifiques,
 * et ImportExportPanel pour l'import/export JSON.
 */
export default {
  name: 'HomebrewAdversaryList',

  components: {
    ModuleBoundary,
    HomebrewList,
    ImportExportPanel,
    AdversaryPreview
  },

  setup() {
    const router = useRouter()
    const store = useAdversaryHomebrewStore()

    const selectedId = ref(null)
    const { confirm } = useConfirmDialog()
    const importExportRef = ref(null)
    const adversaryTypes = ADVERSARY_TYPES

    const sortOptions = [
      { value: 'name', label: 'Nom' },
      { value: 'tier', label: 'Tier' },
      { value: 'difficulty', label: 'Difficulté' },
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

    function toggleTierFilter(tier) {
      const current = store.filterCriteria.tier || []
      const idx = current.indexOf(tier)
      if (idx === -1) {
        store.filterCriteria = {
          ...store.filterCriteria,
          tier: [...current, tier]
        }
      } else {
        store.filterCriteria = {
          ...store.filterCriteria,
          tier: current.filter((t) => t !== tier)
        }
      }
    }

    function toggleTypeFilter(type) {
      const current = store.filterCriteria.type || []
      const idx = current.indexOf(type)
      if (idx === -1) {
        store.filterCriteria = {
          ...store.filterCriteria,
          type: [...current, type]
        }
      } else {
        store.filterCriteria = {
          ...store.filterCriteria,
          type: current.filter((t) => t !== type)
        }
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
      router.push('/edition/homebrew/adversary/new')
    }

    function goEdit(id) {
      router.push(`/edition/homebrew/adversary/${id}`)
    }

    function onSelect(id) {
      selectedId.value = selectedId.value === id ? null : id
    }

    function onDuplicate(id) {
      store.duplicate(id)
    }

    async function onDelete(id) {
      const item = store.getById(id)
      if (!item) return
      const ok = await confirm({
        message: `Supprimer <strong>${item.name}</strong> définitivement ?`,
        confirmLabel: 'Supprimer'
      })
      if (ok) {
        store.remove(item.id)
        if (selectedId.value === item.id) selectedId.value = null
      }
    }

    function onExport() {
      const json = store.exportItems()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dh-homebrew-adversaries-${Date.now()}.json`
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
            importExportRef,
      adversaryTypes,
      sortOptions,
      hasActiveFilters,
      toggleTierFilter,
      toggleTypeFilter,
      toggleSortDirection,
      clearFilters,
      goCreate,
      goEdit,
      onSelect,
      onDuplicate,
      onDelete,
      onExport,
      onImport,
      onClearAll
    }
  }
}
</script>

<style scoped>
.hb-adv-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
}

/* Filter chips */
.hb-adv-list__filter-group {
  border: none;
  padding: 0;
  margin: 0;
}

.hb-adv-list__filter-legend {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xs);
}

.hb-adv-list__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.hb-adv-list__chip {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.hb-adv-list__chip:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.hb-adv-list__chip--active {
  background-color: var(--color-accent-hope);
  border-color: var(--color-accent-hope);
  color: var(--color-text-inverse);
}

.hb-adv-list__chip--tier1.hb-adv-list__chip--active { background-color: #2e7d32; border-color: #2e7d32; }
.hb-adv-list__chip--tier2.hb-adv-list__chip--active { background-color: #1565c0; border-color: #1565c0; }
.hb-adv-list__chip--tier3.hb-adv-list__chip--active { background-color: #6a1b9a; border-color: #6a1b9a; }
.hb-adv-list__chip--tier4.hb-adv-list__chip--active { background-color: #c62828; border-color: #c62828; }

/* Detail panel */
.hb-adv-list__detail {
  margin-top: var(--space-md);
}

.hb-adv-list__detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.hb-adv-list__detail-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

/* Delete confirmation */


</style>
