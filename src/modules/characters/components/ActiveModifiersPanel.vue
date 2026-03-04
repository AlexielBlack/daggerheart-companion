<template>
  <div
    v-if="modifiers.length > 0 || permanentEffects.length > 0"
    class="modifiers-panel"
    role="region"
    aria-label="Modificateurs de cartes de domaine actifs"
  >
    <h4 class="mp-title">
      ⚡ Modificateurs actifs
    </h4>

    <!-- ═══ Modificateurs du loadout ═══ -->
    <ul
      class="mp-list"
      aria-label="Modificateurs des cartes en loadout"
    >
      <li
        v-for="mod in modifiers"
        :key="mod.cardId"
        class="mp-item"
        :class="{
          'mp-item--active': mod.active,
          'mp-item--inactive': !mod.active,
          'mp-item--toggle': mod.canToggle
        }"
      >
        <div class="mp-item__header">
          <span class="mp-item__icon">{{ mod.icon }}</span>
          <span class="mp-item__name">{{ mod.name }}</span>
          <span
            class="mp-item__type"
            :class="`mp-item__type--${mod.type}`"
          >{{ typeLabel(mod.type) }}</span>
        </div>

        <p class="mp-item__desc">
          {{ mod.description }}
        </p>

        <div class="mp-item__footer">
          <!-- Badge d'état -->
          <span
            class="mp-status"
            :class="mod.active ? 'mp-status--on' : 'mp-status--off'"
          >
            {{ mod.statusLabel }}
          </span>

          <!-- Coût -->
          <span
            v-if="mod.cost && mod.canToggle && !mod.active"
            class="mp-cost"
          >
            <template v-if="mod.cost.stress">{{ mod.cost.stress }} Stress</template>
            <template v-if="mod.cost.hope">{{ mod.cost.hope }} Hope</template>
          </span>

          <!-- Fréquence -->
          <span
            v-if="mod.frequency"
            class="mp-freq"
          >
            {{ mod.frequency }}
          </span>

          <!-- Bouton toggle/activate -->
          <button
            v-if="mod.canToggle"
            class="mp-toggle-btn"
            :class="mod.active ? 'mp-toggle-btn--off' : 'mp-toggle-btn--on'"
            :aria-label="mod.active
              ? `Désactiver ${mod.name}`
              : `Activer ${mod.name}`"
            :aria-pressed="mod.active ? 'true' : 'false'"
            @click="$emit('toggle', mod.cardId)"
          >
            {{ mod.active ? 'Désactiver' : 'Activer' }}
          </button>
        </div>
      </li>
    </ul>

    <!-- ═══ Effets permanents appliqués ═══ -->
    <div
      v-if="permanentEffects.length > 0"
      class="mp-permanent"
    >
      <span class="mp-permanent__label">Effets permanents :</span>
      <span
        v-for="(eff, i) in permanentEffects"
        :key="i"
        class="mp-permanent__badge"
      >
        {{ eff.source }}
      </span>
    </div>

    <!-- ═══ Résumé des bonus actifs ═══ -->
    <div
      v-if="hasCombatBonuses"
      class="mp-summary"
      role="note"
      aria-label="Résumé des bonus de combat"
    >
      <span class="mp-summary__icon">✦</span>
      <div class="mp-summary__content">
        <span
          v-if="bonuses.attackBonus"
          class="mp-bonus"
        >Attaque +{{ bonuses.attackBonus }}</span>
        <span
          v-if="bonuses.spellcastBonus"
          class="mp-bonus"
        >Spellcast +{{ bonuses.spellcastBonus }}</span>
        <span
          v-if="bonuses.damageBonus"
          class="mp-bonus"
        >Dégâts +{{ bonuses.damageBonus }}</span>
        <span
          v-if="bonuses.proficiency"
          class="mp-bonus"
        >Proficiency +{{ bonuses.proficiency }}</span>
        <span
          v-if="bonuses.proficiencyDamage"
          class="mp-bonus"
        >Prof. dégâts +{{ bonuses.proficiencyDamage }}</span>
        <span
          v-if="bonuses.armorScore"
          class="mp-bonus"
        >Armure +{{ bonuses.armorScore }}</span>
        <span
          v-if="bonuses.immuneMinor"
          class="mp-bonus mp-bonus--special"
        >Immunité Minor</span>
        <span
          v-if="bonuses.disableArmor"
          class="mp-bonus mp-bonus--warning"
        >⚠ Armor Slots inutilisables</span>
        <span
          v-if="bonuses.attackAdvantage"
          class="mp-bonus mp-bonus--special"
        >Avantage attaques</span>
        <span
          v-if="bonuses.presenceOverride"
          class="mp-bonus mp-bonus--special"
        >Presence = Spellcast</span>
        <template v-if="bonuses.traitBonus">
          <span
            v-for="(val, trait) in bonuses.traitBonus"
            :key="trait"
            class="mp-bonus"
          >{{ capitalize(trait) }} +{{ val }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ActiveModifiersPanel',

  props: {
    /** Liste des modificateurs (depuis activeModifiersList) */
    modifiers: { type: Array, default: () => [] },
    /** Effets permanents appliqués */
    permanentEffects: { type: Array, default: () => [] },
    /** Bonus agrégés (depuis selectedStatBonuses) */
    bonuses: {
      type: Object,
      default: () => ({})
    }
  },

  emits: ['toggle'],

  setup(props) {
    const TYPE_LABELS = {
      passive: 'Passif',
      conditional: 'Conditionnel',
      touched: 'Touched',
      toggle: 'Toggle',
      activable: 'Activable'
    }

    function typeLabel(type) {
      return TYPE_LABELS[type] || type
    }

    function capitalize(str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
    }

    /** Y a-t-il des bonus de combat affichables ? */
    const hasCombatBonuses = computed(() => {
      const b = props.bonuses
      return b.attackBonus > 0
        || b.spellcastBonus > 0
        || b.damageBonus > 0
        || b.proficiency > 0
        || b.proficiencyDamage > 0
        || b.armorScore > 0
        || b.immuneMinor
        || b.disableArmor
        || b.attackAdvantage
        || b.presenceOverride
        || b.traitBonus !== null
    })

    return { typeLabel, capitalize, hasCombatBonuses }
  }
}
</script>

