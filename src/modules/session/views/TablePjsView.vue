<template>
  <div class="table-pjs-view">
    <!-- Panneau de groupe des PJs pour la session -->
    <PcGroupPanel :characters="characterStore.characters" />
    <CharacterBuilder />
  </div>
</template>

<script>
import PcGroupPanel from '../components/PcGroupPanel.vue'
import CharacterBuilder from '@modules/characters/views/CharacterBuilder.vue'
import { useCharacterStore } from '@modules/characters/stores/characterStore.js'

export default {
  name: 'TablePjsView',
  components: { PcGroupPanel, CharacterBuilder },
  setup() {
    const characterStore = useCharacterStore()
    return { characterStore }
  }
}
</script>
