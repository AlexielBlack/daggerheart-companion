<template>
  <div
    class="pc-inv-editor"
    aria-label="Editeur d'inventaire"
  >
    <!-- Gold tracker -->
    <div class="pc-inv-editor__gold">
      <span
        class="pc-inv-editor__gold-icon"
        aria-hidden="true"
      >&#x1FA99;</span>
      <div
        v-for="tier in goldTiers"
        :key="tier.key"
        class="pc-inv-editor__gold-tier"
      >
        <span class="pc-inv-editor__gold-label">{{ tier.label }}</span>
        <div class="pc-inv-editor__gold-controls">
          <button
            class="pc-inv-editor__gold-btn"
            :disabled="(effectiveGold[tier.key] || 0) <= 0"
            :aria-label="'Retirer 1 ' + tier.label"
            @click="$emit('update-gold', tier.key, (effectiveGold[tier.key] || 0) - 1)"
          >
            &minus;
          </button>
          <input
            type="number"
            class="pc-inv-editor__gold-input"
            :value="effectiveGold[tier.key] || 0"
            min="0"
            :aria-label="tier.label"
            @input="$emit('update-gold', tier.key, parseInt($event.target.value) || 0)"
          />
          <button
            class="pc-inv-editor__gold-btn"
            :aria-label="'Ajouter 1 ' + tier.label"
            @click="$emit('update-gold', tier.key, (effectiveGold[tier.key] || 0) + 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- Equipment selects -->
    <div class="pc-inv-editor__equip">
      <div class="pc-inv-editor__equip-row">
        <span class="pc-inv-editor__equip-label">Armure</span>
        <select
          class="pc-inv-editor__equip-select"
          :value="armorId"
          aria-label="Armure equipee"
          @change="$emit('update-equipment', 'armorId', $event.target.value)"
        >
          <option value="">
            — Aucune —
          </option>
          <option
            v-for="item in ARMOR"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </option>
        </select>
      </div>
      <div class="pc-inv-editor__equip-row">
        <span class="pc-inv-editor__equip-label">Arme 1re</span>
        <select
          class="pc-inv-editor__equip-select"
          :value="primaryWeaponId"
          aria-label="Arme principale equipee"
          @change="$emit('update-equipment', 'primaryWeaponId', $event.target.value)"
        >
          <option value="">
            — Aucune —
          </option>
          <option
            v-for="item in PRIMARY_WEAPONS"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }} — {{ item.damage }}
          </option>
        </select>
      </div>
      <div class="pc-inv-editor__equip-row">
        <span class="pc-inv-editor__equip-label">Arme 2de</span>
        <select
          class="pc-inv-editor__equip-select"
          :value="secondaryWeaponId"
          :disabled="isTwoHanded"
          aria-label="Arme secondaire equipee"
          @change="$emit('update-equipment', 'secondaryWeaponId', $event.target.value)"
        >
          <option value="">
            — Aucune —
          </option>
          <option
            v-for="item in SECONDARY_WEAPONS"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }} — {{ item.damage }}
          </option>
        </select>
      </div>
    </div>

    <!-- Items list -->
    <ul
      v-if="inventory && inventory.length > 0"
      class="pc-inv-editor__list"
    >
      <li
        v-for="(slot, i) in inventory"
        :key="slot.id || i"
        class="pc-inv-editor__item"
      >
        <select
          class="pc-inv-editor__type-select"
          :value="slot.type"
          :aria-label="'Type de l\'objet ' + (i + 1)"
          @change="$emit('update-item', i, 'type', $event.target.value)"
        >
          <option
            v-for="t in itemTypes"
            :key="t.value"
            :value="t.value"
          >
            {{ t.label }}
          </option>
        </select>

        <select
          v-if="slot.type !== 'custom'"
          class="pc-inv-editor__item-select"
          :value="slot.itemId"
          :aria-label="'Choisir un objet – slot ' + (i + 1)"
          @change="$emit('update-item', i, 'itemId', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <option
            v-for="item in itemsForType(slot.type)"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </option>
        </select>

        <input
          v-if="slot.type === 'custom'"
          type="text"
          class="pc-inv-editor__custom-input"
          :value="slot.customName"
          placeholder="Nom de l'objet"
          :aria-label="'Nom de l\'objet ' + (i + 1)"
          @input="$emit('update-item', i, 'customName', $event.target.value)"
        />

        <div
          v-if="slot.type === 'consumable'"
          class="pc-inv-editor__qty"
        >
          <button
            class="pc-inv-editor__qty-btn"
            :disabled="slot.quantity <= 1"
            :aria-label="'Reduire quantite slot ' + (i + 1)"
            @click="$emit('update-item', i, 'quantity', slot.quantity - 1)"
          >
            &minus;
          </button>
          <span class="pc-inv-editor__qty-value">x{{ slot.quantity }}</span>
          <button
            class="pc-inv-editor__qty-btn"
            :aria-label="'Augmenter quantite slot ' + (i + 1)"
            @click="$emit('update-item', i, 'quantity', slot.quantity + 1)"
          >
            +
          </button>
        </div>

        <button
          v-if="!confirmingDelete[slot.id]"
          class="pc-inv-editor__delete-btn"
          :aria-label="'Supprimer objet ' + (i + 1)"
          @click="startDelete(slot.id, i)"
        >
          &#x2715;
        </button>
        <button
          v-else
          class="pc-inv-editor__delete-btn pc-inv-editor__delete-btn--confirm"
          :aria-label="'Confirmer suppression objet ' + (i + 1)"
          @click="confirmDelete(slot.id, i)"
        >
          Confirmer ?
        </button>
      </li>
    </ul>

    <p
      v-if="!inventory || inventory.length === 0"
      class="pc-inv-editor__empty"
    >
      Aucun objet.
    </p>

    <!-- Add form -->
    <div
      v-if="showAddForm"
      class="pc-inv-editor__add-form"
    >
      <select
        v-model="newItemType"
        class="pc-inv-editor__type-select"
        aria-label="Type du nouvel objet"
      >
        <option
          v-for="t in itemTypes"
          :key="t.value"
          :value="t.value"
        >
          {{ t.label }}
        </option>
      </select>
      <button
        class="pc-inv-editor__add-confirm"
        @click="onAddItem"
      >
        Ajouter
      </button>
      <button
        class="pc-inv-editor__add-cancel"
        @click="showAddForm = false"
      >
        Annuler
      </button>
    </div>
    <button
      v-else
      class="pc-inv-editor__add-btn"
      @click="showAddForm = true"
    >
      + Ajouter
    </button>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import {
  PRIMARY_WEAPONS,
  SECONDARY_WEAPONS,
  ARMOR,
  LOOT,
  CONSUMABLES
} from '@data/equipment'

