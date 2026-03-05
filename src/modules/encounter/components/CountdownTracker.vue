<template>
  <div class="cd-bar">
    <!-- Countdowns actifs -->
    <div
      v-for="cd in countdowns"
      :key="cd.id"
      class="cd-bar__item"
      :class="{
        'cd-bar__item--triggered': cd.triggered,
        'cd-bar__item--progress': cd.type === 'progress',
        'cd-bar__item--consequence': cd.type === 'consequence'
      }"
    >
      <!-- Identité + valeur -->
      <div class="cd-bar__header">
        <span class="cd-bar__type-icon">{{ typeEmoji(cd.type) }}</span>
        <span class="cd-bar__name">
          {{ cd.name }}
        </span>
        <span
          v-if="cd.loop"
          class="cd-bar__loop"
          title="Boucle"
        >↻</span>
        <span
          class="cd-bar__value"
          :class="{ 'cd-bar__value--zero': cd.current <= 0 }"
        >{{ cd.current }}</span>
        <span class="cd-bar__start">/{{ cd.startValue }}</span>
      </div>

      <!-- Contrôles : standard = boutons ±1 -->
      <div
        v-if="cd.type === 'standard' && !cd.triggered"
        class="cd-bar__controls"
      >
        <button
          class="cd-bar__btn cd-bar__btn--tick"
          title="Avancer de 1"
          aria-label="Décrémenter le countdown"
          @click="$emit('tick', cd.id)"
        >
          −1
        </button>
        <button
          class="cd-bar__btn"
          title="Reculer de 1"
          aria-label="Incrémenter le countdown"
          @click="$emit('untick', cd.id)"
        >
          +1
        </button>
      </div>

      <!-- Contrôles : dynamique = boutons par résultat de jet -->
      <div
        v-if="(cd.type === 'progress' || cd.type === 'consequence') && !cd.triggered"
        class="cd-bar__controls cd-bar__controls--dynamic"
      >
        <button
          v-for="rr in rollResults"
          :key="rr.id"
          class="cd-bar__roll-btn"
          :class="'cd-bar__roll-btn--' + rr.id"
          :title="rr.label + ' → ' + advancementLabel(cd.type, rr.id)"
          :aria-label="rr.label"
          :disabled="advancementAmount(cd.type, rr.id) === 0"
          @click="$emit('advance-by-result', { countdownId: cd.id, rollResult: rr.id })"
        >
          {{ rr.short }}
          <span
            v-if="advancementAmount(cd.type, rr.id) > 0"
            class="cd-bar__roll-adv"
          >−{{ advancementAmount(cd.type, rr.id) }}</span>
        </button>
      </div>

      <!-- Actions : reset / supprimer -->
      <div class="cd-bar__actions">
        <button
          v-if="cd.triggered || cd.current < cd.startValue"
          class="cd-bar__btn cd-bar__btn--reset"
          title="Réinitialiser"
          aria-label="Réinitialiser le countdown"
          @click="$emit('reset', cd.id)"
        >
          ↩
        </button>
        <button
          class="cd-bar__btn cd-bar__btn--remove"
          title="Supprimer"
          aria-label="Supprimer le countdown"
          @click="$emit('remove', cd.id)"
        >
          ✕
        </button>
      </div>

      <!-- Indicateur déclenché -->
      <div
        v-if="cd.triggered"
        class="cd-bar__triggered"
      >
        ⚡ Déclenché
      </div>
    </div>

    <!-- Bouton ajout -->
    <button
      class="cd-bar__add-btn"
      title="Ajouter un countdown"
      aria-label="Ajouter un countdown"
      @click="showAddForm = true"
    >
      + Countdown
    </button>

    <!-- Drawer d'ajout -->
    <BottomDrawer
      :model-value="showAddForm"
      title="⏱️ Nouveau countdown"
      @update:model-value="showAddForm = $event"
    >
      <div class="cd-bar__drawer-form">
        <div class="cd-bar__field">
          <span class="cd-bar__field-label">Nom</span>
          <input
            ref="nameInput"
            v-model="newName"
            class="cd-bar__field-input"
            type="text"
            placeholder="Nom du countdown…"
            aria-label="Nom du countdown"
          />
        </div>

        <div class="cd-bar__field">
          <span class="cd-bar__field-label">Type</span>
          <div class="cd-bar__type-pills">
            <button
              v-for="t in countdownTypes"
              :key="t.id"
              class="cd-bar__type-pill"
              :class="{ 'cd-bar__type-pill--on': newType === t.id }"
              :aria-pressed="newType === t.id"
              :aria-label="t.label"
              :title="t.description"
              @click="newType = t.id"
            >
              {{ t.emoji }} {{ t.label }}
            </button>
          </div>
        </div>

        <div class="cd-bar__field-row">
          <div class="cd-bar__field">
            <span class="cd-bar__field-label">Valeur de départ</span>
            <input
              v-model.number="newValue"
              class="cd-bar__field-input cd-bar__field-input--num"
              type="number"
              min="1"
              max="99"
              aria-label="Valeur de départ"
            />
          </div>
          <div class="cd-bar__field">
            <span class="cd-bar__field-label">Boucle</span>
            <button
              class="cd-bar__loop-pill"
              :class="{ 'cd-bar__loop-pill--on': newLoop }"
              :aria-pressed="newLoop"
              aria-label="Activer la boucle"
              @click="newLoop = !newLoop"
            >
              ↻ {{ newLoop ? 'Oui' : 'Non' }}
            </button>
          </div>
        </div>

        <button
          class="cd-bar__confirm-btn"
          :disabled="!newValue || newValue < 1"
          @click="confirmAdd"
        >
          Ajouter le countdown
        </button>
      </div>
    </BottomDrawer>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { COUNTDOWN_TYPES, DYNAMIC_ADVANCEMENT, ROLL_RESULTS } from '@data/encounters/liveConstants'
