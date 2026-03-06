/**
 * @file npcConstants.test.js
 * @description Tests des constantes et validateurs du module PNJ.
 */

import { describe, it, expect } from 'vitest'
import {
  ALL_NPC_STATUSES,
  NPC_STATUS_META,
  NPC_STATUS_NEUTRAL,
  NPC_STATUS_ALLY,
  NPC_STATUS_HOSTILE,
  NPC_STATUS_DEAD,
  NPC_STATUS_MISSING,
  ALL_DISPOSITIONS,
  DISPOSITION_META,
  DISPOSITION_HOSTILE,
  DISPOSITION_ALLIED,
  ALL_RELATION_TYPES,
  RELATION_TYPE_META,
  isValidStatus,
  isValidDisposition,
  isValidRelationType,
  createDefaultNpc
} from '../constants.js'

describe('NPC Constants', () => {
  describe('Statuts', () => {
    it('contient 5 statuts', () => {
      expect(ALL_NPC_STATUSES).toHaveLength(5)
    })

    it('chaque statut a des métadonnées complètes', () => {
      for (const status of ALL_NPC_STATUSES) {
        const meta = NPC_STATUS_META[status]
        expect(meta).toBeDefined()
        expect(meta.label).toBeTruthy()
        expect(meta.emoji).toBeTruthy()
        expect(meta.color).toBeTruthy()
      }
    })

    it('isValidStatus accepte les statuts valides', () => {
      expect(isValidStatus(NPC_STATUS_NEUTRAL)).toBe(true)
      expect(isValidStatus(NPC_STATUS_ALLY)).toBe(true)
      expect(isValidStatus(NPC_STATUS_HOSTILE)).toBe(true)
      expect(isValidStatus(NPC_STATUS_DEAD)).toBe(true)
      expect(isValidStatus(NPC_STATUS_MISSING)).toBe(true)
    })

    it('isValidStatus refuse les statuts invalides', () => {
      expect(isValidStatus('zombie')).toBe(false)
      expect(isValidStatus('')).toBe(false)
      expect(isValidStatus(null)).toBe(false)
    })
  })

  describe('Dispositions', () => {
    it('contient 5 niveaux de disposition', () => {
      expect(ALL_DISPOSITIONS).toHaveLength(5)
    })

    it('va de -2 (hostile) à +2 (allié)', () => {
      expect(DISPOSITION_HOSTILE).toBe(-2)
      expect(DISPOSITION_ALLIED).toBe(2)
    })

    it('chaque disposition a des métadonnées', () => {
      for (const disp of ALL_DISPOSITIONS) {
        const meta = DISPOSITION_META[disp]
        expect(meta).toBeDefined()
        expect(meta.label).toBeTruthy()
      }
    })

    it('isValidDisposition valide correctement', () => {
      expect(isValidDisposition(-2)).toBe(true)
      expect(isValidDisposition(0)).toBe(true)
      expect(isValidDisposition(2)).toBe(true)
      expect(isValidDisposition(3)).toBe(false)
      expect(isValidDisposition(-3)).toBe(false)
    })
  })

  describe('Types de relation', () => {
    it('contient 9 types de relation', () => {
      expect(ALL_RELATION_TYPES).toHaveLength(9)
    })

    it('chaque type a des métadonnées', () => {
      for (const type of ALL_RELATION_TYPES) {
        const meta = RELATION_TYPE_META[type]
        expect(meta).toBeDefined()
        expect(meta.label).toBeTruthy()
        expect(meta.emoji).toBeTruthy()
      }
    })

    it('isValidRelationType valide correctement', () => {
      expect(isValidRelationType('family')).toBe(true)
      expect(isValidRelationType('rivalry')).toBe(true)
      expect(isValidRelationType('bestie')).toBe(false)
    })
  })

  describe('createDefaultNpc', () => {
    it('retourne un objet avec les champs par défaut', () => {
      const npc = createDefaultNpc()
      expect(npc.name).toBe('')
      expect(npc.status).toBe(NPC_STATUS_NEUTRAL)
      expect(npc.difficulty).toBeNull()
      expect(npc.pcRelations).toEqual([])
      expect(npc.npcRelations).toEqual([])
      expect(npc.combatProfileMode).toBe('none')
      expect(npc.linkedAdversaryId).toBeNull()
      expect(npc.adversaryType).toBeNull()
      expect(npc.tier).toBeNull()
      expect(npc.proficiency).toBeNull()
      expect(npc.combatFeatures).toEqual([])
      expect(npc.combatStats).toBeDefined()
      expect(npc.combatStats.difficulty).toBeNull()
      expect(npc.combatStats.hp).toBeNull()
      expect(npc.combatStats.attackDamageType).toBe('phy')
      expect(npc.classId).toBeNull()
      expect(npc.domainCards).toEqual([])
    })

    it('accepte des overrides', () => {
      const npc = createDefaultNpc({ name: 'Gareth', status: NPC_STATUS_HOSTILE })
      expect(npc.name).toBe('Gareth')
      expect(npc.status).toBe(NPC_STATUS_HOSTILE)
      expect(npc.title).toBe('')
    })
  })
})
