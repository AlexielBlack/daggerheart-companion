<template>
  <div
    class="form-field"
    :class="{
      'form-field--error': hasErrors,
      'form-field--group': field.type === 'group'
    }"
  >
    <!-- Label (sauf pour GROUP qui a son propre header) -->
    <label
      v-if="field.type !== 'group'"
      :for="fieldId"
      class="form-field__label"
    >
      {{ field.label }}
      <span
        v-if="field.required"
        class="form-field__required"
        aria-hidden="true"
      >*</span>
    </label>

    <!-- Help text -->
    <p
      v-if="field.helpText"
      :id="`${fieldId}-help`"
      class="form-field__help"
    >
      {{ field.helpText }}
    </p>

    <!-- TEXT -->
    <input
      v-if="field.type === 'text'"
      :id="fieldId"
      type="text"
      class="form-field__input"
      :value="modelValue"
      :placeholder="field.placeholder || ''"
      :maxlength="field.maxLength || undefined"
      :aria-describedby="ariaDescribedBy"
      :aria-invalid="hasErrors"
      :aria-required="field.required || false"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <!-- TEXTAREA -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :id="fieldId"
      class="form-field__input form-field__textarea"
      :value="modelValue"
      :placeholder="field.placeholder || ''"
      :maxlength="field.maxLength || undefined"
      rows="3"
      :aria-describedby="ariaDescribedBy"
      :aria-invalid="hasErrors"
      :aria-required="field.required || false"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>

    <!-- NUMBER -->
    <input
      v-else-if="field.type === 'number'"
      :id="fieldId"
      type="number"
      class="form-field__input form-field__input--number"
      :value="modelValue"
      :min="field.min"
      :max="field.max"
      :step="field.integer ? 1 : 'any'"
      :aria-describedby="ariaDescribedBy"
      :aria-invalid="hasErrors"
      :aria-required="field.required || false"
      @input="onNumberInput"
    />

    <!-- SELECT -->
    <select
      v-else-if="field.type === 'select'"
      :id="fieldId"
      class="form-field__input form-field__select"
      :value="modelValue"
      :aria-describedby="ariaDescribedBy"
      :aria-invalid="hasErrors"
      :aria-required="field.required || false"
      @change="onSelectChange"
    >
      <option
        v-if="!field.required"
        value=""
      >
        — Choisir —
      </option>
      <option
        v-for="opt in field.options"
        :key="opt"
        :value="opt"
        :selected="modelValue === opt"
      >
        {{ formatOption(opt) }}
      </option>
    </select>

    <!-- MULTI_SELECT (checkboxes) -->
    <fieldset
      v-else-if="field.type === 'multi_select'"
      class="form-field__multi"
      :aria-describedby="ariaDescribedBy"
    >
      <legend class="sr-only">
        {{ field.label }}
      </legend>
      <label
        v-for="opt in field.options"
        :key="opt"
        class="form-field__checkbox-label"
      >
        <input
          type="checkbox"
          class="form-field__checkbox"
          :value="opt"
          :checked="Array.isArray(modelValue) && modelValue.includes(opt)"
          @change="onMultiSelectToggle(opt)"
        />
        <span>{{ formatOption(opt) }}</span>
      </label>
    </fieldset>

    <!-- BOOLEAN -->
    <label
      v-else-if="field.type === 'boolean'"
      class="form-field__toggle-label"
    >
      <input
        :id="fieldId"
        type="checkbox"
        class="form-field__checkbox"
        :checked="modelValue"
        :aria-describedby="ariaDescribedBy"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <span class="form-field__toggle-text">{{ modelValue ? 'Oui' : 'Non' }}</span>
    </label>

    <!-- TAGS -->
    <div
      v-else-if="field.type === 'tags'"
      class="form-field__tags"
    >
      <div
        class="form-field__tag-list"
        role="list"
        :aria-label="`Tags pour ${field.label}`"
      >
        <span
          v-for="(tag, idx) in (modelValue || [])"
          :key="idx"
          class="form-field__tag"
          role="listitem"
        >
          {{ tag }}
          <button
            type="button"
            class="form-field__tag-remove"
            :aria-label="`Supprimer ${tag}`"
            @click="removeTag(idx)"
          >
            ×
          </button>
        </span>
      </div>
      <div class="form-field__tag-input-row">
        <input
          :id="fieldId"
          type="text"
          class="form-field__input"
          :placeholder="field.placeholder || 'Ajouter un tag…'"
          :aria-describedby="ariaDescribedBy"
          @keydown.enter.prevent="addTag"
        />
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          aria-label="Ajouter le tag"
          @click="addTagFromInput"
        >
          +
        </button>
      </div>
    </div>

    <!-- GROUP (sous-champs imbriqués) -->
    <fieldset
      v-else-if="field.type === 'group'"
      class="form-field__group"
    >
      <legend class="form-field__group-legend">
        {{ field.label }}
        <span
          v-if="field.required"
          class="form-field__required"
          aria-hidden="true"
        >*</span>
      </legend>
      <div class="form-field__group-fields">
        <homebrew-form-field
          v-for="child in field.children"
          :key="child.key"
          :field="child"
          :model-value="(modelValue || {})[child.key]"
          :errors="childErrors(child.key)"
          :path="`${path}.${child.key}`"
          @update:model-value="onGroupChildUpdate(child.key, $event)"
        />
      </div>
    </fieldset>

    <!-- Erreurs -->
    <div
      v-if="hasErrors"
      :id="`${fieldId}-errors`"
      class="form-field__errors"
      role="alert"
    >
      <p
        v-for="(err, idx) in directErrors"
        :key="idx"
        class="form-field__error-msg"
      >
        {{ err.message }}
      </p>
    </div>
  </div>
