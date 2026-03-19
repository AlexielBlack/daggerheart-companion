<template>
  <div class="table-pnjs-view">
    <!-- Chargement et gestion des PNJs pour la session -->
    <NpcLoader />
    <NpcManager />
  </div>
</template>

<script>
import NpcLoader from '../components/NpcLoader.vue'
import NpcManager from '@modules/npcs/views/NpcManager.vue'

export default {
  name: 'TablePnjsView',
  components: { NpcLoader, NpcManager }
}
</script>
