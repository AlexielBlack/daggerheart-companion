/**
 * @module data/statModifiers
 * @description Moteur centralisé de calcul des bonus de stats.
 *
 * Certaines ascendances et sous-classes confèrent des bonus permanents
 * aux stats du personnage (maxHP, maxStress, évasion, seuils de dégâts).
 * Ce module déclare ces modificateurs et fournit une fonction de calcul
 * qui agrège tous les bonus applicables selon le personnage et son niveau.
 *
 * Sources : OfficialAncestries_SRD.pdf, OfficialClasses_SRD.pdf,
 *           CustomAncestries.txt, CustomClass_Assassin.pdf, CustomClass_Duellist.rtf
 */

// ═══════════════════════════════════════════════════════════
//  MODIFICATEURS D'ASCENDANCE
// ═══════════════════════════════════════════════════════════

/**
 * Bonus permanents conférés par les ascendances à la création.
 * Clé = ancestryId, valeur = objet de modificateurs.
 *
 * Types de modificateurs supportés :
 * - maxHP        : bonus fixe aux PV max
 * - maxStress    : bonus fixe au Stress max
 * - evasion      : bonus fixe à l'Évasion
 * - thresholds   : { major, severe } bonus fixes aux seuils
 * - thresholdsFn : 'proficiency' → bonus dynamique = proficiency du personnage
 */
export const ANCESTRY_MODIFIERS = {
  // SRD — Giant : "Endurance: Gain an additional Hit Point slot at character creation."
  giant: {
    maxHP: 1,
    source: 'Endurance (Giant)'
  },

  // SRD — Simiah : "Nimble: Gain a permanent +1 bonus to your Evasion at character creation."
  simiah: {
    evasion: 1,
    source: 'Nimble (Simiah)'
  },

  // SRD — Galapa : "Shell: Gain a bonus to your damage thresholds equal to your Proficiency."
  galapa: {
    thresholdsFn: 'proficiency',
    source: 'Shell (Galapa)'
  },

  // Custom — Skjalma : "Tu gagnes un PV supplémentaire à la création du personnage."
  skjalma: {
    maxHP: 1,
    source: 'Endurance (Skjalma)'
  },

  // Custom — Plassédien·ne : "Gagne un emplacement de Stress supplémentaire à la création."
  plassedien: {
    maxStress: 1,
    source: 'Endurance Élevée (Plassédien·ne)'
  }
}

// ═══════════════════════════════════════════════════════════
//  MODIFICATEURS DE SOUS-CLASSE
// ═══════════════════════════════════════════════════════════

/**
 * Bonus permanents conférés par les sous-classes, organisés par tier.
 * Clé = subclassId, valeur = { foundation, specialization, mastery }.
 * Chaque tier est un tableau de modificateurs (plusieurs bonus possibles).
 *
 * Le tier actif dépend du niveau du personnage :
 * - foundation    : toujours actif (niv. 1+)
 * - specialization: actif à partir du niv. 5
 * - mastery       : actif à partir du niv. 8
 *
 * Note importante : les bonus de seuils du Stalwart sont CUMULATIFS par tier
 * selon le SRD (Unwavering +1, Unrelenting +2, Undaunted +3 = total +6 au niv. 8+).
 */
export const SUBCLASS_MODIFIERS = {
  // Guardian — Stalwart : bonus progressifs aux seuils de dégâts
  stalwart: {
    foundation: [
      { thresholds: { major: 1, severe: 1 }, source: 'Unwavering (Stalwart)' }
    ],
    specialization: [
      { thresholds: { major: 2, severe: 2 }, source: 'Unrelenting (Stalwart)' }
    ],
    mastery: [
      { thresholds: { major: 3, severe: 3 }, source: 'Undaunted (Stalwart)' }
    ]
  },

  // Guardian — Vengeance : +1 emplacement de Stress
  vengeance: {
    foundation: [
      { maxStress: 1, source: 'At Ease (Vengeance)' }
    ]
  },

  // Wizard — School of War : +1 PV
  school_of_war: {
    foundation: [
      { maxHP: 1, source: 'Battlemage (School of War)' }
    ]
  },

  // Rogue — Nightwalker : +1 Évasion (mastery uniquement)
  nightwalker: {
    mastery: [
      { evasion: 1, source: 'Fleeting Shadow (Nightwalker)' }
    ]
  },

  // Seraph — Winged Sentinel : +4 seuil Sévère (mastery uniquement)
  winged_sentinel: {
    mastery: [
      { thresholds: { major: 0, severe: 4 }, source: 'Ascendant (Winged Sentinel)' }
    ]
  }
}

