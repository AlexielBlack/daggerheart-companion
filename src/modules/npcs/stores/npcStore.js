/**
 * @module npcs/stores/npcStore
 * @description Store Pinia pour la gestion des PNJs.
 * CRUD complet + relations PNJ↔PJ / PNJ↔PNJ + filtrage avancé.
 * Persistance LocalStorage via useStorage.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@core/composables/useStorage.js'
import {
  NPC_STATUS_NEUTRAL,
  isValidStatus,
  isValidDisposition,
  isValidRelationType,
  createDefaultNpc
} from '../constants.js'

/** Compteur d'ID simple pour les PNJs */
let idCounter = 0

/**
 * Génère un ID unique pour un PNJ.
 * @param {string} name
 * @returns {string}
 */
function generateNpcId(name) {
  idCounter++
  const slug = (name || 'npc')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)
  return `npc-${slug}-${Date.now()}-${idCounter}`
}

/**
 * Deep clone sûr pour les proxies Vue réactifs.
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Valide les données minimales d'un PNJ.
 * @param {object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateNpc(data) {
  const errors = []

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('Le nom est obligatoire.')
  }

  if (data.status && !isValidStatus(data.status)) {
    errors.push(`Statut invalide : "${data.status}".`)
  }

  if (data.difficulty !== null && data.difficulty !== undefined) {
    const diff = Number(data.difficulty)
    if (Number.isNaN(diff) || diff < 1 || diff > 30) {
      errors.push('La difficulté doit être un nombre entre 1 et 30.')
    }
  }

  if (data.pcRelations && !Array.isArray(data.pcRelations)) {
    errors.push('pcRelations doit être un tableau.')
  }

  if (data.npcRelations && !Array.isArray(data.npcRelations)) {
    errors.push('npcRelations doit être un tableau.')
  }

  // Validation des pcRelations
  if (Array.isArray(data.pcRelations)) {
    for (const rel of data.pcRelations) {
      if (!rel.pcId) {
        errors.push('Chaque relation PJ doit avoir un pcId.')
      }
      if (rel.disposition !== undefined && !isValidDisposition(rel.disposition)) {
        errors.push(`Disposition invalide : ${rel.disposition}.`)
      }
    }
  }

  // Validation des npcRelations
  if (Array.isArray(data.npcRelations)) {
    for (const rel of data.npcRelations) {
      if (!rel.targetNpcId) {
        errors.push('Chaque relation PNJ doit avoir un targetNpcId.')
      }
      if (rel.type && !isValidRelationType(rel.type)) {
        errors.push(`Type de relation invalide : "${rel.type}".`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export const useNpcStore = defineStore('npcs', () => {
  // ── Persistence ────────────────────────────────────────
  const { data: storedNpcs, error: storageError } = useStorage('npcs', [])

  // ── État ────────────────────────────────────────────────
  const selectedNpcId = ref(null)
  const searchQuery = ref('')
  const filterStatus = ref(null)
  const filterFaction = ref(null)
  const filterLocation = ref(null)

  // ── Migration : renommage motives→ambition, tactics→moyens, nouveaux champs ──
  if (Array.isArray(storedNpcs.value)) {
    let migrated = false
    for (const npc of storedNpcs.value) {
      if ('motives' in npc && !('ambition' in npc)) {
        npc.ambition = npc.motives || ''
        delete npc.motives
        migrated = true
      }
      if ('tactics' in npc && !('moyens' in npc)) {
        npc.moyens = npc.tactics || ''
        delete npc.tactics
        migrated = true
      }
      if (!('contradiction' in npc)) { npc.contradiction = ''; migrated = true }
      if (!('activeProblem' in npc)) { npc.activeProblem = ''; migrated = true }
      if (!('ancestry' in npc)) { npc.ancestry = ''; migrated = true }
      if (!('importance' in npc)) { npc.importance = ''; migrated = true }
    }
    if (migrated) {
      storedNpcs.save(storedNpcs.value)
    }
  }

  // ── Items réactifs ─────────────────────────────────────
  const npcs = computed(() => {
    if (!Array.isArray(storedNpcs.value)) return []
    return storedNpcs.value
  })

  const count = computed(() => npcs.value.length)

  // ── PNJ sélectionné ────────────────────────────────────
  const selectedNpc = computed(() => {
    if (!selectedNpcId.value) return null
    return npcs.value.find((n) => n.id === selectedNpcId.value) || null
  })

  // ── Listes dynamiques (pour filtres UI) ────────────────
  const allFactions = computed(() => {
    const factions = new Set()
    for (const npc of npcs.value) {
      if (npc.faction && npc.faction.trim()) {
        factions.add(npc.faction.trim())
      }
    }
    return [...factions].sort()
  })

  const allLocations = computed(() => {
    const locations = new Set()
    for (const npc of npcs.value) {
      if (npc.location && npc.location.trim()) {
        locations.add(npc.location.trim())
      }
    }
    return [...locations].sort()
  })

  // ── Filtrage ───────────────────────────────────────────
  const filteredNpcs = computed(() => {
    let result = [...npcs.value]

    // Recherche textuelle (nom, titre, faction, lieu)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter((npc) =>
        (npc.name && npc.name.toLowerCase().includes(q)) ||
        (npc.title && npc.title.toLowerCase().includes(q)) ||
        (npc.faction && npc.faction.toLowerCase().includes(q)) ||
        (npc.location && npc.location.toLowerCase().includes(q))
      )
    }

    // Filtre par statut
    if (filterStatus.value) {
      result = result.filter((npc) => npc.status === filterStatus.value)
    }

    // Filtre par faction
    if (filterFaction.value) {
      result = result.filter((npc) => npc.faction === filterFaction.value)
    }

    // Filtre par lieu
    if (filterLocation.value) {
      result = result.filter((npc) => npc.location === filterLocation.value)
    }

    // Tri alphabétique par nom
    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    return result
  })

  // ── CRUD ───────────────────────────────────────────────

  /**
   * Crée un nouveau PNJ.
   * @param {object} data
   * @returns {{ success: boolean, id?: string, item?: object, errors?: string[], error?: string }}
   */
  function create(data) {
    const validation = validateNpc(data)
    if (!validation.valid) {
      return { success: false, errors: validation.errors, error: 'Données invalides.' }
    }

    const now = new Date().toISOString()
    const npc = {
      ...createDefaultNpc(),
      ...deepClone(data),
      id: generateNpcId(data.name),
      status: data.status || NPC_STATUS_NEUTRAL,
      pcRelations: Array.isArray(data.pcRelations) ? deepClone(data.pcRelations) : [],
      npcRelations: Array.isArray(data.npcRelations) ? deepClone(data.npcRelations) : [],
      createdAt: now,
      updatedAt: now
    }

    storedNpcs.value = [...npcs.value, npc]
    return { success: true, id: npc.id, item: deepClone(npc) }
  }

  /**
   * Met à jour un PNJ existant.
   * @param {string} id
   * @param {object} data
   * @returns {{ success: boolean, id?: string, item?: object, errors?: string[], error?: string }}
   */
  function update(id, data) {
    const index = npcs.value.findIndex((n) => n.id === id)
    if (index === -1) {
      return { success: false, error: `PNJ introuvable : "${id}".` }
    }

    const validation = validateNpc(data)
    if (!validation.valid) {
      return { success: false, errors: validation.errors, error: 'Données invalides.' }
    }

    const existing = npcs.value[index]
    const updated = {
      ...createDefaultNpc(),
      ...deepClone(data),
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    }

    const newNpcs = [...npcs.value]
    newNpcs[index] = updated
    storedNpcs.value = newNpcs

    return { success: true, id: updated.id, item: deepClone(updated) }
  }

  /**
   * Supprime un PNJ et nettoie les relations entrantes.
   * @param {string} id
   * @returns {{ success: boolean, error?: string }}
   */
  function remove(id) {
    const index = npcs.value.findIndex((n) => n.id === id)
    if (index === -1) {
      return { success: false, error: `PNJ introuvable : "${id}".` }
    }

    // Nettoyage des relations entrantes dans les autres PNJs
    const cleaned = npcs.value
      .filter((n) => n.id !== id)
      .map((n) => {
        if (!Array.isArray(n.npcRelations)) return n
        const filtered = n.npcRelations.filter((r) => r.targetNpcId !== id)
        if (filtered.length === n.npcRelations.length) return n
        return { ...n, npcRelations: filtered, updatedAt: new Date().toISOString() }
      })

    storedNpcs.value = cleaned

    if (selectedNpcId.value === id) {
      selectedNpcId.value = null
    }

    return { success: true, id }
  }

  /**
   * Duplique un PNJ.
   * @param {string} id
   * @returns {{ success: boolean, id?: string, item?: object, error?: string }}
   */
  function duplicate(id) {
    const original = npcs.value.find((n) => n.id === id)
    if (!original) {
      return { success: false, error: `PNJ introuvable : "${id}".` }
    }

    const cloned = deepClone(original)
    delete cloned.id
    delete cloned.createdAt
    delete cloned.updatedAt
    cloned.name = `${original.name} (copie)`
    // Ne pas dupliquer les relations entrantes
    cloned.npcRelations = []

    return create(cloned)
  }

  /**
   * Récupère un PNJ par ID.
   * @param {string} id
   * @returns {object|null}
   */
  function getById(id) {
    const npc = npcs.value.find((n) => n.id === id)
    return npc ? deepClone(npc) : null
  }

  // ── Sélection ──────────────────────────────────────────

  function selectNpc(id) {
    selectedNpcId.value = id
  }

  function clearSelection() {
    selectedNpcId.value = null
  }

  // ── Relations PNJ ↔ PJ ────────────────────────────────

  /**
   * Ajoute ou met à jour la relation d'un PNJ envers un PJ.
   * @param {string} npcId
   * @param {string} pcId
   * @param {number} disposition
   * @param {string} [note='']
   * @returns {{ success: boolean, error?: string }}
   */
  function setPcRelation(npcId, pcId, disposition, note = '') {
    if (!isValidDisposition(disposition)) {
      return { success: false, error: `Disposition invalide : ${disposition}.` }
    }

    const index = npcs.value.findIndex((n) => n.id === npcId)
    if (index === -1) {
      return { success: false, error: `PNJ introuvable : "${npcId}".` }
    }

    const npc = deepClone(npcs.value[index])
    const relations = Array.isArray(npc.pcRelations) ? npc.pcRelations : []
    const relIndex = relations.findIndex((r) => r.pcId === pcId)

    if (relIndex >= 0) {
      relations[relIndex] = { pcId, disposition, note }
    } else {
      relations.push({ pcId, disposition, note })
    }

    npc.pcRelations = relations
    npc.updatedAt = new Date().toISOString()

    const newNpcs = [...npcs.value]
    newNpcs[index] = npc
    storedNpcs.value = newNpcs

    return { success: true }
  }

  /**
   * Supprime la relation PNJ → PJ.
   * @param {string} npcId
   * @param {string} pcId
   * @returns {{ success: boolean, error?: string }}
   */
  function removePcRelation(npcId, pcId) {
    const index = npcs.value.findIndex((n) => n.id === npcId)
    if (index === -1) {
      return { success: false, error: `PNJ introuvable : "${npcId}".` }
    }

    const npc = deepClone(npcs.value[index])
    const before = (npc.pcRelations || []).length
    npc.pcRelations = (npc.pcRelations || []).filter((r) => r.pcId !== pcId)

    if (npc.pcRelations.length === before) {
      return { success: false, error: 'Relation introuvable.' }
    }

    npc.updatedAt = new Date().toISOString()

    const newNpcs = [...npcs.value]
    newNpcs[index] = npc
    storedNpcs.value = newNpcs

    return { success: true }
  }

  // ── Relations PNJ ↔ PNJ ───────────────────────────────

  /**
   * Ajoute ou met à jour une relation entre deux PNJs.
   * @param {string} sourceNpcId
   * @param {string} targetNpcId
   * @param {string} type - Type de relation
   * @param {string} [note='']
   * @param {boolean} [bidirectional=false] - Si true, crée aussi la relation inverse
   * @returns {{ success: boolean, error?: string }}
   */
  function setNpcRelation(sourceNpcId, targetNpcId, type, note = '', bidirectional = false) {
    if (sourceNpcId === targetNpcId) {
      return { success: false, error: 'Un PNJ ne peut pas avoir une relation avec lui-même.' }
    }

    if (!isValidRelationType(type)) {
      return { success: false, error: `Type de relation invalide : "${type}".` }
    }

    const sourceIndex = npcs.value.findIndex((n) => n.id === sourceNpcId)
    if (sourceIndex === -1) {
      return { success: false, error: `PNJ source introuvable : "${sourceNpcId}".` }
    }

    const targetExists = npcs.value.some((n) => n.id === targetNpcId)
    if (!targetExists) {
      return { success: false, error: `PNJ cible introuvable : "${targetNpcId}".` }
    }

    // Mettre à jour la source
    const source = deepClone(npcs.value[sourceIndex])
    const rels = Array.isArray(source.npcRelations) ? source.npcRelations : []
    const relIndex = rels.findIndex((r) => r.targetNpcId === targetNpcId)

    if (relIndex >= 0) {
      rels[relIndex] = { targetNpcId, type, note, bidirectional }
    } else {
      rels.push({ targetNpcId, type, note, bidirectional })
    }

    source.npcRelations = rels
    source.updatedAt = new Date().toISOString()

    const newNpcs = [...npcs.value]
    newNpcs[sourceIndex] = source

    // Relation bidirectionnelle
    if (bidirectional) {
      const targetIndex = newNpcs.findIndex((n) => n.id === targetNpcId)
      if (targetIndex >= 0) {
        const target = deepClone(newNpcs[targetIndex])
        const tRels = Array.isArray(target.npcRelations) ? target.npcRelations : []
        const tRelIndex = tRels.findIndex((r) => r.targetNpcId === sourceNpcId)

        if (tRelIndex >= 0) {
          tRels[tRelIndex] = { targetNpcId: sourceNpcId, type, note, bidirectional: true }
        } else {
          tRels.push({ targetNpcId: sourceNpcId, type, note, bidirectional: true })
        }

        target.npcRelations = tRels
        target.updatedAt = new Date().toISOString()
        newNpcs[targetIndex] = target
      }
    }

    storedNpcs.value = newNpcs
    return { success: true }
  }

  /**
   * Supprime une relation PNJ → PNJ.
   * @param {string} sourceNpcId
   * @param {string} targetNpcId
   * @param {boolean} [removeBidirectional=false]
   * @returns {{ success: boolean, error?: string }}
   */
  function removeNpcRelation(sourceNpcId, targetNpcId, removeBidirectional = false) {
    const sourceIndex = npcs.value.findIndex((n) => n.id === sourceNpcId)
    if (sourceIndex === -1) {
      return { success: false, error: `PNJ source introuvable : "${sourceNpcId}".` }
    }

    const newNpcs = [...npcs.value]

    // Supprimer la relation source → target
    const source = deepClone(newNpcs[sourceIndex])
    const before = (source.npcRelations || []).length
    source.npcRelations = (source.npcRelations || []).filter((r) => r.targetNpcId !== targetNpcId)

    if (source.npcRelations.length === before) {
      return { success: false, error: 'Relation introuvable.' }
    }

    source.updatedAt = new Date().toISOString()
    newNpcs[sourceIndex] = source

    // Suppression bidirectionnelle
    if (removeBidirectional) {
      const targetIndex = newNpcs.findIndex((n) => n.id === targetNpcId)
      if (targetIndex >= 0) {
        const target = deepClone(newNpcs[targetIndex])
        target.npcRelations = (target.npcRelations || []).filter((r) => r.targetNpcId !== sourceNpcId)
        target.updatedAt = new Date().toISOString()
        newNpcs[targetIndex] = target
      }
    }

    storedNpcs.value = newNpcs
    return { success: true }
  }

  /**
   * Retourne toutes les relations entrantes d'un PNJ (où il est ciblé).
   * @param {string} npcId
   * @returns {Array<{ sourceId: string, sourceName: string, type: string, note: string }>}
   */
  function getIncomingRelations(npcId) {
    const incoming = []
    for (const npc of npcs.value) {
      if (npc.id === npcId) continue
      const rels = Array.isArray(npc.npcRelations) ? npc.npcRelations : []
      for (const rel of rels) {
        if (rel.targetNpcId === npcId) {
          incoming.push({
            sourceId: npc.id,
            sourceName: npc.name,
            type: rel.type,
            note: rel.note || ''
          })
        }
      }
    }
    return incoming
  }

  // ── Filtres ────────────────────────────────────────────

  function setSearch(query) {
    searchQuery.value = query
  }

  function setStatusFilter(status) {
    filterStatus.value = status
  }

  function setFactionFilter(faction) {
    filterFaction.value = faction
  }

  function setLocationFilter(location) {
    filterLocation.value = location
  }

  function clearFilters() {
    searchQuery.value = ''
    filterStatus.value = null
    filterFaction.value = null
    filterLocation.value = null
  }

  // ── Import / Export ────────────────────────────────────

  /**
   * Exporte tous les PNJs au format JSON.
   * @returns {string}
   */
  function exportNpcs() {
    return JSON.stringify({
      category: 'npcs',
      version: 1,
      exportedAt: new Date().toISOString(),
      items: npcs.value
    }, null, 2)
  }

  /**
   * Importe des PNJs depuis un JSON.
   * @param {string} jsonString
   * @returns {{ success: boolean, imported: number, skipped: number, error?: string }}
   */
  function importNpcs(jsonString) {
    try {
      const parsed = JSON.parse(jsonString)
      const incoming = parsed?.items

      if (!Array.isArray(incoming)) {
        return { success: false, imported: 0, skipped: 0, error: 'Format invalide : "items" manquant.' }
      }

      const existingIds = new Set(npcs.value.map((n) => n.id))
      let imported = 0
      let skipped = 0

      for (const item of incoming) {
        if (existingIds.has(item.id)) {
          skipped++
          continue
        }

        const validation = validateNpc(item)
        if (!validation.valid) {
          skipped++
          continue
        }

        const now = new Date().toISOString()
        const safeItem = {
          ...createDefaultNpc(),
          ...deepClone(item),
          id: item.id || generateNpcId(item.name),
          createdAt: item.createdAt || now,
          updatedAt: now
        }

        storedNpcs.value = [...storedNpcs.value, safeItem]
        existingIds.add(safeItem.id)
        imported++
      }

      return { success: true, imported, skipped }
    } catch (err) {
      return { success: false, imported: 0, skipped: 0, error: `Erreur de parsing : ${err.message}` }
    }
  }

  /**
   * Supprime tous les PNJs.
   * @returns {{ success: boolean }}
   */
  function clearAll() {
    storedNpcs.value = []
    selectedNpcId.value = null
    return { success: true }
  }

  return {
    // État
    npcs,
    count,
    selectedNpcId,
    selectedNpc,
    filteredNpcs,
    storageError,

    // Listes dynamiques
    allFactions,
    allLocations,

    // Filtres
    searchQuery,
    filterStatus,
    filterFaction,
    filterLocation,
    setSearch,
    setStatusFilter,
    setFactionFilter,
    setLocationFilter,
    clearFilters,

    // CRUD
    create,
    update,
    remove,
    duplicate,
    getById,

    // Sélection
    selectNpc,
    clearSelection,

    // Relations PJ
    setPcRelation,
    removePcRelation,

    // Relations PNJ
    setNpcRelation,
    removeNpcRelation,
    getIncomingRelations,

    // Import / Export
    exportNpcs,
    importNpcs,
    clearAll
  }
})
