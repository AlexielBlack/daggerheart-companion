/**
 * @module adversaries/stores/adversaryStore
 * @description Store Pinia pour la gestion des adversaires :
 * filtrage, tri, sélection, recherche.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { allAdversaries, ADVERSARY_TYPES, TIERS } from '@data/adversaries'

export const useAdversaryStore = defineStore('adversaries', () => {
  // ── État ───────────────────────────────────────────────
  const searchQuery = ref('')
  const selectedTiers = ref([])
  const selectedTypes = ref([])
  const sortField = ref('name')
  const sortDirection = ref('asc')
  const selectedAdversaryId = ref(null)

  // ── Constantes exposées ────────────────────────────────
  const availableTypes = ADVERSARY_TYPES
  const availableTiers = TIERS

  // ── Getters ────────────────────────────────────────────

  /** Liste filtrée et triée des adversaires */
  const filteredAdversaries = computed(() => {
    let result = [...allAdversaries]

    // Filtre par recherche textuelle
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.motives.some((m) => m.toLowerCase().includes(q))
      )
    }

    // Filtre par tiers
    if (selectedTiers.value.length > 0) {
      result = result.filter((a) => selectedTiers.value.includes(a.tier))
    }

    // Filtre par types
    if (selectedTypes.value.length > 0) {
      result = result.filter((a) => selectedTypes.value.includes(a.type))
    }

    // Tri
    result.sort((a, b) => {
      let cmp
      switch (sortField.value) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'tier':
          cmp = a.tier - b.tier || a.name.localeCompare(b.name)
          break
        case 'difficulty':
          cmp = a.difficulty - b.difficulty || a.name.localeCompare(b.name)
          break
        case 'hp':
          cmp = a.hp - b.hp || a.name.localeCompare(b.name)
          break
        case 'type':
          cmp = a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
          break
        default:
          cmp = a.name.localeCompare(b.name)
      }
      return sortDirection.value === 'desc' ? -cmp : cmp
    })

    return result
  })

  /** Nombre total d'adversaires (sans filtre) */
  const totalCount = computed(() => allAdversaries.length)

  /** Nombre d'adversaires filtrés */
  const filteredCount = computed(() => filteredAdversaries.value.length)

  /** Adversaire actuellement sélectionné */
  const selectedAdversary = computed(() => {
    if (!selectedAdversaryId.value) return null
    return allAdversaries.find((a) => a.id === selectedAdversaryId.value) || null
  })

  /** Indique si des filtres sont actifs */
  const hasActiveFilters = computed(() =>
    searchQuery.value.trim().length > 0 ||
    selectedTiers.value.length > 0 ||
    selectedTypes.value.length > 0
  )

  // ── Actions ────────────────────────────────────────────

  function setSearch(query) {
    searchQuery.value = query
  }

  function toggleTier(tier) {
    const idx = selectedTiers.value.indexOf(tier)
    if (idx === -1) {
      selectedTiers.value.push(tier)
    } else {
      selectedTiers.value.splice(idx, 1)
    }
  }

  function toggleType(type) {
    const idx = selectedTypes.value.indexOf(type)
    if (idx === -1) {
      selectedTypes.value.push(type)
    } else {
      selectedTypes.value.splice(idx, 1)
    }
  }

  function setSort(field) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  function selectAdversary(id) {
    selectedAdversaryId.value = id
  }

  function clearSelection() {
    selectedAdversaryId.value = null
  }

  function clearFilters() {
    searchQuery.value = ''
    selectedTiers.value = []
    selectedTypes.value = []
  }

  function resetAll() {
    clearFilters()
    clearSelection()
    sortField.value = 'name'
    sortDirection.value = 'asc'
  }

  /** Cherche un adversaire par id */
  function getAdversaryById(id) {
    return allAdversaries.find((a) => a.id === id) || null
  }

  return {
    // State
    searchQuery,
    selectedTiers,
    selectedTypes,
    sortField,
    sortDirection,
    selectedAdversaryId,
    // Constants
    availableTypes,
    availableTiers,
    // Getters
    filteredAdversaries,
    totalCount,
    filteredCount,
    selectedAdversary,
    hasActiveFilters,
    // Actions
    setSearch,
    toggleTier,
    toggleType,
    setSort,
    selectAdversary,
    clearSelection,
    clearFilters,
    resetAll,
    getAdversaryById
  }
})
