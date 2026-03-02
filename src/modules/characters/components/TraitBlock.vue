<template>
  <div
    class="trait-block"
    aria-label="Traits du personnage"
  >
    <div
      v-for="trait in traits"
      :key="trait.id"
      class="trait-item"
    >
      <label
        class="trait-label"
        :for="`trait-${trait.id}`"
      >{{ trait.label }}</label>
      <input
        :id="`trait-${trait.id}`"
        type="number"
        class="trait-input"
        :value="values[trait.id] ?? 0"
        :aria-label="`${trait.label} modifier`"
        @input="$emit('update', trait.id, parseInt($event.target.value) || 0)"
      />
      <div class="trait-skills">
        {{ trait.skills.join(', ') }}
      </div>
    </div>
  </div>
</template>

<script>
import { TRAITS } from '@data/classes'

export default {
  name: 'TraitBlock',
  props: {
    values: { type: Object, required: true }
  },
  emits: ['update'],
  setup() {
    return { traits: TRAITS }
  }
}
</script>

<style scoped>
.trait-block {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

@media (max-width: 600px) {
  .trait-block {
    grid-template-columns: repeat(2, 1fr);
  }
}

.trait-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm);
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 6px;
}

.trait-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-hope, #53a8b6);
}

.trait-input {
  width: 44px;
  text-align: center;
  padding: 4px;
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.trait-input:focus {
  outline: 2px solid var(--accent-hope, #53a8b6);
  outline-offset: 1px;
}

/* Hide spinners */
.trait-input::-webkit-inner-spin-button,
.trait-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.trait-input[type="number"] {
  -moz-appearance: textfield;
}

.trait-skills {
  font-size: 0.65rem;
  color: var(--text-muted, #6b7280);
  text-align: center;
  line-height: 1.3;
}
</style>
