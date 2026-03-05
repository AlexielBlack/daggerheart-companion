<template>
  <section
    class="adv-group"
    :class="{
      'adv-group--selected': isSelected,
      'adv-group--all-defeated': group.activeCount === 0,
      'adv-group--collapsed': collapsed
    }"
    :aria-label="group.name + ' — ' + group.instances.length + ' instance(s)'"
  >
    <!-- ── Header : toujours visible ── -->
    <div
      class="adv-group__header"
      role="button"
      tabindex="0"
      :aria-expanded="!collapsed"
      @click="$emit('select-group', group.adversaryId)"
      @keydown.enter="$emit('select-group', group.adversaryId)"
      @keydown.space.prevent="$emit('select-group', group.adversaryId)"
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

    <!-- ── Contenu dépliable ── -->
    <div
      v-show="!collapsed"
      class="adv-group__body"
    >
      <!-- Seuils (une seule ligne de référence, pas des boutons) -->
      <div
        v-if="firstInstance.thresholds"
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

      <!-- Attaque standard -->
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

      <!-- ══ Instances actives : 2 lignes par instance ══ -->
      <div class="adv-group__instances">
        <div
          v-for="inst in activeInstances"
          :key="inst.instanceId"
          class="adv-group__inst"
          :class="{ 'adv-group__inst--swiped': swipedId === inst.instanceId }"
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

            <!-- Ligne 2 : boutons seuils élargis + heal -->
            <div
              v-if="firstInstance.thresholds"
              class="adv-group__inst-row2"
            >
              <button
                class="adv-group__thresh-btn adv-group__thresh-btn--minor"
                :title="'Mineur — marquer 1 HP'"
                :aria-label="'1 HP sur ' + inst.name + (group.instances.length > 1 ? ' #' + (inst.originalIdx + 1) : '')"
                @click.stop="$emit('apply-damage', { instanceId: inst.instanceId, hpToMark: 1 })"
              >
                1
              </button>
              <button
                class="adv-group__thresh-btn adv-group__thresh-btn--major"
                :title="'Majeur — marquer 2 HP'"
                :aria-label="'2 HP sur ' + inst.name + (group.instances.length > 1 ? ' #' + (inst.originalIdx + 1) : '')"
                @click.stop="$emit('apply-damage', { instanceId: inst.instanceId, hpToMark: 2 })"
              >
                2
              </button>
              <button
                class="adv-group__thresh-btn adv-group__thresh-btn--severe"
                :title="'Sévère — marquer 3 HP'"
                :aria-label="'3 HP sur ' + inst.name + (group.instances.length > 1 ? ' #' + (inst.originalIdx + 1) : '')"
                @click.stop="$emit('apply-damage', { instanceId: inst.instanceId, hpToMark: 3 })"
              >
                3
              </button>
              <button
                class="adv-group__action-btn adv-group__action-btn--heal"
                :disabled="inst.markedHP <= 0"
                title="Retirer 1 HP"
                aria-label="Retirer 1 HP"
                @click.stop="$emit('clear-hp', inst.instanceId)"
              >
                −
              </button>
            </div>

            <!-- Ligne secondaire : stress + conditions -->
            <div
              v-if="inst.maxStress > 0 || inst.conditions.length > 0"
              class="adv-group__inst-secondary"
            >
              <template v-if="inst.maxStress > 0">
                <span class="adv-group__stress-label">ST {{ inst.markedStress }}/{{ inst.maxStress }}</span>
                <button
                  class="adv-group__micro-btn"
                  :disabled="inst.markedStress >= inst.maxStress"
                  title="Marquer 1 Stress"
                  aria-label="Marquer 1 Stress"
                  @click.stop="$emit('mark-stress', inst.instanceId)"
                >
                  +
                </button>
                <button
                  class="adv-group__micro-btn"
                  :disabled="inst.markedStress <= 0"
                  title="Retirer 1 Stress"
                  aria-label="Retirer 1 Stress"
                  @click.stop="$emit('clear-stress', inst.instanceId)"
                >
                  −
                </button>
              </template>
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
            <div
              v-for="inst in defeatedInstances"
              :key="inst.instanceId"
              class="adv-group__inst adv-group__inst--defeated"
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
import { LIVE_CONDITIONS } from '@data/encounters/liveConstants'

export default {
  name: 'AdversaryGroupCard',
  props: {
    group: { type: Object, required: true },
    isSelected: { type: Boolean, default: false }
  },
  emits: [
    'select-group',
    'apply-damage', 'mark-stress', 'clear-stress',
    'clear-hp', 'defeat', 'revive',
    'toggle-condition'
  ],
  data() {
    return {
      manualCollapsed: null,
      showDefeated: false,
      swipedId: null,
      touchStartX: 0,
      touchStartY: 0,
      touchInstId: null
    }
  },
  computed: {
    firstInstance() {
      return this.group.instances[0] || {}
    },
    conditions() {
      return LIVE_CONDITIONS
    },
    collapsed() {
      if (this.manualCollapsed !== null) return this.manualCollapsed
      return !this.isSelected
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
    }
  },
  watch: {
    /** Quand sélectionné, auto-déplier (reset le manuel) */
    isSelected(val) {
      if (val) this.manualCollapsed = null
    }
  },
  methods: {
    hpPercent(inst) {
      if (!inst.maxHP) return 0
      return Math.round((inst.markedHP / inst.maxHP) * 100)
    },
    stressPercent(inst) {
      if (!inst.maxStress) return 0
      return Math.round((inst.markedStress / inst.maxStress) * 100)
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
</style>
