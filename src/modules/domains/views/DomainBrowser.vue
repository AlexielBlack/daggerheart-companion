<template>
  <div class="domain-browser">
    <!-- En-tete -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        Domaines
      </h1>
      <p class="browser-header__subtitle">
        {{ store.domainCount }} domaines — {{ store.totalCardCount }} cartes
      </p>
    </header>

    <!-- Filtres -->
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

    <!-- Filtre par source + bouton creation -->
    <div class="domain-browser__toolbar">
      <SourceFilter v-model="store.sourceFilter" />
      <router-link
        to="/compendium/domaines/new"
        class="btn btn--secondary btn--sm domain-browser__create-btn"
        aria-label="Créer un domaine custom"
      >
        + Créer un custom
      </router-link>
    </div>

    <!-- Layout split : liste + détails -->
    <div
      v-if="store.filteredDomains.length"
      class="browser-split"
    >
      <!-- Colonne gauche : liste de sélection -->
      <div
        class="browser-split__list"
        role="listbox"
        aria-label="Liste des domaines"
      >
        <button
          v-for="domain in store.filteredDomains"
          :key="domain.id"
          class="browser-split__item"
          :class="{ 'browser-split__item--active': store.selectedDomainId === domain.id }"
          :style="{ '--domain-color': domain.color }"
          role="option"
          :aria-selected="store.selectedDomainId === domain.id"
          @click="store.selectDomain(domain.id)"
        >
          <span
            class="browser-split__emoji"
            aria-hidden="true"
          >{{ domain.emoji }}</span>
          <div class="browser-split__info">
            <span class="browser-split__name">
              {{ domain.name }}
              <SourceBadge :source="domain.source" />
            </span>
            <span class="browser-split__sub">{{ domain.classes.join(', ') }}</span>
          </div>
          <div class="browser-split__indicators">
            <span
              v-if="domain.hasSpells"
              class="badge badge--spell"
              aria-label="Ce domaine possède des sorts"
            >Sorts</span>
            <span class="browser-split__count">{{ domain.cards.length }}</span>
          </div>
        </button>
      </div>

      <!-- Colonne droite : détails -->
      <div
        v-if="selectedDomain"
        ref="detailPanel"
        class="browser-split__detail"
      >
        <h2
          class="detail-title"
          :style="{ '--domain-color': selectedDomain.color }"
        >
          <span aria-hidden="true">{{ selectedDomain.emoji }}</span>
          {{ selectedDomain.name }}
          <SourceBadge :source="selectedDomain.source" />
        </h2>

        <!-- Description -->
        <p class="domain-description">
          {{ selectedDomain.description }}
        </p>

        <!-- Themes -->
        <div class="domain-themes">
          <span
            v-for="theme in selectedDomain.themes"
            :key="theme"
            class="theme-tag"
          >{{ theme }}</span>
        </div>

        <!-- Filtres de cartes -->
        <div
          v-if="selectedDomain.cards.length > 0"
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
          :aria-label="`Cartes du domaine ${selectedDomain.name}`"
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
              :domain-color="selectedDomain.color"
            />
          </div>
        </section>

        <!-- Classes liees -->
        <section class="domain-section">
          <h3 class="domain-section__title">
            Classes liées
          </h3>
          <div class="linked-classes">
            <span
              v-for="cls in selectedDomain.classes"
              :key="cls"
              class="class-tag"
            >{{ cls }}</span>
          </div>
        </section>

        <!-- Bouton Modifier (custom uniquement) -->
        <button
          v-if="selectedDomain.source === 'custom'"
          class="btn btn--secondary btn--sm domain-card__edit-btn"
          aria-label="Modifier ce domaine custom"
          @click.stop="startEdit(selectedDomain)"
        >
          Modifier
        </button>

        <!-- Dupliquer en homebrew -->
        <button
          class="btn btn--secondary btn--sm domain-card__duplicate-btn"
          @click.stop="duplicateToHomebrew(selectedDomain)"
        >
          Dupliquer en homebrew
        </button>
      </div>

      <!-- Placeholder -->
      <div
        v-else
        class="browser-split__placeholder"
      >
        <p
          class="browser-split__placeholder-icon"
          aria-hidden="true"
        >
          &#128269;
        </p>
        <p>Sélectionnez un domaine pour voir ses détails</p>
      </div>
    </div>

    <!-- Panneau d'edition inline -->
    <aside
      v-if="editingInline"
      ref="editPanel"
      class="domain-browser__edit-panel"
      aria-label="Edition de domaine custom"
    >
      <h3>{{ creatingNew ? 'Nouveau domaine custom' : 'Modifier' }}</h3>
      <HomebrewForm
        :schema="domainSchema"
        :form-data="formData"
        :is-dirty="isDirty"
        :is-edit-mode="!creatingNew"
        :errors="[]"
        @submit="onSaveInline"
        @cancel="onCancelEdit"
        @update:field="onFieldUpdate"
      />
    </aside>

    <!-- Etat vide -->
    <div
      v-if="!store.filteredDomains.length && !editingInline"
      class="empty-state"
      role="status"
      aria-live="polite"
    >
      <p
        class="empty-state__icon"
        aria-hidden="true"
      >
        &#128269;
      </p>
      <p class="empty-state__text">
        Aucun domaine trouvé pour « {{ store.searchQuery }} »
      </p>
    </div>
  </div>
