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
        <h1 class="live__title">
          {{ store.encounterName || 'Rencontre' }}
        </h1>
        <span class="live__tier">T{{ store.encounterTier }}</span>

        <button
          class="live__mode-btn"
          :class="'live__mode-btn--' + store.sceneMode"
          :title="isPcActor ? 'PJ attaque — Tab pour inverser' : 'MJ attaque — Tab pour inverser'"
          aria-label="Inverser le projecteur"
          @click="store.swapSpotlight()"
        >
          {{ isPcActor ? '⚔️ PJ Attaque' : '💀 MJ Attaque' }}
        </button>

        <span
          v-if="store.adversaryCombatSummary.count > 0"
          class="live__combat-sum"
        >
          {{ store.activeAdversaries.length }} actifs · {{ store.defeatedAdversaries.length }}💀
        </span>

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
          class="live__end-btn"
          @click="confirmEndEncounter"
        >
          Fin
        </button>
      </header>

      <!-- ══ Grille 3 colonnes ══ -->
      <div
        class="live__grid"
        :class="{ 'live__grid--social': !hasAdversaries }"
      >
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
          <button
            class="live__reinforce-btn"
            :class="{ 'live__reinforce-btn--open': showReinforcementPanel }"
            title="Ajouter des renforts"
            aria-label="Ajouter des renforts"
            @click="toggleReinforcementPanel()"
          >
            + Renforts
          </button>
          <div
            v-if="showReinforcementPanel"
            class="live__reinforce-panel"
          >
            <input
              v-model="reinforcementSearch"
              class="live__reinforce-search"
              type="text"
              placeholder="Rechercher un adversaire…"
              aria-label="Rechercher un adversaire"
            />
            <div class="live__reinforce-list">
              <button
                v-for="adv in filteredAdversaries"
                :key="adv.id"
                class="live__reinforce-item"
                @click="addReinforcement(adv.id)"
              >
                <span>{{ adv.name }}</span>
                <span class="live__reinforce-meta">{{ adv.type }} · T{{ adv.tier }}</span>
              </button>
              <p
                v-if="filteredAdversaries.length === 0"
                class="live__reinforce-empty"
              >
                Aucun résultat
              </p>
            </div>
          </div>
        </div>

        <!-- Colonne Contexte -->
        <div class="live__col-ctx">
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
          />
        </div>
      </div>

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
            <span class="live__aoe-name">{{ inst.displayName }}</span>
            <span class="live__aoe-hp">❤️{{ inst.markedHP }}/{{ inst.maxHP }}</span>
            <input
              class="live__aoe-input"
              type="number"
              min="1"
              placeholder="Dmg"
              :aria-label="'Dégâts de zone pour ' + inst.displayName"
              @click.stop
              @keydown.enter.stop="aoeSetDamage(inst.instanceId, $event)"
            />
            <span
              v-if="aoeDamage[inst.instanceId] > 0"
              class="live__aoe-dmg"
            >−{{ aoeDamage[inst.instanceId] }}</span>
            <button
              v-if="aoeDamage[inst.instanceId] > 0"
              class="live__aoe-undo"
              @click="aoeUndoTarget(inst.instanceId)"
            >
              ↩
            </button>
          </div>
          <div
            v-for="pc in store.participantPcs"
            :key="'pc_' + pc.id"
            class="live__aoe-row"
          >
            <span class="live__aoe-name">🧑 {{ pc.name }}</span>
            <span class="live__aoe-hp">Évasion {{ (pc.evasion || 10) + (pc.evasionBonus || 0) }}</span>
            <input
              class="live__aoe-input"
              type="number"
              min="1"
              placeholder="HP"
              :aria-label="'Dégâts de zone pour ' + pc.name"
              @click.stop
              @keydown.enter.stop="aoeSetDamage('pc_' + pc.id, $event)"
            />
            <span
              v-if="aoeDamage['pc_' + pc.id] > 0"
              class="live__aoe-dmg"
            >−{{ aoeDamage['pc_' + pc.id] }}</span>
            <button
              v-if="aoeDamage['pc_' + pc.id] > 0"
              class="live__aoe-undo"
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
import { allAdversaries } from '@data/adversaries'
import PcSidebarCard from '../components/PcSidebarCard.vue'
import AdversaryGroupCard from '../components/AdversaryGroupCard.vue'
import ContextPanel from '../components/ContextPanel.vue'

