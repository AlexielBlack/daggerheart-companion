<template>
  <ModuleBoundary
    module-name="Hub Homebrew"
    module-id="homebrew-hub"
  >
    <div class="hb-hub">
      <!-- En-tête -->
      <header class="hb-hub__header">
        <h2 class="hb-hub__title">
          <span
            class="hb-hub__title-icon"
            aria-hidden="true"
          >✎</span>
          Contenu Homebrew
        </h2>
        <p class="hb-hub__subtitle">
          {{ totalCount }} création{{ totalCount !== 1 ? 's' : '' }} custom
        </p>
      </header>

      <!-- Grille des catégories -->
      <section
        class="hb-hub__grid"
        aria-label="Catégories homebrew"
      >
        <article
          v-for="cat in categories"
          :key="cat.key"
          class="hb-hub__card"
          :class="{ 'hb-hub__card--empty': cat.count === 0 }"
        >
          <div class="hb-hub__card-header">
            <span
              class="hb-hub__card-icon"
              aria-hidden="true"
            >{{ cat.icon }}</span>
            <div class="hb-hub__card-info">
              <h3 class="hb-hub__card-name">
                {{ cat.label }}
              </h3>
              <span
                class="hb-hub__card-count"
                :aria-label="`${cat.count} ${cat.labelSingular || cat.label}`"
              >
                {{ cat.count }}
              </span>
            </div>
          </div>

          <p class="hb-hub__card-desc">
            {{ cat.description }}
          </p>

          <div class="hb-hub__card-actions">
            <router-link
              :to="cat.listRoute"
              class="btn btn--sm btn--secondary"
            >
              Voir
            </router-link>
            <router-link
              :to="cat.createRoute"
              class="btn btn--sm btn--primary"
            >
              + Créer
            </router-link>
          </div>
        </article>
      </section>

      <!-- Export / Import global -->
      <section
        class="hb-hub__global-actions"
        aria-label="Actions globales"
      >
        <h3 class="hb-hub__section-title">
          Import / Export global
        </h3>
        <p class="hb-hub__section-desc">
          Exportez ou importez l'ensemble de vos créations homebrew en un fichier JSON.
        </p>

        <div class="hb-hub__action-bar">
          <button
            class="btn btn--secondary"
            :disabled="totalCount === 0"
            @click="exportAll"
          >
            📤 Exporter tout ({{ totalCount }})
          </button>

          <label class="btn btn--secondary hb-hub__import-label">
            📥 Importer
            <input
              ref="importInput"
              type="file"
              accept=".json"
              class="hb-hub__import-input"
              @change="onImportFile"
            />
          </label>

          <button
            v-if="totalCount > 0"
            class="btn btn--danger btn--sm"
            @click="showClearConfirm = true"
          >
            🗑️ Tout supprimer
          </button>
        </div>

        <!-- Résultat d'import -->
        <div
          v-if="importResult"
          class="hb-hub__import-result"
          :class="{
            'hb-hub__import-result--success': importResult.success,
            'hb-hub__import-result--error': !importResult.success
          }"
          role="status"
        >
          {{ importResult.message }}
        </div>

        <!-- Confirmation de suppression totale -->
        <div
          v-if="showClearConfirm"
          ref="clearConfirmRef"
          class="hb-hub__clear-confirm"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirmer la suppression de tout le contenu homebrew"
        >
          <p class="hb-hub__clear-text">
            Supprimer <strong>toutes les {{ totalCount }} créations</strong> homebrew ?
            Cette action est irréversible.
          </p>
          <div class="hb-hub__clear-actions">
            <button
              class="btn btn--danger btn--sm"
              @click="clearAll"
            >
              Tout supprimer
            </button>
            <button
              class="btn btn--ghost btn--sm"
              @click="showClearConfirm = false"
            >
              Annuler
            </button>
          </div>
        </div>
      </section>
    </div>
  </ModuleBoundary>
</template>

