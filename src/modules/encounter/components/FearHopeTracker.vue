<template>
  <!-- ══ Mode compact (inline header) ══ -->
  <div
    v-if="compact"
    class="fh-compact"
    role="region"
    aria-label="Économie Fear et Hope"
  >
    <div class="fh-compact__group fh-compact__group--hope">
      <button
        type="button"
        class="fh-compact__btn"
        aria-label="Dépenser 1 Hope"
        :disabled="hope <= 0"
        @click="$emit('spend-hope')"
      >
        −
      </button>
      <span class="fh-compact__val fh-compact__val--hope">☀️ {{ hope }}</span>
      <button
        type="button"
        class="fh-compact__btn"
        aria-label="Ajouter 1 Hope"
        @click="$emit('add-hope')"
      >
        +
      </button>
    </div>
    <div class="fh-compact__group fh-compact__group--fear">
      <button
        type="button"
        class="fh-compact__btn"
        aria-label="Dépenser 1 Fear"
        :disabled="fear <= 0"
        @click="$emit('spend-fear')"
      >
        −
      </button>
      <span class="fh-compact__val fh-compact__val--fear">🌙 {{ fear }}</span>
      <button
        type="button"
        class="fh-compact__btn"
        aria-label="Ajouter 1 Fear"
        @click="$emit('add-fear')"
      >
        +
      </button>
    </div>
  </div>

  <!-- ══ Mode complet (panneau) ══ -->
  <div
    v-else
    class="fh"
    role="region"
    aria-label="Économie Fear et Hope"
  >
    <!-- Rangée Hope -->
    <div class="fh__row fh__row--hope">
      <span class="fh__label">☀️ Hope</span>
      <div
        class="fh__tokens"
        aria-label="Tokens Hope"
      >
        <span
          v-for="i in Math.min(hope, 12)"
          :key="'h' + i"
          class="fh__token fh__token--hope fh__token--filled"
        ></span>
        <span
          v-if="hope > 12"
          class="fh__token-overflow"
        >{{ hope }}</span>
      </div>
      <div class="fh__controls">
        <button
          type="button"
          class="fh__btn fh__btn--minus"
          aria-label="Dépenser 1 Hope"
          :disabled="hope <= 0"
          @click="$emit('spend-hope')"
        >
          −
        </button>
        <span class="fh__count">{{ hope }}</span>
        <button
          type="button"
          class="fh__btn fh__btn--plus"
          aria-label="Ajouter 1 Hope"
          @click="$emit('add-hope')"
        >
          +
        </button>
      </div>
      <span
        class="fh__spent"
        title="Hope dépensés"
      >{{ hopeSpent }} dép.</span>
    </div>

    <!-- Rangée Fear -->
    <div class="fh__row fh__row--fear">
      <span class="fh__label">🌙 Fear</span>
      <div
        class="fh__tokens"
        aria-label="Tokens Fear"
      >
        <span
          v-for="i in Math.min(fear, 12)"
          :key="'f' + i"
          class="fh__token fh__token--fear fh__token--filled"
        ></span>
        <span
          v-if="fear > 12"
          class="fh__token-overflow"
        >{{ fear }}</span>
      </div>
      <div class="fh__controls">
        <button
          type="button"
          class="fh__btn fh__btn--minus"
          aria-label="Dépenser 1 Fear"
          :disabled="fear <= 0"
          @click="$emit('spend-fear')"
        >
          −
        </button>
        <span class="fh__count">{{ fear }}</span>
        <button
          type="button"
          class="fh__btn fh__btn--plus"
          aria-label="Ajouter 1 Fear"
          @click="$emit('add-fear')"
        >
          +
        </button>
      </div>
      <span
        class="fh__spent"
        title="Fear dépensés"
      >{{ fearSpent }} dép.</span>
    </div>

    <!-- Résultats de jet rapides -->
    <div class="fh__rolls">
      <span class="fh__rolls-label">Jet :</span>
      <button
        v-for="r in rollResults"
        :key="r.id"
        type="button"
        class="fh__roll-btn"
        :title="r.label"
        :aria-label="'Résultat ' + r.label"
        @click="$emit('roll-result', r.id)"
      >
        {{ r.emoji }} {{ r.short }}
      </button>
    </div>
  </div>
</template>

<script>
import { ROLL_RESULTS } from '@data/encounters/liveConstants'

/**
 * FearHopeTracker — Affiche l'économie Fear/Hope de Daggerheart.
 * Composant présentationnel : aucune logique métier, uniquement des emits.
 * Les tokens sont affichés comme des cercles remplis (max 12 visibles),
 * avec un affichage numérique si le total dépasse 12.
 */
