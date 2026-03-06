<!--
  NpcSheet.vue — Fiche complète d'un PNJ avec édition inline.
  Affiche identité, motifs, relations PJ et PNJ.
-->
<template>
  <section
    class="npc-sheet"
    :aria-label="`Fiche de ${form.name || 'PNJ'}`"
  >
    <!-- ── En-tête ── -->
    <header class="npc-sheet__header">
      <div class="npc-sheet__title-row">
        <h2 class="npc-sheet__name">
          {{ isNew ? 'Nouveau PNJ' : form.name }}
        </h2>
        <div class="npc-sheet__actions">
          <button
            class="btn btn--small btn--primary"
            :disabled="!isDirty"
            aria-label="Sauvegarder les modifications"
            @click="save"
          >
            💾 Sauver
          </button>
          <button
            v-if="!isNew"
            class="btn btn--small btn--danger"
            aria-label="Supprimer ce PNJ"
            @click="confirmDelete"
          >
            🗑️
          </button>
        </div>
      </div>
      <p
        v-if="saveMessage"
        class="npc-sheet__message"
        :class="{ 'npc-sheet__message--error': saveError }"
        role="status"
      >
        {{ saveMessage }}
      </p>
    </header>

    <!-- ── Identité ── -->
    <fieldset class="npc-sheet__section">
      <legend>Identité</legend>

      <div class="field-grid">
        <div class="field">
          <label for="npc-name">Nom *</label>
          <input
            id="npc-name"
            v-model="form.name"
            type="text"
            required
            placeholder="Nom du PNJ"
          />
        </div>

        <div class="field">
          <label for="npc-title">Titre / Rôle</label>
          <input
            id="npc-title"
            v-model="form.title"
            type="text"
            placeholder="Ex: Forgeron du quartier sud"
          />
        </div>

        <div class="field">
          <label for="npc-status">Statut</label>
          <select
            id="npc-status"
            v-model="form.status"
          >
            <option
              v-for="s in statuses"
              :key="s.value"
              :value="s.value"
            >
              {{ s.emoji }} {{ s.label }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="npc-difficulty">Difficulté</label>
          <input
            id="npc-difficulty"
            v-model.number="form.difficulty"
            type="number"
            min="1"
            max="30"
            placeholder="—"
          />
        </div>
      </div>

      <div class="field-grid">
        <div class="field">
          <label for="npc-faction">Faction</label>
          <input
            id="npc-faction"
            v-model="form.faction"
            type="text"
            placeholder="Guilde, famille, organisation…"
            list="faction-suggestions"
          />
          <datalist id="faction-suggestions">
            <option
              v-for="f in factions"
              :key="f"
              :value="f"
            ></option>
          </datalist>
        </div>

        <div class="field">
          <label for="npc-location">Lieu habituel</label>
          <input
            id="npc-location"
            v-model="form.location"
            type="text"
            placeholder="Quartier, bâtiment…"
            list="location-suggestions"
          />
          <datalist id="location-suggestions">
            <option
              v-for="l in locations"
              :key="l"
              :value="l"
            ></option>
          </datalist>
        </div>
      </div>
    </fieldset>

    <!-- ── Description & Motifs ── -->
    <fieldset class="npc-sheet__section">
      <legend>Description & Motifs</legend>

      <div class="field">
        <label for="npc-description">Description</label>
        <textarea
          id="npc-description"
          v-model="form.description"
          rows="3"
          placeholder="Apparence, comportement…"
        ></textarea>
      </div>

      <div class="field">
        <label for="npc-personality">Personnalité</label>
        <input
          id="npc-personality"
          v-model="form.personality"
          type="text"
          placeholder="Traits de caractère clés"
        />
      </div>

      <div class="field-grid">
        <div class="field">
          <label for="npc-motives">Motifs</label>
          <textarea
            id="npc-motives"
            v-model="form.motives"
            rows="2"
            placeholder="Ce que le PNJ veut…"
          ></textarea>
        </div>

        <div class="field">
          <label for="npc-tactics">Tactiques</label>
          <textarea
            id="npc-tactics"
            v-model="form.tactics"
            rows="2"
            placeholder="Comment il agit…"
          ></textarea>
        </div>
      </div>
    </fieldset>

    <!-- ── Build Lite ── -->
    <NpcBuildPanel
      :class-id="form.classId"
      :subclass-id="form.subclassId"
      :level="form.level"
      :homebrew-classes="homebrewClasses"
      @update:class-id="form.classId = $event"
      @update:subclass-id="form.subclassId = $event"
      @update:level="form.level = $event"
    />

    <!-- ── Combat ── -->
    <NpcCombatPanel
      :combat-profile-mode="form.combatProfileMode"
      :linked-adversary-id="form.linkedAdversaryId"
      :adversary-type="form.adversaryType"
      :tier="form.tier"
      :proficiency="form.proficiency"
      :combat-features="form.combatFeatures"
      :all-adversaries="allAdversaries"
      :class-id="form.classId"
      @update:combat-profile-mode="form.combatProfileMode = $event"
      @update:linked-adversary-id="form.linkedAdversaryId = $event"
      @update:adversary-type="form.adversaryType = $event"
      @update:tier="form.tier = $event"
      @update:proficiency="form.proficiency = $event"
      @update:combat-features="form.combatFeatures = $event"
    />

    <!-- ── Relations PJ ── -->
    <fieldset class="npc-sheet__section">
      <legend>Relations avec les PJs</legend>

      <div
        v-if="form.pcRelations.length === 0"
        class="npc-sheet__empty"
      >
        Aucune relation avec les PJs.
      </div>

      <div
        v-for="(rel, i) in form.pcRelations"
        :key="i"
        class="relation-row"
      >
        <input
          v-model="rel.pcId"
          type="text"
          class="relation-row__pc"
          placeholder="Nom du PJ"
          :aria-label="`Nom du PJ, relation ${i + 1}`"
        />
        <select
          v-model.number="rel.disposition"
          class="relation-row__disposition"
          :aria-label="`Disposition envers PJ, relation ${i + 1}`"
        >
          <option
            v-for="d in dispositions"
            :key="d.value"
            :value="d.value"
          >
            {{ d.emoji }} {{ d.label }}
          </option>
        </select>
        <input
          v-model="rel.note"
          type="text"
          class="relation-row__note"
          placeholder="Note…"
          :aria-label="`Note relation ${i + 1}`"
        />
        <button
          class="btn btn--icon btn--danger"
          :aria-label="`Supprimer relation PJ ${i + 1}`"
          @click="removePcRel(i)"
        >
          ✕
        </button>
      </div>

      <button
        class="btn btn--small btn--ghost"
        @click="addPcRelation"
      >
        + Relation PJ
      </button>
    </fieldset>

    <!-- ── Relations PNJ ── -->
    <fieldset class="npc-sheet__section">
      <legend>Relations avec d'autres PNJs</legend>

      <div
        v-if="form.npcRelations.length === 0"
        class="npc-sheet__empty"
      >
        Aucune relation avec d'autres PNJs.
      </div>

      <div
        v-for="(rel, i) in form.npcRelations"
        :key="i"
        class="relation-row"
      >
        <select
          v-model="rel.targetNpcId"
          class="relation-row__target"
          :aria-label="`PNJ cible, relation ${i + 1}`"
        >
          <option value="">
            Choisir un PNJ…
          </option>
          <option
            v-for="other in availableNpcs"
            :key="other.id"
            :value="other.id"
          >
            {{ other.name }}
          </option>
        </select>
        <select
          v-model="rel.type"
          class="relation-row__type"
          :aria-label="`Type de relation ${i + 1}`"
        >
          <option
            v-for="t in relationTypes"
            :key="t.value"
            :value="t.value"
          >
            {{ t.emoji }} {{ t.label }}
          </option>
        </select>
        <input
          v-model="rel.note"
          type="text"
          class="relation-row__note"
          placeholder="Note…"
          :aria-label="`Note relation PNJ ${i + 1}`"
        />
        <label class="relation-row__bidi">
          <input
            v-model="rel.bidirectional"
            type="checkbox"
          />
          <span
            title="Relation bidirectionnelle"
            aria-label="Bidirectionnelle"
          >↔</span>
        </label>
        <button
          class="btn btn--icon btn--danger"
          :aria-label="`Supprimer relation PNJ ${i + 1}`"
          @click="removeNpcRel(i)"
        >
          ✕
        </button>
      </div>

      <button
        class="btn btn--small btn--ghost"
        @click="addNpcRelation"
      >
        + Relation PNJ
      </button>
    </fieldset>

    <!-- ── Notes ── -->
    <fieldset class="npc-sheet__section">
      <legend>Notes</legend>
      <div class="field">
        <textarea
          id="npc-notes"
          v-model="form.notes"
          rows="4"
          placeholder="Notes de session, secrets, rappels…"
          aria-label="Notes libres"
        ></textarea>
      </div>
    </fieldset>
  </section>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  ALL_NPC_STATUSES,
  NPC_STATUS_META,
  ALL_DISPOSITIONS,
  DISPOSITION_META,
  DISPOSITION_NEUTRAL,
  ALL_RELATION_TYPES,
  RELATION_TYPE_META,
  RELATION_FAMILY,
  createDefaultNpc
} from '../constants.js'

