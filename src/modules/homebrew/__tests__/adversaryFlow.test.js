// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { adversarySchema, ADVERSARY_TIER_BENCHMARKS } from '../schemas/adversarySchema.js'
import { useAdversaryHomebrewStore } from '../categories/adversary/useAdversaryHomebrewStore.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'

/**
 * @tests Flux adversaire homebrew
 * @description Tests du flux complet : formulaire → benchmarks → validation → store CRUD.
 */
describe('Flux adversaire homebrew', () => {
  beforeEach(() => {
    // Clear localStorage to prevent store persistence between tests
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    setActivePinia(createPinia())
  })

  describe('useFormSchema avec adversarySchema', () => {
    it('initialise le formulaire avec les valeurs par defaut du schema', () => {
      const { formData } = useFormSchema(adversarySchema)
      expect(formData.value.name).toBe('')
      expect(formData.value.tier).toBe(1)
      expect(formData.value.type).toBe('Standard')
      expect(formData.value.difficulty).toBe(11)
      expect(formData.value.hp).toBe(5)
      expect(formData.value.stress).toBe(3)
      expect(formData.value.thresholds).toEqual({ major: 7, severe: 12 })
      expect(formData.value.attack.modifier).toBe(1)
      expect(formData.value.attack.range).toBe('Melee')
      expect(formData.value.attack.damageType).toBe('phy')
      expect(formData.value.features).toEqual([])
      expect(formData.value.experiences).toEqual([])
      expect(formData.value.motives).toEqual([])
    })

    it('setField met a jour une valeur simple', () => {
      const { formData, setField, isDirty } = useFormSchema(adversarySchema)
      expect(isDirty.value).toBe(false)

      setField('name', 'Dragon de feu')
      expect(formData.value.name).toBe('Dragon de feu')
      expect(isDirty.value).toBe(true)
    })

    it('setField met a jour un champ groupe (thresholds)', () => {
      const { formData, setField } = useFormSchema(adversarySchema)
      setField('thresholds', { major: 15, severe: 25 })
      expect(formData.value.thresholds).toEqual({ major: 15, severe: 25 })
    })

    it('hydrate charge des donnees existantes', () => {
      const { formData, hydrate, isEditMode, isDirty } = useFormSchema(adversarySchema)
      hydrate({
        name: 'Boss Final',
        tier: 4,
        type: 'Solo',
        difficulty: 20,
        thresholds: { major: 25, severe: 45 },
        hp: 9,
        stress: 5,
        attack: { modifier: 4, name: 'Épée', range: 'Melee', damage: '4d10+12', damageType: 'phy' },
        features: [{ type: 'action', name: 'Coup fatal', description: 'Très puissant.' }]
      })
      expect(isEditMode.value).toBe(true)
      expect(isDirty.value).toBe(false)
      expect(formData.value.name).toBe('Boss Final')
      expect(formData.value.tier).toBe(4)
      expect(formData.value.features).toHaveLength(1)
    })

    it('reset restaure les valeurs par defaut', () => {
      const { formData, setField, reset, isDirty } = useFormSchema(adversarySchema)
      setField('name', 'Quelque chose')
      setField('tier', 3)
      expect(isDirty.value).toBe(true)

      reset()
      expect(formData.value.name).toBe('')
      expect(formData.value.tier).toBe(1)
      expect(isDirty.value).toBe(false)
    })
  })

  describe('benchmarks par tier', () => {
    it.each([1, 2, 3, 4])('tier %i a des benchmarks definis', (tier) => {
      const benchmarks = ADVERSARY_TIER_BENCHMARKS[tier]
      expect(benchmarks).toBeDefined()
      expect(benchmarks.difficulty).toBeGreaterThan(0)
      expect(benchmarks.thresholds.major).toBeGreaterThan(0)
      expect(benchmarks.thresholds.severe).toBeGreaterThan(benchmarks.thresholds.major)
      expect(benchmarks.hp).toBeGreaterThan(0)
      expect(benchmarks.attack.modifier).toBeGreaterThan(0)
    })

    it('simule l application des benchmarks tier 3 au formulaire', () => {
      const { formData, setField } = useFormSchema(adversarySchema)

      // Simuler le callback applyTierDefaults
      const benchmarks = ADVERSARY_TIER_BENCHMARKS[3]
      setField('tier', 3)
      setField('difficulty', benchmarks.difficulty)
      setField('thresholds', { ...benchmarks.thresholds })
      setField('hp', benchmarks.hp)
      setField('stress', benchmarks.stress)
      setField('attack', {
        ...formData.value.attack,
        modifier: benchmarks.attack.modifier,
        damage: benchmarks.attack.damage,
        damageType: benchmarks.attack.damageType
      })

      expect(formData.value.tier).toBe(3)
      expect(formData.value.difficulty).toBe(17)
      expect(formData.value.thresholds).toEqual({ major: 20, severe: 32 })
      expect(formData.value.hp).toBe(7)
      expect(formData.value.stress).toBe(4)
      expect(formData.value.attack.modifier).toBe(3)
      expect(formData.value.attack.damage).toBe('3d8+4')
    })
  })

  describe('validation adversaire', () => {
    it('valide un adversaire complet', () => {
      const { formData, setField } = useFormSchema(adversarySchema)
      setField('name', 'Dragon Test')
      setField('attack', {
        modifier: 1,
        name: 'Griffe',
        range: 'Melee',
        damage: '1d8+2',
        damageType: 'phy'
      })

      const result = validateHomebrewData(formData.value, adversarySchema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('refuse un adversaire sans nom', () => {
      const { formData } = useFormSchema(adversarySchema)
      // formData a déjà les defaults mais name est vide
      const result = validateHomebrewData(formData.value, adversarySchema)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'name')).toBe(true)
    })

    it('refuse un adversaire sans nom d attaque', () => {
      const { formData, setField } = useFormSchema(adversarySchema)
      setField('name', 'Valide')
      // attack.name est vide par défaut
      const result = validateHomebrewData(formData.value, adversarySchema)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field.includes('attack.name'))).toBe(true)
    })
  })

  describe('cycle CRUD complet', () => {
    it('cree, lit, met a jour et supprime un adversaire', () => {
      const store = useAdversaryHomebrewStore()
      expect(store.items).toHaveLength(0)

      const advData = {
        name: 'Test CRUD',
        tier: 2,
        type: 'Standard',
        difficulty: 14,
        thresholds: { major: 10, severe: 20 },
        hp: 5,
        stress: 3,
        attack: { modifier: 2, name: 'Épée', range: 'Melee', damage: '2d8+3', damageType: 'phy' }
      }

      // CREATE
      const created = store.create(advData)
      expect(created).not.toBeNull()
      expect(created.id).toBeTruthy()
      expect(store.items).toHaveLength(1)

      // READ
      const found = store.getById(created.id)
      expect(found.name).toBe('Test CRUD')

      // UPDATE — must pass full valid data
      const updateResult = store.update(created.id, {
        ...advData,
        name: 'Test CRUD Modifié'
      })
      expect(updateResult.success).toBe(true)
      expect(updateResult.item.name).toBe('Test CRUD Modifié')
      expect(store.items).toHaveLength(1)

      // DUPLICATE
      const dupResult = store.duplicate(created.id)
      expect(dupResult.success).toBe(true)
      expect(dupResult.item.id).not.toBe(created.id)
      expect(dupResult.item.name).toContain('Test CRUD Modifié')
      expect(store.items).toHaveLength(2)

      // DELETE
      store.remove(created.id)
      expect(store.items).toHaveLength(1)
      expect(store.getById(created.id)).toBeNull()
    })
  })

  describe('import / export', () => {
    it('exporte puis reimporte les adversaires', () => {
      const store = useAdversaryHomebrewStore()

      store.create({
        name: 'Export Test A',
        tier: 1,
        type: 'Minion',
        difficulty: 11,
        thresholds: { major: 7, severe: 12 },
        hp: 3,
        stress: 1,
        attack: { modifier: 1, name: 'Dague', range: 'Melee', damage: '1d6+2', damageType: 'phy' }
      })
      store.create({
        name: 'Export Test B',
        tier: 2,
        type: 'Leader',
        difficulty: 14,
        thresholds: { major: 10, severe: 20 },
        hp: 5,
        stress: 3,
        attack: { modifier: 2, name: 'Bâton', range: 'Close', damage: '2d6+3', damageType: 'mag' }
      })

      const json = store.exportItems()
      expect(json).toContain('Export Test A')
      expect(json).toContain('Export Test B')

      // Nouveau store vide
      store.clearAll()
      expect(store.items).toHaveLength(0)

      // Réimport
      const result = store.importItems(json)
      expect(result.success).toBe(true)
      expect(result.imported).toBe(2)
      expect(store.items).toHaveLength(2)
    })

    it('ignore les doublons a l import', () => {
      const store = useAdversaryHomebrewStore()

      store.create({
        name: 'Doublon',
        tier: 1,
        type: 'Standard',
        difficulty: 11,
        thresholds: { major: 7, severe: 12 },
        hp: 5,
        stress: 3,
        attack: { modifier: 1, name: 'Coup', range: 'Melee', damage: '1d8+2', damageType: 'phy' }
      })

      const json = store.exportItems()
      // L'item existe déjà → doit être ignoré
      const result = store.importItems(json)
      expect(result.imported).toBe(0)
      expect(result.skipped).toBe(1)
      expect(store.items).toHaveLength(1)
    })
  })
})
