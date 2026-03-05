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
    <!-- ── Header : toujours visible, sert de toggle ── -->
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

      <!-- Résumé HP (visible surtout quand collapsed) -->
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

      <!-- Chevron collapse -->
      <span
        class="adv-group__chevron"
        aria-hidden="true"
      >{{ collapsed ? '▶' : '▼' }}</span>
    </div>

    <!-- ── Contenu dépliable ── -->
    <div
      v-show="!collapsed"
      class="adv-group__body"
    >
      <!-- Seuils de dégâts comme BOUTONS (le geste principal) -->
      <div
        v-if="firstInstance.thresholds"
        class="adv-group__thresholds"
      >
        <button
          v-for="inst in activeInstances"
          :key="inst.instanceId"
          class="adv-group__thresh-row-label"
          disabled
          :aria-hidden="true"
        >
          {{ group.instances.length > 1 ? '#' + (instanceIndex(inst) + 1) : '' }}
          {{ inst.markedHP }}/{{ inst.maxHP }}
        </button>
      </div>
      <div
        v-if="firstInstance.thresholds"
        class="adv-group__thresh-grid"
      >
        <!-- Header row -->
        <div class="adv-group__thresh-header">
          <span class="adv-group__thresh-h adv-group__thresh-h--minor">
            &lt; {{ firstInstance.thresholds.major }}
          </span>
          <span class="adv-group__thresh-h adv-group__thresh-h--major">
            {{ firstInstance.thresholds.major }}–{{ firstInstance.thresholds.severe - 1 }}
          </span>
          <span class="adv-group__thresh-h adv-group__thresh-h--severe">
            ≥ {{ firstInstance.thresholds.severe }}
          </span>
        </div>
        <!-- Boutons par instance -->
        <div
          v-for="inst in activeInstances"
          :key="inst.instanceId"
          class="adv-group__thresh-btns"
        >
          <button
            class="adv-group__thresh-btn adv-group__thresh-btn--minor"
            :title="'Mineur — marquer 1 HP'"
            :aria-label="'Dégâts mineurs sur ' + inst.name + ' — 1 HP'"
            @click.stop="$emit('apply-damage', { instanceId: inst.instanceId, hpToMark: 1 })"
          >
            1 HP
          </button>
          <button
            class="adv-group__thresh-btn adv-group__thresh-btn--major"
            :title="'Majeur — marquer 2 HP'"
            :aria-label="'Dégâts majeurs sur ' + inst.name + ' — 2 HP'"
            @click.stop="$emit('apply-damage', { instanceId: inst.instanceId, hpToMark: 2 })"
          >
            2 HP
          </button>
          <button
            class="adv-group__thresh-btn adv-group__thresh-btn--severe"
            :title="'Sévère — marquer 3 HP'"
            :aria-label="'Dégâts sévères sur ' + inst.name + ' — 3 HP'"
            @click.stop="$emit('apply-damage', { instanceId: inst.instanceId, hpToMark: 3 })"
          >
            3 HP
          </button>
        </div>
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

      <!-- Instances détaillées -->
      <div class="adv-group__instances">
        <div
          v-for="(inst, idx) in group.instances"
          :key="inst.instanceId"
          class="adv-group__inst"
          :class="{ 'adv-group__inst--defeated': inst.isDefeated }"
        >
          <div class="adv-group__inst-head">
            <span
              v-if="group.instances.length > 1"
              class="adv-group__inst-num"
            >#{{ idx + 1 }}</span>
            <span
              v-if="inst.isDefeated"
              class="adv-group__inst-status"
            >💀</span>
            <!-- Conditions -->
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
            <!-- Actions rapides inline -->
            <button
              v-if="!inst.isDefeated"
              class="adv-group__action-btn adv-group__action-btn--heal"
              :disabled="inst.markedHP <= 0"
              title="Retirer 1 HP"
              aria-label="Retirer 1 HP"
              @click.stop="$emit('clear-hp', inst.instanceId)"
            >
              −❤️
            </button>
            <button
              v-if="!inst.isDefeated"
              class="adv-group__action-btn adv-group__action-btn--defeat"
              title="Vaincre"
              aria-label="Vaincre"
              @click.stop="$emit('defeat', inst.instanceId)"
            >
              💀
            </button>
            <button
              v-if="inst.isDefeated"
              class="adv-group__action-btn adv-group__action-btn--revive"
              title="Réanimer"
              aria-label="Réanimer"
              @click.stop="$emit('revive', inst.instanceId)"
            >
              ↩
            </button>
          </div>

          <!-- HP bar -->
          <div
            v-if="!inst.isDefeated"
            class="adv-group__hp-row"
          >
            <span class="adv-group__hp-label">HP</span>
            <div class="adv-group__hp-bar">
              <div
                class="adv-group__hp-fill"
                :style="{ width: hpPercent(inst) + '%' }"
              ></div>
            </div>
            <span class="adv-group__hp-val">{{ inst.markedHP }}/{{ inst.maxHP }}</span>
          </div>

          <!-- Stress bar -->
          <div
            v-if="!inst.isDefeated && inst.maxStress > 0"
            class="adv-group__stress-row"
          >
            <span class="adv-group__stress-label">ST</span>
            <div class="adv-group__stress-bar">
              <div
                class="adv-group__stress-fill"
                :style="{ width: stressPercent(inst) + '%' }"
              ></div>
            </div>
            <span class="adv-group__stress-val">{{ inst.markedStress }}/{{ inst.maxStress }}</span>
            <button
              class="adv-group__stress-btn"
              :disabled="inst.markedStress >= inst.maxStress"
              title="Marquer 1 Stress"
              aria-label="Marquer 1 Stress"
              @click.stop="$emit('mark-stress', inst.instanceId)"
            >
              +
            </button>
            <button
              class="adv-group__stress-btn"
              :disabled="inst.markedStress <= 0"
              title="Retirer 1 Stress"
              aria-label="Retirer 1 Stress"
              @click.stop="$emit('clear-stress', inst.instanceId)"
            >
              −
            </button>
          </div>
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
      /** État replié explicite (null = auto selon isSelected) */
      manualCollapsed: null
    }
  },
  computed: {
    firstInstance() {
      return this.group.instances[0] || {}
    },
    conditions() {
      return LIVE_CONDITIONS
    },
    /** Replié automatiquement sauf si sélectionné ou forcé manuellement */
    collapsed() {
      if (this.manualCollapsed !== null) return this.manualCollapsed
      return !this.isSelected
    },
    /** Instances non vaincues (pour les boutons de seuils) */
    activeInstances() {
      return this.group.instances.filter((i) => !i.isDefeated)
    },
    totalMarkedHP() {
      return this.group.instances.reduce((s, i) => s + i.markedHP, 0)
    },
    totalMaxHP() {
      return this.group.instances.reduce((s, i) => s + i.maxHP, 0)
    }
  },
  watch: {
    /** Quand la sélection change, reset le toggle manuel */
    isSelected() {
      this.manualCollapsed = null
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
    instanceIndex(inst) {
      return this.group.instances.indexOf(inst)
    },
    onHeaderClick() {
      this.$emit('select-group', this.group.adversaryId)
      // Toggle collapse si déjà sélectionné
      if (this.isSelected) {
        this.manualCollapsed = this.manualCollapsed === null ? true : !this.manualCollapsed
      }
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

/* ── Header (toujours visible) ── */

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

.adv-group__chevron {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  width: 1rem;
  text-align: center;
}

/* ── Body (collapsible) ── */

.adv-group__body {
  display: flex;
  flex-direction: column;
}

/* ══ Seuils — grille de boutons ══ */

.adv-group__thresh-row-label {
  display: none; /* Caché, géré via la grille */
}

.adv-group__thresh-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
}

.adv-group__thresh-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
}

.adv-group__thresh-h {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  padding: 2px var(--space-xs);
  font-variant-numeric: tabular-nums;
}

.adv-group__thresh-h--minor { background: rgba(76, 175, 80, 0.1); }
.adv-group__thresh-h--major { background: rgba(255, 152, 0, 0.1); }
.adv-group__thresh-h--severe { background: rgba(244, 67, 54, 0.1); }

.adv-group__thresh-btns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
}

