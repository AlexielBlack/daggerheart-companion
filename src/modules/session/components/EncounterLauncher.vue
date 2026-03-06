<template>
  <section
    class="enc-launcher"
    aria-label="Lancer une rencontre"
  >
    <h3 class="enc-launcher__title">
      <span aria-hidden="true">&#x2694;&#xFE0F;</span> Rencontres
    </h3>

    <!-- Lien vers le constructeur complet -->
    <router-link
      to="/edition/rencontres"
      class="enc-launcher__builder-link"
    >
      &#x1F5FA;&#xFE0F; Ouvrir le constructeur
    </router-link>

    <!-- Rencontres sauvegardees -->
    <details
      v-if="savedEncounters.length > 0"
      class="enc-launcher__section"
      open
    >
      <summary class="enc-launcher__summary">
        Rencontres sauvegardees ({{ savedEncounters.length }})
      </summary>
      <ul class="enc-launcher__list">
        <li
          v-for="enc in savedEncounters"
          :key="enc.id"
          class="enc-launcher__item"
        >
          <div class="enc-launcher__item-info">
            <span class="enc-launcher__item-name">{{ enc.name || 'Sans nom' }}</span>
            <span class="enc-launcher__item-meta">
              T{{ enc.tier }} &middot; {{ enc.pcCount }} PJ{{ enc.pcCount > 1 ? 's' : '' }}
              &middot; {{ totalAdversaries(enc) }} adversaire{{ totalAdversaries(enc) > 1 ? 's' : '' }}
            </span>
          </div>
          <div class="enc-launcher__item-actions">
            <button
              class="btn btn--sm btn--primary"
              :aria-label="`Lancer ${enc.name || 'cette rencontre'}`"
              @click="handleLaunch(enc)"
            >
              &#x1F680; Lancer
            </button>
            <button
              class="btn btn--sm btn--ghost"
              :aria-label="`Modifier ${enc.name || 'cette rencontre'}`"
              @click="handleEdit(enc)"
            >
              &#x270F;&#xFE0F;
            </button>
          </div>
        </li>
      </ul>
    </details>

    <!-- Message si pas de rencontres sauvegardees -->
    <p
      v-if="savedEncounters.length === 0"
      class="enc-launcher__empty"
    >
      Aucune rencontre sauvegardee.
      <router-link to="/edition/rencontres">
        Creer une rencontre
      </router-link>
    </p>

    <!-- Templates -->
    <details class="enc-launcher__section">
      <summary class="enc-launcher__summary">
        Templates rapides
      </summary>
      <EncounterTemplatePicker
        @load-template="handleLaunchTemplate"
      />
    </details>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'
import { useCharacterStore } from '@modules/characters'
import {
  useEncounterStore,
  useEncounterLiveStore,
  EncounterTemplatePicker
} from '@modules/encounter'

/**
 * @component EncounterLauncher
 * @description Panneau de lancement de rencontres depuis la table de jeu.
 * Affiche les rencontres sauvegardees et les templates rapides.
 * Injecte le contexte de session (environnement, PCs) avant le lancement.
 */
export default {
  name: 'EncounterLauncher',

  components: {
    EncounterTemplatePicker
  },

  setup() {
    const router = useRouter()
    const sessionStore = useSessionStore()
    const characterStore = useCharacterStore()
    const encounterStore = useEncounterStore()
    const liveStore = useEncounterLiveStore()

    // Liste des rencontres sauvegardees
    const savedEncounters = computed(() => encounterStore.savedEncountersList)

    /**
     * Calcule le nombre total d'adversaires dans une rencontre.
     * @param {Object} enc - Donnees de rencontre serializees
     * @returns {number}
     */
    function totalAdversaries(enc) {
      if (!enc.adversarySlots) return 0
      return enc.adversarySlots.reduce((sum, s) => sum + (s.quantity || 1), 0)
    }

    /**
     * Enrichit les donnees de la rencontre avec le contexte de session actif.
     * Injecte l'environnement et les PCs si absents des donnees source.
     * @param {Object} data - Donnees de rencontre
     * @returns {Object} Donnees enrichies
     */
    function enrichWithSessionContext(data) {
      const enriched = { ...data }
      // Injecter l'environnement de session si absent
      if (sessionStore.environmentId && !enriched.environmentId) {
        enriched.environmentId = sessionStore.environmentId
      }
      // Injecter les PCs si absents
      if (
        (!enriched.selectedPcIds || enriched.selectedPcIds.length === 0) &&
        characterStore.characters.length > 0
      ) {
        enriched.selectedPcIds = characterStore.characters.map(c => c.id)
      }
      return enriched
    }

    /**
     * Lance une rencontre sauvegardee avec injection du contexte de session.
     * @param {Object} encounterData - Donnees de la rencontre sauvegardee
     */
    function handleLaunch(encounterData) {
      const enriched = enrichWithSessionContext(encounterData)
      liveStore.startEncounter(enriched)
      sessionStore.lastLaunchedEncounterId = encounterData.id || null
      router.push('/jeu/combat')
    }

    /**
     * Lance une rencontre depuis un template avec injection du contexte de session.
     * @param {Object} templateData - Donnees du template selectionne
     */
    function handleLaunchTemplate(templateData) {
      const enriched = enrichWithSessionContext(templateData)
      liveStore.startEncounter(enriched)
      router.push('/jeu/combat')
    }

    /**
     * Ouvre le constructeur avec la rencontre chargee pour modification.
     * @param {Object} enc - Donnees de la rencontre a modifier
     */
    function handleEdit(enc) {
      encounterStore.loadEncounter(enc)
      router.push('/edition/rencontres')
    }

    return {
      savedEncounters,
      totalAdversaries,
      handleLaunch,
      handleLaunchTemplate,
      handleEdit
    }
  }
}
</script>

<style scoped>
.enc-launcher__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
}

.enc-launcher__builder-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-accent-hope);
  text-decoration: none;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-md);
  padding: var(--space-xs) 0;
}

.enc-launcher__builder-link:hover {
  text-decoration: underline;
}

.enc-launcher__summary {
  cursor: pointer;
  color: var(--color-accent-hope);
  font-size: var(--font-size-sm);
  padding: var(--space-xs) 0;
  font-weight: var(--font-weight-medium);
}

.enc-launcher__list {
  list-style: none;
  padding: 0;
  margin: var(--space-sm) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.enc-launcher__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.enc-launcher__item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.enc-launcher__item-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.enc-launcher__item-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.enc-launcher__item-actions {
  display: flex;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.enc-launcher__empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-sm) 0;
}

.btn--sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
}

.btn--primary {
  background: var(--color-accent-hope);
  color: #fff;
  border: none;
  cursor: pointer;
}

.btn--primary:hover {
  filter: brightness(1.1);
}

.btn--ghost {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.btn--ghost:hover {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .enc-launcher__item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
