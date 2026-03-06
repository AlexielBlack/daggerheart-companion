<template>
  <ModuleBoundary
    module-name="Éditeur de communauté homebrew"
    module-id="homebrew-community-editor"
  >
    <div class="hb-com-editor">
      <!-- Breadcrumb -->
      <nav
        class="hb-com-editor__breadcrumb"
        aria-label="Fil d'Ariane"
      >
        <router-link
          to="/homebrew/community"
          class="hb-com-editor__breadcrumb-link"
        >
          ← Communautés custom
        </router-link>
        <span
          class="hb-com-editor__breadcrumb-sep"
          aria-hidden="true"
        >/</span>
        <span class="hb-com-editor__breadcrumb-current">
          {{ isEditMode ? 'Modifier' : 'Nouvelle' }}
        </span>
      </nav>

      <!-- Layout: form + preview -->
      <div class="hb-com-editor__layout">
        <!-- Formulaire -->
        <div class="hb-com-editor__form-panel">
          <HomebrewForm
            :schema="communitySchema"
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
        <aside class="hb-com-editor__preview-panel">
          <div class="hb-com-editor__preview-sticky">
            <h3 class="hb-com-editor__preview-title">
              Aperçu
            </h3>
            <CommunityPreview :data="formData" />
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
import CommunityPreview from '../categories/community/CommunityPreview.vue'
import { communitySchema } from '../schemas/communitySchema.js'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { useCommunityHomebrewStore } from '../categories/community/useCommunityHomebrewStore.js'

/**
 * @component HomebrewCommunityEditor
 * @description Vue de création / édition d'une communauté homebrew.
 * Layout split : formulaire à gauche, aperçu carte temps réel à droite.
 */
export default {
  name: 'HomebrewCommunityEditor',

  components: {
    ModuleBoundary,
    HomebrewForm,
    CommunityPreview
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useCommunityHomebrewStore()

    const {
      formData,
      isDirty,
      isEditMode,
      reset,
      hydrate,
      setField,
      toRawData
    } = useFormSchema(communitySchema)

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
          submitError.value = `Communauté "${id}" introuvable.`
        }
      }
    })

    function onFieldUpdate({ key, value }) {
      setField(key, value)

      if (validationErrors.value.length > 0) {
        const result = validateHomebrewData(formData.value, communitySchema)
        validationErrors.value = result.errors
      }
    }

    function onSubmit() {
      submitError.value = ''

      const result = validateHomebrewData(formData.value, communitySchema)
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
        router.push('/homebrew/community')
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
      router.push('/homebrew/community')
    }

    return {
      communitySchema,
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
.hb-com-editor {
  padding: var(--space-md);
}

.hb-com-editor__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-lg);
}

.hb-com-editor__breadcrumb-link {
  color: var(--color-accent-hope);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.hb-com-editor__breadcrumb-link:hover {
  color: var(--color-accent-gold);
}

.hb-com-editor__breadcrumb-sep {
  color: var(--color-text-muted);
}

.hb-com-editor__breadcrumb-current {
  color: var(--color-text-secondary);
}

.hb-com-editor__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.hb-com-editor__preview-sticky {
  position: sticky;
  top: calc(var(--header-height) + var(--space-md));
}

.hb-com-editor__preview-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-sm);
}

@media (max-width: 900px) {
  .hb-com-editor__layout {
    grid-template-columns: 1fr;
  }

  .hb-com-editor__preview-sticky {
    position: static;
  }
}
</style>
