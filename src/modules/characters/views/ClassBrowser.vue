<template>
  <div class="class-browser">
    <!-- ═══ En-tête ═══ -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        ⚔️ Classes & Spécialisations
      </h1>
      <p class="browser-header__subtitle">
        {{ filteredClasses.length }} classe{{ filteredClasses.length > 1 ? 's' : '' }} disponible{{ filteredClasses.length > 1 ? 's' : '' }}
      </p>
    </header>

    <!-- ═══ Filtres ═══ -->
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
      <div
        class="filter-group"
        role="group"
        aria-label="Filtrer par source"
      >
        <button
          v-for="source in sourceFilters"
          :key="source.id"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeSource === source.id }"
          :aria-pressed="activeSource === source.id"
          @click="setSource(source.id)"
        >
          {{ source.label }}
        </button>
      </div>
    </div>

    <!-- ═══ Grille de classes ═══ -->
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
        <!-- En-tête de la carte -->
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
            <span class="class-card__name">{{ cls.name }}</span>
            <span class="class-card__domains">{{ cls.domains.join(' + ') }}</span>
          </div>
          <div class="class-card__badges">
            <span
              v-if="cls.source === 'custom'"
              class="badge badge--custom"
              aria-label="Classe personnalisée"
            >Homebrew</span>
          </div>
          <span
            class="class-card__chevron"
            aria-hidden="true"
          >{{ expandedClassId === cls.id ? '▲' : '▼' }}</span>
        </button>

        <!-- Détails de la classe -->
        <div
          :id="`class-details-${cls.id}`"
          class="class-card__body"
          :hidden="expandedClassId !== cls.id"
        >
          <!-- Stats -->
          <div class="class-stats">
            <div class="stat-item">
              <span class="stat-item__label">Évasion de départ</span>
              <span class="stat-item__value">{{ cls.baseEvasion }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__label">PV de départ</span>
              <span class="stat-item__value">{{ cls.baseHP }}</span>
            </div>
          </div>

          <!-- Feature Espoir -->
          <section class="class-section">
            <h3 class="class-section__title">
              ✨ Feature d'Espoir
            </h3>
            <p class="class-section__text">
              {{ cls.hopeFeature }}
            </p>
          </section>

          <!-- Features de Classe -->
          <section class="class-section">
            <h3 class="class-section__title">
              ⚡ Features de Classe
            </h3>
            <ul class="feature-list">
              <li
                v-for="(feature, i) in cls.classFeatures"
                :key="i"
                class="feature-list__item"
              >
                {{ feature }}
              </li>
            </ul>
          </section>

          <!-- Sous-classes -->
          <section
            v-if="getSubclasses(cls.id).length"
            class="class-section"
          >
            <h3 class="class-section__title">
              🎯 Spécialisations
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
                    <span class="tier-block__label">Fondation (Niv. 1–4)</span>
                    <ul class="tier-block__list">
                      <li
                        v-for="(f, i) in sub.foundation"
                        :key="i"
                      >
                        {{ f }}
                      </li>
                    </ul>
                  </div>
                  <div class="tier-block">
                    <span class="tier-block__label">Spécialisation (Niv. 5–7)</span>
                    <ul class="tier-block__list">
                      <li
                        v-for="(s, si) in sub.specialization"
                        :key="si"
                      >
                        {{ s }}
                      </li>
                    </ul>
                  </div>
                  <div class="tier-block">
                    <span class="tier-block__label">Maîtrise (Niv. 8+)</span>
                    <ul class="tier-block__list">
                      <li
                        v-for="(m, mi) in sub.mastery"
                        :key="mi"
                      >
                        {{ m }}
                      </li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- Dupliquer en homebrew -->
          <button
            class="btn btn--secondary btn--sm class-card__duplicate-btn"
            @click.stop="duplicateToHomebrew(cls)"
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
        Aucune classe trouvée pour « {{ searchQuery }} »
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSubclassesForClass } from '@/data/subclasses/index.js'
import { useClassHomebrewStore } from '@modules/homebrew/categories/class/useClassHomebrewStore.js'
import { useCharacterStore } from '../stores/characterStore'

