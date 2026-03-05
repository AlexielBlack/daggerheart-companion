/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { useSwipe } from '../useSwipe'

// Fabrique un TouchEvent minimal compatible avec le composable
function makeTouch(clientX, clientY) {
  return { changedTouches: [{ clientX, clientY }] }
}

describe('useSwipe', () => {
  describe('swipe gauche', () => {
    it('déclenche onSwipeLeft si déplacement X négatif dépasse le seuil', () => {
      const onSwipeLeft  = vi.fn()
      const onSwipeRight = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft, onSwipeRight })

      onTouchStart(makeTouch(200, 100))
      onTouchEnd(makeTouch(140, 105))   // deltaX = -60, deltaY = 5

      expect(onSwipeLeft).toHaveBeenCalledOnce()
      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('ne déclenche pas si déplacement X insuffisant', () => {
      const onSwipeLeft = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft })

      onTouchStart(makeTouch(200, 100))
      onTouchEnd(makeTouch(170, 100))   // deltaX = -30 < 50

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('swipe droite', () => {
    it('déclenche onSwipeRight si déplacement X positif dépasse le seuil', () => {
      const onSwipeLeft  = vi.fn()
      const onSwipeRight = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft, onSwipeRight })

      onTouchStart(makeTouch(100, 200))
      onTouchEnd(makeTouch(165, 205))   // deltaX = +65, deltaY = 5

      expect(onSwipeRight).toHaveBeenCalledOnce()
      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('scroll vertical — pas de swipe', () => {
    it('ne déclenche pas si déplacement Y domine (scroll vertical)', () => {
      const onSwipeLeft  = vi.fn()
      const onSwipeRight = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft, onSwipeRight })

      onTouchStart(makeTouch(200, 100))
      onTouchEnd(makeTouch(140, 200))   // deltaX = -60, deltaY = 100 → scroll

      expect(onSwipeLeft).not.toHaveBeenCalled()
      expect(onSwipeRight).not.toHaveBeenCalled()
    })

    it('ne déclenche pas si X et Y sont proches (geste diagonal)', () => {
      const onSwipeLeft = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft })

      onTouchStart(makeTouch(200, 200))
      onTouchEnd(makeTouch(140, 158))   // deltaX = -60, deltaY = -42 → ratio < 1.5

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('seuil personnalisé', () => {
    it('respecte un seuil plus bas', () => {
      const onSwipeLeft = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft, threshold: 30 })

      onTouchStart(makeTouch(200, 100))
      onTouchEnd(makeTouch(165, 103))   // deltaX = -35 > 30

      expect(onSwipeLeft).toHaveBeenCalledOnce()
    })

    it('respecte un seuil plus élevé', () => {
      const onSwipeLeft = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft, threshold: 100 })

      onTouchStart(makeTouch(200, 100))
      onTouchEnd(makeTouch(140, 102))   // deltaX = -60 < 100

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('callbacks optionnels', () => {
    it('fonctionne sans onSwipeLeft (pas d\'erreur)', () => {
      const onSwipeRight = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeRight })

      expect(() => {
        onTouchStart(makeTouch(100, 100))
        onTouchEnd(makeTouch(40, 103))  // swipe gauche sans handler
      }).not.toThrow()
    })

    it('fonctionne sans onSwipeRight (pas d\'erreur)', () => {
      const onSwipeLeft = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft })

      expect(() => {
        onTouchStart(makeTouch(100, 100))
        onTouchEnd(makeTouch(160, 103)) // swipe droit sans handler
      }).not.toThrow()
    })

    it('fonctionne sans aucun callback', () => {
      const { onTouchStart, onTouchEnd } = useSwipe()

      expect(() => {
        onTouchStart(makeTouch(100, 100))
        onTouchEnd(makeTouch(40, 103))
      }).not.toThrow()
    })
  })

  describe('séquences multiples', () => {
    it('peut être réutilisé plusieurs fois de suite', () => {
      const onSwipeLeft = vi.fn()
      const { onTouchStart, onTouchEnd } = useSwipe({ onSwipeLeft })

      onTouchStart(makeTouch(200, 100))
      onTouchEnd(makeTouch(130, 105))
      onTouchStart(makeTouch(200, 100))
      onTouchEnd(makeTouch(130, 105))

      expect(onSwipeLeft).toHaveBeenCalledTimes(2)
    })
  })
})
