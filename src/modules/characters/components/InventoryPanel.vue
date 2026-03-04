<template>
  <div
    class="inventory-panel"
    aria-label="Inventaire"
  >
    <!-- ═══ Or ═══ -->
    <div class="gold-tracker">
      <span class="gold-tracker__icon">🪙</span>
      <div class="gold-tier">
        <label
          class="gold-label"
          for="gold-handfuls"
        >Poignées</label>
        <div class="gold-controls">
          <button
            class="gold-btn"
            :disabled="gold.handfuls <= 0"
            aria-label="Retirer une poignée d'or"
            @click="$emit('updateGold', 'handfuls', gold.handfuls - 1)"
          >
            −
          </button>
          <input
            id="gold-handfuls"
            type="number"
            class="gold-input"
            :value="gold.handfuls"
            min="0"
            aria-label="Poignées d'or"
            @input="$emit('updateGold', 'handfuls', parseInt($event.target.value) || 0)"
          />
          <button
            class="gold-btn"
            aria-label="Ajouter une poignée d'or"
            @click="$emit('updateGold', 'handfuls', gold.handfuls + 1)"
          >
            +
          </button>
        </div>
      </div>
      <div class="gold-tier">
        <label
          class="gold-label"
          for="gold-bags"
        >Bourses</label>
        <div class="gold-controls">
          <button
            class="gold-btn"
            :disabled="gold.bags <= 0"
            aria-label="Retirer une bourse d'or"
            @click="$emit('updateGold', 'bags', gold.bags - 1)"
          >
            −
          </button>
          <input
            id="gold-bags"
            type="number"
            class="gold-input"
            :value="gold.bags"
            min="0"
            aria-label="Bourses d'or"
            @input="$emit('updateGold', 'bags', parseInt($event.target.value) || 0)"
          />
          <button
            class="gold-btn"
            aria-label="Ajouter une bourse d'or"
            @click="$emit('updateGold', 'bags', gold.bags + 1)"
          >
            +
          </button>
        </div>
      </div>
      <div class="gold-tier">
        <label
          class="gold-label"
          for="gold-chests"
        >Coffres</label>
        <div class="gold-controls">
          <button
            class="gold-btn"
            :disabled="gold.chests <= 0"
            aria-label="Retirer un coffre d'or"
            @click="$emit('updateGold', 'chests', gold.chests - 1)"
          >
            −
          </button>
          <input
            id="gold-chests"
            type="number"
            class="gold-input"
            :value="gold.chests"
            min="0"
            aria-label="Coffres d'or"
            @input="$emit('updateGold', 'chests', parseInt($event.target.value) || 0)"
          />
          <button
            class="gold-btn"
            aria-label="Ajouter un coffre d'or"
            @click="$emit('updateGold', 'chests', gold.chests + 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ Slots d'inventaire ═══ -->
    <div class="inv-slots">
      <div
        v-for="(slot, i) in inventory"
        :key="slot.id || i"
        class="inv-slot"
      >
        <!-- Sélecteur de type -->
        <select
          class="inv-type-select"
          :value="slot.type"
          :aria-label="`Type de l'objet ${i + 1}`"
          @change="$emit('updateItem', i, 'type', $event.target.value)"
        >
          <option value="loot">
            Loot
          </option>
          <option value="consumable">
            Consommable
          </option>
          <option value="custom">
            Libre
          </option>
        </select>

        <!-- Sélection Loot -->
        <select
          v-if="slot.type === 'loot'"
          class="inv-item-select"
          :value="slot.itemId"
          :aria-label="`Choisir un loot – slot ${i + 1}`"
          @change="$emit('updateItem', i, 'itemId', $event.target.value)"
        >
          <option value="">
            — Choisir un loot —
          </option>
          <optgroup
            v-for="group in lootByRarity"
            :key="group.rarity"
            :label="group.label"
          >
            <option
              v-for="item in group.items"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </optgroup>
        </select>

        <!-- Sélection Consommable -->
        <select
          v-if="slot.type === 'consumable'"
          class="inv-item-select"
          :value="slot.itemId"
          :aria-label="`Choisir un consommable – slot ${i + 1}`"
          @change="$emit('updateItem', i, 'itemId', $event.target.value)"
        >
          <option value="">
            — Choisir un consommable —
          </option>
          <optgroup
            v-for="group in consumablesByRarity"
            :key="group.rarity"
            :label="group.label"
          >
            <option
              v-for="item in group.items"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </optgroup>
        </select>

        <!-- Champ libre -->
        <input
          v-if="slot.type === 'custom'"
          type="text"
          class="inv-custom-input"
          :value="slot.customName"
          placeholder="Nom de l'objet…"
          :aria-label="`Nom personnalisé – slot ${i + 1}`"
          @input="$emit('updateItem', i, 'customName', $event.target.value)"
        />

        <!-- Quantité (consommables uniquement) -->
        <div
          v-if="slot.type === 'consumable'"
          class="inv-qty"
        >
          <label
            class="inv-qty-label"
            :for="`inv-qty-${i}`"
          >×</label>
          <input
            :id="`inv-qty-${i}`"
            type="number"
            class="inv-qty-input"
            :value="slot.quantity"
            min="1"
            max="99"
            :aria-label="`Quantité – slot ${i + 1}`"
            @input="$emit('updateItem', i, 'quantity', parseInt($event.target.value) || 1)"
          />
        </div>

        <!-- Supprimer -->
        <button
          class="inv-remove-btn"
          :aria-label="`Supprimer l'objet ${i + 1}`"
          @click="$emit('removeItem', i)"
        >
          ✕
        </button>

        <!-- Description (si objet SRD sélectionné) -->
        <p
          v-if="getItemDescription(slot)"
          class="inv-item-desc"
        >
          <span
            v-if="getItemRarity(slot)"
            class="inv-rarity-badge"
            :class="`inv-rarity-badge--${getItemRarity(slot)}`"
          >{{ rarityLabels[getItemRarity(slot)] }}</span>
          {{ getItemDescription(slot) }}
        </p>
      </div>
    </div>

    <!-- Ajouter un slot -->
    <div class="inv-add-bar">
      <button
        class="inv-add-btn"
        aria-label="Ajouter un loot"
        @click="$emit('addItem', 'loot')"
      >
        + Loot
      </button>
      <button
        class="inv-add-btn inv-add-btn--consumable"
        aria-label="Ajouter un consommable"
        @click="$emit('addItem', 'consumable')"
      >
        + Consommable
      </button>
      <button
        class="inv-add-btn inv-add-btn--custom"
        aria-label="Ajouter un objet libre"
        @click="$emit('addItem', 'custom')"
      >
        + Libre
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { LOOT, getLootById } from '@data/equipment/loot.js'
import { CONSUMABLES, getConsumableById } from '@data/equipment/consumables.js'
import { RARITIES } from '@data/equipment/constants.js'

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'legendary']