<script>
import { ref, computed } from 'vue'
import { useFocusTrap } from '@core/composables/useFocusTrap.js'
import ModuleBoundary from '@core/components/ModuleBoundary.vue'
import { useAdversaryHomebrewStore } from '../categories/adversary/useAdversaryHomebrewStore.js'
import { useAncestryHomebrewStore } from '../categories/ancestry/useAncestryHomebrewStore.js'
import { useClassHomebrewStore } from '../categories/class/useClassHomebrewStore.js'
import { useCommunityHomebrewStore } from '../categories/community/useCommunityHomebrewStore.js'
import { useDomainHomebrewStore } from '../categories/domain/useDomainHomebrewStore.js'
import { useEnvironmentHomebrewStore } from '../categories/environment/useEnvironmentHomebrewStore.js'
import { useEquipmentHomebrewStore } from '../categories/equipment/useEquipmentHomebrewStore.js'

/**
 * Définition statique des catégories avec descriptions et routes.
 */
const CATEGORY_DEFS = [
  {
    key: 'adversary',
    icon: '⚔️',
    label: 'Adversaires',
    labelSingular: 'adversaire',
    description: 'Créez des ennemis uniques avec stats, features et seuils de dégâts.',
    listRoute: '/homebrew/adversary',
    createRoute: '/homebrew/adversary/new'
  },
  {
    key: 'ancestry',
    icon: '🧬',
    label: 'Ascendances',
    labelSingular: 'ascendance',
    description: 'Inventez de nouvelles ascendances avec features et traits.',
    listRoute: '/homebrew/ancestry',
    createRoute: '/homebrew/ancestry/new'
  },
  {
    key: 'class',
    icon: '🛡️',
    label: 'Classes',
    labelSingular: 'classe',
    description: 'Concevez des classes avec domaines, stats et hope features.',
    listRoute: '/homebrew/class',
    createRoute: '/homebrew/class/new'
  },
  {
    key: 'community',
    icon: '🏘️',
    label: 'Communautés',
    labelSingular: 'communauté',
    description: 'Créez des communautés avec adjectifs et features narratives.',
    listRoute: '/homebrew/community',
    createRoute: '/homebrew/community/new'
  },
  {
    key: 'domain',
    icon: '🃏',
    label: 'Domaines',
    labelSingular: 'domaine',
    description: 'Construisez des domaines avec cartes, sorts et thèmes.',
    listRoute: '/homebrew/domain',
    createRoute: '/homebrew/domain/new'
  },
  {
    key: 'environment',
    icon: '🏔️',
    label: 'Environnements',
    labelSingular: 'environnement',
    description: 'Modélisez des lieux avec tiers, impulses et features.',
    listRoute: '/homebrew/environment',
    createRoute: '/homebrew/environment/new'
  },
  {
    key: 'equipment',
    icon: '🗡️',
    label: 'Équipement',
    labelSingular: 'équipement',
    description: 'Forgez armes, armures, butin et consommables.',
    listRoute: '/homebrew/equipment',
    createRoute: '/homebrew/equipment/new'
  }
]

/**
 * @component HomebrewHub
 * @description Page centrale du module homebrew. Affiche un tableau de bord
 * avec toutes les catégories, compteurs, actions rapides et import/export global.
 */
