<template>
  <div class="domain-browser">
    <!-- ═══ En-tête ═══ -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        🃏 Domaines
      </h1>
      <p class="browser-header__subtitle">
        {{ store.domainCount }} domaines — {{ store.totalCardCount }} cartes
      </p>
    </header>

    <!-- ═══ Filtres ═══ -->
    <div
      class="browser-filters"
      role="search"
      aria-label="Filtrer les domaines"
    >
      <label
        class="sr-only"
        for="domain-search"
      >Rechercher un domaine</label>
      <input
        id="domain-search"
        :value="store.searchQuery"
        type="search"
        class="filter-input"
        placeholder="Rechercher domaine, classe, carte..."
        aria-label="Rechercher un domaine"
        @input="store.setSearch($event.target.value)"
      />
      <div
        class="filter-group"
        role="group"
        aria-label="Filtrer par type de sort"
      >
        <button
          v-for="f in spellFilters"
          :key="f.id"
          class="filter-chip"
          :class="{ 'filter-chip--active': store.filterSpell === f.id }"
          :aria-pressed="store.filterSpell === f.id"
          @click="store.setFilterSpell(f.id)"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- ═══ Grille de domaines ═══ -->
    <div
      v-if="store.filteredDomains.length"
      class="domain-grid"
      role="list"
      aria-label="Liste des domaines"
    >
      <article
        v-for="domain in store.filteredDomains"
        :key="domain.id"
        class="domain-card"
        role="listitem"
      >
        <!-- En-tête du domaine -->
        <button
          class="domain-card__header"
          :style="{ '--domain-color': domain.color }"
          :aria-expanded="store.selectedDomainId === domain.id"
          :aria-controls="`domain-details-${domain.id}`"
          @click="store.selectDomain(domain.id)"
        >
          <span
            class="domain-card__emoji"
            aria-hidden="true"
          >{{ domain.emoji }}</span>
          <div class="domain-card__meta">
            <span class="domain-card__name">{{ domain.name }}</span>
            <span class="domain-card__classes">{{ domain.classes.join(', ') }}</span>
          </div>
          <div class="domain-card__indicators">
            <span
              v-if="domain.hasSpells"
              class="badge badge--spell"
              aria-label="Ce domaine possède des sorts"
            >Sorts</span>
            <span class="domain-card__count">{{ domain.cards.length }}/{{ domain.cardCount }} cartes</span>
          </div>
          <span
            class="domain-card__chevron"
            aria-hidden="true"
          >{{ store.selectedDomainId === domain.id ? '▲' : '▼' }}</span>
        </button>

        <!-- Corps du domaine -->
        <div
          :id="`domain-details-${domain.id}`"
          class="domain-card__body"
          :hidden="store.selectedDomainId !== domain.id"
        >
          <!-- Description -->
          <p class="domain-description">
            {{ domain.description }}
          </p>

          <!-- Thèmes -->
          <div class="domain-themes">
            <span
              v-for="theme in domain.themes"
              :key="theme"
              class="theme-tag"
            >{{ theme }}</span>
          </div>

          <!-- Filtres de cartes -->
          <div
            v-if="domain.cards.length > 0"
            class="card-filters"
            role="group"
            aria-label="Filtrer les cartes"
          >
            <div class="card-filters__row">
              <span class="card-filters__label">Type :</span>
              <button
                class="filter-chip filter-chip--sm"
                :class="{ 'filter-chip--active': store.filterType === 'all' }"
                :aria-pressed="store.filterType === 'all'"
                @click="store.setFilterType('all')"
              >
                Tous
              </button>
              <button
                v-for="t in store.availableTypes"
                :key="t"
                class="filter-chip filter-chip--sm"
                :class="{ 'filter-chip--active': store.filterType === t }"
                :aria-pressed="store.filterType === t"
                @click="store.setFilterType(t)"
              >
                {{ getTypeLabel(t) }}
              </button>
            </div>
            <div class="card-filters__row">
              <span class="card-filters__label">Niveau :</span>
              <button
                class="filter-chip filter-chip--sm"
                :class="{ 'filter-chip--active': store.filterLevel === 0 }"
                :aria-pressed="store.filterLevel === 0"
                @click="store.setFilterLevel(0)"
              >
                Tous
              </button>
              <button
                v-for="lv in store.availableLevels"
                :key="lv"
                class="filter-chip filter-chip--sm"
                :class="{ 'filter-chip--active': store.filterLevel === lv }"
                :aria-pressed="store.filterLevel === lv"
                @click="store.setFilterLevel(lv)"
              >
                {{ lv }}
              </button>
            </div>
          </div>

          <!-- Cartes du domaine -->
          <section
            v-if="store.selectedDomainCards.length > 0"
            class="domain-section"
            :aria-label="`Cartes du domaine ${domain.name}`"
          >
            <h3 class="domain-section__title">
              Cartes ({{ store.selectedDomainCards.length }})
            </h3>
            <div
              class="cards-grid"
              role="list"
            >
              <DomainCardItem
                v-for="card in store.selectedDomainCards"
                :key="card.id"
                :card="card"
                :domain-color="domain.color"
              />
            </div>
          </section>

          <!-- Classes liées -->
          <section class="domain-section">
            <h3 class="domain-section__title">
              Classes liées
            </h3>
            <div class="linked-classes">
              <span
                v-for="cls in domain.classes"
                :key="cls"
                class="class-tag"
              >{{ cls }}</span>
            </div>
          </section>

          <!-- Dupliquer en homebrew -->
          <button
            class="btn btn--secondary btn--sm domain-card__duplicate-btn"
            @click.stop="duplicateToHomebrew(domain)"
          >
            ✎ Dupliquer en homebrew
          </button>
        </div>
      </article>
    </div>

    <!-- ═══ État vide ═══ -->
    <div
      v-else
      class="empty-state"
      role="status"
      aria-live="polite"
    >
      <p
        class="empty-state__icon"
        aria-hidden="true"
      >
        🔍
      </p>
      <p class="empty-state__text">
        Aucun domaine trouvé pour « {{ store.searchQuery }} »
      </p>
    </div>
  </div>
