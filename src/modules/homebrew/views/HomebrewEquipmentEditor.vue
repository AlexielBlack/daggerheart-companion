<template>
  <ModuleBoundary
    module-name="Éditeur d'équipement homebrew"
    module-id="homebrew-equipment-editor"
  >
    <div class="hb-eq-editor">
      <!-- Breadcrumb -->
      <nav
        class="hb-eq-editor__breadcrumb"
        aria-label="Fil d'Ariane"
      >
        <router-link
          to="/homebrew/equipment"
          class="hb-eq-editor__breadcrumb-link"
        >
          ← Équipements custom
        </router-link>
        <span
          class="hb-eq-editor__breadcrumb-sep"
          aria-hidden="true"
        >/</span>
        <span class="hb-eq-editor__breadcrumb-current">
          {{ isEditMode ? 'Modifier' : 'Nouveau' }}
        </span>
      </nav>

      <!-- Layout: form + preview -->
      <div class="hb-eq-editor__layout">
        <!-- Formulaire -->
        <div class="hb-eq-editor__form-panel">
          <HomebrewForm
            :schema="equipmentSchema"
            :form-data="formData"
            :is-dirty="isDirty"
            :is-edit-mode="isEditMode"
            :errors="validationErrors"
            :submit-error="submitError"
            :is-submitting="isSubmitting"
            :show-ceqel="true"
            @submit="onSubmit"
            @reset="onReset"
            @ceqel="onCeqel"
            @update:field="onFieldUpdate"
          />
        </div>

        <!-- Aperçu temps réel -->
        <aside class="hb-eq-editor__preview-panel">
          <div class="hb-eq-editor__preview-sticky">
            <h3 class="hb-eq-editor__preview-title">
              Aperçu
            </h3>
            <EquipmentPreview :data="formData" />
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
import EquipmentPreview from '../categories/equipment/EquipmentPreview.vue'
import { equipmentSchema } from '../schemas/equipmentSchema.js'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { useEquipmentHomebrewStore } from '../categories/equipment/useEquipmentHomebrewStore.js'

/**
 * @component HomebrewEquipmentEditor
 * @description Vue de création / édition d'une équipement homebrew.
 * Layout split : formulaire à gauche, aperçu carte temps réel à droite.
 */
export default {
  name: 'HomebrewEquipmentEditor',

  components: {
    ModuleBoundary,
    HomebrewForm,
    EquipmentPreview
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useEquipmentHomebrewStore()

    const {
      formData,
      isDirty,
      isEditMode,
      reset,
      hydrate,
      setField,
      toRawData
    } = useFormSchema(equipmentSchema)

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
          submitError.value = `Équipement "${id}" introuvable.`
        }
      }
    })

    function onFieldUpdate({ key, value }) {
      setField(key, value)

      if (validationErrors.value.length > 0) {
        const result = validateHomebrewData(formData.value, equipmentSchema)
        validationErrors.value = result.errors
      }
    }

    function onSubmit() {
      submitError.value = ''

      const result = validateHomebrewData(formData.value, equipmentSchema)
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
        router.push('/homebrew/equipment')
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

    function onCeqel() {
      router.push('/homebrew/equipment')
    }

    return {
      equipmentSchema,
      formData,
      isDirty,
      isEditMode,
      validationErrors,
      submitError,
      isSubmitting,
      onFieldUpdate,
      onSubmit,
      onReset,
      onCeqel
    }
  }
}
</script>

<style scoped>
.hb-eq-editor {
  padding: var(--space-md);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.hb-eq-editor__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-lg);
}

.hb-eq-editor__breadcrumb-link {
  color: var(--color-accent-hope);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.hb-eq-editor__breadcrumb-link:hover {
  color: var(--color-accent-gold);
}

.hb-eq-editor__breadcrumb-sep {
  color: var(--color-text-muted);
}

.hb-eq-editor__breadcrumb-current {
  color: var(--color-text-secondary);
}

.hb-eq-editor__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.hb-eq-editor__preview-sticky {
  position: sticky;
  top: calc(var(--header-height) + var(--space-md));
}

.hb-eq-editor__preview-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-sm);
}

@media (max-width: 900px) {
  .hb-eq-editor__layout {
    grid-template-columns: 1fr;
  }

  .hb-eq-editor__preview-sticky {
    position: static;
  }
}
</style>
