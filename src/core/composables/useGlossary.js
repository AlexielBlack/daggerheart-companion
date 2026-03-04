import { computed } from 'vue'
import {
  GLOSSARY_ENTRIES,
  GLOSSARY_CATEGORIES,
  buildGlossaryIndex
} from '@data/glossary'

/**
 * Index singleton construit une seule fois.
 * @type {Map<string, Object>}
 */
const glossaryIndex = buildGlossaryIndex()

/**
 * Construit la RegExp de détection en triant les termes du plus long au plus
 * court afin que « Very Close » soit détecté avant « Close ».
 * Utilise des word boundaries (\b) pour éviter les faux positifs.
 *
 * @returns {RegExp}
 */
function buildDetectionRegex() {
  const allTerms = []
  for (const entry of GLOSSARY_ENTRIES) {
    allTerms.push(entry.en)
    if (entry.aliases) {
      allTerms.push(...entry.aliases)
    }
  }
  // Tri par longueur décroissante — les expressions longues sont testées en premier
  allTerms.sort((a, b) => b.length - a.length)
  // Échapper les caractères spéciaux regex
  const escaped = allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  // \\b ne traite pas les caractères accentués (é, è, ê…) comme des lettres,
  // ce qui provoque des faux positifs (ex: « réaction » matche « Action »).
  // On utilise un lookbehind/lookahead couvrant les lettres latines étendues.
  return new RegExp(`(?<![a-zA-ZÀ-ÿ])(${escaped.join('|')})(?![a-zA-ZÀ-ÿ])`, 'gi')
}

const detectionRegex = buildDetectionRegex()

/**
 * Second pass : parcourt les segments de type 'text' et détecte les patterns
 * inline (notations de dés, valeurs de statistiques) pour les transformer
 * en segments typés.
 *
 * @param {Array} segments — segments issus du premier pass (glossaire)
 * @returns {Array} — segments enrichis avec les types 'dice' et 'stat-value'
 */
function enrichWithInlinePatterns(segments) {
  const enriched = []

  for (const segment of segments) {
    // Ne traiter que les segments texte brut (les keywords sont déjà résolus)
    if (segment.type !== 'text') {
      enriched.push(segment)
      continue
    }

    // Regex combinée : dés OU valeurs stat, tri par position dans le texte
    const combinedRegex = new RegExp(
      `(\\d+d\\d+(?:\\s*[-+]\\s*\\d+)?)|(?:(\\d+)\\s+(HP|PV|Stress|Hit Points?|Armor Slots?|Evasion))`,
      'gi'
    )

    const raw = segment.value
    let lastIdx = 0
    let inlineMatch

    while ((inlineMatch = combinedRegex.exec(raw)) !== null) {
      // Texte avant le pattern
      if (inlineMatch.index > lastIdx) {
        enriched.push({ type: 'text', value: raw.slice(lastIdx, inlineMatch.index) })
      }

      if (inlineMatch[1]) {
        // Notation de dé (ex : 1d4, 2d6+3)
        enriched.push({ type: 'dice', value: inlineMatch[0] })
      } else {
        // Valeur stat (ex : 3 HP, 2 Stress)
        enriched.push({
          type: 'stat-value',
          value: inlineMatch[0],
          statNumber: inlineMatch[2],
          statUnit: inlineMatch[3]
        })
      }

      lastIdx = combinedRegex.lastIndex
    }

    // Texte restant
    if (lastIdx < raw.length) {
      enriched.push({ type: 'text', value: raw.slice(lastIdx) })
    }
  }

  return enriched
}

/**
 * Segmente une chaîne en fragments textuels et mots-clés détectés.
 * Deux passes :
 *  1. Détection des termes du glossaire SRD
 *  2. Enrichissement des segments texte avec les patterns inline (dés, stats)
 *
 * @param {string} text — texte brut à analyser
 * @returns {Array<{type: 'text'|'keyword'|'dice'|'stat-value', value: string, entry?: Object}>}
 */
