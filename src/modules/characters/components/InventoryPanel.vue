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
          <option value="primaryWeapon">
            Arme principale
          </option>
          <option value="secondaryWeapon">
            Arme secondaire
          </option>
          <option value="armor">
            Armure
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
            v-if="recommendedLoot.length"
            label="★ Recommandé"
          >
            <option
              v-for="item in recommendedLoot"
              :key="'rec-' + item.id"
              :value="item.id"
            >
              ★ {{ item.name }}
            </option>
          </optgroup>
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
            v-if="recommendedConsumable.length"
            label="★ Recommandé"
          >
            <option
              v-for="item in recommendedConsumable"
              :key="'rec-' + item.id"
              :value="item.id"
            >
              ★ {{ item.name }}
            </option>
          </optgroup>
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

        <!-- Sélection Arme Principale -->
        <select
          v-if="slot.type === 'primaryWeapon'"
          class="inv-item-select"
          :value="slot.itemId"
          :aria-label="`Choisir une arme principale – slot ${i + 1}`"
          @change="$emit('updateItem', i, 'itemId', $event.target.value)"
        >
          <option value="">
            — Choisir une arme principale —
          </option>
          <optgroup
            v-if="recommendedPrimaryWeapon.length"
            label="★ Recommandé"
          >
            <option
              v-for="item in recommendedPrimaryWeapon"
              :key="'rec-' + item.id"
              :value="item.id"
            >
              ★ {{ item.name }} — {{ item.trait }} {{ item.range }} — {{ item.damage }}
            </option>
          </optgroup>
          <optgroup
            v-for="group in primaryWeaponsByTier"
            :key="group.tier"
            :label="group.label"
          >
            <option
              v-for="item in group.items"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }} — {{ item.trait }} {{ item.range }} — {{ item.damage }}
            </option>
          </optgroup>
        </select>

        <!-- Sélection Arme Secondaire -->
        <select
          v-if="slot.type === 'secondaryWeapon'"
          class="inv-item-select"
          :value="slot.itemId"
          :aria-label="`Choisir une arme secondaire – slot ${i + 1}`"
          @change="$emit('updateItem', i, 'itemId', $event.target.value)"
        >
          <option value="">
            — Choisir une arme secondaire —
          </option>
          <optgroup
            v-if="recommendedSecondaryWeapon.length"
            label="★ Recommandé"
          >
            <option
              v-for="item in recommendedSecondaryWeapon"
              :key="'rec-' + item.id"
              :value="item.id"
            >
              ★ {{ item.name }} — {{ item.trait }} {{ item.range }} — {{ item.damage }}
            </option>
          </optgroup>
          <optgroup
            v-for="group in secondaryWeaponsByTier"
            :key="group.tier"
            :label="group.label"
          >
            <option
              v-for="item in group.items"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }} — {{ item.trait }} {{ item.range }} — {{ item.damage }}
            </option>
          </optgroup>
        </select>

        <!-- Sélection Armure -->
        <select
          v-if="slot.type === 'armor'"
          class="inv-item-select"
          :value="slot.itemId"
          :aria-label="`Choisir une armure – slot ${i + 1}`"
          @change="$emit('updateItem', i, 'itemId', $event.target.value)"
        >
          <option value="">
            — Choisir une armure —
          </option>
          <optgroup
            v-if="recommendedArmor.length"
            label="★ Recommandé"
          >
            <option
              v-for="item in recommendedArmor"
              :key="'rec-' + item.id"
              :value="item.id"
            >
              ★ {{ item.name }} — {{ item.thresholds.major }}/{{ item.thresholds.severe }} — Score {{ item.baseScore }}
            </option>
          </optgroup>
          <optgroup
            v-for="group in armorByTier"
            :key="group.tier"
            :label="group.label"
          >
            <option
              v-for="item in group.items"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }} — {{ item.thresholds.major }}/{{ item.thresholds.severe }} — Score {{ item.baseScore }}
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
          <span
            v-if="getItemTier(slot)"
            class="inv-tier-badge"
          >Tier {{ getItemTier(slot) }}</span>
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
        class="inv-add-btn inv-add-btn--weapon"
        aria-label="Ajouter une arme principale"
        @click="$emit('addItem', 'primaryWeapon')"
      >
        + Arme 1re
      </button>
      <button
        class="inv-add-btn inv-add-btn--weapon"
        aria-label="Ajouter une arme secondaire"
        @click="$emit('addItem', 'secondaryWeapon')"
      >
        + Arme 2de
      </button>
      <button
        class="inv-add-btn inv-add-btn--armor"
        aria-label="Ajouter une armure"
        @click="$emit('addItem', 'armor')"
      >
        + Armure
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
import { PRIMARY_WEAPONS, getPrimaryWeaponById } from '@data/equipment/primaryWeapons.js'
import { SECONDARY_WEAPONS, getSecondaryWeaponById } from '@data/equipment/secondaryWeapons.js'
import { ARMOR, getArmorById } from '@data/equipment/armor.js'
import { RARITIES } from '@data/equipment/constants.js'
import { getRecommendedIds } from '@data/equipment/classRecommendations.js'

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'legendary']

