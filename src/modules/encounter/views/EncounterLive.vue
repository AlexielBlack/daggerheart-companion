<template>
  <div
    class="enc-live"
    :class="'enc-live--' + store.sceneMode"
  >
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
      <!-- ── Header : titre + round + fin ── -->
      <header class="enc-live__header">
        <h1 class="enc-live__title">
          {{ store.encounterName || 'Rencontre' }}
        </h1>
        <span class="enc-live__tier">Tier {{ store.encounterTier }}</span>

        <button
          class="enc-live__end-btn"
          @click="confirmEndEncounter"
        >
          Fin
        </button>
      </header>

      <!-- ── Barres de sélection PJ / Adversaire ── -->
      <div class="enc-live__selectors">
        <!-- PJ chips -->
        <div class="enc-live__bar enc-live__bar--pc">
          <button
            v-for="pc in store.participantPcs"
            :key="pc.id"
            class="enc-live__chip"
            :class="{
              'enc-live__chip--active': store.activePcId === pc.id,
              'enc-live__chip--actor': isPcActor && store.activePcId === pc.id,
              'enc-live__chip--target': !isPcActor && store.activePcId === pc.id
            }"
            @click="store.selectPc(pc.id)"
          >
            <span
              v-if="store.pcSpotlights[pc.id] >= 1"
              class="enc-live__spot-dot"
              :title="store.pcSpotlights[pc.id] + ' spotlight(s) ce round'"
            >✦{{ store.pcSpotlights[pc.id] > 1 ? store.pcSpotlights[pc.id] : '' }}</span>
            <span
              v-if="store.pcDownStatus[pc.id]"
              class="enc-live__down-dot"
              title="À terre"
            >💀</span>
            <span class="enc-live__chip-name">{{ pc.name }}</span>
            <button
              class="enc-live__spot-btn"
              :class="{ 'enc-live__spot-btn--on': store.pcSpotlights[pc.id] >= 1 }"
              :aria-label="(store.pcSpotlights[pc.id] >= 1 ? 'Retirer' : 'Marquer') + ' spotlight ' + pc.name"
              :title="store.pcSpotlights[pc.id] >= 1 ? 'Clic: +1 · Clic droit: −1' : 'Marquer spotlight'"
              @click.stop="store.togglePcSpotlight(pc.id)"
              @contextmenu.stop.prevent="store.decrementPcSpotlight(pc.id)"
            >
              ✦
            </button>
          </button>
        </div>

        <!-- Flèche directionnelle -->
        <div
          class="enc-live__arrow"
          :class="'enc-live__arrow--' + store.sceneMode"
          :title="isPcActor ? 'PJ attaque →' : '← Adversaire attaque'"
          role="button"
          tabindex="0"
          aria-label="Inverser le projecteur"
          @click="store.swapSpotlight()"
          @keydown.enter="store.swapSpotlight()"
          @keydown.space.prevent="store.swapSpotlight()"
        >
          <span class="enc-live__arrow-icon">{{ isPcActor ? '⚔️ →' : '← 💀' }}</span>
        </div>

        <!-- Adversaire chips (groupés) -->
        <div class="enc-live__bar enc-live__bar--adv">
          <button
            v-for="group in store.groupedAdversaries"
            :key="group.adversaryId"
            class="enc-live__chip"
            :class="{
              'enc-live__chip--active': store.activeAdversary && store.activeAdversary.adversaryId === group.adversaryId,
              'enc-live__chip--actor': !isPcActor && store.activeAdversary && store.activeAdversary.adversaryId === group.adversaryId,
              'enc-live__chip--target': isPcActor && store.activeAdversary && store.activeAdversary.adversaryId === group.adversaryId,
              'enc-live__chip--all-defeated': group.activeCount === 0
            }"
            @click="store.selectAdversaryGroup(group.adversaryId)"
          >
            <span
              v-if="store.advSpotlights[group.adversaryId] >= 1"
              class="enc-live__spot-dot"
              :title="store.advSpotlights[group.adversaryId] + ' spotlight(s) ce round'"
            >✦{{ store.advSpotlights[group.adversaryId] > 1 ? store.advSpotlights[group.adversaryId] : '' }}</span>
            <span class="enc-live__chip-name">{{ group.name }}</span>
            <span
              v-if="group.instances.length > 1"
              class="enc-live__chip-qty"
            >×{{ group.instances.length }}</span>
            <span
              v-if="group.defeatedCount > 0"
              class="enc-live__chip-dead"
            >{{ group.defeatedCount }}💀</span>
            <button
              class="enc-live__spot-btn"
              :class="{ 'enc-live__spot-btn--on': store.advSpotlights[group.adversaryId] >= 1 }"
              :aria-label="(store.advSpotlights[group.adversaryId] >= 1 ? 'Retirer' : 'Marquer') + ' spotlight ' + group.name"
              :title="store.advSpotlights[group.adversaryId] >= 1 ? 'Clic: +1 · Clic droit: −1' : 'Marquer spotlight'"
              @click.stop="store.toggleAdvSpotlight(group.adversaryId)"
              @contextmenu.stop.prevent="store.decrementAdvSpotlight(group.adversaryId)"
            >
              ✦
            </button>
          </button>
        </div>
      </div>

      <!-- ── Battlefield — panels contextuels ── -->
      <div class="enc-live__battlefield">
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
          v-if="store.activeAdversary"
          :adversary="store.activeAdversary"
          :siblings="store.activeAdversarySiblings"
          :scene-mode="store.sceneMode"
          :is-actor="!isPcActor"
          :pcs="store.participantPcs"
          :class="{ 'enc-live__panel--first': !isPcActor, 'enc-live__panel--second': isPcActor }"
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

      <!-- ── Environnement ── -->
      <EnvironmentPanel
        v-if="store.activeEnvironment"
        :environment="store.activeEnvironment"
      />
    </template>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useEncounterFeatures } from '../composables/useEncounterFeatures'
