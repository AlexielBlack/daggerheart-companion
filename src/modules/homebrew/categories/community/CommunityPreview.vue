<template>
  <article
    class="community-preview"
    role="region"
    :aria-label="`Aperçu communauté : ${displayName}`"
  >
    <!-- En-tête -->
    <header class="community-preview__header">
      <span
        v-if="data.emoji"
        class="community-preview__emoji"
        aria-hidden="true"
      >{{ data.emoji }}</span>
      <div class="community-preview__title-block">
        <h3 class="community-preview__name">
          {{ displayName }}
        </h3>
        <span class="community-preview__source community-preview__source--custom">
          ✎ Custom
        </span>
      </div>
    </header>

    <!-- Description -->
    <p
      v-if="data.description"
      class="community-preview__description"
    >
      {{ data.description }}
    </p>
    <p
      v-else
      class="community-preview__empty"
    >
      Aucune description.
    </p>

    <!-- Feature mécanique -->
    <section
      class="community-preview__feature"
      aria-label="Feature de communauté"
    >
      <div class="community-preview__feature-header">
        <h4 class="community-preview__feature-name">
          {{ featureName }}
        </h4>
      </div>
      <p class="community-preview__feature-desc">
        {{ featureDescription }}
      </p>
    </section>

    <!-- Adjectifs -->
    <section
      v-if="displayAdjectives.length > 0"
      class="community-preview__adjectives"
      aria-label="Adjectifs suggérés"
    >
      <h4 class="community-preview__section-title">
        Adjectifs suggérés
      </h4>
      <ul class="community-preview__adjective-list">
        <li
          v-for="adj in displayAdjectives"
          :key="adj"
          class="community-preview__adjective-chip"
        >
          {{ adj }}
        </li>
      </ul>
    </section>

    <!-- Phrase d'exemple (flavor) -->
    <footer
      v-if="data.flavor"
      class="community-preview__flavor"
    >
      <blockquote class="community-preview__flavor-text">
        « {{ data.flavor }} »
      </blockquote>
    </footer>
  </article>
</template>

<script>
/**
 * @component CommunityPreview
 * @description Aperçu en temps réel d'une communauté homebrew.
 * Affiche le nom, emoji, description, feature mécanique,
 * adjectifs de personnalité et phrase flavor.
 */
export default {
  name: 'CommunityPreview',

  props: {
    /** Données du formulaire (objet partiel ou complet) */
    data: {
      type: Object,
      required: true
    }
  },

  computed: {
    displayName() {
      return this.data.name?.trim() || 'Nouvelle communauté'
    },

    featureName() {
      return this.data.feature?.name?.trim() || 'Feature'
    },

    featureDescription() {
      return this.data.feature?.description?.trim() || 'Effet mécanique à définir…'
    },

    displayAdjectives() {
      if (!Array.isArray(this.data.adjectives)) return []
      return this.data.adjectives.filter((a) => a && a.trim())
    }
  }
}
</script>

<style scoped>
.community-preview {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.community-preview__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.community-preview__emoji {
  font-size: 2rem;
  line-height: 1;
}

.community-preview__title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.community-preview__name {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.community-preview__source {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.community-preview__source--custom {
  color: var(--color-accent-hope);
}

.community-preview__description {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.community-preview__empty {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  font-style: italic;
  margin: 0;
}

.community-preview__feature {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-hope);
}

.community-preview__feature-header {
  margin-bottom: var(--space-xs);
}

.community-preview__feature-name {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.community-preview__feature-desc {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.community-preview__adjectives {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.community-preview__section-title {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.community-preview__adjective-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  list-style: none;
  padding: 0;
  margin: 0;
}

.community-preview__adjective-chip {
  display: inline-block;
  padding: 2px var(--space-sm);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.community-preview__flavor {
  margin-top: var(--space-xs);
}

.community-preview__flavor-text {
  font-size: var(--font-sm);
  font-style: italic;
  color: var(--color-text-tertiary);
  margin: 0;
  padding-left: var(--space-sm);
  border-left: 2px solid var(--color-border);
}
</style>
