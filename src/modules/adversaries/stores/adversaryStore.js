/**
 * @module adversaries/stores/adversaryStore
 * @description Store Pinia pour la gestion des adversaires :
 * filtrage, tri, sélection, recherche.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { allAdversaries, ADVERSARY_TYPES, ADVERSARY_GENRES, TIERS } from '@data/adversaries'
import { useAdversaryHomebrewStore } from '@modules/homebrew/categories/adversary/useAdversaryHomebrewStore.js'

export { useAdversaryHomebrewStore }

export const useAdversaryStore = defineStore('adversaries', () => {
  // ── État ───────────────────────────────────────────────
  const searchQuery = ref('')
  const selectedTiers = ref([])
  const selectedTypes = ref([])
  const selectedGenres = ref([])
  const sortField = ref('name')
  const sortDirection = ref('asc')
  const selectedAdversaryId = ref(null)
  const sourceFilter = ref('all') // 'all' | 'srd' | 'custom'

  // ── Store Homebrew ────────────────────────────────────
  const homebrewStore = useAdversaryHomebrewStore()

  // ── Constantes exposées ────────────────────────────────
  const availableTypes = ADVERSARY_TYPES
  const availableGenres = ADVERSARY_GENRES
  const availableTiers = TIERS

  // ── Getters ────────────────────────────────────────────

  /** Tous les adversaires : SRD + homebrew fusionnés */
  const allItems = computed(() => [
    ...allAdversaries,
    ...homebrewStore.items.map((item) => ({
      ...item,
      source: 'custom'
    }))
  ])

  // ── Getters ────────────────────────────────────────────

  /** Liste filtrée et triée des adversaires */
  const filteredAdversaries = computed(() => {
    let result = [...allItems.value]

    // Filtre par source (SRD / homebrew)
    if (sourceFilter.value === 'srd') {
      result = result.filter((a) => a.source !== 'custom')
    } else if (sourceFilter.value === 'custom') {
      result = result.filter((a) => a.source === 'custom')
    }

    // Filtre par recherche textuelle
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.motives || []).some((m) => m.toLowerCase().includes(q))
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

    // Filtre par genres (OR : l'adversaire passe s'il a au moins un genre sélectionné)
    if (selectedGenres.value.length > 0) {
      result = result.filter((a) =>
        (a.genres || []).some((g) => selectedGenres.value.includes(g))
      )
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
  const totalCount = computed(() => allItems.value.length)

  /** Nombre d'adversaires filtrés */
  const filteredCount = computed(() => filteredAdversaries.value.length)

  /** Adversaire actuellement sélectionné */
  const selectedAdversary = computed(() => {
    if (!selectedAdversaryId.value) return null
    return allItems.value.find((a) => a.id === selectedAdversaryId.value) || null
  })

  /** Indique si des filtres sont actifs */
  const hasActiveFilters = computed(() =>
    searchQuery.value.trim().length > 0 ||
    selectedTiers.value.length > 0 ||
    selectedTypes.value.length > 0 ||
    selectedGenres.value.length > 0 ||
    sourceFilter.value !== 'all'
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

  function toggleGenre(genre) {
    const idx = selectedGenres.value.indexOf(genre)
    if (idx === -1) {
      selectedGenres.value.push(genre)
    } else {
      selectedGenres.value.splice(idx, 1)
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
    selectedGenres.value = []
    sourceFilter.value = 'all'
  }

  function resetAll() {
    clearFilters()
    clearSelection()
    sortField.value = 'name'
    sortDirection.value = 'asc'
  }

  /** Cherche un adversaire par id */
  function getAdversaryById(id) {
    return allItems.value.find((a) => a.id === id) || null
  }

  return {
    // State
    searchQuery,
    selectedTiers,
    selectedTypes,
    selectedGenres,
    sortField,
    sortDirection,
    selectedAdversaryId,
    sourceFilter,
    // Constants
    availableTypes,
    availableGenres,
    availableTiers,
    // Getters
    allItems,
    filteredAdversaries,
    totalCount,
    filteredCount,
    selectedAdversary,
    hasActiveFilters,
    // Actions
    setSearch,
    toggleTier,
    toggleType,
    toggleGenre,
    setSort,
    selectAdversary,
    clearSelection,
    clearFilters,
    resetAll,
    getAdversaryById
  }
})
