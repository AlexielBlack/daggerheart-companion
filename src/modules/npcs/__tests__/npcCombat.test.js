/**
 * @file npcCombat.test.js
 * @description Tests du profil combat PNJ :
 * persistence combatEnabled / linkedAdversaryId dans le store.
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

  describe('Création avec combat', () => {
    it('crée un PNJ avec combat activé et adversaire lié', () => {
      const result = store.create({
        name: 'Gareth le Bandit',
        combatEnabled: true,
        linkedAdversaryId: 'jagged-knife-bandit'
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.combatEnabled).toBe(true)
      expect(npc.linkedAdversaryId).toBe('jagged-knife-bandit')
    })

    it('crée un PNJ sans combat par défaut', () => {
      const result = store.create({ name: 'Marchand' })

      const npc = store.getById(result.id)
      expect(npc.combatEnabled).toBe(false)
      expect(npc.linkedAdversaryId).toBeNull()
    })
  })

  describe('Mise à jour combat', () => {
    let npcId

    beforeEach(() => {
      const result = store.create({ name: 'Gareth' })
      npcId = result.id
    })

    it('active le combat et lie un adversaire', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatEnabled: true,
        linkedAdversaryId: 'merchant'
      })

      const npc = store.getById(npcId)
      expect(npc.combatEnabled).toBe(true)
      expect(npc.linkedAdversaryId).toBe('merchant')
    })

    it('désactive le combat', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatEnabled: true,
        linkedAdversaryId: 'merchant'
      })

      store.update(npcId, {
        name: 'Gareth',
        combatEnabled: false,
        linkedAdversaryId: null
      })

      const npc = store.getById(npcId)
      expect(npc.combatEnabled).toBe(false)
      expect(npc.linkedAdversaryId).toBeNull()
    })

    it('change l\'adversaire lié', () => {
      store.update(npcId, {
        name: 'Gareth',
        combatEnabled: true,
        linkedAdversaryId: 'merchant'
      })

      store.update(npcId, {
        name: 'Gareth',
        combatEnabled: true,
        linkedAdversaryId: 'village-elder'
      })

      const npc = store.getById(npcId)
      expect(npc.linkedAdversaryId).toBe('village-elder')
    })
  })

  describe('Duplication avec combat', () => {
    it('duplique un PNJ avec profil combat', () => {
      const original = store.create({
        name: 'Assassin',
        combatEnabled: true,
        linkedAdversaryId: 'jagged-knife-shadow'
      })

      const dupe = store.duplicate(original.id)
      const npc = store.getById(dupe.id)
      expect(npc.combatEnabled).toBe(true)
      expect(npc.linkedAdversaryId).toBe('jagged-knife-shadow')
    })
  })

  describe('Import/Export avec combat', () => {
    it('exporte et réimporte un PNJ avec combat', () => {
      store.create({
        name: 'Garde',
        combatEnabled: true,
        linkedAdversaryId: 'jagged-knife-bandit'
      })

      const json = store.exportNpcs()
      store.clearAll()

      const result = store.importNpcs(json)
      expect(result.success).toBe(true)

      const npc = store.npcs[0]
      expect(npc.combatEnabled).toBe(true)
      expect(npc.linkedAdversaryId).toBe('jagged-knife-bandit')
    })
  })

  describe('Build + Combat combinés', () => {
    it('crée un PNJ avec build ET combat', () => {
      const result = store.create({
        name: 'Capitaine de la garde',
        classId: 'guardian',
        subclassId: 'stalwart',
        level: 4,
        domainCards: ['valor-courageous-strike'],
        combatEnabled: true,
        linkedAdversaryId: 'jagged-knife-lieutenant'
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.classId).toBe('guardian')
      expect(npc.level).toBe(4)
      expect(npc.domainCards).toEqual(['valor-courageous-strike'])
      expect(npc.combatEnabled).toBe(true)
      expect(npc.linkedAdversaryId).toBe('jagged-knife-lieutenant')
    })
  })
})
