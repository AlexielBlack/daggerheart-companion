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
import { useDomainHomebrewStore } from '@modules/homebrew/categories/domain/useDomainHomebrewStore.js'

export { useDomainHomebrewStore }

export const useDomainStore = defineStore('domains', () => {
  // ── State ──────────────────────────────────────────────
  const searchQuery = ref('')
  const selectedDomainId = ref(null)
  const filterType = ref('all') // 'all' | 'spell' | 'ability' | 'grimoire'
  const filterLevel = ref(0) // 0 = all levels
  const filterSpell = ref('all') // 'all' | 'spells' | 'martial'
  const sourceFilter = ref('all') // 'all' | 'srd' | 'custom'

  // ── Homebrew ──────────────────────────────────────────
  const homebrewStore = useDomainHomebrewStore()

  /**
   * Normalise un domaine homebrew au format SRD-compatible.
   */
  function normalizeHomebrewDomain(item) {
    return {
      id: item.id,
      name: item.name,
      emoji: item.emoji || '🃏',
      color: item.color || '#7c3aed',
      description: item.description || '',
      classes: item.classes || [],
      themes: item.themes || [],
      hasSpells: item.hasSpells !== false,
      source: 'custom',
      cards: (item.cards || []).map((card, i) => ({
        id: card.id || `${item.id}-card-${i}`,
        name: card.name || `Carte ${i + 1}`,
        level: card.level || 1,
        type: card.type || 'ability',
        recallCost: card.recallCost ?? 0,
        feature: card.feature || ''
      }))
    }
  }

  // ── Getters ────────────────────────────────────────────
  const allDomains = computed(() => [
    ...DOMAINS,
    ...homebrewStore.items.map(normalizeHomebrewDomain)
  ])
  const domainCount = computed(() => allDomains.value.length)

  const totalCardCount = computed(() =>
    allDomains.value.reduce((sum, d) => sum + d.cards.length, 0)
  )

  /**
   * Résout un domaine par ID : SRD puis homebrew.
   */
  function resolveDomain(id) {
    return getDomainById(id) || allDomains.value.find((d) => d.id === id) || null
  }

  /**
   * Résout une carte par ID : SRD puis homebrew.
   */
  function resolveCard(cardId) {
    const srd = getCardById(cardId)
    if (srd) return srd
    for (const d of allDomains.value) {
      const card = d.cards.find((c) => c.id === cardId)
      if (card) return card
    }
    return null
  }

  const filteredDomains = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    return allDomains.value.filter((domain) => {
      // Filtre par source (SRD / homebrew)
      if (sourceFilter.value === 'srd' && domain.source === 'custom') return false
      if (sourceFilter.value === 'custom' && domain.source !== 'custom') return false

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
    selectedDomainId.value ? resolveDomain(selectedDomainId.value) : null
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
    sourceFilter.value = 'all'
  }

  return {
    // State
    searchQuery,
    selectedDomainId,
    filterType,
    filterLevel,
    filterSpell,
    sourceFilter,
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
    resolveDomain,
    resolveCard,
    getDomainById,
    getDomainsForClass,
    getCardById,
    getCardsByLevel,
    getCardsByType,
    CARD_TYPES
  }
})
