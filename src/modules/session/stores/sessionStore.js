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
  const noteEntriesStorage = useStorage('session-note-entries', [])
  const spotlightStorage = useStorage('session-spotlight-npc', null)
  const fearStorage = useStorage('session-fear', 0)
  const hopeStorage = useStorage('session-hope', 0)

  // Raccourcis vers les refs
  const environmentId = envStorage.data
  const loadedNpcIds = npcsStorage.data
  const sessionNotes = notesStorage.data
  const lastLaunchedEncounterId = lastEncounterStorage.data
  const noteEntries = noteEntriesStorage.data
  const spotlightNpcId = spotlightStorage.data
  const fear = fearStorage.data
  const hope = hopeStorage.data

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

  /** Incrementer le compteur Fear */
  function incrementFear() { fear.value++ }

  /** Decrementer le compteur Fear (plancher a 0) */
  function decrementFear() { if (fear.value > 0) fear.value-- }

  /** Incrementer le compteur Hope global */
  function incrementHopeGlobal() { hope.value++ }

  /** Decrementer le compteur Hope global (plancher a 0) */
  function decrementHopeGlobal() { if (hope.value > 0) hope.value-- }

  /** Basculer le spotlight sur un PNJ */
  function setSpotlight(id) {
    spotlightNpcId.value = spotlightNpcId.value === id ? null : id
  }

  /** Ajouter une entree de notes horodatee */
  function addNoteEntry(text, tag) {
    const now = new Date()
    const timestamp = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    noteEntries.value = [...noteEntries.value, { timestamp, text, tag: tag || null, id: Date.now() }]
  }

  /** Supprimer une entree de notes */
  function removeNoteEntry(id) {
    noteEntries.value = noteEntries.value.filter(e => e.id !== id)
  }

  /** Reinitialiser toute la session */
  function resetSession() {
    environmentId.value = null
    loadedNpcIds.value = []
    sessionNotes.value = ''
    lastLaunchedEncounterId.value = null
    noteEntries.value = []
    spotlightNpcId.value = null
    fear.value = 0
    hope.value = 0
  }

  return {
    // Etat
    environmentId,
    loadedNpcIds,
    sessionNotes,
    lastLaunchedEncounterId,
    noteEntries,
    spotlightNpcId,
    fear,
    hope,
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
    addNoteEntry,
    removeNoteEntry,
    setSpotlight,
    incrementFear,
    decrementFear,
    incrementHopeGlobal,
    decrementHopeGlobal,
    resetSession
  }
})
