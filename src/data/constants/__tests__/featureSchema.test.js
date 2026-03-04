/**
 * @vitest
 * @description Tests du schéma unifié FeatureDescriptor.
 * Couvre les constantes, la validation, le parseur de coûts,
 * la normalisation de portées, et le normaliseur multi-format.
 */

import { describe, it, expect } from 'vitest'
import {
  // Constantes
  ACTIVATION_TYPES,
  ACTIVATION_META,
  COST_TYPES,
  COST_META,
  FEATURE_TRAITS,
  TRAIT_META,
  RANGE_VALUES,
  RANGE_META,
  FREQUENCY_VALUES,
  FREQUENCY_META,
  STANDARD_CONDITIONS,
  // Validation
  validateCost,
  validateConditions,
  validateFeatureDescriptor,
  // Normalisation
  normalizeRange,
  parseCostFromText,
  normalizeFeature
} from '@data/constants/featureSchema.js'

// ═══════════════════════════════════════════════════════════
//  Constantes
// ═══════════════════════════════════════════════════════════

describe('Constantes — FeatureSchema', () => {
  it('définit 3 types d\'activation', () => {
    expect(ACTIVATION_TYPES).toEqual(['passive', 'action', 'reaction'])
  })

  it('chaque type d\'activation a des métadonnées complètes', () => {
    for (const type of ACTIVATION_TYPES) {
      const meta = ACTIVATION_META[type]
      expect(meta, `métadonnées manquantes pour ${type}`).toBeDefined()
      expect(meta.label).toBeTruthy()
      expect(meta.emoji).toBeTruthy()
      expect(meta.color).toMatch(/^#[0-9a-f]{6}$/)
      expect(meta.description).toBeTruthy()
    }
  })

  it('définit 5 types de coût', () => {
    expect(COST_TYPES).toEqual(['hope', 'stress', 'fear', 'armor', 'free'])
  })

  it('chaque type de coût a des métadonnées', () => {
    for (const type of COST_TYPES) {
      const meta = COST_META[type]
      expect(meta, `métadonnées manquantes pour ${type}`).toBeDefined()
      expect(meta.label).toBeTruthy()
      expect(meta.emoji).toBeTruthy()
      expect(meta.color).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('définit 7 traits de feature', () => {
    expect(FEATURE_TRAITS).toHaveLength(7)
    expect(FEATURE_TRAITS).toContain('spellcast')
  })

  it('chaque trait a des métadonnées', () => {
    for (const trait of FEATURE_TRAITS) {
      expect(TRAIT_META[trait]).toBeDefined()
      expect(TRAIT_META[trait].label).toBeTruthy()
      expect(TRAIT_META[trait].emoji).toBeTruthy()
    }
  })

  it('définit 6 valeurs de portée', () => {
    expect(RANGE_VALUES).toEqual(['self', 'melee', 'veryClose', 'close', 'far', 'veryFar'])
  })

  it('chaque portée a des métadonnées avec un ordre', () => {
    for (const range of RANGE_VALUES) {
      expect(RANGE_META[range]).toBeDefined()
      expect(typeof RANGE_META[range].order).toBe('number')
    }
  })

  it('les portées sont ordonnées correctement', () => {
    const orders = RANGE_VALUES.map((r) => RANGE_META[r].order)
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThan(orders[i - 1])
    }
  })

  it('définit 5 fréquences', () => {
    expect(FREQUENCY_VALUES).toHaveLength(5)
  })

  it('chaque fréquence a des métadonnées', () => {
    for (const freq of FREQUENCY_VALUES) {
      expect(FREQUENCY_META[freq]).toBeDefined()
      expect(FREQUENCY_META[freq].label).toBeTruthy()
    }
  })

  it('définit 3 conditions standard', () => {
    expect(STANDARD_CONDITIONS).toEqual(['vulnerable', 'restrained', 'hidden'])
  })
})

// ═══════════════════════════════════════════════════════════
//  validateCost
// ═══════════════════════════════════════════════════════════

describe('validateCost', () => {
  it('accepte null / undefined', () => {
    expect(validateCost(null).valid).toBe(true)
    expect(validateCost(undefined).valid).toBe(true)
  })

  it('accepte un coût valide', () => {
    expect(validateCost({ type: 'hope', amount: 3 }).valid).toBe(true)
    expect(validateCost({ type: 'stress', amount: 1 }).valid).toBe(true)
    expect(validateCost({ type: 'free', amount: 0 }).valid).toBe(true)
  })

  it('rejette un type de coût invalide', () => {
    const result = validateCost({ type: 'gold', amount: 1 })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('cost.type invalide')
  })

  it('rejette un montant négatif', () => {
    const result = validateCost({ type: 'hope', amount: -1 })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('cost.amount')
  })

  it('rejette un montant non entier', () => {
    const result = validateCost({ type: 'hope', amount: 1.5 })
    expect(result.valid).toBe(false)
  })

  it('rejette un tableau au lieu d\'un objet', () => {
    const result = validateCost([{ type: 'hope', amount: 1 }])
    expect(result.valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  validateConditions
// ═══════════════════════════════════════════════════════════

describe('validateConditions', () => {
  it('accepte null / undefined', () => {
    expect(validateConditions(null).valid).toBe(true)
    expect(validateConditions(undefined).valid).toBe(true)
  })

  it('accepte des conditions valides', () => {
    expect(validateConditions({ applies: ['vulnerable'], clears: ['hidden'] }).valid).toBe(true)
    expect(validateConditions({ applies: ['restrained'] }).valid).toBe(true)
    expect(validateConditions({ clears: ['vulnerable'] }).valid).toBe(true)
  })

  it('accepte des conditions spéciales (non standard)', () => {
    // Le SRD permet des conditions custom comme « En Feu », « Maudit »
    expect(validateConditions({ applies: ['poisoned', 'cursed'] }).valid).toBe(true)
  })

  it('rejette un tableau au lieu d\'un objet', () => {
    expect(validateConditions(['vulnerable']).valid).toBe(false)
  })

  it('rejette des valeurs vides dans applies', () => {
    const result = validateConditions({ applies: [''] })
    expect(result.valid).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  validateFeatureDescriptor
// ═══════════════════════════════════════════════════════════

describe('validateFeatureDescriptor', () => {
  /** Feature minimale valide */
  const VALID_MINIMAL = {
    name: 'Rune Ward',
    description: 'Un bibelot protecteur imprégné de magie.',
    tags: ['défensif']
  }

  /** Feature complète valide */
  const VALID_FULL = {
    name: 'Earth Eruption',
    description: 'Faites jaillir le Fouisseur du sol.',
    tags: ['offensif'],
    activationType: 'action',
    cost: { type: 'stress', amount: 1 },
    trait: 'agility',
    range: 'veryClose',
    frequency: 'atWill',
    conditions: { applies: ['vulnerable'], clears: [] },
    trigger: null
  }

  it('accepte une feature minimale', () => {
    const result = validateFeatureDescriptor(VALID_MINIMAL)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('accepte une feature complète', () => {
    const result = validateFeatureDescriptor(VALID_FULL)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejette null', () => {
    expect(validateFeatureDescriptor(null).valid).toBe(false)
  })

  it('rejette un tableau', () => {
    expect(validateFeatureDescriptor([]).valid).toBe(false)
  })

  it('rejette un name vide', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, name: '' })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('name')
  })

  it('rejette une description manquante', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, description: undefined })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('description')
  })

  it('rejette des tags vides', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, tags: [] })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('tags')
  })

  it('rejette des tags invalides', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, tags: ['combat'] })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('tags')
  })

  it('rejette un activationType invalide', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, activationType: 'bonus' })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('activationType')
  })

  it('accepte un activationType null', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, activationType: null })
    expect(result.valid).toBe(true)
  })

  it('rejette un trait invalide', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, trait: 'charisma' })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('trait')
  })

  it('rejette un range invalide', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, range: 'Close' })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('range')
  })

  it('rejette une frequency invalide', () => {
    const result = validateFeatureDescriptor({ ...VALID_MINIMAL, frequency: 'daily' })
    expect(result.valid).toBe(false)
  })

  it('accumule les erreurs multiples', () => {
    const result = validateFeatureDescriptor({
      name: '',
      description: '',
      tags: [],
      activationType: 'invalid',
      cost: { type: 'gold', amount: -1 }
    })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
  })

  // ── Mode strict ──

  describe('mode strict', () => {
    it('exige activationType en mode strict', () => {
      const result = validateFeatureDescriptor(VALID_MINIMAL, { strict: true })
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('activationType'))).toBe(true)
    })

    it('exige cost en mode strict', () => {
      const feat = { ...VALID_MINIMAL, activationType: 'passive' }
      const result = validateFeatureDescriptor(feat, { strict: true })
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('cost'))).toBe(true)
    })

    it('accepte une feature complète en mode strict', () => {
      const result = validateFeatureDescriptor(VALID_FULL, { strict: true })
      expect(result.valid).toBe(true)
    })
  })
})

