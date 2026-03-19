# Session Inventory Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre l'édition de l'inventaire (ajout/modif/suppression d'items + gold) directement dans l'onglet Inventaire de la vue Session > Personnages.

**Architecture:** Nouveau composant `PcInventoryEditor.vue` utilisant le pattern props+emits. Le parent `PcGroupPanel.vue` connecte les events au `characterStore` via des nouvelles actions `*ById`. Les données SRD sont résolues via `getEquipmentById` de `@data/equipment`.

**Tech Stack:** Vue 3 (Options API), Pinia, données `@data/equipment`

**Spec:** `docs/superpowers/specs/2026-03-19-session-inventory-editor-design.md`

---

### Task 1: Ajouter les actions inventaire ById dans characterStore

**Files:**
- Modify: `src/modules/characters/stores/characterStore.js:1105-1201`

- [ ] **Step 1: Ajouter `addInventoryItemById`**

Après la fonction `_migrateInventory` (ligne ~1201), ajouter :

```javascript
// ── Inventaire par ID (vue Session) ─────────────────

function addInventoryItemById(charId, type = 'custom') {
  const char = characters.value.find(c => c.id === charId)
  if (!char) return
  _migrateInventory(char)
  char.inventory.push({
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    itemId: '',
    customName: '',
    quantity: 1
  })
  char.updatedAt = new Date().toISOString()
  persist()
}

function removeInventoryItemById(charId, index) {
  const char = characters.value.find(c => c.id === charId)
  if (!char || index < 0 || index >= char.inventory.length) return
  char.inventory.splice(index, 1)
  char.updatedAt = new Date().toISOString()
  persist()
}

function updateInventoryItemById(charId, index, field, value) {
  const char = characters.value.find(c => c.id === charId)
  if (!char || index < 0 || index >= char.inventory.length) return
  const slot = char.inventory[index]
  if (!slot || typeof slot !== 'object') return

  if (field === 'type') {
    slot.type = value
    slot.itemId = ''
    slot.customName = ''
    slot.quantity = 1
  } else if (field === 'itemId') {
    slot.itemId = value
  } else if (field === 'customName') {
    slot.customName = value
  } else if (field === 'quantity') {
    slot.quantity = Math.max(1, parseInt(value) || 1)
  }

  char.updatedAt = new Date().toISOString()
  persist()
}

function updateGoldById(charId, tier, value) {
  const char = characters.value.find(c => c.id === charId)
  if (!char) return
  if (!char.gold) char.gold = { handfuls: 0, bags: 0, chests: 0 }
  char.gold[tier] = Math.max(0, parseInt(value) || 0)
  char.updatedAt = new Date().toISOString()
  persist()
}
```

- [ ] **Step 2: Exporter les nouvelles actions dans le return du store**

Dans le bloc `return { ... }` (vers ligne 1524+), ajouter après `patchCharacterById` :

```javascript
addInventoryItemById,
removeInventoryItemById,
updateInventoryItemById,
updateGoldById,
```

- [ ] **Step 3: Vérifier le build**

Run: `npx vite build`
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit**

```bash
git add src/modules/characters/stores/characterStore.js
git commit -m "feat(store): actions inventaire *ById pour la vue session"
```

---

### Task 2: Créer PcInventoryEditor.vue

**Files:**
- Create: `src/modules/session/components/PcInventoryEditor.vue`

- [ ] **Step 1: Créer le composant complet**

```vue
<template>
  <div class="pc-inv-editor" aria-label="Editeur d'inventaire">
    <!-- ═══ Gold tracker ═══ -->
    <div class="pc-inv-editor__gold">
      <span class="pc-inv-editor__gold-icon" aria-hidden="true">&#x1FA99;</span>
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

    <!-- ═══ Liste d'items ═══ -->
    <ul
      v-if="inventory && inventory.length > 0"
      class="pc-inv-editor__list"
    >
      <li
        v-for="(slot, i) in inventory"
        :key="slot.id || i"
        class="pc-inv-editor__item"
      >
        <!-- Type select -->
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

        <!-- SRD item select (non-custom) -->
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

        <!-- Custom name input -->
        <input
          v-if="slot.type === 'custom'"
          type="text"
          class="pc-inv-editor__custom-input"
          :value="slot.customName"
          placeholder="Nom de l'objet"
          :aria-label="'Nom de l\'objet ' + (i + 1)"
          @input="$emit('update-item', i, 'customName', $event.target.value)"
        />

        <!-- Quantity (consumables) -->
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

        <!-- Delete button with confirmation -->
        <button
          v-if="!confirmingDelete[i]"
          class="pc-inv-editor__delete-btn"
          :aria-label="'Supprimer objet ' + (i + 1)"
          @click="startDelete(i)"
        >
          &#x2715;
        </button>
        <button
          v-else
          class="pc-inv-editor__delete-btn pc-inv-editor__delete-btn--confirm"
          :aria-label="'Confirmer suppression objet ' + (i + 1)"
          @click="confirmDelete(i)"
        >
          Confirmer ?
        </button>
      </li>
    </ul>

    <!-- Etat vide -->
    <p
      v-if="!inventory || inventory.length === 0"
      class="pc-inv-editor__empty"
    >
      Aucun objet.
    </p>

    <!-- ═══ Ajout d'item ═══ -->
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
    }
  },

  emits: ['add-item', 'remove-item', 'update-item', 'update-gold'],

  setup(props, { emit }) {
    // ── Gold ──
    const goldTiers = [
      { key: 'handfuls', label: 'Poignees' },
      { key: 'bags', label: 'Bourses' },
      { key: 'chests', label: 'Coffres' }
    ]

    const effectiveGold = computed(() => props.gold || { handfuls: 0, bags: 0, chests: 0 })

    // ── Types ──
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

    // ── Ajout ──
    const showAddForm = ref(false)
    const newItemType = ref('custom')

    function onAddItem() {
      emit('add-item', newItemType.value)
      showAddForm.value = false
      newItemType.value = 'custom'
    }

    // ── Suppression avec confirmation ──
    const confirmingDelete = ref({})
    const deleteTimers = {}

    function startDelete(index) {
      confirmingDelete.value = { ...confirmingDelete.value, [index]: true }
      deleteTimers[index] = setTimeout(() => {
        const updated = { ...confirmingDelete.value }
        delete updated[index]
        confirmingDelete.value = updated
      }, 3000)
    }

    function confirmDelete(index) {
      clearTimeout(deleteTimers[index])
      const updated = { ...confirmingDelete.value }
      delete updated[index]
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
      confirmDelete
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

/* ── Items list ── */

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

/* ── Quantity ── */

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

/* ── Delete ── */

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

/* ── Add form ── */

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
```

