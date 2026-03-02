<template>
  <section
    class="encounter-config"
    aria-label="Configuration de la rencontre"
  >
    <div class="config-row">
      <label
        class="config-label"
        for="encounter-name"
      >Nom</label>
      <input
        id="encounter-name"
        type="text"
        class="config-input"
        :value="name"
        placeholder="Nom de la rencontre…"
        @input="$emit('update:name', $event.target.value)"
      />
    </div>

    <div class="config-row config-row--inline">
      <div class="config-field">
        <label
          class="config-label"
          for="pc-count"
        >Joueurs (PJ)</label>
        <div
          class="stepper"
          role="group"
          aria-label="Nombre de joueurs"
        >
          <button
            class="stepper__btn"
            :disabled="pcCount <= minPc"
            aria-label="Retirer un joueur"
            @click="$emit('update:pcCount', pcCount - 1)"
          >
            −
          </button>
          <span
            id="pc-count"
            class="stepper__value"
          >{{ pcCount }}</span>
          <button
            class="stepper__btn"
            :disabled="pcCount >= maxPc"
            aria-label="Ajouter un joueur"
            @click="$emit('update:pcCount', pcCount + 1)"
          >
            +
          </button>
        </div>
      </div>

      <div class="config-field">
        <span class="config-label">Tier</span>
        <div
          class="tier-chips"
          role="radiogroup"
          aria-label="Tier de la rencontre"
        >
          <button
            v-for="t in 4"
            :key="t"
            class="chip"
            :class="{ 'chip--active': tier === t, [`chip--tier-${t}`]: true }"
            role="radio"
            :aria-checked="tier === t ? 'true' : 'false'"
            @click="$emit('update:tier', t)"
          >
            T{{ t }}
          </button>
        </div>
      </div>
    </div>

    <div class="config-row">
      <span class="config-label">Intensité de scène</span>
      <div
        class="intensity-chips"
        role="radiogroup"
        aria-label="Intensité de la scène"
      >
        <button
          v-for="s in intensityOptions"
          :key="s.id"
          class="chip chip--intensity"
          :class="{ 'chip--active': intensity === s.id }"
          :style="intensity === s.id ? { borderColor: s.color, color: s.color } : {}"
          role="radio"
          :aria-checked="intensity === s.id ? 'true' : 'false'"
          :title="s.description + ' (Fear ' + s.fearRange[0] + '–' + s.fearRange[1] + ')'"
          @click="$emit('update:intensity', s.id)"
        >
          {{ s.label }}
          <span class="chip__meta">{{ s.fearRange[0] }}–{{ s.fearRange[1] }}F</span>
        </button>
      </div>
    </div>

    <details class="config-adjustments">
      <summary class="config-label config-label--clickable">
        Ajustements BP
        <span
          v-if="activeAdjustments.length > 0"
          class="badge"
        >{{ activeAdjustments.length }}</span>
      </summary>
      <div class="adjustments-list">
        <label
          v-for="adj in adjustmentOptions"
          :key="adj.id"
          class="adjustment-item"
          :title="adj.description"
        >
          <input
            type="checkbox"
            :checked="activeAdjustments.includes(adj.id)"
            @change="$emit('toggleAdjustment', adj.id)"
          />
          <span class="adjustment-label">{{ adj.label }}</span>
          <span
            class="adjustment-value"
            :class="adj.value > 0 ? 'adjustment-value--positive' : 'adjustment-value--negative'"
          >
            {{ adj.value > 0 ? '+' : '' }}{{ adj.value }}
          </span>
        </label>
      </div>
    </details>
  </section>
</template>

<script>
import { SCENE_INTENSITY, BP_ADJUSTMENTS } from '@data/encounters/constants'

export default {
  name: 'EncounterConfig',
  props: {
    name: { type: String, default: '' },
    pcCount: { type: Number, required: true },
    tier: { type: Number, required: true },
    intensity: { type: String, required: true },
    activeAdjustments: { type: Array, default: () => [] },
    minPc: { type: Number, default: 2 },
    maxPc: { type: Number, default: 8 }
  },
  emits: ['update:name', 'update:pcCount', 'update:tier', 'update:intensity', 'toggleAdjustment'],
  setup() {
    return {
      intensityOptions: SCENE_INTENSITY,
      adjustmentOptions: BP_ADJUSTMENTS
    }
  }
}
</script>

<style scoped>
.encounter-config {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.config-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.config-row--inline {
  flex-direction: row;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.config-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.config-label--clickable {
  cursor: pointer;
  user-select: none;
}

.config-input {
  padding: 6px 10px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.config-input::placeholder { color: var(--text-muted, #6b7280); }
.config-input:focus { outline: 2px solid var(--accent-hope, #53a8b6); outline-offset: 1px; }

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 6px;
  overflow: hidden;
}

.stepper__btn {
  width: 32px;
  height: 32px;
  background: var(--bg-tertiary, #2a2a4a);
  border: none;
  color: var(--text-primary);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast, 150ms);
}

.stepper__btn:hover:not(:disabled) { background: var(--bg-hover, #3a3a5a); }
.stepper__btn:disabled { opacity: 0.4; cursor: not-allowed; }

.stepper__value {
  width: 36px;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  background: var(--bg-secondary, #1f1f3a);
  height: 32px;
  line-height: 32px;
}

.tier-chips, .intensity-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.chip {
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-color, #3a3a5a);
  background: var(--bg-tertiary, #2a2a4a);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.chip:hover { border-color: var(--text-secondary); }

.chip--active {
  border-color: var(--accent-hope, #53a8b6);
  color: var(--accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.1);
}

.chip--tier-1.chip--active { border-color: #22c55e; color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.chip--tier-2.chip--active { border-color: #3b82f6; color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.chip--tier-3.chip--active { border-color: #a855f7; color: #a855f7; background: rgba(168, 85, 247, 0.1); }
.chip--tier-4.chip--active { border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.chip--intensity .chip__meta {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-left: 4px;
}

.config-adjustments {
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 6px;
  padding: var(--space-sm);
}

.config-adjustments[open] > summary { margin-bottom: var(--space-sm); }

.badge {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--accent-hope, #53a8b6);
  color: var(--bg-primary, #1a1a2e);
  border-radius: 9px;
  margin-left: 6px;
}

.adjustments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.adjustment-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 0;
}

.adjustment-item input[type="checkbox"] {
  accent-color: var(--accent-hope, #53a8b6);
}

.adjustment-label {
  flex: 1;
  color: var(--text-primary);
}

.adjustment-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}

.adjustment-value--positive { color: #22c55e; }
.adjustment-value--negative { color: var(--accent-fear, #c84b31); }
</style>
