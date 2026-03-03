<template>
  <div
    class="step-adv"
    aria-label="Sélection des advancements"
  >
    <p class="step-adv__intro">
      Choisissez <strong>2 améliorations</strong> parmi les options disponibles.
      <span class="step-adv__points">
        {{ pointsRemaining }}/2 point{{ pointsRemaining > 1 ? 's' : '' }} restant{{ pointsRemaining > 1 ? 's' : '' }}
      </span>
    </p>

    <!-- ═══ Sélections en cours ═══ -->
    <div
      v-if="selections.length > 0"
      class="step-adv__selections"
    >
      <h4 class="step-adv__sub-heading">
        Sélectionnés
      </h4>
      <ul
        class="selection-list"
        aria-label="Advancements sélectionnés"
      >
        <li
          v-for="(sel, idx) in selections"
          :key="idx"
          class="selection-item"
        >
          <span class="selection-item__label">{{ sel.label || sel.type }}</span>
          <span
            v-if="sel.traits"
            class="selection-item__detail"
          >
            {{ formatTraits(sel.traits) }}
          </span>
          <span class="selection-item__tier">T{{ sel.tier }}</span>
          <button
            class="selection-item__remove"
            :aria-label="`Retirer ${sel.label || sel.type}`"
            @click="$emit('remove', idx)"
          >
            ✕
          </button>
        </li>
      </ul>
    </div>

    <!-- ═══ Options disponibles ═══ -->
    <div class="step-adv__options">
      <h4 class="step-adv__sub-heading">
        Options disponibles
      </h4>

      <div
        v-for="tier in groupedOptions"
        :key="tier.tier"
        class="tier-group"
      >
        <h5 class="tier-group__title">
          Tier {{ tier.tier }}
        </h5>
        <ul
          class="option-list"
          :aria-label="`Options de tier ${tier.tier}`"
        >
          <li
            v-for="option in tier.options"
            :key="`${option.tier}-${option.type}`"
            class="option-item"
            :class="{
              'option-item--disabled': option.disabled || !canSelect(option),
              'option-item--double': option.doubleSlot
            }"
          >
            <div class="option-item__main">
              <button
                v-if="option.type === 'traits'"
                class="option-item__btn"
                :disabled="option.disabled || !canSelect(option)"
                :aria-label="`Sélectionner : ${option.label}`"
                @click="startTraitPick(option)"
              >
                <span class="option-item__label">{{ option.label }}</span>
                <span class="option-item__slots">
                  {{ option.remainingSlots }}/{{ option.maxSlots }}
                </span>
              </button>
              <button
                v-else
                class="option-item__btn"
                :disabled="option.disabled || !canSelect(option)"
                :aria-label="`Sélectionner : ${option.label}`"
                @click="selectSimple(option)"
              >
                <span class="option-item__label">{{ option.label }}</span>
                <span class="option-item__slots">
                  {{ option.remainingSlots }}/{{ option.maxSlots }}
                </span>
              </button>
              <span
                v-if="option.doubleSlot"
                class="option-item__badge"
              >2 pts</span>
            </div>
            <span
              v-if="option.disabled"
              class="option-item__reason"
            >
              {{ option.disabledReason }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- ═══ Modal sélection de traits ═══ -->
    <Transition name="fade">
      <div
        v-if="traitPickerOpen"
        class="trait-overlay"
        role="button"
        tabindex="0"
        aria-label="Fermer la sélection de traits"
        @click="cancelTraitPick"
        @keydown.escape="cancelTraitPick"
      >
        <div
          class="trait-picker"
          role="dialog"
          aria-label="Choisissez 2 traits à augmenter"
          @click.stop
        >
          <h4 class="trait-picker__title">
            Choisissez 2 traits non marqués
          </h4>
          <p class="trait-picker__hint">
            {{ pickedTraits.length }}/2 sélectionnés
          </p>
          <ul
            class="trait-picker__list"
            aria-label="Traits disponibles"
          >
            <li
              v-for="trait in allTraits"
              :key="trait.id"
              class="trait-option"
              :class="{
                'trait-option--selected': pickedTraits.includes(trait.id),
                'trait-option--disabled': isTraitDisabled(trait.id)
              }"
            >
              <button
                class="trait-option__btn"
                :disabled="isTraitDisabled(trait.id) && !pickedTraits.includes(trait.id)"
                :aria-pressed="pickedTraits.includes(trait.id)"
                :aria-label="`${trait.label} (${traitValues[trait.id] ?? 0})`"
                @click="toggleTrait(trait.id)"
              >
                <span class="trait-option__label">{{ trait.label }}</span>
                <span class="trait-option__value">{{ traitValues[trait.id] ?? 0 }}</span>
                <span
                  v-if="isTraitMarked(trait.id)"
                  class="trait-option__mark"
                  title="Marqué"
                >●</span>
              </button>
            </li>
          </ul>
          <div class="trait-picker__actions">
            <button
              class="tp-btn tp-btn--cancel"
              @click="cancelTraitPick"
            >
              Annuler
            </button>
            <button
              class="tp-btn tp-btn--confirm"
              :disabled="pickedTraits.length !== 2"
              @click="confirmTraitPick"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ Erreurs de validation ═══ -->
    <div
      v-if="validationErrors.length > 0 && selections.length > 0"
      class="step-adv__errors"
      role="alert"
    >
      <p
        v-for="(err, i) in validationErrors"
        :key="i"
        class="step-adv__error"
      >
        {{ err }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { TRAITS } from '@data/classes'

export default {
  name: 'AdvancementStep',
  props: {
    /** Options d'advancement disponibles (depuis getAvailableAdvancements) */
    options: { type: Array, default: () => [] },
    /** Advancements déjà sélectionnés */
    selections: { type: Array, default: () => [] },
    /** Points d'advancement restants (0-2) */
    pointsRemaining: { type: Number, default: 2 },
    /** Erreurs de validation */
    validationErrors: { type: Array, default: () => [] },
    /** Valeurs actuelles des traits du personnage */
    traitValues: { type: Object, default: () => ({}) },
    /** Traits actuellement marqués */
    markedTraits: { type: Array, default: () => [] },
    /** Traits effacés (true si tier achievement les clear) */
    traitsCleared: { type: Boolean, default: false }
  },
  emits: ['add', 'remove'],
  setup(props, { emit }) {
    const allTraits = TRAITS

    // ── Options groupées par tier ──
    const groupedOptions = computed(() => {
      const tiers = {}
      for (const opt of props.options) {
        if (!tiers[opt.tier]) {
          tiers[opt.tier] = { tier: opt.tier, options: [] }
        }
        tiers[opt.tier].options.push(opt)
      }
      return Object.values(tiers).sort((a, b) => a.tier - b.tier)
    })

    // ── Sélection simple ──
    function canSelect(option) {
      if (props.pointsRemaining <= 0) return false
      const cost = option.doubleSlot ? 2 : 1
      if (cost > props.pointsRemaining) return false
      // Si un doubleSlot et déjà une sélection → non
      if (option.doubleSlot && props.selections.length > 0) return false
      // Si des sélections contiennent un doubleSlot → non
      if (!option.doubleSlot && props.selections.some((s) => s.doubleSlot)) return false
      return true
    }

    function selectSimple(option) {
      if (!canSelect(option)) return
      const advancement = {
        type: option.type,
        tier: option.tier,
        label: option.label,
        doubleSlot: option.doubleSlot || false
      }
      emit('add', advancement)
    }

    // ── Sélection de traits (modal) ──
    const traitPickerOpen = ref(false)
    const pickedTraits = ref([])
    const currentTraitOption = ref(null)

    // Traits effectivement marqués (tenant compte du clear au tier achievement)
    const effectiveMarkedTraits = computed(() => {
      return props.traitsCleared ? [] : [...props.markedTraits]
    })

    // Traits déjà sélectionnés dans les advancements en cours
    const traitsInSelections = computed(() => {
      const ids = []
      for (const sel of props.selections) {
        if (sel.type === 'traits' && Array.isArray(sel.traits)) {
          ids.push(...sel.traits)
        }
      }
      return ids
    })

    function startTraitPick(option) {
      if (!canSelect(option)) return
      currentTraitOption.value = option
      pickedTraits.value = []
      traitPickerOpen.value = true
    }

    function isTraitMarked(traitId) {
      return effectiveMarkedTraits.value.includes(traitId)
        || traitsInSelections.value.includes(traitId)
    }

    function isTraitDisabled(traitId) {
      if (isTraitMarked(traitId)) return true
      // Si déjà 2 traits sélectionnés et celui-ci n'en fait pas partie
      if (pickedTraits.value.length >= 2 && !pickedTraits.value.includes(traitId)) return true
      return false
    }

    function toggleTrait(traitId) {
      const idx = pickedTraits.value.indexOf(traitId)
      if (idx >= 0) {
        pickedTraits.value.splice(idx, 1)
      } else if (pickedTraits.value.length < 2 && !isTraitMarked(traitId)) {
        pickedTraits.value.push(traitId)
      }
    }

    function confirmTraitPick() {
      if (pickedTraits.value.length !== 2) return
      emit('add', {
        type: currentTraitOption.value.type,
        tier: currentTraitOption.value.tier,
        label: currentTraitOption.value.label,
        traits: [...pickedTraits.value]
      })
      traitPickerOpen.value = false
    }

    function cancelTraitPick() {
      traitPickerOpen.value = false
      pickedTraits.value = []
      currentTraitOption.value = null
    }

    function formatTraits(traits) {
      if (!Array.isArray(traits)) return ''
      return traits
        .map((id) => {
          const t = TRAITS.find((tr) => tr.id === id)
          return t ? t.label : id
        })
        .join(' & ')
    }

    return {
      allTraits,
      groupedOptions,
      canSelect,
      selectSimple,
      traitPickerOpen,
      pickedTraits,
      startTraitPick,
      isTraitMarked,
      isTraitDisabled,
      toggleTrait,
      confirmTraitPick,
      cancelTraitPick,
      formatTraits
    }
  }
}
</script>

<style scoped>
.step-adv__intro {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
  line-height: var(--line-height-normal);
}

.step-adv__points {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
}

.step-adv__sub-heading {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin: 0 0 var(--space-xs);
}

/* ── Sélections ── */
.step-adv__selections {
  margin-bottom: var(--space-md);
}

.selection-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.selection-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(83, 168, 182, 0.1);
  border: 1px solid var(--color-accent-hope);
  border-radius: var(--radius-sm);
}

