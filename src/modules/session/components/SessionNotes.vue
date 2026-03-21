<template>
  <section
    class="session-notes"
    :class="{ 'session-notes--expanded': expanded }"
  >
    <div class="session-notes__header">
      <label
        :for="textareaId"
        class="session-notes__label"
      >
        Notes de scene
      </label>
      <span
        v-if="isSaving"
        class="session-notes__saving"
        aria-live="polite"
      >Sauvegarde...</span>
      <div class="session-notes__header-actions">
        <button
          class="session-notes__add-btn"
          aria-label="Ajouter une entree horodatee"
          @click="showEntryInput = true"
        >
          + Entree
        </button>
        <button
          :aria-label="expanded ? 'Reduire les notes' : 'Agrandir les notes'"
          :aria-expanded="expanded"
          class="session-notes__toggle"
          @click="expanded = !expanded"
        >
          {{ expanded ? '\u25BC' : '\u25B6' }}
        </button>
      </div>
    </div>

    <!-- Input inline pour nouvelle entree -->
    <div
      v-if="showEntryInput"
      class="session-notes__new-entry"
    >
      <input
        ref="entryInputRef"
        v-model="newEntryText"
        type="text"
        class="session-notes__entry-input"
        placeholder="Nouvelle note..."
        aria-label="Texte de la nouvelle entree"
        @keydown.enter="submitEntry"
        @keydown.escape="cancelEntry"
      />
      <button
        class="session-notes__entry-submit"
        aria-label="Valider l entree"
        :disabled="!newEntryText.trim()"
        @click="submitEntry"
      >
        &#x2713;
      </button>
      <button
        class="session-notes__entry-cancel"
        aria-label="Annuler"
        @click="cancelEntry"
      >
        &#x2715;
      </button>
    </div>

    <!-- Entrees horodatees -->
    <ul
      v-if="sessionStore.noteEntries && sessionStore.noteEntries.length > 0"
      class="session-notes__entries"
      aria-label="Entrees de session"
    >
      <li
        v-for="entry in sessionStore.noteEntries"
        :key="entry.id"
        class="session-notes__entry"
      >
        <span class="session-notes__entry-time">{{ entry.timestamp }}</span>
        <span
          v-if="entry.tag"
          class="session-notes__entry-tag"
        >{{ entry.tag }}</span>
        <span class="session-notes__entry-text">{{ entry.text }}</span>
        <button
          class="session-notes__entry-remove"
          :aria-label="'Supprimer l entree : ' + entry.text"
          @click="sessionStore.removeNoteEntry(entry.id)"
        >
          &#x2715;
        </button>
      </li>
    </ul>

    <!-- Zone de texte libre (EXISTANTE — ne pas modifier la structure) -->
    <textarea
      :id="textareaId"
      :value="localNotes"
      class="session-notes__textarea"
      placeholder="Quêtes, secrets, rappels..."
      @input="onInput"
      @blur="flushNotes"
    ></textarea>
  </section>
</template>

<script>
import { ref, nextTick, watch } from 'vue'
import { useSessionStore } from '../stores/sessionStore'
import { useSaveIndicator } from '../composables/useSaveIndicator'

export default {
  name: 'SessionNotes',
  setup() {
    const sessionStore = useSessionStore()
    const { isSaving, markDirty, markSaved } = useSaveIndicator()
    const expanded = ref(false)
    const textareaId = `session-notes-${Math.random().toString(36).slice(2, 8)}`
    let debounceTimer = null

    // Ref locale pour éviter le reset du curseur
    const localNotes = ref(sessionStore.sessionNotes || '')

    // Synchronise depuis le store si la valeur change en dehors du champ
    watch(() => sessionStore.sessionNotes, (v) => {
      if (!debounceTimer) localNotes.value = v || ''
    })

    // ── Entrees structurees ──
    const showEntryInput = ref(false)
    const newEntryText = ref('')
    const entryInputRef = ref(null)

    watch(showEntryInput, (val) => {
      if (val) {
        nextTick(() => {
          if (entryInputRef.value) entryInputRef.value.focus()
        })
      }
    })

    function submitEntry() {
      if (newEntryText.value.trim()) {
        sessionStore.addNoteEntry(newEntryText.value.trim())
        newEntryText.value = ''
        showEntryInput.value = false
      }
    }

    function cancelEntry() {
      newEntryText.value = ''
      showEntryInput.value = false
    }

    function onInput(event) {
      markDirty()
      const text = event.target.value
      localNotes.value = text
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        sessionStore.setSessionNotes(text)
        markSaved()
        debounceTimer = null
      }, 500)
    }

    function flushNotes() {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
        sessionStore.setSessionNotes(localNotes.value)
        markSaved()
      }
    }

    return {
      sessionStore,
      isSaving,
      expanded,
      textareaId,
      localNotes,
      onInput,
      flushNotes,
      showEntryInput,
      newEntryText,
      entryInputRef,
      submitEntry,
      cancelEntry
    }
  }
}
</script>

<style scoped>
.session-notes__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs, 0.25rem);
}

.session-notes__label {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
  color: var(--color-text-secondary, #aaa);
}

.session-notes__toggle {
  background: none;
  border: none;
  color: var(--color-text-secondary, #aaa);
  cursor: pointer;
  padding: var(--space-xs, 0.25rem);
  font-size: 0.9em;
}

.session-notes__textarea {
  width: 100%;
  min-height: 4lh;
  max-height: none;
  resize: vertical;
  background: var(--color-surface, #1a1a2e);
  color: var(--color-text, #fff);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-sm, 0.5rem);
  font-family: inherit;
  font-size: 0.9em;
  transition: min-height var(--transition-fast, 0.15s);
}

.session-notes--expanded .session-notes__textarea {
  min-height: 40vh;
}

.session-notes__header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.session-notes__add-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-accent-hope);
  cursor: pointer;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  transition: background var(--transition-fast);
}

.session-notes__add-btn:hover {
  background: var(--color-bg-hover);
}

.session-notes__new-entry {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
}

.session-notes__entry-input {
  flex: 1;
  background: var(--color-bg-input, #1e2a4a);
  color: var(--color-text-primary);
  border: 1px solid var(--color-accent-hope);
  border-radius: var(--radius-sm);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
  font-family: inherit;
  outline: none;
}

.session-notes__entry-input:focus {
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.3);
}

.session-notes__entry-submit,
.session-notes__entry-cancel {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  min-width: 2rem;
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.session-notes__entry-submit:hover:not(:disabled) {
  color: var(--color-accent-success);
  border-color: var(--color-accent-success);
}

.session-notes__entry-submit:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.session-notes__entry-cancel:hover {
  color: var(--color-accent-danger);
  border-color: var(--color-accent-danger);
}

.session-notes__entries {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-notes__entry {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
}

.session-notes__entry-time {
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
  flex-shrink: 0;
}

.session-notes__entry-tag {
  color: var(--color-accent-gold);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
  padding: 0 var(--space-xs);
  border-radius: var(--radius-sm);
  background: rgba(224, 165, 38, 0.15);
  flex-shrink: 0;
}

.session-notes__entry-text {
  color: var(--color-text-primary);
  flex: 1;
  min-width: 0;
}

.session-notes__entry-remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  font-size: 0.7em;
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.session-notes__entry-remove:hover {
  opacity: 1;
  color: var(--color-accent-danger);
}

.session-notes__saving {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
  animation: notes-pulse 1s infinite;
}

@keyframes notes-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
