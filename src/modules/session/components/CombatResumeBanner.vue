<template>
  <div
    class="combat-banner"
    role="alert"
    aria-live="polite"
  >
    <div class="combat-banner__info">
      <span
        class="combat-banner__icon"
        aria-hidden="true"
      >
        &#x2694;&#xFE0F;
      </span>
      <span class="combat-banner__text">
        <strong>Combat en cours :</strong>
        {{ liveStore.encounterName || 'Rencontre' }}
        — T{{ liveStore.encounterTier }}
        · {{ activeCount }} adversaire{{ activeCount > 1 ? 's' : '' }}
        actif{{ activeCount > 1 ? 's' : '' }}
      </span>
    </div>
    <router-link
      to="/jeu/combat"
      class="combat-banner__resume btn btn--primary"
      aria-label="Reprendre le combat en cours"
    >
      Reprendre le combat
    </router-link>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useEncounterLiveStore } from '@modules/encounter'

/**
 * CombatResumeBanner — Bandeau affiche quand un combat est actif.
 * Permet de reprendre rapidement le combat en cours depuis la page de session.
 */
export default {
  name: 'CombatResumeBanner',

  setup() {
    const liveStore = useEncounterLiveStore()

    /** Nombre d'adversaires actifs (non vaincus) */
    const activeCount = computed(() => liveStore.activeAdversaries?.length || 0)

    return { liveStore, activeCount }
  }
}
</script>

<style scoped>
.combat-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid var(--color-accent-danger);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.combat-banner__info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
}

.combat-banner__icon {
  font-size: 1.5rem;
}

.combat-banner__text {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.combat-banner__resume {
  flex-shrink: 0;
  white-space: nowrap;
}

/* Responsif : empilage vertical sur mobile */
@media (max-width: 768px) {
  .combat-banner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
