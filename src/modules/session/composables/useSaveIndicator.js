import { ref } from 'vue'

/**
 * Composable fournissant un indicateur de sauvegarde visuel.
 * markDirty() → isSaving=true, markSaved() → isSaving=false apres delai.
 */
export function useSaveIndicator(feedbackDelay = 600) {
  const isSaving = ref(false)
  let timer = null

  function markDirty() {
    isSaving.value = true
    clearTimeout(timer)
  }

  function markSaved() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      isSaving.value = false
    }, feedbackDelay)
  }

  return { isSaving, markDirty, markSaved }
}
