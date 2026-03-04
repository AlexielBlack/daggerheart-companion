/**
 * @module ancestries/__tests__
 * @description Tests d'intégrité structurelle et logique des ancestries.
 *
 * Vérifications SRD valeur-par-valeur supprimées.
 * On conserve : structure des champs, unicité IDs, fonctions utilitaires, combinaison.
 */

import { describe, it, expect } from 'vitest'
import {
  SRD_ANCESTRIES,
  CUSTOM_ANCESTRIES,
  TRANSFORMATIONS,
  ALL_ANCESTRIES,
  getAncestryById,
  getTransformationById
} from '../index.js'

// ── Structure des données ───────────────────────────────

describe('Ancestries — intégrité structurelle', () => {
  const allEntries = [...SRD_ANCESTRIES, ...CUSTOM_ANCESTRIES, ...TRANSFORMATIONS]

  it('contient des ancestries SRD, custom et transformations', () => {
    expect(SRD_ANCESTRIES.length).toBeGreaterThan(0)
    expect(CUSTOM_ANCESTRIES.length).toBeGreaterThan(0)
    expect(TRANSFORMATIONS.length).toBeGreaterThan(0)
  })

  it('chaque entrée a les champs requis', () => {
    allEntries.forEach((entry) => {
      const fields = ['id', 'name', 'emoji', 'source', 'description', 'topFeature', 'bottomFeature']
      fields.forEach((field) => {
        expect(entry, `${entry.id} manque "${field}"`).toHaveProperty(field)
      })
      expect(entry.topFeature).toHaveProperty('name')
      expect(entry.topFeature).toHaveProperty('description')
      expect(entry.bottomFeature).toHaveProperty('name')
      expect(entry.bottomFeature).toHaveProperty('description')
    })
  })

  it('pas d\'IDs dupliqués dans ALL_ANCESTRIES', () => {
    const ids = ALL_ANCESTRIES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('pas d\'IDs dupliqués dans TRANSFORMATIONS', () => {
    const ids = TRANSFORMATIONS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('les descriptions ne sont pas vides', () => {
    allEntries.forEach((entry) => {
      expect(entry.description.length, `${entry.id} description vide`).toBeGreaterThan(10)
      expect(entry.topFeature.description.length, `${entry.id} topFeature vide`).toBeGreaterThan(10)
      expect(entry.bottomFeature.description.length, `${entry.id} bottomFeature vide`).toBeGreaterThan(10)
    })
  })

  it('les sources sont valides', () => {
    SRD_ANCESTRIES.forEach((a) => expect(a.source).toBe('srd'))
    CUSTOM_ANCESTRIES.forEach((a) => expect(a.source).toBe('custom'))
    TRANSFORMATIONS.forEach((t) => expect(t.source).toBe('transformation'))
  })
})

// ── Fonctions utilitaires ───────────────────────────────

describe('getAncestryById', () => {
  it('retourne un SRD ancestry', () => {
    const result = getAncestryById('elf')
    expect(result).toBeDefined()
    expect(result.name).toBe('Elf')
  })

  it('retourne un custom ancestry', () => {
    const result = getAncestryById('ael')
    expect(result).toBeDefined()
    expect(result.source).toBe('custom')
  })

  it('retourne null pour un ID inconnu', () => {
    expect(getAncestryById('inexistant')).toBeNull()
  })
})

describe('getTransformationById', () => {
  it('retourne une transformation', () => {
    const result = getTransformationById('vampire')
    expect(result).toBeDefined()
    expect(result.source).toBe('transformation')
  })

  it('retourne null pour un ID inconnu', () => {
    expect(getTransformationById('inexistant')).toBeNull()
  })
})

// ── ALL_ANCESTRIES combine bien SRD + Custom ────────────

describe('ALL_ANCESTRIES', () => {
  it('combine SRD et Custom (pas les Transformations)', () => {
    expect(ALL_ANCESTRIES).toHaveLength(SRD_ANCESTRIES.length + CUSTOM_ANCESTRIES.length)
  })

  it('ne contient pas les transformations', () => {
    TRANSFORMATIONS.forEach((t) => {
      expect(ALL_ANCESTRIES.find((a) => a.id === t.id)).toBeUndefined()
    })
  })
})
