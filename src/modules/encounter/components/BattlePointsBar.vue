<template>
  <div
    class="bp-bar"
    role="meter"
    :aria-label="`Budget : ${spent} sur ${total} Battle Points dépensés`"
    :aria-valuenow="spent"
    :aria-valuemin="0"
    :aria-valuemax="total"
  >
    <div class="bp-bar__header">
      <span class="bp-bar__label">Battle Points</span>
      <span
        class="bp-bar__numbers"
        :class="statusClass"
      >
        {{ spent }} / {{ total }} BP
        <span
          v-if="remaining !== 0"
          class="bp-bar__remaining"
        >
          ({{ remaining > 0 ? '+' : '' }}{{ remaining }} restant{{ remaining !== 1 && remaining !== -1 ? 's' : '' }})
        </span>
      </span>
    </div>
    <div class="bp-bar__track">
      <div
        class="bp-bar__fill"
        :class="statusClass"
        :style="{ width: fillPercent + '%' }"
      ></div>
    </div>
    <div
      v-if="showBreakdown && slots.length > 0"
      class="bp-bar__breakdown"
    >
      <span
        v-for="slot in slots"
        :key="slot.adversaryId"
        class="bp-bar__segment"
        :title="`${slot.adversary.name}: ${slot.totalCost} BP (${slot.quantity}×${slot.unitCost})`"
      >
        {{ slot.adversary.name }} ×{{ slot.quantity }}
        <span class="bp-bar__cost">{{ slot.totalCost }} BP</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BattlePointsBar',
  props: {
    total: { type: Number, required: true },
    spent: { type: Number, required: true },
    remaining: { type: Number, required: true },
    slots: { type: Array, default: () => [] },
    showBreakdown: { type: Boolean, default: false }
  },
  computed: {
    fillPercent() {
      if (this.total <= 0) return 0
      return Math.min(100, Math.max(0, (this.spent / this.total) * 100))
    },
    statusClass() {
      if (this.remaining < 0) return 'bp-bar--over'
      if (this.remaining === 0) return 'bp-bar--exact'
      if (this.remaining <= 2) return 'bp-bar--almost'
      return 'bp-bar--under'
    }
  }
}
</script>

<style scoped>
.bp-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.bp-bar__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.875rem;
}

.bp-bar__label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.bp-bar__numbers {
  font-variant-numeric: tabular-nums;
}

.bp-bar__remaining {
  font-size: 0.75rem;
  opacity: 0.8;
}

.bp-bar__track {
  height: 10px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 5px;
  overflow: hidden;
}

.bp-bar__fill {
  height: 100%;
  border-radius: 5px;
  transition: width var(--transition-normal, 250ms) ease, background var(--transition-normal, 250ms) ease;
}

.bp-bar--under .bp-bar__fill { background: var(--color-accent-hope, #53a8b6); }
.bp-bar--almost .bp-bar__fill { background: #eab308; }
.bp-bar--exact .bp-bar__fill { background: #22c55e; }
.bp-bar--over .bp-bar__fill { background: var(--color-accent-fear, #c84b31); }

.bp-bar--under { color: var(--color-accent-hope, #53a8b6); }
.bp-bar--almost { color: #eab308; }
.bp-bar--exact { color: #22c55e; }
.bp-bar--over { color: var(--color-accent-fear, #c84b31); }

.bp-bar__breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.bp-bar__segment {
  font-size: 0.75rem;
  padding: 2px 6px;
  background: var(--color-bg-secondary, #1f1f3a);
  border-radius: 4px;
  color: var(--color-text-secondary);
}

.bp-bar__cost {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-left: 4px;
}
</style>
