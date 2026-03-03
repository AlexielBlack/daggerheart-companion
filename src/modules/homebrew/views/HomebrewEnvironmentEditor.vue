<template>
  <ModuleBoundary
    module-name="Éditeur d'environnement homebrew"
    module-id="homebrew-environment-editor"
  >
    <div class="hb-env-editor">
      <nav
        class="hb-env-editor__breadcrumb"
        aria-label="Fil d'Ariane"
      >
        <router-link
          to="/homebrew/environment"
          class="hb-env-editor__breadcrumb-link"
        >
          ← Environnements custom
        </router-link>
        <span
          class="hb-env-editor__breadcrumb-sep"
          aria-hidden="true"
        >/</span>
        <span class="hb-env-editor__breadcrumb-current">
          {{ isEditMode ? 'Modifier' : 'Nouveau' }}
        </span>
      </nav>

      <div class="hb-env-editor__layout">
        <div class="hb-env-editor__form-panel">
          <HomebrewForm
            :schema="environmentSchema"
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

        <aside class="hb-env-editor__preview-panel">
          <div class="hb-env-editor__preview-sticky">
            <h3 class="hb-env-editor__preview-title">
              Aperçu
            </h3>
            <EnvironmentPreview :data="formData" />
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
import EnvironmentPreview from '../categories/environment/EnvironmentPreview.vue'
import { environmentSchema, ENVIRONMENT_TIER_BENCHMARKS } from '../schemas/environmentSchema.js'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { useEnvironmentHomebrewStore } from '../categories/environment/useEnvironmentHomebrewStore.js'

export default {
  name: 'HomebrewEnvironmentEditor',

  components: {
    ModuleBoundary,
    HomebrewForm,
    EnvironmentPreview
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useEnvironmentHomebrewStore()

    const {
      formData,
      isDirty,
      isEditMode,
      reset,
      hydrate,
      setField,
      toRawData
    } = useFormSchema(environmentSchema)

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
          submitError.value = `Environnement "${id}" introuvable.`
        }
      }
    })

    function onFieldUpdate({ key, value }) {
      setField(key, value)

      if (key === 'tier' && value && ENVIRONMENT_TIER_BENCHMARKS[value]) {
        const bench = ENVIRONMENT_TIER_BENCHMARKS[value]
        if (!formData.value.difficulty || !isDirty.value) {
          setField('difficulty', bench.difficulty)
        }
      }

      if (validationErrors.value.length > 0) {
        const result = validateHomebrewData(formData.value, environmentSchema)
        validationErrors.value = result.errors
      }
    }

    function onSubmit() {
      submitError.value = ''
      const result = validateHomebrewData(formData.value, environmentSchema)
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
          if (!updated) {
            submitError.value = 'Échec de la mise à jour.'
            return
          }
        } else {
          const created = store.create(raw)
          if (!created) {
            submitError.value = 'Échec de la création.'
            return
          }
        }
        router.push('/homebrew/environment')
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
      router.push('/homebrew/environment')
    }

    return {
      environmentSchema,
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
.hb-env-editor {
  padding: var(--space-md);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.hb-env-editor__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-lg);
}

.hb-env-editor__breadcrumb-link {
  color: var(--color-accent-hope);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.hb-env-editor__breadcrumb-link:hover {
  color: var(--color-accent-gold);
}

.hb-env-editor__breadcrumb-sep { color: var(--color-text-muted); }
.hb-env-editor__breadcrumb-current { color: var(--color-text-secondary); }

.hb-env-editor__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.hb-env-editor__preview-sticky {
  position: sticky;
  top: calc(var(--header-height) + var(--space-md));
}

.hb-env-editor__preview-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-sm);
}

@media (max-width: 900px) {
  .hb-env-editor__layout { grid-template-columns: 1fr; }
  .hb-env-editor__preview-sticky { position: static; }
}
</style>
