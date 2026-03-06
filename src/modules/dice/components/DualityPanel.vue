<template>
  <section
    class="duality-panel"
    aria-label="Duality Dice"
  >
    <h3 class="panel-title">
      🎲 Duality Dice
    </h3>

    <!-- Config row -->
    <div class="config-row">
      <label class="config-field">
        <span class="config-label">Trait</span>
        <input
          v-model.number="modifier"
          type="number"
          class="config-input"
          aria-label="Modificateur trait"
        />
      </label>
      <label class="config-field">
        <span class="config-label">Difficulté</span>
        <input
          v-model.number="difficulty"
          type="number"
          class="config-input"
          placeholder="—"
          aria-label="Difficulté"
        />
      </label>
      <div class="config-field">
        <span class="config-label">Dés bonus</span>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            :class="{ 'toggle-btn--active': hasAdvantage }"
            :aria-pressed="hasAdvantage ? 'true' : 'false'"
            @click="toggleAdvantage"
          >
            ⬆️ Adv
          </button>
          <button
            class="toggle-btn toggle-btn--fear"
            :class="{ 'toggle-btn--active': hasDisadvantage }"
            :aria-pressed="hasDisadvantage ? 'true' : 'false'"
            @click="toggleDisadvantage"
          >
            ⬇️ Dis
          </button>
        </div>
      </div>
    </div>

    <!-- Roll button -->
    <button
      class="roll-btn roll-btn--duality"
      :class="{ 'roll-btn--rolling': rolling }"
      :disabled="rolling"
      aria-label="Lancer les Duality Dice"
      @click="doRoll"
    >
      <span
        v-if="!rolling"
        class="roll-btn__text"
      >
        Lancer
      </span>
      <span
        v-else
        class="roll-btn__spinner"
      >🎲🎲</span>
    </button>

    <!-- Résultat -->
    <Transition
      name="result-pop"
      mode="out-in"
    >
      <div
        v-if="result"
        :key="result.id"
        class="duality-result"
        :style="{ '--outcome-color': result.outcomeData.color }"
        role="status"
        :aria-label="`Résultat: ${result.outcomeData.label}, total ${result.total}`"
      >
        <!-- Dés -->
        <div class="dice-pair">
          <div class="die die--hope">
            <span class="die__label">Hope</span>
            <span class="die__value">{{ result.hopeValue }}</span>
          </div>
          <div class="die die--fear">
            <span class="die__label">Fear</span>
            <span class="die__value">{{ result.fearValue }}</span>
          </div>
          <div
            v-if="result.advantageDie !== null"
            class="die die--adv"
            :class="result.advantageModifier > 0 ? 'die--adv-plus' : 'die--adv-minus'"
          >
            <span class="die__label">{{ result.advantageModifier > 0 ? 'Adv' : 'Dis' }}</span>
            <span class="die__value">{{ result.advantageDie }}</span>
          </div>
        </div>

        <!-- Calcul -->
        <div class="result-math">
          {{ result.hopeValue }} + {{ result.fearValue }}
          <span v-if="result.modifier !== 0">
            {{ result.modifier > 0 ? '+' : '' }}{{ result.modifier }}
          </span>
          <span v-if="result.advantageModifier !== 0">
            {{ result.advantageModifier > 0 ? '+' : '' }}{{ result.advantageModifier }}
          </span>
          = <strong>{{ result.total }}</strong>
          <span
            v-if="result.difficulty"
            class="result-vs"
          >
            vs {{ result.difficulty }}
          </span>
        </div>

        <!-- Outcome badge -->
        <div
          class="outcome-badge"
          :style="{ background: result.outcomeData.color }"
        >
          <span class="outcome-badge__icon">{{ result.outcomeData.icon }}</span>
          <span class="outcome-badge__label">{{ result.outcomeData.label }}</span>
        </div>
        <p class="outcome-desc">
          {{ result.outcomeData.description }}
        </p>
      </div>
    </Transition>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DualityPanel',
  emits: ['roll'],
  setup(props, { emit }) {
    const modifier = ref(0)
    const difficulty = ref(null)
    const hasAdvantage = ref(false)
    const hasDisadvantage = ref(false)
    const rolling = ref(false)
    const result = ref(null)

    function toggleAdvantage() {
      hasAdvantage.value = !hasAdvantage.value
      if (hasAdvantage.value) hasDisadvantage.value = false
    }

    function toggleDisadvantage() {
      hasDisadvantage.value = !hasDisadvantage.value
      if (hasDisadvantage.value) hasAdvantage.value = false
    }

    function doRoll() {
      rolling.value = true
      setTimeout(() => {
        const r = emit('roll', {
          modifier: modifier.value || 0,
          difficulty: difficulty.value || null,
          advantage: hasAdvantage.value,
          disadvantage: hasDisadvantage.value
        })
        rolling.value = false
        return r
      }, 300)
    }

    function setResult(r) {
      result.value = r
    }

    return {
      modifier, difficulty, hasAdvantage, hasDisadvantage,
      rolling, result,
      toggleAdvantage, toggleDisadvantage, doRoll, setResult
    }
  }
}
</script>

