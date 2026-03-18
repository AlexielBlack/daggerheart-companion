<template>
  <ModuleBoundary
    module-name="Table de jeu"
    module-id="session"
  >
    <div class="session-home">
      <!-- Banniere combat actif -->
      <CombatResumeBanner v-if="liveStore.isActive" />

      <!-- En-tete -->
      <header class="session-home__header">
        <div class="session-home__header-left">
          <h1 class="session-home__title">
            <span aria-hidden="true">&#x1F3AE;</span>
            Table de jeu
          </h1>
        </div>
        <div class="session-home__header-right">
          <SessionTimer />
        </div>
      </header>

      <!-- Layout 2 colonnes -->
      <div class="session-home__layout">
        <!-- Colonne principale -->
        <main class="session-home__main">
          <PcGroupPanel :characters="characterStore.characters" />

          <EnvironmentLoader />

          <NpcLoader />

          <!-- Notes de session -->
          <section
            class="session-home__notes"
            aria-label="Notes de session"
          >
            <h3 class="session-home__section-title">
              <span aria-hidden="true">&#x1F4DD;</span> Notes
            </h3>
            <textarea
              :value="sessionStore.sessionNotes"
              class="session-home__notes-input"
              placeholder="Notes de session..."
              rows="4"
              aria-label="Notes de session"
              @input="sessionStore.setSessionNotes($event.target.value)"
            ></textarea>
          </section>
        </main>

        <!-- Sidebar -->
        <aside class="session-home__sidebar">
          <EncounterLauncher />
          <SessionHistoryPanel />
        </aside>
      </div>

      <!-- Bouton reset session -->
      <footer class="session-home__footer">
        <button
          class="session-home__reset btn btn--sm btn--ghost"
          aria-label="Reinitialiser la session"
          @click="handleReset"
        >
          Reinitialiser la session
        </button>
      </footer>
    </div>
  </ModuleBoundary>
</template>

<script>
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import { SessionTimer } from '@modules/encounter'
import { useCharacterStore } from '@modules/characters'
import { useEncounterLiveStore } from '@modules/encounter'
import { useSessionStore } from '../stores/sessionStore'

import PcGroupPanel from '../components/PcGroupPanel.vue'
import CombatResumeBanner from '../components/CombatResumeBanner.vue'
import EnvironmentLoader from '../components/EnvironmentLoader.vue'
import NpcLoader from '../components/NpcLoader.vue'
import EncounterLauncher from '../components/EncounterLauncher.vue'
import SessionHistoryPanel from '../components/SessionHistoryPanel.vue'

/**
 * SessionHome — Vue principale du mode Jeu.
 * Orchestre tous les sous-composants de la table de jeu :
 * groupe de PJ, environnement, PNJs, notes, rencontres et historique.
 */
export default {
  name: 'SessionHome',

  components: {
    ModuleBoundary,
    SessionTimer,
    PcGroupPanel,
    CombatResumeBanner,
    EnvironmentLoader,
    NpcLoader,
    EncounterLauncher,
    SessionHistoryPanel
  },

  setup() {
    const characterStore = useCharacterStore()
    const liveStore = useEncounterLiveStore()
    const sessionStore = useSessionStore()

    /**
     * Reinitialise la session apres confirmation utilisateur.
     * Efface l'environnement, les PNJs charges et les notes.
     */
    function handleReset() {
      if (window.confirm('Reinitialiser la session ? L\'environnement, les PNJs et les notes seront effaces.')) {
        sessionStore.resetSession()
      }
    }

    return { characterStore, liveStore, sessionStore, handleReset }
  }
}
</script>

<style scoped>
.session-home {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.session-home__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.session-home__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text-primary);
}

.session-home__layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-lg);
  align-items: start;
}

.session-home__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.session-home__sidebar {
  position: sticky;
  top: calc(var(--header-height) + var(--space-md));
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Notes */
.session-home__section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
}

.session-home__notes-input {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--font-size-sm);
  resize: vertical;
  min-height: 80px;
}

.session-home__notes-input::placeholder {
  color: var(--color-text-muted);
}

.session-home__notes-input:focus {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: -2px;
}

/* Footer */
.session-home__footer {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.session-home__reset {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.session-home__reset:hover {
  color: var(--color-accent-danger);
}

/* Responsive */
@media (max-width: 1024px) {
  .session-home__layout {
    grid-template-columns: 1fr;
  }

  .session-home__sidebar {
    position: static;
  }
}
</style>
