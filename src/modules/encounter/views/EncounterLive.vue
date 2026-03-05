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
              :title="store.pcSpotlights[pc.id] >= 1 ? 'Clic: +1 · Maintenir: −1' : 'Marquer spotlight'"
              @click.stop="onPcSpotClick(pc.id)"
              @contextmenu.stop.prevent="store.decrementPcSpotlight(pc.id)"
              @pointerdown.stop="spotLongPressDown(() => store.decrementPcSpotlight(pc.id))"
              @pointerup.stop="spotLongPressUp()"
              @pointerleave.stop="spotLongPressUp()"
            >
              ✦
            </button>
          </button>
        </div>

        <!-- Indicateur de mode de scène central -->
        <div
          class="enc-live__mode-indicator"
          :class="'enc-live__mode-indicator--' + store.sceneMode"
          :title="isPcActor ? 'PJ attaque — cliquer pour inverser' : 'Adversaire attaque — cliquer pour inverser'"
          role="button"
          tabindex="0"
          aria-label="Inverser le projecteur"
          @click="store.swapSpotlight()"
          @keydown.enter="store.swapSpotlight()"
          @keydown.space.prevent="store.swapSpotlight()"
        >
          <span class="enc-live__mode-label">{{ isPcActor ? 'PJ Attaque' : 'MJ Attaque' }}</span>
          <span class="enc-live__mode-icon">{{ isPcActor ? '⚔️ →' : '← 💀' }}</span>
          <span class="enc-live__mode-hint">Tab pour inverser</span>
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
              :title="store.advSpotlights[group.adversaryId] >= 1 ? 'Clic: +1 · Maintenir: −1' : 'Marquer spotlight'"
              @click.stop="onAdvSpotClick(group.adversaryId)"
              @contextmenu.stop.prevent="store.decrementAdvSpotlight(group.adversaryId)"
              @pointerdown.stop="spotLongPressDown(() => store.decrementAdvSpotlight(group.adversaryId))"
              @pointerup.stop="spotLongPressUp()"
              @pointerleave.stop="spotLongPressUp()"
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
        <!-- Wrapper PJ -->
        <div
          v-if="store.activePc"
          class="enc-live__panel-wrap"
          :class="{ 'enc-live__panel--first': isPcActor, 'enc-live__panel--second': !isPcActor }"
        >
          <button
            v-if="isPcActor"
            class="enc-live__aoe-btn"
            :class="{ 'enc-live__aoe-btn--open': aoeMode }"
            title="Dégâts de zone (AoE)"
            aria-label="Dégâts de zone"
            @click="toggleAoeMode()"
          >
            💥 AoE
          </button>
          <PcLivePanel
            :pc="store.activePc"
            :is-actor="isPcActor"
            :scene-mode="store.sceneMode"
            :primary-features="pcPrimary"
            :secondary-features="pcSecondary"
            :passive-features="pcPassive"
            :reaction-features="pcReaction"
          />
        </div>

        <!-- Wrapper Adversaire -->
        <div
          v-if="store.activeAdversary"
          class="enc-live__panel-wrap"
          :class="{ 'enc-live__panel--first': !isPcActor, 'enc-live__panel--second': isPcActor }"
        >
          <button
            v-if="!isPcActor"
            class="enc-live__aoe-btn"
            :class="{ 'enc-live__aoe-btn--open': aoeMode }"
            title="Dégâts de zone (AoE)"
            aria-label="Dégâts de zone"
            @click="toggleAoeMode()"
          >
            💥 AoE
          </button>
          <AdversaryTargetPanel
            :adversary="store.activeAdversary"
            :siblings="store.activeAdversarySiblings"
            :scene-mode="store.sceneMode"
            :is-actor="!isPcActor"
            :pcs="store.participantPcs"
          />
        </div>
      </div>

      <!-- ── Panneau AoE (dégâts de zone) ── -->
      <div
        v-if="aoeMode"
        class="enc-live__aoe-panel"
      >
        <div class="enc-live__aoe-header">
          <span class="enc-live__aoe-title">💥 Dégâts de zone</span>
          <span class="enc-live__aoe-attacker">
            {{ aoeAttackerName }} attaque
          </span>
          <button
            class="enc-live__aoe-close"
            aria-label="Fermer le mode AoE"
            @click="aoeMode = false"
          >
            ✕
          </button>
        </div>

        <!-- Cibles adversaires -->
        <div class="enc-live__aoe-section">
          <div class="enc-live__aoe-section-header">
            <span class="enc-live__aoe-section-label">👹 Adversaires</span>
            <label class="enc-live__aoe-select-all">
              <input
                type="checkbox"
                :checked="allAdvSelected"
                @change="toggleAoeAllAdv"
              />
              <span>Tous ({{ aoeAvailableInstances.length }})</span>
            </label>
          </div>
          <div class="enc-live__aoe-targets">
            <label
              v-for="inst in aoeAvailableInstances"
              :key="inst.instanceId"
              class="enc-live__aoe-target"
              :class="{ 'enc-live__aoe-target--selected': aoeSelectedIds.includes(inst.instanceId) }"
            >
              <input
                type="checkbox"
                :value="inst.instanceId"
                :checked="aoeSelectedIds.includes(inst.instanceId)"
                @change="toggleAoeTarget(inst.instanceId)"
              />
              <span class="enc-live__aoe-target-name">{{ inst.displayName }}</span>
              <span class="enc-live__aoe-target-hp">❤️{{ inst.markedHP }}/{{ inst.maxHP }}</span>
            </label>
          </div>
        </div>

        <!-- Cibles PJ -->
        <div class="enc-live__aoe-section">
          <div class="enc-live__aoe-section-header">
            <span class="enc-live__aoe-section-label">🧑‍🤝‍🧑 PJs</span>
            <label class="enc-live__aoe-select-all">
              <input
                type="checkbox"
                :checked="allPcSelected"
                @change="toggleAoeAllPc"
              />
              <span>Tous ({{ store.participantPcs.length }})</span>
            </label>
          </div>
          <div class="enc-live__aoe-targets">
            <label
              v-for="pc in store.participantPcs"
              :key="'pc_' + pc.id"
              class="enc-live__aoe-target enc-live__aoe-target--pc"
              :class="{ 'enc-live__aoe-target--selected': aoeSelectedPcIds.includes(pc.id) }"
            >
              <input
                type="checkbox"
                :value="pc.id"
                :checked="aoeSelectedPcIds.includes(pc.id)"
                @change="toggleAoePcTarget(pc.id)"
              />
              <span class="enc-live__aoe-target-name">{{ pc.name }}</span>
              <span class="enc-live__aoe-target-hp">❤️{{ pc.maxHP }}</span>
            </label>
          </div>
        </div>

        <!-- Contrôles dégâts -->
        <div class="enc-live__aoe-controls">
          <input
            v-model.number="aoeDamageAmount"
            class="enc-live__aoe-input"
            type="number"
            min="1"
            placeholder="Dégâts"
            aria-label="Montant de dégâts AoE"
          />
          <div class="enc-live__aoe-type-btns">
            <button
              class="enc-live__aoe-type-btn"
              :class="{ 'enc-live__aoe-type-btn--active': aoeDamageType === 'hp' }"
              @click="aoeDamageType = 'hp'"
            >
              ❤️ HP
            </button>
            <button
              class="enc-live__aoe-type-btn"
              :class="{ 'enc-live__aoe-type-btn--active': aoeDamageType === 'stress' }"
              @click="aoeDamageType = 'stress'"
            >
              💢 Stress
            </button>
          </div>
          <button
            class="enc-live__aoe-apply"
            :disabled="aoeTotalSelected === 0 || !aoeDamageAmount || aoeDamageAmount <= 0"
            @click="applyAoe"
          >
            Appliquer ({{ aoeTotalSelected }})
          </button>
        </div>
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

    // ── Panneau AoE (dégâts de zone) ──────────────────────
    const aoeMode = ref(false)
    const aoeSelectedIds = ref([])
    const aoeSelectedPcIds = ref([])
    const aoeDamageAmount = ref(null)
    const aoeDamageType = ref('hp')

    /** Instances adversaires non vaincues, avec displayName numéroté (#1, #2…) */
    const aoeAvailableInstances = computed(() => {
      const active = store.liveAdversaries.filter((a) => !a.isDefeated)
      // Compter combien d'instances par adversaryId
      const countByAdv = {}
      for (const a of store.liveAdversaries) {
        countByAdv[a.adversaryId] = (countByAdv[a.adversaryId] || 0) + 1
      }
      // Numéroter les instances dont le groupe a plus d'un membre
      const indexByAdv = {}
      return active.map((a) => {
        indexByAdv[a.adversaryId] = (indexByAdv[a.adversaryId] || 0) + 1
        const needsNumber = countByAdv[a.adversaryId] > 1
        return {
          ...a,
          displayName: needsNumber ? `${a.name} #${indexByAdv[a.adversaryId]}` : a.name
        }
      })
    })

    /** Tous les adversaires sélectionnés ? */
    const allAdvSelected = computed(() =>
      aoeAvailableInstances.value.length > 0 &&
      aoeSelectedIds.value.length === aoeAvailableInstances.value.length
    )

    /** Tous les PJs sélectionnés ? */
    const allPcSelected = computed(() =>
      store.participantPcs.length > 0 &&
      aoeSelectedPcIds.value.length === store.participantPcs.length
    )

    /** Total cibles sélectionnées (adversaires + PJs) */
    const aoeTotalSelected = computed(() =>
      aoeSelectedIds.value.length + aoeSelectedPcIds.value.length
    )

    /** Nom de l'attaquant AoE selon le mode de scène */
    const aoeAttackerName = computed(() => {
      if (isPcActor.value) {
        return store.activePc ? store.activePc.name : '?'
      }
      return store.activeAdversary ? store.activeAdversary.name : '?'
    })

    function toggleAoeMode() {
      aoeMode.value = !aoeMode.value
      if (aoeMode.value) {
        // Présélectionner tous les adversaires actifs, aucun PJ
        aoeSelectedIds.value = aoeAvailableInstances.value.map((a) => a.instanceId)
        aoeSelectedPcIds.value = []
        aoeDamageAmount.value = null
        aoeDamageType.value = 'hp'
        showReinforcementPanel.value = false
      }
    }

    function toggleAoeTarget(instanceId) {
      const idx = aoeSelectedIds.value.indexOf(instanceId)
      if (idx >= 0) {
        aoeSelectedIds.value.splice(idx, 1)
      } else {
        aoeSelectedIds.value.push(instanceId)
      }
    }

    function toggleAoePcTarget(pcId) {
      const idx = aoeSelectedPcIds.value.indexOf(pcId)
      if (idx >= 0) {
        aoeSelectedPcIds.value.splice(idx, 1)
      } else {
        aoeSelectedPcIds.value.push(pcId)
      }
    }

    function toggleAoeAllAdv() {
      if (allAdvSelected.value) {
        aoeSelectedIds.value = []
      } else {
        aoeSelectedIds.value = aoeAvailableInstances.value.map((a) => a.instanceId)
      }
    }

    function toggleAoeAllPc() {
      if (allPcSelected.value) {
        aoeSelectedPcIds.value = []
      } else {
        aoeSelectedPcIds.value = store.participantPcs.map((p) => p.id)
      }
    }

    function applyAoe() {
      if (aoeTotalSelected.value === 0 || !aoeDamageAmount.value || aoeDamageAmount.value <= 0) return
      // Appliquer aux adversaires (store gère le log avec isAoE)
      if (aoeSelectedIds.value.length > 0) {
        store.applyAoeDamage(aoeSelectedIds.value, aoeDamageAmount.value, aoeDamageType.value)
      }
      // Appliquer aux PJs — log batché avec contexte attaquant correct
      if (aoeSelectedPcIds.value.length > 0) {
        store.applyAoeDamageToPcs(aoeSelectedPcIds.value, aoeDamageAmount.value)
      }
      aoeDamageAmount.value = null
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

      // Escape : fermer renforts / résumé / AoE
      if (e.key === 'Escape') {
        if (aoeMode.value) {
          aoeMode.value = false
        }
        if (showReinforcementPanel.value) {
          showReinforcementPanel.value = false
        }
        if (showEndSummary.value) {
          showEndSummary.value = false
        }
        return
      }

      // 1-9 : sélection rapide PJ / Shift+1-9 : adversaire
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.shiftKey) {
          // Shift+N : sélection rapide groupe adversaire par index
          const groups = store.groupedAdversaries
          if (num <= groups.length) {
            e.preventDefault()
            store.selectAdversaryGroup(groups[num - 1].adversaryId)
          }
        } else {
          // N : sélection rapide PJ par index
          const pcs = store.participantPcs
          if (num <= pcs.length) {
            e.preventDefault()
            store.selectPc(pcs[num - 1].id)
          }
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

    // ── Long press spotlights (alternative mobile au clic droit) ──
    let _lpTimer = null
    let _lpFired = false

    function spotLongPressDown(callback) {
      _lpFired = false
      _lpTimer = setTimeout(() => {
        _lpFired = true
        callback()
      }, 500)
    }

    function spotLongPressUp() {
      if (_lpTimer) {
        clearTimeout(_lpTimer)
        _lpTimer = null
      }
    }

    function spotLongPressFired() {
      return _lpFired
    }

    /** Gère le clic sur le bouton spotlight PJ avec long-press */
    function onPcSpotClick(pcId) {
      if (_lpFired) { _lpFired = false; return }
      store.togglePcSpotlight(pcId)
    }

    /** Gère le clic sur le bouton spotlight adversaire avec long-press */
    function onAdvSpotClick(advId) {
      if (_lpFired) { _lpFired = false; return }
      store.toggleAdvSpotlight(advId)
    }

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
      // AoE
      aoeMode,
      aoeSelectedIds,
      aoeSelectedPcIds,
      aoeDamageAmount,
      aoeDamageType,
      aoeAvailableInstances,
      allAdvSelected,
      allPcSelected,
      aoeTotalSelected,
      aoeAttackerName,
      toggleAoeMode,
      toggleAoeTarget,
      toggleAoePcTarget,
      toggleAoeAllAdv,
      toggleAoeAllPc,
      applyAoe,
      // Long press spotlights
      spotLongPressDown,
      spotLongPressUp,
      spotLongPressFired,
      onPcSpotClick,
      onAdvSpotClick,
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

/* ── Indicateur de mode de scène central ── */

.enc-live__mode-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 2px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  min-width: 100px;
}

