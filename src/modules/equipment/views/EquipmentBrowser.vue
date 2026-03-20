<template>
  <div class="equipment-browser">
    <!-- En-tete -->
    <header class="browser-header">
      <h1 class="browser-header__title">
        Equipement
      </h1>
      <p class="browser-header__subtitle">
        {{ store.totalFiltered }} objet{{ store.totalFiltered > 1 ? 's' : '' }}
        sur {{ store.counts.total }} — Armes, Armures, Loot &amp; Consommables
      </p>
    </header>

    <!-- Filtres -->
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

      <!-- Categories -->
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

      <!-- Type de degats (armes primaires) -->
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

      <!-- Rarete (loot + consumables) -->
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
        Réinitialiser
      </button>
    </div>

    <!-- Filtre par source + bouton creation -->
    <div class="equipment-browser__toolbar">
      <SourceFilter v-model="store.sourceFilter" />
      <router-link
        to="/compendium/equipement/new"
        class="btn btn--secondary btn--sm equipment-browser__create-btn"
        aria-label="Créer un équipement custom"
      >
        + Créer un custom
      </router-link>
    </div>

    <!-- ARMES PRIMAIRES -->
    <section
      v-if="store.showCategory('primaryWeapon') && store.filteredPrimaryWeapons.length"
      class="equipment-section"
      aria-label="Armes primaires"
    >
      <h2 class="section-title">
        <button
          class="section-title__toggle"
          :aria-expanded="String(isSectionOpen('primaryWeapon'))"
          aria-controls="section-primary-weapons"
          @click="toggleSection('primaryWeapon')"
        >
          <span
            class="section-title__chevron"
            :class="{ 'section-title__chevron--collapsed': !isSectionOpen('primaryWeapon') }"
          >&#x25BC;</span>
          Armes Primaires
          <span class="section-count">{{ store.filteredPrimaryWeapons.length }}</span>
        </button>
      </h2>
      <div
        v-show="isSectionOpen('primaryWeapon')"
        id="section-primary-weapons"
      >
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
                <SourceBadge :source="weapon.source" />
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
                Arme magique — nécessite un trait Spellcast
              </p>
              <p
                v-if="!weapon.feature"
                class="item-details__note"
              >
                Pas de feature spéciale.
              </p>
              <button
                v-if="weapon.source === 'custom'"
                class="btn btn--secondary btn--xs item-details__edit-btn"
                aria-label="Modifier cet équipement custom"
                @click.stop="startEdit(weapon)"
              >
                Modifier
              </button>
              <button
                class="btn btn--secondary btn--sm item-details__duplicate-btn"
                @click.stop="duplicateToHomebrew(weapon)"
              >
                Dupliquer en homebrew
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ARMES SECONDAIRES -->
    <section
      v-if="store.showCategory('secondaryWeapon') && store.filteredSecondaryWeapons.length"
      class="equipment-section"
      aria-label="Armes secondaires"
    >
      <h2 class="section-title">
        <button
          class="section-title__toggle"
          :aria-expanded="String(isSectionOpen('secondaryWeapon'))"
          aria-controls="section-secondary-weapons"
          @click="toggleSection('secondaryWeapon')"
        >
          <span
            class="section-title__chevron"
            :class="{ 'section-title__chevron--collapsed': !isSectionOpen('secondaryWeapon') }"
          >&#x25BC;</span>
          Armes Secondaires
          <span class="section-count">{{ store.filteredSecondaryWeapons.length }}</span>
        </button>
      </h2>
      <div
        v-show="isSectionOpen('secondaryWeapon')"
        id="section-secondary-weapons"
      >
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
              >
                {{ weapon.name }}
                <SourceBadge :source="weapon.source" />
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
                v-if="weapon.source === 'custom'"
                class="btn btn--secondary btn--xs item-details__edit-btn"
                aria-label="Modifier cet équipement custom"
                @click.stop="startEdit(weapon)"
              >
                Modifier
              </button>
              <button
                class="btn btn--secondary btn--sm item-details__duplicate-btn"
                @click.stop="duplicateToHomebrew(weapon)"
              >
                Dupliquer en homebrew
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ARMURES -->
    <section
      v-if="store.showCategory('armor') && store.filteredArmor.length"
      class="equipment-section"
      aria-label="Armures"
    >
      <h2 class="section-title">
        <button
          class="section-title__toggle"
          :aria-expanded="String(isSectionOpen('armor'))"
          aria-controls="section-armor"
          @click="toggleSection('armor')"
        >
          <span
            class="section-title__chevron"
            :class="{ 'section-title__chevron--collapsed': !isSectionOpen('armor') }"
          >&#x25BC;</span>
          Armures
          <span class="section-count">{{ store.filteredArmor.length }}</span>
        </button>
      </h2>
      <div
        v-show="isSectionOpen('armor')"
        id="section-armor"
      >
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
              >
                {{ armor.name }}
                <SourceBadge :source="armor.source" />
              </span>
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
                v-if="armor.source === 'custom'"
                class="btn btn--secondary btn--xs item-details__edit-btn"
                aria-label="Modifier cet équipement custom"
                @click.stop="startEdit(armor)"
              >
                Modifier
              </button>
              <button
                class="btn btn--secondary btn--sm item-details__duplicate-btn"
                @click.stop="duplicateToHomebrew(armor)"
              >
                Dupliquer en homebrew
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- LOOT -->
    <section
      v-if="store.showCategory('loot') && store.filteredLoot.length"
      class="equipment-section"
      aria-label="Loot"
    >
      <h2 class="section-title">
        <button
          class="section-title__toggle"
          :aria-expanded="String(isSectionOpen('loot'))"
          aria-controls="section-loot"
          @click="toggleSection('loot')"
        >
          <span
            class="section-title__chevron"
            :class="{ 'section-title__chevron--collapsed': !isSectionOpen('loot') }"
          >&#x25BC;</span>
          Loot
          <span class="section-count">{{ store.filteredLoot.length }}</span>
        </button>
      </h2>
      <div
        v-show="isSectionOpen('loot')"
        id="section-loot"
      >
        <div
          class="item-card-grid"
          :class="{ 'item-card-grid--custom': compendiumColumns > 0 }"
          :style="cardGridStyle"
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
                  <SourceBadge :source="item.source" />
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
            <div class="item-card__actions">
              <button
                v-if="item.source === 'custom'"
                class="btn btn--secondary btn--xs item-card__edit-btn"
                aria-label="Modifier cet équipement custom"
                @click.stop="startEdit(item)"
              >
                Modifier
              </button>
              <button
                class="btn btn--secondary btn--xs item-card__duplicate-btn"
                @click.stop="duplicateToHomebrew(item)"
              >
                Homebrew
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CONSOMMABLES -->
    <section
      v-if="store.showCategory('consumable') && store.filteredConsumables.length"
      class="equipment-section"
      aria-label="Consommables"
    >
      <h2 class="section-title">
        <button
          class="section-title__toggle"
          :aria-expanded="String(isSectionOpen('consumable'))"
          aria-controls="section-consumables"
          @click="toggleSection('consumable')"
        >
          <span
            class="section-title__chevron"
            :class="{ 'section-title__chevron--collapsed': !isSectionOpen('consumable') }"
          >&#x25BC;</span>
          Consommables
          <span class="section-count">{{ store.filteredConsumables.length }}</span>
        </button>
      </h2>
      <div
        v-show="isSectionOpen('consumable')"
        id="section-consumables"
      >
        <div
          class="item-card-grid"
          :class="{ 'item-card-grid--custom': compendiumColumns > 0 }"
          :style="cardGridStyle"
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
                  <SourceBadge :source="item.source" />
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
            <div class="item-card__actions">
              <button
                v-if="item.source === 'custom'"
                class="btn btn--secondary btn--xs item-card__edit-btn"
                aria-label="Modifier cet équipement custom"
                @click.stop="startEdit(item)"
              >
                Modifier
              </button>
              <button
                class="btn btn--secondary btn--xs item-card__duplicate-btn"
                @click.stop="duplicateToHomebrew(item)"
              >
                Homebrew
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Panneau d'edition inline -->
    <aside
      v-if="editingInline"
      ref="editPanel"
      class="equipment-browser__edit-panel"
      aria-label="Edition d'équipement custom"
    >
      <h3>{{ creatingNew ? 'Nouvel équipement custom' : 'Modifier' }}</h3>
      <HomebrewForm
        :schema="equipmentSchema"
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
      v-if="store.totalFiltered === 0 && !editingInline"
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
import { ref, computed, inject, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useEquipmentStore } from '../stores/equipmentStore.js'
import { RANGES, BURDENS, RARITIES } from '@/data/equipment/constants.js'
import { useEquipmentHomebrewStore } from '@modules/homebrew/categories/equipment/useEquipmentHomebrewStore.js'
import SourceFilter from '@core/components/SourceFilter.vue'
import SourceBadge from '@core/components/SourceBadge.vue'
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { equipmentSchema } from '@modules/homebrew/schemas/equipmentSchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'
import { useNotification } from '@core/composables/useNotification.js'

