<template>
  <div class="community-browser">
    <!-- En-tete -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        Communautes
      </h1>
      <p class="browser-header__subtitle">
        {{ store.filteredCount }} communauté{{ store.filteredCount > 1 ? 's' : '' }}
        sur {{ store.totalCount }}
        — D'où vient votre personnage ?
      </p>
    </header>

    <!-- Filtres -->
    <div
      class="browser-filters"
      role="search"
      aria-label="Filtrer les communautés"
    >
      <label
        class="sr-only"
        for="community-search"
      >Rechercher une communauté</label>
      <input
        id="community-search"
        :value="store.searchQuery"
        type="search"
        class="filter-input"
        placeholder="Rechercher une communauté, feature ou adjectif..."
        aria-label="Rechercher une communauté"
        @input="store.setSearch($event.target.value)"
      />
      <button
        v-if="store.hasActiveFilters"
        class="filter-clear"
        aria-label="Effacer la recherche"
        @click="store.resetAll()"
      >
        Effacer
      </button>
    </div>

    <!-- Filtre par source + bouton creation -->
    <div class="community-browser__toolbar">
      <SourceFilter v-model="store.sourceFilter" />
      <router-link
        to="/compendium/communautes/new"
        class="btn btn--secondary btn--sm community-browser__create-btn"
        aria-label="Créer une communauté custom"
      >
        + Créer un custom
      </router-link>
    </div>

    <!-- Layout split : liste + détails -->
    <div
      v-if="store.filteredCommunities.length"
      class="browser-split"
    >
      <!-- Colonne gauche : liste de sélection -->
      <div
        class="browser-split__list"
        role="listbox"
        aria-label="Liste des communautés"
      >
        <button
          v-for="community in store.filteredCommunities"
          :key="community.id"
          class="browser-split__item"
          :class="{ 'browser-split__item--active': store.expandedId === community.id }"
          role="option"
          :aria-selected="store.expandedId === community.id"
          @click="store.toggleExpand(community.id)"
        >
          <span
            class="browser-split__emoji"
            aria-hidden="true"
          >{{ community.emoji }}</span>
          <div class="browser-split__info">
            <span class="browser-split__name">
              {{ community.name }}
              <SourceBadge :source="community.source" />
            </span>
            <span class="browser-split__sub">{{ community.feature.name }}</span>
          </div>
        </button>
      </div>

      <!-- Colonne droite : détails -->
      <div
        v-if="selectedCommunity"
        ref="detailPanel"
        class="browser-split__detail"
      >
        <h2 class="detail-title">
          <span aria-hidden="true">{{ selectedCommunity.emoji }}</span>
          {{ selectedCommunity.name }}
          <SourceBadge :source="selectedCommunity.source" />
        </h2>

        <!-- Description -->
        <p class="community-description">
          {{ selectedCommunity.description }}
        </p>

        <!-- Feature de communauté -->
        <div
          class="community-feature"
          role="region"
          :aria-label="`Feature : ${selectedCommunity.feature.name}`"
        >
          <header class="community-feature__header">
            <h3 class="community-feature__name">
              {{ selectedCommunity.feature.name }}
            </h3>
          </header>
          <p class="community-feature__desc">
            {{ selectedCommunity.feature.description }}
          </p>
        </div>

        <!-- Phrase exemple (flavor) -->
        <blockquote
          v-if="selectedCommunity.flavor"
          class="community-flavor"
        >
          <p>« {{ selectedCommunity.flavor }} »</p>
        </blockquote>

        <!-- Adjectifs de personnalité -->
        <div
          class="community-adjectives"
          role="region"
          :aria-label="`Adjectifs de personnalité pour ${selectedCommunity.name}`"
        >
          <span class="community-adjectives__label">Adjectifs suggérés :</span>
          <div class="community-adjectives__row">
            <span
              v-for="adj in selectedCommunity.adjectives"
              :key="adj"
              class="adjective-tag"
            >{{ adj }}</span>
          </div>
        </div>

        <!-- Dupliquer en homebrew -->
        <button
          class="btn btn--secondary btn--sm community-duplicate-btn"
          @click.stop="duplicateToHomebrew(selectedCommunity)"
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
        <p>Sélectionnez une communauté pour voir ses détails</p>
      </div>
    </div>

    <!-- Etat vide -->
    <div
      v-else-if="!editingInline"
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
        Aucune communauté trouvée pour « {{ store.searchQuery }} »
      </p>
      <button
        class="empty-state__reset"
        @click="store.resetAll()"
      >
        Réinitialiser la recherche
      </button>
    </div>

    <!-- Panneau d'edition inline -->
    <aside
      v-if="editingInline"
      ref="editPanel"
      class="community-browser__edit-panel"
      aria-label="Edition de communauté custom"
    >
      <h3>{{ creatingNew ? 'Nouvelle communauté custom' : 'Modifier' }}</h3>
      <HomebrewForm
        :schema="communitySchema"
        :form-data="formData"
        :is-dirty="isDirty"
        :is-edit-mode="!creatingNew"
        :errors="[]"
        @submit="onSaveInline"
        @cancel="onCancelEdit"
        @update:field="onFieldUpdate"
      />
    </aside>

    <!-- Note de regle -->
    <aside
      class="rule-note"
      role="note"
      aria-label="Note de règle sur les communautés"
    >
      <p>
        <strong>Règle :</strong>
        Les communautés représentent un aspect clé de la culture, de la classe ou de
        l'environnement d'origine qui a eu le plus d'influence sur l'éducation de votre personnage.
        Chaque communauté accorde une <em>feature de communauté</em> et propose six adjectifs
        comme inspiration pour la personnalité du personnage.
        Un personnage choisit <em>une</em> communauté à la création.
      </p>
    </aside>
  </div>
