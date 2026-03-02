/**
 * @module communities/data
 * @description Communautés officielles du SRD Daggerheart.
 * Source : Communities_SRD.pdf
 */

export const COMMUNITIES = [
  {
    id: 'highborne',
    name: 'Highborne',
    emoji: '👑',
    description: 'Élevés dans les cercles de la noblesse et de l\'élite sociale, les Highborne maîtrisent les règles de la haute société et du protocole.',
    feature: {
      name: 'Haute Naissance',
      description: 'Vous avez accès aux espaces réservés à l\'élite (palais, salles de conseil, clubs privés) et aux personnes qui les fréquentent. Vous avez avantage sur les jets de Présence lorsque vous interagissez avec des membres de la noblesse ou de l\'aristocratie.'
    },
    traits: ['Charme', 'Étiquette', 'Réseau social'],
    flavor: 'Je suis Highborne, alors bien sûr que je sais naviguer dans les cours royales.'
  },
  {
    id: 'loreborne',
    name: 'Loreborne',
    emoji: '📚',
    description: 'Formés dans des académies, bibliothèques ou auprès de maîtres érudits, les Loreborne valorisent le savoir par-dessus tout.',
    feature: {
      name: 'Érudit',
      description: 'Vous avez avantage sur les jets de Savoir pour la recherche, l\'identification d\'artefacts ou la récupération d\'informations historiques. De plus, une fois par session, vous pouvez déclarer une information sur un lieu, un monstre ou un événement historique que votre personnage connaît.'
    },
    traits: ['Recherche', 'Identification', 'Histoire'],
    flavor: 'Je suis Loreborne, alors bien sûr que je sais trouver la réponse dans un texte.'
  },
  {
    id: 'orderborne',
    name: 'Orderborne',
    emoji: '⚖️',
    description: 'Issus d\'institutions militaires, religieuses ou légales, les Orderborne opèrent selon des règles strictes et des hiérarchies claires.',
    feature: {
      name: 'Discipline',
      description: 'Vous avez avantage sur les jets pour résister à la peur, à la contrainte ou aux effets mentaux. De plus, quand vous interagissez avec des membres d\'une organisation hiérarchique (garde, armée, clergé), vous pouvez faire valoir votre rang ou affiliation pour obtenir des informations ou de l\'aide.'
    },
    traits: ['Autorité', 'Résistance', 'Protocole'],
    flavor: 'Je suis Orderborne, alors bien sûr que je sais comment fonctionnent les chaînes de commandement.'
  },
  {
    id: 'ridgeborne',
    name: 'Ridgeborne',
    emoji: '⛰️',
    description: 'Élevés dans les montagnes et les terrains escarpés, les Ridgeborne sont des survivants nés qui naviguent les environnements hostiles avec aisance.',
    feature: {
      name: 'Navigateur des Montagnes',
      description: 'Vous avez avantage sur les jets pour naviguer dans des environnements difficiles (montagne, tempête, terrain hostile). Vous êtes immunisé aux effets des températures extrêmes et des altitudes élevées.'
    },
    traits: ['Survie', 'Navigation', 'Endurance'],
    flavor: 'Je suis Ridgeborne, alors bien sûr que je sais naviguer dans les environnements hostiles.'
  },
  {
    id: 'seaborne',
    name: 'Seaborne',
    emoji: '⚓',
    description: 'Nés en mer ou dans des communautés côtières, les Seaborne sont à l\'aise sur l\'eau et connaissent les mystères des océans.',
    feature: {
      name: 'Enfant de la Mer',
      description: 'Vous nagez à votre vitesse de déplacement. Vous avez avantage sur les jets liés à la navigation, à la météo maritime ou à la vie en mer. Vous ne souffrez pas du mal de mer et résistez aux effets des tempêtes maritimes.'
    },
    traits: ['Navigation maritime', 'Météo', 'Commerce côtier'],
    flavor: 'Je suis Seaborne, alors bien sûr que je sais comment lire les étoiles et les vents.'
  },
  {
    id: 'slyborne',
    name: 'Slyborne',
    emoji: '🎭',
    description: 'Issus des ruelles et des marchés noirs, les Slyborne excellent dans l\'art de la ruse, du mensonge et de la manipulation.',
    feature: {
      name: 'Esprit de la Rue',
      description: 'Vous avez avantage sur les jets de Finesse pour tricher, voler ou dissimuler des objets. De plus, vous connaissez toujours comment trouver le marché noir, un receleur ou un informateur dans n\'importe quelle ville importante.'
    },
    traits: ['Tromperie', 'Furtivité', 'Contrebande'],
    flavor: 'Je suis Slyborne, alors bien sûr que je sais comment disparaître dans une foule.'
  },
  {
    id: 'underborne',
    name: 'Underborne',
    emoji: '⛏️',
    description: 'Élevés dans les profondeurs de la terre, les Underborne connaissent les tunnels, les mines et les merveilles souterraines.',
    feature: {
      name: 'Vision des Profondeurs',
      description: 'Vous voyez clairement dans l\'obscurité complète jusqu\'à Portée Proche. Vous avez avantage sur les jets pour naviguer ou survivre dans des environnements souterrains, et vous ressentez les vibrations dans la roche à Portée Proche.'
    },
    traits: ['Orientation souterraine', 'Minier', 'Géologie'],
    flavor: 'Je suis Underborne, alors bien sûr que je sais trouver mon chemin dans le noir absolu.'
  },
  {
    id: 'wanderborne',
    name: 'Wanderborne',
    emoji: '🗺️',
    description: 'Sans patrie fixe, les Wanderborne ont traversé des régions et des cultures variées, accumulant des expériences et des contacts partout.',
    feature: {
      name: 'Voyageur du Monde',
      description: 'Vous parlez deux langues supplémentaires et connaissez les coutumes d\'un large éventail de cultures. De plus, dans presque n\'importe quelle ville, vous pouvez trouver un contact ou un allié (à la discrétion du MJ) lié à vos voyages passés.'
    },
    traits: ['Langues', 'Diplomatie', 'Contacts'],
    flavor: 'Je suis Wanderborne, alors bien sûr que je sais m\'adapter à n\'importe quelle culture.'
  },
  {
    id: 'wildborne',
    name: 'Wildborne',
    emoji: '🌲',
    source: 'srd',
    description: 'Issus des forêts, des plaines et des régions sauvages, les Wildborne sont en harmonie avec la nature et ses habitants.',
    feature: {
      name: 'Enfant de la Nature',
      description: 'Vous avez avantage sur les jets de Discrétion dans des environnements naturels. Vous communiquez par signaux de base avec les animaux ordinaires (pas les monstres). Vous ne vous perdez jamais dans la nature et trouvez toujours de la nourriture et de l\'eau en milieu sauvage.'
    },
    traits: ['Pistage', 'Survie naturelle', 'Communication animale'],
    flavor: 'Je suis Wildborne, alors bien sûr que je sais me déplacer sans laisser de traces.'
  }
]

/**
 * Retourne une communauté par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getCommunityById(id) {
  return COMMUNITIES.find((c) => c.id === id) || null
}
