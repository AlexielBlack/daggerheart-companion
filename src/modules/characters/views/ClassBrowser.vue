<template>
  <div class="class-browser">
    <!-- En-tete -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        Classes &amp; Specialisations
      </h1>
      <p class="browser-header__subtitle">
        {{ filteredClasses.length }} classe{{ filteredClasses.length > 1 ? 's' : '' }} disponible{{ filteredClasses.length > 1 ? 's' : '' }}
      </p>
    </header>

    <!-- Filtres -->
    <div
      class="browser-filters"
      role="search"
      aria-label="Filtrer les classes"
    >
      <label
        class="sr-only"
        for="class-search"
      >Rechercher une classe</label>
      <input
        id="class-search"
        v-model="searchQuery"
        type="search"
        class="filter-input"
        placeholder="Rechercher une classe..."
        aria-label="Rechercher une classe"
      />
    </div>

    <!-- Filtre par source + bouton creation -->
    <div class="class-browser__toolbar">
      <SourceFilter v-model="charStore.classSourceFilter" />
      <router-link
        to="/compendium/classes/new"
        class="btn btn--secondary btn--sm class-browser__create-btn"
        aria-label="Créer une classe custom"
      >
        + Créer un custom
      </router-link>
    </div>

    <!-- Grille de classes -->
    <div
      v-if="filteredClasses.length"
      class="class-grid"
      role="list"
      aria-label="Liste des classes"
    >
      <article
        v-for="cls in filteredClasses"
        :key="cls.id"
        class="class-card"
        :class="{ 'class-card--expanded': expandedClassId === cls.id }"
        role="listitem"
      >
        <!-- En-tete de la carte -->
        <button
          class="class-card__header"
          :aria-expanded="expandedClassId === cls.id"
          :aria-controls="`class-details-${cls.id}`"
          @click="toggleClass(cls.id)"
        >
          <span
            class="class-card__emoji"
            aria-hidden="true"
          >{{ cls.emoji }}</span>
          <div class="class-card__info">
            <span class="class-card__name">
              {{ cls.name }}
              <SourceBadge :source="cls.source" />
            </span>
            <span class="class-card__domains">{{ cls.domains.join(' + ') }}</span>
          </div>
          <span
            class="class-card__chevron"
            aria-hidden="true"
          >{{ expandedClassId === cls.id ? '&#9650;' : '&#9660;' }}</span>
        </button>

        <!-- Details de la classe -->
        <div
          :id="`class-details-${cls.id}`"
          class="class-card__body"
          :hidden="expandedClassId !== cls.id"
        >
          <!-- Stats -->
          <div class="class-stats">
            <div class="stat-item">
              <span class="stat-item__label">Evasion de depart</span>
              <span class="stat-item__value">{{ cls.baseEvasion }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__label">PV de depart</span>
              <span class="stat-item__value">{{ cls.baseHP }}</span>
            </div>
          </div>

          <!-- Feature Espoir -->
          <section class="class-section">
            <h3 class="class-section__title">
              Feature d'Espoir
            </h3>
            <p class="class-section__text">
              {{ typeof cls.hopeFeature === 'object' ? `${cls.hopeFeature.name} : ${cls.hopeFeature.description}` : cls.hopeFeature }}
            </p>
          </section>

          <!-- Features de Classe -->
          <section class="class-section">
            <h3 class="class-section__title">
              Features de Classe
            </h3>
            <ul class="feature-list">
              <li
                v-for="(feature, i) in cls.classFeatures"
                :key="i"
                class="feature-list__item"
              >
                {{ typeof feature === 'object' ? `${feature.name} : ${feature.description}` : feature }}
              </li>
            </ul>
          </section>

          <!-- Sous-classes -->
          <section
            v-if="getSubclasses(cls.id).length"
            class="class-section"
          >
            <h3 class="class-section__title">
              Specialisations
            </h3>
            <div class="subclass-grid">
              <article
                v-for="sub in getSubclasses(cls.id)"
                :key="sub.id"
                class="subclass-card"
              >
                <header class="subclass-card__header">
                  <h4 class="subclass-card__name">
                    {{ sub.name }}
                  </h4>
                  <span
                    v-if="sub.spellcastTrait"
                    class="badge badge--spell"
                    :aria-label="`Sort : ${sub.spellcastTrait}`"
                  >Sort : {{ sub.spellcastTrait }}</span>
                </header>
                <p class="subclass-card__description">
                  {{ sub.description }}
                </p>
                <div class="subclass-tiers">
                  <div class="tier-block">
                    <span class="tier-block__label">Fondation (Niv. 1-4)</span>
                    <ul class="tier-block__list">
                      <li
                        v-for="(f, i) in sub.foundation"
                        :key="i"
                      >
                        {{ typeof f === 'object' ? `${f.name} : ${f.description}` : f }}
                      </li>
                    </ul>
                  </div>
                  <div class="tier-block">
                    <span class="tier-block__label">Specialisation (Niv. 5-7)</span>
                    <ul class="tier-block__list">
                      <li
                        v-for="(s, si) in sub.specialization"
                        :key="si"
                      >
                        {{ typeof s === 'object' ? `${s.name} : ${s.description}` : s }}
                      </li>
                    </ul>
                  </div>
                  <div class="tier-block">
                    <span class="tier-block__label">Maitrise (Niv. 8+)</span>
                    <ul class="tier-block__list">
                      <li
                        v-for="(m, mi) in sub.mastery"
                        :key="mi"
                      >
                        {{ typeof m === 'object' ? `${m.name} : ${m.description}` : m }}
                      </li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- Bouton Modifier (custom uniquement) -->
          <button
            v-if="cls.source === 'custom'"
            class="btn btn--secondary btn--sm class-card__edit-btn"
            aria-label="Modifier cette classe custom"
            @click.stop="startEdit(cls)"
          >
            Modifier
          </button>

          <!-- Dupliquer en homebrew -->
          <button
            class="btn btn--secondary btn--sm class-card__duplicate-btn"
            @click.stop="duplicateToHomebrew(cls)"
          >
            Dupliquer en homebrew
          </button>
        </div>
      </article>
    </div>

    <!-- Panneau d'edition inline -->
    <aside
      v-if="editingInline"
      class="class-browser__edit-panel"
      aria-label="Edition de classe custom"
    >
      <h3>{{ creatingNew ? 'Nouvelle classe custom' : 'Modifier' }}</h3>
      <HomebrewForm
        :schema="classSchema"
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
      v-if="!filteredClasses.length && !editingInline"
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
        Aucune classe trouvée pour « {{ searchQuery }} »
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { getSubclassesForClass } from '@/data/subclasses/index.js'
import { useClassHomebrewStore } from '@modules/homebrew/categories/class/useClassHomebrewStore.js'
import { useCharacterStore } from '../stores/characterStore'
import SourceFilter from '@core/components/SourceFilter.vue'
import SourceBadge from '@core/components/SourceBadge.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { classSchema } from '@modules/homebrew/schemas/classSchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'

export default {
  name: 'ClassBrowser',

  components: {
    SourceFilter,
    SourceBadge,
    HomebrewForm
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const charStore = useCharacterStore()
    const homebrewStore = useClassHomebrewStore()
    const searchQuery = ref('')
    const expandedClassId = ref(null)

    // --- Refs pour l'édition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editingClassId = ref(null)

    // --- Composable formulaire ---
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(classSchema)

    // Filtrage : intègre le classSourceFilter du store
    const filteredClasses = computed(() => {
      const q = searchQuery.value.toLowerCase().trim()
      const sourceVal = charStore.classSourceFilter
      return charStore.allClasses.filter((cls) => {
        const matchSource = sourceVal === 'all' || cls.source === sourceVal
        const matchSearch = !q ||
          cls.name.toLowerCase().includes(q) ||
          cls.domains.some((d) => d.toLowerCase().includes(q))
        return matchSource && matchSearch
      })
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
      expandedClassId.value = id
    }

    // Sélection initiale au montage
    selectFromRoute(route.params.id)

    // Mise à jour lors de la navigation intra-route
    onBeforeRouteUpdate((to) => selectFromRoute(to.params.id))

    function toggleClass(id) {
      expandedClassId.value = expandedClassId.value === id ? null : id
    }

    function getSubclasses(classId) {
      try {
        // SRD d'abord
        const srd = getSubclassesForClass(classId)
        if (srd.length > 0) return srd
        // Homebrew : sous-classes embarquées
        const cls = charStore.allClasses.find((c) => c.id === classId)
        if (!cls || cls.source !== 'custom') return []
        const hb = homebrewStore.items.find((c) => c.id === classId)
        if (!hb || !Array.isArray(hb.subclasses)) return []
        return hb.subclasses.map((sub, i) => ({
          id: sub.name ? sub.name.toLowerCase().replace(/\s+/g, '-') : `sub-${i}`,
          name: sub.name || `Sous-classe ${i + 1}`,
          spellcastTrait: sub.spellcastTrait || null,
          description: sub.description || '',
          foundation: Array.isArray(sub.foundation) ? sub.foundation : [],
          specialization: Array.isArray(sub.specialization) ? sub.specialization : [],
          mastery: Array.isArray(sub.mastery) ? sub.mastery : []
        }))
      } catch {
        return []
      }
    }

    function duplicateToHomebrew(cls) {
      // Convertir classFeatures : accepter objets FeatureDescriptor ou strings
      const formattedFeatures = Array.isArray(cls.classFeatures)
        ? cls.classFeatures.map((f) => {
          if (typeof f === 'object' && f.name) {
            return { name: f.name, description: f.description || '' }
          }
          if (typeof f === 'string') {
            const colonIdx = f.indexOf(':')
            return colonIdx > 0
              ? { name: f.slice(0, colonIdx).trim(), description: f.slice(colonIdx + 1).trim() }
              : { name: f, description: '' }
          }
          return f
        })
        : []

      // Récupérer les sous-classes associées
      const featToString = (f) => (typeof f === 'object' && f.name ? `${f.name} : ${f.description}` : f)
      const subs = getSubclasses(cls.id).map((s) => ({
        name: s.name,
        spellcastTrait: s.spellcastTrait || null,
        description: s.description || '',
        foundation: Array.isArray(s.foundation) ? s.foundation.map(featToString) : [],
        specialization: Array.isArray(s.specialization) ? s.specialization.map(featToString) : [],
        mastery: Array.isArray(s.mastery) ? s.mastery.map(featToString) : []
      }))

      const data = {
        ...cls,
        classFeatures: formattedFeatures,
        subclasses: subs
      }

      const result = homebrewStore.createFromTemplate(data)
      if (result.success) {
        router.push(`/compendium/classes/${result.id}`)
      }
    }

    return {
      charStore,
      homebrewStore,
      searchQuery,
      expandedClassId,
      filteredClasses,
      toggleClass,
      getSubclasses,
      duplicateToHomebrew,
      editingInline,
      creatingNew,
      editingClassId,
      formData,
      isDirty,
      hydrate,
      setField,
      toRawData,
      reset,
      classSchema
    }
  },

  methods: {
    // --- Edition inline ---
    startEdit(cls) {
      // Priorité : données brutes du store homebrew (format formulaire)
      const raw = this.homebrewStore.items.find((item) => item.id === cls.id)
      if (raw) {
        this.hydrate(raw)
      } else {
        // Classe statique custom : convertir au format formulaire
        const adapted = { ...cls }
        if (typeof adapted.hopeFeature === 'object' && adapted.hopeFeature !== null) {
          adapted.hopeFeature = `${adapted.hopeFeature.name} : ${adapted.hopeFeature.description}`
        }
        if (Array.isArray(adapted.classFeatures)) {
          adapted.classFeatures = adapted.classFeatures.map((f) =>
            typeof f === 'string' ? { name: f, description: '' } : { name: f.name || '', description: f.description || '', tags: f.tags || [] }
          )
        }
        this.hydrate(adapted)
      }
      this.editingInline = true
      this.creatingNew = false
      this.editingClassId = cls.id
    },
    onFieldUpdate({ field, value }) {
      this.setField(field, value)
    },
    onSaveInline() {
      const data = this.toRawData()
      if (this.creatingNew) {
        const result = this.homebrewStore.create(data)
        if (result.success) {
          this.expandedClassId = result.id
        }
        this.creatingNew = false
      } else {
        const result = this.homebrewStore.update(this.editingClassId, data)
        // Si l'item n'existe pas dans le store (classe statique), le creer
        if (!result.success && result.error && result.error.includes('introuvable')) {
          this.homebrewStore.create({ ...data, id: this.editingClassId })
        }
      }
      this.editingInline = false
      this.editingClassId = null
    },
    onCancelEdit() {
      this.editingInline = false
      this.creatingNew = false
      this.editingClassId = null
    }
  }
}
</script>

<style scoped>
.class-browser {
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
.class-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}

.class-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
}

/* -- Filtres -- */
.browser-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  align-items: center;
}
.filter-input {
  flex: 1;
  min-width: 200px;
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

/* -- Grille -- */
.class-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* -- Carte de classe -- */
.class-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}
.class-card--expanded {
  border-color: var(--color-accent-hope);
}
.class-card__header {
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
.class-card__header:hover { background: var(--color-bg-surface); }
.class-card__header:focus-visible { outline: 2px solid var(--color-accent-hope); outline-offset: -2px; }

.class-card__emoji { font-size: 1.5rem; width: 2rem; text-align: center; }
.class-card__info { flex: 1; }
.class-card__name { display: block; font-weight: var(--font-weight-bold); font-size: var(--font-size-md); }
.class-card__domains { display: block; font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px; }
.class-card__chevron { color: var(--color-text-muted); font-size: 0.75rem; }

/* -- Body de la carte -- */
.class-card__body {
  border-top: 1px solid var(--color-border);
  padding: var(--space-md);
  animation: slideDown 0.2s ease;
}
.class-card__body[hidden] { display: none; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* -- Stats -- */
.class-stats {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}
.stat-item { text-align: center; min-width: 80px; }
.stat-item__label { display: block; font-size: var(--font-size-xs); color: var(--color-text-muted); }
.stat-item__value { display: block; font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-accent-hope); }

/* -- Sections -- */
.class-section { margin-bottom: var(--space-md); }
.class-section__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-xs);
}
.class-section__text { margin: 0; font-size: var(--font-size-sm); line-height: 1.6; color: var(--color-text-primary); }

