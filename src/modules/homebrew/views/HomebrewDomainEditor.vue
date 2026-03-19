<template>
  <ModuleBoundary
    module-name="Editeur de domaine homebrew"
    module-id="homebrew-domain-editor"
  >
    <div class="hb-dom-editor">
      <nav
        class="hb-dom-editor__breadcrumb"
        aria-label="Fil d Ariane"
      >
        <router-link
          to="/compendium/domaines"
          class="hb-dom-editor__breadcrumb-link"
        >
          &#x2190; Domaines custom
        </router-link>
        <span
          class="hb-dom-editor__breadcrumb-sep"
          aria-hidden="true"
        >/</span>
        <span class="hb-dom-editor__breadcrumb-current">
          {{ isEditMode ? 'Modifier' : 'Nouveau' }}
        </span>
      </nav>
      <div class="hb-dom-editor__layout">
        <div class="hb-dom-editor__form-panel">
          <HomebrewForm
            :schema="domainSchema"
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
        <aside class="hb-dom-editor__preview-panel">
          <div class="hb-dom-editor__preview-sticky">
            <h3 class="hb-dom-editor__preview-title">
              Apercu
            </h3>
            <DomainPreview :data="formData" />
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
import DomainPreview from '../categories/domain/DomainPreview.vue'
import { domainSchema } from '../schemas/domainSchema.js'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { useDomainHomebrewStore } from '../categories/domain/useDomainHomebrewStore.js'

export default {
  name: 'HomebrewDomainEditor',
  components: { ModuleBoundary, HomebrewForm, DomainPreview },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useDomainHomebrewStore()
    const { formData, isDirty, isEditMode, reset, hydrate, setField, toRawData } = useFormSchema(domainSchema)
    const validationErrors = ref([])
    const submitError = ref('')
    const isSubmitting = ref(false)

    onMounted(() => {
      const id = route.params.id
      if (id && id !== 'new') {
        const existing = store.getById(id)
        if (existing) { hydrate(existing) }
        else { submitError.value = `Domaine "${id}" introuvable.` }
      }
    })

    function onFieldUpdate({ key, value }) {
      setField(key, value)
      if (validationErrors.value.length > 0) {
        const result = validateHomebrewData(formData.value, domainSchema)
        validationErrors.value = result.errors
      }
    }

    function onSubmit() {
      submitError.value = ''
      const result = validateHomebrewData(formData.value, domainSchema)
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
          if (!updated.success) { submitError.value = updated.error || 'Echec de la mise a jour.'; return }
        } else {
          const created = store.create(raw)
          if (!created.success) { submitError.value = created.error || 'Echec de la creation.'; return }
        }
        router.push('/compendium/domaines')
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

    function onCancel() { router.push('/compendium/domaines') }

    return {
      domainSchema, formData, isDirty, isEditMode,
      validationErrors, submitError, isSubmitting,
      onFieldUpdate, onSubmit, onReset, onCancel
    }
  }
}
</script>

<style scoped>
.hb-dom-editor { padding: var(--space-md); }
.hb-dom-editor__breadcrumb { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-size-sm); margin-bottom: var(--space-lg); }
.hb-dom-editor__breadcrumb-link { color: var(--color-accent-hope); text-decoration: none; transition: color var(--transition-fast); }
.hb-dom-editor__breadcrumb-link:hover { color: var(--color-accent-gold); }
.hb-dom-editor__breadcrumb-sep { color: var(--color-text-muted); }
.hb-dom-editor__breadcrumb-current { color: var(--color-text-secondary); }
.hb-dom-editor__layout { display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-xl); align-items: start; }
.hb-dom-editor__preview-sticky { position: sticky; top: calc(var(--header-height) + var(--space-md)); }
.hb-dom-editor__preview-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 var(--space-sm); }
@media (max-width: 900px) {
  .hb-dom-editor__layout { grid-template-columns: 1fr; }
  .hb-dom-editor__preview-sticky { position: static; }
}
</style>
