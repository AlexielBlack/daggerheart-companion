<template>
  <section
    class="damage-panel"
    aria-label="Dégâts"
  >
    <h3 class="panel-title">
      💥 Dégâts
    </h3>
    <div class="damage-row">
      <input
        v-model="expression"
        type="text"
        class="damage-input"
        placeholder="2d8+4"
        aria-label="Expression de dégâts"
        @keydown.enter="doRoll"
      />
      <label class="crit-toggle">
        <input
          v-model="isCritical"
          type="checkbox"
          aria-label="Dégâts critiques"
        />
        <span class="crit-label">Crit</span>
      </label>
      <button
        class="roll-btn roll-btn--damage"
        :disabled="!expression.trim()"
        @click="doRoll"
      >
        Lancer
      </button>
    </div>

    <!-- Presets rapides -->
    <div class="presets">
      <button
        v-for="preset in presets"
        :key="preset"
        class="preset-btn"
        @click="expression = preset; doRoll()"
      >
        {{ preset }}
      </button>
    </div>

    <Transition
      name="result-pop"
      mode="out-in"
    >
      <div
        v-if="result"
        :key="result.id"
        class="damage-result"
        :class="{ 'damage-result--crit': result.critical }"
        role="status"
      >
        <div class="damage-rolls">
          <span
            v-for="(r, i) in result.rolls"
            :key="i"
            class="damage-die"
          >{{ r }}</span>
          <span
            v-if="result.modifier !== 0"
            class="damage-mod"
          >{{ result.modifier > 0 ? '+' : '' }}{{ result.modifier }}</span>
          <span
            v-if="result.critical && result.criticalData"
            class="damage-crit-bonus"
          >+{{ result.criticalData.maxBonus }} crit</span>
        </div>
        <div
          class="damage-total"
          :class="{ 'damage-total--crit': result.critical }"
        >
          {{ result.total }}
        </div>
        <div class="damage-expr">
          {{ result.expression }}{{ result.critical ? ' (critique)' : '' }}
        </div>
      </div>
    </Transition>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DamagePanel',
  emits: ['roll'],
  setup(props, { emit }) {
    const expression = ref('2d8+4')
    const isCritical = ref(false)
    const result = ref(null)
    const presets = ['1d4', '1d6', '1d8', '2d6', '2d8', '3d6', '1d10+2', '2d8+4', '3d8+6']

    function doRoll() {
      if (!expression.value.trim()) return
      emit('roll', {
        expression: expression.value.trim(),
        critical: isCritical.value
      })
    }

    function setResult(r) { result.value = r }

    return { expression, isCritical, result, presets, doRoll, setResult }
  }
}
</script>

<style scoped>
.damage-panel {
  padding: var(--space-md);
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 8px;
}

.panel-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1rem;
  margin: 0 0 var(--space-sm);
  color: var(--color-text-primary);
}

.damage-row {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
  margin-bottom: var(--space-sm);
}

.damage-input {
  flex: 1;
  padding: 6px 10px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-family: monospace;
}

.damage-input:focus { outline: 2px solid var(--color-accent-hope, #53a8b6); outline-offset: 1px; }

.crit-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.crit-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #eab308;
}

.roll-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.roll-btn--damage {
  background: var(--color-accent-fear, #c84b31);
  color: #fff;
}

.roll-btn:hover:not(:disabled) { opacity: 0.9; }
.roll-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: var(--space-sm);
}

.preset-btn {
  padding: 3px 8px;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.7rem;
  font-family: monospace;
  cursor: pointer;
}

.preset-btn:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-secondary);
}

/* Result */
.damage-result {
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 6px;
  text-align: center;
}

.damage-result--crit { border: 2px solid #eab308; }

.damage-rolls {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: var(--space-xs);
}

.damage-die {
  padding: 3px 8px;
  background: var(--color-bg-secondary, #1f1f3a);
  border-radius: 4px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.damage-mod { color: var(--color-text-secondary); font-weight: 600; }
.damage-crit-bonus { color: #eab308; font-weight: 700; }

.damage-total {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-accent-fear, #c84b31);
}

.damage-total--crit { color: #eab308; }

.damage-expr {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
}

.result-pop-enter-active { animation: popIn 0.3s ease; }
.result-pop-leave-active { animation: popIn 0.15s ease reverse; }

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
