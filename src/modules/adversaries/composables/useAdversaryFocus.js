/**
 * @module adversaries/composables/useAdversaryFocus
 * @description Calcule le score de focus préférentiel d'un adversaire sur chaque PJ.
 *
 * Le score combine les poids du focusProfile de l'adversaire avec les stats réelles des PJs.
 * Chaque facteur (lowHP, lowArmor, lowEvasion, highThreat, highPresence, highGold, nearest)
 * est évalué sur [0, 1] par PJ, puis pondéré par le poids [0, 3] du profil.
 *
 * Résultat : score normalisé [0, 100] par PJ, avec raisons explicatives.
 */
import { computed, ref } from 'vue'
import { FOCUS_FACTORS } from '@data/adversaries'

/**
 * Estime le dé de dégâts moyen à partir d'une chaîne de dégâts (ex: '2d8+3' → 12).
 * @param {string} damageStr - Chaîne de dégâts
 * @returns {number} Moyenne estimée
 */
export function estimateAverageDamage (damageStr) {
  if (!damageStr) return 0
  const match = damageStr.match(/^(\d*)d(\d+)(?:\+(\d+))?$/)
  if (!match) return 0
  const count = parseInt(match[1] || '1', 10)
  const sides = parseInt(match[2], 10)
  const bonus = parseInt(match[3] || '0', 10)
  return count * ((sides + 1) / 2) + bonus
}

/**
 * Calcule le total d'or en poignées (handfuls).
 * Conversion SRD : 1 bag = 10 handfuls, 1 chest = 100 handfuls.
 * @param {{ handfuls?: number, bags?: number, chests?: number }} gold
 * @returns {number}
 */
export function goldToHandfuls (gold) {
  if (!gold) return 0
  return (gold.handfuls || 0) + (gold.bags || 0) * 10 + (gold.chests || 0) * 100
}

/**
 * @typedef {Object} FocusResult
 * @property {string} characterId - ID du PJ
 * @property {string} characterName - Nom du PJ
 * @property {number} score - Score normalisé [0, 100]
 * @property {Array<{ factor: string, label: string, icon: string, weight: number, raw: number }>} reasons
 */

/**
 * Composable principal : calcule le focus d'un adversaire sur les PJs.
 * @param {import('vue').Ref|import('vue').ComputedRef} adversaryRef - Ref vers l'adversaire sélectionné
 * @param {import('vue').Ref|import('vue').ComputedRef} charactersRef - Ref vers la liste des PJs
 * @returns {{ focusResults: import('vue').ComputedRef<FocusResult[]>, pcRangeOverrides: import('vue').Ref<Object>, setPcInRange: Function }}
 */
export function useAdversaryFocus (adversaryRef, charactersRef) {
  // Override de proximité manuelle par le GM (characterId → boolean)
  const pcRangeOverrides = ref({})

  /**
   * Marque un PJ comme étant à portée de l'adversaire.
   * @param {string} charId
   * @param {boolean} inRange
   */
  function setPcInRange (charId, inRange) {
    pcRangeOverrides.value = { ...pcRangeOverrides.value, [charId]: inRange }
  }

  /**
   * Évalue un facteur brut [0, 1] pour un PJ donné.
   */
  function evaluateFactor (factor, pc, _allPcs) {
    switch (factor) {
      case 'lowHP': {
        // Plus currentHP est élevé (blessé), plus le score est haut
        const maxHP = pc.maxHP || 6
        const marked = pc.currentHP || 0
        return maxHP > 0 ? marked / maxHP : 0
      }
      case 'lowArmor': {
        // Plus l'armure restante est faible, plus le score est haut
        const score = pc.armorScore || 0
        const marked = pc.armorSlotsMarked || 0
        const remaining = Math.max(0, score - marked)
        // Normaliser : 0 restant → 1, max possible (6) → 0
        return 1 - Math.min(remaining / 6, 1)
      }
      case 'lowEvasion': {
        // Évasion basse → score élevé. Plage typique : 8-16
        const evasion = (pc.evasion || 10) + (pc.evasionBonus || 0)
        // 8 → 1.0, 16 → 0.0
        return Math.max(0, Math.min(1, (16 - evasion) / 8))
      }
      case 'highThreat': {
        // Dégâts d'arme primaire élevés → score élevé
        const dmg = pc.primaryWeapon?.damage
          ? estimateAverageDamage(pc.primaryWeapon.damage)
          : 0
        // Normaliser sur ~20 (max raisonnable pour T1-T4)
        return Math.min(dmg / 20, 1)
      }
      case 'highPresence': {
        // Trait Presence élevé → score élevé. Plage -1 à +4
        const presence = pc.traits?.presence ?? 0
        return Math.max(0, Math.min(1, (presence + 1) / 5))
      }
      case 'highGold': {
        // Richesse en or → score élevé
        const gold = goldToHandfuls(pc.gold)
        // Normaliser sur 50 handfuls
        return Math.min(gold / 50, 1)
      }
      case 'nearest': {
        // Binaire via override du GM
        return pcRangeOverrides.value[pc.id] ? 1 : 0
      }
      default:
        return 0
    }
  }

  const focusResults = computed(() => {
    const adv = adversaryRef.value
    const pcs = charactersRef.value
    if (!adv?.focusProfile || !pcs?.length) return []

    const profile = adv.focusProfile
    // Poids total max possible = somme des poids × 1
    const maxPossibleScore = Object.values(profile).reduce((sum, w) => sum + w, 0)

    if (maxPossibleScore === 0) {
      return pcs.map((pc) => ({
        characterId: pc.id,
        characterName: pc.name || 'Sans nom',
        score: 0,
        reasons: []
      }))
    }

    const results = pcs.map((pc) => {
      let totalScore = 0
      const reasons = []

      for (const [factor, weight] of Object.entries(profile)) {
        if (weight <= 0) continue
        const raw = evaluateFactor(factor, pc, pcs)
        const contribution = weight * raw
        totalScore += contribution

        if (raw > 0) {
          const meta = FOCUS_FACTORS[factor] || { label: factor, icon: '❓' }
          reasons.push({
            factor,
            label: meta.label,
            icon: meta.icon,
            weight,
            raw: Math.round(raw * 100)
          })
        }
      }

      return {
        characterId: pc.id,
        characterName: pc.name || 'Sans nom',
        score: Math.round((totalScore / maxPossibleScore) * 100),
        reasons: reasons.sort((a, b) => (b.weight * b.raw) - (a.weight * a.raw))
      }
    })

    return results.sort((a, b) => b.score - a.score)
  })

  return {
    focusResults,
    pcRangeOverrides,
    setPcInRange
  }
}
