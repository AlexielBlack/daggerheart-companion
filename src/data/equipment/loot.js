/**
 * @module equipment/loot
 * @description Loot SRD Daggerheart — 60 objets avec table de roll.
 * Source : SRD_LOOTCONSUMABLES.pdf (pages 1–2)
 *
 * Rareté déduite du roll : 01–12 = Common, 13–24 = Uncommon, 25–36 = Rare, 37–60 = Legendary
 */

import { getRarityFromRoll } from './constants.js'

export const LOOT = [
  { id: 'loot-01', roll: 1, name: 'Premium Bedroll', description: 'Pendant le temps libre, vous libérez automatiquement un Stress.' },
  { id: 'loot-02', roll: 2, name: 'Piper Whistle', description: 'Ce sifflet artisanal a un son distinctif. Quand vous soufflez dedans, son ton perçant peut être entendu dans un rayon de 1,6 km.' },
  { id: 'loot-03', roll: 3, name: 'Charging Quiver', description: 'Quand vous réussissez une attaque avec une flèche de ce carquois, obtenez un bonus au jet de dégâts égal à votre tier actuel.' },
  { id: 'loot-04', roll: 4, name: "Alistair's Torch", description: 'Vous pouvez allumer cette torche magique à volonté. La lumière de la flamme remplit un espace bien plus grand que prévu, suffisant pour illuminer une grotte comme en plein jour.' },
  { id: 'loot-05', roll: 5, name: 'Speaking Orbs', description: 'Cette paire d’orbes permet à toute créature les tenant de communiquer entre elles quelle que soit la distance.' },
  { id: 'loot-06', roll: 6, name: 'Manacles', description: 'Cette paire de menottes verrouillables est fournie avec une clé.' },
  { id: 'loot-07', roll: 7, name: 'Arcane Cloak', description: 'Une créature possédant un trait de Sort portant cette cape peut en ajuster la couleur, la texture et la taille à volonté.' },
  { id: 'loot-08', roll: 8, name: 'Woven Net', description: 'Vous pouvez faire un jet de Finesse avec ce filet pour piéger une petite créature. Une cible piégée peut se libérer avec un jet d’Attaque réussi (16).' },
  { id: 'loot-09', roll: 9, name: 'Fire Jar', description: 'Vous pouvez verser l’étrange liquide de cette jarre pour produire instantanément du feu. Le contenu se régénère lors d’un repos long.' },
  { id: 'loot-10', roll: 10, name: 'Suspended Rod', description: "Cette tige plate est gravée de runes. Quand vous activez la tige, elle se suspend immédiatement sur place. Tant qu’elle n’est pas désactivée, elle ne peut pas bouger, ignore la gravité et reste en place." },
  { id: 'loot-11', roll: 11, name: 'Glamour Stone', description: 'Activez cette pierre de la taille d’un caillou pour mémoriser l’apparence de quelqu’un que vous voyez. Dépensez un Espoir pour recréer magiquement ce déguisement sur vous sous forme d’illusion.' },
  { id: 'loot-12', roll: 12, name: 'Empty Chest', description: 'Ce coffre magique semble vide. Quand vous prononcez un mot ou une action déclencheur spécifique et ouvrez le coffre, vous pouvez voir les objets qui y sont rangés.' },
  { id: 'loot-13', roll: 13, name: 'Companion Case', description: 'Cet étui peut contenir un petit compagnon animal. Tant que le compagnon est à l’intérieur, l’animal et l’étui sont immunisés à tous les dégâts et effets néfastes.' },
  { id: 'loot-14', roll: 14, name: 'Piercing Arrows', description: 'Trois fois par repos, quand vous réussissez une attaque avec une de ces flèches, vous pouvez ajouter votre Maîtrise au jet de dégâts.' },
  { id: 'loot-15', roll: 15, name: 'Valorstone', description: "Vous pouvez fixer cette pierre à une armure sans feature. L’armure gagne la feature suivante. Resilient : Avant de cocher votre dernier Emplacement d’armure, lancez un d6. Sur un 6, réduisez la gravité d’un seuil sans cocher d’Emplacement d’armure." },
  { id: 'loot-16', roll: 16, name: 'Skeleton Key', description: 'Quand vous utilisez cette clé pour ouvrir une porte verrouillée, vous obtenez un avantage sur le jet de Finesse.' },
  { id: 'loot-17', roll: 17, name: 'Arcane Prism', description: "Placez ce prisme à l’endroit de votre choix et activez-le. Tous les alliés à portée Proche gagnent un bonus de +1 à leurs jets de Sorts. Une fois activé, le prisme ne peut pas être déplacé. Une fois désactivé, il ne peut pas être réactivé avant votre prochain repos long." },
  { id: 'loot-18', roll: 18, name: 'Minor Stamina Potion Recipe', description: 'Comme action de temps libre, vous pouvez utiliser l’os d’une créature pour fabriquer une Potion de vigueur mineure.' },
  { id: 'loot-19', roll: 19, name: 'Minor Health Potion Recipe', description: 'Comme action de temps libre, vous pouvez utiliser une fiole de sang pour fabriquer une Potion de santé mineure.' },
  { id: 'loot-20', roll: 20, name: 'Homing Compasses', description: 'Ces deux boussoles pointent l’une vers l’autre quelle que soit la distance qui les sépare.' },
  { id: 'loot-21', roll: 21, name: 'Corrector Sprite', description: 'Ce minuscule esprit se niche dans votre conduit auditif et murmure des conseils utiles en combat. Une fois par repos court, vous pouvez obtenir un avantage sur un jet d’attaque.' },
  { id: 'loot-22', roll: 22, name: 'Gecko Gloves', description: 'Vous pouvez escalader des surfaces verticales et traverser des plafonds.' },
  { id: 'loot-23', roll: 23, name: 'Lorekeeper', description: 'Vous pouvez noter le nom et les détails de jusqu’à trois créatures hostiles dans ce livre. Vous obtenez un bonus de +1 aux jets d’action contre ces créatures.' },
  { id: 'loot-24', roll: 24, name: 'Vial of Darksmoke Recipe', description: 'Comme action de temps libre, vous pouvez cocher un Stress pour fabriquer une Fiole de Fumée noire.' },
  { id: 'loot-25', roll: 25, name: 'Bloodstone', description: "Vous pouvez fixer cette pierre à une arme sans feature. L’arme gagne la feature suivante. Brutal : Quand vous obtenez la valeur maximale sur un dé de dégâts, lancez un dé de dégâts supplémentaire." },
  { id: 'loot-26', roll: 26, name: 'Greatstone', description: "Vous pouvez fixer cette pierre à une arme sans feature. L’arme gagne la feature suivante. Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas." },
  { id: 'loot-27', roll: 27, name: 'Glider', description: 'En chute, vous pouvez cocher un Stress pour déployer ce petit parachute et planer en sécurité jusqu’au sol.' },
  { id: 'loot-28', roll: 28, name: 'Ring of Silence', description: 'Dépensez un Espoir pour activer cet anneau. Vos pas sont silencieux jusqu’à votre prochain repos.' },
  { id: 'loot-29', roll: 29, name: 'Calming Pendant', description: 'Quand vous devriez cocher votre dernier Stress, lancez un d6. Sur un résultat de 5 ou plus, ne le cochez pas.' },
  { id: 'loot-30', roll: 30, name: 'Dual Flask', description: "Cette flasque peut contenir deux liquides différents. Vous pouvez alterner entre eux en actionnant un petit interrupteur sur le côté." },
  { id: 'loot-31', roll: 31, name: 'Bag of Ficklesand', description: "Vous pouvez convaincre ce petit sac de sable d’être beaucoup plus lourd ou léger avec un jet de Présence réussi (10). De plus, sur un jet de Finesse réussi (10), vous pouvez souffler du sable au visage d’une cible pour la rendre temporairement Vulnérable." },
  { id: 'loot-32', roll: 32, name: 'Ring of Resistance', description: 'Une fois par repos long, vous pouvez activer cet anneau après une attaque réussie contre vous pour réduire les dégâts de moitié.' },
  { id: 'loot-33', roll: 33, name: 'Phoenix Feather', description: 'Si vous avez au moins une Plume de phénix sur vous quand vous tombez inconscient, vous obtenez un bonus de +1 au jet pour déterminer si vous gagnez une cicatrice.' },
  { id: 'loot-34', roll: 34, name: 'Box of Many Goods', description: "Une fois par repos long, vous pouvez ouvrir cette petite boîte et lancer un d12. Sur 1–6, elle est vide. Sur 7–10, elle contient un consommable commun aléatoire. Sur 11–12, elle contient deux consommables communs aléatoires." },
  { id: 'loot-35', roll: 35, name: 'Airblade Charm', description: 'Vous pouvez fixer ce charme à une arme à portée de Mêlée. Trois fois par repos, vous pouvez activer le charme et attaquer une cible à portée Proche.' },
  { id: 'loot-36', roll: 36, name: 'Portal Seed', description: 'Vous pouvez planter cette graine dans le sol pour faire pousser un portail à cet endroit. Le portail est prêt en 24 heures. Vous pouvez utiliser ce portail pour voyager vers tout autre endroit où vous avez planté une graine de portail. Un portail peut être détruit en lui infligeant n’importe quel montant de dégâts magiques.' },
  { id: 'loot-37', roll: 37, name: "Paragon's Chain", description: "Comme action de temps libre, vous pouvez méditer sur un idéal ou principe qui vous est cher et concentrer votre volonté dans cette chaîne. Une fois par repos long, vous pouvez dépenser un Espoir pour lancer un d20 comme dé d’Espoir pour les jets directement alignés avec ce principe." },
  { id: 'loot-38', roll: 38, name: 'Elusive Amulet', description: 'Une fois par repos long, vous pouvez activer cette amulette pour devenir Caché jusqu’à ce que vous bougiez. Tant que vous êtes Caché de cette manière, vous restez invisible même si un adversaire se déplace là où il vous verrait normalement.' },
  { id: 'loot-39', roll: 39, name: 'Hopekeeper Locket', description: 'Pendant un repos long, si vous avez 6 Espoir, vous pouvez dépenser un Espoir pour imprégner ce médaillon de votre résolution. Quand vous avez 0 Espoir, vous pouvez utiliser le médaillon pour gagner immédiatement un Espoir. Le médaillon doit être réimprégné avant de pouvoir être réutilisé.' },
  { id: 'loot-40', roll: 40, name: 'Infinite Bag', description: 'Quand vous rangez des objets dans ce sac, ils sont conservés dans une dimension de poche qui ne manque jamais de place. Vous pouvez récupérer un objet à tout moment.' },
  { id: 'loot-41', roll: 41, name: 'Stride Relic', description: 'Vous obtenez un bonus de +1 en Agilité. Vous ne pouvez porter qu’une seule relique.' },
  { id: 'loot-42', roll: 42, name: 'Bolster Relic', description: 'Vous obtenez un bonus de +1 en Force. Vous ne pouvez porter qu’une seule relique.' },
  { id: 'loot-43', roll: 43, name: 'Control Relic', description: 'Vous obtenez un bonus de +1 en Finesse. Vous ne pouvez porter qu’une seule relique.' },
  { id: 'loot-44', roll: 44, name: 'Attune Relic', description: 'Vous obtenez un bonus de +1 en Instinct. Vous ne pouvez porter qu’une seule relique.' },
  { id: 'loot-45', roll: 45, name: 'Charm Relic', description: 'Vous obtenez un bonus de +1 en Présence. Vous ne pouvez porter qu’une seule relique.' },
  { id: 'loot-46', roll: 46, name: 'Enlighten Relic', description: 'Vous obtenez un bonus de +1 en Savoir. Vous ne pouvez porter qu’une seule relique.' },
  { id: 'loot-47', roll: 47, name: 'Honing Relic', description: 'Vous obtenez un bonus de +1 à une Expérience de votre choix. Vous ne pouvez porter qu’une seule relique.' },
  { id: 'loot-48', roll: 48, name: 'Flickerfly Pendant', description: 'Tant que vous portez ce pendentif, vos armes à portée de Mêlée infligeant des dégâts physiques ont un éclat diaphane et peuvent attaquer des cibles à portée Très Proche.' },
  { id: 'loot-49', roll: 49, name: 'Lakestrider Boots', description: 'Vous pouvez marcher sur la surface de l’eau comme si c’était un sol meuble.' },
  { id: 'loot-50', roll: 50, name: 'Clay Companion', description: 'Quand vous sculptez cette boule d’argile en compagnon animal, elle se comporte comme cet animal. Par exemple, une araignée d’argile peut tisser des toiles, tandis qu’un oiseau d’argile peut voler. Le compagnon conserve sa mémoire et son identité entre les formes, mais peut adopter de nouveaux comportements avec chaque forme.' },
  { id: 'loot-51', roll: 51, name: 'Mythic Dust Recipe', description: 'Comme action de temps libre, vous pouvez utiliser une poignée de poussière d’or fine pour fabriquer de la Poussière mythique.' },
  { id: 'loot-52', roll: 52, name: 'Shard of Memory', description: 'Une fois par repos long, vous pouvez dépenser 2 Espoir pour rappeler une carte de domaine de votre réserve au lieu de payer son Coût de rappel.' },
  { id: 'loot-53', roll: 53, name: 'Gem of Alacrity', description: 'Vous pouvez fixer cette gemme à une arme, vous permettant d’utiliser votre Agilité pour attaquer avec cette arme.' },
  { id: 'loot-54', roll: 54, name: 'Gem of Might', description: 'Vous pouvez fixer cette gemme à une arme, vous permettant d’utiliser votre Force pour attaquer avec cette arme.' },
  { id: 'loot-55', roll: 55, name: 'Gem of Precision', description: 'Vous pouvez fixer cette gemme à une arme, vous permettant d’utiliser votre Finesse pour attaquer avec cette arme.' },
  { id: 'loot-56', roll: 56, name: 'Gem of Insight', description: 'Vous pouvez fixer cette gemme à une arme, vous permettant d’utiliser votre Instinct pour attaquer avec cette arme.' },
  { id: 'loot-57', roll: 57, name: 'Gem of Audacity', description: 'Vous pouvez fixer cette gemme à une arme, vous permettant d’utiliser votre Présence pour attaquer avec cette arme.' },
  { id: 'loot-58', roll: 58, name: 'Gem of Sagacity', description: 'Vous pouvez fixer cette gemme à une arme, vous permettant d’utiliser votre Savoir pour attaquer avec cette arme.' },
  { id: 'loot-59', roll: 59, name: 'Ring of Unbreakable Resolve', description: 'Une fois par session, quand le MJ dépense une Peur, vous pouvez dépenser 4 Espoir pour annuler les effets de cette Peur dépensée.' },
  { id: 'loot-60', roll: 60, name: 'Belt of Unity', description: 'Une fois par session, vous pouvez dépenser 5 Espoir pour mener un jet d’Équipe avec trois PJ au lieu de deux.' }
]

// Enrichir chaque loot avec sa rareté calculée
LOOT.forEach((item) => {
  item.rarity = getRarityFromRoll(item.roll)
})

/**
 * Retourne le loot par rareté.
 * @param {string} rarity
 * @returns {Object[]}
 */
export function getLootByRarity(rarity) {
  return LOOT.filter((l) => l.rarity === rarity)
}

/**
 * Retourne un loot par roll.
 * @param {number} roll
 * @returns {Object|null}
 */
export function getLootByRoll(roll) {
  return LOOT.find((l) => l.roll === roll) || null
}

/**
 * Retourne un loot par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getLootById(id) {
  return LOOT.find((l) => l.id === id) || null
}
