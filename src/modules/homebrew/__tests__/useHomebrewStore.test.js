// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createHomebrewStore } from '../core/composables/useHomebrewStore.js'
import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

/** Schema minimal pour les tests du store */
const testSchema = {
  key: 'adversary',
  label: 'Adversaire',
  storageKey: 'test-homebrew-adv',
  fields: [
    { key: 'name', type: FIELD_TYPES.TEXT, label: 'Nom', required: true, minLength: 2 },
    { key: 'tier', type: FIELD_TYPES.SELECT, label: 'Tier', options: [1, 2, 3, 4], required: true },
    { key: 'difficulty', type: FIELD_TYPES.NUMBER, label: 'Diff', required: true, min: 1, max: 30, integer: true },
    { key: 'hp', type: FIELD_TYPES.NUMBER, label: 'HP', required: true, min: 1 },
    { key: 'stress', type: FIELD_TYPES.NUMBER, label: 'Stress', required: true, min: 0 },
    { key: 'type', type: FIELD_TYPES.TEXT, label: 'Type' },
    { key: 'description', type: FIELD_TYPES.TEXTAREA, label: 'Description' },
    { key: 'features', type: FIELD_TYPES.FEATURES, label: 'Features' }
  ]
}

/** Donnees valides minimales */
const validData = {
  name: 'Test Adversary',
  tier: 1,
  difficulty: 12,
  hp: 5,
  stress: 3,
  type: 'Standard',
  description: 'A test adversary.',
  features: []
}

/** Le store factory est cree une seule fois (Pinia cache par store ID) */
const useTestStore = createHomebrewStore(testSchema)

