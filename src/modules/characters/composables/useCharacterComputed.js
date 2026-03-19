/**
 * @module characters/composables/useCharacterComputed
 * @description Fonction pure de résolution des stats effectives d'un personnage
 * et wrapper composable réactif pour usage dans les composants Vue.
 *
 * Autonome : ne dépend pas du characterStore. Utilise directement les
 * fonctions pures de @data/ pour résoudre classe, ascendance, équipement, etc.
 *
 * Utilisé par PcGroupPanel v2 pour résoudre les stats de TOUS les PJ
 * simultanément, sans passer par les getters du store (qui ne gèrent
 * que le personnage sélectionné).
 */

import { computed } from 'vue'
import { computeStatBonuses } from '@data/statModifiers'
import { getClassById } from '@data/classes'
import { getSubclassById } from '@data/subclasses'
import { getAncestryById } from '@data/ancestries'
import { getCommunityById } from '@data/communities'
import { getArmorById, getPrimaryWeaponById, getSecondaryWeaponById } from '@data/equipment'
import { getCardById } from '@data/domains'
import { useClassHomebrewStore } from '@modules/homebrew/categories/class/useClassHomebrewStore.js'

// ═══════════════════════════════════════════════════════════
//  RÉSOLUTION DE CLASSE (SRD + homebrew)
// ═══════════════════════════════════════════════════════════

/**
 * Résout une classe par ID : SRD d'abord, puis fallback homebrew.
 * Normalise les données homebrew au format attendu par les composants.
 *
 * @param {string} id - Identifiant de la classe
 * @returns {Object|null} Objet classe normalisé ou null
 */
function resolveClass(id) {
  if (!id) return null

  // SRD (rapide)
  const srd = getClassById(id)
  if (srd) return srd

  // Homebrew fallback
  const classHomebrewStore = useClassHomebrewStore()
  const hb = classHomebrewStore.items.find((c) => c.id === id)
  if (!hb) return null

  return {
    id: hb.id,
    name: hb.name,
    emoji: hb.emoji || '\u{1F6E0}\u{FE0F}',
    domains: hb.domains || [],
    baseEvasion: hb.baseEvasion || 10,
    baseHP: hb.baseHP || 6,
    baseStress: hb.baseStress || 6,
    hopeFeature: typeof hb.hopeFeature === 'object' && hb.hopeFeature
      ? `${hb.hopeFeature.name} : ${hb.hopeFeature.description}`
      : (hb.hopeFeature || ''),
    classFeatures: (hb.classFeatures || []).map(
      (f) => (typeof f === 'string' ? f : `${f.name} : ${f.description}`)
    ),
    source: 'custom'
  }
}

// ═══════════════════════════════════════════════════════════
//  RÉSOLUTION D'ASCENDANCE (incluant Mixed Ancestry)
// ═══════════════════════════════════════════════════════════

/**
 * Résout l'ascendance d'un personnage, y compris le cas Mixed Ancestry
 * où les features sont piochées dans deux ascendances parentes.
 *
 * @param {Object} pc - Objet personnage brut
 * @returns {Object|null} Objet ascendance résolu ou null
 */
function resolveAncestry(pc) {
  if (!pc || !pc.ancestryId) return null

  if (pc.ancestryId !== 'mixed-ancestry') {
    return getAncestryById(pc.ancestryId) || null
  }

  // Mixed Ancestry : construire un objet synthétique
  const config = pc.mixedAncestryConfig
  const base = getAncestryById('mixed-ancestry')
  if (!config) return base

  const a1 = config.ancestry1Id ? getAncestryById(config.ancestry1Id) : null
  const a2 = config.ancestry2Id ? getAncestryById(config.ancestry2Id) : null

  let feature1 = base.topFeature
  let feature2 = base.bottomFeature

  if (a1 && config.ancestry1Feature) {
    feature1 = config.ancestry1Feature === 'top' ? a1.topFeature : a1.bottomFeature
  }
  if (a2 && config.ancestry2Feature) {
    feature2 = config.ancestry2Feature === 'top' ? a2.topFeature : a2.bottomFeature
  }

  const names = [a1, a2].filter(Boolean).map((a) => a.name)
  const label = names.length > 0 ? `Mixed (${names.join(' / ')})` : 'Mixed Ancestry'

  return {
    ...base,
    name: label,
    topFeature: feature1,
    bottomFeature: feature2,
    _resolved: true,
    _ancestry1: a1,
    _ancestry2: a2,
    _config: config
  }
}

