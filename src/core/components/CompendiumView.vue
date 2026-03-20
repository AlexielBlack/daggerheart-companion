<template>
  <ModuleBoundary
    :module-name="currentTitle"
    :module-id="`compendium-${currentTab}`"
  >
    <div class="compendium-view">
      <nav
        class="compendium-view__tabs"
        aria-label="Categories du compendium"
      >
        <ul role="tablist">
          <li
            v-for="tab in tabs"
            :key="tab.id"
            role="presentation"
          >
            <router-link
              :to="`/compendium/${tab.id}`"
              role="tab"
              :title="tab.label"
              :aria-selected="currentTab === tab.id ? 'true' : 'false'"
              class="compendium-view__tab"
              :class="{ 'compendium-view__tab--active': currentTab === tab.id }"
            >
              <span
                class="compendium-view__tab-icon"
                aria-hidden="true"
              >{{ tab.icon }}</span>
              <span class="compendium-view__tab-label">{{ tab.label }}</span>
            </router-link>
          </li>
        </ul>
        <div
          class="compendium-view__columns-control"
          role="group"
          aria-label="Nombre de colonnes"
        >
          <label
            for="compendium-columns-slider"
            class="compendium-view__columns-label"
          >
            {{ compendiumColumns === 0 ? 'Auto' : compendiumColumns + ' col.' }}
          </label>
          <input
            id="compendium-columns-slider"
            v-model.number="compendiumColumns"
            type="range"
            min="0"
            max="4"
            step="1"
            class="compendium-view__columns-slider"
            aria-label="Colonnes du contenu"
            :list="'compendium-columns-ticks'"
          />
          <datalist id="compendium-columns-ticks">
            <option
              v-for="opt in COLUMN_OPTIONS"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            ></option>
          </datalist>
        </div>
      </nav>

      <div class="compendium-view__content">
        <router-view />
      </div>
    </div>
  </ModuleBoundary>
</template>

<script>
import { computed, provide, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ModuleBoundary from './ModuleBoundary.vue'
import { useStorage } from '@core/composables/useStorage.js'

// Onglets du compendium avec icones et labels
const COMPENDIUM_TABS = [
  { id: 'adversaires', label: 'Adversaires', icon: '\u2694\uFE0F' },
  { id: 'environnements', label: 'Environnements', icon: '\uD83C\uDF0D' },
  { id: 'classes', label: 'Classes', icon: '\uD83D\uDDE1\uFE0F' },
  { id: 'domaines', label: 'Domaines', icon: '\uD83C\uDCCF' },
  { id: 'ascendances', label: 'Ascendances', icon: '\uD83E\uDDEC' },
  { id: 'communautes', label: 'Communautés', icon: '\uD83C\uDFD8\uFE0F' },
  { id: 'equipement', label: 'Equipement', icon: '\uD83D\uDEE1\uFE0F' }
]

const COLUMN_OPTIONS = [
  { value: 0, label: 'Auto' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' }
]

export default {
  name: 'CompendiumView',
  components: { ModuleBoundary },
  setup() {
    const route = useRoute()
    const { data: compendiumColumns } = useStorage('compendium-columns', 0)

    // Fournir aux browsers enfants
    provide('compendiumColumns', compendiumColumns)

    // Onglet courant derive de la meta de la route
    const currentTab = computed(() => route.meta?.tab || 'adversaires')

    // Titre courant pour le ModuleBoundary
    const currentTitle = computed(() => {
      const tab = COMPENDIUM_TABS.find(t => t.id === currentTab.value)
      return tab ? tab.label : 'Compendium'
    })

    // Scroll-to-top au changement d'onglet
    watch(currentTab, () => {
      nextTick(() => {
        const content = document.querySelector('.compendium-view__content')
        if (content) content.scrollTop = 0
      })
    })

    return { tabs: COMPENDIUM_TABS, currentTab, currentTitle, compendiumColumns, COLUMN_OPTIONS }
  }
}
</script>

<style scoped>
.compendium-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.compendium-view__tabs {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 0.5rem);
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.1));
  padding: 0 var(--space-md, 1rem);
}

.compendium-view__tabs ul {
  display: flex;
  gap: var(--space-xs, 0.25rem);
  list-style: none;
  margin: 0;
  padding: var(--space-sm, 0.5rem) 0 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  min-width: 0;
}

.compendium-view__tab {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: color var(--transition-fast, 0.15s), border-color var(--transition-fast, 0.15s);
}

.compendium-view__tab:hover {
  color: var(--color-text, #fff);
}

.compendium-view__tab--active {
  color: var(--color-hope, #f0c040);
  border-bottom-color: var(--color-hope, #f0c040);
  font-weight: 600;
}

.compendium-view__columns-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  flex-shrink: 0;
  padding-bottom: var(--space-xs, 0.25rem);
}

.compendium-view__columns-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #aaa);
  min-width: 3em;
  text-align: right;
}

.compendium-view__columns-slider {
  width: 80px;
  accent-color: var(--color-accent-hope, #53a8b6);
  cursor: pointer;
}

.compendium-view__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md, 1rem);
}

@media (max-width: 768px) {
  .compendium-view__tab-label { display: none; }
  .compendium-view__tab-icon { font-size: 1.3em; }
  .compendium-view__tab { padding: var(--space-sm, 0.5rem); }
  .compendium-view__columns-control { display: none !important; }
  .compendium-view__columns-slider,
  #compendium-columns-ticks { display: none !important; }
}
</style>