import NpcBuildPanel from './NpcBuildPanel.vue'
import NpcCombatPanel from './NpcCombatPanel.vue'

export default {
  name: 'NpcSheet',

  components: { NpcBuildPanel, NpcCombatPanel },

  props: {
    /** PNJ existant à éditer, ou null pour un nouveau */
    npc: { type: Object, default: null },
    /** Liste des autres PNJs (pour les relations PNJ↔PNJ) */
    otherNpcs: { type: Array, default: () => [] },
    /** Factions existantes (pour autocomplétion) */
    factions: { type: Array, default: () => [] },
    /** Lieux existants (pour autocomplétion) */
    locations: { type: Array, default: () => [] },
    /** Classes homebrew */
    homebrewClasses: { type: Array, default: () => [] },
    /** Tous les adversaires (SRD + homebrew) */
    allAdversaries: { type: Array, default: () => [] }
  },

  emits: ['save', 'delete'],

  setup(props, { emit }) {
    const form = ref(createDefaultNpc())
    const isDirty = ref(false)
    const saveMessage = ref('')
    const saveError = ref(false)

    const isNew = computed(() => !props.npc || !props.npc.id)

    // Charger les données du PNJ quand il change
    function loadNpc(npc) {
      if (npc && npc.id) {
        form.value = JSON.parse(JSON.stringify({
          ...createDefaultNpc(),
          ...npc,
          pcRelations: Array.isArray(npc.pcRelations) ? npc.pcRelations : [],
          npcRelations: Array.isArray(npc.npcRelations) ? npc.npcRelations : []
        }))
      } else {
        form.value = createDefaultNpc()
      }
      isDirty.value = false
      saveMessage.value = ''
    }

    watch(() => props.npc, loadNpc, { immediate: true, deep: true })

    // Marquer dirty sur toute modification du formulaire
    watch(form, () => {
      isDirty.value = true
    }, { deep: true })

    // Listes pour les selects
    const statuses = ALL_NPC_STATUSES.map((s) => ({
      value: s,
      label: NPC_STATUS_META[s].label,
      emoji: NPC_STATUS_META[s].emoji
    }))

    const dispositions = ALL_DISPOSITIONS.map((d) => ({
      value: d,
      label: DISPOSITION_META[d].label,
      emoji: DISPOSITION_META[d].emoji
    }))

    const relationTypes = ALL_RELATION_TYPES.map((t) => ({
      value: t,
      label: RELATION_TYPE_META[t].label,
      emoji: RELATION_TYPE_META[t].emoji
    }))

    // PNJs disponibles pour les relations (exclure soi-même)
    const availableNpcs = computed(() => {
      const currentId = form.value.id
      return props.otherNpcs.filter((n) => n.id !== currentId)
    })

    // ── Actions relations PJ ──
    function addPcRelation() {
      form.value.pcRelations.push({
        pcId: '',
        disposition: DISPOSITION_NEUTRAL,
        note: ''
      })
    }

    function removePcRel(index) {
      form.value.pcRelations.splice(index, 1)
    }

    // ── Actions relations PNJ ──
    function addNpcRelation() {
      form.value.npcRelations.push({
        targetNpcId: '',
        type: RELATION_FAMILY,
        note: '',
        bidirectional: false
      })
    }

    function removeNpcRel(index) {
      form.value.npcRelations.splice(index, 1)
    }

    // ── Sauvegarde ──
    function save() {
      if (!form.value.name || !form.value.name.trim()) {
        saveMessage.value = 'Le nom est obligatoire.'
        saveError.value = true
        return
      }

      // Nettoyage : supprimer les relations vides
      form.value.pcRelations = form.value.pcRelations.filter((r) => r.pcId && r.pcId.trim())
      form.value.npcRelations = form.value.npcRelations.filter((r) => r.targetNpcId)

      // Normaliser la difficulté
      if (form.value.difficulty === '' || form.value.difficulty === 0) {
        form.value.difficulty = null
      }

      emit('save', JSON.parse(JSON.stringify(form.value)))
      isDirty.value = false
      saveMessage.value = 'Sauvegardé ✓'
      saveError.value = false
      setTimeout(() => { saveMessage.value = '' }, 2000)
    }

    function confirmDelete() {
      emit('delete', form.value.id)
    }

    return {
      form,
      isNew,
      isDirty,
      saveMessage,
      saveError,
      statuses,
      dispositions,
      relationTypes,
      availableNpcs,
      addPcRelation,
      removePcRel,
      addNpcRelation,
      removeNpcRel,
      save,
      confirmDelete
    }
  }
}
</script>

