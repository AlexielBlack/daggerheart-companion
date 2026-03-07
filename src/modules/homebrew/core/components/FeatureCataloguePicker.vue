<template>
  <details class="feat-picker">
    <summary class="feat-picker__toggle">
      {{ catalogueLabel }}
    </summary>

    <div class="feat-picker__filters">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher..."
        class="feat-picker__search"
        aria-label="Rechercher une feature"
      />
      <select
        v-model="filterActivation"
        class="feat-picker__filter"
        aria-label="Filtrer par type d'activation"
      >
        <option value="">
          Tous types
        </option>
        <option value="passive">
          Passifs
        </option>
        <option value="action">
          Actions
        </option>
        <option value="reaction">
          Reactions
        </option>
      </select>
      <select
        v-model="filterTheme"
        class="feat-picker__filter"
        aria-label="Filtrer par theme"
      >
        <option value="">
          Tous themes
        </option>
        <option
          v-for="th in themes"
          :key="th.value"
          :value="th.value"
        >
          {{ th.emoji }} {{ th.label }}
        </option>
      </select>
      <select
        v-model="filterSource"
        class="feat-picker__filter"
        aria-label="Filtrer par source"
      >
        <option value="">
          Toutes sources
        </option>
        <option value="adversary">
          Adversaires
        </option>
        <option value="domain_card">
          Domaines
        </option>
        <option value="homebrew">
          Homebrew
        </option>
      </select>
      <label class="feat-picker__tier-unlock">
        <input
          v-model="unlockTiers"
          type="checkbox"
        />
        <span>Tous tiers</span>
      </label>
    </div>

    <div class="feat-picker__list">
      <div
        v-for="feat in filteredFeatures"
        :key="feat.id"
        class="feat-picker__item"
      >
        <div class="feat-picker__item-header">
          <span
            class="feat-picker__item-type"
            :data-type="feat.activationType"
          >
            {{ activationEmoji(feat.activationType) }}
          </span>
          <strong class="feat-picker__item-name">{{ feat.name }}</strong>
          <span
            v-for="tag in feat.tags"
            :key="tag"
            class="feat-picker__tag"
          >
            {{ tagEmoji(tag) }}
          </span>
          <span
            v-if="feat.cost && feat.cost.type !== 'free'"
            class="feat-picker__cost"
          >
            {{ costLabel(feat.cost) }}
          </span>
        </div>
        <p
          class="feat-picker__item-desc"
          :class="{ 'feat-picker__item-desc--expanded': expandedId === feat.id }"
          role="button"
          tabindex="0"
          @click="toggleExpand(feat.id)"
          @keydown.enter="toggleExpand(feat.id)"
        >
          {{ feat.description }}
        </p>
        <div class="feat-picker__item-meta">
          <span class="feat-picker__item-source">
            {{ sourceEmoji(feat.source) }}
            {{ feat.sourceRef }}
          </span>
        </div>
        <button
          type="button"
          class="btn btn--small btn--ghost feat-picker__add-btn"
          :disabled="alreadyAdded.includes(feat.name)"
          :aria-label="alreadyAdded.includes(feat.name) ? `${feat.name} deja ajoute` : `Ajouter ${feat.name}`"
          @click="$emit('pick', feat)"
        >
          {{ alreadyAdded.includes(feat.name) ? 'Ajoute' : '+ Ajouter' }}
        </button>
      </div>
      <p
        v-if="filteredFeatures.length === 0"
        class="feat-picker__empty"
      >
        Aucune feature ne correspond aux filtres.
      </p>
    </div>
  </details>
</template>

<script>
/**
 * @component FeatureCataloguePicker
 * @description Panneau collapsible permettant de choisir une feature
 * depuis le catalogue SRD + homebrew, et de l'ajouter en copie inline
 * dans l'editeur d'adversaires homebrew.
 *
 * Architecture copy-on-pick : la feature choisie est emise via 'pick'
 * et copiee comme objet inline editable par le parent (FeatureEditor).
 */
