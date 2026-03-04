<template>
  <div class="enc-live">
    <!-- Message si aucune rencontre active -->
    <div
      v-if="!store.isActive"
      class="enc-live__inactive"
    >
      <p>Aucune rencontre en cours.</p>
      <button
        class="enc-live__go-builder"
        @click="$router.push('/encounters')"
      >
        Retour au builder de rencontres
      </button>
    </div>

    <template v-else>
      <!-- ── Barre supérieure : titre + contrôles de session ── -->
      <header class="enc-live__header">
        <div class="enc-live__title-row">
          <h1 class="enc-live__title">
            {{ store.encounterName || 'Rencontre' }}
          </h1>
          <span class="enc-live__tier">Tier {{ store.encounterTier }}</span>
        </div>

        <div class="enc-live__controls">
          <!-- Mode de scène (intégré dans le header) -->
          <SceneModeSelector
            :model-value="store.sceneMode"
            @update:model-value="store.setSceneMode($event)"
          />

          <div class="enc-live__session">
            <SpotlightToggle
              :spotlight="store.spotlight"
              @toggle="store.toggleSpotlight()"
            />

            <div class="enc-live__round-controls">
              <button
                class="enc-live__round-btn"
                :disabled="store.round <= 1"
                aria-label="Round précédent"
                @click="store.previousRound()"
              >
                ◀
              </button>
              <span class="enc-live__round-label">R{{ store.round }}</span>
              <button
                class="enc-live__round-btn"
                aria-label="Round suivant"
                @click="store.nextRound()"
              >
                ▶
              </button>
            </div>

            <button
              class="enc-live__end-btn"
              @click="confirmEndEncounter"
            >
              Fin
            </button>
          </div>
        </div>
      </header>

      <!-- ── Fear / Hope Tracker ── -->
      <FearHopeTracker
        :fear="store.fear"
        :hope="store.hope"
        :round="store.round"
        :history="store.fearHopeHistory"
        :show-history="showHistory"
        @add-fear="store.addFear($event)"
        @spend-fear="store.spendFear($event)"
        @add-hope="store.addHope($event)"
        @spend-hope="store.spendHope($event)"
      />
      <button
        class="enc-live__toggle-history"
        @click="showHistory = !showHistory"
      >
        {{ showHistory ? 'Masquer' : 'Afficher' }} l'historique
      </button>

      <!-- ── Sélecteurs fusionnés ── -->
      <div class="enc-live__selectors">
        <!-- PJ + Projecteur (fusionné) -->
        <PcSpotlightBar
          :pcs="store.participantPcs"
          :active-pc-id="store.activePcId"
          :spotlight="store.spotlight"
          :spotlight-tokens="store.spotlightTokens"
          :total-tokens="store.totalSpotlightTokens"
          @give-spotlight="store.giveSpotlight($event)"
          @remove-token="store.removeSpotlightToken($event)"
          @gm-spotlight="store.setGmSpotlight()"
        />

        <!-- Adversaire cible -->
        <div class="enc-live__adv-bar">
          <span class="enc-live__adv-label">
            Cible
            <span class="enc-live__adv-count">({{ store.activeAdversaries.length }})</span>
          </span>
          <div class="enc-live__adv-chips">
            <button
              v-for="adv in store.liveAdversaries"
              :key="adv.instanceId"
              class="enc-live__adv-chip"
              :class="{
                'enc-live__adv-chip--active': store.activeAdversaryId === adv.instanceId,
                'enc-live__adv-chip--defeated': adv.isDefeated
              }"
              @click="store.setActiveAdversary(adv.instanceId)"
            >
              <span class="enc-live__adv-name">{{ adv.name }}</span>
              <span
                v-if="adv.isDefeated"
                class="enc-live__adv-defeated"
              >💀</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Battlefield — panels contextuels ── -->
      <div
        class="enc-live__battlefield"
        :class="'enc-live__battlefield--' + store.sceneMode"
      >
        <PcLivePanel
          v-if="store.activePc"
          :pc="store.activePc"
          :is-actor="isPcActor"
          :scene-mode="store.sceneMode"
          :primary-features="pcPrimary"
          :secondary-features="pcSecondary"
          :passive-features="pcPassive"
          :reaction-features="pcReaction"
          :class="{ 'enc-live__panel--first': isPcActor, 'enc-live__panel--second': !isPcActor }"
        />

        <AdversaryTargetPanel
          v-if="store.activeAdversary && !isTraversalMode"
          :adversary="store.activeAdversary"
          :scene-mode="store.sceneMode"
          :is-actor="!isPcActor"
          :pcs="store.participantPcs"
          :class="{ 'enc-live__panel--first': !isPcActor, 'enc-live__panel--second': isPcActor }"
        />

        <!-- En mode Traversal : environnement à droite au lieu de l'adversaire -->
        <EnvironmentPanel
          v-if="store.activeEnvironment && isTraversalMode"
          :environment="store.activeEnvironment"
          class="enc-live__panel--second"
        />
      </div>

      <!-- ── Résumé combat ── -->
      <div
        v-if="store.adversaryCombatSummary.count > 0"
        class="enc-live__summary"
      >
        <span>{{ store.adversaryCombatSummary.count }} actifs</span>
        <span class="enc-live__summary-sep">·</span>
        <span>HP {{ store.adversaryCombatSummary.markedHP }}/{{ store.adversaryCombatSummary.totalHP }}</span>
        <span class="enc-live__summary-sep">·</span>
        <span>ST {{ store.adversaryCombatSummary.markedStress }}/{{ store.adversaryCombatSummary.totalStress }}</span>
        <span class="enc-live__summary-sep">·</span>
        <span>{{ store.defeatedAdversaries.length }} 💀</span>
      </div>

      <!-- ── Environnement (compact hors mode Traversal) ── -->
      <EnvironmentPanel
        v-if="store.activeEnvironment && !isTraversalMode"
        :environment="store.activeEnvironment"
      />
    </template>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useEncounterFeatures } from '../composables/useEncounterFeatures'
