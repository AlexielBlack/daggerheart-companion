<template>
  <div
    class="domain-picker"
    aria-label="Gestion des cartes de domaine"
  >
    <!-- ═══ Loadout (cartes actives) ═══ -->
    <div class="dp-section">
      <div class="dp-section__header">
        <h4 class="dp-section__title">
          🎴 Loadout
          <span class="dp-count">({{ loadoutCards.length }}/{{ maxLoadout }})</span>
        </h4>
      </div>
      <div
        v-if="loadoutCards.length === 0"
        class="dp-empty"
        role="status"
      >
        Aucune carte dans le loadout. Ajoutez-en depuis le catalogue ci-dessous.
      </div>
      <ul
        v-else
        class="dp-card-list"
        aria-label="Cartes du loadout"
      >
        <li
          v-for="card in loadoutCards"
          :key="card.id"
          class="dp-card"
          :style="{ '--domain-color': card.domainColor }"
        >
          <div class="dp-card__header">
            <span class="dp-card__level">Lv. {{ card.level }}</span>
            <span
              class="dp-card__type"
              :class="`dp-card__type--${card.type}`"
            >{{ formatType(card.type) }}</span>
            <span
              v-if="card.recallCost > 0"
              class="dp-card__recall"
            >✨ {{ card.recallCost }}</span>
          </div>
          <div class="dp-card__body">
            <strong class="dp-card__name">{{ card.name }}</strong>
            <span class="dp-card__domain">{{ card.domainEmoji }} {{ card.domainName }}</span>
          </div>
          <p
            v-if="expandedCardId === card.id"
            class="dp-card__feature"
          >
            {{ card.feature }}
          </p>
          <div class="dp-card__actions">
            <button
              class="dp-btn dp-btn--sm dp-btn--ghost"
              :aria-label="`${expandedCardId === card.id ? 'Masquer' : 'Voir'} détails de ${card.name}`"
              @click="toggleExpand(card.id)"
            >
              {{ expandedCardId === card.id ? '▲' : '▼' }}
            </button>
            <button
              class="dp-btn dp-btn--sm dp-btn--secondary"
              :aria-label="`Déplacer ${card.name} vers le vault`"
              @click="$emit('moveToVault', card.id)"
            >
              → Vault
            </button>
            <button
              class="dp-btn dp-btn--sm dp-btn--danger"
              :aria-label="`Retirer ${card.name}`"
              @click="$emit('removeCard', card.id)"
            >
              ✕
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- ═══ Vault (réserve) ═══ -->
    <div
      v-if="vaultCards.length > 0"
      class="dp-section"
    >
      <div class="dp-section__header">
        <h4 class="dp-section__title">
          🗃️ Vault
          <span class="dp-count">({{ vaultCards.length }})</span>
        </h4>
      </div>
      <ul
        class="dp-card-list dp-card-list--vault"
        aria-label="Cartes du vault"
      >
        <li
          v-for="card in vaultCards"
          :key="card.id"
          class="dp-card dp-card--vault"
          :style="{ '--domain-color': card.domainColor }"
        >
          <div class="dp-card__header">
            <span class="dp-card__level">Lv. {{ card.level }}</span>
            <span
              class="dp-card__type"
              :class="`dp-card__type--${card.type}`"
            >{{ formatType(card.type) }}</span>
            <span
              v-if="card.recallCost > 0"
              class="dp-card__recall"
            >✨ {{ card.recallCost }}</span>
          </div>
          <div class="dp-card__body">
            <strong class="dp-card__name">{{ card.name }}</strong>
            <span class="dp-card__domain">{{ card.domainEmoji }} {{ card.domainName }}</span>
          </div>
          <p
            v-if="expandedCardId === card.id"
            class="dp-card__feature"
          >
            {{ card.feature }}
          </p>
          <div class="dp-card__actions">
            <button
              class="dp-btn dp-btn--sm dp-btn--ghost"
              :aria-label="`${expandedCardId === card.id ? 'Masquer' : 'Voir'} détails de ${card.name}`"
              @click="toggleExpand(card.id)"
            >
              {{ expandedCardId === card.id ? '▲' : '▼' }}
            </button>
            <button
              class="dp-btn dp-btn--sm dp-btn--primary"
              :disabled="loadoutFull"
              :aria-label="`Déplacer ${card.name} vers le loadout`"
              @click="$emit('moveToLoadout', card.id)"
            >
              → Loadout
            </button>
            <button
              class="dp-btn dp-btn--sm dp-btn--danger"
              :aria-label="`Retirer ${card.name}`"
              @click="$emit('removeCard', card.id)"
            >
              ✕
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- ═══ Catalogue (cartes disponibles) ═══ -->
    <div class="dp-section dp-section--catalog">
      <div class="dp-section__header">
        <h4 class="dp-section__title">
          📖 Catalogue
        </h4>
      </div>

      <!-- Filtres -->
      <div
        class="dp-filters"
        role="search"
        aria-label="Filtrer les cartes de domaine"
      >
        <div class="dp-filter-group">
          <label
            class="dp-filter-label"
            for="dp-filter-domain"
          >Domaine</label>
          <select
            id="dp-filter-domain"
            v-model="filterDomain"
            class="dp-filter-select"
          >
            <option value="">
              Tous
            </option>
            <option
              v-for="d in domains"
              :key="d.id"
              :value="d.id"
            >
              {{ d.emoji }} {{ d.name }}
            </option>
          </select>
        </div>
        <div class="dp-filter-group">
          <label
            class="dp-filter-label"
            for="dp-filter-level"
          >Niveau max</label>
          <select
            id="dp-filter-level"
            v-model.number="filterLevel"
            class="dp-filter-select"
          >
            <option
              v-for="l in characterLevel"
              :key="l"
              :value="l"
            >
              {{ l }}
            </option>
          </select>
        </div>
        <div class="dp-filter-group">
          <label
            class="dp-filter-label"
            for="dp-filter-type"
          >Type</label>
          <select
            id="dp-filter-type"
            v-model="filterType"
            class="dp-filter-select"
          >
            <option value="">
              Tous
            </option>
            <option value="ability">
              Ability
            </option>
            <option value="spell">
              Spell
            </option>
            <option value="grimoire">
              Grimoire
            </option>
          </select>
        </div>
      </div>

      <!-- Liste catalogue -->
      <div
        v-if="filteredCatalog.length === 0"
        class="dp-empty"
        role="status"
      >
        Aucune carte ne correspond aux filtres.
      </div>
      <ul
        v-else
        class="dp-catalog"
        aria-label="Cartes de domaine disponibles"
      >
        <li
          v-for="card in filteredCatalog"
          :key="card.id"
          class="dp-catalog-card"
          :class="{ 'dp-catalog-card--acquired': isAcquired(card.id) }"
          :style="{ '--domain-color': card.domainColor }"
        >
          <div class="dp-card__header">
            <span class="dp-card__level">Lv. {{ card.level }}</span>
            <span
              class="dp-card__type"
              :class="`dp-card__type--${card.type}`"
            >{{ formatType(card.type) }}</span>
            <span
              v-if="card.recallCost > 0"
              class="dp-card__recall"
            >✨ {{ card.recallCost }}</span>
          </div>
          <div class="dp-card__body">
            <strong class="dp-card__name">{{ card.name }}</strong>
            <span class="dp-card__domain">{{ card.domainEmoji }} {{ card.domainName }}</span>
          </div>
          <p
            v-if="expandedCardId === card.id"
            class="dp-card__feature"
          >
            {{ card.feature }}
          </p>
          <div class="dp-card__actions">
            <button
              class="dp-btn dp-btn--sm dp-btn--ghost"
              :aria-label="`${expandedCardId === card.id ? 'Masquer' : 'Voir'} détails de ${card.name}`"
              @click="toggleExpand(card.id)"
            >
              {{ expandedCardId === card.id ? '▲' : '▼' }}
            </button>
            <template v-if="!isAcquired(card.id)">
              <button
                class="dp-btn dp-btn--sm dp-btn--primary"
                :disabled="loadoutFull"
                :aria-label="`Ajouter ${card.name} au loadout`"
                @click="$emit('addToLoadout', card.id)"
              >
                + Loadout
              </button>
              <button
                class="dp-btn dp-btn--sm dp-btn--secondary"
                :aria-label="`Ajouter ${card.name} au vault`"
                @click="$emit('addToVault', card.id)"
              >
                + Vault
              </button>
            </template>
            <span
              v-else
              class="dp-badge dp-badge--acquired"
            >✓ Acquise</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { CARD_TYPES } from '@/data/domains/index.js'