import { ref, computed } from 'vue'
import { useCombatCatalogue } from '@modules/npcs/combatFeatureCatalogue.js'
import { useHomebrewCombatFeatureStore } from '@modules/npcs/stores/homebrewCombatFeatureStore.js'
import { ALL_THEMES, THEME_META } from '@modules/npcs/combatConstants.js'
import { TAG_META } from '@data/constants/tags.js'
import { ACTIVATION_META, COST_META } from '@data/constants/featureSchema.js'

export default {
  name: 'FeatureCataloguePicker',

  props: {
    /** Filtre tier : ne montre que les features dont le tier est inferieur ou egal */
    tier: {
      type: Number,
      default: null
    },
    /** Type d'adversaire, reserve pour un filtrage futur */
    adversaryType: {
      type: String,
      default: null
    },
    /** Noms des features deja presentes dans l'editeur */
    alreadyAdded: {
      type: Array,
      default: () => []
    }
  },

  emits: ['pick'],

  setup(props) {
    // ── Catalogue de combat features (chargement lazy) ──
    const { features: catalogueFeatures } = useCombatCatalogue()
    const homebrewStore = useHomebrewCombatFeatureStore()

    // ── Etat local des filtres ──
    const search = ref('')
    const filterActivation = ref('')
    const filterTheme = ref('')
    const filterSource = ref('')
    const unlockTiers = ref(false)
    const expandedId = ref(null)

    // ── Themes disponibles pour le filtre ──
    const themes = ALL_THEMES.map(t => ({
      value: t,
      label: THEME_META[t].label,
      emoji: THEME_META[t].emoji
    }))

    // ── Label du catalogue avec compteur ──
    const catalogueLabel = computed(() => {
      const count = filteredFeatures.value.length
      return `Choisir dans le catalogue (${count})`
    })

    // ── Liste fusionnee et filtree ──
    const filteredFeatures = computed(() => {
      let result = [...catalogueFeatures.value, ...homebrewStore.features]

      // Filtre par tier si actif et non deverrouille
      if (props.tier && !unlockTiers.value) {
        result = result.filter(f => f.tier <= props.tier)
      }

      // Filtre par type d'activation
      if (filterActivation.value) {
        result = result.filter(f => f.activationType === filterActivation.value)
      }

      // Filtre par theme
      if (filterTheme.value) {
        result = result.filter(f =>
          Array.isArray(f.themes) && f.themes.includes(filterTheme.value)
        )
      }

      // Filtre par source
      if (filterSource.value) {
        result = result.filter(f => f.source === filterSource.value)
      }

      // Filtre par recherche textuelle
      if (search.value.trim()) {
        const q = search.value.trim().toLowerCase()
        result = result.filter(f =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
        )
      }

      return result
    })

    // ── Toggle expand/collapse de la description ──
    function toggleExpand(id) {
      expandedId.value = expandedId.value === id ? null : id
    }

    return {
      search,
      filterActivation,
      filterTheme,
      filterSource,
      unlockTiers,
      expandedId,
      themes,
      catalogueLabel,
      filteredFeatures,
      toggleExpand
    }
  },

  methods: {
    /**
     * Retourne l'emoji correspondant au type d'activation.
     * @param {string} type - passive, action ou reaction
     * @returns {string}
     */
    activationEmoji(type) {
      return ACTIVATION_META[type]?.emoji || '?'
    },

    /**
     * Retourne l'emoji correspondant a un tag.
     * @param {string} tag
     * @returns {string}
     */
    tagEmoji(tag) {
      return TAG_META[tag]?.emoji || tag
    },

    /**
     * Formate le cout d'une feature en texte lisible.
     * @param {{ type: string, amount: number }|null} cost
     * @returns {string}
     */
    costLabel(cost) {
      if (!cost || cost.type === 'free') return ''
      const meta = COST_META[cost.type]
      return `${cost.amount} ${meta?.emoji || cost.type}`
    },

    /**
     * Retourne l'emoji correspondant a la source d'une feature.
     * @param {string} source
     * @returns {string}
     */
    sourceEmoji(source) {
      const map = { adversary: 'Adv.', homebrew: 'HB', domain_card: 'Dom.' }
      return map[source] || source
    }
  }
}
</script>

