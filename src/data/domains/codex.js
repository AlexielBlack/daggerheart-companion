/**
 * @module domains/codex
 * @description Codex domain — STUB, à remplacer par les 21 cartes SRD.
 * Source : DomainCards_SRD.pdf
 * @todo Remplacer par les données complètes.
 */

export const codex = {
  id: 'codex',
  name: 'Codex',
  emoji: '📖',
  color: '#0891b2',
  description: 'The domain of Codex. Full description pending SRD extraction.',
  classes: ["Bard","Wizard"],
  themes: ["Grimoires","Multiple spells","Knowledge"],
  hasSpells: true,
  cardCount: 21,
  cards: [] // TODO: Phase 6 — à remplir avec les 21 cartes SRD
}
