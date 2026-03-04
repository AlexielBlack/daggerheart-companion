<template>
  <article
    class="adv-preview"
    :aria-label="`Aperçu : ${data.name || 'Nouvel adversaire'}`"
  >
    <!-- Header -->
    <header class="adv-preview__header">
      <h3 class="adv-preview__name">
        {{ data.name || 'Nouvel adversaire' }}
      </h3>
      <div class="adv-preview__subtitle">
        <span
          v-if="data.tier"
          class="badge"
          :class="`badge--tier${data.tier}`"
        >
          Tier {{ data.tier }}
        </span>
        <span
          v-if="data.type"
          class="adv-preview__type"
        >{{ data.type }}</span>
        <span class="adv-preview__source badge badge--hope">
          ✎ Custom
        </span>
      </div>
      <p
        v-if="data.description"
        class="adv-preview__description"
      >
        {{ data.description }}
      </p>
    </header>

    <!-- Motives -->
    <section
      v-if="data.motives?.length"
      class="adv-preview__section"
      aria-label="Motivations et tactiques"
    >
      <h4 class="adv-preview__section-title">
        Motivations &amp; Tactiques
      </h4>
      <p class="adv-preview__motives">
        {{ data.motives.join(', ') }}
      </p>
    </section>

    <hr
      class="adv-preview__divider"
      aria-hidden="true"
    />

    <!-- Core Stats -->
    <section
      class="adv-preview__stats"
      aria-label="Statistiques principales"
    >
      <div class="adv-preview__stat-grid">
        <div class="adv-preview__stat">
          <span class="adv-preview__stat-label">Difficulté</span>
          <span class="adv-preview__stat-value adv-preview__stat-value--accent">
            {{ data.difficulty || '—' }}
          </span>
        </div>
        <div class="adv-preview__stat">
          <span class="adv-preview__stat-label">Seuils</span>
          <span class="adv-preview__stat-value">
            <template v-if="data.thresholds?.major">
              {{ data.thresholds.major }}/{{ data.thresholds.severe }}
            </template>
            <template v-else>—</template>
          </span>
        </div>
        <div class="adv-preview__stat">
          <span class="adv-preview__stat-label">PV</span>
          <span class="adv-preview__stat-value adv-preview__stat-value--hp">
            {{ data.hp || '—' }}
          </span>
        </div>
        <div class="adv-preview__stat">
          <span class="adv-preview__stat-label">Stress</span>
          <span class="adv-preview__stat-value adv-preview__stat-value--stress">
            {{ data.stress ?? '—' }}
          </span>
        </div>
      </div>
    </section>

    <hr
      class="adv-preview__divider"
      aria-hidden="true"
    />

    <!-- Attack -->
    <section
      v-if="hasAttack"
      class="adv-preview__section"
      aria-label="Attaque standard"
    >
      <h4 class="adv-preview__section-title">
        Attaque
      </h4>
      <div class="adv-preview__attack">
        <span class="adv-preview__attack-mod">
          ATK {{ formatModifier(data.attack.modifier) }}
        </span>
        <span
          class="adv-preview__attack-sep"
          aria-hidden="true"
        >|</span>
        <span class="adv-preview__attack-name">{{ data.attack.name || '…' }}</span>
        <span
          class="adv-preview__attack-sep"
          aria-hidden="true"
        >:</span>
        <span class="adv-preview__attack-range">{{ data.attack.range || '…' }}</span>
        <span
          class="adv-preview__attack-sep"
          aria-hidden="true"
        >|</span>
        <span class="adv-preview__attack-damage">
          {{ data.attack.damage || '…' }} {{ damageTypeLabel }}
        </span>
      </div>
    </section>

    <!-- Experiences -->
    <section
      v-if="data.experiences?.length"
      class="adv-preview__section"
      aria-label="Expériences"
    >
      <h4 class="adv-preview__section-title">
        Expériences
      </h4>
      <div class="adv-preview__experiences">
        <span
          v-for="(exp, idx) in data.experiences"
          :key="idx"
          class="adv-preview__exp-tag"
        >
          {{ exp.name || '…' }} {{ formatModifier(exp.modifier) }}
        </span>
      </div>
    </section>

    <!-- Features -->
    <section
      v-if="data.features?.length"
      class="adv-preview__section"
      aria-label="Capacités"
    >
      <h4 class="adv-preview__section-title">
        Capacités ({{ data.features.length }})
      </h4>
      <div
        class="adv-preview__features"
        role="list"
      >
        <div
          v-for="(feature, idx) in data.features"
          :key="idx"
          class="adv-preview__feature"
          :class="`adv-preview__feature--${feature.activationType || 'action'}`"
          role="listitem"
        >
          <div class="adv-preview__feature-header">
            <span class="adv-preview__feature-icon">{{ featureIcon(feature.activationType) }}</span>
            <strong>{{ feature.name || '…' }}</strong>
            <span
              v-if="feature.cost"
              class="adv-preview__feature-cost"
            >{{ feature.cost }}</span>
          </div>
          <p
            v-if="feature.description"
            class="adv-preview__feature-desc"
          >
            {{ feature.description }}
          </p>
        </div>
      </div>
    </section>
  </article>
