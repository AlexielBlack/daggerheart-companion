<template>
  <ModuleBoundary
    module-name="Rencontres"
    module-id="encounter"
  >
    <div class="module-placeholder">
      <h2>🗺️ Constructeur de Rencontres</h2>
      <p class="text-secondary">
        Préparez vos rencontres, ajoutez des adversaires et des environnements.
      </p>
      <p class="text-muted text-sm">
        Module en cours de développement — Sprint 2
      </p>
    </div>
  </ModuleBoundary>
</template>

<script>
import ModuleBoundary from '@core/components/ModuleBoundary.vue'

export default {
  name: 'EncounterBuilder',
  components: { ModuleBoundary }
}
</script>

<style scoped>
.module-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
  min-height: 300px;
}
</style>
