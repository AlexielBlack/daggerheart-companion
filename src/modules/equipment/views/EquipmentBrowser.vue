<template>
  <div class="equipment-browser">
      <!-- ═══ En-tête ═══ -->
      <header class="browser-header">
        <h1 class="browser-header__title">
          🗡️ Équipement
        </h1>
        <p class="browser-header__subtitle">
          {{ store.totalFiltered }} objet{{ store.totalFiltered > 1 ? 's' : '' }}
          sur {{ store.counts.total }} — Armes, Armures, Loot &amp; Consommables
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
          v-model="store.searchQuery"
          type="search"
          class="filter-input"
          placeholder="Rechercher un équipement..."
          aria-label="Rechercher un équipement"
        />

        <!-- Catégories -->
        <div
          class="filter-group"
          role="group"
          aria-label="Filtrer par catégorie"
        >
          <button
            v-for="cat in store.categories"
            :key="cat.id"
            class="filter-chip"
            :class="{ 'filter-chip--active': store.activeCategory === cat.id }"
            :aria-pressed="String(store.activeCategory === cat.id)"
            @click="store.activeCategory = cat.id"
          >
            {{ cat.emoji }} {{ cat.label }}
          </button>
        </div>

        <!-- Tier (armes + armures) -->
        <div
          v-if="showTierFilter"
          class="filter-group"
          role="group"
          aria-label="Filtrer par tier"
        >
          <button
            v-for="t in tierOptions"
            :key="t.value"
            class="filter-chip filter-chip--tier"
            :class="{ 'filter-chip--active': store.activeTier === t.value }"
            :aria-pressed="String(store.activeTier === t.value)"
            @click="store.activeTier = t.value"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- Type de dégâts (armes primaires) -->
        <div
          v-if="showDamageTypeFilter"
          class="filter-group"
          role="group"
          aria-label="Filtrer par type de dégâts"
        >
          <button
            v-for="dt in damageTypeOptions"
            :key="dt.value"
            class="filter-chip filter-chip--dtype"
            :class="{ 'filter-chip--active': store.activeDamageType === dt.value }"
            :aria-pressed="String(store.activeDamageType === dt.value)"
            @click="store.activeDamageType = dt.value"
          >
            {{ dt.label }}
          </button>
        </div>

        <!-- Rareté (loot + consumables) -->
        <div
          v-if="showRarityFilter"
          class="filter-group"
          role="group"
          aria-label="Filtrer par rareté"
        >
          <button
            v-for="r in rarityOptions"
            :key="r.value"
            class="filter-chip filter-chip--rarity"
            :class="[
              `filter-chip--${r.value}`,
              { 'filter-chip--active': store.activeRarity === r.value }
            ]"
            :aria-pressed="String(store.activeRarity === r.value)"
            @click="store.activeRarity = r.value"
          >
            {{ r.label }}
          </button>
        </div>

        <button
          v-if="hasActiveFilters"
          class="filter-reset"
          aria-label="Réinitialiser les filtres"
          @click="store.resetFilters()"
        >
          ✕ Réinitialiser
        </button>
      </div>

      <!-- ═══ ARMES PRIMAIRES ═══ -->
      <section
        v-if="store.showCategory('primaryWeapon') && store.filteredPrimaryWeapons.length"
        class="equipment-section"
        aria-label="Armes primaires"
      >
        <h2 class="section-title">
          ⚔️ Armes Primaires
          <span class="section-count">{{ store.filteredPrimaryWeapons.length }}</span>
        </h2>
        <div
          class="weapon-table"
          role="table"
          aria-label="Tableau des armes primaires"
        >
          <div
            class="table-header"
            role="row"
          >
            <span role="columnheader">Nom</span>
            <span role="columnheader">Trait</span>
            <span role="columnheader">Portée</span>
            <span role="columnheader">Dégâts</span>
            <span role="columnheader">Mains</span>
            <span role="columnheader">Tier</span>
          </div>
          <template
            v-for="weapon in store.filteredPrimaryWeapons"
            :key="weapon.id"
          >
            <button
              class="table-row"
              role="row"
              :aria-expanded="String(expandedId === weapon.id)"
              :aria-controls="`equip-${weapon.id}`"
              @click="toggleItem(weapon.id)"
            >
              <span
                role="cell"
                class="cell-name"
              >
                {{ weapon.name }}
              </span>
              <span
                role="cell"
                class="cell-trait"
              >{{ weapon.trait }}</span>
              <span
                role="cell"
                class="cell-range"
              >{{ rangeLabel(weapon.range) }}</span>
              <span
                role="cell"
                class="cell-damage"
              >
                <span
                  class="damage-badge"
                  :class="`damage-badge--${weapon.damageType}`"
                >{{ weapon.damage }}</span>
              </span>
              <span
                role="cell"
                class="cell-burden"
              >{{ burdenLabel(weapon.burden) }}</span>
              <span
                role="cell"
                class="cell-tier"
              >
                <span class="tier-badge">T{{ weapon.tier }}</span>
              </span>
            </button>
            <div
              :id="`equip-${weapon.id}`"
              class="item-details"
              :hidden="expandedId !== weapon.id"
            >
              <p
                v-if="weapon.feature"
                class="item-details__feature"
              >
                <strong>Feature :</strong> {{ weapon.feature }}
              </p>
              <p
                v-if="weapon.damageType === 'mag'"
                class="item-details__note"
              >
                ✨ Arme magique — nécessite un trait Spellcast
              </p>
              <p
                v-if="!weapon.feature"
                class="item-details__note"
              >
                Pas de feature spéciale.
              </p>
              <button
                class="btn btn--secondary btn--sm item-details__duplicate-btn"
                @click.stop="duplicateToHomebrew(weapon)"
              >
                ✎ Dupliquer en homebrew
              </button>
            </div>
          </template>
        </div>
      </section>

      <!-- ═══ ARMES SECONDAIRES ═══ -->
      <section
        v-if="store.showCategory('secondaryWeapon') && store.filteredSecondaryWeapons.length"
        class="equipment-section"
        aria-label="Armes secondaires"
      >
        <h2 class="section-title">
          🛡️ Armes Secondaires
          <span class="section-count">{{ store.filteredSecondaryWeapons.length }}</span>
        </h2>
        <div
          class="weapon-table"
          role="table"
          aria-label="Tableau des armes secondaires"
        >
          <div
            class="table-header"
            role="row"
          >
            <span role="columnheader">Nom</span>
            <span role="columnheader">Trait</span>
            <span role="columnheader">Portée</span>
            <span role="columnheader">Dégâts</span>
            <span role="columnheader">Feature</span>
            <span role="columnheader">Tier</span>
          </div>
          <template
            v-for="weapon in store.filteredSecondaryWeapons"
            :key="weapon.id"
          >
            <button
              class="table-row"
              role="row"
              :aria-expanded="String(expandedId === weapon.id)"
              :aria-controls="`equip-${weapon.id}`"
              @click="toggleItem(weapon.id)"
            >
              <span
                role="cell"
                class="cell-name"
              >{{ weapon.name }}</span>
              <span
                role="cell"
                class="cell-trait"
              >{{ weapon.trait }}</span>
              <span
                role="cell"
                class="cell-range"
              >{{ rangeLabel(weapon.range) }}</span>
              <span
                role="cell"
                class="cell-damage"
              >
                <span class="damage-badge damage-badge--phy">{{ weapon.damage }}</span>
              </span>
              <span
                role="cell"
                class="cell-feature-key"
              >{{ weapon.featureKey || '—' }}</span>
              <span
                role="cell"
                class="cell-tier"
              >
                <span class="tier-badge">T{{ weapon.tier }}</span>
              </span>
            </button>
            <div
              :id="`equip-${weapon.id}`"
              class="item-details"
              :hidden="expandedId !== weapon.id"
            >
              <p
                v-if="weapon.feature"
                class="item-details__feature"
              >
                <strong>Feature :</strong> {{ weapon.feature }}
              </p>
              <p
                v-else
                class="item-details__note"
              >
                Pas de feature spéciale.
              </p>
              <button
                class="btn btn--secondary btn--sm item-details__duplicate-btn"
                @click.stop="duplicateToHomebrew(weapon)"
              >
                ✎ Dupliquer en homebrew
              </button>
            </div>
          </template>
        </div>
      </section>

      <!-- ═══ ARMURES ═══ -->
      <section
        v-if="store.showCategory('armor') && store.filteredArmor.length"
        class="equipment-section"
        aria-label="Armures"
      >
        <h2 class="section-title">
          🛡️ Armures
          <span class="section-count">{{ store.filteredArmor.length }}</span>
        </h2>
        <div
          class="weapon-table armor-table"
          role="table"
          aria-label="Tableau des armures"
        >
          <div
            class="table-header table-header--armor"
            role="row"
          >
            <span role="columnheader">Nom</span>
            <span role="columnheader">Seuils (Maj/Sév)</span>
            <span role="columnheader">Score</span>
            <span role="columnheader">Feature</span>
            <span role="columnheader">Tier</span>
          </div>
          <template
            v-for="armor in store.filteredArmor"
            :key="armor.id"
          >
            <button
              class="table-row table-row--armor"
              role="row"
              :aria-expanded="String(expandedId === armor.id)"
              :aria-controls="`equip-${armor.id}`"
              @click="toggleItem(armor.id)"
            >
              <span
                role="cell"
                class="cell-name"
              >{{ armor.name }}</span>
              <span
                role="cell"
                class="cell-thresholds"
              >{{ armor.thresholds.major }} / {{ armor.thresholds.severe }}</span>
              <span
                role="cell"
                class="cell-score"
              >{{ armor.baseScore }}</span>
              <span
                role="cell"
                class="cell-feature-key"
              >{{ armor.featureKey || '—' }}</span>
              <span
                role="cell"
                class="cell-tier"
              >
                <span class="tier-badge">T{{ armor.tier }}</span>
              </span>
            </button>
            <div
              :id="`equip-${armor.id}`"
              class="item-details"
              :hidden="expandedId !== armor.id"
            >
              <p
                v-if="armor.feature"
                class="item-details__feature"
              >
                <strong>Feature :</strong> {{ armor.feature }}
              </p>
              <p
                v-else
                class="item-details__note"
              >
                Pas de feature spéciale.
              </p>
              <button
                class="btn btn--secondary btn--sm item-details__duplicate-btn"
                @click.stop="duplicateToHomebrew(armor)"
              >
                ✎ Dupliquer en homebrew
              </button>
            </div>
          </template>
        </div>
      </section>

      <!-- ═══ LOOT ═══ -->
      <section
        v-if="store.showCategory('loot') && store.filteredLoot.length"
        class="equipment-section"
        aria-label="Loot"
      >
        <h2 class="section-title">
          💎 Loot
          <span class="section-count">{{ store.filteredLoot.length }}</span>
        </h2>
        <div
          class="item-card-grid"
          role="list"
          aria-label="Liste du loot"
        >
          <article
            v-for="item in store.filteredLoot"
            :key="item.id"
            class="item-card"
            :class="`item-card--${item.rarity}`"
            role="listitem"
          >
            <header class="item-card__header">
              <span class="item-card__roll">#{{ String(item.roll).padStart(2, '0') }}</span>
              <div class="item-card__meta">
                <h3 class="item-card__name">
                  {{ item.name }}
                </h3>
                <span
                  class="rarity-badge"
                  :class="`rarity-badge--${item.rarity}`"
                >{{ rarityLabel(item.rarity) }}</span>
              </div>
            </header>
            <p class="item-card__desc">
              {{ item.description }}
            </p>
            <button
              class="btn btn--secondary btn--xs item-card__duplicate-btn"
              @click.stop="duplicateToHomebrew(item)"
            >
              ✎ Homebrew
            </button>
          </article>
        </div>
      </section>

      <!-- ═══ CONSOMMABLES ═══ -->
      <section
        v-if="store.showCategory('consumable') && store.filteredConsumables.length"
        class="equipment-section"
        aria-label="Consommables"
      >
        <h2 class="section-title">
          🧪 Consommables
          <span class="section-count">{{ store.filteredConsumables.length }}</span>
        </h2>
        <div
          class="item-card-grid"
          role="list"
          aria-label="Liste des consommables"
        >
          <article
            v-for="item in store.filteredConsumables"
            :key="item.id"
            class="item-card item-card--consumable"
            :class="`item-card--${item.rarity}`"
            role="listitem"
          >
            <header class="item-card__header">
              <span class="item-card__roll">#{{ String(item.roll).padStart(2, '0') }}</span>
              <div class="item-card__meta">
                <h3 class="item-card__name">
                  {{ item.name }}
                </h3>
                <span
                  class="rarity-badge"
                  :class="`rarity-badge--${item.rarity}`"
                >{{ rarityLabel(item.rarity) }}</span>
              </div>
            </header>
            <p class="item-card__desc">
              {{ item.description }}
            </p>
            <button
              class="btn btn--secondary btn--xs item-card__duplicate-btn"
              @click.stop="duplicateToHomebrew(item)"
            >
              ✎ Homebrew
            </button>
          </article>
        </div>
      </section>

      <!-- ═══ État vide ═══ -->
      <div
        v-if="store.totalFiltered === 0"
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
          Aucun équipement trouvé pour « {{ store.searchQuery }} »
        </p>
        <button
          class="filter-reset"
          @click="store.resetFilters()"
        >
          Réinitialiser les filtres
        </button>
      </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '../stores/equipmentStore.js'
