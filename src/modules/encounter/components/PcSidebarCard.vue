<template>
  <div
    class="pc-sidebar"
    :class="{
      'pc-sidebar--selected': isSelected,
      'pc-sidebar--down': isDown,
      'pc-sidebar--targeting': isTargeting,
      'pc-sidebar--targeted': isTargeted
    }"
    role="button"
    tabindex="0"
    :aria-pressed="isTargeting ? isTargeted : undefined"
    :aria-label="isTargeting ? 'Sélectionner ' + pc.name + ' comme cible' : pc.name + (isDown ? ' (à terre)' : '') + ' — Évasion ' + effectiveEvasion"
    @click="onClick"
    @keydown.enter="$emit('select', pc.id)"
    @keydown.space.prevent="$emit('select', pc.id)"
    @pointerdown="lp.onPointerDown($event)"
    @pointerup="lp.onPointerUp()"
    @pointerleave="lp.onPointerLeave()"
  >
    <!-- Ligne 1 : nom + indicateurs -->
    <div class="pc-sidebar__header">
      <span class="pc-sidebar__name">{{ pc.name }}</span>
      <span
        v-if="isDown"
        class="pc-sidebar__down-icon"
        title="À terre"
      >💀</span>
      <span
        v-if="spotlightCount >= 1"
        class="pc-sidebar__spot"
        :title="spotlightCount + ' spotlight(s) ce cycle'"
      >✦{{ spotlightCount > 1 ? spotlightCount : '' }}</span>
    </div>

    <!-- Ligne 2 : évasion (info n°1 pour le MJ) + armure -->
    <div class="pc-sidebar__stats">
      <div
        class="pc-sidebar__stat pc-sidebar__stat--evasion"
        title="Évasion"
      >
        <span class="pc-sidebar__stat-val">{{ effectiveEvasion }}</span>
        <span class="pc-sidebar__stat-lbl">Évasion</span>
      </div>
      <div
        class="pc-sidebar__stat"
        title="Score d'armure"
      >
        <span class="pc-sidebar__stat-val">{{ pc.armorScore || 0 }}</span>
        <span class="pc-sidebar__stat-lbl">Armure</span>
      </div>
      <div
        v-if="pc.armorBaseThresholds"
        class="pc-sidebar__stat"
        title="Seuils (Majeur/Sévère)"
      >
        <span class="pc-sidebar__stat-val">{{ pc.armorBaseThresholds.major || 0 }}/{{ pc.armorBaseThresholds.severe || 0 }}</span>
        <span class="pc-sidebar__stat-lbl">Seuils</span>
      </div>
    </div>

    <!-- HP / Stress compacts -->
    <div
      class="pc-sidebar__hp-row"
      :aria-label="'PV : ' + (pc.currentHP || 0) + ' marques sur ' + pc.maxHP"
    >
      <button
        class="pc-sidebar__mini-btn"
        :disabled="(pc.currentHP || 0) <= 0"
        aria-label="Soigner 1 PV"
        @click.stop="decrementHP()"
      >
        &minus;
      </button>
      <span class="pc-sidebar__hp-text">
        &#x2764;&#xFE0F; {{ pc.currentHP || 0 }}/{{ pc.maxHP }}
      </span>
      <button
        class="pc-sidebar__mini-btn"
        :disabled="(pc.currentHP || 0) >= pc.maxHP"
        aria-label="Marquer 1 degat"
        @click.stop="incrementHP()"
      >
        +
      </button>
    </div>

    <div
      class="pc-sidebar__stress-row"
      :aria-label="'Stress : ' + (pc.currentStress || 0) + ' sur ' + pc.maxStress"
    >
      <button
        class="pc-sidebar__mini-btn"
        :disabled="(pc.currentStress || 0) <= 0"
        aria-label="Reduire 1 stress"
        @click.stop="decrementStress()"
      >
        &minus;
      </button>
      <span class="pc-sidebar__stress-text">
        &#x1F4A2; {{ pc.currentStress || 0 }}/{{ pc.maxStress }}
      </span>
      <button
        class="pc-sidebar__mini-btn"
        :disabled="(pc.currentStress || 0) >= pc.maxStress"
        aria-label="Marquer 1 stress"
        @click.stop="incrementStress()"
      >
        +
      </button>
    </div>

    <!-- Espoir -->
    <div
      v-if="(pc.hope || 0) > 0"
      class="pc-sidebar__hope"
      :aria-label="'Espoir : ' + pc.hope"
    >
      ✨ {{ pc.hope }}
    </div>

    <!-- Résumé compact des conditions actives (visible quand non sélectionné) -->
    <div
      v-if="!isSelected && activeConditions.length > 0"
      class="pc-sidebar__cond-summary"
      :aria-label="activeConditions.length + ' condition(s) active(s)'"
    >
      <span
        v-for="cond in activeConditionDetails"
        :key="cond.id"
        class="pc-sidebar__cond-dot"
        :title="cond.label"
      >{{ cond.emoji }}</span>
    </div>

    <!-- Conditions togglables (visible quand sélectionné) -->
    <div
      v-if="isSelected"
      class="pc-sidebar__conditions"
    >
      <button
        v-for="cond in conditions"
        :key="cond.id"
        class="pc-sidebar__cond"
        :class="{ 'pc-sidebar__cond--on': hasCond(cond.id) }"
        :title="cond.label"
        :aria-label="cond.label + (hasCond(cond.id) ? ' — actif' : '')"
        @click.stop="$emit('toggle-condition', { pcId: pc.id, conditionId: cond.id })"
      >
        {{ cond.emoji }}
      </button>
    </div>
  </div>