// ═══════════════════════════════════════════════════════════
//  normalizeRange
// ═══════════════════════════════════════════════════════════

describe('normalizeRange', () => {
  it('convertit les formats hérités', () => {
    expect(normalizeRange('Melee')).toBe('melee')
    expect(normalizeRange('Very Close')).toBe('veryClose')
    expect(normalizeRange('Close')).toBe('close')
    expect(normalizeRange('Far')).toBe('far')
    expect(normalizeRange('Very Far')).toBe('veryFar')
  })

  it('accepte les formats déjà normalisés', () => {
    expect(normalizeRange('melee')).toBe('melee')
    expect(normalizeRange('veryClose')).toBe('veryClose')
    expect(normalizeRange('self')).toBe('self')
  })

  it('retourne null pour les valeurs inconnues', () => {
    expect(normalizeRange('Extreme')).toBe(null)
    expect(normalizeRange(null)).toBe(null)
    expect(normalizeRange(undefined)).toBe(null)
  })
})

// ═══════════════════════════════════════════════════════════
//  parseCostFromText
// ═══════════════════════════════════════════════════════════

describe('parseCostFromText', () => {
  it('parse « Cochez un Stress »', () => {
    expect(parseCostFromText('Cochez un Stress')).toEqual({ type: 'stress', amount: 1 })
  })

  it('parse « Marquez un Stress »', () => {
    expect(parseCostFromText('Marquez un Stress')).toEqual({ type: 'stress', amount: 1 })
  })

  it('parse « Mark a Stress »', () => {
    expect(parseCostFromText('Mark a Stress')).toEqual({ type: 'stress', amount: 1 })
  })

  it('parse « Dépensez une Peur »', () => {
    expect(parseCostFromText('Dépensez une Peur')).toEqual({ type: 'fear', amount: 1 })
  })

  it('parse « Spend a Fear »', () => {
    expect(parseCostFromText('Spend a Fear')).toEqual({ type: 'fear', amount: 1 })
  })

  it('parse « Spend 2 Fear »', () => {
    expect(parseCostFromText('Spend 2 Fear')).toEqual({ type: 'fear', amount: 2 })
  })

  it('parse « Dépensez 3 Espoir »', () => {
    expect(parseCostFromText('Dépensez 3 Espoir')).toEqual({ type: 'hope', amount: 3 })
  })

  it('parse « Spend 1 Hope »', () => {
    expect(parseCostFromText('Spend 1 Hope')).toEqual({ type: 'hope', amount: 1 })
  })

  it('parse « Cochez un Emplacement d\'armure »', () => {
    expect(parseCostFromText('Cochez un Emplacement d\'armure')).toEqual({ type: 'armor', amount: 1 })
  })

  it('parse « Mark an Armor Slot »', () => {
    expect(parseCostFromText('Mark an Armor Slot')).toEqual({ type: 'armor', amount: 1 })
  })

  it('retourne null pour un texte sans coût reconnu', () => {
    expect(parseCostFromText('Faites une attaque')).toBe(null)
    expect(parseCostFromText(null)).toBe(null)
    expect(parseCostFromText('')).toBe(null)
  })

  it('parse un coût intégré dans une phrase plus longue', () => {
    expect(parseCostFromText('Dépensez une Peur pour invoquer un élémentaire')).toEqual({ type: 'fear', amount: 1 })
    expect(parseCostFromText('Cochez un Stress pour repositionner')).toEqual({ type: 'stress', amount: 1 })
  })
})

