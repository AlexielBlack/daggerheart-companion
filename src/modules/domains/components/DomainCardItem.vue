<template>
  <article
    class="domain-card-item"
    :style="{ '--domain-color': domainColor }"
    role="listitem"
  >
    <header class="dci__header">
      <div class="dci__meta">
        <span
          class="dci__level"
          :aria-label="`Level ${card.level}`"
        >Lv. {{ card.level }}</span>
        <span
          class="dci__type"
          :class="`dci__type--${card.type}`"
        >{{ typeLabel }}</span>
      </div>
      <h4 class="dci__name">
        {{ card.name }}
      </h4>
      <div
        v-if="card.recallCost > 0"
        class="dci__recall"
        :aria-label="`Recall cost: ${card.recallCost} Hope`"
      >
        ✨ {{ card.recallCost }}
      </div>
    </header>
    <p class="dci__feature">
      {{ card.feature }}
    </p>
  </article>
</template>

<script>
import { computed } from 'vue'
import { CARD_TYPES } from '@/data/domains/index.js'

export default {
  name: 'DomainCardItem',

  props: {
    card: {
      type: Object,
      required: true,
      validator: (c) => c.id && c.name && c.level && c.type !== undefined
    },
    domainColor: {
      type: String,
      default: '#53a8b6'
    }
  },

  setup(props) {
    const typeLabel = computed(() => CARD_TYPES[props.card.type] || props.card.type)

    return { typeLabel }
  }
}
</script>

<style scoped>
.domain-card-item {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--domain-color, var(--color-accent-hope));
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  transition: border-color var(--transition-fast);
}
.domain-card-item:hover {
  border-color: var(--domain-color, var(--color-accent-hope));
}

.dci__header { margin-bottom: var(--space-xs); }

.dci__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.dci__level {
  font-size: 0.65rem;
  font-weight: bold;
  color: var(--domain-color, var(--color-text-muted));
  text-transform: uppercase;
}
.dci__type {
  font-size: 0.65rem;
  padding: 1px var(--space-xs);
  background: var(--color-bg-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
.dci__type--spell { color: #7c3aed; border-color: rgba(139, 92, 246, 0.3); }
.dci__type--grimoire { color: #0891b2; border-color: rgba(8, 145, 178, 0.3); }
.dci__type--ability { color: #dc2626; border-color: rgba(220, 38, 38, 0.3); }

.dci__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  margin: 0 0 4px;
  color: var(--color-text-primary);
}
.dci__recall {
  font-size: var(--font-size-xs);
  color: #ca8a04;
}

.dci__feature {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}
</style>
