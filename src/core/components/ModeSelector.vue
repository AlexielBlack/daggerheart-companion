<template>
  <div
    class="mode-selector"
    role="tablist"
    aria-label="Mode de navigation"
  >
    <router-link
      v-for="mode in modes"
      :key="mode.id"
      :to="mode.defaultRoute"
      class="mode-selector__tab"
      :class="{ 'mode-selector__tab--active': currentMode === mode.id }"
      role="tab"
      :aria-selected="currentMode === mode.id ? 'true' : 'false'"
      :tabindex="currentMode === mode.id ? 0 : -1"
      @click="$emit('navigate')"
    >
      <span
        class="mode-selector__icon"
        aria-hidden="true"
      >{{ mode.icon }}</span>
      <span class="mode-selector__label">{{ mode.label }}</span>
    </router-link>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'ModeSelector',

  emits: ['navigate'],

  setup() {
    const route = useRoute()

    // Définition des 3 modes de navigation
    const modes = [
      { id: 'lecture', label: 'Lecture', icon: '📖', defaultRoute: '/lecture/adversaires' },
      { id: 'edition', label: 'Édition', icon: '✏️', defaultRoute: '/edition/personnages' },
      { id: 'jeu', label: 'Jeu', icon: '🎮', defaultRoute: '/jeu/table' }
    ]

    // Mode actif déterminé par route.meta.mode
    const currentMode = computed(() => route.meta?.mode || 'lecture')

    return {
      modes,
      currentMode
    }
  }
}
</script>

<style scoped>
.mode-selector {
  display: flex;
  gap: 2px;
  margin-right: var(--space-sm);
  flex-shrink: 0;
}

.mode-selector__tab {
  display: flex;
  gap: 4px;
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: none;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  white-space: nowrap;
}

.mode-selector__tab:hover {
  color: var(--color-text-primary);
}

.mode-selector__tab--active {
  color: var(--color-accent-hope);
  border-bottom-color: var(--color-accent-hope);
  font-weight: var(--font-weight-medium);
}

.mode-selector__tab:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: -2px;
}

.mode-selector__icon {
  font-size: 1em;
}

/* ── Mobile : masquer les labels, agrandir les icônes ── */
@media (max-width: 768px) {
  .mode-selector__label {
    display: none;
  }

  .mode-selector__icon {
    font-size: 1.2em;
  }
}
</style>
