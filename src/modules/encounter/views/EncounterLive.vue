<template>
  <div
    class="live"
    :class="'live--' + store.sceneMode"
  >
    <!-- Écran inactif -->
    <div
      v-if="!store.isActive"
      class="live__inactive"
    >
      <p>Aucune rencontre en cours.</p>
      <button
        class="live__go-builder"
        @click="$router.push('/encounters')"
      >
        Retour au builder de rencontres
      </button>
    </div>

    <template v-else>
      <!-- ══ Header ══ -->
      <header class="live__header">
        <!-- Groupe gauche : identité + mode scène -->
        <div class="live__header-info">
          <h1 class="live__title">
            {{ store.encounterName || 'Rencontre' }}
          </h1>
          <span class="live__tier">T{{ store.encounterTier }}</span>
          <button
            class="live__mode-btn"
            :class="'live__mode-btn--' + store.sceneMode"
            :title="isPcActor ? 'PJ attaque — Tab pour inverser' : 'MJ attaque — Tab pour inverser'"
            aria-label="Inverser PJ / MJ"
            @click="store.swapSpotlight()"
          >
            {{ isPcActor ? '⚔️ PJ' : '💀 MJ' }}
          </button>
          <span
            v-if="store.adversaryCombatSummary.count > 0"
            class="live__combat-sum"
          >
            {{ store.activeAdversaries.length }} actifs · {{ store.defeatedAdversaries.length }}💀
          </span>
        </div>

        <!-- Groupe droit : actions rapides -->
        <div class="live__header-actions">
          <button
            v-if="store.undoStack.length > 0"
            class="live__undo-btn"
            :title="'Annuler (Ctrl+Z) — ' + store.undoStack.length + ' action(s)'"
            aria-label="Annuler la dernière action"
            @click="store.undo()"
          >
            ↩ {{ store.undoStack.length }}
          </button>
          <button
            v-if="hasAdversaries"
            class="live__aoe-btn"
            :class="{ 'live__aoe-btn--on': aoeMode }"
            title="Dégâts de zone (AoE)"
            aria-label="Dégâts de zone"
            @click="aoeMode = !aoeMode"
          >
            💥 AoE
          </button>
          <button
            v-if="hasAdversaries"
            class="live__reinforce-header-btn"
            :class="{ 'live__reinforce-header-btn--open': showReinforcementPanel }"
            title="Ajouter des renforts"
            aria-label="Ajouter des renforts"
            @click="showReinforcementPanel = true"
          >
            + Renforts
          </button>
          <button
            v-if="store.countdowns.length === 0"
            class="live__cd-btn"
            title="Ajouter un countdown"
            aria-label="Ajouter un countdown"
            @click="showCountdownBar = true"
          >
            ⏱️
          </button>
          <button
            class="live__end-btn"
            @click="confirmEndEncounter"
          >
            Fin
          </button>
        </div>
      </header>

      <!-- ══ Countdowns ══ -->
      <CountdownTracker
        v-if="store.countdowns.length > 0 || showCountdownBar"
        :countdowns="store.countdowns"
        @add="onAddCountdown"
        @remove="onRemoveCountdown"
        @tick="onTickCountdown"
        @untick="onUntickCountdown"
        @advance-by-result="onAdvanceCountdownByResult"
        @reset="onResetCountdown"
      />

      <!-- ══ Tabs de navigation tablette (Adversaires ↔ Contexte) ══ -->
      <nav
        v-if="hasAdversaries"
        class="live__tablet-tabs"
        aria-label="Vue principale"
      >
        <button
          class="live__tablet-tab"
          :class="{ 'live__tablet-tab--active': tabletMainTab === 'adv' }"
          aria-label="Voir les adversaires"
          @click="tabletMainTab = 'adv'"
        >
          ⚔️ Adversaires
        </button>
        <button
          class="live__tablet-tab"
          :class="{ 'live__tablet-tab--active': tabletMainTab === 'ctx' }"
          aria-label="Voir le contexte"
          @click="tabletMainTab = 'ctx'"
        >
          📋 Contexte
        </button>
      </nav>

      <!-- ══ Grille 3 colonnes ══ -->
      <div class="live__grid">
        <!-- Colonne PJ -->
        <div class="live__col-pc">
          <PcSidebarCard
            v-for="pc in store.participantPcs"
            :key="pc.id"
            :pc="pc"
            :is-selected="store.activePcId === pc.id"
            :is-down="!!store.pcDownStatus[pc.id]"
            :active-conditions="store.pcConditions[pc.id] || []"
            :spotlight-count="store.pcSpotlights[pc.id] || 0"
            @select="onSelectPc"
            @toggle-condition="onTogglePcCondition"
          />
        </div>

        <!-- Colonne Adversaires -->
        <div
          v-if="hasAdversaries"
          class="live__col-adv"
          :class="{ 'live__col--tablet-hidden': tabletMainTab !== 'adv' }"
        >
          <AdversaryGroupCard
            v-for="group in store.groupedAdversaries"
            :key="group.adversaryId"
            :group="group"
            :is-selected="store.activeAdversary && store.activeAdversary.adversaryId === group.adversaryId"
            @select-group="onSelectAdversaryGroup"
            @apply-damage="onApplyDamage"
            @mark-stress="onMarkStress"
            @clear-stress="onClearStress"
            @clear-hp="onClearHP"
            @defeat="onDefeat"
            @revive="onRevive"
            @toggle-condition="onToggleAdvCondition"
          />
        </div>

        <!-- Colonne Contexte -->
        <div
          class="live__col-ctx"
          :class="{ 'live__col--tablet-hidden': hasAdversaries && tabletMainTab !== 'ctx' }"
        >
          <ContextPanel
            :pc="store.activePc"
            :adversary="store.activeAdversary"
            :environment="store.activeEnvironment"
            :scene-mode="store.sceneMode"
            :last-click-category="store.lastClickCategory"
            :primary-features="pcPrimary"
            :secondary-features="pcSecondary"
            :passive-features="pcPassive"
            :reaction-features="pcReaction"
            :all-features="pcAllFeatures"
          />
        </div>
      </div>

      <!-- ══ Drawer Renforts ══ -->
      <ReinforcementDrawer
        v-model="showReinforcementPanel"
        @add="addReinforcement"
      />

      <!-- ══ Modal AoE ══ -->
      <!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="aoeMode"
        class="live__overlay"
        @click.self="aoeMode = false"
      >
        <!-- eslint-enable -->
        <div
          class="live__aoe-modal"
          role="dialog"
          aria-label="Dégâts de zone"
        >
          <div class="live__aoe-header">
            <span>💥 Dégâts de zone</span>
            <button
              aria-label="Fermer"
              @click="aoeMode = false"
            >
              ✕
            </button>
          </div>
          <div
            v-for="inst in aoeAvailableInstances"
            :key="inst.instanceId"
            class="live__aoe-row"
            :class="{ 'live__aoe-row--hit': aoeDamage[inst.instanceId] > 0 }"
          >
            <span class="live__aoe-name">
              {{ inst.displayName }}
            </span>
            <span class="live__aoe-hp">❤️{{ inst.markedHP }}/{{ inst.maxHP }}</span>
            <!-- Boutons seuils (comme sur les cartes) -->
            <div class="live__aoe-thresh">
              <button
                class="live__aoe-th live__aoe-th--1"
                title="1 HP (Mineur)"
                @click="aoeSetHp(inst.instanceId, 1)"
              >
                1
              </button>
              <button
                class="live__aoe-th live__aoe-th--2"
                title="2 HP (Majeur)"
                @click="aoeSetHp(inst.instanceId, 2)"
              >
                2
              </button>
              <button
                class="live__aoe-th live__aoe-th--3"
                title="3 HP (Sévère)"
                @click="aoeSetHp(inst.instanceId, 3)"
              >
                3
              </button>
            </div>
            <span
              v-if="aoeDamage[inst.instanceId] > 0"
              class="live__aoe-dmg"
            >−{{ aoeDamage[inst.instanceId] }}HP</span>
            <button
              v-if="aoeDamage[inst.instanceId] > 0"
              class="live__aoe-undo"
              title="Annuler"
              @click="aoeUndoTarget(inst.instanceId)"
            >
              ↩
            </button>
          </div>
          <div
            v-for="pc in store.participantPcs"
            :key="'pc_' + pc.id"
            class="live__aoe-row"
            :class="{ 'live__aoe-row--hit': aoeDamage['pc_' + pc.id] > 0 }"
          >
            <span class="live__aoe-name">🧑 {{ pc.name }}</span>
            <span class="live__aoe-hp">Évasion {{ (pc.evasion || 10) + (pc.evasionBonus || 0) }}</span>
            <div class="live__aoe-thresh">
              <button
                class="live__aoe-th live__aoe-th--1"
                title="1 HP"
                @click="aoeSetHp('pc_' + pc.id, 1)"
              >
                1
              </button>
              <button
                class="live__aoe-th live__aoe-th--2"
                title="2 HP"
                @click="aoeSetHp('pc_' + pc.id, 2)"
              >
                2
              </button>
              <button
                class="live__aoe-th live__aoe-th--3"
                title="3 HP"
                @click="aoeSetHp('pc_' + pc.id, 3)"
              >
                3
              </button>
            </div>
            <span
              v-if="aoeDamage['pc_' + pc.id] > 0"
              class="live__aoe-dmg"
            >−{{ aoeDamage['pc_' + pc.id] }}HP</span>
            <button
              v-if="aoeDamage['pc_' + pc.id] > 0"
              class="live__aoe-undo"
              title="Annuler"
              @click="aoeUndoTarget('pc_' + pc.id)"
            >
              ↩
            </button>
          </div>
          <div class="live__aoe-footer">
            <span>{{ aoeTotalTargets }} cible{{ aoeTotalTargets > 1 ? 's' : '' }}</span>
            <button
              :disabled="aoeTotalTargets === 0"
              @click="applyAoe"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>

      <!-- ══ Modal fin ══ -->
      <!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="showEndSummary && endSummaryData"
        class="live__overlay"
        @click.self="cancelEndEncounter"
      >
        <!-- eslint-enable -->
        <div
          class="live__end-modal"
          role="dialog"
          aria-label="Résumé de la rencontre"
        >
          <h2>📋 Résumé — {{ endSummaryData.name }}</h2>
          <div class="live__end-stats">
            <div class="live__end-stat">
              <span class="live__end-val">{{ endSummaryData.defeated.length }}</span>
              <span>💀 Vaincus</span>
            </div>
            <div class="live__end-stat">
              <span class="live__end-val">{{ endSummaryData.surviving.length }}</span>
              <span>🔴 Restants</span>
            </div>
            <div class="live__end-stat">
              <span class="live__end-val">{{ endSummaryData.totalHPMarked }}</span>
              <span>❤️ HP marqués</span>
            </div>
          </div>
          <div
            v-if="Object.keys(endSummaryData.damageByPc).length > 0"
            class="live__end-section"
          >
            <h3>Dégâts par PJ</h3>
            <div
              v-for="(dmg, pcId) in endSummaryData.damageByPc"
              :key="pcId"
              class="live__end-row"
            >
              <span>{{ dmg.pcName }}</span>
              <span>❤️{{ dmg.hp }} · 💢{{ dmg.stress }}</span>
            </div>
          </div>
          <div class="live__end-actions">
            <button @click="cancelEndEncounter">
              Retour
            </button>
            <button
              class="live__end-confirm"
              @click="finalEndEncounter"
            >
              Terminer
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
import PcSidebarCard from '../components/PcSidebarCard.vue'
import AdversaryGroupCard from '../components/AdversaryGroupCard.vue'
import ContextPanel from '../components/ContextPanel.vue'
import CountdownTracker from '../components/CountdownTracker.vue'
import ReinforcementDrawer from '../components/ReinforcementDrawer.vue'

