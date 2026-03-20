<template>
  <div class="character-builder">
    <!-- ═══ En-tete avec controles ═══ -->
    <div class="builder-header">
      <div class="builder-header__left">
        <h3 class="builder-header__title">
          Personnages ({{ store.characters.length }}/{{ store.maxCharacters }})
        </h3>
        <button
          v-if="store.canAddCharacter"
          class="builder-header__add-btn"
          @click="showPicker = true"
        >
          + Nouveau
        </button>
      </div>
      <div
        v-if="store.characters.length > 0"
        class="builder-header__columns-control"
        role="group"
        aria-label="Nombre de colonnes"
      >
        <label
          for="builder-columns-slider"
          class="builder-header__columns-label"
        >
          {{ cardColumns === 0 ? 'Auto' : cardColumns + ' col.' }}
        </label>
        <input
          id="builder-columns-slider"
          v-model.number="cardColumns"
          type="range"
          min="0"
          max="4"
          step="1"
          class="builder-header__columns-slider"
          aria-label="Largeur des fiches"
          :list="'builder-columns-ticks'"
        />
        <datalist id="builder-columns-ticks">
          <option
            v-for="opt in COLUMN_OPTIONS"
            :key="opt.value"
            :value="opt.value"
            :label="opt.label"
          ></option>
        </datalist>
      </div>
    </div>

    <!-- ═══ Picker mode ═══ -->
    <ClassPicker
      v-if="showPicker"
      @select="onClassSelected"
      @cancel="showPicker = false"
    />

    <!-- ═══ Grille de fiches ═══ -->
    <div
      v-else-if="store.characters.length > 0"
      class="builder-grid"
      :class="{ 'builder-grid--custom': cardColumns > 0 }"
      :style="gridStyle"
    >
      <div
        v-for="char in store.characters"
        :key="char.id"
        class="builder-grid__item"
      >
        <div class="builder-grid__item-header">
          <span class="builder-grid__item-name">
            {{ char.name || 'Sans nom' }}
          </span>
          <button
            class="builder-grid__delete-btn"
            :aria-label="`Supprimer ${char.name || 'Sans nom'}`"
            @click="confirmDelete(char.id)"
          >
            ✕
          </button>
        </div>
        <CharacterSheet
          :char="char"
          :class-data="getProps(char).classData"
          :thresholds="getProps(char).thresholds"
          :effective-evasion="getProps(char).effectiveEvasion"
          :effective-max-h-p="getProps(char).effectiveMaxHP"
          :effective-max-stress="getProps(char).effectiveMaxStress"
          :stat-bonuses="getProps(char).statBonuses"
          :subclasses="getProps(char).subclasses"
          :subclass-data="getProps(char).subclassData"
          :ancestry-data="getProps(char).ancestryData"
          :community-data="getProps(char).communityData"
          :ancestries="store.allAncestries"
          :communities="store.allCommunities"
          :armor="store.allArmor"
          :primary-weapons="store.allPrimaryWeapons"
          :secondary-weapons="store.allSecondaryWeapons"
          :available-domains="getProps(char).availableDomains"
          :available-domain-cards="getProps(char).availableDomainCards"
          :loadout-cards="getProps(char).loadoutCards"
          :vault-cards="getProps(char).vaultCards"
          :is-loadout-full="getProps(char).isLoadoutFull"
          :max-loadout="getProps(char).maxLoadout"
          :active-modifiers="getProps(char).activeModifiers"
          :permanent-effects="getProps(char).permanentEffects"
          :effective-armor-score="getProps(char).effectiveArmorScore"
          @update="(...args) => withChar(char.id, () => store.updateField(...args))"
          @apply-selection="(...args) => withChar(char.id, () => store.applySelection(...args))"
          @update-mixed="(...args) => withChar(char.id, () => store.updateMixedAncestry(...args))"
          @mark-h-p="withChar(char.id, () => store.markHP())"
          @clear-h-p="withChar(char.id, () => store.clearHP())"
          @mark-stress="withChar(char.id, () => store.markStress())"
          @clear-stress="withChar(char.id, () => store.clearStress())"
          @mark-armor="withChar(char.id, () => store.markArmor())"
          @clear-armor="withChar(char.id, () => store.clearArmor())"
          @set-hope="(v) => withChar(char.id, () => store.setHope(v))"
          @add-condition="(v) => withChar(char.id, () => store.addCondition(v))"
          @remove-condition="(v) => withChar(char.id, () => store.removeCondition(v))"
          @add-experience="withChar(char.id, () => store.addExperience())"
          @remove-experience="(v) => withChar(char.id, () => store.removeExperience(v))"
          @add-card-to-loadout="(v) => withChar(char.id, () => store.addCardToLoadout(v))"
          @add-card-to-vault="(v) => withChar(char.id, () => store.addCardToVault(v))"
          @move-card-to-loadout="(v) => withChar(char.id, () => store.moveCardToLoadout(v))"
          @move-card-to-vault="(v) => withChar(char.id, () => store.moveCardToVault(v))"
          @remove-card="(v) => withChar(char.id, () => store.removeCard(v))"
          @toggle-effect="(v) => withChar(char.id, () => store.toggleEffect(v))"
          @add-inventory-item="(v) => withChar(char.id, () => store.addInventoryItem(v))"
          @remove-inventory-item="(v) => withChar(char.id, () => store.removeInventoryItem(v))"
          @update-inventory-item="(...args) => withChar(char.id, () => store.updateInventoryItem(...args))"
          @update-gold="(...args) => withChar(char.id, () => store.updateGold(...args))"
          @level-up="withChar(char.id, () => onLevelUp())"
          @rollback="withChar(char.id, () => onRollback())"
        />
      </div>
    </div>

    <!-- ═══ Empty state ═══ -->
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
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useCharacterStore } from '../stores/characterStore'
import { useLevelUpStore } from '@modules/levelup'
import { useConfirmDialog } from '@core/composables/useConfirmDialog.js'
import { useStorage } from '@core/composables/useStorage'
import ClassPicker from '../components/ClassPicker.vue'
import CharacterSheet from '../components/CharacterSheet.vue'
import { LevelUpWizard } from '@modules/levelup'

