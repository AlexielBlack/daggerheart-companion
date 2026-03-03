<template>
  <section
    class="env-preview"
    :class="[`env-preview--tier${tierValue}`]"
    :aria-label="`Aperçu environnement : ${data.name || 'Sans nom'}`"
  >
    <!-- Header -->
    <header class="env-preview__header">
      <div class="env-preview__title-row">
        <h3 class="env-preview__name">
          {{ data.name || 'Nouvel environnement' }}
        </h3>
        <span
          v-if="tierValue"
          class="env-preview__tier-badge"
          :class="`env-preview__tier-badge--t${tierValue}`"
          :aria-label="`Tier ${tierValue}`"
        >
          T{{ tierValue }}
        </span>
      </div>
      <div class="env-preview__meta">
        <span
          v-if="data.type"
          class="env-preview__type"
        >
          {{ typeIcon }} {{ data.type }}
        </span>
        <span
          v-if="data.difficulty"
          class="env-preview__difficulty"
        >
          Diff. {{ data.difficulty }}
        </span>
      </div>
    </header>

    <!-- Description -->
    <p
      v-if="data.description"
      class="env-preview__description"
    >
      {{ data.description }}
    </p>

    <!-- Impulses -->
    <div
      v-if="data.impulses && data.impulses.length"
      class="env-preview__impulses"
    >
      <strong class="env-preview__section-label">Impulses :</strong>
      <span
        v-for="(impulse, idx) in data.impulses"
        :key="idx"
        class="env-preview__impulse-tag"
      >
        {{ impulse }}
      </span>
    </div>

    <!-- Potential Adversaries -->
    <div
      v-if="hasAdversaries"
      class="env-preview__adversaries"
    >
      <strong class="env-preview__section-label">Adversaires potentiels :</strong>
      <div
        v-for="(group, idx) in data.potentialAdversaries"
        :key="idx"
        class="env-preview__adv-group"
      >
        <em
          v-if="group.group"
          class="env-preview__adv-group-name"
        >{{ group.group }} :</em>
        <span
          v-for="(name, nIdx) in (group.names || [])"
          :key="nIdx"
          class="env-preview__adv-name"
        >
          {{ name }}
        </span>
      </div>
    </div>

    <!-- Features -->
    <div
      v-if="hasFeatures"
      class="env-preview__features"
    >
      <strong class="env-preview__section-label">Features</strong>
      <div
        v-for="(feat, idx) in data.features"
        :key="idx"
        class="env-preview__feature"
        :class="`env-preview__feature--${feat.type || 'passive'}`"
      >
        <div class="env-preview__feature-header">
          <span class="env-preview__feature-name">{{ feat.name || 'Feature sans nom' }}</span>
          <span class="env-preview__feature-type">{{ featureTypeLabel(feat.type) }}</span>
          <span
            v-if="feat.fearCost"
            class="env-preview__fear-cost"
            aria-label="Coût en Fear"
          >
            🔴 {{ feat.fearCost }}
          </span>
        </div>
        <p
          v-if="feat.description"
          class="env-preview__feature-desc"
        >
          {{ feat.description }}
        </p>
        <p
          v-if="feat.questions"
          class="env-preview__feature-questions"
        >
          <em>{{ feat.questions }}</em>
        </p>
      </div>
    </div>

    <!-- Empty state -->
    <p
      v-if="isEmpty"
      class="env-preview__empty"
    >
      Remplissez le formulaire pour voir l'aperçu de l'environnement.
    </p>
  </section>
</template>

<script>
const TYPE_ICONS = {
  Exploration: '🔍',
  Social: '🗣️',
  Traversal: '🥾',
  Event: '⚡'
}

export default {
  name: 'EnvironmentPreview',

  props: {
    data: {
      type: Object,
      required: true
    }
  },

  computed: {
    tierValue() {
      return this.data.tier || null
    },

    typeIcon() {
      return TYPE_ICONS[this.data.type] || '📍'
    },

    hasAdversaries() {
      return this.data.potentialAdversaries?.some(
        (g) => g.group || (g.names && g.names.length > 0)
      )
    },

    hasFeatures() {
      return this.data.features?.length > 0
    },

    isEmpty() {
      return !this.data.name && !this.data.description && !this.hasFeatures
    }
  },

  methods: {
    featureTypeLabel(type) {
      const labels = { action: 'Action', reaction: 'Réaction', passive: 'Passif' }
      return labels[type] || 'Passif'
    }
  }
}
</script>

