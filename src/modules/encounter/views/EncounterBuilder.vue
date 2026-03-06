<template>
  <ModuleBoundary
    module-name="Constructeur de Rencontres"
    module-id="encounter"
  >
    <div class="encounter-builder">
      <header class="builder-header">
        <h1 class="builder-title">
          🗺️ Constructeur de Rencontres
        </h1>
        <p class="builder-subtitle">
          Composez vos rencontres avec le système de Battle Points du SRD Daggerheart.
        </p>
      </header>

      <div class="builder-layout">
        <!-- Colonne gauche : configuration + composition -->
        <div class="builder-main">
          <div class="builder-section">
            <EncounterConfig
              :name="store.encounterName"
              :pc-count="store.pcCount"
              :tier="store.selectedTier"
              :intensity="store.selectedIntensity"
              :active-adjustments="store.activeAdjustments"
              :auto-adjustments="store.autoAdjustments"
              :lower-tier-percentage="store.lowerTierInfo.percentage"
              :min-pc="store.minPcCount"
              :max-pc="store.maxPcCount"
              :characters="store.availableCharacters"
              :selected-pc-ids="store.selectedPcIds"
              @update:name="store.encounterName = $event"
              @update:pc-count="store.setPcCount($event)"
              @update:tier="store.setTier($event)"
              @update:intensity="store.setIntensity($event)"
              @toggle-adjustment="store.toggleAdjustment($event)"
              @update:selected-pc-ids="store.setSelectedPcIds($event)"
            />
          </div>

          <div class="builder-section">
            <BattlePointsBar
              :total="store.totalBattlePoints"
              :spent="store.spentBattlePoints"
              :remaining="store.remainingBattlePoints"
              :slots="store.adversarySlotsDetailed"
              :show-breakdown="true"
            />
          </div>

          <div class="builder-section">
            <h2 class="section-title">
              Adversaires
            </h2>
            <EncounterSlotList
              :slots="store.adversarySlotsDetailed"
              @increment="store.addAdversary($event)"
              @decrement="store.removeAdversary($event)"
              @remove-all="store.setAdversaryQuantity($event, 0)"
            />
          </div>

          <div class="builder-section">
            <details
              class="picker-details"
              :open="pickerAdversaryOpen"
            >
              <summary
                class="section-title section-title--clickable"
                role="button"
                tabindex="0"
                @click.prevent="pickerAdversaryOpen = !pickerAdversaryOpen"
                @keydown.enter.prevent="pickerAdversaryOpen = !pickerAdversaryOpen"
              >
                ➕ Ajouter des adversaires
              </summary>
              <AdversaryPicker
                :current-slots="store.adversarySlots"
                @add="store.addAdversary($event)"
                @remove="store.removeAdversary($event)"
              />
            </details>
          </div>

          <div class="builder-section">
            <details class="picker-details">
              <summary class="section-title section-title--clickable">
                🌍 Environnement
                <span
                  v-if="store.selectedEnvironment"
                  class="env-badge"
                >
                  {{ store.selectedEnvironment.name }}
                </span>
              </summary>
              <EnvironmentPicker
                :selected-id="store.selectedEnvironmentId"
                @select="store.setEnvironment($event)"
              />
            </details>
          </div>
        </div>

        <!-- Colonne droite : résumé + sauvegarde -->
        <aside class="builder-sidebar">
          <div class="sidebar-section">
            <EncounterSummary
              :adversary-count="store.totalAdversaryCount"
              :total-h-p="store.totalAdversaryHP"
              :total-stress="store.totalAdversaryStress"
              :intensity="store.currentIntensity"
              :environment="store.selectedEnvironment"
              :warnings="store.warnings"
              :is-valid="store.isValid"
              @save="handleSave"
              @reset="handleReset"
              @launch="handleLaunch"
            />
          </div>

          <div class="sidebar-section">
            <details>
              <summary class="section-title section-title--clickable">
                📋 Rencontres sauvegardées
                <span
                  v-if="savedEncounters.length > 0"
                  class="count-badge"
                >{{ savedEncounters.length }}</span>
              </summary>
              <SavedEncounterList
                :encounters="savedEncounters"
                @load="handleLoad($event)"
                @delete="handleDelete($event)"
              />
            </details>
          </div>
        </aside>
      </div>

      <div
        v-if="notification"
        class="builder-notification"
        :class="`builder-notification--${notification.type}`"
        role="status"
        aria-live="polite"
      >
        {{ notification.message }}
      </div>
    </div>
  </ModuleBoundary>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import { useEncounterStore } from '../stores/encounterStore'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import EncounterConfig from '../components/EncounterConfig.vue'
