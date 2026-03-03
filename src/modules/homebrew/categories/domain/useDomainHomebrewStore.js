/**
 * @module homebrew/categories/domain/useDomainHomebrewStore
 * @description Instance unique du store homebrew pour les domaines.
 * Importee par les vues homebrew ET par le domainStore (fusion SRD + custom).
 */

import { createHomebrewStore } from '../../core/composables/useHomebrewStore.js'
import { domainSchema } from '../../schemas/domainSchema.js'

export const useDomainHomebrewStore = createHomebrewStore(domainSchema)
