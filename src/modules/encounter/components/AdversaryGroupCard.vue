<template>
  <section
    class="adv-group"
    :class="{
      'adv-group--selected': isSelected,
      'adv-group--all-defeated': group.activeCount === 0,
      'adv-group--collapsed': collapsed,
      'adv-group--targeting': isTargeting,
      'adv-group--targeted': isTargeting && allGroupTargeted,
      'adv-group--drag-over': isDragOverGroup
    }"
    :data-drag-id="group.adversaryId"
    data-drag-type="adversary"
    :aria-label="group.name + ' — ' + group.instances.length + ' instance(s)'"
    @pointerdown="lp.onPointerDown($event)"
    @pointerup="lp.onPointerUp()"
    @pointerleave="lp.onPointerLeave()"
  >
    <!-- ── Header : toujours visible ── -->
    <div
      class="adv-group__header"
      role="button"
      tabindex="0"
      :aria-expanded="!collapsed"
      @click="onHeaderClick"
      @keydown.enter="onHeaderClick"
      @keydown.space.prevent="onHeaderClick"
    >
      <div class="adv-group__identity">
        <span class="adv-group__name">
          {{ group.name }}
        </span>
        <span class="adv-group__type">
          {{ group.type }}
        </span>
        <span
          v-if="group.instances.length > 1"
          class="adv-group__qty"
        >×{{ group.instances.length }}</span>
        <span
          v-if="group.defeatedCount > 0"
          class="adv-group__dead-count"
        >{{ group.defeatedCount }}💀</span>
      </div>

      <!-- Résumé HP (toujours visible) -->
      <span class="adv-group__hp-summary">
        ❤️{{ totalMarkedHP }}/{{ totalMaxHP }}
      </span>

      <!-- Difficulté -->
      <div
        class="adv-group__diff"
        title="Difficulté"
      >
        {{ firstInstance.difficulty }}
      </div>

      <!-- Marqueur "a agi ce tour" -->
      <button
        class="adv-group__acted-btn"
        :class="{ 'adv-group__acted-btn--on': hasActed }"
        :title="hasActed ? 'A agi — cliquer pour annuler' : 'N\'a pas agi — cliquer pour marquer'"
        :aria-label="hasActed ? 'A agi ce tour' : 'N\'a pas agi'"
        @click.stop="$emit('toggle-acted', group.adversaryId)"
      >
        {{ hasActed ? '●' : '○' }}
      </button>

      <!-- Bouton collapse dédié -->
      <button
        class="adv-group__collapse-btn"
        :aria-label="collapsed ? 'Déplier' : 'Replier'"
        :title="collapsed ? 'Déplier' : 'Replier'"
        @click.stop="manualCollapsed = !collapsed"
      >
        {{ collapsed ? '▶' : '▼' }}
      </button>
    </div>

    <!-- ── Seuils : toujours visibles ── -->
    <div
      v-if="hasThresholds"
      class="adv-group__thresh-ref"
    >
      <span class="adv-group__thresh-tag adv-group__thresh-tag--minor">
        &lt; {{ firstInstance.thresholds.major }} → 1HP
      </span>
      <span class="adv-group__thresh-tag adv-group__thresh-tag--major">
        {{ firstInstance.thresholds.major }}–{{ firstInstance.thresholds.severe - 1 }} → 2HP
      </span>
      <span class="adv-group__thresh-tag adv-group__thresh-tag--severe">
        ≥ {{ firstInstance.thresholds.severe }} → 3HP
      </span>
    </div>

    <!-- ── Attaque standard (toujours visible) ── -->
    <div
      v-if="firstInstance.attack"
      class="adv-group__attack"
    >
      <span class="adv-group__atk-label">ATK</span>
      <span class="adv-group__atk-mod">{{ firstInstance.attack.modifier >= 0 ? '+' : '' }}{{ firstInstance.attack.modifier }}</span>
      <span class="adv-group__atk-name">
        {{ firstInstance.attack.name }}
      </span>
      <span class="adv-group__atk-range">
        {{ firstInstance.attack.range }}
      </span>
      <span class="adv-group__atk-dmg">
        {{ firstInstance.attack.damage }}
      </span>
    </div>

    <!-- ── Contenu dépliable ── -->
    <div
      v-show="!collapsed"
      class="adv-group__body"
    >
      <!-- ══ MINION : grille compacte de coches ══ -->
      <div
        v-if="isMinion"
        class="adv-group__minion-grid"
      >
        <button
          v-for="inst in group.instances"
          :key="inst.instanceId"
          class="adv-group__minion-btn"
          :class="{
            'adv-group__minion-btn--dead': inst.isDefeated,
            'adv-group__minion-btn--targeted': isTargeting && isTargetSelected(inst.instanceId)
          }"
          :aria-label="isTargeting
            ? 'Sélectionner minion #' + (group.instances.indexOf(inst) + 1) + ' comme cible'
            : (inst.isDefeated ? 'Réanimer' : 'Vaincre') + ' minion #' + (group.instances.indexOf(inst) + 1)"
          :aria-pressed="isTargeting ? isTargetSelected(inst.instanceId) : undefined"
          :title="inst.isDefeated ? 'Réanimer' : 'Vaincre'"
          @click.stop="isTargeting ? $emit('toggle-target', inst.instanceId, 'adversary') : toggleMinion(inst)"
        >
          {{ inst.isDefeated ? '💀' : '✦' }}
        </button>
        <span class="adv-group__minion-count">
          {{ group.activeCount }}/{{ group.instances.length }}
        </span>
      </div>

      <!-- ══ NON-MINION : instances actives en 2 lignes ══ -->
      <div
        v-else
        class="adv-group__instances"
      >
        <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
        <div
          v-for="inst in activeInstances"
          :key="inst.instanceId"
          class="adv-group__inst"
          :class="{
            'adv-group__inst--swiped': swipedId === inst.instanceId,
            'adv-group__inst--targeted': isTargeting && isTargetSelected(inst.instanceId)
          }"
          :aria-pressed="isTargeting ? isTargetSelected(inst.instanceId) : undefined"
          :aria-label="isTargeting ? 'Sélectionner ' + inst.name + ' comme cible' : undefined"
          @click="isTargeting ? $emit('toggle-target', inst.instanceId, 'adversary') : null"
        >
          <!-- Bouton vaincre révélé par swipe -->
          <button
            v-if="swipedId === inst.instanceId"
            class="adv-group__swipe-defeat"
            aria-label="Confirmer vaincre"
            @click.stop="confirmSwipeDefeat(inst.instanceId)"
          >
            💀 Vaincre
          </button>

          <!-- Contenu swipeable -->
          <div
            class="adv-group__inst-content"
            :style="swipedId === inst.instanceId ? { transform: 'translateX(-5rem)' } : {}"
            @touchstart.passive="onInstTouchStart($event, inst.instanceId)"
            @touchend.passive="onInstTouchEnd"
          >
            <!-- Ligne 1 : identité + HP barre étendue + vaincre -->
            <div class="adv-group__inst-row1">
              <span
                v-if="group.instances.length > 1"
                class="adv-group__inst-num"
              >#{{ inst.originalIdx + 1 }}</span>

              <!-- HP compteur + barre étendue -->
              <div class="adv-group__inst-hp">
                <div class="adv-group__hp-bar">
                  <div
                    class="adv-group__hp-fill"
                    :style="{ width: hpPercent(inst) + '%' }"
                  ></div>
                </div>
                <span class="adv-group__hp-val">{{ inst.markedHP }}/{{ inst.maxHP }}</span>
              </div>

              <button
                class="adv-group__action-btn adv-group__action-btn--defeat"
                title="Vaincre"
                aria-label="Vaincre"
                @click.stop="$emit('defeat', inst.instanceId)"
              >
                💀
              </button>
            </div>

            <!-- Ligne secondaire : stress (lecture seule) + conditions -->
            <div
              v-if="inst.maxStress > 0 || inst.conditions.length > 0"
              class="adv-group__inst-secondary"
            >
              <span
                v-if="inst.maxStress > 0"
                class="adv-group__stress-label"
                :style="{ color: stressColor(inst) }"
              >ST {{ inst.markedStress }}/{{ inst.maxStress }}</span>
              <div class="adv-group__inst-conds">
                <button
                  v-for="cond in conditions"
                  :key="cond.id"
                  class="adv-group__cond"
                  :class="{ 'adv-group__cond--on': inst.conditions.includes(cond.id) }"
                  :title="cond.label"
                  :aria-label="cond.label"
                  @click.stop="$emit('toggle-condition', { instanceId: inst.instanceId, conditionId: cond.id })"
                >
                  {{ cond.emoji }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ Résumé vaincus (collapsé) ══ -->
        <div
          v-if="defeatedInstances.length > 0"
          class="adv-group__defeated-summary"
        >
          <button
            class="adv-group__defeated-toggle"
            :aria-expanded="showDefeated"
            :aria-label="defeatedInstances.length + ' vaincu(s) — cliquer pour déplier'"
            @click.stop="showDefeated = !showDefeated"
          >
            <span class="adv-group__defeated-label">
              💀 {{ defeatedInstances.length }} vaincu{{ defeatedInstances.length > 1 ? 's' : '' }}
            </span>
            <span class="adv-group__defeated-chevron">{{ showDefeated ? '▲' : '▼' }}</span>
          </button>
          <!-- Instances vaincues dépliables -->
          <template v-if="showDefeated">
            <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
            <div
              v-for="inst in defeatedInstances"
              :key="inst.instanceId"
              class="adv-group__inst adv-group__inst--defeated"
              :class="{ 'adv-group__inst--targeted': isTargeting && isTargetSelected(inst.instanceId) }"
              @click="isTargeting ? $emit('toggle-target', inst.instanceId, 'adversary') : null"
            >
              <div class="adv-group__inst-row1">
                <span
                  v-if="group.instances.length > 1"
                  class="adv-group__inst-num"
                >#{{ inst.originalIdx + 1 }}</span>
                <span class="adv-group__inst-status">💀</span>
                <button
                  class="adv-group__action-btn adv-group__action-btn--revive"
                  title="Réanimer"
                  aria-label="Réanimer"
                  @click.stop="$emit('revive', inst.instanceId)"
                >
                  ↩
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { LIVE_CONDITIONS } from '@data/encounters/liveConstants'
import { useDragTarget } from '../composables/useDragTarget'
import { useLongPress } from '../composables/useLongPress'

export default {
  name: 'AdversaryGroupCard',
  props: {
    group: { type: Object, required: true },
    isSelected: { type: Boolean, default: false },
    hasActed: { type: Boolean, default: false },
    isTargeting: { type: Boolean, default: false },
    isTargetSelected: { type: Function, default: () => false }
  },
  emits: [
    'select-group',
    'apply-damage', 'mark-stress', 'clear-stress',
    'clear-hp', 'defeat', 'revive',
    'toggle-condition', 'toggle-acted',
    'toggle-target'
  ],
  setup(props) {
    const drag = useDragTarget()

    const isDragOverGroup = computed(() =>
      drag.isDragging.value &&
      drag.dragOver.value?.id === props.group.adversaryId &&
      drag.dragOver.value?.type === 'adversary'
    )

    // ── Long-press → initie le drag (setPointerCapture empêche le scroll) ──
    const lp = useLongPress((e) => {
      if (props.group.activeCount === 0) return
      if (e.target) e.target.setPointerCapture(e.pointerId)
      drag.startDrag({
        id: props.group.adversaryId,
        type: 'adversary',
        name: props.group.name
      }, e)
    }, { delay: 300 })

    return { isDragOverGroup, lp }
  },
  data() {
    return {
      manualCollapsed: null,
      showDefeated: false,
      swipedId: null,
      touchStartX: 0,
      touchStartY: 0,
      touchInstId: null,
      dmgInput: ''
    }
  },
  computed: {
    firstInstance() {
      return this.group.instances[0] || {}
    },
    /** Indique si ce groupe est de type Minion (layout compact) */
    isMinion() {
      return this.group.type === 'Minion'
    },
    /** Indique si les seuils de dégâts sont définis (pas null) */
    hasThresholds() {
      const t = this.firstInstance.thresholds
      return t && t.major !== null && t.severe !== null
    },
    conditions() {
      return LIVE_CONDITIONS
    },
    collapsed() {
      if (this.manualCollapsed !== null) return this.manualCollapsed
      return !this.isSelected
    },
    /** Vrai si toutes les instances actives du groupe sont ciblées */
    allGroupTargeted() {
      return this.activeInstances.length > 0 &&
        this.activeInstances.every(inst => this.isTargetSelected(inst.instanceId))
    },
    totalMarkedHP() {
      return this.group.instances.reduce((s, i) => s + i.markedHP, 0)
    },
    totalMaxHP() {
      return this.group.instances.reduce((s, i) => s + i.maxHP, 0)
    },
    /** Instances actives (non vaincues) avec leur index original */
    activeInstances() {
      return this.group.instances
        .map((inst, idx) => ({ ...inst, originalIdx: idx }))
        .filter((inst) => !inst.isDefeated)
    },
    /** Instances vaincues avec leur index original */
    defeatedInstances() {
      return this.group.instances
        .map((inst, idx) => ({ ...inst, originalIdx: idx }))
        .filter((inst) => inst.isDefeated)
    },
    /**
     * Tier suggéré (1/2/3) basé sur le dégât saisi vs seuils.
     * Retourne 0 si aucun dégât saisi ou pas de seuils.
     */
    suggestedTier() {
      const dmg = parseInt(this.dmgInput)
      if (!dmg || dmg <= 0 || !this.hasThresholds) return 0
      const t = this.firstInstance.thresholds
      if (dmg >= t.severe) return 3
      if (dmg >= t.major) return 2
      return 1
    }
  },
  watch: {
    /** Quand sélectionné, auto-déplier (reset le manuel) */
    isSelected(val) {
      if (val) this.manualCollapsed = null
    }
  },
  methods: {
    /** En ciblage, toggle toutes les instances actives ; sinon sélectionner le groupe */
    onHeaderClick() {
      if (this.isTargeting) {
        for (const inst of this.activeInstances) {
          this.$emit('toggle-target', inst.instanceId, 'adversary')
        }
        return
      }
      this.$emit('select-group', this.group.adversaryId)
    },
    hpPercent(inst) {
      if (!inst.maxHP) return 0
      return Math.round((inst.markedHP / inst.maxHP) * 100)
    },
    stressPercent(inst) {
      if (!inst.maxStress) return 0
      return Math.round((inst.markedStress / inst.maxStress) * 100)
    },
    stressColor(inst) {
      if (!inst.maxStress) return 'var(--color-text-muted)'
      const ratio = inst.markedStress / inst.maxStress
      if (ratio < 0.5) return 'var(--color-text-muted)'
      if (ratio < 0.75) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    },
    /** Détecte le début du swipe sur une instance */
    onInstTouchStart(e, instanceId) {
      const touch = e.changedTouches[0]
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
      this.touchInstId = instanceId
    },
    /** Évalue le swipe à la fin du touch */
    onInstTouchEnd(e) {
      const touch = e.changedTouches[0]
      const dx = touch.clientX - this.touchStartX
      const dy = touch.clientY - this.touchStartY
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      // Seuil 60px, intention clairement horizontale
      if (absDx > 60 && absDx > absDy * 1.5) {
        if (dx < 0) {
          // Swipe gauche → révéler le bouton vaincre
          this.swipedId = this.touchInstId
        } else {
          // Swipe droite → refermer
          this.swipedId = null
        }
      }
      this.touchInstId = null
    },
    /** Confirme la défaite via le bouton révélé par swipe */
    confirmSwipeDefeat(instanceId) {
      this.swipedId = null
      this.$emit('defeat', instanceId)
    },
    /** Toggle minion vivant/mort — tap unique */
    toggleMinion(inst) {
      if (inst.isDefeated) {
        this.$emit('revive', inst.instanceId)
      } else {
        this.$emit('defeat', inst.instanceId)
      }
    },
    /** Applique les dégâts et vide le champ calculateur */
    applyDamageAndClear(instanceId, hpToMark) {
      this.$emit('apply-damage', { instanceId, hpToMark })
      this.dmgInput = ''
    }
  }
}
</script>

<style scoped>
.adv-group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.adv-group--selected {
  border-color: var(--color-accent-fear);
  box-shadow: 0 0 0 1px var(--color-accent-fear);
}

.adv-group--all-defeated { opacity: 0.5; }

.adv-group--drag-over {
  border-color: var(--color-accent-danger);
  box-shadow: 0 0 0 2px var(--color-accent-danger), 0 0 12px rgba(244, 67, 54, 0.3);
  background: rgba(244, 67, 54, 0.05);
}

.adv-group--targeting {
  cursor: crosshair;
}
.adv-group--targeted {
  border: 2px solid var(--color-success, #22c55e);
  background: rgba(34, 197, 94, 0.1);
}

/* ── Header ── */

.adv-group__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--color-bg-surface);
  cursor: pointer;
  user-select: none;
}