export default {
  name: 'EncounterLive',
  components: { PcSidebarCard, AdversaryGroupCard, ContextPanel },
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
    const reinforcementSearch = ref('')
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
      return list.slice(0, 20)
    })
    function toggleReinforcementPanel() {
      showReinforcementPanel.value = !showReinforcementPanel.value
      if (showReinforcementPanel.value) reinforcementSearch.value = ''
    }
    function addReinforcement(adversaryId) { store.addReinforcement(adversaryId, 1) }

    // ── AoE ──
    const aoeMode = ref(false)
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
    function aoeSetDamage(targetId, event) {
      const val = parseInt(event.target.value)
      if (!val || val <= 0) return
      aoeDamage.value = { ...aoeDamage.value, [targetId]: val }
      event.target.value = ''
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
      onSelectPc, onSelectAdversaryGroup,
      onApplyDamage, onMarkStress, onClearStress, onClearHP, onDefeat, onRevive,
      onTogglePcCondition, onToggleAdvCondition,
      showReinforcementPanel, reinforcementSearch, filteredAdversaries,
      toggleReinforcementPanel, addReinforcement,
      aoeMode, aoeDamage, aoeAvailableInstances, aoeTotalTargets,
      aoeSetDamage, aoeUndoTarget, applyAoe,
      showEndSummary, endSummaryData
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
.live { display: flex; flex-direction: column; min-height: 100vh; transition: background-color 0.3s; }
.live--pcAttack { background-color: rgba(83, 168, 182, 0.03); }
.live--adversaryAttack { background-color: rgba(200, 75, 49, 0.05); }
.live__inactive { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-xl); min-height: 60vh; color: var(--color-text-muted); }
.live__go-builder { padding: var(--space-sm) var(--space-lg); border-radius: var(--radius-md); border: 1px solid var(--color-accent-hope); background: transparent; color: var(--color-accent-hope); cursor: pointer; }

/* ══ Header ══ */
.live__header { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-xs) var(--space-sm); border-bottom: 1px solid var(--color-border); background: var(--color-bg-secondary); flex-wrap: wrap; flex-shrink: 0; }
.live__title { font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0; }
.live__tier { font-size: var(--font-size-xs); color: var(--color-accent-gold); font-weight: var(--font-weight-bold); padding: 1px var(--space-xs); background: rgba(224, 165, 38, 0.1); border-radius: var(--radius-sm); }
.live__mode-btn { padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: transparent; font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); cursor: pointer; transition: background var(--transition-fast); }
.live__mode-btn--pcAttack { color: var(--color-accent-hope); border-color: var(--color-accent-hope); }
.live__mode-btn--adversaryAttack { color: var(--color-accent-fear); border-color: var(--color-accent-fear); }
.live__mode-btn:hover { background: var(--color-bg-elevated); }
.live__combat-sum { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-left: auto; }
.live__undo-btn { padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); border: 1px solid var(--color-text-muted); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; font-variant-numeric: tabular-nums; }
.live__undo-btn:hover { background: var(--color-bg-elevated); }
.live__end-btn { padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md); border: 1px solid var(--color-accent-danger); background: transparent; color: var(--color-accent-danger); font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); cursor: pointer; }
.live__end-btn:hover { background: rgba(244, 67, 54, 0.1); }

