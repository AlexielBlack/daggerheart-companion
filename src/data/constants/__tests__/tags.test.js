/**
 * @vitest
 * @description Validation du système de tags sur toutes les données Daggerheart.
 * Vérifie que chaque feature taggée utilise des tags valides
 * et que les tableaux parallèles (classFeatureTags, foundationTags, etc.)
 * ont la bonne longueur.
 */

import { describe, it, expect } from 'vitest'
import { ALL_TAGS, validateTags, TAG_META } from '@data/constants/tags.js'
import { tier1, tier2, tier3, tier4 } from '@data/adversaries/index.js'
import { CLASSES } from '@data/classes/index.js'
import { SUBCLASSES } from '@data/subclasses/index.js'
import { SRD_ANCESTRIES, CUSTOM_ANCESTRIES, TRANSFORMATIONS } from '@data/ancestries/index.js'
import { COMMUNITIES } from '@data/communities/index.js'
import { arcana } from '@data/domains/arcana.js'
import { blade } from '@data/domains/blade.js'
import { bone } from '@data/domains/bone.js'
import { codex } from '@data/domains/codex.js'
import { grace } from '@data/domains/grace.js'
import { midnight } from '@data/domains/midnight.js'
import { sage } from '@data/domains/sage.js'
import { splendor } from '@data/domains/splendor.js'
import { valor } from '@data/domains/valor.js'
import { PRIMARY_WEAPONS } from '@data/equipment/primaryWeapons.js'
import { SECONDARY_WEAPONS } from '@data/equipment/secondaryWeapons.js'
import { ARMOR } from '@data/equipment/armor.js'
import { LOOT } from '@data/equipment/loot.js'
import { CONSUMABLES } from '@data/equipment/consumables.js'

const ALL_DOMAINS = [arcana, blade, bone, codex, grace, midnight, sage, splendor, valor]
const ALL_ANCESTRIES = [...SRD_ANCESTRIES, ...CUSTOM_ANCESTRIES, ...TRANSFORMATIONS]

// ═══════════════════════════════════════════════════════════
//  Constantes de tags
// ═══════════════════════════════════════════════════════════

