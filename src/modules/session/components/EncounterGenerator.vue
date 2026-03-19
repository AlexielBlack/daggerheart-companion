<template>
  <section
    class="enc-generator"
    aria-label="Generateur de rencontres"
  >
    <h3 class="enc-generator__title">
      &#x26A1; Generateur de rencontres
    </h3>

    <!-- Etape 1 : Formulaire de parametres -->
    <form
      v-if="!result"
      class="enc-generator__form"
      @submit.prevent="handleGenerate"
    >
      <!-- Tier -->
      <div class="enc-generator__field">
        <label
          for="enc-gen-tier"
          class="enc-generator__label"
        >Tier</label>
        <select
          id="enc-gen-tier"
          v-model.number="params.tier"
          class="enc-generator__select"
        >
          <option :value="1">
            Tier 1
          </option>
          <option :value="2">
            Tier 2
          </option>
          <option :value="3">
            Tier 3
          </option>
          <option :value="4">
            Tier 4
          </option>
        </select>
      </div>

      <!-- Theme -->
      <div class="enc-generator__field">
        <label
          for="enc-gen-theme"
          class="enc-generator__label"
        >Theme</label>
        <select
          id="enc-gen-theme"
          v-model="params.theme"
          class="enc-generator__select"
        >
          <option
            v-for="t in THEMES"
            :key="String(t.id)"
            :value="t.id"
          >
            {{ t.label }}
          </option>
        </select>
      </div>

      <!-- Difficulte -->
      <fieldset class="enc-generator__field enc-generator__fieldset">
        <legend class="enc-generator__label">
          Difficulte
        </legend>
        <div class="enc-generator__radio-group">
          <label
            v-for="d in DIFFICULTIES"
            :key="d.id"
            class="enc-generator__radio-label"
            :class="{ 'enc-generator__radio-label--active': params.difficulty === d.id }"
          >
            <input
              v-model="params.difficulty"
              type="radio"
              :value="d.id"
              class="enc-generator__radio"
            />
            {{ d.label }}
          </label>
        </div>
      </fieldset>

      <!-- Nombre de PJ (lecture seule) -->
      <div class="enc-generator__field">
        <span class="enc-generator__label">Nombre de PJ</span>
        <span class="enc-generator__readonly">
          {{ pcCount }} PJ{{ pcCount > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Bouton generer -->
      <button
        type="submit"
        class="btn btn--primary enc-generator__submit"
      >
        &#x1F3B2; Generer
      </button>
    </form>

    <!-- Etape 2 : Resultat -->
    <div
      v-else
      class="enc-generator__result"
    >
      <!-- En-tete du resultat -->
      <div class="enc-generator__result-header">
        <h4 class="enc-generator__result-title">
          {{ resultTitle }}
        </h4>
        <span class="enc-generator__bp-badge">
          {{ result.totalBP }} / {{ result.budgetBP }} BP
        </span>
      </div>

      <!-- Pas d'adversaires eligibles -->
      <p
        v-if="result.slots.length === 0"
        class="enc-generator__empty"
      >
        Aucun adversaire eligible pour ces parametres.
        Essayez un autre theme ou tier.
      </p>

      <!-- Liste des adversaires -->
      <ul
        v-else
        class="enc-generator__slots"
      >
        <li
          v-for="(slot, idx) in result.slots"
          :key="idx"
          class="enc-generator__slot"
        >
          <span class="enc-generator__slot-name">
            {{ slot.adversary.name }}
            <span class="enc-generator__slot-qty">×{{ slot.quantity }}</span>
          </span>
          <span class="enc-generator__slot-meta">
            {{ slot.adversary.type }} &middot; {{ slot.cost }} BP
          </span>
        </li>
      </ul>

      <!-- Actions -->
      <div class="enc-generator__actions">
        <button
          class="btn btn--ghost btn--sm"
          aria-label="Regenerer une rencontre"
          @click="handleRegenerate"
        >
          &#x1F504; Regenerer
        </button>
        <button
          class="btn btn--primary btn--sm"
          aria-label="Sauvegarder cette rencontre"
          :disabled="result.slots.length === 0"
          @click="handleSave"
        >
          &#x1F4BE; Sauvegarder
        </button>
        <button
          class="btn btn--ghost btn--sm"
          aria-label="Modifier dans le constructeur"
          :disabled="result.slots.length === 0"
          @click="handleEditInPrep"
        >
          &#x270F;&#xFE0F; Modifier
        </button>
      </div>

      <!-- Notification de sauvegarde -->
      <p
        v-if="saveMessage"
        class="enc-generator__save-msg"
        role="status"
        aria-live="polite"
      >
        {{ saveMessage }}
      </p>
    </div>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/sessionStore'
import { useCharacterStore } from '@modules/characters'
import { generateEncounter } from '@modules/encounter/composables/useEncounterGenerator'
import { useEncounterStore } from '@modules/encounter/stores/encounterStore'
import { allAdversaries } from '@data/adversaries'

/** Themes disponibles pour le generateur */
const THEMES = [
  { id: 'humanoide', label: 'Humanoide' },
  { id: 'bete', label: 'Creatures sauvages' },
  { id: 'mort-vivant', label: 'Mort-vivants' },
  { id: 'boss', label: 'Gardiens / Boss' },
  { id: 'embuscade', label: 'Embuscade' },
  { id: null, label: 'Aleatoire' }
]

/** Options de difficulte */
const DIFFICULTIES = [
  { id: 'easy', label: 'Facile' },
  { id: 'standard', label: 'Standard' },
  { id: 'hard', label: 'Difficile' }
]

/**
 * Calcule le tier d'un personnage selon son niveau.
 * @param {number} level
 * @returns {number}
 */
function getTierForLevel(level) {
  if (!level || level <= 1) return 1
  if (level <= 4) return 2
  if (level <= 7) return 3
  return 4
}

/**
 * @component EncounterGenerator
 * @description Generateur de rencontres en deux etapes :
 * 1. Formulaire de parametres (tier, theme, difficulte, PJ count)
 * 2. Affichage du resultat avec options d'action
 */
export default {
  name: 'EncounterGenerator',

  setup() {
    const router = useRouter()
    const sessionStore = useSessionStore()
    const characterStore = useCharacterStore()
    const encounterStore = useEncounterStore()

    // ── Nombre de PJ (auto-detecte) ───────────────────────
    const pcCount = computed(() => {
      const count = characterStore.characters?.length || 0
      return count > 0 ? count : 4
    })

    // ── Tier initial depuis session ou PC ─────────────────
    const initialTier = computed(() => {
      if (sessionStore.loadedEnvironment?.tier) {
        return sessionStore.loadedEnvironment.tier
      }
      const chars = characterStore.characters || []
      if (chars.length > 0) {
        const tiers = chars.map(c => getTierForLevel(c.level || 1))
        const avg = Math.round(tiers.reduce((a, b) => a + b, 0) / tiers.length)
        return Math.min(4, Math.max(1, avg))
      }
      return 1
    })

    // ── Parametres du formulaire ───────────────────────────
    const params = ref({
      tier: initialTier.value,
      theme: null,
      difficulty: 'standard'
    })

    // ── Resultat de la generation ─────────────────────────
    const result = ref(null)
    const saveMessage = ref('')
    let saveTimer = null

    // ── Titre du resultat ─────────────────────────────────
    const resultTitle = computed(() => {
      if (!result.value) return ''
      const theme = THEMES.find(t => t.id === result.value.theme)
      const themeName = theme ? theme.label : 'Rencontre'
      return `${themeName} — T${result.value.tier}`
    })

    // ── Actions ───────────────────────────────────────────

    /** Lance la generation avec les parametres actuels */
    function handleGenerate() {
      const generated = generateEncounter({
        adversaries: allAdversaries,
        tier: params.value.tier,
        theme: params.value.theme,
        difficulty: params.value.difficulty,
        pcCount: pcCount.value
      })
      result.value = generated
      saveMessage.value = ''
    }

    /** Regenere avec les memes parametres */
    function handleRegenerate() {
      handleGenerate()
    }

    /**
     * Sauvegarde la rencontre generee via encounterStore.
     * Charge les slots dans le store puis sauvegarde.
     */
    function handleSave() {
      if (!result.value || result.value.slots.length === 0) return

      // Construire les donnees de rencontre compatibles avec encounterStore
      const themeObj = THEMES.find(t => t.id === result.value.theme)
      const themeName = themeObj ? themeObj.label : 'Rencontre'
      const encData = {
        name: `${themeName} — T${result.value.tier}`,
        tier: result.value.tier,
        pcCount: pcCount.value,
        intensity: params.value.difficulty === 'easy'
          ? 'lenient'
          : params.value.difficulty === 'hard'
            ? 'deadly'
            : 'standard',
        adjustments: [],
        adversarySlots: result.value.slots.map(slot => ({
          adversaryId: slot.adversary.id,
          quantity: slot.quantity
        })),
        environmentId: sessionStore.environmentId || null,
        selectedPcIds: (characterStore.characters || []).map(c => c.id),
        notes: '',
        createdAt: new Date().toISOString(),
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      }

      // Charger dans le store puis sauvegarder
      encounterStore.loadEncounter(encData)
      encounterStore.saveEncounter()

      // Notification de confirmation
      saveMessage.value = 'Rencontre sauvegardee !'
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => { saveMessage.value = '' }, 3000)
    }

    /**
     * Charge la rencontre generee dans le constructeur et navigue vers Prep.
     */
    function handleEditInPrep() {
      if (!result.value || result.value.slots.length === 0) return

      const themeObj = THEMES.find(t => t.id === result.value.theme)
      const themeName = themeObj ? themeObj.label : 'Rencontre'
      const encData = {
        name: `${themeName} — T${result.value.tier}`,
        tier: result.value.tier,
        pcCount: pcCount.value,
        intensity: 'standard',
        adjustments: [],
        adversarySlots: result.value.slots.map(slot => ({
          adversaryId: slot.adversary.id,
          quantity: slot.quantity
        })),
        environmentId: sessionStore.environmentId || null,
        selectedPcIds: (characterStore.characters || []).map(c => c.id),
        notes: ''
      }

      encounterStore.loadEncounter(encData)
      router.push('/table/prep/rencontres')
    }

    return {
      THEMES,
      DIFFICULTIES,
      params,
      pcCount,
      result,
      resultTitle,
      saveMessage,
      handleGenerate,
      handleRegenerate,
      handleSave,
      handleEditInPrep
    }
  }
}
</script>

<style scoped>
.enc-generator__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-md) 0;
}

