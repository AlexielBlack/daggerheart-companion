/**
 * useFocusTrap — Piège le focus clavier à l'intérieur d'un élément.
 *
 * Usage :
 *   const trapRef = ref(null)
 *   useFocusTrap(trapRef, () => isOpen.value)
 *
 * Fonctionnement :
 * - Au montage (quand isActive() passe à true) :
 *   sauvegarde le focus actuel, focus le premier élément focusable.
 * - Tab / Shift+Tab : boucle à l'intérieur du conteneur.
 * - Au démontage (quand isActive() passe à false) :
 *   restaure le focus précédent.
 */
import { watch, onBeforeUnmount, nextTick } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary'
].join(', ')

/**
 * @param {import('vue').Ref<HTMLElement|null>} containerRef — ref vers l'élément conteneur
 * @param {() => boolean} isActive — fonction réactive indiquant si le trap est actif
 * @param {object} [options]
 * @param {boolean} [options.restoreFocus=true] — restaurer le focus au démontage
 * @param {boolean} [options.autoFocus=true] — focus automatique du premier élément
 */
export function useFocusTrap(containerRef, isActive, options = {}) {
  const { restoreFocus = true, autoFocus = true } = options
  let previouslyFocused = null

  function getFocusableElements() {
    if (!containerRef.value) return []
    return [...containerRef.value.querySelectorAll(FOCUSABLE_SELECTOR)]
      .filter((el) => el.offsetParent !== null) // Exclure les éléments cachés
  }

  function handleKeydown(event) {
    if (event.key !== 'Tab') return

    const elements = getFocusableElements()
    if (elements.length === 0) {
      event.preventDefault()
      return
    }

    const first = elements[0]
    const last = elements[elements.length - 1]

    if (event.shiftKey) {
      // Shift+Tab sur le premier → boucler vers le dernier
      if (document.activeElement === first || !containerRef.value.contains(document.activeElement)) {
        event.preventDefault()
        last.focus()
      }
    } else {
      // Tab sur le dernier → boucler vers le premier
      if (document.activeElement === last || !containerRef.value.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  function activate() {
    previouslyFocused = document.activeElement

    // Attendre le prochain tick pour que le DOM soit rendu
    nextTick(() => {
      if (!containerRef.value) return

      if (autoFocus) {
        const elements = getFocusableElements()
        if (elements.length > 0) {
          elements[0].focus()
        } else {
          // Fallback : rendre le conteneur lui-même focusable
          containerRef.value.setAttribute('tabindex', '-1')
          containerRef.value.focus()
        }
      }

      document.addEventListener('keydown', handleKeydown)
    })
  }

  function deactivate() {
    document.removeEventListener('keydown', handleKeydown)

    if (restoreFocus && previouslyFocused && typeof previouslyFocused.focus === 'function') {
      nextTick(() => {
        previouslyFocused.focus()
        previouslyFocused = null
      })
    }
  }

  const stopWatch = watch(
    isActive,
    (active) => {
      if (active) {
        activate()
      } else {
        deactivate()
      }
    },
    { flush: 'post' }
  )

  onBeforeUnmount(() => {
    deactivate()
    stopWatch()
  })
}
