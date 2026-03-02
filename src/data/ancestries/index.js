/**
 * @module ancestries/data
 * @description Ancestries officielles SRD + ancestries personnalisées + transformations.
 * Sources : OfficialClasses_SRD.pdf, CustomAncestries.txt, Transformations.txt
 */

/** Ancestries officielles du SRD Daggerheart (16 ancestries) */
export const SRD_ANCESTRIES = [
  {
    id: 'clank',
    name: 'Clank',
    emoji: '⚙️',
    source: 'srd',
    description: 'Les Clanks sont des constructions mécaniques dotées de conscience, façonnées dans un but précis.',
    topFeature: {
      name: 'Purposeful Design',
      description: 'Choisissez une expérience liée à votre conception originale. Vous avez toujours +2 à cette expérience.'
    },
    bottomFeature: {
      name: 'Exoskeleton',
      description: 'Votre corps mécanique vous accorde une armure innée. Réduisez chaque dégât physique de 1.'
    }
  },
  {
    id: 'drakona',
    name: 'Drakona',
    emoji: '🐉',
    source: 'srd',
    description: 'Les Drakonas sont des humanoïdes draconiques, portant les traces de leur héritage draconique dans leurs écailles et leur souffle.',
    topFeature: {
      name: 'Scales',
      description: 'Vos écailles fournissent une protection naturelle. Quand vous subissez des dégâts physiques, réduisez-les de 1 (minimum 1).'
    },
    bottomFeature: {
      name: 'Dragon Breath',
      description: 'Marquez un Stress pour exhaler un souffle élémentaire en cône proche. Toutes les cibles subissent d4 dégâts physiques ou magiques (choisissez au niveau 1).'
    }
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    emoji: '⛏️',
    source: 'srd',
    description: 'Les Nains sont des humanoïdes robustes, réputés pour leur endurance et leur lien avec la pierre.',
    topFeature: {
      name: 'Thick Skin',
      description: 'Quand vous subissez des dégâts, réduisez la sévérité d\'un cran (Sévère → Majeur → Mineur).'
    },
    bottomFeature: {
      name: 'Stalwart',
      description: 'Vous avez avantage sur les jets pour résister aux effets de déplacement, de renversement ou de Entravé.'
    }
  },
  {
    id: 'elf',
    name: 'Elf',
    emoji: '🌿',
    source: 'srd',
    description: 'Les Elfes sont des humanoïdes gracieux, dotés de réflexes exceptionnels et d\'une connexion au monde naturel.',
    topFeature: {
      name: 'Quick Reactions',
      description: 'Vous avez avantage sur les jets de réaction.'
    },
    bottomFeature: {
      name: 'Fluid Movement',
      description: 'Marquez un Stress pour déplacer une portée supplémentaire dans le cadre d\'un mouvement ou d\'une action impliquant le mouvement.'
    }
  },
  {
    id: 'faerie',
    name: 'Faerie',
    emoji: '✨',
    source: 'srd',
    description: 'Les Fées sont de petites créatures magiques, capables de voler et de manipuler la chance.',
    topFeature: {
      name: 'Luckbender',
      description: 'Une fois par session, après avoir vu le résultat d\'un jet (le vôtre ou celui d\'un allié), vous pouvez le faire relancer.'
    },
    bottomFeature: {
      name: 'Wings',
      description: 'Vous pouvez voler. Lors de déplacements au-dessus du sol, ignorez les obstacles au sol.'
    }
  },
  {
    id: 'faun',
    name: 'Faun',
    emoji: '🐐',
    source: 'srd',
    description: 'Les Faunes sont des humanoïdes mi-humains mi-chèvres, agiles et capables de sauts prodigieux.',
    topFeature: {
      name: 'Caprine Leap',
      description: 'Vous pouvez marquer un Stress pour vous déplacer de Très Loin à Portée de Mêlée sans jet, ignorant les obstacles terrestres.'
    },
    bottomFeature: {
      name: 'Sure-Footed',
      description: 'Vous avez avantage sur les jets pour naviguer sur des terrains difficiles, des surfaces étroites ou des hauteurs.'
    }
  },
  {
    id: 'fungril',
    name: 'Fungril',
    emoji: '🍄',
    source: 'srd',
    description: 'Les Fungrils sont des humanoïdes fongiques capables de communiquer via un réseau mycélien.',
    topFeature: {
      name: 'Fungril Network',
      description: 'Vous pouvez communiquer silencieusement avec tout Fungril dans la même scène. Vous pouvez aussi « écouter » l\'environnement en sentant les vibrations à Portée Proche.'
    },
    bottomFeature: {
      name: 'Spore Cloud',
      description: 'Marquez un Stress pour libérer des spores. Toutes les créatures à Portée Très Proche doivent réussir un jet de Résistance (10) ou être Disorientées jusqu\'à la fin de leur prochain tour.'
    }
  },
  {
    id: 'galapa',
    name: 'Galapa',
    emoji: '🐢',
    source: 'srd',
    description: 'Les Galapas sont des humanoïdes tortues, portant leur carapace protectrice et dotés d\'une grande résilience.',
    topFeature: {
      name: 'Shell',
      description: 'En tant qu\'action, rentrez dans votre carapace jusqu\'au début de votre prochain tour : réduisez les dégâts subis de moitié, mais vous ne pouvez pas vous déplacer ni attaquer.'
    },
    bottomFeature: {
      name: 'Slow but Steady',
      description: 'Quand vous ratez un jet, vous pouvez marquer un Stress pour le relancer en gardant le second résultat.'
    }
  },
  {
    id: 'giant',
    name: 'Giant',
    emoji: '🗻',
    source: 'srd',
    description: 'Les Géants sont des humanoïdes imposants, dotés d\'une endurance et d\'une force extraordinaires.',
    topFeature: {
      name: 'Endurance',
      description: 'Vous gagnez un emplacement de PV supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Towering',
      description: 'Votre taille vous permet de porter deux armes lourdes ou d\'utiliser des armes à deux mains dans une seule main (mais pas deux).'
    }
  },
  {
    id: 'halfling',
    name: 'Halfling',
    emoji: '🍀',
    source: 'srd',
    description: 'Les Halflings sont de petites créatures chanceuses, réputées pour apporter la bonne fortune à leur entourage.',
    topFeature: {
      name: 'Luckbringer',
      description: 'Une fois par session courte, quand un allié à Portée Proche rate un jet, il peut le relancer (vous ou lui choisissez lequel garder).'
    },
    bottomFeature: {
      name: 'Small Stature',
      description: 'Vous avez avantage sur les jets pour vous cacher, passer inaperçu ou vous faufiler dans des espaces étroits.'
    }
  },
  {
    id: 'human',
    name: 'Human',
    emoji: '👤',
    source: 'srd',
    description: 'Les Humains sont polyvalents et adaptables, capables d\'exceller dans n\'importe quel domaine grâce à leur ténacité.',
    topFeature: {
      name: 'High Stamina',
      description: 'Vous gagnez un emplacement de Stress supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Adaptable',
      description: 'Choisissez une caractéristique (Agilité, Force, Finesse, Instinct, Présence ou Savoir). Vous avez avantage sur les jets utilisant cette caractéristique une fois par courte pause.'
    }
  },
  {
    id: 'infernis',
    name: 'Infernis',
    emoji: '🔥',
    source: 'srd',
    description: 'Les Infernis sont des humanoïdes liés aux plans infernaux, capables de canaliser la puissance des flammes.',
    topFeature: {
      name: 'Fearless',
      description: 'Vous êtes immunisé à la condition Effrayé. De plus, une fois par session, vous pouvez dépenser 2 Espoir pour inspirer la peur à une cible dans la scène.'
    },
    bottomFeature: {
      name: 'Hellfire Touch',
      description: 'Marquez un Stress pour enflammer votre arme jusqu\'à la fin de la scène. Elle inflige des dégâts magiques et ajoute +1d6 dégâts de feu.'
    }
  },
  {
    id: 'katari',
    name: 'Katari',
    emoji: '🐱',
    source: 'srd',
    description: 'Les Kataris sont des humanoïdes félins, agiles et dotés d\'instincts prédateurs affûtés.',
    topFeature: {
      name: 'Feline Instincts',
      description: 'Quand vous obtenez un résultat critique (avec Espoir) sur un jet d\'Instinct, vous gagnez un Espoir supplémentaire.'
    },
    bottomFeature: {
      name: 'Cat\'s Grace',
      description: 'Vous ne subissez jamais de dégâts de chute. De plus, vous pouvez escalader des surfaces verticales sans jet si elles offrent des prises.'
    }
  },
  {
    id: 'orc',
    name: 'Orc',
    emoji: '💪',
    source: 'srd',
    description: 'Les Orcs sont des humanoïdes robustes, dotés d\'une résistance naturelle et d\'une force brute impressionnante.',
    topFeature: {
      name: 'Sturdy',
      description: 'Quand vous subissez des dégâts Majeurs ou Sévères, vous pouvez marquer un Stress pour réduire la sévérité d\'un cran.'
    },
    bottomFeature: {
      name: 'Tenacious',
      description: 'Une fois par session courte, quand vous seriez forcé d\'effectuer un Mouvement de Mort, vous pouvez à la place marquer tous vos emplacements de Stress et rester debout avec 1 PV.'
    }
  },
  {
    id: 'ribbet',
    name: 'Ribbet',
    emoji: '🐸',
    source: 'srd',
    description: 'Les Ribbets sont des humanoïdes amphibiens, capables de nager aussi bien qu\'ils marchent.',
    topFeature: {
      name: 'Amphibious',
      description: 'Vous respirez sous l\'eau et nagez à la même vitesse que vous marchez. Vous avez avantage sur les jets liés à l\'environnement aquatique.'
    },
    bottomFeature: {
      name: 'Sticky Tongue',
      description: 'Marquez un Stress pour saisir un objet ou une arme à Portée Proche avec votre langue. Si c\'est une arme ennemie, l\'adversaire doit réussir un jet de Force contre votre jet de Finesse pour la récupérer.'
    }
  },
  {
    id: 'simiah',
    name: 'Simiah',
    emoji: '🐒',
    source: 'srd',
    description: 'Les Simiahs sont des humanoïdes primates agiles, capables d\'escalader et de se déplacer avec une agilité remarquable.',
    topFeature: {
      name: 'Natural Climber',
      description: 'Vous escaladez à votre vitesse de déplacement normale. Vous pouvez utiliser vos pieds comme mains pour tenir des objets ou des armes.'
    },
    bottomFeature: {
      name: 'Prehensile Tail',
      description: 'Votre queue peut tenir un objet d\'une main ou interagir avec votre environnement. Vous avez avantage sur les jets pour ne pas lâcher un objet tenu ou pour les acrobaties.'
    }
  }
]

