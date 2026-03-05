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
      <!-- ── Header : titre + fin ── -->
      <header class="enc-live__header">
        <h1 class="enc-live__title">
          {{ store.encounterName || 'Rencontre' }}
        </h1>
        <span class="enc-live__tier">Tier {{ store.encounterTier }}</span>

        <button
          v-if="store.undoStack.length > 0"
          class="enc-live__undo-btn"
          :title="'Annuler (Ctrl+Z) — ' + store.undoStack.length + ' action(s)'"
          aria-label="Annuler la dernière action"
          @click="store.undo()"
        >
          ↩ {{ store.undoStack.length }}
        </button>

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
              :title="store.pcSpotlights[pc.id] + ' spotlight(s) ce cycle'"
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
              :title="store.advSpotlights[group.adversaryId] + ' spotlight(s) ce cycle'"
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
          <!-- Bouton renforts -->
          <button
            class="enc-live__reinforce-btn"
            :class="{ 'enc-live__reinforce-btn--open': showReinforcementPanel }"
            title="Ajouter des renforts"
            aria-label="Ajouter des renforts"
            @click="toggleReinforcementPanel()"
          >
            +
          </button>
        </div>
      </div>

      <!-- ── Panneau renforts (toggle) ── -->
      <div
        v-if="showReinforcementPanel"
        class="enc-live__reinforce-panel"
      >
        <input
          v-model="reinforcementSearch"
          class="enc-live__reinforce-search"
          type="text"
          placeholder="Rechercher un adversaire…"
          aria-label="Rechercher un adversaire"
        />
        <div class="enc-live__reinforce-list">
          <button
            v-for="adv in filteredAdversaries"
            :key="adv.id"
            class="enc-live__reinforce-item"
            @click="addReinforcement(adv.id)"
          >
            <span class="enc-live__reinforce-name">{{ adv.name }}</span>
            <span class="enc-live__reinforce-meta">{{ adv.type }} · T{{ adv.tier }} · {{ adv.hp }}HP</span>
          </button>
          <p
            v-if="filteredAdversaries.length === 0"
            class="enc-live__reinforce-empty"
          >
            Aucun résultat
          </p>
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

      <!-- ── Overlay résumé post-combat ── -->
      <!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="showEndSummary && endSummaryData"
        class="enc-live__overlay"
        @click.self="cancelEndEncounter"
      >
        <!-- eslint-enable -->
        <div
          class="enc-live__summary-modal"
          role="dialog"
          aria-label="Résumé de la rencontre"
        >
          <h2 class="enc-live__modal-title">
            📋 Résumé — {{ endSummaryData.name }}
          </h2>

          <div class="enc-live__modal-stats">
            <div class="enc-live__modal-stat">
              <span class="enc-live__modal-stat-val">{{ endSummaryData.defeated }}</span>
              <span class="enc-live__modal-stat-label">💀 Vaincus</span>
            </div>
            <div class="enc-live__modal-stat">
              <span class="enc-live__modal-stat-val">{{ endSummaryData.remaining }}</span>
              <span class="enc-live__modal-stat-label">🔴 Restants</span>
            </div>
            <div class="enc-live__modal-stat">
              <span class="enc-live__modal-stat-val">{{ endSummaryData.totalDamageHP }}</span>
              <span class="enc-live__modal-stat-label">❤️ HP infligés</span>
            </div>
            <div class="enc-live__modal-stat">
              <span class="enc-live__modal-stat-val">{{ endSummaryData.totalDamageStress }}</span>
              <span class="enc-live__modal-stat-label">💢 Stress infligé</span>
            </div>
            <div class="enc-live__modal-stat">
              <span class="enc-live__modal-stat-val">{{ endSummaryData.misses }}</span>
              <span class="enc-live__modal-stat-label">✕ Ratés</span>
            </div>
          </div>

          <!-- Dégâts par PJ -->
          <div
            v-if="Object.keys(endSummaryData.dmgByPc).length > 0"
            class="enc-live__modal-section"
          >
            <h3 class="enc-live__modal-subtitle">
              Dégâts par PJ
            </h3>
            <div
              v-for="(dmg, pcName) in endSummaryData.dmgByPc"
              :key="pcName"
              class="enc-live__modal-row"
            >
              <span class="enc-live__modal-row-name">{{ pcName }}</span>
              <span class="enc-live__modal-row-val">❤️{{ dmg.hp }} · 💢{{ dmg.stress }}</span>
            </div>
          </div>

          <!-- Adversaires vaincus -->
          <div
            v-if="endSummaryData.defeats.length > 0"
            class="enc-live__modal-section"
          >
            <h3 class="enc-live__modal-subtitle">
              Adversaires vaincus
            </h3>
            <div
              v-for="(d, idx) in endSummaryData.defeats"
              :key="idx"
              class="enc-live__modal-row"
            >
              <span class="enc-live__modal-row-name">💀 {{ d.name }}</span>
              <span class="enc-live__modal-row-val">par {{ d.by }}</span>
            </div>
          </div>

          <!-- PJs tombés -->
          <div
            v-if="endSummaryData.pcDowns.length > 0"
            class="enc-live__modal-section"
          >
            <h3 class="enc-live__modal-subtitle">
              PJs tombés
            </h3>
            <span class="enc-live__modal-list">{{ endSummaryData.pcDowns.join(', ') }}</span>
          </div>

          <div class="enc-live__modal-actions">
            <button
              class="enc-live__modal-cancel"
              @click="cancelEndEncounter"
            >
              Retour au combat
            </button>
            <button
              class="enc-live__modal-confirm"
              @click="finalEndEncounter"
            >
              Terminer la rencontre
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useEncounterFeatures } from '../composables/useEncounterFeatures'
import { SCENE_MODE_META } from '@data/encounters/liveConstants'
import { allAdversaries } from '@data/adversaries'
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

    // ── Panneau renforts ──────────────────────────────────
    const showReinforcementPanel = ref(false)
    const reinforcementSearch = ref('')

    /** Adversaires filtrés par recherche, triés par tier puis nom */
    const filteredAdversaries = computed(() => {
      const q = reinforcementSearch.value.toLowerCase().trim()
      let list = allAdversaries
      if (q) {
        list = list.filter((a) =>
          a.name.toLowerCase().includes(q)
          || a.type.toLowerCase().includes(q)
          || String(a.tier).includes(q)
        )
      }
      return list.slice(0, 20) // Limiter pour la perf du dropdown
    })

    function toggleReinforcementPanel() {
      showReinforcementPanel.value = !showReinforcementPanel.value
      if (showReinforcementPanel.value) {
        reinforcementSearch.value = ''
      }
    }

    function addReinforcement(adversaryId) {
      store.addReinforcement(adversaryId, 1)
    }

    // ── Résumé post-combat ────────────────────────────────
    const showEndSummary = ref(false)
    const endSummaryData = ref(null)

    function generateSummary() {
      const log = store.encounterLog
      const totalDamageHP = log
        .filter((e) => e.action === 'damage' && e.type === 'hp')
        .reduce((s, e) => s + e.amount, 0)
      const totalDamageStress = log
        .filter((e) => e.action === 'damage' && e.type === 'stress')
        .reduce((s, e) => s + e.amount, 0)
      const defeats = log.filter((e) => e.action === 'adv_down')
      const pcDowns = log.filter((e) => e.action === 'pc_down')
      const misses = log.filter((e) => e.action === 'miss')

      // Dégâts par PJ
      const dmgByPc = {}
      log.filter((e) => e.action === 'damage').forEach((e) => {
        if (!dmgByPc[e.pcName]) dmgByPc[e.pcName] = { hp: 0, stress: 0 }
        if (e.type === 'hp') dmgByPc[e.pcName].hp += e.amount
        else dmgByPc[e.pcName].stress += e.amount
      })

      return {
        name: store.encounterName,
        tier: store.encounterTier,
        totalAdversaries: store.liveAdversaries.length,
        defeated: store.defeatedAdversaries.length,
        remaining: store.activeAdversaries.length,
        totalDamageHP,
        totalDamageStress,
        pcDowns: pcDowns.map((e) => e.pcName),
        defeats: defeats.map((e) => ({ name: e.advName, by: e.pcName })),
        misses: misses.length,
        dmgByPc,
        logEntries: log.length
      }
    }

    // ── Raccourcis clavier ─────────────────────────────────
    function onKeydown(e) {
      if (!store.isActive) return

      // Ignorer si on tape dans un input/textarea
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Ctrl+Z : undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (store.undoStack.length > 0) {
          e.preventDefault()
          store.undo()
        }
        return
      }

      // Tab : basculer projecteur PJ ↔ MJ
      if (e.key === 'Tab') {
        e.preventDefault()
        store.swapSpotlight()
        return
      }

      // Escape : fermer renforts / résumé
      if (e.key === 'Escape') {
        if (showReinforcementPanel.value) {
          showReinforcementPanel.value = false
        }
        if (showEndSummary.value) {
          showEndSummary.value = false
        }
        return
      }

      // 1-9 : sélection rapide PJ par index
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const pcs = store.participantPcs
        if (num <= pcs.length) {
          e.preventDefault()
          store.selectPc(pcs[num - 1].id)
        }
        return
      }
    }

    onMounted(() => {
      if (!store.isActive) {
        store.restoreState()
      }
      window.addEventListener('keydown', onKeydown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown)
    })

    return {
      store,
      isPcActor,
      pcPrimary: pcFeatures.primaryFeatures,
      pcSecondary: pcFeatures.secondaryFeatures,
      pcPassive: pcFeatures.passiveFeatures,
      pcReaction: pcFeatures.reactionFeatures,
      // Renforts
      showReinforcementPanel,
      reinforcementSearch,
      filteredAdversaries,
      toggleReinforcementPanel,
      addReinforcement,
      // Résumé
      showEndSummary,
      endSummaryData,
      generateSummary
    }
  },
  methods: {
    confirmEndEncounter() {
      this.endSummaryData = this.generateSummary()
      this.showEndSummary = true
    },
    finalEndEncounter() {
      this.showEndSummary = false
      this.endSummaryData = null
      this.store.endEncounter()
      this.$router.push('/encounters')
    },
    cancelEndEncounter() {
      this.showEndSummary = false
      this.endSummaryData = null
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

.enc-live__undo-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-text-muted);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s;
  font-variant-numeric: tabular-nums;
}

