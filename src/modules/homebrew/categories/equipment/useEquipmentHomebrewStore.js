/**
 * @module homebrew/categories/equipment/useEquipmentHomebrewStore
 * @description Instance unique du store homebrew pour l'équipement.
 * Importée par les vues homebrew ET par l'equipmentStore principal (fusion SRD + custom).
 */

import { createHomebrewStore } from '../../core/composables/useHomebrewStore.js'
import { equipmentSchema } from '../../schemas/equipmentSchema.js'

export const useEquipmentHomebrewStore = createHomebrewStore(equipmentSchema)
