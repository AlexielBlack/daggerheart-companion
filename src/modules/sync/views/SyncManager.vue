<template>
  <div class="sync-manager">
    <header class="sync-manager__header">
      <h1 class="sync-manager__title">
        🔄 Synchronisation
      </h1>
      <p class="sync-manager__subtitle">
        Transférez vos données entre plusieurs appareils.
      </p>
    </header>

    <div class="sync-manager__grid">
      <FileSyncPanel />
      <GistSyncPanel />
      <SyncHistory />
    </div>
  </div>
</template>

<script>
import FileSyncPanel from '../components/FileSyncPanel.vue'
import GistSyncPanel from '../components/GistSyncPanel.vue'
import SyncHistory from '../components/SyncHistory.vue'

export default {
  name: 'SyncManager',

  components: {
    FileSyncPanel,
    GistSyncPanel,
    SyncHistory
  }
}
</script>

<style scoped>
.sync-manager {
  padding: var(--space-lg);
}

.sync-manager__header {
  margin-bottom: var(--space-xl);
}

.sync-manager__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-2xl);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.sync-manager__subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  margin: 0;
}

.sync-manager__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

/* L'historique prend toute la largeur */
.sync-manager__grid > :last-child {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .sync-manager__grid {
    grid-template-columns: 1fr;
  }

  .sync-manager {
    padding: var(--space-md);
  }
}
</style>
