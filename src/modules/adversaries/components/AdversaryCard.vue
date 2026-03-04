<template>
  <button
    class="adversary-card card"
    :class="{ 'adversary-card--selected': selected }"
    :aria-label="`${adversary.name} — Tier ${adversary.tier} ${typeLabel}`"
    :aria-pressed="selected"
    @click="$emit('select', adversary.id)"
  >
    <div class="adversary-card__top">
      <span
        class="badge"
        :class="`badge--tier${adversary.tier}`"
      >
        T{{ adversary.tier }}
      </span>
      <span class="adversary-card__type">{{ typeLabel }}</span>
    </div>

    <h3 class="adversary-card__name">
      {{ adversary.name }}
    </h3>

    <div class="adversary-card__stats">
      <span
        class="adversary-card__stat"
        :aria-label="`Difficulté ${adversary.difficulty}`"
        title="Difficulté"
      >
        🎯 {{ adversary.difficulty }}
      </span>
      <span
        class="adversary-card__stat"
        :aria-label="`${adversary.hp} points de vie`"
        title="PV"
      >
        ❤️ {{ adversary.hp }}
      </span>
      <span
        class="adversary-card__stat"
        :aria-label="`${adversary.stress} stress`"
        title="Stress"
      >
        💢 {{ adversary.stress }}
      </span>
      <span
        v-if="adversary.thresholds && adversary.thresholds.major !== null"
        class="adversary-card__stat"
        :aria-label="`Seuils ${adversary.thresholds.major} / ${adversary.thresholds.severe}`"
        title="Seuils Majeur/Sévère"
      >
        🔰 {{ adversary.thresholds.major }}/{{ adversary.thresholds.severe }}
      </span>
    </div>

    <div class="adversary-card__attack">
      <span class="adversary-card__attack-text">
        {{ adversary.attack.name }}:
        {{ adversary.attack.damage }}
        {{ adversary.attack.damageType }}
      </span>
    </div>

    <div
      v-if="adversary.features?.length"
      class="adversary-card__feature-count"
    >
      {{ adversary.features.length }} capacité{{ adversary.features.length > 1 ? 's' : '' }}
    </div>
  </button>
</template>

<script>
import { ADVERSARY_TYPE_LABELS } from '@data/adversaries'

/**
 * @component AdversaryCard
 * @description Carte compacte affichant un aperçu d'adversaire pour la liste.
 */
export default {
  name: 'AdversaryCard',
  props: {
    adversary: {
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
    typeLabel() {
      return ADVERSARY_TYPE_LABELS[this.adversary.type] || this.adversary.type
    }
  }
}
</script>

<style scoped>
.adversary-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  cursor: pointer;
  text-align: left;
  width: 100%;
  border: 1px solid var(--color-border);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.adversary-card:hover {
  border-color: var(--color-accent-hope);
}

.adversary-card--selected {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope), var(--shadow-md);
}

.adversary-card__top {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.adversary-card__type {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.adversary-card__name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.adversary-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.adversary-card__stat {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.adversary-card__attack {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.adversary-card__attack-text {
  font-style: italic;
}

.adversary-card__feature-count {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
  margin-top: auto;
}
</style>