export default {
  name: 'FearHopeTracker',

  props: {
    /** Nombre actuel de tokens Fear */
    fear: { type: Number, default: 0 },
    /** Nombre actuel de tokens Hope */
    hope: { type: Number, default: 0 },
    /** Total de Fear dépensés durant la rencontre */
    fearSpent: { type: Number, default: 0 },
    /** Total de Hope dépensés durant la rencontre */
    hopeSpent: { type: Number, default: 0 },
    /** Mode compact pour affichage inline (ex: dans le header) */
    compact: { type: Boolean, default: false }
  },

  emits: ['add-fear', 'spend-fear', 'add-hope', 'spend-hope', 'roll-result'],

  data() {
    return {
      /** Résultats de jet possibles (depuis les constantes SRD) */
      rollResults: ROLL_RESULTS
    }
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════
   FearHopeTracker — économie Fear/Hope
   ═══════════════════════════════════════════════════════════ */

.fh {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

/* ── Rangée (Hope / Fear) ── */

.fh__row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) 0;
}

.fh__label {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-bold, 700);
  min-width: 5rem;
  white-space: nowrap;
}

.fh__row--hope .fh__label {
  color: var(--color-accent-hope, #53a8b6);
}

.fh__row--fear .fh__label {
  color: var(--color-fh-fear, #7c3aed);
}

/* ── Tokens (cercles remplis) ── */

.fh__tokens {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  min-height: 16px;
}

.fh__token {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: opacity var(--transition-fast, 150ms ease);
}

.fh__token--hope.fh__token--filled {
  background: var(--color-accent-hope, #53a8b6);
}

.fh__token--fear.fh__token--filled {
  background: var(--color-fh-fear, #7c3aed);
}

.fh__token-overflow {
  font-size: var(--font-size-xs, 0.75rem);
  font-weight: var(--font-weight-bold, 700);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary, #a0a0b8);
  margin-left: var(--space-xs, 0.25rem);
}

/* ── Contrôles ± ── */

.fh__controls {
  display: flex;
  align-items: center;
  gap: 2px;
}

.fh__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--color-border, #2a2a4a);
  border-radius: var(--radius-sm, 4px);
  background: transparent;
  color: var(--color-text-secondary, #a0a0b8);
  font-size: var(--font-size-sm, 0.875rem);
  cursor: pointer;
  transition: background var(--transition-fast, 150ms ease);
  touch-action: manipulation;
  line-height: 1;
}

.fh__btn:hover:not(:disabled) {
  background: var(--color-bg-elevated, #1a3a6a);
}

.fh__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.fh__row--hope .fh__btn--plus {
  border-color: var(--color-accent-hope, #53a8b6);
  color: var(--color-accent-hope, #53a8b6);
}

.fh__row--hope .fh__btn--plus:hover:not(:disabled) {
  background: rgba(83, 168, 182, 0.15);
}

.fh__row--fear .fh__btn--plus {
  border-color: var(--color-fh-fear, #7c3aed);
  color: var(--color-fh-fear, #7c3aed);
}

.fh__row--fear .fh__btn--plus:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.15);
}

.fh__count {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-bold, 700);
  font-variant-numeric: tabular-nums;
  min-width: 1.5rem;
  text-align: center;
  color: var(--color-text-primary, #e8e8f0);
}

/* ── Compteur de dépenses ── */

.fh__spent {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #6a6a80);
  white-space: nowrap;
}

/* ── Résultats de jet rapides ── */

.fh__rolls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  padding-top: var(--space-xs, 0.25rem);
  border-top: 1px solid var(--color-border, #2a2a4a);
}

.fh__rolls-label {
  font-size: var(--font-size-xs, 0.75rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-muted, #6a6a80);
}

.fh__roll-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border: 1px solid var(--color-border, #2a2a4a);
  border-radius: var(--radius-sm, 4px);
  background: transparent;
  color: var(--color-text-secondary, #a0a0b8);
  font-size: var(--font-size-xs, 0.75rem);
  cursor: pointer;
  transition: background var(--transition-fast, 150ms ease);
  touch-action: manipulation;
  white-space: nowrap;
}

.fh__roll-btn:hover {
  background: var(--color-bg-elevated, #1a3a6a);
  border-color: var(--color-border-active, #53a8b6);
}

/* ═══════════════════════════════════════════════════════════
   Mode compact — inline dans le header
   ═══════════════════════════════════════════════════════════ */

.fh-compact {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 0.5rem);
}

.fh-compact__group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.fh-compact__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border, #2a2a4a);
  border-radius: var(--radius-sm, 4px);
  background: transparent;
  color: var(--color-text-secondary, #a0a0b8);
  font-size: var(--font-size-sm, 0.875rem);
  cursor: pointer;
  touch-action: manipulation;
  line-height: 1;
  transition: background var(--transition-fast, 150ms ease);
}

.fh-compact__btn:hover:not(:disabled) {
  background: var(--color-bg-elevated, #1a3a6a);
}

.fh-compact__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.fh-compact__val {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: var(--font-weight-bold, 700);
  font-variant-numeric: tabular-nums;
  min-width: 2.5rem;
  text-align: center;
  white-space: nowrap;
}

.fh-compact__val--hope { color: var(--color-accent-hope, #53a8b6); }
.fh-compact__val--fear { color: var(--color-fh-fear, #7c3aed); }

.fh-compact__group--hope .fh-compact__btn:last-child {
  border-color: var(--color-accent-hope, #53a8b6);
  color: var(--color-accent-hope, #53a8b6);
}

.fh-compact__group--fear .fh-compact__btn:last-child {
  border-color: var(--color-fh-fear, #7c3aed);
  color: var(--color-fh-fear, #7c3aed);
}
</style>
