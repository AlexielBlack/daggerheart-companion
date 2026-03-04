/**
 * @module communities/__tests__
 * @description Tests d'intégrité structurelle et logique des communautés.
 *
 * Vérifications SRD (IDs, noms de features, comptages) supprimées.
 * On conserve : structure, unicité, fonctions utilitaires (recherche, filtre).
 */

import { describe, it, expect } from 'vitest'
import { COMMUNITIES, getCommunityById, searchCommunities } from '../index.js'

// ── Structure des données ───────────────────────────────

describe('Communities — intégrité structurelle', () => {
  it('contient des communautés', () => {
    expect(COMMUNITIES.length).toBeGreaterThan(0)
  })

  it('chaque communauté a les champs requis', () => {
    COMMUNITIES.forEach((c) => {
      const fields = ['id', 'name', 'emoji', 'source', 'description', 'feature', 'adjectives', 'flavor']
      fields.forEach((field) => {
        expect(c, `${c.id} manque "${field}"`).toHaveProperty(field)
      })
      expect(c.feature).toHaveProperty('name')
      expect(c.feature).toHaveProperty('description')
    })
  })

  it('pas d\'IDs dupliqués', () => {
    const ids = COMMUNITIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('les descriptions ne sont pas vides', () => {
    COMMUNITIES.forEach((c) => {
      expect(c.description.length, `${c.id} description vide`).toBeGreaterThan(20)
      expect(c.feature.description.length, `${c.id} feature description vide`).toBeGreaterThan(10)
    })
  })

  it('les adjectifs sont des tableaux de chaînes non vides', () => {
    COMMUNITIES.forEach((c) => {
      expect(Array.isArray(c.adjectives), `${c.id} adjectives`).toBe(true)
      expect(c.adjectives.length, `${c.id} doit avoir des adjectifs`).toBeGreaterThan(0)
      c.adjectives.forEach((adj) => {
        expect(typeof adj).toBe('string')
        expect(adj.length).toBeGreaterThan(0)
      })
    })
  })
})

// ── getCommunityById ────────────────────────────────────

describe('getCommunityById', () => {
  it('retourne une communauté existante', () => {
    const first = COMMUNITIES[0]
    const result = getCommunityById(first.id)
    expect(result).toBeDefined()
    expect(result.id).toBe(first.id)
  })

  it('retourne null pour un ID inexistant', () => {
    expect(getCommunityById('inexistant')).toBeNull()
  })

  it('retourne null pour un input invalide', () => {
    expect(getCommunityById(null)).toBeNull()
    expect(getCommunityById(undefined)).toBeNull()
    expect(getCommunityById('')).toBeNull()
    expect(getCommunityById(42)).toBeNull()
  })
})

// ── searchCommunities ───────────────────────────────────

describe('searchCommunities', () => {
  it('retourne toutes les communautés sans query', () => {
    expect(searchCommunities('')).toHaveLength(COMMUNITIES.length)
    expect(searchCommunities(null)).toHaveLength(COMMUNITIES.length)
    expect(searchCommunities(undefined)).toHaveLength(COMMUNITIES.length)
  })

  it('filtre par nom', () => {
    const first = COMMUNITIES[0]
    const results = searchCommunities(first.name)
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].id).toBe(first.id)
  })

  it('filtre par nom de feature', () => {
    const withFeature = COMMUNITIES.find((c) => c.feature.name.length > 3)
    const results = searchCommunities(withFeature.feature.name)
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.id === withFeature.id)).toBe(true)
  })

  it('est insensible à la casse', () => {
    const first = COMMUNITIES[0]
    const results = searchCommunities(first.name.toUpperCase())
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('retourne un tableau vide si rien ne correspond', () => {
    expect(searchCommunities('xyzinexistant')).toHaveLength(0)
  })
})
