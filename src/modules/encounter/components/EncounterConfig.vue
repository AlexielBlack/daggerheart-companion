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
        <PcPicker
          v-if="characters.length > 0"
          :characters="characters"
          :selected-ids="selectedPcIds"
          @update:selected-ids="$emit('update:selectedPcIds', $event)"
        />
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
          v-if="totalActiveCount > 0"
          class="badge"
        >{{ totalActiveCount }}</span>
      </summary>

      <!-- Ajustements auto-détectés -->
      <div
        v-if="autoAdjustmentOptions.length > 0"
        class="adjustments-group"
      >
        <span class="adjustments-group__title">Auto-détectés</span>
        <div class="adjustments-list">
          <div
            v-for="adj in autoAdjustmentOptions"
            :key="adj.id"
            class="adjustment-item adjustment-item--auto"
            :class="{ 'adjustment-item--active': autoAdjustments.includes(adj.id) }"
            :title="adj.description"
          >
            <span
              class="adjustment-indicator"
              :class="autoAdjustments.includes(adj.id) ? 'adjustment-indicator--on' : 'adjustment-indicator--off'"
              aria-hidden="true"
            >{{ autoAdjustments.includes(adj.id) ? '✓' : '—' }}</span>
            <span class="adjustment-label">
              {{ adj.label }}
              <span
                v-if="adj.id === 'lower-tier' && autoAdjustments.includes('lower-tier')"
                class="adjustment-meta"
              >({{ lowerTierPercentage }}% des adversaires)</span>
            </span>
            <span
              class="adjustment-value"
              :class="[
                adj.value > 0 ? 'adjustment-value--positive' : 'adjustment-value--negative',
                { 'adjustment-value--inactive': !autoAdjustments.includes(adj.id) }
              ]"
            >
              {{ adj.value > 0 ? '+' : '' }}{{ adj.value }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ajustements manuels -->
      <div class="adjustments-group">
        <span class="adjustments-group__title">Manuels</span>
        <div class="adjustments-list">
          <label
            v-for="adj in manualAdjustmentOptions"
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
      </div>
    </details>
  </section>
</template>

<script>
import { SCENE_INTENSITY, BP_ADJUSTMENTS } from '@data/encounters/constants'
import PcPicker from './PcPicker.vue'

export default {
  name: 'EncounterConfig',
  components: { PcPicker },
  props: {
    name: { type: String, default: '' },
    pcCount: { type: Number, required: true },
    tier: { type: Number, required: true },
    intensity: { type: String, required: true },
    activeAdjustments: { type: Array, default: () => [] },
    autoAdjustments: { type: Array, default: () => [] },
    lowerTierPercentage: { type: Number, default: 0 },
    minPc: { type: Number, default: 2 },
    maxPc: { type: Number, default: 8 },
    characters: { type: Array, default: () => [] },
    selectedPcIds: { type: Array, default: () => [] }
  },
  emits: ['update:name', 'update:pcCount', 'update:tier', 'update:intensity', 'toggleAdjustment', 'update:selectedPcIds'],
  setup() {
    return {
      intensityOptions: SCENE_INTENSITY
    }
  },
  computed: {
    autoAdjustmentOptions() {
      return BP_ADJUSTMENTS.filter((a) => a.autoDetect)
    },
    manualAdjustmentOptions() {
      return BP_ADJUSTMENTS.filter((a) => !a.autoDetect)
    },
    totalActiveCount() {
      return this.autoAdjustments.length + this.activeAdjustments.length
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
  color: var(--color-text-secondary);
}

.config-label--clickable {
  cursor: pointer;
  user-select: none;
}

.config-input {
  padding: 6px 10px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.config-input::placeholder { color: var(--color-text-muted, #6b7280); }
.config-input:focus { outline: 2px solid var(--color-accent-hope, #53a8b6); outline-offset: 1px; }

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  overflow: hidden;
}

.stepper__btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  background: var(--color-bg-tertiary, #2a2a4a);
  border: none;
  color: var(--color-text-primary);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast, 150ms);
}

.stepper__btn:hover:not(:disabled) { background: var(--color-bg-hover, #3a3a5a); }
.stepper__btn:disabled { opacity: 0.4; cursor: not-allowed; }

.stepper__value {
  width: 36px;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  background: var(--color-bg-secondary, #1f1f3a);
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
  border: 1px solid var(--color-border, #3a3a5a);
  background: var(--color-bg-tertiary, #2a2a4a);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.chip:hover { border-color: var(--color-text-secondary); }

.chip--active {
  border-color: var(--color-accent-hope, #53a8b6);
  color: var(--color-accent-hope, #53a8b6);
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
  border: 1px solid var(--color-border, #3a3a5a);
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
  background: var(--color-accent-hope, #53a8b6);
  color: var(--color-bg-primary, #1a1a2e);
  border-radius: 9px;
  margin-left: 6px;
}

.adjustments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.adjustments-group {
  margin-bottom: var(--space-sm);
}

.adjustments-group:last-child {
  margin-bottom: 0;
}

.adjustments-group__title {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted, #6b7280);
  margin-bottom: var(--space-xs);
}

.adjustment-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 0;
}

.adjustment-item--auto {
  cursor: default;
  opacity: 0.65;
  transition: opacity var(--transition-fast, 150ms);
}

.adjustment-item--auto.adjustment-item--active {
  opacity: 1;
}

.adjustment-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 3px;
  flex-shrink: 0;
}

.adjustment-indicator--on {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.adjustment-indicator--off {
  background: var(--color-bg-tertiary, #2a2a4a);
  color: var(--color-text-muted, #6b7280);
}

.adjustment-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
  font-weight: 400;
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
  accent-color: var(--color-accent-hope, #53a8b6);
}

.adjustment-label {
  flex: 1;
  color: var(--color-text-primary);
}

.adjustment-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}

.adjustment-value--positive { color: #22c55e; }
.adjustment-value--negative { color: var(--color-accent-fear, #c84b31); }
.adjustment-value--inactive { opacity: 0.4; }
</style>
