/**
 * @module homebrew/core/composables/useHomebrewStore
 * @description Factory qui génère un store Pinia CRUD complet pour
 * n'importe quelle catégorie de contenu homebrew Daggerheart.
 *
 * Usage :
 *   const useCustomAdversaryStore = createHomebrewStore(adversarySchema)
 *   // → store Pinia avec items, create, update, delete, filteredItems, etc.
 *
 * Chaque store généré :
 *  - Persiste ses données via useStorage (localStorage)
 *  - Valide les données avant écriture via useHomebrewValidation
 *  - Génère des IDs uniques via idGenerator
 *  - Offre filtrage, tri, recherche
 *  - Supporte import/export JSON
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@core/composables/useStorage.js'
import { generateId } from '../utils/idGenerator.js'
import { validateHomebrewData } from './useHomebrewValidation.js'

/**
 * Deep clone sûr pour les proxies Vue réactifs.
 * structuredClone échoue sur les Proxy Vue, on utilise JSON round-trip.
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * @typedef {object} HomebrewItem
 * @property {string} id - Identifiant unique
 * @property {string} name - Nom de l'item
 * @property {string} source - Toujours 'custom'
 * @property {string} createdAt - ISO timestamp de création
 * @property {string} updatedAt - ISO timestamp de dernière modification
 */

/**
 * @typedef {object} StoreOperationResult
 * @property {boolean} success
 * @property {string} [id] - ID de l'item créé/mis à jour
 * @property {object} [item] - Item résultant
 * @property {string} [error] - Message d'erreur global
 * @property {Array} [errors] - Erreurs de validation détaillées
 */

/**
 * Crée un store Pinia spécialisé pour une catégorie homebrew donnée.
 *
 * @param {object} schema - Schéma déclaratif de la catégorie
 * @param {string} schema.key - Clé de catégorie (ex: 'adversary')
 * @param {string} schema.label - Label affiché (ex: 'Adversaire')
 * @param {string} schema.storageKey - Clé localStorage (ex: 'homebrew-adversaries')
 * @param {object[]} schema.fields - Définitions des champs
 * @returns {Function} Hook Pinia (useXxxStore)
 */