.enc-live__mode-indicator:hover {
  background: var(--color-bg-elevated);
  transform: scale(1.05);
}

.enc-live__mode-indicator--pcAttack {
  border-color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.08);
}

.enc-live__mode-indicator--adversaryAttack {
  border-color: var(--color-accent-fear);
  background: rgba(200, 75, 49, 0.08);
}

.enc-live__mode-label {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.enc-live__mode-indicator--pcAttack .enc-live__mode-label {
  color: var(--color-accent-hope);
}

.enc-live__mode-indicator--adversaryAttack .enc-live__mode-label {
  color: var(--color-accent-fear);
}

.enc-live__mode-icon {
  font-size: 1.3rem;
  font-weight: var(--font-bold);
  white-space: nowrap;
  line-height: 1;
}

.enc-live__mode-hint {
  font-size: 0.55rem;
  color: var(--color-text-muted);
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

  .enc-live__mode-indicator {
    transform: rotate(0deg);
    flex-direction: row;
    gap: var(--space-xs);
    min-width: auto;
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

/* ── Bouton AoE ── */

.enc-live__panel-wrap {
  position: relative;
  min-width: 0;
}

.enc-live__aoe-btn {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--space-xs) var(--space-sm);
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-accent-warning);
  background: var(--color-bg-secondary);
  color: var(--color-accent-warning);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.enc-live__aoe-btn:hover {
  border-color: var(--color-accent-warning);
  background: rgba(255, 152, 0, 0.08);
}

.enc-live__aoe-btn--open {
  border-style: solid;
  border-color: var(--color-accent-warning);
  background: rgba(255, 152, 0, 0.12);
}

/* ── Panneau AoE ── */

.enc-live__aoe-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-accent-warning);
  border-radius: var(--radius-lg);
}

