<template>
  <div class="enc-live">
    <!-- Header avec nom + contrôles de session -->
    <header class="enc-live__header">
      <div class="enc-live__title-row">
        <h1 class="enc-live__title">
          {{ store.encounterName || 'Rencontre' }}
        </h1>
        <span class="enc-live__tier">Tier {{ store.encounterTier }}</span>
      </div>
      <div class="enc-live__session-controls">
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
          <span class="enc-live__round-label">Round {{ store.round }}</span>
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
          Terminer
        </button>
      </div>
    </header>

    <!-- Mode de scène -->
    <SceneModeSelector
      :model-value="store.sceneMode"
      @update:model-value="store.setSceneMode($event)"
    />

    <!-- Fear / Hope Tracker -->
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

    <!-- Sélecteurs PJ/Adversaire actifs -->
    <div class="enc-live__selectors">
      <div class="enc-live__selector">
        <span class="enc-live__selector-label">PJ actif</span>
        <div class="enc-live__chip-row">
          <button
            v-for="pc in store.participantPcs"
            :key="pc.id"
            class="enc-live__chip"
            :class="{ 'enc-live__chip--active': store.activePcId === pc.id }"
            @click="store.setActivePc(pc.id)"
          >
            <span class="enc-live__chip-name">{{ pc.name }}</span>
            <span class="enc-live__chip-sub">{{ pc.className }}</span>
          </button>
        </div>
      </div>

      <div class="enc-live__selector">
        <span class="enc-live__selector-label">
          Adversaire cible
          <span class="enc-live__active-count">({{ store.activeAdversaries.length }} actifs)</span>
        </span>
        <div class="enc-live__chip-row">
          <button
            v-for="adv in store.liveAdversaries"
            :key="adv.instanceId"
            class="enc-live__chip"
            :class="{
              'enc-live__chip--active': store.activeAdversaryId === adv.instanceId,
              'enc-live__chip--defeated': adv.isDefeated
            }"
            @click="store.setActiveAdversary(adv.instanceId)"
          >
            <span class="enc-live__chip-name">{{ adv.name }}</span>
            <span class="enc-live__chip-sub">{{ adv.type }}</span>
            <span
              v-if="adv.isDefeated"
              class="enc-live__chip-defeated"
            >💀</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Spotlight Tracker -->
    <SpotlightTracker
      :pcs="store.participantPcs"
      :active-pc-id="store.activePcId"
      :spotlight="store.spotlight"
      :spotlight-tokens="store.spotlightTokens"
      :total-tokens="store.totalSpotlightTokens"
      @give-spotlight="store.giveSpotlight($event)"
      @remove-token="store.removeSpotlightToken($event)"
      @gm-spotlight="store.setGmSpotlight()"
    />

    <!-- Panels contextuels — ordre piloté par le mode de scène -->
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

    <!-- Résumé combat -->
    <div
      v-if="store.adversaryCombatSummary.count > 0"
      class="enc-live__summary"
    >
      <span>{{ store.adversaryCombatSummary.count }} adversaires actifs</span>
      <span class="enc-live__summary-sep">·</span>
      <span>HP : {{ store.adversaryCombatSummary.markedHP }}/{{ store.adversaryCombatSummary.totalHP }}</span>
      <span class="enc-live__summary-sep">·</span>
      <span>Stress : {{ store.adversaryCombatSummary.markedStress }}/{{ store.adversaryCombatSummary.totalStress }}</span>
      <span class="enc-live__summary-sep">·</span>
      <span>{{ store.defeatedAdversaries.length }} vaincus</span>
    </div>

    <!-- Environnement (compact hors mode Traversal) -->
    <EnvironmentPanel
      v-if="store.activeEnvironment && !isTraversalMode"
      :environment="store.activeEnvironment"
    />

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
import AdversaryTargetPanel from '../components/AdversaryTargetPanel.vue'
import EnvironmentPanel from '../components/EnvironmentPanel.vue'
import SpotlightTracker from '../components/SpotlightTracker.vue'

export default {
  name: 'EncounterLive',
  components: {
    FearHopeTracker,
    SceneModeSelector,
    SpotlightToggle,
    PcLivePanel,
    AdversaryTargetPanel,
    EnvironmentPanel,
    SpotlightTracker
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
  gap: var(--space-md);
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-md);
}

/* ── Header ── */

.enc-live__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.enc-live__title-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.enc-live__title {
  font-size: var(--font-xl, 1.5rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.enc-live__tier {
  font-size: var(--font-sm);
  color: var(--color-accent-gold);
  font-weight: var(--font-semibold);
  padding: 2px var(--space-sm);
  background: rgba(224, 165, 38, 0.1);
  border-radius: var(--radius-sm);
}

.enc-live__session-controls {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
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
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.7rem;
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
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  min-width: 64px;
  text-align: center;
}

.enc-live__end-btn {
  margin-left: auto;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-danger);
  background: transparent;
  color: var(--color-accent-danger);
  font-size: var(--font-sm);
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
  padding: var(--space-xs) var(--space-sm);
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

/* ── Selectors ── */

.enc-live__selectors {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.enc-live__selector {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.enc-live__selector-label {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.enc-live__active-count {
  font-weight: normal;
  color: var(--color-text-muted);
}

.enc-live__chip-row {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.enc-live__chip {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: border-color 0.15s;
  font-size: var(--font-xs);
}

.enc-live__chip:hover {
  border-color: var(--color-border-active);
}

.enc-live__chip--active {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
}

.enc-live__chip--defeated {
  opacity: 0.5;
}

.enc-live__chip-name {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.enc-live__chip-sub {
  color: var(--color-text-muted);
}

.enc-live__chip-defeated {
  font-size: 0.8rem;
}

/* ── Battlefield — panels contextuels ── */

.enc-live__battlefield {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
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