export default {
  name: 'DomainCardPicker',

  props: {
    /** Domaines disponibles pour la classe */
    domains: { type: Array, default: () => [] },
    /** Toutes les cartes éligibles (niveau <= char level) */
    catalogCards: { type: Array, default: () => [] },
    /** Cartes dans le loadout (données complètes) */
    loadoutCards: { type: Array, default: () => [] },
    /** Cartes dans le vault (données complètes) */
    vaultCards: { type: Array, default: () => [] },
    /** Loadout plein ? */
    loadoutFull: { type: Boolean, default: false },
    /** Niveau du personnage */
    characterLevel: { type: Number, default: 1 },
    /** Max loadout (constante) */
    maxLoadout: { type: Number, default: 5 },
    /** IDs des cartes acquises (loadout + vault) */
    acquiredCardIds: { type: Array, default: () => [] }
  },

  emits: ['addToLoadout', 'addToVault', 'moveToLoadout', 'moveToVault', 'removeCard'],

  setup(props) {
    const filterDomain = ref('')
    const filterLevel = ref(props.characterLevel)
    const filterType = ref('')
    const expandedCardId = ref(null)

    /** Cartes catalogue filtrées */
    const filteredCatalog = computed(() => {
      let cards = props.catalogCards
      if (filterDomain.value) {
        cards = cards.filter((c) => c.domainId === filterDomain.value)
      }
      if (filterLevel.value) {
        cards = cards.filter((c) => c.level <= filterLevel.value)
      }
      if (filterType.value) {
        cards = cards.filter((c) => c.type === filterType.value)
      }
      return cards
    })

    /** Vérifie si une carte est déjà acquise */
    function isAcquired(cardId) {
      return props.acquiredCardIds.includes(cardId)
    }

    /** Formate le type de carte */
    function formatType(type) {
      return CARD_TYPES[type] || type
    }

    /** Toggle expand/collapse d'une carte */
    function toggleExpand(cardId) {
      expandedCardId.value = expandedCardId.value === cardId ? null : cardId
    }

    return {
      filterDomain,
      filterLevel,
      filterType,
      expandedCardId,
      filteredCatalog,
      isAcquired,
      formatType,
      toggleExpand
    }
  }
}
</script>