export default {
  name: 'EncounterLive',
  components: { PcSidebarCard, AdversaryGroupCard, ContextPanel, CountdownTracker, ReinforcementDrawer },
  setup() {
    const store = useEncounterLiveStore()

    // Features PJ contextuelles
    const activePcRef = computed(() => store.activePc)
    const sceneModeRef = computed(() => store.sceneMode)
    const pcFeatures = useEncounterFeatures(activePcRef, sceneModeRef)

    const isPcActor = computed(() => {
      const meta = SCENE_MODE_META[store.sceneMode]
      return meta ? meta.actorRole === 'pc' : true
    })

    const hasAdversaries = computed(() => store.liveAdversaries.length > 0)

    // ── Sélection ──
    function onSelectPc(pcId) { store.selectPc(pcId) }
    function onSelectAdversaryGroup(adversaryId) { store.selectAdversaryGroup(adversaryId) }

    // ── Actions adversaire ──
    function onApplyDamage({ instanceId, hpToMark }) { store.markAdversaryHP(instanceId, hpToMark) }
    function onMarkStress(instanceId) { store.markAdversaryStress(instanceId, 1) }
    function onClearStress(instanceId) { store.clearAdversaryStress(instanceId, 1) }
    function onClearHP(instanceId) { store.clearAdversaryHP(instanceId, 1) }
    function onDefeat(instanceId) { store.defeatAdversary(instanceId) }
    function onRevive(instanceId) { store.reviveAdversary(instanceId) }

    // ── Conditions ──
    function onTogglePcCondition({ pcId, conditionId }) { store.togglePcCondition(pcId, conditionId) }
    function onToggleAdvCondition({ instanceId, conditionId }) { store.toggleAdversaryCondition(instanceId, conditionId) }

    // ── Renforts ──
    const showReinforcementPanel = ref(false)

    function addReinforcement(adversaryId) { store.addReinforcement(adversaryId, 1) }

    // ── AoE ──
    const aoeMode = ref(false)

    // ── Countdowns ──
    const showCountdownBar = ref(false)

    function onAddCountdown({ name, type, startValue, loop }) {
      store.addCountdown(name, type, startValue, loop)
    }
    function onRemoveCountdown(id) {
      store.removeCountdown(id)
      if (store.countdowns.length === 0) showCountdownBar.value = false
    }
    function onTickCountdown(id) { store.tickCountdown(id) }
    function onUntickCountdown(id) { store.untickCountdown(id) }
    function onAdvanceCountdownByResult({ countdownId, rollResult }) {
      store.advanceCountdownByResult(countdownId, rollResult)
    }
    function onResetCountdown(id) { store.resetCountdown(id) }
    const aoeDamage = ref({})
    const aoeAvailableInstances = computed(() => {
      const active = store.liveAdversaries.filter((a) => !a.isDefeated)
      const countByAdv = {}
      for (const a of store.liveAdversaries) { countByAdv[a.adversaryId] = (countByAdv[a.adversaryId] || 0) + 1 }
      const indexByAdv = {}
      return active.map((a) => {
        indexByAdv[a.adversaryId] = (indexByAdv[a.adversaryId] || 0) + 1
        const needsNumber = countByAdv[a.adversaryId] > 1
        return { ...a, displayName: needsNumber ? `${a.name} #${indexByAdv[a.adversaryId]}` : a.name }
      })
    })
    const aoeTotalTargets = computed(() => Object.values(aoeDamage.value).filter((v) => v > 0).length)

    /** Pose directement les HP à marquer pour une cible AoE */
    function aoeSetHp(targetId, hp) {
      aoeDamage.value = { ...aoeDamage.value, [targetId]: hp }
    }

    function aoeUndoTarget(targetId) {
      const copy = { ...aoeDamage.value }
      delete copy[targetId]
      aoeDamage.value = copy
    }
    function applyAoe() {
      const dmg = aoeDamage.value
      const advCustom = {}
      const pcHits = []
      for (const [targetId, amount] of Object.entries(dmg)) {
        if (amount <= 0) continue
        if (targetId.startsWith('pc_')) { pcHits.push({ pcId: targetId.slice(3), amount }) }
        else { advCustom[targetId] = amount }
      }
      if (Object.keys(advCustom).length > 0) store.applyAoeDamagePerTarget(advCustom)
      if (pcHits.length > 0) store.applyAoeDamageToPcsPerTarget(pcHits)
      aoeDamage.value = {}
      aoeMode.value = false
    }

    // ── Fin ──
    const showEndSummary = ref(false)
    const endSummaryData = ref(null)

    // ── Navigation tablette ──
    const tabletMainTab = ref('adv')

    // ── Raccourcis clavier ──
    function onKeydown(e) {
      if (!store.isActive) return
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (store.undoStack.length > 0) { e.preventDefault(); store.undo() }
        return
      }
      if (e.key === 'Tab') { e.preventDefault(); store.swapSpotlight(); return }
      if (e.key === 'Escape') {
        if (aoeMode.value) aoeMode.value = false
        if (showReinforcementPanel.value) showReinforcementPanel.value = false
        if (showEndSummary.value) showEndSummary.value = false
        return
      }
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.shiftKey) {
          const groups = store.groupedAdversaries
          if (num <= groups.length) { e.preventDefault(); store.selectAdversaryGroup(groups[num - 1].adversaryId) }
        } else {
          const pcs = store.participantPcs
          if (num <= pcs.length) { e.preventDefault(); store.selectPc(pcs[num - 1].id) }
        }
      }
    }

    onMounted(() => {
      if (!store.isActive) store.restoreState()
      window.addEventListener('keydown', onKeydown)
    })
    onUnmounted(() => { window.removeEventListener('keydown', onKeydown) })

    return {
      store, isPcActor, hasAdversaries,
      pcPrimary: pcFeatures.primaryFeatures,
      pcSecondary: pcFeatures.secondaryFeatures,
      pcPassive: pcFeatures.passiveFeatures,
      pcReaction: pcFeatures.reactionFeatures,
      pcAllFeatures: pcFeatures.allFeatures,
      onSelectPc, onSelectAdversaryGroup,
      onApplyDamage, onMarkStress, onClearStress, onClearHP, onDefeat, onRevive,
      onTogglePcCondition, onToggleAdvCondition,
      showReinforcementPanel, addReinforcement,
      aoeMode, aoeDamage, aoeAvailableInstances, aoeTotalTargets,
      aoeSetHp, aoeUndoTarget, applyAoe,
      showCountdownBar,
      onAddCountdown, onRemoveCountdown, onTickCountdown, onUntickCountdown,
      onAdvanceCountdownByResult, onResetCountdown,
      showEndSummary, endSummaryData,
      tabletMainTab
    }
  },
  methods: {
    confirmEndEncounter() {
      this.endSummaryData = this.store.generateSummary()
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
/* ══ Racine ══ */
.live { display: flex; flex-direction: column; height: 100vh; transition: background-color 0.3s; }
.live--pcAttack { background-color: rgba(83, 168, 182, 0.03); }
.live--adversaryAttack { background-color: rgba(200, 75, 49, 0.05); }
.live__inactive { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-xl); min-height: 60vh; color: var(--color-text-muted); }
.live__go-builder { padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); border: 1px solid var(--color-accent-hope); background: transparent; color: var(--color-accent-hope); cursor: pointer; }

