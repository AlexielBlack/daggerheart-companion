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
      v-model="store.sceneMode"
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

    <!-- Panels PJs et Adversaires -->
    <div class="enc-live__battlefield">
      <!-- Panel PJs -->
      <section
        class="enc-live__section"
        aria-label="Joueurs"
      >
        <h2 class="enc-live__section-title">
          <span class="enc-live__section-emoji">🎭</span> PJs
        </h2>
        <div
          v-if="store.participantPcs.length === 0"
          class="enc-live__empty"
        >
          Aucun PJ dans cette rencontre.
        </div>
        <div
          v-else
          class="enc-live__pc-list"
        >
          <button
            v-for="pc in store.participantPcs"
            :key="pc.id"
            class="enc-live__pc-chip"
            :class="{ 'enc-live__pc-chip--active': store.activePcId === pc.id }"
            @click="store.setActivePc(pc.id)"
          >
            <span class="enc-live__pc-name">{{ pc.name }}</span>
            <span class="enc-live__pc-class">{{ pc.className }}</span>
            <span class="enc-live__pc-level">Nv.{{ pc.level }}</span>
          </button>
        </div>
      </section>

      <!-- Panel Adversaires -->
      <section
        class="enc-live__section"
        aria-label="Adversaires"
      >
        <h2 class="enc-live__section-title">
          <span class="enc-live__section-emoji">💀</span>
          Adversaires
          <span class="enc-live__count">({{ store.activeAdversaries.length }} actifs)</span>
        </h2>
        <div
          v-if="store.liveAdversaries.length === 0"
          class="enc-live__empty"
        >
          Aucun adversaire dans cette rencontre.
        </div>
        <div
          v-else
          class="enc-live__adversary-grid"
        >
          <AdversaryLiveCard
            v-for="adv in store.liveAdversaries"
            :key="adv.instanceId"
            :adversary="adv"
            :is-active="store.activeAdversaryId === adv.instanceId"
            @select="store.setActiveAdversary($event)"
            @mark-hp="store.markAdversaryHP($event)"
            @clear-hp="store.clearAdversaryHP($event)"
            @mark-stress="store.markAdversaryStress($event)"
            @clear-stress="store.clearAdversaryStress($event)"
          />
        </div>
      </section>
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

    <!-- Environnement -->
    <section
      v-if="store.activeEnvironment"
      class="enc-live__section enc-live__section--env"
    >
      <h2 class="enc-live__section-title">
        <span class="enc-live__section-emoji">🗺️</span>
        {{ store.activeEnvironment.name }}
        <span class="enc-live__env-tier">Tier {{ store.activeEnvironment.tier }}</span>
      </h2>
      <p
        v-if="store.activeEnvironment.description"
        class="enc-live__env-desc"
      >
        {{ store.activeEnvironment.description }}
      </p>
    </section>
  </div>
</template>

<script>
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import FearHopeTracker from '../components/FearHopeTracker.vue'
import SceneModeSelector from '../components/SceneModeSelector.vue'
import SpotlightToggle from '../components/SpotlightToggle.vue'
import AdversaryLiveCard from '../components/AdversaryLiveCard.vue'

export default {
  name: 'EncounterLive',
  components: { FearHopeTracker, SceneModeSelector, SpotlightToggle, AdversaryLiveCard },
  data() {
    return {
      showHistory: false
    }
  },
  computed: {
    store() { return useEncounterLiveStore() }
  },
  mounted() {
    // Tenter de restaurer un état persisté
    if (!this.store.isActive) {
      this.store.restoreState()
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
  max-width: 900px;
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

/* ── Battlefield ── */

.enc-live__battlefield {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 600px) {
  .enc-live__battlefield {
    grid-template-columns: 1fr;
  }
}

/* ── Sections ── */

.enc-live__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.enc-live__section--env {
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.enc-live__section-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-md, 1rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.enc-live__section-emoji {
  font-size: 1.1rem;
  line-height: 1;
}

.enc-live__count {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-weight: normal;
}

.enc-live__empty {
  font-size: var(--font-sm);
  color: var(--color-text-muted);
  font-style: italic;
  padding: var(--space-sm);
}

/* ── PJ list ── */

.enc-live__pc-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.enc-live__pc-chip {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: border-color 0.15s;
  text-align: left;
}

.enc-live__pc-chip:hover {
  border-color: var(--color-border-active);
}

.enc-live__pc-chip--active {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
}

.enc-live__pc-name {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  flex: 1;
}

.enc-live__pc-class {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.enc-live__pc-level {
  font-size: var(--font-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-semibold);
}

/* ── Adversary grid ── */

.enc-live__adversary-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
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

/* ── Environnement ── */

.enc-live__env-tier {
  font-size: var(--font-xs);
  color: var(--color-accent-gold);
  font-weight: normal;
}

.enc-live__env-desc {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}
</style>
