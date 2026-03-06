<template>
  <section
    class="sync-panel"
    aria-labelledby="gist-sync-heading"
  >
    <h2
      id="gist-sync-heading"
      class="sync-panel__title"
    >
      🔗 Synchronisation GitHub Gist
    </h2>
    <p class="sync-panel__description">
      Synchronisez vos données via un Gist GitHub privé.
      Nécessite un
      <a
        href="https://github.com/settings/tokens/new?scopes=gist&description=Daggerheart+Companion"
        target="_blank"
        rel="noopener noreferrer"
        class="sync-panel__link"
      >Personal Access Token</a>
      avec le scope <code>gist</code>.
    </p>

    <!-- Configuration (non connecté) -->
    <div
      v-if="!connected"
      class="sync-panel__config"
    >
      <div class="sync-panel__field">
        <label
          for="gist-token-input"
          class="sync-panel__label"
        >
          Token GitHub
        </label>
        <div class="sync-panel__input-group">
          <input
            id="gist-token-input"
            v-model="tokenInput"
            :type="showToken ? 'text' : 'password'"
            class="sync-panel__input"
            placeholder="ghp_xxxxxxxxxxxx"
            autocomplete="off"
            aria-describedby="gist-token-hint"
          />
          <button
            class="sync-btn sync-btn--icon"
            :aria-label="showToken ? 'Masquer le token' : 'Afficher le token'"
            @click="showToken = !showToken"
          >
            {{ showToken ? '🙈' : '👁️' }}
          </button>
        </div>
        <small
          id="gist-token-hint"
          class="sync-panel__hint"
        >
          Scope requis : <code>gist</code>. Le token reste dans votre navigateur.
        </small>
      </div>

      <div class="sync-panel__field">
        <label
          for="gist-id-input"
          class="sync-panel__label"
        >
          ID du Gist (optionnel)
        </label>
        <input
          id="gist-id-input"
          v-model="gistIdInput"
          type="text"
          class="sync-panel__input"
          placeholder="Laisser vide pour créer automatiquement"
          aria-describedby="gist-id-hint"
        />
        <small
          id="gist-id-hint"
          class="sync-panel__hint"
        >
          Renseignez l'ID d'un Gist existant pour le réutiliser, ou laissez vide.
        </small>
      </div>

      <button
        class="sync-btn sync-btn--primary"
        :disabled="!tokenInput.trim() || validating"
        @click="handleConnect"
      >
        <span aria-hidden="true">🔑</span>
        {{ validating ? 'Vérification…' : 'Connecter' }}
      </button>
    </div>

    <!-- Actions (connecté) -->
    <div
      v-else
      class="sync-panel__actions"
    >
      <div class="sync-panel__status-bar">
        <span class="sync-panel__status-dot sync-panel__status-dot--connected"></span>
        <span class="sync-panel__status-text">
          Connecté{{ username ? ` (${username})` : '' }}
        </span>
        <button
          class="sync-btn sync-btn--ghost sync-btn--sm"
          @click="handleDisconnect"
        >
          Déconnecter
        </button>
      </div>

      <!-- Info distante -->
      <div
        v-if="gistSync.remoteInfo.value"
        class="sync-panel__remote-info"
      >
        <p class="sync-panel__remote-text">
          Dernière mise à jour distante :
          <strong>{{ formatDate(gistSync.remoteInfo.value.syncDate || gistSync.remoteInfo.value.updatedAt) }}</strong>
        </p>
      </div>

      <div class="sync-panel__btn-group">
        <button
          class="sync-btn sync-btn--primary"
          :disabled="syncing"
          @click="handlePush"
        >
          <span aria-hidden="true">⬆️</span>
          {{ gistSync.status.value === 'pushing' ? 'Envoi…' : 'Envoyer (push)' }}
        </button>

        <button
          class="sync-btn sync-btn--secondary"
          :disabled="syncing"
          @click="handlePull"
        >
          <span aria-hidden="true">⬇️</span>
          {{ gistSync.status.value === 'pulling' ? 'Réception…' : 'Recevoir (pull)' }}
        </button>

        <button
          class="sync-btn sync-btn--ghost"
          :disabled="syncing"
          @click="handleRefreshInfo"
        >
          <span aria-hidden="true">🔄</span>
          Vérifier
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
import { ref, computed } from 'vue'
import { useConfirmDialog } from '@core/composables/useConfirmDialog.js'
import { useGistSync } from '../composables/useGistSync.js'
import { useSyncStore } from '../stores/syncStore.js'