export function createHomebrewStore(schema) {
  if (!schema?.key || !schema?.storageKey || !Array.isArray(schema?.fields)) {
    throw new Error(
      `[createHomebrewStore] Schéma invalide. Requis : key, storageKey, fields[]. Reçu : ${JSON.stringify(Object.keys(schema || {}))}`
    )
  }

  const storeId = `homebrew-${schema.key}`

  return defineStore(storeId, () => {
    // ── Persistence ────────────────────────────────────────
    const { data: storedItems, error: storageError } = useStorage(schema.storageKey, [])

    // ── État ────────────────────────────────────────────────
    const searchQuery = ref('')
    const sortField = ref('updatedAt')
    const sortDirection = ref('desc')
    const filterCriteria = ref({})

    // ── Items réactifs ─────────────────────────────────────
    const items = computed(() => {
      if (!Array.isArray(storedItems.value)) {
        return []
      }
      return storedItems.value
    })

    const count = computed(() => items.value.length)

    // ── Filtrage & Tri ─────────────────────────────────────

    /**
     * Liste filtrée, recherchée et triée.
     */
    const filteredItems = computed(() => {
      let result = [...items.value]

      // Recherche textuelle sur le nom et la description
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase()
        result = result.filter((item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q))
        )
      }

      // Filtres dynamiques (ex: { tier: 2, type: 'Solo' })
      const criteria = filterCriteria.value
      for (const [key, value] of Object.entries(criteria)) {
        if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          continue
        }
        result = result.filter((item) => {
          if (Array.isArray(value)) {
            return value.includes(item[key])
          }
          return item[key] === value
        })
      }

      // Tri
      result.sort((a, b) => {
        const aVal = a[sortField.value]
        const bVal = b[sortField.value]

        let cmp
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.localeCompare(bVal)
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal
        } else {
          cmp = String(aVal || '').localeCompare(String(bVal || ''))
        }

        return sortDirection.value === 'asc' ? cmp : -cmp
      })

      return result
    })

    // ── CRUD ────────────────────────────────────────────────

    /**
     * Crée un nouvel item homebrew.
     *
     * @param {object} data - Données du formulaire (sans id ni métadonnées)
     * @returns {StoreOperationResult}
     */
    function create(data) {
      // Validation
      const validation = validateHomebrewData(data, schema)
      if (!validation.valid) {
        return { success: false, errors: validation.errors, error: 'Données invalides.' }
      }

      const now = new Date().toISOString()
      const item = {
        ...deepClone(data),
        id: generateId(schema.key, data.name),
        source: 'custom',
        createdAt: now,
        updatedAt: now
      }

      storedItems.value = [...items.value, item]

      return { success: true, id: item.id, item: deepClone(item) }
    }

    /**
     * Met à jour un item existant.
     *
     * @param {string} id - ID de l'item à modifier
     * @param {object} data - Nouvelles données (les métadonnées sont préservées)
     * @returns {StoreOperationResult}
     */
    function update(id, data) {
      const index = items.value.findIndex((item) => item.id === id)
      if (index === -1) {
        return { success: false, error: `Item introuvable : "${id}".` }
      }

      // Validation
      const validation = validateHomebrewData(data, schema)
      if (!validation.valid) {
        return { success: false, errors: validation.errors, error: 'Données invalides.' }
      }

      const existing = items.value[index]
      const updated = {
        ...deepClone(data),
        id: existing.id,
        source: 'custom',
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      }

      const newItems = [...items.value]
      newItems[index] = updated
      storedItems.value = newItems

      return { success: true, id: updated.id, item: deepClone(updated) }
    }

    /**
     * Supprime un item par son ID.
     *
     * @param {string} id
     * @returns {StoreOperationResult}
     */
    function remove(id) {
      const index = items.value.findIndex((item) => item.id === id)
      if (index === -1) {
        return { success: false, error: `Item introuvable : "${id}".` }
      }

      storedItems.value = items.value.filter((item) => item.id !== id)
      return { success: true, id }
    }

    /**
     * Duplique un item existant avec un nouvel ID et un nom modifié.
     *
     * @param {string} id
     * @returns {StoreOperationResult}
     */
    function duplicate(id) {
      const original = items.value.find((item) => item.id === id)
      if (!original) {
        return { success: false, error: `Item introuvable : "${id}".` }
      }

      const cloned = deepClone(original)
      delete cloned.id
      delete cloned.source
      delete cloned.createdAt
      delete cloned.updatedAt
      cloned.name = `${original.name} (copie)`

      return create(cloned)
    }

    /**
     * Crée un item homebrew à partir d'une source externe (SRD, autre module).
     * Moins strict que create() : copie toutes les données compatibles
     * et laisse l'utilisateur corriger dans l'éditeur.
     *
     * @param {object} sourceData - Données source (SRD ou autre)
     * @returns {StoreOperationResult}
     */
    function createFromTemplate(sourceData) {
      if (!sourceData || typeof sourceData !== 'object') {
        return { success: false, error: 'Données source invalides.' }
      }

      const cloned = deepClone(sourceData)

      // Nettoyage des métadonnées
      delete cloned.id
      delete cloned.source
      delete cloned.createdAt
      delete cloned.updatedAt

      // Renommer
      if (cloned.name) {
        cloned.name = `${cloned.name} (copie)`
      } else {
        cloned.name = 'Sans nom (copie)'
      }

      // Essayer avec validation d'abord
      const validated = create(cloned)
      if (validated.success) {
        return validated
      }

      // Si la validation échoue (données SRD incomplètes),
      // créer quand même avec les métadonnées minimales
      const now = new Date().toISOString()
      const item = {
        ...cloned,
        id: generateId(schema.key, cloned.name),
        source: 'custom',
        createdAt: now,
        updatedAt: now
      }

      storedItems.value = [...items.value, item]
      return { success: true, id: item.id, item: deepClone(item), warnings: validated.errors }
    }

    /**
     * Récupère un item par son ID.
     *
     * @param {string} id
     * @returns {object|null}
     */
    function getById(id) {
      const item = items.value.find((i) => i.id === id)
      return item ? deepClone(item) : null
    }

    // ── Import / Export ─────────────────────────────────────

    /**
     * Exporte tous les items au format JSON.
     * @returns {string}
     */
    function exportItems() {
      return JSON.stringify({
        category: schema.key,
        version: 1,
        exportedAt: new Date().toISOString(),
        items: items.value
      }, null, 2)
    }

    /**
     * Importe des items depuis un JSON.
     * Les items avec un ID déjà existant sont ignorés (pas d'écrasement).
     *
     * @param {string} jsonString - JSON exporté
     * @returns {{ success: boolean, imported: number, skipped: number, error?: string }}
     */
    function importItems(jsonString) {
      try {
        const parsed = JSON.parse(jsonString)
        const incoming = parsed?.items

        if (!Array.isArray(incoming)) {
          return { success: false, imported: 0, skipped: 0, error: 'Format invalide : "items" manquant ou non-tableau.' }
        }

        const existingIds = new Set(items.value.map((i) => i.id))
        let imported = 0
        let skipped = 0

        for (const item of incoming) {
          if (existingIds.has(item.id)) {
            skipped++
            continue
          }

          const validation = validateHomebrewData(item, schema)
          if (!validation.valid) {
            skipped++
            continue
          }

          // Assure les métadonnées
          const now = new Date().toISOString()
          const safeItem = {
            ...deepClone(item),
            id: item.id || generateId(schema.key, item.name),
            source: 'custom',
            createdAt: item.createdAt || now,
            updatedAt: now
          }

          storedItems.value = [...storedItems.value, safeItem]
          existingIds.add(safeItem.id)
          imported++
        }

        return { success: true, imported, skipped }
      } catch (err) {
        return { success: false, imported: 0, skipped: 0, error: `Erreur de parsing : ${err.message}` }
      }
    }

    /**
     * Supprime tous les items homebrew de cette catégorie.
     * @returns {StoreOperationResult}
     */
    function clearAll() {
      storedItems.value = []
      return { success: true }
    }

    // ── Filtres ──────────────────────────────────────────────

    function setSearch(query) {
      searchQuery.value = query
    }

    function setSort(field, direction = 'asc') {
      sortField.value = field
      sortDirection.value = direction
    }

    function setFilter(key, value) {
      filterCriteria.value = { ...filterCriteria.value, [key]: value }
    }

    function clearFilters() {
      searchQuery.value = ''
      filterCriteria.value = {}
    }

    return {
      // État
      items,
      count,
      filteredItems,
      searchQuery,
      sortField,
      sortDirection,
      filterCriteria,
      storageError,

      // CRUD
      create,
      update,
      remove,
      duplicate,
      createFromTemplate,
      getById,

      // Import / Export
      exportItems,
      importItems,
      clearAll,

      // Filtres
      setSearch,
      setSort,
      setFilter,
      clearFilters,

      // Métadonnées du schéma
      schemaKey: schema.key,
      schemaLabel: schema.label
    }
  })
}
