<template>
  <div
    class="pc-sidebar"
    :class="{
      'pc-sidebar--selected': isSelected,
      'pc-sidebar--down': isDown,
      'pc-sidebar--targeting': isTargeting,
      'pc-sidebar--targeted': isTargeted,
      'pc-sidebar--drag-over': isDragOver
    }"
    role="button"
    tabindex="0"
    :data-drag-id="pc.id"
    data-drag-type="pc"
    :aria-pressed="isTargeting ? isTargeted : undefined"
    :aria-label="isTargeting ? 'Sélectionner ' + pc.name + ' comme cible' : pc.name + (isDown ? ' (à terre)' : '') + ' — Évasion ' + effectiveEvasion"
    @click="onClick"
    @keydown.enter="$emit('select', pc.id)"
    @keydown.space.prevent="$emit('select', pc.id)"
    @pointerdown="lp.onPointerDown($event)"
    @pointerup="lp.onPointerUp()"
    @pointerleave="lp.onPointerLeave()"
    @touchstart.passive="swipe.onTouchStart($event)"
    @touchend.passive="swipe.onTouchEnd($event)"
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
      <button
        class="pc-sidebar__quick-btn"
        title="Actions rapides"
        aria-label="Actions rapides"
        @click.stop="$emit('open-quick-menu', pc.id, $event)"
      >
        ⚡
      </button>
    </div>

    <!-- Ligne 2 : toutes les stats sur une ligne — valeurs colorées -->
    <div
      class="pc-sidebar__stats-line"
      :aria-label="'Évasion ' + effectiveEvasion + ', Armure ' + (pc.armorScore || 0) + ', PV ' + (pc.currentHP || 0) + '/' + pc.maxHP"
    >
      <span
        class="pc-sidebar__sv"
        title="Évasion"
      >{{ effectiveEvasion }}</span>
      <span class="pc-sidebar__sv-sep">·</span>
      <span
        class="pc-sidebar__sv"
        title="Armure (utilisés/total)"
        :style="{ color: armorColor }"
      >&#x1F6E1;&#xFE0F;{{ armorFree }}</span>
      <span class="pc-sidebar__sv-sep">·</span>
      <span
        v-if="pc.armorBaseThresholds"
        class="pc-sidebar__sv pc-sidebar__sv--muted"
        title="Seuils (Majeur/Sévère)"
      >{{ pc.armorBaseThresholds.major || 0 }}/{{ pc.armorBaseThresholds.severe || 0 }}</span>
      <span
        v-if="pc.armorBaseThresholds"
        class="pc-sidebar__sv-sep"
      >·</span>
      <span
        class="pc-sidebar__sv"
        title="PV restants"
        :style="{ color: hpDangerColor }"
      >&#x2764;&#xFE0F;{{ hpRemaining }}</span>
      <span class="pc-sidebar__sv-sep">·</span>
      <span
        class="pc-sidebar__sv"
        title="Stress"
        :style="{ color: stressDangerColor }"
      >&#x1F4A2;{{ pc.currentStress || 0 }}</span>
    </div>

    <!-- Arme équipée (compact) -->
    <div
      v-if="weapon"
      class="pc-sidebar__weapon"
    >
      <span class="pc-sidebar__weapon-icon">{{ weapon.damageType === 'mag' ? '✨' : '🗡️' }}</span>
      <span class="pc-sidebar__weapon-name">{{ weapon.name }}</span>
      <span class="pc-sidebar__weapon-dmg">{{ weapon.damage }}</span>
    </div>

    <!-- Conditions actives (toujours visibles si > 0) -->
    <div
      v-if="activeConditions.length > 0"
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
import { computed } from 'vue'
import { LIVE_CONDITIONS } from '@data/encounters/liveConstants'
import { useLongPress } from '../composables/useLongPress'
import { useSwipe } from '../composables/useSwipe'
import { useDragTarget } from '../composables/useDragTarget'
import { useCharacterStore } from '@modules/characters'
import { getPrimaryWeaponById } from '@data/equipment'

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
  emits: ['select', 'toggle-condition', 'toggle-target', 'swipe-damage', 'swipe-armor', 'open-quick-menu'],
  setup(props, { emit }) {
    const drag = useDragTarget()

    // ── Long-press → initie le drag (setPointerCapture empêche le scroll) ──
    const lp = useLongPress((e) => {
      if (e.target) e.target.setPointerCapture(e.pointerId)
      drag.startDrag({ id: props.pc.id, type: 'pc', name: props.pc.name }, e)
    }, { delay: 300 })

    // ── Drop target : signaler le survol quand un drag adversaire passe dessus ──
    const isDragOver = computed(() =>
      drag.isDragging.value &&
      drag.dragOver.value?.id === props.pc.id &&
      drag.dragOver.value?.type === 'pc'
    )

    const swipe = useSwipe({
      onSwipeLeft() {
        if (props.isTargeting) return
        emit('swipe-damage', props.pc.id)
      },
      onSwipeRight() {
        if (props.isTargeting) return
        emit('swipe-armor', props.pc.id)
      },
      threshold: 50
    })

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

    /** Ajouter 1 espoir */
    function incrementHope() {
      characterStore.patchCharacterById(props.pc.id, { hope: (props.pc.hope || 0) + 1 })
    }

    /** Retirer 1 espoir */
    function decrementHope() {
      const newVal = Math.max(0, (props.pc.hope || 0) - 1)
      characterStore.patchCharacterById(props.pc.id, { hope: newVal })
    }

    return {
      lp,
      swipe,
      isDragOver,
      onClick,
      incrementHP,
      decrementHP,
      incrementStress,
      decrementStress,
      incrementHope,
      decrementHope
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
    },
    /** Arme principale équipée */
    weapon() {
      if (!this.pc.primaryWeaponId) return null
      return getPrimaryWeaponById(this.pc.primaryWeaponId) || null
    },
    /** PV restants (max - marqués) */
    hpRemaining() {
      return this.pc.maxHP - (this.pc.currentHP || 0)
    },
    /** Slots d'armure libres */
    armorFree() {
      return (this.pc.armorScore || 0) - (this.pc.armorSlotsMarked || 0)
    },
    /** Couleur PV selon le danger */
    hpDangerColor() {
      const ratio = this.hpRemaining / (this.pc.maxHP || 1)
      if (ratio > 0.5) return 'var(--color-accent-success)'
      if (ratio > 0.25) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    },
    /** Couleur stress selon le danger */
    stressDangerColor() {
      const ratio = (this.pc.currentStress || 0) / (this.pc.maxStress || 1)
      if (ratio < 0.5) return 'var(--color-accent-success)'
      if (ratio < 0.75) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    },
    /** Couleur armure selon les slots restants */
    armorColor() {
      if (this.armorFree <= 0) return 'var(--color-accent-danger)'
      if (this.armorFree <= 1) return 'var(--color-accent-warning)'
      return 'var(--color-text-secondary)'
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

.pc-sidebar--drag-over {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 2px var(--color-accent-hope), 0 0 12px rgba(83, 168, 182, 0.3);
  background: rgba(83, 168, 182, 0.1);
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

.pc-sidebar__quick-btn {
  margin-left: auto;
  width: 1.6rem;
  height: 1.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.15s, background 0.15s;
  touch-action: manipulation;
  flex-shrink: 0;
}

.pc-sidebar__quick-btn:hover { opacity: 1; background: var(--color-bg-elevated); }

/* ── Stats ── */

/* ── Espoir (legacy, inutilisé) ── */
.pc-sidebar__hope-row {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: center;
}
.pc-sidebar__hope-text {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-bold);
  text-align: center;
  min-width: 2.5em;
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

.pc-sidebar__cond-dot--toggle {
  cursor: pointer;
  touch-action: manipulation;
}

.pc-sidebar__cond-dot--toggle:hover {
  background: rgba(244, 67, 54, 0.3);
}

/* ── Arme équipée (compact) ── */

.pc-sidebar__weapon {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding: 1px var(--space-xs);
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  overflow: hidden;
}

.pc-sidebar__weapon-icon { flex-shrink: 0; }
.pc-sidebar__weapon-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.pc-sidebar__weapon-dmg { font-weight: var(--font-weight-bold); color: var(--color-text-primary); flex-shrink: 0; }

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

/* ── Stats inline (une seule ligne) ── */

.pc-sidebar__stats-line {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
  font-variant-numeric: tabular-nums;
}

.pc-sidebar__sv {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.pc-sidebar__sv--muted {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.pc-sidebar__sv-sep {
  color: var(--color-border);
  font-size: 0.5rem;
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

/* ══ iPad paysage — carte condensée ══ */
@media (orientation: landscape) and (min-width: 768px) and (max-width: 1280px) {
  .pc-sidebar { padding: var(--space-xs); gap: 2px; }
  .pc-sidebar__header { gap: 2px; }
  .pc-sidebar__name { font-size: var(--font-size-xs); }
  .pc-sidebar__quick-btn { width: 1.3rem; height: 1.3rem; font-size: 0.6rem; }
  .pc-sidebar__stats-line { gap: 2px; }
  .pc-sidebar__sv { font-size: 0.65rem; }
  .pc-sidebar__weapon { font-size: 0.6rem; padding: 1px 3px; }
  .pc-sidebar__cond-dot { width: 1.1rem; height: 1.1rem; font-size: 0.6rem; }
}
</style>
