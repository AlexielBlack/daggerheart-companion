<template>
  <div
    class="scene-action-bar"
    role="toolbar"
    aria-label="Actions rapides de scene"
  >
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
export default {
  name: 'SceneActionBar',

  emits: ['open-catalogue'],

  setup() {
    /** Fait defiler la vue vers la section ciblee */
    function scrollTo(target) {
      const sectionMap = {
        encounter: '.scene-view__encounter',
        notes: '.session-notes'
      }
      const el = document.querySelector(sectionMap[target])
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return { scrollTo }
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
</style>
