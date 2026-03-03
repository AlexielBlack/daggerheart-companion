<template>
  <ModuleBoundary
    module-name="Liste domaines homebrew"
    module-id="homebrew-domain-list"
  >
    <div class="hb-dom-list">
      <header class="hb-dom-list__header">
        <h2 class="hb-dom-list__title">
          Domaines custom
        </h2>
        <router-link
          to="/homebrew/domain/new"
          class="hb-dom-list__create-btn"
          aria-label="Creer domaine"
        >
          + Nouveau
        </router-link>
      </header>
      <HomebrewList
        :items="store.items"
        :category="'domain'"
        empty-message="Aucun(e) domaine homebrew. Creez-en un(e) !"
        @edit="onEdit"
        @delete="onDelete"
      >
        <template #preview="{ item }">
          <DomainPreview :data="item" />
        </template>
      </HomebrewList>
      <ImportExportPanel
        :items="store.items"
        :category="'domain'"
        @import="onImport"
      />
    </div>
  </ModuleBoundary>
</template>

<script>
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

    function onEdit(item) {
      router.push(`/homebrew/domain/${item.id}`)
    }
    function onDelete(item) {
      store.remove(item.id)
    }
    function onImport(items) {
      items.forEach(item => store.create(item))
    }

    return { store, onEdit, onDelete, onImport }
  }
}
</script>

<style scoped>
.hb-dom-list { padding: var(--space-md); max-width: var(--content-max-width); margin: 0 auto; }
.hb-dom-list__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); }
.hb-dom-list__title { font-size: var(--font-xl); font-weight: var(--font-bold); color: var(--color-text-primary); margin: 0; }
.hb-dom-list__create-btn { display: inline-flex; align-items: center; padding: var(--space-sm) var(--space-md); background-color: var(--color-accent-hope); color: var(--color-bg-primary); border-radius: var(--radius-md); text-decoration: none; font-weight: var(--font-semibold); font-size: var(--font-sm); transition: background-color var(--transition-fast); }
.hb-dom-list__create-btn:hover { background-color: var(--color-accent-gold); }
</style>
