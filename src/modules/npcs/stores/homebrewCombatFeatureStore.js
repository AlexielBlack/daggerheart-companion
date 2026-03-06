/**
 * @module npcs/stores/homebrewCombatFeatureStore
 * @description Store Pinia pour les combat features homebrew.
 * CRUD complet avec persistance localStorage via useStorage.
 * Les features créées ici sont mergées dans le catalogue
 * du NpcCombatPanel pour sélection.
 */

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@core/composables/useStorage.js'
import {
  createCombatFeature,
  validateCombatFeature,
  FEATURE_SOURCE_HOMEBREW
} from '../combatConstants.js'

let idCounter = 0

/**
 * Génère un ID unique pour une feature homebrew.
 * @param {string} name
 * @returns {string}
 */
function generateFeatureId(name) {
  idCounter++
  const slug = (name || 'feature')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)
  return `hb-${slug}-${Date.now()}-${idCounter}`
}

/**
 * Deep clone sûr pour les proxies Vue réactifs.
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export const useHomebrewCombatFeatureStore = defineStore('homebrew-combat-features', () => {
  // ── Persistance ──
  const { data: storedFeatures, error: storageError } = useStorage('homebrew-combat-features', [])

  // ── État ──
  const features = computed(() => {
    if (!Array.isArray(storedFeatures.value)) return []
    return storedFeatures.value
  })

  const count = computed(() => features.value.length)

  // ── CRUD ──

  /**
   * Crée une nouvelle feature homebrew.
   * @param {object} data
   * @returns {{ success: boolean, id?: string, item?: object, errors?: string[], error?: string }}
   */
  function create(data) {
    const feature = {
      ...createCombatFeature(data),
      id: generateFeatureId(data.name),
      source: FEATURE_SOURCE_HOMEBREW,
      sourceRef: 'homebrew',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const validation = validateCombatFeature(feature)
    if (!validation.valid) {
      return { success: false, errors: validation.errors, error: 'Données invalides.' }
    }

    storedFeatures.value = [...features.value, feature]
    return { success: true, id: feature.id, item: deepClone(feature) }
  }

  /**
   * Met à jour une feature existante.
   * @param {string} id
   * @param {object} data
   * @returns {{ success: boolean, id?: string, item?: object, errors?: string[], error?: string }}
   */
  function update(id, data) {
    const index = features.value.findIndex(f => f.id === id)
    if (index === -1) {
      return { success: false, error: `Feature introuvable : "${id}".` }
    }

    const existing = features.value[index]
    const updated = {
      ...createCombatFeature(data),
      id: existing.id,
      source: FEATURE_SOURCE_HOMEBREW,
      sourceRef: 'homebrew',
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    }

    const validation = validateCombatFeature(updated)
    if (!validation.valid) {
      return { success: false, errors: validation.errors, error: 'Données invalides.' }
    }

    const newFeatures = [...features.value]
    newFeatures[index] = updated
    storedFeatures.value = newFeatures

    return { success: true, id: updated.id, item: deepClone(updated) }
  }

  /**
   * Supprime une feature.
   * @param {string} id
   * @returns {{ success: boolean, error?: string }}
   */
  function remove(id) {
    const index = features.value.findIndex(f => f.id === id)
    if (index === -1) {
      return { success: false, error: `Feature introuvable : "${id}".` }
    }

    storedFeatures.value = features.value.filter(f => f.id !== id)
    return { success: true }
  }

  /**
   * Duplique une feature.
   * @param {string} id
   * @returns {{ success: boolean, id?: string, item?: object, error?: string }}
   */
  function duplicate(id) {
    const original = features.value.find(f => f.id === id)
    if (!original) {
      return { success: false, error: `Feature introuvable : "${id}".` }
    }

    return create({
      ...deepClone(original),
      name: `${original.name} (copie)`
    })
  }

  /**
   * Récupère une feature par ID.
   * @param {string} id
   * @returns {object|null}
   */
  function getById(id) {
    return features.value.find(f => f.id === id) || null
  }

  // ── Import / Export ──

  /**
   * Exporte toutes les features homebrew.
   * @returns {string}
   */
  function exportFeatures() {
    return JSON.stringify({
      category: 'homebrew-combat-features',
      version: 1,
      exportedAt: new Date().toISOString(),
      items: features.value
    }, null, 2)
  }

  /**
   * Importe des features depuis un JSON.
   * @param {string} jsonString
   * @returns {{ success: boolean, imported: number, skipped: number, error?: string }}
   */
  function importFeatures(jsonString) {
    try {
      const parsed = JSON.parse(jsonString)
      const incoming = parsed?.items
      if (!Array.isArray(incoming)) {
        return { success: false, imported: 0, skipped: 0, error: 'Format invalide.' }
      }

      const existingIds = new Set(features.value.map(f => f.id))
      let imported = 0
      let skipped = 0

      for (const item of incoming) {
        if (existingIds.has(item.id)) { skipped++; continue }

        const feature = {
          ...createCombatFeature(item),
          id: item.id || generateFeatureId(item.name),
          source: FEATURE_SOURCE_HOMEBREW,
          sourceRef: 'homebrew',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const validation = validateCombatFeature(feature)
        if (!validation.valid) { skipped++; continue }

        storedFeatures.value = [...storedFeatures.value, feature]
        existingIds.add(feature.id)
        imported++
      }

      return { success: true, imported, skipped }
    } catch (err) {
      return { success: false, imported: 0, skipped: 0, error: `Erreur de parsing : ${err.message}` }
    }
  }

  /**
   * Supprime toutes les features homebrew.
   * @returns {{ success: boolean }}
   */
  function clearAll() {
    storedFeatures.value = []
    return { success: true }
  }

  return {
    features,
    count,
    storageError,
    create,
    update,
    remove,
    duplicate,
    getById,
    exportFeatures,
    importFeatures,
    clearAll
  }
})
