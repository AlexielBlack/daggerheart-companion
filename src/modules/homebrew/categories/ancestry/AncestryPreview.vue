<template>
  <article
    class="ancestry-preview"
    role="region"
    :aria-label="`Aperçu ascendance : ${displayName}`"
  >
    <!-- En-tête -->
    <header class="ancestry-preview__header">
      <span
        v-if="data.emoji"
        class="ancestry-preview__emoji"
        aria-hidden="true"
      >{{ data.emoji }}</span>
      <div class="ancestry-preview__title-block">
        <h3 class="ancestry-preview__name">
          {{ displayName }}
        </h3>
        <span
          class="ancestry-preview__source"
          :class="{ 'ancestry-preview__source--custom': true }"
        >
          ✎ Custom
        </span>
      </div>
    </header>

    <!-- Description -->
    <p
      v-if="data.description"
      class="ancestry-preview__description"
    >
      {{ data.description }}
    </p>
    <p
      v-else
      class="ancestry-preview__empty"
    >
      Aucune description.
    </p>

    <!-- Features -->
    <div class="ancestry-preview__features">
      <!-- Top Feature -->
      <section
        class="ancestry-preview__feature ancestry-preview__feature--top"
        aria-label="Feature haute"
      >
        <div class="ancestry-preview__feature-header">
          <span
            class="ancestry-preview__feature-badge ancestry-preview__feature-badge--top"
            aria-hidden="true"
          >▲</span>
          <h4 class="ancestry-preview__feature-name">
            {{ topFeatureName }}
          </h4>
        </div>
        <p class="ancestry-preview__feature-desc">
          {{ topFeatureDescription }}
        </p>
      </section>

      <!-- Séparateur -->
      <hr
        class="ancestry-preview__divider"
        aria-hidden="true"
      />

      <!-- Bottom Feature -->
      <section
        class="ancestry-preview__feature ancestry-preview__feature--bottom"
        aria-label="Feature basse"
      >
        <div class="ancestry-preview__feature-header">
          <span
            class="ancestry-preview__feature-badge ancestry-preview__feature-badge--bottom"
            aria-hidden="true"
          >▼</span>
          <h4 class="ancestry-preview__feature-name">
            {{ bottomFeatureName }}
          </h4>
        </div>
        <p class="ancestry-preview__feature-desc">
          {{ bottomFeatureDescription }}
        </p>
      </section>
    </div>

    <!-- Mixed Ancestry note -->
    <footer class="ancestry-preview__footer">
      <p class="ancestry-preview__mixed-note">
        <em>Pour une ascendance mixte, combinez la Feature Haute d'une ascendance avec la Feature Basse d'une autre.</em>
      </p>
    </footer>
  </article>
</template>

<script>
/**
 * @component AncestryPreview
 * @description Aperçu en temps réel d'une ascendance homebrew.
 * Affiche le nom, emoji, description, et les deux features (top/bottom)
 * dans un format fidèle aux cartes SRD.
 */
export default {
  name: 'AncestryPreview',

  props: {
    /** Données du formulaire (objet partiel ou complet) */
    data: {
      type: Object,
      required: true
    }
  },

  computed: {
    displayName() {
      return this.data.name?.trim() || 'Nouvelle ascendance'
    },

    topFeatureName() {
      return this.data.topFeature?.name?.trim() || 'Feature haute'
    },

    topFeatureDescription() {
      return this.data.topFeature?.description?.trim() || 'Effet mécanique à définir…'
    },

    bottomFeatureName() {
      return this.data.bottomFeature?.name?.trim() || 'Feature basse'
    },

    bottomFeatureDescription() {
      return this.data.bottomFeature?.description?.trim() || 'Effet mécanique à définir…'
    }
  }
}
</script>

<style scoped>
.ancestry-preview {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.ancestry-preview__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.ancestry-preview__emoji {
  font-size: 2rem;
  line-height: 1;
}

.ancestry-preview__title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ancestry-preview__name {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.ancestry-preview__source {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
}

.ancestry-preview__source--custom {
  color: var(--color-accent-hope);
}

.ancestry-preview__description {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.ancestry-preview__empty {
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  font-style: italic;
  margin: 0;
}

.ancestry-preview__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.ancestry-preview__feature {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  border-left: 3px solid var(--color-border);
}

.ancestry-preview__feature--top {
  border-left-color: var(--color-accent-hope);
}

.ancestry-preview__feature--bottom {
  border-left-color: var(--color-accent-fear);
}

.ancestry-preview__feature-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.ancestry-preview__feature-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-inverse);
}

.ancestry-preview__feature-badge--top {
  background-color: var(--color-accent-hope);
}

.ancestry-preview__feature-badge--bottom {
  background-color: var(--color-accent-fear);
}

.ancestry-preview__feature-name {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.ancestry-preview__feature-desc {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.ancestry-preview__divider {
  border: none;
  border-top: 1px dashed var(--color-border);
  margin: 0;
}

.ancestry-preview__footer {
  margin-top: var(--space-xs);
}

.ancestry-preview__mixed-note {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
  margin: 0;
}
</style>
