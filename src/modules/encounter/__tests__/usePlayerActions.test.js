/**
 * Tests unitaires pour le composable usePlayerActions.
 *
 * Le composable recoit deux refs : pcRef (donnees du PJ) et allFeaturesRef
 * (liste de features collectees). Il expose des computed purs :
 *   - spellcastInfo     : { trait, modifier, label } ou null
 *   - enrichedFeatures  : features + isDomainCard, isSpell, resolvedTraitModifier, resolvedTraitLabel
 *   - domainCardCount   : nombre de domain cards
 *   - spellCount        : nombre de spells
 *
 * Pattern : effectScope + ref() pour wrapper les appels au composable.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ref, effectScope } from 'vue'
import { usePlayerActions } from '../composables/usePlayerActions'

// ── Donnees mock ─────────────────────────────────────

/** PJ avec spellcast (Druid) */
const mockPcWithSpell = {
  id: 'pc-1', name: 'Alice', classId: 'druid', className: 'Druid',
  subclassId: 'warden', level: 3,
  traits: { agility: 1, strength: 0, finesse: 2, instinct: 3, presence: 1, knowledge: 0 },
  spellcastTrait: 'Instinct'
}

/** PJ sans spellcast (Guardian) */
const mockPcNoSpell = {
  id: 'pc-2', name: 'Bob', classId: 'guardian', className: 'Guardian',
  subclassId: 'stalwart', level: 2,
  traits: { agility: 0, strength: 3, finesse: 0, instinct: 1, presence: 1, knowledge: 0 },
  spellcastTrait: null
}

/** Features mock representant un mix de sources */
const mockFeatures = [
  { name: 'Healing Touch', source: 'domain', sourceLabel: 'Codex', tags: ['utilitaire'], activationType: 'action', trait: null, cost: { type: 'hope', amount: 1 }, cardId: 'card-1' },
  { name: 'Shield of Faith', source: 'domain', sourceLabel: 'Arcana', tags: ['defensif'], activationType: 'action', trait: 'Presence', cost: { type: 'free', amount: 0 }, cardId: 'card-2' },
  { name: 'Rage', source: 'class', sourceLabel: 'Guardian', tags: ['offensif'], activationType: 'action', trait: 'Strength', cost: { type: 'free', amount: 0 } },
  { name: 'Iron Will', source: 'subclass', sourceLabel: 'Stalwart', tags: ['defensif'], activationType: 'passive', trait: null, cost: { type: 'free', amount: 0 } },
  { name: 'Flame Bolt', source: 'domain', sourceLabel: 'Arcana', tags: ['offensif'], activationType: 'action', trait: null, cost: { type: 'hope', amount: 2 }, cardId: 'card-3' }
]

// ── Suite de tests ───────────────────────────────────