import BattlePointsBar from '../components/BattlePointsBar.vue'
import EncounterSlotList from '../components/EncounterSlotList.vue'
import AdversaryPicker from '../components/AdversaryPicker.vue'
import EnvironmentPicker from '../components/EnvironmentPicker.vue'
import EncounterSummary from '../components/EncounterSummary.vue'
import SavedEncounterList from '../components/SavedEncounterList.vue'

export default {
  name: 'EncounterBuilder',
  components: {
    ModuleBoundary,
    EncounterConfig,
    BattlePointsBar,
    EncounterSlotList,
    AdversaryPicker,
    EnvironmentPicker,
    EncounterSummary,
    SavedEncounterList
  },
  setup() {
    const store = useEncounterStore()
    const liveStore = useEncounterLiveStore()
    const router = useRouter()
    const pickerAdversaryOpen = ref(false)
    const notification = ref(null)
    let notificationTimer = null

    const savedEncounters = computed(() => {
      const list = store.savedEncountersList
      return Array.isArray(list) ? list : []
    })

    function showNotification(message, type = 'success') {
      if (notificationTimer) clearTimeout(notificationTimer)
      notification.value = { message, type }
      notificationTimer = setTimeout(() => {
        notification.value = null
      }, 3000)
    }

    function handleSave() {
      try {
        store.saveEncounter()
        showNotification('Rencontre sauvegardée !', 'success')
      } catch {
        showNotification('Erreur de sauvegarde.', 'error')
      }
    }

    function handleReset() {
      store.resetEncounter()
      showNotification('Rencontre réinitialisée.', 'info')
    }

    function handleLoad(encounter) {
      store.loadEncounter(encounter)
      showNotification(`"${encounter.name}" chargée.`, 'success')
    }

    function handleDelete(encounterId) {
      store.deleteSavedEncounter(encounterId)
      showNotification('Rencontre supprimée.', 'info')
    }

    function handleLaunch() {
      const data = store.serializeEncounter()
      liveStore.startEncounter(data)
      router.push('/encounters/live')
    }

    return {
      store,
      pickerAdversaryOpen,
      notification,
      savedEncounters,
      handleSave,
      handleReset,
      handleLoad,
      handleDelete,
      handleLaunch
    }
  }
}
</script>

<style scoped>
.encounter-builder {
  padding: var(--space-md);
  position: relative;
}

.builder-header {
  margin-bottom: var(--space-lg);
}

.builder-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.6rem;
  color: var(--color-text-primary);
  margin: 0;
}

.builder-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: var(--space-xs) 0 0;
}

.builder-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-lg);
  align-items: start;
}

@media (max-width: 768px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }
}

.builder-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.builder-section {
  padding: var(--space-md);
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 8px;
}

.builder-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  position: sticky;
  top: var(--space-md);
}

.sidebar-section {
  padding: var(--space-md);
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 8px;
}

.section-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1rem;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.section-title--clickable {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.picker-details {
  padding: var(--space-md);
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 8px;
}

.picker-details[open] > summary {
  margin-bottom: var(--space-sm);
}

.env-badge {
  font-size: 0.75rem;
  font-weight: 400;
  font-family: inherit;
  padding: 2px 8px;
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope, #53a8b6);
  border-radius: 10px;
}

.count-badge {
  display: inline-block;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: inherit;
  background: var(--color-accent-hope, #53a8b6);
  color: var(--color-bg-primary, #1a1a2e);
  border-radius: 9px;
}

.builder-notification {
  position: fixed;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 100;
  animation: notif-in 200ms ease-out;
}

.builder-notification--success {
  background: rgba(34, 197, 94, 0.9);
  color: #fff;
}

.builder-notification--error {
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
}

.builder-notification--info {
  background: rgba(59, 130, 246, 0.9);
  color: #fff;
}

@keyframes notif-in {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
