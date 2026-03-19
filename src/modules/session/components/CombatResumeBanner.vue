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
        <strong>Combat sauvegarde disponible</strong>
      </span>
    </div>
    <button
      class="combat-banner__resume btn btn--primary"
      aria-label="Reprendre le combat en cours"
      @click="onResume"
    >
      Reprendre le combat
    </button>
  </div>
</template>

<script>
import { useEncounterLiveStore } from '@modules/encounter'
import { useRoute, useRouter } from 'vue-router'

/**
 * CombatResumeBanner — Bandeau affiché quand un combat sauvegardé peut être restauré.
 * Sur l'onglet combat, appelle restoreState(). Sur les autres onglets, navigue vers /table/combat.
 */
export default {
  name: 'CombatResumeBanner',

  setup() {
    const liveStore = useEncounterLiveStore()
    const route = useRoute()
    const router = useRouter()

    function onResume() {
      if (route.path === '/table/combat') {
        liveStore.restoreState()
      } else {
        router.push('/table/combat')
      }
    }

    return { liveStore, onResume }
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
