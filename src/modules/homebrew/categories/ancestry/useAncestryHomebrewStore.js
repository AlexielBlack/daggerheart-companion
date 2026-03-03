/**
 * @module homebrew/categories/ancestry/useAncestryHomebrewStore
 * @description Instance unique du store homebrew pour les ascendances.
 * Importée par les vues homebrew ET par le characterStore (fusion SRD + custom).
 */

import { createHomebrewStore } from '../../core/composables/useHomebrewStore.js'
import { ancestrySchema } from '../../schemas/ancestrySchema.js'

export const useAncestryHomebrewStore = createHomebrewStore(ancestrySchema)