import { RANGES, BURDENS, RARITIES } from '@/data/equipment/constants.js'
import { useEquipmentHomebrewStore } from '@modules/homebrew/categories/equipment/useEquipmentHomebrewStore.js'

export default {
  name: 'EquipmentBrowser',

  setup() {
    const store = useEquipmentStore()
    const router = useRouter()
    const expandedId = ref(null)

    const tierOptions = [
      { value: 0, label: 'Tous Tiers' },
      { value: 1, label: 'T1 (Niv 1)' },
      { value: 2, label: 'T2 (Niv 2–4)' },
      { value: 3, label: 'T3 (Niv 5–7)' },
      { value: 4, label: 'T4 (Niv 8–10)' }
    ]

    const damageTypeOptions = [
      { value: 'all', label: 'Tous types' },
      { value: 'phy', label: '🗡️ Physique' },
      { value: 'mag', label: '✨ Magique' }
    ]

    const rarityOptions = [
      { value: 'all', label: 'Toutes raretés' },
      { value: 'common', label: 'Commun' },
      { value: 'uncommon', label: 'Peu commun' },
      { value: 'rare', label: 'Rare' },
      { value: 'legendary', label: 'Légendaire' }
    ]

    const showTierFilter = computed(() => {
      const cat = store.activeCategory
      return cat === 'all' || cat === 'primaryWeapon' || cat === 'secondaryWeapon' || cat === 'armor'
    })

    const showDamageTypeFilter = computed(() => {
      const cat = store.activeCategory
      return cat === 'all' || cat === 'primaryWeapon'
    })

    const showRarityFilter = computed(() => {
      const cat = store.activeCategory
      return cat === 'all' || cat === 'loot' || cat === 'consumable'
    })

    const hasActiveFilters = computed(() => {
      return store.searchQuery !== '' ||
        store.activeCategory !== 'all' ||
        store.activeTier !== 0 ||
        store.activeDamageType !== 'all' ||
        store.activeRarity !== 'all'
    })

    function toggleItem(id) {
      expandedId.value = expandedId.value === id ? null : id
    }

    function rangeLabel(range) {
      return RANGES[range] || range
    }

    function burdenLabel(burden) {
      return BURDENS[burden] || burden
    }

    function rarityLabel(rarity) {
      return RARITIES[rarity] || rarity
    }

    function duplicateToHomebrew(item) {
      const homebrewStore = useEquipmentHomebrewStore()
      const result = homebrewStore.createFromTemplate(item)
      if (result.success) {
        router.push(`/compendium/equipement/${result.id}`)
      }
    }

    return {
      store,
      expandedId,
      tierOptions,
      damageTypeOptions,
      rarityOptions,
      showTierFilter,
      showDamageTypeFilter,
      showRarityFilter,
      hasActiveFilters,
      toggleItem,
      rangeLabel,
      burdenLabel,
      rarityLabel,
      duplicateToHomebrew
    }
  }
}
</script>

