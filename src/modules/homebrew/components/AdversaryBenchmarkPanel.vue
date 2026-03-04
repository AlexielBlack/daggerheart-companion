<template>
  <section
    v-if="hasBenchmark && typeInfo"
    class="adv-benchmark"
    aria-label="Benchmarks de référence"
  >
    <!-- En-tête : type + battle points -->
    <header class="adv-benchmark__header">
      <h4 class="adv-benchmark__title">
        {{ formData.type }}
        <span
          class="adv-benchmark__bp-badge"
          :title="`${typeInfo.battlePoints} Battle Point(s)`"
          aria-label="`${typeInfo.battlePoints} Battle Point(s)`"
        >
          {{ typeInfo.battlePoints }} BP
        </span>
      </h4>
      <p class="adv-benchmark__desc">
        {{ typeInfo.description }}
      </p>
    </header>

    <!-- Bouton : appliquer les stats de référence -->
    <button
      class="adv-benchmark__apply-btn"
      type="button"
      @click="$emit('apply')"
    >
      Appliquer les stats de référence (Tier {{ formData.tier }})
    </button>

    <!-- Grille de stats avec indicateurs -->
    <div
      class="adv-benchmark__stats-grid"
      role="list"
      aria-label="Statistiques de référence"
    >
      <div
        class="adv-benchmark__stat"
        role="listitem"
      >
        <span class="adv-benchmark__stat-label">Difficulté</span>
        <span
          class="adv-benchmark__stat-value"
          :class="comparisonClass(comparison?.difficulty)"
        >
          {{ defaultOf(benchmark.difficulty) }}
        </span>
        <span class="adv-benchmark__stat-range">
          ({{ rangeOf(benchmark.difficulty) }})
        </span>
      </div>

      <template v-if="benchmark.thresholds">
        <div
          class="adv-benchmark__stat"
          role="listitem"
        >
          <span class="adv-benchmark__stat-label">Seuil Majeur</span>
          <span
            class="adv-benchmark__stat-value"
            :class="comparisonClass(comparison?.majorThreshold)"
          >
            {{ defaultOf(benchmark.thresholds.major) }}
          </span>
          <span class="adv-benchmark__stat-range">
            ({{ rangeOf(benchmark.thresholds.major) }})
          </span>
        </div>
        <div
          class="adv-benchmark__stat"
          role="listitem"
        >
          <span class="adv-benchmark__stat-label">Seuil Sévère</span>
          <span
            class="adv-benchmark__stat-value"
            :class="comparisonClass(comparison?.severeThreshold)"
          >
            {{ defaultOf(benchmark.thresholds.severe) }}
          </span>
          <span class="adv-benchmark__stat-range">
            ({{ rangeOf(benchmark.thresholds.severe) }})
          </span>
        </div>
      </template>
      <div
        v-else
        class="adv-benchmark__stat adv-benchmark__stat--none"
        role="listitem"
      >
        <span class="adv-benchmark__stat-label">Seuils</span>
        <span class="adv-benchmark__stat-value">
          Aucun (Minion)
        </span>
      </div>

      <div
        class="adv-benchmark__stat"
        role="listitem"
      >
        <span class="adv-benchmark__stat-label">HP</span>
        <span
          class="adv-benchmark__stat-value"
          :class="comparisonClass(comparison?.hp)"
        >
          {{ defaultOf(benchmark.hp) }}
        </span>
        <span
          v-if="typeof benchmark.hp === 'object'"
          class="adv-benchmark__stat-range"
        >
          ({{ rangeOf(benchmark.hp) }})
        </span>
      </div>

      <div
        class="adv-benchmark__stat"
        role="listitem"
      >
        <span class="adv-benchmark__stat-label">Stress</span>
        <span
          class="adv-benchmark__stat-value"
          :class="comparisonClass(comparison?.stress)"
        >
          {{ defaultOf(benchmark.stress) }}
        </span>
        <span class="adv-benchmark__stat-range">
          ({{ rangeOf(benchmark.stress) }})
        </span>
      </div>

      <div
        class="adv-benchmark__stat"
        role="listitem"
      >
        <span class="adv-benchmark__stat-label">Attaque</span>
        <span
          class="adv-benchmark__stat-value"
          :class="comparisonClass(comparison?.attackModifier)"
        >
          +{{ defaultOf(benchmark.attack.modifier) }}
        </span>
        <span class="adv-benchmark__stat-range">
          {{ benchmark.attack.damage }} {{ benchmark.attack.damageType }}
        </span>
      </div>

      <div
        v-if="benchmark.minionThreshold"
        class="adv-benchmark__stat"
        role="listitem"
      >
        <span class="adv-benchmark__stat-label">Minion(X)</span>
        <span class="adv-benchmark__stat-value">
          {{ defaultOf(benchmark.minionThreshold) }}
        </span>
        <span class="adv-benchmark__stat-range">
          ({{ rangeOf(benchmark.minionThreshold) }})
        </span>
      </div>
    </div>

    <!-- Guide de création -->
    <details class="adv-benchmark__guide">
      <summary class="adv-benchmark__guide-title">
        Guide de création
      </summary>
      <ul
        class="adv-benchmark__guide-list"
      >
        <li
          v-for="(tip, idx) in typeInfo.guidelines"
          :key="idx"
          class="adv-benchmark__guide-item"
        >
          {{ tip }}
        </li>
      </ul>
    </details>

    <!-- Features suggérées -->
    <details class="adv-benchmark__features">
      <summary class="adv-benchmark__features-title">
        Features suggérées
      </summary>
      <ul
        class="adv-benchmark__feature-list"
      >
        <li
          v-for="feat in typeInfo.suggestedFeatures"
          :key="feat.name"
          class="adv-benchmark__feature-item"
        >
          <span
            class="adv-benchmark__feature-badge"
            :class="`adv-benchmark__feature-badge--${feat.activationType.toLowerCase()}`"
          >
            {{ feat.activationType }}
          </span>
          <strong class="adv-benchmark__feature-name">{{ feat.name }}</strong>
          <span class="adv-benchmark__feature-desc">{{ feat.description }}</span>
        </li>
      </ul>
    </details>
  </section>
