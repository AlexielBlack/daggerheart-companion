<template>
  <div
    class="error-fallback"
    role="alert"
    aria-live="assertive"
  >
    <div
      class="error-fallback__icon"
      aria-hidden="true"
    >
      ⚠️
    </div>
    <h2 class="error-fallback__title">
      Une erreur est survenue
    </h2>
    <p class="error-fallback__module">
      Module : {{ module }}
    </p>
    <p
      v-if="error?.message"
      class="error-fallback__message"
    >
      {{ error.message }}
    </p>
    <button
      class="btn btn--primary error-fallback__retry"
      @click="$emit('retry')"
    >
      Réessayer
    </button>
  </div>
</template>

<script>
export default {
  name: 'ErrorFallback',
  props: {
    error: {
      type: Object,
      default: null
    },
    module: {
      type: String,
      default: 'Inconnu'
    }
  },
  emits: ['retry']
}
</script>

<style scoped>
.error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
  min-height: 200px;
}

.error-fallback__icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.error-fallback__title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-sm);
}

.error-fallback__module {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-sm);
}

.error-fallback__message {
  color: var(--color-accent-danger);
  font-size: var(--font-size-sm);
  max-width: 400px;
  margin-bottom: var(--space-lg);
  word-break: break-word;
}

.error-fallback__retry {
  min-width: 120px;
}
</style>
