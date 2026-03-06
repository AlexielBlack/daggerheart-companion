<template>
  <div
    class="homebrew-card card"
    :class="{ 'homebrew-card--selected': selected }"
    role="article"
    :aria-label="item.name"
  >
    <!-- Clickable area -->
    <button
      type="button"
      class="homebrew-card__click-area"
      :aria-label="`Sélectionner ${item.name}`"
      @click="$emit('select', item.id)"
      @keydown.enter="$emit('select', item.id)"
      @keydown.space.prevent="$emit('select', item.id)"
    >
      <span class="sr-only">Sélectionner</span>
    </button>
    <!-- Top bar: badge + source -->
    <div class="homebrew-card__top">
      <span
        v-if="tierBadge"
        class="badge"
        :class="tierBadge.class"
      >
        {{ tierBadge.text }}
      </span>
      <span
        v-if="item.type"
        class="homebrew-card__type"
      >
        {{ item.type }}
      </span>
      <span
        class="homebrew-card__source"
        :class="`homebrew-card__source--${item.source || 'custom'}`"
      >
        {{ item.source === 'custom' ? '✎ Custom' : '📖 SRD' }}
      </span>
    </div>

    <!-- Nom -->
    <h3 class="homebrew-card__name">
      {{ item.name }}
    </h3>

    <!-- Description (tronquée) -->
    <p
      v-if="item.description"
      class="homebrew-card__desc"
    >
      {{ truncatedDescription }}
    </p>

    <!-- Slot pour stats spécifiques à la catégorie -->
    <div
      v-if="$slots.stats"
      class="homebrew-card__stats"
    >
      <slot name="stats"></slot>
    </div>

    <!-- Métadonnées -->
    <div class="homebrew-card__meta">
      <time
        v-if="item.updatedAt"
        class="homebrew-card__date"
        :datetime="item.updatedAt"
        :title="`Mis à jour le ${formatDate(item.updatedAt)}`"
      >
        {{ formatDate(item.updatedAt) }}
      </time>
    </div>

    <!-- Actions (edit, duplicate, delete) -->
    <div
      v-if="showActions"
      class="homebrew-card__actions"
      @click.stop
    >
      <button
        type="button"
        class="homebrew-card__action-btn"
        aria-label="Modifier"
        title="Modifier"
        @click="$emit('edit', item.id)"
      >
        ✏️
      </button>
      <button
        type="button"
        class="homebrew-card__action-btn"
        aria-label="Dupliquer"
        title="Dupliquer"
        @click="$emit('duplicate', item.id)"
      >
        📋
      </button>
      <button
        type="button"
        class="homebrew-card__action-btn homebrew-card__action-btn--danger"
        aria-label="Supprimer"
        title="Supprimer"
        @click="$emit('delete', item.id)"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script>
/**
 * @component HomebrewCard
 * @description Carte d'aperçu générique pour tout item homebrew.
 * Affiche les champs communs (nom, description, tier, type, source, date)
 * et un slot `stats` pour les données spécifiques à la catégorie.
 */
const MAX_DESC_LENGTH = 100

export default {
  name: 'HomebrewCard',

  props: {
    /** Objet item homebrew complet */
    item: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.name === 'string'
      }
    },
    /** Carte actuellement sélectionnée */
    selected: {
      type: Boolean,
      default: false
    },
    /** Afficher les boutons d'action (éditer, dupliquer, supprimer) */
    showActions: {
      type: Boolean,
      default: true
    }
  },

  emits: ['select', 'edit', 'duplicate', 'delete'],

  computed: {
    truncatedDescription() {
      if (!this.item.description) return ''
      if (this.item.description.length <= MAX_DESC_LENGTH) return this.item.description
      return this.item.description.slice(0, MAX_DESC_LENGTH).trim() + '…'
    },

    tierBadge() {
      if (this.item.tier === undefined || this.item.tier === null) return null
      return {
        text: `T${this.item.tier}`,
        class: `badge--tier${this.item.tier}`
      }
    }
  },

  methods: {
    formatDate(isoString) {
      if (!isoString) return ''
      try {
        return new Date(isoString).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      } catch {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.homebrew-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  text-align: left;
  width: 100%;
  position: relative;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.homebrew-card__click-area {
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
}

.homebrew-card:hover {
  border-color: var(--color-accent-hope);
}

.homebrew-card__click-area:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 2px;
}

.homebrew-card--selected {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope), var(--shadow-md);
}

.homebrew-card__top {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.homebrew-card__type {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.homebrew-card__source {
  font-size: var(--font-size-xs);
  margin-left: auto;
}

.homebrew-card__source--custom {
  color: var(--color-accent-gold);
}

.homebrew-card__source--srd {
  color: var(--color-text-muted);
}

.homebrew-card__name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.homebrew-card__desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--line-height-normal);
}

.homebrew-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.homebrew-card__meta {
  margin-top: auto;
}

.homebrew-card__date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Actions overlay */
.homebrew-card__actions {
  display: none;
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  gap: var(--space-xs);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xs);
  z-index: 2;
}

.homebrew-card:hover .homebrew-card__actions,
.homebrew-card:focus-within .homebrew-card__actions {
  display: flex;
}

.homebrew-card__action-btn {
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
  display: inline-flex;
  align-items: center;
}

.homebrew-card__action-btn:hover {
  background-color: var(--color-bg-elevated);
}

.homebrew-card__action-btn--danger:hover {
  background-color: rgba(244, 67, 54, 0.15);
}
</style>
