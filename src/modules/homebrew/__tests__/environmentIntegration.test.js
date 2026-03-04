// @vitest-environment jsdom
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEnvironmentStore } from '../../environments/stores/environmentStore.js'
import { useEnvironmentHomebrewStore } from '../categories/environment/useEnvironmentHomebrewStore.js'

describe('Environment store — fusion SRD + homebrew', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('contient les environnements SRD par défaut', () => {
    const store = useEnvironmentStore()
    expect(store.filteredEnvironments.length).toBeGreaterThan(0)
  })

  it('fusionne les environnements homebrew avec le SRD', () => {
    const envStore = useEnvironmentStore()
    const hbStore = useEnvironmentHomebrewStore()
    hbStore.clearAll()

    const initialCount = envStore.totalCount

    hbStore.create({
      name: 'Forêt Homebrew',
      tier: 1,
      type: 'Exploration',
      description: 'Une forêt créée par le joueur pour tester la fusion.'
    })

    expect(envStore.totalCount).toBe(initialCount + 1)
  })

  it('marque les items homebrew avec source custom', () => {
    const envStore = useEnvironmentStore()
    const hbStore = useEnvironmentHomebrewStore()
    hbStore.clearAll()

    hbStore.create({
      name: 'Marché Custom',
      tier: 2,
      type: 'Social',
      description: 'Un marché unique créé par le joueur.'
    })

    const customItems = envStore.filteredEnvironments.filter((e) => e.source === 'custom')
    expect(customItems).toHaveLength(1)
    expect(customItems[0].name).toBe('Marché Custom')
  })

  it('filtre les environnements fusionnés par tier', () => {
    const envStore = useEnvironmentStore()
    const hbStore = useEnvironmentHomebrewStore()
    hbStore.clearAll()

    hbStore.create({
      name: 'Donjon T3 Custom',
      tier: 3,
      type: 'Exploration',
      description: 'Un donjon de tier 3 créé par le joueur.'
    })

    envStore.selectedTiers.push(3)
    const t3Items = envStore.filteredEnvironments
    const hasCustom = t3Items.some((e) => e.name === 'Donjon T3 Custom')
    expect(hasCustom).toBe(true)
    expect(t3Items.every((e) => e.tier === 3)).toBe(true)
  })

  it('recherche dans les environnements fusionnés', () => {
    const envStore = useEnvironmentStore()
    const hbStore = useEnvironmentHomebrewStore()
    hbStore.clearAll()

    hbStore.create({
      name: 'Volcan des Anciens',
      tier: 4,
      type: 'Traversal',
      description: 'Un volcan en éruption menant à un temple perdu.'
    })

    envStore.searchQuery = 'Volcan des Anciens'
    const results = envStore.filteredEnvironments
    expect(results.some((e) => e.name === 'Volcan des Anciens')).toBe(true)
  })

  it('trie les environnements fusionnés par nom', () => {
    const envStore = useEnvironmentStore()
    const hbStore = useEnvironmentHomebrewStore()
    hbStore.clearAll()

    hbStore.create({
      name: 'AAA Premier Env',
      tier: 1,
      type: 'Event',
      description: 'Un environnement qui devrait être premier alphabétiquement.'
    })

    envStore.sortField = 'name'
    envStore.sortDirection = 'asc'
    const first = envStore.filteredEnvironments[0]
    expect(first.name).toBe('AAA Premier Env')
  })

  it('récupère un environnement homebrew par ID', () => {
    const envStore = useEnvironmentStore()
    const hbStore = useEnvironmentHomebrewStore()
    hbStore.clearAll()

    const created = hbStore.create({
      name: 'Env Recherché',
      tier: 1,
      type: 'Social',
      description: 'Environnement pour test de recherche par ID.'
    })

    const found = envStore.getEnvironmentById(created.id)
    expect(found).not.toBeNull()
    expect(found.name).toBe('Env Recherché')
  })
})
