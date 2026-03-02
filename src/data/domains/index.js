/**
 * @module domains/data
 * @description Les 9 domaines officiels du SRD Daggerheart avec cartes représentatives.
 * Source : DomainCards_SRD.pdf
 */

/** Types de cartes de domaine */
export const CARD_TYPES = {
  spell: 'Sort',
  grimoire: 'Grimoire',
  ability: 'Capacité',
  weapon: 'Arme',
  armor: 'Armure'
}

/** Niveaux de rappel (recall cost) */
export const RECALL_COSTS = {
  0: 'Gratuit',
  1: '1 Espoir',
  2: '2 Espoir',
  3: '3 Espoir'
}

/**
 * Les 9 domaines officiels.
 * Chaque domaine inclut une description, les classes associées,
 * et des cartes exemples représentatives (non exhaustif).
 */
export const DOMAINS = [
  {
    id: 'arcana',
    name: 'Arcana',
    emoji: '🔮',
    color: '#7c3aed',
    description: 'Le domaine d\'Arcana représente la magie pure et la manipulation des forces mystiques. Les praticiens d\'Arcana canalisent l\'énergie brute du cosmos pour déclencher des phénomènes surnaturels.',
    classes: ['Druid', 'Wizard'],
    themes: ['Magie arcanique', 'Éléments', 'Forces mystiques'],
    hasSpells: true,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Arcane Pulse',
        type: 'spell',
        recallCost: 1,
        feature: 'Dépensez de la Magie pour envoyer une impulsion d\'énergie arcanique. Faites un jet de Sort contre une cible à Portée Proche — en cas de succès, elle subit 2d6 dégâts magiques et est repoussée.'
      },
      {
        level: 3,
        name: 'Arcana-Ward',
        type: 'spell',
        recallCost: 2,
        feature: 'Créez un bouclier arcanique autour d\'un allié à Portée Proche. Jusqu\'au début de votre prochain tour, il réduit les dégâts magiques subis de moitié.'
      },
      {
        level: 7,
        name: 'Arcana-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Arcana : votre Maîtrise augmente de +1 pour les jets de Sort et vous pouvez relancer un dé de dégâts magiques par attaque.'
      }
    ]
  },
  {
    id: 'blade',
    name: 'Blade',
    emoji: '⚔️',
    color: '#dc2626',
    description: 'Le domaine de Blade représente la maîtrise des armes et le combat rapproché. Les guerriers de Blade transforment leur lame en extension de leur volonté.',
    classes: ['Guardian', 'Warrior'],
    themes: ['Combat', 'Armes', 'Maîtrise martiale'],
    hasSpells: false,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Blade Dance',
        type: 'ability',
        recallCost: 0,
        feature: 'Lorsque vous réussissez une attaque au corps à corps, vous pouvez marquer un Stress pour effectuer une seconde attaque légère contre la même cible ou une cible adjacente à Portée de Mêlée.'
      },
      {
        level: 2,
        name: 'Keen Edge',
        type: 'weapon',
        recallCost: 0,
        feature: 'Votre arme principale gagne +1d6 aux jets de dégâts. De plus, sur un coup critique, vous pouvez rendre la cible Vulnérable jusqu\'à la fin de son prochain tour.'
      },
      {
        level: 7,
        name: 'Blade-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Blade : ajoutez votre Maîtrise aux jets de dégâts des attaques au corps à corps et ignorez 2 points d\'armure de la cible.'
      }
    ]
  },
  {
    id: 'bone',
    name: 'Bone',
    emoji: '💨',
    color: '#ca8a04',
    description: 'Le domaine de Bone représente la mobilité, l\'évasion et la physicalité. Les adeptes de Bone sont des acrobates de combat qui se déplacent avec une fluidité déconcertante.',
    classes: ['Ranger', 'Warrior', 'Duellist'],
    themes: ['Mouvement', 'Évasion', 'Physicalité'],
    hasSpells: false,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Swift Step',
        type: 'ability',
        recallCost: 0,
        feature: 'Une fois par round, quand vous vous déplacez, ignorez les terrains difficiles et les zones de danger. Vous pouvez traverser l\'espace occupé par des adversaires sans provoquer d\'attaque d\'opportunité.'
      },
      {
        level: 2,
        name: 'Evasive Maneuver',
        type: 'ability',
        recallCost: 1,
        feature: 'En réaction quand un adversaire vous attaque, dépensez 1 Espoir pour vous déplacer de Portée Très Proche avant que l\'attaque ne soit résolue. Si vous sortez de portée, l\'attaque rate automatiquement.'
      },
      {
        level: 7,
        name: 'Bone-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Bone : gagnez +2 à l\'Évasion et votre déplacement ne provoque jamais d\'attaques d\'opportunité.'
      }
    ]
  },
  {
    id: 'codex',
    name: 'Codex',
    emoji: '📖',
    color: '#0891b2',
    description: 'Le domaine de Codex représente la connaissance magique et les grimoires. Les praticiens de Codex maîtrisent des sorts polyvalents via leurs livres de sorts.',
    classes: ['Bard', 'Wizard'],
    themes: ['Grimoires', 'Sorts multiples', 'Connaissance'],
    hasSpells: true,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Scholar\'s Tome',
        type: 'grimoire',
        recallCost: 1,
        feature: 'Ce grimoire contient 3 sorts : Lumière (illumine une zone Proche), Texte Fantôme (inscrit un message invisible), et Analyse (identifie la nature magique d\'un objet ou d\'un effet).'
      },
      {
        level: 3,
        name: 'Battle Codex',
        type: 'grimoire',
        recallCost: 2,
        feature: 'Ce grimoire contient 2 sorts : Projectile Magique (2d6 dégâts magiques, Portée Lointaine, pas de jet d\'attaque) et Bouclier Arcanique (réduisez les prochains dégâts subis de 1d8).'
      },
      {
        level: 7,
        name: 'Codex-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Codex : vous pouvez préparer un sort supplémentaire de vos grimoires et réduisez d\'1 Espoir le coût de rappel de tous vos sorts de Codex.'
      }
    ]
  },
  {
    id: 'grace',
    name: 'Grace',
    emoji: '🎭',
    color: '#d97706',
    description: 'Le domaine de Grace représente le charme, la performance et la connexion sociale. Les praticiens de Grace influencent les autres par leur présence et leur charisme.',
    classes: ['Bard', 'Rogue', 'Duellist'],
    themes: ['Charisme', 'Performance', 'Influence sociale'],
    hasSpells: true,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Inspiring Words',
        type: 'ability',
        recallCost: 0,
        feature: 'En tant qu\'action, prononcez des mots d\'encouragement à un allié à Portée Proche. Il peut effacer un Stress ou ajouter +1 à son prochain jet d\'action.'
      },
      {
        level: 2,
        name: 'Silver Tongue',
        type: 'spell',
        recallCost: 1,
        feature: 'Faites un jet de Présence contre une cible humanoïde à Portée Proche. En cas de succès, elle devient Friendly jusqu\'à la fin de la scène ou jusqu\'à ce que vous la menacez.'
      },
      {
        level: 7,
        name: 'Grace-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Grace : gagnez +1 à Présence permanemment et vos capacités de Grace affectant les alliés leur accordent un bonus +1 supplémentaire.'
      }
    ]
  },
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    color: '#4c1d95',
    description: 'Le domaine de Midnight représente les ombres, les secrets et l\'infiltration. Les adeptes de Midnight opèrent dans l\'obscurité, frappant là où on ne les attend pas.',
    classes: ['Rogue', 'Assassin'],
    themes: ['Ombres', 'Infiltration', 'Secrets'],
    hasSpells: true,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Shadow Step',
        type: 'ability',
        recallCost: 0,
        feature: 'Marquez un Stress pour vous fondre dans les ombres. Vous devenez Caché (Hidden) jusqu\'à ce que vous attaquiez, parliez fort ou entriez dans la lumière vive.'
      },
      {
        level: 2,
        name: 'Umbral Strike',
        type: 'spell',
        recallCost: 1,
        feature: 'Depuis les ombres, lancez une lame d\'énergie sombre. Faites un jet de Sort contre une cible à Portée Lointaine — succès : 2d8 dégâts magiques. Si vous êtes Caché, ajoutez +1d8 et restez Caché.'
      },
      {
        level: 7,
        name: 'Midnight-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Midnight : vous êtes toujours considéré comme étant dans les ombres pour les capacités qui en dépendent, même en plein jour.'
      }
    ]
  },
  {
    id: 'sage',
    name: 'Sage',
    emoji: '🌿',
    color: '#15803d',
    description: 'Le domaine de Sage représente la connexion avec la nature, les animaux et les éléments naturels. Les adeptes de Sage tirent leur pouvoir du monde vivant.',
    classes: ['Druid', 'Ranger'],
    themes: ['Nature', 'Animaux', 'Éléments naturels'],
    hasSpells: true,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Nature\'s Grasp',
        type: 'spell',
        recallCost: 1,
        feature: 'Des vignes surgissent du sol à Portée Proche. Faites un jet de Sort — en cas de succès, toutes les cibles dans la zone sont Entravées jusqu\'à la fin du prochain round.'
      },
      {
        level: 2,
        name: 'Animal Companion',
        type: 'ability',
        recallCost: 0,
        feature: 'Vous avez un compagnon animal fidèle (choisissez son type au niveau 1). Il agit selon vos ordres, a les stats d\'un adversaire de votre tier, et réapparaît après un Repos Long s\'il est vaincu.'
      },
      {
        level: 7,
        name: 'Sage-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Sage : votre compagnon animal gagne +1 PV et vos sorts de Sage infligent +1d6 aux créatures artificielles ou mortes-vivantes.'
      }
    ]
  },
  {
    id: 'splendor',
    name: 'Splendor',
    emoji: '✨',
    color: '#eab308',
    description: 'Le domaine de Splendor représente la lumière divine, la guérison et la protection sacrée. Les adeptes de Splendor canalisent des forces célestes pour soigner et bouclier leurs alliés.',
    classes: ['Seraph', 'Wizard'],
    themes: ['Lumière divine', 'Guérison', 'Protection'],
    hasSpells: true,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Radiant Touch',
        type: 'spell',
        recallCost: 1,
        feature: 'Touchez un allié et appelez la lumière divine. Il efface 1 PV marqué et gagne +1 à ses jets d\'action jusqu\'à la fin de la scène.'
      },
      {
        level: 2,
        name: 'Holy Shield',
        type: 'spell',
        recallCost: 1,
        feature: 'Créez une barrière lumineuse autour d\'un allié à Portée Proche. Il gagne +3 points d\'armure temporaires jusqu\'au début de votre prochain tour.'
      },
      {
        level: 7,
        name: 'Splendor-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Splendor : vos sorts de guérison effacent 1 PV supplémentaire et vous gagnez +1 à l\'Évasion quand vous êtes dans la lumière.'
      }
    ]
  },
  {
    id: 'valor',
    name: 'Valor',
    emoji: '🛡️',
    color: '#1d4ed8',
    description: 'Le domaine de Valor représente la protection, le sacrifice et la résistance héroïque. Les champions de Valor s\'interposent entre leurs alliés et le danger.',
    classes: ['Guardian', 'Seraph'],
    themes: ['Protection', 'Sacrifice', 'Résistance'],
    hasSpells: false,
    cardCount: 21,
    sampleCards: [
      {
        level: 1,
        name: 'Shield Wall',
        type: 'ability',
        recallCost: 0,
        feature: 'En réaction quand un allié à Portée Très Proche subit des dégâts, vous pouvez marquer un Stress pour absorber la moitié de ces dégâts à sa place.'
      },
      {
        level: 2,
        name: 'Stalwart Defense',
        type: 'ability',
        recallCost: 0,
        feature: 'Tant que vous n\'avez pas bougé ce round, gagnez +2 à l\'Évasion et réduisez les dégâts subis de 1.'
      },
      {
        level: 7,
        name: 'Valor-Touched',
        type: 'ability',
        recallCost: 0,
        feature: 'Si 4+ de vos cartes sont du domaine Valor : réduisez tous les dégâts subis de 1 (minimum 1) et vos alliés à Portée Très Proche gagnent +1 à l\'Évasion.'
      }
    ]
  }
]

/**
 * Retourne un domaine par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getDomainById(id) {
  return DOMAINS.find((d) => d.id === id) || null
}

/**
 * Retourne les domaines associés à une classe.
 * @param {string} className
 * @returns {Object[]}
 */
export function getDomainsForClass(className) {
  return DOMAINS.filter((d) => d.classes.includes(className))
}
