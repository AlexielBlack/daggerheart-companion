/**
 * @module encounter/stores/encounterHistoryStore
 * @description Store Pinia pour l'historique des rencontres terminées.
 * Persiste les résumés de combat via useStorage.
 */

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@core/composables/useStorage'

export const useEncounterHistoryStore = defineStore('encounter-history', () => {
  // ── Persistence ────────────────────────────────────────
  const storage = useStorage('encounter-history', [])

  // ── Getters ────────────────────────────────────────────

  /** Toutes les entrées, du plus récent au plus ancien */
  const all = computed(() => {
    const list = storage.data.value
    return Array.isArray(list) ? [...list].reverse() : []
  })

  /** Nombre total de rencontres enregistrées */
  const count = computed(() => all.value.length)

  /** Statistiques agrégées sur toutes les rencontres */
  const stats = computed(() => {
    const entries = all.value
    if (entries.length === 0) {
      return {
        totalEncounters: 0,
        totalDefeated: 0,
        totalSurviving: 0,
        totalPcsFallen: 0,
        totalHPMarked: 0,
        totalStressMarked: 0,
        totalHits: 0,
        totalMisses: 0,
        totalPcHits: 0,
        hitRatio: 0
      }
    }

    const totalDefeated = entries.reduce((s, e) => s + (e.defeated?.length || 0), 0)
    const totalSurviving = entries.reduce((s, e) => s + (e.surviving?.length || 0), 0)
    const totalPcsFallen = entries.reduce((s, e) => s + (e.pcsFallen?.length || 0), 0)
    const totalHPMarked = entries.reduce((s, e) => s + (e.totalHPMarked || 0), 0)
    const totalStressMarked = entries.reduce((s, e) => s + (e.totalStressMarked || 0), 0)
    const totalHits = entries.reduce((s, e) => s + (e.hitCount || 0), 0)
    const totalMisses = entries.reduce((s, e) => s + (e.missCount || 0), 0)
    const totalPcHits = entries.reduce((s, e) => s + (e.pcHitCount || 0), 0)
    const hitRatio = (totalHits + totalMisses) > 0
      ? Math.round((totalHits / (totalHits + totalMisses)) * 100)
      : 0

    return {
      totalEncounters: entries.length,
      totalDefeated,
      totalSurviving,
      totalPcsFallen,
      totalHPMarked,
      totalStressMarked,
      totalHits,
      totalMisses,
      totalPcHits,
      hitRatio
    }
  })

  // ── Actions ────────────────────────────────────────────

  /**
   * Ajoute un résumé de rencontre à l'historique.
   * @param {Object} summary — objet retourné par generateSummary()
   */
  function add(summary) {
    if (!summary) return
    const entry = {
      ...summary,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    }
    const list = Array.isArray(storage.data.value) ? [...storage.data.value] : []
    list.push(entry)
    storage.save(list)
  }

  /**
   * Supprime une entrée par ID.
   * @param {string} id
   */
  function remove(id) {
    const list = Array.isArray(storage.data.value) ? [...storage.data.value] : []
    storage.save(list.filter((e) => e.id !== id))
  }

  /** Vide tout l'historique. */
  function clear() {
    storage.save([])
  }

  return {
    all,
    count,
    stats,
    add,
    remove,
    clear
  }
})
