// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClassPreview from '../categories/class/ClassPreview.vue'

function factory(data = {}) {
  return mount(ClassPreview, { props: { data } })
}

describe('ClassPreview', () => {
  // ── Rendu de base ──────────────────────────────────────
  it('affiche le nom de la classe', () => {
    const w = factory({ name: 'Psion' })
    expect(w.text()).toContain('Psion')
  })

  it('affiche le placeholder sans nom', () => {
    const w = factory({})
    expect(w.text()).toContain('Nouvelle classe')
  })

  it('trim le nom', () => {
    const w = factory({ name: '  Shamane  ' })
    expect(w.text()).toContain('Shamane')
  })

  it('affiche la description', () => {
    const w = factory({ name: 'Test', description: 'Un guerrier mystique.' })
    expect(w.text()).toContain('Un guerrier mystique.')
  })

  it('affiche le fallback sans description', () => {
    const w = factory({ name: 'Test' })
    expect(w.text()).toContain('Aucune description.')
  })

  // ── Emoji ──────────────────────────────────────────────
  it('affiche l\'emoji', () => {
    const w = factory({ name: 'Test', emoji: '🔮' })
    expect(w.find('.class-preview__emoji').text()).toBe('🔮')
  })

  it('masque l\'emoji absent', () => {
    const w = factory({ name: 'Test' })
    expect(w.find('.class-preview__emoji').exists()).toBe(false)
  })

  // ── Domaines ───────────────────────────────────────────
  it('affiche les badges de domaine', () => {
    const w = factory({ name: 'Test', domains: ['Arcana', 'Blade'] })
    const badges = w.findAll('.class-preview__domain-badge')
    expect(badges).toHaveLength(2)
    expect(badges[0].text()).toBe('Arcana')
    expect(badges[1].text()).toBe('Blade')
  })

  it('filtre les domaines vides', () => {
    const w = factory({ name: 'Test', domains: ['Arcana', '', null] })
    const badges = w.findAll('.class-preview__domain-badge')
    expect(badges).toHaveLength(1)
  })

  it('n\'affiche pas les domaines si absent', () => {
    const w = factory({ name: 'Test' })
    expect(w.find('.class-preview__domains').exists()).toBe(false)
  })

  // ── Stats (Evasion, HP, Stress, Balance) ───────────────
  it('affiche evasion, HP et stress', () => {
    const w = factory({ name: 'Test', baseEvasion: 10, baseHP: 6, baseStress: 6 })
    const text = w.text()
    expect(text).toContain('10')
    expect(text).toContain('6')
  })

  it('calcule le score de balance', () => {
    const w = factory({ name: 'Test', baseEvasion: 10, baseHP: 6 })
    expect(w.text()).toContain('16')
  })

  it('applique la classe good pour balance 15-17', () => {
    const w = factory({ name: 'Test', baseEvasion: 10, baseHP: 6 })
    expect(w.find('.class-preview__stat-value--good').exists()).toBe(true)
  })

  it('applique la classe warn pour balance hors plage', () => {
    const w = factory({ name: 'Test', baseEvasion: 14, baseHP: 8 })
    expect(w.find('.class-preview__stat-value--warn').exists()).toBe(true)
  })

  it('n\'affiche pas balance sans evasion ou HP', () => {
    const w = factory({ name: 'Test', baseEvasion: 10 })
    expect(w.text()).not.toContain('Balance')
  })

  // ── Hope Feature ───────────────────────────────────────
  it('affiche la hope feature', () => {
    const w = factory({ name: 'Test', hopeFeature: 'Dépensez 3 Hope pour infliger 2d12.' })
    expect(w.text()).toContain('Hope Feature')
    expect(w.text()).toContain('Dépensez 3 Hope pour infliger 2d12.')
  })

  it('masque la section hope si absente', () => {
    const w = factory({ name: 'Test' })
    expect(w.find('.class-preview__hope').exists()).toBe(false)
  })

  // ── Class Features ─────────────────────────────────────
  it('affiche les features de classe', () => {
    const w = factory({
      name: 'Test',
      classFeatures: [
        { name: 'Rage', description: 'Entrez en rage furieuse.' },
        { name: 'Parade', description: 'Parez une attaque.' }
      ]
    })
    expect(w.text()).toContain('Rage')
    expect(w.text()).toContain('Parade')
    const items = w.findAll('.class-preview__feature-item')
    expect(items).toHaveLength(2)
  })

  it('filtre les features vides', () => {
    const w = factory({
      name: 'Test',
      classFeatures: [{ name: 'Rage', description: 'Effet' }, null, {}]
    })
    const items = w.findAll('.class-preview__feature-item')
    expect(items).toHaveLength(1)
  })

  it('masque la section features si tableau vide', () => {
    const w = factory({ name: 'Test', classFeatures: [] })
    expect(w.find('.class-preview__features').exists()).toBe(false)
  })

  // ── Traits recommandés ─────────────────────────────────
  it('affiche la grille de traits', () => {
    const w = factory({
      name: 'Test',
      suggestedTraits: { agility: 1, strength: 2, finesse: 0, instinct: -1, presence: 1, knowledge: 0 }
    })
    expect(w.find('.class-preview__traits').exists()).toBe(true)
    const items = w.findAll('.class-preview__trait-item')
    expect(items).toHaveLength(6)
  })

  it('formate les positifs avec +', () => {
    const w = factory({
      name: 'Test',
      suggestedTraits: { agility: 2, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 }
    })
    expect(w.text()).toContain('+2')
  })

  it('applique la classe pos/neg', () => {
    const w = factory({
      name: 'Test',
      suggestedTraits: { agility: 1, strength: -1, finesse: 0, instinct: 0, presence: 0, knowledge: 0 }
    })
    expect(w.find('.class-preview__trait-value--pos').exists()).toBe(true)
    expect(w.find('.class-preview__trait-value--neg').exists()).toBe(true)
  })

  it('masque les traits si absents', () => {
    const w = factory({ name: 'Test' })
    expect(w.find('.class-preview__traits').exists()).toBe(false)
  })

  // ── Footer (armure, objets) ────────────────────────────
  it('affiche l\'armure suggérée', () => {
    const w = factory({ name: 'Test', suggestedArmor: 'Chainmail — 7/15 — Score 4' })
    expect(w.text()).toContain('Chainmail')
  })

  it('affiche les objets de classe', () => {
    const w = factory({ name: 'Test', classItems: 'Un orbe murmurant' })
    expect(w.text()).toContain('Un orbe murmurant')
  })

  it('masque le footer sans armure ni objets', () => {
    const w = factory({ name: 'Test' })
    expect(w.find('.class-preview__footer').exists()).toBe(false)
  })

  // ── Accessibilité ──────────────────────────────────────
  it('a le role region avec aria-label', () => {
    const w = factory({ name: 'Psion' })
    const article = w.find('article')
    expect(article.attributes('role')).toBe('region')
    expect(article.attributes('aria-label')).toContain('Psion')
  })

  it('masque l\'emoji pour les lecteurs d\'écran', () => {
    const w = factory({ name: 'Test', emoji: '🔮' })
    expect(w.find('.class-preview__emoji').attributes('aria-hidden')).toBe('true')
  })
})
