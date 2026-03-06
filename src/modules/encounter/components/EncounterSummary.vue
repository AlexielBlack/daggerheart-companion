<template>
  <section
    class="encounter-summary"
    aria-label="Résumé de la rencontre"
  >
    <h3 class="summary-title">
      Résumé
    </h3>

    <div class="summary-stats">
      <div class="stat-card">
        <span class="stat-card__value">{{ adversaryCount }}</span>
        <span class="stat-card__label">Adversaire{{ adversaryCount !== 1 ? 's' : '' }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__value">{{ totalHP }}</span>
        <span class="stat-card__label">HP total</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__value">{{ totalStress }}</span>
        <span class="stat-card__label">Stress total</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__value">{{ intensity.fearRange[0] }}–{{ intensity.fearRange[1] }}</span>
        <span class="stat-card__label">Fear suggérée</span>
      </div>
    </div>

    <div
      v-if="environment"
      class="summary-env"
    >
      <div class="summary-env__header">
        <span class="summary-env__icon">{{ environmentIcon }}</span>
        <span class="summary-env__name">{{ environment.name }}</span>
        <span
          class="summary-env__tier"
          :class="`tier--${environment.tier}`"
        >T{{ environment.tier }}</span>
      </div>
      <p class="summary-env__desc">
        {{ environment.description }}
      </p>
      <ul
        v-if="environment.impulses && environment.impulses.length"
        class="summary-env__impulses"
      >
        <li
          v-for="(impulse, i) in environment.impulses"
          :key="i"
        >
          {{ impulse }}
        </li>
      </ul>
    </div>

    <ul
      v-if="warnings.length > 0"
      class="summary-warnings"
      role="alert"
      aria-label="Alertes"
    >
      <li
        v-for="(warning, i) in warnings"
        :key="i"
        class="warning-item"
        :class="`warning-item--${warning.type}`"
      >
        <span class="warning-icon">{{ warningIcon(warning.type) }}</span>
        {{ warning.message }}
      </li>
    </ul>

    <div class="summary-actions">
      <button
        class="btn btn--launch"
        :disabled="!isValid"
        @click="$emit('launch')"
      >
        ▶️ Lancer
      </button>
      <button
        class="btn btn--primary"
        :disabled="!isValid"
        @click="$emit('save')"
      >
        💾 Sauvegarder
      </button>
      <button
        class="btn btn--ghost"
        @click="$emit('reset')"
      >
        🗑️ Réinitialiser
      </button>
    </div>
  </section>
</template>

<script>
import { ENVIRONMENT_TYPE_ICONS } from '@data/environments'

export default {
  name: 'EncounterSummary',
  props: {
    adversaryCount: { type: Number, default: 0 },
    totalHP: { type: Number, default: 0 },
    totalStress: { type: Number, default: 0 },
    intensity: { type: Object, required: true },
    environment: { type: Object, default: null },
    warnings: { type: Array, default: () => [] },
    isValid: { type: Boolean, default: false }
  },
  emits: ['save', 'reset', 'launch'],
  computed: {
    environmentIcon() {
      if (!this.environment) return '🌍'
      return ENVIRONMENT_TYPE_ICONS[this.environment.type] || '🌍'
    }
  },
  methods: {
    warningIcon(type) {
      const icons = { error: '🔴', warning: '🟡', info: '🔵' }
      return icons[type] || '🔵'
    }
  }
}
</script>

<style scoped>
.encounter-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.summary-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: var(--color-text-primary);
  margin: 0;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 6px;
}

.stat-card__value {
  font-size: 1.4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}

.stat-card__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted, #6b7280);
}

.summary-env {
  padding: var(--space-sm);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  background: var(--color-bg-secondary, #1f1f3a);
}

.summary-env__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.summary-env__icon { font-size: 1rem; }

.summary-env__name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.summary-env__tier {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
}

.tier--1 { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.tier--2 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.tier--3 { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
.tier--4 { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.summary-env__desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-xs);
  line-height: 1.4;
}

.summary-env__impulses {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.summary-env__impulses li {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-style: italic;
}

.summary-warnings {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.warning-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  font-size: 0.8rem;
  padding: 6px 8px;
  border-radius: 4px;
  line-height: 1.4;
}

.warning-icon { flex-shrink: 0; font-size: 0.7rem; }

.warning-item--error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.warning-item--warning {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.warning-item--info {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.summary-actions {
  display: flex;
  gap: var(--space-sm);
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
  border: 1px solid transparent;
}

.btn--launch {
  background: var(--color-accent-success, #4caf50);
  color: var(--color-bg-primary, #1a1a2e);
  border-color: var(--color-accent-success, #4caf50);
}

.btn--launch:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn--launch:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-accent-hope, #53a8b6);
  color: var(--color-bg-primary, #1a1a2e);
  border-color: var(--color-accent-hope, #53a8b6);
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn--primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border, #3a3a5a);
}

.btn--ghost:hover {
  border-color: var(--color-accent-fear, #c84b31);
  color: var(--color-accent-fear, #c84b31);
}
</style>
