/**
 * @module encounter/composables/useEncounterGenerator
 * @description Génère une rencontre contextualisée à partir d'un catalogue d'adversaires,
 * en respectant le budget de Battle Points du SRD Daggerheart.
 */

import {
  calculateBaseBattlePoints,
  calculateTierAdjustedCost
} from '@data/encounters/constants'

/**
 * Filtres thématiques par genre ou type d'adversaire.
 */
const THEME_FILTERS = {
  humanoide: { genres: ['humanoide'] },
  bete: { genres: ['bete'] },
  'mort-vivant': { genres: ['mort-vivant'] },
  boss: { types: ['Leader', 'Solo'] },
  embuscade: { types: ['Skulk', 'Ranged'] }
}

/**
 * Modificateurs de budget BP selon la difficulté.
 */
const DIFFICULTY_MODIFIERS = {
  easy: -3,
  standard: 0,
  hard: 3
}

/**
 * Filtre les adversaires éligibles selon le tier (±1) et le thème.
 *
 * @param {Object[]} adversaries - Catalogue d'adversaires
 * @param {number} tier - Tier de la rencontre
 * @param {string|null} theme - Thème optionnel
 * @returns {Object[]}
 */
function filterAdversaries(adversaries, tier, theme) {
  let filtered = adversaries.filter(a => Math.abs(a.tier - tier) <= 1)

  if (theme && THEME_FILTERS[theme]) {
    const filter = THEME_FILTERS[theme]
    if (filter.genres) {
      filtered = filtered.filter(a =>
        a.genres && a.genres.some(g => filter.genres.includes(g))
      )
    }
    if (filter.types) {
      filtered = filtered.filter(a => filter.types.includes(a.type))
    }
  }

  return filtered
}

/**
 * Sélectionne un élément aléatoire dans un tableau.
 *
 * @param {Array} arr
 * @returns {*}
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Génère une rencontre selon les paramètres fournis.
 *
 * @param {Object} params
 * @param {Object[]} params.adversaries - Catalogue d'adversaires
 * @param {number} params.tier - Tier de la rencontre
 * @param {string|null} params.theme - Thème optionnel (genre ou archétype)
 * @param {string} params.difficulty - 'easy' | 'standard' | 'hard'
 * @param {number} params.pcCount - Nombre de personnages joueurs
 * @returns {{ slots: Object[], totalBP: number, budgetBP: number, tier: number, theme: string|null }}
 */
export function generateEncounter({ adversaries, tier, theme, difficulty, pcCount }) {
  const baseBP = calculateBaseBattlePoints(pcCount)
  const budgetBP = Math.max(1, baseBP + (DIFFICULTY_MODIFIERS[difficulty] ?? 0))

  const eligible = filterAdversaries(adversaries, tier, theme)
  if (eligible.length === 0) {
    return { slots: [], totalBP: 0, budgetBP, tier, theme }
  }

  const slots = []
  let spent = 0

  const byType = {
    heavy: eligible.filter(a => ['Leader', 'Solo', 'Bruiser'].includes(a.type)),
    standard: eligible.filter(a => ['Standard', 'Horde', 'Ranged', 'Skulk', 'Support', 'Social'].includes(a.type)),
    minion: eligible.filter(a => a.type === 'Minion')
  }

  // 1. Placer un adversaire lourd (Leader/Solo/Bruiser) si le budget le permet
  if (byType.heavy.length > 0 && budgetBP >= 3) {
    const pick = pickRandom(byType.heavy)
    const tierDelta = pick.tier - tier
    const cost = calculateTierAdjustedCost(pick.type, 1, pcCount, tierDelta)
    if (cost <= budgetBP) {
      slots.push({ adversary: pick, quantity: 1, cost })
      spent += cost
    }
  }

  // 2. Compléter avec des Standards
  let attempts = 0
  while (spent < budgetBP && byType.standard.length > 0 && attempts < 20) {
    const pick = pickRandom(byType.standard)
    const tierDelta = pick.tier - tier
    const cost = calculateTierAdjustedCost(pick.type, 1, pcCount, tierDelta)
    if (spent + cost <= budgetBP) {
      const existing = slots.find(s => s.adversary.id === pick.id)
      if (existing) {
        existing.quantity += 1
        existing.cost += cost
      } else {
        slots.push({ adversary: pick, quantity: 1, cost })
      }
      spent += cost
    }
    attempts++
  }

  // 3. Remplir le reste avec des Minions (groupes de pcCount)
  if (spent < budgetBP && byType.minion.length > 0) {
    const remaining = budgetBP - spent
    const minionGroups = Math.floor(remaining)
    if (minionGroups > 0) {
      const pick = pickRandom(byType.minion)
      const quantity = minionGroups * pcCount
      slots.push({ adversary: pick, quantity, cost: minionGroups })
      spent += minionGroups
    }
  }

  return { slots, totalBP: spent, budgetBP, tier, theme }
}