/* ══ Header ══ */
.live__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--color-border); background: var(--color-bg-secondary); flex-shrink: 0; min-height: var(--touch-min); }
.live__header-info { display: flex; align-items: center; gap: var(--space-sm); flex: 1; min-width: 0; flex-wrap: wrap; }
.live__header-actions { display: flex; align-items: center; gap: var(--space-xs); flex-shrink: 0; }
.live__title { font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 16rem; }
.live__tier { font-size: var(--font-size-xs); color: var(--color-accent-gold); font-weight: var(--font-weight-bold); padding: 1px var(--space-xs); background: rgba(224, 165, 38, 0.1); border-radius: var(--radius-sm); white-space: nowrap; }
.live__mode-btn { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: transparent; font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); cursor: pointer; transition: background var(--transition-fast); touch-action: manipulation; white-space: nowrap; }
.live__mode-btn--pcAttack { color: var(--color-accent-hope); border-color: var(--color-accent-hope); }
.live__mode-btn--adversaryAttack { color: var(--color-accent-fear); border-color: var(--color-accent-fear); }
.live__mode-btn:hover { background: var(--color-bg-elevated); }
.live__combat-sum { font-size: var(--font-size-xs); color: var(--color-text-secondary); white-space: nowrap; }
.live__undo-btn { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border-radius: var(--radius-md); border: 1px solid var(--color-text-muted); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; font-variant-numeric: tabular-nums; touch-action: manipulation; }
.live__undo-btn:hover { background: var(--color-bg-elevated); }
.live__end-btn { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border-radius: var(--radius-md); border: 1px solid var(--color-accent-danger); background: transparent; color: var(--color-accent-danger); font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); cursor: pointer; touch-action: manipulation; }
.live__end-btn:hover { background: rgba(244, 67, 54, 0.1); }
.live__aoe-btn { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border-radius: var(--radius-md); border: 1px solid var(--color-accent-warning); background: transparent; color: var(--color-accent-warning); font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); cursor: pointer; transition: background var(--transition-fast); touch-action: manipulation; }
.live__aoe-btn:hover { background: rgba(255, 152, 0, 0.1); }
.live__aoe-btn--on { background: rgba(255, 152, 0, 0.2); }
.live__cd-btn { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); min-width: var(--touch-min); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: transparent; font-size: var(--font-size-sm); cursor: pointer; touch-action: manipulation; }
.live__cd-btn:hover { background: var(--color-bg-elevated); border-color: var(--color-border-active); }