export default {
  name: 'HomebrewHub',

  components: { ModuleBoundary },

  setup() {
    // ── Stores ──
    const stores = {
      adversary: useAdversaryHomebrewStore(),
      ancestry: useAncestryHomebrewStore(),
      class: useClassHomebrewStore(),
      community: useCommunityHomebrewStore(),
      domain: useDomainHomebrewStore(),
      environment: useEnvironmentHomebrewStore(),
      equipment: useEquipmentHomebrewStore()
    }

    // ── Catégories enrichies avec compteurs réactifs ──
    const categories = computed(() =>
      CATEGORY_DEFS.map((def) => ({
        ...def,
        count: stores[def.key].items.length
      }))
    )

    const totalCount = computed(() =>
      categories.value.reduce((sum, cat) => sum + cat.count, 0)
    )

    // ── Import / Export global ──
    const importInput = ref(null)
    const importResult = ref(null)
    const showClearConfirm = ref(false)
    const clearConfirmRef = ref(null)
    useFocusTrap(clearConfirmRef, () => showClearConfirm.value)

    function exportAll() {
      const payload = {}
      for (const [key, store] of Object.entries(stores)) {
        payload[key] = store.items
      }
      const json = JSON.stringify(payload, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dh-homebrew-all-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    function onImportFile(event) {
      const file = event.target.files?.[0]
      if (!file) return

      importResult.value = null
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          let imported = 0

          for (const [key, store] of Object.entries(stores)) {
            if (Array.isArray(data[key])) {
              const result = store.importItems(JSON.stringify(data[key]))
              if (result?.imported) imported += result.imported
            }
          }

          importResult.value = {
            success: true,
            message: `✅ ${imported} élément${imported !== 1 ? 's' : ''} importé${imported !== 1 ? 's' : ''} avec succès.`
          }
        } catch (err) {
          importResult.value = {
            success: false,
            message: `❌ Erreur d'import : ${err.message}`
          }
        }

        // Réinitialiser l'input file
        if (importInput.value) {
          importInput.value.value = ''
        }
      }

      reader.onerror = () => {
        importResult.value = {
          success: false,
          message: '❌ Impossible de lire le fichier.'
        }
      }

      reader.readAsText(file)
    }

    function clearAll() {
      for (const store of Object.values(stores)) {
        store.clearAll()
      }
      showClearConfirm.value = false
    }

    return {
      categories,
      totalCount,
      importInput,
      importResult,
      showClearConfirm, clearConfirmRef,
      exportAll,
      onImportFile,
      clearAll
    }
  }
}
</script>

<style scoped>
.hb-hub {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md);
}

/* En-tête */
.hb-hub__header {
  text-align: center;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.hb-hub__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.hb-hub__title-icon {
  font-size: 1.4em;
}

.hb-hub__subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Grille */
.hb-hub__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

/* Carte catégorie */
.hb-hub__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.hb-hub__card:hover {
  border-color: var(--color-accent-hope);
  box-shadow: var(--shadow-md);
}

.hb-hub__card--empty {
  opacity: 0.7;
}

.hb-hub__card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.hb-hub__card-icon {
  font-size: 1.6em;
  flex-shrink: 0;
}

.hb-hub__card-info {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
}

.hb-hub__card-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hb-hub__card-count {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
  margin-left: auto;
  flex-shrink: 0;
}

.hb-hub__card-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}

.hb-hub__card-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
  padding-top: var(--space-sm);
}

/* Section actions globales */
.hb-hub__global-actions {
  padding: var(--space-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.hb-hub__section-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
}

.hb-hub__section-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-md);
}

.hb-hub__action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
}

/* Import caché */
.hb-hub__import-label {
  cursor: pointer;
  position: relative;
}

.hb-hub__import-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Résultat d'import */
.hb-hub__import-result {
  margin-top: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.hb-hub__import-result--success {
  background-color: rgba(46, 125, 50, 0.15);
  color: var(--color-accent-success, #4caf50);
  border: 1px solid rgba(46, 125, 50, 0.3);
}

.hb-hub__import-result--error {
  background-color: rgba(198, 40, 40, 0.15);
  color: var(--color-accent-danger, #f44336);
  border: 1px solid rgba(198, 40, 40, 0.3);
}

/* Confirmation suppression totale */
.hb-hub__clear-confirm {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-accent-danger, #f44336);
  border-radius: var(--radius-md);
}

.hb-hub__clear-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.hb-hub__clear-actions {
  display: flex;
  gap: var(--space-sm);
}

/* Responsive */
@media (max-width: 600px) {
  .hb-hub__grid {
    grid-template-columns: 1fr;
  }

  .hb-hub__action-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
