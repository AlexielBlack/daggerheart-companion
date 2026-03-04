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
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
}

const detectionRegex = buildDetectionRegex()

/**
 * Segmente une chaîne en fragments textuels et mots-clés détectés.
 *
 * @param {string} text — texte brut à analyser
 * @returns {Array<{type: 'text'|'keyword', value: string, entry?: Object}>}
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

  return segments
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
