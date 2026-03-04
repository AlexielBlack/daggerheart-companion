<template>
  <section
    class="adv-panel"
    :class="{ 'adv-panel--actor': isActor }"
    aria-label="Panel adversaire"
  >
    <!-- En-tête (partagé) -->
    <div class="adv-panel__header">
      <div class="adv-panel__identity">
        <h3 class="adv-panel__name">
          {{ adversary.name }}
        </h3>
        <span class="adv-panel__type">{{ adversary.type }}</span>
        <span
          v-if="hasSiblings"
          class="adv-panel__group-count"
        >×{{ siblings.length }}</span>
      </div>
      <div
        v-if="isActor"
        class="adv-panel__role-badge adv-panel__role-badge--actor"
      >
        Acteur
      </div>
      <div
        v-else
        class="adv-panel__role-badge adv-panel__role-badge--target"
      >
        Cible
      </div>
    </div>

    <!-- Stats principales (partagées) -->
    <div class="adv-panel__stats">
      <div
        class="adv-panel__stat adv-panel__stat--big"
        title="Difficulté"
      >
        <span class="adv-panel__stat-label">Diff</span>
        <span class="adv-panel__stat-value">{{ adversary.difficulty }}</span>
      </div>
      <div
        v-if="adversary.thresholds"
        class="adv-panel__stat"
        title="Seuil Majeur"
      >
        <span class="adv-panel__stat-label">Maj</span>
        <span class="adv-panel__stat-value">{{ adversary.thresholds.major || '—' }}</span>
      </div>
      <div
        v-if="adversary.thresholds"
        class="adv-panel__stat"
        title="Seuil Sévère"
      >
        <span class="adv-panel__stat-label">Sév</span>
        <span class="adv-panel__stat-value">{{ adversary.thresholds.severe || '—' }}</span>
      </div>
    </div>

    <!-- HP / Stress — barres individuelles par instance -->
    <div class="adv-panel__instances">
      <div
        v-for="(inst, idx) in siblings"
        :key="inst.instanceId"
        class="adv-panel__instance"
        :class="{
          'adv-panel__instance--selected': inst.instanceId === adversary.instanceId,
          'adv-panel__instance--defeated': inst.isDefeated
        }"
        role="button"
        tabindex="0"
        :aria-label="'Sélectionner instance #' + (idx + 1)"
        @click="selectInstance(inst.instanceId)"
        @keydown.enter="selectInstance(inst.instanceId)"
        @keydown.space.prevent="selectInstance(inst.instanceId)"
      >
        <!-- Label #N (affiché uniquement si plusieurs) -->
        <div class="adv-panel__inst-header">
          <span
            v-if="hasSiblings"
            class="adv-panel__inst-id"
          >#{{ idx + 1 }}</span>
          <span
            v-if="inst.isDefeated"
            class="adv-panel__inst-defeated"
          >💀 Vaincu</span>
          <!-- Conditions de cette instance -->
          <span
            v-for="cond in inst.conditions"
            :key="cond"
            class="adv-panel__inst-cond"
          >{{ cond }}</span>
        </div>

        <!-- Barres HP et Stress avec contrôles -->
        <div class="adv-panel__bars">
          <div class="adv-panel__bar-row">
            <span class="adv-panel__bar-label">HP</span>
            <button
              class="adv-panel__bar-btn"
              :disabled="inst.markedHP <= 0"
              aria-label="Retirer 1 HP"
              @click.stop="clearHP(inst.instanceId)"
            >
              −
            </button>
            <div class="adv-panel__bar">
              <div
                class="adv-panel__bar-fill adv-panel__bar-fill--hp"
                :style="{ width: hpPercent(inst) + '%' }"
              ></div>
            </div>
            <span class="adv-panel__bar-val">{{ inst.markedHP }}/{{ inst.maxHP }}</span>
            <button
              class="adv-panel__bar-btn"
              :disabled="inst.markedHP >= inst.maxHP || inst.isDefeated"
              aria-label="Marquer 1 HP"
              @click.stop="markHP(inst.instanceId)"
            >
              +
            </button>
          </div>
          <div class="adv-panel__bar-row">
            <span class="adv-panel__bar-label">ST</span>
            <button
              class="adv-panel__bar-btn"
              :disabled="inst.markedStress <= 0"
              aria-label="Retirer 1 Stress"
              @click.stop="clearStress(inst.instanceId)"
            >
              −
            </button>
            <div class="adv-panel__bar">
              <div
                class="adv-panel__bar-fill adv-panel__bar-fill--stress"
                :style="{ width: stressPercent(inst) + '%' }"
              ></div>
            </div>
            <span class="adv-panel__bar-val">{{ inst.markedStress }}/{{ inst.maxStress }}</span>
            <button
              class="adv-panel__bar-btn"
              :disabled="inst.markedStress >= inst.maxStress || inst.isDefeated"
              aria-label="Marquer 1 Stress"
              @click.stop="markStress(inst.instanceId)"
            >
              +
            </button>
          </div>
        </div>

        <!-- Boutons d'action : défaite / réanimer / raté -->
        <div class="adv-panel__inst-actions">
          <button
            v-if="!inst.isDefeated && !isActor"
            class="adv-panel__miss-btn"
            @click.stop="logPcMiss()"
          >
            ✕ Raté
          </button>
          <button
            v-if="!inst.isDefeated"
            class="adv-panel__defeat-btn"
            @click.stop="defeat(inst.instanceId)"
          >
            💀 Vaincre
          </button>
          <button
            v-else
            class="adv-panel__revive-btn"
            @click.stop="revive(inst.instanceId)"
          >
            ↩ Réanimer
          </button>
        </div>

        <!-- Log de dégâts pour cette instance -->
        <div
          v-if="instanceLogs[inst.instanceId] && instanceLogs[inst.instanceId].length > 0"
          class="adv-panel__log"
        >
          <button
            v-for="(entry, logIdx) in instanceLogs[inst.instanceId]"
            :key="logIdx"
            class="adv-panel__log-entry"
            :class="'adv-panel__log-entry--' + (entry.action === 'miss' ? 'miss' : entry.type)"
            :title="entry.action === 'miss'
              ? entry.pcName + ' : raté (clic pour annuler)'
              : 'R' + entry.round + ' — ' + entry.pcName + ' : ' + entry.amount + (entry.type === 'hp' ? ' HP' : ' ST') + ' (clic pour annuler)'"
            @click.stop="removeLogEntry(entry._globalIdx)"
          >
            {{ entry.pcName }} {{ entry.action === 'miss' ? '✕' : (entry.type === 'hp' ? '❤️' : '💢') }}{{ entry.action !== 'miss' ? entry.amount : '' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Attaque (si mode acteur) — partagée -->
    <div
      v-if="isActor && adversary.attack"
      class="adv-panel__attack"
    >
      <div class="adv-panel__attack-header">
        <span class="adv-panel__attack-name">{{ adversary.attack.name }}</span>
        <span class="adv-panel__attack-type">{{ adversary.attack.damageType === 'mag' ? '✨' : '🗡️' }}</span>
      </div>
      <div class="adv-panel__attack-stats">
        <span title="Modificateur">+{{ adversary.attack.modifier }}</span>
        <span title="Dégâts">🎲 {{ adversary.attack.damage }}</span>
        <span title="Portée">📏 {{ adversary.attack.range }}</span>
      </div>
    </div>

    <!-- Motives (partagées) -->
    <div
      v-if="adversary.motives && adversary.motives.length > 0"
      class="adv-panel__motives"
    >
      <span class="adv-panel__motives-label">Motivations :</span>
      <span class="adv-panel__motives-list">{{ adversary.motives.join(', ') }}</span>
    </div>

    <!-- Features classifiées (partagées) -->
    <div
      v-if="hasFeatures"
      class="adv-panel__features"
    >
      <div
        v-if="classified.actionFeatures.length > 0"
        class="adv-panel__feat-section"
      >
        <h4 class="adv-panel__feat-title adv-panel__feat-title--action">
          🟢 Actions
          <span class="adv-panel__feat-count">{{ classified.actionFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in classified.actionFeatures"
          :key="f.name"
          :feature="f"
        />
      </div>

      <div
        v-if="classified.reactionFeatures.length > 0"
        class="adv-panel__feat-section"
      >
        <h4 class="adv-panel__feat-title adv-panel__feat-title--reaction">
          🟠 Réactions
          <span class="adv-panel__feat-count">{{ classified.reactionFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in classified.reactionFeatures"
          :key="f.name"
          :feature="f"
        />
      </div>

      <div
        v-if="classified.passiveFeatures.length > 0"
        class="adv-panel__feat-section"
      >
        <h4 class="adv-panel__feat-title adv-panel__feat-title--passive">
          🔵 Passives
          <span class="adv-panel__feat-count">{{ classified.passiveFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in classified.passiveFeatures"
          :key="f.name"
          :feature="f"
          :dimmed="true"
        />
      </div>
    </div>

    <!-- Focus préférentiel -->
    <div
      v-if="focusResults.length > 0"
      class="adv-panel__focus"
    >
      <h4 class="adv-panel__focus-title">
        🎯 Focus préférentiel
      </h4>
      <div
        v-for="result in focusResults"
        :key="result.characterId"
        class="adv-panel__focus-row"
      >
        <span class="adv-panel__focus-name">{{ result.characterName }}</span>
        <div class="adv-panel__focus-bar">
          <div
            class="adv-panel__focus-fill"
            :style="{ width: result.score + '%' }"
            :class="focusColorClass(result.score)"
          ></div>
        </div>
        <span class="adv-panel__focus-score">{{ result.score }}%</span>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import FeatureCard from './FeatureCard.vue'
import { classifyAdversaryFeatures } from '../composables/useEncounterFeatures'
import { useAdversaryFocus } from '@modules/adversaries/composables/useAdversaryFocus'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'

export default {
  name: 'AdversaryTargetPanel',
  components: { FeatureCard },
  props: {
    adversary: { type: Object, required: true },
    siblings: { type: Array, default: () => [] },
    sceneMode: { type: String, required: true },
    isActor: { type: Boolean, default: false },
    pcs: { type: Array, default: () => [] }
  },
  setup(props) {
    const store = useEncounterLiveStore()

    // Refs réactives pour le composable focus
    const advRef = computed(() => props.adversary)
    const pcsRef = computed(() => props.pcs)
    const { focusResults: rawFocusResults } = useAdversaryFocus(advRef, pcsRef)

    function selectInstance(instanceId) {
      store.setActiveAdversary(instanceId)
    }

    function markHP(instanceId) {
      store.markAdversaryHP(instanceId, 1)
    }

    function clearHP(instanceId) {
      store.clearAdversaryHP(instanceId, 1)
    }

    function markStress(instanceId) {
      store.markAdversaryStress(instanceId, 1)
    }

    function clearStress(instanceId) {
      store.clearAdversaryStress(instanceId, 1)
    }

    function defeat(instanceId) {
      store.defeatAdversary(instanceId)
    }

    function revive(instanceId) {
      store.reviveAdversary(instanceId)
    }

    /** Log de combat filtré par les instances siblings, avec index global */
    const siblingIds = computed(() =>
      props.siblings.map((s) => s.instanceId)
    )
    const instanceLogs = computed(() => {
      const logs = {}
      store.combatLog.forEach((entry, globalIdx) => {
        if (siblingIds.value.includes(entry.instanceId)) {
          if (!logs[entry.instanceId]) logs[entry.instanceId] = []
          logs[entry.instanceId].push({ ...entry, _globalIdx: globalIdx })
        }
      })
      return logs
    })

    function removeLogEntry(globalIdx) {
      store.removeCombatLogEntry(globalIdx)
    }

    function logPcMiss() {
      store.logMiss('pc')
    }

    return {
      rawFocusResults,
      selectInstance,
      markHP,
      clearHP,
      markStress,
      clearStress,
      defeat,
      revive,
      instanceLogs,
      removeLogEntry,
      logPcMiss
    }
  },
  computed: {
    hasSiblings() {
      return this.siblings.length > 1
    },
    classified() {
      return classifyAdversaryFeatures(this.adversary, this.sceneMode)
    },
    hasFeatures() {
      const c = this.classified
      return c.actionFeatures.length > 0 || c.passiveFeatures.length > 0 || c.reactionFeatures.length > 0
    },
    focusResults() {
      if (!this.pcs.length || !this.adversary.focusProfile) return []
      return this.rawFocusResults || []
    }
  },
  methods: {
    hpPercent(inst) {
      if (inst.maxHP <= 0) return 0
      return Math.round((inst.markedHP / inst.maxHP) * 100)
    },
    stressPercent(inst) {
      if (inst.maxStress <= 0) return 0
      return Math.round((inst.markedStress / inst.maxStress) * 100)
    },
    focusColorClass(score) {
      if (score >= 70) return 'adv-panel__focus-fill--high'
      if (score >= 40) return 'adv-panel__focus-fill--mid'
      return 'adv-panel__focus-fill--low'
    }
  }
}
</script>

<style scoped>
.adv-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  border-top: 3px solid var(--color-accent-fear);
}

.adv-panel--actor {
  border-top-color: #7c3aed;
}

/* ── Header ── */

.adv-panel__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.adv-panel__identity {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.adv-panel__name {
  font-size: var(--font-md, 1rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.adv-panel__type {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  padding: 1px var(--space-xs);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
}

.adv-panel__group-count {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-accent-gold);
  padding: 1px var(--space-xs);
  background: rgba(224, 165, 38, 0.15);
  border-radius: var(--radius-sm);
}

.adv-panel__role-badge {
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adv-panel__role-badge--actor {
  background: rgba(124, 58, 237, 0.15);
  color: #7c3aed;
}

.adv-panel__role-badge--target {
  background: rgba(200, 75, 49, 0.15);
  color: var(--color-accent-fear);
}

/* ── Stats ── */

.adv-panel__stats {
  display: flex;
  gap: var(--space-sm);
}

.adv-panel__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  min-width: 48px;
}

.adv-panel__stat--big {
  border: 1px solid var(--color-accent-gold);
  background: rgba(224, 165, 38, 0.05);
}

.adv-panel__stat-label {
  font-size: 0.6rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-weight: var(--font-semibold);
}

.adv-panel__stat-value {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* ── Instances (barres HP/Stress individuelles) ── */

.adv-panel__instances {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.adv-panel__instance {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s;
}

.adv-panel__instance:hover {
  border-color: var(--color-border-active);
}

.adv-panel__instance--selected {
  border-color: var(--color-accent-fear);
  box-shadow: 0 0 0 1px var(--color-accent-fear);
}

.adv-panel__instance--defeated {
  opacity: 0.4;
}

.adv-panel__inst-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.adv-panel__inst-id {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-accent-gold);
  min-width: 20px;
}

.adv-panel__inst-defeated {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-semibold);
}

.adv-panel__inst-cond {
  font-size: 0.65rem;
  padding: 1px var(--space-xs);
  background: rgba(244, 67, 54, 0.15);
  color: var(--color-accent-danger);
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
}

/* ── Bars ── */

.adv-panel__bars {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.adv-panel__bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.adv-panel__bar-label {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  width: 18px;
  text-align: right;
  font-weight: var(--font-semibold);
}

.adv-panel__bar {
  flex: 1;
  height: 10px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.adv-panel__bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.2s;
}

.adv-panel__bar-fill--hp { background: var(--color-accent-danger); }
.adv-panel__bar-fill--stress { background: #8b5cf6; }

.adv-panel__bar-val {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 36px;
  text-align: right;
}

/* ── Boutons +/− barres ── */

.adv-panel__bar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
  padding: 0;
}

.adv-panel__bar-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.adv-panel__bar-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* ── Boutons défaite / réanimer ── */

.adv-panel__defeat-btn {
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent-danger);
  background: transparent;
  color: var(--color-accent-danger);
  font-size: 0.65rem;
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s;
}

.adv-panel__defeat-btn:hover {
  background: rgba(244, 67, 54, 0.1);
}

.adv-panel__revive-btn {
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent-success);
  background: transparent;
  color: var(--color-accent-success);
  font-size: 0.65rem;
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s;
}

.adv-panel__revive-btn:hover {
  background: rgba(76, 175, 80, 0.1);
}

/* ── Combat log par instance ── */

.adv-panel__log {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding-top: 2px;
}

.adv-panel__log-entry {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  font-size: 0.6rem;
  font-weight: var(--font-semibold);
  line-height: 1.3;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.adv-panel__log-entry:hover {
  opacity: 0.5;
  text-decoration: line-through;
}

.adv-panel__log-entry--hp {
  background: rgba(244, 67, 54, 0.1);
  color: var(--color-accent-danger);
}

.adv-panel__log-entry--stress {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.adv-panel__log-entry--miss {
  background: rgba(107, 114, 128, 0.15);
  color: var(--color-text-muted);
}

/* ── Actions par instance ── */

.adv-panel__inst-actions {
  display: flex;
  gap: var(--space-xs);
  justify-content: flex-end;
}

.adv-panel__miss-btn {
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-text-muted);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.65rem;
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: background 0.15s;
}

.adv-panel__miss-btn:hover {
  background: rgba(107, 114, 128, 0.1);
}

/* ── Attack ── */

.adv-panel__attack {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-left: 3px solid #7c3aed;
}

.adv-panel__attack-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.adv-panel__attack-name {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.adv-panel__attack-type {
  font-size: 0.9rem;
}

.adv-panel__attack-stats {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

/* ── Motives ── */

.adv-panel__motives {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}

.adv-panel__motives-label {
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
}

/* ── Features ── */

.adv-panel__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.adv-panel__feat-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.adv-panel__feat-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.adv-panel__feat-title--action   { color: #22c55e; }
.adv-panel__feat-title--reaction { color: #f59e0b; }
.adv-panel__feat-title--passive  { color: #3b82f6; }

.adv-panel__feat-count {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-weight: normal;
}

/* ── Focus préférentiel ── */

.adv-panel__focus {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.adv-panel__focus-title {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-accent-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.adv-panel__focus-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.adv-panel__focus-name {
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  min-width: 60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adv-panel__focus-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.adv-panel__focus-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s;
}

.adv-panel__focus-fill--high { background: var(--color-accent-danger); }
.adv-panel__focus-fill--mid  { background: var(--color-accent-warning); }
.adv-panel__focus-fill--low  { background: var(--color-accent-success); }

.adv-panel__focus-score {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}
</style>
