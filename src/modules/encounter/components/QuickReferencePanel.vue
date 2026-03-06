<template>
  <div class="qref">
    <!-- Bouton toggle -->
    <button
      type="button"
      class="qref__toggle"
      :aria-expanded="String(isOpen)"
      aria-controls="quick-ref-panel"
      aria-label="Référence rapide"
      @click="isOpen = !isOpen"
    >
      📖
    </button>

    <!-- Panneau flottant -->
    <Teleport to="body">
      <Transition name="qref-slide">
        <div
          v-if="isOpen"
          id="quick-ref-panel"
          class="qref__panel"
          role="dialog"
          aria-label="Référence rapide des règles"
        >
          <div class="qref__header">
            <h2 class="qref__title">
              📖 Référence rapide
            </h2>
            <button
              type="button"
              class="qref__close"
              aria-label="Fermer la référence rapide"
              @click="isOpen = false"
            >
              ✕
            </button>
          </div>

          <div class="qref__body">
            <details
              v-for="section in sections"
              :key="section.id"
              class="qref__section"
            >
              <summary class="qref__section-title">
                {{ section.emoji }} {{ section.title }}
              </summary>
              <dl class="qref__list">
                <template
                  v-for="item in section.items"
                  :key="item.term"
                >
                  <dt class="qref__term">
                    {{ item.term }}
                  </dt>
                  <dd class="qref__desc">
                    {{ item.description }}
                  </dd>
                </template>
              </dl>
            </details>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { QUICK_REFERENCE_SECTIONS } from '@data/encounters/quickReference'

/**
 * @component QuickReferencePanel
 * @description Panneau flottant de référence rapide pour les règles SRD.
 * Accessible via un bouton toggle, affiche les règles clés en sections collapsibles.
 */
export default {
  name: 'QuickReferencePanel',

  data() {
    return {
      isOpen: false,
      sections: QUICK_REFERENCE_SECTIONS
    }
  },

  watch: {
    isOpen(val) {
      if (val) {
        document.addEventListener('keydown', this.onEscape)
      } else {
        document.removeEventListener('keydown', this.onEscape)
      }
    }
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.onEscape)
  },

  methods: {
    onEscape(e) {
      if (e.key === 'Escape') {
        this.isOpen = false
      }
    }
  }
}
</script>

<style scoped>
.qref__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.qref__toggle:hover {
  background: rgba(255, 255, 255, 0.12);
}

.qref__toggle[aria-expanded="true"] {
  background: var(--color-accent-hope, #53a8b6);
  color: var(--color-bg-primary, #1a1a2e);
}

/* Panneau flottant */
.qref__panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 340px;
  max-width: 90vw;
  height: 100vh;
  background: var(--color-bg-primary, #1a1a2e);
  border-left: 1px solid var(--color-border, #3a3a5a);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.qref__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border, #3a3a5a);
  flex-shrink: 0;
}

.qref__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: var(--color-text-primary);
  margin: 0;
}

.qref__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
}

.qref__close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.qref__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
}

/* Sections */
.qref__section {
  margin-bottom: var(--space-xs);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  overflow: hidden;
}

.qref__section[open] {
  background: rgba(255, 255, 255, 0.02);
}

.qref__section-title {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
  list-style: none;
}

.qref__section-title::-webkit-details-marker {
  display: none;
}

.qref__section-title::before {
  content: '▸ ';
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  transition: transform 0.15s;
}

.qref__section[open] > .qref__section-title::before {
  content: '▾ ';
}

/* Liste de définitions */
.qref__list {
  padding: 0 var(--space-md) var(--space-sm);
  margin: 0;
}

.qref__term {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent-hope, #53a8b6);
  padding-top: var(--space-xs);
}

.qref__desc {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-xs);
  padding-left: var(--space-sm);
  line-height: 1.4;
}

/* Transition slide-in */
.qref-slide-enter-active,
.qref-slide-leave-active {
  transition: transform 0.2s ease;
}

.qref-slide-enter-from,
.qref-slide-leave-to {
  transform: translateX(100%);
}
</style>