describe('Constantes de tags', () => {
  it('définit exactement 4 tags', () => {
    expect(ALL_TAGS).toHaveLength(4)
  })

  it('chaque tag a des métadonnées complètes', () => {
    for (const tag of ALL_TAGS) {
      const meta = TAG_META[tag]
      expect(meta).toBeDefined()
      expect(meta.label).toBeTruthy()
      expect(meta.emoji).toBeTruthy()
      expect(meta.color).toMatch(/^#[0-9a-f]{6}$/)
      expect(meta.description).toBeTruthy()
    }
  })

  it('validateTags accepte les tags valides', () => {
    expect(validateTags(['offensif'])).toBe(true)
    expect(validateTags(['offensif', 'défensif'])).toBe(true)
    expect(validateTags(ALL_TAGS)).toBe(true)
  })

  it('validateTags rejette les tags invalides', () => {
    expect(validateTags(['invalide'])).toBe(false)
    expect(validateTags('offensif')).toBe(false)
    expect(validateTags(null)).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  Cartes de domaine
// ═══════════════════════════════════════════════════════════

describe('Tags — Cartes de domaine', () => {
  it.each(ALL_DOMAINS.map((d) => [d.name, d]))('domaine %s : chaque carte a des tags valides', (_name, domain) => {
    for (const card of domain.cards) {
      expect(card.tags, `${card.id} devrait avoir un champ tags`).toBeDefined()
      expect(Array.isArray(card.tags), `${card.id}.tags devrait être un tableau`).toBe(true)
      expect(card.tags.length, `${card.id}.tags ne devrait pas être vide`).toBeGreaterThan(0)
      expect(validateTags(card.tags), `${card.id} contient un tag invalide : ${card.tags}`).toBe(true)
    }
  })

  it('189 cartes de domaine ont des tags', () => {
    const total = ALL_DOMAINS.reduce((sum, d) => sum + d.cards.length, 0)
    const tagged = ALL_DOMAINS.reduce((sum, d) => sum + d.cards.filter((c) => c.tags?.length > 0).length, 0)
    expect(tagged).toBe(total)
    expect(total).toBe(189)
  })
})

// ═══════════════════════════════════════════════════════════
//  Ancestries
// ═══════════════════════════════════════════════════════════

describe('Tags — Ancestries', () => {
  it('chaque ancestry a des tags sur topFeature et bottomFeature', () => {
    for (const a of ALL_ANCESTRIES) {
      if (a.topFeature) {
        expect(a.topFeature.tags, `${a.id}.topFeature devrait avoir des tags`).toBeDefined()
        expect(validateTags(a.topFeature.tags), `${a.id}.topFeature tags invalides`).toBe(true)
      }
      if (a.bottomFeature) {
        expect(a.bottomFeature.tags, `${a.id}.bottomFeature devrait avoir des tags`).toBeDefined()
        expect(validateTags(a.bottomFeature.tags), `${a.id}.bottomFeature tags invalides`).toBe(true)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Communautés
// ═══════════════════════════════════════════════════════════

describe('Tags — Communautés', () => {
  it('chaque communauté a des tags sur sa feature', () => {
    for (const c of COMMUNITIES) {
      expect(c.feature.tags, `${c.id}.feature devrait avoir des tags`).toBeDefined()
      expect(validateTags(c.feature.tags), `${c.id}.feature tags invalides`).toBe(true)
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Classes
// ═══════════════════════════════════════════════════════════

describe('Tags — Classes', () => {
  it('chaque classe a hopeFeatureTags et classFeatureTags', () => {
    for (const cls of CLASSES) {
      expect(cls.hopeFeatureTags, `${cls.id} devrait avoir hopeFeatureTags`).toBeDefined()
      expect(validateTags(cls.hopeFeatureTags), `${cls.id}.hopeFeatureTags invalides`).toBe(true)

      expect(cls.classFeatureTags, `${cls.id} devrait avoir classFeatureTags`).toBeDefined()
      expect(Array.isArray(cls.classFeatureTags)).toBe(true)
      expect(
        cls.classFeatureTags.length,
        `${cls.id}.classFeatureTags devrait avoir autant d'éléments que classFeatures`
      ).toBe(cls.classFeatures.length)

      for (const ft of cls.classFeatureTags) {
        expect(validateTags(ft), `${cls.id} classFeatureTags contient des tags invalides`).toBe(true)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Sous-classes
// ═══════════════════════════════════════════════════════════

describe('Tags — Sous-classes', () => {
  it('chaque sous-classe a des tags parallèles par tier', () => {
    for (const [className, subs] of Object.entries(SUBCLASSES)) {
      for (const sub of subs) {
        for (const tier of ['foundation', 'specialization', 'mastery']) {
          const tagKey = `${tier}Tags`
          const features = sub[tier]
          const tags = sub[tagKey]

          expect(tags, `${className}/${sub.id}.${tagKey} devrait exister`).toBeDefined()
          expect(Array.isArray(tags)).toBe(true)
          expect(
            tags.length,
            `${className}/${sub.id}.${tagKey} (${tags.length}) devrait correspondre à ${tier} (${features.length})`
          ).toBe(features.length)

          for (const ft of tags) {
            expect(validateTags(ft), `${className}/${sub.id}.${tagKey} contient des tags invalides`).toBe(true)
          }
        }
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Équipement
// ═══════════════════════════════════════════════════════════

describe('Tags — Équipement', () => {
  it('chaque arme primaire a des tags', () => {
    for (const w of PRIMARY_WEAPONS) {
      expect(w.tags, `${w.id} devrait avoir des tags`).toBeDefined()
      expect(validateTags(w.tags), `${w.id} tags invalides`).toBe(true)
    }
  })

  it('chaque arme secondaire a des tags', () => {
    for (const w of SECONDARY_WEAPONS) {
      expect(w.tags, `${w.id} devrait avoir des tags`).toBeDefined()
      expect(validateTags(w.tags), `${w.id} tags invalides`).toBe(true)
    }
  })

  it('chaque armure a des tags', () => {
    for (const a of ARMOR) {
      expect(a.tags, `${a.id} devrait avoir des tags`).toBeDefined()
      expect(validateTags(a.tags), `${a.id} tags invalides`).toBe(true)
    }
  })

  it('chaque loot a des tags', () => {
    for (const l of LOOT) {
      expect(l.tags, `${l.id} devrait avoir des tags`).toBeDefined()
      expect(validateTags(l.tags), `${l.id} tags invalides`).toBe(true)
    }
  })

  it('chaque consommable a des tags', () => {
    for (const c of CONSUMABLES) {
      expect(c.tags, `${c.id} devrait avoir des tags`).toBeDefined()
      expect(validateTags(c.tags), `${c.id} tags invalides`).toBe(true)
    }
  })

  // ── Adversaires ──────────────────────────────────

  it('chaque feature d\'adversaire tier 1 a des tags valides', () => {
    for (const adv of tier1) {
      for (const feat of adv.features || []) {
        expect(feat.tags, `${adv.id}/${feat.name} devrait avoir des tags`).toBeDefined()
        expect(Array.isArray(feat.tags), `${adv.id}/${feat.name} tags devrait être un tableau`).toBe(true)
        expect(feat.tags.length, `${adv.id}/${feat.name} devrait avoir au moins 1 tag`).toBeGreaterThan(0)
        expect(validateTags(feat.tags), `${adv.id}/${feat.name} tags invalides: ${feat.tags}`).toBe(true)
      }
    }
  })

  it('chaque feature d\'adversaire tier 2 a des tags valides', () => {
    for (const adv of tier2) {
      for (const feat of adv.features || []) {
        expect(feat.tags, `${adv.id}/${feat.name} devrait avoir des tags`).toBeDefined()
        expect(validateTags(feat.tags), `${adv.id}/${feat.name} tags invalides: ${feat.tags}`).toBe(true)
      }
    }
  })

  it('chaque feature d\'adversaire tier 3 a des tags valides', () => {
    for (const adv of tier3) {
      for (const feat of adv.features || []) {
        expect(feat.tags, `${adv.id}/${feat.name} devrait avoir des tags`).toBeDefined()
        expect(validateTags(feat.tags), `${adv.id}/${feat.name} tags invalides: ${feat.tags}`).toBe(true)
      }
    }
  })

  it('chaque feature d\'adversaire tier 4 a des tags valides', () => {
    for (const adv of tier4) {
      for (const feat of adv.features || []) {
        expect(feat.tags, `${adv.id}/${feat.name} devrait avoir des tags`).toBeDefined()
        expect(validateTags(feat.tags), `${adv.id}/${feat.name} tags invalides: ${feat.tags}`).toBe(true)
      }
    }
  })

  it('couvre les 331 features d\'adversaires', () => {
    const total = [tier1, tier2, tier3, tier4].reduce(
      (sum, tier) => sum + tier.reduce((s, adv) => s + (adv.features || []).length, 0),
      0
    )
    expect(total).toBe(331)
  })
})
