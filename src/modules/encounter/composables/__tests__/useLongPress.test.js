/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLongPress } from '../useLongPress'

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('déclenche le callback après le délai', () => {
    const callback = vi.fn()
    const { onPointerDown } = useLongPress(callback, { delay: 500 })

    onPointerDown({ button: 0 })
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('ne déclenche pas si relâché avant le délai', () => {
    const callback = vi.fn()
    const { onPointerDown, onPointerUp } = useLongPress(callback, { delay: 500 })

    onPointerDown({ button: 0 })
    vi.advanceTimersByTime(300)
    onPointerUp()
    vi.advanceTimersByTime(500)

    expect(callback).not.toHaveBeenCalled()
  })

  it('ne déclenche pas si le pointeur quitte l\'élément', () => {
    const callback = vi.fn()
    const { onPointerDown, onPointerLeave } = useLongPress(callback, { delay: 500 })

    onPointerDown({ button: 0 })
    vi.advanceTimersByTime(200)
    onPointerLeave()
    vi.advanceTimersByTime(500)

    expect(callback).not.toHaveBeenCalled()
  })

  it('wasFired retourne true après déclenchement', () => {
    const callback = vi.fn()
    const { onPointerDown, wasFired } = useLongPress(callback, { delay: 300 })

    expect(wasFired()).toBe(false)
    onPointerDown({ button: 0 })
    vi.advanceTimersByTime(300)
    expect(wasFired()).toBe(true)
  })

  it('wasFired retourne false si annulé', () => {
    const callback = vi.fn()
    const { onPointerDown, onPointerUp, wasFired } = useLongPress(callback, { delay: 300 })

    onPointerDown({ button: 0 })
    vi.advanceTimersByTime(100)
    onPointerUp()
    expect(wasFired()).toBe(false)
  })

  it('utilise un délai par défaut de 500ms', () => {
    const callback = vi.fn()
    const { onPointerDown } = useLongPress(callback)

    onPointerDown({ button: 0 })
    vi.advanceTimersByTime(499)
    expect(callback).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('ignore les boutons non-gauche de la souris', () => {
    const callback = vi.fn()
    const { onPointerDown } = useLongPress(callback, { delay: 100 })

    // Bouton droit (button=2)
    onPointerDown({ button: 2 })
    vi.advanceTimersByTime(200)
    expect(callback).not.toHaveBeenCalled()
  })
})
