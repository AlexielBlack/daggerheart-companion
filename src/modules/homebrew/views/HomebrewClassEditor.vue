<template>
  <ModuleBoundary
    module-name="Editeur de classe homebrew"
    module-id="homebrew-class-editor"
  >
    <div class="hb-cla-editor">
      <nav
        class="hb-cla-editor__breadcrumb"
        aria-label="Fil d Ariane"
      >
        <router-link
          to="/homebrew/class"
          class="hb-cla-editor__breadcrumb-link"
        >
          &#x2190; Classes custom
        </router-link>
        <span
          class="hb-cla-editor__breadcrumb-sep"
          aria-hidden="true"
        >/</span>
        <span class="hb-cla-editor__breadcrumb-current">
          {{ isEditMode ? 'Modifier' : 'Nouveau' }}
        </span>
      </nav>
      <div class="hb-cla-editor__layout">
        <div class="hb-cla-editor__form-panel">
          <HomebrewForm
            :schema="classSchema"
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
        <aside class="hb-cla-editor__preview-panel">
          <div class="hb-cla-editor__preview-sticky">
            <h3 class="hb-cla-editor__preview-title">
              Apercu
            </h3>
            <ClassPreview :data="formData" />
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
import ClassPreview from '../categories/class/ClassPreview.vue'
import { classSchema } from '../schemas/classSchema.js'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { useClassHomebrewStore } from '../categories/class/useClassHomebrewStore.js'

export default {
  name: 'HomebrewClassEditor',
  components: { ModuleBoundary, HomebrewForm, ClassPreview },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useClassHomebrewStore()
    const { formData, isDirty, isEditMode, reset, hydrate, setField, toRawData } = useFormSchema(classSchema)
    const validationErrors = ref([])
    const submitError = ref('')
    const isSubmitting = ref(false)

    onMounted(() => {
      const id = route.params.id
      if (id && id !== 'new') {
        const existing = store.getById(id)
        if (existing) { hydrate(existing) }
        else { submitError.value = `Classe "${id}" introuvable.` }
      }
    })

    function onFieldUpdate({ key, value }) {
      setField(key, value)
      if (validationErrors.value.length > 0) {
        const result = validateHomebrewData(formData.value, classSchema)
        validationErrors.value = result.errors
      }
    }

    function onSubmit() {
      submitError.value = ''
      const result = validateHomebrewData(formData.value, classSchema)
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
          if (!updated) { submitError.value = 'Echec de la mise a jour.'; return }
        } else {
          const created = store.create(raw)
          if (!created) { submitError.value = 'Echec de la creation.'; return }
        }
        router.push('/homebrew/class')
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
      } else { reset() }
    }

    function onCancel() { router.push('/homebrew/class') }

    return {
      classSchema, formData, isDirty, isEditMode,
      validationErrors, submitError, isSubmitting,
      onFieldUpdate, onSubmit, onReset, onCancel
    }
  }
}
</script>

<style scoped>
.hb-cla-editor { padding: var(--space-md); max-width: var(--content-max-width); margin: 0 auto; }
.hb-cla-editor__breadcrumb { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-sm); margin-bottom: var(--space-lg); }
.hb-cla-editor__breadcrumb-link { color: var(--color-accent-hope); text-decoration: none; transition: color var(--transition-fast); }
.hb-cla-editor__breadcrumb-link:hover { color: var(--color-accent-gold); }
.hb-cla-editor__breadcrumb-sep { color: var(--color-text-muted); }
.hb-cla-editor__breadcrumb-current { color: var(--color-text-secondary); }
.hb-cla-editor__layout { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl); align-items: start; }
.hb-cla-editor__preview-sticky { position: sticky; top: calc(var(--header-height) + var(--space-md)); }
.hb-cla-editor__preview-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 var(--space-sm); }
@media (max-width: 900px) {
  .hb-cla-editor__layout { grid-template-columns: 1fr; }
  .hb-cla-editor__preview-sticky { position: static; }
}
</style>
