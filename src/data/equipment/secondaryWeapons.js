/**
 * @module equipment/secondaryWeapons
 * @description Armes secondaires SRD Daggerheart — Tiers 1 à 4.
 * Source : SRD_EQUIPMENT.pdf (page 5)
 */

export const SECONDARY_WEAPONS = [
  // ═══════════════════════════════════════════
  //  TIER 1 (Level 1)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t1', name: 'Shortsword', tier: 1, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8', burden: 'One-Handed', feature: 'Paired : +2 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'round-shield-t1', name: 'Round Shield', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4', burden: 'One-Handed', feature: 'Protective : +1 au Score d’armure', featureKey: 'Protective' },
  { id: 'tower-shield-t1', name: 'Tower Shield', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6', burden: 'One-Handed', feature: 'Barrier : +2 au Score d’armure ; −1 en Évasion', featureKey: 'Barrier' },
  { id: 'small-dagger-t1', name: 'Small Dagger', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8', burden: 'One-Handed', feature: 'Paired : +2 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'whip-t1', name: 'Whip', tier: 1, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6', burden: 'One-Handed', feature: 'Startling : Cochez un Stress pour faire claquer le fouet et repousser tous les adversaires à portée de Mêlée vers la portée Proche.', featureKey: 'Startling' },
  { id: 'grappler-t1', name: 'Grappler', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6', burden: 'One-Handed', feature: 'Hooked : Sur une attaque réussie, vous pouvez attirer la cible à portée de Mêlée.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t1', name: 'Hand Crossbow', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+1', burden: 'One-Handed', feature: null, featureKey: null },

  // ═══════════════════════════════════════════
  //  TIER 2 (Levels 2–4)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t2', name: 'Improved Shortsword', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+2', burden: 'One-Handed', feature: 'Paired : +3 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'round-shield-t2', name: 'Improved Round Shield', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4+2', burden: 'One-Handed', feature: 'Protective : +2 au Score d’armure', featureKey: 'Protective' },
  { id: 'tower-shield-t2', name: 'Improved Tower Shield', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+2', burden: 'One-Handed', feature: 'Barrier : +3 au Score d’armure ; −1 en Évasion', featureKey: 'Barrier' },
  { id: 'small-dagger-t2', name: 'Improved Small Dagger', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+2', burden: 'One-Handed', feature: 'Paired : +3 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'whip-t2', name: 'Improved Whip', tier: 2, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6+2', burden: 'One-Handed', feature: 'Startling : Cochez un Stress pour faire claquer le fouet et repousser tous les adversaires à portée de Mêlée vers la portée Proche.', featureKey: 'Startling' },
  { id: 'grappler-t2', name: 'Improved Grappler', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6+2', burden: 'One-Handed', feature: 'Hooked : Sur une attaque réussie, vous pouvez attirer la cible à portée de Mêlée.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t2', name: 'Improved Hand Crossbow', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+3', burden: 'One-Handed', feature: null, featureKey: null },
  // Tier 2 unique
  { id: 'spiked-shield-t2', name: 'Spiked Shield', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+2', burden: 'One-Handed', feature: 'Double Duty : +1 au Score d’armure ; +1 aux dégâts de l’arme principale à portée de Mêlée', featureKey: 'Double Duty' },
  { id: 'parrying-dagger-t2', name: 'Parrying Dagger', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd6+2', burden: 'One-Handed', feature: "Parry : Quand vous êtes attaqué, lancez les dés de dégâts de cette arme. Si un des dés de dégâts de l’attaquant obtient la même valeur que vos dés, les résultats identiques sont défaussés des dés de l’attaquant avant que les dégâts subis ne soient totalisés.", featureKey: 'Parry' },
  { id: 'returning-axe-t2', name: 'Returning Axe', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Returning : Quand cette arme est lancée dans sa portée, elle réapparaît dans votre main immédiatement après l’attaque.', featureKey: 'Returning' },

  // ═══════════════════════════════════════════
  //  TIER 3 (Levels 5–7)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t3', name: 'Advanced Shortsword', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: 'Paired : +4 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'round-shield-t3', name: 'Advanced Round Shield', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4+4', burden: 'One-Handed', feature: 'Protective : +3 au Score d’armure', featureKey: 'Protective' },
  { id: 'tower-shield-t3', name: 'Advanced Tower Shield', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+4', burden: 'One-Handed', feature: 'Barrier : +4 au Score d’armure ; −1 en Évasion', featureKey: 'Barrier' },
  { id: 'small-dagger-t3', name: 'Advanced Small Dagger', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: 'Paired : +4 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'whip-t3', name: 'Advanced Whip', tier: 3, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Startling : Cochez un Stress pour faire claquer le fouet et repousser tous les adversaires à portée de Mêlée vers la portée Proche.', featureKey: 'Startling' },
  { id: 'grappler-t3', name: 'Advanced Grappler', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Hooked : Sur une attaque réussie, vous pouvez attirer la cible à portée de Mêlée.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t3', name: 'Advanced Hand Crossbow', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+5', burden: 'One-Handed', feature: null, featureKey: null },
  // Tier 3 unique
  { id: 'buckler-t3', name: 'Buckler', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd4+4', burden: 'One-Handed', feature: 'Deflecting : Quand vous êtes attaqué, vous pouvez cocher un Emplacement d’armure pour obtenir un bonus à votre Évasion égal à votre Score d’armure disponible contre l’attaque.', featureKey: 'Deflecting' },
  { id: 'powered-gauntlet-t3', name: 'Powered Gauntlet', tier: 3, damageType: 'phy', trait: 'Knowledge', range: 'Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Charged : Cochez un Stress pour obtenir un bonus de +1 à votre Maîtrise sur une attaque d’arme principale.', featureKey: 'Charged' },
  { id: 'hand-sling-t3', name: 'Hand Sling', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Very Far', damage: 'd6+4', burden: 'One-Handed', feature: 'Versatile : Cette arme peut aussi être utilisée avec ces statistiques — Finesse, Proche, d8+4.', featureKey: 'Versatile' },

  // ═══════════════════════════════════════════
  //  TIER 4 (Levels 8–10)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t4', name: 'Legendary Shortsword', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+6', burden: 'One-Handed', feature: 'Paired : +5 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'round-shield-t4', name: 'Legendary Round Shield', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4+6', burden: 'One-Handed', feature: 'Protective : +4 au Score d’armure', featureKey: 'Protective' },
  { id: 'tower-shield-t4', name: 'Legendary Tower Shield', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+6', burden: 'One-Handed', feature: 'Barrier : +5 au Score d’armure ; −1 en Évasion.', featureKey: 'Barrier' },
  { id: 'small-dagger-t4', name: 'Legendary Small Dagger', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+6', burden: 'One-Handed', feature: 'Paired : +5 aux dégâts de l’arme principale contre les cibles à portée de Mêlée', featureKey: 'Paired' },
  { id: 'whip-t4', name: 'Legendary Whip', tier: 4, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6+6', burden: 'One-Handed', feature: 'Startling : Cochez un Stress pour faire claquer le fouet et repousser tous les adversaires à portée de Mêlée vers la portée Proche.', featureKey: 'Startling' },
  { id: 'grappler-t4', name: 'Legendary Grappler', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6+6', burden: 'One-Handed', feature: 'Hooked : Sur une attaque réussie, vous pouvez attirer la cible à portée de Mêlée.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t4', name: 'Legendary Hand Crossbow', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+7', burden: 'One-Handed', feature: null, featureKey: null },
  // Tier 4 unique
  { id: 'braveshield-t4', name: 'Braveshield', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd4+6', burden: 'One-Handed', feature: 'Sheltering : Quand vous cochez un Emplacement d’armure, cela réduit les dégâts pour vous et tous les alliés à portée de Mêlée qui ont subi les mêmes dégâts.', featureKey: 'Sheltering' },
  { id: 'knuckle-claws-t4', name: 'Knuckle Claws', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+8', burden: 'One-Handed', feature: 'Doubled Up : Quand vous attaquez avec votre arme principale, vous pouvez infliger des dégâts à une autre cible à portée de Mêlée.', featureKey: 'Doubled Up' },
  { id: 'primer-shard-t4', name: 'Primer Shard', tier: 4, damageType: 'phy', trait: 'Instinct', range: 'Very Close', damage: 'd4', burden: 'One-Handed', feature: 'Locked On : Sur une attaque réussie, votre prochaine attaque contre la même cible avec votre arme principale réussit automatiquement.', featureKey: 'Locked On' }
]

/**
 * Retourne les armes secondaires par tier.
 * @param {number} tier
 * @returns {Object[]}
 */
export function getSecondaryWeaponsByTier(tier) {
  return SECONDARY_WEAPONS.filter((w) => w.tier === tier)
}

/**
 * Retourne une arme secondaire par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getSecondaryWeaponById(id) {
  return SECONDARY_WEAPONS.find((w) => w.id === id) || null
}
