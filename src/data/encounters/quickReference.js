/**
 * @module encounters/quickReference
 * @description Données de référence rapide pour le mode live.
 * Toutes les données proviennent du SRD officiel (glossary.js, liveConstants.js, constants.js).
 */

export const QUICK_REFERENCE_SECTIONS = [
  {
    id: 'roll-results',
    title: 'Résultats de jets',
    emoji: '🎲',
    items: [
      { term: '✨ Critique', description: 'Succès automatique avec effet bonus majeur.' },
      { term: '☀️ Succès + Hope', description: 'Réussite, le joueur décrit un avantage supplémentaire.' },
      { term: '🌙 Succès + Fear', description: 'Réussite, mais le MJ ajoute une complication ou gagne de la Fear.' },
      { term: '💫 Échec + Hope', description: 'Échec, mais le joueur gagne un avantage mineur ou de l\'espoir.' },
      { term: '💀 Échec + Fear', description: 'Échec, le MJ décrit une conséquence et gagne de la Fear.' }
    ]
  },
  {
    id: 'conditions',
    title: 'Conditions',
    emoji: '⚡',
    items: [
      { term: '👁️‍🗨️ Hidden', description: 'Jets contre la cible ont un désavantage. Perdu en attaquant ou en étant repéré.' },
      { term: '⛓️ Restrained', description: 'Ne peut pas se déplacer, mais peut toujours agir.' },
      { term: '⚡ Vulnerable', description: 'Tous les jets ciblant cette créature ont un avantage.' },
      { term: '⏳ Temporary', description: 'Peut être dissipé en effectuant une action contre la condition.' }
    ]
  },
  {
    id: 'ranges',
    title: 'Portées',
    emoji: '📏',
    items: [
      { term: 'Mêlée', description: 'Contact direct, à portée de bras.' },
      { term: 'Très Proche', description: 'Quelques pas, même zone immédiate.' },
      { term: 'Proche', description: 'À portée de voix, même pièce.' },
      { term: 'Loin', description: 'Visible mais distant, nécessite du mouvement.' },
      { term: 'Très Loin', description: 'Aux limites de la visibilité.' },
      { term: 'Hors de Portée', description: 'Impossible à atteindre sans se déplacer significativement.' }
    ]
  },
  {
    id: 'damage-thresholds',
    title: 'Seuils de dégâts',
    emoji: '🛡️',
    items: [
      { term: 'Sous le seuil Majeur → 1 PV', description: 'Dégâts mineurs : marquez 1 PV sur la cible.' },
      { term: '≥ Seuil Majeur → 2 PV', description: 'Dégâts importants : marquez 2 PV sur la cible.' },
      { term: '≥ Seuil Sévère → 3 PV', description: 'Dégâts critiques : marquez 3 PV sur la cible.' }
    ]
  },
  {
    id: 'adversary-types',
    title: 'Types d\'adversaires',
    emoji: '👹',
    items: [
      { term: 'Sbire (1 BP)', description: 'Faible, tombe en un coup. Efficace en groupe.' },
      { term: 'Standard (2 BP)', description: 'Adversaire de base équilibré.' },
      { term: 'Horde (2 BP)', description: 'Groupe compact agissant comme une unité.' },
      { term: 'Tireur (2 BP)', description: 'Attaque à distance, fragile au corps à corps.' },
      { term: 'Rôdeur (2 BP)', description: 'Furtif, attaque par surprise.' },
      { term: 'Soutien (1 BP)', description: 'Renforce les alliés, peu dangereux seul.' },
      { term: 'Social (1 BP)', description: 'Spécialisé dans l\'interaction sociale.' },
      { term: 'Chef (3 BP)', description: 'Commande les autres, actions bonus au groupe.' },
      { term: 'Cogneur (4 BP)', description: 'Très résistant, dégâts élevés.' },
      { term: 'Solo (5 BP)', description: 'Boss seul, plusieurs actions par tour.' }
    ]
  },
  {
    id: 'scene-modes',
    title: 'Modes de scène',
    emoji: '🎭',
    items: [
      { term: '⚔️ PJ Attaque', description: 'Le PJ a le projecteur et attaque. Features offensifs prioritaires.' },
      { term: '💀 Adversaire Attaque', description: 'Le MJ a le projecteur. Features défensifs et réactions prioritaires.' },
      { term: '🗣️ Social', description: 'Scène sociale — négociation, persuasion, interaction.' }
    ]
  },
  {
    id: 'countdown-advancement',
    title: 'Progression des countdowns',
    emoji: '⏱️',
    items: [
      { term: '✨ Critique', description: 'Progress +3, Conséquence +0.' },
      { term: '☀️ Succès + Hope', description: 'Progress +2, Conséquence +0.' },
      { term: '🌙 Succès + Fear', description: 'Progress +1, Conséquence +1.' },
      { term: '💫 Échec + Hope', description: 'Progress +0, Conséquence +2.' },
      { term: '💀 Échec + Fear', description: 'Progress +0, Conséquence +3.' }
    ]
  }
]
