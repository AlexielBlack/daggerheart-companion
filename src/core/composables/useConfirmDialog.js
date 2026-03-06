/**
 * useConfirmDialog — Composable global de dialog de confirmation.
 *
 * Usage côté consommateur :
 *   const { confirm } = useConfirmDialog()
 *   const ok = await confirm({ message: 'Supprimer X ?', confirmLabel: 'Supprimer' })
 *   if (ok) { // effectuer l'action }
 *
 * Usage côté AppShell :
 *   <ConfirmDialog />  ← rendu une seule fois, lit l'état partagé
 */
import { ref, readonly } from 'vue'

// ── État singleton ──

const _visible = ref(false)
const _options = ref({
  message: '',
  title: '',
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  variant: 'danger' // 'danger' | 'warning'
})

let _resolve = null

/**
 * Ouvre un dialog de confirmation et retourne une Promise<boolean>.
 * @param {object} opts
 * @param {string} opts.message — Texte principal (supporte le HTML via v-html)
 * @param {string} [opts.title] — Titre optionnel (ex: "⚠️ Confirmer l'import")
 * @param {string} [opts.confirmLabel='Confirmer'] — Label du bouton de confirmation
 * @param {string} [opts.cancelLabel='Annuler'] — Label du bouton d'annulation
 * @param {string} [opts.variant='danger'] — Variante visuelle du bouton confirm
 * @returns {Promise<boolean>}
 */
function confirm(opts = {}) {
  _options.value = {
    message: opts.message || '',
    title: opts.title || '',
    confirmLabel: opts.confirmLabel || 'Confirmer',
    cancelLabel: opts.cancelLabel || 'Annuler',
    variant: opts.variant || 'danger'
  }
  _visible.value = true

  return new Promise((resolve) => {
    _resolve = resolve
  })
}

/** Appelé par ConfirmDialog.vue quand l'utilisateur clique Confirmer */
function _accept() {
  _visible.value = false
  if (_resolve) {
    _resolve(true)
    _resolve = null
  }
}

/** Appelé par ConfirmDialog.vue quand l'utilisateur annule */
function _cancel() {
  _visible.value = false
  if (_resolve) {
    _resolve(false)
    _resolve = null
  }
}

/**
 * @returns {{
 *   confirm: (opts: object) => Promise<boolean>,
 *   visible: import('vue').Ref<boolean>,
 *   options: import('vue').Ref<object>,
 *   accept: () => void,
 *   cancel: () => void
 * }}
 */
export function useConfirmDialog() {
  return {
    confirm,
    visible: readonly(_visible),
    options: readonly(_options),
    accept: _accept,
    cancel: _cancel
  }
}
