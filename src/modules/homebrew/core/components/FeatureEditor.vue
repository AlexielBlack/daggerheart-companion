<template>
  <div
    class="feature-editor"
    role="region"
    :aria-label="`Éditeur de ${label}`"
  >
    <div class="feature-editor__header">
      <h4 class="feature-editor__title">
        {{ label }}
      </h4>
      <button
        type="button"
        class="btn btn--ghost btn--sm"
        :disabled="maxItems && features.length >= maxItems"
        :aria-label="`Ajouter une feature à ${label}`"
        @click="addFeature"
      >
        + Ajouter
      </button>
    </div>

    <p
      v-if="helpText"
      class="feature-editor__help"
    >
      {{ helpText }}
    </p>

    <!-- Liste des features -->
    <div
      v-if="features.length > 0"
      class="feature-editor__list"
      role="list"
      :aria-label="`Liste des features (${features.length})`"
    >
      <div
        v-for="(feature, idx) in features"
        :key="feature._uid || idx"
        class="feature-editor__item"
        :class="`feature-editor__item--${feature.type || 'action'}`"
        role="listitem"
      >
        <div class="feature-editor__item-header">
          <span class="feature-editor__item-number">
            #{{ idx + 1 }}
          </span>
          <div class="feature-editor__item-actions">
            <button
              v-if="idx > 0"
              type="button"
              class="feature-editor__move-btn"
              :aria-label="`Déplacer feature ${idx + 1} vers le haut`"
              @click="moveFeature(idx, -1)"
            >
              ↑
            </button>
            <button
              v-if="idx < features.length - 1"
              type="button"
              class="feature-editor__move-btn"
              :aria-label="`Déplacer feature ${idx + 1} vers le bas`"
              @click="moveFeature(idx, 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="feature-editor__remove-btn"
              :aria-label="`Supprimer feature ${idx + 1}`"
              @click="removeFeature(idx)"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="feature-editor__item-fields">
          <!-- Type -->
          <div class="feature-editor__field feature-editor__field--type">
            <label
              :for="`${fieldId}-${idx}-type`"
              class="feature-editor__field-label"
            >
              Type <span class="feature-editor__required">*</span>
            </label>
            <select
              :id="`${fieldId}-${idx}-type`"
              class="feature-editor__input feature-editor__select"
              :value="feature.type"
              :aria-invalid="hasFieldError(idx, 'type')"
              @change="updateFeatureField(idx, 'type', $event.target.value)"
            >
              <option value="passive">
                🔵 Passif
              </option>
              <option value="action">
                ⚔️ Action
              </option>
              <option value="reaction">
                🛡️ Réaction
              </option>
            </select>
          </div>

          <!-- Nom -->
          <div class="feature-editor__field feature-editor__field--name">
            <label
              :for="`${fieldId}-${idx}-name`"
              class="feature-editor__field-label"
            >
              Nom <span class="feature-editor__required">*</span>
            </label>
            <input
              :id="`${fieldId}-${idx}-name`"
              type="text"
              class="feature-editor__input"
              :value="feature.name"
              placeholder="Ex: Charge furieuse"
              :aria-invalid="hasFieldError(idx, 'name')"
              @input="updateFeatureField(idx, 'name', $event.target.value)"
            />
          </div>

          <!-- Coût (optionnel) -->
          <div class="feature-editor__field feature-editor__field--cost">
            <label
              :for="`${fieldId}-${idx}-cost`"
              class="feature-editor__field-label"
            >
              Coût
            </label>
            <input
              :id="`${fieldId}-${idx}-cost`"
              type="text"
              class="feature-editor__input"
              :value="feature.cost || ''"
              placeholder="Ex: 2 Fear"
              @input="updateFeatureField(idx, 'cost', $event.target.value)"
            />
          </div>

          <!-- Description -->
          <div class="feature-editor__field feature-editor__field--desc">
            <label
              :for="`${fieldId}-${idx}-desc`"
              class="feature-editor__field-label"
            >
              Description <span class="feature-editor__required">*</span>
            </label>
            <textarea
              :id="`${fieldId}-${idx}-desc`"
              class="feature-editor__input feature-editor__textarea"
              :value="feature.description"
              placeholder="Décrivez l'effet de cette feature…"
              rows="2"
              :aria-invalid="hasFieldError(idx, 'description')"
              @input="updateFeatureField(idx, 'description', $event.target.value)"
            ></textarea>
          </div>

          <!-- Tags -->
          <div class="feature-editor__field feature-editor__field--tags">
            <span class="feature-editor__field-label">Tags</span>
            <div class="feature-editor__tag-group">
              <label
                v-for="tag in availableTags"
                :key="tag"
                class="feature-editor__tag-option"
                :class="{ 'feature-editor__tag-option--active': (feature.tags || []).includes(tag) }"
              >
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="(feature.tags || []).includes(tag)"
                  @change="toggleTag(idx, tag)"
                />
                {{ tagLabels[tag] }}
              </label>
            </div>
          </div>
        </div>

        <!-- Erreurs de cette feature -->
        <div
          v-if="featureErrors(idx).length > 0"
          class="feature-editor__item-errors"
          role="alert"
        >
          <p
            v-for="(err, eIdx) in featureErrors(idx)"
            :key="eIdx"
            class="feature-editor__error-msg"
          >
            {{ err.message }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <p
      v-else
      class="feature-editor__empty"
    >
      Aucune feature ajoutée. Cliquez « + Ajouter » pour commencer.
    </p>
  </div>
</template>

<script>
/**
 * @component FeatureEditor
 * @description Éditeur spécialisé pour les features Daggerheart
 * (actions, réactions, passifs). Utilisé par HomebrewForm pour les champs
 * de type FEATURES.
 *
 * Réutilisable pour adversaires, environnements et tout contenu avec features.
 */
import { FEATURE_TAGS } from '../utils/schemaTypes.js'

let featureUidCounter = 0

export default {
  name: 'FeatureEditor',

  props: {
    /** Tableau de features */
    modelValue: {
      type: Array,
      default: () => []
    },
    /** Label affiché */
    label: {
      type: String,
      default: 'Features'
    },
    /** Texte d'aide */
    helpText: {
      type: String,
      default: ''
    },
    /** Nombre maximum de features */
    maxItems: {
      type: Number,
      default: null
    },
    /** Erreurs de validation */
    errors: {
      type: Array,
      default: () => []
    },
    /** Chemin du champ dans le formulaire */
    path: {
      type: String,
      default: 'features'
    }
  },

  emits: ['update:modelValue'],

  data() {
    return {
      availableTags: FEATURE_TAGS,
      tagLabels: {
        offensif: '⚔️ Offensif',
        défensif: '🛡️ Défensif',
        social: '🎭 Social',
        utilitaire: '🔧 Utilitaire'
      }
    }
  },

  computed: {
    fieldId() {
      return `hb-features-${this.path}`
    },

    features() {
      return Array.isArray(this.modelValue) ? this.modelValue : []
    }
  },

  methods: {
    createEmptyFeature() {
      featureUidCounter++
      return {
        _uid: `feat-${featureUidCounter}-${Date.now()}`,
        name: '',
        type: 'action',
        description: '',
        cost: '',
        tags: []
      }
    },

    addFeature() {
      const updated = [...this.features, this.createEmptyFeature()]
      this.$emit('update:modelValue', updated)
    },

    removeFeature(idx) {
      const updated = this.features.filter((_, i) => i !== idx)
      this.$emit('update:modelValue', updated)
    },

    moveFeature(idx, direction) {
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= this.features.length) return

      const updated = [...this.features]
      const item = updated.splice(idx, 1)[0]
      updated.splice(newIdx, 0, item)
      this.$emit('update:modelValue', updated)
    },

    updateFeatureField(idx, key, value) {
      const updated = this.features.map((f, i) => {
        if (i === idx) {
          return { ...f, [key]: value }
        }
        return f
      })
      this.$emit('update:modelValue', updated)
    },

    toggleTag(idx, tag) {
      const current = [...(this.features[idx].tags || [])]
      const pos = current.indexOf(tag)
      if (pos === -1) {
        current.push(tag)
      } else {
        current.splice(pos, 1)
      }
      this.updateFeatureField(idx, 'tags', current)
    },

    featureErrors(idx) {
      const prefix = `${this.path}[${idx}]`
      return this.errors.filter((e) =>
        e.field.startsWith(prefix)
      )
    },

    hasFieldError(idx, fieldName) {
      const target = `${this.path}[${idx}].${fieldName}`
      return this.errors.some((e) => e.field === target)
    }
  }
}
</script>

