<template>
  <div
    class="step-tier"
    aria-label="Tier Achievement"
  >
    <!-- Avec Tier Achievement -->
    <template v-if="hasTierAchievement">
      <p class="step-tier__intro">
        Passage au <strong>Tier {{ targetTier }}</strong> !
        Votre personnage reçoit automatiquement :
      </p>

      <ul
        class="step-tier__rewards"
        aria-label="Récompenses du tier"
      >
        <li class="reward-item">
          <span class="reward-icon">⭐</span>
          <div class="reward-text">
            <strong>+2 Expérience</strong>
            <span class="reward-desc">Nouvelle expérience à +2 de bonus</span>
          </div>
        </li>
        <li class="reward-item">
          <span class="reward-icon">🎯</span>
          <div class="reward-text">
            <strong>+1 Maîtrise</strong>
            <span class="reward-desc">Proficiency passe à {{ currentProficiency + 1 }}</span>
          </div>
        </li>
        <li
          v-if="traitsCleared"
          class="reward-item reward-item--highlight"
        >
          <span class="reward-icon">🔄</span>
          <div class="reward-text">
            <strong>Traits débloqués</strong>
            <span class="reward-desc">
              Tous les traits marqués sont effacés
              <template v-if="markedTraitsCount > 0">
                ({{ markedTraitsCount }} trait{{ markedTraitsCount > 1 ? 's' : '' }})
              </template>
            </span>
          </div>
        </li>
      </ul>

      <button
        class="step-tier__confirm-btn"
        :class="{ 'step-tier__confirm-btn--confirmed': confirmed }"
        :disabled="confirmed"
        :aria-pressed="confirmed"
        @click="$emit('confirm')"
      >
        {{ confirmed ? '✓ Confirmé' : 'Confirmer le Tier Achievement' }}
      </button>
    </template>

    <!-- Sans Tier Achievement -->
    <template v-else>
      <p class="step-tier__intro step-tier__intro--skip">
        Pas de Tier Achievement au niveau {{ targetLevel }}.
        Cette étape est automatiquement validée.
      </p>
      <div
        class="step-tier__auto-badge"
        role="status"
      >
        ✓ Étape validée
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TierAchievementStep',
  props: {
    hasTierAchievement: { type: Boolean, default: false },
    targetLevel: { type: Number, default: 2 },
    targetTier: { type: Number, default: 2 },
    currentProficiency: { type: Number, default: 1 },
    traitsCleared: { type: Boolean, default: false },
    markedTraitsCount: { type: Number, default: 0 },
    confirmed: { type: Boolean, default: false }
  },
  emits: ['confirm']
}
</script>

<style scoped>
.step-tier__intro {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
  line-height: var(--line-height-normal);
}

.step-tier__intro--skip {
  color: var(--color-text-muted);
  font-style: italic;
}

.step-tier__rewards {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.reward-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.reward-item--highlight {
  border-color: var(--color-accent-gold);
  background: rgba(224, 165, 38, 0.06);
}

.reward-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}

.reward-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reward-text strong {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.reward-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.step-tier__confirm-btn {
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

.step-tier__confirm-btn:hover:not(:disabled) { opacity: 0.9; }

.step-tier__confirm-btn--confirmed {
  background: var(--color-accent-success);
  cursor: default;
}

.step-tier__auto-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  background: rgba(76, 175, 80, 0.12);
  border: 1px solid var(--color-accent-success);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent-success);
}
</style>
