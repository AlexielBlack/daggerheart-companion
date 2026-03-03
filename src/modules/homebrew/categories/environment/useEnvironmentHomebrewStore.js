/**
 * @module homebrew/categories/environment/useEnvironmentHomebrewStore
 * @description Instance unique du store homebrew pour les environnements.
 * Importée par les vues homebrew ET par l'environmentStore principal (fusion SRD + custom).
 */

import { createHomebrewStore } from '../../core/composables/useHomebrewStore.js'
import { environmentSchema } from '../../schemas/environmentSchema.js'

export const useEnvironmentHomebrewStore = createHomebrewStore(environmentSchema)