.adv-group__thresh-btn {
  padding: var(--space-sm) var(--space-xs);
  border: none;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: filter 0.1s;
  touch-action: manipulation;
}

.adv-group__thresh-btn:active {
  filter: brightness(1.3);
  transform: scale(0.96);
}

.adv-group__thresh-btn--minor {
  background: rgba(76, 175, 80, 0.2);
  color: var(--color-accent-success);
}

.adv-group__thresh-btn--major {
  background: rgba(255, 152, 0, 0.2);
  color: var(--color-accent-warning);
}

.adv-group__thresh-btn--severe {
  background: rgba(244, 67, 54, 0.2);
  color: var(--color-accent-danger);
}

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

/* ── Instances ── */

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
}

.adv-group__inst--defeated { opacity: 0.4; }

.adv-group__inst-head {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: 2px;
}

.adv-group__inst-num { font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); color: var(--color-text-muted); }
.adv-group__inst-status { font-size: var(--font-size-sm); }

.adv-group__inst-conds { display: flex; gap: 1px; flex: 1; }

.adv-group__cond {
  width: 1.3rem; height: 1.3rem;
  border: 1px solid transparent; border-radius: var(--radius-sm);
  background: transparent; font-size: 0.65rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;
  transition: background var(--transition-fast);
}

