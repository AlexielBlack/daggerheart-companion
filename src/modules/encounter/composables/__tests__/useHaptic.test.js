/**
 * Tests pour le composable useHaptic.
 * Vérifie les patterns vibratoires, le no-op quand l'API n'est pas supportée,
 * et la conformité des méthodes exposées.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useHaptic, HAPTIC_PATTERNS } from '../useHaptic'

describe('useHaptic', () => {
  let originalVibrate

  beforeEach(() => {
    // Sauvegarder l'état original
    originalVibrate = navigator.vibrate
  })

  afterEach(() => {
    // Restaurer l'état original
    if (originalVibrate) {
      navigator.vibrate = originalVibrate
    } else {
      delete navigator.vibrate
    }
  })

  describe('quand navigator.vibrate est supporté', () => {
    let vibrateSpy

    beforeEach(() => {
      vibrateSpy = vi.fn()
      navigator.vibrate = vibrateSpy
    })

    it('tap() déclenche un micro-pulse de 10ms', () => {
      const haptic = useHaptic()
      haptic.tap()
      expect(vibrateSpy).toHaveBeenCalledWith(10)
    })

    it('swap() déclenche un pulse de 15ms', () => {
      const haptic = useHaptic()
      haptic.swap()
      expect(vibrateSpy).toHaveBeenCalledWith(15)
    })

    it('undo() déclenche un pulse de 5ms', () => {
      const haptic = useHaptic()
      haptic.undo()
      expect(vibrateSpy).toHaveBeenCalledWith(5)
    })

    it('defeat() déclenche un pattern distinctif [20, 50, 20]', () => {
      const haptic = useHaptic()
      haptic.defeat()
      expect(vibrateSpy).toHaveBeenCalledWith([20, 50, 20])
    })

    it('confirm() déclenche un pattern [15, 30, 15]', () => {
      const haptic = useHaptic()
      haptic.confirm()
      expect(vibrateSpy).toHaveBeenCalledWith([15, 30, 15])
    })

    it('warning() déclenche un pattern d\'avertissement', () => {
      const haptic = useHaptic()
      haptic.warning()
      expect(vibrateSpy).toHaveBeenCalledWith([30, 20, 30, 20, 30])
    })

    it('custom() déclenche un pattern personnalisé', () => {
      const haptic = useHaptic()
      haptic.custom([100, 50, 100])
      expect(vibrateSpy).toHaveBeenCalledWith([100, 50, 100])
    })

    it('isSupported() retourne true', () => {
      const haptic = useHaptic()
      expect(haptic.isSupported()).toBe(true)
    })
  })

  describe('quand navigator.vibrate n\'est pas supporté', () => {
    beforeEach(() => {
      // Simuler l'absence de l'API
      delete navigator.vibrate
    })

    it('tap() ne lève pas d\'erreur (no-op silencieux)', () => {
      const haptic = useHaptic()
      expect(() => haptic.tap()).not.toThrow()
    })

    it('defeat() ne lève pas d\'erreur', () => {
      const haptic = useHaptic()
      expect(() => haptic.defeat()).not.toThrow()
    })

    it('custom() ne lève pas d\'erreur', () => {
      const haptic = useHaptic()
      expect(() => haptic.custom([50, 25, 50])).not.toThrow()
    })

    it('isSupported() retourne false', () => {
      const haptic = useHaptic()
      expect(haptic.isSupported()).toBe(false)
    })
  })

  describe('HAPTIC_PATTERNS exportés', () => {
    it('contient tous les patterns nommés', () => {
      expect(HAPTIC_PATTERNS).toHaveProperty('tap')
      expect(HAPTIC_PATTERNS).toHaveProperty('swap')
      expect(HAPTIC_PATTERNS).toHaveProperty('undo')
      expect(HAPTIC_PATTERNS).toHaveProperty('defeat')
      expect(HAPTIC_PATTERNS).toHaveProperty('confirm')
      expect(HAPTIC_PATTERNS).toHaveProperty('warning')
    })

    it('les patterns simples sont des nombres positifs', () => {
      expect(HAPTIC_PATTERNS.tap).toBeGreaterThan(0)
      expect(HAPTIC_PATTERNS.swap).toBeGreaterThan(0)
      expect(HAPTIC_PATTERNS.undo).toBeGreaterThan(0)
    })

    it('les patterns composés sont des tableaux de nombres positifs', () => {
      expect(Array.isArray(HAPTIC_PATTERNS.defeat)).toBe(true)
      expect(HAPTIC_PATTERNS.defeat.every((v) => v > 0)).toBe(true)
      expect(Array.isArray(HAPTIC_PATTERNS.confirm)).toBe(true)
      expect(HAPTIC_PATTERNS.confirm.every((v) => v > 0)).toBe(true)
    })
  })

  describe('instances indépendantes', () => {
    it('chaque appel de useHaptic retourne un objet indépendant', () => {
      const h1 = useHaptic()
      const h2 = useHaptic()
      expect(h1).not.toBe(h2)
      expect(h1.tap).toBeDefined()
      expect(h2.tap).toBeDefined()
    })

    it('expose toutes les méthodes attendues', () => {
      const haptic = useHaptic()
      const methods = ['tap', 'swap', 'undo', 'defeat', 'confirm', 'warning', 'custom', 'isSupported']
      for (const method of methods) {
        expect(typeof haptic[method]).toBe('function')
      }
    })
  })
})
