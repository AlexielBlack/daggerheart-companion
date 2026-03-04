<template>
  <ModuleBoundary
    module-name="Éditeur d'ascendance homebrew"
    module-id="homebrew-ancestry-editor"
  >
    <div class="hb-anc-editor">
      <!-- Breadcrumb -->
      <nav
        class="hb-anc-editor__breadcrumb"
        aria-label="Fil d'Ariane"
      >
        <router-link
          to="/homebrew/ancestry"
          class="hb-anc-editor__breadcrumb-link"
        >
          ← Ascendances custom
        </router-link>
        <span
          class="hb-anc-editor__breadcrumb-sep"
          aria-hidden="true"
        >/</span>
        <span class="hb-anc-editor__breadcrumb-current">
          {{ isEditMode ? 'Modifier' : 'Nouvelle' }}
        </span>
      </nav>

      <!-- Layout: form + preview -->
      <div class="hb-anc-editor__layout">
        <!-- Formulaire -->
        <div class="hb-anc-editor__form-panel">
          <HomebrewForm
            :schema="ancestrySchema"
            :form-data="formData"
            :is-dirty="isDirty"
            :is-edit-mode="isEditMode"
            :errors="validationErrors"
            :submit-error="submitError"
            :is-submitting="isSubmitting"
            :show-cancel="true"
            @submit="onSubmit"
            @reset="onReset"
            @cancel="onCancel"
            @update:field="onFieldUpdate"
          />
        </div>

        <!-- Aperçu temps réel -->
        <aside class="hb-anc-editor__preview-panel">
          <div class="hb-anc-editor__preview-sticky">
            <h3 class="hb-anc-editor__preview-title">
              Aperçu
            </h3>
            <AncestryPreview :data="formData" />
          </div>
        </aside>
      </div>
    </div>
  </ModuleBoundary>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import HomebrewForm from '../core/components/HomebrewForm.vue'
import AncestryPreview from '../categories/ancestry/AncestryPreview.vue'
import { ancestrySchema } from '../schemas/ancestrySchema.js'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { useAncestryHomebrewStore } from '../categories/ancestry/useAncestryHomebrewStore.js'

/**
 * @component HomebrewAncestryEditor
 * @description Vue de création / édition d'une ascendance homebrew.
 * Layout split : formulaire à gauche, aperçu carte temps réel à droite.
 */
export default {
  name: 'HomebrewAncestryEditor',

  components: {
    ModuleBoundary,
    HomebrewForm,
    AncestryPreview
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useAncestryHomebrewStore()

    const {
      formData,
      isDirty,
      isEditMode,
      reset,
      hydrate,
      setField,
      toRawData
    } = useFormSchema(ancestrySchema)

    const validationErrors = ref([])
    const submitError = ref('')
    const isSubmitting = ref(false)

    onMounted(() => {
      const id = route.params.id
      if (id && id !== 'new') {
        const existing = store.getById(id)
        if (existing) {
          hydrate(existing)
        } else {
          submitError.value = `Ascendance "${id}" introuvable.`
        }
      }
    })

    function onFieldUpdate({ key, value }) {
      setField(key, value)

      if (validationErrors.value.length > 0) {
        const result = validateHomebrewData(formData.value, ancestrySchema)
        validationErrors.value = result.errors
      }
    }

    function onSubmit() {
      submitError.value = ''

      const result = validateHomebrewData(formData.value, ancestrySchema)
      validationErrors.value = result.errors

      if (!result.valid) {
        submitError.value = `${result.errors.length} erreur(s) de validation.`
        return
      }

      isSubmitting.value = true
      try {
        const raw = toRawData()
        if (isEditMode.value) {
          const updated = store.update(route.params.id, raw)
          if (!updated.success) {
            submitError.value = updated.error || 'Échec de la mise à jour.'
            return
          }
        } else {
          const created = store.create(raw)
          if (!created.success) {
            submitError.value = created.error || 'Échec de la création.'
            return
          }
        }
        router.push('/homebrew/ancestry')
      } catch (err) {
        submitError.value = err.message || 'Erreur inattendue.'
      } finally {
        isSubmitting.value = false
      }
    }

    function onReset() {
      validationErrors.value = []
      submitError.value = ''
      if (isEditMode.value) {
        const existing = store.getById(route.params.id)
        if (existing) hydrate(existing)
      } else {
        reset()
      }
    }

    function onCancel() {
      router.push('/homebrew/ancestry')
    }

    return {
      ancestrySchema,
      formData,
      isDirty,
      isEditMode,
      validationErrors,
      submitError,
      isSubmitting,
      onFieldUpdate,
      onSubmit,
      onReset,
      onCancel
    }
  }
}
</script>

<style scoped>
.hb-anc-editor {
  padding: var(--space-md);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.hb-anc-editor__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-lg);
}

.hb-anc-editor__breadcrumb-link {
  color: var(--color-accent-hope);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.hb-anc-editor__breadcrumb-link:hover {
  color: var(--color-accent-gold);
}

.hb-anc-editor__breadcrumb-sep {
  color: var(--color-text-muted);
}

.hb-anc-editor__breadcrumb-current {
  color: var(--color-text-secondary);
}

.hb-anc-editor__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.hb-anc-editor__preview-sticky {
  position: sticky;
  top: calc(var(--header-height) + var(--space-md));
}

.hb-anc-editor__preview-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-sm);
}

@media (max-width: 900px) {
  .hb-anc-editor__layout {
    grid-template-columns: 1fr;
  }

  .hb-anc-editor__preview-sticky {
    position: static;
  }
}
</style>