import { SCENE_MODE_META } from '@data/encounters/liveConstants'
import FearHopeTracker from '../components/FearHopeTracker.vue'
import SceneModeSelector from '../components/SceneModeSelector.vue'
import SpotlightToggle from '../components/SpotlightToggle.vue'
import PcLivePanel from '../components/PcLivePanel.vue'
import PcSpotlightBar from '../components/PcSpotlightBar.vue'
import AdversaryTargetPanel from '../components/AdversaryTargetPanel.vue'
import EnvironmentPanel from '../components/EnvironmentPanel.vue'

export default {
  name: 'EncounterLive',
  components: {
    FearHopeTracker,
    SceneModeSelector,
    SpotlightToggle,
    PcLivePanel,
    PcSpotlightBar,
    AdversaryTargetPanel,
    EnvironmentPanel
  },
  setup() {
    const store = useEncounterLiveStore()
    const showHistory = ref(false)

    // Features contextuelles du PJ actif
    const activePcRef = computed(() => store.activePc)
    const sceneModeRef = computed(() => store.sceneMode)
    const pcFeatures = useEncounterFeatures(activePcRef, sceneModeRef)

    // Rôle PJ : acteur si le mode indique actorRole === 'pc'
    const isPcActor = computed(() => {
      const meta = SCENE_MODE_META[store.sceneMode]
      return meta ? meta.actorRole === 'pc' : true
    })

    const isTraversalMode = computed(() => store.sceneMode === 'traversal')

    onMounted(() => {
      if (!store.isActive) {
        store.restoreState()
      }
    })

    return {
      store,
      showHistory,
      isPcActor,
      isTraversalMode,
      pcPrimary: pcFeatures.primaryFeatures,
      pcSecondary: pcFeatures.secondaryFeatures,
      pcPassive: pcFeatures.passiveFeatures,
      pcReaction: pcFeatures.reactionFeatures
    }
  },
  methods: {
    confirmEndEncounter() {
      if (window.confirm('Terminer cette rencontre ? Les données live seront perdues.')) {
        this.store.endEncounter()
        this.$router.push('/encounters')
      }
    }
  }
}
</script>

<style scoped>
.enc-live {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: 0 auto;
  padding: var(--space-sm);
}

/* ── Header compact ── */

.enc-live__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.enc-live__title-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.enc-live__title {
  font-size: var(--font-lg, 1.25rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.enc-live__tier {
  font-size: var(--font-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-semibold);
  padding: 1px var(--space-xs);
  background: rgba(224, 165, 38, 0.1);
  border-radius: var(--radius-sm);
}

.enc-live__controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.enc-live__session {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-left: auto;
}

.enc-live__round-controls {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.enc-live__round-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.65rem;
}

.enc-live__round-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.enc-live__round-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.enc-live__round-label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  min-width: 28px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.enc-live__end-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-danger);
  background: transparent;
  color: var(--color-accent-danger);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s;
}

.enc-live__end-btn:hover {
  background: rgba(244, 67, 54, 0.1);
}

/* ── Toggle historique ── */

.enc-live__toggle-history {
  align-self: flex-start;
  padding: 2px var(--space-sm);
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: var(--font-xs);
  cursor: pointer;
  text-decoration: underline;
}

.enc-live__toggle-history:hover {
  color: var(--color-text-secondary);
}

/* ── Sélecteurs (PJ+Spot + Adversaire) ── */

.enc-live__selectors {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

/* ── Barre adversaires compacte ── */

.enc-live__adv-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.enc-live__adv-label {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-accent-fear);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.enc-live__adv-count {
  font-weight: normal;
  color: var(--color-text-muted);
}

.enc-live__adv-chips {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  flex: 1;
}

.enc-live__adv-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: border-color 0.15s;
  font-size: var(--font-xs);
}

.enc-live__adv-chip:hover {
  border-color: var(--color-border-active);
}

.enc-live__adv-chip--active {
  border-color: var(--color-accent-fear);
  box-shadow: 0 0 0 1px var(--color-accent-fear);
}

.enc-live__adv-chip--defeated {
  opacity: 0.4;
}

.enc-live__adv-name {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.enc-live__adv-defeated {
  font-size: 0.75rem;
}

/* ── Battlefield — panels contextuels ── */

.enc-live__battlefield {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.enc-live__panel--first  { order: 1; }
.enc-live__panel--second { order: 2; }

@media (max-width: 700px) {
  .enc-live__battlefield {
    grid-template-columns: 1fr;
  }
}

/* ── Summary ── */

.enc-live__summary {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}

.enc-live__summary-sep {
  color: var(--color-text-muted);
}

/* ── Inactive state ── */

.enc-live__inactive {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl, 2rem);
  text-align: center;
}

.enc-live__inactive p {
  color: var(--color-text-muted);
  font-size: var(--font-md, 1rem);
}

.enc-live__go-builder {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-hope);
  background: transparent;
  color: var(--color-accent-hope);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s;
}

.enc-live__go-builder:hover {
  background: rgba(83, 168, 182, 0.1);
}
</style>