/** Ancestries personnalisées (campagne) */
export const CUSTOM_ANCESTRIES = [
  {
    id: 'ael',
    name: 'Aêl',
    emoji: '🌊',
    source: 'custom',
    description: 'Les Aêls sont des humanoïdes gracieux à la peau nacrée et à la voix feutrée, semblant toujours légèrement détachés du monde.',
    topFeature: {
      name: 'Glissement d\'Alcyon',
      description: 'Lorsque tu réussis un jet d\'Agilité pour passer de Loin ou Très Loin à Portée de mêlée d\'une ou plusieurs cibles, tu peux marquer 1 Stress pour infliger 1d12 dégâts à toutes les cibles à portée de mêlée.'
    },
    bottomFeature: {
      name: 'Détachement',
      description: 'Lorsque tu devrais marquer un Stress, lance 1d6. Sur un résultat de 6, ne marque pas ce Stress.'
    }
  },
  {
    id: 'nuur',
    name: 'Nuur',
    emoji: '🎶',
    source: 'custom',
    description: 'Les Nuur sont des humanoïdes de taille moyenne, à la peau sombre, connus pour leurs mains habiles et leur esprit créatif.',
    topFeature: {
      name: 'Communion',
      description: 'Au début de chaque session, le groupe commence par se remémorer un chant, un poème ou un geste appris ensemble. Chaque membre du groupe qui participe gagne 1 Espoir.'
    },
    bottomFeature: {
      name: 'Réglage fin',
      description: 'Lorsque tu obtiens un 1 sur ton dé d\'Espoir, tu peux le relancer.'
    }
  },
  {
    id: 'iries',
    name: 'Iries',
    emoji: '💤',
    source: 'custom',
    description: 'Les Iries sont de petits humanoïdes vifs, habitués aux galeries souterraines et aux espaces clos.',
    topFeature: {
      name: 'Réseau onirique',
      description: 'Fais un jet d\'Instinct (12) pour utiliser le rêve afin de contacter un autre Iries. En cas de succès, tu peux communiquer à toute distance.'
    },
    bottomFeature: {
      name: 'Mémoire résiduelle',
      description: 'Lorsque tu touches le corps d\'une créature morte récemment, tu peux marquer 1 Stress pour extraire une réminiscence liée à une émotion ou une sensation.'
    }
  },
  {
    id: 'liane',
    name: 'Liane',
    emoji: '🌴',
    source: 'custom',
    description: 'Les Lianes sont de grands humanoïdes élancés, natifs de jungles géantes.',
    topFeature: {
      name: 'Corps de Canopée',
      description: 'Sur un jet d\'Agilité, tu peux marquer un Stress pour tirer avec Avantage.'
    },
    bottomFeature: {
      name: 'Équilibre Exigeant',
      description: 'Lors d\'un repos, tu peux entrer en méditation pour effectuer une action supplémentaire.'
    }
  },
  {
    id: 'plassedien',
    name: 'Plassédien·ne',
    emoji: '🏙️',
    source: 'custom',
    description: 'Les Plassédien·nes sont des humanoïdes de taille moyenne, à l\'aise dans les foules et les réseaux sociaux des grandes cités.',
    topFeature: {
      name: 'Endurance Élevée',
      description: 'Gagne un emplacement de Stress supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Adaptabilité',
      description: 'Lorsque tu rates un jet qui utilisait l\'une de tes Expériences, tu peux marquer un Stress pour relancer.'
    }
  },
  {
    id: 'skjalma',
    name: 'Skjalma',
    emoji: '🏔️',
    source: 'custom',
    description: 'Les Skjalma sont de puissants humanoïdes de grande taille, larges d\'épaules et endurants, forgés par les steppes du nord.',
    topFeature: {
      name: 'Endurance',
      description: 'Tu gagnes un PV supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Portée',
      description: 'Traite toute arme, capacité, sort ou autre aptitude ayant une portée de Mêlée comme si elle avait une portée Très Proche à la place.'
    }
  }
]

