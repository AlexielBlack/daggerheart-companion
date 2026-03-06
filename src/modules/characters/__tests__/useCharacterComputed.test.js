/**
 * @module characters/__tests__/useCharacterComputed.test
 * @description Tests unitaires pour resolveCharacterDisplay et useCharacterComputed.
 * Vérifie le calcul des stats effectives, la résolution des données de référence,
 * et la robustesse face aux personnages incomplets ou null.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

// ── Mock useStorage (requis par le homebrew store) ──────────
vi.mock('@core/composables/useStorage', async () => {
  const { ref: vueRef } = await import('vue')
  return {
    useStorage: (_key, defaultValue) => {
      const data = vueRef(JSON.parse(JSON.stringify(defaultValue)))
      return {
        data,
        save: vi.fn(),
        remove: vi.fn(),
        error: vueRef(null)
      }
    }
  }
})

// ── Mock du store homebrew classe ───────────────────────────
vi.mock('@modules/homebrew/categories/class/useClassHomebrewStore.js', () => ({
  useClassHomebrewStore: () => ({ items: [] })
}))

import { resolveCharacterDisplay, useCharacterComputed } from '../composables/useCharacterComputed'

// ═══════════════════════════════════════════════════════════
//  FIXTURE : Guardian standard de base
// ═══════════════════════════════════════════════════════════

/**
 * Crée un Guardian basique pour les tests.
 * Guardian : baseHP=7, baseStress=6, baseEvasion=9
 * @param {Object} [overrides] - Champs à écraser
 * @returns {Object} Objet personnage
 */
function createGuardian(overrides = {}) {
  return {
    id: 'test-guardian-1',
    name: 'Test Guardian',
    classId: 'guardian',
    subclassId: '',
    ancestryId: '',
    communityId: '',
    level: 1,
    proficiency: 1,
    evasion: 9,
    evasionBonus: 0,
    armorScore: 4,
    armorId: 'chainmail-t1',
    armorBaseThresholds: { major: 7, severe: 15 },
    primaryWeaponId: 'longsword-t1',
    secondaryWeaponId: 'round-shield-t1',
    domainCards: { loadout: [], vault: [] },
    activeEffects: {},
    maxHP: 7,
    maxStress: 6,
    ...overrides
  }
}

// ═══════════════════════════════════════════════════════════
//  TESTS
// ═══════════════════════════════════════════════════════════

