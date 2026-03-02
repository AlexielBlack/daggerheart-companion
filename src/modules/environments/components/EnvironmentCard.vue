<template>
  <button
    class="env-card card"
    :class="{ 'env-card--selected': selected }"
    :aria-label="`${environment.name} — Tier ${environment.tier} ${environment.type}`"
    :aria-pressed="selected"
    @click="$emit('select', environment.id)"
  >
    <div class="env-card__top">
      <span
        class="badge"
        :class="`badge--tier${environment.tier}`"
      >
        T{{ environment.tier }}
      </span>
      <span class="env-card__type">
        {{ typeIcon }} {{ environment.type }}
      </span>
    </div>

    <h3 class="env-card__name">
      {{ environment.name }}
    </h3>

    <p class="env-card__description">
      {{ environment.description }}
    </p>

    <div class="env-card__stats">
      <span
        class="env-card__stat"
        :aria-label="difficultyLabel"
        title="Difficulté"
      >
        🎯 {{ environment.difficulty ?? 'Spécial' }}
      </span>
      <span
        class="env-card__stat"
        :aria-label="`${environment.features.length} capacités`"
        title="Capacités"
      >
        ⚙️ {{ environment.features.length }}
      </span>
    </div>

    <div class="env-card__impulses">
      {{ environment.impulses.join(', ') }}
    </div>
  </button>
</template>

<script>
import { ENVIRONMENT_TYPE_ICONS } from '@data/environments'

/**
 * @component EnvironmentCard
 * @description Carte compacte affichant un aperçu d'environnement pour la liste.
 */
export default {
  name: 'EnvironmentCard',
  props: {
    environment: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.id === 'string' && typeof value.name === 'string'
      }
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select'],
  computed: {
    typeIcon() {
      return ENVIRONMENT_TYPE_ICONS[this.environment.type] || '📍'
    },
    difficultyLabel() {
      return this.environment.difficulty
        ? `Difficulté ${this.environment.difficulty}`
        : 'Difficulté spéciale'
    }
  }
}
</script>

<style scoped>
.env-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  cursor: pointer;
  text-align: left;
  width: 100%;
  border: 1px solid var(--color-border);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.env-card:hover {
  border-color: var(--color-accent-hope);
}

.env-card--selected {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope), var(--shadow-md);
}

.env-card__top {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.env-card__type {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.env-card__name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.env-card__description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.env-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.env-card__stat {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.env-card__impulses {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
  margin-top: auto;
}
</style>
