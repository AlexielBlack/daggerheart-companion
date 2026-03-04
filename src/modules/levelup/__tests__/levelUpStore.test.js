// @vitest-environment jsdom
/**
 * @module levelup/__tests__/levelUpStore.test
 * @description Tests du store Pinia levelUpStore (wizard de level up).
 *
 * Couvre :
 *   - Ouverture/fermeture du wizard
 *   - Navigation entre étapes
 *   - Sélection et validation des advancements
 *   - Sélection de carte de domaine
 *   - Finalisation complète (intégration characterStore)
 *   - Rollback (annulation)
 *   - Cas limites et sécurité
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────────
const mockStore = { value: [] }
vi.mock('@core/composables/useStorage', () => ({
  useStorage: () => ({
    data: mockStore,
    save: (val) => { mockStore.value = JSON.parse(JSON.stringify(val)) },
    error: null
  })
}))

import { useCharacterStore } from '@modules/characters/stores/characterStore'
import { useLevelUpStore, WIZARD_STEPS, STEP_ORDER } from '../stores/levelUpStore'
import { ADVANCEMENT_TYPES } from '../composables/useLevelUpRules'

// ── Helpers ──────────────────────────────────────────────

/**
 * Crée un personnage Warrior dans le characterStore et le sélectionne.
 * @param {Object} characterStore
 * @param {Object} overrides - Champs à écraser via updateField
 * @returns {string} ID du personnage créé
 */
function setupCharacter(charStore, overrides = {}) {
  const id = charStore.createCharacter('warrior')
  for (const [key, value] of Object.entries(overrides)) {
    charStore.updateField(key, value)
  }
  return id
}

/**
 * Effectue un level up rapide : ouvre le wizard, fait les sélections minimales, finalise.
 * @param {Object} levelUpStore
 * @param {Object} options
 */
