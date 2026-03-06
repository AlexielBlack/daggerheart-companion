<template>
  <div
    class="slot-tracker"
    :aria-label="`${label}: ${marked} sur ${max}`"
  >
    <div class="slot-tracker__header">
      <span class="slot-tracker__label">{{ label }}</span>
      <span
        class="slot-tracker__count"
        :class="countClass"
      >{{ marked }}/{{ max }}</span>
    </div>
    <div
      class="slot-tracker__slots"
      role="group"
      :aria-label="`Slots ${label}`"
    >
      <button
        v-for="i in max"
        :key="i"
        class="slot-btn"
        :class="{
          'slot-btn--marked': i <= marked,
          [`slot-btn--${variant}`]: true
        }"
        :aria-label="`Slot ${i} ${i <= marked ? 'marqué' : 'vide'}`"
        :aria-pressed="i <= marked ? 'true' : 'false'"
        @click="toggleSlot(i)"
      ></button>
    </div>
    <div class="slot-tracker__actions">
      <button
        class="action-btn"
        :disabled="marked >= max"
        :aria-label="`Marquer ${label}`"
        @click="$emit('mark')"
      >
        +
      </button>
      <button
        class="action-btn"
        :disabled="marked <= 0"
        :aria-label="`Effacer ${label}`"
        @click="$emit('clear')"
      >
        −
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SlotTracker',
  props: {
    label: { type: String, required: true },
    max: { type: Number, required: true },
    marked: { type: Number, required: true },
    variant: { type: String, default: 'hp' } // hp, stress, armor
  },
  emits: ['mark', 'clear', 'set'],
  computed: {
    countClass() {
      const ratio = this.max > 0 ? this.marked / this.max : 0
      if (ratio >= 1) return 'slot-tracker__count--critical'
      if (ratio >= 0.7) return 'slot-tracker__count--danger'
      if (ratio >= 0.4) return 'slot-tracker__count--warning'
      return ''
    }
  },
  methods: {
    toggleSlot(index) {
      if (index <= this.marked) {
        this.$emit('set', index - 1)
      } else {
        this.$emit('set', index)
      }
    }
  }
}
</script>

<style scoped>
.slot-tracker {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.slot-tracker__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.slot-tracker__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.slot-tracker__count {
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.slot-tracker__count--warning { color: #eab308; }
.slot-tracker__count--danger { color: #f97316; }
.slot-tracker__count--critical { color: var(--color-accent-fear, #c84b31); }

.slot-tracker__slots {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.slot-btn {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  border: 2px solid var(--color-border, #3a3a5a);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.slot-btn:hover { border-color: var(--color-text-secondary); }

.slot-btn--hp.slot-btn--marked {
  background: var(--color-accent-fear, #c84b31);
  border-color: var(--color-accent-fear, #c84b31);
}

.slot-btn--stress.slot-btn--marked {
  background: #a855f7;
  border-color: #a855f7;
}

.slot-btn--armor.slot-btn--marked {
  background: var(--color-accent-hope, #53a8b6);
  border-color: var(--color-accent-hope, #53a8b6);
}

.slot-tracker__actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 26px;
  height: 22px;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 3px;
  background: var(--color-bg-tertiary, #2a2a4a);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover:not(:disabled) { border-color: var(--color-text-secondary); }
.action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
