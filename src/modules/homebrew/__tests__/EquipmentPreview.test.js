// @vitest-environment happy-dom
/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EquipmentPreview from '../categories/equipment/EquipmentPreview.vue'

function factory(data = {}) {
  return mount(EquipmentPreview, { props: { data } })
}

describe('EquipmentPreview', () => {
  // ── Rendu de base ──────────────────────────────────────
  it('affiche le nom de l\'équipement', () => {
    const w = factory({ name: 'Lame de Feu', category: 'primaryWeapon' })
    expect(w.text()).toContain('Lame de Feu')
  })

  it('affiche le texte placeholder sans nom', () => {
    const w = factory({})
    expect(w.text()).toContain('Nouvel équipement')
  })

  it('affiche la description', () => {
    const w = factory({ name: 'Test', description: 'Une épée enflammée.' })
    expect(w.text()).toContain('Une épée enflammée.')
  })

  // ── Catégories ─────────────────────────────────────────
  it.each([
    ['primaryWeapon', 'Arme Primaire', '⚔️'],
    ['secondaryWeapon', 'Arme Secondaire', '🛡️'],
    ['armor', 'Armure', '🛡️'],
    ['loot', 'Loot', '💎'],
    ['consumable', 'Consommable', '🧪']
  ])('affiche le label et l\'icône pour la catégorie %s', (category, label, icon) => {
    const w = factory({ name: 'Test', category })
    expect(w.text()).toContain(label)
    expect(w.text()).toContain(icon)
  })

  // ── Weapon stats ───────────────────────────────────────
  it('affiche les stats d\'une arme primaire', () => {
    const w = factory({
      name: 'Épée longue',
      category: 'primaryWeapon',
      tier: 1,
      trait: 'Agility',
      range: 'Melee',
      damage: 'd10+3',
      damageType: 'phy',
      burden: 'Two-Handed'
    })
    expect(w.text()).toContain('Agility')
    expect(w.text()).toContain('Melee')
    expect(w.text()).toContain('d10+3')
    expect(w.text()).toContain('2 mains')
  })

  it('affiche l\'icône physique pour damageType phy', () => {
    const w = factory({
      name: 'Test', category: 'primaryWeapon', damageType: 'phy', damage: 'd8'
    })
    expect(w.text()).toContain('⚔️')
  })

  it('affiche l\'icône magique pour damageType mag', () => {
    const w = factory({
      name: 'Test', category: 'primaryWeapon', damageType: 'mag', damage: 'd6'
    })
    expect(w.text()).toContain('✨')
  })

  it('affiche burden One-Handed comme "1 main"', () => {
    const w = factory({
      name: 'Test', category: 'secondaryWeapon', burden: 'One-Handed', damage: 'd4'
    })
    expect(w.text()).toContain('1 main')
  })

  // ── Armor stats ────────────────────────────────────────
  it('affiche les stats d\'une armure', () => {
    const w = factory({
      name: 'Cotte de mailles',
      category: 'armor',
      tier: 1,
      baseScore: 4,
      thresholds: { major: 7, severe: 15 }
    })
    expect(w.text()).toContain('4')
    expect(w.text()).toContain('7')
    expect(w.text()).toContain('15')
  })

  it('n\'affiche pas les stats d\'arme pour une armure', () => {
    const w = factory({ name: 'Test', category: 'armor' })
    expect(w.find('.eq-preview__stat').exists()).toBe(true)
    // Pas de champ Trait/Portée/Burden pour armure
    expect(w.text()).not.toContain('Trait')
  })

  // ── Tier badge ─────────────────────────────────────────
  it('affiche le tier pour une arme', () => {
    const w = factory({ name: 'Test', category: 'primaryWeapon', tier: 2 })
    expect(w.text()).toContain('T2')
  })

  it('n\'affiche pas le tier pour du loot', () => {
    const w = factory({ name: 'Test', category: 'loot', tier: 1 })
    expect(w.find('.eq-preview__tier-badge').exists()).toBe(false)
  })

  it.each([1, 2, 3, 4])('applique la classe CSS pour le tier %i', (tier) => {
    const w = factory({ name: 'Test', category: 'primaryWeapon', tier })
    expect(w.find(`.eq-preview__tier-badge--t${tier}`).exists()).toBe(true)
  })

  // ── Rareté (loot/consumable) ───────────────────────────
  it('affiche la rareté pour un loot', () => {
    const w = factory({ name: 'Test', category: 'loot', rarity: 'rare' })
    expect(w.text()).toContain('Rare')
  })

  it('n\'affiche pas la rareté pour une arme', () => {
    const w = factory({ name: 'Test', category: 'primaryWeapon', rarity: 'rare' })
    expect(w.find('.eq-preview__rarity').exists()).toBe(false)
  })

  // ── Feature ────────────────────────────────────────────
  it('affiche la feature avec son mot-clé', () => {
    const w = factory({
      name: 'Test',
      category: 'primaryWeapon',
      feature: '+1 to attack rolls',
      featureKey: 'Reliable'
    })
    expect(w.text()).toContain('Reliable')
    expect(w.text()).toContain('+1 to attack rolls')
  })

  // ── Empty state ────────────────────────────────────────
  it('affiche l\'état vide quand aucune donnée', () => {
    const w = factory({})
    expect(w.find('.eq-preview__empty').exists()).toBe(true)
  })

  // ── Accessibilité ──────────────────────────────────────
  it('a un aria-label avec le nom de l\'équipement', () => {
    const w = factory({ name: 'Bouclier Runique' })
    expect(w.find('section').attributes('aria-label')).toContain('Bouclier Runique')
  })
})
