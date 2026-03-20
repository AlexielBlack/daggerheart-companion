<template>
  <BottomDrawer
    :model-value="modelValue"
    title="+ Renforts"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="reinf__inner">
      <!-- ── Onglets Adversaires / PNJ ── -->
      <div
        class="reinf__tabs"
        role="tablist"
        aria-label="Type de renfort"
      >
        <button
          role="tab"
          class="reinf__tab"
          :class="{ 'reinf__tab--on': tab === 'adversary' }"
          :aria-selected="tab === 'adversary'"
          @click="tab = 'adversary'"
        >
          Adversaires
        </button>
        <button
          role="tab"
          class="reinf__tab"
          :class="{ 'reinf__tab--on': tab === 'npc' }"
          :aria-selected="tab === 'npc'"
          @click="tab = 'npc'"
        >
          PNJ
          <span
            v-if="combatNpcs.length > 0"
            class="reinf__tab-badge"
          >{{ combatNpcs.length }}</span>
        </button>
      </div>

      <!-- ════ Onglet Adversaires ════ -->
      <template v-if="tab === 'adversary'">
        <!-- ── Recherche ── -->
        <div class="reinf__search-row">
          <input
            ref="searchInput"
            v-model="search"
            class="reinf__search"
            type="search"
            placeholder="Rechercher un adversaire…"
            aria-label="Rechercher un adversaire"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />
        </div>

        <!-- ── Filtres ── -->
        <div class="reinf__filters-block">
          <!-- Tier -->
          <div class="reinf__filter-row">
            <span class="reinf__filter-label">Tier</span>
            <div class="reinf__filter-pills">
              <button
                v-for="t in 4"
                :key="'tier-' + t"
                class="reinf__pill"
                :class="{ 'reinf__pill--on': tierFilter.includes(t) }"
                :aria-label="'Tier ' + t"
                :aria-pressed="tierFilter.includes(t)"
                @click="toggleTier(t)"
              >
                {{ t }}
              </button>
            </div>
          </div>

          <!-- Type -->
          <div class="reinf__filter-row">
            <span class="reinf__filter-label">Type</span>
            <div class="reinf__filter-pills">
              <button
                v-for="typ in adversaryTypes"
                :key="typ"
                class="reinf__pill"
                :class="{ 'reinf__pill--on': typeFilter.includes(typ) }"
                :aria-label="typ"
                :aria-pressed="typeFilter.includes(typ)"
                @click="toggleType(typ)"
              >
                {{ typ.slice(0, 3) }}
              </button>
            </div>
          </div>

          <!-- Tri -->
          <div class="reinf__filter-row">
            <span class="reinf__filter-label">Tri</span>
            <div class="reinf__filter-pills">
              <button
                v-for="opt in sortOptions"
                :key="opt.key"
                class="reinf__pill"
                :class="{ 'reinf__pill--on': sortKey === opt.key }"
                :aria-pressed="sortKey === opt.key"
                @click="sortKey = opt.key"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── Compteur ── -->
        <div class="reinf__count-bar">
          <span class="reinf__count">
            {{ filtered.length }} résultat{{ filtered.length > 1 ? 's' : '' }}
          </span>
          <button
            v-if="hasActiveFilters"
            class="reinf__reset"
            aria-label="Réinitialiser les filtres"
            @click="resetFilters"
          >
            Réinitialiser
          </button>
        </div>

        <!-- ── Liste ── -->
        <ul
          class="reinf__list"
          aria-label="Adversaires disponibles"
        >
          <li
            v-for="adv in filtered"
            :key="adv.id"
          >
            <button
              class="reinf__item"
              :aria-label="adv.name + ' — ' + adv.type + ' Tier ' + adv.tier + ' ' + adv.hp + ' HP'"
              @click="pick(adv.id)"
            >
              <span class="reinf__item-name">{{ adv.name }}</span>
              <span class="reinf__item-meta">
                <span class="reinf__item-type">{{ adv.type }}</span>
                <span class="reinf__item-tier">T{{ adv.tier }}</span>
                <span class="reinf__item-hp">{{ adv.hp }}HP</span>
              </span>
            </button>
          </li>
          <li
            v-if="filtered.length === 0"
            class="reinf__empty"
          >
            Aucun résultat
          </li>
        </ul>
      </template>

      <!-- ════ Onglet PNJ ════ -->
      <template v-if="tab === 'npc'">
        <!-- ── Recherche PNJ ── -->
        <div class="reinf__search-row">
          <input
            ref="npcSearchInput"
            v-model="npcSearch"
            class="reinf__search"
            type="search"
            placeholder="Rechercher un PNJ…"
            aria-label="Rechercher un PNJ"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          />
        </div>

        <div class="reinf__count-bar">
          <span class="reinf__count">
            {{ filteredNpcs.length }} PNJ{{ filteredNpcs.length > 1 ? 's' : '' }} avec profil combat
          </span>
        </div>

        <ul
          class="reinf__list"
          aria-label="PNJ disponibles"
        >
          <li
            v-for="npc in filteredNpcs"
            :key="npc.id"
          >
            <button
              class="reinf__item"
              :aria-label="npc.name + ' — ' + npc.combatLabel"
              @click="pickNpc(npc.id)"
            >
              <span class="reinf__item-name">
                {{ npc.name }}
                <span
                  v-if="npc.title"
                  class="reinf__npc-title"
                >, {{ npc.title }}</span>
              </span>
              <span class="reinf__item-meta">
                <span class="reinf__npc-mode">{{ npc.combatLabel }}</span>
                <span
                  v-if="npc.hp"
                  class="reinf__item-hp"
                >{{ npc.hp }}HP</span>
              </span>
            </button>
          </li>
          <li
            v-if="filteredNpcs.length === 0"
            class="reinf__empty"
          >
            {{ combatNpcs.length === 0 ? 'Aucun PNJ avec profil de combat' : 'Aucun résultat' }}
          </li>
        </ul>
      </template>
    </div>
  </BottomDrawer>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import BottomDrawer from './BottomDrawer.vue'