export default {
  name: 'PcInventoryEditor',

  props: {
    inventory: {
      type: Array,
      default: () => []
    },
    gold: {
      type: Object,
      default: () => ({ handfuls: 0, bags: 0, chests: 0 })
    },
    primaryWeaponId: {
      type: String,
      default: ''
    },
    secondaryWeaponId: {
      type: String,
      default: ''
    },
    armorId: {
      type: String,
      default: ''
    },
    isTwoHanded: {
      type: Boolean,
      default: false
    }
  },

  emits: ['add-item', 'remove-item', 'update-item', 'update-gold', 'update-equipment'],

  setup(props, { emit }) {
    const goldTiers = [
      { key: 'handfuls', label: 'Poignees' },
      { key: 'bags', label: 'Bourses' },
      { key: 'chests', label: 'Coffres' }
    ]

    const effectiveGold = computed(() => props.gold || { handfuls: 0, bags: 0, chests: 0 })

    const itemTypes = [
      { value: 'loot', label: 'Loot' },
      { value: 'consumable', label: 'Consommable' },
      { value: 'primaryWeapon', label: 'Arme principale' },
      { value: 'secondaryWeapon', label: 'Arme secondaire' },
      { value: 'armor', label: 'Armure' },
      { value: 'custom', label: 'Libre' }
    ]

    function itemsForType(type) {
      switch (type) {
        case 'loot': return LOOT
        case 'consumable': return CONSUMABLES
        case 'primaryWeapon': return PRIMARY_WEAPONS
        case 'secondaryWeapon': return SECONDARY_WEAPONS
        case 'armor': return ARMOR
        default: return []
      }
    }

    const showAddForm = ref(false)
    const newItemType = ref('custom')

    function onAddItem() {
      emit('add-item', newItemType.value)
      showAddForm.value = false
      newItemType.value = 'custom'
    }

    const confirmingDelete = ref({})
    const deleteTimers = {}

    function startDelete(slotId) {
      confirmingDelete.value = { ...confirmingDelete.value, [slotId]: true }
      deleteTimers[slotId] = setTimeout(() => {
        const updated = { ...confirmingDelete.value }
        delete updated[slotId]
        confirmingDelete.value = updated
      }, 3000)
    }

    function confirmDelete(slotId, index) {
      clearTimeout(deleteTimers[slotId])
      const updated = { ...confirmingDelete.value }
      delete updated[slotId]
      confirmingDelete.value = updated
      emit('remove-item', index)
    }

    return {
      goldTiers,
      effectiveGold,
      itemTypes,
      itemsForType,
      showAddForm,
      newItemType,
      onAddItem,
      confirmingDelete,
      startDelete,
      confirmDelete,
      PRIMARY_WEAPONS,
      SECONDARY_WEAPONS,
      ARMOR
    }
  }
}
</script>

