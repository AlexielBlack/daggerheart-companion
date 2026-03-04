<template>
  <div
    class="feature-block"
    :class="`feature-block--${feature.activationType}`"
    role="listitem"
  >
    <div class="feature-block__header">
      <span
        class="feature-block__type-badge"
        :class="`feature-block__type-badge--${feature.activationType}`"
        :aria-label="typeLabel"
      >
        {{ typeIcon }}
      </span>
      <strong class="feature-block__name">{{ feature.name }}</strong>
      <span
        v-if="costLabel"
        class="feature-block__cost"
        :aria-label="`Coût : ${costLabel}`"
      >
        {{ costLabel }}
      </span>
    </div>
    <p class="feature-block__description">
      <GlossaryText :text="feature.description" />
    </p>
  </div>
</template>

<script>
import GlossaryText from '@core/components/GlossaryText.vue'

/**
 * @component FeatureBlock
 * @description Affiche une feature d'adversaire (action, reaction, passive).
 */
const TYPE_CONFIG = {
  action: { icon: '⚔️', label: 'Action' },
  reaction: { icon: '🛡️', label: 'Réaction' },
  passive: { icon: '🔵', label: 'Passif' }
}

const COST_LABELS = {
  stress: (n) => n === 1 ? 'Cochez un Stress' : `Cochez ${n} Stress`,
  fear: (n) => n === 1 ? 'Dépensez une Peur' : `Dépensez ${n} Peurs`,
  fearPerPC: () => 'Dépensez une Peur par PJ',
  hope: (n) => n === 1 ? 'Dépensez un Espoir' : `Dépensez ${n} Espoir`
}

export default {
  name: 'FeatureBlock',
  components: { GlossaryText },
  props: {
    feature: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.name === 'string' && typeof value.activationType === 'string'
      }
    }
  },
  computed: {
    typeIcon() {
      return TYPE_CONFIG[this.feature.activationType]?.icon || '❓'
    },
    typeLabel() {
      return TYPE_CONFIG[this.feature.activationType]?.label || this.feature.activationType
    },
    costLabel() {
      const cost = this.feature.cost
      if (!cost || cost.type === 'free') return null
      const formatter = COST_LABELS[cost.type]
      return formatter ? formatter(cost.amount) : null
    }
  }
}
</script>

<style scoped>
.feature-block {
  padding: var(--space-sm) var(--space-md);
  border-left: 3px solid var(--color-border);
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.feature-block--action {
  border-left-color: var(--color-accent-fear);
}

.feature-block--reaction {
  border-left-color: var(--color-accent-gold);
}

.feature-block--passive {
  border-left-color: var(--color-accent-hope);
}

.feature-block__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
}

.feature-block__type-badge {
  font-size: var(--font-size-sm);
  line-height: 1;
}

.feature-block__name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.feature-block__cost {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
  padding: 1px var(--space-xs);
  border: 1px solid var(--color-accent-gold);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.feature-block__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
}
</style>