// ═══════════════════════════════════════════════════════════
//  FONCTION PURE — RÉSOLUTION COMPLÈTE
// ═══════════════════════════════════════════════════════════

/**
 * Résout toutes les stats effectives et données de référence d'un personnage.
 * Fonction pure : prend un objet PC brut, retourne un objet enrichi.
 *
 * @param {Object} pc - Objet personnage brut (depuis le store ou le localStorage)
 * @returns {Object} Objet enrichi avec stats effectives et données résolues
 */
export function resolveCharacterDisplay(pc) {
  // Garde : personnage null ou undefined → valeurs par défaut
  if (!pc) {
    return {
      effectiveMaxHP: 6,
      effectiveMaxStress: 6,
      effectiveEvasion: 0,
      effectiveArmorScore: 0,
      thresholds: { major: 0, severe: 0 },
      statBonuses: computeStatBonuses(null),
      classData: null,
      subclassData: null,
      ancestryData: null,
      communityData: null,
      armorData: null,
      primaryWeaponData: null,
      secondaryWeaponData: null,
      loadoutCards: [],
      vaultCards: []
    }
  }

  // ── Bonus de stats (ascendance + sous-classe + cartes) ──
  const statBonuses = computeStatBonuses(pc)

  // ── Données de classe ──
  const classData = resolveClass(pc.classId)
  const baseHP = classData ? classData.baseHP : 6
  const baseStress = classData ? classData.baseStress : 6

  // ── Stats effectives ──
  const effectiveMaxHP = baseHP + statBonuses.maxHP
  const effectiveMaxStress = baseStress + statBonuses.maxStress
  const effectiveEvasion = (pc.evasion || 0) + (pc.evasionBonus || 0) + statBonuses.evasion

  // Score d'armure effectif : override (Bare Bones) ou base + bonus
  let effectiveArmorScore
  if (statBonuses.armorScoreOverride !== null) {
    effectiveArmorScore = statBonuses.armorScoreOverride + statBonuses.armorScore
  } else {
    effectiveArmorScore = (pc.armorScore || 0) + statBonuses.armorScore
  }

  // Seuils de dégâts : override (Bare Bones) ou base armure + level + bonus
  let thresholds
  if (statBonuses.thresholdsOverride) {
    thresholds = {
      major: statBonuses.thresholdsOverride.major + statBonuses.thresholds.major,
      severe: statBonuses.thresholdsOverride.severe + statBonuses.thresholds.severe
    }
  } else {
    thresholds = {
      major: (pc.armorBaseThresholds?.major || 0) + (pc.level || 1) + statBonuses.thresholds.major,
      severe: (pc.armorBaseThresholds?.severe || 0) + (pc.level || 1) + statBonuses.thresholds.severe
    }
  }

  // ── Données de référence résolues ──
  const subclassData = getSubclassById(pc.classId, pc.subclassId) || null
  const ancestryData = resolveAncestry(pc)
  const communityData = getCommunityById(pc.communityId) || null
  const armorData = getArmorById(pc.armorId) || null
  const primaryWeaponData = getPrimaryWeaponById(pc.primaryWeaponId) || null
  const secondaryWeaponData = getSecondaryWeaponById(pc.secondaryWeaponId) || null

  // ── Cartes de domaine du loadout et vault ──
  const loadoutCards = (pc.domainCards?.loadout || [])
    .map(getCardById)
    .filter(Boolean)
  const vaultCards = (pc.domainCards?.vault || [])
    .map(getCardById)
    .filter(Boolean)

  return {
    ...pc,
    effectiveMaxHP,
    effectiveMaxStress,
    effectiveEvasion,
    effectiveArmorScore,
    thresholds,
    statBonuses,
    classData,
    subclassData,
    ancestryData,
    communityData,
    armorData,
    primaryWeaponData,
    secondaryWeaponData,
    loadoutCards,
    vaultCards
  }
}

// ═══════════════════════════════════════════════════════════
//  WRAPPER COMPOSABLE RÉACTIF
// ═══════════════════════════════════════════════════════════

/**
 * Composable réactif qui résout les stats d'un personnage.
 * Recalcule automatiquement quand la ref change.
 *
 * @param {import('vue').Ref<Object|null>} charRef - Ref vers un objet personnage
 * @returns {{ resolved: import('vue').ComputedRef<Object|null> }}
 */
export function useCharacterComputed(charRef) {
  const resolved = computed(() => {
    if (!charRef.value) return null
    return resolveCharacterDisplay(charRef.value)
  })
  return { resolved }
}
