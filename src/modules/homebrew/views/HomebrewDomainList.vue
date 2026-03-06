<template>
  <ModuleBoundary
    module-name="Domaines homebrew"
    module-id="homebrew-domain-list"
  >
    <div class="hb-dom-list">
      <HomebrewList
        back-route="/homebrew"
        :items="store.filteredItems"
        label="Domaines custom"
        label-singular="domaine"
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
      />

      <ImportExportPanel
        ref="importExportRef"
        label="Domaines"
        :item-count="store.items.length"
        category-key="domain"
        :show-clear-all="true"
        @export="onExport"
        @import="onImport"
        @clear-all="onClearAll"
      />

      <aside
        v-if="selectedItem"
        class="hb-dom-list__detail"
        aria-label="Aperçu du domaine sélectionné"
      >
        <div class="hb-dom-list__detail-header">
          <h3 class="hb-dom-list__detail-title">
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
        <DomainPreview :data="selectedItem" />
      </aside>

      <div
        v-if="deleteTarget"
        class="hb-dom-list__delete-confirm"
        role="alertdialog"
        :aria-label="`Confirmer la suppression de ${deleteTarget.name}`"
      >
        <p class="hb-dom-list__delete-text">
          Supprimer <strong>{{ deleteTarget.name }}</strong> définitivement ?
        </p>
        <div class="hb-dom-list__delete-actions">
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
import DomainPreview from '../categories/domain/DomainPreview.vue'
import { useDomainHomebrewStore } from '../categories/domain/useDomainHomebrewStore.js'

export default {
  name: 'HomebrewDomainList',
  components: { ModuleBoundary, HomebrewList, ImportExportPanel, DomainPreview },

  setup() {
    const router = useRouter()
    const store = useDomainHomebrewStore()

    const selectedId = ref(null)
    const deleteTarget = ref(null)
    const importExportRef = ref(null)

    const sortOptions = [
      { value: 'name', label: 'Nom' },
      { value: 'updatedAt', label: 'Dernière modification' }
    ]

    const selectedItem = computed(() => {
      if (!selectedId.value) return null
      return store.getById(selectedId.value)
    })

    const hasActiveFilters = computed(() => {
      return store.searchQuery.trim().length > 0
    })

    function toggleSortDirection() {
      store.sortDirection = store.sortDirection === 'asc' ? 'desc' : 'asc'
    }

    function clearFilters() {
      store.searchQuery = ''
      store.filterCriteria = {}
    }

    function goCreate() {
      router.push('/homebrew/domain/new')
    }

    function goEdit(id) {
      router.push(`/homebrew/domain/${id}`)
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
      a.download = `dh-homebrew-domains-${Date.now()}.json`
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
      store, selectedId, selectedItem, deleteTarget, importExportRef,
      sortOptions, hasActiveFilters,
      toggleSortDirection, clearFilters,
      goCreate, goEdit, onSelect, onDuplicate, onDelete, confirmDelete,
      onExport, onImport, onClearAll
    }
  }
}
</script>

<style scoped>
.hb-dom-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
}

.hb-dom-list__detail {
  margin-top: var(--space-md);
}

.hb-dom-list__detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.hb-dom-list__detail-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.hb-dom-list__delete-confirm {
  position: fixed;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-accent-danger);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.hb-dom-list__delete-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
}

.hb-dom-list__delete-actions {
  display: flex;
  gap: var(--space-sm);
}
</style>
