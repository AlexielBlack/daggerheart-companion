/**
 * @module ancestries/data
 * @description Ancestries officielles SRD + ancestries personnalisées + transformations.
 * Sources : OfficialAncestries_SRD.pdf, Daggerheart_Homebrew_KIT.pdf,
 *           CustomAncestries.txt, Transformations.txt
 *
 * PHASE 4 — Données vérifiées le 02/03/2026 contre le SRD officiel.
 * 18 ancestries officielles + Mixed Ancestry + 6 custom + 6 transformations.
 */

/** Ancestries officielles du SRD Daggerheart (18 ancestries + Mixed Ancestry) */
export const SRD_ANCESTRIES = [
  {
    id: 'clank',
    name: 'Clank',
    emoji: '⚙️',
    source: 'srd',
    description:
      'Les Clanks sont des êtres mécaniques conscients, façonnés à partir de divers matériaux comme le métal, le bois ou la pierre. Ils peuvent ressembler à des humanoïdes, des animaux ou même des objets inanimés. Leur corps est effectivement immortel tant qu\'ils peuvent acquérir de nouvelles pièces, mais leur esprit se détériore avec le temps à mesure que la magie qui les alimente perd en puissance.',
    topFeature: {
      name: 'Purposeful Design',
      description:
        'Décidez qui vous a créé et dans quel but. À la création du personnage, choisissez une de vos Expériences qui correspond le mieux à ce but et gagnez un bonus permanent de +1 à celle-ci.'
    },
    bottomFeature: {
      name: 'Efficient',
      description:
        'Quand vous prenez un repos court, vous pouvez choisir un mouvement de repos long au lieu d\'un mouvement de repos court.'
    }
  },
  {
    id: 'drakona',
    name: 'Drakona',
    emoji: '🐉',
    source: 'srd',
    description:
      'Les Drakonas ressemblent à des dragons sans ailes sous forme humanoïde, possédant un souffle élémentaire puissant et d\'épaisses écailles offrant une excellente armure naturelle. Contrairement à leurs ancêtres dragons, ils ne peuvent pas voler sans aide magique. Ils vivent environ 350 ans.',
    topFeature: {
      name: 'Scales',
      description:
        'Vos écailles agissent comme une protection naturelle. Quand vous subiriez des dégâts Sévères, vous pouvez marquer un Stress pour marquer 1 PV de moins.'
    },
    bottomFeature: {
      name: 'Elemental Breath',
      description:
        'Choisissez un élément pour votre souffle (comme l\'électricité, le feu ou la glace). Vous pouvez utiliser ce souffle contre une cible ou un groupe de cibles à portée Très Proche, en le traitant comme une arme d\'Instinct qui inflige d8 dégâts magiques en utilisant votre Maîtrise.'
    }
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    emoji: '⛏️',
    source: 'srd',
    description:
      'Les Nains sont des humanoïdes de petite taille au cadre carré, à la musculature dense et aux cheveux épais. Leur peau et leurs ongles contiennent beaucoup de kératine, les rendant naturellement résistants. Ils vivent jusqu\'à environ 250 ans, conservant leur masse musculaire jusqu\'à un âge avancé.',
    topFeature: {
      name: 'Thick Skin',
      description:
        'Quand vous subissez des dégâts Mineurs, vous pouvez marquer 2 Stress au lieu de marquer un PV.'
    },
    bottomFeature: {
      name: 'Increased Fortitude',
      description:
        'Dépensez 3 Espoir pour réduire de moitié les dégâts physiques entrants.'
    }
  },
  {
    id: 'elf',
    name: 'Elf',
    emoji: '🌿',
    source: 'srd',
    description:
      'Les Elfes sont des humanoïdes grands aux oreilles pointues et aux sens finement aiguisés. Ils peuvent entrer en transe céleste plutôt que dormir. Certains possèdent une « forme mystique » qui transforme leur apparence physique. Ils vivent environ 350 ans.',
    topFeature: {
      name: 'Quick Reactions',
      description:
        'Marquez un Stress pour obtenir l\'avantage sur un jet de réaction.'
    },
    bottomFeature: {
      name: 'Celestial Trance',
      description:
        'Pendant un repos, vous pouvez entrer en transe pour choisir un mouvement de temps libre supplémentaire.'
    }
  },
  {
    id: 'faerie',
    name: 'Faerie',
    emoji: '✨',
    source: 'srd',
    description:
      'Les Fées sont des créatures humanoïdes ailées aux traits insectoïdes. Elles possèdent des ailes membraneuses et passent chacune par un processus de métamorphose unique. Leur taille varie de 60 cm à 2 m. Elles vivent environ 50 ans.',
    topFeature: {
      name: 'Luckbender',
      description:
        'Une fois par session, après que vous ou un allié consentant à portée Proche avez fait un jet d\'action, vous pouvez dépenser 3 Espoir pour relancer les Dés de Dualité.'
    },
    bottomFeature: {
      name: 'Wings',
      description:
        'Vous pouvez voler. En vol, vous pouvez marquer un Stress après qu\'un adversaire ait fait une attaque contre vous pour gagner un bonus de +2 à votre Évasion contre cette attaque.'
    }
  },
  {
    id: 'faun',
    name: 'Faun',
    emoji: '🐐',
    source: 'srd',
    description:
      'Les Faunes ressemblent à des chèvres humanoïdes avec des cornes courbées, des pupilles carrées et des sabots fendus. La plupart ont un torse humanoïde et un bas du corps caprin couvert de fourrure dense. Ils vivent environ 225 ans.',
    topFeature: {
      name: 'Caprine Leap',
      description:
        'Vous pouvez sauter n\'importe où à portée Proche comme s\'il s\'agissait d\'un mouvement normal, vous permettant de franchir des obstacles, sauter par-dessus des gouffres ou escalader des barrières avec facilité.'
    },
    bottomFeature: {
      name: 'Kick',
      description:
        'Quand vous réussissez une attaque contre une cible à portée de Mêlée, vous pouvez marquer un Stress pour la repousser d\'un coup de sabot, infligeant 2d6 dégâts supplémentaires et repoussant soit vous-même soit la cible à portée Très Proche.'
    }
  },
  {
    id: 'firbolg',
    name: 'Firbolg',
    emoji: '🐂',
    source: 'srd',
    description:
      'Les Firbolgs sont des humanoïdes bovins reconnaissables à leur nez large et leurs longues oreilles tombantes. Certains ont des têtes entièrement bovines (souvent appelés minotaures). Grands et musclés (1m50 à 2m10), ils sont couverts de fourrure aux teintes terreuses ou pastel. Ils vivent environ 150 ans.',
    topFeature: {
      name: 'Charge',
      description:
        'Quand vous réussissez un jet d\'Agilité pour vous déplacer de Loin ou Très Loin à portée de Mêlée d\'une ou plusieurs cibles, vous pouvez marquer un Stress pour infliger 1d12 dégâts physiques à toutes les cibles à portée de Mêlée.'
    },
    bottomFeature: {
      name: 'Unshakable',
      description:
        'Quand vous devriez marquer un Stress, lancez un d6. Sur un résultat de 6, ne le marquez pas.'
    }
  },
  {
    id: 'fungril',
    name: 'Fungril',
    emoji: '🍄',
    source: 'srd',
    description:
      'Les Fungrils ressemblent à des champignons humanoïdes. Ils présentent une incroyable variété de corps, de visages et de couleurs. Ils peuvent communiquer de manière non verbale via un réseau mycélien. Ils vivent environ 300 ans, parfois bien plus.',
    topFeature: {
      name: 'Fungril Network',
      description:
        'Faites un jet d\'Instinct (12) pour utiliser votre réseau mycélien afin de parler avec d\'autres membres de votre ascendance. En cas de succès, vous pouvez communiquer à n\'importe quelle distance.'
    },
    bottomFeature: {
      name: 'Death Connection',
      description:
        'En touchant un cadavre mort récemment, vous pouvez marquer un Stress pour extraire un souvenir du cadavre lié à une émotion ou sensation spécifique de votre choix.'
    }
  },
  {
    id: 'galapa',
    name: 'Galapa',
    emoji: '🐢',
    source: 'srd',
    description:
      'Les Galapas ressemblent à des tortues anthropomorphes avec de grandes carapaces en dôme dans lesquelles ils peuvent se rétracter. Ils mesurent entre 1m20 et 1m80. La plupart se déplacent lentement et vivent environ 150 ans.',
    topFeature: {
      name: 'Shell',
      description:
        'Gagnez un bonus à vos seuils de dégâts égal à votre Maîtrise.'
    },
    bottomFeature: {
      name: 'Retract',
      description:
        'Marquez un Stress pour vous rétracter dans votre carapace. Dans votre carapace, vous avez la résistance aux dégâts physiques, vous avez le désavantage sur les jets d\'action, et vous ne pouvez pas vous déplacer.'
    }
  },
  {
    id: 'giant',
    name: 'Giant',
    emoji: '🗻',
    source: 'srd',
    description:
      'Les Géants sont des humanoïdes imposants aux larges épaules, longs bras, et possédant d\'un à trois yeux. Les adultes mesurent de 2m à 2m60. Ceux avec un seul œil sont communément appelés cyclopes. Ils vivent environ 75 ans.',
    topFeature: {
      name: 'Endurance',
      description:
        'Gagnez un emplacement de PV supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Reach',
      description:
        'Traitez toute arme, capacité, sort ou autre aptitude ayant une portée de Mêlée comme ayant une portée Très Proche à la place.'
    }
  },
  {
    id: 'goblin',
    name: 'Goblin',
    emoji: '👂',
    source: 'srd',
    description:
      'Les Gobelins sont de petits humanoïdes reconnaissables à leurs grands yeux et leurs énormes oreilles membraneuses. Dotés d\'une ouïe fine et d\'une vue perçante, ils perçoivent les détails à grande distance et dans l\'obscurité. Ils mesurent entre 90 cm et 1m20 et vivent environ 100 ans.',
    topFeature: {
      name: 'Surefooted',
      description:
        'Vous ignorez le désavantage sur les jets d\'Agilité.'
    },
    bottomFeature: {
      name: 'Danger Sense',
      description:
        'Une fois par repos, marquez un Stress pour forcer un adversaire à relancer une attaque contre vous ou un allié à portée Très Proche.'
    }
  },
  {
    id: 'halfling',
    name: 'Halfling',
    emoji: '🍀',
    source: 'srd',
    description:
      'Les Halflings sont de petits humanoïdes aux grands pieds poilus et aux oreilles arrondies proéminentes. Naturellement accordés aux champs magnétiques du Monde Mortel, ils possèdent un solide sens de l\'orientation interne. Ils vivent environ 150 ans.',
    topFeature: {
      name: 'Luckbringer',
      description:
        'Au début de chaque session, tous les membres de votre groupe gagnent un Espoir.'
    },
    bottomFeature: {
      name: 'Internal Compass',
      description:
        'Quand vous obtenez un 1 sur votre Dé d\'Espoir, vous pouvez le relancer.'
    }
  },
  {
    id: 'human',
    name: 'Human',
    emoji: '👤',
    source: 'srd',
    description:
      'Les Humains sont reconnaissables à leurs mains dextres, leurs oreilles arrondies et leurs corps taillés pour l\'endurance. Physiquement adaptables, ils s\'ajustent facilement aux climats rudes. Ils vivent environ 100 ans.',
    topFeature: {
      name: 'High Stamina',
      description:
        'Gagnez un emplacement de Stress supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Adaptability',
      description:
        'Quand vous ratez un jet qui utilisait une de vos Expériences, vous pouvez marquer un Stress pour relancer.'
    }
  },
  {
    id: 'infernis',
    name: 'Infernis',
    emoji: '🔥',
    source: 'srd',
    description:
      'Les Infernis sont des humanoïdes possédant des dents canines acérées, des oreilles pointues et des cornes. Descendants de démons des Cercles Inférieurs, ils possèdent un « visage terrifiant » qui se manifeste lors d\'émotions fortes ou volontairement. Ils vivent jusqu\'à 350 ans.',
    topFeature: {
      name: 'Fearless',
      description:
        'Quand vous lancez avec Peur, vous pouvez marquer 2 Stress pour transformer ce jet en un jet avec Espoir à la place.'
    },
    bottomFeature: {
      name: 'Dread Visage',
      description:
        'Vous avez l\'avantage sur les jets pour intimider les créatures hostiles.'
    }
  },
  {
    id: 'katari',
    name: 'Katari',
    emoji: '🐱',
    source: 'srd',
    description:
      'Les Kataris sont des humanoïdes félins aux griffes rétractables, pupilles verticales et hautes oreilles triangulaires. Leurs oreilles pivotent à près de 180° pour détecter les sons. Ils mesurent de 90 cm à 2 m et vivent environ 150 ans.',
    topFeature: {
      name: 'Feline Instincts',
      description:
        'Quand vous faites un jet d\'Agilité, vous pouvez dépenser 2 Espoir pour relancer votre Dé d\'Espoir.'
    },
    bottomFeature: {
      name: 'Retracting Claws',
      description:
        'Faites un jet d\'Agilité pour griffer une cible à portée de Mêlée. En cas de succès, elle devient temporairement Vulnérable.'
    }
  },
  {
    id: 'orc',
    name: 'Orc',
    emoji: '💪',
    source: 'srd',
    description:
      'Les Orcs sont des humanoïdes reconnaissables à leurs traits carrés et leurs défenses de sanglier qui dépassent de la mâchoire inférieure. Ils vivent environ 125 ans, et leurs défenses continuent de croître toute leur vie. Ils tendent vers une carrure musclée.',
    topFeature: {
      name: 'Sturdy',
      description:
        'Quand il ne vous reste qu\'1 PV, les attaques contre vous ont le désavantage.'
    },
    bottomFeature: {
      name: 'Tusks',
      description:
        'Quand vous réussissez une attaque contre une cible à portée de Mêlée, vous pouvez dépenser un Espoir pour empaler la cible avec vos défenses, infligeant 1d6 dégâts supplémentaires.'
    }
  },
  {
    id: 'ribbet',
    name: 'Ribbet',
    emoji: '🐸',
    source: 'srd',
    description:
      'Les Ribbets ressemblent à des grenouilles anthropomorphes aux yeux protubérants et aux mains et pieds palmés. Ils se déplacent principalement en sautant. Ils mesurent de 90 cm à 1m35 et vivent environ 100 ans.',
    topFeature: {
      name: 'Amphibious',
      description:
        'Vous pouvez respirer et vous déplacer naturellement sous l\'eau.'
    },
    bottomFeature: {
      name: 'Long Tongue',
      description:
        'Vous pouvez utiliser votre longue langue pour saisir des choses à portée Proche. Marquez un Stress pour utiliser votre langue comme une arme de Finesse Proche qui inflige d12 dégâts physiques en utilisant votre Maîtrise.'
    }
  },
  {
    id: 'simiah',
    name: 'Simiah',
    emoji: '🐒',
    source: 'srd',
    description:
      'Les Simiahs ressemblent à des singes et grands singes anthropomorphes aux longs membres et pieds préhensiles. Grimpeurs habiles, ils passent aisément de la marche bipède à la marche sur les phalanges. Ils mesurent de 60 cm à 1m80 et vivent environ 100 ans.',
    topFeature: {
      name: 'Natural Climber',
      description:
        'Vous avez l\'avantage sur les jets d\'Agilité impliquant l\'équilibre et l\'escalade.'
    },
    bottomFeature: {
      name: 'Nimble',
      description:
        'Gagnez un bonus permanent de +1 à votre Évasion à la création du personnage.'
    }
  },
  {
    id: 'mixed-ancestry',
    name: 'Mixed Ancestry',
    emoji: '🔀',
    source: 'srd',
    description:
      'Si votre personnage descend de plusieurs ascendances, choisissez deux features parmi les ascendances de votre lignée : la première feature d\'une ascendance et la seconde d\'une autre. Vous ne pouvez pas prendre les deux premières ou les deux secondes features de deux ascendances différentes.',
    topFeature: {
      name: 'Mixed Top Feature',
      description:
        'Choisissez la Top Feature (première feature) d\'une des ascendances de votre lignée.'
    },
    bottomFeature: {
      name: 'Mixed Bottom Feature',
      description:
        'Choisissez la Bottom Feature (seconde feature) d\'une autre ascendance de votre lignée.'
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
    description:
      'Les Aêls sont des humanoïdes gracieux à la peau nacrée et à la voix feutrée, semblant toujours légèrement détachés du monde.',
    topFeature: {
      name: 'Glissement d\'Alcyon',
      description:
        'Lorsque tu réussis un jet d\'Agilité pour passer de Loin ou Très Loin à Portée de mêlée d\'une ou plusieurs cibles, tu peux marquer 1 Stress pour infliger 1d12 dégâts à toutes les cibles à portée de mêlée.'
    },
    bottomFeature: {
      name: 'Détachement',
      description:
        'Lorsque tu devrais marquer un Stress, lance 1d6. Sur un résultat de 6, ne marque pas ce Stress.'
    }
  },
  {
    id: 'nuur',
    name: 'Nuur',
    emoji: '🎶',
    source: 'custom',
    description:
      'Les Nuur sont des humanoïdes de taille moyenne, à la peau sombre, connus pour leurs mains habiles et leur esprit créatif.',
    topFeature: {
      name: 'Communion',
      description:
        'Au début de chaque session, le groupe commence par se remémorer un chant, un poème ou un geste appris ensemble. Chaque membre du groupe qui participe gagne 1 Espoir.'
    },
    bottomFeature: {
      name: 'Réglage fin',
      description:
        'Lorsque tu obtiens un 1 sur ton dé d\'Espoir, tu peux le relancer.'
    }
  },
  {
    id: 'iries',
    name: 'Iries',
    emoji: '💤',
    source: 'custom',
    description:
      'Les Iries sont de petits humanoïdes vifs, habitués aux galeries souterraines et aux espaces clos.',
    topFeature: {
      name: 'Réseau onirique',
      description:
        'Fais un jet d\'Instinct (12) pour utiliser le rêve afin de contacter un autre Iries. En cas de succès, tu peux communiquer à toute distance.'
    },
    bottomFeature: {
      name: 'Mémoire résiduelle',
      description:
        'Lorsque tu touches le corps d\'une créature morte récemment, tu peux marquer 1 Stress pour extraire une réminiscence liée à une émotion ou une sensation.'
    }
  },
  {
    id: 'liane',
    name: 'Liane',
    emoji: '🌴',
    source: 'custom',
    description:
      'Les Lianes sont de grands humanoïdes élancés, natifs de jungles géantes.',
    topFeature: {
      name: 'Corps de Canopée',
      description:
        'Sur un jet d\'Agilité, tu peux marquer un Stress pour tirer avec Avantage.'
    },
    bottomFeature: {
      name: 'Équilibre Exigeant',
      description:
        'Lors d\'un repos, tu peux entrer en méditation pour effectuer une action supplémentaire.'
    }
  },
  {
    id: 'plassedien',
    name: 'Plassédien·ne',
    emoji: '🏙️',
    source: 'custom',
    description:
      'Les Plassédien·nes sont des humanoïdes de taille moyenne, à l\'aise dans les foules et les réseaux sociaux des grandes cités.',
    topFeature: {
      name: 'Endurance Élevée',
      description:
        'Gagne un emplacement de Stress supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Adaptabilité',
      description:
        'Lorsque tu rates un jet qui utilisait l\'une de tes Expériences, tu peux marquer un Stress pour relancer.'
    }
  },
  {
    id: 'skjalma',
    name: 'Skjalma',
    emoji: '🏔️',
    source: 'custom',
    description:
      'Les Skjalma sont de puissants humanoïdes de grande taille, larges d\'épaules et endurants, forgés par les steppes du nord.',
    topFeature: {
      name: 'Endurance',
      description:
        'Tu gagnes un PV supplémentaire à la création du personnage.'
    },
    bottomFeature: {
      name: 'Portée',
      description:
        'Traite toute arme, capacité, sort ou autre aptitude ayant une portée de Mêlée comme si elle avait une portée Très Proche à la place.'
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
    description:
      'Créatures non-mortes aux crocs acérés qui se nourrissent du sang des vivants.',
    topFeature: {
      name: 'Crocs',
      description:
        'Effectuez un jet de Force pour mordre une cible à Portée de Mêlée, infligeant dS dégâts physiques en utilisant votre Maîtrise.'
    },
    bottomFeature: {
      name: 'Se nourrir',
      description:
        'Après une attaque Crocs réussie, marquez un Stress pour vous nourrir. Placez des jetons sur cette carte égaux aux PV que la cible marque (max 5). Dépensez un jeton avant un jet d\'action pour que votre dé de Peur devienne un d20. Lors d\'un Repos Long, perdez un jeton. Sans jetons, tous vos jets d\'action et de réaction se font avec désavantage.'
    }
  },
  {
    id: 'werewolf',
    name: 'Loup-Garou',
    emoji: '🐺',
    source: 'transformation',
    description:
      'Créatures capables de se transformer en loups surnaturels.',
    topFeature: {
      name: 'Forme de Loup',
      description:
        'Quand vous marquez un ou plusieurs PV, vous pouvez marquer un Stress pour entrer en Forme de Loup. Gagnez un dé de Loup (d10) ajouté à tous les jets d\'attaque et de dégâts. Quand vous gagneriez de l\'Espoir en Forme de Loup, marquez un Stress à la place.'
    },
    bottomFeature: {
      name: 'Frénésie',
      description:
        'Quand vous marquez votre dernier Stress en Forme de Loup, entrez en Frénésie. Lancez un nombre de d20s égal à votre tier et infligez automatiquement autant de dégâts physiques à toutes les créatures à Portée Très Proche. Sortez ensuite de la Forme de Loup.'
    }
  },
  {
    id: 'reanimated',
    name: 'Réanimé·e',
    emoji: '💀',
    source: 'transformation',
    description:
      'Cadavres ramenés à la vie par une force mystérieuse.',
    topFeature: {
      name: 'Rafistolage',
      description:
        'Lors d\'un repos, vous ne pouvez effacer des PV que si vous avez accès aux restes d\'une créature récemment décédée. Décrivez comment l\'utilisation de ce matériau affecte votre apparence. Vous ne pouvez effacer des PV que lors d\'un repos prolongé ou du Mouvement de Mort "Tout risquer".'
    },
    bottomFeature: {
      name: 'Cadavre',
      description:
        'Quand vous Tout risquez sur un Mouvement de Mort, si vous échouez, vous pouvez marquer définitivement un PV pour réussir quand même. Utilisez toujours la valeur du Dé d\'Espoir pour effacer PV et Stress.'
    }
  },
  {
    id: 'shapeshifter',
    name: 'Métamorphe',
    emoji: '🔄',
    source: 'transformation',
    description:
      'Créatures capables de modifier leur forme physique.',
    topFeature: {
      name: 'Changer de Forme',
      description:
        'Lors d\'un Repos Long, vous pouvez dépenser un mouvement de temps libre pour échanger votre ascendance actuelle contre une autre. Décrivez comment votre apparence change.'
    },
    bottomFeature: {
      name: 'Juste une Apparence',
      description:
        'Quand vous Changez de Forme, vous ne bénéficiez que d\'une des capacités de l\'ascendance, que vous choisissez. Vous pouvez dépenser un mouvement de temps libre pour changer de capacité.'
    }
  },
  {
    id: 'ghost',
    name: 'Fantôme',
    emoji: '👻',
    source: 'transformation',
    description:
      'Esprits coincés entre le monde mortel et le voile de la mort.',
    topFeature: {
      name: 'Forme Spirituelle',
      description:
        'Marquez un Stress pour basculer entre forme corporelle et incorporelle. En Forme Spirituelle : traversez les objets solides, immunité aux dégâts physiques, subissez le double de dégâts magiques. Dépensez 2 Espoir pour attaquer ou interagir physiquement avec le monde matériel.'
    },
    bottomFeature: {
      name: 'Éphémère',
      description:
        'Rayez un emplacement de PV à la prise de cette carte et à chaque augmentation de tier. Quand vous marquez votre dernier PV, vous devez choisir Éclat de Gloire comme Mouvement de Mort.'
    }
  },
  {
    id: 'demigod',
    name: 'Demi-Dieu',
    emoji: '⚡',
    source: 'transformation',
    description:
      'Créatures dont les veines coulent le sang des dieux.',
    topFeature: {
      name: 'Ichor des Dieux',
      description:
        'Votre dé d\'avantage est toujours un d10 au lieu d\'un d6.'
    },
    bottomFeature: {
      name: 'Poids de la Divinité',
      description:
        'Quand vous obtenez un échec avec Peur, vous devez marquer un Stress ou donner au MJ une Peur supplémentaire.'
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
