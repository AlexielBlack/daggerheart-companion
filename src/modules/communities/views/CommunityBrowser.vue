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

    <!-- Grille -->
    <div
      v-if="store.filteredCommunities.length"
      class="community-grid"
      role="list"
      aria-label="Liste des communautés"
    >
      <CommunityCard
        v-for="community in store.filteredCommunities"
        :key="community.id"
        :community="community"
        :is-expanded="store.expandedId === community.id"
        @toggle="store.toggleExpand"
        @duplicate="duplicateToHomebrew"
      />
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
import { ref } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useCommunityStore } from '../stores/communityStore.js'
import { useCommunityHomebrewStore } from '@modules/homebrew/categories/community/useCommunityHomebrewStore.js'
import CommunityCard from '../components/CommunityCard.vue'
import SourceFilter from '@core/components/SourceFilter.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { communitySchema } from '@modules/homebrew/schemas/communitySchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'

export default {
  name: 'CommunityBrowser',

  components: {
    CommunityCard,
    SourceFilter,
    HomebrewForm
  },

  setup() {
    const store = useCommunityStore()
    const homebrewStore = useCommunityHomebrewStore()
    const router = useRouter()
    const route = useRoute()

    // --- Refs pour l'edition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editingCommunityId = ref(null)

    // --- Composable formulaire ---
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(communitySchema)

    // --- Deep-linking : sélection depuis la route ---
    function selectFromRoute(id) {
      if (!id) return
      if (id === 'new') {
        editingInline.value = true
        creatingNew.value = true
        reset()
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
      communitySchema
    }
  },

  methods: {
    // --- Edition inline ---
    startEdit(community) {
      this.hydrate(community)
      this.editingInline = true
      this.creatingNew = false
      this.editingCommunityId = community.id
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
        this.homebrewStore.update(this.editingCommunityId, data)
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
}

/* -- Header -- */
.browser-header {
  margin-bottom: var(--space-lg);
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
  margin-bottom: var(--space-lg);
}

.community-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
}

/* -- Filtres -- */
.browser-filters {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
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

/* -- Grille -- */
.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
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

@media (max-width: 600px) {
  .community-grid {
    grid-template-columns: 1fr;
  }
}
</style>
