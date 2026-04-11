<template>
  <!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
  <Teleport to="body">
    <div
      v-if="visible"
      class="qam__backdrop"
      @click.self="$emit('close')"
    >
      <!-- eslint-enable -->
      <div
        class="qam__menu"
        :style="menuStyle"
        role="menu"
        :aria-label="'Actions rapides — ' + entityName"
      >
        <div class="qam__header">
          <span class="qam__pc-name">{{ entityName }}</span>
          <button
            class="qam__close"
            aria-label="Fermer"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <!-- Dégâts rapides -->
        <div class="qam__section">
          <span class="qam__section-label">❤️ Dégâts</span>
          <div class="qam__row">
            <button
              class="qam__btn qam__btn--danger"
              @click="$emit('action', { type: 'damage', amount: 1 })"
            >
              +1
            </button>
            <button
              class="qam__btn qam__btn--danger"
              @click="$emit('action', { type: 'damage', amount: 2 })"
            >
              +2
            </button>
            <button
              class="qam__btn qam__btn--danger"
              @click="$emit('action', { type: 'damage', amount: 3 })"
            >
              +3
            </button>
            <button
              class="qam__btn qam__btn--heal"
              @click="$emit('action', { type: 'heal', amount: 1 })"
            >
              −1
            </button>
          </div>
        </div>

        <!-- Stress -->
        <div class="qam__section">
          <span class="qam__section-label">💢 Stress</span>
          <div class="qam__row">
            <button
              class="qam__btn qam__btn--stress"
              @click="$emit('action', { type: 'stress', amount: 1 })"
            >
              +1
            </button>
            <button
              class="qam__btn qam__btn--heal"
              @click="$emit('action', { type: 'heal-stress', amount: 1 })"
            >
              −1
            </button>
          </div>
        </div>

        <!-- Armure (PJ uniquement) -->
        <div
          v-if="entityType === 'pc'"
          class="qam__section"
        >
          <div class="qam__row">
            <button
              class="qam__btn qam__btn--armor"
              @click="$emit('action', { type: 'armor' })"
            >
              🛡️ Utiliser
            </button>
            <button
              class="qam__btn qam__btn--heal"
              @click="$emit('action', { type: 'restore-armor' })"
            >
              🛡️ Regagner
            </button>
            <button
              class="qam__btn qam__btn--down"
              @click="$emit('action', { type: 'down' })"
            >
              💀 À terre
            </button>
          </div>
        </div>

        <!-- Vaincre / Réanimer (Adversaire uniquement) -->
        <div
          v-if="entityType === 'adversary'"
          class="qam__section"
        >
          <div class="qam__row">
            <button
              class="qam__btn qam__btn--down"
              @click="$emit('action', { type: 'defeat' })"
            >
              💀 Vaincre
            </button>
            <button
              class="qam__btn qam__btn--heal"
              @click="$emit('action', { type: 'revive' })"
            >
              💚 Réanimer
            </button>
          </div>
        </div>

        <!-- Conditions -->
        <div class="qam__section">
          <span class="qam__section-label">Conditions</span>
          <div class="qam__row">
            <button
              v-for="cond in conditions"
              :key="cond.id"
              class="qam__btn qam__btn--cond"
              :class="{ 'qam__btn--cond-on': activeConditions.includes(cond.id) }"
              :title="cond.label"
              @click="$emit('action', { type: 'condition', conditionId: cond.id })"
            >
              {{ cond.emoji }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { LIVE_CONDITIONS } from '@data/encounters/liveConstants'

export default {
  name: 'QuickActionMenu',

  props: {
    visible: { type: Boolean, default: false },
    entityName: { type: String, default: '' },
    entityType: { type: String, default: 'pc' },
    activeConditions: { type: Array, default: () => [] },
    anchorX: { type: Number, default: 0 },
    anchorY: { type: Number, default: 0 }
  },

  emits: ['close', 'action'],

  computed: {
    conditions() {
      return LIVE_CONDITIONS
    },
    menuStyle() {
      return {
        top: Math.min(this.anchorY, window.innerHeight - 320) + 'px',
        left: Math.min(this.anchorX, window.innerWidth - 240) + 'px'
      }
    }
  }
}
</script>

<style scoped>
.qam__backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.3);
}

.qam__menu {
  position: absolute;
  width: 220px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.qam__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}

.qam__pc-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.qam__close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.qam__close:hover { background: var(--color-bg-elevated); }

.qam__section-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-bold);
}

.qam__section {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.qam__row {
  display: flex;
  gap: 3px;
}

.qam__btn {
  flex: 1;
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  touch-action: manipulation;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}

.qam__btn:active { transform: scale(0.95); }

.qam__btn--danger { background: rgba(244, 67, 54, 0.15); color: var(--color-accent-danger); border-color: rgba(244, 67, 54, 0.3); }
.qam__btn--danger:hover { background: rgba(244, 67, 54, 0.25); }

.qam__btn--heal { background: rgba(76, 175, 80, 0.15); color: var(--color-accent-success); border-color: rgba(76, 175, 80, 0.3); }
.qam__btn--heal:hover { background: rgba(76, 175, 80, 0.25); }

.qam__btn--stress { background: rgba(124, 58, 237, 0.15); color: var(--color-fh-fear); border-color: rgba(124, 58, 237, 0.3); }
.qam__btn--stress:hover { background: rgba(124, 58, 237, 0.25); }

.qam__btn--armor { background: rgba(83, 168, 182, 0.15); color: var(--color-accent-hope); border-color: rgba(83, 168, 182, 0.3); }
.qam__btn--armor:hover { background: rgba(83, 168, 182, 0.25); }

.qam__btn--down { background: rgba(244, 67, 54, 0.1); color: var(--color-text-secondary); }
.qam__btn--down:hover { background: rgba(244, 67, 54, 0.2); }

.qam__btn--cond { flex: 0 0 auto; min-width: var(--touch-min); }
.qam__btn--cond-on { background: rgba(244, 67, 54, 0.2); border-color: var(--color-accent-danger); }
</style>
