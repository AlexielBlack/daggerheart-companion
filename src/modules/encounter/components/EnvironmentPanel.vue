<template>
  <section
    class="env-panel"
    aria-label="Panel environnement"
  >
    <!-- En-tête -->
    <div class="env-panel__header">
      <h3 class="env-panel__name">
        {{ environment.name }}
      </h3>
      <span class="env-panel__type">{{ environment.type }}</span>
      <span class="env-panel__tier">Tier {{ environment.tier }}</span>
    </div>

    <!-- Description -->
    <p
      v-if="environment.description"
      class="env-panel__desc"
    >
      {{ environment.description }}
    </p>

    <!-- Difficulté -->
    <div
      v-if="environment.difficulty"
      class="env-panel__difficulty"
    >
      <span class="env-panel__diff-label">Difficulté</span>
      <span class="env-panel__diff-value">{{ environment.difficulty }}</span>
    </div>

    <!-- Impulses -->
    <div
      v-if="environment.impulses && environment.impulses.length > 0"
      class="env-panel__impulses"
    >
      <span class="env-panel__impulses-label">Impulsions :</span>
      <span class="env-panel__impulses-list">{{ environment.impulses.join(', ') }}</span>
    </div>

    <!-- Features -->
    <div
      v-if="normalizedFeatures.length > 0"
      class="env-panel__features"
    >
      <h4 class="env-panel__feat-title">
        🗺️ Features d'environnement
        <span class="env-panel__feat-count">{{ normalizedFeatures.length }}</span>
      </h4>
      <FeatureCard
        v-for="f in normalizedFeatures"
        :key="f.name"
        :feature="f"
      />
    </div>

    <!-- Adversaires potentiels -->
    <div
      v-if="environment.potentialAdversaries && environment.potentialAdversaries.length > 0"
      class="env-panel__adversaries"
    >
      <h4 class="env-panel__adv-title">
        Adversaires potentiels
      </h4>
      <div
        v-for="group in environment.potentialAdversaries"
        :key="group.group"
        class="env-panel__adv-group"
      >
        <span class="env-panel__adv-group-name">{{ group.group }} :</span>
        <span class="env-panel__adv-names">{{ group.names.join(', ') }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import FeatureCard from './FeatureCard.vue'

/**
 * Normalise les features d'environnement vers le format FeatureCard.
 */
function normalizeEnvFeature(raw, envName) {
  return {
    name: raw.name || '—',
    description: raw.description || '',
    source: 'environment',
    sourceLabel: envName,
    tags: Array.isArray(raw.tags) ? [...raw.tags] : ['utilitaire'],
    activationType: raw.activationType || 'passive',
    cost: raw.cost ? { ...raw.cost } : { type: 'free', amount: 0 },
    frequency: raw.frequency || null,
    range: raw.range || null,
    trigger: raw.trigger || null,
    trait: raw.trait || null,
    questions: raw.questions || null
  }
}

export default {
  name: 'EnvironmentPanel',
  components: { FeatureCard },
  props: {
    environment: { type: Object, required: true }
  },
  computed: {
    normalizedFeatures() {
      if (!this.environment.features || !Array.isArray(this.environment.features)) return []
      return this.environment.features.map((f) => normalizeEnvFeature(f, this.environment.name))
    }
  }
}
</script>

<style scoped>
.env-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  border-top: 3px solid #059669;
}

.env-panel__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.env-panel__name {
  font-size: var(--font-md, 1rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.env-panel__type {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  padding: 1px var(--space-xs);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
}

.env-panel__tier {
  font-size: var(--font-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-semibold);
}

.env-panel__desc {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.env-panel__difficulty {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.env-panel__diff-label {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.env-panel__diff-value {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-accent-gold);
  padding: 2px var(--space-sm);
  background: rgba(224, 165, 38, 0.08);
  border: 1px solid var(--color-accent-gold);
  border-radius: var(--radius-md);
  font-variant-numeric: tabular-nums;
}

.env-panel__impulses {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.env-panel__impulses-label {
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
}

/* ── Features ── */

.env-panel__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.env-panel__feat-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.env-panel__feat-count {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-weight: normal;
}

/* ── Adversaires potentiels ── */

.env-panel__adversaries {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding-top: var(--space-xs);
  border-top: 1px solid var(--color-border);
}

.env-panel__adv-title {
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.env-panel__adv-group {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.env-panel__adv-group-name {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}
</style>