function quickLevelUp(luStore, options = {}) {
  const {
    advancements = [
      { type: ADVANCEMENT_TYPES.HP, tier: 2 },
      { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
    ],
    domainCardId = 'valor-1'
  } = options

  luStore.open()
  luStore.confirmTierAchievement()
  luStore.nextStep()
  luStore.setAdvancements(advancements)
  luStore.nextStep()
  luStore.confirmThresholds()
  luStore.nextStep()
  luStore.selectDomainCard(domainCardId)
  return luStore.finalize()
}

// ═══════════════════════════════════════════════════════════
//  Tests
// ═══════════════════════════════════════════════════════════

describe('levelUpStore', () => {
  let charStore
  let luStore

  beforeEach(() => {
    mockStore.value = []
    setActivePinia(createPinia())
    charStore = useCharacterStore()
    luStore = useLevelUpStore()
  })

  // ── 1. Constantes ───────────────────────────────────────

  describe('constantes', () => {
    it('exporte les étapes du wizard', () => {
      expect(WIZARD_STEPS.TIER_ACHIEVEMENT).toBe('tier_achievement')
      expect(WIZARD_STEPS.ADVANCEMENTS).toBe('advancements')
      expect(WIZARD_STEPS.THRESHOLDS).toBe('thresholds')
      expect(WIZARD_STEPS.DOMAIN_CARD).toBe('domain_card')
    })

    it('STEP_ORDER a 4 étapes dans le bon ordre', () => {
      expect(STEP_ORDER).toHaveLength(4)
      expect(STEP_ORDER[0]).toBe(WIZARD_STEPS.TIER_ACHIEVEMENT)
      expect(STEP_ORDER[3]).toBe(WIZARD_STEPS.DOMAIN_CARD)
    })

    it('le store expose les constantes', () => {
      expect(luStore.WIZARD_STEPS).toBe(WIZARD_STEPS)
      expect(luStore.STEP_ORDER).toBe(STEP_ORDER)
      expect(luStore.STEP_LABELS).toBeDefined()
    })
  })

  // ── 2. État initial ─────────────────────────────────────

  describe('état initial', () => {
    it('le wizard est fermé au départ', () => {
      expect(luStore.isOpen).toBe(false)
    })

    it('l\'étape initiale est tier_achievement', () => {
      expect(luStore.currentStep).toBe(WIZARD_STEPS.TIER_ACHIEVEMENT)
    })

    it('aucune sélection n\'est faite', () => {
      expect(luStore.tierAchievementConfirmed).toBe(false)
      expect(luStore.selectedAdvancements).toEqual([])
      expect(luStore.thresholdsConfirmed).toBe(false)
      expect(luStore.selectedDomainCardId).toBeNull()
    })

    it('pas d\'erreur', () => {
      expect(luStore.wizardError).toBe('')
    })
  })

  // ── 3. Ouverture / Fermeture ────────────────────────────

  describe('ouverture / fermeture', () => {
    it('ouvre le wizard si un personnage est sélectionné et peut level up', () => {
      setupCharacter(charStore)
      const result = luStore.open()
      expect(result).toBe(true)
      expect(luStore.isOpen).toBe(true)
    })

    it('refuse d\'ouvrir si aucun personnage sélectionné', () => {
      const result = luStore.open()
      expect(result).toBe(false)
      expect(luStore.isOpen).toBe(false)
    })

    it('refuse d\'ouvrir si le personnage est au niveau max', () => {
      setupCharacter(charStore, { level: 10 })
      const result = luStore.open()
      expect(result).toBe(false)
      expect(luStore.wizardError).toBeTruthy()
    })

    it('ferme le wizard et réinitialise', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.confirmTierAchievement()
      luStore.close()

      expect(luStore.isOpen).toBe(false)
      expect(luStore.tierAchievementConfirmed).toBe(false)
      expect(luStore.currentStep).toBe(WIZARD_STEPS.TIER_ACHIEVEMENT)
    })

    it('ouvrir réinitialise les sélections précédentes', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.confirmTierAchievement()
      luStore.close()

      luStore.open()
      expect(luStore.tierAchievementConfirmed).toBe(false)
      expect(luStore.selectedAdvancements).toEqual([])
    })
  })

  // ── 4. Getters dérivés ──────────────────────────────────

  describe('getters dérivés', () => {
    it('targetLevel = level + 1', () => {
      setupCharacter(charStore)
      expect(luStore.targetLevel).toBe(2)
    })

    it('targetTier est correct pour différents niveaux', () => {
      setupCharacter(charStore)
      expect(luStore.targetTier).toBe(2) // level 1 → 2 = tier 2

      charStore.updateField('level', 4)
      expect(luStore.targetTier).toBe(3) // level 4 → 5 = tier 3

      charStore.updateField('level', 7)
      expect(luStore.targetTier).toBe(4) // level 7 → 8 = tier 4
    })

    it('hasTierAchievementStep est true pour level → 2', () => {
      setupCharacter(charStore) // level 1
      expect(luStore.hasTierAchievementStep).toBe(true)
    })

    it('hasTierAchievementStep est false pour level → 3', () => {
      setupCharacter(charStore, { level: 2 })
      expect(luStore.hasTierAchievementStep).toBe(false)
    })

    it('tierAchievement au niveau 2 : newExperience + proficiency, pas de clear', () => {
      setupCharacter(charStore)
      expect(luStore.tierAchievement).toEqual({
        newExperience: true,
        proficiencyIncrease: true,
        traitsCleared: false
      })
    })

    it('le summary contient les bonnes informations', () => {
      setupCharacter(charStore)
      charStore.updateField('name', 'Aldric')
      luStore.open()

      const s = luStore.summary
      expect(s.characterName).toBe('Aldric')
      expect(s.currentLevel).toBe(1)
      expect(s.targetLevel).toBe(2)
    })
  })

  // ── 5. Navigation ───────────────────────────────────────

  describe('navigation entre étapes', () => {
    beforeEach(() => {
      setupCharacter(charStore)
      luStore.open()
    })

    it('commence à l\'étape 0 (tier achievement)', () => {
      expect(luStore.currentStepIndex).toBe(0)
      expect(luStore.isFirstStep).toBe(true)
    })

    it('nextStep avance si l\'étape courante est valide', () => {
      luStore.confirmTierAchievement()
      const result = luStore.nextStep()
      expect(result).toBe(true)
      expect(luStore.currentStep).toBe(WIZARD_STEPS.ADVANCEMENTS)
    })

    it('nextStep refuse si l\'étape courante est invalide', () => {
      // Pas de confirmation du tier achievement
      const result = luStore.nextStep()
      expect(result).toBe(false)
      expect(luStore.currentStep).toBe(WIZARD_STEPS.TIER_ACHIEVEMENT)
    })

    it('prevStep revient en arrière', () => {
      luStore.confirmTierAchievement()
      luStore.nextStep()
      expect(luStore.currentStep).toBe(WIZARD_STEPS.ADVANCEMENTS)

      const result = luStore.prevStep()
      expect(result).toBe(true)
      expect(luStore.currentStep).toBe(WIZARD_STEPS.TIER_ACHIEVEMENT)
    })

    it('prevStep retourne false à la première étape', () => {
      expect(luStore.prevStep()).toBe(false)
    })

    it('nextStep retourne false à la dernière étape', () => {
      luStore.confirmTierAchievement()
      luStore.nextStep() // → advancements
      luStore.setAdvancements([
        { type: ADVANCEMENT_TYPES.HP, tier: 2 },
        { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
      ])
      luStore.nextStep() // → thresholds
      luStore.confirmThresholds()
      luStore.nextStep() // → domain_card
      expect(luStore.isLastStep).toBe(true)
      expect(luStore.nextStep()).toBe(false)
    })

    it('goToStep vérifie que les étapes précédentes sont complètes', () => {
      // Essayer de sauter à l'étape 2 sans valider l'étape 0
      expect(luStore.goToStep(WIZARD_STEPS.ADVANCEMENTS)).toBe(false)

      // Valider l'étape 0 puis aller à l'étape 1
      luStore.confirmTierAchievement()
      expect(luStore.goToStep(WIZARD_STEPS.ADVANCEMENTS)).toBe(true)
    })

    it('goToStep refuse un stepId invalide', () => {
      expect(luStore.goToStep('invalid_step')).toBe(false)
    })
  })

  // ── 6. Tier Achievement (sans tier achievement) ─────────

  describe('tier achievement — étape auto-validée', () => {
    it('l\'étape est automatiquement complète quand pas de tier achievement', () => {
      setupCharacter(charStore, { level: 2 }) // → niveau 3, pas de TA
      luStore.open()
      expect(luStore.hasTierAchievementStep).toBe(false)
      expect(luStore.isTierAchievementComplete).toBe(true)
    })

    it('nextStep passe directement quand pas de tier achievement', () => {
      setupCharacter(charStore, { level: 2 })
      luStore.open()
      const result = luStore.nextStep()
      expect(result).toBe(true)
      expect(luStore.currentStep).toBe(WIZARD_STEPS.ADVANCEMENTS)
    })
  })

  // ── 7. Advancements ─────────────────────────────────────

  describe('sélection d\'advancements', () => {
    beforeEach(() => {
      setupCharacter(charStore)
      luStore.open()
    })

    it('addAdvancement ajoute une sélection', () => {
      const result = luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      expect(result).toBe(true)
      expect(luStore.selectedAdvancements).toHaveLength(1)
      expect(luStore.advancementPointsUsed).toBe(1)
    })

    it('addAdvancement refuse si déjà 2 points', () => {
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.STRESS, tier: 2 })
      const result = luStore.addAdvancement({ type: ADVANCEMENT_TYPES.EVASION, tier: 2 })
      expect(result).toBe(false)
      expect(luStore.selectedAdvancements).toHaveLength(2)
    })

    it('removeAdvancement retire par index', () => {
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.STRESS, tier: 2 })
      luStore.removeAdvancement(0)
      expect(luStore.selectedAdvancements).toHaveLength(1)
      expect(luStore.selectedAdvancements[0].type).toBe(ADVANCEMENT_TYPES.STRESS)
    })

    it('setAdvancements remplace toute la sélection', () => {
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      luStore.setAdvancements([
        { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
        { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
      ])
      expect(luStore.selectedAdvancements).toHaveLength(2)
      expect(luStore.selectedAdvancements[0].type).toBe(ADVANCEMENT_TYPES.EVASION)
    })

    it('advancementPointsRemaining décroît correctement', () => {
      expect(luStore.advancementPointsRemaining).toBe(2)
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      expect(luStore.advancementPointsRemaining).toBe(1)
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.STRESS, tier: 2 })
      expect(luStore.advancementPointsRemaining).toBe(0)
    })

    it('advancementValidation est invalide sans sélection', () => {
      expect(luStore.advancementValidation.valid).toBe(false)
    })

    it('advancementValidation est valide avec 2 choix corrects', () => {
      luStore.setAdvancements([
        { type: ADVANCEMENT_TYPES.HP, tier: 2 },
        { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
      ])
      expect(luStore.advancementValidation.valid).toBe(true)
    })

    it('addAdvancement refuse un type/tier invalide', () => {
      const result = luStore.addAdvancement({ type: 'unknown', tier: 2 })
      expect(result).toBe(false)
    })

    it('addAdvancement refuse un objet incomplet', () => {
      expect(luStore.addAdvancement(null)).toBe(false)
      expect(luStore.addAdvancement({})).toBe(false)
      expect(luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP })).toBe(false)
    })

    it('ne mute pas l\'objet original passé à addAdvancement', () => {
      const adv = { type: ADVANCEMENT_TYPES.HP, tier: 2 }
      luStore.addAdvancement(adv)
      expect(luStore.selectedAdvancements[0]).not.toBe(adv)
      expect(luStore.selectedAdvancements[0]).toEqual(adv)
    })

    it('gère le double-slot : refuse d\'ajouter si déjà un choix simple', () => {
      // D'abord aller en tier 3 pour avoir accès au doubleSlot
      charStore.updateField('level', 4)
      luStore.close()
      luStore.open()

      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      const result = luStore.addAdvancement({ type: ADVANCEMENT_TYPES.PROFICIENCY, tier: 3 })
      expect(result).toBe(false)
    })

    it('gère le double-slot : refuse d\'ajouter un simple après un doubleSlot', () => {
      charStore.updateField('level', 4)
      luStore.close()
      luStore.open()

      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.PROFICIENCY, tier: 3 })
      const result = luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      expect(result).toBe(false)
    })

    it('availableAdvancementOptions retourne les options du bon tier', () => {
      const options = luStore.availableAdvancementOptions
      // Niveau 1 → 2 = tier 2 seulement
      const tiers = [...new Set(options.map((o) => o.tier))]
      expect(tiers).toEqual([2])
    })
  })

  // ── 8. Validation par étape ─────────────────────────────

  describe('validation par étape', () => {
    beforeEach(() => {
      setupCharacter(charStore)
      luStore.open()
    })

    it('isCurrentStepValid reflète l\'état de l\'étape courante', () => {
      // Étape 0 non confirmée
      expect(luStore.isCurrentStepValid).toBe(false)
      luStore.confirmTierAchievement()
      expect(luStore.isCurrentStepValid).toBe(true)
    })

    it('isDomainCardComplete est false sans carte', () => {
      expect(luStore.isDomainCardComplete).toBe(false)
      luStore.selectDomainCard('valor-1')
      expect(luStore.isDomainCardComplete).toBe(true)
    })

    it('canFinalize requiert toutes les étapes', () => {
      expect(luStore.canFinalize).toBe(false)

      luStore.confirmTierAchievement()
      expect(luStore.canFinalize).toBe(false)

      luStore.setAdvancements([
        { type: ADVANCEMENT_TYPES.HP, tier: 2 },
        { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
      ])
      expect(luStore.canFinalize).toBe(false)

      luStore.confirmThresholds()
      expect(luStore.canFinalize).toBe(false)

      luStore.selectDomainCard('valor-1')
      expect(luStore.canFinalize).toBe(true)
    })
  })

  // ── 9. Finalisation ─────────────────────────────────────

  describe('finalisation', () => {
    it('applique un level up complet', () => {
      setupCharacter(charStore)
      const result = quickLevelUp(luStore)

      expect(result.success).toBe(true)
      const char = charStore.selectedCharacter
      expect(char.level).toBe(2)
      expect(char.maxHP).toBe(7) // 6 + 1 (advancement HP)
      expect(char.maxStress).toBe(7) // 6 + 1 (advancement Stress)
      expect(char.proficiency).toBe(2) // tier achievement
      expect(char.experiences).toHaveLength(3) // 2 + 1 (tier achievement)
      expect(char.levelHistory).toHaveLength(1)
    })

    it('la carte de domaine est ajoutée au vault', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore, { domainCardId: 'valor-1' })

      const char = charStore.selectedCharacter
      expect(char.domainCards.vault).toContain('valor-1')
    })

    it('ferme le wizard après finalisation', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore)
      expect(luStore.isOpen).toBe(false)
    })

    it('refuse de finaliser si pas toutes les étapes', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.confirmTierAchievement()
      // Pas d'advancements sélectionnés
      const result = luStore.finalize()
      expect(result.success).toBe(false)
    })

    it('refuse de finaliser sans personnage', () => {
      const result = luStore.finalize()
      expect(result.success).toBe(false)
    })

    it('applique un level up avec traits', () => {
      setupCharacter(charStore)
      const result = quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'finesse'] },
          { type: ADVANCEMENT_TYPES.HP, tier: 2 }
        ]
      })

      expect(result.success).toBe(true)
      const char = charStore.selectedCharacter
      // Warrior suggested: agility=2, finesse=0
      expect(char.traits.agility).toBe(3)
      expect(char.traits.finesse).toBe(1)
      expect(char.markedTraits).toContain('agility')
      expect(char.markedTraits).toContain('finesse')
    })

    it('applique un level up avec evasion', () => {
      setupCharacter(charStore)
      const result = quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
          { type: ADVANCEMENT_TYPES.HP, tier: 2 }
        ]
      })

      expect(result.success).toBe(true)
      const char = charStore.selectedCharacter
      expect(char.evasion).toBe(12) // Warrior base = 11 + 1
    })

    it('persiste après finalisation', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore)
      // Vérifier que mockStore a été mis à jour
      expect(mockStore.value).toHaveLength(1)
      expect(mockStore.value[0].level).toBe(2)
    })
  })

  // ── 10. Multi level ups ─────────────────────────────────

  describe('level ups successifs', () => {
    it('applique 3 level ups en séquence', () => {
      setupCharacter(charStore)

      // Level 2
      quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.HP, tier: 2 },
          { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
        ],
        domainCardId: 'valor-1'
      })
      expect(charStore.selectedCharacter.level).toBe(2)

      // Level 3
      quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
          { type: ADVANCEMENT_TYPES.HP, tier: 2 }
        ],
        domainCardId: 'blade-2'
      })
      expect(charStore.selectedCharacter.level).toBe(3)

      // Level 4
      quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.STRESS, tier: 2 },
          { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'strength'] }
        ],
        domainCardId: 'valor-3'
      })
      expect(charStore.selectedCharacter.level).toBe(4)
      expect(charStore.selectedCharacter.levelHistory).toHaveLength(3)
    })
  })

  // ── 11. Rollback ────────────────────────────────────────

  describe('rollback', () => {
    it('annule le dernier level up', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore)

      expect(charStore.selectedCharacter.level).toBe(2)

      const result = luStore.rollback()
      expect(result.success).toBe(true)
      expect(charStore.selectedCharacter.level).toBe(1)
      expect(charStore.selectedCharacter.maxHP).toBe(6)
      expect(charStore.selectedCharacter.proficiency).toBe(1)
    })

    it('retire la carte de domaine lors du rollback', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore, { domainCardId: 'valor-1' })

      expect(charStore.selectedCharacter.domainCards.vault).toContain('valor-1')

      luStore.rollback()
      expect(charStore.selectedCharacter.domainCards.vault).not.toContain('valor-1')
    })

    it('rollback multiple en séquence', () => {
      setupCharacter(charStore)

      quickLevelUp(luStore, { domainCardId: 'valor-1' })
      quickLevelUp(luStore, { domainCardId: 'blade-2' })
      expect(charStore.selectedCharacter.level).toBe(3)

      luStore.rollback()
      expect(charStore.selectedCharacter.level).toBe(2)
      expect(charStore.selectedCharacter.domainCards.vault).not.toContain('blade-2')

      luStore.rollback()
      expect(charStore.selectedCharacter.level).toBe(1)
      expect(charStore.selectedCharacter.domainCards.vault).not.toContain('valor-1')
    })

    it('refuse le rollback sans historique', () => {
      setupCharacter(charStore)
      const result = luStore.rollback()
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('refuse le rollback sans personnage', () => {
      const result = luStore.rollback()
      expect(result.success).toBe(false)
    })

    it('rollbackStatus est réactif', () => {
      setupCharacter(charStore)
      expect(luStore.rollbackStatus.canRollback).toBe(false)

      quickLevelUp(luStore)
      expect(luStore.rollbackStatus.canRollback).toBe(true)

      luStore.rollback()
      expect(luStore.rollbackStatus.canRollback).toBe(false)
    })

    it('persiste après rollback', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore)
      luStore.rollback()
      expect(mockStore.value[0].level).toBe(1)
    })
  })

  // ── 12. Rollback avec traits et clear ───────────────────

  describe('rollback — cas complexes', () => {
    it('restaure les traits après rollback', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.TRAITS, tier: 2, traits: ['agility', 'finesse'] },
          { type: ADVANCEMENT_TYPES.HP, tier: 2 }
        ]
      })

      const char = charStore.selectedCharacter
      expect(char.traits.agility).toBe(3)
      expect(char.markedTraits).toContain('agility')

      luStore.rollback()
      expect(char.traits.agility).toBe(2)
      expect(char.markedTraits).not.toContain('agility')
    })

    it('restaure l\'evasion après rollback', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.EVASION, tier: 2 },
          { type: ADVANCEMENT_TYPES.HP, tier: 2 }
        ]
      })

      expect(charStore.selectedCharacter.evasion).toBe(12)
      luStore.rollback()
      expect(charStore.selectedCharacter.evasion).toBe(11)
    })
  })

  // ── 13. Scénario sans tier achievement ──────────────────

  describe('scénario : level 2 → 3 (pas de tier achievement)', () => {
    it('le wizard fonctionne sans tier achievement', () => {
      setupCharacter(charStore, { level: 2, proficiency: 2 })
      // Ajouter une 3e expérience comme un level 2 l'aurait fait
      charStore.updateField('experiences', [
        { name: 'Combat', bonus: 0 },
        { name: 'Exploration', bonus: 0 },
        { name: '', bonus: 2 }
      ])

      luStore.open()

      // Pas de tier achievement → auto-validé
      expect(luStore.hasTierAchievementStep).toBe(false)
      expect(luStore.isTierAchievementComplete).toBe(true)

      // On peut aller directement aux advancements
      luStore.nextStep()
      expect(luStore.currentStep).toBe(WIZARD_STEPS.ADVANCEMENTS)

      luStore.setAdvancements([
        { type: ADVANCEMENT_TYPES.HP, tier: 2 },
        { type: ADVANCEMENT_TYPES.STRESS, tier: 2 }
      ])
      luStore.nextStep()
      luStore.confirmThresholds()
      luStore.nextStep()
      luStore.selectDomainCard('valor-2')

      const result = luStore.finalize()
      expect(result.success).toBe(true)

      const char = charStore.selectedCharacter
      expect(char.level).toBe(3)
      // Pas de tier achievement → proficiency inchangée
      expect(char.proficiency).toBe(2)
      // Pas de nouvelle expérience ajoutée par tier achievement
      expect(char.experiences).toHaveLength(3)
    })
  })

  // ── 14. Carte domaine advancement vs étape 4 ───────────

  describe('cartes de domaine dans advancements', () => {
    it('la carte de l\'advancement domain_card est ajoutée au vault', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.DOMAIN_CARD, tier: 2, cardId: 'grace-2' },
          { type: ADVANCEMENT_TYPES.HP, tier: 2 }
        ],
        domainCardId: 'valor-1'
      })

      const char = charStore.selectedCharacter
      expect(char.domainCards.vault).toContain('grace-2')
      expect(char.domainCards.vault).toContain('valor-1')
    })

    it('le rollback retire les cartes des advancements', () => {
      setupCharacter(charStore)
      quickLevelUp(luStore, {
        advancements: [
          { type: ADVANCEMENT_TYPES.DOMAIN_CARD, tier: 2, cardId: 'grace-2' },
          { type: ADVANCEMENT_TYPES.HP, tier: 2 }
        ],
        domainCardId: 'valor-1'
      })

      luStore.rollback()
      const char = charStore.selectedCharacter
      expect(char.domainCards.vault).not.toContain('grace-2')
      expect(char.domainCards.vault).not.toContain('valor-1')
    })
  })

  // ── 15. Sécurité & edge cases ───────────────────────────

  describe('sécurité et cas limites', () => {
    it('finalize refuse avec des advancements invalides', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.confirmTierAchievement()
      // Mettre des advancements invalides en force
      luStore.setAdvancements([
        { type: ADVANCEMENT_TYPES.HP, tier: 2 },
        { type: ADVANCEMENT_TYPES.HP, tier: 2 },
        { type: ADVANCEMENT_TYPES.HP, tier: 2 } // trop
      ])
      luStore.confirmThresholds()
      luStore.selectDomainCard('valor-1')

      // canFinalize sera false car advancementValidation est invalide
      expect(luStore.canFinalize).toBe(false)
    })

    it('open/close est idempotent', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.open() // re-open → reset
      expect(luStore.tierAchievementConfirmed).toBe(false)

      luStore.close()
      luStore.close() // double close
      expect(luStore.isOpen).toBe(false)
    })

    it('removeAdvancement ignore un index hors limites', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.addAdvancement({ type: ADVANCEMENT_TYPES.HP, tier: 2 })
      luStore.removeAdvancement(5) // hors limites
      luStore.removeAdvancement(-1) // négatif
      expect(luStore.selectedAdvancements).toHaveLength(1)
    })

    it('selectDomainCard accepte null', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.selectDomainCard('valor-1')
      expect(luStore.isDomainCardComplete).toBe(true)

      luStore.selectDomainCard(null)
      expect(luStore.isDomainCardComplete).toBe(false)
    })

    it('setAdvancements gère un argument non-tableau', () => {
      setupCharacter(charStore)
      luStore.open()
      luStore.setAdvancements(null)
      expect(luStore.selectedAdvancements).toEqual([])
    })
  })
})
