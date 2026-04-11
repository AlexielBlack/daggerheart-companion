<template>
  <div class="cdash">
    <!-- Bouton toggle pour ouvrir/fermer le tableau de combat -->
    <button
      type="button"
      class="cdash__toggle"
      :aria-expanded="String(isOpen)"
      aria-controls="combat-dashboard-panel"
      aria-label="Tableau de combat"
      @click="isOpen = !isOpen"
    >
      📊
    </button>

    <!-- Panneau flottant (teleporte dans body pour le positionnement fixe) -->
    <Teleport to="body">
      <Transition name="cdash-slide">
        <div
          v-if="isOpen"
          id="combat-dashboard-panel"
          class="cdash__panel"
          role="dialog"
          aria-label="Tableau de combat"
          aria-modal="true"
        >
          <!-- En-tete avec titre et bouton fermer -->
          <div class="cdash__header">
            <h2 class="cdash__title">
              📊 Tableau de combat
            </h2>
            <button
              type="button"
              class="cdash__close"
              aria-label="Fermer le tableau de combat"
              @click="isOpen = false"
            >
              ✕
            </button>
          </div>

          <!-- Corps du panneau : tracker Fear/Hope + vue d'ensemble -->
          <div class="cdash__body">
            <BattlefieldOverview
              :pcs="store.participantPcs"
              :pc-down-status="store.pcDownStatus"
              :pc-conditions="store.pcConditions"
              :groups="store.groupedAdversaries"
              :stats="{
                hitCount: liveStats.hitCount.value,
                missCount: liveStats.missCount.value,
                hitRatio: liveStats.hitRatio.value,
                totalDamageDealt: liveStats.totalDamageDealt.value,
                totalStressDealt: liveStats.totalStressDealt.value,
                pcHitCount: liveStats.pcHitCount.value
              }"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import BattlefieldOverview from './BattlefieldOverview.vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useLiveStats } from '../composables/useLiveStats'

/**
 * @component CombatDashboard
 * @description Panneau flottant lateral gauche assemblant le tracker Fear/Hope
 * et la vue d'ensemble du champ de bataille. Pattern identique a QuickReferencePanel
 * mais positionne cote gauche avec slide-in depuis la gauche.
 * Orchestre les composables useFearHope et useLiveStats en interne.
 */
export default {
  name: 'CombatDashboard',

  components: { BattlefieldOverview },

  setup() {
    const store = useEncounterLiveStore()
    const liveStats = useLiveStats(store)
    return { store, liveStats }
  },

  data() {
    return {
      /** Indique si le panneau est ouvert */
      isOpen: false
    }
  },

  watch: {
    // Ajoute/retire le listener Escape selon l'etat du panneau
    isOpen(val) {
      if (val) {
        document.addEventListener('keydown', this.onEscape)
      } else {
        document.removeEventListener('keydown', this.onEscape)
      }
    }
  },

  beforeUnmount() {
    // Nettoyage du listener clavier si le composant est detruit
    document.removeEventListener('keydown', this.onEscape)
  },

  methods: {
    /**
     * Ferme le panneau lorsque la touche Escape est pressee.
     * @param {KeyboardEvent} e
     */
    onEscape(e) {
      if (e.key === 'Escape') {
        this.isOpen = false
      }
    },

  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   CombatDashboard — panneau flottant cote GAUCHE
   Pattern identique a QuickReferencePanel mais miroir horizontal
   ═══════════════════════════════════════════════════════════ */

/* ── Bouton toggle ── */

.cdash__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.cdash__toggle:hover {
  background: rgba(255, 255, 255, 0.12);
}

.cdash__toggle[aria-expanded="true"] {
  background: var(--color-accent-hope, #53a8b6);
  color: var(--color-bg-primary, #1a1a2e);
}

/* ── Panneau flottant (cote gauche, ombre vers la droite) ── */

.cdash__panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 380px;
  max-width: 90vw;
  height: 100vh;
  background: var(--color-bg-primary, #1a1a2e);
  border-right: 1px solid var(--color-border, #3a3a5a);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── En-tete ── */

.cdash__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border, #3a3a5a);
  flex-shrink: 0;
}

.cdash__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: var(--color-text-primary);
  margin: 0;
}

/* ── Bouton fermer ── */

.cdash__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
}

.cdash__close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

/* ── Corps du panneau ── */

.cdash__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
}

/* ── Transition slide-in depuis la GAUCHE ── */

.cdash-slide-enter-active,
.cdash-slide-leave-active {
  transition: transform 0.2s ease;
}

.cdash-slide-enter-from,
.cdash-slide-leave-to {
  transform: translateX(-100%);
}
</style>
