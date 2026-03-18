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
        <!-- Selecteur de colonnes -->
        <div
          v-if="characters.length > 0"
          class="pc-group__col-selector"
          role="radiogroup"
          aria-label="Nombre de colonnes"
        >
          <button
            v-for="n in [2, 3, 4]"
            :key="n"
            class="pc-group__col-btn"
            :class="{ 'pc-group__col-btn--active': columnCount === n }"
            role="radio"
            :aria-checked="String(columnCount === n)"
            :aria-label="n + ' colonnes'"
            @click="setColumns(n)"
          >
            {{ n }}
          </button>
        </div>
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
      :class="['pc-group__grid', 'pc-group__grid--cols-' + columnCount]"
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

          <!-- 3. Barres HP + Stress (interactives) -->
          <div class="pc-card__bars">
            <!-- Barre HP : currentHP = degats marques -->
            <div
              class="pc-card__bar pc-card__bar--interactive"
              :aria-label="'Points de vie : ' + (pc.effectiveMaxHP - (pc.currentHP || 0)) + ' restants sur ' + pc.effectiveMaxHP"
            >
              <button
                class="pc-card__stat-btn"
                :disabled="(pc.currentHP || 0) <= 0"
                :aria-label="'Soigner 1 PV de ' + (pc.name || 'Sans nom')"
                @click="decrementHP(pc)"
              >
                &minus;
              </button>
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
              <button
                class="pc-card__stat-btn"
                :disabled="(pc.currentHP || 0) >= pc.effectiveMaxHP"
                :aria-label="'Marquer 1 degat sur ' + (pc.name || 'Sans nom')"
                @click="incrementHP(pc)"
              >
                +
              </button>
            </div>

            <!-- Barre Stress -->
            <div
              class="pc-card__bar pc-card__bar--interactive"
              :aria-label="'Stress : ' + (pc.currentStress || 0) + ' sur ' + pc.effectiveMaxStress"
            >
              <button
                class="pc-card__stat-btn"
                :disabled="(pc.currentStress || 0) <= 0"
                :aria-label="'Reduire 1 stress de ' + (pc.name || 'Sans nom')"
                @click="decrementStress(pc)"
              >
                &minus;
              </button>
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
              <button
                class="pc-card__stat-btn"
                :disabled="(pc.currentStress || 0) >= pc.effectiveMaxStress"
                :aria-label="'Marquer 1 stress sur ' + (pc.name || 'Sans nom')"
                @click="incrementStress(pc)"
              >
                +
              </button>
            </div>
          </div>

          <!-- 4. Ligne armure + espoir (interactifs) -->
          <div class="pc-card__armor-hope pc-card__armor-hope--interactive">
            <div
              class="pc-card__armor-bar pc-card__armor-bar--interactive"
              :aria-label="'Armure : ' + (pc.armorSlotsMarked || 0) + ' sur ' + pc.effectiveArmorScore"
            >
              <button
                class="pc-card__stat-btn pc-card__stat-btn--mini"
                :disabled="(pc.armorSlotsMarked || 0) <= 0"
                :aria-label="'Restaurer 1 armure de ' + (pc.name || 'Sans nom')"
                @click="decrementArmor(pc)"
              >
                &minus;
              </button>
              <span class="pc-card__armor-label">
                &#x1F6E1;&#xFE0F; {{ pc.armorSlotsMarked || 0 }}/{{ pc.effectiveArmorScore }}
              </span>
              <div class="pc-card__bar-track pc-card__bar-track--sm">
                <div
                  class="pc-card__bar-fill pc-card__bar-fill--armor"
                  :style="{ width: armorFillPercent(pc) + '%' }"
                ></div>
              </div>
              <button
                class="pc-card__stat-btn pc-card__stat-btn--mini"
                :disabled="(pc.armorSlotsMarked || 0) >= pc.effectiveArmorScore"
                :aria-label="'Utiliser 1 armure de ' + (pc.name || 'Sans nom')"
                @click="incrementArmor(pc)"
              >
                +
              </button>
            </div>
            <div
              class="pc-card__hope pc-card__hope--interactive"
              :aria-label="'Espoir : ' + (pc.hope || 0)"
            >
              <button
                class="pc-card__stat-btn pc-card__stat-btn--mini"
                :disabled="(pc.hope || 0) <= 0"
                :aria-label="'Depenser 1 espoir de ' + (pc.name || 'Sans nom')"
                @click="decrementHope(pc)"
              >
                &minus;
              </button>
              <span aria-hidden="true">&#x2728;</span>
              Espoir : <strong>{{ pc.hope || 0 }}</strong>
              <button
                class="pc-card__stat-btn pc-card__stat-btn--mini"
                :disabled="(pc.hope || 0) >= 6"
                :aria-label="'Gagner 1 espoir pour ' + (pc.name || 'Sans nom')"
                @click="incrementHope(pc)"
              >
                +
              </button>
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

        <!-- ═══════════════════════════════════════════════
             ONGLETS — Combat / Capacites / Inventaire
             ═══════════════════════════════════════════════ -->
        <div
          v-if="visibleTabs(pc).length > 0"
          class="pc-card__tabs"
        >
          <!-- Barre d'onglets -->
          <div
            class="pc-card__tablist"
            role="tablist"
            :aria-label="'Sections de ' + (pc.name || 'Sans nom')"
          >
            <button
              v-for="tab in visibleTabs(pc)"
              :id="'tab-' + pc.id + '-' + tab.id"
              :key="tab.id"
              class="pc-card__tab"
              :class="{ 'pc-card__tab--active': getActiveTab(pc.id) === tab.id }"
              role="tab"
              :aria-selected="String(getActiveTab(pc.id) === tab.id)"
              :aria-controls="'panel-' + pc.id + '-' + tab.id"
              :tabindex="getActiveTab(pc.id) === tab.id ? 0 : -1"
              @click="setActiveTab(pc.id, tab.id)"
              @keydown.left.prevent="navigateTab(pc, -1)"
              @keydown.right.prevent="navigateTab(pc, 1)"
            >
              <span aria-hidden="true">{{ tab.icon }}</span>
              <span class="pc-card__tab-label">{{ tab.label }}</span>
            </button>
          </div>

          <!-- ── Panneau Combat ── -->
          <div
            v-show="getActiveTab(pc.id) === 'combat'"
            :id="'panel-' + pc.id + '-combat'"
            class="pc-card__tabpanel"
            role="tabpanel"
            :aria-labelledby="'tab-' + pc.id + '-combat'"
          >
            <!-- Armes -->
            <div
              v-if="pc.primaryWeaponData || pc.secondaryWeaponData"
              class="pc-card__weapons-section"
            >
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

            <!-- Cartes de domaine enrichies -->
            <div
              v-if="pc.loadoutCards && pc.loadoutCards.length > 0"
              class="pc-card__domain-cards"
            >
              <div
                v-for="card in pc.loadoutCards"
                :key="card.id"
                class="pc-card__domain-card"
              >
                <!-- En-tete de carte -->
                <div class="pc-card__domain-card-header">
                  <span
                    class="pc-card__domain-card-activation"
                    aria-hidden="true"
                  >{{ activationEmoji(card.activationType) }}</span>
                  <span class="pc-card__domain-card-name">{{ card.name }}</span>
                  <span class="pc-card__domain-card-level">Nv.{{ card.level }}</span>
                  <span
                    class="pc-card__domain-card-type"
                    aria-hidden="true"
                  >{{ formatCardType(card) }}</span>
                  <span
                    v-if="card.domain"
                    class="pc-card__domain-card-domain"
                  >{{ domainName(card.domain) }}</span>
                </div>

                <!-- Ligne meta : cout, portee, frequence, rappel -->
                <div class="pc-card__domain-card-meta">
                  <span
                    v-if="card.cost"
                    class="pc-card__domain-card-badge"
                  >{{ formatCardCost(card.cost) }}</span>
                  <span
                    v-if="card.range"
                    class="pc-card__domain-card-badge"
                  >{{ formatRange(card.range) }}</span>
                  <span
                    v-if="card.frequency"
                    class="pc-card__domain-card-badge"
                  >{{ formatFrequency(card.frequency) }}</span>
                  <span
                    v-if="card.recallCost != null && card.recallCost > 0"
                    class="pc-card__domain-card-badge pc-card__domain-card-badge--recall"
                  >Rappel : {{ card.recallCost }}</span>
                </div>

                <!-- Tags -->
                <div
                  v-if="card.tags && card.tags.length > 0"
                  class="pc-card__domain-card-tags"
                >
                  <span
                    v-for="tag in card.tags"
                    :key="tag"
                    class="pc-card__domain-card-tag"
                  >{{ tag }}</span>
                </div>

                <!-- Description complete -->
                <p
                  v-if="card.feature"
                  class="pc-card__domain-card-feature"
                >
                  {{ card.feature }}
                </p>
              </div>
            </div>

            <!-- Etat vide combat -->
            <p
              v-if="!pc.primaryWeaponData && !pc.secondaryWeaponData && (!pc.loadoutCards || pc.loadoutCards.length === 0)"
              class="pc-card__empty-tab"
            >
              Aucun equipement de combat.
            </p>
          </div>

          <!-- ── Panneau Capacites ── -->
          <div
            v-show="getActiveTab(pc.id) === 'capacites'"
            :id="'panel-' + pc.id + '-capacites'"
            class="pc-card__tabpanel"
            role="tabpanel"
            :aria-labelledby="'tab-' + pc.id + '-capacites'"
          >
            <!-- Hope Feature -->
            <div
              v-if="pc.classData && pc.classData.hopeFeature"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x2728;</span>
                Feature d'Espoir &#x2014; {{ pc.classData.name }}
              </div>
              <div class="pc-card__feature pc-card__feature--hope">
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
            </div>

            <!-- Class Features -->
            <div
              v-if="classFeaturesList(pc).length > 0"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                Classe &#x2014; {{ pc.classData.name }}
              </div>
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
            </div>

            <!-- Ancestry Features -->
            <div
              v-if="pc.ancestryData && (pc.ancestryData.topFeature || pc.ancestryData.bottomFeature)"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x1F9EC;</span>
                Ascendance &#x2014; {{ pc.ancestryData.name }}
              </div>
              <div
                v-if="pc.ancestryData.topFeature"
                class="pc-card__feature"
              >
                <span class="pc-card__feature-name">{{ pc.ancestryData.topFeature.name }}</span>
                <span class="pc-card__feature-desc">{{ pc.ancestryData.topFeature.description }}</span>
              </div>
              <div
                v-if="pc.ancestryData.bottomFeature"
                class="pc-card__feature"
              >
                <span class="pc-card__feature-name">{{ pc.ancestryData.bottomFeature.name }}</span>
                <span class="pc-card__feature-desc">{{ pc.ancestryData.bottomFeature.description }}</span>
              </div>
            </div>

            <!-- Community Feature -->
            <div
              v-if="pc.communityData && pc.communityData.feature"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x1F3D8;&#xFE0F;</span>
                Communaute &#x2014; {{ pc.communityData.name }}
              </div>
              <div class="pc-card__feature">
                <span class="pc-card__feature-name">{{ pc.communityData.feature.name }}</span>
                <span class="pc-card__feature-desc">{{ pc.communityData.feature.description }}</span>
              </div>
            </div>

            <!-- Subclass features par tier -->
            <template v-if="pc.subclassData">
              <!-- Foundation (toujours visible) -->
              <div
                v-if="(pc.subclassData.foundation || []).length > 0"
                class="pc-card__feature-group"
              >
                <div class="pc-card__feature-source">
                  <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                  Specialisation &#x2014; {{ pc.subclassData.name }} &#xB7; Fondation
                </div>
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
              </div>

              <!-- Specialization (niveau >= 5) -->
              <div
                v-if="(pc.level || 1) >= 5 && (pc.subclassData.specialization || []).length > 0"
                class="pc-card__feature-group"
              >
                <div class="pc-card__feature-source">
                  <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                  Specialisation &#x2014; {{ pc.subclassData.name }} &#xB7; Specialisation
                </div>
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
              </div>

              <!-- Mastery (niveau >= 8) -->
              <div
                v-if="(pc.level || 1) >= 8 && (pc.subclassData.mastery || []).length > 0"
                class="pc-card__feature-group"
              >
                <div class="pc-card__feature-source">
                  <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                  Specialisation &#x2014; {{ pc.subclassData.name }} &#xB7; Maitrise
                </div>
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
              </div>
            </template>
          </div>

          <!-- ── Panneau Inventaire ── -->
          <div
            v-show="getActiveTab(pc.id) === 'inventaire'"
            :id="'panel-' + pc.id + '-inventaire'"
            class="pc-card__tabpanel"
            role="tabpanel"
            :aria-labelledby="'tab-' + pc.id + '-inventaire'"
          >
            <!-- Or -->
            <p
              v-if="hasGold(pc)"
              class="pc-card__gold"
            >
              &#x1FA99; {{ formatGold(pc.gold) }}
            </p>

            <!-- Resume armure -->
            <div
              v-if="pc.armorData"
              class="pc-card__equip-summary"
            >
              <span class="pc-card__equip-label">Armure :</span>
              <span class="pc-card__equip-value">{{ pc.armorData.name }}</span>
            </div>

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

            <!-- Etat vide inventaire -->
            <p
              v-if="!hasGold(pc) && (!pc.inventory || pc.inventory.length === 0) && !pc.armorData"
              class="pc-card__empty-tab"
            >
              Inventaire vide.
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
/**
 * PcGroupPanel — Grille enrichie des personnages joueurs.
 * Affiche une carte par PJ avec stats effectives, barres HP/Stress,
 * onglets Combat/Capacites/Inventaire, cartes de domaine enrichies,
 * et features avec labels de source.
 *
 * Utilise resolveCharacterDisplay pour resoudre les stats de TOUS les PJ
 * simultanement, sans passer par les getters du store (qui ne gerent
 * que le personnage selectionne).
 */
