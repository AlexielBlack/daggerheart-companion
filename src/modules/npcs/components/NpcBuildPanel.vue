<!--
  NpcBuildPanel.vue — Panneau "Build Lite" d'un PNJ.
  Sélection classe, sous-classe, niveau + cartes de domaine.
  Tout est simplifié par rapport au character builder PJ :
  pas de vault, pas de level-up, liste directe de cartes.
-->
<template>
  <fieldset class="npc-build">
    <legend>Build</legend>

    <!-- ── Classe ── -->
    <div class="build-grid">
      <div class="field">
        <label for="npc-class">Classe</label>
        <select
          id="npc-class"
          :value="classId || ''"
          @change="onClassChange($event.target.value)"
        >
          <option value="">
            — Aucune —
          </option>
          <option
            v-for="cls in allClasses"
            :key="cls.id"
            :value="cls.id"
          >
            {{ cls.emoji }} {{ cls.name }}
          </option>
        </select>
      </div>

      <!-- ── Sous-classe (si classe choisie) ── -->
      <div class="field">
        <label for="npc-subclass">Sous-classe</label>
        <select
          id="npc-subclass"
          :value="subclassId || ''"
          :disabled="!classId"
          @change="$emit('update:subclassId', $event.target.value || null)"
        >
          <option value="">
            — Aucune —
          </option>
          <option
            v-for="sub in availableSubclasses"
            :key="sub.id"
            :value="sub.id"
          >
            {{ sub.name }}
          </option>
        </select>
      </div>

      <!-- ── Niveau ── -->
      <div class="field">
        <label for="npc-level">Niveau</label>
        <select
          id="npc-level"
          :value="level || ''"
          :disabled="!classId"
          @change="onLevelChange($event.target.value)"
        >
          <option value="">
            —
          </option>
          <option
            v-for="l in 10"
            :key="l"
            :value="l"
          >
            {{ l }} (Tier {{ getTier(l) }})
          </option>
        </select>
      </div>
    </div>

    <!-- ── Info classe ── -->
    <div
      v-if="selectedClass"
      class="build-info"
    >
      <span class="build-info__domains">
        Domaines : {{ selectedClass.domains.join(' • ') }}
      </span>
      <span
        v-if="selectedSubclass && selectedSubclass.spellcastTrait"
        class="build-info__spell"
      >
        Spellcast : {{ selectedSubclass.spellcastTrait }}
      </span>
    </div>

    <!-- ── Cartes de domaine ── -->
    <div
      v-if="classId && level"
      class="build-cards"
    >
      <h5 class="build-cards__title">
        🎴 Cartes de domaine
        <span class="build-cards__count">({{ domainCards.length }} sélectionnée{{ domainCards.length > 1 ? 's' : '' }})</span>
      </h5>

      <!-- Cartes sélectionnées -->
      <ul
        v-if="domainCards.length > 0"
        class="card-list card-list--selected"
        aria-label="Cartes sélectionnées"
      >
        <li
          v-for="card in resolvedSelectedCards"
          :key="card.id"
          class="card-item card-item--selected"
        >
          <span class="card-item__level">Lv.{{ card.level }}</span>
          <span class="card-item__name">{{ card.name }}</span>
          <span class="card-item__domain">{{ card.domainEmoji }} {{ card.domainName }}</span>
          <button
            class="btn btn--icon btn--danger"
            :aria-label="`Retirer ${card.name}`"
            @click="removeCard(card.id)"
          >
            ✕
          </button>
        </li>
      </ul>

      <!-- Catalogue filtré -->
      <details class="build-catalogue">
        <summary class="build-catalogue__toggle">
          📖 Catalogue ({{ eligibleCards.length }} cartes disponibles)
        </summary>

        <div class="build-catalogue__filters">
          <label
            for="npc-domain-filter"
            class="sr-only"
          >Filtrer par domaine</label>
          <select
            id="npc-domain-filter"
            v-model="catalogueDomainFilter"
          >
            <option value="">
              Tous les domaines
            </option>
            <option
              v-for="d in availableDomains"
              :key="d.id"
              :value="d.id"
            >
              {{ d.emoji }} {{ d.name }}
            </option>
          </select>

          <label
            for="npc-level-filter"
            class="sr-only"
          >Filtrer par niveau</label>
          <select
            id="npc-level-filter"
            v-model.number="catalogueLevelFilter"
          >
            <option :value="0">
              Tous les niveaux
            </option>
            <option
              v-for="l in level"
              :key="l"
              :value="l"
            >
              Niveau {{ l }}
            </option>
          </select>
        </div>

        <ul
          v-if="filteredCatalogue.length > 0"
          class="card-list"
          aria-label="Cartes disponibles"
        >
          <li
            v-for="card in filteredCatalogue"
            :key="card.id"
            class="card-item"
            :class="{ 'card-item--owned': domainCards.includes(card.id) }"
          >
            <span class="card-item__level">Lv.{{ card.level }}</span>
            <span class="card-item__name">{{ card.name }}</span>
            <span class="card-item__domain">{{ card.domainEmoji }} {{ card.domainName }}</span>
            <span
              v-if="card.type === 'spell' || card.type === 'grimoire'"
              class="card-item__type"
            >✨ {{ card.type }}</span>
            <button
              v-if="!domainCards.includes(card.id)"
              class="btn btn--icon btn--add"
              :aria-label="`Ajouter ${card.name}`"
              @click="addCard(card.id)"
            >
              +
            </button>
            <span
              v-else
              class="card-item__check"
              aria-label="Déjà sélectionnée"
            >✓</span>
          </li>
        </ul>

        <p
          v-else
          class="build-catalogue__empty"
        >
          Aucune carte disponible pour ces filtres.
        </p>
      </details>
    </div>

    <p
      v-else-if="classId && !level"
      class="build-hint"
    >
      Choisissez un niveau pour accéder aux cartes de domaine.
    </p>
  </fieldset>
