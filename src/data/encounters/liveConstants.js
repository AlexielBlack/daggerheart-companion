/**
 * @module encounters/liveConstants
 * @description Constantes pour le mode live play d'une rencontre.
 * Définit les modes de scène, les métadonnées d'affichage,
 * et les règles de filtrage contextuel des features.
 */

// ═══════════════════════════════════════════════════════════
//  Modes de scène
// ═══════════════════════════════════════════════════════════

/** Identifiants des 4 modes de scène */
export const SCENE_MODE_PC_ATTACK = 'pcAttack'
export const SCENE_MODE_ADVERSARY_ATTACK = 'adversaryAttack'
export const SCENE_MODE_SOCIAL = 'social'
export const SCENE_MODE_TRAVERSAL = 'traversal'

/** Liste des modes actifs pour itération / validation */
export const SCENE_MODES = [
  SCENE_MODE_PC_ATTACK,
  SCENE_MODE_ADVERSARY_ATTACK
]

/** Métadonnées d'affichage et de filtrage par mode */
export const SCENE_MODE_META = {
  [SCENE_MODE_PC_ATTACK]: {
    label: 'PJ Attaque',
    emoji: '⚔️',
    color: '#dc2626',
    description: 'Un PJ a le projecteur et attaque un adversaire',
    /** Tags priorisés pour les features PJ dans ce mode */
    primaryTags: ['offensif'],
    /** Tags secondaires (affichés mais atténués) */
    secondaryTags: ['défensif', 'utilitaire'],
    /** Types d'activation priorisés */
    primaryActivation: ['action'],
    /** Le PJ est l'acteur, l'adversaire la cible */
    actorRole: 'pc',
    targetRole: 'adversary'
  },
  [SCENE_MODE_ADVERSARY_ATTACK]: {
    label: 'Adversaire Attaque',
    emoji: '💀',
    color: '#7c3aed',
    description: 'Le MJ a le projecteur, un adversaire attaque',
    primaryTags: ['défensif'],
    secondaryTags: ['offensif', 'utilitaire'],
    primaryActivation: ['reaction'],
    actorRole: 'adversary',
    targetRole: 'pc'
  },
  [SCENE_MODE_SOCIAL]: {
    label: 'Social',
    emoji: '💬',
    color: '#d97706',
    description: 'Interaction sociale, dialogue, persuasion',
    primaryTags: ['social'],
    secondaryTags: ['utilitaire'],
    primaryActivation: ['action'],
    actorRole: 'pc',
    targetRole: 'adversary'
  },
  [SCENE_MODE_TRAVERSAL]: {
    label: 'Traversal',
    emoji: '🗺️',
    color: '#059669',
    description: 'Exploration, environnement, défi physique',
    primaryTags: ['utilitaire'],
    secondaryTags: ['défensif'],
    primaryActivation: ['action'],
    actorRole: 'pc',
    targetRole: 'environment'
  }
}

// ═══════════════════════════════════════════════════════════
//  Projecteur (Spotlight)
// ═══════════════════════════════════════════════════════════

/** Qui détient le projecteur */
export const SPOTLIGHT_PC = 'pc'
export const SPOTLIGHT_GM = 'gm'

// ═══════════════════════════════════════════════════════════
//  Limites et valeurs par défaut
// ═══════════════════════════════════════════════════════════

/** Valeur initiale de Fear (SRD : le MJ commence avec 0 Fear) */
export const INITIAL_FEAR = 0

/** Pas de maximum strict dans le SRD, mais cap raisonnable pour l'UI */
export const MAX_FEAR = 20

/** Pas de maximum strict pour Hope non plus */
export const MAX_HOPE = 20

/** Fear minimum */
export const MIN_FEAR = 0

/** Hope minimum */
export const MIN_HOPE = 0

/**
 * Valide qu'un mode de scène est valide.
 * @param {string} mode
 * @returns {boolean}
 */
export function isValidSceneMode(mode) {
  return SCENE_MODES.includes(mode)
}