</template>

<script>
import { ref, inject, computed, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useDomainStore } from '../stores/domainStore.js'
import { CARD_TYPES } from '@/data/domains/index.js'
import DomainCardItem from '../components/DomainCardItem.vue'
import { useDomainHomebrewStore } from '@modules/homebrew/categories/domain/useDomainHomebrewStore.js'
import SourceFilter from '@core/components/SourceFilter.vue'
import SourceBadge from '@core/components/SourceBadge.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { domainSchema } from '@modules/homebrew/schemas/domainSchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'

export default {
  name: 'DomainBrowser',

  components: { DomainCardItem, SourceFilter, SourceBadge, HomebrewForm },

  setup() {
    const store = useDomainStore()
    const homebrewStore = useDomainHomebrewStore()
    const router = useRouter()
    const route = useRoute()
    const detailPanel = ref(null)
    const compendiumColumns = inject('compendiumColumns', ref(0))

    // --- Refs pour l'edition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editingDomainId = ref(null)
    const editPanel = ref(null)

    function scrollToEditPanel() {
      nextTick(() => {
        editPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    // --- Composable formulaire ---
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(domainSchema)

    const spellFilters = [
      { id: 'all', label: 'Tous' },
      { id: 'spells', label: 'Avec sorts' },
      { id: 'martial', label: 'Sans sorts' }
    ]

    function getTypeLabel(type) {
      return CARD_TYPES[type] || type
    }

    // Domaine sélectionné pour le panneau de détails
    const selectedDomain = computed(() => {
      if (!store.selectedDomainId) return null
      return store.filteredDomains.find((d) => d.id === store.selectedDomainId) ||
        store.allDomains?.find((d) => d.id === store.selectedDomainId) || null
    })

    // --- Deep-linking : sélection depuis la route ---
    function selectFromRoute(id) {
      if (!id) return
      if (id === 'new') {
        editingInline.value = true
        creatingNew.value = true
        reset()
        scrollToEditPanel()
        return
      }
      store.selectDomain(id)
    }

    // Sélection initiale au montage
    selectFromRoute(route.params.id)

    // Mise à jour lors de la navigation intra-route
    onBeforeRouteUpdate((to) => selectFromRoute(to.params.id))

    function duplicateToHomebrew(domain) {
      const result = homebrewStore.createFromTemplate(domain)
      if (result.success) {
        router.push(`/compendium/domaines/${result.id}`)
      }
    }

    return {
      store,
      homebrewStore,
      spellFilters,
      getTypeLabel,
      selectedDomain,
      duplicateToHomebrew,
      editingInline,
      creatingNew,
      editingDomainId,
      formData,
      isDirty,
      hydrate,
      setField,
      toRawData,
      reset,
      domainSchema,
      editPanel,
      detailPanel,
      scrollToEditPanel,
      compendiumColumns
    }
  },

  methods: {
    // --- Edition inline ---
    startEdit(domain) {
      // Priorité : données brutes du store homebrew (pas la version normalisée)
      const raw = this.homebrewStore.items.find((item) => item.id === domain.id)
      this.hydrate(raw || domain)
      this.editingInline = true
      this.creatingNew = false
      this.editingDomainId = domain.id
      this.scrollToEditPanel()
    },
    onFieldUpdate({ field, value }) {
      this.setField(field, value)
    },
    onSaveInline() {
      const data = this.toRawData()
      if (this.creatingNew) {
        const result = this.homebrewStore.create(data)
        if (result.success) {
          this.store.selectDomain(result.id)
        }
        this.creatingNew = false
      } else {
        const result = this.homebrewStore.update(this.editingDomainId, data)
        if (!result.success && result.error && result.error.includes('introuvable')) {
          this.homebrewStore.create({ ...data, id: this.editingDomainId })
        }
      }
      this.editingInline = false
      this.editingDomainId = null
    },
    onCancelEdit() {
      this.editingInline = false
      this.creatingNew = false
      this.editingDomainId = null
    }
  }
}
</script>

<style scoped>
.domain-browser {
  display: flex;
  flex-direction: column;
}

/* -- Header -- */
.browser-header { margin-bottom: var(--space-sm); }
.browser-header__title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.browser-header__subtitle { color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-sm); }

/* -- Toolbar -- */
.domain-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-sm);
}