.adv-group__cond:hover { background: var(--color-bg-elevated); }
.adv-group__cond--on { background: rgba(244, 67, 54, 0.2); border-color: var(--color-accent-danger); }

/* Action buttons inline dans le header d'instance */

.adv-group__action-btn {
  padding: 1px var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.adv-group__action-btn:hover { background: var(--color-bg-elevated); }
.adv-group__action-btn--defeat:hover { background: rgba(244, 67, 54, 0.15); border-color: var(--color-accent-danger); }
.adv-group__action-btn--revive:hover { background: rgba(76, 175, 80, 0.15); border-color: var(--color-accent-success); }
.adv-group__action-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── HP / Stress rows ── */

.adv-group__hp-row, .adv-group__stress-row {
  display: flex; align-items: center; gap: var(--space-xs);
}

.adv-group__stress-row { margin-top: 2px; }

.adv-group__hp-label, .adv-group__stress-label {
  font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); color: var(--color-text-muted); min-width: 1.2rem;
}

.adv-group__hp-bar, .adv-group__stress-bar {
  flex: 1; height: 0.5rem; background: var(--color-bg-input); border-radius: var(--radius-full); overflow: hidden;
}

.adv-group__hp-fill { height: 100%; background: var(--color-accent-danger); transition: width var(--transition-fast); border-radius: var(--radius-full); }
.adv-group__stress-fill { height: 100%; background: var(--color-accent-warning); transition: width var(--transition-fast); border-radius: var(--radius-full); }

.adv-group__hp-val, .adv-group__stress-val {
  font-size: var(--font-size-xs); font-variant-numeric: tabular-nums; color: var(--color-text-secondary); min-width: 2.5rem; text-align: right;
}

.adv-group__stress-btn {
  width: 1.3rem; height: 1.3rem;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: transparent; color: var(--color-text-secondary);
  font-size: var(--font-size-xs); cursor: pointer;
  display: flex; align-items: center; justify-content: center; padding: 0;
}

.adv-group__stress-btn:hover:not(:disabled) { background: var(--color-bg-elevated); border-color: var(--color-border-active); }
.adv-group__stress-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
