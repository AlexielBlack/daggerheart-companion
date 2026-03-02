import { ref } from 'vue'

/**
 * Composable de gestion d'erreurs par module.
 * Fournit un error boundary programmatique pour les composants Vue.
 *
 * @param {string} moduleName - Nom du module pour le logging
 * @returns {{ error: Ref, handleError: Function, reset: Function, withErrorHandling: Function }}
 */
export function useErrorHandler(moduleName = 'unknown') {
  const error = ref(null)

  function handleError(err, context = '') {
    const message = err?.message || String(err)
    console.error(`[${moduleName}]${context ? ` (${context})` : ''}: ${message}`, err)
    error.value = {
      message,
      module: moduleName,
      context,
      timestamp: Date.now()
    }
  }

  function reset() {
    error.value = null
  }

  /**
   * Enveloppe une fonction async dans un try/catch avec gestion d'erreur automatique.
   * @param {Function} fn - Fonction async à exécuter
   * @param {string} context - Contexte pour le logging
   * @returns {Function}
   */
  function withErrorHandling(fn, context = '') {
    return async (...args) => {
      try {
        error.value = null
        return await fn(...args)
      } catch (err) {
        handleError(err, context)
        return undefined
      }
    }
  }

  return { error, handleError, reset, withErrorHandling }
}
