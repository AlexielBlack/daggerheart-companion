<!--
  NpcManager.vue — Vue principale du module PNJ.
  Layout : liste filtrée à gauche, fiche détaillée à droite.
  Responsive : en mobile, la fiche remplace la liste.
-->
<template>
  <div class="npc-manager">
    <header class="npc-manager__header">
      <h1>PNJs</h1>
      <div class="npc-manager__header-actions">
        <span class="npc-manager__count">{{ store.count }} PNJ{{ store.count > 1 ? 's' : '' }}</span>
        <button
          class="btn btn--primary"
          @click="startCreate"
        >
          + Nouveau PNJ
        </button>
        <button
          class="btn btn--ghost"
          aria-label="Exporter les PNJs"
          @click="exportAll"
        >
          📤
        </button>
        <label class="btn btn--ghost import-label">
          📥
          <input
            type="file"
            accept=".json"
            class="sr-only"
            @change="importFile"
          />
        </label>
      </div>
    </header>

    <NpcFilters
      :search-query="store.searchQuery"
      :filter-status="store.filterStatus"
      :filter-faction="store.filterFaction"
      :filter-location="store.filterLocation"
      :factions="store.allFactions"
      :locations="store.allLocations"
      @update:search-query="store.setSearch"
      @update:filter-status="store.setStatusFilter"
      @update:filter-faction="store.setFactionFilter"
      @update:filter-location="store.setLocationFilter"
      @clear="store.clearFilters"
    />

    <div class="npc-manager__layout">
      <!-- ── Liste (masquée en mobile quand fiche ouverte) ── -->
      <aside
        class="npc-manager__list"
        :class="{ 'npc-manager__list--hidden-mobile': showSheet }"
        aria-label="Liste des PNJs"
      >
        <div
          v-if="store.filteredNpcs.length === 0"
          class="npc-manager__empty"
        >
          <p v-if="store.count === 0">
            Aucun PNJ créé. Commencez par en ajouter un !
          </p>
          <p v-else>
            Aucun PNJ ne correspond aux filtres.
          </p>
        </div>

        <NpcCard
          v-for="npc in store.filteredNpcs"
          :key="npc.id"
          :npc="npc"
          :is-selected="store.selectedNpcId === npc.id"
          @select="handleSelect"
        />
      </aside>

      <!-- ── Fiche détaillée ── -->
      <main
        class="npc-manager__detail"
        :class="{ 'npc-manager__detail--visible-mobile': showSheet }"
      >
        <button
          v-if="showSheet"
          class="btn btn--ghost npc-manager__back"
          @click="closeSheet"
        >
          ← Retour à la liste
        </button>

        <NpcSheet
          v-if="showSheet"
          :npc="currentNpc"
          :other-npcs="store.npcs"
          :factions="store.allFactions"
          :locations="store.allLocations"
          :homebrew-classes="homebrewClasses"
          :all-adversaries="allAdversaries"
          @save="handleSave"
          @delete="handleDelete"
        />

        <div
          v-else
          class="npc-manager__placeholder"
        >
          <p>Sélectionnez un PNJ ou créez-en un nouveau.</p>
        </div>
      </main>
    </div>

    <!-- ── Message d'import ── -->
    <div
      v-if="importMessage"
      class="npc-manager__toast"
      role="status"
    >
      {{ importMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useNpcStore } from '../stores/npcStore.js'
import { useClassHomebrewStore } from '@modules/homebrew/categories/class/useClassHomebrewStore.js'
import { useAdversaryStore } from '@modules/adversaries/stores/adversaryStore.js'
import NpcCard from '../components/NpcCard.vue'
import NpcFilters from '../components/NpcFilters.vue'
import NpcSheet from '../components/NpcSheet.vue'

export default {
  name: 'NpcManager',

  components: {
    NpcCard,
    NpcFilters,
    NpcSheet
  },

  setup() {
    const store = useNpcStore()
    const classHomebrewStore = useClassHomebrewStore()
    const adversaryStore = useAdversaryStore()
    const isCreating = ref(false)
    const importMessage = ref('')

    // Homebrew normalisées pour le build panel
    const homebrewClasses = computed(() =>
      classHomebrewStore.items.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji || '🛠️',
        domains: item.domains || [],
        source: 'custom'
      }))
    )

    // Tous les adversaires pour le combat panel
    const allAdversaries = computed(() => adversaryStore.allItems)

    // PNJ actuellement affiché dans la fiche
    const currentNpc = computed(() => {
      if (isCreating.value) return null
      return store.selectedNpc
    })

    const showSheet = computed(() => {
      return isCreating.value || !!store.selectedNpcId
    })

    // ── Navigation ──
    function handleSelect(id) {
      isCreating.value = false
      store.selectNpc(id)
    }

    function startCreate() {
      store.clearSelection()
      isCreating.value = true
    }

    function closeSheet() {
      isCreating.value = false
      store.clearSelection()
    }

    // ── CRUD ──
    function handleSave(formData) {
      if (isCreating.value) {
        const result = store.create(formData)
        if (result.success) {
          isCreating.value = false
          store.selectNpc(result.id)
        }
      } else if (store.selectedNpcId) {
        store.update(store.selectedNpcId, formData)
      }
    }

    function handleDelete(id) {
      if (!id) return
      store.remove(id)
      isCreating.value = false
    }

    // ── Import / Export ──
    function exportAll() {
      const json = store.exportNpcs()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `daggerheart-npcs-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    function importFile(event) {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const result = store.importNpcs(reader.result)
        if (result.success) {
          importMessage.value = `Import : ${result.imported} PNJ(s) ajouté(s), ${result.skipped} ignoré(s).`
        } else {
          importMessage.value = `Erreur d'import : ${result.error}`
        }
        setTimeout(() => { importMessage.value = '' }, 4000)
      }
      reader.readAsText(file)

      // Reset file input
      event.target.value = ''
    }

    return {
      store,
      currentNpc,
      showSheet,
      isCreating,
      importMessage,
      homebrewClasses,
      allAdversaries,
      handleSelect,
      startCreate,
      closeSheet,
      handleSave,
      handleDelete,
      exportAll,
      importFile
    }
  }
}
</script>

