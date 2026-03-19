<template>
  <div class="table-rencontres-view">
    <!-- Lancement et chargement de rencontres pour la session -->
    <EncounterLauncher />
    <EnvironmentLoader />
    <EncounterBuilder />
    <SessionHistoryPanel />
  </div>
</template>

<script>
import EncounterLauncher from '../components/EncounterLauncher.vue'
import EnvironmentLoader from '../components/EnvironmentLoader.vue'
import EncounterBuilder from '@modules/encounter/views/EncounterBuilder.vue'
import SessionHistoryPanel from '../components/SessionHistoryPanel.vue'

export default {
  name: 'TableRencontresView',
  components: { EncounterLauncher, EnvironmentLoader, EncounterBuilder, SessionHistoryPanel }
}
</script>