describe('usePlayerActions', () => {
  let scope
  let pcRef
  let allFeaturesRef
  let result

  beforeEach(() => {
    pcRef = ref(null)
    allFeaturesRef = ref([])
    scope = effectScope()
    scope.run(() => {
      result = usePlayerActions(pcRef, allFeaturesRef)
    })
  })

  afterEach(() => {
    if (scope) {
      scope.stop()
      scope = null
      result = null
    }
  })

  // ── spellcastInfo ──────────────────────────────────

  describe('spellcastInfo', () => {
    it('retourne null quand pc est null', () => {
      expect(result.spellcastInfo.value).toBeNull()
    })

    it('retourne null quand pc.spellcastTrait est null (Guardian/Warrior)', () => {
      pcRef.value = { ...mockPcNoSpell }
      expect(result.spellcastInfo.value).toBeNull()
    })

    it('resout correctement le trait et le modificateur', () => {
      pcRef.value = { ...mockPcWithSpell }
      const info = result.spellcastInfo.value
      expect(info).toEqual({
        trait: 'Instinct',
        modifier: 3,
        label: 'Spellcast: Instinct +3'
      })
    })

    it('gere le casing du trait pour la resolution', () => {
      pcRef.value = {
        ...mockPcWithSpell,
        spellcastTrait: 'Strength',
        traits: { agility: 0, strength: 2, finesse: 0, instinct: 0, presence: 0, knowledge: 0 }
      }
      const info = result.spellcastInfo.value
      expect(info.modifier).toBe(2)
      expect(info.trait).toBe('Strength')
    })
  })

  // ── enrichedFeatures ───────────────────────────────

  describe('enrichedFeatures', () => {
    it('retourne un tableau vide quand les features sont vides', () => {
      pcRef.value = { ...mockPcWithSpell }
      allFeaturesRef.value = []
      expect(result.enrichedFeatures.value).toEqual([])
    })

    it('marque les domain cards avec isDomainCard: true', () => {
      pcRef.value = { ...mockPcWithSpell }
      allFeaturesRef.value = [...mockFeatures]

      const enriched = result.enrichedFeatures.value
      const healingTouch = enriched.find(f => f.name === 'Healing Touch')
      const rage = enriched.find(f => f.name === 'Rage')

      expect(healingTouch.isDomainCard).toBe(true)
      expect(rage.isDomainCard).toBe(false)
    })

    it('marque les spells quand la feature est une domain card et pc a un spellcastTrait', () => {
      pcRef.value = { ...mockPcWithSpell }
      allFeaturesRef.value = [...mockFeatures]

      const enriched = result.enrichedFeatures.value
      const healingTouch = enriched.find(f => f.name === 'Healing Touch')
      expect(healingTouch.isSpell).toBe(true)
    })

    it('ne marque pas isSpell sans spellcastTrait meme pour une domain card', () => {
      pcRef.value = { ...mockPcNoSpell }
      allFeaturesRef.value = [...mockFeatures]

      const enriched = result.enrichedFeatures.value
      const healingTouch = enriched.find(f => f.name === 'Healing Touch')
      expect(healingTouch.isSpell).toBe(false)
    })

    it('resout resolvedTraitModifier depuis feature.trait', () => {
      pcRef.value = {
        ...mockPcWithSpell,
        traits: { agility: 2, strength: 0, finesse: 0, instinct: 3, presence: 1, knowledge: 0 }
      }
      allFeaturesRef.value = [
        { name: 'Quick Strike', source: 'class', sourceLabel: 'Ranger', tags: [], activationType: 'action', trait: 'Agility', cost: { type: 'free', amount: 0 } }
      ]

      const enriched = result.enrichedFeatures.value
      expect(enriched[0].resolvedTraitModifier).toBe(2)
    })

    it('utilise spellcastTrait pour domain card sans trait explicite', () => {
      pcRef.value = { ...mockPcWithSpell }
      allFeaturesRef.value = [
        { name: 'Healing Touch', source: 'domain', sourceLabel: 'Codex', tags: [], activationType: 'action', trait: null, cost: { type: 'hope', amount: 1 }, cardId: 'card-1' }
      ]

      const enriched = result.enrichedFeatures.value
      // spellcastTrait est Instinct, pc.traits.instinct = 3
      expect(enriched[0].resolvedTraitModifier).toBe(3)
    })

    it('formate resolvedTraitLabel correctement avec modificateur positif', () => {
      pcRef.value = {
        ...mockPcWithSpell,
        traits: { agility: 2, strength: 0, finesse: 0, instinct: 3, presence: 1, knowledge: 0 }
      }
      allFeaturesRef.value = [
        { name: 'Quick Strike', source: 'class', sourceLabel: 'Ranger', tags: [], activationType: 'action', trait: 'Agility', cost: { type: 'free', amount: 0 } }
      ]

      const enriched = result.enrichedFeatures.value
      expect(enriched[0].resolvedTraitLabel).toBe('Agility +2')
    })

    it('formate resolvedTraitLabel correctement avec modificateur zero', () => {
      pcRef.value = {
        ...mockPcWithSpell,
        traits: { agility: 0, strength: 0, finesse: 0, instinct: 3, presence: 1, knowledge: 0 }
      }
      allFeaturesRef.value = [
        { name: 'Quick Strike', source: 'class', sourceLabel: 'Ranger', tags: [], activationType: 'action', trait: 'Agility', cost: { type: 'free', amount: 0 } }
      ]

      const enriched = result.enrichedFeatures.value
      expect(enriched[0].resolvedTraitLabel).toBe('Agility +0')
    })

    it('retourne resolvedTraitModifier null pour une feature non-domain sans trait', () => {
      pcRef.value = { ...mockPcWithSpell }
      allFeaturesRef.value = [
        { name: 'Iron Will', source: 'subclass', sourceLabel: 'Stalwart', tags: [], activationType: 'passive', trait: null, cost: { type: 'free', amount: 0 } }
      ]

      const enriched = result.enrichedFeatures.value
      expect(enriched[0].resolvedTraitModifier).toBeNull()
    })
  })

  // ── domainCardCount ────────────────────────────────

  describe('domainCardCount', () => {
    it('compte correctement les domain cards', () => {
      pcRef.value = { ...mockPcWithSpell }
      allFeaturesRef.value = [...mockFeatures]

      // mockFeatures contient 3 domain cards (Healing Touch, Shield of Faith, Flame Bolt)
      expect(result.domainCardCount.value).toBe(3)
    })
  })

  // ── spellCount ─────────────────────────────────────

  describe('spellCount', () => {
    it('compte correctement les spells quand pc a un spellcastTrait', () => {
      pcRef.value = { ...mockPcWithSpell }
      allFeaturesRef.value = [...mockFeatures]

      // 3 domain cards + spellcastTrait non null → 3 spells
      expect(result.spellCount.value).toBe(3)
    })
  })

  // ── Reactivite ─────────────────────────────────────

  describe('reactivite', () => {
    it('met a jour spellcastInfo quand le PJ change', () => {
      // Initialement null
      expect(result.spellcastInfo.value).toBeNull()

      // Changer le PJ vers un caster
      pcRef.value = { ...mockPcWithSpell }
      expect(result.spellcastInfo.value).toEqual({
        trait: 'Instinct',
        modifier: 3,
        label: 'Spellcast: Instinct +3'
      })

      // Changer vers un non-caster
      pcRef.value = { ...mockPcNoSpell }
      expect(result.spellcastInfo.value).toBeNull()
    })
  })
})
