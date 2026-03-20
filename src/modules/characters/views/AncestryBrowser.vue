<template>
  <div class="ancestry-browser">
    <!-- En-tete -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        Ascendances
      </h1>
      <p class="browser-header__subtitle">
        {{ filteredAncestries.length }} ascendance{{ filteredAncestries.length > 1 ? 's' : '' }} +
        {{ TRANSFORMATIONS.length }} transformations
      </p>
    </header>

    <!-- Filtres -->
    <div
      class="browser-filters"
      role="search"
      aria-label="Filtrer les ascendances"
    >
      <label
        class="sr-only"
        for="ancestry-search"
      >Rechercher une ascendance</label>
      <input
        id="ancestry-search"
        v-model="searchQuery"
        type="search"
        class="filter-input"
        placeholder="Rechercher une ascendance..."
        aria-label="Rechercher une ascendance"
      />
      <div
        class="filter-group"
        role="group"
        aria-label="Filtrer par source"
      >
        <button
          v-for="f in sourceFilters"
          :key="f.id"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeSource === f.id }"
          :aria-pressed="activeSource === f.id"
          @click="activeSource = f.id"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Toolbar : bouton creation -->
    <div class="ancestry-browser__toolbar">
      <router-link
        to="/compendium/ascendances/new"
        class="btn btn--secondary btn--sm ancestry-browser__create-btn"
        aria-label="Créer une ascendance custom"
      >
        + Créer un custom
      </router-link>
    </div>

    <!-- Layout split : liste + détails -->
    <div
      v-if="allItems.length"
      class="browser-split"
    >
      <!-- Colonne gauche : liste de sélection -->
      <div
        class="browser-split__list"
        role="listbox"
        aria-label="Liste des ascendances"
      >
        <!-- Ascendances -->
        <template v-if="showAncestries && filteredAncestries.length">
          <div class="browser-split__group-label">
            Ascendances
          </div>
          <button
            v-for="ancestry in filteredAncestries"
            :key="ancestry.id"
            class="browser-split__item"
            :class="{ 'browser-split__item--active': expandedId === ancestry.id }"
            role="option"
            :aria-selected="expandedId === ancestry.id"
            @click="toggleAncestry(ancestry.id)"
          >
            <span
              class="browser-split__emoji"
              aria-hidden="true"
            >{{ ancestry.emoji }}</span>
            <div class="browser-split__info">
              <span class="browser-split__name">
                {{ ancestry.name }}
                <SourceBadge :source="ancestry.source" />
              </span>
            </div>
          </button>
        </template>

        <!-- Transformations -->
        <template v-if="showTransformations && filteredTransformations.length">
          <div class="browser-split__group-label browser-split__group-label--transform">
            Transformations
          </div>
          <button
            v-for="transform in filteredTransformations"
            :key="`t_${transform.id}`"
            class="browser-split__item browser-split__item--transform"
            :class="{ 'browser-split__item--active': expandedId === `t_${transform.id}` }"
            role="option"
            :aria-selected="expandedId === `t_${transform.id}`"
            @click="toggleAncestry(`t_${transform.id}`)"
          >
            <span
              class="browser-split__emoji"
              aria-hidden="true"
            >{{ transform.emoji }}</span>
            <div class="browser-split__info">
              <span class="browser-split__name">
                {{ transform.name }}
                <span class="badge badge--transform">Transformation</span>
              </span>
            </div>
          </button>
        </template>
      </div>

      <!-- Colonne droite : détails -->
      <div
        v-if="selectedItem"
        ref="detailPanel"
        class="browser-split__detail"
      >
        <h2 class="detail-title">
          <span aria-hidden="true">{{ selectedItem.emoji }}</span>
          {{ selectedItem.name }}
          <SourceBadge
            v-if="selectedItem.source"
            :source="selectedItem.source"
          />
          <span
            v-if="selectedItem.isTransformation"
            class="badge badge--transform"
          >Transformation</span>
        </h2>

        <p class="ancestry-description">
          {{ selectedItem.description }}
        </p>

        <div class="features-grid">
          <!-- Feature Haute -->
          <div class="feature-block feature-block--top">
            <div
              class="feature-block__badge"
              aria-label="Feature haute (Top)"
            >
              Haute
            </div>
            <h3 class="feature-block__name">
              {{ selectedItem.topFeature.name }}
            </h3>
            <p class="feature-block__desc">
              {{ selectedItem.topFeature.description }}
            </p>
          </div>
          <!-- Feature Basse -->
          <div class="feature-block feature-block--bottom">
            <div
              class="feature-block__badge"
              aria-label="Feature basse (Bottom)"
            >
              Basse
            </div>
            <h3 class="feature-block__name">
              {{ selectedItem.bottomFeature.name }}
            </h3>
            <p class="feature-block__desc">
              {{ selectedItem.bottomFeature.description }}
            </p>
          </div>
        </div>

        <!-- Bouton Modifier (custom uniquement, ascendances seulement) -->
        <button
          v-if="selectedItem.source === 'custom' && !selectedItem.isTransformation"
          class="btn btn--secondary btn--sm ancestry-card__edit-btn"
          aria-label="Modifier cette ascendance custom"
          @click.stop="startEdit(selectedItem)"
        >
          Modifier
        </button>

        <!-- Dupliquer en homebrew (ascendances seulement) -->
        <button
          v-if="!selectedItem.isTransformation"
          class="btn btn--secondary btn--sm ancestry-card__duplicate-btn"
          @click.stop="duplicateToHomebrew(selectedItem)"
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
        <p>Sélectionnez une ascendance pour voir ses détails</p>
      </div>
    </div>

    <!-- Panneau d'edition inline -->
    <aside
      v-if="editingInline"
      ref="editPanel"
      class="ancestry-browser__edit-panel"
      aria-label="Edition d'ascendance custom"
    >
      <h3>{{ creatingNew ? 'Nouvelle ascendance custom' : 'Modifier' }}</h3>
      <HomebrewForm
        :schema="ancestrySchema"
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
      v-if="!allItems.length && !editingInline"
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
        Aucune ascendance trouvée pour « {{ searchQuery }} »
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { SRD_ANCESTRIES, CUSTOM_ANCESTRIES, TRANSFORMATIONS } from '@/data/ancestries/index.js'
import { useAncestryHomebrewStore } from '@modules/homebrew/categories/ancestry/useAncestryHomebrewStore.js'
import { useCharacterStore } from '../stores/characterStore'
import SourceBadge from '@core/components/SourceBadge.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { ancestrySchema } from '@modules/homebrew/schemas/ancestrySchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'

