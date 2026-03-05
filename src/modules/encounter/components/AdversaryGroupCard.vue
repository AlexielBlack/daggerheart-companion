<template>
  <section
    class="adv-group"
    :class="{
      'adv-group--selected': isSelected,
      'adv-group--all-defeated': group.activeCount === 0
    }"
    :aria-label="group.name + ' — ' + group.instances.length + ' instance(s)'"
  >
    <!-- ── Header : nom + stats partagées ── -->
    <div
      class="adv-group__header"
      role="button"
      tabindex="0"
      @click="$emit('select-group', group.adversaryId)"
      @keydown.enter="$emit('select-group', group.adversaryId)"
      @keydown.space.prevent="$emit('select-group', group.adversaryId)"
    >
      <div class="adv-group__identity">
        <span class="adv-group__name">{{ group.name }}</span>
        <span class="adv-group__type">{{ group.type }}</span>
        <span
          v-if="group.instances.length > 1"
          class="adv-group__qty"
        >×{{ group.instances.length }}</span>
        <span
          v-if="group.defeatedCount > 0"
          class="adv-group__dead-count"
        >{{ group.defeatedCount }}💀</span>
      </div>

      <!-- Difficulté (gros, toujours visible) -->
      <div
        class="adv-group__diff"
        title="Difficulté"
      >
        {{ firstInstance.difficulty }}
      </div>
    </div>

    <!-- ── Seuils de dégâts — lecture instantanée ── -->
    <div
      v-if="firstInstance.thresholds"
      class="adv-group__thresholds"
    >
      <div
        class="adv-group__thresh adv-group__thresh--minor"
        :title="'Dégâts < ' + firstInstance.thresholds.major + ' → Mineur : 1 HP'"
      >
        <span class="adv-group__thresh-range">&lt; {{ firstInstance.thresholds.major }}</span>
        <span class="adv-group__thresh-result">1 HP</span>
      </div>
      <div
        class="adv-group__thresh adv-group__thresh--major"
        :title="'Dégâts ' + firstInstance.thresholds.major + '-' + (firstInstance.thresholds.severe - 1) + ' → Majeur : 2 HP'"
      >
        <span class="adv-group__thresh-range">{{ firstInstance.thresholds.major }}–{{ firstInstance.thresholds.severe - 1 }}</span>
        <span class="adv-group__thresh-result">2 HP</span>
      </div>
      <div
        class="adv-group__thresh adv-group__thresh--severe"
        :title="'Dégâts ≥ ' + firstInstance.thresholds.severe + ' → Sévère : 3 HP'"
      >
        <span class="adv-group__thresh-range">≥ {{ firstInstance.thresholds.severe }}</span>
        <span class="adv-group__thresh-result">3 HP</span>
      </div>
    </div>

    <!-- ── Attaque standard (référence rapide) ── -->
    <div
      v-if="firstInstance.attack"
      class="adv-group__attack"
    >
      <span class="adv-group__atk-label">ATK</span>
      <span class="adv-group__atk-mod">{{ firstInstance.attack.modifier >= 0 ? '+' : '' }}{{ firstInstance.attack.modifier }}</span>
      <span class="adv-group__atk-name">{{ firstInstance.attack.name }}</span>
      <span class="adv-group__atk-range">{{ firstInstance.attack.range }}</span>
      <span class="adv-group__atk-dmg">{{ firstInstance.attack.damage }}</span>
    </div>

    <!-- ── Instances : lignes HP individuelles ── -->
    <div class="adv-group__instances">
      <div
        v-for="(inst, idx) in group.instances"
        :key="inst.instanceId"
        class="adv-group__inst"
        :class="{ 'adv-group__inst--defeated': inst.isDefeated }"
      >
        <!-- Numéro + conditions -->
        <div class="adv-group__inst-head">
          <span
            v-if="group.instances.length > 1"
            class="adv-group__inst-num"
          >#{{ idx + 1 }}</span>
          <span
            v-if="inst.isDefeated"
            class="adv-group__inst-status"
          >💀</span>
          <!-- Conditions compactes -->
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

        <!-- HP bar + saisie dégâts -->
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

          <!-- Saisie directe de dégâts — le raccourci principal -->
          <input
            class="adv-group__dmg-input"
            type="number"
            min="1"
            placeholder="Dégâts"
            :aria-label="'Saisir les dégâts pour ' + inst.name + (group.instances.length > 1 ? ' #' + (idx + 1) : '')"
            @click.stop
            @keydown.enter.stop="applyRawDamage(inst, $event)"
          />
        </div>

        <!-- Stress bar (compact) -->
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

        <!-- Actions rapides -->
        <div class="adv-group__inst-actions">
          <button
            v-if="!inst.isDefeated"
            class="adv-group__action-btn adv-group__action-btn--defeat"
            title="Vaincre"
            @click.stop="$emit('defeat', inst.instanceId)"
          >
            💀
          </button>
          <button
            v-if="inst.isDefeated"
            class="adv-group__action-btn adv-group__action-btn--revive"
            title="Réanimer"
            @click.stop="$emit('revive', inst.instanceId)"
          >
            ↩
          </button>
          <button
            v-if="!inst.isDefeated"
            class="adv-group__action-btn adv-group__action-btn--heal"
            :disabled="inst.markedHP <= 0"
            title="Retirer 1 HP"
            @click.stop="$emit('clear-hp', inst.instanceId)"
          >
            +❤️
          </button>
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
  computed: {
    /** Première instance pour les stats partagées */
    firstInstance() {
      return this.group.instances[0] || {}
    },
    conditions() {
      return LIVE_CONDITIONS
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
    /**
     * Calcule les HP à marquer depuis un montant de dégâts bruts
     * en comparant aux seuils de l'adversaire, puis émet l'événement.
     */
    applyRawDamage(inst, event) {
      const raw = parseInt(event.target.value)
      if (!raw || raw <= 0) return

      const thresholds = inst.thresholds
      let hpToMark = 1 // Mineur par défaut

      if (thresholds) {
        if (thresholds.severe && raw >= thresholds.severe) {
          hpToMark = 3
        } else if (thresholds.major && raw >= thresholds.major) {
          hpToMark = 2
        }
      }

      this.$emit('apply-damage', {
        instanceId: inst.instanceId,
        rawDamage: raw,
        hpToMark
      })

      event.target.value = ''
      event.target.blur()
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

.adv-group--all-defeated {
  opacity: 0.5;
}

/* ── Header ── */

.adv-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm);
  background: var(--color-bg-surface);
  cursor: pointer;
  user-select: none;
}

.adv-group__header:hover {
  background: var(--color-bg-elevated);
}

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

.adv-group__type {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.adv-group__qty {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-weight-bold);
}

.adv-group__dead-count {
  font-size: var(--font-size-xs);
}

.adv-group__diff {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-fear);
  min-width: 2.5rem;
  text-align: center;
  line-height: 1;
}

