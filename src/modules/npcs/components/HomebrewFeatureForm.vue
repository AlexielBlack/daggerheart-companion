<!--
  HomebrewFeatureForm.vue — Formulaire de création/édition de combat features homebrew.
  Extrait de NpcCombatPanel pour réduire sa taille.
  Expose startEdit(id) via ref pour permettre l'édition depuis le catalogue.
-->
<template>
  <div class="homebrew-section">
    <div class="homebrew-header">
      <button
        class="btn btn--small btn--ghost"
        @click="toggle"
      >
        {{ showForm ? '✕ Annuler' : '🛠️ Créer une feature homebrew' }}
      </button>
      <span
        v-if="homebrewStore.count > 0"
        class="homebrew-count"
      >
        {{ homebrewStore.count }} homebrew
      </span>
    </div>

    <p
      v-if="formMessage"
      class="homebrew-message"
      role="status"
    >
      {{ formMessage }}
    </p>

    <div
      v-if="showForm"
      class="homebrew-form"
    >
      <div class="field">
        <label for="hb-name">Nom *</label>
        <input
          id="hb-name"
          v-model="form.name"
          type="text"
          placeholder="Nom de la feature"
        />
      </div>

      <div class="field">
        <label for="hb-desc">Description *</label>
        <textarea
          id="hb-desc"
          v-model="form.description"
          rows="3"
          placeholder="Effet mécanique de la feature…"
        ></textarea>
      </div>

      <div class="custom-grid">
        <div class="field">
          <label for="hb-activation">Type</label>
          <select
            id="hb-activation"
            v-model="form.activationType"
          >
            <option
              v-for="at in activationTypes"
              :key="at.value"
              :value="at.value"
            >
              {{ at.emoji }} {{ at.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="hb-tier">Tier</label>
          <select
            id="hb-tier"
            v-model.number="form.tier"
          >
            <option
              v-for="t in 4"
              :key="t"
              :value="t"
            >
              Tier {{ t }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="hb-range">Portée</label>
          <select
            id="hb-range"
            v-model="form.range"
          >
            <option
              v-for="r in rangeOptions"
              :key="r.value"
              :value="r.value || null"
            >
              {{ r.emoji || '' }} {{ r.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="custom-grid">
        <div class="field">
          <label for="hb-cost-type">Coût</label>
          <select
            id="hb-cost-type"
            v-model="form.cost.type"
          >
            <option
              v-for="ct in costTypes"
              :key="ct.value"
              :value="ct.value"
            >
              {{ ct.emoji }} {{ ct.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="hb-cost-amount">Montant</label>
          <input
            id="hb-cost-amount"
            v-model.number="form.cost.amount"
            type="number"
            min="0"
            max="10"
          />
        </div>

        <div class="field">
          <label for="hb-cooldown">Cooldown allié</label>
          <select
            id="hb-cooldown"
            v-model="form.allyCooldown"
          >
            <option
              v-for="cd in cooldownOptions"
              :key="cd.value"
              :value="cd.value"
            >
              {{ cd.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Tags -->
      <div
        class="field"
        role="group"
        aria-label="Tags"
      >
        <span class="field__label">Tags</span>
        <div class="chip-selector">
          <button
            v-for="t in tagOptions"
            :key="t.value"
            type="button"
            class="chip-btn"
            :class="{ 'chip-btn--active': form.tags.includes(t.value) }"
            @click="toggleTag(t.value)"
          >
            {{ t.emoji }} {{ t.label }}
          </button>
        </div>
      </div>

      <!-- Thèmes -->
      <div
        class="field"
        role="group"
        aria-label="Thèmes"
      >
        <span class="field__label">Thèmes</span>
        <div class="chip-selector">
          <button
            v-for="th in themes"
            :key="th.value"
            type="button"
            class="chip-btn"
            :class="{ 'chip-btn--active': form.themes.includes(th.value) }"
            @click="toggleTheme(th.value)"
          >
            {{ th.emoji }} {{ th.label }}
          </button>
        </div>
      </div>

      <!-- Trigger (si réaction) -->
      <div
        v-if="form.activationType === 'reaction'"
        class="field"
      >
        <label for="hb-trigger">Trigger</label>
        <input
          id="hb-trigger"
          v-model="form.trigger"
          type="text"
          placeholder="Quand cet adversaire…"
        />
      </div>

      <!-- Dégâts (optionnel) -->
      <div class="custom-grid">
        <div class="field">
          <label for="hb-damage">Formule de dégâts</label>
          <input
            id="hb-damage"
            v-model="form.damageFormula"
            type="text"
            placeholder="Ex: 2d6+3"
          />
        </div>
        <div class="field">
          <label for="hb-damage-type">Type de dégâts</label>
          <select
            id="hb-damage-type"
            v-model="form.damageType"
          >
            <option :value="null">
              —
            </option>
            <option value="physical">
              Physiques
            </option>
            <option value="magic">
              Magiques
            </option>
          </select>
        </div>
      </div>

      <div class="homebrew-form__actions">
        <button
          class="btn btn--small btn--primary"
          @click="save"
        >
          {{ editId ? '✏️ Modifier' : '✨ Créer' }}
        </button>
        <button
          class="btn btn--small btn--ghost"
          @click="reset(); showForm = false"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useHomebrewCombatFeatureStore } from '../stores/homebrewCombatFeatureStore.js'
import { ALL_TAGS, TAG_META } from '@data/constants/tags.js'
import {
  RANGE_META, RANGE_VALUES,
  COST_META, COST_TYPES,
  ACTIVATION_META, ACTIVATION_TYPES
} from '@data/constants/featureSchema.js'
import { ALL_COOLDOWNS, COOLDOWN_META } from '../combatConstants.js'

export default {
  name: 'HomebrewFeatureForm',

  props: {
    /** Thèmes mappés [{value, label, emoji}] — passés par le parent */
    themes: { type: Array, default: () => [] },
    /** IDs des features actuellement sélectionnées par le PNJ */
    combatFeatures: { type: Array, default: () => [] }
  },

  emits: ['feature-deleted'],

  setup(props, { emit, expose }) {
    const homebrewStore = useHomebrewCombatFeatureStore()

    const showForm = ref(false)
    const form = ref(createDefaultForm())
    const formMessage = ref('')
    const editId = ref(null)

    // ── Listes d'options ──
    const activationTypes = ACTIVATION_TYPES.map(t => ({
      value: t, label: ACTIVATION_META[t].label, emoji: ACTIVATION_META[t].emoji
    }))
    const costTypes = COST_TYPES.map(t => ({
      value: t, label: COST_META[t].label, emoji: COST_META[t].emoji
    }))
    const rangeOptions = [
      { value: '', label: '— Aucune —' },
      ...RANGE_VALUES.map(r => ({ value: r, label: RANGE_META[r].label, emoji: RANGE_META[r].emoji }))
    ]
    const cooldownOptions = ALL_COOLDOWNS.map(c => ({
      value: c, label: COOLDOWN_META[c].label
    }))
    const tagOptions = ALL_TAGS.map(t => ({
      value: t, label: TAG_META[t].label, emoji: TAG_META[t].emoji
    }))

    function createDefaultForm() {
      return {
        name: '', description: '',
        activationType: 'action', tier: 1,
        tags: ['offensif'], themes: ['humanoid'],
        cost: { type: 'free', amount: 0 },
        frequency: 'atWill', allyCooldown: 'none',
        range: null, trigger: '',
        damageFormula: '', damageType: null
      }
    }

    function reset() {
      form.value = createDefaultForm()
      editId.value = null
      formMessage.value = ''
    }

    function toggle() {
      showForm.value = !showForm.value
      if (!showForm.value) reset()
    }

    function save() {
      const data = {
        ...form.value,
        trigger: form.value.trigger || null,
        damageFormula: form.value.damageFormula || null,
        range: form.value.range || null
      }

      let result
      if (editId.value) {
        result = homebrewStore.update(editId.value, data)
      } else {
        result = homebrewStore.create(data)
      }

      if (result.success) {
        formMessage.value = editId.value ? 'Modifié ✓' : 'Créé ✓'
        reset()
        showForm.value = false
        setTimeout(() => { formMessage.value = '' }, 2000)
      } else {
        formMessage.value = result.errors ? result.errors.join(', ') : result.error
      }
    }

    /** Ouvre le formulaire pré-rempli pour éditer une feature existante. */
    function startEdit(id) {
      const feat = homebrewStore.getById(id)
      if (!feat) return
      form.value = {
        name: feat.name, description: feat.description,
        activationType: feat.activationType, tier: feat.tier,
        tags: [...feat.tags], themes: [...feat.themes],
        cost: { ...feat.cost },
        frequency: feat.frequency || 'atWill',
        allyCooldown: feat.allyCooldown || 'none',
        range: feat.range, trigger: feat.trigger || '',
        damageFormula: feat.damageFormula || '',
        damageType: feat.damageType
      }
      editId.value = id
      showForm.value = true
    }

    /** Supprime une feature homebrew et notifie le parent si elle était sélectionnée. */
    function deleteFeature(id) {
      homebrewStore.remove(id)
      if (props.combatFeatures.includes(id)) {
        emit('feature-deleted', id)
      }
    }

    function toggleTag(tag) {
      const tags = form.value.tags
      const idx = tags.indexOf(tag)
      if (idx >= 0) { if (tags.length > 1) tags.splice(idx, 1) }
      else { tags.push(tag) }
    }

    function toggleTheme(theme) {
      const th = form.value.themes
      const idx = th.indexOf(theme)
      if (idx >= 0) { if (th.length > 1) th.splice(idx, 1) }
      else { th.push(theme) }
    }

    // Exposer startEdit et deleteFeature pour appel depuis le parent
    expose({ startEdit, deleteFeature })

    return {
      homebrewStore, showForm, form, formMessage, editId,
      activationTypes, costTypes, rangeOptions, cooldownOptions, tagOptions,
      toggle, save, reset, toggleTag, toggleTheme
    }
  }
}
</script>

<style scoped>
.homebrew-section { margin-top: 0.75rem; }
.homebrew-header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.homebrew-count { font-size: 0.7rem; color: var(--color-text-muted, #9ca3af); }
.homebrew-message { font-size: 0.8rem; color: #059669; margin: 0.3rem 0; }

.homebrew-form {
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.02));
}

.homebrew-form textarea {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
}

.homebrew-form__actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

.custom-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-bottom: 0.5rem; }

.field { display: flex; flex-direction: column; gap: 0.2rem; }
.field label, .field__label { font-size: 0.75rem; color: var(--color-text-muted, #9ca3af); font-weight: 500; }
.field input, .field select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.85rem;
  font-family: inherit;
}

.chip-selector { display: flex; flex-wrap: wrap; gap: 0.25rem; }

.chip-btn {
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted, #9ca3af);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
}

.chip-btn--active {
  border-color: var(--color-primary, #2563eb);
  background: rgba(37, 99, 235, 0.15);
  color: var(--color-text, #f9fafb);
}

.btn { border: none; cursor: pointer; border-radius: 6px; font-family: inherit; font-weight: 500; }
.btn--small { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
.btn--ghost { background: transparent; border: 1px dashed var(--color-border, #374151); color: var(--color-text-muted, #9ca3af); }
.btn--ghost:hover { border-color: var(--color-primary, #60a5fa); color: var(--color-text, #f9fafb); }
.btn--primary { background: var(--color-primary, #2563eb); color: #fff; }
</style>
