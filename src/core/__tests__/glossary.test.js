import { describe, it, expect } from 'vitest'
import {
  GLOSSARY_ENTRIES,
  GLOSSARY_CATEGORIES,
  buildGlossaryIndex
} from '@data/glossary'
import {
  parseGlossaryTerms,
  lookupGlossaryTerm,
  getEntriesByCategory,
  getCategoryMeta
} from '@core/composables/useGlossary'

// ──────────────────────────────────────────────────────────
// Données du glossaire
// ──────────────────────────────────────────────────────────

describe('Glossaire — Données (glossary.js)', () => {
  it('contient au moins 50 entrées SRD', () => {
    expect(GLOSSARY_ENTRIES.length).toBeGreaterThanOrEqual(50)
  })

  it('chaque entrée possède les champs requis', () => {
    for (const entry of GLOSSARY_ENTRIES) {
      expect(entry).toHaveProperty('id')
      expect(entry).toHaveProperty('en')
      expect(entry).toHaveProperty('fr')
      expect(entry).toHaveProperty('definition')
      expect(entry).toHaveProperty('category')
      expect(typeof entry.id).toBe('string')
      expect(typeof entry.en).toBe('string')
      expect(typeof entry.fr).toBe('string')
      expect(typeof entry.definition).toBe('string')
      expect(typeof entry.category).toBe('string')
    }
  })

  it('chaque catégorie référencée existe dans GLOSSARY_CATEGORIES', () => {
    const validCategories = Object.keys(GLOSSARY_CATEGORIES)
    for (const entry of GLOSSARY_ENTRIES) {
      expect(validCategories).toContain(entry.category)
    }
  })

  it('les identifiants sont uniques', () => {
    const ids = GLOSSARY_ENTRIES.map(e => e.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('chaque catégorie possède un label et une couleur', () => {
    for (const [key, meta] of Object.entries(GLOSSARY_CATEGORIES)) {
      expect(meta).toHaveProperty('label')
      expect(meta).toHaveProperty('color')
      expect(typeof meta.label).toBe('string')
      expect(typeof meta.color).toBe('string')
      expect(key).toBeTruthy()
    }
  })

  it('les aliases sont des tableaux de chaînes quand présents', () => {
    const entriesWithAliases = GLOSSARY_ENTRIES.filter(e => e.aliases)
    expect(entriesWithAliases.length).toBeGreaterThan(0)
    for (const entry of entriesWithAliases) {
      expect(Array.isArray(entry.aliases)).toBe(true)
      for (const alias of entry.aliases) {
        expect(typeof alias).toBe('string')
      }
    }
  })
})

// ──────────────────────────────────────────────────────────
// Index de recherche
// ──────────────────────────────────────────────────────────

describe('Glossaire — buildGlossaryIndex', () => {
  const index = buildGlossaryIndex()

  it('retourne un Map non vide', () => {
    expect(index).toBeInstanceOf(Map)
    expect(index.size).toBeGreaterThan(0)
  })

  it('contient les termes principaux en minuscules', () => {
    expect(index.has('hope')).toBe(true)
    expect(index.has('fear')).toBe(true)
    expect(index.has('evasion')).toBe(true)
    expect(index.has('stress')).toBe(true)
  })

  it('contient les aliases en minuscules', () => {
    expect(index.has('hp')).toBe(true)
    expect(index.has('hit point')).toBe(true)
    expect(index.has('armor slot')).toBe(true)
  })

  it('les entrées indexées correspondent aux entrées source', () => {
    const hopeEntry = index.get('hope')
    expect(hopeEntry.id).toBe('hope')
    expect(hopeEntry.fr).toBe('Espoir')
  })
})

// ──────────────────────────────────────────────────────────
// Parseur de texte
// ──────────────────────────────────────────────────────────

describe('Glossaire — parseGlossaryTerms', () => {
  it('retourne un tableau vide pour une entrée vide', () => {
    expect(parseGlossaryTerms('')).toEqual([])
    expect(parseGlossaryTerms(null)).toEqual([])
    expect(parseGlossaryTerms(undefined)).toEqual([])
  })

  it('retourne un seul segment texte quand aucun terme n\'est trouvé', () => {
    const result = parseGlossaryTerms('Du texte sans termes techniques.')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('text')
    expect(result[0].value).toBe('Du texte sans termes techniques.')
  })

  it('détecte un terme unique dans une phrase', () => {
    const result = parseGlossaryTerms('The target gains Vulnerable condition.')
    const keywords = result.filter(s => s.type === 'keyword')
    expect(keywords.length).toBeGreaterThanOrEqual(1)
    const vulnSegment = keywords.find(k => k.entry.id === 'vulnerable')
    expect(vulnSegment).toBeDefined()
    expect(vulnSegment.value).toBe('Vulnerable')
    expect(vulnSegment.entry.fr).toBe('Vulnérable')
  })

  it('détecte plusieurs termes dans un même texte', () => {
    const text = 'Mark a Stress to deal physical damage within Close range.'
    const result = parseGlossaryTerms(text)
    const keywords = result.filter(s => s.type === 'keyword')
    expect(keywords.length).toBeGreaterThanOrEqual(2)
    const ids = keywords.map(k => k.entry.id)
    expect(ids).toContain('close')
  })

  it('détecte les expressions multi-mots (Very Close avant Close)', () => {
    const result = parseGlossaryTerms('Move to Very Close range.')
    const keywords = result.filter(s => s.type === 'keyword')
    // « Very Close » doit être détecté comme un seul terme, pas « Close »
    const veryClose = keywords.find(k => k.entry.id === 'very_close')
    expect(veryClose).toBeDefined()
    expect(veryClose.value).toBe('Very Close')
  })

  it('préserve l\'ordre et le texte entre les mots-clés', () => {
    const text = 'Gain a Hope and mark a Stress.'
    const result = parseGlossaryTerms(text)
    // Vérifier que les segments reconstitués donnent le texte original
    const rebuilt = result.map(s => s.value).join('')
    expect(rebuilt).toBe(text)
  })

  it('détecte les termes insensiblement à la casse', () => {
    const result = parseGlossaryTerms('The HOPE die is rolled with FEAR.')
    const keywords = result.filter(s => s.type === 'keyword')
    expect(keywords.length).toBeGreaterThanOrEqual(2)
  })

  it('détecte les aliases et fusionne les valeurs stat', () => {
    const result = parseGlossaryTerms('Character has 5 HP remaining.')
    // « 5 HP » est fusionné en stat-value (nombre + keyword combat)
    const statValues = result.filter(s => s.type === 'stat-value')
    expect(statValues).toHaveLength(1)
    expect(statValues[0].statNumber).toBe('5')
    expect(statValues[0].statUnit).toBe('HP')
  })

  it('ne détecte pas de faux positifs dans les sous-chaînes', () => {
    // « reclose » ne devrait pas déclencher « Close »
    const result = parseGlossaryTerms('The character will reclose the door.')
    const keywords = result.filter(s => s.type === 'keyword')
    const closeMatch = keywords.find(k => k.entry.id === 'close')
    expect(closeMatch).toBeUndefined()
  })

  it('ne détecte pas Action dans « réaction »', () => {
    const result = parseGlossaryTerms('Ceci est une réaction spéciale.')
    const keywords = result.filter(s => s.type === 'keyword')
    const actionMatch = keywords.find(k => k.entry.id === 'action')
    expect(actionMatch).toBeUndefined()
  })

  it('ne détecte pas de faux positifs après un caractère accentué', () => {
    // « préAction » ou « déStress » ne doivent pas matcher
    const result = parseGlossaryTerms('Le héros fait une préAction et déStress.')
    const keywords = result.filter(s => s.type === 'keyword')
    expect(keywords).toHaveLength(0)
  })

  it('détecte correctement Action quand il est un mot isolé', () => {
    const result = parseGlossaryTerms('This is an Action ability.')
    const keywords = result.filter(s => s.type === 'keyword')
    const actionMatch = keywords.find(k => k.entry.id === 'action')
    expect(actionMatch).toBeDefined()
    expect(actionMatch.value).toBe('Action')
  })

  it('détecte Spellcast Roll avec sa Difficulté', () => {
    const result = parseGlossaryTerms('Make a Spellcast Roll (15) against the target.')
    const keywords = result.filter(s => s.type === 'keyword')
    const spellcast = keywords.find(k => k.entry.id === 'spellcast_roll')
    expect(spellcast).toBeDefined()
  })

  it('gère le texte des capacités adversaires SRD', () => {
    const text = 'Relentless (3) - Passive: The creature can be spotlighted up to three times per GM turn. Spend Fear as usual to spotlight them.'
    const result = parseGlossaryTerms(text)
    const keywords = result.filter(s => s.type === 'keyword')
    const ids = keywords.map(k => k.entry.id)
    expect(ids).toContain('relentless')
    expect(ids).toContain('spend_a_fear')
  })
})

// ──────────────────────────────────────────────────────────
// Fonctions utilitaires
// ──────────────────────────────────────────────────────────

describe('Glossaire — lookupGlossaryTerm', () => {
  it('trouve un terme par son nom anglais', () => {
    const entry = lookupGlossaryTerm('Hope')
    expect(entry).toBeDefined()
    expect(entry.id).toBe('hope')
  })

  it('est insensible à la casse', () => {
    const entry = lookupGlossaryTerm('evasion')
    expect(entry).toBeDefined()
    expect(entry.id).toBe('evasion')
  })

  it('trouve un alias', () => {
    const entry = lookupGlossaryTerm('HP')
    expect(entry).toBeDefined()
    expect(entry.id).toBe('hit_points')
  })

  it('retourne undefined pour un terme inconnu', () => {
    expect(lookupGlossaryTerm('Zxqwerty')).toBeUndefined()
  })

  it('retourne undefined pour une entrée vide ou null', () => {
    expect(lookupGlossaryTerm('')).toBeUndefined()
    expect(lookupGlossaryTerm(null)).toBeUndefined()
  })
})

describe('Glossaire — getEntriesByCategory', () => {
  it('retourne les entrées de la catégorie meta', () => {
    const metaEntries = getEntriesByCategory('meta')
    expect(metaEntries.length).toBeGreaterThan(0)
    metaEntries.forEach(e => expect(e.category).toBe('meta'))
  })

  it('retourne les entrées de la catégorie trait', () => {
    const traitEntries = getEntriesByCategory('trait')
    expect(traitEntries.length).toBe(6)
    traitEntries.forEach(e => expect(e.category).toBe('trait'))
  })

  it('retourne les entrées de la catégorie range', () => {
    const rangeEntries = getEntriesByCategory('range')
    expect(rangeEntries.length).toBeGreaterThanOrEqual(5)
  })

  it('retourne un tableau vide pour une catégorie inexistante', () => {
    expect(getEntriesByCategory('nonexistent')).toEqual([])
  })
})

describe('Glossaire — getCategoryMeta', () => {
  it('retourne les métadonnées d\'une catégorie valide', () => {
    const meta = getCategoryMeta('combat')
    expect(meta).toBeDefined()
    expect(meta.label).toBe('Combat')
    expect(meta.color).toBe('var(--color-accent-fear)')
  })

  it('retourne undefined pour une catégorie inexistante', () => {
    expect(getCategoryMeta('nonexistent')).toBeUndefined()
  })
})

// ──────────────────────────────────────────────────────────
// Détection des patterns inline (dés, valeurs stat)
// ──────────────────────────────────────────────────────────

describe('Glossaire — parseGlossaryTerms (patterns inline)', () => {
  // ── Notations de dés ──
  it('détecte une notation de dé simple (1d4)', () => {
    const result = parseGlossaryTerms('Roll 1d4 for healing.')
    const dice = result.filter(s => s.type === 'dice')
    expect(dice).toHaveLength(1)
    expect(dice[0].value).toBe('1d4')
  })

  it('détecte une notation de dé avec modificateur (2d6+3)', () => {
    const result = parseGlossaryTerms('Deal 2d6+3 damage.')
    const dice = result.filter(s => s.type === 'dice')
    expect(dice).toHaveLength(1)
    expect(dice[0].value).toBe('2d6+3')
  })

  it('détecte une notation de dé avec espace autour du modificateur (1d12 + 2)', () => {
    const result = parseGlossaryTerms('Roll 1d12 + 2 for the attack.')
    const dice = result.filter(s => s.type === 'dice')
    expect(dice).toHaveLength(1)
    expect(dice[0].value).toBe('1d12 + 2')
  })

  it('détecte plusieurs notations de dés', () => {
    const result = parseGlossaryTerms('Roll 2d12 then 1d8 for bonus.')
    const dice = result.filter(s => s.type === 'dice')
    expect(dice).toHaveLength(2)
    expect(dice[0].value).toBe('2d12')
    expect(dice[1].value).toBe('1d8')
  })

  it('détecte un dé avec soustraction (1d6-1)', () => {
    const result = parseGlossaryTerms('Heal for 1d6-1.')
    const dice = result.filter(s => s.type === 'dice')
    expect(dice).toHaveLength(1)
    expect(dice[0].value).toBe('1d6-1')
  })

  // ── Valeurs de stat ──
  it('détecte une valeur HP', () => {
    const result = parseGlossaryTerms('The target takes 3 HP.')
    const stats = result.filter(s => s.type === 'stat-value')
    expect(stats).toHaveLength(1)
    expect(stats[0].statNumber).toBe('3')
    expect(stats[0].statUnit).toBe('HP')
  })

  it('détecte une valeur Stress', () => {
    // « take 2 Stress » n'est pas un alias complet, donc « 2 » + « Stress » keyword fusionnent
    const result = parseGlossaryTerms('The target takes 2 Stress from the blast.')
    const stats = result.filter(s => s.type === 'stat-value')
    expect(stats).toHaveLength(1)
    expect(stats[0].statNumber).toBe('2')
    expect(stats[0].statUnit).toBe('Stress')
  })

  it('détecte Hit Points (forme longue)', () => {
    const result = parseGlossaryTerms('Restore 5 Hit Points.')
    const stats = result.filter(s => s.type === 'stat-value')
    expect(stats).toHaveLength(1)
    expect(stats[0].statNumber).toBe('5')
    expect(stats[0].statUnit).toBe('Hit Points')
  })

  it('détecte Armor Slots', () => {
    const result = parseGlossaryTerms('Has 2 Armor Slots.')
    const stats = result.filter(s => s.type === 'stat-value')
    expect(stats).toHaveLength(1)
    expect(stats[0].statNumber).toBe('2')
    expect(stats[0].statUnit).toBe('Armor Slots')
  })

  // ── Combinaison glossaire + patterns inline ──
  it('détecte à la fois un keyword et un dé dans la même phrase', () => {
    const result = parseGlossaryTerms('Deal 1d8 physical damage at Close range.')
    const dice = result.filter(s => s.type === 'dice')
    const keywords = result.filter(s => s.type === 'keyword')
    expect(dice).toHaveLength(1)
    expect(dice[0].value).toBe('1d8')
    expect(keywords.length).toBeGreaterThanOrEqual(1)
  })

  it('préserve le texte original avec tous les types de segments', () => {
    const text = 'Roll 2d6+3 and mark 1 Stress at Very Close range.'
    const result = parseGlossaryTerms(text)
    const rebuilt = result.map(s => s.value).join('')
    expect(rebuilt).toBe(text)
  })

  it('ne détecte pas les nombres isolés comme des dés', () => {
    const result = parseGlossaryTerms('The target has 42 problems.')
    const dice = result.filter(s => s.type === 'dice')
    expect(dice).toHaveLength(0)
  })

  it('ne détecte pas les stat-values sans nombre', () => {
    // « HP » seul est traité par le glossaire (alias), pas comme stat-value
    const result = parseGlossaryTerms('Check your HP total.')
    const stats = result.filter(s => s.type === 'stat-value')
    expect(stats).toHaveLength(0)
  })
})

// ──────────────────────────────────────────────────────────
// Couverture des termes SRD clés
// ──────────────────────────────────────────────────────────

describe('Glossaire — Couverture SRD', () => {
  const index = buildGlossaryIndex()

  const essentialTerms = [
    // Méta
    'hope', 'fear', 'spotlight',
    // Traits
    'agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge',
    // Combat
    'hit points', 'stress', 'evasion', 'armor slots', 'proficiency', 'difficulty',
    // Conditions
    'vulnerable', 'restrained', 'hidden',
    // Portées
    'melee', 'very close', 'close', 'far', 'very far',
    // Dégâts
    'physical damage', 'magic damage',
    // Jets
    'action roll', 'reaction roll', 'spellcast roll', 'duality dice', 'advantage', 'disadvantage',
    // Repos
    'short rest', 'long rest', 'downtime',
    // Domaines
    'arcana', 'blade', 'bone', 'codex', 'grace', 'midnight', 'sage', 'splendor', 'valor',
    // Ressources
    'recall cost', 'loadout', 'vault', 'experience',
    // Progression
    'tier', 'advancement', 'scar'
  ]

  it.each(essentialTerms)('le terme SRD "%s" est dans l\'index', (term) => {
    expect(index.has(term)).toBe(true)
  })
})