export default {
  name: 'EquipmentBrowser',

  components: { SourceFilter, SourceBadge, HomebrewForm },

  setup() {
    const store = useEquipmentStore()
    const homebrewStore = useEquipmentHomebrewStore()
    const { success: notifySuccess } = useNotification()
    const router = useRouter()
    const route = useRoute()
    const expandedId = ref(null)
    const compendiumColumns = inject('compendiumColumns', ref(0))

    // --- Sections collapsibles ---
    const collapsedSections = ref(new Set())

    function toggleSection(section) {
      if (collapsedSections.value.has(section)) {
        collapsedSections.value.delete(section)
      } else {
        collapsedSections.value.add(section)
      }
      // Forcer la réactivité
      collapsedSections.value = new Set(collapsedSections.value)
    }

    function isSectionOpen(section) {
      return !collapsedSections.value.has(section)
    }
    const cardGridStyle = computed(() => {
      if (!compendiumColumns.value || compendiumColumns.value === 0) return {}
      return { 'grid-template-columns': `repeat(${compendiumColumns.value}, 1fr)` }
    })

    // --- Refs pour l'edition inline ---
    const editingInline = ref(false)
    const creatingNew = ref(false)
    const editingItemId = ref(null)
    const editPanel = ref(null)

    function scrollToEditPanel() {
      nextTick(() => {
        editPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }

    // --- Composable formulaire ---
    const { formData, isDirty, hydrate, setField, toRawData, reset } = useFormSchema(equipmentSchema)

    const tierOptions = [
      { value: 0, label: 'Tous Tiers' },
      { value: 1, label: 'T1 (Niv 1)' },
      { value: 2, label: 'T2 (Niv 2-4)' },
      { value: 3, label: 'T3 (Niv 5-7)' },
      { value: 4, label: 'T4 (Niv 8-10)' }
    ]

    const damageTypeOptions = [
      { value: 'all', label: 'Tous types' },
      { value: 'phy', label: 'Physique' },
      { value: 'mag', label: 'Magique' }
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
      const result = homebrewStore.createFromTemplate(item)
      if (result.success) {
        notifySuccess(`\u00ab ${item.name} \u00bb dupliqu\u00e9 en homebrew`)
        router.push(`/compendium/equipement/${result.id}`)
      }
    }

    return {
      store,
      homebrewStore,
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
      duplicateToHomebrew,
      editingInline,
      creatingNew,
      editingItemId,
      formData,
      isDirty,
      hydrate,
      setField,
      toRawData,
      reset,
      equipmentSchema,
      editPanel,
      scrollToEditPanel,
      compendiumColumns,
      cardGridStyle,
      collapsedSections,
      toggleSection,
      isSectionOpen
    }
  },

  methods: {
    // --- Edition inline ---
    startEdit(item) {
      // Priorité : données brutes du store homebrew (pas la version normalisée)
      const raw = this.homebrewStore.items.find((hb) => hb.id === item.id)
      this.hydrate(raw || item)
      this.editingInline = true
      this.creatingNew = false
      this.editingItemId = item.id
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
        const result = this.homebrewStore.update(this.editingItemId, data)
        if (!result.success && result.error && result.error.includes('introuvable')) {
          this.homebrewStore.create({ ...data, id: this.editingItemId })
        }
      }
      this.editingInline = false
      this.editingItemId = null
    },
    onCancelEdit() {
      this.editingInline = false
      this.creatingNew = false
      this.editingItemId = null
    }
  }
}
</script>

<style scoped>
.equipment-browser { }

/* -- Header -- */
.browser-header { margin-bottom: var(--space-lg); }
.browser-header__title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.browser-header__subtitle { color: var(--color-text-secondary); margin: 0; font-size: var(--font-size-sm); }

/* -- Toolbar -- */
.equipment-browser__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
  margin-bottom: var(--space-lg);
}

