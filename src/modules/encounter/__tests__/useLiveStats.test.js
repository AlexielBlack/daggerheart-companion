// @vitest-environment happy-dom

/**
 * Tests unitaires pour le composable useLiveStats.
 *
 * Le composable recoit un objet store dont les proprietes liveAdversaries
 * et encounterLog sont des tableaux reactifs (comme Pinia auto-unwrap les refs).
 * On utilise reactive() pour reproduire ce comportement dans les tests.
 */

import { reactive, effectScope } from 'vue'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useLiveStats } from '../composables/useLiveStats'

// ── Helpers ──────────────────────────────────────────

/**
 * Cree un mock store avec des proprietes reactives.
 * Pinia auto-unwrap les refs, donc store.liveAdversaries est un tableau reactif
 * directement accessible (sans .value).
 */
function createMockStore(overrides = {}) {
  return reactive({
    liveAdversaries: overrides.liveAdversaries || [],
    encounterLog: overrides.encounterLog || []
  })
}

// ── Tests ────────────────────────────────────────────

describe('useLiveStats', () => {
  let scope
  let stats
  let store

  beforeEach(() => {
    store = createMockStore()
    scope = effectScope()
    scope.run(() => {
      stats = useLiveStats(store)
    })
  })

  afterEach(() => {
    if (scope) {
      scope.stop()
      scope = null
      stats = null
      store = null
    }
  })

  // ── Etat initial vide ────────────────────────────────

  describe('etat initial vide', () => {
    it('totalDamageDealt est 0 sans adversaires', () => {
      expect(stats.totalDamageDealt.value).toBe(0)
    })

    it('totalStressDealt est 0 sans adversaires', () => {
      expect(stats.totalStressDealt.value).toBe(0)
    })

    it('hitCount est 0 sans logs', () => {
      expect(stats.hitCount.value).toBe(0)
    })

    it('hitRatio est 0 sans jets', () => {
      expect(stats.hitRatio.value).toBe(0)
    })
  })

  // ── Adversaires ──────────────────────────────────────

  describe('adversaires', () => {
    it('totalDamageDealt somme les markedHP', () => {
      // Recree le store avec des adversaires pre-remplis
      const storeAvecAdv = createMockStore({
        liveAdversaries: [
          { markedHP: 5, markedStress: 0 },
          { markedHP: 10, markedStress: 0 }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecAdv)
      })

      expect(localStats.totalDamageDealt.value).toBe(15)
    })

    it('totalStressDealt somme les markedStress', () => {
      const storeAvecAdv = createMockStore({
        liveAdversaries: [
          { markedHP: 0, markedStress: 3 },
          { markedHP: 0, markedStress: 7 }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecAdv)
      })

      expect(localStats.totalStressDealt.value).toBe(10)
    })

    it('adversaryStatusSummary compte actifs et vaincus', () => {
      const storeAvecAdv = createMockStore({
        liveAdversaries: [
          { markedHP: 0, markedStress: 0, isDefeated: false },
          { markedHP: 0, markedStress: 0, isDefeated: false },
          { markedHP: 0, markedStress: 0, isDefeated: true }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecAdv)
      })

      expect(localStats.adversaryStatusSummary.value).toEqual({
        active: 2,
        defeated: 1,
        total: 3
      })
    })
  })

  // ── Logs de combat ───────────────────────────────────

  describe('logs de combat', () => {
    it('hitCount compte les entrees damage', () => {
      const storeAvecLogs = createMockStore({
        encounterLog: [
          { action: 'damage' },
          { action: 'damage' },
          { action: 'damage' },
          { action: 'miss' }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecLogs)
      })

      expect(localStats.hitCount.value).toBe(3)
    })

    it('missCount compte les entrees miss', () => {
      const storeAvecLogs = createMockStore({
        encounterLog: [
          { action: 'miss' },
          { action: 'miss' },
          { action: 'damage' }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecLogs)
      })

      expect(localStats.missCount.value).toBe(2)
    })

    it('hitRatio calcule le pourcentage', () => {
      // 8 hits + 2 miss = 10 total, ratio = 80%
      const logs = []
      for (let i = 0; i < 8; i++) logs.push({ action: 'damage' })
      for (let i = 0; i < 2; i++) logs.push({ action: 'miss' })

      const storeAvecLogs = createMockStore({ encounterLog: logs })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecLogs)
      })

      expect(localStats.hitRatio.value).toBe(80)
    })

    it('pcHitCount compte les pc_hit', () => {
      const storeAvecLogs = createMockStore({
        encounterLog: [
          { action: 'pc_hit' },
          { action: 'pc_hit' },
          { action: 'damage' }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecLogs)
      })

      expect(localStats.pcHitCount.value).toBe(2)
    })
  })

  // ── Repartition par PJ ──────────────────────────────

  describe('repartition par PJ', () => {
    it('damageByPc agrege les degats par PJ', () => {
      const storeAvecLogs = createMockStore({
        encounterLog: [
          { action: 'damage', pcId: 'alice', pcName: 'Alice', type: 'hp', amount: 5 },
          { action: 'damage', pcId: 'alice', pcName: 'Alice', type: 'stress', amount: 2 },
          { action: 'damage', pcId: 'bob', pcName: 'Bob', type: 'hp', amount: 3 }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecLogs)
      })

      expect(localStats.damageByPc.value).toEqual({
        alice: { pcName: 'Alice', hp: 5, stress: 2 },
        bob: { pcName: 'Bob', hp: 3, stress: 0 }
      })
    })

    it('killsByPc agrege les kills par PJ', () => {
      const storeAvecLogs = createMockStore({
        encounterLog: [
          { action: 'adv_down', pcId: 'alice', pcName: 'Alice' },
          { action: 'adv_down', pcId: 'alice', pcName: 'Alice' },
          { action: 'adv_down', pcId: 'bob', pcName: 'Bob' }
        ]
      })
      let localStats
      scope.run(() => {
        localStats = useLiveStats(storeAvecLogs)
      })

      expect(localStats.killsByPc.value).toEqual({
        alice: { pcName: 'Alice', count: 2 },
        bob: { pcName: 'Bob', count: 1 }
      })
    })
  })

  // ── Reactivite ───────────────────────────────────────

  describe('reactivite', () => {
    it('reagit aux changements du store pour totalDamageDealt', () => {
      // Initialement vide
      expect(stats.totalDamageDealt.value).toBe(0)

      // Ajout d'un adversaire via mutation du tableau reactif
      store.liveAdversaries.push({ markedHP: 10, markedStress: 0 })

      expect(stats.totalDamageDealt.value).toBe(10)
    })

    it('reagit aux changements du store pour hitCount', () => {
      expect(stats.hitCount.value).toBe(0)

      store.encounterLog.push({ action: 'damage' })
      store.encounterLog.push({ action: 'damage' })

      expect(stats.hitCount.value).toBe(2)
    })

    it('reagit aux changements du store pour adversaryStatusSummary', () => {
      expect(stats.adversaryStatusSummary.value).toEqual({
        active: 0, defeated: 0, total: 0
      })

      store.liveAdversaries.push(
        { markedHP: 0, markedStress: 0, isDefeated: false },
        { markedHP: 0, markedStress: 0, isDefeated: true }
      )

      expect(stats.adversaryStatusSummary.value).toEqual({
        active: 1, defeated: 1, total: 2
      })
    })
  })
})