export default {
  name: 'ClassBrowser',

  setup() {
    const router = useRouter()
    const charStore = useCharacterStore()
    const searchQuery = ref('')
    const expandedClassId = ref(null)
    const activeSource = ref('all')

    const sourceFilters = [
      { id: 'all', label: 'Toutes' },
      { id: 'srd', label: 'Officielles (SRD)' },
      { id: 'custom', label: 'Homebrew' }
    ]

    const filteredClasses = computed(() => {
      const q = searchQuery.value.toLowerCase().trim()
      return charStore.allClasses.filter((cls) => {
        const matchSource = activeSource.value === 'all' || cls.source === activeSource.value
        const matchSearch = !q ||
          cls.name.toLowerCase().includes(q) ||
          cls.domains.some((d) => d.toLowerCase().includes(q))
        return matchSource && matchSearch
      })
    })

    function toggleClass(id) {
      expandedClassId.value = expandedClassId.value === id ? null : id
    }

    function setSource(source) {
      activeSource.value = source
    }

    function getSubclasses(classId) {
      try {
        // SRD d'abord
        const srd = getSubclassesForClass(classId)
        if (srd.length > 0) return srd
        // Homebrew : sous-classes embarquées
        const cls = charStore.allClasses.find((c) => c.id === classId)
        if (!cls || cls.source !== 'custom') return []
        const hb = useClassHomebrewStore().items.find((c) => c.id === classId)
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
      const homebrewStore = useClassHomebrewStore()

      // Convertir classFeatures (string[]) → objets {name, description}
      const formattedFeatures = Array.isArray(cls.classFeatures)
        ? cls.classFeatures.map((f) => {
          if (typeof f === 'string') {
            const colonIdx = f.indexOf(':')
            return colonIdx > 0
              ? { name: f.slice(0, colonIdx).trim(), description: f.slice(colonIdx + 1).trim() }
              : { name: f, description: '' }
          }
          return f
        })
        : []

      // Recuperer les sous-classes associees
      const subs = getSubclasses(cls.id).map((s) => ({
        name: s.name,
        spellcastTrait: s.spellcastTrait || null,
        description: s.description || '',
        foundation: Array.isArray(s.foundation) ? [...s.foundation] : [],
        specialization: Array.isArray(s.specialization) ? [...s.specialization] : [],
        mastery: Array.isArray(s.mastery) ? [...s.mastery] : []
      }))

      const data = {
        ...cls,
        classFeatures: formattedFeatures,
        subclasses: subs
      }

      const result = homebrewStore.createFromTemplate(data)
      if (result.success) {
        router.push(`/homebrew/class/${result.id}`)
      }
    }

    return {
      searchQuery,
      expandedClassId,
      activeSource,
      sourceFilters,
      filteredClasses,
      toggleClass,
      setSource,
      getSubclasses,
      duplicateToHomebrew
    }
  }
}
</script>

<style scoped>
.class-browser {
  max-width: 900px;
  margin: 0 auto;
}

/* ── Header ── */
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

/* ── Filtres ── */
.browser-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
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
.filter-group {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}
.filter-chip {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.filter-chip:hover { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }
.filter-chip--active {
  background: var(--color-accent-hope);
  border-color: var(--color-accent-hope);
  color: #fff;
  font-weight: var(--font-weight-medium);
}

/* ── Grille ── */
.class-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ── Carte de classe ── */
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
.class-card__badges { display: flex; gap: var(--space-xs); }
.class-card__chevron { color: var(--color-text-muted); font-size: 0.75rem; }

/* ── Body de la carte ── */
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

/* ── Stats ── */
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

/* ── Sections ── */
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

/* ── Feature list ── */
.feature-list {
  margin: 0;
  padding: 0 0 0 var(--space-md);
  list-style: disc;
}
.feature-list__item { font-size: var(--font-size-sm); line-height: 1.6; margin-bottom: var(--space-xs); color: var(--color-text-primary); }

/* ── Sous-classes ── */
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

/* ── Tiers ── */
.subclass-tiers { display: flex; flex-direction: column; gap: var(--space-sm); }
.tier-block { font-size: var(--font-size-xs); }
.tier-block__label { display: block; font-weight: var(--font-weight-bold); color: var(--color-accent-hope); margin-bottom: 2px; }
.tier-block__list { margin: 0; padding: 0 0 0 var(--space-md); list-style: disc; }
.tier-block__list li { margin-bottom: 2px; }
.tier-block p { margin: 0; }

/* ── Badges ── */
.badge {
  font-size: 0.65rem;
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.badge--custom { background: rgba(245, 158, 11, 0.15); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3); }
.badge--spell { background: rgba(139, 92, 246, 0.15); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

/* ── Empty state ── */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); }

/* ── Accessibilité ── */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}

@media (max-width: 600px) {
  .subclass-grid { grid-template-columns: 1fr; }
  .browser-filters { flex-direction: column; align-items: stretch; }
}

.class-card__duplicate-btn {
  margin-top: var(--space-md);
  width: 100%;
}
</style>
