/**
 * @module encounters/liveConstants
 * @description Constantes pour le mode live play d'une rencontre.
 * Définit les modes de scène, les métadonnées d'affichage,
 * et les règles de filtrage contextuel des features.
 */

// ═══════════════════════════════════════════════════════════
//  Modes de scène
// ═══════════════════════════════════════════════════════════

/** Identifiants des 3 modes de scène */
export const SCENE_MODE_PC_ATTACK = 'pcAttack'
export const SCENE_MODE_ADVERSARY_ATTACK = 'adversaryAttack'
export const SCENE_MODE_SOCIAL = 'social'

/** Liste des modes actifs pour itération / validation */
export const SCENE_MODES = [
  SCENE_MODE_PC_ATTACK,
  SCENE_MODE_ADVERSARY_ATTACK,
  SCENE_MODE_SOCIAL
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
    emoji: '🗣️',
    color: '#0891b2',
    description: 'Scène sociale — négociation, persuasion, interaction',
    primaryTags: ['social'],
    secondaryTags: ['utilitaire', 'défensif'],
    primaryActivation: ['action'],
    /** En mode social, le PJ a le projecteur */
    actorRole: 'pc',
    targetRole: 'pc'
  }
}

// ═══════════════════════════════════════════════════════════
//  Projecteur (Spotlight)
// ═══════════════════════════════════════════════════════════

/** Qui détient le projecteur */
export const SPOTLIGHT_PC = 'pc'
export const SPOTLIGHT_GM = 'gm'

/**
 * Valide qu'un mode de scène est valide.
 * @param {string} mode
 * @returns {boolean}
 */
export function isValidSceneMode(mode) {
  return SCENE_MODES.includes(mode)
}

// ═══════════════════════════════════════════════════════════
//  Conditions (SRD standard + utilitaires)
// ═══════════════════════════════════════════════════════════

/**
 * Conditions standard du SRD Daggerheart.
 * Hidden, Restrained, Vulnerable sont les 3 conditions officielles.
 * Temporary est un tag SRD (la créature peut tenter de se libérer).
 */
export const LIVE_CONDITIONS = [
  { id: 'hidden', emoji: '👁️‍🗨️', label: 'Hidden', description: 'Rolls against have disadvantage. Lost on attack or being seen.' },
  { id: 'restrained', emoji: '⛓️', label: 'Restrained', description: 'Can\'t move, but can still take actions.' },
  { id: 'vulnerable', emoji: '⚡', label: 'Vulnerable', description: 'All rolls targeting have advantage.' },
  { id: 'temporary', emoji: '⏳', label: 'Temporary', description: 'Can be cleared by making a move against it.' }
]

// ═══════════════════════════════════════════════════════════
//  Countdowns
// ═══════════════════════════════════════════════════════════

/** Types de countdown SRD */
export const COUNTDOWN_TYPES = [
  { id: 'standard', label: 'Standard', emoji: '⏱️', description: 'Avance de 1 à chaque jet d\'action.' },
  { id: 'progress', label: 'Progrès', emoji: '🟢', description: 'Avance selon le résultat (Crit=3, Hope=2, Fear=1).' },
  { id: 'consequence', label: 'Conséquence', emoji: '🔴', description: 'Avance selon le résultat (FailFear=3, FailHope=2, Fear=1).' }
]

/**
 * Table d'avancement pour countdowns dynamiques (SRD p.67).
 * Clé = résultat du jet, Valeur = { progress, consequence }
 */
export const DYNAMIC_ADVANCEMENT = {
  criticalSuccess: { progress: 3, consequence: 0 },
  successHope: { progress: 2, consequence: 0 },
  successFear: { progress: 1, consequence: 1 },
  failureHope: { progress: 0, consequence: 2 },
  failureFear: { progress: 0, consequence: 3 }
}

/**
 * Table Fear/Hope générée par chaque résultat de jet de dualité (SRD p.18).
 * Chaque jet produit soit du Hope (joueur) soit du Fear (MJ).
 */
export const FEAR_HOPE_FROM_ROLL = {
  criticalSuccess: { hope: 2, fear: 0 },
  successHope:     { hope: 1, fear: 0 },
  successFear:     { hope: 0, fear: 1 },
  failureHope:     { hope: 0, fear: 0 },
  failureFear:     { hope: 0, fear: 1 }
}

/** Résultats de jet pour les boutons d'avancement dynamique */
export const ROLL_RESULTS = [
  { id: 'criticalSuccess', label: 'Critique', short: 'Crit', emoji: '✨' },
  { id: 'successHope', label: 'Succès Hope', short: 'S+H', emoji: '☀️' },
  { id: 'successFear', label: 'Succès Fear', short: 'S+F', emoji: '🌙' },
  { id: 'failureHope', label: 'Échec Hope', short: 'É+H', emoji: '💫' },
  { id: 'failureFear', label: 'Échec Fear', short: 'É+F', emoji: '💀' }
]