</template>

<script>
/**
 * @component HomebrewFormField
 * @description Rendu dynamique d'un champ de formulaire piloté par un schéma.
 * Supporte tous les types définis dans schemaTypes.js sauf FEATURES et ARRAY,
 * qui ont leurs propres composants dédiés (FeatureEditor, ArrayFieldEditor).
 */
export default {
  name: 'HomebrewFormField',

  props: {
    /** Définition du champ (issue du schéma) */
    field: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.key === 'string' && typeof value.type === 'string'
      }
    },
    /** Valeur actuelle du champ */
    modelValue: {
      type: [String, Number, Boolean, Array, Object],
      default: null
    },
    /** Erreurs de validation pour ce champ */
    errors: {
      type: Array,
      default: () => []
    },
    /** Chemin complet du champ (pour IDs et erreurs) */
    path: {
      type: String,
      default: ''
    }
  },

  emits: ['update:modelValue'],

  computed: {
    fieldId() {
      return `hb-field-${this.path || this.field.key}`
    },

    hasErrors() {
      return this.directErrors.length > 0
    },

    /** Erreurs directes de ce champ (pas des sous-champs) */
    directErrors() {
      const fieldPath = this.path || this.field.key
      return this.errors.filter((e) =>
        e.field === fieldPath
      )
    },

    ariaDescribedBy() {
      const parts = []
      if (this.field.helpText) {
        parts.push(`${this.fieldId}-help`)
      }
      if (this.hasErrors) {
        parts.push(`${this.fieldId}-errors`)
      }
      return parts.length > 0 ? parts.join(' ') : undefined
    }
  },

  methods: {
    formatOption(opt) {
      if (typeof opt === 'number') return String(opt)
      return opt
    },

    onNumberInput(event) {
      const raw = event.target.value
      if (raw === '') {
        this.$emit('update:modelValue', 0)
        return
      }
      const parsed = this.field.integer ? parseInt(raw, 10) : parseFloat(raw)
      if (!Number.isNaN(parsed)) {
        this.$emit('update:modelValue', parsed)
      }
    },

    onSelectChange(event) {
      let value = event.target.value
      // Restaurer le type d'origine si les options sont des nombres
      if (this.field.options?.length > 0 && typeof this.field.options[0] === 'number') {
        value = Number(value)
      }
      this.$emit('update:modelValue', value === '' ? null : value)
    },

    onMultiSelectToggle(opt) {
      const current = Array.isArray(this.modelValue) ? [...this.modelValue] : []
      const idx = current.indexOf(opt)
      if (idx === -1) {
        current.push(opt)
      } else {
        current.splice(idx, 1)
      }
      this.$emit('update:modelValue', current)
    },

    addTag(event) {
      const value = event.target.value.trim()
      if (!value) return
      const current = Array.isArray(this.modelValue) ? [...this.modelValue] : []
      if (this.field.maxItems && current.length >= this.field.maxItems) return
      if (!current.includes(value)) {
        current.push(value)
        this.$emit('update:modelValue', current)
      }
      event.target.value = ''
    },

    addTagFromInput() {
      const input = this.$el.querySelector('.form-field__tags input')
      if (input && input.value.trim()) {
        this.addTag({ target: input })
      }
    },

    removeTag(idx) {
      const current = Array.isArray(this.modelValue) ? [...this.modelValue] : []
      current.splice(idx, 1)
      this.$emit('update:modelValue', current)
    },

    onGroupChildUpdate(childKey, value) {
      const current = typeof this.modelValue === 'object' && this.modelValue !== null
        ? { ...this.modelValue }
        : {}
      current[childKey] = value
      this.$emit('update:modelValue', current)
    },

    childErrors(childKey) {
      const childPath = `${this.path || this.field.key}.${childKey}`
      return this.errors.filter((e) =>
        e.field === childPath || e.field.startsWith(`${childPath}.`) || e.field.startsWith(`${childPath}[`)
      )
    }
  }
}
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-field__required {
  color: var(--color-accent-fear);
  margin-left: 2px;
}

.form-field__help {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--line-height-normal);
}

.form-field__input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
}

.form-field--error .form-field__input {
  border-color: var(--color-accent-danger);
}

.form-field__input::placeholder {
  color: var(--color-text-muted);
}

.form-field__input--number {
  max-width: 140px;
}

.form-field__textarea {
  resize: vertical;
  min-height: 72px;
}

.form-field__select {
  cursor: pointer;
  appearance: auto;
}

/* Multi-select / Checkboxes */
.form-field__multi {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.form-field__checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.form-field__checkbox {
  accent-color: var(--color-accent-hope);
  cursor: pointer;
}

/* Boolean toggle */
.form-field__toggle-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
}

.form-field__toggle-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Tags */
.form-field__tags {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-field__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.form-field__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 2px var(--space-sm);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.form-field__tag-remove {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1;
  padding: 0 2px;
  border-radius: var(--radius-full);
  transition: color var(--transition-fast);
}

.form-field__tag-remove:hover {
  color: var(--color-accent-danger);
}

.form-field__tag-input-row {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.form-field__tag-input-row .form-field__input {
  flex: 1;
}

/* Group */
.form-field__group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin: 0;
}

.form-field__group-legend {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  padding: 0 var(--space-xs);
}

.form-field__group-fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-md);
  margin-top: var(--space-sm);
}

/* Errors */
.form-field__errors {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.form-field__error-msg {
  font-size: var(--font-size-xs);
  color: var(--color-accent-danger);
  margin: 0;
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