/* ══ Tabs tablette (masquées par défaut, visibles uniquement en tablette) ══ */
.live__tablet-tabs { display: none; }
.live__tablet-tab { flex: 1; padding: var(--space-sm) var(--space-md); min-height: var(--touch-min); border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--color-text-muted); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); cursor: pointer; touch-action: manipulation; transition: color var(--transition-fast), border-color var(--transition-fast); }
.live__tablet-tab:hover { color: var(--color-text-primary); }
.live__tablet-tab--active { color: var(--color-text-primary); border-bottom-color: var(--color-accent-hope); font-weight: var(--font-weight-bold); }

/* ══ Grille 3 colonnes — chaque colonne scrolle indépendamment ══ */
.live__grid { display: grid; grid-template-columns: minmax(140px, 1fr) minmax(300px, 2.5fr) minmax(240px, 1.5fr); gap: 0; flex: 1; min-height: 0; overflow: hidden; }
.live__col-pc { display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm); overflow-y: auto; border-right: 1px solid var(--color-border); }
.live__col-adv { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-sm); overflow-y: auto; }
.live__col-ctx { overflow-y: auto; overflow-x: hidden; }

/* ══ Breakpoint tablette : 768px – 1023px ══ */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Header : titre plus lisible */
  .live__title { font-size: var(--font-size-lg); max-width: 20rem; }
  .live__tier { font-size: var(--font-size-sm); }
  .live__mode-btn { font-size: var(--font-size-sm); }

  /* Grille 2 colonnes : PC sidebar | zone principale */
  .live__grid {
    grid-template-columns: minmax(180px, 220px) 1fr;
    grid-template-rows: 1fr;
  }
  .live__col-pc {
    grid-column: 1;
    grid-row: 1;
    flex-direction: column;
    border-right: 1px solid var(--color-border);
    border-bottom: none;
    overflow-y: auto;
    padding: var(--space-sm);
    gap: var(--space-sm);
  }
  /* Les 2 colonnes occupent le même slot de grille, l'une visible à la fois */
  .live__col-adv {
    grid-column: 2;
    grid-row: 1;
  }
  .live__col-ctx {
    grid-column: 2;
    grid-row: 1;
    max-height: none;
    border-top: none;
  }
  /* Masquage de la colonne inactive via les tabs tablette */
  .live__col--tablet-hidden { display: none; }

  /* Tabs tablette visibles */
  .live__tablet-tabs {
    display: flex;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    flex-shrink: 0;
  }
}