export function parseGlossaryTerms(text) {
  if (!text || typeof text !== 'string') return []

  const segments = []
  // Réinitialiser le lastIndex de la regex globale
  detectionRegex.lastIndex = 0
  let lastIndex = 0
  let match

  while ((match = detectionRegex.exec(text)) !== null) {
    // Texte avant le mot-clé
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, match.index)
      })
    }
    const entry = glossaryIndex.get(match[0].toLowerCase())
    if (entry) {
      segments.push({
        type: 'keyword',
        value: match[0],
        entry
      })
    } else {
      // Fallback — ne devrait pas arriver car la regex est construite depuis l'index
      segments.push({ type: 'text', value: match[0] })
    }
    lastIndex = detectionRegex.lastIndex
  }

  // Texte restant après le dernier mot-clé
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  // Second pass : enrichir les segments texte avec les patterns inline
  const enriched = enrichWithInlinePatterns(segments)

  // Troisième pass : fusionner « nombre + keyword combat/stat » en segments stat-value
  return mergeNumberKeywordPairs(enriched)
}

/**
 * Identifiants de mots-clés pouvant former un couple « N + keyword » (stat-value).
 * @type {Set<string>}
 */
const STAT_KEYWORD_IDS = new Set([
  'hit_points', 'stress', 'evasion', 'armor_slots'
])

/**
 * Troisième pass : quand un segment texte se termine par un nombre suivi
 * d'un espace et que le segment suivant est un keyword stat (HP, Stress…),
 * les fusionne en un segment stat-value.
 *
 * @param {Array} segments
 * @returns {Array}
 */
function mergeNumberKeywordPairs(segments) {
  const merged = []
  let i = 0

  while (i < segments.length) {
    const current = segments[i]
    const next = segments[i + 1]

    // Pattern : segment texte finissant par « <nombre><espace(s)> » + keyword stat
    if (
      current.type === 'text' &&
      next &&
      next.type === 'keyword' &&
      STAT_KEYWORD_IDS.has(next.entry.id)
    ) {
      const trailingNumberMatch = current.value.match(/(\d+)\s+$/)
      if (trailingNumberMatch) {
        // Texte avant le nombre
        const textBefore = current.value.slice(0, trailingNumberMatch.index)
        if (textBefore) {
          merged.push({ type: 'text', value: textBefore })
        }

        // Déterminer l'unité normalisée
        const unitId = next.entry.id
        let normalizedUnit = 'generic'
        if (unitId === 'hit_points') normalizedUnit = 'hp'
        else if (unitId === 'stress') normalizedUnit = 'stress'
        else if (unitId === 'armor_slots') normalizedUnit = 'armor'
        else if (unitId === 'evasion') normalizedUnit = 'evasion'

        merged.push({
          type: 'stat-value',
          value: trailingNumberMatch[1] + ' ' + next.value,
          statNumber: trailingNumberMatch[1],
          statUnit: next.value,
          normalizedUnit
        })

        i += 2 // Sauter le keyword fusionné
        continue
      }
    }

    merged.push(current)
    i++
  }

  return merged
}

/**
 * Recherche une entrée de glossaire par son terme anglais (insensible à la casse).
 *
 * @param {string} term
 * @returns {Object|undefined}
 */
export function lookupGlossaryTerm(term) {
  if (!term) return undefined
  return glossaryIndex.get(term.toLowerCase())
}

/**
 * Retourne toutes les entrées d'une catégorie donnée.
 *
 * @param {string} category
 * @returns {Array<Object>}
 */
export function getEntriesByCategory(category) {
  return GLOSSARY_ENTRIES.filter(e => e.category === category)
}

/**
 * Retourne les métadonnées de couleur / label d'une catégorie.
 *
 * @param {string} category
 * @returns {{ label: string, color: string }|undefined}
 */
export function getCategoryMeta(category) {
  return GLOSSARY_CATEGORIES[category]
}

/**
 * Composable Vue réactif.
 * Accepte un ref/computed/string et renvoie les segments parsés de manière réactive.
 *
 * @param {import('vue').Ref<string>|import('vue').ComputedRef<string>|string} textRef
 * @returns {{ segments: import('vue').ComputedRef<Array>, glossaryIndex: Map, categories: Object }}
 */
export function useGlossary(textRef) {
  const segments = computed(() => {
    const raw = typeof textRef === 'string' ? textRef : textRef?.value
    return parseGlossaryTerms(raw)
  })

  return {
    segments,
    glossaryIndex,
    categories: GLOSSARY_CATEGORIES
  }
}