</template>

<script>
import { ref, inject, computed, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useCommunityStore } from '../stores/communityStore.js'
import { useCommunityHomebrewStore } from '@modules/homebrew/categories/community/useCommunityHomebrewStore.js'
import SourceFilter from '@core/components/SourceFilter.vue'
import SourceBadge from '@core/components/SourceBadge.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { communitySchema } from '@modules/homebrew/schemas/communitySchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'

export default {
  name: 'CommunityBrowser',

  components: {
    SourceFilter,
    SourceBadge,
    HomebrewForm
  },

  setup() {
    const store = useCommunityStore()
    const homebrewStore = useCommunityHomebrewStore()
    const router = useRouter()
    const route = useRoute()
    const detailPanel = ref(null)
    const compendiumColumns = inject('compendiumColumns', ref(0))

    // --- Refs pour l'edition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editingCommunityId = ref(null)
    const editPanel = ref(null)

    function scrollToEditPanel() {
      nextTick(() => {
        editPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    // --- Composable formulaire ---
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(communitySchema)

    // Communauté sélectionnée pour le panneau de détails
    const selectedCommunity = computed(() => {
      if (!store.expandedId) return null
      return store.filteredCommunities.find((c) => c.id === store.expandedId) || null
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
      store.toggleExpand(id)
    }

    // Sélection initiale au montage
    selectFromRoute(route.params.id)

    // Mise à jour lors de la navigation intra-route
    onBeforeRouteUpdate((to) => selectFromRoute(to.params.id))

    function duplicateToHomebrew(community) {
      const result = homebrewStore.createFromTemplate(community)
      if (result.success) {
        router.push(`/compendium/communautes/${result.id}`)
      }
    }

    return {
      store,
      homebrewStore,
      selectedCommunity,
      duplicateToHomebrew,
      editingInline,
      creatingNew,
      editingCommunityId,
      formData,
      isDirty,
      hydrate,
      setField,
      toRawData,
      reset,
      communitySchema,
      editPanel,
      detailPanel,
      scrollToEditPanel,
      compendiumColumns
    }
  },

  methods: {
    // --- Edition inline ---
    startEdit(community) {
      // Priorité : données brutes du store homebrew
      const raw = this.homebrewStore.items.find((item) => item.id === community.id)
      this.hydrate(raw || community)
      this.editingInline = true
      this.creatingNew = false
      this.editingCommunityId = community.id
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
          this.store.toggleExpand(result.id)
        }
        this.creatingNew = false
      } else {
        const result = this.homebrewStore.update(this.editingCommunityId, data)
        if (!result.success && result.error && result.error.includes('introuvable')) {
          this.homebrewStore.create({ ...data, id: this.editingCommunityId })
        }
      }
      this.editingInline = false
      this.editingCommunityId = null
    },
    onCancelEdit() {
      this.editingInline = false
      this.creatingNew = false
      this.editingCommunityId = null
    }
  }
}
</script>

<style scoped>
.community-browser {
  display: flex;
  flex-direction: column;
}

/* -- Header -- */
.browser-header {
  margin-bottom: var(--space-sm);
}

.browser-header__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
}

.browser-header__subtitle {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--font-size-sm);
}

