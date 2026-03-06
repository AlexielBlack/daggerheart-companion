/**
 * @module npcs/combatFeatureCatalogue
 * @description Catalogue complet de combat features pour PNJs.
 *
 * Phase 4 — Extraction complète :
 *  - 265 features extraites des 129 adversaires (tiers 1-4)
 *  - 129 cartes de domaine offensives/défensives converties (9 domaines)
 *
 * Données générées par scripts/extractAdversaryFeatures.js
 * et stockées en JSON pour faciliter la maintenance.
 *
 * API publique :
 *  - ADVERSARY_FEATURES     : features d'adversaires
 *  - DOMAIN_CARD_FEATURES   : cartes de domaine converties
 *  - ALL_COMBAT_FEATURES    : catalogue unifié
 *  - getFeatureById()       : recherche par ID
 *  - filterFeatures()       : filtrage multi-critères
 *  - groupByActivationType(): groupement P/A/R
 */

import adversaryData from './data/adversaryFeatures.json'
import domainCardData from './data/domainCardFeatures.json'

// ═══════════════════════════════════════════════════════════
//  Données
// ═══════════════════════════════════════════════════════════

/** 265 features extraites des 129 adversaires SRD */
export const ADVERSARY_FEATURES = adversaryData

/** 129 cartes de domaine offensives/défensives converties */
export const DOMAIN_CARD_FEATURES = domainCardData

/** Catalogue complet : 394 features */
export const ALL_COMBAT_FEATURES = [...ADVERSARY_FEATURES, ...DOMAIN_CARD_FEATURES]

// ═══════════════════════════════════════════════════════════
//  Index par ID (pour lookups rapides)
// ═══════════════════════════════════════════════════════════

const _indexById = new Map()
for (const f of ALL_COMBAT_FEATURES) {
  _indexById.set(f.id, f)
}

// ═══════════════════════════════════════════════════════════
//  API publique
// ═══════════════════════════════════════════════════════════

/**
 * Recherche une feature par ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getFeatureById(id) {
  return _indexById.get(id) || null
}

/**
 * Filtre les features par critères multiples.
 * @param {object} filters
 * @param {string} [filters.source] - 'adversary' | 'domain_card' | 'homebrew'
 * @param {number} [filters.tier] - Filtre ≤ tier donné
 * @param {string} [filters.activationType] - 'action' | 'reaction' | 'passive'
 * @param {string[]} [filters.tags] - Au moins un tag doit matcher
 * @param {string[]} [filters.themes] - Au moins un thème doit matcher
 * @param {string} [filters.search] - Recherche textuelle (nom, description)
 * @returns {object[]}
 */
export function filterFeatures(filters = {}) {
  let result = ALL_COMBAT_FEATURES

  if (filters.source) {
    result = result.filter(f => f.source === filters.source)
  }

  if (filters.tier) {
    result = result.filter(f => f.tier <= filters.tier)
  }

  if (filters.activationType) {
    result = result.filter(f => f.activationType === filters.activationType)
  }

  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    result = result.filter(f =>
      f.tags.some(t => filters.tags.includes(t))
    )
  }

  if (Array.isArray(filters.themes) && filters.themes.length > 0) {
    result = result.filter(f =>
      f.themes.some(t => filters.themes.includes(t))
    )
  }

  if (filters.search && typeof filters.search === 'string') {
    const q = filters.search.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
    )
  }

  return result
}

/**
 * Retourne les features groupées par type d'activation.
 * @param {object[]} features
 * @returns {{ passives: object[], actions: object[], reactions: object[] }}
 */
export function groupByActivationType(features) {
  return {
    passives: features.filter(f => f.activationType === 'passive'),
    actions: features.filter(f => f.activationType === 'action'),
    reactions: features.filter(f => f.activationType === 'reaction')
  }
}