// ═══════════════════════════════════════════════════════════
//  MOTEUR DE CALCUL
// ═══════════════════════════════════════════════════════════

/**
 * Structure de base d'un objet bonus (tous les champs à 0).
 * @returns {{ maxHP: number, maxStress: number, evasion: number, thresholds: { major: number, severe: number }, sources: string[] }}
 */
function emptyBonuses() {
  return {
    maxHP: 0,
    maxStress: 0,
    evasion: 0,
    thresholds: { major: 0, severe: 0 },
    sources: []
  }
}

/**
 * Applique un modificateur individuel au cumul de bonus.
 * @param {Object} bonuses - Objet bonus mutable
 * @param {Object} mod - Modificateur à appliquer
 * @param {Object} char - Personnage (pour les bonus dynamiques)
 */
function applyModifier(bonuses, mod, char) {
  if (mod.maxHP) {
    bonuses.maxHP += mod.maxHP
  }
  if (mod.maxStress) {
    bonuses.maxStress += mod.maxStress
  }
  if (mod.evasion) {
    bonuses.evasion += mod.evasion
  }
  if (mod.thresholds) {
    bonuses.thresholds.major += mod.thresholds.major || 0
    bonuses.thresholds.severe += mod.thresholds.severe || 0
  }
  if (mod.thresholdsFn === 'proficiency') {
    const prof = char.proficiency || 1
    bonuses.thresholds.major += prof
    bonuses.thresholds.severe += prof
  }
  if (mod.source) {
    bonuses.sources.push(mod.source)
  }
}

/**
 * Calcule tous les bonus de stats applicables pour un personnage donné.
 *
 * @param {Object} char - Personnage complet (avec ancestryId, subclassId, level, proficiency)
 * @returns {{ maxHP: number, maxStress: number, evasion: number, thresholds: { major: number, severe: number }, sources: string[] }}
 */
export function computeStatBonuses(char) {
  const bonuses = emptyBonuses()

  if (!char) return bonuses

  // ── Bonus d'ascendance ───────────────────────────────
  if (char.ancestryId && ANCESTRY_MODIFIERS[char.ancestryId]) {
    applyModifier(bonuses, ANCESTRY_MODIFIERS[char.ancestryId], char)
  }

  // ── Bonus de sous-classe ─────────────────────────────
  if (char.subclassId && SUBCLASS_MODIFIERS[char.subclassId]) {
    const subMods = SUBCLASS_MODIFIERS[char.subclassId]
    const level = char.level || 1

    // Foundation : toujours actif
    if (subMods.foundation) {
      subMods.foundation.forEach((mod) => applyModifier(bonuses, mod, char))
    }

    // Specialization : actif à partir du niveau 5
    if (level >= 5 && subMods.specialization) {
      subMods.specialization.forEach((mod) => applyModifier(bonuses, mod, char))
    }

    // Mastery : actif à partir du niveau 8
    if (level >= 8 && subMods.mastery) {
      subMods.mastery.forEach((mod) => applyModifier(bonuses, mod, char))
    }
  }

  return bonuses
}

/**
 * Vérifie si un personnage a des bonus actifs (pour affichage conditionnel).
 * @param {Object} char
 * @returns {boolean}
 */
export function hasStatBonuses(char) {
  const bonuses = computeStatBonuses(char)
  return bonuses.maxHP > 0
    || bonuses.maxStress > 0
    || bonuses.evasion > 0
    || bonuses.thresholds.major > 0
    || bonuses.thresholds.severe > 0
}