<style scoped>
.pc-inv-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ── Equipment selects ── */

.pc-inv-editor__equip {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.pc-inv-editor__equip-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pc-inv-editor__equip-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  min-width: 55px;
  flex-shrink: 0;
}

.pc-inv-editor__equip-select {
  font-size: var(--font-size-xs);
  padding: 2px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  flex: 1;
  min-width: 0;
}

.pc-inv-editor__equip-select:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Gold tracker ── */

.pc-inv-editor__gold {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.pc-inv-editor__gold-tier {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pc-inv-editor__gold-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.pc-inv-editor__gold-controls {
  display: flex;
  align-items: center;
  gap: 2px;
}

.pc-inv-editor__gold-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-inv-editor__gold-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pc-inv-editor__gold-input {
  width: 40px;
  text-align: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  padding: 2px;
}

.pc-inv-editor__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.pc-inv-editor__item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.pc-inv-editor__type-select {
  font-size: var(--font-size-xs);
  padding: 2px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  max-width: 120px;
}

.pc-inv-editor__item-select {
  font-size: var(--font-size-xs);
  padding: 2px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  flex: 1;
  min-width: 100px;
}

.pc-inv-editor__custom-input {
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  flex: 1;
  min-width: 100px;
}

.pc-inv-editor__qty {
  display: flex;
  align-items: center;
  gap: 2px;
}

.pc-inv-editor__qty-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-inv-editor__qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pc-inv-editor__qty-value {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  min-width: 20px;
  text-align: center;
}

.pc-inv-editor__delete-btn {
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.pc-inv-editor__delete-btn:hover {
  color: var(--color-accent-danger);
  border-color: var(--color-accent-danger);
}

.pc-inv-editor__delete-btn--confirm {
  color: #fff;
  background: var(--color-accent-danger);
  border-color: var(--color-accent-danger);
}

.pc-inv-editor__add-form {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.pc-inv-editor__add-confirm {
  font-size: var(--font-size-xs);
  padding: 3px 10px;
  border: 1px solid var(--color-accent-hope);
  border-radius: var(--radius-sm);
  background: var(--color-accent-hope);
  color: #fff;
  cursor: pointer;
}

.pc-inv-editor__add-cancel {
  font-size: var(--font-size-xs);
  padding: 3px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.pc-inv-editor__add-btn {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  align-self: flex-start;
}

.pc-inv-editor__add-btn:hover {
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}

.pc-inv-editor__empty {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}
</style>
