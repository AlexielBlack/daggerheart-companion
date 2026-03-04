import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useAdversaryBenchmarks } from '../composables/useAdversaryBenchmarks.js'

/**
 * @tests useAdversaryBenchmarks
 * @description Tests du composable de benchmarks : computed, comparaison, application.
 */
describe('useAdversaryBenchmarks', () => {
  /**
   * Helper pour créer un formData réactif + setField mock.
   */
  function createSetup(initialData = {}) {
    const formData = ref({
      type: 'Standard',
      tier: 1,
      difficulty: 11,
      thresholds: { major: 7, severe: 12 },
      hp: 5,
      stress: 3,
      attack: { name: 'Griffe', modifier: 0, damage: '1d8+2', damageType: 'phy', range: 'Melee' },
      ...initialData
    })

    const setField = vi.fn((key, value) => {
      formData.value[key] = value
    })

    return { formData, setField, ...useAdversaryBenchmarks(formData, setField) }
  }

  describe('currentBenchmark', () => {
    it('retourne les benchmarks pour Standard tier 1', () => {
      const { currentBenchmark } = createSetup()
      expect(currentBenchmark.value).not.toBeNull()
      expect(currentBenchmark.value.difficulty).toBeDefined()
    })

    it('retourne null sans type', () => {
      const { currentBenchmark } = createSetup({ type: '' })
      expect(currentBenchmark.value).toBeNull()
    })

    it('retourne null sans tier', () => {
      const { currentBenchmark } = createSetup({ tier: null })
      expect(currentBenchmark.value).toBeNull()
    })

    it('se met à jour quand le type change', () => {
      const { formData, currentBenchmark } = createSetup()
      const standardBm = currentBenchmark.value

      formData.value.type = 'Bruiser'
      const bruiserBm = currentBenchmark.value

      expect(bruiserBm).not.toEqual(standardBm)
    })
  })

  describe('typeInfo', () => {
    it('retourne les infos du type sélectionné', () => {
      const { typeInfo } = createSetup()
      expect(typeInfo.value).not.toBeNull()
      expect(typeInfo.value.description).toBeTruthy()
      expect(typeInfo.value.battlePoints).toBe(2)
    })

    it('retourne null sans type', () => {
      const { typeInfo } = createSetup({ type: '' })
      expect(typeInfo.value).toBeNull()
    })
  })

  describe('hasBenchmark', () => {
    it('est true pour un type/tier valide', () => {
      const { hasBenchmark } = createSetup()
      expect(hasBenchmark.value).toBe(true)
    })

    it('est false sans type', () => {
      const { hasBenchmark } = createSetup({ type: '' })
      expect(hasBenchmark.value).toBe(false)
    })
  })

  describe('comparison', () => {
    it('retourne null sans benchmark', () => {
      const { comparison } = createSetup({ type: '' })
      expect(comparison.value).toBeNull()
    })

    it('identifie une valeur en dessous du benchmark', () => {
      // Standard T1 difficulty default = 12, on met 10
      const { comparison } = createSetup({ difficulty: 10 })
      expect(comparison.value.difficulty).toBe('below')
    })

    it('identifie une valeur au dessus du benchmark', () => {
      // Standard T1 difficulty default = 12, on met 20
      const { comparison } = createSetup({ difficulty: 20 })
      expect(comparison.value.difficulty).toBe('above')
    })

    it('identifie une valeur correspondant au benchmark', () => {
      const { currentBenchmark } = createSetup()
      const expectedDiff = typeof currentBenchmark.value.difficulty === 'object'
        ? currentBenchmark.value.difficulty.default
        : currentBenchmark.value.difficulty
      const { formData } = createSetup({ difficulty: expectedDiff })
      const { comparison: comp2 } = useAdversaryBenchmarks(formData, vi.fn())
      expect(comp2.value.difficulty).toBe('match')
    })
  })

  describe('applyBenchmarkToForm', () => {
    it('appelle setField pour chaque champ du benchmark', () => {
      const { setField, applyBenchmarkToForm } = createSetup()
      applyBenchmarkToForm()

      expect(setField).toHaveBeenCalled()
      const calls = setField.mock.calls.map((c) => c[0])
      expect(calls).toContain('difficulty')
      expect(calls).toContain('hp')
      expect(calls).toContain('stress')
      expect(calls).toContain('attack')
    })

    it('préserve le nom d\'attaque existant', () => {
      const { setField, applyBenchmarkToForm } = createSetup({
        attack: { name: 'Morsure Venimeuse', modifier: 0, damage: '1d6', damageType: 'mag', range: 'Melee' }
      })
      applyBenchmarkToForm()

      const attackCall = setField.mock.calls.find((c) => c[0] === 'attack')
      expect(attackCall).toBeDefined()
      expect(attackCall[1].name).toBe('Morsure Venimeuse')
    })

    it('gère les Minions (thresholds null, HP = 1)', () => {
      const { setField, applyBenchmarkToForm, currentBenchmark } = createSetup({
        type: 'Minion',
        tier: 1
      })
      applyBenchmarkToForm()

      // HP devrait être 1 pour un Minion
      const hpCall = setField.mock.calls.find((c) => c[0] === 'hp')
      expect(hpCall).toBeDefined()
      expect(hpCall[1]).toBe(1)

      // Thresholds ne devrait pas être défini (null dans les benchmarks Minion)
      const thresholdCall = setField.mock.calls.find((c) => c[0] === 'thresholds')
      // Si les thresholds sont null, setField ne devrait pas être appelé pour ce champ
      if (currentBenchmark.value.thresholds === null) {
        expect(thresholdCall).toBeUndefined()
      }
    })

    it('ne fait rien sans benchmark', () => {
      const { setField, applyBenchmarkToForm } = createSetup({ type: '' })
      applyBenchmarkToForm()
      expect(setField).not.toHaveBeenCalled()
    })
  })
})
