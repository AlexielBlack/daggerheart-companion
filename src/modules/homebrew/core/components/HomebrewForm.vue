<template>
  <form
    class="homebrew-form"
    :aria-label="`Formulaire ${schema.label}`"
    novalidate
    @submit.prevent="onSubmit"
  >
    <!-- Header -->
    <div class="homebrew-form__header">
      <h2 class="homebrew-form__title">
        <span
          v-if="schema.icon"
          class="homebrew-form__icon"
          aria-hidden="true"
        >{{ schema.icon }}</span>
        {{ isEditMode ? `Modifier : ${formData.name || schema.label}` : `Nouveau ${schema.label}` }}
      </h2>
      <div
        v-if="isDirty"
        class="homebrew-form__dirty-badge"
        aria-live="polite"
      >
        Modifications non sauvegardées
      </div>
    </div>

    <!-- Erreur globale -->
    <div
      v-if="submitError"
      class="homebrew-form__global-error"
      role="alert"
    >
      {{ submitError }}
    </div>

    <!-- Champs du formulaire -->
    <div class="homebrew-form__fields">
      <template
        v-for="field in schema.fields"
        :key="field.key"
      >
        <!-- FEATURES : composant dédié -->
        <FeatureEditor
          v-if="field.type === 'features'"
          :model-value="formData[field.key]"
          :label="field.label"
          :help-text="field.helpText || ''"
          :max-items="field.maxItems || null"
          :errors="fieldErrors(field.key)"
          :path="field.key"
          @update:model-value="setField(field.key, $event)"
        />

        <!-- ARRAY : composant dédié -->
        <ArrayFieldEditor
          v-else-if="field.type === 'array' && field.itemSchema"
          :model-value="formData[field.key]"
          :item-fields="field.itemSchema.fields"
          :label="field.label"
          :help-text="field.helpText || ''"
          :max-items="field.maxItems || null"
          :errors="fieldErrors(field.key)"
          :path="field.key"
          @update:model-value="setField(field.key, $event)"
        />

        <!-- Tous les autres types : FormField générique -->
        <HomebrewFormField
          v-else
          :field="field"
          :model-value="formData[field.key]"
          :errors="fieldErrors(field.key)"
          :path="field.key"
          @update:model-value="setField(field.key, $event)"
        />
      </template>
    </div>

    <!-- Actions -->
    <div class="homebrew-form__actions">
      <button
        type="submit"
        class="btn btn--primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Sauvegarde…' : (isEditMode ? 'Mettre à jour' : 'Créer') }}
      </button>

      <button
        type="button"
        class="btn btn--ghost"
        :disabled="!isDirty"
        @click="onReset"
      >
        Réinitialiser
      </button>

      <button
        v-if="showCancel"
        type="button"
        class="btn btn--ghost"
        @click="$emit('cancel')"
      >
        Annuler
      </button>
    </div>
  </form>
</template>

<script>
import HomebrewFormField from './HomebrewFormField.vue'
import FeatureEditor from './FeatureEditor.vue'
import ArrayFieldEditor from './ArrayFieldEditor.vue'
import { getFieldErrors } from '../composables/useHomebrewValidation.js'

/**
 * @component HomebrewForm
 * @description Formulaire complet piloté par un schéma déclaratif.
 * Assemble automatiquement HomebrewFormField, FeatureEditor et ArrayFieldEditor
 * selon le type de chaque champ du schéma.
 */
export default {
  name: 'HomebrewForm',

  components: {
    HomebrewFormField,
    FeatureEditor,
    ArrayFieldEditor
  },

  props: {
    /** Schéma déclaratif complet */
    schema: {
      type: Object,
      required: true,
      validator(value) {
        return value && Array.isArray(value.fields) && typeof value.key === 'string'
      }
    },
    /** Données réactives du formulaire */
    formData: {
      type: Object,
      required: true
    },
    /** Le formulaire a des modifications non sauvegardées */
    isDirty: {
      type: Boolean,
      default: false
    },
    /** Mode édition (vs création) */
    isEditMode: {
      type: Boolean,
      default: false
    },
    /** Erreurs de validation complètes */
    errors: {
      type: Array,
      default: () => []
    },
    /** Message d'erreur global (soumission échouée) */
    submitError: {
      type: String,
      default: ''
    },
    /** En cours de soumission */
    isSubmitting: {
      type: Boolean,
      default: false
    },
    /** Afficher le bouton Annuler */
    showCancel: {
      type: Boolean,
      default: false
    }
  },

  emits: ['submit', 'reset', 'cancel', 'update:field'],

  methods: {
    setField(key, value) {
      this.$emit('update:field', { key, value })
    },

    fieldErrors(fieldKey) {
      return getFieldErrors(this.errors, fieldKey)
    },

    onSubmit() {
      this.$emit('submit')
    },

    onReset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.homebrew-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.homebrew-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.homebrew-form__title {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.homebrew-form__icon {
  font-size: var(--font-size-xl);
}

.homebrew-form__dirty-badge {
  font-size: var(--font-size-xs);
  color: var(--color-accent-warning);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-accent-warning);
  border-radius: var(--radius-full);
}

.homebrew-form__global-error {
  padding: var(--space-sm) var(--space-md);
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--color-accent-danger);
  border-radius: var(--radius-md);
  color: var(--color-accent-danger);
  font-size: var(--font-size-sm);
}

.homebrew-form__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.homebrew-form__actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}
</style>
