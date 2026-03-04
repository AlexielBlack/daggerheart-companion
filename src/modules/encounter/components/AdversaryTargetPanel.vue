<template>
  <section
    class="adv-panel"
    :class="{ 'adv-panel--actor': isActor }"
    aria-label="Panel adversaire"
  >
    <!-- En-tête -->
    <div class="adv-panel__header">
      <div class="adv-panel__identity">
        <h3 class="adv-panel__name">
          {{ adversary.name }}
        </h3>
        <span class="adv-panel__type">{{ adversary.type }}</span>
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

    <!-- Stats principales -->
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

    <!-- HP / Stress live -->
    <div class="adv-panel__bars">
      <div class="adv-panel__bar-row">
        <span class="adv-panel__bar-label">HP</span>
        <div class="adv-panel__bar">
          <div
            class="adv-panel__bar-fill adv-panel__bar-fill--hp"
            :style="{ width: hpPercent + '%' }"
          ></div>
        </div>
        <span class="adv-panel__bar-val">{{ adversary.markedHP }}/{{ adversary.maxHP }}</span>
      </div>
      <div class="adv-panel__bar-row">
        <span class="adv-panel__bar-label">ST</span>
        <div class="adv-panel__bar">
          <div
            class="adv-panel__bar-fill adv-panel__bar-fill--stress"
            :style="{ width: stressPercent + '%' }"
          ></div>
        </div>
        <span class="adv-panel__bar-val">{{ adversary.markedStress }}/{{ adversary.maxStress }}</span>
      </div>
    </div>

    <!-- Attaque (si mode acteur) -->
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

    <!-- Motives -->
    <div
      v-if="adversary.motives && adversary.motives.length > 0"
      class="adv-panel__motives"
    >
      <span class="adv-panel__motives-label">Motivations :</span>
      <span class="adv-panel__motives-list">{{ adversary.motives.join(', ') }}</span>
    </div>

    <!-- Conditions -->
    <div
      v-if="adversary.conditions && adversary.conditions.length > 0"
      class="adv-panel__conditions"
    >
      <span
        v-for="cond in adversary.conditions"
        :key="cond"
        class="adv-panel__condition"
      >{{ cond }}</span>
    </div>

    <!-- Features classifiées -->
    <div
      v-if="hasFeatures"
      class="adv-panel__features"
    >
      <div
        v-if="classified.primaryFeatures.length > 0"
        class="adv-panel__feat-section"
      >
        <h4 class="adv-panel__feat-title adv-panel__feat-title--primary">
          {{ isActor ? '⚔️ Offensives' : '🛡️ Défensives' }}
          <span class="adv-panel__feat-count">{{ classified.primaryFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in classified.primaryFeatures"
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
  </section>
</template>

<script>
import FeatureCard from './FeatureCard.vue'
import { classifyAdversaryFeatures } from '../composables/useEncounterFeatures'

export default {
  name: 'AdversaryTargetPanel',
  components: { FeatureCard },
  props: {
    adversary: { type: Object, required: true },
    sceneMode: { type: String, required: true },
    isActor: { type: Boolean, default: false }
  },
  computed: {
    hpPercent() {
      if (this.adversary.maxHP <= 0) return 0
      return Math.round((this.adversary.markedHP / this.adversary.maxHP) * 100)
    },
    stressPercent() {
      if (this.adversary.maxStress <= 0) return 0
      return Math.round((this.adversary.markedStress / this.adversary.maxStress) * 100)
    },
    classified() {
      return classifyAdversaryFeatures(this.adversary, this.sceneMode)
    },
    hasFeatures() {
      const c = this.classified
      return c.primaryFeatures.length > 0 || c.passiveFeatures.length > 0 || c.reactionFeatures.length > 0
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

/* ── Bars ── */

.adv-panel__bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  background: var(--color-bg-primary);
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

/* ── Motives & Conditions ── */

.adv-panel__motives {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}

.adv-panel__motives-label {
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
}

.adv-panel__conditions {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.adv-panel__condition {
  font-size: var(--font-xs);
  padding: 1px var(--space-xs);
  background: rgba(244, 67, 54, 0.15);
  color: var(--color-accent-danger);
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
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

.adv-panel__feat-title--primary  { color: var(--color-accent-fear); }
.adv-panel__feat-title--reaction { color: #f59e0b; }
.adv-panel__feat-title--passive  { color: #3b82f6; }

.adv-panel__feat-count {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-weight: normal;
}
</style>
