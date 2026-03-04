/**
 * @module encounter/composables/useEncounterFeatures
 * @description Cerveau du filtrage contextuel des features pour le mode live play.
 *
 * Pour un PJ donné + mode de scène actif :
 *  1. Collecte TOUTES les features du personnage (classe, sous-classe, ascendance,
 *     communauté, domain cards du loadout)
 *  2. Normalise vers un format commun (FeatureDescriptor enrichi)
 *  3. Classe par priorité selon le mode de scène (primaryTags, secondaryTags, primaryActivation)
 *
 * Exposed refs :
 *  - allFeatures        : toutes les features collectées, non filtrées
 *  - primaryFeatures    : features d'action prioritaires pour ce mode
 *  - secondaryFeatures  : features secondaires (utiles mais pas prioritaires)
 *  - passiveFeatures    : features passives toujours actives
 *  - reactionFeatures   : réactions disponibles
 */

import { computed } from 'vue'
import { getClassById } from '@data/classes'
import { getSubclassById } from '@data/subclasses'
import { getAncestryById } from '@data/ancestries'
import { getCommunityById } from '@data/communities'
import { getCardById } from '@data/domains'
import { SCENE_MODE_META, SCENE_MODE_PC_ATTACK } from '@data/encounters/liveConstants'

// ═══════════════════════════════════════════════════════════
//  Sources de features
// ═══════════════════════════════════════════════════════════

/**
 * Normalise une feature brute vers le format enrichi.
 * @param {Object} raw - Feature brute depuis les données
 * @param {string} source - Identifiant de source ('class', 'subclass', 'ancestry', 'community', 'domain')
 * @param {string} sourceLabel - Label lisible ('Guardian', 'Stalwart', etc.)
 * @param {Object} [extra] - Champs supplémentaires à fusionner
 * @returns {Object} Feature normalisée
 */
function normalizeFeature(raw, source, sourceLabel, extra = {}) {
  return {
    name: raw.name || '—',
    description: raw.description || raw.feature || '',
    source,
    sourceLabel,
    tags: Array.isArray(raw.tags) ? [...raw.tags] : [],
    activationType: raw.activationType || 'passive',
    cost: raw.cost ? { ...raw.cost } : { type: 'free', amount: 0 },
    frequency: raw.frequency || null,
    range: raw.range || null,
    trigger: raw.trigger || null,
    trait: raw.trait || null,
    ...extra
  }
}

/**
 * Collecte les features de classe (hopeFeature + classFeatures).
 * @param {string} classId
 * @returns {Object[]}
 */
function collectClassFeatures(classId) {
  if (!classId) return []
  const cls = getClassById(classId)
  if (!cls) return []
  const result = []
  if (cls.hopeFeature) {
    result.push(normalizeFeature(cls.hopeFeature, 'class', cls.name, { isHopeFeature: true }))
  }
  if (Array.isArray(cls.classFeatures)) {
    for (const f of cls.classFeatures) {
      result.push(normalizeFeature(f, 'class', cls.name))
    }
  }
  return result
}

/**
 * Collecte les features de sous-classe, filtrées par progression.
 * @param {string} classId
 * @param {string} subclassId
 * @param {string} progression - 'foundation' | 'specialization' | 'mastery'
 * @returns {Object[]}
 */
function collectSubclassFeatures(classId, subclassId, progression) {
  if (!classId || !subclassId) return []
  const sub = getSubclassById(classId, subclassId)
  if (!sub) return []
  const result = []
  const tiers = ['foundation']
  if (progression === 'specialization' || progression === 'mastery') tiers.push('specialization')
  if (progression === 'mastery') tiers.push('mastery')
  for (const tier of tiers) {
    const features = sub[tier]
    if (!Array.isArray(features)) continue
    for (const f of features) {
      result.push(normalizeFeature(f, 'subclass', sub.name, { subclassTier: tier }))
    }
  }
  return result
}

/**
 * Collecte les features d'ascendance (topFeature + bottomFeature).
 * Gère Mixed Ancestry (1 top + 1 bottom de 2 ascendances différentes).
 * @param {Object} pc - Données PJ avec ancestryId, mixedAncestryData
 * @returns {Object[]}
 */
