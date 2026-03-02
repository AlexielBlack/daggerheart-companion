<template>
  <div
    class="loading-spinner"
    role="status"
    :aria-label="label"
  >
    <div
      class="loading-spinner__ring"
      aria-hidden="true"
    ></div>
    <span class="sr-only">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    label: {
      type: String,
      default: 'Chargement en cours…'
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
}

.loading-spinner__ring {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent-hope);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