describe('createHomebrewStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('lance une erreur si le schema est invalide', () => {
    expect(() => createHomebrewStore({})).toThrow()
    expect(() => createHomebrewStore({ key: 'test' })).toThrow()
  })

  describe('etat initial', () => {
    it('demarre avec une liste vide', () => {
      const store = useTestStore()
      expect(store.items).toEqual([])
      expect(store.count).toBe(0)
    })

    it('expose les metadonnees du schema', () => {
      const store = useTestStore()
      expect(store.schemaKey).toBe('adversary')
      expect(store.schemaLabel).toBe('Adversaire')
    })
  })

  describe('create', () => {
    it('cree un item avec succes', () => {
      const store = useTestStore()
      const result = store.create(validData)

      expect(result.success).toBe(true)
      expect(result.id).toBeTruthy()
      expect(result.item.name).toBe('Test Adversary')
      expect(result.item.source).toBe('custom')
      expect(result.item.createdAt).toBeTruthy()
      expect(result.item.updatedAt).toBeTruthy()
      expect(store.count).toBe(1)
    })

    it('rejette des donnees invalides', () => {
      const store = useTestStore()
      const result = store.create({ name: '' })

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(store.count).toBe(0)
    })

    it('genere des IDs uniques pour chaque creation', () => {
      const store = useTestStore()
      const r1 = store.create({ ...validData, name: 'Adversary 1' })
      const r2 = store.create({ ...validData, name: 'Adversary 2' })

      expect(r1.id).not.toBe(r2.id)
      expect(store.count).toBe(2)
    })
  })

  describe('update', () => {
    it('met a jour un item existant', () => {
      const store = useTestStore()
      const { id } = store.create(validData)
      const result = store.update(id, { ...validData, name: 'Updated Name' })

      expect(result.success).toBe(true)
      expect(result.item.name).toBe('Updated Name')
      expect(result.item.id).toBe(id)
      expect(store.count).toBe(1)
    })

    it('preserve createdAt et met a jour updatedAt', () => {
      const store = useTestStore()
      const { item: original } = store.create(validData)
      const { item: updated } = store.update(original.id, { ...validData, name: 'Updated' })

      expect(updated.createdAt).toBe(original.createdAt)
    })

    it('rejette une mise a jour avec ID inexistant', () => {
      const store = useTestStore()
      const result = store.update('nonexistent', validData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('introuvable')
    })

    it('rejette des donnees invalides', () => {
      const store = useTestStore()
      const { id } = store.create(validData)
      const result = store.update(id, { name: '' })

      expect(result.success).toBe(false)
    })
  })

  describe('remove', () => {
    it('supprime un item existant', () => {
      const store = useTestStore()
      const { id } = store.create(validData)
      expect(store.count).toBe(1)

      const result = store.remove(id)
      expect(result.success).toBe(true)
      expect(store.count).toBe(0)
    })

    it('rejette une suppression avec ID inexistant', () => {
      const store = useTestStore()
      const result = store.remove('nonexistent')
      expect(result.success).toBe(false)
    })
  })

  describe('duplicate', () => {
    it('duplique un item avec un nouvel ID et un nom (copie)', () => {
      const store = useTestStore()
      const { id } = store.create(validData)
      const result = store.duplicate(id)

      expect(result.success).toBe(true)
      expect(result.id).not.toBe(id)
      expect(result.item.name).toContain('(copie)')
      expect(store.count).toBe(2)
    })

    it('rejette la duplication avec ID inexistant', () => {
      const store = useTestStore()
      const result = store.duplicate('nonexistent')
      expect(result.success).toBe(false)
    })
  })

  describe('getById', () => {
    it('retourne un item par ID', () => {
      const store = useTestStore()
      const { id } = store.create(validData)
      const item = store.getById(id)

      expect(item).not.toBeNull()
      expect(item.name).toBe('Test Adversary')
    })

    it('retourne null si non trouve', () => {
      const store = useTestStore()
      expect(store.getById('nonexistent')).toBeNull()
    })

    it('retourne une copie independante', () => {
      const store = useTestStore()
      const { id } = store.create(validData)
      const item = store.getById(id)
      item.name = 'Modified'

      const itemAgain = store.getById(id)
      expect(itemAgain.name).toBe('Test Adversary')
    })
  })

  describe('filtrage et tri', () => {
    it('filtre par recherche textuelle', () => {
      const store = useTestStore()
      store.create({ ...validData, name: 'Dragon Rouge' })
      store.create({ ...validData, name: 'Gobelin Archer' })
      store.create({ ...validData, name: 'Dragon Bleu' })

      store.setSearch('dragon')
      expect(store.filteredItems).toHaveLength(2)
    })

    it('filtre par critere dynamique (array)', () => {
      const store = useTestStore()
      const r1 = store.create({ ...validData, name: 'Alpha', tier: 1 })
      const r2 = store.create({ ...validData, name: 'Bravo', tier: 2 })
      const r3 = store.create({ ...validData, name: 'Charlie', tier: 1 })

      expect(r1.success).toBe(true)
      expect(r2.success).toBe(true)
      expect(r3.success).toBe(true)

      store.setFilter('tier', [1])
      expect(store.filteredItems).toHaveLength(2)
    })

    it('filtre par critere dynamique (valeur unique)', () => {
      const store = useTestStore()
      const r1 = store.create({ ...validData, name: 'Alpha', type: 'Solo' })
      const r2 = store.create({ ...validData, name: 'Bravo', type: 'Standard' })
      const r3 = store.create({ ...validData, name: 'Charlie', type: 'Solo' })

      expect(r1.success).toBe(true)
      expect(r2.success).toBe(true)
      expect(r3.success).toBe(true)

      store.setFilter('type', 'Solo')
      expect(store.filteredItems).toHaveLength(2)
    })

    it('trie par nom (asc)', () => {
      const store = useTestStore()
      store.create({ ...validData, name: 'Charlie' })
      store.create({ ...validData, name: 'Alice' })
      store.create({ ...validData, name: 'Bob' })

      store.setSort('name', 'asc')
      const names = store.filteredItems.map((i) => i.name)
      expect(names).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('clearFilters reinitialise tout', () => {
      const store = useTestStore()
      store.create({ ...validData, name: 'Test' })
      store.setSearch('xyz')
      expect(store.filteredItems).toHaveLength(0)

      store.clearFilters()
      expect(store.filteredItems).toHaveLength(1)
    })
  })

  describe('import / export', () => {
    it('exporte et reimporte correctement', () => {
      const store = useTestStore()
      store.create({ ...validData, name: 'Exportable' })
      const json = store.exportItems()

      store.clearAll()
      expect(store.count).toBe(0)

      const result = store.importItems(json)
      expect(result.success).toBe(true)
      expect(result.imported).toBe(1)
      expect(store.count).toBe(1)
    })

    it('ignore les doublons a import', () => {
      const store = useTestStore()
      store.create({ ...validData, name: 'Existing' })
      const json = store.exportItems()

      const result = store.importItems(json)
      expect(result.imported).toBe(0)
      expect(result.skipped).toBe(1)
      expect(store.count).toBe(1)
    })

    it('rejette un JSON invalide', () => {
      const store = useTestStore()
      const result = store.importItems('not json')
      expect(result.success).toBe(false)
    })

    it('rejette un JSON sans tableau items', () => {
      const store = useTestStore()
      const result = store.importItems('{"items": "not-array"}')
      expect(result.success).toBe(false)
    })
  })

  describe('clearAll', () => {
    it('supprime tous les items', () => {
      const store = useTestStore()
      const r1 = store.create({ ...validData, name: 'Alpha' })
      const r2 = store.create({ ...validData, name: 'Bravo' })
      expect(r1.success).toBe(true)
      expect(r2.success).toBe(true)
      expect(store.items).toHaveLength(2)

      store.clearAll()
      expect(store.count).toBe(0)
      expect(store.items).toHaveLength(0)
    })
  })
})
