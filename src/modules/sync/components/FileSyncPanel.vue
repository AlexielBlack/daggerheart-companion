<template>
  <section
    class="sync-panel"
    aria-labelledby="file-sync-heading"
  >
    <h2
      id="file-sync-heading"
      class="sync-panel__title"
    >
      📁 Synchronisation par fichier
    </h2>
    <p class="sync-panel__description">
      Exportez vos données en fichier JSON, puis importez-les sur un autre poste.
    </p>

    <!-- Export -->
    <div class="sync-panel__action">
      <button
        class="sync-btn sync-btn--primary"
        :disabled="fileSync.status.value === 'exporting'"
        aria-label="Exporter les données en fichier JSON"
        @click="handleExport"
      >
        <span aria-hidden="true">⬇️</span>
        Exporter les données
      </button>
    </div>

    <!-- Import -->
    <div class="sync-panel__action">
      <label
        for="file-import-input"
        class="sync-btn sync-btn--secondary"
        role="button"
        tabindex="0"
        aria-label="Importer un fichier JSON de sauvegarde"
        @keydown.enter="$refs.fileInput.click()"
        @keydown.space.prevent="$refs.fileInput.click()"
      >
        <span aria-hidden="true">⬆️</span>
        Importer un fichier
      </label>
      <input
        id="file-import-input"
        ref="fileInput"
        type="file"
        accept=".json"
        class="sync-panel__file-input"
        aria-describedby="file-import-hint"
        @change="handleImport"
      />
      <small
        id="file-import-hint"
        class="sync-panel__hint"
      >
        Fichier .json exporté depuis l'application
      </small>
    </div>

    <!-- Confirmation d'import -->
    <div
      v-if="showConfirm"
      ref="confirmRef"
      class="sync-panel__confirm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-heading"
      aria-describedby="confirm-description"
    >
      <p
        id="confirm-heading"
        class="sync-panel__confirm-title"
      >
        ⚠️ Confirmer l'import
      </p>
      <p
        id="confirm-description"
        class="sync-panel__confirm-text"
      >
        L'import remplacera vos données actuelles par celles du fichier
        <strong>{{ pendingFile?.name }}</strong>.
        Cette action est irréversible.
      </p>
      <div class="sync-panel__confirm-actions">
        <button
          class="sync-btn sync-btn--danger"
          @click="confirmImport"
        >
          Confirmer l'import
        </button>
        <button
          class="sync-btn sync-btn--ghost"
          @click="cancelImport"
        >
          Annuler
        </button>
      </div>
    </div>

    <!-- Feedback -->
    <div
      v-if="feedback"
      class="sync-panel__feedback"
      :class="`sync-panel__feedback--${feedback.type}`"
      role="status"
      aria-live="polite"
    >
      {{ feedback.message }}
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
import { useFocusTrap } from '@core/composables/useFocusTrap.js'
import { useFileSync } from '../composables/useFileSync.js'
import { useSyncStore } from '../stores/syncStore.js'

export default {
  name: 'FileSyncPanel',

  setup() {
    const fileSync = useFileSync()
    const syncStore = useSyncStore()

    const showConfirm = ref(false)
    const confirmRef = ref(null)
    const pendingFile = ref(null)
    const feedback = ref(null)

    useFocusTrap(confirmRef, () => showConfirm.value)

    function showFeedback(type, message) {
      feedback.value = { type, message }
      setTimeout(() => { feedback.value = null }, 5000)
    }

    function handleExport() {
      fileSync.exportToFile()
      syncStore.addHistoryEntry({
        type: 'export',
        method: 'file',
        date: new Date().toISOString(),
        success: true
      })
      showFeedback('success', 'Export réussi ! Fichier téléchargé.')
    }

    function handleImport(event) {
      const file = event.target?.files?.[0]
      if (!file) return

      pendingFile.value = file
      showConfirm.value = true
    }

    async function confirmImport() {
      if (!pendingFile.value) return

      const result = await fileSync.importFromFile(pendingFile.value)

      syncStore.addHistoryEntry({
        type: 'import',
        method: 'file',
        date: new Date().toISOString(),
        success: result.success
      })

      if (result.success) {
        showFeedback('success', 'Import réussi ! Rechargez la page pour voir les changements.')
      } else {
        showFeedback('error', result.error || 'Erreur lors de l\'import.')
      }

      showConfirm.value = false
      pendingFile.value = null
    }

    function cancelImport() {
      showConfirm.value = false
      pendingFile.value = null
    }

    return {
      fileSync,
      showConfirm,
      confirmRef,
      pendingFile,
      feedback,
      handleExport,
      handleImport,
      confirmImport,
      cancelImport
    }
  }
}
</script>

<style scoped>
.sync-panel {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.sync-panel__title {
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.sync-panel__description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-lg) 0;
}

.sync-panel__action {
  margin-bottom: var(--space-md);
}

.sync-panel__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sync-panel__hint {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-top: var(--space-xs);
}

.sync-panel__confirm {
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-accent-warning);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin: var(--space-md) 0;
}

.sync-panel__confirm-title {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-warning);
  margin: 0 0 var(--space-sm) 0;
}

.sync-panel__confirm-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-md) 0;
}

.sync-panel__confirm-actions {
  display: flex;
  gap: var(--space-sm);
}

.sync-panel__feedback {
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.sync-panel__feedback--success {
  background-color: rgba(76, 175, 80, 0.15);
  color: var(--color-accent-success);
  border: 1px solid var(--color-accent-success);
}

.sync-panel__feedback--error {
  background-color: rgba(244, 67, 54, 0.15);
  color: var(--color-accent-danger);
  border: 1px solid var(--color-accent-danger);
}

/* Boutons sync partagés */
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
  text-decoration: none;
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

.sync-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn--secondary {
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.sync-btn--secondary:hover {
  background-color: var(--color-bg-elevated);
}

.sync-btn--danger {
  background-color: var(--color-accent-danger);
  color: #fff;
}

.sync-btn--danger:hover {
  background-color: #d32f2f;
}

.sync-btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.sync-btn--ghost:hover {
  background-color: var(--color-bg-elevated);
}
</style>
