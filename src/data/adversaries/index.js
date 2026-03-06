/**
 * @module adversaries/data
 * @description Index des données d'adversaires — agrège tous les tiers et fournit les constantes.
 */

import tier1 from './tier1.json'
import tier2 from './tier2.json'
import tier3 from './tier3.json'
import tier4 from './tier4.json'

/** Tous les adversaires de tous les tiers */
export const allAdversaries = [...tier1, ...tier2, ...tier3, ...tier4]

/** Constantes de type d'adversaire */
export const ADVERSARY_TYPES = [
  'Bruiser',
  'Horde',
  'Leader',
  'Minion',
  'Ranged',
  'Skulk',
  'Social',
  'Solo',
  'Standard',
  'Support'
]

/** Labels français pour les types d'adversaire */
export const ADVERSARY_TYPE_LABELS = {
  Bruiser: 'Brute',
  Horde: 'Horde',
  Leader: 'Meneur',
  Minion: 'Sbire',
  Ranged: 'À distance',
  Skulk: 'Rôdeur',
  Social: 'Social',
  Solo: 'Solo',
  Standard: 'Standard',
  Support: 'Soutien'
}

/** Identifiants des 12 genres d'adversaires (clés sans accents pour JSON) */
export const ADVERSARY_GENRES = [
  'humanoide',
  'bete',
  'mort-vivant',
  'demon',
  'fee',
  'dragon',
  'construction',
  'elementaire',
  'aberration',
  'plante',
  'geant',
  'monstruosite'
]

/** Métadonnées d'affichage des genres (label FR, emoji, couleur) */
export const GENRE_META = {
  humanoide: { label: 'Humanoïde', emoji: '🧑', color: '#6b7280' },
  bete: { label: 'Bête', emoji: '🐾', color: '#92400e' },
  'mort-vivant': { label: 'Mort-vivant', emoji: '💀', color: '#6b21a8' },
  demon: { label: 'Démon', emoji: '😈', color: '#dc2626' },
  fee: { label: 'Fée', emoji: '🧚', color: '#16a34a' },
  dragon: { label: 'Dragon', emoji: '🐉', color: '#ea580c' },
  construction: { label: 'Construction', emoji: '🏗️', color: '#78716c' },
  elementaire: { label: 'Élémentaire', emoji: '🌪️', color: '#0284c7' },
  aberration: { label: 'Aberration', emoji: '👁️', color: '#7c3aed' },
  plante: { label: 'Plante', emoji: '🌿', color: '#15803d' },
  geant: { label: 'Géant', emoji: '🗿', color: '#a16207' },
  monstruosite: { label: 'Monstruosité', emoji: '🐲', color: '#be123c' }
}

/** Valide qu'un tableau de genres ne contient que des valeurs autorisées */
export function validateGenres(genres) {
  if (!Array.isArray(genres)) return false
  return genres.length > 0 && genres.every((g) => ADVERSARY_GENRES.includes(g))
}

/** Définitions des tiers avec plages de niveaux */
export const TIERS = [
  { value: 1, label: 'Tier 1', levels: '1' },
  { value: 2, label: 'Tier 2', levels: '2–4' },
  { value: 3, label: 'Tier 3', levels: '5–7' },
  { value: 4, label: 'Tier 4', levels: '8–10' }
]

/** Constantes de type de feature */
export const FEATURE_TYPES = ['passive', 'action', 'reaction']

/** Constantes de portée */
export const RANGES = ['Melee', 'Very Close', 'Close', 'Far', 'Very Far']

/** Labels français pour les portées */
export const RANGE_LABELS = {
  Melee: 'Mêlée',
  'Very Close': 'Très Proche',
  Close: 'Proche',
  Far: 'Loin',
  'Very Far': 'Très Loin'
}

/** Facteurs du profil de focus — clés et labels FR */
export const FOCUS_FACTORS = {
  lowHP: { label: 'PV bas', icon: '💔', description: 'Cible les PJ affaiblis' },
  lowArmor: { label: 'Armure faible', icon: '🛡️', description: 'Cible les PJ peu protégés' },
  lowEvasion: { label: 'Évasion faible', icon: '🎯', description: 'Cible les PJ faciles à toucher' },
  highThreat: { label: 'Menace élevée', icon: '⚔️', description: 'Cible les PJ les plus dangereux' },
  highPresence: { label: 'Présence forte', icon: '👑', description: 'Cible les PJ les plus visibles' },
  highGold: { label: 'Riche en or', icon: '💰', description: 'Cible les PJ les plus riches' },
  nearest: { label: 'Proximité', icon: '📍', description: 'Cible le PJ le plus proche' }
}

/** Labels des types de dégâts (FR) */
export const DAMAGE_TYPE_LABELS = {
  phy: 'Physique',
  mag: 'Magique',
  'phy/mag': 'Physique/Magique'
}

/** Statistiques par tier — référence pour l'improvisation */
export const TIER_BENCHMARKS = {
  1: { atkMod: '+1', damage: '1d6+2 à 1d12+4', difficulty: 11, thresholds: '7/12' },
  2: { atkMod: '+2', damage: '2d6+3 à 2d12+4', difficulty: 14, thresholds: '10/20' },
  3: { atkMod: '+3', damage: '3d8+3 à 3d12+5', difficulty: 17, thresholds: '20/32' },
  4: { atkMod: '+4', damage: '4d8+10 à 4d12+15', difficulty: 20, thresholds: '25/45' }
}

export { tier1, tier2, tier3, tier4 }
