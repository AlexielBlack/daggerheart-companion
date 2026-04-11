<template>
  <div class="table-combat-view">
    <CombatResumeBanner v-if="!liveStore.isActive && liveStore.hasSavedState" />
    <EncounterLive @select-npc="drawer.openNpc($event)" />
    <SceneDrawer />
  </div>
</template>

<script>
import { useSceneDrawer } from '../composables/useSceneDrawer'
import CombatResumeBanner from '../components/CombatResumeBanner.vue'
import EncounterLive from '@modules/encounter/views/EncounterLive.vue'
import SceneDrawer from '../components/SceneDrawer.vue'
import { useEncounterLiveStore } from '@modules/encounter'

export default {
  name: 'TableCombatView',
  components: { CombatResumeBanner, EncounterLive, SceneDrawer },
  setup() {
    const drawer = useSceneDrawer()
    const liveStore = useEncounterLiveStore()
    return { drawer, liveStore }
  }
}
</script>

<style scoped>
.table-combat-view {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
