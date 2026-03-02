<template>
  <div
    :id="`module-${moduleId}`"
    role="region"
    :aria-label="moduleName"
  >
    <slot v-if="!error"></slot>
    <ErrorFallback
      v-else
      :error="error"
      :module="moduleName"
      @retry="reset"
    />
  </div>
</template>

<script>
import { ref, onErrorCaptured } from 'vue'
import ErrorFallback from './ErrorFallback.vue'

export default {
  name: 'ModuleBoundary',
  components: { ErrorFallback },
  props: {
    moduleName: {
      type: String,
      required: true
    },
    moduleId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const error = ref(null)

    onErrorCaptured((err, instance, info) => {
      console.error(`[ModuleBoundary:${props.moduleName}] Erreur capturée:`, err, info)
      error.value = {
        message: err?.message || 'Erreur inconnue',
        info,
        timestamp: Date.now()
      }
      // Retourne false pour empêcher la propagation
      return false
    })

    function reset() {
      error.value = null
    }

    return { error, reset }
  }
}
</script>
