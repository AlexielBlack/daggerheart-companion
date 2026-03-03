/**
 * @module environments/stores/environmentStore
 * @description Store Pinia pour la gestion des environnements :
 * filtrage, tri, sélection, recherche.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { allEnvironments, ENVIRONMENT_TYPES, TIERS } from '@data/environments'
import { useEnvironmentHomebrewStore } from '@modules/homebrew/categories/environment/useEnvironmentHomebrewStore.js'

export { useEnvironmentHomebrewStore }

export const useEnvironmentStore = defineStore('environments', () => {
  // ── État ───────────────────────────────────────────────
  const searchQuery = ref('')
  const selectedTiers = ref([])
  const selectedTypes = ref([])
  const sortField = ref('name')
  const sortDirection = ref('asc')
  const selectedEnvironmentId = ref(null)

  // ── Store Homebrew ────────────────────────────────────
  const homebrewStore = useEnvironmentHomebrewStore()

  // ── Constantes exposées ────────────────────────────────
  const availableTypes = ENVIRONMENT_TYPES
  const availableTiers = TIERS

  // ── Getters ────────────────────────────────────────────

  /** Tous les environnements : SRD + homebrew fusionnés */
  const allItems = computed(() => [
    ...allEnvironments,
    ...homebrewStore.items.map((item) => ({
      ...item,
      source: 'custom'
    }))
  ])

  /** Liste filtrée et triée des environnements */
  const filteredEnvironments = computed(() => {
    let result = [...allItems.value]

    // Filtre par recherche textuelle
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.impulses || []).some((i) => i.toLowerCase().includes(q))
      )
    }

    // Filtre par tiers
    if (selectedTiers.value.length > 0) {
      result = result.filter((e) => selectedTiers.value.includes(e.tier))
    }

    // Filtre par types
    if (selectedTypes.value.length > 0) {
      result = result.filter((e) => selectedTypes.value.includes(e.type))
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
          cmp = (a.difficulty ?? 0) - (b.difficulty ?? 0) || a.name.localeCompare(b.name)
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

  /** Nombre total d'environnements (sans filtre) */
  const totalCount = computed(() => allItems.value.length)

  /** Nombre d'environnements filtrés */
  const filteredCount = computed(() => filteredEnvironments.value.length)

  /** Environnement actuellement sélectionné */
  const selectedEnvironment = computed(() => {
    if (!selectedEnvironmentId.value) return null
    return allItems.value.find((e) => e.id === selectedEnvironmentId.value) || null
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

  function selectEnvironment(id) {
    selectedEnvironmentId.value = id
  }

  function clearSelection() {
    selectedEnvironmentId.value = null
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

  /** Cherche un environnement par id */
  function getEnvironmentById(id) {
    return allItems.value.find((e) => e.id === id) || null
  }

  return {
    // State
    searchQuery,
    selectedTiers,
    selectedTypes,
    sortField,
    sortDirection,
    selectedEnvironmentId,
    // Constants
    availableTypes,
    availableTiers,
    // Getters
    filteredEnvironments,
    totalCount,
    filteredCount,
    selectedEnvironment,
    hasActiveFilters,
    // Actions
    setSearch,
    toggleTier,
    toggleType,
    setSort,
    selectEnvironment,
    clearSelection,
    clearFilters,
    resetAll,
    getEnvironmentById
  }
})
