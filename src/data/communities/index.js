/**
 * @module communities/data
 * @description Communautés officielles du SRD Daggerheart (9 communautés).
 * Source : Communities_SRD.pdf — vérifié le 02/03/2026 contre le SRD officiel.
 *
 * Chaque communauté possède :
 *  - id, name, emoji, source
 *  - description : texte descriptif du SRD
 *  - feature : { name, description } — feature mécanique de la communauté
 *  - adjectives : 6 adjectifs suggérés pour la personnalité (issus du SRD)
 *  - flavor : phrase d'exemple « I'm [community], so of course I know how to… »
 */

export const COMMUNITIES = [
  {
    id: 'highborne',
    name: 'Highborne',
    emoji: '👑',
    source: 'srd',
    description:
      'Faire partie d\'une communauté highborne signifie être habitué à une vie d\'élégance, d\'opulence et de prestige dans les plus hautes sphères de la société. Traditionnellement, les membres d\'une communauté highborne possèdent une richesse matérielle incroyable. Celle-ci peut prendre différentes formes selon la communauté — or et autres minerais, terres ou contrôle des moyens de production — mais ce statut s\'accompagne toujours de pouvoir et d\'influence. Les Highborne accordent une grande valeur aux titres et possessions, et la mobilité sociale y est très faible. Ils contrôlent souvent le statut politique et économique des zones où ils vivent grâce à leur capacité à influencer les gens et l\'économie avec leur richesse considérable. La santé et la sécurité des personnes moins aisées vivant dans ces lieux dépendent souvent de la capacité de cette classe dirigeante highborne à prioriser le bien-être de leurs sujets par rapport au profit.',
    feature: {
      name: 'Privilege',
      description:
        'Vous avez l\'avantage sur les jets pour fréquenter les nobles, négocier des prix ou exploiter votre réputation pour obtenir ce que vous voulez.',
      tags: ['social'],
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    adjectives: ['aimable', 'franc·he', 'intrigant·e', 'entreprenant·e', 'ostentatoire', 'imperturbable'],
    flavor: 'Je suis Highborne, alors bien sûr que je sais négocier avec les nobles.'
  },
  {
    id: 'loreborne',
    name: 'Loreborne',
    emoji: '📚',
    source: 'srd',
    description:
      'Faire partie d\'une communauté loreborne signifie être issu d\'une société qui favorise de solides prouesses académiques ou politiques. Les communautés Loreborne valorisent hautement le savoir, souvent sous forme de préservation historique, d\'avancement politique, d\'études scientifiques, de développement de compétences ou de compilation de connaissances et de mythologie. La plupart de leurs membres mènent des recherches dans des institutions construites dans des bastions de civilisation, tandis que quelques rares excentriques préfèrent récolter des informations dans le monde naturel. Certains peuvent être isolationnistes, opérant dans de plus petites enclaves, écoles ou guildes et suivant leur propre éthos unique. D\'autres encore exercent leur savoir à plus grande échelle, réalisant d\'habiles manœuvres politiques à travers les paysages gouvernementaux.',
    feature: {
      name: 'Well-Read',
      description:
        'Vous avez l\'avantage sur les jets impliquant l\'histoire, la culture ou la politique d\'une personne ou d\'un lieu important.',
      tags: ['social','utilitaire'],
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    adjectives: ['direct·e', 'éloquent·e', 'curieux·se', 'patient·e', 'exalté·e', 'spirituel·le'],
    flavor: 'Je suis Loreborne, alors bien sûr que je connais l\'histoire de ce lieu.'
  },
  {
    id: 'orderborne',
    name: 'Orderborne',
    emoji: '⚖️',
    source: 'srd',
    description:
      'Faire partie d\'une communauté orderborne signifie être issu d\'un collectif axé sur la discipline ou la foi, et défendre un ensemble de principes reflétant votre expérience en son sein. Les Orderborne sont souvent parmi les plus puissants de leur entourage. En alignant les membres de leur société autour d\'une valeur ou d\'un objectif commun — un dieu, une doctrine, un ethos, ou même un commerce partagé — les dirigeants de ces enclaves peuvent mobiliser de plus grandes populations avec moins d\'effort. Bien que les communautés Orderborne prennent des formes variées, dont certaines profondément pacifistes, les plus redoutées sont celles structurées autour de la prouesse militaire. Dans ce cas, il n\'est pas rare que les Orderborne fournissent des soldats mercenaires à d\'autres cités ou pays.',
    feature: {
      name: 'Dedicated',
      description:
        'Notez trois dictons ou valeurs que votre éducation vous a inculqués. Une fois par repos, quand vous décrivez comment vous incarnez un de ces principes à travers votre action actuelle, vous pouvez lancer un d20 comme Dé d\'Espoir (Hope Die).',
      tags: ['social'],
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest', trigger: 'Vous agissez selon vos valeurs'
    },
    adjectives: ['ambitieux·se', 'bienveillant·e', 'pensif·ve', 'prudent·e', 'sardonique', 'stoïque'],
    flavor: 'Je suis Orderborne, alors bien sûr que je sais incarner mes principes.'
  },
  {
    id: 'ridgeborne',
    name: 'Ridgeborne',
    emoji: '⛰️',
    source: 'srd',
    description:
      'Faire partie d\'une communauté ridgeborne signifie avoir élu domicile sur les pics rocheux et les falaises escarpées de la montagne. Ceux qui ont vécu en montagne se considèrent souvent comme plus résistants que la moyenne, car ils ont prospéré parmi les terrains les plus dangereux que de nombreux continents ont à offrir. Ces groupes sont adeptes de l\'adaptation, développant des technologies et équipements uniques pour déplacer personnes et marchandises à travers des terrains difficiles. Ainsi, les Ridgeborne grandissent en escaladant et en grimpant, ce qui les rend robustes et volontaires. Les localités Ridgeborne prennent des formes variées — certaines cités creusent des falaises entières, d\'autres construisent des châteaux de pierre, et d\'autres encore vivent dans de petites maisons sur des pics balayés par le vent. Les forces extérieures peinent souvent à attaquer les groupes ridgeborne, car les petites milices et les grandes forces militaires des montagnes sont expertes dans l\'utilisation de leur avantage de terrain élevé.',
    feature: {
      name: 'Steady',
      description:
        'Vous avez l\'avantage sur les jets pour traverser des falaises et des rebords dangereux, naviguer dans des environnements hostiles et utiliser vos connaissances de survie.',
      tags: ['utilitaire'],
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    adjectives: ['audacieux·se', 'robuste', 'indomptable', 'loyal·e', 'réservé·e', 'obstiné·e'],
    flavor: 'Je suis Ridgeborne, alors bien sûr que je sais naviguer en terrain hostile.'
  },
  {
    id: 'seaborne',
    name: 'Seaborne',
    emoji: '⚓',
    source: 'srd',
    description:
      'Faire partie d\'une communauté seaborne signifie avoir vécu sur ou près d\'une grande étendue d\'eau. Les communautés Seaborne sont construites, physiquement et culturellement, autour des eaux qu\'elles appellent leur foyer. Certains groupes vivent le long du rivage, construisant des ports pour les locaux et les voyageurs. Ces ports fonctionnent comme centres de commerce, attractions touristiques, ou simplement un lieu sûr où poser la tête après des semaines de voyage. D\'autres vivent sur l\'eau dans de petits bateaux ou de grands navires, le concept de « foyer » étant un navire et son équipage plutôt qu\'une masse terrestre. Quelle que soit leur localisation exacte, les communautés seaborne sont étroitement liées aux marées océaniques et aux créatures qui les peuplent. Les Seaborne apprennent à pêcher dès leur plus jeune âge et s\'entraînent dès la naissance à retenir leur souffle et à nager même dans les eaux les plus tumultueuses. Les individus issus de ces groupes sont très recherchés pour leurs compétences en navigation, et beaucoup deviennent capitaines de navires, que ce soit au sein de leur propre communauté, au service d\'une autre, ou même à la barre d\'une puissante opération navale.',
    feature: {
      name: 'Know the Tide',
      description:
        'Vous pouvez sentir le flux et le reflux de la vie. Quand vous lancez avec Peur (Fear), placez un jeton sur votre carte de communauté. Vous pouvez détenir un nombre de jetons égal à votre niveau. Avant de faire un jet d\'action, vous pouvez dépenser un nombre quelconque de ces jetons pour obtenir un bonus de +1 au jet par jeton dépensé. À la fin de chaque session, retirez tous les jetons non dépensés.',
      tags: ['utilitaire'],
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    adjectives: ['franc·he', 'coopératif·ve', 'exubérant·e', 'féroce', 'résolu·e', 'aguerri·e'],
    flavor: 'Je suis Seaborne, alors bien sûr que je sais sentir le flux et le reflux.'
  },
  {
    id: 'slyborne',
    name: 'Slyborne',
    emoji: '🎭',
    source: 'srd',
    description:
      'Faire partie d\'une communauté slyborne signifie être issu d\'un groupe opérant en dehors de la loi, incluant toutes sortes de criminels, escrocs et arnaqueurs. Les membres des communautés Slyborne sont rassemblés par leurs objectifs peu recommandables et leurs moyens astucieux pour les atteindre. Beaucoup possèdent un éventail de compétences peu scrupuleuses : contrefaçon, vol, contrebande et violence. Des gens de toute classe sociale peuvent être Slyborne, de ceux qui ont amassé une vaste richesse et influence à ceux qui n\'ont pas un sou en poche. Pour un observateur extérieur, ils pourraient ressembler à des voyous sans loyauté, mais ces communautés possèdent certains des codes d\'honneur les plus stricts qui, lorsqu\'ils sont brisés, peuvent entraîner une fin terrifiante pour le transgresseur.',
    feature: {
      name: 'Scoundrel',
      description:
        'Vous avez l\'avantage sur les jets pour négocier avec des criminels, détecter les mensonges ou trouver un endroit sûr où se cacher.',
      tags: ['social'],
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    adjectives: ['calculateur·rice', 'malin·e', 'redoutable', 'perspicace', 'rusé·e', 'tenace'],
    flavor: 'Je suis Slyborne, alors bien sûr que je sais détecter les mensonges.'
  },
  {
    id: 'underborne',
    name: 'Underborne',
    emoji: '⛏️',
    source: 'srd',
    description:
      'Faire partie d\'une communauté underborne signifie être issu d\'une société souterraine. Beaucoup d\'Underborne vivent juste sous les villes et villages d\'autres collectifs, tandis que d\'autres vivent bien plus profondément. Ces communautés vont de petits groupes familiaux dans des terriers à de vastes métropoles dans des cavernes de pierre. Dans de nombreuses localités, les Underborne sont reconnus pour leur incroyable audace et leur habileté qui permettent de grands exploits d\'architecture et d\'ingénierie. Les Underborne sont régulièrement embauchés pour leur bravoure, car même les moins audacieux d\'entre eux ont probablement rencontré de redoutables bêtes souterraines, et apprendre à les affronter est une pratique courante au sein de ces sociétés. En raison des dangers de leur environnement, beaucoup développent des langages non verbaux uniques, tout aussi utiles en surface.',
    feature: {
      name: 'Low-Light Living',
      description:
        'Quand vous êtes dans une zone de faible luminosité ou d\'ombre épaisse, vous avez l\'avantage sur les jets pour vous cacher, enquêter ou percevoir des détails dans cette zone.',
      tags: ['utilitaire'],
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    adjectives: ['composé·e', 'insaisissable', 'indomptable', 'innovant·e', 'débrouillard·e', 'modeste'],
    flavor: 'Je suis Underborne, alors bien sûr que je sais me repérer dans l\'obscurité.'
  },
  {
    id: 'wanderborne',
    name: 'Wanderborne',
    emoji: '🗺️',
    source: 'srd',
    description:
      'Faire partie d\'une communauté wanderborne signifie avoir vécu comme nomade, renonçant à un foyer permanent et expérimentant une grande variété de cultures. Contrairement à de nombreuses communautés définies par leur lieu, les Wanderborne sont définis par leur mode de vie itinérant. En raison de leurs migrations fréquentes, ils accordent moins de valeur à l\'accumulation de possessions matérielles au profit de l\'acquisition d\'informations, de compétences et de contacts. Les dangers posés par la vie sur la route et le choix de continuer ensemble signifient que les Wanderborne sont connus pour leur loyauté indéfectible.',
    feature: {
      name: 'Nomadic Pack',
      description:
        'Ajoutez un Paquetage Nomade à votre inventaire. Une fois par session, vous pouvez dépenser un Espoir (Hope) pour fouiller dans ce paquetage et en sortir un objet ordinaire utile à votre situation. Travaillez avec le MJ pour déterminer quel objet vous en tirez.',
      tags: ['utilitaire'],
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'oncePerSession'
    },
    adjectives: ['impénétrable', 'magnanime', 'jovial·e', 'fiable', 'avisé·e', 'anticonformiste'],
    flavor: 'Je suis Wanderborne, alors bien sûr que j\'ai exactement ce qu\'il faut dans mon sac.'
  },
  {
    id: 'wildborne',
    name: 'Wildborne',
    emoji: '🌲',
    source: 'srd',
    description:
      'Faire partie d\'une communauté wildborne signifie avoir vécu au cœur de la forêt. Les communautés Wildborne sont définies par leur dévouement à la conservation de leurs terres natales, et beaucoup ont de forts liens religieux ou culturels avec la faune parmi laquelle ils vivent. Cela se traduit par des avancées architecturales et technologiques uniques favorisant la durabilité plutôt que les résultats à court terme. C\'est une marque distinctive des sociétés Wildborne d\'intégrer leurs villages et cités avec l\'environnement naturel et d\'éviter de perturber la vie des plantes et des animaux.',
    feature: {
      name: 'Lightfoot',
      description:
        'Votre déplacement est naturellement silencieux. Vous avez l\'avantage sur les jets pour vous déplacer sans être entendu.',
      tags: ['utilitaire'],
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    adjectives: ['robuste', 'loyal·e', 'bienveillant·e', 'solitaire', 'sagace', 'vibrant·e'],
    flavor: 'Je suis Wildborne, alors bien sûr que je sais me déplacer sans un bruit.'
  }
]

/**
 * Retourne une communauté par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getCommunityById(id) {
  if (!id || typeof id !== 'string') return null
  return COMMUNITIES.find((c) => c.id === id) || null
}

/**
 * Retourne toutes les communautés correspondant à un filtre texte.
 * @param {string} query — texte de recherche
 * @returns {Array}
 */
export function searchCommunities(query) {
  if (!query || typeof query !== 'string') return [...COMMUNITIES]
  const q = query.toLowerCase().trim()
  if (!q) return [...COMMUNITIES]
  return COMMUNITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.feature.name.toLowerCase().includes(q) ||
      c.feature.description.toLowerCase().includes(q) ||
      c.adjectives.some((a) => a.toLowerCase().includes(q))
  )
}