export default {
  name: 'GistSyncPanel',

  setup() {
    const gistSync = useGistSync()
    const syncStore = useSyncStore()

    const tokenInput = ref('')
    const gistIdInput = ref('')
    const showToken = ref(false)
    const validating = ref(false)
    const connected = ref(!!(gistSync.getToken() && gistSync.getGistId()))
    const username = ref(null)
    const { confirm } = useConfirmDialog()
    const feedback = ref(null)

    const syncing = computed(() =>
      gistSync.status.value === 'pushing' || gistSync.status.value === 'pulling'
    )

    function showFeedback(type, message) {
      feedback.value = { type, message }
      setTimeout(() => { feedback.value = null }, 5000)
    }

    function formatDate(iso) {
      if (!iso) return '—'
      try {
        return new Date(iso).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return iso
      }
    }

    async function handleConnect() {
      const token = tokenInput.value.trim()
      if (!token) return

      validating.value = true
      const result = await gistSync.validateToken(token)
      validating.value = false

      if (!result.valid) {
        showFeedback('error', result.error)
        return
      }

      username.value = result.username
      gistSync.setToken(token)

      // Si un ID de gist est fourni, on l'utilise
      const gistId = gistIdInput.value.trim()
      if (gistId) {
        gistSync.setGistId(gistId)
      }

      // Si pas de gist ID, on en crée un au premier push
      connected.value = true
      tokenInput.value = ''
      gistIdInput.value = ''

      // Charger les infos distantes si on a un gist ID
      if (gistSync.getGistId()) {
        await gistSync.fetchRemoteInfo()
      }

      showFeedback('success', `Connecté en tant que ${result.username}.`)
    }

    function handleDisconnect() {
      gistSync.disconnect()
      connected.value = false
      username.value = null
      showFeedback('success', 'Déconnecté.')
    }

    async function handlePush() {
      const result = await gistSync.push()

      syncStore.addHistoryEntry({
        type: 'push',
        method: 'gist',
        date: new Date().toISOString(),
        success: result.success
      })

      if (result.success) {
        showFeedback('success', 'Données envoyées vers GitHub !')
        await gistSync.fetchRemoteInfo()
      } else {
        showFeedback('error', result.error)
      }
    }

    async function handlePull() {
      const ok = await confirm({
        title: '⚠️ Confirmer la réception',
        message: 'Vos données locales seront remplacées par celles du Gist distant. Cette action est irréversible.',
        confirmLabel: 'Confirmer'
      })
      if (!ok) return

      const result = await gistSync.pull()

      syncStore.addHistoryEntry({
        type: 'pull',
        method: 'gist',
        date: new Date().toISOString(),
        success: result.success
      })

      if (result.success) {
        showFeedback('success', 'Données reçues ! Rechargez la page pour voir les changements.')
      } else {
        showFeedback('error', result.error)
      }
    }

    async function handleRefreshInfo() {
      const result = await gistSync.fetchRemoteInfo()
      if (result.success) {
        showFeedback('success', 'Informations distantes mises à jour.')
      } else {
        showFeedback('error', result.error)
      }
    }

    // Charger les infos au montage si connecté
    if (connected.value) {
      gistSync.fetchRemoteInfo()
    }

    return {
      gistSync,
      tokenInput,
      gistIdInput,
      showToken,
      validating,
      connected,
      username,
      syncing,
      feedback,
      formatDate,
      handleConnect,
      handleDisconnect,
      handlePush,
      handlePull,
      handleRefreshInfo
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

.sync-panel__link {
  color: var(--color-accent-hope);
  text-decoration: underline;
}

.sync-panel__link:hover {
  color: #468f9a;
}

.sync-panel__config {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sync-panel__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.sync-panel__label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.sync-panel__input-group {
  display: flex;
  gap: var(--space-xs);
}

.sync-panel__input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-family: inherit;
}

.sync-panel__input::placeholder {
  color: var(--color-text-muted);
}

.sync-panel__input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.25);
}

.sync-panel__hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.sync-panel__hint code {
  background-color: var(--color-bg-elevated);
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  font-size: inherit;
}

.sync-panel__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sync-panel__status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-md);
}

.sync-panel__status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.sync-panel__status-dot--connected {
  background-color: var(--color-accent-success);
}

.sync-panel__status-text {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  flex: 1;
}

.sync-panel__remote-info {
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-md);
}

.sync-panel__remote-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.sync-panel__btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.sync-panel__confirm {
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-accent-warning);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-top: var(--space-md);
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

/* Boutons sync */
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

.sync-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn--secondary {
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.sync-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-bg-elevated);
}

.sync-btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.sync-btn--ghost:hover:not(:disabled) {
  background-color: var(--color-bg-elevated);
}

.sync-btn--ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sync-btn--sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
  margin-left: auto;
}

.sync-btn--icon {
  padding: var(--space-sm);
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-md);
}

.sync-btn--icon:hover {
  background-color: var(--color-bg-elevated);
}
</style>
