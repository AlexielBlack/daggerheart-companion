<template>
  <Transition name="wizard-fade">
    <div
      v-if="store.isOpen"
      class="wizard-overlay"
      role="button"
      tabindex="0"
      aria-label="Fermer le wizard"
      @click="store.close()"
      @keydown.escape="store.close()"
    >
      <div
        class="wizard-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Level Up"
        @click.stop
      >
        <!-- ═══ Header ═══ -->
        <header class="wizard-header">
          <div class="wizard-header__info">
            <h3 class="wizard-header__title">
              ⬆️ Level Up
            </h3>
            <span class="wizard-header__level">
              {{ charStore.selectedCharacter?.name || 'Personnage' }}
              — Niv. {{ store.targetLevel }}
            </span>
          </div>
          <button
            class="wizard-header__close"
            aria-label="Fermer le wizard"
            @click="store.close()"
          >
            ✕
          </button>
        </header>

        <!-- ═══ Stepper ═══ -->
        <nav
          class="wizard-stepper"
          aria-label="Étapes du level up"
        >
          <ol class="stepper-list">
            <li
              v-for="(stepId, idx) in store.STEP_ORDER"
              :key="stepId"
              class="stepper-item"
              :class="{
                'stepper-item--active': idx === store.currentStepIndex,
                'stepper-item--done': isStepDone(idx),
                'stepper-item--future': idx > store.currentStepIndex
              }"
            >
              <button
                class="stepper-item__btn"
                :disabled="!canGoToStep(idx)"
                :aria-current="idx === store.currentStepIndex ? 'step' : undefined"
                :aria-label="`Étape ${idx + 1} : ${store.STEP_LABELS[stepId]}`"
                @click="store.goToStep(stepId)"
              >
                <span class="stepper-item__num">{{ idx + 1 }}</span>
                <span class="stepper-item__label">{{ store.STEP_LABELS[stepId] }}</span>
              </button>
            </li>
          </ol>
        </nav>

        <!-- ═══ Contenu de l'étape ═══ -->
        <div class="wizard-content">
          <!-- Étape 1 : Tier Achievement -->
          <TierAchievementStep
            v-if="store.currentStep === STEPS.TIER_ACHIEVEMENT"
            :has-tier-achievement="store.hasTierAchievementStep"
            :target-level="store.targetLevel"
            :target-tier="store.targetTier"
            :current-proficiency="charStore.selectedCharacter?.proficiency || 1"
            :traits-cleared="store.tierAchievement?.traitsCleared || false"
            :marked-traits-count="charStore.selectedCharacter?.markedTraits?.length || 0"
            :confirmed="store.tierAchievementConfirmed"
            @confirm="store.confirmTierAchievement()"
          />

          <!-- Étape 2 : Advancements -->
          <AdvancementStep
            v-else-if="store.currentStep === STEPS.ADVANCEMENTS"
            :options="store.availableAdvancementOptions"
            :selections="selectionsWithLabels"
            :points-remaining="store.advancementPointsRemaining"
            :validation-errors="store.advancementValidation.errors || []"
            :trait-values="charStore.selectedCharacter?.traits || {}"
            :marked-traits="charStore.selectedCharacter?.markedTraits || []"
            :traits-cleared="store.tierAchievement?.traitsCleared || false"
            @add="store.addAdvancement($event)"
            @remove="store.removeAdvancement($event)"
          />

          <!-- Étape 3 : Seuils -->
          <ThresholdStep
            v-else-if="store.currentStep === STEPS.THRESHOLDS"
            :current-major="currentThresholds.major"
            :current-severe="currentThresholds.severe"
            :confirmed="store.thresholdsConfirmed"
            @confirm="store.confirmThresholds()"
          />

          <!-- Étape 4 : Carte de domaine -->
          <DomainCardStep
            v-else-if="store.currentStep === STEPS.DOMAIN_CARD"
            :catalog-cards="catalogCards"
            :available-domains="availableDomains"
            :target-level="store.targetLevel"
            :selected-card-id="store.selectedDomainCardId"
            :owned-card-ids="ownedCardIds"
            @select="store.selectDomainCard($event)"
          />
        </div>

        <!-- ═══ Résumé (affiché sur la dernière étape) ═══ -->
        <LevelUpSummary
          v-if="store.isLastStep && store.summary"
          :summary="store.summary"
          class="wizard-summary"
        />

        <!-- ═══ Erreur globale ═══ -->
        <div
          v-if="store.wizardError"
          class="wizard-error"
          role="alert"
        >
          {{ store.wizardError }}
        </div>

        <!-- ═══ Navigation ═══ -->
        <footer class="wizard-footer">
          <button
            v-if="!store.isFirstStep"
            class="wiz-btn wiz-btn--secondary"
            @click="store.prevStep()"
          >
            ← Précédent
          </button>
          <span
            v-else
            class="wiz-btn--spacer"
          ></span>

          <button
            v-if="!store.isLastStep"
            class="wiz-btn wiz-btn--primary"
            :disabled="!store.isCurrentStepValid"
            @click="store.nextStep()"
          >
            Suivant →
          </button>
          <button
            v-else
            class="wiz-btn wiz-btn--finalize"
            :disabled="!store.canFinalize"
            @click="onFinalize"
          >
            ✓ Appliquer le Level Up
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script>
import { computed } from 'vue'
import { useCharacterStore } from '@modules/characters'
import { useLevelUpStore, WIZARD_STEPS } from '../stores/levelUpStore'
import TierAchievementStep from './TierAchievementStep.vue'
import AdvancementStep from './AdvancementStep.vue'
import ThresholdStep from './ThresholdStep.vue'
import DomainCardStep from './DomainCardStep.vue'
import LevelUpSummary from './LevelUpSummary.vue'

