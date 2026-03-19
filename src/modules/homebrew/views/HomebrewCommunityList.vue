<template>
  <ModuleBoundary
    module-name="Communautés homebrew"
    module-id="homebrew-community-list"
  >
    <div class="hb-com-list">
      <HomebrewList
        back-route="/compendium"
        :items="store.filteredItems"
        label="Communautés custom"
        label-singular="communauté"
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
        <template #filters>
          <!-- Pas de filtres spécifiques pour les communautés -->
        </template>
        <template #toolbar-actions>
          <!-- Intentionnellement vide -->
        </template>
      </HomebrewList>

      <!-- Import / Export -->
      <ImportExportPanel
        ref="importExportRef"
        label="Communautés"
        :item-count="store.items.length"
        category-key="community"
        :show-clear-all="true"
        @export="onExport"
        @import="onImport"
        @clear-all="onClearAll"
      />

      <!-- Aperçu rapide -->
      <aside
        v-if="selectedItem"
        class="hb-com-list__detail"
        aria-label="Aperçu de la communauté sélectionnée"
      >
        <div class="hb-com-list__detail-header">
          <h3 class="hb-com-list__detail-title">
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
        <CommunityPreview :data="selectedItem" />
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
import CommunityPreview from '../categories/community/CommunityPreview.vue'
import { useCommunityHomebrewStore } from '../categories/community/useCommunityHomebrewStore.js'

/**
 * @component HomebrewCommunityList
 * @description Vue de navigation / gestion des communautés homebrew.
 */
export default {
  name: 'HomebrewCommunityList',

  components: {
    ModuleBoundary,
    HomebrewList,
    ImportExportPanel,
    CommunityPreview
  },

  setup() {
    const router = useRouter()
    const store = useCommunityHomebrewStore()

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
    }

    function goCreate() {
      router.push('/compendium/communautes/new')
    }

    function goEdit(id) {
      router.push(`/compendium/communautes/${id}`)
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
      a.download = `dh-homebrew-communities-${Date.now()}.json`
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
      sortOptions,
      hasActiveFilters,
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
.hb-com-list {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.hb-com-list__detail {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.hb-com-list__detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.hb-com-list__detail-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}



</style>
