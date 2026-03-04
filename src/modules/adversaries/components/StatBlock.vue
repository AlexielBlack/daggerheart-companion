<template>
  <article
    class="stat-block"
    :aria-label="`Fiche de ${adversary.name}`"
  >
    <!-- Header -->
    <header class="stat-block__header">
      <div class="stat-block__title-row">
        <h2 class="stat-block__name">
          {{ adversary.name }}
        </h2>
        <button
          v-if="closable"
          class="stat-block__close btn btn--ghost btn--sm"
          aria-label="Fermer la fiche"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>
      <div class="stat-block__subtitle">
        <span
          class="badge"
          :class="`badge--tier${adversary.tier}`"
        >
          Tier {{ adversary.tier }}
        </span>
        <span class="stat-block__type">{{ typeLabel }}</span>
        <span
          v-if="adversary.hordeRatio"
          class="stat-block__horde-ratio"
        >
          ({{ adversary.hordeRatio }})
        </span>
      </div>
      <p class="stat-block__description">
        {{ adversary.description }}
      </p>
    </header>

    <!-- Motives -->
    <section
      v-if="adversary.motives?.length"
      class="stat-block__section"
      aria-label="Motivations et tactiques"
    >
      <h3 class="stat-block__section-title">
        Motivations &amp; Tactiques
      </h3>
      <p class="stat-block__motives">
        {{ adversary.motives.join(', ') }}
      </p>
    </section>

    <hr
      class="stat-block__divider"
      aria-hidden="true"
    />

    <!-- Core Stats -->
    <section
      class="stat-block__stats"
      aria-label="Statistiques principales"
    >
      <div class="stat-block__stat-grid">
        <div class="stat-block__stat">
          <span class="stat-block__stat-label">Difficulté</span>
          <span class="stat-block__stat-value stat-block__stat-value--accent">
            {{ adversary.difficulty }}
          </span>
        </div>
        <div class="stat-block__stat">
          <span class="stat-block__stat-label">Seuils</span>
          <span class="stat-block__stat-value">
            <template v-if="adversary.thresholds && adversary.thresholds.major !== null">
              {{ adversary.thresholds.major }}/{{ adversary.thresholds.severe }}
            </template>
            <template v-else>—</template>
          </span>
        </div>
        <div class="stat-block__stat">
          <span class="stat-block__stat-label">PV</span>
          <span class="stat-block__stat-value stat-block__stat-value--hp">
            {{ adversary.hp }}
          </span>
        </div>
        <div class="stat-block__stat">
          <span class="stat-block__stat-label">Stress</span>
          <span class="stat-block__stat-value stat-block__stat-value--stress">
            {{ adversary.stress }}
          </span>
        </div>
      </div>
    </section>

    <hr
      class="stat-block__divider"
      aria-hidden="true"
    />

    <!-- Attack -->
    <section
      class="stat-block__section"
      aria-label="Attaque standard"
    >
      <h3 class="stat-block__section-title">
        Attaque
      </h3>
      <div class="stat-block__attack">
        <span class="stat-block__attack-mod">
          ATK {{ formatModifier(adversary.attack.modifier) }}
        </span>
        <span
          class="stat-block__attack-separator"
          aria-hidden="true"
        >|</span>
        <span class="stat-block__attack-name">{{ adversary.attack.name }}</span>
        <span
          class="stat-block__attack-separator"
          aria-hidden="true"
        >:</span>
        <span class="stat-block__attack-range">{{ rangeLabel }}</span>
        <span
          class="stat-block__attack-separator"
          aria-hidden="true"
        >|</span>
        <span class="stat-block__attack-damage">
          {{ adversary.attack.damage }} {{ damageTypeLabel }}
        </span>
      </div>
    </section>

    <!-- Experiences -->
    <section
      v-if="adversary.experiences?.length"
      class="stat-block__section"
      aria-label="Expériences"
    >
      <h3 class="stat-block__section-title">
        Expériences
      </h3>
      <div class="stat-block__experiences">
        <span
          v-for="exp in adversary.experiences"
          :key="exp.name"
          class="stat-block__experience-tag"
        >
          {{ exp.name }} {{ formatModifier(exp.modifier) }}
        </span>
      </div>
    </section>

    <!-- Features -->
    <section
      v-if="adversary.features?.length"
      class="stat-block__section"
      aria-label="Capacités"
    >
      <h3 class="stat-block__section-title">
        Capacités
      </h3>
      <div
        class="stat-block__features"
        role="list"
        aria-label="Liste des capacités"
      >
        <FeatureBlock
          v-for="feature in adversary.features"
          :key="feature.name"
          :feature="feature"
        />
      </div>
    </section>
  </article>
