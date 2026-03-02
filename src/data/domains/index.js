/**
 * @module domains/data
 * @description Les 9 domaines officiels du SRD Daggerheart avec cartes complètes.
 * Source : DomainCards_SRD.pdf
 *
 * Architecture modulaire : chaque domaine est dans son propre fichier.
 * Les domaines sont importés et agrégés ici.
 */

import { arcana } from './arcana.js'
import { blade } from './blade.js'
import { bone } from './bone.js'
import { codex } from './codex.js'
import { grace } from './grace.js'
import { midnight } from './midnight.js'
import { sage } from './sage.js'
import { splendor } from './splendor.js'
import { valor } from './valor.js'

/** Types de cartes de domaine */
export const CARD_TYPES = {
  spell: 'Spell',
  grimoire: 'Grimoire',
  ability: 'Ability'
}

/** Niveaux de rappel (recall cost) */
export const RECALL_COSTS = {
  0: 'Free',
  1: '1 Hope',
  2: '2 Hope',
  3: '3 Hope',
  4: '4 Hope'
}

/**
 * Les 9 domaines officiels.
 * Chaque domaine inclut toutes ses cartes (21 par domaine, 189 au total).
 */
export const DOMAINS = [arcana, blade, bone, codex, grace, midnight, sage, splendor, valor]

/**
 * Retourne un domaine par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getDomainById(id) {
  return DOMAINS.find((d) => d.id === id) || null
}

/**
 * Retourne les domaines associés à une classe.
 * @param {string} className
 * @returns {Object[]}
 */
export function getDomainsForClass(className) {
  return DOMAINS.filter((d) => d.classes.includes(className))
}

/**
 * Retourne toutes les cartes d'un domaine.
 * @param {string} domainId
 * @returns {Object[]}
 */
export function getCardsForDomain(domainId) {
  const domain = getDomainById(domainId)
  return domain ? domain.cards : []
}

/**
 * Retourne une carte par ID (recherche dans tous les domaines).
 * @param {string} cardId
 * @returns {Object|null}
 */
export function getCardById(cardId) {
  for (const domain of DOMAINS) {
    const card = domain.cards.find((c) => c.id === cardId)
    if (card) return { ...card, domain: domain.id }
  }
  return null
}

/**
 * Retourne toutes les cartes filtrées par niveau.
 * @param {number} level
 * @returns {Object[]}
 */
export function getCardsByLevel(level) {
  const results = []
  for (const domain of DOMAINS) {
    for (const card of domain.cards) {
      if (card.level === level) {
        results.push({ ...card, domain: domain.id })
      }
    }
  }
  return results
}

/**
 * Retourne toutes les cartes filtrées par type.
 * @param {string} type - 'spell', 'ability', ou 'grimoire'
 * @returns {Object[]}
 */
export function getCardsByType(type) {
  const results = []
  for (const domain of DOMAINS) {
    for (const card of domain.cards) {
      if (card.type === type) {
        results.push({ ...card, domain: domain.id })
      }
    }
  }
  return results
}
