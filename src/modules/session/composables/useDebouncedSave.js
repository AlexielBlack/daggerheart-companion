/**
 * @module session/composables/useDebouncedSave
 * @description Composable pour le pattern debounce + save.
 * Retarde l'appel de la fonction de sauvegarde pour eviter les mises a jour
 * trop frequentes (ex: saisie de notes), avec flush immediat sur blur.
 *
 * @param {Function} saveFn - Fonction de sauvegarde a appeler
 * @param {Object} [options]
 * @param {number} [options.delay=500] - Delai en ms avant declenchement
 * @returns {{ debounce, flush }}
 */
export function useDebouncedSave(saveFn, options = {}) {
  const delay = options.delay || 500
  let timer = null

  /**
   * Planifie l'appel de saveFn apres le delai.
   * Annule tout appel precedent en attente.
   * @param {...*} args - Arguments passes a saveFn
   */
  function debounce(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      saveFn(...args)
      timer = null
    }, delay)
  }

  /**
   * Execute immediatement saveFn si un appel est en attente.
   * Utilise typiquement sur @blur pour garantir la sauvegarde.
   * @param {...*} args - Arguments passes a saveFn
   */
  function flush(...args) {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    saveFn(...args)
  }

  return { debounce, flush }
}