const COLUMN_OPTIONS = [
  { value: 0, label: 'Auto' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' }
]

export default {
  name: 'CharacterBuilder',
  components: { ClassPicker, CharacterSheet, LevelUpWizard },
  setup() {
    const store = useCharacterStore()
    const levelUpStore = useLevelUpStore()
    const showPicker = ref(false)
    const { confirm } = useConfirmDialog()

    // ── Slider colonnes ──
    const { data: cardColumns } = useStorage('prep-char-columns', 0)

    const gridStyle = computed(() => {
      if (!cardColumns.value || cardColumns.value === 0) return {}
      return {
        'grid-template-columns': `repeat(${cardColumns.value}, 1fr)`
      }
    })

    // ── Props par personnage (cache via computed) ──
    const propsCache = computed(() => {
      const map = {}
      for (const char of store.characters) {
        map[char.id] = store.computePropsForCharacter(char)
      }
      return map
    })

    function getProps(char) {
      return propsCache.value[char.id] || store.computePropsForCharacter(char)
    }

    // ── Sélection automatique pour les mutations ──
    function withChar(charId, fn) {
      store.selectCharacter(charId)
      fn()
    }

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
    async function confirmDelete(charId) {
      const char = store.characters.find((c) => c.id === charId)
      const name = char ? (char.name || 'Sans nom') : ''
      const ok = await confirm({
        message: `Supprimer <strong>${name}</strong> ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer'
      })
      if (ok) {
        store.deleteCharacter(charId)
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

    return {
      store,
      showPicker,
      toast,
      cardColumns,
      COLUMN_OPTIONS,
      gridStyle,
      getProps,
      withChar,
      onClassSelected,
      confirmDelete,
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

/* ── Header ── */
.builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.builder-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.builder-header__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.builder-header__add-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-accent-hope, #53a8b6);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition-fast, 150ms);
}

.builder-header__add-btn:hover { opacity: 0.9; }

/* ── Slider colonnes ── */
.builder-header__columns-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.builder-header__columns-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #aaa);
  min-width: 3em;
  text-align: right;
}

.builder-header__columns-slider {
  width: 80px;
  accent-color: var(--color-accent-hope, #53a8b6);
  cursor: pointer;
}

/* ── Grille de fiches ── */
.builder-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
  align-items: start;
}

@media (min-width: 900px) {
  .builder-grid:not(.builder-grid--custom) {
    grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  }
}

@media (min-width: 1400px) {
  .builder-grid:not(.builder-grid--custom) {
    grid-template-columns: repeat(auto-fit, minmax(560px, 1fr));
  }
}

.builder-grid__item {
  min-width: 0;
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: 8px;
  padding: var(--space-md);
  background: var(--color-surface, rgba(255,255,255,0.03));
}

.builder-grid__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.08));
}

.builder-grid__item-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-primary, #fff);
}

.builder-grid__delete-btn {
  background: none;
  border: none;
  color: var(--color-text-muted, #6b7280);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color var(--transition-fast, 150ms), background var(--transition-fast, 150ms);
}

.builder-grid__delete-btn:hover {
  color: var(--color-accent-fear, #c84b31);
  background: rgba(200, 75, 49, 0.1);
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: var(--space-xl) var(--space-md);
  color: var(--color-text-muted, #6b7280);
}

.empty-state__emoji { font-size: 3rem; margin: 0; }
.empty-state__title { font-size: 1.1rem; font-weight: 600; color: var(--color-text-primary); margin: var(--space-sm) 0 var(--space-xs); }
.empty-state__text { margin: 0 0 var(--space-md); font-size: 0.9rem; }

.empty-state__btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-accent-hope, #53a8b6);
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
.toast--error { background: var(--color-accent-fear, #c84b31); color: #fff; }
.toast--info { background: var(--color-accent-hope, #53a8b6); color: #fff; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