</template>

<script>
import FeatureBlock from './FeatureBlock.vue'
import { DAMAGE_TYPE_LABELS, ADVERSARY_TYPE_LABELS, RANGE_LABELS } from '@data/adversaries'

/**
 * @component StatBlock
 * @description Affiche le bloc de statistiques complet d'un adversaire.
 */
export default {
  name: 'StatBlock',
  components: { FeatureBlock },
  props: {
    adversary: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.name === 'string' && typeof value.id === 'string'
      }
    },
    closable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  computed: {
    damageTypeLabel() {
      return DAMAGE_TYPE_LABELS[this.adversary.attack?.damageType] || this.adversary.attack?.damageType || ''
    },
    typeLabel() {
      return ADVERSARY_TYPE_LABELS[this.adversary.type] || this.adversary.type
    },
    rangeLabel() {
      return RANGE_LABELS[this.adversary.attack?.range] || this.adversary.attack?.range || ''
    }
  },
  methods: {
    formatModifier(mod) {
      if (typeof mod !== 'number') return mod
      return mod >= 0 ? `+${mod}` : `${mod}`
    }
  }
}
</script>

<style scoped>
.stat-block {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 600px;
  width: 100%;
}

.stat-block__header {
  margin-bottom: var(--space-md);
}

.stat-block__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
}

.stat-block__name {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.stat-block__close {
  flex-shrink: 0;
  padding: var(--space-xs);
  font-size: var(--font-size-lg);
  line-height: 1;
}

.stat-block__subtitle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
  flex-wrap: wrap;
}

.stat-block__type {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.stat-block__horde-ratio {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.stat-block__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: var(--space-sm) 0 0;
  font-style: italic;
  line-height: var(--line-height-normal);
}

.stat-block__section {
  margin: var(--space-md) 0;
}

.stat-block__section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-xs);
}

.stat-block__motives {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.stat-block__divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-sm) 0;
}

/* Stats grid */
.stat-block__stats {
  margin: var(--space-md) 0;
}

.stat-block__stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  text-align: center;
}

.stat-block__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-xs);
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
}

.stat-block__stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-block__stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-block__stat-value--accent {
  color: var(--color-accent-gold);
}

.stat-block__stat-value--hp {
  color: var(--color-accent-danger);
}

.stat-block__stat-value--stress {
  color: var(--color-accent-warning);
}

/* Attack */
.stat-block__attack {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-block__attack-mod {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-fear);
}

.stat-block__attack-separator {
  color: var(--color-text-muted);
}

.stat-block__attack-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.stat-block__attack-range {
  color: var(--color-text-secondary);
}

.stat-block__attack-damage {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-fear);
}

/* Experiences */
.stat-block__experiences {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.stat-block__experience-tag {
  display: inline-flex;
  padding: 2px var(--space-sm);
  font-size: var(--font-size-xs);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
}

/* Features */
.stat-block__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* Responsive */
@media (max-width: 480px) {
  .stat-block__stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-block__attack {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }

  .stat-block__attack-separator {
    display: none;
  }
}
</style>