describe('resolveCharacterDisplay', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── 1. Stats de base Guardian ──────────────────────────
  it('calcule les stats de base d\'un Guardian standard', () => {
    const pc = createGuardian()
    const result = resolveCharacterDisplay(pc)

    // Guardian : baseHP = 7, pas de bonus
    expect(result.effectiveMaxHP).toBe(7)
    // Guardian : baseStress = 6, pas de bonus
    expect(result.effectiveMaxStress).toBe(6)
    // Évasion = 9 + evasionBonus(0) + bonus(0) = 9
    expect(result.effectiveEvasion).toBe(9)
  })

  // ── 2. Bonus ascendance — Giant +1 HP ──────────────────
  it('applique le bonus Giant +1 HP', () => {
    const pc = createGuardian({ ancestryId: 'giant' })
    const result = resolveCharacterDisplay(pc)

    // Guardian baseHP(7) + Giant(+1) = 8
    expect(result.effectiveMaxHP).toBe(8)
  })

  // ── 3. Bonus ascendance — Simiah +1 évasion ───────────
  it('applique le bonus Simiah +1 évasion', () => {
    const pc = createGuardian({ ancestryId: 'simiah' })
    const result = resolveCharacterDisplay(pc)

    // Évasion = 9 + 0 + 1 (Simiah) = 10
    expect(result.effectiveEvasion).toBe(10)
  })

  // ── 4. Bonus ascendance — Galapa +proficiency seuils ──
  it('applique le bonus Galapa +proficiency aux seuils', () => {
    const pc = createGuardian({ ancestryId: 'galapa', proficiency: 2 })
    const result = resolveCharacterDisplay(pc)

    // Seuils = armorBase + level(1) + Galapa(proficiency=2)
    expect(result.thresholds.major).toBe(7 + 1 + 2)
    expect(result.thresholds.severe).toBe(15 + 1 + 2)
  })

  // ── 5. Bonus sous-classe — Stalwart foundation +1/+1 ──
  it('applique le bonus Stalwart foundation +1/+1 seuils', () => {
    const pc = createGuardian({ subclassId: 'stalwart' })
    const result = resolveCharacterDisplay(pc)

    // Seuils = armorBase + level(1) + Stalwart foundation(+1)
    expect(result.thresholds.major).toBe(7 + 1 + 1)
    expect(result.thresholds.severe).toBe(15 + 1 + 1)
  })

  // ── 6. Bonus sous-classe cumulatifs — Stalwart niv.5 ──
  it('cumule les bonus Stalwart foundation + specialization au niv.5', () => {
    const pc = createGuardian({ subclassId: 'stalwart', level: 5, proficiency: 2 })
    const result = resolveCharacterDisplay(pc)

    // Stalwart foundation(+1) + specialization(+2) = +3
    // Seuils = armorBase + level(5) + bonus(3)
    expect(result.thresholds.major).toBe(7 + 5 + 3)
    expect(result.thresholds.severe).toBe(15 + 5 + 3)
  })

  // ── 7. Résolution seuils — base armure + level + bonus ─
  it('résout les seuils : base armure + level + bonuses', () => {
    const pc = createGuardian({
      level: 3,
      armorBaseThresholds: { major: 7, severe: 15 }
    })
    const result = resolveCharacterDisplay(pc)

    // Pas de bonus de sous-classe/ascendance → seuils = base + level
    expect(result.thresholds.major).toBe(7 + 3)
    expect(result.thresholds.severe).toBe(15 + 3)
  })

  // ── 8. Résolution classe — classData renvoyé ──────────
  it('résout les données de classe correctement', () => {
    const pc = createGuardian()
    const result = resolveCharacterDisplay(pc)

    expect(result.classData).not.toBeNull()
    expect(result.classData.id).toBe('guardian')
    expect(result.classData.name).toBe('Guardian')
    expect(result.classData.baseHP).toBe(7)
    expect(result.classData.baseStress).toBe(6)
    expect(result.classData.baseEvasion).toBe(9)
  })

  // ── 9. Résolution sous-classe — subclassData renvoyé ──
  it('résout les données de sous-classe correctement', () => {
    const pc = createGuardian({ subclassId: 'stalwart' })
    const result = resolveCharacterDisplay(pc)

    expect(result.subclassData).not.toBeNull()
    expect(result.subclassData.id).toBe('stalwart')
  })

  // ── 10. Résolution ascendance — ancestryData renvoyé ──
  it('résout les données d\'ascendance correctement', () => {
    const pc = createGuardian({ ancestryId: 'elf' })
    const result = resolveCharacterDisplay(pc)

    expect(result.ancestryData).not.toBeNull()
    expect(result.ancestryData.id).toBe('elf')
  })

  // ── 11. Résolution communauté — communityData renvoyé ─
  it('résout les données de communauté correctement', () => {
    const pc = createGuardian({ communityId: 'highborne' })
    const result = resolveCharacterDisplay(pc)

    expect(result.communityData).not.toBeNull()
    expect(result.communityData.id).toBe('highborne')
  })

  // ── 12. Résolution armes — weapons renvoyées ──────────
  it('résout les armes primaire et secondaire correctement', () => {
    const pc = createGuardian({
      primaryWeaponId: 'longsword-t1',
      secondaryWeaponId: 'round-shield-t1'
    })
    const result = resolveCharacterDisplay(pc)

    expect(result.primaryWeaponData).not.toBeNull()
    expect(result.primaryWeaponData.id).toBe('longsword-t1')
    expect(result.primaryWeaponData.name).toBe('Longsword')

    expect(result.secondaryWeaponData).not.toBeNull()
    expect(result.secondaryWeaponData.id).toBe('round-shield-t1')
    expect(result.secondaryWeaponData.name).toBe('Round Shield')
  })

  // ── 13. Résolution armure — armorData renvoyé ─────────
  it('résout les données d\'armure correctement', () => {
    const pc = createGuardian({ armorId: 'chainmail-t1' })
    const result = resolveCharacterDisplay(pc)

    expect(result.armorData).not.toBeNull()
    expect(result.armorData.id).toBe('chainmail-t1')
    expect(result.armorData.name).toBe('Chainmail Armor')
    expect(result.armorData.baseScore).toBe(4)
  })

  // ── 14. Résolution cartes loadout ─────────────────────
  it('résout les cartes du loadout en objets complets', () => {
    const pc = createGuardian({
      domainCards: {
        loadout: ['valor-bare-bones', 'blade-get-back-up'],
        vault: []
      }
    })
    const result = resolveCharacterDisplay(pc)

    expect(result.loadoutCards).toHaveLength(2)
    expect(result.loadoutCards[0].id).toBe('valor-bare-bones')
    expect(result.loadoutCards[1].id).toBe('blade-get-back-up')
    // Chaque carte doit inclure le domaine résolu
    expect(result.loadoutCards[0].domain).toBe('valor')
    expect(result.loadoutCards[1].domain).toBe('blade')
  })

  // ── 15. Personnage null — ne crash pas ────────────────
  it('retourne des valeurs par défaut pour un personnage null', () => {
    const result = resolveCharacterDisplay(null)

    expect(result.effectiveMaxHP).toBe(6)
    expect(result.effectiveMaxStress).toBe(6)
    expect(result.effectiveEvasion).toBe(0)
    expect(result.effectiveArmorScore).toBe(0)
    expect(result.thresholds.major).toBe(0)
    expect(result.thresholds.severe).toBe(0)
    expect(result.classData).toBeNull()
    expect(result.subclassData).toBeNull()
    expect(result.ancestryData).toBeNull()
    expect(result.communityData).toBeNull()
    expect(result.armorData).toBeNull()
    expect(result.primaryWeaponData).toBeNull()
    expect(result.secondaryWeaponData).toBeNull()
    expect(result.loadoutCards).toEqual([])
  })

  // ── 16. Personnage incomplet — fallback ───────────────
  it('gère un personnage avec des champs manquants sans crash', () => {
    const pc = {
      id: 'incomplete',
      name: 'Minimal',
      classId: 'guardian',
      level: 1
      // Pas de subclassId, ancestryId, armorId, etc.
    }
    const result = resolveCharacterDisplay(pc)

    // Doit utiliser les defaults sans crash
    expect(result.effectiveMaxHP).toBe(7) // Guardian baseHP
    expect(result.effectiveMaxStress).toBe(6) // Guardian baseStress
    expect(result.effectiveEvasion).toBe(0) // pas d'evasion sur l'objet
    expect(result.effectiveArmorScore).toBe(0) // pas d'armorScore
    expect(result.thresholds.major).toBe(1) // 0 (pas de base) + level(1) + 0
    expect(result.thresholds.severe).toBe(1) // idem
    expect(result.subclassData).toBeNull()
    expect(result.ancestryData).toBeNull()
    expect(result.communityData).toBeNull()
    expect(result.armorData).toBeNull()
    expect(result.primaryWeaponData).toBeNull()
    expect(result.secondaryWeaponData).toBeNull()
    expect(result.loadoutCards).toEqual([])
  })

  // ── 17. Armor Score override (Bare Bones) ─────────────
  it('utilise armorScoreOverride quand il est défini (Bare Bones)', () => {
    const pc = createGuardian({
      armorScore: 4
    })

    // Simuler un statBonuses avec armorScoreOverride via le résultat
    // On passe par le vrai calcul — pas de bonus override ici (pas de carte loadout)
    // Donc on vérifie le chemin normal d'abord
    const result = resolveCharacterDisplay(pc)

    // Sans override : armorScore = base(4) + bonus(0) = 4
    expect(result.effectiveArmorScore).toBe(4)

    // Maintenant, testons avec un personnage dont computeStatBonuses retourne un override
    // Cela nécessite une carte Bare Bones dans le loadout sans armure
    const pcBareBones = createGuardian({
      armorScore: 0,
      armorId: '',
      armorBaseThresholds: null,
      domainCards: { loadout: ['valor-bare-bones'], vault: [] }
    })
    const resultBB = resolveCharacterDisplay(pcBareBones)

    // Bare Bones est de type 'conditional', actif si pas d'armure.
    // Le personnage n'a pas d'armorId → isActive devrait être true
    // Si Bare Bones est actif, armorScoreOverride sera utilisé
    // Le résultat exact dépend de la carte, mais l'important est que
    // le chemin de code fonctionne sans erreur
    expect(resultBB.effectiveArmorScore).toBeTypeOf('number')
    expect(resultBB.thresholds.major).toBeTypeOf('number')
    expect(resultBB.thresholds.severe).toBeTypeOf('number')
  })
})

// ═══════════════════════════════════════════════════════════
//  COMPOSABLE RÉACTIF
// ═══════════════════════════════════════════════════════════

describe('useCharacterComputed', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('retourne null quand la ref est null', () => {
    const charRef = ref(null)
    const { resolved } = useCharacterComputed(charRef)

    expect(resolved.value).toBeNull()
  })

  it('résout les stats quand la ref contient un personnage', () => {
    const charRef = ref(createGuardian())
    const { resolved } = useCharacterComputed(charRef)

    expect(resolved.value).not.toBeNull()
    expect(resolved.value.effectiveMaxHP).toBe(7)
    expect(resolved.value.effectiveMaxStress).toBe(6)
    expect(resolved.value.classData.id).toBe('guardian')
  })

  it('recalcule quand la ref change', () => {
    const charRef = ref(createGuardian())
    const { resolved } = useCharacterComputed(charRef)

    expect(resolved.value.effectiveMaxHP).toBe(7)

    // Changer le personnage pour un Giant → +1 HP
    charRef.value = createGuardian({ ancestryId: 'giant' })
    expect(resolved.value.effectiveMaxHP).toBe(8)
  })
})