.equipment-browser__create-btn {
  text-decoration: none;
  white-space: nowrap;
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-medium);
}

/* -- Filtres -- */
.browser-filters { display: flex; flex-wrap: wrap; gap: var(--space-sm); margin-bottom: var(--space-md); align-items: center; }
.filter-input { flex: 1; min-width: 200px; padding: var(--space-sm) var(--space-md); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.filter-input:focus { outline: 2px solid var(--color-accent-hope); outline-offset: 1px; }
.filter-group { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.filter-chip { padding: var(--space-xs) var(--space-sm); min-height: var(--touch-min); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: transparent; color: var(--color-text-secondary); font-size: var(--font-size-xs); cursor: pointer; transition: all var(--transition-fast); }
.filter-chip:hover { border-color: var(--color-accent-hope); color: var(--color-accent-hope); }
.filter-chip--active { background: var(--color-accent-hope); border-color: var(--color-accent-hope); color: #fff; font-weight: var(--font-weight-medium); }
.filter-reset { padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-full); background: transparent; color: var(--color-text-muted); font-size: var(--font-size-xs); cursor: pointer; }
.filter-reset:hover { border-color: #dc2626; color: #dc2626; }

/* -- Sections -- */
.equipment-section { margin-bottom: var(--space-xl); }
.section-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text-primary); margin: 0 0 var(--space-md); display: flex; align-items: center; gap: var(--space-sm); }
.section-count { font-size: var(--font-size-sm); font-weight: normal; color: var(--color-text-muted); background: var(--color-bg-elevated); padding: 2px var(--space-sm); border-radius: var(--radius-full); }

.section-title__toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0;
  width: 100%;
}