import BottomDrawer from './BottomDrawer.vue'

export default {
  name: 'CountdownTracker',
  components: { BottomDrawer },
  props: {
    countdowns: { type: Array, default: () => [] }
  },
  emits: ['add', 'remove', 'tick', 'untick', 'advance-by-result', 'reset'],
  setup(props, { emit }) {
    const showAddForm = ref(false)
    const nameInput = ref(null)
    const newName = ref('')
    const newType = ref('standard')
    const newValue = ref(4)
    const newLoop = ref(false)
    const countdownTypes = COUNTDOWN_TYPES
    const rollResults = ROLL_RESULTS

    // Focus auto sur l'input nom à l'ouverture du drawer
    watch(showAddForm, async (val) => {
      if (val) {
        await nextTick()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            nameInput.value?.focus()
          })
        })
      }
    })

    function confirmAdd() {
      if (!newValue.value || newValue.value < 1) return
      emit('add', {
        name: newName.value || 'Countdown',
        type: newType.value,
        startValue: newValue.value,
        loop: newLoop.value
      })
      cancelAdd()
    }

    function cancelAdd() {
      showAddForm.value = false
      newName.value = ''
      newType.value = 'standard'
      newValue.value = 4
      newLoop.value = false
    }

    function typeEmoji(type) {
      const t = COUNTDOWN_TYPES.find((ct) => ct.id === type)
      return t ? t.emoji : '⏱️'
    }

    function advancementAmount(type, rollResultId) {
      const adv = DYNAMIC_ADVANCEMENT[rollResultId]
      if (!adv) return 0
      return type === 'progress' ? adv.progress : adv.consequence
    }

    function advancementLabel(type, rollResultId) {
      const amount = advancementAmount(type, rollResultId)
      return amount > 0 ? '−' + amount : 'rien'
    }

    return {
      showAddForm, newName, newType, newValue, newLoop,
      nameInput,
      countdownTypes, rollResults,
      confirmAdd, cancelAdd, typeEmoji,
      advancementAmount, advancementLabel
    }
  }
}
</script>

<style scoped>
.cd-bar {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  overflow-x: auto;
  flex-shrink: 0;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* ── Item ── */

.cd-bar__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  min-width: 8rem;
}