</template>

<script>
/**
 * @component AdversaryBenchmarkPanel
 * @description Panneau affichant les benchmarks de référence pour le type et tier
 * d'adversaire sélectionnés, avec indicateurs de comparaison et guide de création.
 */
export default {
  name: 'AdversaryBenchmarkPanel',

  props: {
    /** Données du formulaire (type, tier, difficulty, etc.) */
    formData: {
      type: Object,
      required: true
    },
    /** Benchmark du tier courant (depuis useAdversaryBenchmarks) */
    benchmark: {
      type: Object,
      default: null
    },
    /** Infos du type (description, guidelines, features) */
    typeInfo: {
      type: Object,
      default: null
    },
    /** Disponibilité des benchmarks */
    hasBenchmark: {
      type: Boolean,
      default: false
    },
    /** Résultat de la comparaison formulaire vs benchmark */
    comparison: {
      type: Object,
      default: null
    }
  },

  emits: ['apply'],

  methods: {
    /**
     * Extrait la valeur par défaut d'un champ benchmark.
     * @param {number|object} field
     * @returns {number|string}
     */
    defaultOf(field) {
      if (field === null || field === undefined) return '—'
      if (typeof field === 'number') return field
      if (typeof field === 'object' && 'default' in field) return field.default
      return '—'
    },

    /**
     * Affiche la fourchette min–max d'un champ.
     * @param {number|object} field
     * @returns {string}
     */
    rangeOf(field) {
      if (field === null || field === undefined) return ''
      if (typeof field === 'number') return String(field)
      if (typeof field === 'object' && 'min' in field && 'max' in field) {
        return `${field.min}–${field.max}`
      }
      return ''
    },

    /**
     * Retourne la classe CSS correspondant à la comparaison.
     * @param {'above'|'below'|'match'|null} val
     * @returns {string}
     */
    comparisonClass(val) {
      if (!val) return ''
      return `adv-benchmark__stat-value--${val}`
    }
  }
}
</script>

