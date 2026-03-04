// @vitest-environment jsdom
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EnvironmentPreview from '../categories/environment/EnvironmentPreview.vue'

function factory(data = {}) {
  return mount(EnvironmentPreview, { props: { data } })
}

describe('EnvironmentPreview', () => {
  // ── Rendu de base ──────────────────────────────────────
  it('affiche le nom de l\'environnement', () => {
    const w = factory({ name: 'Forêt Sombre' })
    expect(w.text()).toContain('Forêt Sombre')
  })

  it('affiche le texte placeholder sans nom', () => {
    const w = factory({})
    expect(w.text()).toContain('Nouvel environnement')
  })

  it('affiche la description', () => {
    const w = factory({ name: 'Ruines', description: 'Des ruines anciennes et mystérieuses.' })
    expect(w.text()).toContain('Des ruines anciennes et mystérieuses.')
  })

  // ── Tier badge ─────────────────────────────────────────
  it('affiche le badge de tier', () => {
    const w = factory({ name: 'Test', tier: 3 })
    expect(w.text()).toContain('T3')
  })

  it.each([1, 2, 3, 4])('applique la classe CSS pour le tier %i', (tier) => {
    const w = factory({ name: 'Test', tier })
    expect(w.find(`.env-preview__tier-badge--t${tier}`).exists()).toBe(true)
  })

  it('applique la classe de bordure par tier', () => {
    const w = factory({ name: 'Test', tier: 2 })
    expect(w.find('.env-preview--tier2').exists()).toBe(true)
  })

  // ── Type + Difficulté ──────────────────────────────────
  it('affiche le type avec son icône', () => {
    const w = factory({ name: 'Test', type: 'Exploration' })
    expect(w.text()).toContain('🔍')
    expect(w.text()).toContain('Exploration')
  })

  it('affiche la difficulté', () => {
    const w = factory({ name: 'Test', difficulty: 14 })
    expect(w.text()).toContain('Diff. 14')
  })

  // ── Impulses ───────────────────────────────────────────
  it('affiche les impulses sous forme de tags', () => {
    const w = factory({ name: 'Test', impulses: ['Piéger', 'Submerger'] })
    const tags = w.findAll('.env-preview__impulse-tag')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toBe('Piéger')
    expect(tags[1].text()).toBe('Submerger')
  })

  it('n\'affiche pas la section impulses si tableau vide', () => {
    const w = factory({ name: 'Test', impulses: [] })
    expect(w.find('.env-preview__impulses').exists()).toBe(false)
  })

  // ── Adversaires potentiels ─────────────────────────────
  it('affiche les adversaires potentiels par groupe', () => {
    const w = factory({
      name: 'Test',
      potentialAdversaries: [
        { group: 'Bêtes', names: ['Ours', 'Loup'] }
      ]
    })
    expect(w.text()).toContain('Bêtes')
    expect(w.text()).toContain('Ours')
    expect(w.text()).toContain('Loup')
  })

  it('n\'affiche pas la section adversaires si vide', () => {
    const w = factory({ name: 'Test', potentialAdversaries: [] })
    expect(w.find('.env-preview__adversaries').exists()).toBe(false)
  })

  // ── Features ───────────────────────────────────────────
  it('affiche les features avec nom et type', () => {
    const w = factory({
      name: 'Test',
      features: [
        { name: 'Piège à ours', type: 'action', description: 'Un piège dangereux.' }
      ]
    })
    expect(w.text()).toContain('Piège à ours')
    expect(w.text()).toContain('Action')
  })

  it('applique les bordures de couleur par type de feature', () => {
    const w = factory({
      name: 'Test',
      features: [
        { name: 'F1', type: 'action', description: 'desc' },
        { name: 'F2', type: 'reaction', description: 'desc' },
        { name: 'F3', type: 'passive', description: 'desc' }
      ]
    })
    expect(w.find('.env-preview__feature--action').exists()).toBe(true)
    expect(w.find('.env-preview__feature--reaction').exists()).toBe(true)
    expect(w.find('.env-preview__feature--passive').exists()).toBe(true)
  })

  it('affiche le coût en Fear d\'une feature', () => {
    const w = factory({
      name: 'Test',
      features: [{ name: 'Pouvoir', type: 'action', fearCost: 2, description: 'desc' }]
    })
    expect(w.text()).toContain('🔴')
    expect(w.text()).toContain('2')
  })

  it('affiche les questions narratives d\'une feature', () => {
    const w = factory({
      name: 'Test',
      features: [{ name: 'F1', type: 'passive', description: 'desc', questions: 'Pourquoi ?' }]
    })
    expect(w.text()).toContain('Pourquoi ?')
  })

  // ── Empty state ────────────────────────────────────────
  it('affiche l\'état vide quand aucune donnée', () => {
    const w = factory({})
    expect(w.find('.env-preview__empty').exists()).toBe(true)
  })

  // ── Accessibilité ──────────────────────────────────────
  it('a un aria-label avec le nom de l\'environnement', () => {
    const w = factory({ name: 'Marché Nocturne' })
    expect(w.find('section').attributes('aria-label')).toContain('Marché Nocturne')
  })
})