</template>

<script>
import { ref, computed } from 'vue'
import { CLASSES } from '@data/classes'
import { getSubclassesForClass, getSubclassById } from '@data/subclasses'
import { DOMAINS } from '@data/domains'

export default {
  name: 'NpcBuildPanel',

  props: {
    classId: { type: String, default: null },
    subclassId: { type: String, default: null },
    level: { type: Number, default: null },
    domainCards: { type: Array, default: () => [] },
    /** Classes homebrew (injectées depuis le parent) */
    homebrewClasses: { type: Array, default: () => [] },
    /** Domaines homebrew (injectés depuis le parent) */
    homebrewDomains: { type: Array, default: () => [] }
  },

  emits: [
    'update:classId',
    'update:subclassId',
    'update:level',
    'update:domainCards'
  ],

  setup(props, { emit }) {
    // ── Filtres du catalogue ──
    const catalogueDomainFilter = ref('')
    const catalogueLevelFilter = ref(0)

    // ── Toutes les classes (SRD + homebrew) ──
    const allClasses = computed(() => [
      ...CLASSES,
      ...props.homebrewClasses
    ])

    // ── Classe sélectionnée ──
    const selectedClass = computed(() => {
      if (!props.classId) return null
      return allClasses.value.find((c) => c.id === props.classId) || null
    })

    // ── Sous-classes disponibles ──
    const availableSubclasses = computed(() => {
      if (!props.classId) return []
      return getSubclassesForClass(props.classId) || []
    })

    // ── Sous-classe sélectionnée ──
    const selectedSubclass = computed(() => {
      if (!props.classId || !props.subclassId) return null
      return getSubclassById(props.classId, props.subclassId) || null
    })

    // ── Domaines disponibles (issus de la classe) ──
    const availableDomains = computed(() => {
      if (!selectedClass.value) return []
      const domainNames = selectedClass.value.domains || []
      const resolved = []
      for (const name of domainNames) {
        // SRD d'abord
        const srd = DOMAINS.find((d) => d.name === name)
        if (srd) {
          resolved.push(srd)
          continue
        }
        // Homebrew
        const hb = props.homebrewDomains.find((d) => d.name === name)
        if (hb) resolved.push(hb)
      }
      return resolved
    })

    // ── Cartes éligibles (domaines de la classe + niveau ≤ niveau PNJ) ──
    const eligibleCards = computed(() => {
      if (!props.level || availableDomains.value.length === 0) return []
      const results = []
      for (const domain of availableDomains.value) {
        for (const card of domain.cards) {
          if (card.level <= props.level) {
            results.push({
              ...card,
              domainId: domain.id,
              domainName: domain.name,
              domainEmoji: domain.emoji || '🃏',
              domainColor: domain.color || '#7c3aed'
            })
          }
        }
      }
      return results.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    })

    // ── Catalogue filtré ──
    const filteredCatalogue = computed(() => {
      let cards = eligibleCards.value
      if (catalogueDomainFilter.value) {
        cards = cards.filter((c) => c.domainId === catalogueDomainFilter.value)
      }
      if (catalogueLevelFilter.value > 0) {
        cards = cards.filter((c) => c.level === catalogueLevelFilter.value)
      }
      return cards
    })

    // ── Cartes sélectionnées résolues (avec métadonnées domaine) ──
    const resolvedSelectedCards = computed(() => {
      return props.domainCards
        .map((cardId) => eligibleCards.value.find((c) => c.id === cardId))
        .filter(Boolean)
    })

    // ── Helpers ──
    function getTier(level) {
      if (level <= 1) return 1
      if (level <= 4) return 2
      if (level <= 7) return 3
      return 4
    }

    function onClassChange(value) {
      const newClassId = value || null
      emit('update:classId', newClassId)
      // Reset sous-classe et cartes quand la classe change
      emit('update:subclassId', null)
      emit('update:domainCards', [])
      catalogueDomainFilter.value = ''
      catalogueLevelFilter.value = 0
    }

    function onLevelChange(value) {
      const newLevel = value ? Number(value) : null
      emit('update:level', newLevel)
      // Retirer les cartes dont le niveau dépasse le nouveau niveau
      if (newLevel && props.domainCards.length > 0) {
        const stillValid = props.domainCards.filter((cardId) => {
          const card = eligibleCards.value.find((c) => c.id === cardId)
          return card && card.level <= newLevel
        })
        if (stillValid.length !== props.domainCards.length) {
          emit('update:domainCards', stillValid)
        }
      }
    }

    function addCard(cardId) {
      if (props.domainCards.includes(cardId)) return
      emit('update:domainCards', [...props.domainCards, cardId])
    }

    function removeCard(cardId) {
      emit('update:domainCards', props.domainCards.filter((id) => id !== cardId))
    }

    return {
      allClasses,
      selectedClass,
      availableSubclasses,
      selectedSubclass,
      availableDomains,
      eligibleCards,
      filteredCatalogue,
      resolvedSelectedCards,
      catalogueDomainFilter,
      catalogueLevelFilter,
      getTier,
      onClassChange,
      onLevelChange,
      addCard,
      removeCard
    }
  }
}
</script>

