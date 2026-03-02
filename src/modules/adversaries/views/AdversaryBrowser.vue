<template>
  <ModuleBoundary
    module-name="Adversaires"
    module-id="adversaries"
  >
    <div class="module-placeholder">
      <h2>⚔️ Bibliothèque d'Adversaires</h2>
      <p class="text-secondary">
        Consultez et filtrez les adversaires par tier, type et nom.
      </p>
      <p class="text-muted text-sm">
        Module en cours de développement — Sprint 1
      </p>
    </div>
  </ModuleBoundary>
</template>

<script>
import ModuleBoundary from '@core/components/ModuleBoundary.vue'

export default {
  name: 'AdversaryBrowser',
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
