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
      <button
        :aria-label="expanded ? 'Reduire les notes' : 'Agrandir les notes'"
        :aria-expanded="expanded"
        class="session-notes__toggle"
        @click="expanded = !expanded"
      >
        {{ expanded ? '\u25BC' : '\u25B6' }}
      </button>
    </div>
    <textarea
      :id="textareaId"
      :value="sessionStore.sessionNotes"
      class="session-notes__textarea"
      placeholder="Quêtes, secrets, rappels..."
      @input="onInput"
    ></textarea>
  </section>
</template>

<script>
import { ref } from 'vue'
import { useSessionStore } from '../stores/sessionStore'

export default {
  name: 'SessionNotes',
  setup() {
    const sessionStore = useSessionStore()
    const expanded = ref(false)
    const textareaId = `session-notes-${Math.random().toString(36).slice(2, 8)}`
    let debounceTimer = null

    function onInput(event) {
      clearTimeout(debounceTimer)
      const text = event.target.value
      debounceTimer = setTimeout(() => {
        sessionStore.setSessionNotes(text)
      }, 500)
    }

    return { sessionStore, expanded, textareaId, onInput }
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
  max-height: 4lh;
  resize: none;
  background: var(--color-surface, #1a1a2e);
  color: var(--color-text, #fff);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-sm, 0.5rem);
  font-family: inherit;
  font-size: 0.9em;
  transition: max-height var(--transition-fast, 0.15s);
}

.session-notes--expanded .session-notes__textarea {
  min-height: 12lh;
  max-height: 12lh;
}
</style>