/* ── Seuils de dégâts — LA zone de lecture rapide ── */

.adv-group__thresholds {
  display: flex;
  gap: 1px;
  background: var(--color-border);
}

.adv-group__thresh {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  gap: 1px;
}

.adv-group__thresh--minor {
  background: rgba(76, 175, 80, 0.15);
}

.adv-group__thresh--major {
  background: rgba(255, 152, 0, 0.15);
}

.adv-group__thresh--severe {
  background: rgba(244, 67, 54, 0.15);
}

.adv-group__thresh-range {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.adv-group__thresh-result {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.adv-group__thresh--minor .adv-group__thresh-result {
  color: var(--color-accent-success);
}

.adv-group__thresh--major .adv-group__thresh-result {
  color: var(--color-accent-warning);
}

.adv-group__thresh--severe .adv-group__thresh-result {
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

.adv-group__atk-label {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-fear);
}

.adv-group__atk-mod {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.adv-group__atk-dmg {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-left: auto;
}

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

.adv-group__inst--defeated {
  opacity: 0.4;
}

.adv-group__inst-head {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: 2px;
}

.adv-group__inst-num {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
}

.adv-group__inst-status {
  font-size: var(--font-size-sm);
}

.adv-group__inst-conds {
  display: flex;
  gap: 1px;
  margin-left: auto;
}

.adv-group__cond {
  width: 1.3rem;
  height: 1.3rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.65rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background var(--transition-fast);
}

.adv-group__cond:hover {
  background: var(--color-bg-elevated);
}

.adv-group__cond--on {
  background: rgba(244, 67, 54, 0.2);
  border-color: var(--color-accent-danger);
}

/* ── HP row ── */

.adv-group__hp-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.adv-group__hp-label,
.adv-group__stress-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  min-width: 1.2rem;
}

.adv-group__hp-bar,
.adv-group__stress-bar {
  flex: 1;
  height: 0.5rem;
  background: var(--color-bg-input);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.adv-group__hp-fill {
  height: 100%;
  background: var(--color-accent-danger);
  transition: width var(--transition-fast);
  border-radius: var(--radius-full);
}

.adv-group__stress-fill {
  height: 100%;
  background: var(--color-accent-warning);
  transition: width var(--transition-fast);
  border-radius: var(--radius-full);
}

.adv-group__hp-val,
.adv-group__stress-val {
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  min-width: 2.5rem;
  text-align: right;
}

/* ── Saisie directe de dégâts (le raccourci clé) ── */

.adv-group__dmg-input {
  width: 4rem;
  padding: 2px var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;
  text-align: center;
  transition: border-color var(--transition-fast);
}

.adv-group__dmg-input:focus {
  outline: none;
  border-color: var(--color-accent-fear);
  box-shadow: 0 0 0 1px var(--color-accent-fear);
}

.adv-group__dmg-input::placeholder {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

/* ── Stress row ── */

.adv-group__stress-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: 2px;
}

.adv-group__stress-btn {
  width: 1.3rem;
  height: 1.3rem;
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
}

.adv-group__stress-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.adv-group__stress-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ── Instance actions ── */

.adv-group__inst-actions {
  display: flex;
  gap: 2px;
  margin-top: var(--space-xs);
}

.adv-group__action-btn {
  padding: 1px var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.adv-group__action-btn:hover {
  background: var(--color-bg-elevated);
}

.adv-group__action-btn--defeat:hover {
  background: rgba(244, 67, 54, 0.15);
  border-color: var(--color-accent-danger);
}

.adv-group__action-btn--revive:hover {
  background: rgba(76, 175, 80, 0.15);
  border-color: var(--color-accent-success);
}

.adv-group__action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
