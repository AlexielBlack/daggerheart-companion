/**
 * @module npcs/constants
 * @description Constantes du module PNJ : statuts, dispositions,
 * types de relations, et helpers de rendu.
 */

// ── Statuts d'un PNJ ────────────────────────────────────

export const NPC_STATUS_ALLY = 'ally'
export const NPC_STATUS_NEUTRAL = 'neutral'
export const NPC_STATUS_HOSTILE = 'hostile'
export const NPC_STATUS_DEAD = 'dead'
export const NPC_STATUS_MISSING = 'missing'

export const ALL_NPC_STATUSES = [
  NPC_STATUS_ALLY,
  NPC_STATUS_NEUTRAL,
  NPC_STATUS_HOSTILE,
  NPC_STATUS_DEAD,
  NPC_STATUS_MISSING
]

export const NPC_STATUS_META = {
  [NPC_STATUS_ALLY]: { label: 'Allié', emoji: '🤝', color: '#059669' },
  [NPC_STATUS_NEUTRAL]: { label: 'Neutre', emoji: '😐', color: '#6b7280' },
  [NPC_STATUS_HOSTILE]: { label: 'Hostile', emoji: '⚠️', color: '#dc2626' },
  [NPC_STATUS_DEAD]: { label: 'Mort', emoji: '💀', color: '#374151' },
  [NPC_STATUS_MISSING]: { label: 'Disparu', emoji: '❓', color: '#7c3aed' }
}

// ── Dispositions PNJ ↔ PJ ───────────────────────────────

export const DISPOSITION_HOSTILE = -2
export const DISPOSITION_SUSPICIOUS = -1
export const DISPOSITION_NEUTRAL = 0
export const DISPOSITION_FRIENDLY = 1
export const DISPOSITION_ALLIED = 2

export const ALL_DISPOSITIONS = [
  DISPOSITION_HOSTILE,
  DISPOSITION_SUSPICIOUS,
  DISPOSITION_NEUTRAL,
  DISPOSITION_FRIENDLY,
  DISPOSITION_ALLIED
]

export const DISPOSITION_META = {
  [DISPOSITION_HOSTILE]: { label: 'Hostile', emoji: '🔴', color: '#dc2626' },
  [DISPOSITION_SUSPICIOUS]: { label: 'Méfiant', emoji: '🟠', color: '#d97706' },
  [DISPOSITION_NEUTRAL]: { label: 'Neutre', emoji: '⚪', color: '#6b7280' },
  [DISPOSITION_FRIENDLY]: { label: 'Amical', emoji: '🟢', color: '#059669' },
  [DISPOSITION_ALLIED]: { label: 'Allié', emoji: '💚', color: '#047857' }
}

// ── Types de relation PNJ ↔ PNJ ─────────────────────────

export const RELATION_FAMILY = 'family'
export const RELATION_RIVALRY = 'rivalry'
export const RELATION_ALLIANCE = 'alliance'
export const RELATION_DEBT = 'debt'
export const RELATION_ROMANCE = 'romance'
export const RELATION_EMPLOYER = 'employer'
export const RELATION_FRIENDSHIP = 'friendship'
export const RELATION_ENMITY = 'enmity'
export const RELATION_OTHER = 'other'

export const ALL_RELATION_TYPES = [
  RELATION_FAMILY,
  RELATION_FRIENDSHIP,
  RELATION_ALLIANCE,
  RELATION_ROMANCE,
  RELATION_EMPLOYER,
  RELATION_RIVALRY,
  RELATION_DEBT,
  RELATION_ENMITY,
  RELATION_OTHER
]

export const RELATION_TYPE_META = {
  [RELATION_FAMILY]: { label: 'Famille', emoji: '👨‍👩‍👧' },
  [RELATION_FRIENDSHIP]: { label: 'Amitié', emoji: '🤝' },
  [RELATION_ALLIANCE]: { label: 'Alliance', emoji: '⚔️' },
  [RELATION_ROMANCE]: { label: 'Romance', emoji: '💕' },
  [RELATION_EMPLOYER]: { label: 'Employeur', emoji: '💼' },
  [RELATION_RIVALRY]: { label: 'Rivalité', emoji: '🔥' },
  [RELATION_DEBT]: { label: 'Dette', emoji: '💰' },
  [RELATION_ENMITY]: { label: 'Inimitié', emoji: '⛔' },
  [RELATION_OTHER]: { label: 'Autre', emoji: '🔗' }
}

// ── Helpers ──────────────────────────────────────────────

/**
 * Valide un statut NPC.
 * @param {string} status
 * @returns {boolean}
 */
export function isValidStatus(status) {
  return ALL_NPC_STATUSES.includes(status)
}

/**
 * Valide une disposition.
 * @param {number} disposition
 * @returns {boolean}
 */
export function isValidDisposition(disposition) {
  return ALL_DISPOSITIONS.includes(disposition)
}

/**
 * Valide un type de relation.
 * @param {string} type
 * @returns {boolean}
 */
export function isValidRelationType(type) {
  return ALL_RELATION_TYPES.includes(type)
}

/**
 * Crée un objet PNJ par défaut.
 * @param {Partial<object>} overrides
 * @returns {object}
 */
export function createDefaultNpc(overrides = {}) {
  return {
    id: '',
    name: '',
    title: '',
    description: '',
    personality: '',
    motives: '',
    tactics: '',
    location: '',
    faction: '',
    status: NPC_STATUS_NEUTRAL,
    difficulty: null,
    notes: '',
    pcRelations: [],
    npcRelations: [],
    // ── Profil combat ──
    // Mode : 'none' | 'linked' | 'custom'
    combatProfileMode: 'none',
    // Mode linked : lié à un adversaire SRD/homebrew
    linkedAdversaryId: null,
    // Mode custom : profil combat sur mesure
    adversaryType: null,
    tier: null,
    proficiency: null,
    combatFeatures: [],
    // ── Build (identité narrative, optionnel) ──
    classId: null,
    subclassId: null,
    level: null,
    domainCards: [],
    // Métadonnées
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}