import { allAdversaries, ADVERSARY_TYPES } from '@data/adversaries'
import { useNpcStore } from '@modules/npcs/stores/npcStore'

const SORT_OPTIONS = [
  { key: 'name',  label: 'Nom'  },
  { key: 'tier',  label: 'Tier' },
  { key: 'type',  label: 'Type' },
  { key: 'hp',    label: 'HP'   }
]

export default {
  name: 'ReinforcementDrawer',
  components: { BottomDrawer },

  props: {
    modelValue: { type: Boolean, default: false }
  },

  emits: ['update:modelValue', 'add', 'add-npc'],

  setup(props, { emit }) {
    const searchInput = ref(null)
    const npcSearchInput = ref(null)
    const search      = ref('')
    const npcSearch   = ref('')
    const tierFilter  = ref([])
    const typeFilter  = ref([])
    const sortKey     = ref('name')
    const tab         = ref('adversary')

    const adversaryTypes = ADVERSARY_TYPES
    const sortOptions    = SORT_OPTIONS

    // Focus auto sur l'input dès l'ouverture
    watch(() => props.modelValue, async (val) => {
      if (val) {
        await nextTick()
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (tab.value === 'npc') npcSearchInput.value?.focus()
            else searchInput.value?.focus()
          })
        })
      }
    })

    // Focus auto au changement d'onglet
    watch(tab, async () => {
      await nextTick()
      requestAnimationFrame(() => {
        if (tab.value === 'npc') npcSearchInput.value?.focus()
        else searchInput.value?.focus()
      })
    })

    function toggleTier(tier) {
      const i = tierFilter.value.indexOf(tier)
      if (i >= 0) tierFilter.value.splice(i, 1)
      else tierFilter.value.push(tier)
    }

    function toggleType(type) {
      const i = typeFilter.value.indexOf(type)
      if (i >= 0) typeFilter.value.splice(i, 1)
      else typeFilter.value.push(type)
    }

    function resetFilters() {
      search.value     = ''
      tierFilter.value = []
      typeFilter.value = []
      sortKey.value    = 'name'
    }

    const hasActiveFilters = computed(() =>
      search.value.trim() !== '' ||
      tierFilter.value.length > 0 ||
      typeFilter.value.length > 0 ||
      sortKey.value !== 'name'
    )

    const filtered = computed(() => {
      const q     = search.value.toLowerCase().trim()
      const tiers = tierFilter.value
      const types = typeFilter.value
      const sort  = sortKey.value

      let list = allAdversaries

      if (q) {
        list = list.filter(
          (a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
        )
      }
      if (tiers.length) list = list.filter((a) => tiers.includes(a.tier))
      if (types.length) list = list.filter((a) => types.includes(a.type))

      const sorted = [...list]
      if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
      else if (sort === 'tier') sorted.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name))
      else if (sort === 'type') sorted.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
      else if (sort === 'hp')   sorted.sort((a, b) => (b.hp || 0) - (a.hp || 0) || a.name.localeCompare(b.name))

      return sorted.slice(0, 50)
    })

    // ── PNJ avec profil combat ──
    const npcStore = useNpcStore()

    const combatNpcs = computed(() => {
      return npcStore.npcs
        .filter((n) => n.combatProfileMode && n.combatProfileMode !== 'none')
        .map((n) => {
          let combatLabel = ''
          let hp = null
          if (n.combatProfileMode === 'linked' && n.linkedAdversaryId) {
            const linked = allAdversaries.find((a) => a.id === n.linkedAdversaryId)
            combatLabel = linked ? linked.type : 'Lié'
            hp = linked ? linked.hp : null
          } else if (n.combatProfileMode === 'custom') {
            combatLabel = n.adversaryType || 'Custom'
            hp = n.combatStats?.hp || null
          }
          return {
            id: n.id,
            name: n.name,
            title: n.title || '',
            combatLabel,
            hp
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name))
    })

    const filteredNpcs = computed(() => {
      const q = npcSearch.value.toLowerCase().trim()
      if (!q) return combatNpcs.value
      return combatNpcs.value.filter(
        (n) => n.name.toLowerCase().includes(q) ||
               (n.title && n.title.toLowerCase().includes(q))
      )
    })

    function pick(adversaryId) {
      emit('add', adversaryId)
      emit('update:modelValue', false)
    }

    function pickNpc(npcId) {
      emit('add-npc', npcId)
      emit('update:modelValue', false)
    }

    return {
      searchInput, npcSearchInput, search, npcSearch,
      tierFilter, typeFilter, sortKey, tab,
      adversaryTypes, sortOptions, filtered, hasActiveFilters,
      combatNpcs, filteredNpcs,
      toggleTier, toggleType, resetFilters, pick, pickNpc
    }
  }
}
</script>