import { SCENE_MODE_META } from '@data/encounters/liveConstants'
import PcLivePanel from '../components/PcLivePanel.vue'
import AdversaryTargetPanel from '../components/AdversaryTargetPanel.vue'
import EnvironmentPanel from '../components/EnvironmentPanel.vue'

export default {
  name: 'EncounterLive',
  components: {
    PcLivePanel,
    AdversaryTargetPanel,
    EnvironmentPanel
  },
  setup() {
    const store = useEncounterLiveStore()

    // Features contextuelles du PJ actif
    const activePcRef = computed(() => store.activePc)
    const sceneModeRef = computed(() => store.sceneMode)
    const pcFeatures = useEncounterFeatures(activePcRef, sceneModeRef)

    const isPcActor = computed(() => {
      const meta = SCENE_MODE_META[store.sceneMode]
      return meta ? meta.actorRole === 'pc' : true
    })

    onMounted(() => {
      if (!store.isActive) {
        store.restoreState()
      }
    })

    return {
      store,
      isPcActor,
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
/* ── Teinte de fond selon le mode ── */

.enc-live {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin: 0 auto;
  padding: var(--space-sm);
  min-height: 100%;
  transition: background-color 0.3s;
}

.enc-live--pcAttack {
  background-color: rgba(83, 168, 182, 0.03);
}

.enc-live--adversaryAttack {
  background-color: rgba(200, 75, 49, 0.05);
}

/* ── Header inline ── */

.enc-live__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
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
  margin-right: auto;
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

/* ── Sélecteurs PJ ← flèche → Adversaire ── */

.enc-live__selectors {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.enc-live__bar {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

/* ── Chips universels ── */

.enc-live__chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-size: var(--font-xs);
}

.enc-live__chip:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.enc-live__chip--active {
  border-color: var(--color-border-active);
}

.enc-live__chip--actor {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.08);
}

.enc-live__chip--target {
  border-color: var(--color-accent-fear);
  box-shadow: 0 0 0 1px var(--color-accent-fear);
  background: rgba(200, 75, 49, 0.08);
}

.enc-live__chip--all-defeated {
  opacity: 0.4;
}

.enc-live__chip-name {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.enc-live__chip-sub {
  color: var(--color-text-muted);
}

.enc-live__chip-qty {
  font-size: 0.65rem;
  font-weight: var(--font-bold);
  color: var(--color-accent-gold);
  padding: 0 3px;
  background: rgba(224, 165, 38, 0.15);
  border-radius: var(--radius-sm);
  line-height: 1.4;
}

.enc-live__chip-dead {
  font-size: 0.75rem;
}

/* ── Spotlight indicators ── */

.enc-live__spot-dot {
  color: var(--color-accent-gold);
  font-size: 0.7rem;
  line-height: 1;
  text-shadow: 0 0 4px rgba(224, 165, 38, 0.6);
}

.enc-live__down-dot {
  font-size: 0.7rem;
  line-height: 1;
}

.enc-live__spot-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.6rem;
  cursor: pointer;
  padding: 0;
  margin-left: 2px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.enc-live__spot-btn:hover {
  border-color: var(--color-accent-gold);
  color: var(--color-accent-gold);
}

.enc-live__spot-btn--on {
  background: rgba(224, 165, 38, 0.2);
  border-color: var(--color-accent-gold);
  color: var(--color-accent-gold);
  text-shadow: 0 0 4px rgba(224, 165, 38, 0.6);
}

/* ── Flèche directionnelle ── */

.enc-live__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.enc-live__arrow:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.enc-live__arrow--pcAttack {
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}

.enc-live__arrow--adversaryAttack {
  border-color: var(--color-accent-fear);
  color: var(--color-accent-fear);
}

.enc-live__arrow-icon {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  white-space: nowrap;
}

/* ── Battlefield ── */

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

  .enc-live__selectors {
    flex-direction: column;
  }

  .enc-live__arrow {
    transform: rotate(90deg);
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

/* ── Inactive ── */

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
