/**
 * @module homebrew/categories/community/useCommunityHomebrewStore
 * @description Instance unique du store homebrew pour les communautés.
 * Importée par les vues homebrew ET par le communityStore (fusion SRD + custom).
 */

import { createHomebrewStore } from '../../core/composables/useHomebrewStore.js'
import { communitySchema } from '../../schemas/communitySchema.js'

export const useCommunityHomebrewStore = createHomebrewStore(communitySchema)
