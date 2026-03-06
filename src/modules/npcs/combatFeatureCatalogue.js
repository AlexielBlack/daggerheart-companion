/**
 * @module npcs/combatFeatureCatalogue
 * @description Catalogue de combat features pour PNJs — chargement différé.
 *
 * Les 330 KB de JSON (adversaires + cartes domaine) sont chargés via
 * import() dynamique au premier appel de useCombatCatalogue().
 * Cela éjecte les données du bundle principal NpcManager.
 *
 * API publique :
 *  - useCombatCatalogue() : composable retournant { features, loaded, load }
 *  - getFeatureById()     : recherche par ID (après chargement)
 *  - filterFeatures()     : filtrage multi-critères
 *  - groupByActivationType()
 */
import { ref, readonly } from 'vue'

// ═══════════════════════════════════════════════════════════
//  État partagé (singleton)
// ═══════════════════════════════════════════════════════════

const _adversaryFeatures = ref([])
const _domainCardFeatures = ref([])
const _allFeatures = ref([])
const _loaded = ref(false)
const _loading = ref(false)
const _indexById = new Map()

let _loadPromise = null

/**
 * Charge les données JSON de manière asynchrone (une seule fois).
 * Les appels concurrents partagent la même promise.
 * @returns {Promise<void>}
 */
function _loadData() {
  if (_loaded.value) return Promise.resolve()
  if (_loadPromise) return _loadPromise

  _loading.value = true
  _loadPromise = Promise.all([
    import('./data/adversaryFeatures.json'),
    import('./data/domainCardFeatures.json')
  ]).then(([advModule, domModule]) => {
    _adversaryFeatures.value = advModule.default
    _domainCardFeatures.value = domModule.default
    _allFeatures.value = [...advModule.default, ...domModule.default]

    // Construire l'index
    _indexById.clear()
    for (const f of _allFeatures.value) {
      _indexById.set(f.id, f)
    }

    _loading.value = false
    _loaded.value = true
  })

  return _loadPromise
}

// ═══════════════════════════════════════════════════════════
//  Composable
// ═══════════════════════════════════════════════════════════

/**
 * Composable réactif pour le catalogue de combat features.
 * Déclenche le chargement lazy au premier appel.
 *
 * @returns {{
 *   features: import('vue').Ref<object[]>,
 *   adversaryFeatures: import('vue').Ref<object[]>,
 *   domainCardFeatures: import('vue').Ref<object[]>,
 *   loaded: import('vue').Ref<boolean>,
 *   load: () => Promise<void>
 * }}
 */
export function useCombatCatalogue() {
  // Déclencher le chargement si pas encore fait
  if (!_loaded.value && !_loading.value) {
    _loadData()
  }

  return {
    features: readonly(_allFeatures),
    adversaryFeatures: readonly(_adversaryFeatures),
    domainCardFeatures: readonly(_domainCardFeatures),
    loaded: readonly(_loaded),
    load: _loadData
  }
}

// ═══════════════════════════════════════════════════════════
//  Fonctions utilitaires (opèrent sur les données chargées)
// ═══════════════════════════════════════════════════════════

/**
 * Recherche une feature par ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getFeatureById(id) {
  return _indexById.get(id) || null
}

/**
 * Filtre les features par critères multiples.
 * @param {object} filters
 * @param {string} [filters.source]
 * @param {number} [filters.tier]
 * @param {string} [filters.activationType]
 * @param {string[]} [filters.tags]
 * @param {string[]} [filters.themes]
 * @param {string} [filters.search]
 * @returns {object[]}
 */
export function filterFeatures(filters = {}) {
  let result = _allFeatures.value

  if (filters.source) {
    result = result.filter(f => f.source === filters.source)
  }
  if (filters.tier) {
    result = result.filter(f => f.tier <= filters.tier)
  }
  if (filters.activationType) {
    result = result.filter(f => f.activationType === filters.activationType)
  }
  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    result = result.filter(f =>
      f.tags.some(t => filters.tags.includes(t))
    )
  }
  if (Array.isArray(filters.themes) && filters.themes.length > 0) {
    result = result.filter(f =>
      f.themes.some(t => filters.themes.includes(t))
    )
  }
  if (filters.search && typeof filters.search === 'string') {
    const q = filters.search.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
    )
  }

  return result
}

/**
 * Retourne les features groupées par type d'activation.
 * @param {object[]} features
 * @returns {{ passives: object[], actions: object[], reactions: object[] }}
 */
export function groupByActivationType(features) {
  return {
    passives: features.filter(f => f.activationType === 'passive'),
    actions: features.filter(f => f.activationType === 'action'),
    reactions: features.filter(f => f.activationType === 'reaction')
  }
}
