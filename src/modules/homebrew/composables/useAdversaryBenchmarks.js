/**
 * @module homebrew/composables/useAdversaryBenchmarks
 * @description Composable fournissant les données de référence par type/tier
 * et la comparaison avec le formulaire en cours.
 */

import { computed } from 'vue'
import { getBenchmarkForTypeTier, getTypeInfo } from '../data/adversaryTypeBenchmarks.js'

/**
 * Extrait la valeur par défaut d'un champ benchmark.
 * Les champs scalaires (Minion HP = 1) sont retournés tels quels.
 * Les champs objets { min, max, default } retournent la valeur default.
 * @param {number|object} field
 * @returns {number|null}
 */
function extractDefault(field) {
  if (field === null || field === undefined) return null
  if (typeof field === 'number') return field
  if (typeof field === 'object' && 'default' in field) return field.default
  return null
}

/**
 * Compare une valeur du formulaire à la référence benchmark.
 * @param {number} value - Valeur actuelle du formulaire
 * @param {number|object} reference - Valeur de référence (scalaire ou { min, max, default })
 * @returns {'above'|'below'|'match'|null}
 */
function compareValue(value, reference) {
  if (value === null || value === undefined || reference === null || reference === undefined) {
    return null
  }
  const refDefault = extractDefault(reference)
  if (refDefault === null) return null
  if (value > refDefault) return 'above'
  if (value < refDefault) return 'below'
  return 'match'
}

/**
 * @param {import('vue').Ref} formData - Réf vers les données du formulaire
 * @param {Function} setField - Fonction pour modifier un champ du formulaire
 * @returns {object} Propriétés réactives et méthodes
 */
export function useAdversaryBenchmarks(formData, setField) {
  /**
   * Benchmark complet pour le type + tier actuellement sélectionné.
   */
  const currentBenchmark = computed(() => {
    const type = formData.value?.type
    const tier = formData.value?.tier
    if (!type || !tier) return null
    return getBenchmarkForTypeTier(type, tier)
  })

  /**
   * Informations générales du type sélectionné.
   */
  const typeInfo = computed(() => {
    const type = formData.value?.type
    if (!type) return null
    return getTypeInfo(type)
  })

  /**
   * Indique si des benchmarks sont disponibles pour la sélection actuelle.
   */
  const hasBenchmark = computed(() => currentBenchmark.value !== null)

  /**
   * Comparaison champ par champ entre le formulaire et la référence.
   * Retourne un objet { difficulty, majorThreshold, severeThreshold, hp, stress, attackModifier }
   * avec les valeurs 'above' | 'below' | 'match' | null.
   */
  const comparison = computed(() => {
    const bm = currentBenchmark.value
    if (!bm) return null
    const fd = formData.value

    return {
      difficulty: compareValue(fd?.difficulty, bm.difficulty),
      majorThreshold: bm.thresholds
        ? compareValue(fd?.thresholds?.major, bm.thresholds.major)
        : null,
      severeThreshold: bm.thresholds
        ? compareValue(fd?.thresholds?.severe, bm.thresholds.severe)
        : null,
      hp: compareValue(fd?.hp, bm.hp),
      stress: compareValue(fd?.stress, bm.stress),
      attackModifier: compareValue(fd?.attack?.modifier, bm.attack?.modifier)
    }
  })

  /**
   * Applique les valeurs de référence du benchmark au formulaire.
   * Préserve le nom d'attaque et le type de dégâts existants.
   */
  function applyBenchmarkToForm() {
    const bm = currentBenchmark.value
    if (!bm) return

    setField('difficulty', extractDefault(bm.difficulty))

    // Seuils : les Minions n'en ont pas
    if (bm.thresholds) {
      setField('thresholds', {
        major: extractDefault(bm.thresholds.major),
        severe: extractDefault(bm.thresholds.severe)
      })
    }

    // HP : scalaire pour Minion (1), objet sinon
    setField('hp', extractDefault(bm.hp))

    setField('stress', extractDefault(bm.stress))

    // Attaque : préserver le nom et le type de dégâts existants
    const currentAttack = formData.value?.attack || {}
    setField('attack', {
      ...currentAttack,
      modifier: extractDefault(bm.attack.modifier),
      damage: bm.attack.damage,
      damageType: bm.attack.damageType || currentAttack.damageType || 'phy',
      range: bm.attack.range || currentAttack.range || 'Melee'
    })
  }

  return {
    currentBenchmark,
    typeInfo,
    hasBenchmark,
    comparison,
    applyBenchmarkToForm
  }
}
