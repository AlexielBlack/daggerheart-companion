<template>
  <div
    class="share-panel"
    role="region"
    aria-label="Partage de rencontre"
  >
    <div class="share-panel__actions">
      <!-- Export -->
      <button
        type="button"
        class="btn btn--ghost btn--sm"
        :disabled="!isValid"
        @click="exportEncounter"
      >
        📤 Exporter
      </button>

      <!-- Import -->
      <label class="btn btn--ghost btn--sm share-panel__import-label">
        📥 Importer
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="sr-only"
          @change="onFileSelected"
        />
      </label>

      <!-- Copier -->
      <button
        type="button"
        class="btn btn--ghost btn--sm"
        :disabled="!isValid"
        @click="copyToClipboard"
      >
        📋 Copier
      </button>
    </div>

    <!-- Message de statut -->
    <div
      v-if="statusMessage"
      class="share-panel__status"
      :class="`share-panel__status--${statusType}`"
      role="alert"
    >
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
/**
 * @component EncounterSharePanel
 * @description Panneau de partage / import-export de rencontres.
 * Supporte l'export en fichier JSON, l'import par fichier, et la copie presse-papier.
 */
export default {
  name: 'EncounterSharePanel',

  props: {
    /** Données sérialisées de la rencontre */
    encounterData: {
      type: Object,
      default: () => ({})
    },
    /** La rencontre est-elle valide pour export ? */
    isValid: {
      type: Boolean,
      default: false
    }
  },

  emits: ['import'],

  data() {
    return {
      statusMessage: '',
      statusType: 'info'
    }
  },

  methods: {
    /**
     * Exporte la rencontre en fichier JSON téléchargeable.
     */
    exportEncounter() {
      try {
        const json = JSON.stringify(this.encounterData, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const slug = (this.encounterData.name || 'rencontre')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        a.href = url
        a.download = `rencontre-${slug}-${date}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        this.setStatus('Rencontre exportée avec succès.', 'success')
      } catch {
        this.setStatus('Erreur lors de l\'export.', 'error')
      }
    },

    /**
     * Gère la sélection d'un fichier pour l'import.
     */
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
        const result = this.validateAndImport(e.target.result)
        if (result.success) {
          this.setStatus(`Rencontre "${result.name}" importée.`, 'success')
        } else {
          this.setStatus(result.error, 'error')
        }
        this.resetFileInput()
      }
      reader.onerror = () => {
        this.setStatus('Erreur de lecture du fichier.', 'error')
        this.resetFileInput()
      }
      reader.readAsText(file)
    },

    /**
     * Valide et importe les données JSON d'une rencontre.
     * @param {string} jsonText - Texte JSON brut
     * @returns {{ success: boolean, name?: string, error?: string }}
     */
    validateAndImport(jsonText) {
      let parsed
      try {
        parsed = JSON.parse(jsonText)
      } catch {
        return { success: false, error: 'JSON invalide.' }
      }

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Format de fichier incorrect.' }
      }

      if (!Array.isArray(parsed.adversarySlots)) {
        return { success: false, error: 'Données manquantes : adversarySlots.' }
      }

      const pcCount = Number(parsed.pcCount)
      if (!Number.isFinite(pcCount) || pcCount < 2 || pcCount > 8) {
        return { success: false, error: 'Nombre de PJ invalide (2-8 requis).' }
      }

      const tier = Number(parsed.tier)
      if (!Number.isFinite(tier) || tier < 1 || tier > 4) {
        return { success: false, error: 'Tier invalide (1-4 requis).' }
      }

      this.$emit('import', parsed)
      return { success: true, name: parsed.name || 'Sans nom' }
    },

    /**
     * Copie les données de la rencontre dans le presse-papier.
     */
    async copyToClipboard() {
      try {
        const json = JSON.stringify(this.encounterData, null, 2)
        await navigator.clipboard.writeText(json)
        this.setStatus('Rencontre copiée dans le presse-papier !', 'success')
      } catch {
        this.setStatus('Impossible de copier (navigateur non supporté).', 'error')
      }
    },

    /**
     * Affiche un message de statut temporaire (5 secondes).
     */
    setStatus(message, type = 'info') {
      this.statusMessage = message
      this.statusType = type
      setTimeout(() => {
        this.statusMessage = ''
      }, 5000)
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
.share-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.share-panel__actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.share-panel__import-label {
  cursor: pointer;
}

/* Status messages */
.share-panel__status {
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.share-panel__status--success {
  color: var(--color-accent-success);
  background-color: rgba(76, 175, 80, 0.1);
}

.share-panel__status--error {
  color: var(--color-accent-danger);
  background-color: rgba(244, 67, 54, 0.1);
}

.share-panel__status--info {
  color: var(--color-accent-info);
  background-color: rgba(33, 150, 243, 0.1);
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