.selection-item__label {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.selection-item__detail {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
}

.selection-item__tier {
  font-size: var(--font-size-xs);
  padding: 1px 6px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.selection-item__remove {
  background: none;
  border: none;
  color: var(--color-accent-fear);
  cursor: pointer;
  font-size: var(--font-size-sm);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.selection-item__remove:hover {
  background: rgba(200, 75, 49, 0.15);
}

/* ── Options ── */
.step-adv__options {
  margin-bottom: var(--space-md);
}

.tier-group {
  margin-bottom: var(--space-sm);
}

.tier-group__title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-gold);
  margin: 0 0 var(--space-xs);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}

.option-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-item__main {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.option-item__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.option-item__btn:hover:not(:disabled) {
  border-color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.06);
}

.option-item__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.option-item__label { flex: 1; }

.option-item__slots {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.option-item__badge {
  font-size: var(--font-size-xs);
  padding: 1px 6px;
  background: var(--color-accent-warning);
  color: var(--color-text-inverse);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
}

.option-item__reason {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-accent-fear);
  padding-left: var(--space-sm);
  margin-top: 2px;
}

/* ── Trait picker modal ── */
.trait-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
}

.trait-picker {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 380px;
  width: 90%;
}

.trait-picker__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-md);
  margin: 0 0 var(--space-xs);
  color: var(--color-text-primary);
}