<style scoped>
.env-preview {
  background: var(--color-surface, #1a1a2e);
  border: 1px solid var(--color-border, #333);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-lg, 1.25rem);
  font-size: 0.9rem;
}

.env-preview--tier1 { border-left: 4px solid var(--color-tier1, #4ade80); }
.env-preview--tier2 { border-left: 4px solid var(--color-tier2, #60a5fa); }
.env-preview--tier3 { border-left: 4px solid var(--color-tier3, #c084fc); }
.env-preview--tier4 { border-left: 4px solid var(--color-tier4, #f97316); }

.env-preview__header {
  margin-bottom: var(--spacing-md, 0.75rem);
}

.env-preview__title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
}

.env-preview__name {
  margin: 0;
  font-size: 1.2rem;
  color: var(--color-text, #e0e0e0);
}

.env-preview__tier-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-bg, #0f0f1a);
}
.env-preview__tier-badge--t1 { background: var(--color-tier1, #4ade80); }
.env-preview__tier-badge--t2 { background: var(--color-tier2, #60a5fa); }
.env-preview__tier-badge--t3 { background: var(--color-tier3, #c084fc); }
.env-preview__tier-badge--t4 { background: var(--color-tier4, #f97316); }

.env-preview__meta {
  display: flex;
  gap: var(--spacing-md, 0.75rem);
  margin-top: 4px;
  color: var(--color-text-muted, #888);
  font-size: 0.85rem;
}

.env-preview__description {
  color: var(--color-text-secondary, #aaa);
  font-style: italic;
  margin: 0 0 var(--spacing-md, 0.75rem);
  line-height: 1.5;
}

.env-preview__impulses {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs, 0.25rem);
  margin-bottom: var(--spacing-md, 0.75rem);
}

.env-preview__impulse-tag {
  background: var(--color-surface-elevated, #252540);
  color: var(--color-text-secondary, #aaa);
  padding: 2px 8px;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
}

.env-preview__section-label {
  display: block;
  color: var(--color-text-muted, #888);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-xs, 0.25rem);
  width: 100%;
}

.env-preview__adversaries {
  margin-bottom: var(--spacing-md, 0.75rem);
}

.env-preview__adv-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs, 0.25rem);
  margin-top: 4px;
}

.env-preview__adv-group-name {
  color: var(--color-text-secondary, #aaa);
  margin-right: 4px;
}

.env-preview__adv-name {
  background: var(--color-surface-elevated, #252540);
  padding: 1px 6px;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  color: var(--color-text, #e0e0e0);
}

.env-preview__features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 0.5rem);
}

.env-preview__feature {
  background: var(--color-surface-elevated, #252540);
  border-radius: var(--radius-md, 8px);
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 0.75rem);
  border-left: 3px solid var(--color-border, #444);
}

.env-preview__feature--action { border-left-color: var(--color-danger, #ef4444); }
.env-preview__feature--reaction { border-left-color: var(--color-warning, #f59e0b); }
.env-preview__feature--passive { border-left-color: var(--color-success, #22c55e); }

.env-preview__feature-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
  margin-bottom: 4px;
}

.env-preview__feature-name {
  font-weight: 600;
  color: var(--color-text, #e0e0e0);
}

.env-preview__feature-type {
  font-size: 0.75rem;
  color: var(--color-text-muted, #888);
  text-transform: uppercase;
}

.env-preview__fear-cost {
  font-size: 0.8rem;
  margin-left: auto;
}

.env-preview__feature-desc {
  margin: 0;
  color: var(--color-text-secondary, #aaa);
  font-size: 0.85rem;
  line-height: 1.45;
}

.env-preview__feature-questions {
  margin: 4px 0 0;
  color: var(--color-text-muted, #777);
  font-size: 0.8rem;
  line-height: 1.4;
}

.env-preview__empty {
  color: var(--color-text-muted, #666);
  text-align: center;
  font-style: italic;
  padding: var(--spacing-xl, 2rem) 0;
}
</style>
