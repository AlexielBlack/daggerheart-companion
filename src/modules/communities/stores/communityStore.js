/**
 * @module communities/stores/communityStore
 * @description Store Pinia pour la gestion des communautés :
 * recherche, sélection, filtrage.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { COMMUNITIES, getCommunityById } from '@data/communities'

export const useCommunityStore = defineStore('communities', () => {
  // ── État ───────────────────────────────────────────────
  const searchQuery = ref('')
  const expandedId = ref(null)

  // ── Getters ────────────────────────────────────────────

  /** Liste filtrée des communautés */
  const filteredCommunities = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return [...COMMUNITIES]
    return COMMUNITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.feature.name.toLowerCase().includes(q) ||
        c.feature.description.toLowerCase().includes(q) ||
        c.adjectives.some((a) => a.toLowerCase().includes(q))
    )
  })

  /** Nombre total de communautés */
  const totalCount = computed(() => COMMUNITIES.length)

  /** Nombre de communautés filtrées */
  const filteredCount = computed(() => filteredCommunities.value.length)

  /** Indique si des filtres sont actifs */
  const hasActiveFilters = computed(() => searchQuery.value.trim().length > 0)

  /** Communauté actuellement développée */
  const expandedCommunity = computed(() => {
    if (!expandedId.value) return null
    return getCommunityById(expandedId.value)
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
  }

  function resetAll() {
    clearFilters()
    collapseAll()
  }

  return {
    // State
    searchQuery,
    expandedId,
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