.trait-picker__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-md);
}

.trait-picker__list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-md);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs);
}

.trait-option__btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: var(--color-bg-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.trait-option--selected .trait-option__btn {
  border-color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.12);
}

.trait-option--disabled:not(.trait-option--selected) .trait-option__btn {
  opacity: 0.35;
  cursor: not-allowed;
}

.trait-option__btn:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 2px;
}

.trait-option__label {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: left;
}

.trait-option__value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
  color: var(--color-accent-hope);
}

.trait-option__mark {
  font-size: var(--font-size-xs);
  color: var(--color-accent-fear);
}

.trait-picker__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.tp-btn {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.tp-btn--cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.tp-btn--cancel:hover { border-color: var(--color-text-secondary); }

.tp-btn--confirm {
  background: var(--color-accent-hope);
  border: none;
  color: #fff;
}

.tp-btn--confirm:hover:not(:disabled) { opacity: 0.9; }
.tp-btn--confirm:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Erreurs ── */
.step-adv__errors {
  padding: var(--space-sm) var(--space-md);
  background: rgba(200, 75, 49, 0.08);
  border: 1px solid var(--color-accent-fear);
  border-radius: var(--radius-md);
}

.step-adv__error {
  font-size: var(--font-size-xs);
  color: var(--color-accent-fear);
  margin: 0;
}

.step-adv__error + .step-adv__error { margin-top: 4px; }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
