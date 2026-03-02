<template>
  <section
    class="quick-panel"
    aria-label="Dés rapides"
  >
    <!-- Quick dice -->
    <div class="quick-section">
      <h3 class="panel-title">
        🎯 Dés rapides
      </h3>
      <div class="quick-grid">
        <button
          v-for="die in quickDice"
          :key="die.sides"
          class="quick-btn"
          :style="{ '--die-color': die.color }"
          :aria-label="`Lancer un ${die.label}`"
          @click="$emit('rollQuick', die.sides)"
        >
          <span class="quick-btn__label">{{ die.label }}</span>
          <Transition
            name="flash"
            mode="out-in"
          >
            <span
              v-if="lastQuick && lastQuick.sides === die.sides"
              :key="lastQuick.id"
              class="quick-btn__result"
            >{{ lastQuick.total }}</span>
          </Transition>
        </button>
      </div>
    </div>

    <!-- GM d20 -->
    <div class="gm-section">
      <h3 class="panel-title">
        🎯 Dé du MJ
      </h3>
      <div class="gm-row">
        <label class="config-field">
          <span class="config-label">Mod</span>
          <input
            v-model.number="gmModifier"
            type="number"
            class="config-input"
            aria-label="Modificateur MJ"
          />
        </label>
        <label class="config-field">
          <span class="config-label">Évasion</span>
          <input
            v-model.number="gmTarget"
            type="number"
            class="config-input"
            placeholder="—"
            aria-label="Évasion cible"
          />
        </label>
        <button
          class="roll-btn roll-btn--gm"
          @click="doGMRoll"
        >
          d20
        </button>
      </div>

      <Transition
        name="result-pop"
        mode="out-in"
      >
        <div
          v-if="gmResult"
          :key="gmResult.id"
          class="gm-result"
          :class="{
            'gm-result--nat20': gmResult.natural20,
            'gm-result--success': gmResult.success === true,
            'gm-result--fail': gmResult.success === false
          }"
          role="status"
        >
          <span class="gm-result__die">{{ gmResult.value }}</span>
          <span
            v-if="gmResult.modifier !== 0"
            class="gm-result__mod"
          >{{ gmResult.modifier > 0 ? '+' : '' }}{{ gmResult.modifier }}</span>
          <span class="gm-result__eq">=</span>
          <span class="gm-result__total">{{ gmResult.total }}</span>
          <span
            v-if="gmResult.target"
            class="gm-result__vs"
          >vs {{ gmResult.target }}</span>
          <span
            v-if="gmResult.natural20"
            class="gm-result__badge gm-result__badge--crit"
          >NAT 20!</span>
          <span
            v-else-if="gmResult.success === true"
            class="gm-result__badge gm-result__badge--hit"
          >Touché</span>
          <span
            v-else-if="gmResult.success === false"
            class="gm-result__badge gm-result__badge--miss"
          >Raté</span>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
import { QUICK_DICE } from '../constants'

export default {
  name: 'QuickDice',
  emits: ['rollQuick', 'rollGM'],
  setup(props, { emit }) {
    const quickDice = QUICK_DICE
    const lastQuick = ref(null)
    const gmModifier = ref(0)
    const gmTarget = ref(null)
    const gmResult = ref(null)

    function doGMRoll() {
      emit('rollGM', {
        modifier: gmModifier.value || 0,
        target: gmTarget.value || null
      })
    }

    function setQuickResult(r) { lastQuick.value = r }
    function setGMResult(r) { gmResult.value = r }

    return {
      quickDice, lastQuick, gmModifier, gmTarget, gmResult,
      doGMRoll, setQuickResult, setGMResult
    }
  }
}
</script>

<style scoped>
.quick-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.quick-section, .gm-section {
  padding: var(--space-md);
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 8px;
}

.panel-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1rem;
  margin: 0 0 var(--space-sm);
  color: var(--text-primary);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm);
  background: var(--bg-tertiary, #2a2a4a);
  border: 2px solid var(--die-color, var(--border-color));
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms;
  min-height: 56px;
}

.quick-btn:hover { background: color-mix(in srgb, var(--die-color) 10%, transparent); transform: scale(1.03); }

.quick-btn__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--die-color);
}

.quick-btn__result {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

/* GM section */
.gm-row {
  display: flex;
  gap: var(--space-sm);
  align-items: end;
}

.config-field { display: flex; flex-direction: column; gap: 2px; }

.config-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted, #6b7280);
}

.config-input {
  width: 60px;
  padding: 5px 8px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: center;
}

.config-input:focus { outline: 2px solid var(--accent-hope, #53a8b6); outline-offset: 1px; }
.config-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.config-input[type="number"] { -moz-appearance: textfield; }

.roll-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.roll-btn--gm { background: #ef4444; color: #fff; }
.roll-btn:hover { opacity: 0.9; }

/* GM result */
.gm-result {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  padding: var(--space-sm);
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 6px;
  flex-wrap: wrap;
}

.gm-result--nat20 { border: 2px solid #eab308; }
.gm-result--success { border-left: 3px solid #22c55e; }
.gm-result--fail { border-left: 3px solid var(--accent-fear, #c84b31); }

.gm-result__die {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ef4444;
}

.gm-result__mod, .gm-result__eq, .gm-result__vs {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.gm-result__total {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
}

.gm-result__badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.gm-result__badge--crit { background: #eab308; color: #000; }
.gm-result__badge--hit { background: #22c55e; color: #000; }
.gm-result__badge--miss { background: var(--accent-fear, #c84b31); color: #fff; }

/* Transitions */
.result-pop-enter-active { animation: popIn 0.3s ease; }
.result-pop-leave-active { animation: popIn 0.15s ease reverse; }
.flash-enter-active { animation: flashPulse 0.3s ease; }
.flash-leave-active { animation: flashPulse 0.15s ease reverse; }

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes flashPulse {
  0% { opacity: 0; transform: scale(1.3); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
