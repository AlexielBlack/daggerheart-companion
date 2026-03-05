/**
 * @file npcStore.test.js
 * @description Tests du store PNJ : CRUD, relations PJ/PNJ,
 * filtrage, import/export, nettoyage des relations à la suppression.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNpcStore } from '../stores/npcStore.js'
import {
  NPC_STATUS_NEUTRAL,
  NPC_STATUS_HOSTILE,
  NPC_STATUS_ALLY,
  DISPOSITION_FRIENDLY,
  DISPOSITION_HOSTILE,
  RELATION_FAMILY,
  RELATION_ALLIANCE,
  RELATION_RIVALRY
} from '../constants.js'

describe('npcStore', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useNpcStore()
  })

  // ── CRUD ──────────────────────────────────────────────

  describe('CRUD', () => {
    it('crée un PNJ avec les données minimales', () => {
      const result = store.create({ name: 'Gareth' })
      expect(result.success).toBe(true)
      expect(result.id).toContain('npc-gareth')
      expect(store.count).toBe(1)
      expect(store.npcs[0].name).toBe('Gareth')
      expect(store.npcs[0].status).toBe(NPC_STATUS_NEUTRAL)
    })

    it('crée un PNJ avec toutes les données', () => {
      const result = store.create({
        name: 'Elara',
        title: 'Maîtresse de guilde',
        description: 'Une femme imposante.',
        personality: 'Calculatrice et ambitieuse',
        motives: 'Contrôler le commerce',
        tactics: 'Manipulation, chantage',
        location: 'Quartier des marchands',
        faction: 'Guilde des ombres',
        status: NPC_STATUS_HOSTILE,
        difficulty: 14,
        notes: 'Suspecte dans l\'affaire du vol'
      })

      expect(result.success).toBe(true)
      const npc = store.getById(result.id)
      expect(npc.title).toBe('Maîtresse de guilde')
      expect(npc.status).toBe(NPC_STATUS_HOSTILE)
      expect(npc.difficulty).toBe(14)
      expect(npc.faction).toBe('Guilde des ombres')
    })

    it('refuse un PNJ sans nom', () => {
      const result = store.create({ name: '' })
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Le nom est obligatoire.')
      expect(store.count).toBe(0)
    })

    it('refuse une difficulté invalide', () => {
      const result = store.create({ name: 'Test', difficulty: 50 })
      expect(result.success).toBe(false)
      expect(result.errors.some((e) => e.includes('difficulté'))).toBe(true)
    })

    it('refuse un statut invalide', () => {
      const result = store.create({ name: 'Test', status: 'zombie' })
      expect(result.success).toBe(false)
      expect(result.errors.some((e) => e.includes('Statut invalide'))).toBe(true)
    })

    it('met à jour un PNJ existant', () => {
      const created = store.create({ name: 'Gareth', title: 'Forgeron' })
      const result = store.update(created.id, {
        name: 'Gareth le Brave',
        title: 'Champion',
        status: NPC_STATUS_ALLY
      })

      expect(result.success).toBe(true)
      const npc = store.getById(created.id)
      expect(npc.name).toBe('Gareth le Brave')
      expect(npc.title).toBe('Champion')
      expect(npc.status).toBe(NPC_STATUS_ALLY)
    })

    it('refuse de mettre à jour un PNJ inexistant', () => {
      const result = store.update('fake-id', { name: 'Test' })
      expect(result.success).toBe(false)
      expect(result.error).toContain('introuvable')
    })

    it('supprime un PNJ', () => {
      const created = store.create({ name: 'Gareth' })
      const result = store.remove(created.id)
      expect(result.success).toBe(true)
      expect(store.count).toBe(0)
    })

    it('refuse de supprimer un PNJ inexistant', () => {
      const result = store.remove('fake-id')
      expect(result.success).toBe(false)
    })

    it('duplique un PNJ', () => {
      store.create({ name: 'Gareth', title: 'Forgeron', faction: 'Artisans' })
      const original = store.npcs[0]
      const result = store.duplicate(original.id)

      expect(result.success).toBe(true)
      expect(store.count).toBe(2)
      expect(result.item.name).toBe('Gareth (copie)')
      expect(result.item.faction).toBe('Artisans')
      expect(result.item.id).not.toBe(original.id)
    })

    it('getById retourne null pour un ID inexistant', () => {
      expect(store.getById('fake')).toBeNull()
    })
  })

  // ── Sélection ─────────────────────────────────────────

  describe('Sélection', () => {
    it('sélectionne et désélectionne un PNJ', () => {
      const created = store.create({ name: 'Gareth' })
      store.selectNpc(created.id)
      expect(store.selectedNpcId).toBe(created.id)
      expect(store.selectedNpc).not.toBeNull()
      expect(store.selectedNpc.name).toBe('Gareth')

      store.clearSelection()
      expect(store.selectedNpcId).toBeNull()
      expect(store.selectedNpc).toBeNull()
    })

    it('la sélection se réinitialise quand le PNJ est supprimé', () => {
      const created = store.create({ name: 'Gareth' })
      store.selectNpc(created.id)
      store.remove(created.id)
      expect(store.selectedNpcId).toBeNull()
    })
  })

  // ── Filtrage ──────────────────────────────────────────

  describe('Filtrage', () => {
    beforeEach(() => {
      store.create({ name: 'Gareth', faction: 'Artisans', location: 'Forge', status: NPC_STATUS_ALLY })
      store.create({ name: 'Elara', faction: 'Guilde', location: 'Marché', status: NPC_STATUS_HOSTILE })
      store.create({ name: 'Thorn', faction: 'Artisans', location: 'Marché', status: NPC_STATUS_NEUTRAL })
    })

    it('filtre par recherche textuelle', () => {
      store.setSearch('gar')
      expect(store.filteredNpcs).toHaveLength(1)
      expect(store.filteredNpcs[0].name).toBe('Gareth')
    })

    it('filtre par statut', () => {
      store.setStatusFilter(NPC_STATUS_HOSTILE)
      expect(store.filteredNpcs).toHaveLength(1)
      expect(store.filteredNpcs[0].name).toBe('Elara')
    })

    it('filtre par faction', () => {
      store.setFactionFilter('Artisans')
      expect(store.filteredNpcs).toHaveLength(2)
    })

    it('filtre par lieu', () => {
      store.setLocationFilter('Marché')
      expect(store.filteredNpcs).toHaveLength(2)
    })

    it('combine les filtres', () => {
      store.setFactionFilter('Artisans')
      store.setLocationFilter('Marché')
      expect(store.filteredNpcs).toHaveLength(1)
      expect(store.filteredNpcs[0].name).toBe('Thorn')
    })

    it('réinitialise les filtres', () => {
      store.setSearch('gar')
      store.setStatusFilter(NPC_STATUS_ALLY)
      store.clearFilters()
      expect(store.filteredNpcs).toHaveLength(3)
    })

    it('trie par nom alphabétiquement', () => {
      const names = store.filteredNpcs.map((n) => n.name)
      expect(names).toEqual(['Elara', 'Gareth', 'Thorn'])
    })
  })

  // ── Listes dynamiques ─────────────────────────────────

  describe('Listes dynamiques', () => {
    it('collecte les factions uniques', () => {
      store.create({ name: 'A', faction: 'Guilde' })
      store.create({ name: 'B', faction: 'Artisans' })
      store.create({ name: 'C', faction: 'Guilde' })
      expect(store.allFactions).toEqual(['Artisans', 'Guilde'])
    })

    it('collecte les lieux uniques', () => {
      store.create({ name: 'A', location: 'Forge' })
      store.create({ name: 'B', location: 'Marché' })
      expect(store.allLocations).toEqual(['Forge', 'Marché'])
    })
  })

  // ── Relations PJ ──────────────────────────────────────

  describe('Relations PJ', () => {
    let npcId

    beforeEach(() => {
      const result = store.create({ name: 'Gareth' })
      npcId = result.id
    })

    it('ajoute une relation PJ', () => {
      const result = store.setPcRelation(npcId, 'pc-zara', DISPOSITION_FRIENDLY, 'Sauvée en session 3')
      expect(result.success).toBe(true)

      const npc = store.getById(npcId)
      expect(npc.pcRelations).toHaveLength(1)
      expect(npc.pcRelations[0]).toEqual({
        pcId: 'pc-zara',
        disposition: DISPOSITION_FRIENDLY,
        note: 'Sauvée en session 3'
      })
    })

    it('met à jour une relation PJ existante', () => {
      store.setPcRelation(npcId, 'pc-zara', DISPOSITION_FRIENDLY)
      store.setPcRelation(npcId, 'pc-zara', DISPOSITION_HOSTILE, 'Trahison')

      const npc = store.getById(npcId)
      expect(npc.pcRelations).toHaveLength(1)
      expect(npc.pcRelations[0].disposition).toBe(DISPOSITION_HOSTILE)
      expect(npc.pcRelations[0].note).toBe('Trahison')
    })

    it('refuse une disposition invalide', () => {
      const result = store.setPcRelation(npcId, 'pc-zara', 99)
      expect(result.success).toBe(false)
    })

    it('supprime une relation PJ', () => {
      store.setPcRelation(npcId, 'pc-zara', DISPOSITION_FRIENDLY)
      const result = store.removePcRelation(npcId, 'pc-zara')
      expect(result.success).toBe(true)

      const npc = store.getById(npcId)
      expect(npc.pcRelations).toHaveLength(0)
    })
  })

  // ── Relations PNJ ↔ PNJ ───────────────────────────────

  describe('Relations PNJ', () => {
    let id1, id2, id3

    beforeEach(() => {
      id1 = store.create({ name: 'Gareth' }).id
      id2 = store.create({ name: 'Elara' }).id
      id3 = store.create({ name: 'Thorn' }).id
    })

    it('ajoute une relation unidirectionnelle', () => {
      const result = store.setNpcRelation(id1, id2, RELATION_ALLIANCE, 'Alliés de longue date')
      expect(result.success).toBe(true)

      const npc = store.getById(id1)
      expect(npc.npcRelations).toHaveLength(1)
      expect(npc.npcRelations[0].targetNpcId).toBe(id2)
      expect(npc.npcRelations[0].type).toBe(RELATION_ALLIANCE)

      // Elara n'a pas la relation inverse
      const elara = store.getById(id2)
      expect(elara.npcRelations).toHaveLength(0)
    })

    it('ajoute une relation bidirectionnelle', () => {
      store.setNpcRelation(id1, id2, RELATION_FAMILY, 'Frères', true)

      const gareth = store.getById(id1)
      expect(gareth.npcRelations).toHaveLength(1)

      const elara = store.getById(id2)
      expect(elara.npcRelations).toHaveLength(1)
      expect(elara.npcRelations[0].targetNpcId).toBe(id1)
      expect(elara.npcRelations[0].type).toBe(RELATION_FAMILY)
    })

    it('refuse une relation avec soi-même', () => {
      const result = store.setNpcRelation(id1, id1, RELATION_FAMILY)
      expect(result.success).toBe(false)
      expect(result.error).toContain('lui-même')
    })

    it('refuse un type de relation invalide', () => {
      const result = store.setNpcRelation(id1, id2, 'blabla')
      expect(result.success).toBe(false)
    })

    it('met à jour une relation existante', () => {
      store.setNpcRelation(id1, id2, RELATION_ALLIANCE)
      store.setNpcRelation(id1, id2, RELATION_RIVALRY, 'Devenu rival')

      const npc = store.getById(id1)
      expect(npc.npcRelations).toHaveLength(1)
      expect(npc.npcRelations[0].type).toBe(RELATION_RIVALRY)
    })

    it('supprime une relation unidirectionnelle', () => {
      store.setNpcRelation(id1, id2, RELATION_ALLIANCE)
      const result = store.removeNpcRelation(id1, id2)
      expect(result.success).toBe(true)

      const npc = store.getById(id1)
      expect(npc.npcRelations).toHaveLength(0)
    })

    it('supprime une relation bidirectionnellement', () => {
      store.setNpcRelation(id1, id2, RELATION_FAMILY, '', true)
      store.removeNpcRelation(id1, id2, true)

      expect(store.getById(id1).npcRelations).toHaveLength(0)
      expect(store.getById(id2).npcRelations).toHaveLength(0)
    })

    it('récupère les relations entrantes', () => {
      store.setNpcRelation(id2, id1, RELATION_ALLIANCE, 'Alliée')
      store.setNpcRelation(id3, id1, RELATION_RIVALRY, 'Rival')

      const incoming = store.getIncomingRelations(id1)
      expect(incoming).toHaveLength(2)
      expect(incoming[0].sourceName).toBe('Elara')
      expect(incoming[1].sourceName).toBe('Thorn')
    })
  })

  // ── Nettoyage des relations à la suppression ──────────

  describe('Nettoyage relationnel', () => {
    it('nettoie les relations entrantes quand un PNJ est supprimé', () => {
      const id1 = store.create({ name: 'Gareth' }).id
      const id2 = store.create({ name: 'Elara' }).id

      store.setNpcRelation(id2, id1, RELATION_ALLIANCE)

      // Supprimer Gareth
      store.remove(id1)

      const elara = store.getById(id2)
      expect(elara.npcRelations).toHaveLength(0)
    })
  })

  // ── Import / Export ───────────────────────────────────

  describe('Import / Export', () => {
    it('exporte et réimporte correctement', () => {
      store.create({ name: 'Gareth', faction: 'Artisans' })
      store.create({ name: 'Elara', faction: 'Guilde' })

      const json = store.exportNpcs()
      const parsed = JSON.parse(json)
      expect(parsed.category).toBe('npcs')
      expect(parsed.items).toHaveLength(2)

      // Réinitialiser et réimporter
      store.clearAll()
      expect(store.count).toBe(0)

      const result = store.importNpcs(json)
      expect(result.success).toBe(true)
      expect(result.imported).toBe(2)
      expect(store.count).toBe(2)
    })

    it('ignore les doublons à l\'import', () => {
      store.create({ name: 'Gareth' })
      const json = store.exportNpcs()

      const result = store.importNpcs(json)
      expect(result.imported).toBe(0)
      expect(result.skipped).toBe(1)
      expect(store.count).toBe(1)
    })

    it('gère un JSON invalide', () => {
      const result = store.importNpcs('pas du json')
      expect(result.success).toBe(false)
      expect(result.error).toContain('parsing')
    })

    it('gère un format sans items', () => {
      const result = store.importNpcs('{"foo": "bar"}')
      expect(result.success).toBe(false)
      expect(result.error).toContain('items')
    })
  })

  // ── clearAll ──────────────────────────────────────────

  describe('clearAll', () => {
    it('supprime tous les PNJs et réinitialise la sélection', () => {
      const id = store.create({ name: 'Gareth' }).id
      store.selectNpc(id)

      store.clearAll()
      expect(store.count).toBe(0)
      expect(store.selectedNpcId).toBeNull()
    })
  })
})