/* -- Feature list -- */
.feature-list {
  margin: 0;
  padding: 0 0 0 var(--space-md);
  list-style: disc;
}
.feature-list__item { font-size: var(--font-size-sm); line-height: 1.6; margin-bottom: var(--space-xs); color: var(--color-text-primary); }

/* -- Sous-classes -- */
.subclass-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}
.subclass-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}
.subclass-card__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs); margin-bottom: var(--space-sm); flex-wrap: wrap; }
.subclass-card__name { font-size: var(--font-size-md); font-weight: var(--font-weight-bold); margin: 0; }
.subclass-card__description { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0 0 var(--space-sm); line-height: 1.5; }

/* -- Tiers -- */
.subclass-tiers { display: flex; flex-direction: column; gap: var(--space-sm); }
.tier-block { font-size: var(--font-size-xs); }
.tier-block__label { display: block; font-weight: var(--font-weight-bold); color: var(--color-accent-hope); margin-bottom: 2px; }
.tier-block__list { margin: 0; padding: 0 0 0 var(--space-md); list-style: disc; }
.tier-block__list li { margin-bottom: 2px; }
.tier-block p { margin: 0; }

/* -- Badges -- */
.badge {
  font-size: 0.65rem;
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge--spell { background: rgba(139, 92, 246, 0.15); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

/* -- Empty state -- */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); }

/* -- Edit panel -- */
.class-browser__edit-panel {
  padding: var(--space-md);
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
  border-radius: var(--radius-md, 8px);
  margin-top: var(--space-md);
}

.class-browser__edit-panel h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-family-heading);
}

.class-card__edit-btn {
  margin-top: var(--space-md);
  width: 100%;
}

.class-card__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}

/* -- Accessibilite -- */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}

@media (max-width: 600px) {
  .subclass-grid { grid-template-columns: 1fr; }
  .browser-filters { flex-direction: column; align-items: stretch; }
}
</style>
