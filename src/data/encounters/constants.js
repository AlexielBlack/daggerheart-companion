/**
 * @module encounters/constants
 * @description Constantes pour le constructeur de rencontres,
 * basées sur le Battle Guide du SRD Daggerheart.
 */

/**
 * Coût en Battle Points par type d'adversaire.
 * Source : ADV_rules.pdf — Battle Guide > Spending Battle Points
 *
 * Note : Les Minions sont comptés par groupe (1 groupe = nombre de PJ).
 * Les Ranged ne sont pas un type séparé dans nos données —
 * ils sont inclus dans les types existants selon le contexte.
 */
export const BATTLE_POINT_COSTS = {
  Minion: 1,    // par groupe (taille = nombre de PJ)
  Social: 1,
  Support: 1,
  Horde: 2,
  Ranged: 2,
  Skulk: 2,
  Standard: 2,
  Leader: 3,
  Bruiser: 4,
  Solo: 5
}

/**
 * Ajustements possibles des Battle Points.
 * Source : ADV_rules.pdf — Battle Guide > Adjusting Battle Points
 */
export const BP_ADJUSTMENTS = [
  {
    id: 'easier',
    label: 'Combat plus facile / plus court',
    value: -1,
    description: 'Retire 1 point si le combat doit être moins difficile ou plus court.',
    autoDetect: false
  },
  {
    id: 'multi-solo',
    label: '2+ adversaires Solo',
    value: -2,
    description: 'Retire 2 points si vous utilisez 2 Solo ou plus.',
    autoDetect: true
  },
  {
    id: 'damage-boost',
    label: 'Boost dégâts (+1d4 / +2 à tous)',
    value: -2,
    description: 'Retire 2 points si vous ajoutez +1d4 (ou +2) aux dégâts de tous les adversaires.',
    autoDetect: false
  },
  {
    id: 'lower-tier',
    label: 'Adversaire(s) de tier inférieur (heuristique SRD)',
    value: 1,
    description: 'Ajoute 1 point si un adversaire provient d\'un tier inférieur. Heuristique SRD simple — le coût par tier est désormais intégré au coût unitaire de chaque adversaire.',
    autoDetect: false
  },
  {
    id: 'no-heavy-hitters',
    label: 'Pas de Bruiser / Horde / Leader / Solo',
    value: 1,
    description: 'Ajoute 1 point si aucun Bruiser, Horde, Leader ou Solo n\'est présent.',
    autoDetect: true
  },
  {
    id: 'harder',
    label: 'Combat plus dangereux / plus long',
    value: 2,
    description: 'Ajoute 2 points si le combat doit être plus dangereux ou plus long.',
    autoDetect: false
  }
]

/**
 * IDs des ajustements auto-détectables (calculés automatiquement selon la composition).
 */
export const AUTO_DETECTABLE_ADJUSTMENTS = BP_ADJUSTMENTS
  .filter((a) => a.autoDetect)
  .map((a) => a.id)

/**
 * Guide de dépense de Fear par intensité de scène.
 * Source : CoreGMMechanics_SRD.pdf — Fear Spending Guide
 */
export const SCENE_INTENSITY = [
  {
    id: 'incidental',
    label: 'Incident',
    fearRange: [0, 1],
    description: 'Repos, ravitaillement, échange calme entre PJ.',
    color: '#6b7280'
  },
  {
    id: 'minor',
    label: 'Mineur',
    fearRange: [1, 3],
    description: 'Voyage, escarmouche d\'introduction, signal de menace.',
    color: '#22c55e'
  },
  {
    id: 'standard',
    label: 'Standard',
    fearRange: [2, 4],
    description: 'Bataille notable, voyage périlleux, rencontre sociale tendue.',
    color: '#eab308'
  },
  {
    id: 'major',
    label: 'Majeur',
    fearRange: [4, 8],
    description: 'Grande bataille avec Solo/Leader, scène définissant un personnage.',
    color: '#f97316'
  },
  {
    id: 'climactic',
    label: 'Climactique',
    fearRange: [6, 12],
    description: 'Confrontation finale d\'arc, set piece épique, duel judiciaire.',
    color: '#ef4444'
  }
]

/**
 * Types d'adversaire considérés comme "lourds" pour l'ajustement no-heavy-hitters.
 */
export const HEAVY_HITTER_TYPES = ['Bruiser', 'Horde', 'Leader', 'Solo']

/**
 * Nombre minimum/maximum de PJ supporté.
 */
export const PC_COUNT_MIN = 2
export const PC_COUNT_MAX = 8

/**
 * Calcule les Battle Points de base.
 * Formule SRD : (3 × nombre de PJ) + 2
 *
 * @param {number} pcCount - Nombre de PJ
 * @returns {number}
 */
export function calculateBaseBattlePoints(pcCount) {
  return (3 * pcCount) + 2
}

/**
 * Calcule le coût en Battle Points d'un adversaire.
 * Les Minions coûtent 1 BP par groupe (1 groupe = pcCount minions).
 * Pour les autres types : coût unitaire × quantité.
 *
 * @param {string} type - Type d'adversaire
 * @param {number} quantity - Nombre d'individus ajoutés
 * @param {number} [pcCount=4] - Nombre de PJ (utilisé pour les Minions uniquement)
 * @returns {number}
 */
export function calculateAdversaryCost(type, quantity, pcCount = 4) {
  if (type === 'Minion') {
    // SRD : 1 groupe = pcCount minions = 1 BP
    return Math.ceil(quantity / pcCount)
  }
  const cost = BATTLE_POINT_COSTS[type] ?? 2
  return cost * quantity
}

/**
 * Calcule le coût BP ajusté selon le différentiel de tier.
 * Approche : ±1 BP par palier d'écart entre le tier de l'adversaire
 * et le tier de la rencontre.
 *
 * - Tier inférieur → coût réduit (adversaire plus faible)
 * - Tier supérieur → coût augmenté (adversaire plus fort)
 * - Minions exemptés (coût groupe fixe, toujours trivial)
 * - Plancher : 1 BP par unité minimum
 *
 * @param {string} type - Type d'adversaire
 * @param {number} quantity - Nombre d'individus
 * @param {number} [pcCount=4] - Nombre de PJ (Minions uniquement)
 * @param {number} [tierDelta=0] - adversaryTier − encounterTier
 * @returns {number}
 */
export function calculateTierAdjustedCost(type, quantity, pcCount = 4, tierDelta = 0) {
  // Minions : coût groupe fixe, le tier n'affecte pas le prix
  if (type === 'Minion') {
    return Math.ceil(quantity / pcCount)
  }
  const baseCost = BATTLE_POINT_COSTS[type] ?? 2
  const adjustedUnit = Math.max(1, baseCost + tierDelta)
  return adjustedUnit * quantity
}
