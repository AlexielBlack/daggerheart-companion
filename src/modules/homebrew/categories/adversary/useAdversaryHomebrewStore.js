/**
 * @module homebrew/categories/adversary/useAdversaryHomebrewStore
 * @description Instance unique du store homebrew pour les adversaires.
 * Importée par les vues homebrew ET par l'adversaryStore principal (fusion SRD + custom).
 */

import { createHomebrewStore } from '../../core/composables/useHomebrewStore.js'
import { adversarySchema } from '../../schemas/adversarySchema.js'

export const useAdversaryHomebrewStore = createHomebrewStore(adversarySchema)