<style scoped>
.domain-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.dp-section {
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 6px;
  padding: var(--space-sm, 8px);
}

.dp-section--catalog {
  background: transparent;
  border: 1px dashed var(--border-color, #3a3a5a);
}

.dp-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs, 4px);
}

.dp-section__title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary, #e5e7eb);
  margin: 0;
}

.dp-count {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-muted, #6b7280);
}

.dp-empty {
  font-size: 0.8rem;
  color: var(--text-muted, #6b7280);
  text-align: center;
  padding: var(--space-sm, 8px);
  font-style: italic;
}

/* ── Filtres ── */
.dp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs, 4px);
  margin-bottom: var(--space-sm, 8px);
}

.dp-filter-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 90px;
}

.dp-filter-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #6b7280);
}

.dp-filter-select {
  padding: 4px 6px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary, #e5e7eb);
  font-size: 0.8rem;
  cursor: pointer;
}

.dp-filter-select:focus {
  outline: 2px solid var(--accent-hope, #53a8b6);
  outline-offset: 1px;
}

.dp-filter-select option {
  background: var(--bg-secondary, #1f1f3a);
  color: var(--text-primary, #e5e7eb);
}

/* ── Cartes (loadout / vault) ── */
.dp-card-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 4px);
}

.dp-card {
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-left: 3px solid var(--domain-color, var(--accent-hope, #53a8b6));
  border-radius: 4px;
  padding: var(--space-xs, 4px) var(--space-sm, 8px);
}

.dp-card--vault {
  opacity: 0.85;
  border-left-style: dashed;
}

.dp-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 4px);
  margin-bottom: 2px;
}

.dp-card__level {
  font-size: 0.6rem;
  font-weight: bold;
  color: var(--domain-color, var(--text-muted, #6b7280));
  text-transform: uppercase;
}

.dp-card__type {
  font-size: 0.6rem;
  padding: 1px 4px;
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 3px;
  color: var(--text-muted, #6b7280);
  border: 1px solid var(--border-color, #3a3a5a);
}

.dp-card__type--spell { color: #a78bfa; border-color: rgba(139, 92, 246, 0.3); }
.dp-card__type--grimoire { color: #22d3ee; border-color: rgba(8, 145, 178, 0.3); }
.dp-card__type--ability { color: #f87171; border-color: rgba(220, 38, 38, 0.3); }

.dp-card__recall { font-size: 0.6rem; color: #ca8a04; margin-left: auto; }

.dp-card__body {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-xs, 4px);
}

.dp-card__name { font-size: 0.82rem; color: var(--text-primary, #e5e7eb); }
.dp-card__domain { font-size: 0.65rem; color: var(--text-muted, #6b7280); white-space: nowrap; }

.dp-card__feature {
  font-size: 0.73rem;
  color: var(--text-secondary, #9ca3af);
  margin: 4px 0;
  line-height: 1.5;
}

.dp-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

/* ── Catalogue ── */
.dp-catalog {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-xs, 4px);
  max-height: 400px;
  overflow-y: auto;
}

.dp-catalog-card {
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-top: 2px solid var(--domain-color, var(--accent-hope, #53a8b6));
  border-radius: 4px;
  padding: var(--space-xs, 4px) var(--space-sm, 8px);
  transition: border-color 150ms ease;
}

.dp-catalog-card:hover { border-color: var(--domain-color, var(--accent-hope, #53a8b6)); }
.dp-catalog-card--acquired { opacity: 0.5; }

/* ── Boutons ── */
.dp-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary, #9ca3af);
  cursor: pointer;
  font-size: 0.7rem;
  padding: 2px 6px;
  transition: all 150ms ease;
  white-space: nowrap;
}

.dp-btn:hover:not(:disabled) { border-color: var(--text-secondary, #9ca3af); }
.dp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.dp-btn:focus-visible { outline: 2px solid var(--accent-hope, #53a8b6); outline-offset: 1px; }

.dp-btn--primary { color: var(--accent-hope, #53a8b6); border-color: rgba(83, 168, 182, 0.3); }
.dp-btn--primary:hover:not(:disabled) { background: rgba(83, 168, 182, 0.1); border-color: var(--accent-hope, #53a8b6); }

.dp-btn--secondary { color: #a78bfa; border-color: rgba(139, 92, 246, 0.3); }
.dp-btn--secondary:hover:not(:disabled) { background: rgba(139, 92, 246, 0.1); border-color: #a78bfa; }

.dp-btn--danger { color: var(--accent-fear, #c84b31); border-color: rgba(200, 75, 49, 0.3); }
.dp-btn--danger:hover:not(:disabled) { background: rgba(200, 75, 49, 0.1); border-color: var(--accent-fear, #c84b31); }

.dp-btn--ghost { border-color: transparent; }
.dp-btn--ghost:hover:not(:disabled) { background: rgba(255, 255, 255, 0.05); }

.dp-btn--sm { font-size: 0.65rem; padding: 1px 5px; }

.dp-badge {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 4px;
}

.dp-badge--acquired {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
}

@media (max-width: 500px) {
  .dp-catalog { grid-template-columns: 1fr; }
  .dp-filters { flex-direction: column; }
}
</style>
