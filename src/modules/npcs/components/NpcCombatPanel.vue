<!--
  NpcCombatPanel.vue — Panneau combat d'un PNJ.
  Permet d'activer le profil combat et de lier un adversaire existant.
  Affiche un aperçu du stat block lié.
-->
<template>
  <fieldset class="npc-combat">
    <legend>Combat</legend>

    <!-- ── Toggle ── -->
    <label class="combat-toggle">
      <input
        type="checkbox"
        :checked="combatEnabled"
        @change="$emit('update:combatEnabled', $event.target.checked)"
      />
      <span>Activer le profil combat</span>
    </label>

    <template v-if="combatEnabled">
      <!-- ── Sélecteur d'adversaire ── -->
      <div class="field">
        <label for="npc-adversary">Lier un adversaire</label>
        <select
          id="npc-adversary"
          :value="linkedAdversaryId || ''"
          @change="$emit('update:linkedAdversaryId', $event.target.value || null)"
        >
          <option value="">
            — Aucun (stat block custom) —
          </option>
          <optgroup
            v-for="group in groupedAdversaries"
            :key="group.tier"
            :label="`Tier ${group.tier}`"
          >
            <option
              v-for="adv in group.items"
              :key="adv.id"
              :value="adv.id"
            >
              {{ adv.name }} — {{ adv.type }}{{ adv.source === 'custom' ? ' 🛠️' : '' }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- ── Aperçu stat block ── -->
      <div
        v-if="linkedAdversary"
        class="stat-preview"
      >
        <div class="stat-preview__header">
          <h5 class="stat-preview__name">
            {{ linkedAdversary.name }}
          </h5>
          <span class="stat-preview__tier">Tier {{ linkedAdversary.tier }} {{ linkedAdversary.type }}</span>
        </div>

        <p
          v-if="linkedAdversary.description"
          class="stat-preview__desc"
        >
          {{ truncate(linkedAdversary.description, 120) }}
        </p>

        <div class="stat-preview__stats">
          <span><strong>Diff:</strong> {{ linkedAdversary.difficulty }}</span>
          <span v-if="linkedAdversary.thresholds">
            <strong>Seuils:</strong>
            {{ linkedAdversary.thresholds.minor || '—' }}/{{ linkedAdversary.thresholds.major || '—' }}/{{ linkedAdversary.thresholds.severe || '—' }}
          </span>
          <span><strong>PV:</strong> {{ linkedAdversary.hp }}</span>
          <span><strong>Stress:</strong> {{ linkedAdversary.stress }}</span>
        </div>

        <div
          v-if="linkedAdversary.attack"
          class="stat-preview__attack"
        >
          <strong>ATK:</strong>
          {{ linkedAdversary.attack.modifier >= 0 ? '+' : '' }}{{ linkedAdversary.attack.modifier }}
          | {{ linkedAdversary.attack.name }} : {{ linkedAdversary.attack.range }}
          | {{ linkedAdversary.attack.damage }}
        </div>

        <div
          v-if="linkedAdversary.features && linkedAdversary.features.length > 0"
          class="stat-preview__features"
        >
          <strong>Features ({{ linkedAdversary.features.length }}):</strong>
          <span
            v-for="f in linkedAdversary.features.slice(0, 3)"
            :key="f.name"
            class="stat-preview__feature-tag"
          >
            {{ f.name }} ({{ f.type }})
          </span>
          <span v-if="linkedAdversary.features.length > 3">
            +{{ linkedAdversary.features.length - 3 }} autres
          </span>
        </div>
      </div>

      <p
        v-else-if="!linkedAdversaryId"
        class="combat-hint"
      >
        Liez un adversaire existant (SRD ou homebrew) pour utiliser son stat block,
        ou laissez vide pour définir un stat block custom ultérieurement.
      </p>
    </template>
  </fieldset>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'NpcCombatPanel',

  props: {
    combatEnabled: { type: Boolean, default: false },
    linkedAdversaryId: { type: String, default: null },
    /** Liste complète des adversaires (SRD + homebrew) */
    allAdversaries: { type: Array, default: () => [] }
  },

  emits: ['update:combatEnabled', 'update:linkedAdversaryId'],

  setup(props) {
    // Grouper les adversaires par tier pour l'optgroup
    const groupedAdversaries = computed(() => {
      const groups = {}
      for (const adv of props.allAdversaries) {
        const tier = adv.tier || 1
        if (!groups[tier]) groups[tier] = { tier, items: [] }
        groups[tier].items.push(adv)
      }

      // Trier chaque groupe par nom
      for (const group of Object.values(groups)) {
        group.items.sort((a, b) => a.name.localeCompare(b.name))
      }

      return Object.values(groups).sort((a, b) => a.tier - b.tier)
    })

    // Adversaire lié résolu
    const linkedAdversary = computed(() => {
      if (!props.linkedAdversaryId) return null
      return props.allAdversaries.find((a) => a.id === props.linkedAdversaryId) || null
    })

    function truncate(text, max) {
      if (!text || text.length <= max) return text
      return text.slice(0, max).trimEnd() + '…'
    }

    return { groupedAdversaries, linkedAdversary, truncate }
  }
}
</script>

<style scoped>
.npc-combat {
  border: 1px solid var(--color-border, #374151);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.npc-combat legend {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text, #f9fafb);
  padding: 0 0.5rem;
}

.combat-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text, #f9fafb);
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.combat-toggle input {
  width: auto;
}

.combat-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
  margin: 0.5rem 0 0;
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

/* ── Stat preview ── */
.stat-preview {
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.02));
  margin-top: 0.5rem;
}

.stat-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.stat-preview__name {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text, #f9fafb);
}

.stat-preview__tier {
  font-size: 0.7rem;
  color: var(--color-text-muted, #9ca3af);
  font-style: italic;
}

.stat-preview__desc {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  font-style: italic;
  margin: 0 0 0.35rem;
}

.stat-preview__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text, #f9fafb);
  margin-bottom: 0.3rem;
}

.stat-preview__attack {
  font-size: 0.8rem;
  color: var(--color-text, #f9fafb);
  margin-bottom: 0.3rem;
}

.stat-preview__features {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}

.stat-preview__feature-tag {
  display: inline-block;
  margin-left: 0.3rem;
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  background: var(--color-tag-bg, #374151);
  font-size: 0.7rem;
}
</style>
