/**
 * @module encounter/composables/useLiveStats
 * @description Statistiques de combat en temps réel, calculées depuis le store encounter.
 * Toutes les valeurs sont des computed purs (lecture seule, aucune persistance).
 *
 * @param {Object} store - Instance du encounterLiveStore (Pinia)
 * @param {Array} store.liveAdversaries - Liste réactive des adversaires en cours
 * @param {Array} store.encounterLog - Journal complet de la rencontre
 */

import { computed } from 'vue'

/**
 * Composable de statistiques live pour le combat en cours.
 * Reçoit le store en paramètre pour faciliter l'injection dans les tests.
 *
 * @param {Object} store - Le store Pinia encounter (ses propriétés sont déjà réactives)
 * @returns {Object} Computed de statistiques de combat
 */
export function useLiveStats(store) {
  // ── Dégâts totaux infligés ──────────────────────────

  /** Somme des HP marqués sur tous les adversaires */
  const totalDamageDealt = computed(() =>
    store.liveAdversaries.reduce((sum, a) => sum + (a.markedHP || 0), 0)
  )

  /** Somme du stress marqué sur tous les adversaires */
  const totalStressDealt = computed(() =>
    store.liveAdversaries.reduce((sum, a) => sum + (a.markedStress || 0), 0)
  )

  // ── Compteurs de touches et ratés ───────────────────

  /** Nombre de touches enregistrées (action 'damage') */
  const hitCount = computed(() =>
    store.encounterLog.filter(e => e.action === 'damage').length
  )

  /** Nombre de ratés enregistrés (action 'miss') */
  const missCount = computed(() =>
    store.encounterLog.filter(e => e.action === 'miss').length
  )

  /**
   * Ratio de touches en pourcentage (arrondi).
   * Retourne 0 si aucun jet enregistré.
   */
  const hitRatio = computed(() => {
    const total = hitCount.value + missCount.value
    return total === 0 ? 0 : Math.round((hitCount.value / total) * 100)
  })

  /** Nombre de fois qu'un PJ a été touché (action 'pc_hit') */
  const pcHitCount = computed(() =>
    store.encounterLog.filter(e => e.action === 'pc_hit').length
  )

  // ── Répartition par PJ ──────────────────────────────

  /**
   * Dégâts infligés ventilés par PJ.
   * @returns {{ [pcId: string]: { pcName: string, hp: number, stress: number } }}
   */
  const damageByPc = computed(() => {
    const map = {}
    for (const entry of store.encounterLog) {
      if (entry.action === 'damage' && entry.pcId) {
        if (!map[entry.pcId]) map[entry.pcId] = { pcName: entry.pcName, hp: 0, stress: 0 }
        if (entry.type === 'hp') map[entry.pcId].hp += entry.amount
        if (entry.type === 'stress') map[entry.pcId].stress += entry.amount
      }
    }
    return map
  })

  /**
   * Adversaires mis hors combat ventilés par PJ.
   * @returns {{ [pcId: string]: { pcName: string, count: number } }}
   */
  const killsByPc = computed(() => {
    const map = {}
    for (const entry of store.encounterLog) {
      if (entry.action === 'adv_down' && entry.pcId) {
        if (!map[entry.pcId]) map[entry.pcId] = { pcName: entry.pcName, count: 0 }
        map[entry.pcId].count++
      }
    }
    return map
  })

  // ── Dégâts reçus par PJ ─────────────────────────────

  /**
   * Dégâts reçus ventilés par PJ (hits + armor + downs).
   * @returns {{ [pcId: string]: { pcName: string, hitsReceived: number, hpTaken: number, armorUsed: number, downs: number, stressReceived: number } }}
   */
  const damageReceivedByPc = computed(() => {
    const map = {}
    for (const entry of store.encounterLog) {
      if (entry.action === 'pc_hit' && entry.pcId) {
        if (!map[entry.pcId]) map[entry.pcId] = { pcName: entry.pcName, hitsReceived: 0, hpTaken: 0, armorUsed: 0, downs: 0, stressReceived: 0 }
        map[entry.pcId].hitsReceived++
        map[entry.pcId].hpTaken += entry.hpMarked || 0
      }
      if (entry.action === 'pc_armor' && entry.pcId) {
        if (!map[entry.pcId]) map[entry.pcId] = { pcName: entry.pcName, hitsReceived: 0, hpTaken: 0, armorUsed: 0, downs: 0, stressReceived: 0 }
        map[entry.pcId].armorUsed++
      }
      if (entry.action === 'pc_down' && entry.pcId) {
        if (!map[entry.pcId]) map[entry.pcId] = { pcName: entry.pcName, hitsReceived: 0, hpTaken: 0, armorUsed: 0, downs: 0, stressReceived: 0 }
        map[entry.pcId].downs++
      }
    }
    return map
  })

  /** Nombre total d'utilisations d'armure par les PJ */
  const totalArmorUsed = computed(() =>
    store.encounterLog.filter(e => e.action === 'pc_armor').length
  )

  /** Nombre total de PJ tombés à terre */
  const totalPcDowns = computed(() =>
    store.encounterLog.filter(e => e.action === 'pc_down').length
  )

  // ── Breakdown adversaires ──────────────────────────

  /**
   * HP marqués ventilés par groupe d'adversaires.
   * @returns {{ [adversaryId: string]: { name: string, type: string, totalHP: number, markedHP: number, defeated: number, total: number } }}
   */
  const damageByAdversaryGroup = computed(() => {
    const map = {}
    for (const adv of store.liveAdversaries) {
      if (!map[adv.adversaryId]) {
        map[adv.adversaryId] = { name: adv.name, type: adv.type, totalHP: 0, markedHP: 0, defeated: 0, total: 0 }
      }
      map[adv.adversaryId].totalHP += adv.maxHP || 0
      map[adv.adversaryId].markedHP += adv.markedHP || 0
      map[adv.adversaryId].total++
      if (adv.isDefeated) map[adv.adversaryId].defeated++
    }
    return map
  })

  // ── Résumé des adversaires ──────────────────────────

  /**
   * Résumé du statut des adversaires : actifs, vaincus, total.
   * @returns {{ active: number, defeated: number, total: number }}
   */
  const adversaryStatusSummary = computed(() => {
    const total = store.liveAdversaries.length
    const defeated = store.liveAdversaries.filter(a => a.isDefeated).length
    return { active: total - defeated, defeated, total }
  })

  // ── Conditions infligées ───────────────────────────

  /** Nombre de conditions ajoutées (PJ + adversaires) */
  const conditionsAdded = computed(() =>
    store.encounterLog.filter(e => e.action === 'condition_added').length
  )

  return {
    totalDamageDealt,
    totalStressDealt,
    hitCount,
    missCount,
    hitRatio,
    pcHitCount,
    damageByPc,
    killsByPc,
    damageReceivedByPc,
    totalArmorUsed,
    totalPcDowns,
    damageByAdversaryGroup,
    adversaryStatusSummary,
    conditionsAdded
  }
}
