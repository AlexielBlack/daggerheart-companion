/**
 * @file npcBuild.test.js
 * @description Tests du système Build Lite pour PNJs :
 * persistence classe/sous-classe/niveau/cartes de domaine dans le store.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNpcStore } from '../stores/npcStore.js'

describe('NPC Build Lite', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useNpcStore()
  })

  describe('Création avec build', () => {
    it('crée un PNJ avec classe et niveau', () => {
      const result = store.create({
        name: 'Gareth',
        classId: 'guardian',
        level: 3
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.classId).toBe('guardian')
      expect(npc.level).toBe(3)
    })

    it('crée un PNJ avec classe, sous-classe et cartes de domaine', () => {
      const result = store.create({
        name: 'Elara',
        classId: 'bard',
        subclassId: 'wordsmith',
        level: 5,
        domainCards: ['splendor-reassurance', 'grace-healing-touch']
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.classId).toBe('bard')
      expect(npc.subclassId).toBe('wordsmith')
      expect(npc.level).toBe(5)
      expect(npc.domainCards).toEqual(['splendor-reassurance', 'grace-healing-touch'])
    })

    it('crée un PNJ sans build (tout à null/vide)', () => {
      const result = store.create({ name: 'Simple NPC' })

      const npc = store.getById(result.id)
      expect(npc.classId).toBeNull()
      expect(npc.subclassId).toBeNull()
      expect(npc.level).toBeNull()
      expect(npc.domainCards).toEqual([])
    })
  })

  describe('Mise à jour du build', () => {
    let npcId

    beforeEach(() => {
      const result = store.create({
        name: 'Gareth',
        classId: 'guardian',
        level: 2
      })
      npcId = result.id
    })

    it('met à jour la classe', () => {
      store.update(npcId, {
        name: 'Gareth',
        classId: 'warrior',
        level: 2
      })

      const npc = store.getById(npcId)
      expect(npc.classId).toBe('warrior')
    })

    it('met à jour le niveau', () => {
      store.update(npcId, {
        name: 'Gareth',
        classId: 'guardian',
        level: 7
      })

      const npc = store.getById(npcId)
      expect(npc.level).toBe(7)
    })

    it('met à jour les cartes de domaine', () => {
      store.update(npcId, {
        name: 'Gareth',
        classId: 'guardian',
        level: 2,
        domainCards: ['valor-courageous-strike', 'blade-cut-through']
      })

      const npc = store.getById(npcId)
      expect(npc.domainCards).toEqual(['valor-courageous-strike', 'blade-cut-through'])
    })

    it('peut retirer le build (remettre à null)', () => {
      store.update(npcId, {
        name: 'Gareth',
        classId: null,
        subclassId: null,
        level: null,
        domainCards: []
      })

      const npc = store.getById(npcId)
      expect(npc.classId).toBeNull()
      expect(npc.level).toBeNull()
      expect(npc.domainCards).toEqual([])
    })
  })

  describe('Duplication avec build', () => {
    it('duplique un PNJ et conserve le build', () => {
      const original = store.create({
        name: 'Elara',
        classId: 'bard',
        subclassId: 'wordsmith',
        level: 5,
        domainCards: ['splendor-reassurance']
      })

      const dupe = store.duplicate(original.id)
      expect(dupe.success).toBe(true)

      const npc = store.getById(dupe.id)
      expect(npc.name).toBe('Elara (copie)')
      expect(npc.classId).toBe('bard')
      expect(npc.subclassId).toBe('wordsmith')
      expect(npc.level).toBe(5)
      expect(npc.domainCards).toEqual(['splendor-reassurance'])
    })
  })

  describe('Import/Export avec build', () => {
    it('exporte et réimporte un PNJ avec build', () => {
      store.create({
        name: 'Gareth',
        classId: 'guardian',
        subclassId: 'stalwart',
        level: 3,
        domainCards: ['valor-courageous-strike']
      })

      const json = store.exportNpcs()
      store.clearAll()

      const result = store.importNpcs(json)
      expect(result.success).toBe(true)
      expect(result.imported).toBe(1)

      const npc = store.npcs[0]
      expect(npc.classId).toBe('guardian')
      expect(npc.subclassId).toBe('stalwart')
      expect(npc.level).toBe(3)
      expect(npc.domainCards).toEqual(['valor-courageous-strike'])
    })
  })
})