const TIER_LABELS = {
  1: 'Tier 1 (Niveau 1)',
  2: 'Tier 2 (Niveaux 2–4)',
  3: 'Tier 3 (Niveaux 5–7)',
  4: 'Tier 4 (Niveaux 8+)'
}

/**
 * Regroupe un tableau d'items par rareté, dans l'ordre croissant.
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

/**
 * Regroupe un tableau d'items par tier.
 */
function groupByTier(items) {
  const tiers = {}
  for (const item of items) {
    const t = item.tier || 1
    if (!tiers[t]) tiers[t] = []
    tiers[t].push(item)
  }
  return Object.keys(tiers)
    .sort((a, b) => Number(a) - Number(b))
    .map((t) => ({
      tier: Number(t),
      label: TIER_LABELS[t] || `Tier ${t}`,
      items: tiers[t]
    }))
}

/** Résout un objet SRD depuis un slot d'inventaire */
function resolveItem(slot) {
  if (!slot || !slot.itemId) return null
  switch (slot.type) {
    case 'loot': return getLootById(slot.itemId)
    case 'consumable': return getConsumableById(slot.itemId)
    case 'primaryWeapon': return getPrimaryWeaponById(slot.itemId)
    case 'secondaryWeapon': return getSecondaryWeaponById(slot.itemId)
    case 'armor': return getArmorById(slot.itemId)
    default: return null
  }
}

