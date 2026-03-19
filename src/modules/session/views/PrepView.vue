<template>
  <div class="prep-view">
    <nav
      class="prep-view__tabs"
      aria-label="Outils de preparation"
    >
      <ul role="tablist">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          role="presentation"
        >
          <router-link
            :to="tab.to"
            role="tab"
            :aria-selected="currentTab === tab.id ? 'true' : 'false'"
            class="prep-view__tab"
            :class="{ 'prep-view__tab--active': currentTab === tab.id }"
          >
            {{ tab.label }}
          </router-link>
        </li>
      </ul>
    </nav>
    <div
      role="tabpanel"
      class="prep-view__content"
    >
      <router-view />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const PREP_TABS = [
  { id: 'personnages', label: 'Personnages', to: '/table/prep/personnages' },
  { id: 'pnjs', label: 'PNJs', to: '/table/prep/pnjs' },
  { id: 'rencontres', label: 'Rencontres', to: '/table/prep/rencontres' },
  { id: 'historique', label: 'Historique', to: '/table/prep/historique' }
]

export default {
  name: 'PrepView',
  setup() {
    const route = useRoute()
    const currentTab = computed(() => route.meta?.prepTab || 'personnages')
    return { tabs: PREP_TABS, currentTab }
  }
}
</script>

<style scoped>
.prep-view__tabs ul {
  display: flex;
  gap: var(--space-xs, 0.25rem);
  list-style: none;
  margin: 0 0 var(--space-md, 1rem);
  padding: 0;
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.1));
}

.prep-view__tab {
  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast, 0.15s), border-color var(--transition-fast, 0.15s);
  font-size: 0.9em;
}

.prep-view__tab:hover { color: var(--color-text, #fff); }

.prep-view__tab--active {
  color: var(--color-hope, #f0c040);
  border-bottom-color: var(--color-hope, #f0c040);
}
</style>
