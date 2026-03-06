<template>
  <div
    class="slot-list"
    aria-label="Adversaires de la rencontre"
  >
    <div
      v-if="slots.length === 0"
      class="slot-list__empty"
    >
      <p>Aucun adversaire ajouté.</p>
      <p class="text-muted">
        Utilisez le panneau ci-dessous pour composer votre rencontre.
      </p>
    </div>

    <TransitionGroup
      name="slot"
      tag="ul"
      class="slot-list__items"
      role="list"
    >
      <li
        v-for="slot in slots"
        :key="slot.adversaryId"
        class="slot-item"
      >
        <div class="slot-item__info">
          <span
            class="slot-item__tier"
            :class="`tier--${slot.adversary.tier}`"
          >T{{ slot.adversary.tier }}</span>
          <div class="slot-item__details">
            <span class="slot-item__name">{{ slot.adversary.name }}</span>
            <span class="slot-item__meta">
              {{ slot.adversary.type }} · {{ slot.unitCost }} BP/u
              · HP {{ slot.adversary.hp }} · Stress {{ slot.adversary.stress }}
            </span>
          </div>
        </div>

        <div class="slot-item__controls">
          <span
            class="slot-item__cost"
            :title="`${slot.quantity} × ${slot.unitCost} = ${slot.totalCost} BP`"
          >
            {{ slot.totalCost }} BP
          </span>
          <div
            class="slot-item__stepper"
            role="group"
            :aria-label="`Quantité de ${slot.adversary.name}`"
          >
            <button
              class="stepper-btn"
              aria-label="Retirer un"
              @click="$emit('decrement', slot.adversaryId)"
            >
              −
            </button>
            <span class="stepper-value">{{ slot.quantity }}</span>
            <button
              class="stepper-btn"
              aria-label="Ajouter un"
              @click="$emit('increment', slot.adversaryId)"
            >
              +
            </button>
          </div>
          <button
            class="slot-item__remove"
            :aria-label="`Supprimer ${slot.adversary.name}`"
            title="Supprimer"
            @click="$emit('removeAll', slot.adversaryId)"
          >
            ✕
          </button>
        </div>
      </li>
    </TransitionGroup>
  </div>
</template>

<script>
export default {
  name: 'EncounterSlotList',
  props: {
    /** Slots détaillés avec adversary, unitCost, totalCost */
    slots: { type: Array, default: () => [] }
  },
  emits: ['increment', 'decrement', 'removeAll']
}
</script>

<style scoped>
.slot-list {
  display: flex;
  flex-direction: column;
}

.slot-list__empty {
  padding: var(--space-lg);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.slot-list__empty .text-muted {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
  margin-top: var(--space-xs);
}

.slot-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  transition: all var(--transition-fast, 150ms);
}

.slot-item:hover {
  border-color: var(--color-text-muted, #6b7280);
}

.slot-item__info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
  flex: 1;
}

.slot-item__tier {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.tier--1 { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.tier--2 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.tier--3 { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
.tier--4 { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.slot-item__details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.slot-item__name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-item__meta {
  font-size: 0.7rem;
  color: var(--color-text-muted, #6b7280);
}

.slot-item__controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.slot-item__cost {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-accent-hope, #53a8b6);
  font-variant-numeric: tabular-nums;
  min-width: 36px;
  text-align: right;
}

.slot-item__stepper {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  overflow: hidden;
}

.stepper-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  background: var(--color-bg-tertiary, #2a2a4a);
  border: none;
  color: var(--color-text-primary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-btn:hover {
  background: var(--color-bg-hover, #3a3a5a);
}

.stepper-value {
  width: 28px;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.slot-item__remove {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast, 150ms);
}

.slot-item__remove:hover {
  color: var(--color-accent-fear, #c84b31);
  border-color: var(--color-accent-fear, #c84b31);
  background: rgba(200, 75, 49, 0.1);
}

/* Transition animations */
.slot-enter-active, .slot-leave-active {
  transition: all var(--transition-normal, 250ms) ease;
}

.slot-enter-from { opacity: 0; transform: translateX(-10px); }
.slot-leave-to { opacity: 0; transform: translateX(10px); }
</style>