.adv-group__header:hover { background: var(--color-bg-elevated); }

.adv-group__identity {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
}

.adv-group__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adv-group__type { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.adv-group__qty { font-size: var(--font-size-xs); color: var(--color-accent-gold); font-weight: var(--font-weight-bold); }
.adv-group__dead-count { font-size: var(--font-size-xs); }

.adv-group__hp-summary {
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.adv-group__diff {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-fear);
  min-width: 2rem;
  text-align: center;
  line-height: 1;
}

.adv-group__collapse-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  touch-action: manipulation;
  flex-shrink: 0;
}

.adv-group__collapse-btn:hover { background: var(--color-bg-elevated); }

/* ── Marqueur "a agi" ── */

.adv-group__acted-btn {
  min-width: 2rem;
  min-height: var(--touch-min);
  border: none;
  background: transparent;
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  touch-action: manipulation;
  transition: color var(--transition-fast);
  flex-shrink: 0;
}

.adv-group__acted-btn--on {
  color: var(--color-accent-success);
}

.adv-group__acted-btn:hover { background: var(--color-bg-elevated); }

/* ── Body ── */

.adv-group__body {
  display: flex;
  flex-direction: column;
}

/* ── Seuils de référence (une seule ligne d'étiquettes) ── */

.adv-group__thresh-ref {
  display: flex;
  gap: 1px;
  background: var(--color-border);
}

