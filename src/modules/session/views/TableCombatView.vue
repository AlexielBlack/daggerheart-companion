<template>
  <div class="table-combat-view">
    <div class="table-combat-view__toolbar">
      <router-link
        to="/table/scene"
        class="table-combat-view__back"
      >
        &larr; Retour a la Scene
      </router-link>
    </div>
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
.table-combat-view__toolbar {
  margin-bottom: var(--space-sm, 0.5rem);
}

.table-combat-view__back {
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  font-size: 0.9em;
}

.table-combat-view__back:hover {
  color: var(--color-text, #fff);
}
</style>
