<template>
  <Transition name="slide-up">
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      v-if="isOpen"
      class="action-bar"
      role="dialog"
      aria-label="Action en cours"
      :aria-modal="false"
      tabindex="-1"
      @keydown.escape="cancelAction"
      @keydown.enter="applyIfValid"
    >
      <!-- Ligne 1 : En-tête + boutons d'effet -->
      <div class="action-bar__header">
        <span class="action-bar__actor">{{ actorDisplayName }}</span>
        <button
          class="action-bar__cancel"
          aria-label="Annuler l'action"
          @click="cancelAction"
        >
          Annuler
        </button>
      </div>

      <div
        class="action-bar__effects"
        role="radiogroup"
        aria-label="Type d'effet"
      >
        <button
          v-for="effect in effectList"
          :key="effect.key"
          ref="effectBtns"
          role="radio"
          :aria-checked="String(pendingAction?.effect === effect.key)"
          :class="[
            'action-bar__effect-btn',
            { 'action-bar__effect-btn--active': pendingAction?.effect === effect.key }
          ]"
          @click="setEffect(effect.key)"
        >
          {{ effect.emoji }} {{ effect.label }}
        </button>
      </div>

      <!-- Ligne 2 : Sous-sélection de condition + raccourcis cibles + chips -->
      <div
        v-if="showConditions"
        class="action-bar__conditions"
        role="radiogroup"
        aria-label="Choix de condition"
      >
        <button
          v-for="cond in LIVE_CONDITIONS"
          :key="cond.id"
          role="radio"
          :aria-checked="String(pendingAction?.condition === cond.id)"
          :class="[
            'action-bar__effect-btn',
            { 'action-bar__effect-btn--active': pendingAction?.condition === cond.id }
          ]"
          @click="setCondition(cond.id)"
        >
          {{ cond.emoji }} {{ cond.label }}
        </button>
      </div>

      <div
        v-if="showTargets"
        class="action-bar__shortcuts"
      >
        <button
          class="action-bar__shortcut-btn"
          aria-label="Cibler soi-même"
          @click="selectSelf"
        >
          Self
        </button>
        <button
          class="action-bar__shortcut-btn"
          aria-label="Cibler tous les PJ"
          @click="selectAllPcs"
        >
          Tous PJ
        </button>
        <button
          class="action-bar__shortcut-btn"
          aria-label="Cibler tous les adversaires"
          @click="selectAllAdversaries"
        >
          Tous Adv.
        </button>
      </div>

      <div
        v-if="showTargets && hasTargets"
        class="action-bar__targets"
        role="list"
        aria-label="Cibles sélectionnées"
      >
        <span
          v-for="target in pendingAction.targets"
          :key="target.id"
          class="action-bar__chip"
          role="listitem"
        >
          {{ resolveTargetName(target) }}
          <input
            v-if="showAmounts && currentEffectMeta?.hasAmount"
            type="number"
            min="1"
            class="action-bar__chip-amount"
            :value="target.amount"
            :aria-label="'Montant pour ' + resolveTargetName(target)"
            @input="setTargetAmount(target.id, Number($event.target.value) || 1)"
          />
          <button
            class="action-bar__chip-remove"
            :aria-label="'Retirer ' + resolveTargetName(target)"
            @click="toggleTarget(target.id, target.type)"
          >
            &times;
          </button>
        </span>
      </div>

      <!-- Ligne 3 : Montants rapides + bouton Appliquer -->
      <div
        v-if="showAmounts"
        class="action-bar__amounts"
      >
        <template v-if="currentEffectMeta?.hasAmount">
          <button
            v-for="n in quickAmounts"
            :key="n"
            :class="[
              'action-bar__amount-btn',
              { 'action-bar__amount-btn--active': pendingAction?.defaultAmount === n }
            ]"
            :aria-label="'Montant rapide : ' + n"
            @click="setDefaultAmount(n)"
          >
            {{ n }}
          </button>
        </template>

        <button
          class="action-bar__apply"
          :aria-disabled="String(!canApply)"
          @click="applyIfValid"
        >
          Appliquer
        </button>
      </div>

      <!-- Bouton Appliquer pour MISS (pas de montant) -->
      <div
        v-if="pendingAction?.effect === ACTION_EFFECTS.MISS && !showAmounts"
        class="action-bar__amounts"
      >
        <button
          class="action-bar__apply"
          :aria-disabled="String(!canApply)"
          @click="applyIfValid"
        >
          Appliquer
        </button>
      </div>
    </div>
  </Transition>
</template>

<script>
// Composant ActionBar — bandeau flottant de ciblage d'actions en combat
import { useActionBar } from '../composables/useActionBar'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { ACTION_EFFECTS, ACTION_EFFECT_META } from '@data/encounters/actionEffects'
import { LIVE_CONDITIONS } from '@data/encounters/liveConstants'

