/**
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { environmentSchema, ENVIRONMENT_TYPES, ENVIRONMENT_TIER_BENCHMARKS } from '../schemas/environmentSchema.js'
import { equipmentSchema, EQUIPMENT_CATEGORIES, WEAPON_TRAITS, getRelevantFields } from '../schemas/equipmentSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { createHomebrewStore } from '../core/composables/useHomebrewStore.js'

describe('environmentSchema', () => {
  it('a les métadonnées correctes', () => {
    expect(environmentSchema.key).toBe('environment')
    expect(environmentSchema.label).toBe('Environnement')
    expect(environmentSchema.storageKey).toBe('homebrew-environments')
  })

  it('contient les champs obligatoires', () => {
    const keys = environmentSchema.fields.map((f) => f.key)
    expect(keys).toContain('name')
    expect(keys).toContain('tier')
    expect(keys).toContain('type')
    expect(keys).toContain('description')
    expect(keys).toContain('impulses')
    expect(keys).toContain('difficulty')
    expect(keys).toContain('features')
    expect(keys).toContain('potentialAdversaries')
  })

  it('exporte les types d\'environnement', () => {
    expect(ENVIRONMENT_TYPES).toContain('Exploration')
    expect(ENVIRONMENT_TYPES).toContain('Social')
    expect(ENVIRONMENT_TYPES).toContain('Traversal')
    expect(ENVIRONMENT_TYPES).toContain('Event')
    expect(ENVIRONMENT_TYPES).toHaveLength(4)
  })

  it('exporte les benchmarks par tier', () => {
    expect(ENVIRONMENT_TIER_BENCHMARKS[1].difficulty).toBe(11)
    expect(ENVIRONMENT_TIER_BENCHMARKS[4].difficulty).toBe(20)
  })

  it('valide un environnement complet', () => {
    const data = {
      name: 'Forêt Hantée',
      tier: 2,
      type: 'Exploration',
      description: 'Une forêt sombre et inquiétante où les arbres semblent vivants.'
    }
    const result = validateHomebrewData(data, environmentSchema)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejette un environnement sans nom', () => {
    const data = { tier: 1, type: 'Event', description: 'Description courte mais valide.' }
    const result = validateHomebrewData(data, environmentSchema)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'name')).toBe(true)
  })
})

describe('equipmentSchema', () => {
  it('a les métadonnées correctes', () => {
    expect(equipmentSchema.key).toBe('equipment')
    expect(equipmentSchema.label).toBe('Équipement')
    expect(equipmentSchema.storageKey).toBe('homebrew-equipment')
  })

  it('contient les champs essentiels', () => {
    const keys = equipmentSchema.fields.map((f) => f.key)
    expect(keys).toContain('category')
    expect(keys).toContain('name')
    expect(keys).toContain('tier')
    expect(keys).toContain('damageType')
    expect(keys).toContain('trait')
    expect(keys).toContain('range')
    expect(keys).toContain('damage')
    expect(keys).toContain('burden')
    expect(keys).toContain('thresholds')
    expect(keys).toContain('baseScore')
    expect(keys).toContain('rarity')
    expect(keys).toContain('feature')
  })

  it('exporte les catégories d\'équipement', () => {
    expect(EQUIPMENT_CATEGORIES).toHaveLength(5)
    const values = EQUIPMENT_CATEGORIES.map((c) => c.value)
    expect(values).toContain('primaryWeapon')
    expect(values).toContain('armor')
    expect(values).toContain('loot')
  })

  it('exporte les traits d\'arme', () => {
    expect(WEAPON_TRAITS).toContain('Agility')
    expect(WEAPON_TRAITS).toContain('Knowledge')
    expect(WEAPON_TRAITS).toHaveLength(6)
  })

  it('valide un équipement avec catégorie et nom', () => {
    const data = { category: 'primaryWeapon', name: 'Épée de Feu' }
    const result = validateHomebrewData(data, equipmentSchema)
    expect(result.valid).toBe(true)
  })

  it('rejette un équipement sans nom', () => {
    const data = { category: 'primaryWeapon' }
    const result = validateHomebrewData(data, equipmentSchema)
    expect(result.valid).toBe(false)
  })
})

describe('getRelevantFields', () => {
  it('retourne les champs arme pour primaryWeapon', () => {
    const fields = getRelevantFields('primaryWeapon')
    expect(fields).toContain('trait')
    expect(fields).toContain('damage')
    expect(fields).toContain('range')
    expect(fields).not.toContain('rarity')
    expect(fields).not.toContain('baseScore')
  })

  it('retourne les champs armure pour armor', () => {
    const fields = getRelevantFields('armor')
    expect(fields).toContain('thresholds')
    expect(fields).toContain('baseScore')
    expect(fields).not.toContain('trait')
    expect(fields).not.toContain('rarity')
  })

  it('retourne les champs loot pour consumable', () => {
    const fields = getRelevantFields('consumable')
    expect(fields).toContain('rarity')
    expect(fields).not.toContain('trait')
    expect(fields).not.toContain('thresholds')
  })
})

describe('Environment homebrew store CRUD', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('crée et récupère un environnement', () => {
    const store = createHomebrewStore(environmentSchema)()
    store.clearAll()
    const result = store.create({ name: 'Caverne', tier: 1, type: 'Exploration', description: 'Une caverne profonde et sombre.' })
    expect(result.success).toBe(true)
    expect(result.item.name).toBe('Caverne')
    expect(store.items).toHaveLength(1)
  })

  it('duplique un environnement', () => {
    const store = createHomebrewStore(environmentSchema)()
    store.clearAll()
    const created = store.create({ name: 'Marché', tier: 2, type: 'Social', description: 'Un marché animé et coloré.' })
    const dup = store.duplicate(created.id)
    expect(dup.item.name).toContain('(copie)')
    expect(store.items).toHaveLength(2)
  })

  it('exporte et importe des environnements', () => {
    const store = createHomebrewStore(environmentSchema)()
    store.clearAll()
    store.create({ name: 'Pont', tier: 1, type: 'Traversal', description: 'Un pont suspendu au-dessus du vide.' })
    expect(store.items).toHaveLength(1)
    const json = store.exportItems()
    store.clearAll()
    expect(store.items).toHaveLength(0)
    const result = store.importItems(json)
    expect(result.success).toBe(true)
    expect(store.items.length).toBeGreaterThanOrEqual(1)
  })
})

describe('Equipment homebrew store CRUD', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('crée et récupère un équipement', () => {
    const store = createHomebrewStore(equipmentSchema)()
    store.clearAll()
    const result = store.create({ category: 'primaryWeapon', name: 'Lame de Givre' })
    expect(result.success).toBe(true)
    expect(result.item.name).toBe('Lame de Givre')
  })

  it('filtre par catégorie d\'équipement', () => {
    const store = createHomebrewStore(equipmentSchema)()
    store.clearAll()
    store.create({ category: 'primaryWeapon', name: 'Épée' })
    store.create({ category: 'armor', name: 'Plastron' })
    store.create({ category: 'loot', name: 'Amulette' })
    store.filterCriteria = { category: ['armor'] }
    expect(store.filteredItems).toHaveLength(1)
    expect(store.filteredItems[0].name).toBe('Plastron')
  })

  it('recherche dans le nom des équipements', () => {
    const store = createHomebrewStore(equipmentSchema)()
    store.clearAll()
    store.create({ category: 'primaryWeapon', name: 'Épée de Feu' })
    store.create({ category: 'primaryWeapon', name: 'Dague Sombre' })
    store.searchQuery = 'feu'
    expect(store.filteredItems).toHaveLength(1)
    expect(store.filteredItems[0].name).toBe('Épée de Feu')
  })
})