/* ══ Breakpoint mobile : < 768px ══ */
@media (max-width: 767px) {
  .live__grid { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; height: auto; }
  .live__col-pc { flex-direction: row; overflow-x: auto; overflow-y: visible; border-right: none; border-bottom: 1px solid var(--color-border); padding: var(--space-xs) var(--space-sm); }
  .live__col-adv { min-height: 40vh; }
  .live__col-ctx { border-top: 1px solid var(--color-border); max-height: 40vh; overflow-y: auto; }
  /* En mobile, les tabs tablette restent masquées, les 2 colonnes sont toujours visibles */
  .live__col--tablet-hidden { display: flex; }
}

/* ══ Bouton Renforts (header) ══ */
.live__reinforce-header-btn { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border-radius: var(--radius-md); border: 1px dashed var(--color-border); background: transparent; color: var(--color-text-muted); font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); cursor: pointer; transition: border-color var(--transition-fast), color var(--transition-fast); touch-action: manipulation; }
.live__reinforce-header-btn:hover, .live__reinforce-header-btn--open { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }

/* ══ Overlays ══ */
.live__overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; padding: var(--space-md); }

/* AoE modal */
.live__aoe-modal { background: var(--color-bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); }
.live__aoe-header { display: flex; justify-content: space-between; align-items: center; font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.live__aoe-header button { min-width: var(--touch-min); min-height: var(--touch-min); border: none; background: transparent; color: var(--color-text-muted); font-size: var(--font-size-md); cursor: pointer; touch-action: manipulation; }
.live__aoe-row { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs); border-radius: var(--radius-sm); background: var(--color-bg-primary); }
.live__aoe-row--hit { background: rgba(244, 67, 54, 0.1); }
.live__aoe-name { flex: 1; font-size: var(--font-size-xs); color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.live__aoe-hp { font-size: var(--font-size-xs); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
.live__aoe-thresh { display: flex; gap: 2px; }
.live__aoe-th { min-width: var(--touch-min); min-height: var(--touch-min); border: none; border-radius: var(--radius-sm); font-size: var(--font-size-md); font-weight: var(--font-weight-bold); cursor: pointer; display: flex; align-items: center; justify-content: center; touch-action: manipulation; }
.live__aoe-th:active { filter: brightness(1.3); transform: scale(0.95); }
.live__aoe-th--1 { background: rgba(76, 175, 80, 0.25); color: var(--color-accent-success); }
.live__aoe-th--2 { background: rgba(255, 152, 0, 0.25); color: var(--color-accent-warning); }
.live__aoe-th--3 { background: rgba(244, 67, 54, 0.25); color: var(--color-accent-danger); }
.live__aoe-dmg { font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); color: var(--color-accent-danger); }
.live__aoe-undo { border: none; background: transparent; color: var(--color-text-muted); cursor: pointer; font-size: var(--font-size-xs); }
.live__aoe-footer { display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-sm); border-top: 1px solid var(--color-border); font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.live__aoe-footer button { padding: var(--space-xs) var(--space-md); min-height: var(--touch-min); border-radius: var(--radius-md); border: 1px solid var(--color-accent-danger); background: var(--color-accent-danger); color: white; font-weight: var(--font-weight-bold); cursor: pointer; touch-action: manipulation; }
.live__aoe-footer button:disabled { opacity: 0.4; cursor: not-allowed; }

/* End modal */
.live__end-modal { background: var(--color-bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 500px; width: 100%; padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }
.live__end-modal h2 { margin: 0; font-size: var(--font-size-lg); color: var(--color-text-primary); }
.live__end-stats { display: flex; gap: var(--space-md); }
.live__end-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.live__end-val { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.live__end-section h3 { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0 0 var(--space-xs); }
.live__end-row { display: flex; justify-content: space-between; font-size: var(--font-size-xs); color: var(--color-text-primary); padding: 2px 0; }
.live__end-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); padding-top: var(--space-sm); }
.live__end-actions button { padding: var(--space-xs) var(--space-md); min-height: var(--touch-min); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); cursor: pointer; touch-action: manipulation; }
.live__end-confirm { border-color: var(--color-accent-danger) !important; background: var(--color-accent-danger) !important; color: white !important; font-weight: var(--font-weight-bold); }
</style>