export default {
  name: 'ActionBar',

  setup () {
    const actionBar = useActionBar()
    const liveStore = useEncounterLiveStore()
    return { ...actionBar, liveStore, ACTION_EFFECTS, ACTION_EFFECT_META, LIVE_CONDITIONS }
  },

  data () {
    return {
      // Montants rapides proposés dans la barre
      quickAmounts: [1, 2, 3, 5, 10]
    }
  },

  computed: {
    /** Liste des effets disponibles pour le radiogroup */
    effectList () {
      return Object.entries(this.ACTION_EFFECT_META).map(([key, meta]) => ({
        key,
        ...meta
      }))
    },

    /** Afficher le sous-groupe de conditions */
    showConditions () {
      return this.pendingAction?.effect === this.ACTION_EFFECTS.CONDITION
    },

    /** Métadonnées de l'effet actuellement sélectionné */
    currentEffectMeta () {
      if (!this.pendingAction?.effect) return null
      return this.ACTION_EFFECT_META[this.pendingAction.effect] || null
    },

    /** Afficher la ligne des montants et le bouton Appliquer */
    showAmounts () {
      const effect = this.pendingAction?.effect
      if (!effect) return false
      if (effect === this.ACTION_EFFECTS.MISS) return true
      return this.ACTION_EFFECT_META[effect]?.hasAmount && this.hasTargets
    },

    /** Afficher la zone de sélection des cibles */
    showTargets () {
      return this.pendingAction?.effect && this.pendingAction.effect !== this.ACTION_EFFECTS.MISS
    },

    /** Nom de l'acteur en cours pour l'en-tête */
    actorDisplayName () {
      if (!this.pendingAction) return ''
      return this.getActorName()
    }
  },

  watch: {
    /** Auto-focus le premier bouton d'effet à l'ouverture */
    isOpen (val) {
      if (val) {
        this.$nextTick(() => {
          const firstBtn = this.$refs.effectBtns?.[0]
          if (firstBtn) firstBtn.focus()
        })
      }
    }
  },

  methods: {
    /** Applique l'action si le formulaire est valide */
    applyIfValid () {
      if (this.canApply) this.applyAction()
    },

    /** Résout le nom d'affichage d'une cible */
    resolveTargetName (target) {
      if (target.type === 'pc') {
        const pc = this.liveStore.participantPcs?.find(p => p.id === target.id)
        return pc?.name || target.id
      }
      if (target.type === 'adversary') {
        const adv = this.liveStore.liveAdversaries?.find(a => a.instanceId === target.id)
        return adv?.name || target.id
      }
      return target.id
    }
  }
}
</script>

<style scoped>
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  background: var(--color-surface, #1a1a2e);
  border-top: 2px solid var(--color-accent, #a855f7);
  padding: 8px 12px;
}

.action-bar__effects {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.action-bar__effect-btn {
  padding: 4px 10px;
  border-radius: 16px;
  border: 1px solid transparent;
  background: var(--color-surface-alt, #333);
  color: var(--color-text, #e0e0e0);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}

.action-bar__effect-btn--active {
  background: var(--color-accent, #a855f7);
  color: white;
  border-color: white;
}

.action-bar__targets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.action-bar__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-success, #22c55e);
  background: rgba(34, 197, 94, 0.1);
  font-size: 0.8rem;
  color: var(--color-success, #22c55e);
}

.action-bar__chip-remove {
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
  opacity: 0.6;
  padding: 0 2px;
}

.action-bar__chip-amount {
  width: 32px;
  text-align: center;
  background: var(--color-surface-alt, #333);
  border: 1px solid var(--color-border, #555);
  border-radius: 2px;
  color: white;
  font-size: 0.75rem;
  padding: 1px 2px;
}

.action-bar__shortcuts {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.action-bar__shortcut-btn {
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-border, #555);
  background: transparent;
  color: var(--color-text-muted, #aaa);
  font-size: 0.75rem;
  cursor: pointer;
}

.action-bar__amounts {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}

.action-bar__amount-btn {
  padding: 2px 8px;
  border-radius: 4px;
  border: none;
  background: var(--color-surface-alt, #444);
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
}

.action-bar__amount-btn--active {
  background: var(--color-accent, #a855f7);
  font-weight: bold;
}

.action-bar__apply {
  padding: 6px 16px;
  border-radius: 6px;
  border: none;
  background: var(--color-success, #22c55e);
  color: #000;
  font-weight: bold;
  font-size: 0.9rem;
  cursor: pointer;
  margin-left: auto;
}

.action-bar__apply[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-bar__cancel {
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--color-border, #555);
  background: transparent;
  color: var(--color-text-muted, #aaa);
  font-size: 0.75rem;
  cursor: pointer;
}

.action-bar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.action-bar__actor {
  font-size: 0.8rem;
  color: var(--color-accent, #a855f7);
  font-weight: bold;
}

.action-bar__conditions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