// ═══════════════════════════════════════════════════════════
//  normalizeFeature — Format 1 : FeatureDescriptor complet
// ═══════════════════════════════════════════════════════════

describe('normalizeFeature — FeatureDescriptor complet', () => {
  it('retourne un descriptor avec defaults pour les champs manquants', () => {
    const result = normalizeFeature({
      name: 'Rune Ward',
      description: 'Un bibelot protecteur.',
      tags: ['défensif']
    })
    expect(result.name).toBe('Rune Ward')
    expect(result.tags).toEqual(['défensif'])
    expect(result.activationType).toBe(null)
    expect(result.cost).toBe(null)
    expect(result.trait).toBe(null)
    expect(result.range).toBe(null)
    expect(result.frequency).toBe(null)
    expect(result.conditions).toBe(null)
    expect(result.trigger).toBe(null)
  })

  it('préserve tous les champs d\'un descriptor complet', () => {
    const input = {
      name: 'Earth Eruption',
      description: 'Jaillir du sol.',
      tags: ['offensif'],
      activationType: 'action',
      cost: { type: 'stress', amount: 1 },
      trait: 'agility',
      range: 'veryClose',
      frequency: 'atWill',
      conditions: { applies: ['vulnerable'] },
      trigger: null
    }
    const result = normalizeFeature(input)
    expect(result.name).toBe('Earth Eruption')
    expect(result.activationType).toBe('action')
    expect(result.cost).toEqual({ type: 'stress', amount: 1 })
    expect(result.trait).toBe('agility')
    expect(result.range).toBe('veryClose')
    expect(result.frequency).toBe('atWill')
    expect(result.conditions).toEqual({ applies: ['vulnerable'] })
  })
})

