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

export const useEquipmentStore = defineStore('equipment', () => {
  // ─── State ───
  const searchQuery = ref('')
  const activeCategory = ref('all')
  const activeTier = ref(0) // 0 = all tiers
  const activeDamageType = ref('all') // all | phy | mag
  const activeRarity = ref('all') // all | common | uncommon | rare | legendary

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

  // ─── Computed filtered lists ───
  const filteredPrimaryWeapons = computed(() =>
    PRIMARY_WEAPONS.filter((w) => matchesSearch(w) && matchesTier(w) && matchesDamageType(w))
  )

  const filteredSecondaryWeapons = computed(() =>
    SECONDARY_WEAPONS.filter((w) => matchesSearch(w) && matchesTier(w))
  )

  const filteredArmor = computed(() =>
    ARMOR.filter((a) => matchesSearch(a) && matchesTier(a))
  )

  const filteredLoot = computed(() =>
    LOOT.filter((l) => matchesSearch(l) && matchesRarity(l))
  )

  const filteredConsumables = computed(() =>
    CONSUMABLES.filter((c) => matchesSearch(c) && matchesRarity(c))
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
  }

  return {
    // State
    searchQuery,
    activeCategory,
    activeTier,
    activeDamageType,
    activeRarity,
    // Constants
    categories,
    counts: EQUIPMENT_COUNTS,
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
