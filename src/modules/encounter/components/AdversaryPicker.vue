<template>
  <div
    class="adversary-picker"
    role="search"
    aria-label="Ajouter des adversaires"
  >
    <div class="picker-header">
      <input
        v-model="search"
        type="text"
        class="picker-search"
        placeholder="Chercher un adversaire…"
        aria-label="Rechercher un adversaire"
      />
      <div class="picker-filters">
        <button
          v-for="t in 4"
          :key="t"
          class="filter-chip"
          :class="{ 'filter-chip--active': filterTier === t, [`filter-chip--tier-${t}`]: true }"
          :aria-pressed="filterTier === t ? 'true' : 'false'"
          @click="filterTier = filterTier === t ? null : t"
        >
          T{{ t }}
        </button>
      </div>
    </div>

    <ul
      class="picker-list"

      aria-label="Adversaires disponibles"
    >
      <li
        v-for="adv in filteredAdversaries"
        :key="adv.id"
        class="picker-item"
      >
        <div class="picker-item__info">
          <span
            class="picker-item__tier"
            :class="`tier-badge--${adv.tier}`"
          >T{{ adv.tier }}</span>
          <span class="picker-item__name">{{ adv.name }}</span>
          <span class="picker-item__type">{{ adv.type }}</span>
          <span class="picker-item__cost">{{ getCost(adv.type) }} BP</span>
        </div>
        <div class="picker-item__actions">
          <span
            v-if="getQuantity(adv.id) > 0"
            class="picker-item__qty"
          >
            ×{{ getQuantity(adv.id) }}
          </span>
          <button
            class="picker-btn picker-btn--add"
            aria-label="Ajouter {{ adv.name }}"
            title="Ajouter"
            @click="$emit('add', adv.id)"
          >
            +
          </button>
          <button
            v-if="getQuantity(adv.id) > 0"
            class="picker-btn picker-btn--remove"
            aria-label="Retirer {{ adv.name }}"
            title="Retirer"
            @click="$emit('remove', adv.id)"
          >
            −
          </button>
        </div>
      </li>
      <li
        v-if="filteredAdversaries.length === 0"
        class="picker-empty"
      >
        Aucun adversaire trouvé.
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { allAdversaries } from '@data/adversaries'
import { BATTLE_POINT_COSTS } from '@data/encounters/constants'

export default {
  name: 'AdversaryPicker',
  props: {
    /** Slots déjà ajoutés : [{ adversaryId, quantity }] */
    currentSlots: { type: Array, default: () => [] }
  },
  emits: ['add', 'remove'],
  setup(props) {
    const search = ref('')
    const filterTier = ref(null)

    const filteredAdversaries = computed(() => {
      let result = allAdversaries

      if (filterTier.value) {
        result = result.filter((a) => a.tier === filterTier.value)
      }

      if (search.value.trim()) {
        const q = search.value.trim().toLowerCase()
        result = result.filter((a) =>
          a.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
        )
      }

      return result.slice(0, 50) // Limite affichage pour performance
    })

    function getCost(type) {
      return BATTLE_POINT_COSTS[type] ?? 2
    }

    function getQuantity(adversaryId) {
      const slot = props.currentSlots.find((s) => s.adversaryId === adversaryId)
      return slot ? slot.quantity : 0
    }

    return { search, filterTier, filteredAdversaries, getCost, getQuantity }
  }
}
</script>

<style scoped>
.adversary-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 400px;
}

.picker-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-bg-secondary, #1f1f3a);
  padding-bottom: var(--space-xs);
}

.picker-search {
  padding: 6px 10px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  color: var(--color-text-primary);
  font-size: 0.85rem;
}

.picker-search::placeholder { color: var(--color-text-muted, #6b7280); }
.picker-search:focus { outline: 2px solid var(--color-accent-hope, #53a8b6); outline-offset: 1px; }

.picker-filters {
  display: flex;
  gap: var(--space-xs);
}

.filter-chip {
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--color-border, #3a3a5a);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  min-height: var(--touch-min);
  transition: all var(--transition-fast, 150ms);
}

.filter-chip:hover { border-color: var(--color-text-secondary); }

.filter-chip--tier-1.filter-chip--active { border-color: #22c55e; color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.filter-chip--tier-2.filter-chip--active { border-color: #3b82f6; color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.filter-chip--tier-3.filter-chip--active { border-color: #a855f7; color: #a855f7; background: rgba(168, 85, 247, 0.1); }
.filter-chip--tier-4.filter-chip--active { border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.picker-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  transition: background var(--transition-fast, 150ms);
}

.picker-item:hover {
  background: var(--color-bg-tertiary, #2a2a4a);
}

.picker-item__info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
  flex: 1;
}

.picker-item__tier {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  flex-shrink: 0;
}

.tier-badge--1 { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.tier-badge--2 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.tier-badge--3 { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
.tier-badge--4 { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.picker-item__name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-item__type {
  font-size: 0.7rem;
  color: var(--color-text-muted, #6b7280);
  flex-shrink: 0;
}

.picker-item__cost {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-accent-hope, #53a8b6);
  flex-shrink: 0;
}

.picker-item__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.picker-item__qty {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-accent-hope, #53a8b6);
  min-width: 24px;
  text-align: center;
}

.picker-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border-radius: 4px;
  border: 1px solid var(--color-border, #3a3a5a);
  background: var(--color-bg-tertiary, #2a2a4a);
  color: var(--color-text-primary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast, 150ms);
}

.picker-btn--add:hover { border-color: #22c55e; color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.picker-btn--remove:hover { border-color: var(--color-accent-fear, #c84b31); color: var(--color-accent-fear, #c84b31); background: rgba(200, 75, 49, 0.1); }

.picker-empty {
  padding: var(--space-md);
  text-align: center;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.85rem;
}
</style>
