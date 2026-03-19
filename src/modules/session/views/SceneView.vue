<template>
  <div class="scene-view">
    <SceneActionBar
      :active-tab="activeTab"
      @open-catalogue="drawer.openCatalogue()"
      @change-tab="activeTab = $event"
    />

    <div
      class="scene-view__tab-content"
      role="tabpanel"
      :aria-label="tabLabels[activeTab]"
    >
      <section
        v-if="activeTab === 'personnages'"
        class="scene-view__pcs"
      >
        <PcGroupPanel
          :characters="characterStore.characters"
          @select-pc="drawer.openPc($event)"
        />
      </section>

      <section
        v-if="activeTab === 'pnjs'"
        class="scene-view__npcs"
      >
        <NpcGroupPanel
          @open-catalogue="drawer.openCatalogue()"
          @open-npc="drawer.openNpc($event)"
        />
      </section>

      <section
        v-if="activeTab === 'environnement'"
        class="scene-view__env"
      >
        <EnvironmentLoader />
        <div class="scene-view__encounter">
          <EncounterLauncher @open-generator="drawer.openGenerator()" />
        </div>
      </section>
    </div>

    <SessionNotes />

    <SceneDrawer />
  </div>
</template>

<script>
import { ref } from 'vue'
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
    const activeTab = ref('personnages')

    const tabLabels = {
      personnages: 'Panneau Personnages',
      pnjs: 'Panneau PNJs',
      environnement: 'Panneau Environnement'
    }

    return { drawer, characterStore, activeTab, tabLabels }
  }
}
</script>

<style scoped>
.scene-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 1rem);
}

.scene-view__env {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 1rem);
}
</style>
