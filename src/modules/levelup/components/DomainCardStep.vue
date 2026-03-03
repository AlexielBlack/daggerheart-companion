<template>
  <div
    class="step-dc"
    aria-label="Carte de domaine"
  >
    <p class="step-dc__intro">
      Choisissez une <strong>carte de domaine</strong> de niveau ≤ {{ targetLevel }}.
    </p>

    <!-- ═══ Sélection courante ═══ -->
    <div
      v-if="selectedCard"
      class="step-dc__selected"
    >
      <div class="dc-selected-card">
        <div class="dc-selected-card__header">
          <span class="dc-selected-card__level">Lv. {{ selectedCard.level }}</span>
          <span class="dc-selected-card__type">{{ formatType(selectedCard.type) }}</span>
        </div>
        <strong class="dc-selected-card__name">{{ selectedCard.name }}</strong>
        <span class="dc-selected-card__domain">{{ selectedCard.domainName || selectedCard.domain }}</span>
        <button
          class="dc-selected-card__clear"
          aria-label="Changer de carte"
          @click="$emit('select', null)"
        >
          Changer
        </button>
      </div>
    </div>

    <!-- ═══ Filtres ═══ -->
    <div class="step-dc__filters">
      <div class="dc-filter">
        <label
          class="dc-filter__label"
          for="dc-filter-domain"
        >Domaine</label>
        <select
          id="dc-filter-domain"
          v-model="filterDomain"
          class="dc-filter__select"
        >
          <option value="">
            Tous
          </option>
          <option
            v-for="d in availableDomains"
            :key="d"
            :value="d"
          >
            {{ d }}
          </option>
        </select>
      </div>
      <div class="dc-filter">
        <label
          class="dc-filter__label"
          for="dc-filter-level"
        >Niveau max</label>
        <select
          id="dc-filter-level"
          v-model.number="filterLevel"
          class="dc-filter__select"
        >
          <option
            v-for="l in levelOptions"
            :key="l"
            :value="l"
          >
            ≤ {{ l }}
          </option>
        </select>
      </div>
    </div>

    <!-- ═══ Catalogue ═══ -->
    <ul
      v-if="filteredCards.length > 0"
      class="step-dc__catalog"
      aria-label="Catalogue de cartes de domaine"
    >
      <li
        v-for="card in filteredCards"
        :key="card.id"
        class="dc-card"
        :class="{
          'dc-card--selected': card.id === selectedCardId,
          'dc-card--owned': isOwned(card.id)
        }"
      >
        <button
          class="dc-card__btn"
          :disabled="isOwned(card.id)"
          :aria-label="`${card.name} — Niveau ${card.level}, ${card.domainName || card.domain}`"
          :aria-pressed="card.id === selectedCardId"
          @click="$emit('select', card.id)"
        >
          <div class="dc-card__top">
            <span class="dc-card__level">Lv. {{ card.level }}</span>
            <span class="dc-card__type">{{ formatType(card.type) }}</span>
            <span
              v-if="card.recallCost > 0"
              class="dc-card__recall"
            >✨{{ card.recallCost }}</span>
          </div>
          <strong class="dc-card__name">{{ card.name }}</strong>
          <span class="dc-card__domain">{{ card.domainName || card.domain }}</span>
        </button>
        <button
          v-if="expandedId === card.id"
          class="dc-card__collapse"
          :aria-label="`Masquer détails de ${card.name}`"
          @click.stop="expandedId = null"
        >
          ▲
        </button>
        <button
          v-else
          class="dc-card__expand"
          :aria-label="`Voir détails de ${card.name}`"
          @click.stop="expandedId = card.id"
        >
          ▼
        </button>
        <p
          v-if="expandedId === card.id"
          class="dc-card__feature"
        >
          {{ card.feature }}
        </p>
        <span
          v-if="isOwned(card.id)"
          class="dc-card__badge"
        >Déjà acquise</span>
      </li>
    </ul>
    <p
      v-else
      class="step-dc__empty"
      role="status"
    >
      Aucune carte ne correspond aux filtres.
    </p>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

