/**
 * @module encounter/composables/usePlayerActions
 * @description Enrichit les features d'un PJ avec les informations de gameplay.
 * Resout le spellcastTrait en label + valeur, marque les domain cards comme sorts,
 * et ajoute le modificateur de trait resolu sur chaque feature.
 */

import { computed } from 'vue'

/**
 * Construit le label lisible pour un trait et son modificateur.
 * Formate avec '+' pour les positifs/zero, signe natif pour les negatifs.
 * @param {string} trait - Nom du trait (ex: 'Instinct')
 * @param {number} modifier - Valeur du modificateur
 * @returns {string} Label formate (ex: 'Instinct +3' ou 'Strength -1')
 */
function buildTraitLabel(trait, modifier) {
  if (modifier < 0) {
    return `${trait} ${modifier}`
  }
  return `${trait} +${modifier}`
}

/**
 * Resout le trait applicable a une feature et retourne le modificateur + label.
 * Logique :
 *  1. Si la feature a un trait explicite, on l'utilise.
 *  2. Sinon, si c'est une domain card et que le PJ a un spellcastTrait, on utilise celui-ci.
 *  3. Sinon, pas de trait resolu.
 *
 * @param {Object} feature - Feature normalisee (depuis useEncounterFeatures)
 * @param {boolean} isDomainCard - Si la feature provient d'une domain card
 * @param {Object} traits - Objet des traits du PJ (cles minuscules)
 * @param {string|null} spellcastTrait - Trait de spellcast du PJ (capitalise, ex: 'Instinct')
 * @returns {{ modifier: number, label: string } | null}
 */
function resolveTraitForFeature(feature, isDomainCard, traits, spellcastTrait) {
  // Determiner le trait applicable
  let traitName = feature.trait || null

  // Fallback pour les domain cards sans trait explicite : utiliser le spellcastTrait
  if (!traitName && isDomainCard && spellcastTrait) {
    traitName = spellcastTrait
  }

  if (!traitName) return null

  // Recuperer la valeur du modificateur (les cles traits sont en minuscules)
  const key = traitName.toLowerCase()
  const modifier = traits[key]

  // Si le trait n'existe pas dans l'objet traits du PJ, pas de resolution
  if (modifier === undefined || modifier === null) return null

  return {
    modifier,
    label: buildTraitLabel(traitName, modifier)
  }
}

/**
 * Composable enrichissant les features d'un PJ avec des informations de gameplay.
 * Resout le spellcastTrait, marque les domain cards, et ajoute les modificateurs
 * de trait resolus sur chaque feature.
 *
 * Toutes les valeurs retournees sont des computed purs (lecture seule, aucune persistance).
 *
 * @param {import('vue').Ref<Object|null>} pcRef - Ref vers l'objet PJ actif (depuis participantPcs)
 * @param {import('vue').Ref<Object[]>} allFeaturesRef - Ref vers le tableau de features normalisees
 * @returns {Object} Computed d'enrichissement des features
 * @returns {import('vue').ComputedRef<Object|null>} returns.spellcastInfo - Info spellcast du PJ
 * @returns {import('vue').ComputedRef<Object[]>} returns.enrichedFeatures - Features enrichies
 * @returns {import('vue').ComputedRef<number>} returns.domainCardCount - Nombre de domain cards
 * @returns {import('vue').ComputedRef<number>} returns.spellCount - Nombre de sorts
 */
export function usePlayerActions(pcRef, allFeaturesRef) {
  // ── Spellcast info ──────────────────────────────────────

  /**
   * Informations de spellcast du PJ : trait, modificateur et label.
   * Retourne null si le PJ n'a pas de spellcastTrait (ex: Guardian, Warrior).
   */
  const spellcastInfo = computed(() => {
    const pc = pcRef.value
    if (!pc || !pc.spellcastTrait) return null

    const traitName = pc.spellcastTrait
    const key = traitName.toLowerCase()
    const modifier = pc.traits?.[key]

    // Si les traits du PJ ne contiennent pas la cle, retourner quand meme
    // avec un modificateur a 0 par defaut
    const resolvedModifier = modifier !== undefined && modifier !== null ? modifier : 0

    return {
      trait: traitName,
      modifier: resolvedModifier,
      label: `Spellcast: ${buildTraitLabel(traitName, resolvedModifier)}`
    }
  })

  // ── Features enrichies ──────────────────────────────────

  /**
   * Features originales enrichies avec les champs de gameplay :
   * isDomainCard, isSpell, resolvedTraitModifier, resolvedTraitLabel.
   */
  const enrichedFeatures = computed(() => {
    const pc = pcRef.value
    const features = allFeaturesRef.value
    if (!pc || !features) return []

    const traits = pc.traits || {}
    const spellcastTrait = pc.spellcastTrait || null

    return features.map((feature) => {
      const isDomainCard = feature.source === 'domain'
      const isSpell = isDomainCard && spellcastTrait !== null
      const resolved = resolveTraitForFeature(feature, isDomainCard, traits, spellcastTrait)

      return {
        ...feature,
        isDomainCard,
        isSpell,
        resolvedTraitModifier: resolved ? resolved.modifier : null,
        resolvedTraitLabel: resolved ? resolved.label : null
      }
    })
  })

  // ── Compteurs ───────────────────────────────────────────

  /** Nombre de features provenant de domain cards */
  const domainCardCount = computed(() =>
    enrichedFeatures.value.filter((f) => f.isDomainCard).length
  )

  /** Nombre de features marquees comme sorts */
  const spellCount = computed(() =>
    enrichedFeatures.value.filter((f) => f.isSpell).length
  )

  return {
    spellcastInfo,
    enrichedFeatures,
    domainCardCount,
    spellCount
  }
}
