// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DomainPreview from '../categories/domain/DomainPreview.vue'

function factory(data = {}) {
  return mount(DomainPreview, { props: { data } })
}

describe('DomainPreview', () => {
  // ── Rendu de base ──────────────────────────────────────
  it('affiche le nom du domaine', () => {
    const w = factory({ name: 'Forge' })
    expect(w.text()).toContain('Forge')
  })

  it('affiche le placeholder sans nom', () => {
    const w = factory({})
    expect(w.text()).toContain('Nouveau domaine')
  })

  it('trim le nom', () => {
    const w = factory({ name: '  Storm  ' })
    expect(w.text()).toContain('Storm')
  })

  it('affiche la description', () => {
    const w = factory({ name: 'Test', description: 'Le pouvoir des flammes.' })
    expect(w.text()).toContain('Le pouvoir des flammes.')
  })

  it('affiche le fallback sans description', () => {
    const w = factory({ name: 'Test' })
    expect(w.text()).toContain('Aucune description.')
  })

  // ── Emoji ──────────────────────────────────────────────
  it('affiche l\'emoji', () => {
    const w = factory({ name: 'Test', emoji: '🔥' })
    expect(w.find('.domain-preview__emoji').text()).toBe('🔥')
  })

  it('masque l\'emoji absent', () => {
    const w = factory({ name: 'Test' })
    expect(w.find('.domain-preview__emoji').exists()).toBe(false)
  })

  // ── Couleur / bordure ──────────────────────────────────
  it('applique la couleur de bordure custom', () => {
    const w = factory({ name: 'Test', color: '#dc2626' })
    const style = w.find('article').attributes('style')
    expect(style).toContain('#dc2626')
  })

  it('pas de style inline sans couleur', () => {
    const w = factory({ name: 'Test' })
    const style = w.find('article').attributes('style') || ''
    expect(style).not.toContain('border')
  })

  // ── Badge sorts ────────────────────────────────────────
  it('affiche le badge sorts si hasSpells', () => {
    const w = factory({ name: 'Test', hasSpells: true })
    expect(w.find('.domain-preview__spell-badge').exists()).toBe(true)
  })

  it('masque le badge sorts si hasSpells false', () => {
    const w = factory({ name: 'Test', hasSpells: false })
    expect(w.find('.domain-preview__spell-badge').exists()).toBe(false)
  })

  // ── Classes associées ──────────────────────────────────
  it('affiche les badges de classe', () => {
    const w = factory({ name: 'Test', classes: ['Wizard', 'Sorcerer'] })
    const badges = w.findAll('.domain-preview__class-badge')
    expect(badges).toHaveLength(2)
    expect(badges[0].text()).toBe('Wizard')
  })

  it('filtre les classes vides', () => {
    const w = factory({ name: 'Test', classes: ['Wizard', '', null] })
    expect(w.findAll('.domain-preview__class-badge')).toHaveLength(1)
  })

  it('masque la section classes si absente', () => {
    const w = factory({ name: 'Test' })
    expect(w.find('.domain-preview__classes').exists()).toBe(false)
  })

  // ── Thèmes ─────────────────────────────────────────────
  it('affiche les chips de thème', () => {
    const w = factory({ name: 'Test', themes: ['Feu', 'Destruction'] })
    const chips = w.findAll('.domain-preview__theme-chip')
    expect(chips).toHaveLength(2)
    expect(chips[0].text()).toBe('Feu')
  })

  it('filtre les thèmes vides', () => {
    const w = factory({ name: 'Test', themes: ['Feu', ''] })
    expect(w.findAll('.domain-preview__theme-chip')).toHaveLength(1)
  })

  // ── Cartes de domaine ──────────────────────────────────
  it('affiche les cartes groupées par niveau', () => {
    const w = factory({
      name: 'Test',
      cards: [
        { name: 'Fireball', level: 1, type: 'spell', recallCost: 1, feature: 'Boule de feu.' },
        { name: 'Shield', level: 1, type: 'ability', recallCost: 0, feature: 'Bouclier.' },
        { name: 'Meteor', level: 5, type: 'spell', recallCost: 3, feature: 'Météore.' }
      ]
    })
    expect(w.text()).toContain('Cartes (3)')
    const groups = w.findAll('.domain-preview__level-group')
    expect(groups).toHaveLength(2)
    expect(groups[0].text()).toContain('Niv. 1')
    expect(groups[1].text()).toContain('Niv. 5')
  })

  it('affiche le type de chaque carte', () => {
    const w = factory({
      name: 'Test',
      cards: [{ name: 'Rune', level: 1, type: 'grimoire', recallCost: 0, feature: 'Effet.' }]
    })
    expect(w.find('.domain-preview__card-type').text()).toBe('grimoire')
  })

  it('affiche le coût de rappel si > 0', () => {
    const w = factory({
      name: 'Test',
      cards: [{ name: 'Spell', level: 1, type: 'spell', recallCost: 2, feature: 'Effet.' }]
    })
    expect(w.find('.domain-preview__card-cost').text()).toContain('2')
  })

  it('masque le coût de rappel si 0', () => {
    const w = factory({
      name: 'Test',
      cards: [{ name: 'Ability', level: 1, type: 'ability', recallCost: 0, feature: 'Effet.' }]
    })
    expect(w.find('.domain-preview__card-cost').exists()).toBe(false)
  })

  it('filtre les cartes sans nom', () => {
    const w = factory({
      name: 'Test',
      cards: [
        { name: 'Valid', level: 1, type: 'ability', recallCost: 0, feature: 'Ok.' },
        { level: 2, type: 'spell', recallCost: 1, feature: 'Pas de nom.' },
        null
      ]
    })
    expect(w.text()).toContain('Cartes (1)')
  })

  it('masque la section cartes si tableau vide', () => {
    const w = factory({ name: 'Test', cards: [] })
    expect(w.find('.domain-preview__cards').exists()).toBe(false)
  })

  it('trie les groupes par niveau croissant', () => {
    const w = factory({
      name: 'Test',
      cards: [
        { name: 'High', level: 8, type: 'spell', recallCost: 3, feature: 'Fort.' },
        { name: 'Low', level: 2, type: 'ability', recallCost: 0, feature: 'Base.' }
      ]
    })
    const labels = w.findAll('.domain-preview__level-label')
    expect(labels[0].text()).toContain('2')
    expect(labels[1].text()).toContain('8')
  })

  // ── Accessibilité ──────────────────────────────────────
  it('a le role region avec aria-label', () => {
    const w = factory({ name: 'Forge' })
    const article = w.find('article')
    expect(article.attributes('role')).toBe('region')
    expect(article.attributes('aria-label')).toContain('Forge')
  })

  it('masque l\'emoji pour les lecteurs d\'écran', () => {
    const w = factory({ name: 'Test', emoji: '🔥' })
    expect(w.find('.domain-preview__emoji').attributes('aria-hidden')).toBe('true')
  })

  it('label aria sur le badge sorts', () => {
    const w = factory({ name: 'Test', hasSpells: true })
    expect(w.find('.domain-preview__spell-badge').attributes('aria-label')).toContain('sorts')
  })
})
