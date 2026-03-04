/**
 * @module sync
 * @description Module de synchronisation des données Daggerheart Companion.
 *
 * Fournit deux méthodes de synchronisation :
 * - Fichier JSON (export/import local)
 * - GitHub Gist (sync distante via API)
 *
 * Exports :
 * - Composables : useFileSync, useGistSync
 * - Store : useSyncStore
 * - Composants : FileSyncPanel, GistSyncPanel, SyncHistory
 * - Vue : SyncManager
 */

// Composables
export { useFileSync } from './composables/useFileSync.js'
export { useGistSync } from './composables/useGistSync.js'

// Store
export { useSyncStore } from './stores/syncStore.js'

// Composants
export { default as FileSyncPanel } from './components/FileSyncPanel.vue'
export { default as GistSyncPanel } from './components/GistSyncPanel.vue'
export { default as SyncHistory } from './components/SyncHistory.vue'

// Vue
export { default as SyncManager } from './views/SyncManager.vue'