/* ── Formulaire ────────────────────────────────────── */

.enc-generator__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.enc-generator__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.enc-generator__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.enc-generator__select {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.enc-generator__select:focus {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: 1px;
}

.enc-generator__fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.enc-generator__radio-group {
  display: flex;
  gap: var(--space-sm);
}

.enc-generator__radio-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex: 1;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.enc-generator__radio-label--active {
  background: var(--color-accent-hope);
  color: #fff;
  border-color: var(--color-accent-hope);
}

.enc-generator__radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.enc-generator__readonly {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  padding: var(--space-xs) 0;
}

.enc-generator__submit {
  margin-top: var(--space-sm);
  width: 100%;
  justify-content: center;
}

/* ── Resultat ──────────────────────────────────────── */

.enc-generator__result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.enc-generator__result-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text-primary);
}

.enc-generator__bp-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  color: var(--color-accent-hope);
  white-space: nowrap;
}

.enc-generator__empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  padding: var(--space-sm) 0;
}

.enc-generator__slots {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.enc-generator__slot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.enc-generator__slot-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.enc-generator__slot-qty {
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
  margin-left: var(--space-xs);
}

.enc-generator__slot-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

/* ── Boutons d'action ──────────────────────────────── */

.enc-generator__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.enc-generator__save-msg {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-accent-hope);
}

/* ── Utilitaires btn ───────────────────────────────── */

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  transition: filter 0.15s, background 0.15s;
}

.btn--sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-sm);
}

.btn--primary {
  background: var(--color-accent-hope);
  color: #fff;
  border: none;
}

.btn--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--ghost {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.btn--ghost:hover:not(:disabled) {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
}

.btn--ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