export default {
  name: 'InventoryPanel',
  props: {
    inventory: { type: Array, default: () => [] },
    gold: { type: Object, default: () => ({ handfuls: 0, bags: 0, chests: 0 }) },
    classId: { type: String, default: '' }
  },
  emits: ['addItem', 'removeItem', 'updateItem', 'updateGold'],
  setup(props) {
    const rarityLabels = RARITIES

    const lootByRarity = computed(() => groupByRarity(LOOT, RARITIES))
    const consumablesByRarity = computed(() => groupByRarity(CONSUMABLES, RARITIES))
    const primaryWeaponsByTier = computed(() => groupByTier(PRIMARY_WEAPONS))
    const secondaryWeaponsByTier = computed(() => groupByTier(SECONDARY_WEAPONS))
    const armorByTier = computed(() => groupByTier(ARMOR))

    // ── Recommandations par classe ──
    const recommendedLoot = computed(() =>
      getRecommendedIds(props.classId, 'loot')
        .map(getLootById)
        .filter(Boolean)
    )
    const recommendedConsumable = computed(() =>
      getRecommendedIds(props.classId, 'consumable')
        .map(getConsumableById)
        .filter(Boolean)
    )
    const recommendedPrimaryWeapon = computed(() =>
      getRecommendedIds(props.classId, 'primaryWeapon')
        .map(getPrimaryWeaponById)
        .filter(Boolean)
    )
    const recommendedSecondaryWeapon = computed(() =>
      getRecommendedIds(props.classId, 'secondaryWeapon')
        .map(getSecondaryWeaponById)
        .filter(Boolean)
    )
    const recommendedArmor = computed(() =>
      getRecommendedIds(props.classId, 'armor')
        .map(getArmorById)
        .filter(Boolean)
    )

    /** Construit la description d'un objet SRD selon son type */
    function getItemDescription(slot) {
      const item = resolveItem(slot)
      if (!item) return ''
      if (slot.type === 'primaryWeapon' || slot.type === 'secondaryWeapon') {
        const parts = [`${item.trait} · ${item.range} · ${item.damage}`]
        if (item.burden) parts.push(`(${item.burden})`)
        if (item.feature) parts.push(`— ${item.feature}`)
        return parts.join(' ')
      }
      if (slot.type === 'armor') {
        const parts = [`Seuils ${item.thresholds.major}/${item.thresholds.severe} · Score ${item.baseScore}`]
        if (item.feature) parts.push(`— ${item.feature}`)
        return parts.join(' ')
      }
      return item.description || ''
    }

    /** Retrouve la rareté d'un objet SRD (loot/consommables uniquement) */
    function getItemRarity(slot) {
      const item = resolveItem(slot)
      if (!item) return ''
      if (slot.type === 'loot' || slot.type === 'consumable') {
        return item.rarity || ''
      }
      return ''
    }

    /** Retrouve le tier d'un objet (armes/armures) */
    function getItemTier(slot) {
      const item = resolveItem(slot)
      if (!item) return 0
      if (slot.type === 'primaryWeapon' || slot.type === 'secondaryWeapon' || slot.type === 'armor') {
        return item.tier || 0
      }
      return 0
    }

    return {
      lootByRarity,
      consumablesByRarity,
      primaryWeaponsByTier,
      secondaryWeaponsByTier,
      armorByTier,
      rarityLabels,
      recommendedLoot,
      recommendedConsumable,
      recommendedPrimaryWeapon,
      recommendedSecondaryWeapon,
      recommendedArmor,
      getItemDescription,
      getItemRarity,
      getItemTier
    }
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
  color: var(--color-text-muted, #6b7280);
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
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
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
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 4px;
  border: 1px solid var(--color-border, #3a3a5a);
}

.inv-type-select {
  width: 130px;
  flex-shrink: 0;
  padding: 4px 6px;
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.78rem;
  cursor: pointer;
}

.inv-item-select {
  flex: 1;
  min-width: 140px;
  padding: 4px 6px;
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.78rem;
  cursor: pointer;
  text-overflow: ellipsis;
}

.inv-item-select option,
.inv-item-select optgroup,
.inv-type-select option {
  background: var(--color-bg-secondary, #1f1f3a);
  color: var(--color-text-primary);
}

.inv-custom-input {
  flex: 1;
  min-width: 140px;
  padding: 4px 8px;
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.78rem;
}

.inv-custom-input::placeholder { color: var(--color-text-muted, #6b7280); }

.inv-custom-input:focus,
.inv-item-select:focus,
.inv-type-select:focus {
  outline: 2px solid var(--color-accent-hope, #53a8b6);
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
  color: var(--color-text-muted, #6b7280);
  font-weight: 600;
}

.inv-qty-input {
  width: 38px;
  text-align: center;
  padding: 3px;
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.78rem;
}

.inv-qty-input::-webkit-inner-spin-button,
.inv-qty-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.inv-qty-input[type="number"] { -moz-appearance: textfield; }

/* ── Supprimer ── */
.inv-remove-btn {
  width: 22px;
  height: 22px;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted, #6b7280);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}

.inv-remove-btn:hover {
  border-color: var(--color-accent-fear, #c84b31);
  color: var(--color-accent-fear, #c84b31);
}

/* ── Description ── */
.inv-item-desc {
  width: 100%;
  margin: 2px 0 0;
  padding: 4px 8px;
  font-size: 0.72rem;
  color: var(--color-text-muted, #6b7280);
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

.inv-tier-badge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 3px;
  margin-right: 4px;
  vertical-align: middle;
  background: rgba(251, 146, 60, 0.12);
  color: #fb923c;
}

/* ── Boutons d'ajout ── */
.inv-add-bar {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.inv-add-btn {
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px dashed var(--color-border, #3a3a5a);
  background: transparent;
  color: var(--color-text-secondary, #a0a0b8);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms;
}

.inv-add-btn:hover {
  border-color: var(--color-accent-hope, #53a8b6);
  color: var(--color-accent-hope, #53a8b6);
}

.inv-add-btn--consumable:hover {
  border-color: #22c55e;
  color: #22c55e;
}

.inv-add-btn--weapon:hover {
  border-color: #fb923c;
  color: #fb923c;
}

.inv-add-btn--armor:hover {
  border-color: #60a5fa;
  color: #60a5fa;
}

.inv-add-btn--custom:hover {
  border-color: #eab308;
  color: #eab308;
}
</style>
