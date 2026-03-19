<template>
  <div
    class="scene-action-bar"
    role="toolbar"
    aria-label="Actions rapides de scene"
  >
    <div
      class="scene-action-bar__counters"
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
      <div
        class="scene-action-bar__counter scene-action-bar__counter--hope"
        aria-label="Compteur Hope"
      >
        <button
          class="scene-action-bar__counter-btn"
          aria-label="Retirer 1 Hope"
          :disabled="sessionStore.hope <= 0"
          @click="sessionStore.decrementHopeGlobal()"
        >
          &minus;
        </button>
        <span class="scene-action-bar__counter-value scene-action-bar__counter-value--hope">{{ sessionStore.hope }}</span>
        <button
          class="scene-action-bar__counter-btn"
          aria-label="Ajouter 1 Hope"
          @click="sessionStore.incrementHopeGlobal()"
        >
          +
        </button>
      </div>
    </div>
    <button
      class="scene-action-bar__btn"
      aria-label="Ouvrir le catalogue PNJ"
      @click="$emit('open-catalogue')"
    >
      &#x1F3AD; PNJs
    </button>
    <a
      href="#scene-encounter"
      class="scene-action-bar__btn"
      aria-label="Aller aux rencontres"
      @click.prevent="scrollTo('encounter')"
    >
      &#x2694;&#xFE0F; Rencontres
    </a>
    <a
      href="#scene-notes"
      class="scene-action-bar__btn"
      aria-label="Aller aux notes"
      @click.prevent="scrollTo('notes')"
    >
      &#x1F4DD; Notes
    </a>
  </div>
</template>

<script>
import { useSessionStore } from '../stores/sessionStore'

export default {
  name: 'SceneActionBar',

  emits: ['open-catalogue'],

  setup() {
    const sessionStore = useSessionStore()

    /** Fait defiler la vue vers la section ciblee */
    function scrollTo(target) {
      const sectionMap = {
        encounter: '.scene-view__encounter',
        notes: '.session-notes'
      }
      const el = document.querySelector(sectionMap[target])
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return { scrollTo, sessionStore }
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
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: color-mix(in srgb, var(--color-bg-primary) 90%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.scene-action-bar__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  min-height: var(--touch-min);
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}

.scene-action-bar__btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-active);
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

.scene-action-bar__counter--hope {
  border-color: color-mix(in srgb, var(--color-accent-hope) 50%, transparent);
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

.scene-action-bar__counter-value--hope {
  color: var(--color-accent-hope);
  min-width: 1.2em;
  text-align: center;
}
</style>
