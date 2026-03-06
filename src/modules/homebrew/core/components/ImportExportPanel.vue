<template>
  <div
    class="import-export"
    role="region"
    :aria-label="`Import/Export ${label}`"
  >
    <h4 class="import-export__title">
      Import / Export
    </h4>

    <div class="import-export__actions">
      <!-- Export -->
      <button
        type="button"
        class="btn btn--ghost btn--sm"
        :disabled="itemCount === 0"
        @click="onExport"
      >
        📤 Exporter ({{ itemCount }})
      </button>

      <!-- Import -->
      <label class="btn btn--ghost btn--sm import-export__import-label">
        📥 Importer
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="sr-only"
          @change="onFileSelected"
        />
      </label>

      <!-- Clear All -->
      <button
        v-if="showClearAll && itemCount > 0"
        type="button"
        class="btn btn--ghost btn--sm import-export__clear-btn"
        @click="onClearRequest"
      >
        🗑️ Tout supprimer
      </button>
    </div>

    <!-- Messages -->
    <div
      v-if="statusMessage"
      class="import-export__status"
      :class="`import-export__status--${statusType}`"
      role="alert"
    >
      {{ statusMessage }}
    </div>

    <!-- Confirmation de suppression -->
    <div
      v-if="showClearConfirm"
      ref="clearConfirmRef"
      class="import-export__confirm"
      role="alertdialog"
      aria-modal="true"
      aria-label="Confirmer la suppression"
    >
      <p class="import-export__confirm-text">
        Supprimer définitivement {{ itemCount }} {{ label.toLowerCase() }} ?
        Cette action est irréversible.
      </p>
      <div class="import-export__confirm-actions">
        <button
          type="button"
          class="btn btn--danger btn--sm"
          @click="onClearConfirm"
        >
          Confirmer la suppression
        </button>
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          @click="showClearConfirm = false"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useFocusTrap } from '@core/composables/useFocusTrap.js'

/**
 * @component ImportExportPanel
 * @description Panneau d'import/export JSON pour le contenu homebrew.
 * Supporte l'export en fichier téléchargeable et l'import par sélection de fichier.
 */
export default {
  name: 'ImportExportPanel',

  props: {
    /** Label de la catégorie (ex: 'Adversaires') */
    label: {
      type: String,
      default: 'éléments'
    },
    /** Nombre d'items dans le store */
    itemCount: {
      type: Number,
      default: 0
    },
    /** Clé de catégorie pour le nom du fichier */
    categoryKey: {
      type: String,
      default: 'homebrew'
    },
    /** Afficher le bouton « Tout supprimer » */
    showClearAll: {
      type: Boolean,
      default: false
    }
  },

  emits: ['export', 'import', 'clear-all'],

  setup() {
    const showClearConfirm = ref(false)
    const clearConfirmRef = ref(null)
    useFocusTrap(clearConfirmRef, () => showClearConfirm.value)
    return { showClearConfirm, clearConfirmRef }
  },

  data() {
    return {
      statusMessage: '',
      statusType: 'info'
    }
  },

  methods: {
    onExport() {
      this.$emit('export')
      this.setStatus(`${this.itemCount} ${this.label.toLowerCase()} exporté(s).`, 'success')
    },

    onFileSelected(event) {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.name.endsWith('.json')) {
        this.setStatus('Fichier invalide. Seuls les fichiers .json sont acceptés.', 'error')
        this.resetFileInput()
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        this.$emit('import', e.target.result)
        this.resetFileInput()
      }
      reader.onerror = () => {
        this.setStatus('Erreur de lecture du fichier.', 'error')
        this.resetFileInput()
      }
      reader.readAsText(file)
    },

    onClearRequest() {
      this.showClearConfirm = true
    },

    onClearConfirm() {
      this.$emit('clear-all')
      this.showClearConfirm = false
      this.setStatus('Tous les éléments ont été supprimés.', 'success')
    },

    setStatus(message, type = 'info') {
      this.statusMessage = message
      this.statusType = type
      setTimeout(() => {
        this.statusMessage = ''
      }, 5000)
    },

    /**
     * Expose setStatus pour que le parent puisse afficher
     * le résultat de l'import (succès/erreur).
     */
    showImportResult(result) {
      if (result.success) {
        this.setStatus(
          `Import réussi : ${result.imported} ajouté(s), ${result.skipped} ignoré(s).`,
          'success'
        )
      } else {
        this.setStatus(result.error || 'Erreur lors de l\'import.', 'error')
      }
    },

    resetFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    }
  }
}
</script>

<style scoped>
.import-export {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.import-export__title {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.import-export__actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.import-export__import-label {
  cursor: pointer;
}

.import-export__clear-btn {
  margin-left: auto;
}

/* Status messages */
.import-export__status {
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.import-export__status--success {
  color: var(--color-accent-success);
  background-color: rgba(76, 175, 80, 0.1);
}

.import-export__status--error {
  color: var(--color-accent-danger);
  background-color: rgba(244, 67, 54, 0.1);
}

.import-export__status--info {
  color: var(--color-accent-info);
  background-color: rgba(33, 150, 243, 0.1);
}

/* Confirm dialog */
.import-export__confirm {
  padding: var(--space-sm) var(--space-md);
  background-color: rgba(244, 67, 54, 0.05);
  border: 1px solid var(--color-accent-danger);
  border-radius: var(--radius-md);
}

.import-export__confirm-text {
  font-size: var(--font-size-sm);
  color: var(--color-accent-danger);
  margin: 0 0 var(--space-sm) 0;
}

.import-export__confirm-actions {
  display: flex;
  gap: var(--space-sm);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
