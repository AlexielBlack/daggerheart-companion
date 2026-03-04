<template>
  <div class="character-builder">
    <div class="builder-layout">
      <!-- ═══ Sidebar ═══ -->
      <aside class="builder-sidebar">
        <CharacterList
          :characters="store.characters"
          :selected-id="store.selectedCharacterId"
          :can-add="store.canAddCharacter"
          :max-characters="store.maxCharacters"
          @select="store.selectCharacter"
          @add="showPicker = true"
          @delete="confirmDelete"
        />
      </aside>

      <!-- ═══ Main ═══ -->
      <main class="builder-main">
        <!-- Picker mode -->
        <ClassPicker
          v-if="showPicker"
          @select="onClassSelected"
          @cancel="showPicker = false"
        />

        <!-- Sheet mode -->
        <CharacterSheet
          v-else-if="store.selectedCharacter"
          :char="store.selectedCharacter"
          :class-data="store.selectedCharacterClass"
          :thresholds="store.selectedThresholds"
          :effective-evasion="store.selectedEffectiveEvasion"
          :effective-max-h-p="store.selectedEffectiveMaxHP"
          :effective-max-stress="store.selectedEffectiveMaxStress"
          :stat-bonuses="store.selectedStatBonuses"
          :subclasses="store.availableSubclasses"
          :subclass-data="store.selectedSubclassData"
          :ancestry-data="store.selectedAncestryData"
          :community-data="store.selectedCommunityData"
          :ancestries="store.allAncestries"
          :communities="store.allCommunities"
          :armor="store.allArmor"
          :primary-weapons="store.allPrimaryWeapons"
          :secondary-weapons="store.allSecondaryWeapons"
          :available-domains="store.availableDomains"
          :available-domain-cards="store.availableDomainCards"
          :loadout-cards="store.selectedLoadoutCards"
          :vault-cards="store.selectedVaultCards"
          :is-loadout-full="store.isLoadoutFull"
          :max-loadout="store.selectedMaxLoadout"
          @update="store.updateField"
          @apply-selection="store.applySelection"
          @mark-h-p="store.markHP()"
          @clear-h-p="store.clearHP()"
          @mark-stress="store.markStress()"
          @clear-stress="store.clearStress()"
          @mark-armor="store.markArmor()"
          @clear-armor="store.clearArmor()"
          @set-hope="store.setHope"
          @add-condition="store.addCondition"
          @remove-condition="store.removeCondition"
          @add-experience="store.addExperience()"
          @remove-experience="store.removeExperience"
          @add-card-to-loadout="store.addCardToLoadout"
          @add-card-to-vault="store.addCardToVault"
          @move-card-to-loadout="store.moveCardToLoadout"
          @move-card-to-vault="store.moveCardToVault"
          @remove-card="store.removeCard"
          @level-up="onLevelUp"
          @rollback="onRollback"
        />

        <!-- Empty state -->
        <div
          v-else
          class="empty-state"
        >
          <p class="empty-state__emoji">
            🧙
          </p>
          <p class="empty-state__title">
            Aucun personnage
          </p>
          <p class="empty-state__text">
            Créez votre premier personnage pour commencer.
          </p>
          <button
            class="empty-state__btn"
            @click="showPicker = true"
          >
            + Nouveau personnage
          </button>
        </div>
      </main>
    </div>

    <!-- ═══ Level Up Wizard ═══ -->
    <LevelUpWizard
      @levelup-complete="onLevelUpComplete"
      @levelup-error="onLevelUpError"
    />

    <!-- ═══ Toast notifications ═══ -->
    <Transition name="toast">
      <div
        v-if="toast.visible"
        class="toast"
        :class="`toast--${toast.type}`"
        role="alert"
        aria-live="polite"
      >
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ═══ Confirm delete dialog ═══ -->
    <Transition name="fade">
      <div
        v-if="deleteTarget"
        class="overlay"
        role="button"
        tabindex="0"
        aria-label="Fermer"
        @click="deleteTarget = null"
        @keydown.escape="deleteTarget = null"
      >
        <div
          class="confirm-dialog"
          role="alertdialog"
          aria-label="Confirmer la suppression"
          @click.stop
        >
          <p class="confirm-dialog__text">
            Supprimer <strong>{{ deleteTargetName }}</strong> ? Cette action est irréversible.
          </p>
          <div class="confirm-dialog__actions">
            <button
              class="dialog-btn dialog-btn--cancel"
              @click="deleteTarget = null"
            >
              Annuler
            </button>
            <button
              class="dialog-btn dialog-btn--danger"
              @click="executeDelete"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useCharacterStore } from '../stores/characterStore'