/* ══ Grille 3 colonnes — chaque colonne scrolle indépendamment ══ */
.live__grid { display: grid; grid-template-columns: minmax(140px, 1fr) minmax(300px, 2.5fr) minmax(240px, 1.5fr); gap: 0; flex: 1; min-height: 0; overflow: hidden; height: calc(100vh - 3rem); }
.live__grid--social { grid-template-columns: minmax(200px, 1fr) minmax(280px, 1.5fr); }
.live__col-pc { display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm); overflow-y: auto; border-right: 1px solid var(--color-border); }
.live__col-adv { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-sm); overflow-y: auto; }
.live__col-ctx { overflow-y: auto; overflow-x: hidden; }

@media (max-width: 900px) {
  .live__grid { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; height: auto; }
  .live__col-pc { flex-direction: row; overflow-x: auto; overflow-y: visible; border-right: none; border-bottom: 1px solid var(--color-border); padding: var(--space-xs) var(--space-sm); }
  .live__col-adv { min-height: 40vh; }
  .live__col-ctx { border-top: 1px solid var(--color-border); max-height: 40vh; overflow-y: auto; }
}

/* ══ Renforts ══ */
.live__reinforce-btn { padding: var(--space-xs) var(--space-sm); border: 1px dashed var(--color-border); border-radius: var(--radius-md); background: transparent; color: var(--color-text-muted); font-size: var(--font-size-xs); cursor: pointer; text-align: center; transition: border-color var(--transition-fast), color var(--transition-fast); }
.live__reinforce-btn:hover, .live__reinforce-btn--open { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }
.live__reinforce-panel { display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-secondary); }
.live__reinforce-search { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-input); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.live__reinforce-search:focus { outline: none; border-color: var(--color-border-active); }
.live__reinforce-list { max-height: 10rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1px; }
.live__reinforce-item { display: flex; justify-content: space-between; padding: var(--space-xs) var(--space-sm); border: none; background: var(--color-bg-primary); color: var(--color-text-primary); font-size: var(--font-size-xs); cursor: pointer; text-align: left; }
.live__reinforce-item:hover { background: var(--color-bg-elevated); }
.live__reinforce-meta { color: var(--color-text-muted); }
.live__reinforce-empty { font-size: var(--font-size-xs); color: var(--color-text-muted); text-align: center; padding: var(--space-sm); margin: 0; }

/* ══ Overlays ══ */
.live__overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; padding: var(--space-md); }

/* AoE modal */
.live__aoe-modal { background: var(--color-bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); }
.live__aoe-header { display: flex; justify-content: space-between; align-items: center; font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.live__aoe-header button { border: none; background: transparent; color: var(--color-text-muted); font-size: var(--font-size-md); cursor: pointer; }
.live__aoe-row { display: flex; align-items: center; gap: var(--space-xs); padding: var(--space-xs); border-radius: var(--radius-sm); background: var(--color-bg-primary); }
.live__aoe-row--hit { background: rgba(244, 67, 54, 0.1); }
.live__aoe-name { flex: 1; font-size: var(--font-size-xs); color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.live__aoe-hp { font-size: var(--font-size-xs); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
.live__aoe-input { width: 3.5rem; padding: 2px var(--space-xs); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-input); color: var(--color-text-primary); font-size: var(--font-size-xs); text-align: center; }
.live__aoe-input:focus { outline: none; border-color: var(--color-accent-fear); }
.live__aoe-dmg { font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); color: var(--color-accent-danger); }
.live__aoe-undo { border: none; background: transparent; color: var(--color-text-muted); cursor: pointer; font-size: var(--font-size-xs); }
.live__aoe-footer { display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-sm); border-top: 1px solid var(--color-border); font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.live__aoe-footer button { padding: var(--space-xs) var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-accent-danger); background: var(--color-accent-danger); color: white; font-weight: var(--font-weight-bold); cursor: pointer; }
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
.live__end-actions button { padding: var(--space-xs) var(--space-md); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); cursor: pointer; }
.live__end-confirm { border-color: var(--color-accent-danger) !important; background: var(--color-accent-danger) !important; color: white !important; font-weight: var(--font-weight-bold); }
</style>
