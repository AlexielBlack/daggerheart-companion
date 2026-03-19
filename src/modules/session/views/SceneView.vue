<template>
  <div class="scene-view">
    <EnvironmentLoader />

    <section class="scene-view__npcs">
      <NpcLoader @select-npc="drawer.openNpc($event)" />
      <button
        class="scene-view__catalogue-btn"
        @click="drawer.openCatalogue()"
      >
        Tout
      </button>
    </section>

    <section class="scene-view__pcs">
      <PcGroupPanel @select-pc="drawer.openPc($event)" />
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
import EnvironmentLoader from '../components/EnvironmentLoader.vue'
import NpcLoader from '../components/NpcLoader.vue'
import PcGroupPanel from '../components/PcGroupPanel.vue'
import SessionNotes from '../components/SessionNotes.vue'
import EncounterLauncher from '../components/EncounterLauncher.vue'
import SceneDrawer from '../components/SceneDrawer.vue'

export default {
  name: 'SceneView',
  components: {
    EnvironmentLoader,
    NpcLoader,
    PcGroupPanel,
    SessionNotes,
    EncounterLauncher,
    SceneDrawer
  },
  setup() {
    const drawer = useSceneDrawer()
    return { drawer }
  }
}
</script>

<style scoped>
.scene-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 1rem);
}

.scene-view__npcs {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 0.5rem);
}

.scene-view__npcs > :first-child {
  flex: 1;
}

.scene-view__catalogue-btn {
  white-space: nowrap;
  background: var(--color-surface, #1a1a2e);
  color: var(--color-text-secondary, #aaa);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  cursor: pointer;
  font-size: 0.85em;
}
</style>