.adv-group__thresh-tag {
  flex: 1;
  font-size: var(--font-size-xs);
  text-align: center;
  padding: 2px var(--space-xs);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.adv-group__thresh-tag--minor { background: rgba(76, 175, 80, 0.1); }
.adv-group__thresh-tag--major { background: rgba(255, 152, 0, 0.1); }
.adv-group__thresh-tag--severe { background: rgba(244, 67, 54, 0.1); }

/* ── Calculateur de seuil ── */

.adv-group__dmg-calc {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.adv-group__dmg-input {
  width: 4rem;
  padding: var(--space-xs);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  text-align: center;
  font-variant-numeric: tabular-nums;
  box-sizing: border-box;
}

.adv-group__dmg-input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.2);
}

.adv-group__dmg-input::placeholder {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.adv-group__dmg-result {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  min-width: 3rem;
  transition: color 0.15s;
}

.adv-group__dmg-result--1 { color: var(--color-accent-success); }
.adv-group__dmg-result--2 { color: var(--color-accent-warning); }
.adv-group__dmg-result--3 { color: var(--color-accent-danger); }

/* ── Attaque standard ── */

.adv-group__attack {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.adv-group__atk-label { font-weight: var(--font-weight-bold); color: var(--color-accent-fear); }
.adv-group__atk-mod { font-weight: var(--font-weight-bold); color: var(--color-text-primary); }
.adv-group__atk-dmg { font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin-left: auto; }

/* ══ Instances — 2 lignes par instance pour surface tactile optimale ══ */

.adv-group__instances {
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

/* ══ Minion : grille compacte de coches ══ */

.adv-group__minion-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding: var(--space-sm);
  align-items: center;
}

.adv-group__minion-btn {
  width: 2.8rem;
  height: 2.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(76, 175, 80, 0.12);
  font-size: var(--font-size-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  user-select: none;
}

.adv-group__minion-btn:active { transform: scale(0.9); }
.adv-group__minion-btn:hover:not(.adv-group__minion-btn--dead) { background: rgba(76, 175, 80, 0.25); border-color: var(--color-accent-success); }

.adv-group__minion-btn--dead {
  background: rgba(244, 67, 54, 0.1);
  border-color: transparent;
  opacity: 0.5;
}

.adv-group__minion-btn--dead:hover { opacity: 0.7; background: rgba(244, 67, 54, 0.15); }

.adv-group__minion-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  margin-left: auto;
  white-space: nowrap;
}

.adv-group__inst {
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  overflow: hidden;
}

.adv-group__inst--defeated { opacity: 0.4; }

.adv-group__inst--targeted {
  border: 2px solid var(--color-success, #22c55e) !important;
  background: rgba(34, 197, 94, 0.1);
}

.adv-group__minion-btn--targeted {
  border-color: var(--color-success, #22c55e) !important;
  background: rgba(34, 197, 94, 0.1);
}

/* Contenu swipeable */
.adv-group__inst-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

/* Bouton vaincre révélé par swipe (positionné derrière le contenu) */
.adv-group__swipe-defeat {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5rem;
  border: none;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  background: var(--color-accent-danger);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  z-index: 0;
}

.adv-group__swipe-defeat:active { filter: brightness(1.2); }

/* Ligne 1 : numéro + HP barre étendue + bouton vaincre/réanimer */

.adv-group__inst-row1 {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.adv-group__inst-num {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  min-width: 1.2rem;
}

.adv-group__inst-status { font-size: var(--font-size-sm); }

/* HP compact : barre + valeur (prend toute la largeur disponible) */

.adv-group__inst-hp {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
}

.adv-group__hp-bar {
  flex: 1;
  height: 0.4rem;
  background: var(--color-bg-input);
  border-radius: var(--radius-full);
  overflow: hidden;
  min-width: 2rem;
}

.adv-group__hp-fill {
  height: 100%;
  background: var(--color-accent-danger);
  transition: width var(--transition-fast);
  border-radius: var(--radius-full);
}

.adv-group__hp-val {
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Ligne 2 : boutons seuils élargis + heal — occupent toute la largeur */

.adv-group__inst-row2 {
  display: flex;
  gap: 3px;
}

/* Boutons seuils — flex:1 pour occuper la largeur disponible */

.adv-group__thresh-btn {
  flex: 1;
  min-height: var(--touch-min);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: filter 0.1s;
  touch-action: manipulation;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adv-group__thresh-btn:active {
  filter: brightness(1.3);
  transform: scale(0.97);
}

.adv-group__thresh-btn--minor { background: rgba(76, 175, 80, 0.25); color: var(--color-accent-success); }
.adv-group__thresh-btn--major { background: rgba(255, 152, 0, 0.25); color: var(--color-accent-warning); }
.adv-group__thresh-btn--severe { background: rgba(244, 67, 54, 0.25); color: var(--color-accent-danger); }

/* Surbrillance du seuil suggéré par le calculateur */
.adv-group__thresh-btn--suggested {
  box-shadow: 0 0 0 2px currentColor;
  filter: brightness(1.15);
  transform: scale(1.05);
}

/* Actions compactes */

.adv-group__action-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
  touch-action: manipulation;
  flex-shrink: 0;
}

.adv-group__action-btn:hover { background: var(--color-bg-elevated); }
.adv-group__action-btn--defeat:hover { background: rgba(244, 67, 54, 0.15); border-color: var(--color-accent-danger); }
.adv-group__action-btn--revive:hover { background: rgba(76, 175, 80, 0.15); border-color: var(--color-accent-success); }
.adv-group__action-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Ligne secondaire : stress + conditions */

.adv-group__inst-secondary {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: 2px;
  padding-left: 1.4rem; /* Aligné sous le contenu principal */
}

.adv-group__stress-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.adv-group__micro-btn {
  min-width: 2rem;
  min-height: 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  touch-action: manipulation;
  position: relative;
}

/* Extension de la zone tactile sans agrandir le visuel */
.adv-group__micro-btn::before {
  content: '';
  position: absolute;
  inset: -0.4rem;
}

.adv-group__micro-btn:hover:not(:disabled) { background: var(--color-bg-elevated); }
.adv-group__micro-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.adv-group__inst-conds {
  display: flex;
  gap: 1px;
  margin-left: auto;
}

.adv-group__cond {
  min-width: 2rem;
  min-height: 2rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background var(--transition-fast);
  touch-action: manipulation;
}

.adv-group__cond:hover { background: var(--color-bg-elevated); }
.adv-group__cond--on { background: rgba(244, 67, 54, 0.2); border-color: var(--color-accent-danger); }

/* ══ Résumé vaincus collapsé ══ */

.adv-group__defeated-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.adv-group__defeated-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  cursor: pointer;
  touch-action: manipulation;
  transition: background var(--transition-fast);
}

.adv-group__defeated-toggle:hover {
  background: var(--color-bg-elevated);
}

.adv-group__defeated-label {
  font-weight: var(--font-weight-medium);
}

.adv-group__defeated-chevron {
  font-size: 0.6rem;
  color: var(--color-text-muted);
}

/* ══ iPad paysage — carte condensée ══ */
@media (orientation: landscape) and (min-width: 768px) and (max-width: 1280px) {
  .adv-group__header { padding: var(--space-xs); gap: 2px; }
  .adv-group__name { font-size: var(--font-size-xs); }
  .adv-group__diff { font-size: var(--font-size-md); min-width: 1.5rem; }
  .adv-group__thresh-tag { padding: 1px var(--space-xs); font-size: 0.65rem; }
  .adv-group__attack { padding: 2px var(--space-xs); font-size: 0.65rem; }
  .adv-group__dmg-calc { padding: 2px var(--space-xs); }
  .adv-group__dmg-input { width: 3rem; min-height: 2rem; font-size: var(--font-size-sm); }
  .adv-group__instances { padding: 2px; gap: 2px; }
  .adv-group__inst { padding: 2px; gap: 2px; }
  .adv-group__thresh-btn { min-height: 2.2rem; font-size: var(--font-size-sm); }
  .adv-group__action-btn { min-width: 2.2rem; min-height: 2.2rem; font-size: var(--font-size-xs); }
  .adv-group__hp-bar { height: 0.3rem; }
  .adv-group__minion-btn { width: 2.2rem; height: 2.2rem; font-size: var(--font-size-sm); }
  .adv-group__minion-grid { padding: var(--space-xs); gap: 2px; }
  .adv-group__inst-secondary { padding-left: 0; margin-top: 1px; }
  .adv-group__micro-btn { min-width: 1.6rem; min-height: 1.6rem; }
  .adv-group__cond { min-width: 1.6rem; min-height: 1.6rem; }
  .adv-group__collapse-btn { min-width: 2rem; min-height: 2rem; }
  .adv-group__acted-btn { min-width: 1.5rem; min-height: 2rem; font-size: var(--font-size-sm); }
}
</style>
