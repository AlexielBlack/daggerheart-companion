/**
 * @module equipment/consumables
 * @description Consommables SRD Daggerheart — 60 objets à usage unique avec table de roll.
 * Source : SRD_LOOTCONSUMABLES.pdf (pages 2–3)
 *
 * Rareté déduite du roll : 01–12 = Common, 13–24 = Uncommon, 25–36 = Rare, 37–60 = Legendary
 */

import { getRarityFromRoll } from './constants.js'

export const CONSUMABLES = [
  { id: 'cons-01', roll: 1, name: 'Stride Potion', description: 'Vous obtenez un bonus de +1 à votre prochain jet d’Agilité.' , tags: ['utilitaire']},
  { id: 'cons-02', roll: 2, name: 'Bolster Potion', description: 'Vous obtenez un bonus de +1 à votre prochain jet de Force.' , tags: ['utilitaire']},
  { id: 'cons-03', roll: 3, name: 'Control Potion', description: 'Vous obtenez un bonus de +1 à votre prochain jet de Finesse.' , tags: ['utilitaire']},
  { id: 'cons-04', roll: 4, name: 'Attune Potion', description: 'Vous obtenez un bonus de +1 à votre prochain jet d’Instinct.' , tags: ['utilitaire']},
  { id: 'cons-05', roll: 5, name: 'Charm Potion', description: 'Vous obtenez un bonus de +1 à votre prochain jet de Présence.' , tags: ['utilitaire']},
  { id: 'cons-06', roll: 6, name: 'Enlighten Potion', description: 'Vous obtenez un bonus de +1 à votre prochain jet de Savoir.' , tags: ['utilitaire']},
  { id: 'cons-07', roll: 7, name: 'Minor Health Potion', description: 'Libérez 1d4 PV.' , tags: ['défensif']},
  { id: 'cons-08', roll: 8, name: 'Minor Stamina Potion', description: 'Libérez 1d4 Stress.' , tags: ['défensif']},
  { id: 'cons-09', roll: 9, name: 'Grindletooth Venom', description: 'Vous pouvez appliquer ce venin à une arme infligeant des dégâts physiques pour ajouter un d6 à votre prochain jet de dégâts avec cette arme.' , tags: ['offensif']},
  { id: 'cons-10', roll: 10, name: 'Varik Leaves', description: 'Vous pouvez manger ces feuilles jumelées pour obtenir immédiatement 2 Espoir.' , tags: ['utilitaire']},
  { id: 'cons-11', roll: 11, name: 'Vial of Moondrip', description: 'Quand vous buvez le contenu de cette fiole, vous pouvez voir dans l’obscurité totale jusqu’à votre prochain repos.' , tags: ['utilitaire']},
  { id: 'cons-12', roll: 12, name: 'Unstable Arcane Shard', description: 'Vous pouvez faire un jet de Finesse pour lancer ce fragment sur un groupe d’adversaires à portée Loin. Les cibles contre lesquelles vous réussissez subissent 1d20 dégâts magiques.' , tags: ['offensif']},
  { id: 'cons-13', roll: 13, name: 'Potion of Stability', description: 'Vous pouvez boire cette potion pour choisir un mouvement de temps libre supplémentaire.' , tags: ['utilitaire']},
  { id: 'cons-14', roll: 14, name: 'Improved Grindletooth Venom', description: 'Vous pouvez appliquer ce venin à une arme infligeant des dégâts physiques pour ajouter un d8 à votre prochain jet de dégâts avec cette arme.' , tags: ['offensif']},
  { id: 'cons-15', roll: 15, name: 'Morphing Clay', description: 'Vous pouvez dépenser un Espoir pour utiliser cette argile, altérant votre visage suffisamment pour vous rendre méconnaissable jusqu’à votre prochain repos.' , tags: ['social','utilitaire']},
  { id: 'cons-16', roll: 16, name: 'Vial of Darksmoke', description: "Quand un adversaire vous attaque, utilisez cette fiole et lancez un nombre de d6 égal à votre Agilité. Ajoutez le résultat le plus élevé à votre Évasion contre l’attaque." , tags: ['défensif']},
  { id: 'cons-17', roll: 17, name: 'Jumping Root', description: 'Mangez cette racine pour bondir jusqu’à portée Loin une fois sans avoir à lancer de dé.' , tags: ['utilitaire']},
  { id: 'cons-18', roll: 18, name: 'Snap Powder', description: 'Cochez un Stress et libérez un PV.' , tags: ['défensif']},
  { id: 'cons-19', roll: 19, name: 'Health Potion', description: 'Libérez 1d4+1 PV.' , tags: ['défensif']},
  { id: 'cons-20', roll: 20, name: 'Stamina Potion', description: 'Libérez 1d4+1 Stress.' , tags: ['défensif']},
  { id: 'cons-21', roll: 21, name: 'Armor Stitcher', description: 'Vous pouvez utiliser ce raccommodeur pour dépenser un nombre quelconque d’Espoir et libérer autant d’Emplacements d’armure.' , tags: ['offensif']},
  { id: 'cons-22', roll: 22, name: 'Gill Salve', description: 'Vous pouvez appliquer ce baume sur votre cou pour respirer sous l’eau pendant un nombre de minutes égal à votre niveau.' , tags: ['offensif']},
  { id: 'cons-23', roll: 23, name: 'Replication Parchment', description: "En touchant ce parchemin contre un autre, vous pouvez copier parfaitement le contenu du second parchemin. Une fois utilisé, ce parchemin devient du papier ordinaire." , tags: ['utilitaire']},
  { id: 'cons-24', roll: 24, name: 'Improved Arcane Shard', description: 'Vous pouvez faire un jet de Finesse pour lancer ce fragment sur un groupe d’adversaires à portée Loin. Les cibles contre lesquelles vous réussissez subissent 2d20 dégâts magiques.' , tags: ['utilitaire']},
  { id: 'cons-25', roll: 25, name: 'Major Stride Potion', description: 'Vous obtenez un bonus de +1 en Agilité jusqu’à votre prochain repos.' , tags: ['défensif']},
  { id: 'cons-26', roll: 26, name: 'Major Bolster Potion', description: 'Vous obtenez un bonus de +1 en Force jusqu’à votre prochain repos.' , tags: ['défensif']},
  { id: 'cons-27', roll: 27, name: 'Major Control Potion', description: 'Vous obtenez un bonus de +1 en Finesse jusqu’à votre prochain repos.' , tags: ['utilitaire']},
  { id: 'cons-28', roll: 28, name: 'Major Attune Potion', description: 'Vous obtenez un bonus de +1 en Instinct jusqu’à votre prochain repos.' , tags: ['utilitaire']},
  { id: 'cons-29', roll: 29, name: 'Major Charm Potion', description: 'Vous obtenez un bonus de +1 en Présence jusqu’à votre prochain repos.' , tags: ['offensif']},
  { id: 'cons-30', roll: 30, name: 'Major Enlighten Potion', description: 'Vous obtenez un bonus de +1 en Savoir jusqu’à votre prochain repos.' , tags: ['offensif']},
  { id: 'cons-31', roll: 31, name: 'Blood of the Yorgi', description: 'Vous pouvez boire ce sang pour disparaître et réapparaître immédiatement en un point visible à portée Très Loin.' , tags: ['offensif']},
  { id: 'cons-32', roll: 32, name: "Homet's Secret Potion", description: 'Après avoir bu cette potion, votre prochaine attaque réussie devient un succès critique.' , tags: ['offensif']},
  { id: 'cons-33', roll: 33, name: 'Redthorn Saliva', description: 'Vous pouvez appliquer cette salive à une arme infligeant des dégâts physiques pour ajouter un d12 à votre prochain jet de dégâts avec cette arme.' , tags: ['défensif']},
  { id: 'cons-34', roll: 34, name: 'Channelstone', description: 'Vous pouvez utiliser cette pierre pour prendre un sort ou grimoire de votre réserve, l’utiliser une fois, et le renvoyer dans votre réserve.' , tags: ['défensif']},
  { id: 'cons-35', roll: 35, name: 'Mythic Dust', description: 'Vous pouvez appliquer cette poussière à une arme infligeant des dégâts magiques pour ajouter un d12 à votre prochain jet de dégâts avec cette arme.' , tags: ['défensif']},
  { id: 'cons-36', roll: 36, name: 'Acidpaste', description: 'Cette pâte ronge les murs et autres surfaces dans des éclairs lumineux.' , tags: ['utilitaire']},
  { id: 'cons-37', roll: 37, name: 'Hopehold Flare', description: 'Quand vous utilisez cette fusée, les alliés à portée Proche lancent un d6 quand ils dépensent un Espoir. Sur un résultat de 6, ils obtiennent l’effet de cet Espoir sans le dépenser. La fusée dure jusqu’à la fin de la scène.' , tags: ['offensif']},
  { id: 'cons-38', roll: 38, name: 'Major Arcane Shard', description: 'Vous pouvez faire un jet de Finesse pour lancer ce fragment sur un groupe d’adversaires à portée Loin. Les cibles contre lesquelles vous réussissez subissent 4d20 dégâts magiques.' , tags: ['offensif']},
  { id: 'cons-39', roll: 39, name: 'Featherbone', description: 'Vous pouvez utiliser cet os pour contrôler votre vitesse de chute pendant un nombre de minutes égal à votre niveau.' , tags: ['défensif']},
  { id: 'cons-40', roll: 40, name: 'Circle of the Void', description: 'Cochez un Stress pour créer un vide qui s’étend jusqu’à portée Loin. Aucune magie ne peut être lancée dans le vide, et les créatures dans le vide sont immunisées aux dégâts magiques.' , tags: ['défensif']},
  { id: 'cons-41', roll: 41, name: 'Sun Tree Sap', description: 'Consommez cette sève et lancez un d6. Sur un résultat de 5–6, libérez 2 PV. Sur 2–4, libérez 3 Stress. Sur un 1, voyez à travers le voile de la mort et revenez changé, gagnant une cicatrice.' , tags: ['offensif']},
  { id: 'cons-42', roll: 42, name: 'Dripfang Poison', description: 'Une créature qui consomme ce poison subit 8d10 dégâts magiques directs.' , tags: ['offensif']},
  { id: 'cons-43', roll: 43, name: 'Major Health Potion', description: 'Libérez 1d4+2 PV.' , tags: ['utilitaire']},
  { id: 'cons-44', roll: 44, name: 'Major Stamina Potion', description: 'Libérez 1d4+2 Stress.' , tags: ['utilitaire']},
  { id: 'cons-45', roll: 45, name: 'Ogre Musk', description: 'Vous pouvez utiliser ce musc pour empêcher quiconque de vous pister par des moyens ordinaires ou magiques jusqu’à votre prochain repos.' , tags: ['défensif']},
  { id: 'cons-46', roll: 46, name: 'Wingsprout', description: 'Vous obtenez des ailes magiques qui vous permettent de voler pendant un nombre de minutes égal à votre niveau.' , tags: ['défensif']},
  { id: 'cons-47', roll: 47, name: 'Jar of Lost Voices', description: 'Vous pouvez ouvrir cette jarre pour libérer un écho assourdissant de voix pendant un nombre de minutes égal à votre Instinct. Les créatures à portée Loin non préparées au son subissent 6d8 dégâts magiques.' , tags: ['offensif']},
  { id: 'cons-48', roll: 48, name: 'Dragonbloom Tea', description: 'Vous pouvez boire ce thé pour déclencher une attaque de souffle enflammé. Faites un jet d’Instinct contre tous les adversaires devant vous à portée Proche. Les cibles contre lesquelles vous réussissez subissent d20 dégâts physiques en utilisant votre Maîtrise.' , tags: ['offensif']},
  { id: 'cons-49', roll: 49, name: 'Bridge Seed', description: 'D’épaisses lianes poussent depuis votre position jusqu’à un point de votre choix à portée Loin, vous permettant de grimper dessus ou de les traverser. Les lianes se dissipent à votre prochain repos court.' , tags: ['défensif']},
  { id: 'cons-50', roll: 50, name: 'Sleeping Sap', description: "Vous pouvez boire cette potion pour vous endormir pour une nuit complète de repos. Vous libérez tout votre Stress au réveil." , tags: ['défensif']},
  { id: 'cons-51', roll: 51, name: 'Feast of Xuria', description: 'Vous pouvez manger ce repas pour libérer tous les PV et Stress et gagner 1d4 Espoir.' , tags: ['utilitaire']},
  { id: 'cons-52', roll: 52, name: 'Bonding Honey', description: 'Ce miel peut être utilisé pour coller deux objets ensemble de manière permanente.' , tags: ['utilitaire']},
  { id: 'cons-53', roll: 53, name: 'Shrinking Potion', description: 'Vous pouvez boire cette potion pour réduire votre taille de moitié jusqu’à ce que vous abandonniez cette forme ou votre prochain repos. Sous cette forme, vous avez un bonus de +2 en Agilité et un malus de −1 à votre Maîtrise.' , tags: ['offensif']},
  { id: 'cons-54', roll: 54, name: 'Growing Potion', description: 'Vous pouvez boire cette potion pour doubler votre taille jusqu’à ce que vous abandonniez cette forme ou votre prochain repos. Sous cette forme, vous avez un bonus de +2 en Force et un bonus de +1 à votre Maîtrise.' , tags: ['offensif']},
  { id: 'cons-55', roll: 55, name: 'Knowledge Stone', description: 'Si vous mourez en tenant cette pierre, un allié peut prendre une carte de votre équipement actif pour la placer dans son équipement actif ou sa réserve. Après avoir pris ce savoir, la pierre s’effrite.' , tags: ['défensif']},
  { id: 'cons-56', roll: 56, name: 'Sweet Moss', description: 'Vous pouvez consommer cette mousse pendant un repos pour libérer 1d10 PV ou 1d10 Stress.' , tags: ['utilitaire']},
  { id: 'cons-57', roll: 57, name: 'Blinding Orb', description: 'Vous pouvez activer cet orbe pour créer un flash de lumière vive. Toutes les cibles à portée Proche deviennent Vulnérables jusqu’à ce qu’elles cochent un PV.' , tags: ['utilitaire']},
  { id: 'cons-58', roll: 58, name: 'Death Tea', description: "Après avoir bu ce thé, vous tuez instantanément votre cible quand vous obtenez un succès critique sur une attaque. Si vous n’obtenez pas de succès critique avant votre prochain repos long, vous mourez." , tags: ['défensif']},
  { id: 'cons-59', roll: 59, name: 'Mirror of Marigold', description: 'Quand vous subissez des dégâts, vous pouvez dépenser un Espoir pour annuler ces dégâts, après quoi le miroir se brise.' , tags: ['défensif']},
  { id: 'cons-60', roll: 60, name: 'Stardrop', description: 'Vous pouvez utiliser cette goutte stellaire pour invoquer une pluie de comètes qui inflige 8d20 dégâts physiques à toutes les cibles à portée Très Loin.' , tags: ['offensif']}
]

// Enrichir chaque consommable avec sa rareté calculée
CONSUMABLES.forEach((item) => {
  item.rarity = getRarityFromRoll(item.roll)
})

/**
 * Retourne les consommables par rareté.
 * @param {string} rarity
 * @returns {Object[]}
 */
export function getConsumablesByRarity(rarity) {
  return CONSUMABLES.filter((c) => c.rarity === rarity)
}

/**
 * Retourne un consommable par roll.
 * @param {number} roll
 * @returns {Object|null}
 */
export function getConsumableByRoll(roll) {
  return CONSUMABLES.find((c) => c.roll === roll) || null
}

/**
 * Retourne un consommable par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getConsumableById(id) {
  return CONSUMABLES.find((c) => c.id === id) || null
}