<style scoped>
.npc-manager {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.npc-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.npc-manager__header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text, #f9fafb);
}

.npc-manager__header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.npc-manager__count {
  font-size: 0.8rem;
  color: var(--color-text-muted, #9ca3af);
}

.npc-manager__layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1rem;
  min-height: 60vh;
}

@media (max-width: 768px) {
  .npc-manager__layout {
    grid-template-columns: 1fr;
  }

  .npc-manager__list--hidden-mobile {
    display: none;
  }

  .npc-manager__detail {
    display: none;
  }

  .npc-manager__detail--visible-mobile {
    display: block;
  }
}

.npc-manager__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 70vh;
  padding-right: 0.5rem;
}

.npc-manager__empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.9rem;
}

.npc-manager__detail {
  border-left: 1px solid var(--color-border, #374151);
  padding-left: 1rem;
}

@media (max-width: 768px) {
  .npc-manager__detail {
    border-left: none;
    padding-left: 0;
  }
}

.npc-manager__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.9rem;
}

.npc-manager__back {
  margin-bottom: 0.5rem;
}

.npc-manager__toast {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: var(--color-surface, #1f2937);
  border: 1px solid var(--color-border, #374151);
  color: var(--color-text, #f9fafb);
  font-size: 0.85rem;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* ── Boutons ── */
.btn {
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.btn--primary {
  background: var(--color-primary, #2563eb);
  color: #fff;
}

.btn--ghost {
  background: transparent;
  border: 1px solid var(--color-border, #374151);
  color: var(--color-text-muted, #9ca3af);
}

.btn--ghost:hover {
  border-color: var(--color-primary, #60a5fa);
  color: var(--color-text, #f9fafb);
}

.import-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