import { useLevelUpStore } from '@modules/levelup'
import CharacterList from '../components/CharacterList.vue'
import ClassPicker from '../components/ClassPicker.vue'
import CharacterSheet from '../components/CharacterSheet.vue'
import { LevelUpWizard } from '@modules/levelup'

export default {
  name: 'CharacterBuilder',
  components: { CharacterList, ClassPicker, CharacterSheet, LevelUpWizard },
  setup() {
    const store = useCharacterStore()
    const levelUpStore = useLevelUpStore()
    const showPicker = ref(false)
    const deleteTarget = ref(null)

    // Toast
    const toast = ref({ visible: false, message: '', type: 'success' })
    let toastTimer = null

    function showToast(message, type = 'success') {
      clearTimeout(toastTimer)
      toast.value = { visible: true, message, type }
      toastTimer = setTimeout(() => { toast.value.visible = false }, 3000)
    }

    // Create character
    function onClassSelected(classId) {
      const id = store.createCharacter(classId)
      if (id) {
        showPicker.value = false
        showToast('Personnage créé !')
      } else {
        showToast('Maximum de personnages atteint.', 'error')
      }
    }

    // Delete character
    function confirmDelete(charId) {
      deleteTarget.value = charId
    }

    const deleteTargetName = computed(() => {
      if (!deleteTarget.value) return ''
      const char = store.characters.find((c) => c.id === deleteTarget.value)
      return char ? (char.name || 'Sans nom') : ''
    })

    function executeDelete() {
      if (deleteTarget.value) {
        store.deleteCharacter(deleteTarget.value)
        deleteTarget.value = null
        showToast('Personnage supprimé.', 'info')
      }
    }

    // Level Up
    function onLevelUp() {
      const opened = levelUpStore.open()
      if (!opened) {
        showToast(levelUpStore.wizardError || 'Impossible de level up.', 'error')
      }
    }

    function onRollback() {
      const result = levelUpStore.rollback()
      if (result.success) {
        showToast('Level up annulé.', 'info')
      } else {
        showToast(result.error || 'Impossible d\'annuler.', 'error')
      }
    }

    function onLevelUpComplete() {
      showToast('Level up appliqué !', 'success')
    }

    function onLevelUpError(error) {
      showToast(error || 'Erreur lors du level up.', 'error')
    }

    // Show picker if no characters
    if (store.characters.length === 0) {
      showPicker.value = false // Start with empty state
    }

    return {
      store,
      showPicker,
      deleteTarget,
      deleteTargetName,
      toast,
      onClassSelected,
      confirmDelete,
      executeDelete,
      onLevelUp,
      onRollback,
      onLevelUpComplete,
      onLevelUpError
    }
  }
}
</script>

<style scoped>
.character-builder {
  position: relative;
  min-height: 100%;
}

.builder-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--space-lg);
  align-items: start;
}

@media (max-width: 800px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }
}

.builder-sidebar {
  position: sticky;
  top: var(--space-md);
}

.builder-main {
  min-width: 0;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  color: var(--text-muted, #6b7280);
}

.empty-state__emoji { font-size: 3rem; margin: 0; }
.empty-state__title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin: var(--space-sm) 0 var(--space-xs); }
.empty-state__text { margin: 0 0 var(--space-md); font-size: 0.9rem; }

.empty-state__btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--accent-hope, #53a8b6);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-fast, 150ms);
}

.empty-state__btn:hover { opacity: 0.9; }

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 1000;
  pointer-events: none;
}

.toast--success { background: #166534; color: #fff; }
.toast--error { background: var(--accent-fear, #c84b31); color: #fff; }
.toast--info { background: var(--accent-hope, #53a8b6); color: #fff; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Confirm dialog ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.confirm-dialog {
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 8px;
  padding: var(--space-lg);
  max-width: 400px;
  width: 90%;
}

.confirm-dialog__text {
  margin: 0 0 var(--space-md);
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.5;
}

.confirm-dialog__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.dialog-btn {
  padding: var(--space-xs) var(--space-md);
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid var(--border-color, #3a3a5a);
}

.dialog-btn--cancel {
  background: transparent;
  color: var(--text-secondary);
}

.dialog-btn--cancel:hover { border-color: var(--text-secondary); }

.dialog-btn--danger {
  background: var(--accent-fear, #c84b31);
  color: #fff;
  border-color: var(--accent-fear, #c84b31);
}

.dialog-btn--danger:hover { opacity: 0.9; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
