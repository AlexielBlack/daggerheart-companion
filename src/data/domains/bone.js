/**
 * @module domains/bone
 * @description Bone domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const bone = {
  id: 'bone',
  name: 'Bone',
  emoji: '💨',
  color: '#ca8a04',
  description:
    'Le domaine de Bone représente la mobilité, l\'esquive et la prouesse physique. Les adeptes de Bone sont des acrobates de combat qui se déplacent avec une fluidité déconcertante.',
  classes: ['Warrior', 'Ranger', 'Duellist'],
  themes: ['Mouvement', 'Esquive', 'Prouesse physique'],
  hasSpells: false,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'bone-deft-maneuvers',
      name: 'Deft Maneuvers',
      level: 1,
      type: 'ability',
      recallCost: 0,
      feature:
        'Une fois par repos, marquez un Stress pour sprinter n\'importe où à Portée Lointaine sans faire de jet d\'Agilité pour y arriver. Si vous terminez ce mouvement à Portée de Mêlée d\'un adversaire et faites immédiatement une attaque contre lui, gagnez un bonus de +1 au jet d\'attaque.'
    },
    {
      id: 'bone-i-see-it-coming',
      name: 'I See It Coming',
      level: 1,
      type: 'ability',
      recallCost: 1,
      feature:
        'Quand vous êtes ciblé par une attaque faite au-delà de la Portée de Mêlée, vous pouvez marquer un Stress pour lancer un d4 et gagner un bonus à votre Évasion égal au résultat contre cette attaque.'
    },
    {
      id: 'bone-untouchable',
      name: 'Untouchable',
      level: 1,
      type: 'ability',
      recallCost: 1,
      feature: 'Gagnez un bonus à votre Évasion égal à la moitié de votre Agilité.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'bone-ferocity',
      name: 'Ferocity',
      level: 2,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand vous forcez un adversaire à marquer 1 ou plusieurs Points de Vie, vous pouvez dépenser 2 Espoir pour augmenter votre Évasion du nombre de Points de Vie qu\'il a marqués. Ce bonus dure jusqu\'après la prochaine attaque effectuée contre vous.'
    },
    {
      id: 'bone-strategic-approach',
      name: 'Strategic Approach',
      level: 2,
      type: 'ability',
      recallCost: 1,
      feature:
        'Après un repos long, placez un nombre de jetons égal à votre Connaissance sur cette carte (minimum 1). La première fois que vous vous déplacez à Portée Proche d\'un adversaire et faites une attaque contre lui, vous pouvez dépenser un jeton pour choisir une des options suivantes : Vous faites l\'attaque avec avantage ; Vous effacez un Stress sur un allié à Portée de Mêlée de l\'adversaire ; Vous ajoutez un d8 à votre jet de dégâts. Lors d\'un repos long, retirez tous les jetons non dépensés.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'bone-brace',
      name: 'Brace',
      level: 3,
      type: 'ability',
      recallCost: 1,
      feature:
        'Quand vous marquez un Emplacement d\'Armure pour réduire les dégâts entrants, vous pouvez marquer un Stress pour marquer un Emplacement d\'Armure supplémentaire.'
    },
    {
      id: 'bone-tactician',
      name: 'Tactician',
      level: 3,
      type: 'ability',
      recallCost: 1,
      feature:
        'Quand vous Aidez un Allié, il peut dépenser un Espoir pour ajouter une de vos Expériences à son jet en plus de votre dé d\'avantage. Quand vous faites un Jet en Équipe, vous pouvez lancer un d20 comme Dé d\'Espoir.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'bone-boost',
      name: 'Boost',
      level: 4,
      type: 'ability',
      recallCost: 1,
      feature:
        'Marquez un Stress pour prendre appui sur un allié consentant à Portée Proche, vous propulser dans les airs et effectuer une attaque aérienne contre une cible à Portée Lointaine. Vous avez l\'avantage sur l\'attaque, ajoutez un d10 au jet de dégâts, et terminez votre mouvement à Portée de Mêlée de la cible.'
    },
    {
      id: 'bone-redirect',
      name: 'Redirect',
      level: 4,
      type: 'ability',
      recallCost: 1,
      feature:
        'Quand une attaque faite contre vous au-delà de la Portée de Mêlée échoue, lancez un nombre de d6 égal à votre Maîtrise. Si l\'un donne un 6, vous pouvez marquer un Stress pour rediriger l\'attaque et infliger les dégâts à un adversaire à Portée Très Proche à la place.'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'bone-know-thy-enemy',
      name: 'Know Thy Enemy',
      level: 5,
      type: 'ability',
      recallCost: 1,
      feature:
        'En observant une créature, vous pouvez faire un jet d\'Instinct contre elle. Sur un succès, dépensez un Espoir et demandez au MJ un ensemble d\'informations sur la cible parmi les options suivantes : Ses Points de Vie et Stress non marqués ; Sa Difficulté et ses seuils de dégâts ; Ses tactiques et dés de dégâts d\'attaque standard ; Ses capacités et Expériences. De plus, sur un succès, vous pouvez marquer un Stress pour retirer une Peur de la Réserve de Peur du MJ.'
    },
    {
      id: 'bone-signature-move',
      name: 'Signature Move',
      level: 5,
      type: 'ability',
      recallCost: 1,
      feature:
        'Nommez et décrivez votre coup signature. Une fois par repos, quand vous exécutez ce coup signature dans le cadre d\'une action que vous effectuez, vous pouvez lancer un d20 comme Dé d\'Espoir. Sur un succès, effacez un Stress.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'bone-rapid-riposte',
      name: 'Rapid Riposte',
      level: 6,
      type: 'ability',
      recallCost: 0,
      feature:
        'Quand une attaque faite contre vous depuis la Portée de Mêlée échoue, vous pouvez marquer un Stress et saisir l\'opportunité pour infliger les dégâts d\'arme d\'une de vos armes actives à l\'attaquant.'
    },
    {
      id: 'bone-recovery',
      name: 'Recovery',
      level: 6,
      type: 'ability',
      recallCost: 1,
      feature:
        'Pendant un repos court, vous pouvez choisir un mouvement de temps libre de repos long à la place. Vous pouvez dépenser un Espoir pour permettre à un allié d\'en faire autant.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'bone-bone-touched',
      name: 'Bone-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Bone, vous gagnez les bénéfices suivants : bonus de +1 à l\'Agilité ; Une fois par repos, vous pouvez dépenser 3 Espoir pour transformer une attaque réussie contre vous en échec.'
    },
    {
      id: 'bone-cruel-precision',
      name: 'Cruel Precision',
      level: 7,
      type: 'ability',
      recallCost: 1,
      feature:
        'Quand vous réussissez une attaque avec une arme, gagnez un bonus à votre jet de dégâts égal à votre Finesse ou votre Agilité (au choix).'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'bone-breaking-blow',
      name: 'Breaking Blow',
      level: 8,
      type: 'ability',
      recallCost: 3,
      feature:
        'Quand vous réussissez une attaque, vous pouvez marquer un Stress pour que la prochaine attaque réussie contre cette même cible inflige 2d12 dégâts supplémentaires.'
    },
    {
      id: 'bone-wrangle',
      name: 'Wrangle',
      level: 8,
      type: 'ability',
      recallCost: 1,
      feature:
        'Faites un jet d\'Agilité contre toutes les cibles à Portée Proche. Dépensez un Espoir pour déplacer les cibles contre lesquelles vous réussissez, ainsi que tout allié consentant à Portée Proche, vers un autre point à Portée Proche.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'bone-on-the-brink',
      name: 'On The Brink',
      level: 9,
      type: 'ability',
      recallCost: 1,
      feature:
        'Quand il vous reste 2 Points de Vie non marqués ou moins, vous ne subissez pas les dégâts Mineurs.'
    },
    {
      id: 'bone-splintering-strike',
      name: 'Splintering Strike',
      level: 9,
      type: 'ability',
      recallCost: 3,
      feature:
        'Dépensez un Espoir et faites une attaque contre tous les adversaires à portée de votre arme. Une fois par repos long, sur un succès contre au moins une cible, lancez les dégâts de votre arme et répartissez ces dégâts comme vous le souhaitez entre les cibles touchées. Avant d\'infliger les dégâts à chaque cible, lancez un dé de dégâts supplémentaire et ajoutez son résultat aux dégâts que vous lui infligez.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'bone-deathrun',
      name: 'Deathrun',
      level: 10,
      type: 'ability',
      recallCost: 1,
      feature:
        'Dépensez 3 Espoir pour courir en ligne droite à travers le champ de bataille jusqu\'à un point à Portée Lointaine, faisant une attaque contre tous les adversaires à portée de votre arme le long de ce chemin. Choisissez l\'ordre dans lequel vous infligez les dégâts aux cibles touchées. Pour la première, lancez vos dégâts d\'arme avec un bonus de +1 à votre Maîtrise. Puis retirez un dé de votre jet de dégâts et infligez les dégâts restants à la cible suivante. Continuez à retirer un dé pour chaque cible suivante jusqu\'à épuisement des dés de dégâts ou des adversaires. Vous ne pouvez pas cibler le même adversaire plus d\'une fois par attaque.'
    },
    {
      id: 'bone-swift-step',
      name: 'Swift Step',
      level: 10,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand une attaque faite contre vous échoue, effacez un Stress. Si vous ne pouvez pas effacer de Stress, gagnez un Espoir.'
    }
  ]
}