import { computed, ref, nextTick } from 'vue'
import { resolveCharacterDisplay } from '@modules/characters/composables/useCharacterComputed'
import { useCharacterStore } from '@modules/characters'
import { useStorage } from '@core/composables/useStorage'
import { getDomainById } from '@data/domains'

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

    // ── Store pour mutations ──
    const characterStore = useCharacterStore()

    // ══════════════════════════════════════════════
    //  GESTION INTERACTIVE — HP / Stress / Armure / Espoir
    // ══════════════════════════════════════════════

    /** Marquer 1 degat (augmente currentHP = degats marques) */
    function incrementHP(pc) {
      const newVal = Math.min(pc.effectiveMaxHP, (pc.currentHP || 0) + 1)
      characterStore.patchCharacterById(pc.id, { currentHP: newVal })
    }

    /** Soigner 1 PV (diminue currentHP = degats marques) */
    function decrementHP(pc) {
      const newVal = Math.max(0, (pc.currentHP || 0) - 1)
      characterStore.patchCharacterById(pc.id, { currentHP: newVal })
    }

    /** Marquer 1 stress */
    function incrementStress(pc) {
      const newVal = Math.min(pc.effectiveMaxStress, (pc.currentStress || 0) + 1)
      characterStore.patchCharacterById(pc.id, { currentStress: newVal })
    }

    /** Reduire 1 stress */
    function decrementStress(pc) {
      const newVal = Math.max(0, (pc.currentStress || 0) - 1)
      characterStore.patchCharacterById(pc.id, { currentStress: newVal })
    }

    /** Utiliser 1 slot d'armure (augmente armorSlotsMarked) */
    function incrementArmor(pc) {
      const newVal = Math.min(pc.effectiveArmorScore, (pc.armorSlotsMarked || 0) + 1)
      characterStore.patchCharacterById(pc.id, { armorSlotsMarked: newVal })
    }

    /** Restaurer 1 slot d'armure */
    function decrementArmor(pc) {
      const newVal = Math.max(0, (pc.armorSlotsMarked || 0) - 1)
      characterStore.patchCharacterById(pc.id, { armorSlotsMarked: newVal })
    }

    /** Gagner 1 espoir */
    function incrementHope(pc) {
      const newVal = Math.min(6, (pc.hope || 0) + 1)
      characterStore.patchCharacterById(pc.id, { hope: newVal })
    }

    /** Depenser 1 espoir */
    function decrementHope(pc) {
      const newVal = Math.max(0, (pc.hope || 0) - 1)
      characterStore.patchCharacterById(pc.id, { hope: newVal })
    }

    // ── Personnages enrichis via resolveCharacterDisplay ──
    const enrichedCharacters = computed(() =>
      props.characters.map(resolveCharacterDisplay)
    )

    // ══════════════════════════════════════════════
    //  IMPROVEMENT 1 — Grille configurable (colonnes)
    // ══════════════════════════════════════════════

    const columnStorage = useStorage('pcgroup-columns', 2)
    const columnCount = columnStorage.data

    /** Met a jour le nombre de colonnes affichees */
    function setColumns(n) {
      columnCount.value = n
    }

    // ══════════════════════════════════════════════
    //  IMPROVEMENT 4 — Systeme d'onglets par carte
    // ══════════════════════════════════════════════

    const CARD_TABS = [
      { id: 'combat', label: 'Combat', icon: '\u2694\uFE0F' },
      { id: 'capacites', label: 'Capacites', icon: '\u2728' },
      { id: 'inventaire', label: 'Inventaire', icon: '\uD83C\uDF92' }
    ]
    const activeTab = ref({})

    /** Retourne l'onglet actif pour un PJ donne */
    function getActiveTab(pcId) {
      return activeTab.value[pcId] || 'combat'
    }

    /** Definit l'onglet actif pour un PJ donne */
    function setActiveTab(pcId, tab) {
      activeTab.value = { ...activeTab.value, [pcId]: tab }
    }

    /** Verifie si un onglet a du contenu pour un PJ donne */
    function tabHasContent(pc, tabId) {
      switch (tabId) {
        case 'combat':
          return !!(pc.primaryWeaponData || pc.secondaryWeaponData ||
                    (pc.loadoutCards && pc.loadoutCards.length > 0))
        case 'capacites':
          return hasFeatures(pc)
        case 'inventaire':
          return true
        default:
          return false
      }
    }

    /** Retourne les onglets visibles pour un PJ donne */
    function visibleTabs(pc) {
      return CARD_TABS.filter(t => tabHasContent(pc, t.id))
    }

    /** Navigation clavier entre onglets (fleche gauche/droite) */
    function navigateTab(pc, direction) {
      const tabs = visibleTabs(pc)
      const currentIdx = tabs.findIndex(t => t.id === getActiveTab(pc.id))
      const nextIdx = (currentIdx + direction + tabs.length) % tabs.length
      setActiveTab(pc.id, tabs[nextIdx].id)
      nextTick(() => {
        const el = document.getElementById('tab-' + pc.id + '-' + tabs[nextIdx].id)
        if (el) el.focus()
      })
    }

    // ══════════════════════════════════════════════
    //  Helpers barres HP/Stress/Armure
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  Inventaire & Or
    // ══════════════════════════════════════════════

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

    // ══════════════════════════════════════════════
    //  Cartes de domaine — type et emoji
    // ══════════════════════════════════════════════

    function formatCardType(card) {
      if (!card.type) return ''
      switch (card.type) {
        case 'ability': return '\u{1F7E2}'
        case 'spell': return '\u{1F52E}'
        case 'passive': return '\u{1F535}'
        default: return ''
      }
    }

    // ══════════════════════════════════════════════
    //  IMPROVEMENT 2 — Contenu enrichi des cartes
    // ══════════════════════════════════════════════

    /** Resout le nom d'un domaine a partir de son ID */
    function domainName(domainId) {
      const d = getDomainById(domainId)
      return d ? d.name : domainId
    }

    /** Formate le cout d'une carte de domaine */
    function formatCardCost(cost) {
      if (!cost || cost.type === 'free' || cost.amount === 0) return 'Gratuit'
      const typeLabels = { hope: 'Espoir', stress: 'Stress', armor: 'Armure' }
      return `${cost.amount} ${typeLabels[cost.type] || cost.type}`
    }

    /** Formate la frequence d'utilisation d'une carte */
    function formatFrequency(freq) {
      const labels = {
        atWill: 'A volonte',
        oncePerShortRest: '1/repos court',
        oncePerLongRest: '1/repos long',
        oncePerSession: '1/session'
      }
      return labels[freq] || freq || ''
    }

    /** Formate la portee d'une carte */
    function formatRange(range) {
      const labels = {
        self: 'Soi',
        melee: 'Melee',
        veryClose: 'Tres proche',
        close: 'Proche',
        far: 'Loin',
        veryFar: 'Tres loin'
      }
      return labels[range] || range || ''
    }

    // ══════════════════════════════════════════════
    //  Capacites / Features
    // ══════════════════════════════════════════════

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
      // Gestion interactive
      incrementHP,
      decrementHP,
      incrementStress,
      decrementStress,
      incrementArmor,
      decrementArmor,
      incrementHope,
      decrementHope,
      // Improvement 1 — colonnes
      columnCount,
      setColumns,
      // Improvement 4 — onglets
      activeTab,
      getActiveTab,
      setActiveTab,
      CARD_TABS,
      tabHasContent,
      visibleTabs,
      navigateTab,
      // Barres et stats
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
      // Inventaire
      hasGold,
      hasInventory,
      formatGold,
      // Cartes de domaine
      formatCardType,
      activationEmoji,
      classFeaturesList,
      hasFeatures,
      // Improvement 2 — contenu enrichi
      domainName,
      formatCardCost,
      formatFrequency,
      formatRange
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
   SELECTEUR DE COLONNES
   ═══════════════════════════════════════════════ */