- [ ] **Step 2: Vérifier le build**

Run: `npx vite build`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add src/modules/session/components/PcInventoryEditor.vue
git commit -m "feat(session): composant PcInventoryEditor — edition inventaire en session"
```

---

### Task 3: Intégrer PcInventoryEditor dans PcGroupPanel

**Files:**
- Modify: `src/modules/session/components/PcGroupPanel.vue:325-388` (onglet Inventaire)
- Modify: `src/modules/session/components/PcGroupPanel.vue:605-614` (imports)
- Modify: `src/modules/session/components/PcGroupPanel.vue:864-889` (return)

- [ ] **Step 1: Ajouter l'import du composant**

Dans la section `<script>`, après les imports existants (ligne ~612) :

```javascript
import PcInventoryEditor from './PcInventoryEditor.vue'
```

Et ajouter dans l'export :

```javascript
components: {
  PcInventoryEditor
},
```

(Note : `PcGroupPanel` n'a pas actuellement de section `components` — il faut l'ajouter entre `name` et `props`.)

- [ ] **Step 2: Ajouter les handlers inventaire dans setup**

Après la section Notes (ligne ~728), ajouter :

```javascript
// ── Inventaire interactif ──
function onAddItem(pcId, type) {
  characterStore.addInventoryItemById(pcId, type)
}
function onRemoveItem(pcId, index) {
  characterStore.removeInventoryItemById(pcId, index)
}
function onUpdateItem(pcId, index, field, value) {
  characterStore.updateInventoryItemById(pcId, index, field, value)
}
function onUpdateGold(pcId, tier, value) {
  characterStore.updateGoldById(pcId, tier, value)
}
```

Et les ajouter au return :

```javascript
onAddItem, onRemoveItem, onUpdateItem, onUpdateGold,
```

- [ ] **Step 3: Remplacer le contenu de l'onglet Inventaire dans le template**

Remplacer le bloc du panneau Inventaire (lignes 325-388) par :

```html
<!-- Panneau Inventaire -->
<div
  v-show="getActiveTab(pc.id) === 'inventaire'"
  :id="'panel-' + pc.id + '-inventaire'"
  class="pc-card__tabpanel"
  role="tabpanel"
  :aria-labelledby="'tab-' + pc.id + '-inventaire'"
>
  <PcInventoryEditor
    :inventory="pc.inventory || []"
    :gold="pc.gold || { handfuls: 0, bags: 0, chests: 0 }"
    @add-item="(type) => onAddItem(pc.id, type)"
    @remove-item="(index) => onRemoveItem(pc.id, index)"
    @update-item="(index, field, value) => onUpdateItem(pc.id, index, field, value)"
    @update-gold="(tier, value) => onUpdateGold(pc.id, tier, value)"
  />
</div>
```

- [ ] **Step 4: Supprimer les helpers devenus inutiles**

Supprimer `hasGold` et `formatGold` du setup et du return (plus utilisés dans le template après remplacement).

Vérifier qu'ils ne sont pas utilisés ailleurs dans le template avant de supprimer.

- [ ] **Step 5: Vérifier le build**

Run: `npx vite build`
Expected: BUILD SUCCESS

- [ ] **Step 6: Vérifier ESLint**

Run: `npx eslint src/modules/session/components/PcGroupPanel.vue src/modules/session/components/PcInventoryEditor.vue`
Expected: Pas d'erreurs

- [ ] **Step 7: Commit**

```bash
git add src/modules/session/components/PcGroupPanel.vue
git commit -m "feat(session): integration PcInventoryEditor dans l'onglet Inventaire"
```

---

### Task 4: Test manuel et push

- [ ] **Step 1: Lancer le serveur dev**

Run: `npx vite`

- [ ] **Step 2: Vérifier visuellement**

Ouvrir la vue Session > Personnages > onglet Inventaire d'un PJ :
1. Le gold tracker affiche les 3 tiers avec +/-
2. Les items existants sont listés avec type, nom SRD résolu, et bouton ✕
3. Le bouton "+ Ajouter" ouvre le formulaire inline
4. L'ajout d'un item custom fonctionne (saisie du nom)
5. L'ajout d'un item SRD fonctionne (select apparait)
6. La modification du type réinitialise l'itemId
7. Le bouton ✕ affiche "Confirmer ?" pendant 3s
8. La suppression fonctionne après confirmation
9. La quantité des consommables s'ajuste avec +/-

- [ ] **Step 3: Push**

```bash
git push
```