/** Transformations (cartes spéciales, SRD) */
export const TRANSFORMATIONS = [
  {
    id: 'vampire',
    name: 'Vampire',
    emoji: '🧛',
    source: 'transformation',
    description: 'Créatures non-mortes aux crocs acérés qui se nourrissent du sang des vivants.',
    topFeature: {
      name: 'Crocs',
      description: 'Effectuez un jet de Force pour mordre une cible à Portée de Mêlée, infligeant dS dégâts physiques en utilisant votre Maîtrise.'
    },
    bottomFeature: {
      name: 'Se nourrir',
      description: 'Après une attaque Crocs réussie, marquez un Stress pour vous nourrir. Placez des jetons sur cette carte égaux aux PV que la cible marque (max 5). Dépensez un jeton avant un jet d\'action pour que votre dé de Peur devienne un d20. Lors d\'un Repos Long, perdez un jeton. Sans jetons, tous vos jets d\'action et de réaction se font avec désavantage.'
    }
  },
  {
    id: 'werewolf',
    name: 'Loup-Garou',
    emoji: '🐺',
    source: 'transformation',
    description: 'Créatures capables de se transformer en loups surnaturels.',
    topFeature: {
      name: 'Forme de Loup',
      description: 'Quand vous marquez un ou plusieurs PV, vous pouvez marquer un Stress pour entrer en Forme de Loup. Gagnez un dé de Loup (d10) ajouté à tous les jets d\'attaque et de dégâts. Quand vous gagneriez de l\'Espoir en Forme de Loup, marquez un Stress à la place.'
    },
    bottomFeature: {
      name: 'Frénésie',
      description: 'Quand vous marquez votre dernier Stress en Forme de Loup, entrez en Frénésie. Lancez un nombre de d20s égal à votre tier et infligez automatiquement autant de dégâts physiques à toutes les créatures à Portée Très Proche. Sortez ensuite de la Forme de Loup.'
    }
  },
  {
    id: 'reanimated',
    name: 'Réanimé·e',
    emoji: '💀',
    source: 'transformation',
    description: 'Cadavres ramenés à la vie par une force mystérieuse.',
    topFeature: {
      name: 'Rafistolage',
      description: 'Lors d\'un repos, vous ne pouvez effacer des PV que si vous avez accès aux restes d\'une créature récemment décédée. Décrivez comment l\'utilisation de ce matériau affecte votre apparence. Vous ne pouvez effacer des PV que lors d\'un repos prolongé ou du Mouvement de Mort "Tout risquer".'
    },
    bottomFeature: {
      name: 'Cadavre',
      description: 'Quand vous Tout risquez sur un Mouvement de Mort, si vous échouez, vous pouvez marquer définitivement un PV pour réussir quand même. Utilisez toujours la valeur du Dé d\'Espoir pour effacer PV et Stress.'
    }
  },
  {
    id: 'shapeshifter',
    name: 'Métamorphe',
    emoji: '🔄',
    source: 'transformation',
    description: 'Créatures capables de modifier leur forme physique.',
    topFeature: {
      name: 'Changer de Forme',
      description: 'Lors d\'un Repos Long, vous pouvez dépenser un mouvement de temps libre pour échanger votre ascendance actuelle contre une autre. Décrivez comment votre apparence change.'
    },
    bottomFeature: {
      name: 'Juste une Apparence',
      description: 'Quand vous Changez de Forme, vous ne bénéficiez que d\'une des capacités de l\'ascendance, que vous choisissez. Vous pouvez dépenser un mouvement de temps libre pour changer de capacité.'
    }
  },
  {
    id: 'ghost',
    name: 'Fantôme',
    emoji: '👻',
    source: 'transformation',
    description: 'Esprits coincés entre le monde mortel et le voile de la mort.',
    topFeature: {
      name: 'Forme Spirituelle',
      description: 'Marquez un Stress pour basculer entre forme corporelle et incorporelle. En Forme Spirituelle : traversez les objets solides, immunité aux dégâts physiques, subissez le double de dégâts magiques. Dépensez 2 Espoir pour attaquer ou interagir physiquement avec le monde matériel.'
    },
    bottomFeature: {
      name: 'Éphémère',
      description: 'Rayez un emplacement de PV à la prise de cette carte et à chaque augmentation de tier. Quand vous marquez votre dernier PV, vous devez choisir Éclat de Gloire comme Mouvement de Mort.'
    }
  },
  {
    id: 'demigod',
    name: 'Demi-Dieu',
    emoji: '⚡',
    source: 'transformation',
    description: 'Créatures dont les veines coulent le sang des dieux.',
    topFeature: {
      name: 'Ichor des Dieux',
      description: 'Votre dé d\'avantage est toujours un d10 au lieu d\'un d6.'
    },
    bottomFeature: {
      name: 'Poids de la Divinité',
      description: 'Quand vous obtenez un échec avec Peur, vous devez marquer un Stress ou donner au MJ une Peur supplémentaire.'
    }
  }
]

/** Toutes les ancestries combinées */
export const ALL_ANCESTRIES = [...SRD_ANCESTRIES, ...CUSTOM_ANCESTRIES]

/**
 * Retourne une ancestry par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getAncestryById(id) {
  return ALL_ANCESTRIES.find((a) => a.id === id) || null
}

/**
 * Retourne une transformation par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getTransformationById(id) {
  return TRANSFORMATIONS.find((t) => t.id === id) || null
}
