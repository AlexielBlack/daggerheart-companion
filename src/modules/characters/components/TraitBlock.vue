<template>
  <div
    class="trait-block"
    aria-label="Traits du personnage"
  >
    <!-- ═══ Pool de valeurs disponibles ═══ -->
    <div
      v-if="remainingPool.length > 0"
      class="trait-pool"
    >
      <span class="trait-pool__title">Valeurs à assigner</span>
      <div class="trait-pool__chips">
        <button
          v-for="(val, idx) in remainingPool"
          :key="'pool-' + idx"
          class="pool-chip"
          :class="{
            'pool-chip--positive': val > 0,
            'pool-chip--negative': val < 0,
            'pool-chip--selected': selectedPoolIdx === idx
          }"
          :draggable="true"
          :aria-label="`Valeur ${formatModifier(val)} — cliquer ou glisser pour assigner`"
          @click="onPoolClick(idx)"
          @dragstart="onDragStart(idx, $event)"
          @dragend="onDragEnd"
        >
          {{ formatModifier(val) }}
        </button>
      </div>
    </div>

    <!-- ═══ Bandeau « Toutes les valeurs sont assignées » ═══ -->
    <div
      v-else
      class="trait-pool trait-pool--done"
    >
      <span class="trait-pool__title">✓ Toutes les valeurs sont assignées</span>
    </div>

    <!-- ═══ Actions rapides ═══ -->
    <div class="trait-actions">
      <button
        v-if="suggestedTraits"
        class="trait-action-btn"
        aria-label="Appliquer les valeurs recommandées"
        @click="applyRecommended"
      >
        ★ Recommandé
      </button>
      <button
        class="trait-action-btn trait-action-btn--reset"
        aria-label="Réinitialiser les traits"
        @click="resetTraits"
      >
        ↺ Réinitialiser
      </button>
    </div>

    <!-- ═══ Grille des 6 traits ═══ -->
    <div class="trait-grid">
      <div
        v-for="trait in traits"
        :key="trait.id"
        class="trait-card"
        :class="{
          'trait-card--droppable': isDragging || selectedPoolIdx !== null,
          'trait-card--dragover': dragOverTrait === trait.id,
          'trait-card--match': suggestedTraits && isAssigned(trait.id) && values[trait.id] === suggestedTraits[trait.id]
        }"
        role="button"
        tabindex="0"
        :aria-label="`${trait.label} : ${formatModifier(values[trait.id])}${suggestedTraits ? ' (recommandé ' + formatModifier(suggestedTraits[trait.id]) + ')' : ''}`"
        @click="onTraitClick(trait.id)"
        @keydown.enter.prevent="onTraitClick(trait.id)"
        @dragover.prevent="onDragOver(trait.id)"
        @dragleave="onDragLeave"
        @drop.prevent="onDrop(trait.id)"
      >
        <span class="trait-card__label">{{ trait.label }}</span>

        <span
          class="trait-card__value"
          :class="{
            'trait-card__value--positive': isAssigned(trait.id) && values[trait.id] > 0,
            'trait-card__value--negative': isAssigned(trait.id) && values[trait.id] < 0,
            'trait-card__value--empty': !isAssigned(trait.id)
          }"
        >
          {{ isAssigned(trait.id) ? formatModifier(values[trait.id]) : '?' }}
        </span>

        <span
          v-if="suggestedTraits"
          class="trait-card__recommended"
          :class="{ 'trait-card__recommended--active': isAssigned(trait.id) && values[trait.id] === suggestedTraits[trait.id] }"
        >
          ★ {{ formatModifier(suggestedTraits[trait.id]) }}
        </span>

        <span class="trait-card__skills">{{ trait.skills.join(', ') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { TRAITS } from '@data/classes'

/** Pool de valeurs de base au niveau 1 */
const BASE_POOL = [2, 1, 1, 0, 0, -1]

export default {
  name: 'TraitBlock',
  props: {
    values: { type: Object, required: true },
    suggestedTraits: { type: Object, default: null }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const traits = TRAITS
    const traitIds = TRAITS.map((t) => t.id)

    // ── État interactif ──
    const selectedPoolIdx = ref(null)
    const isDragging = ref(false)
    const dragOverTrait = ref(null)
    let draggedPoolIdx = null

    /**
     * Vérifie si un trait a été explicitement assigné
     * (non null et fait partie du pool de base).
     */
    function isAssigned(traitId) {
      const v = props.values[traitId]
      return v !== undefined && v !== null
    }

    // ── Pool restant (valeurs non encore assignées) ──
    const remainingPool = computed(() => {
      const pool = [...BASE_POOL]
      for (const id of traitIds) {
        if (!isAssigned(id)) continue
        const v = props.values[id]
        const idx = pool.indexOf(v)
        if (idx !== -1) pool.splice(idx, 1)
      }
      return pool.sort((a, b) => b - a)
    })

    // ── Format ──
    function formatModifier(val) {
      if (val === null || val === undefined) return '?'
      if (val > 0) return `+${val}`
      return `${val}`
    }

    // ── Assigner / échanger ──
    function swapAssign(poolIdx, traitId) {
      const pool = remainingPool.value
      if (poolIdx < 0 || poolIdx >= pool.length) return
      const newValue = pool[poolIdx]
      emit('update', traitId, newValue)
      selectedPoolIdx.value = null
      isDragging.value = false
      dragOverTrait.value = null
    }

    // ── Click-to-assign ──
    function onPoolClick(idx) {
      selectedPoolIdx.value = selectedPoolIdx.value === idx ? null : idx
    }

    function onTraitClick(traitId) {
      if (selectedPoolIdx.value !== null) {
        swapAssign(selectedPoolIdx.value, traitId)
      }
    }

    // ── Drag & Drop ──
    function onDragStart(idx, event) {
      draggedPoolIdx = idx
      isDragging.value = true
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(idx))
    }

    function onDragEnd() {
      isDragging.value = false
      dragOverTrait.value = null
      draggedPoolIdx = null
    }

    function onDragOver(traitId) {
      dragOverTrait.value = traitId
    }

    function onDragLeave() {
      dragOverTrait.value = null
    }

    function onDrop(traitId) {
      if (draggedPoolIdx !== null) {
        swapAssign(draggedPoolIdx, traitId)
      }
      draggedPoolIdx = null
      isDragging.value = false
      dragOverTrait.value = null
    }

    // ── Actions rapides ──
    function applyRecommended() {
      if (!props.suggestedTraits) return
      for (const id of traitIds) {
        emit('update', id, props.suggestedTraits[id])
      }
      selectedPoolIdx.value = null
    }

    function resetTraits() {
      for (const id of traitIds) {
        emit('update', id, null)
      }
      selectedPoolIdx.value = null
    }

    return {
      traits,
      remainingPool,
      selectedPoolIdx,
      isDragging,
      dragOverTrait,
      isAssigned,
      formatModifier,
      onPoolClick,
      onTraitClick,
      onDragStart,
      onDragEnd,
      onDragOver,
      onDragLeave,
      onDrop,
      applyRecommended,
      resetTraits
    }
  }
}
</script>

<style scoped>
.trait-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ── Pool ── */
.trait-pool {
  text-align: center;
  padding: 8px;
  background: rgba(83, 168, 182, 0.06);
  border: 1px dashed var(--accent-hope, #53a8b6);
  border-radius: 6px;
}

.trait-pool--done {
  border-style: solid;
  border-color: #166534;
  background: rgba(22, 101, 52, 0.08);
}

.trait-pool--done .trait-pool__title {
  color: #4ade80;
}

.trait-pool__title {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--accent-hope, #53a8b6);
  margin-bottom: 6px;
}

.trait-pool__chips {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.pool-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: 700;
  cursor: grab;
  border: 2px solid var(--border-color, #3a3a5a);
  background: var(--bg-tertiary, #2a2a4a);
  color: var(--text-primary, #e5e7eb);
  transition: transform 150ms, border-color 150ms, box-shadow 150ms;
  user-select: none;
}

.pool-chip:active { cursor: grabbing; }
.pool-chip:hover { transform: scale(1.1); }

.pool-chip--positive { color: #4ade80; border-color: rgba(74, 222, 128, 0.4); }
.pool-chip--negative { color: var(--accent-fear, #c84b31); border-color: rgba(200, 75, 49, 0.4); }

.pool-chip--selected {
  transform: scale(1.15);
  box-shadow: 0 0 0 3px var(--accent-hope, #53a8b6);
  border-color: var(--accent-hope, #53a8b6);
}

/* ── Actions rapides ── */
.trait-actions {
  display: flex;
  gap: var(--space-xs);
  justify-content: center;
}

.trait-action-btn {
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid var(--accent-hope, #53a8b6);
  background: transparent;
  color: var(--accent-hope, #53a8b6);
  transition: background 150ms;
}

.trait-action-btn:hover { background: rgba(83, 168, 182, 0.1); }

.trait-action-btn--reset {
  border-color: var(--text-muted, #6b7280);
  color: var(--text-muted, #6b7280);
}

.trait-action-btn--reset:hover { background: rgba(107, 114, 128, 0.1); }

/* ── Grille de traits ── */
.trait-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

@media (max-width: 600px) {
  .trait-grid { grid-template-columns: repeat(2, 1fr); }
}

.trait-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 6px 8px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 2px solid transparent;
  border-radius: 8px;
  transition: border-color 150ms, background 150ms, box-shadow 150ms;
  cursor: default;
}

.trait-card--droppable {
  cursor: pointer;
  border-color: rgba(83, 168, 182, 0.25);
}

.trait-card--droppable:hover,
.trait-card--dragover {
  border-color: var(--accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.08);
  box-shadow: 0 0 8px rgba(83, 168, 182, 0.15);
}

.trait-card--match {
  border-color: rgba(74, 222, 128, 0.3);
}

.trait-card__label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-hope, #53a8b6);
}

.trait-card__value {
  font-size: 1.4rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--text-primary, #e5e7eb);
  line-height: 1;
}

.trait-card__value--positive { color: #4ade80; }
.trait-card__value--negative { color: var(--accent-fear, #c84b31); }
.trait-card__value--empty {
  color: var(--text-muted, #6b7280);
  opacity: 0.5;
}

.trait-card__recommended {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-muted, #6b7280);
  opacity: 0.7;
}

.trait-card__recommended--active {
  color: #4ade80;
  opacity: 1;
}

.trait-card__skills {
  font-size: 0.6rem;
  color: var(--text-muted, #6b7280);
  text-align: center;
  line-height: 1.3;
}
</style>
