/**
 * @module domains/stores/domainStore
 * @description Store Pinia pour les domaines — filtrage, recherche, sélection.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  DOMAINS,
  CARD_TYPES,
  getDomainById,
  getDomainsForClass,
  getCardById,
  getCardsByLevel,
  getCardsByType
} from '@/data/domains/index.js'

export const useDomainStore = defineStore('domains', () => {
  // ── State ──────────────────────────────────────────────
  const searchQuery = ref('')
  const selectedDomainId = ref(null)
  const filterType = ref('all') // 'all' | 'spell' | 'ability' | 'grimoire'
  const filterLevel = ref(0) // 0 = all levels
  const filterSpell = ref('all') // 'all' | 'spells' | 'martial'

  // ── Getters ────────────────────────────────────────────
  const allDomains = computed(() => DOMAINS)
  const domainCount = computed(() => DOMAINS.length)

  const totalCardCount = computed(() =>
    DOMAINS.reduce((sum, d) => sum + d.cards.length, 0)
  )

  const filteredDomains = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    return DOMAINS.filter((domain) => {
      const matchSpell =
        filterSpell.value === 'all' ||
        (filterSpell.value === 'spells' && domain.hasSpells) ||
        (filterSpell.value === 'martial' && !domain.hasSpells)

      if (!q) return matchSpell

      const matchSearch =
        domain.name.toLowerCase().includes(q) ||
        domain.classes.some((c) => c.toLowerCase().includes(q)) ||
        domain.themes.some((t) => t.toLowerCase().includes(q)) ||
        domain.description.toLowerCase().includes(q) ||
        domain.cards.some(
          (card) =>
            card.name.toLowerCase().includes(q) ||
            card.feature.toLowerCase().includes(q)
        )
      return matchSpell && matchSearch
    })
  })

  const selectedDomain = computed(() =>
    selectedDomainId.value ? getDomainById(selectedDomainId.value) : null
  )

  const selectedDomainCards = computed(() => {
    if (!selectedDomain.value) return []
    let cards = [...selectedDomain.value.cards]

    if (filterType.value !== 'all') {
      cards = cards.filter((c) => c.type === filterType.value)
    }
    if (filterLevel.value > 0) {
      cards = cards.filter((c) => c.level === filterLevel.value)
    }
    return cards
  })

  const availableLevels = computed(() => {
    if (!selectedDomain.value) return []
    const levels = new Set(selectedDomain.value.cards.map((c) => c.level))
    return [...levels].sort((a, b) => a - b)
  })

  const availableTypes = computed(() => {
    if (!selectedDomain.value) return []
    const types = new Set(selectedDomain.value.cards.map((c) => c.type))
    return [...types].sort()
  })

  // ── Actions ────────────────────────────────────────────
  function setSearch(query) {
    searchQuery.value = query
  }

  function selectDomain(id) {
    selectedDomainId.value = selectedDomainId.value === id ? null : id
    filterType.value = 'all'
    filterLevel.value = 0
  }

  function setFilterType(type) {
    filterType.value = type
  }

  function setFilterLevel(level) {
    filterLevel.value = level
  }

  function setFilterSpell(value) {
    filterSpell.value = value
  }

  function resetFilters() {
    searchQuery.value = ''
    selectedDomainId.value = null
    filterType.value = 'all'
    filterLevel.value = 0
    filterSpell.value = 'all'
  }

  return {
    // State
    searchQuery,
    selectedDomainId,
    filterType,
    filterLevel,
    filterSpell,
    // Getters
    allDomains,
    domainCount,
    totalCardCount,
    filteredDomains,
    selectedDomain,
    selectedDomainCards,
    availableLevels,
    availableTypes,
    // Actions
    setSearch,
    selectDomain,
    setFilterType,
    setFilterLevel,
    setFilterSpell,
    resetFilters,
    // Re-export utilities
    getDomainById,
    getDomainsForClass,
    getCardById,
    getCardsByLevel,
    getCardsByType,
    CARD_TYPES
  }
})
