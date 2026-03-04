/**
 * @module subclasses/__tests__
 * @description Tests d'intégrité structurelle et logique des sous-classes.
 *
 * Vérifications SRD (noms, traits, contenu spécifique) supprimées.
 * On conserve : structure, unicité, schéma, fonctions utilitaires.
 */

import { describe, it, expect } from 'vitest'
import {
  SUBCLASSES,
  getSubclassesForClass,
  getSubclassById
} from '../index.js'

const allSubclasses = Object.values(SUBCLASSES).flat()
const classIds = Object.keys(SUBCLASSES)

// ── Structure ───────────────────────────────────────────

describe('SUBCLASSES — intégrité structurelle', () => {
  it('contient des classes avec des sous-classes', () => {
    expect(classIds.length).toBeGreaterThan(0)
  })

  it('chaque classe a au moins 2 sous-classes', () => {
    classIds.forEach((classId) => {
      expect(SUBCLASSES[classId].length, `${classId}`).toBeGreaterThanOrEqual(2)
    })
  })

  it('IDs uniques parmi toutes les sous-classes', () => {
    const ids = allSubclasses.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque sous-classe a le schéma requis', () => {
    const validTraits = [null, 'Agility', 'Strength', 'Finesse', 'Instinct', 'Presence', 'Knowledge']

    allSubclasses.forEach((sub) => {
      // Champs de base
      expect(typeof sub.id, `${sub.id} id`).toBe('string')
      expect(sub.id.length).toBeGreaterThan(0)
      expect(typeof sub.name, `${sub.id} name`).toBe('string')
      expect(sub.name.length).toBeGreaterThan(0)
      expect(typeof sub.description, `${sub.id} description`).toBe('string')
      expect(sub.description.length).toBeGreaterThan(0)

      // Spellcast trait
      expect(validTraits, `${sub.id} spellcastTrait "${sub.spellcastTrait}"`).toContain(sub.spellcastTrait)

      // Progression tiers (foundation, specialization, mastery)
      // Format FeatureDescriptor : { name, description, tags }
      const tiers = ['foundation', 'specialization', 'mastery']
      tiers.forEach((tier) => {
        expect(Array.isArray(sub[tier]), `${sub.id} ${tier} est un tableau`).toBe(true)
        expect(sub[tier].length, `${sub.id} ${tier} non vide`).toBeGreaterThanOrEqual(1)
        sub[tier].forEach((entry, i) => {
          expect(typeof entry, `${sub.id} ${tier}[${i}] doit être un objet`).toBe('object')
          expect(typeof entry.name, `${sub.id} ${tier}[${i}].name`).toBe('string')
          expect(entry.name.length, `${sub.id} ${tier}[${i}].name non vide`).toBeGreaterThan(0)
          expect(typeof entry.description, `${sub.id} ${tier}[${i}].description`).toBe('string')
          expect(entry.description.length, `${sub.id} ${tier}[${i}].description non vide`).toBeGreaterThan(0)
          expect(Array.isArray(entry.tags), `${sub.id} ${tier}[${i}].tags est un tableau`).toBe(true)
          expect(entry.tags.length, `${sub.id} ${tier}[${i}].tags non vide`).toBeGreaterThan(0)
        })
      })
    })
  })
})

// ── Fonctions utilitaires ──────────────────────────────

describe('getSubclassesForClass', () => {
  it('retourne les sous-classes d\'une classe existante', () => {
    const firstClass = classIds[0]
    const result = getSubclassesForClass(firstClass)
    expect(result.length).toBeGreaterThanOrEqual(2)
    result.forEach((s) => {
      expect(s).toHaveProperty('id')
      expect(s).toHaveProperty('name')
    })
  })

  it('retourne un tableau vide pour une classe inconnue', () => {
    expect(getSubclassesForClass('inexistant')).toEqual([])
  })
})

describe('getSubclassById', () => {
  it('retourne la bonne sous-classe', () => {
    const firstClass = classIds[0]
    const firstSub = SUBCLASSES[firstClass][0]
    const result = getSubclassById(firstClass, firstSub.id)
    expect(result).not.toBeNull()
    expect(result.id).toBe(firstSub.id)
    expect(result.name).toBe(firstSub.name)
  })

  it('retourne null pour un id inexistant', () => {
    expect(getSubclassById(classIds[0], 'inexistant')).toBeNull()
  })

  it('retourne null pour une classe inexistante', () => {
    expect(getSubclassById('inexistant', 'stalwart')).toBeNull()
  })
})
