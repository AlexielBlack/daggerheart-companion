<template>
  <div class="table-combat-view">
    <!-- Banniere de reprise et vue combat en direct -->
    <CombatResumeBanner />
    <EncounterLive />
  </div>
</template>

<script>
import CombatResumeBanner from '../components/CombatResumeBanner.vue'
import EncounterLive from '@modules/encounter/views/EncounterLive.vue'

export default {
  name: 'TableCombatView',
  components: { CombatResumeBanner, EncounterLive }
}
</script>
