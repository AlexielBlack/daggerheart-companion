<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="bdrawer__backdrop"
      @click.self="close"
    >
      <!-- eslint-enable -->
      <div
        ref="sheet"
        class="bdrawer__sheet"
        :class="{ 'bdrawer__sheet--open': isVisible }"
        role="dialog"
        :aria-label="title"
        aria-modal="true"
      >
        <!-- Handle visuel + zone de fermeture -->
        <div
          class="bdrawer__handle-area"
          role="button"
          tabindex="0"
          :aria-label="'Fermer ' + title"
          @click="close"
          @keydown.enter="close"
          @keydown.space.prevent="close"
        >
          <div class="bdrawer__handle"></div>
        </div>

        <!-- En-tête -->
        <div class="bdrawer__header">
          <span class="bdrawer__title">{{ title }}</span>
          <button
            class="bdrawer__close"
            :aria-label="'Fermer ' + title"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- Contenu scrollable -->
        <div class="bdrawer__body">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useFocusTrap } from '@core/composables/useFocusTrap.js'

export default {
  name: 'BottomDrawer',

  props: {
    modelValue: { type: Boolean, default: false },
    title:      { type: String,  default: 'Panneau' }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const sheet     = ref(null)
    const isVisible = ref(false)

    useFocusTrap(sheet, () => props.modelValue)

    function close() {
      isVisible.value = false
      // Laisser l'animation se terminer avant de démonter
      setTimeout(() => emit('update:modelValue', false), 280)
    }

    // Ouverture : frame suivant pour déclencher la transition CSS
    watch(() => props.modelValue, async (val) => {
      if (val) {
        await nextTick()
        requestAnimationFrame(() => { isVisible.value = true })
      }
    }, { immediate: true })

    // Fermeture clavier (Escape)
    function onKeydown(e) {
      if (e.key === 'Escape' && props.modelValue) close()
    }

    onMounted(()   => window.addEventListener('keydown', onKeydown))
    onUnmounted(() => window.removeEventListener('keydown', onKeydown))

    return { sheet, isVisible, close }
  }
}
</script>

<style scoped>
/* ══ Backdrop ══ */
.bdrawer__backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  /* Empêche le scroll du fond */
  overscroll-behavior: contain;
}

/* ══ Sheet ══ */
.bdrawer__sheet {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  /* Position initiale : hors écran vers le bas */
  transform: translateY(100%);
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

.bdrawer__sheet--open {
  transform: translateY(0);
}

/* ══ Handle / poignée ══ */
.bdrawer__handle-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-sm) var(--space-md) var(--space-xs);
  cursor: pointer;
  /* Zone tactile généreuse */
  min-height: var(--touch-min);
  flex-shrink: 0;
}

.bdrawer__handle {
  width: 2.5rem;
  height: 0.25rem;
  background: var(--color-border-active);
  border-radius: var(--radius-full);
  opacity: 0.5;
}

/* ══ Header ══ */
.bdrawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md) var(--space-sm);
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
}

.bdrawer__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.bdrawer__close {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  touch-action: manipulation;
  transition: background var(--transition-fast);
}

.bdrawer__close:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

/* ══ Corps scrollable ══ */
.bdrawer__body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