<style scoped>
.adv-benchmark {
  background: var(--color-surface-raised, #1a1a2e);
  border: 1px solid var(--color-border, #2a2a4a);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-md, 16px);
  font-size: var(--font-size-sm, 0.875rem);
}

.adv-benchmark__header {
  margin-bottom: var(--space-sm, 8px);
}

.adv-benchmark__title {
  font-size: var(--font-size-base, 1rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #e0e0ff);
  margin: 0 0 var(--space-xs, 4px);
  display: flex;
  align-items: center;
  gap: var(--space-xs, 4px);
}

.adv-benchmark__bp-badge {
  display: inline-block;
  background: var(--color-accent-fear, #c0392b);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm, 4px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adv-benchmark__desc {
  color: var(--color-text-secondary, #a0a0cc);
  margin: 0;
  line-height: 1.4;
}

.adv-benchmark__apply-btn {
  display: block;
  width: 100%;
  padding: var(--space-xs, 4px) var(--space-sm, 8px);
  margin: var(--space-sm, 8px) 0;
  background: var(--color-accent-hope, #2980b9);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm, 4px);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast, 0.15s);
}

.adv-benchmark__apply-btn:hover {
  background: var(--color-accent-gold, #f39c12);
}

.adv-benchmark__stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs, 4px);
  margin-bottom: var(--space-sm, 8px);
}

.adv-benchmark__stat {
  background: var(--color-surface, #0d0d1a);
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-xs, 4px) var(--space-sm, 8px);
}

.adv-benchmark__stat--none {
  grid-column: span 2;
  text-align: center;
}

.adv-benchmark__stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-muted, #666);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adv-benchmark__stat-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text-primary, #e0e0ff);
}

.adv-benchmark__stat-value--above {
  color: var(--color-success, #27ae60);
}

.adv-benchmark__stat-value--below {
  color: var(--color-danger, #e74c3c);
}

.adv-benchmark__stat-value--match {
  color: var(--color-accent-gold, #f39c12);
}

.adv-benchmark__stat-range {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-muted, #666);
}

/* Guide & Features */
.adv-benchmark__guide,
.adv-benchmark__features {
  margin-top: var(--space-sm, 8px);
  border-top: 1px solid var(--color-border, #2a2a4a);
  padding-top: var(--space-sm, 8px);
}

.adv-benchmark__guide-title,
.adv-benchmark__features-title {
  font-weight: 600;
  color: var(--color-text-secondary, #a0a0cc);
  cursor: pointer;
  user-select: none;
}

.adv-benchmark__guide-list {
  list-style: disc;
  padding-left: var(--space-md, 16px);
  margin: var(--space-xs, 4px) 0 0;
}

.adv-benchmark__guide-item {
  color: var(--color-text-secondary, #a0a0cc);
  line-height: 1.5;
  margin-bottom: 2px;
}

.adv-benchmark__feature-list {
  list-style: none;
  padding: 0;
  margin: var(--space-xs, 4px) 0 0;
}

.adv-benchmark__feature-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-xs, 4px);
  margin-bottom: var(--space-xs, 4px);
  line-height: 1.4;
}

.adv-benchmark__feature-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: var(--radius-sm, 4px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.adv-benchmark__feature-badge--passive {
  background: var(--color-accent-hope, #2980b9);
  color: #fff;
}

.adv-benchmark__feature-badge--action {
  background: var(--color-accent-fear, #c0392b);
  color: #fff;
}

.adv-benchmark__feature-badge--reaction {
  background: var(--color-accent-gold, #f39c12);
  color: #1a1a2e;
}

.adv-benchmark__feature-name {
  color: var(--color-text-primary, #e0e0ff);
}

.adv-benchmark__feature-desc {
  color: var(--color-text-muted, #666);
  font-size: 0.8rem;
}

@media (max-width: 600px) {
  .adv-benchmark__stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
