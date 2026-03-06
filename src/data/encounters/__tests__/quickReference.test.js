import { describe, it, expect } from 'vitest'
import { QUICK_REFERENCE_SECTIONS } from '../quickReference.js'

describe('quickReference — validation des donnees SRD', () => {
  it('QUICK_REFERENCE_SECTIONS est un tableau de 7 sections', () => {
    expect(Array.isArray(QUICK_REFERENCE_SECTIONS)).toBe(true)
    expect(QUICK_REFERENCE_SECTIONS).toHaveLength(7)
  })

  it('chaque section a un id, title, emoji et items', () => {
    for (const section of QUICK_REFERENCE_SECTIONS) {
      expect(section).toHaveProperty('id')
      expect(section).toHaveProperty('title')
      expect(section).toHaveProperty('emoji')
      expect(section).toHaveProperty('items')
      expect(typeof section.id).toBe('string')
      expect(typeof section.title).toBe('string')
      expect(typeof section.emoji).toBe('string')
      expect(Array.isArray(section.items)).toBe(true)
    }
  })

  it('chaque section a des items non vides', () => {
    for (const section of QUICK_REFERENCE_SECTIONS) {
      expect(section.items.length).toBeGreaterThan(0)
    }
  })

  it('chaque item a term et description (strings non vides)', () => {
    for (const section of QUICK_REFERENCE_SECTIONS) {
      for (const item of section.items) {
        expect(typeof item.term).toBe('string')
        expect(item.term.length).toBeGreaterThan(0)
        expect(typeof item.description).toBe('string')
        expect(item.description.length).toBeGreaterThan(0)
      }
    }
  })

  it('les 7 categories attendues sont presentes', () => {
    const expectedIds = [
      'roll-results',
      'conditions',
      'ranges',
      'damage-thresholds',
      'adversary-types',
      'scene-modes',
      'countdown-advancement'
    ]
    const actualIds = QUICK_REFERENCE_SECTIONS.map(s => s.id)
    for (const id of expectedIds) {
      expect(actualIds).toContain(id)
    }
  })

  it('tous les IDs de section sont uniques', () => {
    const ids = QUICK_REFERENCE_SECTIONS.map(s => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  describe('resultats de jets (roll-results)', () => {
    const section = QUICK_REFERENCE_SECTIONS.find(s => s.id === 'roll-results')

    it('a exactement 5 items', () => {
      expect(section.items).toHaveLength(5)
    })

    it('couvre critique, succes+hope, succes+fear, echec+hope, echec+fear', () => {
      const terms = section.items.map(i => i.term)
      expect(terms.some(t => t.includes('Critique'))).toBe(true)
      expect(terms.some(t => t.includes('Hope') && t.includes('Succ'))).toBe(true)
      expect(terms.some(t => t.includes('Fear') && t.includes('Succ'))).toBe(true)
      expect(terms.some(t => t.includes('Hope') && t.includes('chec'))).toBe(true)
      expect(terms.some(t => t.includes('Fear') && t.includes('chec'))).toBe(true)
    })
  })

  it('conditions a au moins 3 items', () => {
    const section = QUICK_REFERENCE_SECTIONS.find(s => s.id === 'conditions')
    expect(section.items.length).toBeGreaterThanOrEqual(3)
  })

  it('portees a exactement 6 items', () => {
    const section = QUICK_REFERENCE_SECTIONS.find(s => s.id === 'ranges')
    expect(section.items).toHaveLength(6)
  })

  it('types d\'adversaires a au moins 5 items', () => {
    const section = QUICK_REFERENCE_SECTIONS.find(s => s.id === 'adversary-types')
    expect(section.items.length).toBeGreaterThanOrEqual(5)
  })

  it('modes de scene a au moins 3 items', () => {
    const section = QUICK_REFERENCE_SECTIONS.find(s => s.id === 'scene-modes')
    expect(section.items.length).toBeGreaterThanOrEqual(3)
  })
})
