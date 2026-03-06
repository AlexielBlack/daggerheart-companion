import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { effectScope } from 'vue'
import { useSessionTimer } from '../composables/useSessionTimer'

// Mock localStorage
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

// ── Helpers ──────────────────────────────────────────

/**
 * Cree un timer dans un effectScope pour eviter les erreurs onScopeDispose.
 * Retourne { timer, scope } — appeler scope.stop() pour nettoyer.
 */
function createTimer() {
  const scope = effectScope()
  let timer
  scope.run(() => { timer = useSessionTimer() })
  return { timer, scope }
}

// ── Tests ────────────────────────────────────────────

describe('useSessionTimer', () => {
  let scope
  let timer

  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.spyOn(Date, 'now').mockReturnValue(1000000)
  })

  afterEach(() => {
    if (scope) {
      scope.stop()
      scope = null
      timer = null
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ── Etat initial ───────────────────────────────────

  describe('etat initial', () => {
    it('elapsed vaut 0 au demarrage', () => {
      ({ timer, scope } = createTimer())
      expect(timer.elapsed.value).toBe(0)
    })

    it('isRunning est false au demarrage', () => {
      ({ timer, scope } = createTimer())
      expect(timer.isRunning.value).toBe(false)
    })

    it('isPaused est false au demarrage', () => {
      ({ timer, scope } = createTimer())
      expect(timer.isPaused.value).toBe(false)
    })

    it('currentRound vaut 1 au demarrage', () => {
      ({ timer, scope } = createTimer())
      expect(timer.currentRound.value).toBe(1)
    })

    it('formattedTime affiche 00:00 au demarrage', () => {
      ({ timer, scope } = createTimer())
      expect(timer.formattedTime.value).toBe('00:00')
    })
  })

  // ── start ──────────────────────────────────────────

  describe('start', () => {
    it('met isRunning a true', () => {
      ({ timer, scope } = createTimer())
      timer.start()
      expect(timer.isRunning.value).toBe(true)
    })

    it('met isPaused a false apres demarrage', () => {
      ({ timer, scope } = createTimer())
      timer.start()
      expect(timer.isPaused.value).toBe(false)
    })

    it('calcule elapsed apres avancement du temps', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      // Avancer Date.now de 5 secondes
      Date.now.mockReturnValue(1000000 + 5000)
      vi.advanceTimersByTime(1000)

      expect(timer.elapsed.value).toBe(5000)
    })
  })

  // ── pause ──────────────────────────────────────────

  describe('pause', () => {
    it('met isRunning a false et isPaused a true', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      // Avancer de 3 secondes puis pauser
      Date.now.mockReturnValue(1000000 + 3000)
      timer.pause()

      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(true)
    })

    it('accumule le temps ecoule lors de la pause', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      Date.now.mockReturnValue(1000000 + 10000)
      timer.pause()

      expect(timer.elapsed.value).toBe(10000)
    })

    it('ne fait rien si le timer n est pas en cours', () => {
      ({ timer, scope } = createTimer())
      // Pas de start() — pause() ne devrait rien changer
      timer.pause()
      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.elapsed.value).toBe(0)
    })
  })

  // ── reset ──────────────────────────────────────────

  describe('reset', () => {
    it('remet elapsed a 0', () => {
      ({ timer, scope } = createTimer())
      timer.start()
      Date.now.mockReturnValue(1000000 + 5000)
      timer.pause()

      timer.reset()

      expect(timer.elapsed.value).toBe(0)
    })

    it('remet isRunning a false', () => {
      ({ timer, scope } = createTimer())
      timer.start()
      timer.reset()
      expect(timer.isRunning.value).toBe(false)
    })

    it('remet isPaused a false', () => {
      ({ timer, scope } = createTimer())
      timer.start()
      Date.now.mockReturnValue(1000000 + 5000)
      timer.pause()
      timer.reset()
      expect(timer.isPaused.value).toBe(false)
    })

    it('remet currentRound a 1', () => {
      ({ timer, scope } = createTimer())
      timer.advanceRound()
      timer.advanceRound()
      timer.reset()
      expect(timer.currentRound.value).toBe(1)
    })

    it('remet formattedTime a 00:00', () => {
      ({ timer, scope } = createTimer())
      timer.start()
      Date.now.mockReturnValue(1000000 + 90000)
      vi.advanceTimersByTime(1000)
      timer.reset()
      expect(timer.formattedTime.value).toBe('00:00')
    })
  })

  // ── formattedTime ──────────────────────────────────

  describe('formattedTime', () => {
    it('affiche MM:SS pour moins d une heure (5min 30s = 05:30)', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      // 5 minutes 30 secondes = 330 000 ms
      Date.now.mockReturnValue(1000000 + 330000)
      vi.advanceTimersByTime(1000)

      expect(timer.formattedTime.value).toBe('05:30')
    })

    it('affiche HH:MM:SS pour 1 heure ou plus (1h 5min 30s = 01:05:30)', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      // 1h 5min 30s = 3930 000 ms
      Date.now.mockReturnValue(1000000 + 3930000)
      vi.advanceTimersByTime(1000)

      expect(timer.formattedTime.value).toBe('01:05:30')
    })

    it('affiche 00:00 pour zero secondes', () => {
      ({ timer, scope } = createTimer())
      expect(timer.formattedTime.value).toBe('00:00')
    })

    it('affiche 59:59 juste avant une heure', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      // 59 min 59 s = 3599 000 ms
      Date.now.mockReturnValue(1000000 + 3599000)
      vi.advanceTimersByTime(1000)

      expect(timer.formattedTime.value).toBe('59:59')
    })

    it('bascule en HH:MM:SS a exactement une heure', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      // Exactement 1h = 3600 000 ms
      Date.now.mockReturnValue(1000000 + 3600000)
      vi.advanceTimersByTime(1000)

      expect(timer.formattedTime.value).toBe('01:00:00')
    })
  })

  // ── Gestion des rounds ─────────────────────────────

  describe('advanceRound', () => {
    it('incremente le round de 1 a 2', () => {
      ({ timer, scope } = createTimer())
      timer.advanceRound()
      expect(timer.currentRound.value).toBe(2)
    })

    it('incremente successivement (1 → 2 → 3)', () => {
      ({ timer, scope } = createTimer())
      timer.advanceRound()
      timer.advanceRound()
      expect(timer.currentRound.value).toBe(3)
    })
  })

  describe('decrementRound', () => {
    it('decremente le round (3 → 2)', () => {
      ({ timer, scope } = createTimer())
      timer.advanceRound()
      timer.advanceRound()
      expect(timer.currentRound.value).toBe(3)

      timer.decrementRound()
      expect(timer.currentRound.value).toBe(2)
    })

    it('ne descend pas en dessous de 1', () => {
      ({ timer, scope } = createTimer())
      expect(timer.currentRound.value).toBe(1)

      timer.decrementRound()
      expect(timer.currentRound.value).toBe(1)
    })

    it('ne descend pas en dessous de 1 apres plusieurs appels', () => {
      ({ timer, scope } = createTimer())
      timer.decrementRound()
      timer.decrementRound()
      timer.decrementRound()
      expect(timer.currentRound.value).toBe(1)
    })
  })

  describe('resetRounds', () => {
    it('remet le round a 1 depuis un round eleve', () => {
      ({ timer, scope } = createTimer())
      timer.advanceRound()
      timer.advanceRound()
      timer.advanceRound()
      expect(timer.currentRound.value).toBe(4)

      timer.resetRounds()
      expect(timer.currentRound.value).toBe(1)
    })

    it('ne change rien si deja a 1', () => {
      ({ timer, scope } = createTimer())
      timer.resetRounds()
      expect(timer.currentRound.value).toBe(1)
    })
  })

  // ── Cycles start/pause multiples ───────────────────

  describe('cycles start/pause multiples', () => {
    it('accumule correctement le temps sur plusieurs cycles', () => {
      ({ timer, scope } = createTimer())

      // Cycle 1 : start a t=0, pause a t=10s
      Date.now.mockReturnValue(1000000)
      timer.start()
      Date.now.mockReturnValue(1000000 + 10000)
      timer.pause()
      expect(timer.elapsed.value).toBe(10000)

      // Cycle 2 : start a t=20s, pause a t=25s
      Date.now.mockReturnValue(1000000 + 20000)
      timer.start()
      Date.now.mockReturnValue(1000000 + 25000)
      timer.pause()
      expect(timer.elapsed.value).toBe(15000) // 10s + 5s

      // Cycle 3 : start a t=30s, pause a t=40s
      Date.now.mockReturnValue(1000000 + 30000)
      timer.start()
      Date.now.mockReturnValue(1000000 + 40000)
      timer.pause()
      expect(timer.elapsed.value).toBe(25000) // 10s + 5s + 10s
    })

    it('formattedTime reflete le temps accumule apres plusieurs cycles', () => {
      ({ timer, scope } = createTimer())

      // Cycle 1 : 2 minutes
      Date.now.mockReturnValue(1000000)
      timer.start()
      Date.now.mockReturnValue(1000000 + 120000)
      timer.pause()

      // Cycle 2 : 30 secondes
      Date.now.mockReturnValue(1000000 + 200000)
      timer.start()
      Date.now.mockReturnValue(1000000 + 230000)
      timer.pause()

      // Total : 2min 30s
      expect(timer.formattedTime.value).toBe('02:30')
    })
  })

  // ── Restauration depuis localStorage ───────────────

  describe('restauration', () => {
    it('restaure le ticking si isRunning etait true au chargement', () => {
      // Pre-remplir localStorage avec un etat en cours
      const savedState = {
        startedAt: 900000,
        pausedAt: null,
        accumulatedMs: 5000,
        currentRound: 3,
        isRunning: true
      }
      localStorageMock.setItem('dh-session-timer', JSON.stringify(savedState))

      // Date.now retourne 1000000 => elapsed = 5000 + (1000000 - 900000) = 105000
      Date.now.mockReturnValue(1000000);

      ({ timer, scope } = createTimer())

      expect(timer.isRunning.value).toBe(true)
      expect(timer.currentRound.value).toBe(3)
      expect(timer.elapsed.value).toBe(105000)
    })

    it('restaure le temps accumule sans ticker si en pause', () => {
      const savedState = {
        startedAt: null,
        pausedAt: 950000,
        accumulatedMs: 30000,
        currentRound: 2,
        isRunning: false
      }
      localStorageMock.setItem('dh-session-timer', JSON.stringify(savedState))

      ;({ timer, scope } = createTimer())

      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(true)
      expect(timer.elapsed.value).toBe(30000)
      expect(timer.currentRound.value).toBe(2)
      // 30 secondes = 00:30
      expect(timer.formattedTime.value).toBe('00:30')
    })
  })

  // ── Nettoyage ──────────────────────────────────────

  describe('nettoyage', () => {
    it('arrete le ticking quand le scope est dispose', () => {
      ({ timer, scope } = createTimer())
      timer.start()

      // Verifier que le timer tourne
      Date.now.mockReturnValue(1000000 + 2000)
      vi.advanceTimersByTime(1000)
      expect(timer.elapsed.value).toBe(2000)

      // Disposer le scope
      scope.stop()
      scope = null

      // Avancer le temps — le timer ne devrait plus mettre a jour
      Date.now.mockReturnValue(1000000 + 10000)
      vi.advanceTimersByTime(5000)

      // elapsed reste a la derniere valeur calculee avant le stop
      // (le setInterval a ete nettoye par onScopeDispose)
      expect(timer.elapsed.value).toBe(2000)
    })
  })
})