// ═══════════════════════════════════════════════════════════
//  normalizeFeature — Format 2 : adversaire/environnement
// ═══════════════════════════════════════════════════════════

describe('normalizeFeature — format adversaire', () => {
  it('convertit un feature d\'adversaire SRD', () => {
    const input = {
      name: 'Earth Eruption',
      type: 'action',
      cost: 'Cochez un Stress',
      description: 'Faites jaillir le Fouisseur du sol.',
      tags: ['offensif']
    }
    const result = normalizeFeature(input)
    expect(result.activationType).toBe('action')
    expect(result.cost).toEqual({ type: 'stress', amount: 1 })
    expect(result.name).toBe('Earth Eruption')
    expect(result.tags).toEqual(['offensif'])
  })

  it('convertit un feature d\'environnement avec fearCost', () => {
    const input = {
      name: 'Defiler',
      type: 'action',
      fearCost: 1,
      description: 'Invoquez un élémentaire.',
      tags: ['offensif']
    }
    const result = normalizeFeature(input)
    expect(result.activationType).toBe('action')
    expect(result.cost).toEqual({ type: 'fear', amount: 1 })
  })

  it('convertit un feature passive sans coût', () => {
    const input = {
      name: 'Relentless (3)',
      type: 'passive',
      description: 'Peut être mis sous le projecteur 3 fois.',
      tags: ['utilitaire']
    }
    const result = normalizeFeature(input)
    expect(result.activationType).toBe('passive')
    expect(result.cost).toBe(null)
  })
})

// ═══════════════════════════════════════════════════════════
//  normalizeFeature — Format 3 : ancestry/communauté
// ═══════════════════════════════════════════════════════════

describe('normalizeFeature — format ancestry/communauté', () => {
  it('convertit un topFeature d\'ancestry', () => {
    const input = {
      name: 'Scales',
      description: 'Vos écailles agissent comme une protection naturelle.',
      tags: ['défensif']
    }
    const result = normalizeFeature(input, { source: 'ancestry' })
    expect(result.name).toBe('Scales')
    expect(result.tags).toEqual(['défensif'])
    expect(result.source).toBe('ancestry')
  })

  it('convertit une feature de communauté', () => {
    const input = {
      name: 'Privilege',
      description: 'Avantage sur les jets pour fréquenter les nobles.',
      tags: ['social']
    }
    const result = normalizeFeature(input, { source: 'community' })
    expect(result.name).toBe('Privilege')
    expect(result.source).toBe('community')
  })
})

// ═══════════════════════════════════════════════════════════
//  normalizeFeature — Format 4 : string brut (classes)
// ═══════════════════════════════════════════════════════════

