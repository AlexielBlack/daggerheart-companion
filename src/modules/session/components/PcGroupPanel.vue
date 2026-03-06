<template>
  <section
    class="pc-group"
    aria-label="Groupe de personnages"
  >
    <!-- En-tete du panel -->
    <div class="pc-group__header">
      <h3 class="pc-group__title">
        <span aria-hidden="true">&#x1F465;</span>
        Personnages ({{ characters.length }})
      </h3>
      <div class="pc-group__actions">
        <button
          v-if="characters.length > 0"
          class="pc-group__toggle btn btn--sm btn--ghost"
          :aria-label="allExpanded ? 'Tout replier' : 'Tout deplier'"
          @click="toggleAll"
        >
          {{ allExpanded ? 'Tout replier' : 'Tout deplier' }}
        </button>
        <router-link
          to="/edition/personnages"
          class="pc-group__edit-link"
          aria-label="Editer les personnages"
        >
          &#x270F;&#xFE0F; Editer
        </router-link>
      </div>
    </div>

    <!-- Etat vide -->
    <p
      v-if="characters.length === 0"
      class="pc-group__empty"
    >
      Aucun personnage cree.
      <router-link to="/edition/personnages">
        Creer un personnage
      </router-link>
    </p>

    <!-- Grille de cartes PJ -->
    <div
      v-else
      ref="gridRef"
      class="pc-group__grid"
      role="list"
      aria-label="Liste des personnages"
    >
      <article
        v-for="pc in enrichedCharacters"
        :key="pc.id"
        class="pc-card"
        role="listitem"
        :aria-label="pc.name || 'Sans nom'"
      >
        <!-- Zone toujours visible -->
        <div class="pc-card__body">
          <!-- 1. Ligne identite -->
          <div class="pc-card__identity">
            <span
              v-if="pc.classData"
              class="pc-card__class-emoji"
              aria-hidden="true"
            >{{ pc.classData.emoji }}</span>
            <span class="pc-card__name">{{ pc.name || 'Sans nom' }}</span>
            <span
              v-if="pc.classData"
              class="pc-card__class-name"
            >{{ pc.classData.name }}</span>
            <span class="pc-card__level-badge">Nv.{{ pc.level || 1 }}</span>
            <span
              v-if="pc.subclassData"
              class="pc-card__subclass"
            >{{ pc.subclassData.name }}</span>
          </div>

          <!-- 2. Ligne ascendance / communaute -->
          <div class="pc-card__meta">
            <span v-if="pc.ancestryData">{{ pc.ancestryData.name }}</span>
            <span v-if="pc.ancestryData && pc.communityData"> &middot; </span>
            <span v-if="pc.communityData">{{ pc.communityData.name }}</span>
          </div>

          <!-- 3. Barres HP + Stress -->
          <div class="pc-card__bars">
            <!-- Barre HP : currentHP = degats marques -->
            <div
              class="pc-card__bar"
              :aria-label="'Points de vie : ' + (pc.effectiveMaxHP - (pc.currentHP || 0)) + ' restants sur ' + pc.effectiveMaxHP"
            >
              <div class="pc-card__bar-track">
                <div
                  class="pc-card__bar-fill"
                  :style="{
                    width: hpFillPercent(pc) + '%',
                    backgroundColor: hpColor(pc.currentHP || 0, pc.effectiveMaxHP)
                  }"
                ></div>
              </div>
              <span class="pc-card__bar-text">
                &#x2764;&#xFE0F; {{ pc.currentHP || 0 }}/{{ pc.effectiveMaxHP }}
              </span>
            </div>

            <!-- Barre Stress -->
            <div
              class="pc-card__bar"
              :aria-label="'Stress : ' + (pc.currentStress || 0) + ' sur ' + pc.effectiveMaxStress"
            >
              <div class="pc-card__bar-track">
                <div
                  class="pc-card__bar-fill"
                  :style="{
                    width: stressFillPercent(pc) + '%',
                    backgroundColor: stressColor(pc.currentStress || 0, pc.effectiveMaxStress)
                  }"
                ></div>
              </div>
              <span class="pc-card__bar-text">
                &#x1F630; {{ pc.currentStress || 0 }}/{{ pc.effectiveMaxStress }}
              </span>
            </div>
          </div>

          <!-- 4. Ligne armure + espoir -->
          <div class="pc-card__armor-hope">
            <div
              class="pc-card__armor-bar"
              :aria-label="'Armure : ' + (pc.armorSlotsMarked || 0) + ' sur ' + pc.effectiveArmorScore"
            >
              <span class="pc-card__armor-label">
                &#x1F6E1;&#xFE0F; {{ pc.armorSlotsMarked || 0 }}/{{ pc.effectiveArmorScore }}
              </span>
              <div class="pc-card__bar-track pc-card__bar-track--sm">
                <div
                  class="pc-card__bar-fill pc-card__bar-fill--armor"
                  :style="{ width: armorFillPercent(pc) + '%' }"
                ></div>
              </div>
            </div>
            <div class="pc-card__hope">
              <span aria-hidden="true">&#x2728;</span>
              Espoir : <strong>{{ pc.hope || 0 }}</strong>
            </div>
          </div>

          <!-- 5. Stats defensives -->
          <div class="pc-card__defense">
            <span>Evasion : <strong>{{ pc.effectiveEvasion }}</strong></span>
            <span class="pc-card__defense-sep">|</span>
            <span>Seuils : <strong>{{ pc.thresholds.major }} / {{ pc.thresholds.severe }}</strong></span>
          </div>

          <!-- 6. Conditions -->
          <div
            v-if="pc.conditions && pc.conditions.length > 0"
            class="pc-card__conditions"
            aria-label="Conditions actives"
          >
            <span
              v-for="cond in pc.conditions"
              :key="cond"
              class="pc-card__condition"
              :style="conditionStyle(cond)"
            >
              {{ conditionLabel(cond) }}
            </span>
          </div>

          <!-- 7. Traits -->
          <div
            class="pc-card__traits"
            aria-label="Traits du personnage"
          >
            <div
              v-for="traitKey in TRAIT_ORDER"
              :key="traitKey"
              class="pc-card__trait"
              :class="{
                'pc-card__trait--positive': (pc.traits && pc.traits[traitKey]) > 0,
                'pc-card__trait--negative': (pc.traits && pc.traits[traitKey]) < 0,
                'pc-card__trait--zero': !(pc.traits && pc.traits[traitKey])
              }"
            >
              <span class="pc-card__trait-label">{{ TRAIT_ABBR[traitKey] }}</span>
              <span class="pc-card__trait-value">{{ traitSign(pc.traits ? pc.traits[traitKey] : 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Sections depliables -->

        <!-- Section 1 — Armes -->
        <details
          v-if="pc.primaryWeaponData || pc.secondaryWeaponData"
          class="pc-card__section"
          aria-label="Armes du personnage"
        >
          <summary class="pc-card__summary">
            &#x2694;&#xFE0F; Armes
          </summary>
          <div class="pc-card__section-content">
            <!-- Arme primaire -->
            <div
              v-if="pc.primaryWeaponData"
              class="pc-card__weapon"
            >
              <span class="pc-card__weapon-name">{{ pc.primaryWeaponData.name }}</span>
              <span
                v-if="pc.primaryWeaponData.trait"
                class="pc-card__weapon-trait"
              >[{{ pc.primaryWeaponData.trait }}]</span>
              <span
                v-if="pc.primaryWeaponData.damage"
                class="pc-card__weapon-damage"
              >{{ pc.primaryWeaponData.damage }}</span>
              <span
                v-if="pc.primaryWeaponData.range"
                class="pc-card__weapon-range"
              >{{ pc.primaryWeaponData.range }}</span>
            </div>
            <p
              v-if="pc.primaryWeaponData && pc.primaryWeaponData.feature"
              class="pc-card__weapon-feature"
            >
              {{ pc.primaryWeaponData.feature }}
            </p>

            <!-- Arme secondaire -->
            <div
              v-if="pc.secondaryWeaponData"
              class="pc-card__weapon"
            >
              <span class="pc-card__weapon-name">{{ pc.secondaryWeaponData.name }}</span>
              <span
                v-if="pc.secondaryWeaponData.trait"
                class="pc-card__weapon-trait"
              >[{{ pc.secondaryWeaponData.trait }}]</span>
              <span
                v-if="pc.secondaryWeaponData.damage"
                class="pc-card__weapon-damage"
              >{{ pc.secondaryWeaponData.damage }}</span>
              <span
                v-if="pc.secondaryWeaponData.range"
                class="pc-card__weapon-range"
              >{{ pc.secondaryWeaponData.range }}</span>
            </div>
            <p
              v-if="pc.secondaryWeaponData && pc.secondaryWeaponData.feature"
              class="pc-card__weapon-feature"
            >
              {{ pc.secondaryWeaponData.feature }}
            </p>
          </div>
        </details>

        <!-- Section 2 — Cartes de domaine -->
        <details
          v-if="pc.loadoutCards && pc.loadoutCards.length > 0"
          class="pc-card__section"
          aria-label="Cartes de domaine"
        >
          <summary class="pc-card__summary">
            &#x1F0CF; Cartes ({{ pc.loadoutCards.length }})
          </summary>
          <div class="pc-card__section-content">
            <ul class="pc-card__card-list">
              <li
                v-for="card in pc.loadoutCards"
                :key="card.id"
                class="pc-card__card-item"
              >
                <span class="pc-card__card-name">{{ card.name }}</span>
                <span
                  v-if="card.domain"
                  class="pc-card__card-domain"
                >{{ card.domain }}</span>
                <span class="pc-card__card-type">{{ formatCardType(card) }}</span>
              </li>
            </ul>
          </div>
        </details>

        <!-- Section 3 — Capacites -->
        <details
          v-if="hasFeatures(pc)"
          class="pc-card__section"
          aria-label="Capacites du personnage"
        >
          <summary class="pc-card__summary">
            &#x2728; Capacites
          </summary>
          <div class="pc-card__section-content">
            <!-- Hope Feature -->
            <div
              v-if="pc.classData && pc.classData.hopeFeature"
              class="pc-card__feature pc-card__feature--hope"
            >
              <template v-if="typeof pc.classData.hopeFeature === 'object'">
                <span class="pc-card__feature-name">
                  {{ activationEmoji(pc.classData.hopeFeature.activationType) }}
                  {{ pc.classData.hopeFeature.name }}
                </span>
                <span class="pc-card__feature-desc">{{ pc.classData.hopeFeature.description }}</span>
              </template>
              <template v-else>
                <span class="pc-card__feature-desc">{{ pc.classData.hopeFeature }}</span>
              </template>
            </div>

            <!-- Class Features -->
            <div
              v-for="(feat, idx) in classFeaturesList(pc)"
              :key="'cf-' + idx"
              class="pc-card__feature"
            >
              <template v-if="typeof feat === 'object'">
                <span class="pc-card__feature-name">
                  {{ activationEmoji(feat.activationType) }}
                  {{ feat.name }}
                </span>
                <span class="pc-card__feature-desc">{{ feat.description }}</span>
              </template>
              <template v-else>
                <span class="pc-card__feature-desc">{{ feat }}</span>
              </template>
            </div>

            <!-- Ancestry features -->
            <div
              v-if="pc.ancestryData && pc.ancestryData.topFeature"
              class="pc-card__feature"
            >
              <span class="pc-card__feature-name">{{ pc.ancestryData.topFeature.name }}</span>
              <span class="pc-card__feature-desc">{{ pc.ancestryData.topFeature.description }}</span>
            </div>
            <div
              v-if="pc.ancestryData && pc.ancestryData.bottomFeature"
              class="pc-card__feature"
            >
              <span class="pc-card__feature-name">{{ pc.ancestryData.bottomFeature.name }}</span>
              <span class="pc-card__feature-desc">{{ pc.ancestryData.bottomFeature.description }}</span>
            </div>

            <!-- Community feature -->
            <div
              v-if="pc.communityData && pc.communityData.feature"
              class="pc-card__feature"
            >
              <span class="pc-card__feature-name">{{ pc.communityData.feature.name }}</span>
              <span class="pc-card__feature-desc">{{ pc.communityData.feature.description }}</span>
            </div>

            <!-- Subclass features par tier -->
            <template v-if="pc.subclassData">
              <!-- Foundation (toujours visible) -->
              <div
                v-for="(feat, idx) in (pc.subclassData.foundation || [])"
                :key="'found-' + idx"
                class="pc-card__feature"
              >
                <span class="pc-card__feature-name">
                  {{ activationEmoji(feat.activationType) }}
                  {{ feat.name }}
                </span>
                <span class="pc-card__feature-desc">{{ feat.description }}</span>
              </div>

              <!-- Specialization (niveau >= 5) -->
              <template v-if="(pc.level || 1) >= 5">
                <div
                  v-for="(feat, idx) in (pc.subclassData.specialization || [])"
                  :key="'spec-' + idx"
                  class="pc-card__feature"
                >
                  <span class="pc-card__feature-name">
                    {{ activationEmoji(feat.activationType) }}
                    {{ feat.name }}
                  </span>
                  <span class="pc-card__feature-desc">{{ feat.description }}</span>
                </div>
              </template>

              <!-- Mastery (niveau >= 8) -->
              <template v-if="(pc.level || 1) >= 8">
                <div
                  v-for="(feat, idx) in (pc.subclassData.mastery || [])"
                  :key="'mast-' + idx"
                  class="pc-card__feature"
                >
                  <span class="pc-card__feature-name">
                    {{ activationEmoji(feat.activationType) }}
                    {{ feat.name }}
                  </span>
                  <span class="pc-card__feature-desc">{{ feat.description }}</span>
                </div>
              </template>
            </template>
          </div>
        </details>

        <!-- Section 4 — Inventaire & Or (conditionnel) -->
        <details
          v-if="hasInventory(pc)"
          class="pc-card__section"
          aria-label="Inventaire et or"
        >
          <summary class="pc-card__summary">
            &#x1F392; Inventaire
          </summary>
          <div class="pc-card__section-content">
            <!-- Or -->
            <p
              v-if="hasGold(pc)"
              class="pc-card__gold"
            >
              &#x1FA99; {{ formatGold(pc.gold) }}
            </p>

            <!-- Items inventaire -->
            <ul
              v-if="pc.inventory && pc.inventory.length > 0"
              class="pc-card__inventory-list"
            >
              <li
                v-for="(item, idx) in pc.inventory"
                :key="item.id || idx"
                class="pc-card__inventory-item"
              >
                <span class="pc-card__inventory-name">
                  {{ item.customName || item.itemId || 'Objet' }}
                </span>
                <span
                  v-if="item.quantity > 1"
                  class="pc-card__inventory-qty"
                >x{{ item.quantity }}</span>
              </li>
            </ul>
          </div>
        </details>
      </article>
    </div>
  </section>
</template>

<script>
/**
 * PcGroupPanel — Grille enrichie des personnages joueurs en lecture seule.
 * Affiche une carte par PJ avec stats effectives, barres HP/Stress,
 * armes, cartes de domaine, capacites et inventaire via divulgation progressive.
 *
 * Utilise resolveCharacterDisplay pour resoudre les stats de TOUS les PJ
 * simultanement, sans passer par les getters du store (qui ne gerent
 * que le personnage selectionne).
 */
import { computed, ref, nextTick } from 'vue'
import { resolveCharacterDisplay } from '@modules/characters/composables/useCharacterComputed'

export default {
  name: 'PcGroupPanel',

  props: {
    /** Tableau de personnages depuis characterStore.characters */
    characters: {
      type: Array,
      default: () => []
    }
  },

  setup(props) {
    // ── Ref template pour la grille ──
    const gridRef = ref(null)
    const allExpanded = ref(false)

    // ── Personnages enrichis via resolveCharacterDisplay ──
    const enrichedCharacters = computed(() =>
      props.characters.map(resolveCharacterDisplay)
    )

    // ── Toggle global deplier/replier ──
    function toggleAll() {
      allExpanded.value = !allExpanded.value
      nextTick(() => {
        if (!gridRef.value) return
        gridRef.value.querySelectorAll('details').forEach((d) => {
          d.open = allExpanded.value
        })
      })
    }

    // ── Helpers barres HP/Stress ──

    /**
     * Pourcentage de remplissage de la barre HP.
     * currentHP = degats marques, donc la barre represente les degats subis.
     */
    function hpFillPercent(pc) {
      const max = pc.effectiveMaxHP
      if (!max || max <= 0) return 0
      const current = pc.currentHP || 0
      return Math.max(0, Math.min(100, Math.round((current / max) * 100)))
    }

    /**
     * Couleur dynamique de la barre HP.
     * current = degats marques → remaining = max - current.
     */
    function hpColor(current, max) {
      if (!max || max === 0) return 'var(--color-text-muted)'
      const remaining = max - current
      const ratio = remaining / max
      if (ratio > 0.5) return 'var(--color-accent-success)'
      if (ratio > 0.25) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    }

    /** Pourcentage de remplissage de la barre Stress */
    function stressFillPercent(pc) {
      const max = pc.effectiveMaxStress
      if (!max || max <= 0) return 0
      const current = pc.currentStress || 0
      return Math.max(0, Math.min(100, Math.round((current / max) * 100)))
    }

    /**
     * Couleur dynamique de la barre Stress.
     * Plus le stress est haut, plus c'est dangereux.
     */
    function stressColor(current, max) {
      if (!max || max === 0) return 'var(--color-text-muted)'
      const ratio = current / max
      if (ratio < 0.5) return 'var(--color-accent-success)'
      if (ratio < 0.75) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    }

    /** Pourcentage de remplissage de la barre Armure */
    function armorFillPercent(pc) {
      const max = pc.effectiveArmorScore
      if (!max || max <= 0) return 0
      const current = pc.armorSlotsMarked || 0
      return Math.max(0, Math.min(100, Math.round((current / max) * 100)))
    }

    /** Affichage signe des traits */
    function traitSign(value) {
      const v = value || 0
      if (v > 0) return `+${v}`
      return `${v}`
    }

    // ── Conditions ──
    const CONDITION_LABELS = {
      vulnerable: { label: 'Vulnerable', color: 'var(--color-accent-danger)' },
      restrained: { label: 'Entrave', color: 'var(--color-accent-warning)' },
      hidden: { label: 'Cache', color: 'var(--color-accent-info)' }
    }

    function conditionLabel(cond) {
      return CONDITION_LABELS[cond]?.label || cond
    }

    function conditionStyle(cond) {
      const c = CONDITION_LABELS[cond]?.color || 'var(--color-text-muted)'
      return {
        '--condition-color': c
      }
    }

    // ── Traits ──
    const TRAIT_ABBR = {
      agility: 'AGI',
      strength: 'FOR',
      finesse: 'FIN',
      instinct: 'INS',
      presence: 'PRE',
      knowledge: 'SAV'
    }

    const TRAIT_ORDER = ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge']

    // ── Inventaire & Or ──

    function hasGold(pc) {
      const g = pc.gold || {}
      return (g.handfuls || 0) + (g.bags || 0) + (g.chests || 0) > 0
    }

    function hasInventory(pc) {
      return hasGold(pc) || (pc.inventory && pc.inventory.length > 0)
    }

    function formatGold(gold) {
      if (!gold) return ''
      const parts = []
      if (gold.handfuls) parts.push(`${gold.handfuls} poignee${gold.handfuls > 1 ? 's' : ''}`)
      if (gold.bags) parts.push(`${gold.bags} bourse${gold.bags > 1 ? 's' : ''}`)
      if (gold.chests) parts.push(`${gold.chests} coffre${gold.chests > 1 ? 's' : ''}`)
      return parts.join(', ') || 'Aucun or'
    }

    // ── Cartes de domaine ──

    function formatCardType(card) {
      if (!card.type) return ''
      switch (card.type) {
        case 'ability': return '\u{1F7E2}'
        case 'spell': return '\u{1F52E}'
        case 'passive': return '\u{1F535}'
        default: return ''
      }
    }

    // ── Capacites ──

    function activationEmoji(type) {
      switch (type) {
        case 'action': return '\u{1F7E2}'
        case 'reaction': return '\u{1F7E0}'
        case 'passive': return '\u{1F535}'
        default: return ''
      }
    }

    /** Retourne la liste des features de classe (gere SRD objets et homebrew strings) */
    function classFeaturesList(pc) {
      if (!pc.classData || !pc.classData.classFeatures) return []
      return pc.classData.classFeatures
    }

    /** Verifie si le personnage a des features a afficher */
    function hasFeatures(pc) {
      if (pc.classData && pc.classData.hopeFeature) return true
      if (pc.classData && pc.classData.classFeatures && pc.classData.classFeatures.length > 0) return true
      if (pc.ancestryData && (pc.ancestryData.topFeature || pc.ancestryData.bottomFeature)) return true
      if (pc.communityData && pc.communityData.feature) return true
      if (pc.subclassData) return true
      return false
    }

    return {
      gridRef,
      enrichedCharacters,
      allExpanded,
      toggleAll,
      hpFillPercent,
      hpColor,
      stressFillPercent,
      stressColor,
      armorFillPercent,
      traitSign,
      conditionLabel,
      conditionStyle,
      TRAIT_ABBR,
      TRAIT_ORDER,
      hasGold,
      hasInventory,
      formatGold,
      formatCardType,
      activationEmoji,
      classFeaturesList,
      hasFeatures
    }
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   PC GROUP — Container et en-tete
   ═══════════════════════════════════════════════ */

.pc-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.pc-group__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.pc-group__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-group__toggle {
  font-size: var(--font-size-xs);
  min-height: var(--touch-min);
  padding: var(--space-xs) var(--space-sm);
}

.pc-group__edit-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
}

.pc-group__empty {
  color: var(--color-text-muted);
  padding: var(--space-lg) 0;
}

/* ═══════════════════════════════════════════════
   GRILLE — Layout responsive
   ═══════════════════════════════════════════════ */

.pc-group__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-md);
}

@media (max-width: 768px) {
  .pc-group__grid {
    grid-template-columns: 1fr;
  }
}

/* ═══════════════════════════════════════════════
   PC CARD — Carte individuelle
   ═══════════════════════════════════════════════ */

.pc-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.pc-card__body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ── 1. Identite ── */

.pc-card__identity {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.pc-card__class-emoji {
  font-size: var(--font-size-lg);
}

.pc-card__name {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.pc-card__class-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__level-badge {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.15);
  padding: 1px var(--space-xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.pc-card__subclass {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
}

/* ── 2. Meta (ascendance / communaute) ── */

.pc-card__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* ── 3. Barres HP + Stress ── */

.pc-card__bars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.pc-card__bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-card__bar-track {
  flex: 1;
  height: 6px;
  background: var(--color-bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.pc-card__bar-track--sm {
  height: 4px;
}

.pc-card__bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.pc-card__bar-fill--armor {
  background: var(--color-accent-gold);
}

.pc-card__bar-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  min-width: 50px;
}

/* ── 4. Armure + Espoir ── */

.pc-card__armor-hope {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__armor-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-card__armor-label {
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.pc-card__hope {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* ── 5. Defense ── */

.pc-card__defense {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__defense-sep {
  color: var(--color-text-muted);
}

/* ── 6. Conditions ── */

.pc-card__conditions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.pc-card__condition {
  font-size: var(--font-size-xs);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  border: 1px solid var(--condition-color, var(--color-text-muted));
  color: var(--condition-color, var(--color-text-muted));
  background: color-mix(in srgb, var(--condition-color, var(--color-text-muted)) 15%, transparent);
  font-weight: var(--font-weight-medium);
}

/* ── 7. Traits ── */

.pc-card__traits {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  text-align: center;
  gap: 2px;
}

.pc-card__trait {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xs) 0;
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.pc-card__trait-label {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pc-card__trait-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.pc-card__trait--positive .pc-card__trait-value {
  color: var(--color-accent-success);
}

.pc-card__trait--negative .pc-card__trait-value {
  color: var(--color-accent-fear);
}

.pc-card__trait--zero .pc-card__trait-value {
  color: var(--color-text-muted);
}

/* ═══════════════════════════════════════════════
   SECTIONS DEPLIABLES
   ═══════════════════════════════════════════════ */

.pc-card__section {
  border-top: 1px solid var(--color-border);
}

.pc-card__summary {
  cursor: pointer;
  min-height: var(--touch-min);
  display: flex;
  align-items: center;
  padding: var(--space-xs) var(--space-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  user-select: none;
  list-style: none;
}

.pc-card__summary::-webkit-details-marker {
  display: none;
}

.pc-card__summary::before {
  content: '\25B6';
  font-size: 0.625rem;
  margin-right: var(--space-sm);
  transition: transform var(--transition-fast);
  color: var(--color-text-muted);
}

.pc-card__section[open] > .pc-card__summary::before {
  transform: rotate(90deg);
}

.pc-card__section[open] > .pc-card__summary {
  background: var(--color-bg-elevated);
}

.pc-card__section-content {
  padding: var(--space-xs) var(--space-md) var(--space-sm);
}

/* ── Armes ── */

.pc-card__weapon {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
  flex-wrap: wrap;
}

.pc-card__weapon-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.pc-card__weapon-trait {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
}

.pc-card__weapon-damage {
  font-size: var(--font-size-xs);
  color: var(--color-accent-fear);
  font-weight: var(--font-weight-bold);
}

.pc-card__weapon-range {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.pc-card__weapon-feature {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-xs);
  padding-left: var(--space-sm);
  font-style: italic;
}

/* ── Cartes de domaine ── */

.pc-card__card-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pc-card__card-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
  flex-wrap: wrap;
}

.pc-card__card-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.pc-card__card-domain {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
}

.pc-card__card-type {
  font-size: var(--font-size-xs);
}

/* ── Capacites / Features ── */

.pc-card__feature {
  border-left: 3px solid var(--color-border-active);
  padding-left: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.pc-card__feature--hope {
  border-left-color: var(--color-accent-hope);
}

.pc-card__feature-name {
  display: block;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.pc-card__feature-desc {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

/* ── Inventaire ── */

.pc-card__gold {
  font-size: var(--font-size-sm);
  color: var(--color-accent-gold);
  margin: 0 0 var(--space-sm);
}

.pc-card__inventory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pc-card__inventory-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__inventory-name {
  color: var(--color-text-primary);
}

.pc-card__inventory-qty {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
