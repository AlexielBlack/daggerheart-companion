<template>
  <ModuleBoundary
    module-name="Personnages"
    module-id="characters"
  >
    <div class="module-placeholder">
      <h2>🧙 Fiches de Personnages</h2>
      <p class="text-secondary">
        Gérez les fiches de vos joueurs : traits, HP, équipement, et plus.
      </p>
      <p class="text-muted text-sm">
        Module en cours de développement — Sprint 4
      </p>
    </div>
  </ModuleBoundary>
</template>

<script>
import ModuleBoundary from '@core/components/ModuleBoundary.vue'

export default {
  name: 'CharacterList',
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
