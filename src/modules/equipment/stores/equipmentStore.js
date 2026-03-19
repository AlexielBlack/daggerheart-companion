/**
 * @module equipment/store
 * @description Store Pinia pour naviguer et filtrer l'équipement Daggerheart.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PRIMARY_WEAPONS,
  SECONDARY_WEAPONS,
  ARMOR,
  LOOT,
  CONSUMABLES,
  EQUIPMENT_COUNTS
} from '@/data/equipment/index.js'
import { useEquipmentHomebrewStore } from '@modules/homebrew/categories/equipment/useEquipmentHomebrewStore.js'

export { useEquipmentHomebrewStore }

export const useEquipmentStore = defineStore('equipment', () => {
  // ─── State ───
  const searchQuery = ref('')
  const activeCategory = ref('all')
  const activeTier = ref(0) // 0 = all tiers
  const activeDamageType = ref('all') // all | phy | mag
  const activeRarity = ref('all') // all | common | uncommon | rare | legendary
  const sourceFilter = ref('all') // 'all' | 'srd' | 'custom'

  // ─── Homebrew ───
  const homebrewStore = useEquipmentHomebrewStore()

  /** Items homebrew par catégorie, normalisés avec source: 'custom' */
  const homebrewPrimary = computed(() =>
    homebrewStore.items.filter((i) => i.category === 'primaryWeapon').map((i) => ({ ...i, source: 'custom' }))
  )
  const homebrewSecondary = computed(() =>
    homebrewStore.items.filter((i) => i.category === 'secondaryWeapon').map((i) => ({ ...i, source: 'custom' }))
  )
  const homebrewArmor = computed(() =>
    homebrewStore.items.filter((i) => i.category === 'armor').map((i) => ({ ...i, source: 'custom' }))
  )
  const homebrewLoot = computed(() =>
    homebrewStore.items.filter((i) => i.category === 'loot').map((i) => ({ ...i, source: 'custom' }))
  )
  const homebrewConsumable = computed(() =>
    homebrewStore.items.filter((i) => i.category === 'consumable').map((i) => ({ ...i, source: 'custom' }))
  )

  /** Listes fusionnées SRD + homebrew */
  const allPrimary = computed(() => [...PRIMARY_WEAPONS, ...homebrewPrimary.value])
  const allSecondary = computed(() => [...SECONDARY_WEAPONS, ...homebrewSecondary.value])
  const allArmor = computed(() => [...ARMOR, ...homebrewArmor.value])
  const allLoot = computed(() => [...LOOT, ...homebrewLoot.value])
  const allConsumable = computed(() => [...CONSUMABLES, ...homebrewConsumable.value])

  /** Compteurs dynamiques */
  const counts = computed(() => ({
    ...EQUIPMENT_COUNTS,
    total: allPrimary.value.length + allSecondary.value.length + allArmor.value.length + allLoot.value.length + allConsumable.value.length,
    primary: allPrimary.value.length,
    secondary: allSecondary.value.length,
    armor: allArmor.value.length,
    loot: allLoot.value.length,
    consumable: allConsumable.value.length
  }))

  // ─── Catégories ───
  const categories = [
    { id: 'all', label: 'Tout', emoji: '📦' },
    { id: 'primaryWeapon', label: 'Armes Primaires', emoji: '⚔️' },
    { id: 'secondaryWeapon', label: 'Armes Secondaires', emoji: '🛡️' },
    { id: 'armor', label: 'Armures', emoji: '🛡️' },
    { id: 'loot', label: 'Loot', emoji: '💎' },
    { id: 'consumable', label: 'Consommables', emoji: '🧪' }
  ]

  // ─── Filtrage texte ───
  function matchesSearch(item) {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return true
    const fields = [
      item.name,
      item.feature,
      item.featureKey,
      item.description,
      item.trait,
      item.range,
      item.damage,
      item.damageType === 'phy' ? 'physique physical' : '',
      item.damageType === 'mag' ? 'magique magic' : ''
    ]
    return fields.some((f) => f && f.toLowerCase().includes(q))
  }

  // ─── Filtrage tier ───
  function matchesTier(item) {
    if (activeTier.value === 0) return true
    return item.tier === activeTier.value
  }

  // ─── Filtrage type dégâts ───
  function matchesDamageType(item) {
    if (activeDamageType.value === 'all') return true
    return item.damageType === activeDamageType.value
  }

  // ─── Filtrage rareté (loot/consumables) ───
  function matchesRarity(item) {
    if (activeRarity.value === 'all') return true
    return item.rarity === activeRarity.value
  }

  // ─── Filtrage source (SRD / homebrew) ───
  function matchesSource(item) {
    if (sourceFilter.value === 'all') return true
    if (sourceFilter.value === 'srd') return item.source !== 'custom'
    if (sourceFilter.value === 'custom') return item.source === 'custom'
    return true
  }

  // ─── Computed filtered lists ───
  const filteredPrimaryWeapons = computed(() =>
    allPrimary.value.filter((w) => matchesSearch(w) && matchesTier(w) && matchesDamageType(w) && matchesSource(w))
  )

  const filteredSecondaryWeapons = computed(() =>
    allSecondary.value.filter((w) => matchesSearch(w) && matchesTier(w) && matchesSource(w))
  )

  const filteredArmor = computed(() =>
    allArmor.value.filter((a) => matchesSearch(a) && matchesTier(a) && matchesSource(a))
  )

  const filteredLoot = computed(() =>
    allLoot.value.filter((l) => matchesSearch(l) && matchesRarity(l) && matchesSource(l))
  )

  const filteredConsumables = computed(() =>
    allConsumable.value.filter((c) => matchesSearch(c) && matchesRarity(c) && matchesSource(c))
  )

  // ─── Visibilité par catégorie ───
  function showCategory(cat) {
    return activeCategory.value === 'all' || activeCategory.value === cat
  }

  const totalFiltered = computed(() => {
    let count = 0
    if (showCategory('primaryWeapon')) count += filteredPrimaryWeapons.value.length
    if (showCategory('secondaryWeapon')) count += filteredSecondaryWeapons.value.length
    if (showCategory('armor')) count += filteredArmor.value.length
    if (showCategory('loot')) count += filteredLoot.value.length
    if (showCategory('consumable')) count += filteredConsumables.value.length
    return count
  })

  // ─── Actions ───
  function resetFilters() {
    searchQuery.value = ''
    activeCategory.value = 'all'
    activeTier.value = 0
    activeDamageType.value = 'all'
    activeRarity.value = 'all'
    sourceFilter.value = 'all'
  }

  return {
    // State
    searchQuery,
    activeCategory,
    activeTier,
    activeDamageType,
    activeRarity,
    sourceFilter,
    // Constants
    categories,
    counts,
    // Computed
    filteredPrimaryWeapons,
    filteredSecondaryWeapons,
    filteredArmor,
    filteredLoot,
    filteredConsumables,
    totalFiltered,
    // Methods
    showCategory,
    resetFilters
  }
})
