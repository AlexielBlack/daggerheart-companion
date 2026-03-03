import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createHomebrewStore } from '../core/composables/useHomebrewStore.js'
import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

const testSchema = {
  key: 'environment',
  label: 'Debug',
  storageKey: 'test-debug-filter',
  fields: [
    { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true, minLength: 2 },
    { key: 'tier', type: FIELD_TYPES.SELECT, label: 'Tier', options: [1, 2, 3, 4], required: true },
    { key: 'type', type: FIELD_TYPES.TEXT, label: 'Type' },
  ]
}

const useDebugStore = createHomebrewStore(testSchema)

describe('debug filter', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('filter by tier should work', () => {
    const store = useDebugStore()
    const r1 = store.create({ name: 'Alpha', tier: 1, type: 'Solo' })
    const r2 = store.create({ name: 'Bravo', tier: 2, type: 'Std' })
    const r3 = store.create({ name: 'Charlie', tier: 1, type: 'Solo' })

    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
    expect(r3.success).toBe(true)
    expect(store.items).toHaveLength(3)

    store.setFilter('tier', [1])
    expect(store.filteredItems).toHaveLength(2)
  })
})
