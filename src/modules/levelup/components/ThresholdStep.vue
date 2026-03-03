<template>
  <div
    class="step-thresh"
    aria-label="Seuils de dégâts"
  >
    <p class="step-thresh__intro">
      À chaque montée de niveau, les seuils de dégâts augmentent automatiquement.
    </p>

    <div class="step-thresh__card">
      <div class="thresh-bonus">
        <span class="thresh-bonus__icon">🛡️</span>
        <div class="thresh-bonus__text">
          <strong>+1 aux seuils de dégâts</strong>
          <span class="thresh-bonus__detail">
            Majeur : {{ currentMajor }} → {{ currentMajor + 1 }}
            · Sévère : {{ currentSevere }} → {{ currentSevere + 1 }}
          </span>
        </div>
      </div>
    </div>

    <p class="step-thresh__note">
      Ce bonus est automatique et inclut l'incrémentation du niveau dans le calcul.
    </p>

    <button
      class="step-thresh__confirm-btn"
      :class="{ 'step-thresh__confirm-btn--confirmed': confirmed }"
      :disabled="confirmed"
      :aria-pressed="confirmed"
      @click="$emit('confirm')"
    >
      {{ confirmed ? '✓ Confirmé' : 'Confirmer' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ThresholdStep',
  props: {
    currentMajor: { type: Number, default: 0 },
    currentSevere: { type: Number, default: 0 },
    confirmed: { type: Boolean, default: false }
  },
  emits: ['confirm']
}
</script>

<style scoped>
.step-thresh__intro {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
  line-height: var(--line-height-normal);
}

.step-thresh__card {
  padding: var(--space-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
}

.thresh-bonus {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.thresh-bonus__icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.thresh-bonus__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.thresh-bonus__text strong {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.thresh-bonus__detail {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
  font-variant-numeric: tabular-nums;
}

.step-thresh__note {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0 0 var(--space-md);
}

.step-thresh__confirm-btn {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-accent-hope);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.step-thresh__confirm-btn:hover:not(:disabled) { opacity: 0.9; }

.step-thresh__confirm-btn--confirmed {
  background: var(--color-accent-success);
  cursor: default;
}
</style>