.cd-bar__item--progress { border-color: rgba(76, 175, 80, 0.4); }
.cd-bar__item--consequence { border-color: rgba(244, 67, 54, 0.4); }
.cd-bar__item--triggered { opacity: 0.6; border-style: dashed; }

.cd-bar__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.cd-bar__type-icon { font-size: var(--font-size-sm); }

.cd-bar__name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cd-bar__loop {
  font-size: var(--font-size-xs);
  color: var(--color-accent-info);
}

.cd-bar__value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  min-width: 1.5rem;
  text-align: center;
}

.cd-bar__value--zero { color: var(--color-accent-danger); }

.cd-bar__start {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

/* ── Controls ── */

.cd-bar__controls {
  display: flex;
  gap: 2px;
}

.cd-bar__controls--dynamic {
  flex-wrap: wrap;
}

.cd-bar__btn {
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
  touch-action: manipulation;
}

.cd-bar__btn:hover { background: var(--color-bg-elevated); }

.cd-bar__btn--tick {
  background: rgba(83, 168, 182, 0.15);
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-bold);
}

.cd-bar__btn--tick:hover { background: rgba(83, 168, 182, 0.3); }

.cd-bar__btn--reset:hover { background: rgba(33, 150, 243, 0.15); color: var(--color-accent-info); }
.cd-bar__btn--remove:hover { background: rgba(244, 67, 54, 0.15); color: var(--color-accent-danger); }
.cd-bar__btn--confirm { color: var(--color-accent-success); border-color: var(--color-accent-success); }

/* ── Roll result buttons ── */

.cd-bar__roll-btn {
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 2px;
  touch-action: manipulation;
}

.cd-bar__roll-btn:hover:not(:disabled) { background: var(--color-bg-elevated); }
.cd-bar__roll-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.cd-bar__roll-btn--criticalSuccess { color: var(--color-accent-gold); }
.cd-bar__roll-btn--successHope { color: var(--color-accent-hope); }
.cd-bar__roll-btn--successFear { color: var(--color-accent-fear); }
.cd-bar__roll-btn--failureHope { color: var(--color-text-secondary); }
.cd-bar__roll-btn--failureFear { color: var(--color-accent-danger); }

.cd-bar__roll-adv {
  font-weight: var(--font-weight-bold);
}

/* ── Triggered ── */

.cd-bar__triggered {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-warning);
  text-align: center;
}

/* ── Actions ── */

.cd-bar__actions {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
}

/* ── Add button ── */

.cd-bar__add-btn {
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  cursor: pointer;
  white-space: nowrap;
  align-self: center;
  touch-action: manipulation;
}

.cd-bar__add-btn:hover {
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}

/* ── Drawer form ── */

.cd-bar__drawer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
}

.cd-bar__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.cd-bar__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cd-bar__field-input {
  padding: var(--space-sm) var(--space-md);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  box-sizing: border-box;
}

.cd-bar__field-input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.2);
}

.cd-bar__field-input--num {
  width: 5rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.cd-bar__field-row {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
}

.cd-bar__type-pills {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.cd-bar__type-pill {
  padding: var(--space-sm) var(--space-md);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  touch-action: manipulation;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.cd-bar__type-pill:hover { background: var(--color-bg-elevated); }

.cd-bar__type-pill--on {
  background: rgba(83, 168, 182, 0.15);
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-bold);
}

.cd-bar__loop-pill {
  padding: var(--space-sm) var(--space-md);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  touch-action: manipulation;
  transition: background var(--transition-fast);
}

.cd-bar__loop-pill--on {
  background: rgba(33, 150, 243, 0.15);
  border-color: var(--color-accent-info);
  color: var(--color-accent-info);
}

.cd-bar__confirm-btn {
  padding: var(--space-sm) var(--space-lg);
  min-height: var(--touch-min);
  border: 1px solid var(--color-accent-hope);
  border-radius: var(--radius-md);
  background: var(--color-accent-hope);
  color: white;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  touch-action: manipulation;
  transition: opacity var(--transition-fast);
}

.cd-bar__confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.cd-bar__confirm-btn:hover:not(:disabled) { opacity: 0.9; }
</style>