<style scoped>
.npc-sheet {
  padding: 1rem;
  max-width: 700px;
}

.npc-sheet__header {
  margin-bottom: 1rem;
}

.npc-sheet__title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.npc-sheet__name {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text, #f9fafb);
}

.npc-sheet__actions {
  display: flex;
  gap: 0.5rem;
}

.npc-sheet__message {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #059669;
}

.npc-sheet__message--error {
  color: #dc2626;
}

.npc-sheet__section {
  border: 1px solid var(--color-border, #374151);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.npc-sheet__section legend {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text, #f9fafb);
  padding: 0 0.5rem;
}

.npc-sheet__empty {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
  margin-bottom: 0.5rem;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 500px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}

.field {
  margin-bottom: 0.5rem;
}

.field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted, #9ca3af);
  margin-bottom: 0.2rem;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.85rem;
  font-family: inherit;
}

.field textarea {
  resize: vertical;
}

/* ── Relations ── */
.relation-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
  align-items: center;
}

.relation-row__pc,
.relation-row__target {
  flex: 1;
  min-width: 100px;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.8rem;
}

.relation-row__disposition,
.relation-row__type {
  min-width: 100px;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.8rem;
}

.relation-row__note {
  flex: 1;
  min-width: 80px;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.8rem;
}

.relation-row__bidi {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--color-text-muted, #9ca3af);
}

.relation-row__bidi input {
  width: auto;
}

/* ── Boutons ── */
.btn {
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
}

.btn--small {
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
}

.btn--primary {
  background: var(--color-primary, #2563eb);
  color: #fff;
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--danger {
  background: #7f1d1d;
  color: #fca5a5;
}

.btn--ghost {
  background: transparent;
  border: 1px dashed var(--color-border, #374151);
  color: var(--color-text-muted, #9ca3af);
}

.btn--ghost:hover {
  border-color: var(--color-primary, #60a5fa);
  color: var(--color-text, #f9fafb);
}

.btn--icon {
  padding: 0.25rem 0.4rem;
  font-size: 0.75rem;
  line-height: 1;
}
</style>
