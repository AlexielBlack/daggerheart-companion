<template>
  <div
    class="pc-strip"
    role="table"
    aria-label="Recapitulatif des personnages"
  >
    <div
      class="pc-strip__header"
      role="row"
    >
      <span
        class="pc-strip__cell pc-strip__cell--name"
        role="columnheader"
      >PJ</span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="columnheader"
      >PV</span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="columnheader"
      >Stress</span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="columnheader"
      >Armure</span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="columnheader"
      >Espoir</span>
      <span
        class="pc-strip__cell pc-strip__cell--conditions"
        role="columnheader"
      >Conditions</span>
    </div>
    <div
      v-for="pc in characters"
      :key="pc.id"
      class="pc-strip__row"
      role="row"
    >
      <span
        class="pc-strip__cell pc-strip__cell--name"
        role="cell"
      >
        <button
          class="pc-strip__name-btn"
          :aria-label="'Voir la fiche de ' + (pc.name || 'Sans nom')"
          @click="$emit('select-pc', pc.id)"
        >
          <span
            v-if="pc.classData"
            class="pc-strip__emoji"
            aria-hidden="true"
          >{{ pc.classData.emoji }}</span>
          {{ pc.name || 'Sans nom' }}
        </button>
      </span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="cell"
        :class="hpClass(pc)"
      >
        &#x2764;&#xFE0F; {{ pc.currentHP || 0 }}/{{ pc.effectiveMaxHP }}
      </span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="cell"
        :class="stressClass(pc)"
      >
        &#x1F630; {{ pc.currentStress || 0 }}/{{ pc.effectiveMaxStress }}
      </span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="cell"
      >
        &#x1F6E1;&#xFE0F; {{ pc.armorSlotsMarked || 0 }}/{{ pc.effectiveArmorScore }}
      </span>
      <span
        class="pc-strip__cell pc-strip__cell--stat"
        role="cell"
      >
        &#x2728; {{ pc.hope || 0 }}
      </span>
      <span
        class="pc-strip__cell pc-strip__cell--conditions"
        role="cell"
      >
        <span
          v-for="cond in (pc.conditions || [])"
          :key="cond"
          class="pc-strip__condition"
        >{{ cond }}</span>
        <span
          v-if="!pc.conditions || pc.conditions.length === 0"
          class="pc-strip__no-cond"
        >&mdash;</span>
      </span>
    </div>
  </div>
</template>

<script>
/**
 * PcSummaryStrip — Bandeau recapitulatif compact des PJ.
 * Affiche une ligne par PJ avec nom, PV, stress, armure, espoir et conditions.
 * currentHP represente les degats marques : ratio eleve = plus de danger.
 */
export default {
  name: 'PcSummaryStrip',
  props: {
    characters: { type: Array, required: true }
  },
  emits: ['select-pc'],
  setup() {
    /** Classe de danger basee sur le ratio de degats marques */
    function hpClass(pc) {
      const ratio = (pc.currentHP || 0) / (pc.effectiveMaxHP || 1)
      if (ratio >= 0.75) return 'pc-strip__cell--danger-high'
      if (ratio >= 0.5) return 'pc-strip__cell--danger-mid'
      return ''
    }

    /** Classe de danger basee sur le ratio de stress */
    function stressClass(pc) {
      const ratio = (pc.currentStress || 0) / (pc.effectiveMaxStress || 1)
      if (ratio >= 0.75) return 'pc-strip__cell--danger-high'
      if (ratio >= 0.5) return 'pc-strip__cell--danger-mid'
      return ''
    }

    return { hpClass, stressClass }
  }
}
</script>

<style scoped>
.pc-strip {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  font-size: var(--font-size-sm);
}

.pc-strip__header {
  display: flex;
  background: var(--color-bg-secondary);
  padding: var(--space-xs) var(--space-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pc-strip__row {
  display: flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-top: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.pc-strip__row:hover {
  background: var(--color-bg-elevated);
}

.pc-strip__cell--name {
  flex: 2;
  min-width: 0;
}

.pc-strip__cell--stat {
  flex: 1;
  text-align: center;
  white-space: nowrap;
}

.pc-strip__cell--conditions {
  flex: 2;
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.pc-strip__name-btn {
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 0;
  font-weight: var(--font-weight-medium);
  text-align: left;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
}

.pc-strip__name-btn:hover {
  text-decoration: underline;
  color: var(--color-accent-hope);
}

.pc-strip__emoji {
  font-size: 1em;
}

.pc-strip__cell--danger-high {
  color: var(--color-accent-danger);
  font-weight: var(--font-weight-bold);
}

.pc-strip__cell--danger-mid {
  color: var(--color-accent-warning);
}

.pc-strip__condition {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-xs);
  background: color-mix(in srgb, var(--color-accent-warning) 20%, transparent);
  color: var(--color-accent-warning);
  border-radius: var(--radius-sm);
}

.pc-strip__no-cond {
  color: var(--color-text-muted);
}
</style>
