<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
  <Teleport to="body">
    <div
      v-if="visible"
      class="dap__backdrop"
      @click.self="$emit('close')"
    >
      <!-- eslint-enable -->
      <div
        class="dap__popup"
        :style="popupStyle"
        role="dialog"
        :aria-label="title"
        aria-modal="true"
      >
        <div class="dap__header">
          <span class="dap__title">{{ title }}</span>
          <button
            class="dap__close"
            aria-label="Annuler"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- Sélecteur d'instance (si plusieurs cibles actives) -->
        <div
          v-if="instances.length > 1"
          class="dap__instances"
        >
          <span class="dap__instances-label">Cible :</span>
          <button
            class="dap__inst-btn"
            :class="{ 'dap__inst-btn--active': selectedInstanceId === '__all__' }"
            @click="selectedInstanceId = '__all__'"
          >
            Tous ({{ instances.length }})
          </button>
          <button
            v-for="(inst, idx) in instances"
            :key="inst.instanceId"
            class="dap__inst-btn"
            :class="{
              'dap__inst-btn--active': selectedInstanceId === inst.instanceId,
              'dap__inst-btn--defeated': inst.isDefeated
            }"
            :disabled="inst.isDefeated"
            @click="selectedInstanceId = inst.instanceId"
          >
            #{{ idx + 1 }}
            <span class="dap__inst-hp">{{ inst.markedHP }}/{{ inst.maxHP }}</span>
          </button>
        </div>

        <!-- Choix du type -->
        <div class="dap__types">
          <button
            class="dap__type-btn"
            :class="{ 'dap__type-btn--active': mode === 'damage-hp' }"
            @click="mode = 'damage-hp'"
          >
            ❤️ Dégâts HP
          </button>
          <button
            class="dap__type-btn"
            :class="{ 'dap__type-btn--active': mode === 'damage-stress' }"
            @click="mode = 'damage-stress'"
          >
            💢 Stress
          </button>
          <button
            class="dap__type-btn dap__type-btn--heal"
            :class="{ 'dap__type-btn--active': mode === 'heal-hp' }"
            @click="mode = 'heal-hp'"
          >
            💚 Soin HP
          </button>
          <button
            class="dap__type-btn dap__type-btn--heal"
            :class="{ 'dap__type-btn--active': mode === 'heal-stress' }"
            @click="mode = 'heal-stress'"
          >
            🩹 Soin Stress
          </button>
        </div>

        <!-- Quantite -->
        <div class="dap__amounts">
          <button
            v-for="n in [1, 2, 3, 4, 5]"
            :key="n"
            class="dap__amount-btn"
            :class="{ 'dap__amount-btn--active': amount === n }"
            @click="amount = n"
          >
            {{ n }}
          </button>
          <input
            v-model.number="amount"
            type="number"
            class="dap__amount-input"
            min="1"
            max="99"
            inputmode="numeric"
            aria-label="Quantité personnalisée"
            @click.stop
          />
        </div>

        <!-- Appliquer -->
        <button
          class="dap__apply"
          :disabled="!mode || !amount"
          @click="onApply"
        >
          Appliquer {{ amount || '' }} {{ modeLabel }}{{ instances.length > 1 && selectedInstanceId === '__all__' ? ' à tous' : '' }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'DragActionPopup',

  props: {
    visible: { type: Boolean, default: false },
    sourceName: { type: String, default: '' },
    targetName: { type: String, default: '' },
    anchorX: { type: Number, default: 0 },
    anchorY: { type: Number, default: 0 },
    /** Instances du groupe adversaire cible (vide si cible = PJ) */
    instances: { type: Array, default: () => [] }
  },

  emits: ['close', 'apply'],

  setup(props, { emit }) {
    const mode = ref('damage-hp')
    const amount = ref(1)
    const selectedInstanceId = ref('__all__')

    // Reset la sélection quand le popup s'ouvre avec de nouvelles instances
    watch(() => props.visible, (val) => {
      if (val) {
        selectedInstanceId.value = props.instances.length === 1
          ? props.instances[0].instanceId
          : '__all__'
      }
    })

    const title = computed(() => `${props.sourceName} → ${props.targetName}`)

    const modeLabel = computed(() => {
      switch (mode.value) {
      case 'damage-hp': return 'HP'
      case 'damage-stress': return 'Stress'
      case 'heal-hp': return 'Soin HP'
      case 'heal-stress': return 'Soin Stress'
      default: return ''
      }
    })

    const popupStyle = computed(() => ({
      top: Math.min(Math.max(props.anchorY - 100, 10), window.innerHeight - 400) + 'px',
      left: Math.min(Math.max(props.anchorX - 120, 10), window.innerWidth - 260) + 'px'
    }))

    function onApply() {
      if (!mode.value || !amount.value) return
      emit('apply', {
        mode: mode.value,
        amount: amount.value,
        instanceId: selectedInstanceId.value
      })
      mode.value = 'damage-hp'
      amount.value = 1
    }

    return { mode, amount, selectedInstanceId, title, modeLabel, popupStyle, onApply }
  }
}
</script>

<style scoped>
.dap__backdrop {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(0, 0, 0, 0.3);
}

.dap__popup {
  position: absolute;
  width: 240px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dap__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dap__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dap__close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.dap__close:hover { background: var(--color-bg-elevated); }

/* Instances */
.dap__instances {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
}

.dap__instances-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-bold);
  margin-right: 2px;
}

.dap__inst-btn {
  min-height: 2rem;
  padding: 2px var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  touch-action: manipulation;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: background 0.1s, border-color 0.1s;
}

.dap__inst-btn:hover:not(:disabled) { background: var(--color-bg-elevated); }

.dap__inst-btn--active {
  background: rgba(83, 168, 182, 0.15);
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}

.dap__inst-btn--defeated { opacity: 0.3; }

.dap__inst-hp {
  font-variant-numeric: tabular-nums;
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

.dap__inst-btn--active .dap__inst-hp { color: var(--color-accent-hope); }

/* Types */
.dap__types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}

.dap__type-btn {
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.1s, border-color 0.1s;
}

.dap__type-btn:hover { background: var(--color-bg-elevated); }

.dap__type-btn--active {
  background: rgba(244, 67, 54, 0.15);
  border-color: var(--color-accent-danger);
  color: var(--color-accent-danger);
}

.dap__type-btn--heal.dap__type-btn--active {
  background: rgba(76, 175, 80, 0.15);
  border-color: var(--color-accent-success);
  color: var(--color-accent-success);
}

/* Amounts */
.dap__amounts {
  display: flex;
  gap: 3px;
  align-items: center;
}

.dap__amount-btn {
  flex: 1;
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.1s;
}

.dap__amount-btn:active { transform: scale(0.95); }

.dap__amount-btn--active {
  background: rgba(83, 168, 182, 0.2);
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}

.dap__amount-input {
  width: 3rem;
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.dap__amount-input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.2);
}

/* Apply */
.dap__apply {
  min-height: var(--touch-min);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-accent-hope);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  touch-action: manipulation;
  transition: filter 0.1s;
}

.dap__apply:hover:not(:disabled) { filter: brightness(1.1); }
.dap__apply:active:not(:disabled) { transform: scale(0.98); }
.dap__apply:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
