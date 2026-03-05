/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import {
  SCENE_MODES,
  SCENE_MODE_PC_ATTACK,
  SCENE_MODE_ADVERSARY_ATTACK,
  SCENE_MODE_META,
  SPOTLIGHT_PC,
  SPOTLIGHT_GM,
  isValidSceneMode
} from '@data/encounters/liveConstants'

describe('liveConstants', () => {
  describe('SCENE_MODES', () => {
    it('contient 2 modes actifs', () => {
      expect(SCENE_MODES).toHaveLength(2)
    })

    it('contient les 2 modes attendus', () => {
      expect(SCENE_MODES).toContain(SCENE_MODE_PC_ATTACK)
      expect(SCENE_MODES).toContain(SCENE_MODE_ADVERSARY_ATTACK)
    })
  })

  describe('SCENE_MODE_META', () => {
    it('chaque mode a des métadonnées complètes', () => {
      for (const mode of SCENE_MODES) {
        const meta = SCENE_MODE_META[mode]
        expect(meta).toBeDefined()
        expect(meta.label).toBeTruthy()
        expect(meta.emoji).toBeTruthy()
        expect(meta.color).toBeTruthy()
        expect(meta.description).toBeTruthy()
        expect(Array.isArray(meta.primaryTags)).toBe(true)
        expect(meta.primaryTags.length).toBeGreaterThan(0)
        expect(Array.isArray(meta.secondaryTags)).toBe(true)
        expect(Array.isArray(meta.primaryActivation)).toBe(true)
        expect(['pc', 'adversary']).toContain(meta.actorRole)
        expect(['pc', 'adversary']).toContain(meta.targetRole)
      }
    })

    it('pcAttack priorise les tags offensifs', () => {
      expect(SCENE_MODE_META[SCENE_MODE_PC_ATTACK].primaryTags).toContain('offensif')
    })

    it('adversaryAttack priorise les tags défensifs', () => {
      expect(SCENE_MODE_META[SCENE_MODE_ADVERSARY_ATTACK].primaryTags).toContain('défensif')
    })
  })

  describe('constantes spotlight', () => {
    it('SPOTLIGHT_PC et SPOTLIGHT_GM sont différents', () => {
      expect(SPOTLIGHT_PC).not.toBe(SPOTLIGHT_GM)
    })
  })

  describe('isValidSceneMode', () => {
    it('valide les modes existants', () => {
      for (const mode of SCENE_MODES) {
        expect(isValidSceneMode(mode)).toBe(true)
      }
    })

    it('rejette les modes invalides', () => {
      expect(isValidSceneMode('invalid')).toBe(false)
      expect(isValidSceneMode('')).toBe(false)
      expect(isValidSceneMode(null)).toBe(false)
    })

    it('rejette social et traversal', () => {
      expect(isValidSceneMode('social')).toBe(false)
      expect(isValidSceneMode('traversal')).toBe(false)
    })
  })
})
