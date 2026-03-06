<template>
  <ModuleBoundary
    module-name="Domaines homebrew"
    module-id="homebrew-domain-list"
  >
    <div class="hb-dom-list">
      <HomebrewList
        back-route="/edition/homebrew"
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
import DomainPreview from '../categories/domain/DomainPreview.vue'
import { useDomainHomebrewStore } from '../categories/domain/useDomainHomebrewStore.js'

export default {
  name: 'HomebrewDomainList',
  components: { ModuleBoundary, HomebrewList, ImportExportPanel, DomainPreview },

  setup() {
    const router = useRouter()
    const store = useDomainHomebrewStore()

    const selectedId = ref(null)
    const { confirm } = useConfirmDialog()
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
      router.push('/edition/homebrew/domain/new')
    }

    function goEdit(id) {
      router.push(`/edition/homebrew/domain/${id}`)
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
      store, selectedId, selectedItem, importExportRef,
      sortOptions, hasActiveFilters,
      toggleSortDirection, clearFilters,
      goCreate, goEdit, onSelect, onDuplicate, onDelete,
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



</style>
