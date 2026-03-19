<template>
  <div class="scene-action-bar">
    <div
      class="scene-action-bar__counters"
      role="toolbar"
      aria-label="Compteurs de session"
    >
      <div
        class="scene-action-bar__counter scene-action-bar__counter--fear"
        aria-label="Compteur Fear"
      >
        <button
          class="scene-action-bar__counter-btn"
          aria-label="Retirer 1 Fear"
          :disabled="sessionStore.fear <= 0"
          @click="sessionStore.decrementFear()"
        >
          &minus;
        </button>
        <span class="scene-action-bar__counter-value scene-action-bar__counter-value--fear">{{ sessionStore.fear }}</span>
        <button
          class="scene-action-bar__counter-btn"
          aria-label="Ajouter 1 Fear"
          @click="sessionStore.incrementFear()"
        >
          +
        </button>
      </div>
    </div>
    <nav
      class="scene-action-bar__tabs"
      role="tablist"
      aria-label="Onglets de scene"
    >
      <button
        role="tab"
        class="scene-action-bar__tab"
        :class="{ 'scene-action-bar__tab--active': activeTab === 'personnages' }"
        :aria-selected="activeTab === 'personnages'"
        @click="$emit('change-tab', 'personnages')"
      >
        &#x1F9D9; Personnages
      </button>
      <button
        role="tab"
        class="scene-action-bar__tab"
        :class="{ 'scene-action-bar__tab--active': activeTab === 'pnjs' }"
        :aria-selected="activeTab === 'pnjs'"
        @click="$emit('change-tab', 'pnjs')"
      >
        &#x1F3AD; PNJs
        <span
          v-if="sessionStore.loadedNpcCount > 0"
          class="scene-action-bar__badge"
        >{{ sessionStore.loadedNpcCount }}</span>
      </button>
      <button
        role="tab"
        class="scene-action-bar__tab"
        :class="{ 'scene-action-bar__tab--active': activeTab === 'environnement' }"
        :aria-selected="activeTab === 'environnement'"
        @click="$emit('change-tab', 'environnement')"
      >
        &#x1F30D; Environnement
      </button>
    </nav>
  </div>
</template>

<script>
import { useSessionStore } from '../stores/sessionStore'

export default {
  name: 'SceneActionBar',

  props: {
    activeTab: {
      type: String,
      required: true
    }
  },

  emits: ['open-catalogue', 'change-tab'],

  setup() {
    const sessionStore = useSessionStore()
    return { sessionStore }
  }
}
</script>

<style scoped>
.scene-action-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: color-mix(in srgb, var(--color-bg-primary) 90%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}

.scene-action-bar__tabs {
  display: flex;
  gap: 2px;
  border-radius: var(--radius-md);
  background: var(--color-bg-tertiary);
  padding: 2px;
}

.scene-action-bar__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  min-height: var(--touch-min);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.scene-action-bar__tab:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.scene-action-bar__tab--active {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.scene-action-bar__counters {
  display: flex;
  gap: var(--space-xs);
  margin-right: auto;
}

.scene-action-bar__counter {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.scene-action-bar__counter--fear {
  border-color: color-mix(in srgb, var(--color-accent-fear) 50%, transparent);
}

.scene-action-bar__counter-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0 4px;
  font-size: var(--font-size-sm);
  line-height: 1;
  min-width: 1.5rem;
  min-height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.scene-action-bar__counter-btn:hover:not(:disabled) {
  color: var(--color-text-primary);
}

.scene-action-bar__counter-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.scene-action-bar__counter-value--fear {
  color: var(--color-accent-fear);
  min-width: 1.2em;
  text-align: center;
}

.scene-action-bar__badge {
  font-size: var(--font-size-xs);
  background: var(--color-accent-hope);
  color: var(--color-text-inverse, #1a1a2e);
  border-radius: var(--radius-full);
  min-width: 1.2em;
  height: 1.2em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}
</style>