.pc-group__col-selector {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  padding: 2px;
}

.pc-group__col-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.pc-group__col-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.pc-group__col-btn--active {
  background: var(--color-accent-hope);
  color: var(--color-text-inverse);
}

.pc-group__col-btn--active:hover {
  background: var(--color-accent-hope);
  color: var(--color-text-inverse);
}

/* ═══════════════════════════════════════════════
   GRILLE — Layout responsive configurable
   ═══════════════════════════════════════════════ */

.pc-group__grid {
  display: grid;
  gap: var(--space-md);
}

.pc-group__grid--cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.pc-group__grid--cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.pc-group__grid--cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 768px) {
  .pc-group__grid--cols-2,
  .pc-group__grid--cols-3,
  .pc-group__grid--cols-4 {
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

/* ── Boutons interactifs +/- ── */

.pc-card__bar--interactive {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pc-card__stat-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.pc-card__stat-btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.pc-card__stat-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.pc-card__stat-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pc-card__stat-btn--mini {
  min-width: 1.75rem;
  min-height: 1.75rem;
  font-size: var(--font-size-sm);
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

.pc-card__armor-bar--interactive {
  gap: var(--space-xs);
}

.pc-card__armor-label {
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.pc-card__hope {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__hope--interactive {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
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
   SYSTEME D'ONGLETS
   ═══════════════════════════════════════════════ */

.pc-card__tabs {
  border-top: 1px solid var(--color-border);
}

.pc-card__tablist {
  display: flex;
  background: var(--color-bg-elevated);
}

.pc-card__tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-height: var(--touch-min);
  padding: var(--space-xs) var(--space-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.pc-card__tab:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-hover);
}

.pc-card__tab--active {
  color: var(--color-accent-hope);
  border-bottom-color: var(--color-accent-hope);
}

.pc-card__tab--active:hover {
  color: var(--color-accent-hope);
}

.pc-card__tab-label {
  font-size: var(--font-size-xs);
}

.pc-card__tabpanel {
  padding: var(--space-sm) var(--space-md) var(--space-md);
}

/* ═══════════════════════════════════════════════
   ARMES (dans onglet Combat)
   ═══════════════════════════════════════════════ */

.pc-card__weapons-section {
  margin-bottom: var(--space-sm);
}

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

/* ═══════════════════════════════════════════════
   CARTES DE DOMAINE ENRICHIES (dans onglet Combat)
   ═══════════════════════════════════════════════ */

.pc-card__domain-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pc-card__domain-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  background: var(--color-bg-elevated);
}

.pc-card__domain-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  margin-bottom: var(--space-xs);
}

.pc-card__domain-card-activation {
  font-size: var(--font-size-sm);
}

.pc-card__domain-card-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.pc-card__domain-card-level {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.15);
  padding: 1px var(--space-xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.pc-card__domain-card-type {
  font-size: var(--font-size-xs);
}

.pc-card__domain-card-domain {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
}

.pc-card__domain-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.pc-card__domain-card-badge {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.pc-card__domain-card-badge--recall {
  background: rgba(224, 165, 38, 0.15);
  color: var(--color-accent-gold);
}

.pc-card__domain-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.pc-card__domain-card-tag {
  font-size: 0.625rem;
  padding: 1px var(--space-xs);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-active);
  color: var(--color-accent-hope);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pc-card__domain-card-feature {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
  margin: 0;
}

/* ═══════════════════════════════════════════════
   CAPACITES / FEATURES avec labels source
   ═══════════════════════════════════════════════ */

.pc-card__feature-group {
  margin-bottom: var(--space-md);
}

.pc-card__feature-group:last-child {
  margin-bottom: 0;
}

.pc-card__feature-source {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: var(--space-xs);
  margin-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

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

/* ═══════════════════════════════════════════════
   INVENTAIRE (onglet)
   ═══════════════════════════════════════════════ */

.pc-card__gold {
  font-size: var(--font-size-sm);
  color: var(--color-accent-gold);
  margin: 0 0 var(--space-sm);
}

.pc-card__equip-summary {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-sm);
}

.pc-card__equip-label {
  color: var(--color-text-muted);
}

.pc-card__equip-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
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

.pc-card__empty-tab {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: var(--space-sm) 0 0;
}
</style>
