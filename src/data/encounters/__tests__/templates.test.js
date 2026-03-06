import { describe, it, expect } from 'vitest'
import { ENCOUNTER_TEMPLATES, filterTemplates } from '../templates.js'
import tier1 from '@data/adversaries/tier1.json'
import tier2 from '@data/adversaries/tier2.json'
import tier3 from '@data/adversaries/tier3.json'
import tier4 from '@data/adversaries/tier4.json'

// Construire le Set de tous les adversaryIds SRD existants
const allAdversaryIds = new Set([
  ...tier1.map((a) => a.id),
  ...tier2.map((a) => a.id),
  ...tier3.map((a) => a.id),
  ...tier4.map((a) => a.id)
])

const REQUIRED_FIELDS = [
  'id',
  'name',
  'description',
  'tier',
  'pcCount',
  'intensity',
  'tags',
  'adversarySlots'
]

const VALID_INTENSITIES = ['minor', 'standard', 'major', 'climactic']

describe('ENCOUNTER_TEMPLATES — validation des donnees', () => {
  it('est un tableau non vide de 21 elements', () => {
    expect(Array.isArray(ENCOUNTER_TEMPLATES)).toBe(true)
    expect(ENCOUNTER_TEMPLATES).toHaveLength(21)
  })

  it('chaque template possede tous les champs requis', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      for (const field of REQUIRED_FIELDS) {
        expect(template, `template "${template.id}" manque le champ "${field}"`).toHaveProperty(
          field
        )
      }
    }
  })

  it('tous les IDs sont uniques', () => {
    const ids = ENCOUNTER_TEMPLATES.map((t) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('des templates existent pour chaque tier (1, 2, 3, 4)', () => {
    const tiersPresents = new Set(ENCOUNTER_TEMPLATES.map((t) => t.tier))
    expect(tiersPresents.has(1)).toBe(true)
    expect(tiersPresents.has(2)).toBe(true)
    expect(tiersPresents.has(3)).toBe(true)
    expect(tiersPresents.has(4)).toBe(true)
  })

  it('pcCount est entre 2 et 8 pour chaque template', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      expect(
        template.pcCount,
        `template "${template.id}" a pcCount=${template.pcCount}`
      ).toBeGreaterThanOrEqual(2)
      expect(
        template.pcCount,
        `template "${template.id}" a pcCount=${template.pcCount}`
      ).toBeLessThanOrEqual(8)
    }
  })

  it('tier est entre 1 et 4 pour chaque template', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      expect(
        template.tier,
        `template "${template.id}" a tier=${template.tier}`
      ).toBeGreaterThanOrEqual(1)
      expect(
        template.tier,
        `template "${template.id}" a tier=${template.tier}`
      ).toBeLessThanOrEqual(4)
    }
  })

  it('tags est un tableau non vide pour chaque template', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      expect(Array.isArray(template.tags), `template "${template.id}" — tags n'est pas un tableau`).toBe(true)
      expect(
        template.tags.length,
        `template "${template.id}" a un tableau tags vide`
      ).toBeGreaterThan(0)
    }
  })

  it('adversarySlots est un tableau non vide avec adversaryId et quantity > 0', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      expect(
        Array.isArray(template.adversarySlots),
        `template "${template.id}" — adversarySlots n'est pas un tableau`
      ).toBe(true)
      expect(
        template.adversarySlots.length,
        `template "${template.id}" a un tableau adversarySlots vide`
      ).toBeGreaterThan(0)

      for (const slot of template.adversarySlots) {
        expect(
          slot,
          `template "${template.id}" — slot manque adversaryId`
        ).toHaveProperty('adversaryId')
        expect(
          slot,
          `template "${template.id}" — slot manque quantity`
        ).toHaveProperty('quantity')
        expect(
          typeof slot.adversaryId,
          `template "${template.id}" — adversaryId doit etre une string`
        ).toBe('string')
        expect(
          slot.adversaryId.length,
          `template "${template.id}" — adversaryId est vide`
        ).toBeGreaterThan(0)
        expect(
          slot.quantity,
          `template "${template.id}" — quantity doit etre > 0 pour "${slot.adversaryId}"`
        ).toBeGreaterThan(0)
      }
    }
  })

  it('tous les adversaryIds correspondent a des adversaires SRD existants', () => {
    const missing = []

    for (const template of ENCOUNTER_TEMPLATES) {
      for (const slot of template.adversarySlots) {
        if (!allAdversaryIds.has(slot.adversaryId)) {
          missing.push(`template "${template.id}" reference "${slot.adversaryId}" — introuvable dans les donnees SRD`)
        }
      }
    }

    expect(missing, missing.join('\n')).toHaveLength(0)
  })

  it('intensity est une valeur valide (minor, standard, major, climactic)', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      expect(
        VALID_INTENSITIES,
        `template "${template.id}" a une intensite invalide : "${template.intensity}"`
      ).toContain(template.intensity)
    }
  })

  it('environmentId est null ou une string non vide', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      if (template.environmentId !== null) {
        expect(typeof template.environmentId).toBe('string')
        expect(template.environmentId.length).toBeGreaterThan(0)
      }
    }
  })

  it('adjustments est un tableau pour chaque template', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      expect(
        Array.isArray(template.adjustments),
        `template "${template.id}" — adjustments n'est pas un tableau`
      ).toBe(true)
    }
  })

  it('notes est une string pour chaque template', () => {
    for (const template of ENCOUNTER_TEMPLATES) {
      expect(
        typeof template.notes,
        `template "${template.id}" — notes doit etre une string`
      ).toBe('string')
    }
  })
})

describe('filterTemplates — filtrage des templates', () => {
  it('retourne tous les templates sans filtre', () => {
    const result = filterTemplates()
    expect(result).toHaveLength(ENCOUNTER_TEMPLATES.length)
  })

  it('filtre par tier et retourne uniquement les templates du bon tier', () => {
    for (const tier of [1, 2, 3, 4]) {
      const result = filterTemplates({ tier })
      const expected = ENCOUNTER_TEMPLATES.filter((t) => t.tier === tier)
      expect(result).toHaveLength(expected.length)
      for (const t of result) {
        expect(t.tier).toBe(tier)
      }
    }
  })

  it('filtre par tag et retourne uniquement les templates avec ce tag', () => {
    const result = filterTemplates({ tag: 'boss' })
    expect(result.length).toBeGreaterThan(0)
    for (const t of result) {
      expect(t.tags).toContain('boss')
    }
  })

  it('retourne un tableau vide pour un tier inexistant', () => {
    const result = filterTemplates({ tier: 99 })
    expect(result).toHaveLength(0)
  })

  it('retourne un tableau vide pour un tag inexistant', () => {
    const result = filterTemplates({ tag: 'tag-inexistant-xyz' })
    expect(result).toHaveLength(0)
  })
})