function collectAncestryFeatures(pc) {
  if (!pc) return []
  const result = []

  // Mixed Ancestry
  if (pc.ancestryId === 'mixed' && pc.mixedAncestryData) {
    const mixed = pc.mixedAncestryData
    if (mixed.firstAncestryId && mixed.firstFeatureSlot) {
      const anc = getAncestryById(mixed.firstAncestryId)
      if (anc) {
        const f = mixed.firstFeatureSlot === 'top' ? anc.topFeature : anc.bottomFeature
        if (f) result.push(normalizeFeature(f, 'ancestry', anc.name))
      }
    }
    if (mixed.secondAncestryId && mixed.secondFeatureSlot) {
      const anc = getAncestryById(mixed.secondAncestryId)
      if (anc) {
        const f = mixed.secondFeatureSlot === 'top' ? anc.topFeature : anc.bottomFeature
        if (f) result.push(normalizeFeature(f, 'ancestry', anc.name))
      }
    }
    return result
  }

  // Standard Ancestry
  const anc = getAncestryById(pc.ancestryId)
  if (!anc) return []
  if (anc.topFeature) result.push(normalizeFeature(anc.topFeature, 'ancestry', anc.name))
  if (anc.bottomFeature) result.push(normalizeFeature(anc.bottomFeature, 'ancestry', anc.name))
  return result
}

/**
 * Collecte la feature de communauté.
 * @param {string} communityId
 * @returns {Object[]}
 */
function collectCommunityFeatures(communityId) {
  if (!communityId) return []
  const comm = getCommunityById(communityId)
  if (!comm || !comm.feature) return []
  return [normalizeFeature(comm.feature, 'community', comm.name)]
}

/**
 * Collecte les features des domain cards du loadout.
 * @param {Object} domainCards - { loadout: string[], vault: string[] }
 * @returns {Object[]}
 */
function collectDomainCardFeatures(domainCards) {
  if (!domainCards || !Array.isArray(domainCards.loadout)) return []
  const result = []
  for (const cardId of domainCards.loadout) {
    const card = getCardById(cardId)
    if (!card) continue
    // Les domain cards stockent la feature en tant que string dans card.feature
    // mais les métadonnées (activationType, cost, tags…) sont au niveau carte
    result.push(normalizeFeature(
      {
        name: card.name,
        description: card.feature || '',
        tags: card.tags,
        activationType: card.activationType,
        cost: card.cost,
        frequency: card.frequency,
        range: card.range,
        trigger: card.trigger,
        trait: card.trait
      },
      'domain',
      card.domain || card.name,
      { cardId: card.id, cardLevel: card.level, cardType: card.type }
    ))
  }
  return result
}

// ═══════════════════════════════════════════════════════════
//  Scoring & Tri
// ═══════════════════════════════════════════════════════════

/**
 * Calcule le score de priorité d'une feature pour un mode de scène donné.
 * Plus le score est élevé, plus la feature est pertinente pour ce mode.
 * @param {Object} feature - Feature normalisée
 * @param {Object} modeMeta - SCENE_MODE_META[mode]
 * @returns {number}
 */
function computePriorityScore(feature, modeMeta) {
  let score = 0

  // Tags : correspondance avec les tags prioritaires du mode (+10 par tag primaire)
  if (Array.isArray(modeMeta.primaryTags)) {
    for (const tag of feature.tags) {
      if (modeMeta.primaryTags.includes(tag)) score += 10
    }
  }

  // Tags secondaires (+3)
  if (Array.isArray(modeMeta.secondaryTags)) {
    for (const tag of feature.tags) {
      if (modeMeta.secondaryTags.includes(tag)) score += 3
    }
  }

  // Activation type : correspondance avec l'activation primaire du mode (+5)
  if (Array.isArray(modeMeta.primaryActivation)) {
    if (modeMeta.primaryActivation.includes(feature.activationType)) score += 5
  }

  // Réactions sont toujours un peu utiles (+2)
  if (feature.activationType === 'reaction') score += 2

  // Features passives : léger bonus de base (+1)
  if (feature.activationType === 'passive') score += 1

  return score
}

// ═══════════════════════════════════════════════════════════
//  Composable principal
// ═══════════════════════════════════════════════════════════

/**
 * Composable de filtrage contextuel des features.
 *
 * @param {import('vue').Ref<Object|null>} pcRef - Ref vers les données PJ (depuis participantPcs ou characterStore)
 * @param {import('vue').Ref<string>} sceneModeRef - Ref vers le mode de scène actif
 * @param {import('vue').Ref<Object|null>} [characterRef] - Ref optionnelle vers le personnage complet (pour subclassProgression)
 * @returns {Object} Computed features classées
 */
