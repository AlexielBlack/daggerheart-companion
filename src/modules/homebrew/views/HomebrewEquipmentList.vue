<template>
  <ModuleBoundary
    module-name="Équipement homebrew"
    module-id="homebrew-equipment-list"
  >
    <div class="hb-eq-list">
      <HomebrewList
        back-route="/homebrew"
        :items="store.filteredItems"
        label="Équipement custom"
        label-singular="équipement"
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
          <fieldset class="hb-eq-list__filter-group">
            <legend class="hb-eq-list__filter-legend">
              Catégorie
            </legend>
            <div class="hb-eq-list__chips">
              <button
                v-for="cat in equipmentCategories"
                :key="cat.value"
                class="hb-eq-list__chip"
                :class="{ 'hb-eq-list__chip--active': store.filterCriteria.category?.includes(cat.value) }"
                :aria-pressed="store.filterCriteria.category?.includes(cat.value) || false"
                @click="toggleCategoryFilter(cat.value)"
              >
                {{ cat.icon }} {{ cat.label }}
              </button>
            </div>
          </fieldset>
        </template>
        <template #toolbar-actions>
          <!-- Intentionnellement vide -->
        </template>
      </HomebrewList>

      <ImportExportPanel
        ref="importExportRef"
        label="Équipement"
        :item-count="store.items.length"
        category-key="equipment"
        :show-clear-all="true"
        @export="onExport"
        @import="onImport"
        @clear-all="onClearAll"
      />

      <aside
        v-if="selectedItem"
        class="hb-eq-list__detail"
        aria-label="Aperçu de l'équipement sélectionné"
      >
        <div class="hb-eq-list__detail-header">
          <h3 class="hb-eq-list__detail-title">
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
        <EquipmentPreview :data="selectedItem" />
      </aside>

      <div
        v-if="deleteTarget"
        ref="deleteConfirmRef"
        class="hb-eq-list__delete-confirm"
        role="alertdialog"
        aria-modal="true"
        :aria-label="`Confirmer la suppression de ${deleteTarget.name}`"
      >
        <p class="hb-eq-list__delete-text">
          Supprimer <strong>{{ deleteTarget.name }}</strong> définitivement ?
        </p>
        <div class="hb-eq-list__delete-actions">
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
import { useFocusTrap } from '@core/composables/useFocusTrap.js'
import { useRouter } from 'vue-router'
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import HomebrewList from '../core/components/HomebrewList.vue'
import ImportExportPanel from '../core/components/ImportExportPanel.vue'
import EquipmentPreview from '../categories/equipment/EquipmentPreview.vue'
import { useEquipmentHomebrewStore } from '../categories/equipment/useEquipmentHomebrewStore.js'

const CATEGORY_DISPLAY = [
  { value: 'primaryWeapon', label: 'Arme 1re', icon: '⚔️' },
  { value: 'secondaryWeapon', label: 'Arme 2nd', icon: '🗡️' },
  { value: 'armor', label: 'Armure', icon: '🛡️' },
  { value: 'loot', label: 'Loot', icon: '💎' },
  { value: 'consumable', label: 'Conso.', icon: '🧪' }
]

export default {
  name: 'HomebrewEquipmentList',

  components: { ModuleBoundary, HomebrewList, ImportExportPanel, EquipmentPreview },

  setup() {
    const router = useRouter()
    const store = useEquipmentHomebrewStore()
    const selectedId = ref(null)
    const deleteTarget = ref(null)
    const deleteConfirmRef = ref(null)
    useFocusTrap(deleteConfirmRef, () => !!deleteTarget.value)
    const importExportRef = ref(null)
    const equipmentCategories = CATEGORY_DISPLAY

    const sortOptions = [
      { value: 'name', label: 'Nom' },
      { value: 'category', label: 'Catégorie' },
      { value: 'updatedAt', label: 'Dernière modification' }
    ]

    const selectedItem = computed(() => {
      if (!selectedId.value) return null
      return store.getById(selectedId.value)
    })

    const hasActiveFilters = computed(() =>
      store.searchQuery.trim().length > 0 || (store.filterCriteria.category?.length > 0)
    )

    function toggleCategoryFilter(cat) {
      const current = store.filterCriteria.category || []
      const idx = current.indexOf(cat)
      if (idx === -1) {
        store.filterCriteria = { ...store.filterCriteria, category: [...current, cat] }
      } else {
        store.filterCriteria = { ...store.filterCriteria, category: current.filter((c) => c !== cat) }
      }
    }

    function toggleSortDirection() {
      store.sortDirection = store.sortDirection === 'asc' ? 'desc' : 'asc'
    }

    function clearFilters() {
      store.searchQuery = ''
      store.filterCriteria = {}
    }

    function goCreate() { router.push('/homebrew/equipment/new') }
    function goEdit(id) { router.push(`/homebrew/equipment/${id}`) }
    function onSelect(id) { selectedId.value = selectedId.value === id ? null : id }
    function onDuplicate(id) { store.duplicate(id) }
    function onDelete(id) { deleteTarget.value = store.getById(id) }

    function confirmDelete() {
      if (deleteTarget.value) {
        store.remove(deleteTarget.value.id)
        if (selectedId.value === deleteTarget.value.id) selectedId.value = null
        deleteTarget.value = null
      }
    }

    function onExport() {
      const json = store.exportItems()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dh-homebrew-equipment-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    function onImport(jsonString) {
      const result = store.importItems(jsonString)
      if (importExportRef.value) importExportRef.value.showImportResult(result)
    }

    function onClearAll() { store.clearAll(); selectedId.value = null }

    return {
      store, selectedId, selectedItem, deleteTarget, deleteConfirmRef, importExportRef,
      sortOptions, equipmentCategories, hasActiveFilters,
      toggleCategoryFilter, toggleSortDirection, clearFilters,
      goCreate, goEdit, onSelect, onDuplicate, onDelete, confirmDelete,
      onExport, onImport, onClearAll
    }
  }
}
</script>

<style scoped>
.hb-eq-list { padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-lg); }
.hb-eq-list__filter-group { border: none; padding: 0; margin: 0; }
.hb-eq-list__filter-legend { font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--space-xs); }
.hb-eq-list__chips { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.hb-eq-list__chip { padding: 4px 10px; border-radius: var(--radius-full); border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; transition: all var(--transition-fast); }
.hb-eq-list__chip:hover { border-color: var(--color-accent-hope); color: var(--color-text-primary); }
.hb-eq-list__chip--active { background: var(--color-accent-hope); color: var(--color-bg-primary); border-color: var(--color-accent-hope); font-weight: var(--font-weight-bold); }
.hb-eq-list__detail { background-color: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-md); }
.hb-eq-list__detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); }
.hb-eq-list__detail-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
.hb-eq-list__delete-confirm { background-color: var(--color-bg-secondary); border: 2px solid var(--color-danger); border-radius: var(--radius-lg); padding: var(--space-md); text-align: center; }
.hb-eq-list__delete-text { color: var(--color-text-primary); margin: 0 0 var(--space-sm); }
.hb-eq-list__delete-actions { display: flex; justify-content: center; gap: var(--space-sm); }
</style>
