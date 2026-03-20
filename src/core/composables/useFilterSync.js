import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * Synchronise les filtres d'un store Pinia avec les query params de l'URL.
 *
 * A l'initialisation, restaure l'etat du store depuis les query params.
 * Quand les filtres changent, met a jour les query params via router.replace.
 * Les valeurs par defaut sont omises de l'URL pour garder une URL propre.
 *
 * @param {Object} config - Configuration des filtres
 * @param {Object} config.filters - Map de { queryKey: { ref, default, serialize?, deserialize? } }
 *   - ref: la ref Pinia a synchroniser
 *   - default: la valeur par defaut (pour savoir quand omettre le param)
 *   - serialize: (optionnel) fonction pour convertir la valeur en string URL
 *   - deserialize: (optionnel) fonction pour convertir la string URL en valeur
 */
export function useFilterSync(config) {
  const router = useRouter()
  const route = useRoute()

  const filters = config.filters

  // --- Restauration initiale depuis l'URL ---
  function restoreFromUrl() {
    const query = route.query
    for (const [key, def] of Object.entries(filters)) {
      if (query[key] !== undefined && query[key] !== null) {
        const raw = query[key]
        if (def.deserialize) {
          def.ref.value = def.deserialize(raw)
        } else if (Array.isArray(def.default)) {
          // Array : valeurs separees par virgule
          def.ref.value = raw ? raw.split(',').map(v => {
            const num = Number(v)
            return isNaN(num) ? v : num
          }) : []
        } else if (typeof def.default === 'number') {
          def.ref.value = Number(raw)
        } else {
          def.ref.value = raw
        }
      }
    }
  }

  // --- Mise a jour de l'URL quand les filtres changent ---
  function syncToUrl() {
    const query = { ...route.query }
    let changed = false

    for (const [key, def] of Object.entries(filters)) {
      const val = def.ref.value
      let serialized

      if (def.serialize) {
        serialized = def.serialize(val)
      } else if (Array.isArray(val)) {
        serialized = val.length > 0 ? val.join(',') : null
      } else if (typeof val === 'number') {
        serialized = val !== def.default ? String(val) : null
      } else {
        serialized = val !== def.default ? val : null
      }

      if (serialized !== null && serialized !== undefined && serialized !== '') {
        if (query[key] !== serialized) {
          query[key] = serialized
          changed = true
        }
      } else {
        if (query[key] !== undefined) {
          delete query[key]
          changed = true
        }
      }
    }

    if (changed) {
      router.replace({ query })
    }
  }

  // Restaurer au montage
  restoreFromUrl()

  // Watcher sur tous les filtres
  const refs = Object.values(filters).map(f => f.ref)
  watch(refs, syncToUrl, { deep: true })
}
