<template>
  <div
    class="template-picker"
    role="region"
    aria-label="Templates de rencontres"
  >
    <!-- Filtres -->
    <div class="template-picker__filters">
      <select
        v-model="filterTier"
        class="template-picker__select"
        aria-label="Filtrer par tier"
      >
        <option :value="null">
          Tous les tiers
        </option>
        <option
          v-for="t in [1, 2, 3, 4]"
          :key="t"
          :value="t"
        >
          Tier {{ t }}
        </option>
      </select>

      <div class="template-picker__tags">
        <button
          v-for="tag in availableTags"
          :key="tag"
          type="button"
          class="template-picker__tag"
          :class="{ 'template-picker__tag--active': filterTag === tag }"
          :aria-pressed="String(filterTag === tag)"
          @click="filterTag = filterTag === tag ? null : tag"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Liste vide -->
    <p
      v-if="filteredTemplates.length === 0"
      class="template-picker__empty"
    >
      Aucun template ne correspond aux filtres.
    </p>

    <!-- Liste de templates -->
    <ul
      v-else
      class="template-picker__list"
    >
      <li
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        class="template-card"
      >
        <div class="template-card__info">
          <span class="template-card__name">{{ tpl.name }}</span>
          <span class="template-card__meta">
            T{{ tpl.tier }} · {{ tpl.pcCount }} PJ · {{ totalAdversaries(tpl) }} adv.
          </span>
          <span class="template-card__desc">{{ tpl.description }}</span>
          <div class="template-card__tags">
            <span
              v-for="tag in tpl.tags"
              :key="tag"
              class="template-card__tag-chip"
            >{{ tag }}</span>
          </div>
        </div>
        <button
          type="button"
          class="btn btn--ghost btn--sm template-card__load"
          :aria-label="'Charger ' + tpl.name"
          @click="$emit('load-template', tpl)"
        >
          Charger
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { ENCOUNTER_TEMPLATES } from '@data/encounters/templates'

/**
 * @component EncounterTemplatePicker
 * @description Sélecteur de templates de rencontres pré-construites.
 * Permet de filtrer par tier et tag, puis de charger un template dans le builder.
 */
export default {
  name: 'EncounterTemplatePicker',

  props: {
    /** Tier actuellement sélectionné dans le builder */
    currentTier: {
      type: Number,
      default: 1
    },
    /** Nombre de PJ actuellement configuré */
    currentPcCount: {
      type: Number,
      default: 4
    }
  },

  emits: ['load-template'],

  data() {
    return {
      filterTier: null,
      filterTag: null,
      allTemplates: ENCOUNTER_TEMPLATES
    }
  },

  computed: {
    filteredTemplates() {
      return this.allTemplates.filter((t) => {
        if (this.filterTier && t.tier !== this.filterTier) return false
        if (this.filterTag && !t.tags.includes(this.filterTag)) return false
        return true
      })
    },

    availableTags() {
      const tags = new Set()
      for (const tpl of this.allTemplates) {
        for (const tag of tpl.tags) {
          tags.add(tag)
        }
      }
      return [...tags].sort()
    }
  },

  methods: {
    totalAdversaries(tpl) {
      return tpl.adversarySlots.reduce((sum, s) => sum + s.quantity, 0)
    }
  }
}
</script>

<style scoped>
.template-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.template-picker__filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.template-picker__select {
  padding: 4px 8px;
  background: var(--color-bg-primary, #1a1a2e);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
}

.template-picker__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.template-picker__tag {
  padding: 2px 8px;
  font-size: 0.7rem;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.template-picker__tag:hover {
  background: rgba(255, 255, 255, 0.05);
}

.template-picker__tag--active {
  background: var(--color-accent-hope, #53a8b6);
  color: var(--color-bg-primary, #1a1a2e);
  border-color: var(--color-accent-hope, #53a8b6);
}

.template-picker__empty {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--space-md);
}

.template-picker__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  max-height: 400px;
  overflow-y: auto;
}

.template-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: var(--radius-sm, 4px);
  background: rgba(255, 255, 255, 0.02);
}

.template-card:hover {
  background: rgba(255, 255, 255, 0.04);
}

.template-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.template-card__name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.template-card__meta {
  font-size: 0.7rem;
  color: var(--color-accent-hope, #53a8b6);
}

.template-card__desc {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.template-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 2px;
}

.template-card__tag-chip {
  font-size: 0.6rem;
  padding: 1px 5px;
  border-radius: 8px;
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope, #53a8b6);
}

.template-card__load {
  flex-shrink: 0;
  align-self: center;
}
</style>