describe('normalizeFeature — string brut (classes)', () => {
  it('extrait name et description depuis « Name : description »', () => {
    const input = 'Attack of Opportunity : Quand un adversaire en Mêlée quitte la portée, jet de réaction.'
    const result = normalizeFeature(input, { tags: ['offensif', 'défensif'] })
    expect(result.name).toBe('Attack of Opportunity')
    expect(result.description).toBe('Quand un adversaire en Mêlée quitte la portée, jet de réaction.')
    expect(result.tags).toEqual(['offensif', 'défensif'])
  })

  it('utilise le contexte pour les tags par défaut', () => {
    const result = normalizeFeature('Unstoppable : description...', { tags: ['offensif'] })
    expect(result.tags).toEqual(['offensif'])
  })

  it('gère une string sans deux-points', () => {
    const result = normalizeFeature('Une feature sans séparateur clair dans le texte')
    expect(result.name).toBeTruthy()
    expect(result.description).toBeTruthy()
  })

  it('utilise le contexte activationType', () => {
    const result = normalizeFeature('Feat : Desc', { activationType: 'passive' })
    expect(result.activationType).toBe('passive')
  })
})

// ═══════════════════════════════════════════════════════════
//  normalizeFeature — Format 5 : domain card
// ═══════════════════════════════════════════════════════════

describe('normalizeFeature — domain card', () => {
  it('convertit une carte de domaine avec champ feature string', () => {
    const input = {
      id: 'arcana-rune-ward',
      name: 'Rune Ward',
      level: 1,
      type: 'spell',
      recallCost: 0,
      tags: ['défensif'],
      feature: 'Vous possédez un bibelot profondément personnel.'
    }
    const result = normalizeFeature(input)
    expect(result.name).toBe('Rune Ward')
    expect(result.description).toBe('Vous possédez un bibelot profondément personnel.')
    expect(result.tags).toEqual(['défensif'])
    expect(result.source).toBe('domainCard')
  })

  it('ne confond pas type "spell" avec activationType', () => {
    const input = {
      name: 'Wall Walk',
      type: 'spell',
      tags: ['utilitaire'],
      feature: 'Grimpez sur les murs.'
    }
    const result = normalizeFeature(input)
    // 'spell' n'est pas un ACTIVATION_TYPE, donc activationType doit être null
    expect(result.activationType).toBe(null)
  })
})

// ═══════════════════════════════════════════════════════════
//  normalizeFeature — cas limites
// ═══════════════════════════════════════════════════════════

describe('normalizeFeature — cas limites', () => {
  it('gère null en entrée', () => {
    const result = normalizeFeature(null)
    expect(result.name).toBe('Inconnu')
    expect(result.tags).toEqual([])
  })

  it('gère undefined en entrée', () => {
    const result = normalizeFeature(undefined)
    expect(result.name).toBe('Inconnu')
  })

  it('normalise une portée héritée au format adversaire', () => {
    const result = normalizeFeature({
      name: 'Test',
      description: 'Test',
      tags: ['offensif'],
      range: 'Very Close'
    })
    expect(result.range).toBe('veryClose')
  })

  it('ne mute pas l\'objet d\'entrée', () => {
    const input = { name: 'Test', description: 'Desc', tags: ['offensif'] }
    const tagsBefore = [...input.tags]
    normalizeFeature(input)
    expect(input.tags).toEqual(tagsBefore)
  })

  it('crée une copie indépendante des tags', () => {
    const input = { name: 'Test', description: 'Desc', tags: ['offensif'] }
    const result = normalizeFeature(input)
    result.tags.push('défensif')
    expect(input.tags).toEqual(['offensif'])
  })

  it('priorise cost objet sur cost texte', () => {
    const result = normalizeFeature({
      name: 'Test',
      description: 'Desc',
      tags: ['offensif'],
      cost: { type: 'hope', amount: 2 }
    })
    expect(result.cost).toEqual({ type: 'hope', amount: 2 })
  })

  it('priorise cost texte sur fearCost quand cost est texte', () => {
    const result = normalizeFeature({
      name: 'Test',
      description: 'Desc',
      tags: ['offensif'],
      cost: 'Dépensez 3 Espoir',
      fearCost: 1
    })
    expect(result.cost).toEqual({ type: 'hope', amount: 3 })
  })

  it('utilise fearCost quand pas de cost', () => {
    const result = normalizeFeature({
      name: 'Test',
      description: 'Desc',
      tags: ['offensif'],
      fearCost: 2
    })
    expect(result.cost).toEqual({ type: 'fear', amount: 2 })
  })
})