<style scoped>
.equipment-browser { }

/* ── Header ── */
.browser-header { margin-bottom: var(--space-lg); }
.browser-header__title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.browser-header__subtitle { color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-sm); }

/* ── Filtres ── */
.browser-filters { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-lg); align-items: center; }
.filter-input { flex: 1; min-width: 200px; padding: var(--space-sm) var(--space-md); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-input:focus { outline: 2px solid var(--color-accent-hope); outline-offset: 1px; }
.filter-group { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.filter-chip { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; transition: all var(--transition-fast); }
.filter-chip:hover { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }
.filter-chip--active { background: var(--color-accent-hope); border-color: var(--color-accent-hope); color: #fff; font-weight: var(--font-weight-medium); }
.filter-reset { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: transparent; color: var(--color-text-muted); font-size: var(--font-size-xs); cursor: pointer; }
.filter-reset:hover { border-color: #dc2626; color: #dc2626; }

/* ── Sections ── */
.equipment-section { margin-bottom: var(--space-xl); }
.section-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-md); display: flex; align-items: center; gap: var(--space-sm); }
.section-count { font-size: var(--font-size-sm); font-weight: normal; color: var(--color-text-muted); background: var(--color-bg-elevated); padding: 2px var(--space-sm); border-radius: var(--radius-full); }

/* ── Tables ── */
.weapon-table { border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.table-header {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 0.5fr;
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
.table-header--armor { grid-template-columns: 2.5fr 1fr 0.5fr 1.5fr 0.5fr; }
/* Alignement centré des colonnes Dégâts (4e), Mains/Feature (5e), Tier (6e) */
.table-header span:nth-child(4),
.table-header span:nth-child(6) { text-align: center; }
.table-header--armor span:nth-child(2),
.table-header--armor span:nth-child(3),
.table-header--armor span:nth-child(5) { text-align: center; }
.table-row {
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 0.5fr;
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
.table-row--armor { grid-template-columns: 2.5fr 1fr 0.5fr 1.5fr 0.5fr; }

.cell-name { font-weight: var(--font-weight-medium); }
.cell-trait, .cell-range, .cell-burden, .cell-feature-key { color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.cell-damage, .cell-score, .cell-thresholds, .cell-tier {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cell-thresholds { font-family: monospace; color: var(--color-text-secondary); font-size: var(--font-size-xs); }

/* ── Badges ── */
.tier-badge { font-size: 0.65rem; font-weight: var(--font-weight-bold); padding: 1px 6px; border-radius: var(--radius-sm); background: rgba(83, 168, 182, 0.1); color: var(--color-accent-hope); border: 1px solid rgba(83, 168, 182, 0.3); }
.damage-badge { font-size: var(--font-size-xs); padding: 2px var(--space-xs); border-radius: var(--radius-sm); font-weight: var(--font-weight-bold); font-family: monospace; }
.damage-badge--phy { background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); }
.damage-badge--mag { background: rgba(139, 92, 246, 0.1); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

.rarity-badge { font-size: 0.6rem; padding: 1px 6px; border-radius: var(--radius-sm); font-weight: var(--font-weight-medium); }
.rarity-badge--common { background: rgba(156, 163, 175, 0.15); color: #6b7280; }
.rarity-badge--uncommon { background: rgba(34, 197, 94, 0.1); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.2); }
.rarity-badge--rare { background: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.2); }
.rarity-badge--legendary { background: rgba(234, 179, 8, 0.1); color: #ca8a04; border: 1px solid rgba(234, 179, 8, 0.3); }

/* ── Détails dépliables ── */
.item-details { padding: var(--space-sm) var(--space-md); background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); animation: slideDown 0.15s ease; }
.item-details[hidden] { display: none; }
.item-details__feature, .item-details__note { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0 0 4px; line-height: 1.5; }

/* ── Cartes (loot & consommables) ── */
.item-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-sm); }
.item-card { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
.item-card--consumable { border-top: 2px solid var(--color-accent-hope); }
.item-card--legendary { border-color: rgba(234, 179, 8, 0.3); }
.item-card--rare { border-color: rgba(59, 130, 246, 0.2); }

.item-card__header { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.item-card__roll { font-size: 0.65rem; font-family: monospace; color: var(--color-text-muted); background: var(--color-bg-surface); padding: 2px 6px; border-radius: var(--radius-sm); flex-shrink: 0; }
.item-card__meta { flex: 1; }
.item-card__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); margin: 0 0 2px; }
.item-card__desc { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; line-height: 1.5; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); margin: 0 0 var(--space-md); }

/* ── Accessibilité ── */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

@keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 600px) {
  /* Armes : masquer colonnes 5 (Mains/Feature) et 6 (Tier) → garder 4 colonnes */
  .table-header:not(.table-header--armor),
  .table-row:not(.table-row--armor) { grid-template-columns: 2fr 1fr 1fr 1fr; }
  .table-header:not(.table-header--armor) span:nth-child(5),
  .table-header:not(.table-header--armor) span:nth-child(6),
  .table-row:not(.table-row--armor) .cell-burden,
  .table-row:not(.table-row--armor) .cell-feature-key,
  .table-row:not(.table-row--armor) .cell-tier { display: none; }
  /* Armures : masquer Feature (col 4) → garder 4 colonnes */
  .table-header--armor, .table-row--armor { grid-template-columns: 2fr 1fr 0.5fr 0.5fr; }
  .table-header--armor span:nth-child(4), .table-row--armor .cell-feature-key { display: none; }
  .item-card-grid { grid-template-columns: 1fr; }
  .browser-filters { flex-direction: column; align-items: stretch; }
}

.item-details__duplicate-btn {
  margin-top: var(--space-sm);
}

.item-card__duplicate-btn {
  margin-top: var(--space-sm);
  width: 100%;
}
</style>
