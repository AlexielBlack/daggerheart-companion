<template>
  <div class="community-browser">
    <!-- ═══ En-tête ═══ -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        🏘️ Communautés
      </h1>
      <p class="browser-header__subtitle">
        {{ filteredCommunities.length }} communauté{{ filteredCommunities.length > 1 ? 's' : '' }}
        — Choisissez d'où vient votre personnage
      </p>
    </header>

    <!-- ═══ Filtres ═══ -->
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
        v-model="searchQuery"
        type="search"
        class="filter-input"
        placeholder="Rechercher une communauté ou un trait..."
        aria-label="Rechercher une communauté"
      />
    </div>

    <!-- ═══ Grille ═══ -->
    <div
      v-if="filteredCommunities.length"
      class="community-grid"
      role="list"
      aria-label="Liste des communautés"
    >
      <article
        v-for="community in filteredCommunities"
        :key="community.id"
        class="community-card"
        role="listitem"
      >
        <!-- En-tête de la carte -->
        <button
          class="community-card__header"
          :aria-expanded="expandedId === community.id"
          :aria-controls="`community-details-${community.id}`"
          @click="toggleCommunity(community.id)"
        >
          <span
            class="community-card__emoji"
            aria-hidden="true"
          >{{ community.emoji }}</span>
          <div class="community-card__meta">
            <span class="community-card__name">{{ community.name }}</span>
            <div
              class="community-card__traits"
              aria-hidden="true"
            >
              <span
                v-for="trait in community.traits"
                :key="trait"
                class="trait-tag"
              >{{ trait }}</span>
            </div>
          </div>
          <span
            class="community-card__chevron"
            aria-hidden="true"
          >{{ expandedId === community.id ? '▲' : '▼' }}</span>
        </button>

        <!-- Corps de la carte -->
        <div
          :id="`community-details-${community.id}`"
          class="community-card__body"
          :hidden="expandedId !== community.id"
        >
          <!-- Description -->
          <p class="community-description">
            {{ community.description }}
          </p>

          <!-- Feature de communauté -->
          <div
            class="community-feature"
            role="region"
            :aria-label="`Feature de la communauté ${community.name}`"
          >
            <header class="community-feature__header">
              <h3 class="community-feature__name">
                ✨ {{ community.feature.name }}
              </h3>
            </header>
            <p class="community-feature__desc">
              {{ community.feature.description }}
            </p>
          </div>

          <!-- Phrase exemple -->
          <blockquote
            v-if="community.flavor"
            class="community-flavor"
          >
            <p>« {{ community.flavor }} »</p>
          </blockquote>

          <!-- Traits -->
          <div class="community-traits-full">
            <span class="community-traits-full__label">Compétences représentatives :</span>
            <div class="traits-row">
              <span
                v-for="trait in community.traits"
                :key="trait"
                class="trait-tag trait-tag--full"
              >{{ trait }}</span>
            </div>
          </div>
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
        Aucune communauté trouvée pour « {{ searchQuery }} »
      </p>
    </div>

    <!-- ═══ Note de règle ═══ -->
    <aside
      class="rule-note"
      role="note"
      aria-label="Note de règle sur les communautés"
    >
      <p>
        <strong>Règle :</strong>
        La communauté représente le contexte culturel du personnage, pas sa biologie. Les features de communauté sont généralement passives et accordent des avantages situationnels.
        Un personnage choisit <em>une</em> communauté à la création.
      </p>
    </aside>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { COMMUNITIES } from '@/data/communities/index.js'

export default {
  name: 'CommunityBrowser',

  setup() {
    const searchQuery = ref('')
    const expandedId = ref(null)

    const filteredCommunities = computed(() => {
      const q = searchQuery.value.toLowerCase().trim()
      if (!q) return COMMUNITIES
      return COMMUNITIES.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.feature.name.toLowerCase().includes(q) ||
        c.traits.some((t) => t.toLowerCase().includes(q))
      )
    })

    function toggleCommunity(id) {
      expandedId.value = expandedId.value === id ? null : id
    }

    return {
      searchQuery,
      expandedId,
      filteredCommunities,
      toggleCommunity
    }
  }
}
</script>

<style scoped>
.community-browser { max-width: 900px; margin: 0 auto; }

/* ── Header ── */
.browser-header { margin-bottom: var(--space-lg); }
.browser-header__title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.browser-header__subtitle { color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-sm); }

/* ── Filtres ── */
.browser-filters { margin-bottom: var(--space-lg); }
.filter-input { width: 100%; padding: var(--space-sm) var(--space-md); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-input:focus { outline: 2px solid var(--color-accent-hope); outline-offset: 1px; }

/* ── Grille ── */
.community-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-sm); margin-bottom: var(--space-xl); }

/* ── Carte ── */
.community-card { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; transition: border-color var(--transition-fast); }

.community-card__header {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast);
}
.community-card__header:hover { background: var(--color-bg-surface); }
.community-card__header:focus-visible { outline: 2px solid var(--color-accent-hope); outline-offset: -2px; }

.community-card__emoji { font-size: 1.5rem; width: 2rem; text-align: center; flex-shrink: 0; margin-top: 2px; }
.community-card__meta { flex: 1; }
.community-card__name { display: block; font-weight: var(--font-weight-bold); font-size: var(--font-size-md); margin-bottom: 4px; }
.community-card__traits { display: flex; flex-wrap: wrap; gap: 4px; }
.trait-tag { font-size: 0.6rem; padding: 1px 6px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-full); color: var(--color-text-muted); }
.community-card__chevron { color: var(--color-text-muted); font-size: 0.75rem; flex-shrink: 0; margin-top: 4px; }

/* ── Corps ── */
.community-card__body { border-top: 1px solid var(--color-border); padding: var(--space-md); animation: slideDown 0.2s ease; }
.community-card__body[hidden] { display: none; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

.community-description { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0 0 var(--space-md); line-height: 1.6; }

/* ── Feature ── */
.community-feature {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-hope);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
}
.community-feature__header { margin-bottom: var(--space-xs); }
.community-feature__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); margin: 0; color: var(--color-accent-hope); }
.community-feature__desc { font-size: var(--font-size-sm); color: var(--color-text-primary); margin: 0; line-height: 1.6; }

/* ── Flavor ── */
.community-flavor {
  border: none;
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  margin: 0 0 var(--space-md);
  font-style: italic;
}
.community-flavor p { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 0; }

/* ── Traits complets ── */
.community-traits-full { }
.community-traits-full__label { font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: var(--space-xs); }
.traits-row { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.trait-tag--full { background: rgba(83, 168, 182, 0.1); border-color: rgba(83, 168, 182, 0.3); color: var(--color-accent-hope); font-size: var(--font-size-xs); padding: 2px var(--space-sm); }

/* ── Note de règle ── */
.rule-note {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-left: 3px solid #ca8a04;
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
}
.rule-note p { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.rule-note strong { color: #ca8a04; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); }

/* ── Accessibilité ── */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

@media (max-width: 600px) {
  .community-grid { grid-template-columns: 1fr; }
}
</style>
