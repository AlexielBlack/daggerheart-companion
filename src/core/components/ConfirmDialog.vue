<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="dialog.visible.value"
        class="confirm-overlay"
        @click.self="dialog.cancel()"
        @keydown.escape="dialog.cancel()"
      >
        <div
          ref="panelRef"
          class="confirm-panel"
          role="alertdialog"
          aria-modal="true"
          :aria-label="dialog.options.value.title || 'Confirmer l\'action'"
        >
          <p
            v-if="dialog.options.value.title"
            class="confirm-panel__title"
          >
            {{ dialog.options.value.title }}
          </p>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p
            class="confirm-panel__message"
            v-html="dialog.options.value.message"
          ></p>
          <div class="confirm-panel__actions">
            <button
              class="btn btn--ghost btn--sm"
              @click="dialog.cancel()"
            >
              {{ dialog.options.value.cancelLabel }}
            </button>
            <button
              class="btn btn--sm"
              :class="`btn--${dialog.options.value.variant}`"
              @click="dialog.accept()"
            >
              {{ dialog.options.value.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref } from 'vue'
import { useConfirmDialog } from '@core/composables/useConfirmDialog.js'
import { useFocusTrap } from '@core/composables/useFocusTrap.js'

export default {
  name: 'ConfirmDialog',
  setup() {
    const dialog = useConfirmDialog()
    const panelRef = ref(null)

    useFocusTrap(panelRef, () => dialog.visible.value)

    return { dialog, panelRef }
  }
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
}

.confirm-panel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 420px;
  width: 90%;
  box-shadow: var(--shadow-lg);
}

.confirm-panel__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm);
  color: var(--color-text-primary);
}

.confirm-panel__message {
  margin: 0 0 var(--space-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.confirm-panel__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

/* ── Transitions ── */
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-active .confirm-panel,
.confirm-fade-leave-active .confirm-panel {
  transition: transform 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-fade-enter-from .confirm-panel {
  transform: scale(0.95) translateY(8px);
}

.confirm-fade-leave-to .confirm-panel {
  transform: scale(0.95) translateY(8px);
}
</style>