/* -- Toolbar -- */
.community-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-sm);
}

.community-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
}

/* -- Filtres -- */
.browser-filters {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  align-items: center;
}

.filter-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.filter-input:focus {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 1px;
}

.filter-clear {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--transition-fast);
}

.filter-clear:hover {
  background: var(--color-bg-elevated);
}

.filter-clear:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 1px;
}

/* ══ Split layout ══ */
.browser-split {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  flex: 1;
  min-height: 0;
}

@media (min-width: 768px) {
  .community-browser {
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
}

.browser-split__item:hover {
  background: var(--color-bg-surface);
  border-color: var(--color-accent-hope);
}

.browser-split__item--active {
  background: var(--color-bg-surface);
  border-color: var(--color-accent-hope);
  box-shadow: inset 3px 0 0 var(--color-accent-hope);
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
  color: var(--color-accent-hope);
  opacity: 0.85;
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
}

/* -- Description -- */
.community-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md);
  line-height: 1.6;
}

/* -- Feature -- */
.community-feature {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-hope);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
}

.community-feature__header {
  margin-bottom: var(--space-xs);
}

.community-feature__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-accent-hope);
}

.community-feature__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.6;
}

/* -- Flavor -- */
.community-flavor {
  border: none;
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin: 0 0 var(--space-md);
  font-style: italic;
}

.community-flavor p {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* -- Adjectifs -- */
.community-adjectives__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: var(--space-xs);
}

.community-adjectives__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.adjective-tag {
  font-size: var(--font-size-xs);
  padding: 2px var(--space-sm);
  background: rgba(83, 168, 182, 0.1);
  border: 1px solid rgba(83, 168, 182, 0.3);
  border-radius: var(--radius-full);
  color: var(--color-accent-hope);
  text-transform: capitalize;
}

.community-duplicate-btn {
  margin-top: var(--space-md);
  width: 100%;
}

/* -- Edit panel -- */
.community-browser__edit-panel {
  padding: var(--space-md);
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
  border-radius: var(--radius-md, 8px);
  margin-bottom: var(--space-lg);
}

.community-browser__edit-panel h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-family-heading);
}

/* -- Note de regle -- */
.rule-note {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-left: 3px solid #ca8a04;
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-top: var(--space-md);
  flex-shrink: 0;
}

.rule-note p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.rule-note strong {
  color: #ca8a04;
}

/* -- Empty state -- */
.empty-state {
  text-align: center;
  padding: var(--space-xl);
}

.empty-state__icon {
  font-size: 2rem;
  margin: 0 0 var(--space-sm);
}

.empty-state__text {
  color: var(--color-text-muted);
  margin: 0 0 var(--space-md);
}

.empty-state__reset {
  padding: var(--space-xs) var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-accent-hope);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.empty-state__reset:hover {
  background: var(--color-bg-surface);
}

.empty-state__reset:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 1px;
}

/* -- Accessibilite -- */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