.enc-live__aoe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.enc-live__aoe-title {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-accent-warning);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.enc-live__aoe-attacker {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  font-style: italic;
  margin-left: auto;
  margin-right: var(--space-sm);
}

.enc-live__aoe-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--font-md);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.enc-live__aoe-close:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.enc-live__aoe-targets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.enc-live__aoe-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.enc-live__aoe-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.enc-live__aoe-section-label {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.enc-live__aoe-select-all {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  cursor: pointer;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
}

.enc-live__aoe-select-all:hover {
  border-color: var(--color-border-active);
}

.enc-live__aoe-target {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-xs);
  cursor: pointer;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  transition: border-color 0.15s, background 0.15s;
}

.enc-live__aoe-target:hover {
  border-color: var(--color-border-active);
}

.enc-live__aoe-target--selected {
  border-color: var(--color-accent-warning);
  background: rgba(255, 152, 0, 0.06);
}

.enc-live__aoe-target--pc {
  border-left: 3px solid var(--color-accent-hope);
}

.enc-live__aoe-target-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.enc-live__aoe-target-hp {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.enc-live__aoe-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.enc-live__aoe-input {
  width: 70px;
  height: 32px;
  padding: 0 var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  text-align: center;
  -moz-appearance: textfield;
}

.enc-live__aoe-input::-webkit-inner-spin-button,
.enc-live__aoe-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.enc-live__aoe-input:focus {
  outline: none;
  border-color: var(--color-accent-warning);
}

.enc-live__aoe-type-btns {
  display: flex;
  gap: 2px;
}

.enc-live__aoe-type-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.15s;
}

.enc-live__aoe-type-btn:hover {
  background: var(--color-bg-elevated);
}

.enc-live__aoe-type-btn--active {
  border-color: var(--color-accent-warning);
  color: var(--color-accent-warning);
  background: rgba(255, 152, 0, 0.08);
}

.enc-live__aoe-apply {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-warning);
  background: rgba(255, 152, 0, 0.1);
  color: var(--color-accent-warning);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: background 0.15s;
  margin-left: auto;
}

.enc-live__aoe-apply:hover:not(:disabled) {
  background: rgba(255, 152, 0, 0.2);
}

.enc-live__aoe-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