/**
 * Regroupe un tableau d'items par rareté, dans l'ordre croissant.
 * @param {Array} items
 * @param {Object} labels
 * @returns {Array<{rarity: string, label: string, items: Array}>}
 */
function groupByRarity(items, labels) {
  const groups = {}
  for (const item of items) {
    const r = item.rarity || 'common'
    if (!groups[r]) groups[r] = []
    groups[r].push(item)
  }
  return RARITY_ORDER
    .filter((r) => groups[r] && groups[r].length > 0)
    .map((r) => ({
      rarity: r,
      label: labels[r] || r,
      items: groups[r]
    }))
}

export default {
  name: 'InventoryPanel',
  props: {
    inventory: { type: Array, default: () => [] },
    gold: { type: Object, default: () => ({ handfuls: 0, bags: 0, chests: 0 }) }
  },
  emits: ['addItem', 'removeItem', 'updateItem', 'updateGold'],
  setup() {
    const rarityLabels = RARITIES

    const lootByRarity = computed(() => groupByRarity(LOOT, RARITIES))
    const consumablesByRarity = computed(() => groupByRarity(CONSUMABLES, RARITIES))

    /** Retrouve la description d'un objet SRD depuis son slot */
    function getItemDescription(slot) {
      if (!slot || !slot.itemId) return ''
      if (slot.type === 'loot') {
        const item = getLootById(slot.itemId)
        return item ? item.description : ''
      }
      if (slot.type === 'consumable') {
        const item = getConsumableById(slot.itemId)
        return item ? item.description : ''
      }
      return ''
    }

    /** Retrouve la rareté d'un objet SRD */
    function getItemRarity(slot) {
      if (!slot || !slot.itemId) return ''
      if (slot.type === 'loot') {
        const item = getLootById(slot.itemId)
        return item ? item.rarity : ''
      }
      if (slot.type === 'consumable') {
        const item = getConsumableById(slot.itemId)
        return item ? item.rarity : ''
      }
      return ''
    }

    return { lootByRarity, consumablesByRarity, rarityLabels, getItemDescription, getItemRarity }
  }
}
</script>