<style scoped>
.duality-panel {
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

.config-row {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-bottom: var(--space-md);
}

.config-field { display: flex; flex-direction: column; gap: 2px; }

.config-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted, #6b7280);
}

.config-input {
  width: 64px;
  padding: 5px 8px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  text-align: center;
}

.config-input:focus { outline: 2px solid var(--color-accent-hope, #53a8b6); outline-offset: 1px; }
.config-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.config-input[type="number"] { -moz-appearance: textfield; }

.toggle-group { display: flex; gap: 4px; }

.toggle-btn {
  padding: 4px 8px;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 150ms;
}

.toggle-btn--active {
  border-color: var(--color-accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope, #53a8b6);
}

.toggle-btn--fear.toggle-btn--active {
  border-color: var(--color-accent-fear, #c84b31);
  background: rgba(200, 75, 49, 0.15);
  color: var(--color-accent-fear, #c84b31);
}

/* ── Roll button ── */
.roll-btn {
  display: block;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 200ms;
}

.roll-btn--duality {
  background: linear-gradient(135deg, var(--color-accent-hope, #53a8b6), var(--color-accent-fear, #c84b31));
  color: #fff;
}

.roll-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.01); }
.roll-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.roll-btn--rolling {
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px) rotate(-2deg); }
  75% { transform: translateX(4px) rotate(2deg); }
}

.roll-btn__spinner { display: inline-block; animation: bounce 0.3s ease; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* ── Result ── */
.duality-result {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 2px solid var(--outcome-color, var(--color-border));
  border-radius: 8px;
  text-align: center;
}

.dice-pair {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.die {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  border-radius: 8px;
  min-width: 56px;
}

.die--hope { background: rgba(83, 168, 182, 0.15); }
.die--fear { background: rgba(200, 75, 49, 0.15); }
.die--adv-plus { background: rgba(34, 197, 94, 0.15); }
.die--adv-minus { background: rgba(239, 68, 68, 0.15); }

.die__label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted, #6b7280);
}

.die__value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.die--hope .die__value { color: var(--color-accent-hope, #53a8b6); }
.die--fear .die__value { color: var(--color-accent-fear, #c84b31); }

.result-math {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.result-vs {
  color: var(--color-text-muted, #6b7280);
  font-style: italic;
}

.outcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 20px;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.outcome-badge__icon { font-size: 1rem; }

.outcome-desc {
  margin: var(--space-xs) 0 0;
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
}

/* ── Transitions ── */
.result-pop-enter-active { animation: popIn 0.3s ease; }
.result-pop-leave-active { animation: popIn 0.15s ease reverse; }

@keyframes popIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
