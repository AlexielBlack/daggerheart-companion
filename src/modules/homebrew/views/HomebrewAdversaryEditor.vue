<template>
  <ModuleBoundary
    module-name="Éditeur d'adversaire homebrew"
    module-id="homebrew-adversary-editor"
  >
    <div class="hb-adv-editor">
      <!-- Breadcrumb -->
      <nav
        class="hb-adv-editor__breadcrumb"
        aria-label="Fil d'Ariane"
      >
        <router-link
          to="/homebrew/adversary"
          class="hb-adv-editor__breadcrumb-link"
        >
          ← Adversaires custom
        </router-link>
        <span
          class="hb-adv-editor__breadcrumb-sep"
          aria-hidden="true"
        >/</span>
        <span class="hb-adv-editor__breadcrumb-current">
          {{ isEditMode ? 'Modifier' : 'Nouveau' }}
        </span>
      </nav>

      <!-- Layout: form + preview -->
      <div class="hb-adv-editor__layout">
        <!-- Formulaire -->
        <div class="hb-adv-editor__form-panel">
          <HomebrewForm
            :schema="adversarySchema"
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
        <aside class="hb-adv-editor__preview-panel">
          <div class="hb-adv-editor__preview-sticky">
            <h3 class="hb-adv-editor__preview-title">
              Aperçu
            </h3>
            <AdversaryPreview :data="formData" />
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
import AdversaryPreview from '../categories/adversary/AdversaryPreview.vue'
import { adversarySchema, ADVERSARY_TIER_BENCHMARKS } from '../schemas/adversarySchema.js'
import { useFormSchema } from '../core/composables/useFormSchema.js'
import { validateHomebrewData } from '../core/composables/useHomebrewValidation.js'
import { useAdversaryHomebrewStore } from '../categories/adversary/useAdversaryHomebrewStore.js'

/**
 * @component HomebrewAdversaryEditor
 * @description Vue de création / édition d'un adversaire homebrew.
 * Layout split : formulaire à gauche, aperçu stat block temps réel à droite.
 * Route : /homebrew/adversary/new (création) ou /homebrew/adversary/:id (édition).
 */
export default {
  name: 'HomebrewAdversaryEditor',

  components: {
    ModuleBoundary,
    HomebrewForm,
    AdversaryPreview
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useAdversaryHomebrewStore()

    const {
      formData,
      isDirty,
      isEditMode,
      reset,
      hydrate,
      setField,
      toRawData
    } = useFormSchema(adversarySchema)

    const validationErrors = ref([])
    const submitError = ref('')
    const isSubmitting = ref(false)

    // Charger les données si édition
    onMounted(() => {
      const id = route.params.id
      if (id && id !== 'new') {
        const existing = store.getById(id)
        if (existing) {
          hydrate(existing)
        } else {
          submitError.value = `Adversaire "${id}" introuvable.`
        }
      }
    })

    // Appliquer les benchmarks de tier au changement
    function applyTierDefaults(tier) {
      const benchmarks = ADVERSARY_TIER_BENCHMARKS[tier]
      if (!benchmarks) return

      setField('difficulty', benchmarks.difficulty)
      setField('thresholds', { ...benchmarks.thresholds })
      setField('hp', benchmarks.hp)
      setField('stress', benchmarks.stress)
      setField('attack', {
        ...formData.value.attack,
        modifier: benchmarks.attack.modifier,
        damage: benchmarks.attack.damage,
        damageType: benchmarks.attack.damageType
      })
    }

    function onFieldUpdate({ key, value }) {
      setField(key, value)

      // Callback onChange du schéma (tier → benchmarks)
      const fieldDef = adversarySchema.fields.find((f) => f.key === key)
      if (fieldDef?.onChange === 'applyTierDefaults' && value) {
        applyTierDefaults(value)
      }

      // Revalider si des erreurs étaient affichées
      if (validationErrors.value.length > 0) {
        const result = validateHomebrewData(formData.value, adversarySchema)
        validationErrors.value = result.errors
      }
    }

    function onSubmit() {
      submitError.value = ''

      const result = validateHomebrewData(formData.value, adversarySchema)
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
        router.push('/homebrew/adversary')
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
      router.push('/homebrew/adversary')
    }

    return {
      adversarySchema,
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
.hb-adv-editor {
  padding: var(--space-md);
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.hb-adv-editor__breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-lg);
}

.hb-adv-editor__breadcrumb-link {
  color: var(--color-accent-hope);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.hb-adv-editor__breadcrumb-link:hover {
  color: var(--color-accent-gold);
}

.hb-adv-editor__breadcrumb-sep {
  color: var(--color-text-muted);
}

.hb-adv-editor__breadcrumb-current {
  color: var(--color-text-secondary);
}

.hb-adv-editor__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xl);
  align-items: start;
}

.hb-adv-editor__preview-panel {
  /* rien de spécial */
}

.hb-adv-editor__preview-sticky {
  position: sticky;
  top: calc(var(--header-height) + var(--space-md));
}

.hb-adv-editor__preview-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-sm);
}

@media (max-width: 900px) {
  .hb-adv-editor__layout {
    grid-template-columns: 1fr;
  }

  .hb-adv-editor__preview-sticky {
    position: static;
  }
}
</style>