.enc-live__undo-btn:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
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

/* ── Bouton renforts ── */

.enc-live__reinforce-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border-active);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  align-self: center;
}

.enc-live__reinforce-btn:hover {
  border-color: var(--color-accent-fear);
  color: var(--color-accent-fear);
  background: rgba(200, 75, 49, 0.08);
}

.enc-live__reinforce-btn--open {
  border-style: solid;
  border-color: var(--color-accent-fear);
  color: var(--color-accent-fear);
  background: rgba(200, 75, 49, 0.1);
}

/* ── Panneau renforts ── */

.enc-live__reinforce-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.enc-live__reinforce-search {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-sm);
}

.enc-live__reinforce-search:focus {
  outline: none;
  border-color: var(--color-border-active);
}

.enc-live__reinforce-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 200px;
  overflow-y: auto;
}

.enc-live__reinforce-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  transition: background 0.1s;
  text-align: left;
}

.enc-live__reinforce-item:hover {
  background: var(--color-bg-elevated);
}

.enc-live__reinforce-name {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.enc-live__reinforce-meta {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.enc-live__reinforce-empty {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--space-sm);
  margin: 0;
}

/* ── Overlay résumé post-combat ── */

.enc-live__overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  padding: var(--space-md);
}

.enc-live__summary-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  padding: var(--space-lg, 1.5rem);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.enc-live__modal-title {
  font-size: var(--font-lg, 1.25rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.enc-live__modal-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.enc-live__modal-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  min-width: 72px;
  flex: 1;
}

.enc-live__modal-stat-val {
  font-size: var(--font-xl, 1.5rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.enc-live__modal-stat-label {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.enc-live__modal-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.enc-live__modal-subtitle {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.enc-live__modal-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
}

.enc-live__modal-row-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.enc-live__modal-row-val {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.enc-live__modal-list {
  font-size: var(--font-sm);
  color: var(--color-accent-danger);
  font-weight: var(--font-semibold);
}

.enc-live__modal-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.enc-live__modal-cancel {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s;
}

.enc-live__modal-cancel:hover {
  background: var(--color-bg-elevated);
}

.enc-live__modal-confirm {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-danger);
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-accent-danger);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: background 0.15s;
}

.enc-live__modal-confirm:hover {
  background: rgba(244, 67, 54, 0.2);
}
</style>
