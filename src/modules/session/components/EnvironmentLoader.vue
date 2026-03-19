<template>
  <section
    class="env-loader"
    aria-label="Environnement de session"
  >
    <h3 class="env-loader__title">
      <span aria-hidden="true">&#x1F30D;</span> Environnement
    </h3>

    <!-- Environnement charge -->
    <div
      v-if="sessionStore.hasEnvironment && currentEnv"
      class="env-loader__current"
    >
      <div class="env-loader__current-header">
        <span
          class="env-loader__tier"
          :class="`tier-badge--${currentEnv.tier}`"
        >
          T{{ currentEnv.tier }}
        </span>
        <span class="env-loader__name">{{ currentEnv.name }}</span>
        <span class="env-loader__type">{{ currentEnv.type }}</span>
      </div>
      <p class="env-loader__desc">
        {{ truncate(currentEnv.description, 120) }}
      </p>

      <!-- Features mecaniques -->
      <div
        v-if="currentEnv.features && currentEnv.features.length > 0"
        class="env-loader__features"
      >
        <div
          v-for="(feat, idx) in currentEnv.features"
          :key="idx"
          class="env-loader__feature"
          :class="'env-loader__feature--' + feat.activationType"
        >
          <div class="env-loader__feature-header">
            <span class="env-loader__feature-type">{{ activationLabel(feat.activationType) }}</span>
            <span class="env-loader__feature-name">{{ feat.name }}</span>
            <span
              v-if="feat.cost && feat.cost.type === 'fear'"
              class="env-loader__feature-cost"
            >{{ feat.cost.amount }} Fear</span>
          </div>
          <p class="env-loader__feature-desc">
            {{ feat.description }}
          </p>
        </div>
      </div>

      <button
        class="env-loader__remove btn btn--sm btn--ghost"
        aria-label="Retirer l'environnement"
        @click="sessionStore.clearEnvironment()"
      >
        &#x2715; Retirer
      </button>
    </div>

    <!-- Selecteur -->
    <details class="env-loader__picker">
      <summary class="env-loader__summary">
        {{ sessionStore.hasEnvironment ? 'Changer d\'environnement' : 'Charger un environnement' }}
      </summary>

      <input
        v-model="search"
        type="text"
        class="env-loader__search"
        placeholder="Chercher un environnement..."
        aria-label="Rechercher un environnement"
      />

      <ul
        class="env-loader__list"
        role="listbox"
        aria-label="Environnements disponibles"
      >
        <li
          v-for="env in filteredEnvironments"
          :key="env.id"
          class="env-loader__item"
          :class="{ 'env-loader__item--selected': sessionStore.environmentId === env.id }"
          role="option"
          tabindex="0"
          :aria-selected="sessionStore.environmentId === env.id ? 'true' : 'false'"
          @click="selectEnv(env.id)"
          @keydown.enter="selectEnv(env.id)"
          @keydown.space.prevent="selectEnv(env.id)"
        >
          <span
            class="env-loader__item-tier"
            :class="`tier-badge--${env.tier}`"
          >
            T{{ env.tier }}
          </span>
          <span class="env-loader__item-name">{{ env.name }}</span>
          <span
            v-if="env.source === 'custom'"
            class="env-loader__item-badge"
          >
            Homebrew
          </span>
        </li>
        <li
          v-if="filteredEnvironments.length === 0"
          class="env-loader__empty"
        >
          Aucun environnement trouve.
        </li>
      </ul>
    </details>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import { useSessionStore } from '../stores/sessionStore'
import { useEnvironmentStore } from '@modules/environments'

/**
 * EnvironmentLoader — Charge un environnement SRD ou homebrew dans la session.
 * Affiche l'environnement actif et permet d'en selectionner un nouveau via recherche.
 */
export default {
  name: 'EnvironmentLoader',

  setup() {
    const sessionStore = useSessionStore()
    const envStore = useEnvironmentStore()
    const search = ref('')

    /** Environnement actuellement charge dans la session */
    const currentEnv = computed(() => sessionStore.loadedEnvironment)

    /**
     * Liste des environnements filtres par la recherche textuelle.
     * Recherche sur le nom et le type.
     */
    const filteredEnvironments = computed(() => {
      let result = envStore.allItems
      if (search.value.trim()) {
        const q = search.value.trim().toLowerCase()
        result = result.filter(e =>
          e.name.toLowerCase().includes(q) ||
          e.type.toLowerCase().includes(q)
        )
      }
      return result
    })

    /**
     * Selectionne ou deselectionne un environnement.
     * @param {string} id — Identifiant de l'environnement
     */
    function selectEnv(id) {
      sessionStore.setEnvironment(sessionStore.environmentId === id ? null : id)
    }

    /**
     * Libelle traduit pour le type d'activation d'une feature.
     * @param {string} type — passive, action ou reaction
     * @returns {string}
     */
    function activationLabel(type) {
      const labels = { passive: 'Passif', action: 'Action', reaction: 'Reaction' }
      return labels[type] || type
    }

    /**
     * Tronque un texte a la longueur maximale indiquee.
     * @param {string} text — Texte a tronquer
     * @param {number} maxLen — Longueur maximale
     * @returns {string}
     */
    function truncate(text, maxLen) {
      if (!text || text.length <= maxLen) return text
      return text.slice(0, maxLen) + '\u2026'
    }

    return { sessionStore, currentEnv, search, filteredEnvironments, selectEnv, truncate, activationLabel }
  }
}
</script>

<style scoped>
.env-loader__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-sm) 0;
}

.env-loader__current {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
}

.env-loader__current-header {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-xs);
}

.env-loader__tier {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.env-loader__name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.env-loader__type {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.env-loader__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-sm);
}

.env-loader__remove {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.env-loader__summary {
  cursor: pointer;
  color: var(--color-accent-hope);
  font-size: var(--font-size-sm);
  padding: var(--space-xs) 0;
}

.env-loader__search {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: var(--space-sm) 0;
}

.env-loader__list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
}

.env-loader__item {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.env-loader__item:hover {
  background: var(--color-bg-elevated);
}

.env-loader__item--selected {
  background: var(--color-bg-surface);
  color: var(--color-accent-hope);
}

.env-loader__item-tier {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.env-loader__item-name {
  font-weight: var(--font-weight-medium);
}

.env-loader__item-badge {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-xs);
  background: var(--color-accent-info);
  color: #fff;
  border-radius: var(--radius-sm);
}

.env-loader__empty {
  padding: var(--space-md);
  color: var(--color-text-muted);
  text-align: center;
  font-size: var(--font-size-sm);
}

.env-loader__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.env-loader__feature {
  border-left: 3px solid var(--color-border);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
}

.env-loader__feature--passive { border-left-color: var(--color-accent-info); }
.env-loader__feature--action { border-left-color: var(--color-accent-warning); }
.env-loader__feature--reaction { border-left-color: var(--color-accent-hope); }

.env-loader__feature-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.env-loader__feature-type {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.env-loader__feature-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.env-loader__feature-cost {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-xs);
  background: color-mix(in srgb, var(--color-accent-fear) 20%, transparent);
  color: var(--color-accent-fear);
  border-radius: var(--radius-sm);
}

.env-loader__feature-desc {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}
</style>