<style scoped>
.inventory-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ── Or ── */
.gold-tracker {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: rgba(234, 179, 8, 0.06);
  border: 1px solid rgba(234, 179, 8, 0.2);
  border-radius: 6px;
  flex-wrap: wrap;
}

.gold-tracker__icon {
  font-size: 1.2rem;
}

.gold-tier {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.gold-label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted, #6b7280);
}

.gold-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.gold-btn {
  width: 22px;
  height: 22px;
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 50%;
  background: transparent;
  color: #eab308;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.gold-btn:hover:not(:disabled) { background: rgba(234, 179, 8, 0.1); }
.gold-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.gold-input {
  width: 36px;
  text-align: center;
  padding: 2px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: #eab308;
  font-size: 0.85rem;
  font-weight: 600;
}

.gold-input::-webkit-inner-spin-button,
.gold-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.gold-input[type="number"] { -moz-appearance: textfield; }

/* ── Slots d'inventaire ── */
.inv-slots {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.inv-slot {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
  flex-wrap: wrap;
  padding: var(--space-xs);
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 4px;
  border: 1px solid var(--border-color, #3a3a5a);
}

.inv-type-select {
  width: 110px;
  flex-shrink: 0;
  padding: 4px 6px;
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.78rem;
  cursor: pointer;
}

.inv-item-select {
  flex: 1;
  min-width: 140px;
  padding: 4px 6px;
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.78rem;
  cursor: pointer;
  text-overflow: ellipsis;
}

.inv-item-select option,
.inv-item-select optgroup,
.inv-type-select option {
  background: var(--bg-secondary, #1f1f3a);
  color: var(--text-primary);
}

.inv-custom-input {
  flex: 1;
  min-width: 140px;
  padding: 4px 8px;
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.78rem;
}

.inv-custom-input::placeholder { color: var(--text-muted, #6b7280); }

.inv-custom-input:focus,
.inv-item-select:focus,
.inv-type-select:focus {
  outline: 2px solid var(--accent-hope, #53a8b6);
  outline-offset: 1px;
}

/* ── Quantité ── */
.inv-qty {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.inv-qty-label {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
  font-weight: 600;
}

.inv-qty-input {
  width: 38px;
  text-align: center;
  padding: 3px;
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.78rem;
}

.inv-qty-input::-webkit-inner-spin-button,
.inv-qty-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.inv-qty-input[type="number"] { -moz-appearance: textfield; }

/* ── Supprimer ── */
.inv-remove-btn {
  width: 22px;
  height: 22px;
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted, #6b7280);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}

.inv-remove-btn:hover {
  border-color: var(--accent-fear, #c84b31);
  color: var(--accent-fear, #c84b31);
}

/* ── Description ── */
.inv-item-desc {
  width: 100%;
  margin: 2px 0 0;
  padding: 4px 8px;
  font-size: 0.72rem;
  color: var(--text-muted, #6b7280);
  line-height: 1.35;
  background: rgba(83, 168, 182, 0.04);
  border-radius: 3px;
}

.inv-rarity-badge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 3px;
  margin-right: 4px;
  vertical-align: middle;
}

.inv-rarity-badge--common { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
.inv-rarity-badge--uncommon { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
.inv-rarity-badge--rare { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.inv-rarity-badge--legendary { background: rgba(168, 85, 247, 0.12); color: #a855f7; }

/* ── Boutons d'ajout ── */
.inv-add-bar {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.inv-add-btn {
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px dashed var(--border-color, #3a3a5a);
  background: transparent;
  color: var(--text-secondary, #a0a0b8);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms;
}

.inv-add-btn:hover {
  border-color: var(--accent-hope, #53a8b6);
  color: var(--accent-hope, #53a8b6);
}

.inv-add-btn--consumable:hover {
  border-color: #22c55e;
  color: #22c55e;
}

.inv-add-btn--custom:hover {
  border-color: #eab308;
  color: #eab308;
}
</style>