<style scoped>
.modifiers-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 4px);
}

.mp-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary, #e5e7eb);
  margin: 0 0 var(--space-xs, 4px);
}

.mp-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 4px);
}

.mp-item {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color, #3a3a5a);
  background: var(--bg-tertiary, #2a2a4a);
  transition: border-color 150ms, opacity 150ms;
}

.mp-item--active {
  border-color: rgba(74, 222, 128, 0.4);
}

.mp-item--inactive {
  opacity: 0.6;
}

.mp-item__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.mp-item__icon {
  font-size: 0.85rem;
}

.mp-item__name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary, #e5e7eb);
}

.mp-item__type {
  font-size: 0.6rem;
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--bg-secondary, #1f1f3a);
  color: var(--text-muted, #6b7280);
  border: 1px solid var(--border-color, #3a3a5a);
  margin-left: auto;
}

.mp-item__type--passive { color: #4ade80; border-color: rgba(74, 222, 128, 0.3); }
.mp-item__type--conditional { color: #facc15; border-color: rgba(250, 204, 21, 0.3); }
.mp-item__type--touched { color: #a78bfa; border-color: rgba(167, 139, 250, 0.3); }
.mp-item__type--toggle { color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); }
.mp-item__type--activable { color: #fb923c; border-color: rgba(251, 146, 60, 0.3); }

.mp-item__desc {
  font-size: 0.72rem;
  color: var(--text-secondary, #9ca3af);
  margin: 0 0 4px;
  line-height: 1.4;
}

.mp-item__footer {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.mp-status {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.mp-status--on {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.mp-status--off {
  color: var(--text-muted, #6b7280);
  background: rgba(107, 114, 128, 0.1);
}

.mp-cost {
  font-size: 0.65rem;
  color: #f97316;
  font-weight: 600;
}

.mp-freq {
  font-size: 0.6rem;
  color: var(--text-muted, #6b7280);
  font-style: italic;
}

.mp-toggle-btn {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  transition: all 150ms;
}

.mp-toggle-btn--on {
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.08);
}

.mp-toggle-btn--on:hover {
  background: rgba(74, 222, 128, 0.18);
  border-color: #4ade80;
}

.mp-toggle-btn--off {
  color: var(--accent-fear, #c84b31);
  border-color: rgba(200, 75, 49, 0.4);
  background: rgba(200, 75, 49, 0.08);
}

.mp-toggle-btn--off:hover {
  background: rgba(200, 75, 49, 0.18);
  border-color: var(--accent-fear, #c84b31);
}

.mp-toggle-btn:focus-visible {
  outline: 2px solid var(--accent-hope, #53a8b6);
  outline-offset: 1px;
}

/* ── Permanents ── */
.mp-permanent {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  margin-top: 2px;
}

.mp-permanent__label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #6b7280);
}

.mp-permanent__badge {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 10px;
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.3);
}

/* ── Résumé ── */
.mp-summary {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 4px 8px;
  margin-top: 2px;
  background: rgba(83, 168, 182, 0.06);
  border-left: 2px solid var(--accent-hope, #53a8b6);
  border-radius: 0 4px 4px 0;
}

.mp-summary__icon {
  color: var(--accent-hope, #53a8b6);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.mp-summary__content {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mp-bonus {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent-hope, #53a8b6);
  padding: 0 4px;
  background: rgba(83, 168, 182, 0.08);
  border-radius: 3px;
}

.mp-bonus--special {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.08);
}

.mp-bonus--warning {
  color: #f97316;
  background: rgba(249, 115, 22, 0.08);
}
</style>
