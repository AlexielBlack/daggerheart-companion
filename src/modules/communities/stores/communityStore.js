/**
 * @module communities/stores/communityStore
 * @description Store Pinia pour la gestion des communautés :
 * recherche, sélection, filtrage.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { COMMUNITIES, getCommunityById } from '@data/communities'
import { useCommunityHomebrewStore } from '@modules/homebrew/categories/community/useCommunityHomebrewStore.js'

export { useCommunityHomebrewStore }

export const useCommunityStore = defineStore('communities', () => {
  // ── État ───────────────────────────────────────────────
  const searchQuery = ref('')
  const expandedId = ref(null)
  const sourceFilter = ref('all') // 'all' | 'srd' | 'custom'

  // ── Store Homebrew ────────────────────────────────────
  const homebrewStore = useCommunityHomebrewStore()

  // ── Getters ────────────────────────────────────────────

  /** Toutes les communautés : SRD + homebrew fusionnées */
  const allCommunities = computed(() => [
    ...COMMUNITIES,
    ...homebrewStore.items.map((item) => ({
      ...item,
      source: 'custom'
    }))
  ])

  /** Liste filtrée des communautés */
  const filteredCommunities = computed(() => {
    let result = [...allCommunities.value]

    // Filtre par source (SRD / homebrew)
    if (sourceFilter.value === 'srd') {
      result = result.filter((c) => c.source !== 'custom')
    } else if (sourceFilter.value === 'custom') {
      result = result.filter((c) => c.source === 'custom')
    }

    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return result
    return result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.feature?.name?.toLowerCase().includes(q)) ||
        (c.feature?.description?.toLowerCase().includes(q)) ||
        (c.adjectives?.some((a) => a.toLowerCase().includes(q)))
    )
  })

  /** Nombre total de communautés */
  const totalCount = computed(() => allCommunities.value.length)

  /** Nombre de communautés filtrées */
  const filteredCount = computed(() => filteredCommunities.value.length)

  /** Indique si des filtres sont actifs */
  const hasActiveFilters = computed(() =>
    searchQuery.value.trim().length > 0 ||
    sourceFilter.value !== 'all'
  )

  /** Communauté actuellement développée */
  const expandedCommunity = computed(() => {
    if (!expandedId.value) return null
    // Chercher dans SRD d'abord, puis dans le homebrew
    const srdMatch = getCommunityById(expandedId.value)
    if (srdMatch) return srdMatch
    return homebrewStore.getById(expandedId.value) || null
  })

  // ── Actions ────────────────────────────────────────────

  function setSearch(query) {
    searchQuery.value = typeof query === 'string' ? query : ''
  }

  function toggleExpand(id) {
    expandedId.value = expandedId.value === id ? null : id
  }

  function collapseAll() {
    expandedId.value = null
  }

  function clearFilters() {
    searchQuery.value = ''
    sourceFilter.value = 'all'
  }

  function resetAll() {
    clearFilters()
    collapseAll()
  }

  return {
    // State
    searchQuery,
    expandedId,
    sourceFilter,
    // Getters
    filteredCommunities,
    totalCount,
    filteredCount,
    hasActiveFilters,
    expandedCommunity,
    // Actions
    setSearch,
    toggleExpand,
    collapseAll,
    clearFilters,
    resetAll
  }
})
