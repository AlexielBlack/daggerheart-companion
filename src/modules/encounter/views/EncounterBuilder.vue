<template>
  <div class="encounter-builder">
    <header class="builder-header">
      <div class="builder-header__top">
        <div>
          <h1 class="builder-title">
            🗺️ Constructeur de Rencontres
          </h1>
          <p class="builder-subtitle">
            Composez vos rencontres avec le système de Battle Points du SRD Daggerheart.
          </p>
        </div>
        <div
          class="builder-columns-control"
          role="group"
          aria-label="Nombre de colonnes"
        >
          <label
            for="encounter-columns-slider"
            class="builder-columns-label"
          >
            {{ sheetColumns === 0 ? 'Auto' : sheetColumns + ' col.' }}
          </label>
          <input
            id="encounter-columns-slider"
            v-model.number="sheetColumns"
            type="range"
            min="0"
            max="4"
            step="1"
            class="builder-columns-slider"
            aria-label="Colonnes du contenu"
            :list="'encounter-columns-ticks'"
          />
          <datalist id="encounter-columns-ticks">
            <option
              v-for="opt in COLUMN_OPTIONS"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            ></option>
          </datalist>
        </div>
      </div>
    </header>

    <div class="builder-layout">
      <!-- Colonne gauche : configuration + composition -->
      <div
        class="builder-main"
        :class="{ 'builder-main--custom': sheetColumns > 0 }"
        :style="gridStyle"
      >
        <div class="builder-section">
          <EncounterConfig
            :name="store.encounterName"
            :notes="store.encounterNotes"
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
            @update:notes="store.encounterNotes = $event"
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
            @set-tier-override="store.setSlotTierOverride($event.adversaryId, $event.tier)"
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
              📝 Templates de rencontres
            </summary>
            <EncounterTemplatePicker
              :current-tier="store.selectedTier"
              :current-pc-count="store.pcCount"
              @load-template="handleLoadTemplate"
            />
          </details>
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
        <div class="sidebar-section">
          <details>
            <summary class="section-title section-title--clickable">
              📤 Partager / Importer
            </summary>
            <EncounterSharePanel
              :encounter-data="store.serializeEncounter()"
              :is-valid="store.isValid"
              @import="handleImportEncounter"
            />
          </details>
        </div>

        <div class="sidebar-section">
          <details>
            <summary class="section-title section-title--clickable">
              📜 Historique de campagne
              <span
                v-if="historyStore.count > 0"
                class="count-badge"
              >{{ historyStore.count }}</span>
            </summary>
            <EncounterHistory
              :entries="historyStore.all"
              :stats="historyStore.stats"
              @remove="historyStore.remove($event)"
              @clear="historyStore.clear()"
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
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@core/composables/useStorage'
import { useEncounterStore } from '../stores/encounterStore'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useEncounterHistoryStore } from '../stores/encounterHistoryStore'
import EncounterConfig from '../components/EncounterConfig.vue'
import BattlePointsBar from '../components/BattlePointsBar.vue'
import EncounterSlotList from '../components/EncounterSlotList.vue'
import AdversaryPicker from '../components/AdversaryPicker.vue'
import EnvironmentPicker from '../components/EnvironmentPicker.vue'
import EncounterSummary from '../components/EncounterSummary.vue'
import SavedEncounterList from '../components/SavedEncounterList.vue'
import EncounterHistory from '../components/EncounterHistory.vue'
import EncounterSharePanel from '../components/EncounterSharePanel.vue'
import EncounterTemplatePicker from '../components/EncounterTemplatePicker.vue'

export default {
  name: 'EncounterBuilder',
  components: {
    EncounterConfig,
    BattlePointsBar,
    EncounterSlotList,
    AdversaryPicker,
    EnvironmentPicker,
    EncounterSummary,
    SavedEncounterList,
    EncounterHistory,
    EncounterSharePanel,
    EncounterTemplatePicker
  },
  setup() {
    const store = useEncounterStore()
    const liveStore = useEncounterLiveStore()
    const historyStore = useEncounterHistoryStore()
    const router = useRouter()
    const pickerAdversaryOpen = ref(false)
    const notification = ref(null)
    let notificationTimer = null

    // ── Slider colonnes ──
    const { data: sheetColumns } = useStorage('prep-encounter-columns', 0)
    const COLUMN_OPTIONS = [
      { value: 0, label: 'Auto' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' }
    ]
    const gridStyle = computed(() => {
      if (!sheetColumns.value || sheetColumns.value === 0) return {}
      return {
        'grid-template-columns': `repeat(${sheetColumns.value}, 1fr)`
      }
    })

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
      router.push('/table/combat')
    }

    function handleImportEncounter(data) {
      store.loadEncounter(data)
      showNotification(`"${data.name || 'Sans nom'}" importée.`, 'success')
    }

    function handleLoadTemplate(template) {
      store.loadEncounter(template)
      showNotification(`Template "${template.name}" chargé.`, 'success')
    }

    return {
      store,
      historyStore,
      pickerAdversaryOpen,
      notification,
      savedEncounters,
      sheetColumns,
      COLUMN_OPTIONS,
      gridStyle,
      handleSave,
      handleReset,
      handleLoad,
      handleDelete,
      handleLaunch,
      handleImportEncounter,
      handleLoadTemplate
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

.builder-header__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

/* ── Slider colonnes ── */
.builder-columns-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.builder-columns-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #aaa);
  min-width: 3em;
  text-align: right;
}

.builder-columns-slider {
  width: 80px;
  accent-color: var(--color-accent-hope, #53a8b6);
  cursor: pointer;
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
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  align-items: start;
}

@media (min-width: 768px) {
  .builder-layout {
    grid-template-columns: 1fr minmax(320px, 380px);
  }
}

@media (min-width: 1400px) {
  .builder-layout {
    grid-template-columns: 1fr minmax(360px, 440px);
  }
}

.builder-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 1200px) {
  .builder-main:not(.builder-main--custom) {
    grid-template-columns: repeat(2, 1fr);
  }

  .builder-main:not(.builder-main--custom) > .builder-section:first-child {
    grid-column: 1 / -1;
  }
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