const TYPE_LABELS = {
  spell: 'Sort',
  ability: 'Capacité',
  grimoire: 'Grimoire'
}

export default {
  name: 'DomainCardStep',
  props: {
    /** Toutes les cartes éligibles (pré-filtrées par domaine du personnage) */
    catalogCards: { type: Array, default: () => [] },
    /** Domaines du personnage */
    availableDomains: { type: Array, default: () => [] },
    /** Niveau cible */
    targetLevel: { type: Number, default: 2 },
    /** ID de la carte sélectionnée */
    selectedCardId: { type: [String, null], default: null },
    /** IDs des cartes déjà possédées */
    ownedCardIds: { type: Array, default: () => [] }
  },
  emits: ['select'],
  setup(props) {
    const filterDomain = ref('')
    const filterLevel = ref(props.targetLevel)
    const expandedId = ref(null)

    const levelOptions = computed(() => {
      const levels = []
      for (let i = 1; i <= props.targetLevel; i++) levels.push(i)
      return levels
    })

    const filteredCards = computed(() => {
      let cards = props.catalogCards.filter((c) => c.level <= filterLevel.value)
      if (filterDomain.value) {
        cards = cards.filter((c) =>
          (c.domainName || c.domain || '').toLowerCase() === filterDomain.value.toLowerCase()
          || (c.domainId || '').toLowerCase() === filterDomain.value.toLowerCase()
        )
      }
      return cards.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    })

    const selectedCard = computed(() => {
      if (!props.selectedCardId) return null
      return props.catalogCards.find((c) => c.id === props.selectedCardId) || null
    })

    function isOwned(cardId) {
      return props.ownedCardIds.includes(cardId)
    }

    function formatType(type) {
      return TYPE_LABELS[type] || type
    }

    return {
      filterDomain,
      filterLevel,
      expandedId,
      levelOptions,
      filteredCards,
      selectedCard,
      isOwned,
      formatType
    }
  }
}
</script>

<style scoped>
.step-dc__intro {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
  line-height: var(--line-height-normal);
}

/* ── Selected card ── */
.step-dc__selected {
  margin-bottom: var(--space-md);
}

.dc-selected-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(83, 168, 182, 0.1);
  border: 1px solid var(--color-accent-hope);
  border-radius: var(--radius-md);
}

.dc-selected-card__header {
  display: flex;
  gap: var(--space-xs);
}

.dc-selected-card__level,
.dc-selected-card__type {
  font-size: var(--font-size-xs);
  padding: 1px 6px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.dc-selected-card__name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.dc-selected-card__domain {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.dc-selected-card__clear {
  padding: 2px 10px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
}

.dc-selected-card__clear:hover {
  border-color: var(--color-text-secondary);
}

/* ── Filters ── */
.step-dc__filters {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.dc-filter {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.dc-filter__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.dc-filter__select {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

/* ── Catalog ── */
.step-dc__catalog {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.dc-card {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.dc-card--selected {
  border-color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.06);
}

.dc-card--owned {
  opacity: 0.45;
}

.dc-card__btn {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs) var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-sm);
}

.dc-card__btn:disabled { cursor: not-allowed; }

.dc-card__btn:hover:not(:disabled) {
  background: rgba(83, 168, 182, 0.04);
}

.dc-card__top {
  display: flex;
  gap: var(--space-xs);
}

.dc-card__level,
.dc-card__type {
  font-size: var(--font-size-xs);
  padding: 1px 5px;
  background: var(--color-bg-surface);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
}

.dc-card__recall {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
}

.dc-card__name {
  flex: 1;
  min-width: 120px;
}

.dc-card__domain {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.dc-card__expand,
.dc-card__collapse {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-xs);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-xs);
  padding: 2px 6px;
}

.dc-card__feature {
  padding: var(--space-xs) var(--space-sm) var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  margin: 0;
  border-top: 1px solid var(--color-border);
}

.dc-card__badge {
  position: absolute;
  top: var(--space-xs);
  right: var(--space-lg);
  font-size: var(--font-size-xs);
  color: var(--color-accent-success);
  font-weight: var(--font-weight-medium);
}

.step-dc__empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  padding: var(--space-lg);
}
</style>