export default {
  name: 'LevelUpWizard',
  components: {
    TierAchievementStep,
    AdvancementStep,
    ThresholdStep,
    DomainCardStep,
    LevelUpSummary
  },
  emits: ['levelup-complete', 'levelup-error'],
  setup(_props, { emit }) {
    const charStore = useCharacterStore()
    const store = useLevelUpStore()
    const STEPS = WIZARD_STEPS

    // ── Données dérivées pour les composants enfants ──

    /** Advancements sélectionnés enrichis avec les labels */
    const selectionsWithLabels = computed(() => {
      return store.selectedAdvancements.map((sel) => {
        const option = store.availableAdvancementOptions.find(
          (o) => o.type === sel.type && o.tier === sel.tier
        )
        return {
          ...sel,
          label: option?.label || sel.type,
          doubleSlot: option?.doubleSlot || false
        }
      })
    })

    /** Seuils de dégâts actuels du personnage */
    const currentThresholds = computed(() => {
      if (!charStore.selectedThresholds) {
        return { major: 0, severe: 0 }
      }
      return charStore.selectedThresholds
    })

    /** Cartes de domaine éligibles pour la sélection */
    const catalogCards = computed(() => {
      return charStore.availableDomainCards || []
    })

    /** Domaines disponibles pour le personnage */
    const availableDomains = computed(() => {
      return charStore.availableDomains || []
    })

    /** IDs des cartes déjà possédées */
    const ownedCardIds = computed(() => {
      const char = charStore.selectedCharacter
      if (!char || !char.domainCards) return []
      return [
        ...(char.domainCards.loadout || []),
        ...(char.domainCards.vault || [])
      ]
    })

    // ── Stepper helpers ──

    function isStepDone(idx) {
      if (idx >= store.currentStepIndex) return false
      const stepId = store.STEP_ORDER[idx]
      switch (stepId) {
        case STEPS.TIER_ACHIEVEMENT:
          return store.isTierAchievementComplete
        case STEPS.ADVANCEMENTS:
          return store.isAdvancementsComplete
        case STEPS.THRESHOLDS:
          return store.isThresholdsComplete
        case STEPS.DOMAIN_CARD:
          return store.isDomainCardComplete
        default:
          return false
      }
    }

    function canGoToStep(idx) {
      // Peut toujours revenir en arrière
      if (idx <= store.currentStepIndex) return true
      // Ne peut avancer que si toutes les étapes avant sont complètes
      for (let i = 0; i < idx; i++) {
        if (!isStepDone(i) && i !== store.currentStepIndex) return false
      }
      // L'étape courante doit être valide pour avancer
      return store.isCurrentStepValid
    }

    // ── Finalisation ──

    function onFinalize() {
      const result = store.finalize()
      if (result.success) {
        emit('levelup-complete', store.targetLevel)
      } else {
        emit('levelup-error', result.error)
      }
    }

    return {
      store,
      charStore,
      STEPS,
      selectionsWithLabels,
      currentThresholds,
      catalogCards,
      availableDomains,
      ownedCardIds,
      isStepDone,
      canGoToStep,
      onFinalize
    }
  }
}
</script>

<style scoped>
/* ── Overlay ── */
.wizard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.wizard-panel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

/* ── Header ── */
.wizard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.wizard-header__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-lg);
  margin: 0;
  color: var(--color-text-primary);
}

.wizard-header__level {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.wizard-header__close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}

.wizard-header__close:hover {
  color: var(--color-text-primary);
}

/* ── Stepper ── */
.wizard-stepper {
  padding: var(--space-sm) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow-x: auto;
}

.stepper-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 2px;
}

.stepper-item {
  flex: 1;
  min-width: 0;
}

.stepper-item__btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.stepper-item__btn:disabled { cursor: not-allowed; }

.stepper-item__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.stepper-item--active .stepper-item__btn {
  color: var(--color-text-primary);
  border-color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.06);
}

.stepper-item--active .stepper-item__num {
  background: var(--color-accent-hope);
  color: #fff;
}

.stepper-item--done .stepper-item__num {
  background: var(--color-accent-success);
  color: #fff;
}

.stepper-item--done .stepper-item__btn {
  color: var(--color-text-secondary);
}

.stepper-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 500px) {
  .stepper-item__label { display: none; }
  .stepper-item__btn { justify-content: center; }
}

/* ── Content ── */
.wizard-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  min-height: 0;
}

/* ── Summary ── */
.wizard-summary {
  padding: 0 var(--space-lg) var(--space-md);
  flex-shrink: 0;
}

/* ── Error ── */
.wizard-error {
  padding: var(--space-sm) var(--space-lg);
  background: rgba(200, 75, 49, 0.08);
  color: var(--color-accent-fear);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

/* ── Footer ── */
.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.wiz-btn--spacer { flex: 1; }

.wiz-btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.wiz-btn--secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.wiz-btn--secondary:hover { border-color: var(--color-text-secondary); }

.wiz-btn--primary {
  background: var(--color-accent-hope);
  border: none;
  color: #fff;
}

.wiz-btn--primary:hover:not(:disabled) { opacity: 0.9; }
.wiz-btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }

.wiz-btn--finalize {
  background: var(--color-accent-success);
  border: none;
  color: #fff;
}

.wiz-btn--finalize:hover:not(:disabled) { opacity: 0.9; }
.wiz-btn--finalize:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Transition ── */
.wizard-fade-enter-active,
.wizard-fade-leave-active {
  transition: opacity 0.25s ease;
}

.wizard-fade-enter-from,
.wizard-fade-leave-to {
  opacity: 0;
}
</style>
