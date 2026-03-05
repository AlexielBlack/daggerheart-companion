<template>
  <div
    class="pc-sidebar"
    :class="{
      'pc-sidebar--selected': isSelected,
      'pc-sidebar--down': isDown
    }"
    role="button"
    tabindex="0"
    :aria-label="pc.name + (isDown ? ' (à terre)' : '') + ' — Évasion ' + effectiveEvasion"
    @click="$emit('select', pc.id)"
    @keydown.enter="$emit('select', pc.id)"
    @keydown.space.prevent="$emit('select', pc.id)"
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
    </div>

    <!-- Conditions togglables -->
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

export default {
  name: 'PcSidebarCard',
  props: {
    pc: { type: Object, required: true },
    isSelected: { type: Boolean, default: false },
    isDown: { type: Boolean, default: false },
    activeConditions: { type: Array, default: () => [] },
    spotlightCount: { type: Number, default: 0 }
  },
  emits: ['select', 'toggle-condition'],
  computed: {
    effectiveEvasion() {
      return (this.pc.evasion || 10) + (this.pc.evasionBonus || 0)
    },
    conditions() {
      return LIVE_CONDITIONS
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

/* ── Conditions ── */

.pc-sidebar__conditions {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.pc-sidebar__cond {
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  font-size: var(--font-size-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
