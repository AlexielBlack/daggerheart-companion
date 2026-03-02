<template>
  <div class="equipment-browser">
    <!-- ═══ En-tête ═══ -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        🗡️ Équipement
      </h1>
      <p class="browser-header__subtitle">
        {{ filteredItems.length }} objet{{ filteredItems.length > 1 ? 's' : '' }}
        — Armes, Armures, Loot & Consommables
      </p>
    </header>

    <!-- ═══ Filtres ═══ -->
    <div
      class="browser-filters"
      role="search"
      aria-label="Filtrer l'équipement"
    >
      <label
        class="sr-only"
        for="equipment-search"
      >Rechercher un équipement</label>
      <input
        id="equipment-search"
        v-model="searchQuery"
        type="search"
        class="filter-input"
        placeholder="Rechercher un équipement..."
        aria-label="Rechercher un équipement"
      />
      <div
        class="filter-group"
        role="group"
        aria-label="Filtrer par catégorie"
      >
        <button
          v-for="cat in categoryFilters"
          :key="cat.id"
          class="filter-chip"
          :class="[
            `filter-chip--${cat.id}`,
            { 'filter-chip--active': activeCategory === cat.id }
          ]"
          :aria-pressed="activeCategory === cat.id"
          @click="activeCategory = cat.id"
        >
          {{ cat.emoji }} {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- ═══ Sections par catégorie ═══ -->
    <div v-if="filteredItems.length">
      <!-- Armes -->
      <section
        v-if="showCategory('weapon') && weaponsFiltered.length"
        class="equipment-section"
        aria-label="Armes"
      >
        <h2 class="section-title">
          ⚔️ Armes
          <span class="section-count">{{ weaponsFiltered.length }}</span>
        </h2>
        <div
          class="equipment-table"
          role="table"
          aria-label="Tableau des armes"
        >
          <div
            class="table-header"
            role="row"
          >
            <span role="columnheader">Nom</span>
            <span role="columnheader">Trait</span>
            <span role="columnheader">Portée</span>
            <span role="columnheader">Dégâts</span>
            <span role="columnheader">Prix</span>
          </div>
          <button
            v-for="weapon in weaponsFiltered"
            :key="weapon.id"
            class="table-row table-row--weapon"
            role="row"
            :aria-expanded="expandedId === weapon.id"
            :aria-controls="`equip-${weapon.id}`"
            @click="toggleItem(weapon.id)"
          >
            <span
              role="cell"
              class="cell-name"
            >
              <span aria-hidden="true">{{ weapon.emoji }}</span>
              {{ weapon.name }}
              <span
                v-for="tag in weapon.tags"
                :key="tag"
                class="tag-pill"
                :aria-label="`Tag : ${getTagLabel(tag)}`"
              >{{ getTagLabel(tag) }}</span>
            </span>
            <span
              role="cell"
              class="cell-trait"
            >{{ weapon.trait }}</span>
            <span
              role="cell"
              class="cell-range"
            >{{ getRangeLabel(weapon.range) }}</span>
            <span
              role="cell"
              class="cell-damage"
            >
              <span
                class="damage-badge"
                :class="`damage-badge--${weapon.damageType}`"
              >{{ weapon.damageFormula }}</span>
            </span>
            <span
              role="cell"
              class="cell-price"
            >{{ weapon.price }}</span>
          </button>
          <!-- Détails dépliables pour chaque arme -->
          <div
            v-for="weapon in weaponsFiltered"
            :key="`details-${weapon.id}`"
          >
            <div
              :id="`equip-${weapon.id}`"
              class="item-details"
              :hidden="expandedId !== weapon.id"
            >
              <p class="item-details__feature">
                <strong>Feature :</strong> {{ weapon.feature }}
              </p>
              <p class="item-details__burden">
                <strong>Fardeau :</strong> {{ weapon.burden }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Armures -->
      <section
        v-if="showCategory('armor') && armorsFiltered.length"
        class="equipment-section"
        aria-label="Armures"
      >
        <h2 class="section-title">
          🛡️ Armures
          <span class="section-count">{{ armorsFiltered.length }}</span>
        </h2>
        <div
          class="equipment-table"
          role="table"
          aria-label="Tableau des armures"
        >
          <div
            class="table-header table-header--armor"
            role="row"
          >
            <span role="columnheader">Nom</span>
            <span role="columnheader">Seuils</span>
            <span role="columnheader">Score</span>
            <span role="columnheader">Prix</span>
          </div>
          <button
            v-for="armor in armorsFiltered"
            :key="armor.id"
            class="table-row table-row--armor"
            role="row"
            :aria-expanded="expandedId === armor.id"
            :aria-controls="`equip-${armor.id}`"
            @click="toggleItem(armor.id)"
          >
            <span
              role="cell"
              class="cell-name"
            >
              <span aria-hidden="true">{{ armor.emoji }}</span>
              {{ armor.name }}
            </span>
            <span
              role="cell"
              class="cell-thresholds"
            >
              {{ armor.thresholdMinor }}/{{ armor.thresholdMajor }}
            </span>
            <span
              role="cell"
              class="cell-score"
            >{{ armor.baseScore }}</span>
            <span
              role="cell"
              class="cell-price"
            >{{ armor.price }}</span>
          </button>
          <div
            v-for="armor in armorsFiltered"
            :key="`details-${armor.id}`"
          >
            <div
              :id="`equip-${armor.id}`"
              class="item-details"
              :hidden="expandedId !== armor.id"
            >
              <p class="item-details__feature">
                <strong>Spécial :</strong> {{ armor.feature }}
              </p>
              <p class="item-details__burden">
                <strong>Fardeau :</strong> {{ armor.burden }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Loot -->
      <section
        v-if="showCategory('loot') && lootFiltered.length"
        class="equipment-section"
        aria-label="Loot"
      >
        <h2 class="section-title">
          💎 Loot
          <span class="section-count">{{ lootFiltered.length }}</span>
        </h2>
        <div
          class="item-card-grid"
          role="list"
          aria-label="Liste du loot"
        >
          <article
            v-for="item in lootFiltered"
            :key="item.id"
            class="item-card"
            role="listitem"
          >
            <header class="item-card__header">
              <span
                class="item-card__emoji"
                aria-hidden="true"
              >{{ item.emoji }}</span>
              <div class="item-card__meta">
                <h3 class="item-card__name">
                  {{ item.name }}
                </h3>
                <span class="item-card__price">{{ item.price }}</span>
              </div>
            </header>
            <p class="item-card__desc">
              {{ item.description }}
            </p>
          </article>
        </div>
      </section>

      <!-- Consommables -->
      <section
        v-if="showCategory('consumable') && consumablesFiltered.length"
        class="equipment-section"
        aria-label="Consommables"
      >
        <h2 class="section-title">
          🧪 Consommables
          <span class="section-count">{{ consumablesFiltered.length }}</span>
        </h2>
        <div
          class="item-card-grid"
          role="list"
          aria-label="Liste des consommables"
        >
          <article
            v-for="item in consumablesFiltered"
            :key="item.id"
            class="item-card item-card--consumable"
            role="listitem"
          >
            <header class="item-card__header">
              <span
                class="item-card__emoji"
                aria-hidden="true"
              >{{ item.emoji }}</span>
              <div class="item-card__meta">
                <h3 class="item-card__name">
                  {{ item.name }}
                </h3>
                <div class="item-card__footer">
                  <span class="item-card__price">{{ item.price }}</span>
                  <span
                    class="item-card__uses"
                    :aria-label="`Utilisations : ${item.uses}`"
                  >{{ item.uses }} utilisation{{ item.uses > 1 ? 's' : '' }}</span>
                </div>
              </div>
            </header>
            <p class="item-card__desc">
              {{ item.description }}
            </p>
          </article>
        </div>
      </section>
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
        Aucun équipement trouvé pour « {{ searchQuery }} »
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import {
  WEAPONS,
  ARMORS,
  LOOT,
  CONSUMABLES,
  WEAPON_TAGS,
  RANGES,
  DAMAGE_TYPES
} from '@/data/equipment/index.js'

export default {
  name: 'EquipmentBrowser',

  setup() {
    const searchQuery = ref('')
    const activeCategory = ref('all')
    const expandedId = ref(null)

    const categoryFilters = [
      { id: 'all', label: 'Tout', emoji: '📦' },
      { id: 'weapon', label: 'Armes', emoji: '⚔️' },
      { id: 'armor', label: 'Armures', emoji: '🛡️' },
      { id: 'loot', label: 'Loot', emoji: '💎' },
      { id: 'consumable', label: 'Consommables', emoji: '🧪' }
    ]

    function filterItems(items) {
      const q = searchQuery.value.toLowerCase().trim()
      if (!q) return items
      return items.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.feature?.toLowerCase().includes(q)
      )
    }

    const weaponsFiltered = computed(() => filterItems(WEAPONS))
    const armorsFiltered = computed(() => filterItems(ARMORS))
    const lootFiltered = computed(() => filterItems(LOOT))
    const consumablesFiltered = computed(() => filterItems(CONSUMABLES))

    const filteredItems = computed(() => [
      ...(showCategory('weapon') ? weaponsFiltered.value : []),
      ...(showCategory('armor') ? armorsFiltered.value : []),
      ...(showCategory('loot') ? lootFiltered.value : []),
      ...(showCategory('consumable') ? consumablesFiltered.value : [])
    ])

    function showCategory(cat) {
      return activeCategory.value === 'all' || activeCategory.value === cat
    }

    function toggleItem(id) {
      expandedId.value = expandedId.value === id ? null : id
    }

    function getTagLabel(tag) {
      return WEAPON_TAGS[tag] || tag
    }

    function getRangeLabel(range) {
      return RANGES[range] || range
    }

    function getDamageLabel(type) {
      return DAMAGE_TYPES[type] || type
    }

    return {
      searchQuery,
      activeCategory,
      expandedId,
      categoryFilters,
      weaponsFiltered,
      armorsFiltered,
      lootFiltered,
      consumablesFiltered,
      filteredItems,
      showCategory,
      toggleItem,
      getTagLabel,
      getRangeLabel,
      getDamageLabel
    }
  }
}
</script>

<style scoped>
.equipment-browser { max-width: 960px; margin: 0 auto; }

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

/* ── Sections ── */
.equipment-section { margin-bottom: var(--space-xl); }
.section-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-md); display: flex; align-items: center; gap: var(--space-sm); }
.section-count { font-size: var(--font-size-sm); font-weight: normal; color: var(--color-text-muted); background: var(--color-bg-elevated); padding: 2px var(--space-sm); border-radius: var(--radius-full); }

