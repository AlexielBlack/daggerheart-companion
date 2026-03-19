<template>
  <ModuleBoundary
    :module-name="currentTitle"
    :module-id="`table-${currentTab}`"
  >
    <div class="table-view">
      <div class="table-view__content">
        <router-view />
      </div>

      <nav
        class="table-view__tabs"
        aria-label="Outils de jeu"
      >
        <ul role="tablist">
          <li
            v-for="tab in tabs"
            :key="tab.id"
            role="presentation"
          >
            <router-link
              :to="`/table/${tab.id}`"
              role="tab"
              :aria-selected="currentTab === tab.id ? 'true' : 'false'"
              class="table-view__tab"
              :class="{ 'table-view__tab--active': currentTab === tab.id }"
            >
              <span
                class="table-view__tab-icon"
                aria-hidden="true"
              >{{ tab.icon }}</span>
              <span class="table-view__tab-label">{{ tab.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </ModuleBoundary>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ModuleBoundary from './ModuleBoundary.vue'

/* Definition des onglets de la table de jeu */
const TABLE_TABS = [
  { id: 'scene', label: 'Scene', icon: '\u{1F3AD}' },
  { id: 'combat', label: 'Combat', icon: '\u2694\uFE0F' },
  { id: 'des', label: 'Des', icon: '\u{1F3B2}' },
  { id: 'prep', label: 'Preparation', icon: '\u{1F4CB}' }
]

export default {
  name: 'TableView',
  components: { ModuleBoundary },
  setup() {
    const route = useRoute()

    /* Onglet courant derive de la meta de la route */
    const currentTab = computed(() => route.meta?.tab || 'scene')

    /* Titre dynamique pour le ModuleBoundary */
    const currentTitle = computed(() => {
      const tab = TABLE_TABS.find(t => t.id === currentTab.value)
      return tab ? `Table \u2014 ${tab.label}` : 'Table de jeu'
    })

    return { tabs: TABLE_TABS, currentTab, currentTitle }
  }
}
</script>

<style scoped>
.table-view {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - var(--header-height, 56px) - 2 * var(--space-md, 1rem));
}

.table-view__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md, 1rem);
}

.table-view__tabs {
  border-top: 1px solid var(--color-border, rgba(255,255,255,0.1));
  background: var(--color-surface, #1a1a2e);
}

.table-view__tabs ul {
  display: flex;
  justify-content: center;
  gap: var(--space-xs, 0.25rem);
  list-style: none;
  margin: 0;
  padding: var(--space-xs, 0.25rem) 0;
}

.table-view__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-radius: var(--radius-sm, 4px);
  transition: color var(--transition-fast, 0.15s), background var(--transition-fast, 0.15s);
  font-size: 0.8em;
}

.table-view__tab:hover {
  color: var(--color-text, #fff);
  background: var(--color-surface-hover, rgba(255,255,255,0.08));
}

.table-view__tab--active {
  color: var(--color-hope, #f0c040);
  font-weight: 600;
}

.table-view__tab-icon { font-size: 1.4em; }
</style>
