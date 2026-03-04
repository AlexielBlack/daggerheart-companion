<template>
  <article
    class="env-stat-block card"
    :aria-label="`Fiche de ${environment.name}`"
  >
    <!-- Header -->
    <div class="env-stat-block__header">
      <div class="env-stat-block__title-row">
        <h2 class="env-stat-block__name">
          {{ environment.name }}
        </h2>
        <button
          v-if="closable"
          class="env-stat-block__close btn btn--ghost btn--sm"
          aria-label="Fermer la fiche"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="env-stat-block__meta">
        <span
          class="badge"
          :class="`badge--tier${environment.tier}`"
        >
          Tier {{ environment.tier }}
        </span>
        <span class="env-stat-block__type">
          {{ typeIcon }} {{ typeLabel }}
        </span>
      </div>

      <p class="env-stat-block__description">
        {{ environment.description }}
      </p>
    </div>

    <!-- Impulses -->
    <div class="env-stat-block__section">
      <h3 class="env-stat-block__section-title">
        Impulsions
      </h3>
      <p class="env-stat-block__impulses">
        {{ environment.impulses.join(', ') }}
      </p>
    </div>

    <!-- Stats -->
    <div class="env-stat-block__stats-bar">
      <div class="env-stat-block__stat">
        <span class="env-stat-block__stat-label">Difficulté</span>
        <span class="env-stat-block__stat-value">
          {{ environment.difficulty ?? 'Spéciale' }}
        </span>
      </div>
    </div>

    <!-- Special difficulty note -->
    <p
      v-if="environment.difficultySpecial"
      class="env-stat-block__special-note"
    >
      {{ environment.difficultySpecial }}
    </p>

    <!-- Potential adversaries -->
    <div
      v-if="environment.potentialAdversaries?.length"
      class="env-stat-block__section"
    >
      <h3 class="env-stat-block__section-title">
        Adversaires potentiels
      </h3>
      <div class="env-stat-block__adversaries">
        <template
          v-for="(group, idx) in environment.potentialAdversaries"
          :key="idx"
        >
          <span class="env-stat-block__adversary-group">
            <strong v-if="group.group">{{ group.group }}:</strong>
            {{ group.names.join(', ') }}
          </span>
        </template>
      </div>
    </div>

    <!-- Features -->
    <div class="env-stat-block__section">
      <h3 class="env-stat-block__section-title">
        Capacités
      </h3>
      <div class="env-stat-block__features">
        <EnvironmentFeatureBlock
          v-for="feature in environment.features"
          :key="feature.name"
          :feature="feature"
        />
      </div>
    </div>
  </article>
</template>

<script>
import EnvironmentFeatureBlock from './EnvironmentFeatureBlock.vue'
import { ENVIRONMENT_TYPE_ICONS, ENVIRONMENT_TYPE_LABELS } from '@data/environments'

/**
 * @component EnvironmentStatBlock
 * @description Fiche complète d'un environnement avec toutes ses données.
 */
export default {
  name: 'EnvironmentStatBlock',
  components: { EnvironmentFeatureBlock },
  props: {
    environment: {
      type: Object,
      required: true
    },
    closable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  computed: {
    typeIcon() {
      return ENVIRONMENT_TYPE_ICONS[this.environment.type] || '📍'
    },
    typeLabel() {
      return ENVIRONMENT_TYPE_LABELS[this.environment.type] || this.environment.type
    }
  }
}
</script>

<style scoped>
.env-stat-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Scrollbar */
.env-stat-block::-webkit-scrollbar {
  width: 6px;
}

.env-stat-block::-webkit-scrollbar-track {
  background: transparent;
}

.env-stat-block::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-full);
}

.env-stat-block__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.env-stat-block__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-sm);
}

.env-stat-block__name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  margin: 0;
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
}

.env-stat-block__close {
  flex-shrink: 0;
}

.env-stat-block__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.env-stat-block__type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.env-stat-block__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.env-stat-block__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.env-stat-block__section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin: 0;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-xs);
}

.env-stat-block__impulses {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.env-stat-block__stats-bar {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-sm);
}

.env-stat-block__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.env-stat-block__stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.env-stat-block__stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-gold);
}

.env-stat-block__special-note {
  font-size: var(--font-size-xs);
  color: var(--color-accent-warning);
  font-style: italic;
}

.env-stat-block__adversaries {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.env-stat-block__adversary-group {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.env-stat-block__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
