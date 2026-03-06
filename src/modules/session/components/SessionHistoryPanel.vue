<template>
  <section
    class="history-panel"
    aria-label="Historique des rencontres"
  >
    <details class="history-panel__details">
      <summary class="history-panel__summary">
        <span aria-hidden="true">&#x1F4DC;</span>
        Historique ({{ historyStore.all.length }})
      </summary>
      <EncounterHistory
        :entries="historyStore.all"
        :stats="historyStore.stats"
        @remove="historyStore.remove($event)"
        @clear="historyStore.clear()"
      />
    </details>
  </section>
</template>

<script>
import {
  useEncounterHistoryStore,
  EncounterHistory
} from '@modules/encounter'

/**
 * @component SessionHistoryPanel
 * @description Wrapper leger autour de EncounterHistory pour la vue session.
 * Delegue tout le rendu au composant EncounterHistory du module encounter.
 */
export default {
  name: 'SessionHistoryPanel',

  components: {
    EncounterHistory
  },

  setup() {
    const historyStore = useEncounterHistoryStore()
    return { historyStore }
  }
}
</script>

<style scoped>
.history-panel__summary {
  cursor: pointer;
  color: var(--color-accent-hope);
  font-size: var(--font-size-sm);
  padding: var(--space-xs) 0;
  font-weight: var(--font-weight-medium);
}
</style>
