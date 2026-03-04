<template>
  <span class="glossary-text">
    <template
      v-for="(segment, idx) in segments"
      :key="idx"
    >
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <abbr
        v-if="segment.type === 'keyword'"
        class="glossary-keyword"
        :class="[
          `glossary-keyword--${segment.entry.category}`,
          { 'glossary-keyword--prominent': isProminent(segment.entry.category) }
        ]"
        :style="keywordStyle(segment.entry)"
        :title="segment.entry.fr"
        :aria-label="`${segment.entry.fr} — ${segment.entry.definition}`"
        tabindex="0"
        @mouseenter="showTooltip($event, segment.entry)"
        @mouseleave="hideTooltip"
        @focus="showTooltip($event, segment.entry)"
        @blur="hideTooltip"
      >{{ segment.value }}</abbr>
      <span
        v-else-if="segment.type === 'dice'"
        class="glossary-dice"
        role="img"
        :aria-label="`Dé : ${segment.value}`"
      >{{ segment.value }}</span>
      <span
        v-else-if="segment.type === 'stat-value'"
        class="glossary-stat-value"
        :class="`glossary-stat-value--${segment.normalizedUnit || normalizeStatUnit(segment.statUnit)}`"
        role="img"
        :aria-label="`${segment.statNumber} ${segment.statUnit}`"
      ><span class="glossary-stat-value__number">{{ segment.statNumber }}</span>&nbsp;<span class="glossary-stat-value__unit">{{ segment.statUnit }}</span></span>
      <template v-else>{{ segment.value }}</template>
    </template>

    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        ref="tooltipEl"
        class="glossary-tooltip"
        :style="tooltipPosition"
        role="tooltip"
        :aria-hidden="!tooltip.visible"
      >
        <div class="glossary-tooltip__header">
          <span
            class="glossary-tooltip__badge"
            :style="{ backgroundColor: tooltip.categoryColor }"
          >
            {{ tooltip.categoryLabel }}
          </span>
          <strong class="glossary-tooltip__term-fr">
            {{ tooltip.entry?.fr }}
          </strong>
          <span class="glossary-tooltip__term-en">
            ({{ tooltip.entry?.en }})
          </span>
        </div>
        <p class="glossary-tooltip__definition">
          {{ tooltip.entry?.definition }}
        </p>
      </div>
    </Teleport>
  </span>
</template>

<script>
import { parseGlossaryTerms, getCategoryMeta } from '@core/composables/useGlossary'

/**
 * @component GlossaryText
 * @description Affiche du texte avec les termes SRD surlignés et un tooltip au survol.
 * Le texte original (en anglais) est préservé tel quel — seul le surlignage et
 * le tooltip apportent la traduction et la définition.
 */
