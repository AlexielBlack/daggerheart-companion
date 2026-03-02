import { describe, it, expect } from 'vitest'
import { COMMUNITIES, getCommunityById, searchCommunities } from '../index.js'

// ── Données de référence SRD (Communities_SRD.pdf) ──

const EXPECTED_IDS = [
  'highborne',
  'loreborne',
  'orderborne',
  'ridgeborne',
  'seaborne',
  'slyborne',
  'underborne',
  'wanderborne',
  'wildborne'
]

/** Noms de features officiels (Communities_SRD.pdf) */
const EXPECTED_FEATURES = {
  highborne: 'Privilege',
  loreborne: 'Well-Read',
  orderborne: 'Dedicated',
  ridgeborne: 'Steady',
  seaborne: 'Know the Tide',
  slyborne: 'Scoundrel',
  underborne: 'Low-Light Living',
  wanderborne: 'Nomadic Pack',
  wildborne: 'Lightfoot'
}

/** Nombre d'adjectifs par communauté (SRD : 6) */
const EXPECTED_ADJECTIVE_COUNT = 6

// ── Structure des données ───────────────────────────────

describe('Communities — structure de données', () => {
  it.each(COMMUNITIES.map((c) => [c.id, c]))(
    '%s a tous les champs requis',
    (_id, community) => {
      expect(community).toHaveProperty('id')
      expect(community).toHaveProperty('name')
      expect(community).toHaveProperty('emoji')
      expect(community).toHaveProperty('source')
      expect(community).toHaveProperty('description')
      expect(community).toHaveProperty('feature')
      expect(community.feature).toHaveProperty('name')
      expect(community.feature).toHaveProperty('description')
      expect(community).toHaveProperty('adjectives')
      expect(community).toHaveProperty('flavor')
    }
  )

  it('pas d\'IDs dupliqués', () => {
    const ids = COMMUNITIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('les descriptions ne sont pas vides', () => {
    for (const community of COMMUNITIES) {
      expect(community.description.length).toBeGreaterThan(20)
      expect(community.feature.description.length).toBeGreaterThan(10)
    }
  })

  it.each(COMMUNITIES.map((c) => [c.id, c]))(
    '%s a exactement 6 adjectifs',
    (_id, community) => {
      expect(community.adjectives).toHaveLength(EXPECTED_ADJECTIVE_COUNT)
      for (const adj of community.adjectives) {
        expect(typeof adj).toBe('string')
        expect(adj.length).toBeGreaterThan(0)
      }
    }
  )

  it('toutes les communautés sont source "srd"', () => {
    for (const community of COMMUNITIES) {
      expect(community.source).toBe('srd')
    }
  })
})

// ── Complétude SRD ──────────────────────────────────────

describe('Communities — complétude SRD', () => {
  it('contient les 9 communautés officielles', () => {
    expect(COMMUNITIES).toHaveLength(9)
  })

  it.each(EXPECTED_IDS)('contient la communauté : %s', (id) => {
    const found = COMMUNITIES.find((c) => c.id === id)
    expect(found).toBeDefined()
  })
})

// ── Noms de features ────────────────────────────────────

describe('Communities — noms de features SRD', () => {
  it.each(Object.entries(EXPECTED_FEATURES))(
    '%s a la feature "%s"',
    (id, featureName) => {
      const community = COMMUNITIES.find((c) => c.id === id)
      expect(community).toBeDefined()
      expect(community.feature.name).toBe(featureName)
    }
  )
})

// ── getCommunityById ────────────────────────────────────

describe('getCommunityById', () => {
  it('retourne une communauté existante', () => {
    const result = getCommunityById('highborne')
    expect(result).toBeDefined()
    expect(result.name).toBe('Highborne')
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
    expect(searchCommunities('')).toHaveLength(9)
    expect(searchCommunities(null)).toHaveLength(9)
    expect(searchCommunities(undefined)).toHaveLength(9)
  })

  it('filtre par nom', () => {
    const results = searchCommunities('Highborne')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results[0].id).toBe('highborne')
  })

  it('filtre par nom de feature', () => {
    const results = searchCommunities('Lightfoot')
    expect(results.length).toBe(1)
    expect(results[0].id).toBe('wildborne')
  })

  it('filtre par adjectif', () => {
    const results = searchCommunities('conniving')
    expect(results.length).toBe(1)
    expect(results[0].id).toBe('highborne')
  })

  it('est insensible à la casse', () => {
    const results = searchCommunities('SCOUNDREL')
    expect(results.length).toBe(1)
    expect(results[0].id).toBe('slyborne')
  })

  it('retourne un tableau vide si rien ne correspond', () => {
    expect(searchCommunities('xyzinexistant')).toHaveLength(0)
  })
})