</template>

<script>
import { LIVE_CONDITIONS } from '@data/encounters/liveConstants'
import { useLongPress } from '../composables/useLongPress'
import { useCharacterStore } from '@modules/characters'

export default {
  name: 'PcSidebarCard',
  props: {
    pc: { type: Object, required: true },
    isSelected: { type: Boolean, default: false },
    isDown: { type: Boolean, default: false },
    activeConditions: { type: Array, default: () => [] },
    spotlightCount: { type: Number, default: 0 },
    isTargeting: { type: Boolean, default: false },
    isTargeted: { type: Boolean, default: false }
  },
  emits: ['select', 'toggle-condition', 'long-press', 'toggle-target'],
  setup(props, { emit }) {
    const lp = useLongPress(() => {
      emit('long-press', props.pc.id)
    }, { delay: 400 })

    /** Bloque le clic normal si le long press a été déclenché */
    function onClick() {
      if (props.isTargeting) {
        emit('toggle-target', props.pc.id, 'pc')
        return
      }
      if (!lp.wasFired()) {
        emit('select', props.pc.id)
      }
    }

    // ── Gestion interactive HP / Stress ──
    const characterStore = useCharacterStore()

    /** Marquer 1 degat */
    function incrementHP() {
      const newVal = Math.min(props.pc.maxHP, (props.pc.currentHP || 0) + 1)
      characterStore.patchCharacterById(props.pc.id, { currentHP: newVal })
    }

    /** Soigner 1 PV */
    function decrementHP() {
      const newVal = Math.max(0, (props.pc.currentHP || 0) - 1)
      characterStore.patchCharacterById(props.pc.id, { currentHP: newVal })
    }

    /** Marquer 1 stress */
    function incrementStress() {
      const newVal = Math.min(props.pc.maxStress, (props.pc.currentStress || 0) + 1)
      characterStore.patchCharacterById(props.pc.id, { currentStress: newVal })
    }

    /** Reduire 1 stress */
    function decrementStress() {
      const newVal = Math.max(0, (props.pc.currentStress || 0) - 1)
      characterStore.patchCharacterById(props.pc.id, { currentStress: newVal })
    }

    return {
      lp,
      onClick,
      incrementHP,
      decrementHP,
      incrementStress,
      decrementStress
    }
  },
  computed: {
    effectiveEvasion() {
      return (this.pc.evasion || 10) + (this.pc.evasionBonus || 0)
    },
    conditions() {
      return LIVE_CONDITIONS
    },
    /** Détails des conditions actuellement actives (pour le résumé compact) */
    activeConditionDetails() {
      return LIVE_CONDITIONS.filter((c) => this.activeConditions.includes(c.id))
    }
  },
  methods: {
    hasCond(condId) {
      return this.activeConditions.includes(condId)
    }
  }
}
</script>

<style scoped>
.pc-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
  user-select: none;
}

.pc-sidebar:hover {
  border-color: var(--color-accent-hope);
  background: var(--color-bg-elevated);
}

.pc-sidebar--selected {
  border-color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.12);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
}

.pc-sidebar--targeting {
  cursor: crosshair;
  border: 2px dashed var(--color-accent, #a855f7);
}

.pc-sidebar--targeted {
  border: 2px solid var(--color-success, #22c55e);
  background: rgba(34, 197, 94, 0.1);
}

.pc-sidebar--down {
  opacity: 0.6;
}

.pc-sidebar--down.pc-sidebar--selected {
  opacity: 0.8;
}

/* ── Header ── */

.pc-sidebar__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pc-sidebar__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pc-sidebar__down-icon {
  font-size: var(--font-size-sm);
}

.pc-sidebar__spot {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-weight-bold);
}

/* ── Stats ── */

.pc-sidebar__stats {
  display: flex;
  gap: var(--space-sm);
}

.pc-sidebar__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 3rem;
}

.pc-sidebar__stat--evasion .pc-sidebar__stat-val {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
}

.pc-sidebar__stat-val {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.pc-sidebar__stat-lbl {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Espoir ── */
.pc-sidebar__hope {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

/* ── Résumé conditions (non-sélectionné) ── */

.pc-sidebar__cond-summary {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.pc-sidebar__cond-dot {
  font-size: var(--font-size-xs);
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(244, 67, 54, 0.15);
  border-radius: var(--radius-sm);
  line-height: 1;
}

/* ── Conditions togglables (sélectionné) ── */

.pc-sidebar__conditions {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.pc-sidebar__cond {
  min-width: 2.5rem;
  min-height: 2.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  font-size: var(--font-size-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  padding: 0;
}

.pc-sidebar__cond:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.pc-sidebar__cond--on {
  background: rgba(244, 67, 54, 0.2);
  border-color: var(--color-accent-danger);
}

/* ── HP / Stress compacts ── */

.pc-sidebar__hp-row,
.pc-sidebar__stress-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.pc-sidebar__hp-text,
.pc-sidebar__stress-text {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.pc-sidebar__mini-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  min-height: 1.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  cursor: pointer;
  touch-action: manipulation;
  padding: 0;
  line-height: 1;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.pc-sidebar__mini-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.pc-sidebar__mini-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
