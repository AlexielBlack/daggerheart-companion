/**
 * @module npcs
 * @description Module PNJ — Gestion des personnages non-joueurs.
 * Fournit store, constantes et composants pour le CRUD des PNJs,
 * le système relationnel PNJ↔PJ et PNJ↔PNJ, et le filtrage avancé.
 *
 * API publique :
 *  - useNpcStore      : Store Pinia CRUD + relations
 *  - constantes       : Statuts, dispositions, types de relation
 *  - NpcCard          : Carte compacte pour liste
 *  - NpcFilters       : Barre de filtres
 *  - NpcSheet         : Fiche complète avec édition
 *  - NpcManager       : Vue principale (liste + fiche)
 */

// Store
export { useNpcStore } from './stores/npcStore.js'

// Constantes
export {
  ALL_NPC_STATUSES,
  NPC_STATUS_META,
  NPC_STATUS_ALLY,
  NPC_STATUS_NEUTRAL,
  NPC_STATUS_HOSTILE,
  NPC_STATUS_DEAD,
  NPC_STATUS_MISSING,
  ALL_DISPOSITIONS,
  DISPOSITION_META,
  DISPOSITION_HOSTILE,
  DISPOSITION_SUSPICIOUS,
  DISPOSITION_NEUTRAL,
  DISPOSITION_FRIENDLY,
  DISPOSITION_ALLIED,
  ALL_RELATION_TYPES,
  RELATION_TYPE_META,
  isValidStatus,
  isValidDisposition,
  isValidRelationType,
  createDefaultNpc
} from './constants.js'

// Composants
export { default as NpcCard } from './components/NpcCard.vue'
export { default as NpcFilters } from './components/NpcFilters.vue'
export { default as NpcSheet } from './components/NpcSheet.vue'
export { default as NpcBuildPanel } from './components/NpcBuildPanel.vue'
export { default as NpcCombatPanel } from './components/NpcCombatPanel.vue'

// Vue
export { default as NpcManager } from './views/NpcManager.vue'
