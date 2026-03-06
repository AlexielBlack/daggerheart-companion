<template>
  <div
    class="class-picker"
    role="dialog"
    aria-label="Choisir une classe"
  >
    <h3 class="picker-title">
      Nouveau personnage
    </h3>
    <p class="picker-subtitle">
      Choisissez une classe pour commencer.
    </p>
    <ul
      class="class-list"
      role="listbox"
      aria-label="Classes disponibles"
    >
      <!-- ═══ Classes SRD ═══ -->
      <li
        v-for="cls in srdClasses"
        :key="cls.id"
        class="class-card"
        role="option"
        :aria-selected="false"
        tabindex="0"
        :aria-label="`${cls.name} — Domaines: ${cls.domains.join(' & ')}, Évasion ${cls.baseEvasion}, HP ${cls.baseHP}`"
        @click="$emit('select', cls.id)"
        @keydown.enter="$emit('select', cls.id)"
        @keydown.space.prevent="$emit('select', cls.id)"
      >
        <span class="class-card__emoji">{{ cls.emoji }}</span>
        <div class="class-card__info">
          <span class="class-card__name">{{ cls.name }}</span>
          <span class="class-card__domains">{{ cls.domains.join(' & ') }}</span>
        </div>
        <div class="class-card__stats">
          <span
            class="stat-badge"
            title="Évasion de départ"
          >🛡️ {{ cls.baseEvasion }}</span>
          <span
            class="stat-badge"
            title="HP de départ"
          >❤️ {{ cls.baseHP }}</span>
        </div>
      </li>

      <!-- ═══ Séparateur homebrew ═══ -->
      <li
        v-if="homebrewClasses.length > 0"
        class="class-separator"
        aria-hidden="true"
      >
        🛠️ Classes homebrew
      </li>

      <!-- ═══ Classes homebrew ═══ -->
      <li
        v-for="cls in homebrewClasses"
        :key="cls.id"
        class="class-card class-card--homebrew"
        role="option"
        :aria-selected="false"
        tabindex="0"
        :aria-label="`${cls.name} (homebrew) — Domaines: ${(cls.domains || []).join(' & ')}, Évasion ${cls.baseEvasion}, HP ${cls.baseHP}`"
        @click="$emit('select', cls.id)"
        @keydown.enter="$emit('select', cls.id)"
        @keydown.space.prevent="$emit('select', cls.id)"
      >
        <span class="class-card__emoji">{{ cls.emoji || '🛠️' }}</span>
        <div class="class-card__info">
          <span class="class-card__name">{{ cls.name }}</span>
          <span class="class-card__domains">{{ (cls.domains || []).join(' & ') }}</span>
        </div>
        <div class="class-card__stats">
          <span
            class="stat-badge"
            title="Évasion de départ"
          >🛡️ {{ cls.baseEvasion }}</span>
          <span
            class="stat-badge"
            title="HP de départ"
          >❤️ {{ cls.baseHP }}</span>
        </div>
      </li>
    </ul>
    <button
      class="cancel-btn"
      @click="$emit('cancel')"
    >
      Annuler
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useCharacterStore } from '../stores/characterStore'

export default {
  name: 'ClassPicker',
  emits: ['select', 'cancel'],
  setup() {
    const store = useCharacterStore()

    const srdClasses = computed(() =>
      store.allClasses.filter((c) => c.source !== 'custom')
    )
    const homebrewClasses = computed(() =>
      store.allClasses.filter((c) => c.source === 'custom')
    )

    return { srdClasses, homebrewClasses }
  }
}
</script>

<style scoped>
.class-picker {
  padding: var(--space-md);
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 8px;
}

.picker-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  margin: 0 0 var(--space-xs);
  color: var(--color-text-primary);
}

.picker-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted, #6b7280);
  margin: 0 0 var(--space-md);
}

.class-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.class-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.class-card:hover,
.class-card:focus-visible {
  border-color: var(--color-accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.08);
}

.class-card:focus-visible { outline: 2px solid var(--color-accent-hope, #53a8b6); outline-offset: 2px; }

.class-card--homebrew {
  border-left: 3px solid #eab308;
}

.class-card__emoji { font-size: 1.5rem; }

.class-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.class-card__name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.class-card__domains {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
}

.class-card__stats {
  display: flex;
  gap: var(--space-xs);
}

.stat-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  background: var(--color-bg-secondary, #1f1f3a);
  border-radius: 4px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.class-separator {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #eab308;
  padding: var(--space-xs) 0;
  border-top: 1px dashed rgba(234, 179, 8, 0.3);
  margin-top: var(--space-xs);
}

.cancel-btn {
  display: block;
  width: 100%;
  margin-top: var(--space-md);
  padding: var(--space-xs) var(--space-md);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
}

.cancel-btn:hover { border-color: var(--color-text-secondary); }
</style>