export default {
  name: 'GlossaryText',
  props: {
    /**
     * Texte brut à analyser et afficher.
     */
    text: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tooltip: {
        visible: false,
        entry: null,
        categoryLabel: '',
        categoryColor: '',
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    segments() {
      return parseGlossaryTerms(this.text)
    },
    tooltipPosition() {
      return {
        left: `${this.tooltip.x}px`,
        top: `${this.tooltip.y}px`
      }
    }
  },
  methods: {
    /**
     * Catégories « proéminentes » — affichées avec un badge plutôt qu'un simple soulignement.
     * Inclut les portées, les types de capacités et les caractéristiques.
     * @param {string} category
     * @returns {boolean}
     */
    isProminent(category) {
      return ['range', 'feature', 'trait'].includes(category)
    },

    /**
     * Normalise l'unité stat pour la classe CSS.
     * @param {string} unit
     * @returns {string}
     */
    normalizeStatUnit(unit) {
      if (!unit) return 'generic'
      const lower = unit.toLowerCase()
      if (lower === 'hp' || lower === 'pv' || lower.startsWith('hit point')) return 'hp'
      if (lower === 'stress') return 'stress'
      if (lower.startsWith('armor')) return 'armor'
      if (lower === 'evasion') return 'evasion'
      return 'generic'
    },

    /**
     * Retourne le style inline de bordure colorée pour un mot-clé.
     * @param {Object} entry
     * @returns {Object}
     */
    keywordStyle(entry) {
      const meta = getCategoryMeta(entry.category)
      return {
        borderBottomColor: meta?.color || 'var(--color-accent-hope)'
      }
    },

    /**
     * Affiche le tooltip positionné près de l'élément déclencheur.
     * @param {Event} event
     * @param {Object} entry
     */
    showTooltip(event, entry) {
      const rect = event.target.getBoundingClientRect()
      const meta = getCategoryMeta(entry.category)

      // Positionner au-dessus du mot, centré horizontalement
      const tooltipWidth = 280
      let x = rect.left + rect.width / 2 - tooltipWidth / 2
      const y = rect.top - 8

      // Empêcher le débordement horizontal
      if (x < 8) x = 8
      if (x + tooltipWidth > window.innerWidth - 8) {
        x = window.innerWidth - tooltipWidth - 8
      }

      this.tooltip = {
        visible: true,
        entry,
        categoryLabel: meta?.label || entry.category,
        categoryColor: meta?.color || 'var(--color-accent-hope)',
        x,
        y
      }
    },

    /**
     * Cache le tooltip.
     */
    hideTooltip() {
      this.tooltip.visible = false
    }
  }
}
</script>

<style scoped>
.glossary-text {
  /* Conteneur inline pour s'intégrer dans n'importe quel contexte textuel */
}

.glossary-keyword {
  border-bottom: 1.5px dotted currentColor;
  cursor: help;
  transition: opacity var(--transition-fast);
  border-radius: 1px;
  text-decoration: none;
  font-style: normal;
  /* Le border-bottom-color est défini dynamiquement via :style */
}

.glossary-keyword:hover,
.glossary-keyword:focus {
  opacity: 0.85;
  outline: none;
}

.glossary-keyword:focus-visible {
  outline: 2px solid var(--color-border-active);
  outline-offset: 1px;
  border-radius: var(--radius-sm);
}

/* ── Keywords proéminents (portée, capacité, trait) ── */
.glossary-keyword--prominent {
  border-bottom: none;
  font-weight: 600;
  padding: 0 0.2em;
  border-radius: 3px;
}

.glossary-keyword--range {
  color: #81c784;
}
.glossary-keyword--prominent.glossary-keyword--range {
  background-color: rgba(129, 199, 132, 0.15);
}

.glossary-keyword--feature {
  color: #ba68c8;
}
.glossary-keyword--prominent.glossary-keyword--feature {
  background-color: rgba(186, 104, 200, 0.15);
}

.glossary-keyword--trait {
  color: var(--color-accent-gold, #ffd54f);
}
.glossary-keyword--prominent.glossary-keyword--trait {
  background-color: rgba(255, 213, 79, 0.12);
}

/* ── Notation de dés (ex : 1d4, 2d6+3) ── */
.glossary-dice {
  display: inline;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  font-size: 0.95em;
  color: #4fc3f7;
  background-color: rgba(79, 195, 247, 0.12);
  padding: 0.05em 0.35em;
  border-radius: 3px;
  border: 1px solid rgba(79, 195, 247, 0.3);
  white-space: nowrap;
  letter-spacing: 0.02em;
}

/* ── Valeurs de stat (ex : 3 HP, 2 Stress) ── */
.glossary-stat-value {
  display: inline;
  font-weight: 700;
  font-size: 0.95em;
  padding: 0.05em 0.3em;
  border-radius: 3px;
  white-space: nowrap;
}
.glossary-stat-value__number {
  font-variant-numeric: tabular-nums;
}
.glossary-stat-value__unit {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85em;
  letter-spacing: 0.04em;
}

/* HP / PV — rouge vif */
.glossary-stat-value--hp {
  color: #ef5350;
  background-color: rgba(239, 83, 80, 0.12);
  border: 1px solid rgba(239, 83, 80, 0.3);
}

/* Stress — violet/magenta */
.glossary-stat-value--stress {
  color: #ce93d8;
  background-color: rgba(206, 147, 216, 0.12);
  border: 1px solid rgba(206, 147, 216, 0.3);
}

/* Armor — doré */
.glossary-stat-value--armor {
  color: var(--color-accent-gold, #ffd54f);
  background-color: rgba(255, 213, 79, 0.12);
  border: 1px solid rgba(255, 213, 79, 0.25);
}

/* Evasion — cyan */
.glossary-stat-value--evasion {
  color: #4dd0e1;
  background-color: rgba(77, 208, 225, 0.12);
  border: 1px solid rgba(77, 208, 225, 0.3);
}

/* Fallback générique */
.glossary-stat-value--generic {
  color: var(--color-text-primary, #e8e8f0);
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
</style>

<style>
/* Styles globaux pour le tooltip (Teleport vers body) */
.glossary-tooltip {
  position: fixed;
  z-index: 9999;
  max-width: 280px;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-elevated, #1a3a6a);
  border: 1px solid var(--color-border, #2a2a4a);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.5));
  transform: translateY(-100%);
  pointer-events: none;
  animation: glossary-tooltip-in 150ms ease;
}

@keyframes glossary-tooltip-in {
  from {
    opacity: 0;
    transform: translateY(-100%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(-100%);
  }
}

.glossary-tooltip__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  margin-bottom: var(--space-xs, 0.25rem);
  flex-wrap: wrap;
}

.glossary-tooltip__badge {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: var(--radius-full, 9999px);
  color: var(--color-text-inverse, #1a1a2e);
  white-space: nowrap;
}

.glossary-tooltip__term-fr {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-primary, #e8e8f0);
}

.glossary-tooltip__term-en {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #6a6a80);
  font-style: italic;
}

.glossary-tooltip__definition {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-secondary, #a0a0b8);
  line-height: var(--line-height-normal, 1.5);
  margin: 0;
}
</style>
