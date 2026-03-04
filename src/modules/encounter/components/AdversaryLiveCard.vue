<template>
  <div
    class="adv-live"
    :class="{
      'adv-live--active': isActive,
      'adv-live--defeated': adversary.isDefeated
    }"
    role="button"
    tabindex="0"
    :aria-label="adversary.name + (adversary.isDefeated ? ' (vaincu)' : '')"
    @click="$emit('select', adversary.instanceId)"
    @keydown.enter="$emit('select', adversary.instanceId)"
  >
    <!-- En-tête -->
    <div class="adv-live__header">
      <span class="adv-live__name">{{ adversary.name }}</span>
      <span class="adv-live__type">{{ adversary.type }}</span>
      <span
        v-if="adversary.isDefeated"
        class="adv-live__defeated-badge"
      >💀</span>
    </div>

    <!-- Barres HP / Stress -->
    <div class="adv-live__bars">
      <div class="adv-live__bar-row">
        <span class="adv-live__bar-label">HP</span>
        <div
          class="adv-live__bar"
          aria-label="Hit Points"
        >
          <div
            class="adv-live__bar-fill adv-live__bar-fill--hp"
            :style="{ width: hpPercent + '%' }"
          ></div>
        </div>
        <span class="adv-live__bar-value">{{ adversary.markedHP }}/{{ adversary.maxHP }}</span>
        <div class="adv-live__bar-btns">
          <button
            class="adv-live__micro-btn"
            :disabled="adversary.isDefeated || adversary.markedHP >= adversary.maxHP"
            aria-label="Marquer 1 HP"
            @click.stop="$emit('mark-hp', adversary.instanceId)"
          >
            +
          </button>
          <button
            class="adv-live__micro-btn"
            :disabled="adversary.markedHP <= 0"
            aria-label="Retirer 1 HP marqué"
            @click.stop="$emit('clear-hp', adversary.instanceId)"
          >
            −
          </button>
        </div>
      </div>

      <div class="adv-live__bar-row">
        <span class="adv-live__bar-label">ST</span>
        <div
          class="adv-live__bar"
          aria-label="Stress"
        >
          <div
            class="adv-live__bar-fill adv-live__bar-fill--stress"
            :style="{ width: stressPercent + '%' }"
          ></div>
        </div>
        <span class="adv-live__bar-value">{{ adversary.markedStress }}/{{ adversary.maxStress }}</span>
        <div class="adv-live__bar-btns">
          <button
            class="adv-live__micro-btn"
            :disabled="adversary.isDefeated || adversary.markedStress >= adversary.maxStress"
            aria-label="Marquer 1 Stress"
            @click.stop="$emit('mark-stress', adversary.instanceId)"
          >
            +
          </button>
          <button
            class="adv-live__micro-btn"
            :disabled="adversary.markedStress <= 0"
            aria-label="Retirer 1 Stress"
            @click.stop="$emit('clear-stress', adversary.instanceId)"
          >
            −
          </button>
        </div>
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="adv-live__stats">
      <span
        class="adv-live__stat"
        title="Difficulté"
      >🎯 {{ adversary.difficulty }}</span>
      <span
        v-if="adversary.thresholds"
        class="adv-live__stat"
        title="Seuils (Majeur/Sévère)"
      >
        ⚔️ {{ adversary.thresholds.major || '—' }}/{{ adversary.thresholds.severe || '—' }}
      </span>
    </div>

    <!-- Conditions -->
    <div
      v-if="adversary.conditions.length > 0"
      class="adv-live__conditions"
    >
      <span
        v-for="cond in adversary.conditions"
        :key="cond"
        class="adv-live__condition"
      >{{ cond }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdversaryLiveCard',
  props: {
    adversary: { type: Object, required: true },
    isActive: { type: Boolean, default: false }
  },
  emits: ['select', 'mark-hp', 'clear-hp', 'mark-stress', 'clear-stress'],
  computed: {
    hpPercent() {
      if (this.adversary.maxHP <= 0) return 0
      return Math.round((this.adversary.markedHP / this.adversary.maxHP) * 100)
    },
    stressPercent() {
      if (this.adversary.maxStress <= 0) return 0
      return Math.round((this.adversary.markedStress / this.adversary.maxStress) * 100)
    }
  }
}
</script>

<style scoped>
.adv-live {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, opacity 0.15s;
}

.adv-live:hover {
  border-color: var(--color-border-active);
}

.adv-live--active {
  border-color: var(--color-accent-fear);
  box-shadow: 0 0 0 1px var(--color-accent-fear);
}

.adv-live--defeated {
  opacity: 0.5;
}

.adv-live__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.adv-live__name {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adv-live__type {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  padding: 1px var(--space-xs);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.adv-live__defeated-badge {
  font-size: 1rem;
}

/* ── Barres ── */

.adv-live__bars {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.adv-live__bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.adv-live__bar-label {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  width: 18px;
  text-align: right;
  font-weight: var(--font-semibold);
}

.adv-live__bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.adv-live__bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.2s;
}

.adv-live__bar-fill--hp {
  background: var(--color-accent-danger);
}

.adv-live__bar-fill--stress {
  background: #8b5cf6;
}

.adv-live__bar-value {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
}

.adv-live__bar-btns {
  display: flex;
  gap: 2px;
}

.adv-live__micro-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-weight: var(--font-bold);
  cursor: pointer;
  padding: 0;
}

.adv-live__micro-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.adv-live__micro-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ── Stats & Conditions ── */

.adv-live__stats {
  display: flex;
  gap: var(--space-sm);
}

.adv-live__stat {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.adv-live__conditions {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.adv-live__condition {
  font-size: var(--font-xs);
  padding: 1px var(--space-xs);
  background: rgba(244, 67, 54, 0.15);
  color: var(--color-accent-danger);
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
}
</style>