</template>

<script>
/**
 * @component AdversaryPreview
 * @description Aperçu en temps réel d'un adversaire homebrew pendant l'édition.
 * Gère gracieusement les données partielles (champs vides → '—' ou '…').
 * Reprend le style visuel du StatBlock SRD existant.
 */
const DAMAGE_LABELS = { phy: 'Physique', mag: 'Magique' }
const FEATURE_ICONS = { action: '⚔️', reaction: '🛡️', passive: '🔵' }

export default {
  name: 'AdversaryPreview',

  props: {
    /** Données de l'adversaire (potentiellement partielles) */
    data: {
      type: Object,
      required: true
    }
  },

  computed: {
    hasAttack() {
      return this.data.attack && (
        this.data.attack.name || this.data.attack.damage || this.data.attack.modifier !== undefined
      )
    },

    damageTypeLabel() {
      return DAMAGE_LABELS[this.data.attack?.damageType] || ''
    }
  },

  methods: {
    formatModifier(mod) {
      if (mod === undefined || mod === null || mod === '') return ''
      const n = Number(mod)
      if (Number.isNaN(n)) return mod
      return n >= 0 ? `+${n}` : `${n}`
    },

    featureIcon(type) {
      return FEATURE_ICONS[type] || '❓'
    }
  }
}
</script>

<style scoped>
.adv-preview {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 600px;
  width: 100%;
}

.adv-preview__header {
  margin-bottom: var(--space-md);
}

.adv-preview__name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.adv-preview__subtitle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
  flex-wrap: wrap;
}

.adv-preview__type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.adv-preview__source {
  margin-left: auto;
  font-size: var(--font-size-xs);
}

.adv-preview__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-sm) 0 0;
  font-style: italic;
  line-height: var(--line-height-normal);
}

.adv-preview__section {
  margin: var(--space-md) 0;
}

.adv-preview__section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-xs);
}

.adv-preview__motives {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.adv-preview__divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-sm) 0;
}

/* Stats grid */
.adv-preview__stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  text-align: center;
}

.adv-preview__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-xs);
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
}

.adv-preview__stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adv-preview__stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.adv-preview__stat-value--accent { color: var(--color-accent-gold); }
.adv-preview__stat-value--hp { color: var(--color-accent-danger); }
.adv-preview__stat-value--stress { color: var(--color-accent-warning); }

/* Attack */
.adv-preview__attack {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.adv-preview__attack-mod {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-fear);
}

.adv-preview__attack-sep { color: var(--color-text-muted); }

.adv-preview__attack-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.adv-preview__attack-damage {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-fear);
}

/* Experiences */
.adv-preview__experiences {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.adv-preview__exp-tag {
  display: inline-flex;
  padding: 2px var(--space-sm);
  font-size: var(--font-size-xs);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
}

/* Features */
.adv-preview__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.adv-preview__feature {
  padding: var(--space-sm) var(--space-md);
  border-left: 3px solid var(--color-border);
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.adv-preview__feature--action { border-left-color: var(--color-accent-fear); }
.adv-preview__feature--reaction { border-left-color: var(--color-accent-gold); }
.adv-preview__feature--passive { border-left-color: var(--color-accent-hope); }

.adv-preview__feature-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
}

.adv-preview__feature-icon {
  font-size: var(--font-size-sm);
  line-height: 1;
}

.adv-preview__feature-cost {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
  padding: 1px var(--space-xs);
  border: 1px solid var(--color-accent-gold);
  border-radius: var(--radius-sm);
}

.adv-preview__feature-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
}

@media (max-width: 480px) {
  .adv-preview__stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
