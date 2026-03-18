<template>
  <section
    class="cache-panel"
    aria-labelledby="cache-panel-heading"
  >
    <h2
      id="cache-panel-heading"
      class="cache-panel__title"
    >
      Mise a jour de l'application
    </h2>
    <p class="cache-panel__description">
      Si l'application semble bloquee sur une ancienne version (notamment sur iPad/Safari),
      videz le cache pour forcer le rechargement.
    </p>

    <div class="cache-panel__actions">
      <button
        class="sync-btn sync-btn--secondary"
        :disabled="checking"
        @click="handleCheckUpdate"
      >
        <span aria-hidden="true">🔍</span>
        {{ checking ? 'Verification...' : 'Verifier les mises a jour' }}
      </button>

      <button
        v-if="sw.hasUpdate.value"
        class="sync-btn sync-btn--primary"
        @click="handleApplyUpdate"
      >
        <span aria-hidden="true">⬆️</span>
        Appliquer la mise a jour
      </button>

      <button
        class="sync-btn sync-btn--ghost"
        :disabled="clearing"
        @click="handleClearCache"
      >
        <span aria-hidden="true">🗑️</span>
        {{ clearing ? 'Nettoyage...' : 'Vider le cache et recharger' }}
      </button>
    </div>

    <div
      v-if="feedback"
      class="cache-panel__feedback"
      :class="`cache-panel__feedback--${feedback.type}`"
      role="status"
      aria-live="polite"
    >
      {{ feedback.message }}
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
import { useServiceWorker } from '@core/composables/useServiceWorker.js'

export default {
  name: 'CachePanel',

  setup() {
    const sw = useServiceWorker()
    const checking = ref(false)
    const clearing = ref(false)
    const feedback = ref(null)

    function showFeedback(type, message) {
      feedback.value = { type, message }
      setTimeout(() => { feedback.value = null }, 5000)
    }

    async function handleCheckUpdate() {
      checking.value = true
      const hasUpdate = await sw.checkForUpdate()
      checking.value = false

      if (hasUpdate) {
        showFeedback('success', 'Une mise a jour est disponible ! Cliquez sur "Appliquer" pour l\'installer.')
      } else {
        showFeedback('success', 'L\'application est a jour.')
      }
    }

    function handleApplyUpdate() {
      sw.applyUpdate()
    }

    async function handleClearCache() {
      clearing.value = true
      await sw.clearCacheAndReload()
      // Si on arrive ici, le reload n'a pas fonctionne
      clearing.value = false
      showFeedback('error', 'Impossible de vider le cache. Essayez de recharger manuellement.')
    }

    return {
      sw,
      checking,
      clearing,
      feedback,
      handleCheckUpdate,
      handleApplyUpdate,
      handleClearCache
    }
  }
}
</script>

<style scoped>
.cache-panel {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.cache-panel__title {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.cache-panel__description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-lg) 0;
}

.cache-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.cache-panel__feedback {
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.cache-panel__feedback--success {
  background-color: rgba(76, 175, 80, 0.15);
  color: var(--color-accent-success);
  border: 1px solid var(--color-accent-success);
}

.cache-panel__feedback--error {
  background-color: rgba(244, 67, 54, 0.15);
  color: var(--color-accent-danger);
  border: 1px solid var(--color-accent-danger);
}

/* Reutilisation des classes sync-btn definies globalement */
.sync-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-family: inherit;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  border: 1px solid transparent;
}

.sync-btn:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 2px;
}

.sync-btn--primary {
  background-color: var(--color-accent-hope);
  color: var(--color-text-inverse);
}

.sync-btn--primary:hover:not(:disabled) {
  background-color: #468f9a;
}

.sync-btn--secondary {
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.sync-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-bg-elevated);
}

.sync-btn--secondary:disabled,
.sync-btn--ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.sync-btn--ghost:hover:not(:disabled) {
  background-color: var(--color-bg-elevated);
}
</style>
