<template>
  <div
    class="spt"
    role="radiogroup"
    aria-label="Mode de scène"
  >
    <!-- Bouton PJ Attaque -->
    <button
      class="spt__btn spt__btn--pc"
      :class="{ 'spt__btn--active': sceneMode === 'pcAttack' }"
      role="radio"
      :aria-checked="sceneMode === 'pcAttack'"
      aria-label="PJ Attaque"
      title="PJ Attaque — les PJ ont le projecteur"
      @click="setMode('pcAttack')"
    >
      <span class="spt__emoji">⚔️</span>
      <span class="spt__label">PJ</span>
    </button>

    <!-- Indicateur slider animé -->
    <div
      class="spt__track"
      :class="'spt__track--' + sceneMode"
      aria-hidden="true"
    >
      <div class="spt__thumb"></div>
    </div>

    <!-- Bouton Adversaire Attaque -->
    <button
      class="spt__btn spt__btn--adv"
      :class="{ 'spt__btn--active': sceneMode === 'adversaryAttack' }"
      role="radio"
      :aria-checked="sceneMode === 'adversaryAttack'"
      aria-label="Adversaire Attaque"
      title="Adversaire Attaque — le MJ a le projecteur"
      @click="setMode('adversaryAttack')"
    >
      <span class="spt__emoji">💀</span>
      <span class="spt__label">MJ</span>
    </button>

    <!-- Bouton Social (3e mode) -->
    <button
      class="spt__btn spt__btn--social"
      :class="{ 'spt__btn--active': sceneMode === 'social' }"
      role="radio"
      :aria-checked="sceneMode === 'social'"
      aria-label="Mode Social"
      title="Mode Social — négociation, persuasion"
      @click="setMode('social')"
    >
      <span class="spt__emoji">🗣️</span>
    </button>
  </div>
</template>

<script>
import { useHaptic } from '../composables/useHaptic'

export default {
  name: 'SpotlightToggle',
  props: {
    sceneMode: { type: String, required: true }
  },
  emits: ['update:sceneMode'],
  setup(props, { emit }) {
    const haptic = useHaptic()

    function setMode(mode) {
      if (mode === props.sceneMode) return
      haptic.swap()
      emit('update:sceneMode', mode)
    }

    return { setMode }
  }
}
</script>

<style scoped>
.spt {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2px;
  flex-shrink: 0;
}

/* ── Boutons ── */

.spt__btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: none;
  border-radius: calc(var(--radius-lg) - 2px);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  touch-action: manipulation;
  position: relative;
  z-index: 1;
  user-select: none;
}

.spt__btn:hover:not(.spt__btn--active) {
  background: var(--color-bg-elevated);
}

/* État actif PJ */
.spt__btn--pc.spt__btn--active {
  background: rgba(83, 168, 182, 0.2);
  color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
}

/* État actif Adversaire */
.spt__btn--adv.spt__btn--active {
  background: rgba(200, 75, 49, 0.2);
  color: var(--color-accent-fear);
  box-shadow: 0 0 0 1px var(--color-accent-fear);
}

/* État actif Social */
.spt__btn--social.spt__btn--active {
  background: rgba(8, 145, 178, 0.2);
  color: #0891b2;
  box-shadow: 0 0 0 1px #0891b2;
}

/* Bouton social plus compact (pas de label texte) */
.spt__btn--social {
  padding: var(--space-xs);
}

.spt__emoji {
  font-size: var(--font-size-md);
  line-height: 1;
}

.spt__label {
  line-height: 1;
  letter-spacing: 0.02em;
}

/* ── Track indicateur ── */

.spt__track {
  width: 1.5rem;
  height: 3px;
  border-radius: var(--radius-full);
  transition: background 0.25s;
  flex-shrink: 0;
}

.spt__track--pcAttack {
  background: var(--color-accent-hope);
}

.spt__track--adversaryAttack {
  background: var(--color-accent-fear);
}

.spt__track--social {
  background: #0891b2;
}

.spt__thumb {
  display: none;
}

/* ── Animation au changement ── */

.spt__btn--active .spt__emoji {
  animation: spt-pop 0.2s ease-out;
}

@keyframes spt-pop {
  0%   { transform: scale(0.8); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>
