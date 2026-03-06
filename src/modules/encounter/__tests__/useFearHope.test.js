// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { effectScope } from 'vue'
import { useFearHope } from '../composables/useFearHope'

// ── Mock localStorage ────────────────────────────────────
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// ── Suite de tests ───────────────────────────────────────

describe('useFearHope', () => {
  let scope
  let fearHope

  beforeEach(() => {
    localStorageMock.clear()
    if (scope) scope.stop()
    scope = effectScope()
    scope.run(() => {
      fearHope = useFearHope()
    })
  })

  // ── Etat initial ─────────────────────────────────────

  describe('etat initial', () => {
    it('demarre avec fear=0, hope=0', () => {
      expect(fearHope.fear.value).toBe(0)
      expect(fearHope.hope.value).toBe(0)
    })

    it('demarre avec fearSpent=0, hopeSpent=0', () => {
      expect(fearHope.fearSpent.value).toBe(0)
      expect(fearHope.hopeSpent.value).toBe(0)
    })
  })

  // ── addFear / addHope ────────────────────────────────

  describe('addFear / addHope', () => {
    it('addFear ajoute 1 par defaut', () => {
      fearHope.addFear()
      expect(fearHope.fear.value).toBe(1)
    })

    it('addFear(3) ajoute 3', () => {
      fearHope.addFear(3)
      expect(fearHope.fear.value).toBe(3)
    })

    it('addHope ajoute 1 par defaut', () => {
      fearHope.addHope()
      expect(fearHope.hope.value).toBe(1)
    })

    it('addHope(5) ajoute 5', () => {
      fearHope.addHope(5)
      expect(fearHope.hope.value).toBe(5)
    })
  })

  // ── spendFear / spendHope ────────────────────────────

  describe('spendFear / spendHope', () => {
    it('spendFear depense 1 et incremente fearSpent', () => {
      fearHope.addFear(3)
      fearHope.spendFear()
      expect(fearHope.fear.value).toBe(2)
      expect(fearHope.fearSpent.value).toBe(1)
    })

    it('spendFear ne descend pas sous 0', () => {
      fearHope.spendFear()
      expect(fearHope.fear.value).toBe(0)
      expect(fearHope.fearSpent.value).toBe(0)
    })

    it('spendHope depense 1 et incremente hopeSpent', () => {
      fearHope.addHope(3)
      fearHope.spendHope()
      expect(fearHope.hope.value).toBe(2)
      expect(fearHope.hopeSpent.value).toBe(1)
    })

    it('spendHope ne descend pas sous 0', () => {
      fearHope.spendHope()
      expect(fearHope.hope.value).toBe(0)
      expect(fearHope.hopeSpent.value).toBe(0)
    })
  })

  // ── applyRollResult ──────────────────────────────────

  describe('applyRollResult', () => {
    it('applyRollResult criticalSuccess ajoute 2 hope', () => {
      fearHope.applyRollResult('criticalSuccess')
      expect(fearHope.hope.value).toBe(2)
      expect(fearHope.fear.value).toBe(0)
    })

    it('applyRollResult successFear ajoute 1 fear', () => {
      fearHope.applyRollResult('successFear')
      expect(fearHope.fear.value).toBe(1)
      expect(fearHope.hope.value).toBe(0)
    })

    it('applyRollResult failureHope n ajoute rien', () => {
      fearHope.applyRollResult('failureHope')
      expect(fearHope.hope.value).toBe(0)
      expect(fearHope.fear.value).toBe(0)
    })

    it('applyRollResult invalide ne fait rien', () => {
      fearHope.applyRollResult('invalid')
      expect(fearHope.hope.value).toBe(0)
      expect(fearHope.fear.value).toBe(0)
    })
  })

  // ── reset ────────────────────────────────────────────

  describe('reset', () => {
    it('reset remet tout a zero', () => {
      fearHope.addFear(5)
      fearHope.addHope(3)
      fearHope.spendFear(2)
      fearHope.spendHope(1)

      // Verifie que les valeurs sont non-nulles avant reset
      expect(fearHope.fear.value).toBe(3)
      expect(fearHope.hope.value).toBe(2)
      expect(fearHope.fearSpent.value).toBe(2)
      expect(fearHope.hopeSpent.value).toBe(1)

      fearHope.reset()

      expect(fearHope.fear.value).toBe(0)
      expect(fearHope.hope.value).toBe(0)
      expect(fearHope.fearSpent.value).toBe(0)
      expect(fearHope.hopeSpent.value).toBe(0)
    })
  })
})