.domain-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
}

/* -- Filtres -- */
.browser-filters { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-sm); align-items: center; }
.filter-input { flex: 1; min-width: 200px; padding: var(--space-sm) var(--space-md); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-input:focus { outline: 2px solid var(--color-accent-hope); outline-offset: 1px; }
.filter-group { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.filter-chip { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; transition: all var(--transition-fast); }
.filter-chip:hover { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }
.filter-chip--active { background: var(--color-accent-hope); border-color: var(--color-accent-hope); color: #fff; font-weight: var(--font-weight-medium); }
.filter-chip--sm { padding: 2px var(--space-xs); font-size: 0.65rem; }

/* -- Card Filters -- */
.card-filters { display: flex; flex-direction: column; gap: var(--space-xs); margin-bottom: var(--space-md); padding: var(--space-sm); background: var(--color-bg-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.card-filters__row { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.card-filters__label { font-size: var(--font-size-xs); color: var(--color-text-muted); min-width: 40px; font-weight: var(--font-weight-medium); }

/* ══ Split layout ══ */
.browser-split {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  flex: 1;
  min-height: 0;
}

@media (min-width: 768px) {
  .domain-browser {
    height: 100%;
    overflow: hidden;
  }

  .browser-split {
    display: grid;
    grid-template-columns: minmax(220px, 300px) 1fr;
  }

  .browser-split__list,
  .browser-split__detail,
  .browser-split__placeholder {
    overflow-y: auto;
  }
}

.browser-split__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.browser-split__item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all var(--transition-fast);
  border-left: 3px solid var(--domain-color, var(--color-accent-hope));
}

.browser-split__item:hover {
  background: var(--color-bg-surface);
  border-color: var(--color-accent-hope);
  border-left-color: var(--domain-color, var(--color-accent-hope));
}

.browser-split__item--active {
  background: var(--color-bg-surface);
  border-color: var(--color-accent-hope);
  border-left-color: var(--domain-color, var(--color-accent-hope));
  box-shadow: inset 3px 0 0 var(--domain-color, var(--color-accent-hope));
}

.browser-split__emoji {
  font-size: 1.25rem;
  width: 1.75rem;
  text-align: center;
  flex-shrink: 0;
}

.browser-split__info {
  flex: 1;
  min-width: 0;
}

.browser-split__name {
  display: block;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.browser-split__sub {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.browser-split__indicators {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.browser-split__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.browser-split__detail {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.browser-split__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  padding: var(--space-xl);
  text-align: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.browser-split__placeholder-icon {
  font-size: 2rem;
  margin: 0 0 var(--space-sm);
}

/* -- Titre détail -- */
.detail-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-md);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  border-left: 3px solid var(--domain-color, var(--color-accent-hope));
  padding-left: var(--space-sm);
}

/* -- Description & Themes -- */
.domain-description { font-size: var(--font-size-sm); line-height: 1.6; color: var(--color-text-secondary); margin: 0 0 var(--space-md); }
.domain-themes { display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-md); }
.theme-tag { font-size: var(--font-size-xs); padding: 2px var(--space-sm); background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-full); color: var(--color-text-secondary); }

/* -- Sections -- */
.domain-section { margin-bottom: var(--space-md); }
.domain-section__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 var(--space-sm); }

/* -- Cartes grid -- */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-sm); }

/* -- Classes liees -- */
.linked-classes { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.class-tag { font-size: var(--font-size-xs); padding: 2px var(--space-sm); background: rgba(83, 168, 182, 0.1); border: 1px solid rgba(83, 168, 182, 0.3); border-radius: var(--radius-full); color: var(--color-accent-hope); font-weight: var(--font-weight-medium); }

/* -- Badges -- */
.badge { font-size: 0.65rem; padding: 2px var(--space-xs); border-radius: var(--radius-sm); font-weight: var(--font-weight-bold); text-transform: uppercase; letter-spacing: 0.05em; }
.badge--spell { background: rgba(139, 92, 246, 0.15); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

/* -- Edit panel -- */
.domain-browser__edit-panel {
  padding: var(--space-md);
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
  border-radius: var(--radius-md, 8px);
  margin-top: var(--space-md);
}

.domain-browser__edit-panel h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-family-heading);
}

.domain-card__edit-btn {
  margin-top: var(--space-md);
  width: 100%;
}

.domain-card__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}

/* -- Empty state -- */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); }

/* -- Accessibilite -- */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

@media (max-width: 600px) {
  .cards-grid { grid-template-columns: 1fr; }
}
</style>