export function useEncounterFeatures(pcRef, sceneModeRef, characterRef = null) {
  /**
   * Toutes les features du PJ, normalisées et non filtrées.
   */
  const allFeatures = computed(() => {
    const pc = pcRef.value
    if (!pc) return []

    // Récupérer la progression sous-classe depuis le personnage complet
    const progression = characterRef?.value?.subclassProgression || pc.subclassProgression || 'foundation'

    const features = [
      ...collectClassFeatures(pc.classId),
      ...collectSubclassFeatures(pc.classId, pc.subclassId, progression),
      ...collectAncestryFeatures(pc),
      ...collectCommunityFeatures(pc.communityId),
      ...collectDomainCardFeatures(pc.domainCards)
    ]
    return features
  })

  /**
   * Métadonnées du mode de scène actif.
   */
  const modeMeta = computed(() => {
    return SCENE_MODE_META[sceneModeRef.value] || SCENE_MODE_META[SCENE_MODE_PC_ATTACK]
  })

  /**
   * Features scorées et triées par priorité décroissante.
   */
  const scoredFeatures = computed(() => {
    const meta = modeMeta.value
    return allFeatures.value
      .map((f) => ({ ...f, _score: computePriorityScore(f, meta) }))
      .sort((a, b) => b._score - a._score)
  })

  /**
   * Features principales : actions prioritaires pour ce mode.
   * Critère : score > 0 ET (action ou reaction) ET au moins un tag primaire.
   */
  const primaryFeatures = computed(() => {
    const meta = modeMeta.value
    return scoredFeatures.value.filter((f) => {
      if (f.activationType === 'passive') return false
      return f.tags.some((t) => meta.primaryTags.includes(t))
    })
  })

  /**
   * Features secondaires : utiles mais pas prioritaires.
   * Critère : non passives, score > 0, pas déjà dans primary.
   */
  const secondaryFeatures = computed(() => {
    const meta = modeMeta.value
    const primarySet = new Set(primaryFeatures.value.map((f) => f.name + f.source))
    return scoredFeatures.value.filter((f) => {
      if (f.activationType === 'passive') return false
      const key = f.name + f.source
      if (primarySet.has(key)) return false
      return f.tags.some((t) =>
        meta.secondaryTags.includes(t) || meta.primaryTags.includes(t)
      ) || f._score > 0
    })
  })

  /**
   * Features passives : toujours actives, affichées en fond.
   */
  const passiveFeatures = computed(() => {
    return scoredFeatures.value.filter((f) => f.activationType === 'passive')
  })

  /**
   * Réactions disponibles (toutes, triées par score).
   */
  const reactionFeatures = computed(() => {
    return scoredFeatures.value.filter((f) => f.activationType === 'reaction')
  })

  /**
   * Nombre total de features collectées.
   */
  const featureCount = computed(() => allFeatures.value.length)

  return {
    allFeatures,
    scoredFeatures,
    primaryFeatures,
    secondaryFeatures,
    passiveFeatures,
    reactionFeatures,
    featureCount,
    modeMeta
  }
}

// ═══════════════════════════════════════════════════════════
//  Utilitaires exportés pour les tests et l'adversaire
// ═══════════════════════════════════════════════════════════

/**
 * Collecte les features d'un adversaire live, classées par type d'activation.
 * Contrairement aux features PJ, les features adversaire ne sont PAS filtrées
 * par le mode de scène : le MJ a besoin de voir TOUTES les features disponibles.
 * @param {Object} adversary - Adversaire live depuis le store
 * @returns {Object} { actionFeatures, passiveFeatures, reactionFeatures }
 */
export function classifyAdversaryFeatures(adversary) {
  if (!adversary || !Array.isArray(adversary.features)) {
    return { actionFeatures: [], passiveFeatures: [], reactionFeatures: [] }
  }

  const normalized = adversary.features.map((f) =>
    normalizeFeature(f, 'adversary', adversary.name)
  )

  return {
    actionFeatures: normalized.filter((f) => f.activationType === 'action'),
    passiveFeatures: normalized.filter((f) => f.activationType === 'passive'),
    reactionFeatures: normalized.filter((f) => f.activationType === 'reaction')
  }
}

// Exports utilitaires pour les tests unitaires
export {
  normalizeFeature,
  collectClassFeatures,
  collectSubclassFeatures,
  collectAncestryFeatures,
  collectCommunityFeatures,
  collectDomainCardFeatures,
  computePriorityScore
}
