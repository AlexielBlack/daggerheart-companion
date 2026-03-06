/**
 * @module encounter/composables/useFearHope
 * @description Gestion de l'economie Fear/Hope de Daggerheart.
 * Chaque jet de dualite genere du Hope (joueur) ou du Fear (MJ).
 * Les tokens accumules sont depenses pour activer des features.
 * Persiste via useStorage pour survivre aux rechargements de page.
 */

import { computed } from 'vue'
import { useStorage } from '@core/composables/useStorage'
import { FEAR_HOPE_FROM_ROLL } from '@data/encounters/liveConstants'

// Etat par defaut : aucun token accumule ni depense
const DEFAULT_STATE = {
  fear: 0,
  hope: 0,
  fearSpent: 0,
  hopeSpent: 0
}

/**
 * Composable pour la gestion de l'economie Fear/Hope.
 * Fournit des compteurs reactifs et des actions pour ajouter,
 * depenser et reinitialiser les tokens Fear et Hope.
 *
 * @returns {Object} API Fear/Hope
 * @returns {import('vue').ComputedRef<number>} returns.fear - Tokens Fear actuels
 * @returns {import('vue').ComputedRef<number>} returns.hope - Tokens Hope actuels
 * @returns {import('vue').ComputedRef<number>} returns.fearSpent - Total Fear depenses
 * @returns {import('vue').ComputedRef<number>} returns.hopeSpent - Total Hope depenses
 * @returns {Function} returns.addFear - Ajoute n tokens Fear
 * @returns {Function} returns.addHope - Ajoute n tokens Hope
 * @returns {Function} returns.spendFear - Depense n tokens Fear (si disponibles)
 * @returns {Function} returns.spendHope - Depense n tokens Hope (si disponibles)
 * @returns {Function} returns.applyRollResult - Applique l'effet Fear/Hope d'un jet de dualite
 * @returns {Function} returns.reset - Reinitialise tous les compteurs a zero
 */
export function useFearHope() {
  const storage = useStorage('fear-hope', { ...DEFAULT_STATE })

  // ── Computed refs ─────────────────────────────────────

  /** Nombre actuel de tokens Fear */
  const fear = computed(() => storage.data.value.fear)

  /** Nombre actuel de tokens Hope */
  const hope = computed(() => storage.data.value.hope)

  /** Total de tokens Fear depenses depuis la derniere reinitialisation */
  const fearSpent = computed(() => storage.data.value.fearSpent)

  /** Total de tokens Hope depenses depuis la derniere reinitialisation */
  const hopeSpent = computed(() => storage.data.value.hopeSpent)

  // ── Actions ───────────────────────────────────────────

  /**
   * Ajoute des tokens Fear au pool du MJ.
   * @param {number} [n=1] - Nombre de tokens a ajouter
   */
  function addFear(n = 1) {
    const s = storage.data.value
    storage.save({ ...s, fear: s.fear + n })
  }

  /**
   * Ajoute des tokens Hope au pool des joueurs.
   * @param {number} [n=1] - Nombre de tokens a ajouter
   */
  function addHope(n = 1) {
    const s = storage.data.value
    storage.save({ ...s, hope: s.hope + n })
  }

  /**
   * Depense des tokens Fear du pool du MJ.
   * Ne depense que le minimum entre n et le Fear disponible.
   * Ne fait rien si aucun Fear disponible.
   * @param {number} [n=1] - Nombre de tokens a depenser
   */
  function spendFear(n = 1) {
    const s = storage.data.value
    const actual = Math.min(n, s.fear)
    if (actual <= 0) return
    storage.save({ ...s, fear: s.fear - actual, fearSpent: s.fearSpent + actual })
  }

  /**
   * Depense des tokens Hope du pool des joueurs.
   * Ne depense que le minimum entre n et le Hope disponible.
   * Ne fait rien si aucun Hope disponible.
   * @param {number} [n=1] - Nombre de tokens a depenser
   */
  function spendHope(n = 1) {
    const s = storage.data.value
    const actual = Math.min(n, s.hope)
    if (actual <= 0) return
    storage.save({ ...s, hope: s.hope - actual, hopeSpent: s.hopeSpent + actual })
  }

  /**
   * Applique l'effet Fear/Hope correspondant a un resultat de jet de dualite.
   * Utilise la table FEAR_HOPE_FROM_ROLL du SRD (p.18).
   * Ne fait rien si le rollResultId n'est pas reconnu.
   * @param {string} rollResultId - Identifiant du resultat (ex: 'criticalSuccess', 'successHope')
   */
  function applyRollResult(rollResultId) {
    const effect = FEAR_HOPE_FROM_ROLL[rollResultId]
    if (!effect) return
    const s = storage.data.value
    storage.save({
      ...s,
      hope: s.hope + effect.hope,
      fear: s.fear + effect.fear
    })
  }

  /**
   * Reinitialise tous les compteurs Fear/Hope a zero.
   * Utilise pour un nouveau combat ou une nouvelle session.
   */
  function reset() {
    storage.save({ ...DEFAULT_STATE })
  }

  return {
    fear, hope, fearSpent, hopeSpent,
    addFear, addHope, spendFear, spendHope,
    applyRollResult, reset
  }
}
