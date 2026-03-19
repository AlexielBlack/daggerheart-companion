<template>
  <div class="scene-view">
    <SceneActionBar @open-catalogue="drawer.openCatalogue()" />

    <EnvironmentLoader />

    <section class="scene-view__pcs">
      <PcGroupPanel
        :characters="characterStore.characters"
        @select-pc="drawer.openPc($event)"
      />
    </section>

    <section class="scene-view__npcs">
      <NpcGroupPanel
        @open-catalogue="drawer.openCatalogue()"
        @open-npc="drawer.openNpc($event)"
      />
    </section>

    <SessionNotes />

    <section class="scene-view__encounter">
      <EncounterLauncher @open-generator="drawer.openGenerator()" />
    </section>

    <SceneDrawer />
  </div>
</template>

<script>
import { useSceneDrawer } from '../composables/useSceneDrawer'
import { useCharacterStore } from '@modules/characters'
import SceneActionBar from '../components/SceneActionBar.vue'
import EnvironmentLoader from '../components/EnvironmentLoader.vue'
import NpcGroupPanel from '../components/NpcGroupPanel.vue'
import PcGroupPanel from '../components/PcGroupPanel.vue'
import SessionNotes from '../components/SessionNotes.vue'
import EncounterLauncher from '../components/EncounterLauncher.vue'
import SceneDrawer from '../components/SceneDrawer.vue'

export default {
  name: 'SceneView',
  components: {
    SceneActionBar,
    EnvironmentLoader,
    NpcGroupPanel,
    PcGroupPanel,
    SessionNotes,
    EncounterLauncher,
    SceneDrawer
  },
  setup() {
    const drawer = useSceneDrawer()
    const characterStore = useCharacterStore()
    return { drawer, characterStore }
  }
}
</script>

<style scoped>
.scene-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 1rem);
}
</style>