<style scoped>
.npc-build {
  border: 1px solid var(--color-border, #374151);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.npc-build legend {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text, #f9fafb);
  padding: 0 0.5rem;
}

.build-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  gap: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 500px) {
  .build-grid {
    grid-template-columns: 1fr;
  }
}

.field {
  margin-bottom: 0.35rem;
}

.field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted, #9ca3af);
  margin-bottom: 0.2rem;
}

.field select {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.85rem;
  font-family: inherit;
}

.field select:disabled {
  opacity: 0.5;
}

.build-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-muted, #9ca3af);
}

.build-info__domains {
  font-style: italic;
}

.build-info__spell {
  color: #a78bfa;
}

.build-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
  margin: 0.5rem 0 0;
}

/* ── Cartes ── */
.build-cards__title {
  margin: 0.5rem 0 0.35rem;
  font-size: 0.85rem;
  color: var(--color-text, #f9fafb);
}

.build-cards__count {
  font-weight: 400;
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}

.card-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid transparent;
}

.card-item:hover {
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.03));
}

.card-item--selected {
  background: var(--color-surface-alt, #1e3a5f);
  border-color: var(--color-border, #374151);
}

.card-item--owned {
  opacity: 0.6;
}

.card-item__level {
  font-weight: 600;
  font-size: 0.7rem;
  color: var(--color-text-muted, #9ca3af);
  min-width: 30px;
}

.card-item__name {
  flex: 1;
  color: var(--color-text, #f9fafb);
  font-weight: 500;
}

.card-item__domain {
  font-size: 0.7rem;
  color: var(--color-text-muted, #9ca3af);
}

.card-item__type {
  font-size: 0.65rem;
  color: #a78bfa;
}

.card-item__check {
  color: #059669;
  font-weight: bold;
  width: 24px;
  text-align: center;
}

/* ── Catalogue ── */
.build-catalogue {
  margin-top: 0.5rem;
}

.build-catalogue__toggle {
  font-size: 0.8rem;
  color: var(--color-text-muted, #9ca3af);
  cursor: pointer;
  padding: 0.3rem 0;
}

.build-catalogue__toggle:hover {
  color: var(--color-text, #f9fafb);
}

.build-catalogue__filters {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.build-catalogue__filters select {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.75rem;
}

.build-catalogue__empty {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
  margin: 0.5rem 0;
}

/* ── Boutons ── */
.btn {
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
}

.btn--icon {
  padding: 0.15rem 0.4rem;
  font-size: 0.75rem;
  line-height: 1;
  flex-shrink: 0;
}

.btn--danger {
  background: #7f1d1d;
  color: #fca5a5;
}

.btn--add {
  background: #1e3a5f;
  color: #60a5fa;
  font-weight: bold;
}

.btn--add:hover {
  background: #2563eb;
  color: #fff;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