export default {
  name: 'AncestryBrowser',

  components: {
    SourceBadge,
    HomebrewForm
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const charStore = useCharacterStore()
    const homebrewStore = useAncestryHomebrewStore()
    const searchQuery = ref('')
    const expandedId = ref(null)
    const detailPanel = ref(null)
    const compendiumColumns = inject('compendiumColumns', ref(0))

    // --- Refs pour l'edition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editingAncestryId = ref(null)
    const editPanel = ref(null)

    function scrollToEditPanel() {
      nextTick(() => {
        editPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    // --- Composable formulaire ---
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(ancestrySchema)

    // Utilise ancestrySourceFilter du charStore + le filtre transformation local
    const activeSource = computed({
      get: () => charStore.ancestrySourceFilter,
      set: (val) => { charStore.ancestrySourceFilter = val }
    })

    const sourceFilters = [
      { id: 'all', label: 'Toutes' },
      { id: 'srd', label: 'SRD' },
      { id: 'custom', label: 'Homebrew' },
      { id: 'transformation', label: 'Transformations' }
    ]

    /** Ascendances homebrew normalisées (source: 'custom') */
    const homebrewAncestries = computed(() =>
      homebrewStore.items.map((item) => ({
        ...item,
        source: 'custom'
      }))
    )

    const showAncestries = computed(() => activeSource.value !== 'transformation')
    const showTransformations = computed(() => activeSource.value === 'all' || activeSource.value === 'transformation')

    const filteredAncestries = computed(() => {
      const q = searchQuery.value.toLowerCase().trim()
      const pool =
        activeSource.value === 'srd' ? SRD_ANCESTRIES :
        activeSource.value === 'custom' ? [...CUSTOM_ANCESTRIES, ...homebrewAncestries.value] :
        [...SRD_ANCESTRIES, ...CUSTOM_ANCESTRIES, ...homebrewAncestries.value]
      if (!q) return pool
      return pool.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.topFeature?.name || '').toLowerCase().includes(q) ||
        (a.bottomFeature?.name || '').toLowerCase().includes(q)
      )
    })

    const filteredTransformations = computed(() => {
      if (activeSource.value !== 'all' && activeSource.value !== 'transformation') return []
      const q = searchQuery.value.toLowerCase().trim()
      if (!q) return TRANSFORMATIONS
      return TRANSFORMATIONS.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      )
    })

    // Tous les items visibles (pour le v-if de l'état vide)
    const allItems = computed(() => [
      ...(showAncestries.value ? filteredAncestries.value : []),
      ...(showTransformations.value ? filteredTransformations.value : [])
    ])

    // Item sélectionné pour le panneau de détails
    const selectedItem = computed(() => {
      if (!expandedId.value) return null
      // Vérifier les ascendances
      const ancestry = [...SRD_ANCESTRIES, ...CUSTOM_ANCESTRIES, ...homebrewAncestries.value]
        .find((a) => a.id === expandedId.value)
      if (ancestry) return { ...ancestry, isTransformation: false }
      // Vérifier les transformations (prefixe t_)
      if (expandedId.value.startsWith('t_')) {
        const transformId = expandedId.value.slice(2)
        const transform = TRANSFORMATIONS.find((t) => t.id === transformId)
        if (transform) return { ...transform, isTransformation: true }
      }
      return null
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
      expandedId.value = id
    }

    // Sélection initiale au montage
    selectFromRoute(route.params.id)

    // Mise à jour lors de la navigation intra-route
    onBeforeRouteUpdate((to) => selectFromRoute(to.params.id))

    function toggleAncestry(id) {
      expandedId.value = expandedId.value === id ? null : id
      if (expandedId.value) {
        nextTick(() => {
          detailPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    }

    function duplicateToHomebrew(ancestry) {
      const result = homebrewStore.createFromTemplate(ancestry)
      if (result.success) {
        router.push(`/compendium/ascendances/${result.id}`)
      }
    }

    return {
      TRANSFORMATIONS,
      charStore,
      homebrewStore,
      searchQuery,
      expandedId,
      activeSource,
      sourceFilters,
      showAncestries,
      showTransformations,
      filteredAncestries,
      filteredTransformations,
      allItems,
      selectedItem,
      toggleAncestry,
      duplicateToHomebrew,
      editingInline,
      creatingNew,
      editingAncestryId,
      editPanel,
      detailPanel,
      scrollToEditPanel,
      formData,
      isDirty,
      hydrate,
      setField,
      toRawData,
      reset,
      ancestrySchema,
      compendiumColumns
    }
  },

  methods: {
    // --- Edition inline ---
    startEdit(ancestry) {
      // Priorité : données brutes du store homebrew
      const raw = this.homebrewStore.items.find((item) => item.id === ancestry.id)
      this.hydrate(raw || ancestry)
      this.editingInline = true
      this.creatingNew = false
      this.editingAncestryId = ancestry.id
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
          this.expandedId = result.id
        }
        this.creatingNew = false
      } else {
        const result = this.homebrewStore.update(this.editingAncestryId, data)
        if (!result.success && result.error && result.error.includes('introuvable')) {
          this.homebrewStore.create({ ...data, id: this.editingAncestryId })
        }
      }
      this.editingInline = false
      this.editingAncestryId = null
    },
    onCancelEdit() {
      this.editingInline = false
      this.creatingNew = false
      this.editingAncestryId = null
    }
  }
}
</script>

<style scoped>
.ancestry-browser {
  display: flex;
  flex-direction: column;
}

/* -- Header -- */
.browser-header { margin-bottom: var(--space-sm); }
.browser-header__title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.browser-header__subtitle { color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-sm); }

/* -- Toolbar -- */
.ancestry-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-sm);
}