</template>

<script>
import { useDomainStore } from '../stores/domainStore.js'
import { CARD_TYPES } from '@/data/domains/index.js'
import DomainCardItem from '../components/DomainCardItem.vue'
import { useDomainHomebrewStore } from '@modules/homebrew/categories/domain/useDomainHomebrewStore.js'
import { useRouter } from 'vue-router'

export default {
  name: 'DomainBrowser',

  components: { DomainCardItem },

  setup() {
    const store = useDomainStore()
    const router = useRouter()

    const spellFilters = [
      { id: 'all', label: 'Tous' },
      { id: 'spells', label: 'Avec sorts' },
      { id: 'martial', label: 'Sans sorts' }
    ]

    function getTypeLabel(type) {
      return CARD_TYPES[type] || type
    }

    function duplicateToHomebrew(domain) {
      const homebrewStore = useDomainHomebrewStore()
      const result = homebrewStore.createFromTemplate(domain)
      if (result.success) {
        router.push(`/homebrew/domain/${result.id}`)
      }
    }

    return { store, spellFilters, getTypeLabel, duplicateToHomebrew }
  }
}
</script>

<style scoped>
.domain-browser { max-width: 900px; margin: 0 auto; }

/* ── Header ── */
.browser-header { margin-bottom: var(--space-lg); }
.browser-header__title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.browser-header__subtitle { color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-sm); }

/* ── Filtres ── */
.browser-filters { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-lg); align-items: center; }
.filter-input { flex: 1; min-width: 200px; padding: var(--space-sm) var(--space-md); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-input:focus { outline: 2px solid var(--color-accent-hope); outline-offset: 1px; }
.filter-group { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.filter-chip { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; transition: all var(--transition-fast); }
.filter-chip:hover { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }
.filter-chip--active { background: var(--color-accent-hope); border-color: var(--color-accent-hope); color: #fff; font-weight: var(--font-weight-medium); }
.filter-chip--sm { padding: 2px var(--space-xs); font-size: 0.65rem; }

/* ── Card Filters ── */
.card-filters { display: flex; flex-direction: column; gap: var(--space-xs); margin-bottom: var(--space-md); padding: var(--space-sm); background: var(--color-bg-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.card-filters__row { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.card-filters__label { font-size: var(--font-size-xs); color: var(--color-text-muted); min-width: 40px; font-weight: var(--font-weight-medium); }

/* ── Grille ── */
.domain-grid { display: flex; flex-direction: column; gap: var(--space-sm); }

/* ── Carte domaine ── */
.domain-card { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; transition: border-color var(--transition-fast); }
.domain-card__header {
  width: 100%; display: flex; align-items: center; gap: var(--space-sm);
  padding: var(--space-md); background: none; border: none;
  color: var(--color-text-primary); cursor: pointer; text-align: left;
  transition: background-color var(--transition-fast);
  border-left: 3px solid var(--domain-color, var(--color-accent-hope));
}
.domain-card__header:hover { background: var(--color-bg-surface); }
.domain-card__header:focus-visible { outline: 2px solid var(--color-accent-hope); outline-offset: -2px; }
.domain-card__emoji { font-size: 1.5rem; width: 2rem; text-align: center; }
.domain-card__meta { flex: 1; }
.domain-card__name { display: block; font-weight: var(--font-weight-bold); font-size: var(--font-size-md); }
.domain-card__classes { display: block; font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
.domain-card__indicators { display: flex; align-items: center; gap: var(--space-xs); }
.domain-card__count { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.domain-card__chevron { color: var(--color-text-muted); font-size: 0.75rem; }

/* ── Corps ── */
.domain-card__body { border-top: 1px solid var(--color-border); padding: var(--space-md); animation: slideDown 0.2s ease; }
.domain-card__body[hidden] { display: none; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

/* ── Description & Thèmes ── */
.domain-description { font-size: var(--font-size-sm); line-height: 1.6; color: var(--color-text-secondary); margin: 0 0 var(--space-md); }
.domain-themes { display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-md); }
.theme-tag { font-size: var(--font-size-xs); padding: 2px var(--space-sm); background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-full); color: var(--color-text-secondary); }

/* ── Sections ── */
.domain-section { margin-bottom: var(--space-md); }
.domain-section__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 var(--space-sm); }

/* ── Cartes grid ── */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-sm); }

/* ── Classes liées ── */
.linked-classes { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.class-tag { font-size: var(--font-size-xs); padding: 2px var(--space-sm); background: rgba(83, 168, 182, 0.1); border: 1px solid rgba(83, 168, 182, 0.3); border-radius: var(--radius-full); color: var(--color-accent-hope); font-weight: var(--font-weight-medium); }

/* ── Badges ── */
.badge { font-size: 0.65rem; padding: 2px var(--space-xs); border-radius: var(--radius-sm); font-weight: var(--font-weight-bold); text-transform: uppercase; letter-spacing: 0.05em; }
.badge--spell { background: rgba(139, 92, 246, 0.15); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

/* ── Empty state ── */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); }

/* ── Accessibilité ── */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

@media (max-width: 600px) {
  .cards-grid { grid-template-columns: 1fr; }
}

.domain-card__duplicate-btn {
  margin-top: var(--space-md);
  width: 100%;
}
</style>
