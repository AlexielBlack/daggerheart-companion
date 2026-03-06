/**
 * @file npcCombat.test.js
 * @description Tests du profil combat PNJ :
 * persistence combatProfileMode, linkedAdversaryId,
 * adversaryType, tier, proficiency, combatFeatures.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNpcStore } from '../stores/npcStore.js'

describe('NPC Combat', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useNpcStore()
  })

  describe('Création avec profil combat', () => {
    it('crée un PNJ en mode linked avec adversaire lié', () => {
      const result = store.create({
        name: 'Gareth le Bandit',
        combatProfileMode: 'linked',
        linkedAdversaryId: 'jagged-knife-bandit'
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.combatProfileMode).toBe('linked')
      expect(npc.linkedAdversaryId).toBe('jagged-knife-bandit')
    })

    it('crée un PNJ en mode custom avec type et tier', () => {
      const result = store.create({
        name: 'Capitaine Voss',
        combatProfileMode: 'custom',
        adversaryType: 'leader',
        tier: 2,
        proficiency: 2,
        combatFeatures: ['feat-tactician', 'feat-momentum']
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.combatProfileMode).toBe('custom')
      expect(npc.adversaryType).toBe('leader')
      expect(npc.tier).toBe(2)
      expect(npc.proficiency).toBe(2)
      expect(npc.combatFeatures).toEqual(['feat-tactician', 'feat-momentum'])
    })

    it('crée un PNJ sans combat par défaut (mode none)', () => {
      const result = store.create({ name: 'Marchand' })

      const npc = store.getById(result.id)
      expect(npc.combatProfileMode).toBe('none')
      expect(npc.linkedAdversaryId).toBeNull()
      expect(npc.adversaryType).toBeNull()
      expect(npc.tier).toBeNull()
      expect(npc.combatFeatures).toEqual([])
    })
  })

  describe('Mise à jour combat', () => {
    let npcId

    beforeEach(() => {
      const result = store.create({ name: 'Gareth' })
      npcId = result.id
    })

    it('passe de none à linked', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'linked',
        linkedAdversaryId: 'merchant'
      })

      const npc = store.getById(npcId)
      expect(npc.combatProfileMode).toBe('linked')
      expect(npc.linkedAdversaryId).toBe('merchant')
    })

    it('passe de linked à none', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'linked',
        linkedAdversaryId: 'merchant'
      })

      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'none',
        linkedAdversaryId: null
      })

      const npc = store.getById(npcId)
      expect(npc.combatProfileMode).toBe('none')
      expect(npc.linkedAdversaryId).toBeNull()
    })

    it('passe de none à custom avec features', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'custom',
        adversaryType: 'bruiser',
        tier: 1,
        proficiency: 1,
        combatFeatures: ['feat-heavy-hitter']
      })

      const npc = store.getById(npcId)
      expect(npc.combatProfileMode).toBe('custom')
      expect(npc.adversaryType).toBe('bruiser')
      expect(npc.tier).toBe(1)
      expect(npc.combatFeatures).toEqual(['feat-heavy-hitter'])
    })

    it('change l\'adversaire lié', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'linked',
        linkedAdversaryId: 'merchant'
      })

      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'linked',
        linkedAdversaryId: 'village-elder'
      })

      const npc = store.getById(npcId)
      expect(npc.linkedAdversaryId).toBe('village-elder')
    })

    it('met à jour les combat features', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'custom',
        adversaryType: 'skulk',
        tier: 2,
        combatFeatures: ['feat-ambush']
      })

      store.update(npcId, {
        name: 'Gareth',
        combatProfileMode: 'custom',
        adversaryType: 'skulk',
        tier: 2,
        combatFeatures: ['feat-ambush', 'feat-vanish']
      })

      const npc = store.getById(npcId)
      expect(npc.combatFeatures).toEqual(['feat-ambush', 'feat-vanish'])
    })
  })

  describe('Duplication avec combat', () => {
    it('duplique un PNJ en mode linked', () => {
      const original = store.create({
        name: 'Assassin',
        combatProfileMode: 'linked',
        linkedAdversaryId: 'jagged-knife-shadow'
      })

      const dupe = store.duplicate(original.id)
      const npc = store.getById(dupe.id)
      expect(npc.combatProfileMode).toBe('linked')
      expect(npc.linkedAdversaryId).toBe('jagged-knife-shadow')
    })

    it('duplique un PNJ en mode custom', () => {
      const original = store.create({
        name: 'Chef des gardes',
        combatProfileMode: 'custom',
        adversaryType: 'leader',
        tier: 2,
        proficiency: 2,
        combatFeatures: ['feat-tactician', 'feat-momentum']
      })

      const dupe = store.duplicate(original.id)
      const npc = store.getById(dupe.id)
      expect(npc.combatProfileMode).toBe('custom')
      expect(npc.adversaryType).toBe('leader')
      expect(npc.tier).toBe(2)
      expect(npc.combatFeatures).toEqual(['feat-tactician', 'feat-momentum'])
    })
  })

  describe('Import/Export avec combat', () => {
    it('exporte et réimporte un PNJ en mode linked', () => {
      store.create({
        name: 'Garde',
        combatProfileMode: 'linked',
        linkedAdversaryId: 'jagged-knife-bandit'
      })

      const json = store.exportNpcs()
      store.clearAll()

      const result = store.importNpcs(json)
      expect(result.success).toBe(true)

      const npc = store.npcs[0]
      expect(npc.combatProfileMode).toBe('linked')
      expect(npc.linkedAdversaryId).toBe('jagged-knife-bandit')
    })

    it('exporte et réimporte un PNJ en mode custom', () => {
      store.create({
        name: 'Éclaireur',
        combatProfileMode: 'custom',
        adversaryType: 'skulk',
        tier: 1,
        proficiency: 1,
        combatFeatures: ['feat-ambush']
      })

      const json = store.exportNpcs()
      store.clearAll()

      const result = store.importNpcs(json)
      expect(result.success).toBe(true)

      const npc = store.npcs[0]
      expect(npc.combatProfileMode).toBe('custom')
      expect(npc.adversaryType).toBe('skulk')
      expect(npc.combatFeatures).toEqual(['feat-ambush'])
    })
  })

  describe('Build + Combat combinés', () => {
    it('crée un PNJ avec build ET profil linked', () => {
      const result = store.create({
        name: 'Capitaine de la garde',
        classId: 'guardian',
        subclassId: 'stalwart',
        level: 4,
        domainCards: ['valor-courageous-strike'],
        combatProfileMode: 'linked',
        linkedAdversaryId: 'jagged-knife-lieutenant'
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.classId).toBe('guardian')
      expect(npc.level).toBe(4)
      expect(npc.domainCards).toEqual(['valor-courageous-strike'])
      expect(npc.combatProfileMode).toBe('linked')
      expect(npc.linkedAdversaryId).toBe('jagged-knife-lieutenant')
    })

    it('crée un PNJ avec build ET profil custom', () => {
      const result = store.create({
        name: 'Mage mercenaire',
        classId: 'sorcerer',
        level: 5,
        combatProfileMode: 'custom',
        adversaryType: 'ranged',
        tier: 3,
        proficiency: 3,
        combatFeatures: ['feat-chain-lightning']
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.classId).toBe('sorcerer')
      expect(npc.combatProfileMode).toBe('custom')
      expect(npc.adversaryType).toBe('ranged')
      expect(npc.tier).toBe(3)
    })
  })
})