<style scoped>
.reinf__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Onglets ── */
.reinf__tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.reinf__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  min-height: var(--touch-min);
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  touch-action: manipulation;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.reinf__tab:hover {
  color: var(--color-text-primary);
}

.reinf__tab--on {
  color: var(--color-accent-hope);
  border-bottom-color: var(--color-accent-hope);
  font-weight: var(--font-weight-bold);
}

.reinf__tab-badge {
  font-size: var(--font-size-xs);
  background: rgba(83, 168, 182, 0.2);
  color: var(--color-accent-hope);
  padding: 1px var(--space-xs);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-variant-numeric: tabular-nums;
}

/* ── Recherche ── */
.reinf__search-row {
  padding: var(--space-sm) var(--space-md);
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
}

.reinf__search {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  min-height: var(--touch-min);
  box-sizing: border-box;
  appearance: none;
}

.reinf__search:focus {
  outline: none;
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.2);
}

/* ── Bloc filtres ── */
.reinf__filters-block {
  padding: var(--space-xs) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.reinf__filter-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.reinf__filter-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 2.5rem;
}

.reinf__filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.reinf__pill {
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  touch-action: manipulation;
}

.reinf__pill:hover {
  background: var(--color-bg-elevated);
}

.reinf__pill--on {
  background: rgba(83, 168, 182, 0.15);
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-bold);
}

/* ── Compteur + reset ── */
.reinf__count-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-md);
  flex-shrink: 0;
}

.reinf__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.reinf__reset {
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: none;
  background: transparent;
  color: var(--color-accent-hope);
  font-size: var(--font-size-xs);
  cursor: pointer;
  touch-action: manipulation;
  border-radius: var(--radius-sm);
}

.reinf__reset:hover {
  background: rgba(83, 168, 182, 0.1);
}

/* ── Liste ── */
.reinf__list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  list-style: none;
  margin: 0;
  padding: 0;
}

.reinf__item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  min-height: var(--touch-min);
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  text-align: left;
  gap: var(--space-sm);
  touch-action: manipulation;
  transition: background var(--transition-fast);
}

.reinf__item:hover,
.reinf__item:focus-visible {
  background: var(--color-bg-elevated);
}

.reinf__item:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: -2px;
}

.reinf__item-name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reinf__item-meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.reinf__item-type {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.reinf__item-tier {
  font-size: var(--font-size-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-weight-bold);
  padding: 1px var(--space-xs);
  background: rgba(224, 165, 38, 0.1);
  border-radius: var(--radius-sm);
}

.reinf__item-hp {
  font-size: var(--font-size-xs);
  color: var(--color-accent-danger);
  font-variant-numeric: tabular-nums;
  min-width: 3rem;
  text-align: right;
}

/* ── PNJ spécifique ── */
.reinf__npc-title {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.reinf__npc-mode {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  padding: 1px var(--space-xs);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.reinf__empty {
  padding: var(--space-lg);
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  list-style: none;
}
</style>