<style scoped>
/* ── Conteneur principal ── */
.feat-picker {
  border: 1px solid var(--color-border, #374151);
  border-radius: var(--radius-md, 6px);
  margin-bottom: var(--space-sm, 0.5rem);
}

.feat-picker__toggle {
  padding: var(--space-sm, 0.5rem) var(--space-md, 0.75rem);
  font-size: var(--font-size-sm, 0.85rem);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #f9fafb);
  cursor: pointer;
}

.feat-picker__toggle:hover {
  color: var(--color-accent-hope, #60a5fa);
}

/* ── Filtres ── */
.feat-picker__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs, 0.35rem);
  padding: 0 var(--space-md, 0.75rem) var(--space-sm, 0.5rem);
}

.feat-picker__search {
  flex: 1;
  min-width: 120px;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: var(--radius-sm, 4px);
  background: var(--color-bg-input, #1f2937);
  color: var(--color-text-primary, #f9fafb);
  font-size: var(--font-size-sm, 0.8rem);
  font-family: inherit;
}

.feat-picker__filter {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: var(--radius-sm, 4px);
  background: var(--color-bg-input, #1f2937);
  color: var(--color-text-primary, #f9fafb);
  font-size: var(--font-size-sm, 0.8rem);
  font-family: inherit;
}

.feat-picker__tier-unlock {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #9ca3af);
  cursor: pointer;
  white-space: nowrap;
}

.feat-picker__tier-unlock input {
  width: auto;
}

/* ── Liste de features ── */
.feat-picker__list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 var(--space-md, 0.75rem) var(--space-md, 0.75rem);
}

.feat-picker__item {
  border: 1px solid var(--color-border, #374151);
  border-radius: var(--radius-sm, 5px);
  padding: var(--space-sm, 0.5rem) 0.6rem;
  margin-bottom: var(--space-xs, 0.35rem);
  background: rgba(255, 255, 255, 0.02);
}

/* ── En-tete de chaque feature ── */
.feat-picker__item-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.2rem;
}

.feat-picker__item-type {
  font-size: var(--font-size-xs, 0.7rem);
  flex-shrink: 0;
}

.feat-picker__item-type[data-type="passive"] {
  color: var(--color-accent-hope, #22c55e);
}

.feat-picker__item-type[data-type="action"] {
  color: var(--color-accent-fear, #ef4444);
}

.feat-picker__item-type[data-type="reaction"] {
  color: var(--color-accent-gold, #f59e0b);
}

.feat-picker__item-name {
  font-size: var(--font-size-sm, 0.85rem);
  color: var(--color-text-primary, #f9fafb);
}

.feat-picker__tag {
  font-size: 0.65rem;
  flex-shrink: 0;
}

.feat-picker__cost {
  font-size: var(--font-size-xs, 0.7rem);
  color: var(--color-text-muted, #9ca3af);
  flex-shrink: 0;
}

/* ── Description (tronquee par defaut) ── */
.feat-picker__item-desc {
  font-size: var(--font-size-xs, 0.75rem);
  color: var(--color-text-muted, #9ca3af);
  margin: 0 0 0.25rem;
  line-height: 1.35;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.feat-picker__item-desc--expanded {
  display: block;
  -webkit-line-clamp: unset;
  overflow: visible;
}

/* ── Meta (source) ── */
.feat-picker__item-meta {
  display: flex;
  gap: 0.75rem;
  font-size: var(--font-size-xs, 0.7rem);
  color: var(--color-text-muted, #6b7280);
  margin-bottom: 0.3rem;
}

.feat-picker__item-source {
  font-size: var(--font-size-xs, 0.7rem);
}

/* ── Bouton ajouter ── */
.feat-picker__add-btn {
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm, 6px);
  font-family: inherit;
  font-weight: var(--font-weight-medium, 500);
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-xs, 0.75rem);
  background: transparent;
  border: 1px dashed var(--color-border, #374151);
  color: var(--color-text-muted, #9ca3af);
}

.feat-picker__add-btn:hover:not(:disabled) {
  border-color: var(--color-accent-hope, #60a5fa);
  color: var(--color-text-primary, #f9fafb);
}

.feat-picker__add-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* ── Etat vide ── */
.feat-picker__empty {
  font-size: var(--font-size-sm, 0.8rem);
  color: var(--color-text-muted, #6b7280);
  text-align: center;
  padding: var(--space-md, 0.75rem);
  margin: 0;
}
</style>
