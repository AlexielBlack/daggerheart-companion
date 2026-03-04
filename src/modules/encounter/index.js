/**
 * @module encounter
 * @description Module de creation et de gestion live de rencontres Daggerheart.
 */

// Stores
export { useEncounterStore } from './stores/encounterStore'
export { useEncounterLiveStore } from './stores/encounterLiveStore'

// Composants — Builder
export { default as AdversaryPicker } from './components/AdversaryPicker.vue'
export { default as BattlePointsBar } from './components/BattlePointsBar.vue'
export { default as EncounterConfig } from './components/EncounterConfig.vue'
export { default as EncounterSlotList } from './components/EncounterSlotList.vue'
export { default as EncounterSummary } from './components/EncounterSummary.vue'
export { default as EnvironmentPicker } from './components/EnvironmentPicker.vue'
export { default as PcPicker } from './components/PcPicker.vue'
export { default as SavedEncounterList } from './components/SavedEncounterList.vue'

// Composants — Live
export { default as FearHopeTracker } from './components/FearHopeTracker.vue'
export { default as SceneModeSelector } from './components/SceneModeSelector.vue'
export { default as SpotlightToggle } from './components/SpotlightToggle.vue'
export { default as AdversaryLiveCard } from './components/AdversaryLiveCard.vue'

// Composables
export { useEncounterFeatures, classifyAdversaryFeatures } from './composables/useEncounterFeatures'

// Vues
export { default as EncounterBuilder } from './views/EncounterBuilder.vue'
export { default as EncounterLive } from './views/EncounterLive.vue'
