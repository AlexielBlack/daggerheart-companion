<template>
  <article
    class="community-card"
    :class="{ 'community-card--expanded': isExpanded }"
    role="listitem"
  >
    <!-- ═══ En-tête cliquable ═══ -->
    <button
      class="community-card__header"
      :aria-expanded="isExpanded"
      :aria-controls="`community-details-${community.id}`"
      @click="$emit('toggle', community.id)"
    >
      <span
        class="community-card__emoji"
        aria-hidden="true"
      >{{ community.emoji }}</span>
      <div class="community-card__meta">
        <span class="community-card__name">
          {{ community.name }}
          <SourceBadge :source="community.source" />
        </span>
        <span class="community-card__feature-name">{{ community.feature.name }}</span>
      </div>
      <span
        class="community-card__chevron"
        :class="{ 'community-card__chevron--open': isExpanded }"
        aria-hidden="true"
      >▼</span>
    </button>

    <!-- ═══ Corps dépliable ═══ -->
    <div
      :id="`community-details-${community.id}`"
      class="community-card__body"
      :hidden="!isExpanded"
    >
      <!-- Description -->
      <p class="community-card__description">
        {{ community.description }}
      </p>

      <!-- Feature de communauté -->
      <div
        class="community-feature"
        role="region"
        :aria-label="`Feature : ${community.feature.name}`"
      >
        <header class="community-feature__header">
          <h3 class="community-feature__name">
            ✨ {{ community.feature.name }}
          </h3>
        </header>
        <p class="community-feature__desc">
          {{ community.feature.description }}
        </p>
      </div>

      <!-- Phrase exemple (flavor) -->
      <blockquote
        v-if="community.flavor"
        class="community-card__flavor"
      >
        <p>« {{ community.flavor }} »</p>
      </blockquote>

      <!-- Adjectifs de personnalité -->
      <div
        class="community-adjectives"
        role="region"
        :aria-label="`Adjectifs de personnalité pour ${community.name}`"
      >
        <span class="community-adjectives__label">Adjectifs suggérés :</span>
        <div class="community-adjectives__row">
          <span
            v-for="adj in community.adjectives"
            :key="adj"
            class="adjective-tag"
          >{{ adj }}</span>
        </div>
      </div>

      <!-- Dupliquer en homebrew -->
      <button
        class="btn btn--secondary btn--sm community-card__duplicate-btn"
        @click.stop="$emit('duplicate', community)"
      >
        ✎ Dupliquer en homebrew
      </button>
    </div>
  </article>
</template>

<script>
import SourceBadge from '@core/components/SourceBadge.vue'

export default {
  name: 'CommunityCard',
  components: { SourceBadge },

  props: {
    community: {
      type: Object,
      required: true,
      validator: (c) =>
        c &&
        typeof c.id === 'string' &&
        typeof c.name === 'string' &&
        c.feature &&
        typeof c.feature.name === 'string' &&
        Array.isArray(c.adjectives)
    },
    isExpanded: {
      type: Boolean,
      default: false
    }
  },

  emits: ['toggle', 'duplicate']
}
</script>

<style scoped>
.community-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.community-card--expanded {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
}

/* ── Header ── */
.community-card__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast);
}

.community-card__header:hover {
  background: var(--color-bg-surface);
}

.community-card__header:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: -2px;
}

.community-card__emoji {
  font-size: 1.5rem;
  width: 2rem;
  text-align: center;
  flex-shrink: 0;
}

.community-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.community-card__name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
}

.community-card__feature-name {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
  opacity: 0.85;
}

.community-card__chevron {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.community-card__chevron--open {
  transform: rotate(180deg);
}

/* ── Corps ── */
.community-card__body {
  border-top: 1px solid var(--color-border);
  padding: var(--space-md);
  animation: slideDown 0.2s ease;
}

.community-card__body[hidden] {
  display: none;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.community-card__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
  line-height: 1.6;
}

/* ── Feature ── */
.community-feature {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-hope);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
}

.community-feature__header {
  margin-bottom: var(--space-xs);
}

.community-feature__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-accent-hope);
}

.community-feature__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.6;
}

/* ── Flavor ── */
.community-card__flavor {
  border: none;
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin: 0 0 var(--space-md);
  font-style: italic;
}

.community-card__flavor p {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Adjectifs ── */
.community-adjectives__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: var(--space-xs);
}

.community-adjectives__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.adjective-tag {
  font-size: var(--font-size-xs);
  padding: 2px var(--space-sm);
  background: rgba(83, 168, 182, 0.1);
  border: 1px solid rgba(83, 168, 182, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-accent-hope);
  text-transform: capitalize;
}

.community-card__duplicate-btn {
  margin-top: var(--space-md);
  width: 100%;
}
</style>