/* ── Tables ── */
.equipment-table { border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }

.table-header, .table-header--armor {
  display: grid;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.table-header { grid-template-columns: 2fr 1fr 1fr 1fr 1fr; }
.table-header--armor { grid-template-columns: 2fr 1fr 1fr 1fr; }

.table-row {
  display: grid;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  background: none;
  border-left: none;
  border-right: none;
  text-align: left;
  width: 100%;
  transition: background-color var(--transition-fast);
  align-items: center;
}
.table-row:last-of-type { border-bottom: none; }
.table-row:hover { background: var(--color-bg-elevated); }
.table-row:focus-visible { outline: 2px solid var(--color-accent-hope); outline-offset: -2px; }

.table-row--weapon { grid-template-columns: 2fr 1fr 1fr 1fr 1fr; }
.table-row--armor { grid-template-columns: 2fr 1fr 1fr 1fr; }

.cell-name { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; font-weight: var(--font-weight-medium); }
.cell-trait, .cell-range { color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.cell-damage, .cell-score { text-align: center; }
.cell-price { color: var(--color-text-muted); font-size: var(--font-size-xs); text-align: right; }
.cell-thresholds { font-family: monospace; color: var(--color-text-secondary); font-size: var(--font-size-xs); text-align: center; }

/* ── Tags ── */
.tag-pill { font-size: 0.6rem; padding: 1px 5px; background: rgba(83, 168, 182, 0.1); border: 1px solid rgba(83, 168, 182, 0.3); border-radius: var(--radius-sm); color: var(--color-accent-hope); white-space: nowrap; }

/* ── Damage badge ── */
.damage-badge { font-size: var(--font-size-xs); padding: 2px var(--space-xs); border-radius: var(--radius-sm); font-weight: var(--font-weight-bold); font-family: monospace; }
.damage-badge--phy { background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); }
.damage-badge--mag { background: rgba(139, 92, 246, 0.1); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

/* ── Détails dépliables ── */
.item-details { padding: var(--space-sm) var(--space-md); background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); animation: slideDown 0.15s ease; }
.item-details[hidden] { display: none; }
.item-details__feature, .item-details__burden { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0 0 4px; line-height: 1.5; }
.item-details__feature:last-child, .item-details__burden:last-child { margin: 0; }
@keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

/* ── Cartes (loot & consommables) ── */
.item-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-sm); }
.item-card { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
.item-card--consumable { border-top: 2px solid var(--color-accent-hope); }

.item-card__header { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.item-card__emoji { font-size: 1.2rem; flex-shrink: 0; }
.item-card__meta { flex: 1; }
.item-card__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); margin: 0 0 2px; }
.item-card__price { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.item-card__footer { display: flex; align-items: center; gap: var(--space-sm); }
.item-card__uses { font-size: var(--font-size-xs); background: rgba(83, 168, 182, 0.1); color: var(--color-accent-hope); border: 1px solid rgba(83, 168, 182, 0.3); border-radius: var(--radius-sm); padding: 1px 6px; }
.item-card__desc { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; line-height: 1.5; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); }

/* ── Accessibilité ── */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

@media (max-width: 700px) {
  .table-header, .table-row--weapon { grid-template-columns: 2fr 1fr 1fr; }
  .table-header span:nth-child(4), .table-row--weapon .cell-price,
  .table-header span:nth-child(5), .table-row--weapon .cell-damage { display: none; }
  .item-card-grid { grid-template-columns: 1fr; }
  .browser-filters { flex-direction: column; align-items: stretch; }
}
</style>
