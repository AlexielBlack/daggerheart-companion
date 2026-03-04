/**
 * @module constants/tags
 * @description Système de tags pour les features de jeu Daggerheart.
 * Tags multi-assignables sur : classes, sous-classes, ascendances,
 * communautés, domaines, équipements.
 *
 * Servira de base pour la future interface de jeu.
 */

/** Identifiants des 4 tags */
export const TAG_OFFENSIF = 'offensif'
export const TAG_DEFENSIF = 'défensif'
export const TAG_SOCIAL = 'social'
export const TAG_UTILITAIRE = 'utilitaire'

/** Liste complète pour itération / validation */
export const ALL_TAGS = [TAG_OFFENSIF, TAG_DEFENSIF, TAG_SOCIAL, TAG_UTILITAIRE]

/** Métadonnées d'affichage */
export const TAG_META = {
  [TAG_OFFENSIF]: {
    label: 'Offensif',
    emoji: '⚔️',
    color: '#dc2626',
    description: 'Dégâts, attaques, debuffs sur l\'ennemi'
  },
  [TAG_DEFENSIF]: {
    label: 'Défensif',
    emoji: '🛡️',
    color: '#2563eb',
    description: 'Soin, protection, réduction de dégâts, buffs de survie'
  },
  [TAG_SOCIAL]: {
    label: 'Social',
    emoji: '💬',
    color: '#d97706',
    description: 'Interaction, roleplay mécanique, persuasion, lien narratif'
  },
  [TAG_UTILITAIRE]: {
    label: 'Utilitaire',
    emoji: '🔧',
    color: '#059669',
    description: 'Mouvement, exploration, information, gestion de ressources'
  }
}

/**
 * Valide qu'un tableau de tags ne contient que des valeurs autorisées.
 * @param {string[]} tags
 * @returns {boolean}
 */
export function validateTags(tags) {
  if (!Array.isArray(tags)) return false
  return tags.every((t) => ALL_TAGS.includes(t))
}
