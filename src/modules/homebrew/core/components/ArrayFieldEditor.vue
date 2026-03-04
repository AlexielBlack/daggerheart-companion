<template>
  <div
    class="array-editor"
    role="region"
    :aria-label="`Éditeur de ${label}`"
  >
    <div class="array-editor__header">
      <h4 class="array-editor__title">
        {{ label }}
      </h4>
      <button
        type="button"
        class="btn btn--ghost btn--sm"
        :disabled="maxItems && items.length >= maxItems"
        :aria-label="`Ajouter un élément à ${label}`"
        @click="addItem"
      >
        + Ajouter
      </button>
    </div>

    <p
      v-if="helpText"
      class="array-editor__help"
    >
      {{ helpText }}
    </p>

    <!-- Liste des items -->
    <div
      v-if="items.length > 0"
      class="array-editor__list"
      role="list"
    >
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="array-editor__item"
        role="listitem"
      >
        <div class="array-editor__item-header">
          <span class="array-editor__item-number">#{{ idx + 1 }}</span>
          <button
            type="button"
            class="array-editor__remove-btn"
            :aria-label="`Supprimer l'élément ${idx + 1}`"
            @click="removeItem(idx)"
          >
            ✕
          </button>
        </div>

        <div class="array-editor__item-fields">
          <homebrew-form-field
            v-for="subField in itemFields"
            :key="subField.key"
            :field="subField"
            :model-value="item[subField.key]"
            :errors="itemFieldErrors(idx, subField.key)"
            :path="`${path}[${idx}].${subField.key}`"
            @update:model-value="updateItemField(idx, subField.key, $event)"
          />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <p
      v-else
      class="array-editor__empty"
    >
      Aucun élément. Cliquez « + Ajouter » pour commencer.
    </p>
  </div>
</template>

<script>
/**
 * @component ArrayFieldEditor
 * @description Éditeur générique pour les champs de type ARRAY.
 * Affiche un sous-formulaire répétable basé sur le itemSchema du champ.
 */
export default {
  name: 'ArrayFieldEditor',

  props: {
    /** Tableau d'objets */
    modelValue: {
      type: Array,
      default: () => []
    },
    /** Champs du sous-schéma (itemSchema.fields) */
    itemFields: {
      type: Array,
      required: true
    },
    /** Label affiché */
    label: {
      type: String,
      default: 'Éléments'
    },
    /** Texte d'aide */
    helpText: {
      type: String,
      default: ''
    },
    /** Nombre maximum d'items */
    maxItems: {
      type: Number,
      default: null
    },
    /** Erreurs de validation */
    errors: {
      type: Array,
      default: () => []
    },
    /** Chemin du champ */
    path: {
      type: String,
      default: 'items'
    }
  },

  emits: ['update:modelValue'],

  computed: {
    items() {
      return Array.isArray(this.modelValue) ? this.modelValue : []
    }
  },

  methods: {
    createEmptyItem() {
      const item = {}
      for (const field of this.itemFields) {
        if (field.defaultValue !== undefined) {
          item[field.key] = field.defaultValue
        } else if (field.type === 'number') {
          item[field.key] = 0
        } else if (field.type === 'tags' || field.type === 'multi_select') {
          item[field.key] = []
        } else if (field.type === 'boolean') {
          item[field.key] = false
        } else {
          item[field.key] = ''
        }
      }
      return item
    },

    addItem() {
      this.$emit('update:modelValue', [...this.items, this.createEmptyItem()])
    },

    removeItem(idx) {
      this.$emit('update:modelValue', this.items.filter((_, i) => i !== idx))
    },

    updateItemField(idx, key, value) {
      const updated = this.items.map((item, i) => {
        if (i === idx) {
          return { ...item, [key]: value }
        }
        return item
      })
      this.$emit('update:modelValue', updated)
    },

    itemFieldErrors(idx, fieldKey) {
      const target = `${this.path}[${idx}].${fieldKey}`
      return this.errors.filter((e) =>
        e.field === target || e.field.startsWith(`${target}.`) || e.field.startsWith(`${target}[`)
      )
    }
  }
}
</script>

<style scoped>
.array-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.array-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.array-editor__title {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.array-editor__help {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.array-editor__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.array-editor__item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  background-color: rgba(0, 0, 0, 0.1);
}

.array-editor__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.array-editor__item-number {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-bold);
}

.array-editor__remove-btn {
  padding: 2px var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.array-editor__remove-btn:hover {
  color: var(--color-accent-danger);
  background-color: rgba(244, 67, 54, 0.1);
}

.array-editor__item-fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-sm);
}

.array-editor__empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  padding: var(--space-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  margin: 0;
}
</style>