<style scoped>
.feature-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.feature-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.feature-editor__title {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.feature-editor__help {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.feature-editor__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.feature-editor__item {
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-border);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding: var(--space-sm) var(--space-md);
  background-color: rgba(0, 0, 0, 0.1);
}

.feature-editor__item--action {
  border-left-color: var(--color-accent-fear);
}

.feature-editor__item--reaction {
  border-left-color: var(--color-accent-gold);
}

.feature-editor__item--passive {
  border-left-color: var(--color-accent-hope);
}

.feature-editor__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.feature-editor__item-number {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-bold);
}

.feature-editor__item-actions {
  display: flex;
  gap: var(--space-xs);
}

.feature-editor__move-btn,
.feature-editor__remove-btn {
  padding: 2px var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.feature-editor__move-btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-elevated);
}

.feature-editor__remove-btn:hover {
  color: var(--color-accent-danger);
  background-color: rgba(244, 67, 54, 0.1);
}

.feature-editor__item-fields {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-sm);
}

.feature-editor__field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feature-editor__field--desc {
  grid-column: 1 / -1;
}

.feature-editor__field--tags {
  grid-column: 1 / -1;
}

.feature-editor__tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.feature-editor__tag-option {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.feature-editor__tag-option:hover {
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}

.feature-editor__tag-option--active {
  background-color: var(--color-accent-hope);
  border-color: var(--color-accent-hope);
  color: #fff;
  font-weight: var(--font-weight-medium);
}

.feature-editor__field-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.feature-editor__required {
  color: var(--color-accent-fear);
}

.feature-editor__input {
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.feature-editor__input:focus {
  outline: none;
  border-color: var(--color-accent-hope);
}

.feature-editor__input[aria-invalid="true"] {
  border-color: var(--color-accent-danger);
}

.feature-editor__input::placeholder {
  color: var(--color-text-muted);
}

.feature-editor__select {
  cursor: pointer;
  appearance: auto;
}

.feature-editor__textarea {
  resize: vertical;
  min-height: 48px;
}

.feature-editor__item-errors {
  margin-top: var(--space-xs);
}

.feature-editor__error-msg {
  font-size: var(--font-size-xs);
  color: var(--color-accent-danger);
  margin: 0;
}

.feature-editor__empty {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  padding: var(--space-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  margin: 0;
}

/* Responsive: stack fields on small screens */
@media (max-width: 480px) {
  .feature-editor__item-fields {
    grid-template-columns: 1fr;
  }
}

/* Accessibilité */
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
