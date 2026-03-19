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

    <!-- Section Ascendances -->
    <section
      v-if="showAncestries && filteredAncestries.length"
      aria-label="Ascendances jouables"
    >
      <h2 class="section-title">
        Ascendances
      </h2>
      <div
        class="ancestry-grid"
        role="list"
        aria-label="Liste des ascendances"
      >
        <article
          v-for="ancestry in filteredAncestries"
          :key="ancestry.id"
          class="ancestry-card"
          role="listitem"
        >
          <!-- En-tete -->
          <button
            class="ancestry-card__header"
            :aria-expanded="expandedId === ancestry.id"
            :aria-controls="`ancestry-details-${ancestry.id}`"
            @click="toggleAncestry(ancestry.id)"
          >
            <span
              class="ancestry-card__emoji"
              aria-hidden="true"
            >{{ ancestry.emoji }}</span>
            <div class="ancestry-card__meta">
              <span class="ancestry-card__name">
                {{ ancestry.name }}
                <SourceBadge :source="ancestry.source" />
              </span>
            </div>
            <span
              class="ancestry-card__chevron"
              aria-hidden="true"
            >{{ expandedId === ancestry.id ? '&#9650;' : '&#9660;' }}</span>
          </button>

          <!-- Corps -->
          <div
            :id="`ancestry-details-${ancestry.id}`"
            class="ancestry-card__body"
            :hidden="expandedId !== ancestry.id"
          >
            <p class="ancestry-description">
              {{ ancestry.description }}
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
                  {{ ancestry.topFeature.name }}
                </h3>
                <p class="feature-block__desc">
                  {{ ancestry.topFeature.description }}
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
                  {{ ancestry.bottomFeature.name }}
                </h3>
                <p class="feature-block__desc">
                  {{ ancestry.bottomFeature.description }}
                </p>
              </div>
            </div>

            <!-- Bouton Modifier (custom uniquement) -->
            <button
              v-if="ancestry.source === 'custom'"
              class="btn btn--secondary btn--sm ancestry-card__edit-btn"
              aria-label="Modifier cette ascendance custom"
              @click.stop="startEdit(ancestry)"
            >
              Modifier
            </button>

            <!-- Dupliquer en homebrew -->
            <button
              class="btn btn--secondary btn--sm ancestry-card__duplicate-btn"
              @click.stop="duplicateToHomebrew(ancestry)"
            >
              Dupliquer en homebrew
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- Section Transformations -->
    <section
      v-if="showTransformations"
      class="transformations-section"
      aria-label="Cartes de transformation"
    >
      <h2 class="section-title">
        Transformations
        <span class="section-title__note">Cartes speciales SRD</span>
      </h2>
      <div
        class="ancestry-grid"
        role="list"
        aria-label="Liste des transformations"
      >
        <article
          v-for="transform in filteredTransformations"
          :key="transform.id"
          class="ancestry-card ancestry-card--transform"
          role="listitem"
        >
          <button
            class="ancestry-card__header"
            :aria-expanded="expandedId === `t_${transform.id}`"
            :aria-controls="`transform-details-${transform.id}`"
            @click="toggleAncestry(`t_${transform.id}`)"
          >
            <span
              class="ancestry-card__emoji"
              aria-hidden="true"
            >{{ transform.emoji }}</span>
            <div class="ancestry-card__meta">
              <span class="ancestry-card__name">{{ transform.name }}</span>
              <span class="badge badge--transform">Transformation</span>
            </div>
            <span
              class="ancestry-card__chevron"
              aria-hidden="true"
            >{{ expandedId === `t_${transform.id}` ? '&#9650;' : '&#9660;' }}</span>
          </button>

          <div
            :id="`transform-details-${transform.id}`"
            class="ancestry-card__body"
            :hidden="expandedId !== `t_${transform.id}`"
          >
            <p class="ancestry-description">
              {{ transform.description }}
            </p>
            <div class="features-grid">
              <div class="feature-block feature-block--top">
                <div class="feature-block__badge">
                  Haute
                </div>
                <h3 class="feature-block__name">
                  {{ transform.topFeature.name }}
                </h3>
                <p class="feature-block__desc">
                  {{ transform.topFeature.description }}
                </p>
              </div>
              <div class="feature-block feature-block--bottom">
                <div class="feature-block__badge">
                  Basse
                </div>
                <h3 class="feature-block__name">
                  {{ transform.bottomFeature.name }}
                </h3>
                <p class="feature-block__desc">
                  {{ transform.bottomFeature.description }}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Panneau d'edition inline -->
    <aside
      v-if="editingInline"
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
      v-if="!filteredAncestries.length && !filteredTransformations.length && !editingInline"
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
import { ref, computed } from 'vue'
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

    // --- Refs pour l'edition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editingAncestryId = ref(null)

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

    // --- Deep-linking : sélection depuis la route ---
    function selectFromRoute(id) {
      if (!id) return
      if (id === 'new') {
        editingInline.value = true
        creatingNew.value = true
        reset()
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
      toggleAncestry,
      duplicateToHomebrew,
      editingInline,
      creatingNew,
      editingAncestryId,
      formData,
      isDirty,
      hydrate,
      setField,
      toRawData,
      reset,
      ancestrySchema
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
.ancestry-browser { }

/* -- Header -- */
.browser-header { margin-bottom: var(--space-lg); }
.browser-header__title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.browser-header__subtitle { color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-sm); }

/* -- Toolbar -- */
.ancestry-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}

.ancestry-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
}

/* -- Filtres -- */
.browser-filters { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md); align-items: center; }
.filter-input { flex: 1; min-width: 200px; padding: var(--space-sm) var(--space-md); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-input:focus { outline: 2px solid var(--color-accent-hope); outline-offset: 1px; }
.filter-group { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.filter-chip { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; transition: all var(--transition-fast); }
.filter-chip:hover { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }
.filter-chip--active { background: var(--color-accent-hope); border-color: var(--color-accent-hope); color: #fff; font-weight: var(--font-weight-medium); }

/* -- Titres de section -- */
.section-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-md); display: flex; align-items: center; gap: var(--space-sm); }
.section-title__note { font-size: var(--font-size-xs); font-weight: normal; color: var(--color-text-muted); }
.transformations-section { margin-top: var(--space-xl); }

/* -- Grille -- */
.ancestry-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-sm); margin-bottom: var(--space-lg); }

/* -- Carte -- */
.ancestry-card { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; transition: border-color var(--transition-fast); }
.ancestry-card--transform { border-color: rgba(139, 92, 246, 0.3); }

.ancestry-card__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast);
}
.ancestry-card__header:hover { background: var(--color-bg-surface); }
.ancestry-card__header:focus-visible { outline: 2px solid var(--color-accent-hope); outline-offset: -2px; }

.ancestry-card__emoji { font-size: 1.5rem; width: 2rem; text-align: center; }
.ancestry-card__meta { flex: 1; display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.ancestry-card__name { font-weight: var(--font-weight-bold); font-size: var(--font-size-md); }
.ancestry-card__chevron { color: var(--color-text-muted); font-size: 0.75rem; }

/* -- Corps -- */
.ancestry-card__body { border-top: 1px solid var(--color-border); padding: var(--space-md); animation: slideDown 0.2s ease; }
.ancestry-card__body[hidden] { display: none; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

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

@media (max-width: 600px) {
  .ancestry-grid { grid-template-columns: 1fr; }
}
</style>
