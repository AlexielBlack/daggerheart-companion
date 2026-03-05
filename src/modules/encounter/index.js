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

// Composants — Live (nouveau layout 3 colonnes)
export { default as PcSidebarCard } from './components/PcSidebarCard.vue'
export { default as AdversaryGroupCard } from './components/AdversaryGroupCard.vue'
export { default as ContextPanel } from './components/ContextPanel.vue'
export { default as CountdownTracker } from './components/CountdownTracker.vue'
export { default as FeatureCard } from './components/FeatureCard.vue'
export { default as EnvironmentPanel } from './components/EnvironmentPanel.vue'

// Composants — Live (legacy, conservés pour compatibilité)
export { default as SceneModeSelector } from './components/SceneModeSelector.vue'
export { default as AdversaryLiveCard } from './components/AdversaryLiveCard.vue'
export { default as PcLivePanel } from './components/PcLivePanel.vue'
export { default as AdversaryTargetPanel } from './components/AdversaryTargetPanel.vue'

// Composables
export { useEncounterFeatures, classifyAdversaryFeatures } from './composables/useEncounterFeatures'
export { useUndoStack } from './composables/useUndoStack'
export { useCombatLog } from './composables/useCombatLog'
export { useSpotlights } from './composables/useSpotlights'

// Vues
export { default as EncounterBuilder } from './views/EncounterBuilder.vue'
export { default as EncounterLive } from './views/EncounterLive.vue'
