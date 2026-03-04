/**
 * @module data/statModifiers
 * @description Moteur centralisé de calcul des bonus de stats.
 *
 * Certaines ascendances, sous-classes et cartes de domaine confèrent
 * des bonus permanents ou conditionnels aux stats du personnage.
 * Ce module déclare les modificateurs d'ascendance/sous-classe et fournit
 * une fonction de calcul qui agrège tous les bonus applicables.
 *
 * Sources : OfficialAncestries_SRD.pdf, OfficialClasses_SRD.pdf,
 *           CustomAncestries.txt, CustomClass_Assassin.pdf, CustomClass_Duellist.rtf,
 *           DomainCards_SRD.pdf
 */

import {
  DOMAIN_CARD_MODIFIERS,
  isTouchedActive
} from '@data/domainCardModifiers'
import { getCardById } from '@data/domains'

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
 * - featurePosition : 'top' | 'bottom' → indique quel feature déclenche le bonus
 *                     (utilisé par Mixed Ancestry pour n'appliquer le bonus que
 *                     si le bon feature est sélectionné)
 */
export const ANCESTRY_MODIFIERS = {
  // SRD — Giant : "Endurance: Gain an additional Hit Point slot at character creation."
  giant: {
    maxHP: 1,
    featurePosition: 'top',
    source: 'Endurance (Giant)'
  },

  // SRD — Human : "High Stamina: Gain an additional Stress slot at character creation."
  human: {
    maxStress: 1,
    featurePosition: 'top',
    source: 'High Stamina (Human)'
  },

  // SRD — Simiah : "Nimble: Gain a permanent +1 bonus to your Evasion at character creation."
  simiah: {
    evasion: 1,
    featurePosition: 'bottom',
    source: 'Nimble (Simiah)'
  },

  // SRD — Galapa : "Shell: Gain a bonus to your damage thresholds equal to your Proficiency."
  galapa: {
    thresholdsFn: 'proficiency',
    featurePosition: 'top',
    source: 'Shell (Galapa)'
  },

  // Custom — Skjalma : "Tu gagnes un PV supplémentaire à la création du personnage."
  skjalma: {
    maxHP: 1,
    featurePosition: 'top',
    source: 'Endurance (Skjalma)'
  },

  // Custom — Plassédien·ne : "Gagne un emplacement de Stress supplémentaire à la création."
  plassedien: {
    maxStress: 1,
    featurePosition: 'top',
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
 * Inclut les champs pour les bonus de cartes de domaine.
 * @returns {Object}
 */
function emptyBonuses() {
  return {
    // Stats de base (ascendance/sous-classe/cartes)
    maxHP: 0,
    maxStress: 0,
    evasion: 0,
    thresholds: { major: 0, severe: 0 },
    // Bonus de combat (cartes de domaine)
    armorScore: 0,
    armorScoreOverride: null,    // Bare Bones : remplace le score d'armure
    thresholdsOverride: null,    // Bare Bones : remplace les seuils de base
    proficiency: 0,              // Bonus de proficiency globale
    proficiencyDamage: 0,        // Bonus de proficiency dégâts uniquement
    damageBonus: 0,              // Bonus fixe aux dégâts
    spellcastBonus: 0,           // Bonus aux Spellcast Rolls
    attackBonus: 0,              // Bonus aux jets d'attaque
    rollBonus: 0,                // Bonus à un jet quelconque (Notorious)
    traitBonus: null,            // { agility: N, ... } bonus aux traits
    immuneMinor: false,          // Immunité aux dégâts Minor
    disableArmor: false,         // Frenzy : pas d'Armor Slots
    attackAdvantage: false,      // Avantage aux attaques
    presenceOverride: false,     // Overwhelming Aura
    sources: []
  }
}

/**
 * Applique un modificateur individuel au cumul de bonus.
 * Supporte les champs classiques (HP, Stress, Évasion, Seuils)
 * et les champs de combat étendus (armorScore, proficiency, traits, etc.).
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
  // ── Champs étendus (cartes de domaine) ──
  if (mod.armorScore) {
    bonuses.armorScore += mod.armorScore
  }
  if (mod.armorScoreOverride !== null && mod.armorScoreOverride !== undefined) {
    bonuses.armorScoreOverride = mod.armorScoreOverride
  }
  if (mod.thresholdsOverride) {
    bonuses.thresholdsOverride = { ...mod.thresholdsOverride }
  }
  if (mod.proficiency) {
    bonuses.proficiency += mod.proficiency
  }
  if (mod.proficiencyDamage) {
    bonuses.proficiencyDamage += mod.proficiencyDamage
  }
  if (mod.damageBonus) {
    bonuses.damageBonus += mod.damageBonus
  }
  if (mod.spellcastBonus) {
    bonuses.spellcastBonus += mod.spellcastBonus
  }
  if (mod.attackBonus) {
    bonuses.attackBonus += mod.attackBonus
  }
  if (mod.rollBonus) {
    bonuses.rollBonus += mod.rollBonus
  }
  if (mod.traitBonus) {
    if (!bonuses.traitBonus) bonuses.traitBonus = {}
    for (const [trait, value] of Object.entries(mod.traitBonus)) {
      bonuses.traitBonus[trait] = (bonuses.traitBonus[trait] || 0) + value
    }
  }
  if (mod.immuneMinor) {
    bonuses.immuneMinor = true
  }
  if (mod.disableArmor) {
    bonuses.disableArmor = true
  }
  if (mod.attackAdvantage) {
    bonuses.attackAdvantage = true
  }
  if (mod.presenceOverride) {
    bonuses.presenceOverride = true
  }
  if (mod.source) {
    bonuses.sources.push(mod.source)
  }
}

/**
 * Calcule tous les bonus de stats applicables pour un personnage donné.
 * Agrège : ascendance + sous-classe + cartes de domaine (loadout).
 *
 * @param {Object} char - Personnage complet
 * @returns {Object} Objet bonus agrégé avec tous les champs étendus
 */
export function computeStatBonuses(char) {
  const bonuses = emptyBonuses()

  if (!char) return bonuses

  // ── Bonus d'ascendance ───────────────────────────────
  if (char.ancestryId === 'mixed-ancestry') {
    // Mixed Ancestry : appliquer les modificateurs des ascendances parentes
    // seulement si le feature correspondant est sélectionné
    const config = char.mixedAncestryConfig
    if (config) {
      const ancestryIds = [config.ancestry1Id, config.ancestry2Id].filter(Boolean)
      for (const aId of ancestryIds) {
        const mod = ANCESTRY_MODIFIERS[aId]
        if (!mod) continue
        // Vérifier que le bon feature est sélectionné pour cette ascendance
        const isTopSelected = config.topFeatureSource === aId
        const isBottomSelected = config.bottomFeatureSource === aId
        if (mod.featurePosition === 'top' && isTopSelected) {
          applyModifier(bonuses, mod, char)
        } else if (mod.featurePosition === 'bottom' && isBottomSelected) {
          applyModifier(bonuses, mod, char)
        }
      }
    }
  } else if (char.ancestryId && ANCESTRY_MODIFIERS[char.ancestryId]) {
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

  // ── Bonus des cartes de domaine ──────────────────────
  const loadout = char.domainCards?.loadout || []
  const activeEffects = char.activeEffects || {}

  for (const cardId of loadout) {
    const mod = DOMAIN_CARD_MODIFIERS[cardId]
    if (!mod || !mod.compute) continue

    let shouldApply = false

    switch (mod.type) {
      case 'passive':
        // Toujours actif dans le loadout
        shouldApply = true
        break

      case 'conditional':
        // Actif si la condition de fiche est remplie
        shouldApply = typeof mod.isActive === 'function' && mod.isActive(char)
        break

      case 'touched':
        // Actif si 4+ cartes du domaine dans le loadout
        shouldApply = isTouchedActive(mod, loadout, getCardById)
        // Si la carte a aussi un toggle (Sage-Touched en env. naturel)
        if (shouldApply && mod.hasToggle) {
          shouldApply = !!activeEffects[cardId]
        }
        break

      case 'toggle':
        // Actif seulement si le joueur a activé le toggle
        shouldApply = !!activeEffects[cardId]
        break

      case 'activable':
        // Actif seulement si le joueur l'a activé (temporaire)
        shouldApply = !!activeEffects[cardId]
        break

      // 'permanent' : géré séparément (modifie la fiche directement)
      default:
        break
    }

    if (shouldApply) {
      const result = mod.compute(char)
      if (result) {
        applyModifier(bonuses, result, char)
      }
    }
  }

  // ── Bonus permanents (cartes en vault après application) ──
  if (Array.isArray(char.permanentCardEffects)) {
    for (const effect of char.permanentCardEffects) {
      applyModifier(bonuses, effect, char)
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
    || bonuses.armorScore > 0
    || bonuses.armorScoreOverride !== null
    || bonuses.proficiency > 0
    || bonuses.spellcastBonus > 0
    || bonuses.attackBonus > 0
    || bonuses.traitBonus !== null
    || bonuses.immuneMinor
    || bonuses.disableArmor
}

/**
 * Exporte le registre pour usage externe (ex: ActiveModifiersPanel).
 */
export { DOMAIN_CARD_MODIFIERS } from '@data/domainCardModifiers'
