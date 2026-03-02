<template>
  <ModuleBoundary
    module-name="Lanceur de Dés"
    module-id="dice"
  >
    <div class="module-placeholder">
      <h2>🎲 Lanceur de Dés</h2>
      <p class="text-secondary">
        Lancez les Duality Dice, des pools de dés, avec avantage ou désavantage.
      </p>
      <p class="text-muted text-sm">
        Module en cours de développement — Sprint 5
      </p>
    </div>
  </ModuleBoundary>
</template>

<script>
import ModuleBoundary from '@core/components/ModuleBoundary.vue'

export default {
  name: 'DiceRoller',
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