.ancestry-browser__create-btn {
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

/* ══ Split layout ══ */
.browser-split {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  flex: 1;
  min-height: 0;
}

@media (min-width: 768px) {
  .ancestry-browser {
    height: 100%;
    overflow: hidden;
  }

  .browser-split {
    display: grid;
    grid-template-columns: minmax(220px, 280px) 1fr;
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

.browser-split__group-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-xs) var(--space-sm);
  margin-top: var(--space-xs);
}

.browser-split__group-label:first-child {
  margin-top: 0;
}

.browser-split__group-label--transform {
  color: #7c3aed;
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

.browser-split__item--transform {
  border-color: rgba(139, 92, 246, 0.2);
}

.browser-split__item--transform:hover,
.browser-split__item--transform.browser-split__item--active {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: inset 3px 0 0 #7c3aed;
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
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
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
  flex-wrap: wrap;
}

.ancestry-description { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0 0 var(--space-md); line-height: 1.6; }

/* -- Features -- */
.features-grid { display: flex; flex-direction: column; gap: var(--space-sm); }

.feature-block {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  position: relative;
}
.feature-block--top { background: rgba(83, 168, 182, 0.05); border-color: rgba(83, 168, 182, 0.2); }
.feature-block--bottom { background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.2); }

.feature-block__badge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-xs);
}
.feature-block--top .feature-block__badge { background: rgba(83, 168, 182, 0.2); color: var(--color-accent-hope); }
.feature-block--bottom .feature-block__badge { background: rgba(245, 158, 11, 0.2); color: #d97706; }

.feature-block__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); margin: 0 0 4px; }
.feature-block__desc { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; line-height: 1.5; }

/* -- Badges -- */
.badge { font-size: 0.6rem; padding: 2px 6px; border-radius: var(--radius-sm); font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; }
.badge--srd { background: rgba(83, 168, 182, 0.1); color: var(--color-accent-hope); border: 1px solid rgba(83, 168, 182, 0.3); }
.badge--custom { background: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge--transform { background: rgba(139, 92, 246, 0.1); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

/* -- Edit panel -- */
.ancestry-browser__edit-panel {
  padding: var(--space-md);
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
  border-radius: var(--radius-md, 8px);
  margin-top: var(--space-md);
}

.ancestry-browser__edit-panel h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-family-heading);
}

.ancestry-card__edit-btn {
  margin-top: var(--space-md);
  width: 100%;
}

.ancestry-card__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}

/* -- Empty state -- */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); }

/* -- Accessibilite -- */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }
</style>
