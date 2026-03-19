import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@core/composables/useStorage'
import { useEnvironmentStore } from '@modules/environments'
import { useNpcStore } from '@modules/npcs'

/**
 * Store de session — gestion de la table de jeu active.
 * Persiste l'environnement, les PNJs charges, les notes et la derniere rencontre.
 */
export const useSessionStore = defineStore('session', () => {
  // ── État persiste ───────────────────────────────────
  const envStorage = useStorage('session-env', null)
  const npcsStorage = useStorage('session-npcs', [])
  const notesStorage = useStorage('session-notes', '')
  const lastEncounterStorage = useStorage('session-last-encounter', null)
  const spotlightStorage = useStorage('session-spotlight-npc', null)

  // Raccourcis vers les refs
  const environmentId = envStorage.data
  const loadedNpcIds = npcsStorage.data
  const sessionNotes = notesStorage.data
  const lastLaunchedEncounterId = lastEncounterStorage.data
  const spotlightNpcId = spotlightStorage.data

  // ── Getters ─────────────────────────────────────────
  const loadedEnvironment = computed(() => {
    if (!environmentId.value) return null
    const envStore = useEnvironmentStore()
    return envStore.allItems.find(e => e.id === environmentId.value) || null
  })

  const loadedNpcs = computed(() => {
    if (loadedNpcIds.value.length === 0) return []
    const npcStore = useNpcStore()
    return loadedNpcIds.value
      .map(id => npcStore.getById(id))
      .filter(Boolean)
  })

  const loadedNpcCount = computed(() => loadedNpcs.value.length)
  const hasEnvironment = computed(() => !!environmentId.value)
  const hasNpcs = computed(() => loadedNpcIds.value.length > 0)

  // ── Actions ─────────────────────────────────────────

  /** Definir l'environnement actif */
  function setEnvironment(id) {
    environmentId.value = id
  }

  /** Retirer l'environnement actif */
  function clearEnvironment() {
    environmentId.value = null
  }

  /** Ajouter un PNJ a la table (sans doublon) */
  function addNpc(id) {
    if (!loadedNpcIds.value.includes(id)) {
      loadedNpcIds.value = [...loadedNpcIds.value, id]
    }
  }

  /** Retirer un PNJ de la table */
  function removeNpc(id) {
    loadedNpcIds.value = loadedNpcIds.value.filter(x => x !== id)
  }

  /** Basculer la presence d'un PNJ */
  function toggleNpc(id) {
    if (loadedNpcIds.value.includes(id)) {
      removeNpc(id)
    } else {
      addNpc(id)
    }
  }

  /** Retirer tous les PNJs */
  function clearNpcs() {
    loadedNpcIds.value = []
  }

  /** Mettre a jour les notes de session */
  function setSessionNotes(text) {
    sessionNotes.value = text
  }

  /** Basculer le spotlight sur un PNJ */
  function setSpotlight(id) {
    spotlightNpcId.value = spotlightNpcId.value === id ? null : id
  }

  /** Reinitialiser toute la session */
  function resetSession() {
    environmentId.value = null
    loadedNpcIds.value = []
    sessionNotes.value = ''
    lastLaunchedEncounterId.value = null
    spotlightNpcId.value = null
  }

  return {
    // Etat
    environmentId,
    loadedNpcIds,
    sessionNotes,
    lastLaunchedEncounterId,
    spotlightNpcId,
    // Getters
    loadedEnvironment,
    loadedNpcs,
    loadedNpcCount,
    hasEnvironment,
    hasNpcs,
    // Actions
    setEnvironment,
    clearEnvironment,
    addNpc,
    removeNpc,
    toggleNpc,
    clearNpcs,
    setSessionNotes,
    setSpotlight,
    resetSession
  }
})