.section-title__toggle:hover {
  color: var(--color-accent-hope);
}

.section-title__chevron {
  font-size: var(--font-size-xs);
  transition: transform var(--transition-fast);
}

.section-title__chevron--collapsed {
  transform: rotate(-90deg);
}

/* -- Tables -- */
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
  position: sticky;
  top: 0;
  z-index: 1;
}
.table-header--armor { grid-template-columns: 2.5fr 1fr 0.5fr 1.5fr 0.5fr; }
/* Alignement des colonnes */
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

/* -- Badges -- */
.tier-badge { font-size: 0.65rem; font-weight: var(--font-weight-bold); padding: 1px 6px; border-radius: var(--radius-sm); background: rgba(83, 168, 182, 0.1); color: var(--color-accent-hope); border: 1px solid rgba(83, 168, 182, 0.3); }
.damage-badge { font-size: var(--font-size-xs); padding: 2px var(--space-xs); border-radius: var(--radius-sm); font-weight: var(--font-weight-bold); font-family: monospace; }
.damage-badge--phy { background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3); }
.damage-badge--mag { background: rgba(139, 92, 246, 0.1); color: #7c3aed; border: 1px solid rgba(139, 92, 246, 0.3); }

.rarity-badge { font-size: 0.6rem; padding: 1px 6px; border-radius: var(--radius-sm); font-weight: var(--font-weight-medium); }
.rarity-badge--common { background: rgba(156, 163, 175, 0.15); color: #6b7280; }
.rarity-badge--uncommon { background: rgba(34, 197, 94, 0.1); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.2); }
.rarity-badge--rare { background: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.2); }
.rarity-badge--legendary { background: rgba(234, 179, 8, 0.1); color: #ca8a04; border: 1px solid rgba(234, 179, 8, 0.3); }

/* -- Details depliables -- */
.item-details { padding: var(--space-sm) var(--space-md); background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-border); animation: slideDown 0.15s ease; }
.item-details[hidden] { display: none; }
.item-details__feature, .item-details__note { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0 0 4px; line-height: 1.5; }

