/**
 * @module homebrew/categories/class/useClassHomebrewStore
 * @description Instance unique du store homebrew pour les classes.
 * Importee par les vues homebrew ET par le classStore (fusion SRD + custom).
 */

import { createHomebrewStore } from '../../core/composables/useHomebrewStore.js'
import { classSchema } from '../../schemas/classSchema.js'

export const useClassHomebrewStore = createHomebrewStore(classSchema)
