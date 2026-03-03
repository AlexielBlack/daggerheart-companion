<template>
  <ModuleBoundary
    module-name="Liste classes homebrew"
    module-id="homebrew-class-list"
  >
    <div class="hb-cla-list">
      <header class="hb-cla-list__header">
        <h2 class="hb-cla-list__title">
          Classes custom
        </h2>
        <router-link
          to="/homebrew/class/new"
          class="hb-cla-list__create-btn"
          aria-label="Creer classe"
        >
          + Nouveau
        </router-link>
      </header>
      <HomebrewList
        :items="store.items"
        :category="'class'"
        empty-message="Aucun(e) classe homebrew. Creez-en un(e) !"
        @edit="onEdit"
        @delete="onDelete"
      >
        <template #preview="{ item }">
          <ClassPreview :data="item" />
        </template>
      </HomebrewList>
      <ImportExportPanel
        :items="store.items"
        :category="'class'"
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
import ClassPreview from '../categories/class/ClassPreview.vue'
import { useClassHomebrewStore } from '../categories/class/useClassHomebrewStore.js'

export default {
  name: 'HomebrewClassList',
  components: { ModuleBoundary, HomebrewList, ImportExportPanel, ClassPreview },
  setup() {
    const router = useRouter()
    const store = useClassHomebrewStore()

    function onEdit(item) {
      router.push(`/homebrew/class/${item.id}`)
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
.hb-cla-list { padding: var(--space-md); max-width: var(--content-max-width); margin: 0 auto; }
.hb-cla-list__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); }
.hb-cla-list__title { font-size: var(--font-xl); font-weight: var(--font-bold); color: var(--color-text-primary); margin: 0; }
.hb-cla-list__create-btn { display: inline-flex; align-items: center; padding: var(--space-sm) var(--space-md); background-color: var(--color-accent-hope); color: var(--color-bg-primary); border-radius: var(--radius-md); text-decoration: none; font-weight: var(--font-semibold); font-size: var(--font-sm); transition: background-color var(--transition-fast); }
.hb-cla-list__create-btn:hover { background-color: var(--color-accent-gold); }
</style>