/* -- Cartes (loot & consommables) -- */
.item-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-sm); }
.item-card-grid--custom { grid-template-columns: unset; }
.item-card { background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); }
.item-card--consumable { border-top: 2px solid var(--color-accent-hope); }
.item-card--legendary { border-color: rgba(234, 179, 8, 0.3); }
.item-card--rare { border-color: rgba(59, 130, 246, 0.2); }

.item-card__header { display: flex; align-items: flex-start; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.item-card__roll { font-size: 0.65rem; font-family: monospace; color: var(--color-text-muted); background: var(--color-bg-surface); padding: 2px 6px; border-radius: var(--radius-sm); flex-shrink: 0; }
.item-card__meta { flex: 1; }
.item-card__name { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); margin: 0 0 2px; }
.item-card__desc { font-size: var(--font-size-xs); color: var(--color-text-secondary); margin: 0; line-height: 1.5; }
.item-card__actions { display: flex; gap: var(--space-xs); margin-top: var(--space-sm); }

/* -- Edit panel -- */
.equipment-browser__edit-panel {
  padding: var(--space-md);
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
  border-radius: var(--radius-md, 8px);
  margin-top: var(--space-md);
}

.equipment-browser__edit-panel h3 {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-family-heading);
}

.item-details__edit-btn {
  margin-top: var(--space-sm);
  margin-right: var(--space-xs);
}

.item-details__duplicate-btn {
  margin-top: var(--space-sm);
}

.item-card__duplicate-btn {
  flex: 1;
}

.item-card__edit-btn {
  flex: 1;
}

/* -- Empty state -- */
.empty-state { text-align: center; padding: var(--space-xl); }
.empty-state__icon { font-size: 2rem; margin: 0 0 var(--space-sm); }
.empty-state__text { color: var(--color-text-muted); margin: 0 0 var(--space-md); }

/* -- Accessibilite -- */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }

@keyframes slideDown { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 600px) {
  /* Armes : masquer colonnes 5 (Mains/Feature) et 6 (Tier) */
  .table-header:not(.table-header--armor),
  .table-row:not(.table-row--armor) { grid-template-columns: 2fr 1fr 1fr 1fr; }
  .table-header:not(.table-header--armor) span:nth-child(5),
  .table-header:not(.table-header--armor) span:nth-child(6),
  .table-row:not(.table-row--armor) .cell-burden,
  .table-row:not(.table-row--armor) .cell-feature-key,
  .table-row:not(.table-row--armor) .cell-tier { display: none; }
  /* Armures : masquer Feature (col 4) */
  .table-header--armor, .table-row--armor { grid-template-columns: 2fr 1fr 0.5fr 0.5fr; }
  .table-header--armor span:nth-child(4), .table-row--armor .cell-feature-key { display: none; }
  .item-card-grid { grid-template-columns: 1fr; }
  .browser-filters { flex-direction: column; align-items: stretch; }
}
</style>
