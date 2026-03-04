<template>
  <div
    class="env-feature"
    :class="`env-feature--${feature.type}`"
  >
    <div class="env-feature__header">
      <span
        class="env-feature__type-badge"
        :class="`env-feature__type-badge--${feature.type}`"
        :aria-label="typeLabel"
      >
        {{ typeLabel }}
      </span>
      <h4 class="env-feature__name">
        {{ feature.name }}
      </h4>
      <span
        v-if="feature.fearCost"
        class="env-feature__fear-cost badge badge--fear"
        :aria-label="`Coût : ${feature.fearCost} Peur`"
      >
        {{ feature.fearCost }} Fear
      </span>
    </div>

    <p class="env-feature__description">
      <GlossaryText :text="feature.description" />
    </p>

    <p
      v-if="feature.questions"
      class="env-feature__questions"
    >
      <em>{{ feature.questions }}</em>
    </p>
  </div>
</template>

<script>
import GlossaryText from '@core/components/GlossaryText.vue'

/**
 * @component EnvironmentFeatureBlock
 * @description Affiche une capacité d'environnement (passive, action, réaction).
 */

const TYPE_LABELS = {
  passive: 'Passif',
  action: 'Action',
  reaction: 'Réaction'
}

export default {
  name: 'EnvironmentFeatureBlock',
  components: { GlossaryText },
  props: {
    feature: {
      type: Object,
      required: true,
      validator(value) {
        return value &&
          typeof value.name === 'string' &&
          ['passive', 'action', 'reaction'].includes(value.type) &&
          typeof value.description === 'string'
      }
    }
  },
  computed: {
    typeLabel() {
      return TYPE_LABELS[this.feature.type] || this.feature.type
    }
  }
}
</script>

<style scoped>
.env-feature {
  padding: var(--space-sm) var(--space-md);
  border-left: 3px solid var(--color-border);
  background-color: var(--color-bg-primary);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.env-feature--passive {
  border-left-color: var(--color-accent-info);
}

.env-feature--action {
  border-left-color: var(--color-accent-warning);
}

.env-feature--reaction {
  border-left-color: var(--color-accent-hope);
}

.env-feature__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
}

.env-feature__type-badge {
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
}

.env-feature__type-badge--passive {
  background-color: rgba(33, 150, 243, 0.2);
  color: var(--color-accent-info);
}

.env-feature__type-badge--action {
  background-color: rgba(255, 152, 0, 0.2);
  color: var(--color-accent-warning);
}

.env-feature__type-badge--reaction {
  background-color: rgba(83, 168, 182, 0.2);
  color: var(--color-accent-hope);
}

.env-feature__name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.env-feature__fear-cost {
  font-size: 0.65rem;
  margin-left: auto;
}

.env-feature__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  white-space: pre-line;
}

.env-feature__questions {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
  line-height: var(--line-height-normal);
}
</style>
