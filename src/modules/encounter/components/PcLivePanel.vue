<template>
  <section
    class="pc-panel"
    :class="{ 'pc-panel--actor': isActor }"
    aria-label="Panel PJ actif"
  >
    <!-- En-tête PJ -->
    <div class="pc-panel__header">
      <div class="pc-panel__identity">
        <h3 class="pc-panel__name">
          {{ pc.name }}
        </h3>
        <span class="pc-panel__class">{{ pc.className }}</span>
        <span class="pc-panel__level">Nv.{{ pc.level }}</span>
      </div>
      <div
        v-if="isActor"
        class="pc-panel__role-badge pc-panel__role-badge--actor"
      >
        Acteur
      </div>
      <div
        v-else
        class="pc-panel__role-badge pc-panel__role-badge--target"
      >
        Cible
      </div>
    </div>

    <!-- Stats condensées -->
    <div class="pc-panel__stats">
      <div
        class="pc-panel__stat"
        title="Hit Points"
      >
        <span class="pc-panel__stat-icon">❤️</span>
        <span class="pc-panel__stat-value">{{ pc.maxHP }}</span>
        <span class="pc-panel__stat-label">HP</span>
      </div>
      <div
        class="pc-panel__stat"
        title="Stress"
      >
        <span class="pc-panel__stat-icon">💢</span>
        <span class="pc-panel__stat-value">{{ pc.maxStress }}</span>
        <span class="pc-panel__stat-label">Stress</span>
      </div>
      <div
        class="pc-panel__stat"
        :class="{ 'pc-panel__stat--highlight': !isActor }"
        title="Évasion"
      >
        <span class="pc-panel__stat-icon">🏃</span>
        <span class="pc-panel__stat-value">{{ effectiveEvasion }}</span>
        <span class="pc-panel__stat-label">Évasion</span>
      </div>
      <div
        class="pc-panel__stat"
        :class="{ 'pc-panel__stat--highlight': !isActor }"
        title="Armure"
      >
        <span class="pc-panel__stat-icon">🛡️</span>
        <span class="pc-panel__stat-value">{{ pc.armorScore || 0 }}</span>
        <span class="pc-panel__stat-label">Armure</span>
      </div>
      <div
        v-if="pc.armorBaseThresholds"
        class="pc-panel__stat"
        title="Seuils (Majeur/Sévère)"
      >
        <span class="pc-panel__stat-icon">⚔️</span>
        <span class="pc-panel__stat-value">
          {{ pc.armorBaseThresholds.major || 0 }}/{{ pc.armorBaseThresholds.severe || 0 }}
        </span>
        <span class="pc-panel__stat-label">Seuils</span>
      </div>
      <button
        v-if="isActor"
        class="pc-panel__aoe-btn"
        :class="{ 'pc-panel__aoe-btn--open': aoeActive }"
        title="Dégâts de zone (AoE)"
        aria-label="Dégâts de zone"
        @click="$emit('aoe-click')"
      >
        💥 AoE
      </button>
    </div>

    <!-- Conditions -->
    <div class="pc-panel__conditions">
      <button
        v-for="cond in allConditions"
        :key="cond.id"
        class="pc-panel__cond-btn"
        :class="{ 'pc-panel__cond-btn--on': hasCond(cond.id) }"
        :title="cond.label"
        @click="toggleCond(cond.id)"
      >
        {{ cond.emoji }}
      </button>
    </div>

    <!-- Arme (affichée en mode acteur/attaque) — layout compact -->
    <div
      v-if="isActor && weapon"
      class="pc-panel__weapon"
    >
      <div class="pc-panel__weapon-row">
        <span class="pc-panel__weapon-name">{{ weapon.name }}</span>
        <span class="pc-panel__weapon-badges">
          <span class="pc-panel__weapon-type">{{ weapon.damageType === 'mag' ? '✨' : '🗡️' }}</span>
          <span title="Dés de dégâts">🎲 {{ weapon.damage }}+{{ pc.proficiency || 0 }}</span>
          <span title="Trait">{{ weapon.trait }}</span>
          <span title="Portée">📏 {{ weapon.range }}</span>
          <span
            v-if="weapon.burden"
            title="Prise"
          >✋ {{ weapon.burden }}</span>
        </span>
      </div>
      <div
        v-if="weapon.feature"
        class="pc-panel__weapon-feat"
      >
        {{ weapon.feature }}
      </div>
    </div>

    <!-- Contrôles dégâts reçus (quand adversaire attaque) -->
    <div
      v-if="!isActor"
      class="pc-panel__hit-controls"
    >
      <span class="pc-panel__hit-label">HP marqués :</span>
      <div class="pc-panel__hit-btns">
        <button
          v-for="n in 4"
          :key="n"
          class="pc-panel__hit-btn"
          :title="'Marquer ' + n + ' HP'"
          @click="logHit(n)"
        >
          {{ n }}
        </button>
        <button
          class="pc-panel__armor-btn"
          :title="'Armure utilisée (score: ' + pc.armorScore + ')'"
          @click="logArmor()"
        >
          🛡️
        </button>
      </div>
      <button
        class="pc-panel__down-btn"
        :class="{ 'pc-panel__down-btn--active': isDown }"
        :title="isDown ? 'Annuler la mise à terre' : 'PJ mis à terre'"
        @click="logDown()"
      >
        💀 {{ isDown ? 'Annuler' : 'Down' }}
      </button>
      <button
        v-if="isDown"
        class="pc-panel__revive-btn"
        title="Réanimer le PJ"
        @click="logRevive()"
      >
        ↩ Revive
      </button>
      <button
        class="pc-panel__miss-btn"
        title="Attaque ratée"
        @click="logAdvMiss()"
      >
        ✕ Raté
      </button>
    </div>

    <!-- Indicateur Down persistant (visible aussi au tour PJ) -->
    <div
      v-if="isDown && isActor"
      class="pc-panel__down-indicator"
    >
      💀 À terre
      <button
        class="pc-panel__revive-btn pc-panel__revive-btn--inline"
        @click="logRevive()"
      >
        ↩ Revive
      </button>
    </div>

    <!-- Log des coups reçus -->
    <div
      v-if="pcHitLog.length > 0"
      class="pc-panel__hit-log"
    >
      <button
        v-for="(entry, idx) in pcHitLog"
        :key="idx"
        class="pc-panel__hit-entry"
        :class="{
          'pc-panel__hit-entry--miss': entry.action === 'miss',
          'pc-panel__hit-entry--armor': entry.action === 'pc_armor'
        }"
        :title="entry.action === 'miss'
          ? entry.advName + ' : raté (clic pour annuler)'
          : entry.action === 'pc_armor'
            ? '🛡️ armure utilisée (clic pour annuler)'
            : entry.advName + ' : ' + (entry.hpMarked || 0) + ' HP (clic pour annuler)'"
        @click="removeHitLog(entry._globalIdx)"
      >
        {{ entry.action === 'pc_armor' ? '🛡️' : entry.advName }}
        {{ entry.action === 'miss' ? '✕' : entry.action === 'pc_armor' ? '' : ('❤️' + entry.hpMarked) }}
      </button>
    </div>

    <!-- Expériences -->
    <div
      v-if="pcExperiences.length > 0"
      class="pc-panel__experiences"
    >
      <h4 class="pc-panel__exp-title">
        📋 Expériences
      </h4>
      <div
        v-for="exp in pcExperiences"
        :key="exp.name"
        class="pc-panel__exp"
      >
        <span class="pc-panel__exp-name">{{ exp.name }}</span>
        <span
          v-if="exp.bonus"
          class="pc-panel__exp-bonus"
        >+{{ exp.bonus }}</span>
      </div>
    </div>

    <!-- Features filtrées par section -->
    <div class="pc-panel__features">
      <!-- Features principales -->
      <div
        v-if="primaryFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--primary">
          {{ primaryLabel }}
          <span class="pc-panel__feat-count">{{ primaryFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in primaryFeatures"
          :key="f.name + f.source"
          :feature="f"
        />
      </div>

      <!-- Réactions -->
      <div
        v-if="reactionFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--reaction">
          🟠 Réactions
          <span class="pc-panel__feat-count">{{ reactionFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in reactionFeatures"
          :key="f.name + f.source"
          :feature="f"
        />
      </div>

      <!-- Features secondaires -->
      <div
        v-if="secondaryFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--secondary">
          Secondaires
          <span class="pc-panel__feat-count">{{ secondaryFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in secondaryFeatures"
          :key="f.name + f.source"
          :feature="f"
          :dimmed="true"
          :default-expanded="false"
        />
      </div>

      <!-- Passives -->
      <div
        v-if="passiveFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--passive">
          🔵 Passives
          <span class="pc-panel__feat-count">{{ passiveFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in passiveFeatures"
          :key="f.name + f.source"
          :feature="f"
          :dimmed="true"
          :default-expanded="false"
        />
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import FeatureCard from './FeatureCard.vue'
import { getPrimaryWeaponById } from '@data/equipment'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { LIVE_CONDITIONS } from '@data/encounters/liveConstants'

export default {
  name: 'PcLivePanel',
  components: { FeatureCard },
  props: {
    pc: { type: Object, required: true },
    isActor: { type: Boolean, default: true },
    sceneMode: { type: String, required: true },
    primaryFeatures: { type: Array, default: () => [] },
    secondaryFeatures: { type: Array, default: () => [] },
    passiveFeatures: { type: Array, default: () => [] },
    reactionFeatures: { type: Array, default: () => [] },
    aoeActive: { type: Boolean, default: false }
  },
  emits: ['aoe-click'],
  setup(props) {
    const store = useEncounterLiveStore()

    /** Log des coups reçus, armure et ratés par ce PJ, avec index global */
    const pcHitLog = computed(() => {
      const entries = []
      store.combatLog.forEach((entry, globalIdx) => {
        const isHit = entry.action === 'pc_hit' && entry.pcId === props.pc.id
        const isMiss = entry.action === 'miss' && entry.attackerType === 'adversary' && entry.pcId === props.pc.id
        const isArmor = entry.action === 'pc_armor' && entry.pcId === props.pc.id
        if (isHit || isMiss || isArmor) {
          entries.push({ ...entry, _globalIdx: globalIdx })
        }
      })
      return entries
    })

    const isDown = computed(() => !!store.pcDownStatus[props.pc.id])

    const allConditions = LIVE_CONDITIONS

    function hasCond(condId) {
      const conds = store.pcConditions[props.pc.id]
      return Array.isArray(conds) && conds.includes(condId)
    }

    function toggleCond(condId) {
      store.togglePcCondition(props.pc.id, condId)
    }

    function logHit(hpAmount) {
      store.logPcHit(props.pc.id, hpAmount)
    }

    function logDown() {
      store.logPcDown(props.pc.id)
    }

    function logRevive() {
      store.logPcRevive(props.pc.id)
    }

    function logAdvMiss() {
      store.logMiss('adversary')
    }

    function logArmor() {
      store.logPcArmorUsed(props.pc.id)
    }

    function removeHitLog(globalIdx) {
      store.removeCombatLogEntry(globalIdx)
    }

    return {
      pcHitLog,
      isDown,
      allConditions,
      hasCond,
      toggleCond,
      logHit,
      logDown,
      logRevive,
      logAdvMiss,
      logArmor,
      removeHitLog
    }
  },
  computed: {
    effectiveEvasion() {
      return (this.pc.evasion || 10) + (this.pc.evasionBonus || 0)
    },
    weapon() {
      if (!this.pc.primaryWeaponId) return null
      return getPrimaryWeaponById(this.pc.primaryWeaponId) || null
    },
    primaryLabel() {
      const labels = {
        pcAttack: '⚔️ Offensives',
        adversaryAttack: '🛡️ Défensives'
      }
      return labels[this.sceneMode] || '⚔️ Prioritaires'
    },
    pcExperiences() {
      return Array.isArray(this.pc.experiences)
        ? this.pc.experiences.filter((e) => e && e.name)
        : []
    }
  }
}
</script>

<style scoped>
.pc-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  border-top: 3px solid var(--color-accent-hope);
}

.pc-panel--actor {
  border-top-color: var(--color-accent-hope);
}

/* ── Header ── */

.pc-panel__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-panel__identity {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.pc-panel__name {
  font-size: var(--font-md, 1rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.pc-panel__class {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.pc-panel__level {
  font-size: var(--font-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-semibold);
}

.pc-panel__role-badge {
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pc-panel__role-badge--actor {
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope);
}

.pc-panel__role-badge--target {
  background: rgba(200, 75, 49, 0.15);
  color: var(--color-accent-fear);
}

/* ── Stats ── */

.pc-panel__stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
}

.pc-panel__stat {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px var(--space-xs);
  background: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
}

.pc-panel__stat--highlight {
  border: 1px solid var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.08);
}

.pc-panel__stat-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.pc-panel__stat-value {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.pc-panel__stat-label {
  color: var(--color-text-muted);
}

/* ── Bouton AoE (dans la ligne stats) ── */

.pc-panel__aoe-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: var(--space-xs) var(--space-sm);
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-accent-warning);
  background: transparent;
  color: var(--color-accent-warning);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.pc-panel__aoe-btn:hover {
  border-color: var(--color-accent-warning);
  background: rgba(255, 152, 0, 0.08);
}

.pc-panel__aoe-btn--open {
  border-style: solid;
  background: rgba(255, 152, 0, 0.12);
}

/* ── Conditions ── */

.pc-panel__conditions {
  display: flex;
  gap: 3px;
}

.pc-panel__cond-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
  opacity: 0.4;
}

.pc-panel__cond-btn:hover {
  opacity: 0.7;
  border-color: var(--color-border-active);
}

.pc-panel__cond-btn--on {
  opacity: 1;
  border-color: var(--color-accent-warning);
  background: rgba(255, 152, 0, 0.12);
}

/* ── Arme (compact) ── */

.pc-panel__weapon {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-left: 3px solid #dc2626;
}

.pc-panel__weapon-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-panel__weapon-name {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.pc-panel__weapon-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-left: auto;
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.pc-panel__weapon-type {
  font-size: 0.9rem;
}

.pc-panel__weapon-feat {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

/* ── Features ── */

.pc-panel__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pc-panel__feat-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.pc-panel__feat-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.pc-panel__feat-title--primary  { color: var(--color-accent-hope); }
.pc-panel__feat-title--reaction { color: #f59e0b; }
.pc-panel__feat-title--secondary { color: var(--color-text-muted); }
.pc-panel__feat-title--passive  { color: #3b82f6; }

.pc-panel__feat-count {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-weight: normal;
}

/* ── Experiences ── */

.pc-panel__experiences {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-left: 3px solid #d97706;
}

.pc-panel__exp-title {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: #d97706;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.pc-panel__exp {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-sm);
}

.pc-panel__exp-name {
  color: var(--color-text-primary);
  flex: 1;
}

.pc-panel__exp-bonus {
  font-weight: var(--font-bold);
  color: var(--color-accent-gold);
  font-variant-numeric: tabular-nums;
}

/* ── Hit controls (quand adversaire attaque) ── */

.pc-panel__hit-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(200, 75, 49, 0.06);
  border: 1px solid rgba(200, 75, 49, 0.2);
  border-radius: var(--radius-md);
}

.pc-panel__hit-label {
  font-size: var(--font-xs);
  color: var(--color-accent-fear);
  font-weight: var(--font-semibold);
  white-space: nowrap;
}

.pc-panel__hit-btns {
  display: flex;
  gap: 3px;
}

.pc-panel__hit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-fear);
  background: transparent;
  color: var(--color-accent-fear);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: background 0.15s;
}

.pc-panel__hit-btn:hover {
  background: rgba(200, 75, 49, 0.15);
}

.pc-panel__down-btn {
  margin-left: auto;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-danger);
  background: transparent;
  color: var(--color-accent-danger);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: background 0.15s;
}

.pc-panel__down-btn:hover {
  background: rgba(244, 67, 54, 0.15);
}

.pc-panel__down-btn--active {
  background: rgba(244, 67, 54, 0.15);
  border-style: dashed;
}

.pc-panel__revive-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-success);
  background: transparent;
  color: var(--color-accent-success);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: background 0.15s;
}

.pc-panel__revive-btn:hover {
  background: rgba(76, 175, 80, 0.15);
}

.pc-panel__revive-btn--inline {
  padding: 2px var(--space-sm);
  font-size: 0.65rem;
}

/* ── Down indicator ── */

.pc-panel__down-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: var(--radius-md);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-accent-danger);
}

/* ── Hit log (pastilles coups reçus) ── */

.pc-panel__hit-log {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.pc-panel__hit-entry {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: var(--font-semibold);
  line-height: 1.3;
  background: rgba(200, 75, 49, 0.1);
  color: var(--color-accent-fear);
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.pc-panel__hit-entry:hover {
  opacity: 0.5;
  text-decoration: line-through;
}

.pc-panel__hit-entry--miss {
  background: rgba(107, 114, 128, 0.15);
  color: var(--color-text-muted);
}

.pc-panel__hit-entry--armor {
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope);
}

.pc-panel__armor-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent-hope);
  background: transparent;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.pc-panel__armor-btn:hover {
  background: rgba(83, 168, 182, 0.15);
}

.pc-panel__miss-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-text-muted);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: background 0.15s;
}

.pc-panel__miss-btn:hover {
  background: rgba(107, 114, 128, 0.1);
}
</style>
