/**
 * @module equipment/secondaryWeapons
 * @description Armes secondaires SRD Daggerheart — Tiers 1 à 4.
 * Source : SRD_EQUIPMENT.pdf (page 5)
 */

export const SECONDARY_WEAPONS = [
  // ═══════════════════════════════════════════
  //  TIER 1 (Level 1)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t1', name: 'Shortsword', tier: 1, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8', burden: 'One-Handed', feature: 'Paired: +2 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'round-shield-t1', name: 'Round Shield', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4', burden: 'One-Handed', feature: 'Protective: +1 to Armor Score', featureKey: 'Protective' },
  { id: 'tower-shield-t1', name: 'Tower Shield', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6', burden: 'One-Handed', feature: 'Barrier: +2 to Armor Score; −1 to Evasion', featureKey: 'Barrier' },
  { id: 'small-dagger-t1', name: 'Small Dagger', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8', burden: 'One-Handed', feature: 'Paired: +2 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'whip-t1', name: 'Whip', tier: 1, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6', burden: 'One-Handed', feature: 'Startling: Mark a Stress to crack the whip and force all adversaries within Melee range back to Close range.', featureKey: 'Startling' },
  { id: 'grappler-t1', name: 'Grappler', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6', burden: 'One-Handed', feature: 'Hooked: On a successful attack, you can pull the target into Melee range.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t1', name: 'Hand Crossbow', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+1', burden: 'One-Handed', feature: null, featureKey: null },

  // ═══════════════════════════════════════════
  //  TIER 2 (Levels 2–4)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t2', name: 'Improved Shortsword', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+2', burden: 'One-Handed', feature: 'Paired: +3 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'round-shield-t2', name: 'Improved Round Shield', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4+2', burden: 'One-Handed', feature: 'Protective: +2 to Armor Score', featureKey: 'Protective' },
  { id: 'tower-shield-t2', name: 'Improved Tower Shield', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+2', burden: 'One-Handed', feature: 'Barrier: +3 to Armor Score; −1 to Evasion', featureKey: 'Barrier' },
  { id: 'small-dagger-t2', name: 'Improved Small Dagger', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+2', burden: 'One-Handed', feature: 'Paired: +3 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'whip-t2', name: 'Improved Whip', tier: 2, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6+2', burden: 'One-Handed', feature: 'Startling: Mark a Stress to crack the whip and force all adversaries within Melee range back to Close range.', featureKey: 'Startling' },
  { id: 'grappler-t2', name: 'Improved Grappler', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6+2', burden: 'One-Handed', feature: 'Hooked: On a successful attack, you can pull the target into Melee range.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t2', name: 'Improved Hand Crossbow', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+3', burden: 'One-Handed', feature: null, featureKey: null },
  // Tier 2 unique
  { id: 'spiked-shield-t2', name: 'Spiked Shield', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+2', burden: 'One-Handed', feature: 'Double Duty: +1 to Armor Score; +1 to primary weapon damage within Melee range', featureKey: 'Double Duty' },
  { id: 'parrying-dagger-t2', name: 'Parrying Dagger', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd6+2', burden: 'One-Handed', feature: "Parry: When you are attacked, roll this weapon's damage dice. If any of the attacker's damage dice rolled the same value as your dice, the matching results are discarded from the attacker's damage dice before the damage you take is totaled.", featureKey: 'Parry' },
  { id: 'returning-axe-t2', name: 'Returning Axe', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Returning: When this weapon is thrown within its range, it appears in your hand immediately after the attack.', featureKey: 'Returning' },

  // ═══════════════════════════════════════════
  //  TIER 3 (Levels 5–7)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t3', name: 'Advanced Shortsword', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: 'Paired: +4 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'round-shield-t3', name: 'Advanced Round Shield', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4+4', burden: 'One-Handed', feature: 'Protective: +3 to Armor Score', featureKey: 'Protective' },
  { id: 'tower-shield-t3', name: 'Advanced Tower Shield', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+4', burden: 'One-Handed', feature: 'Barrier: +4 to Armor Score; −1 to Evasion', featureKey: 'Barrier' },
  { id: 'small-dagger-t3', name: 'Advanced Small Dagger', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: 'Paired: +4 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'whip-t3', name: 'Advanced Whip', tier: 3, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Startling: Mark a Stress to crack the whip and force all adversaries within Melee range back to Close range.', featureKey: 'Startling' },
  { id: 'grappler-t3', name: 'Advanced Grappler', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Hooked: On a successful attack, you can pull the target into Melee range.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t3', name: 'Advanced Hand Crossbow', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+5', burden: 'One-Handed', feature: null, featureKey: null },
  // Tier 3 unique
  { id: 'buckler-t3', name: 'Buckler', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd4+4', burden: 'One-Handed', feature: 'Deflecting: When you are attacked, you can mark an Armor Slot to gain a bonus to your Evasion equal to your available Armor Score against the attack.', featureKey: 'Deflecting' },
  { id: 'powered-gauntlet-t3', name: 'Powered Gauntlet', tier: 3, damageType: 'phy', trait: 'Knowledge', range: 'Close', damage: 'd6+4', burden: 'One-Handed', feature: 'Charged: Mark a Stress to gain a +1 bonus to your Proficiency on a primary weapon attack.', featureKey: 'Charged' },
  { id: 'hand-sling-t3', name: 'Hand Sling', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Very Far', damage: 'd6+4', burden: 'One-Handed', feature: 'Versatile: This weapon can also be used with these statistics—Finesse, Close, d8+4.', featureKey: 'Versatile' },

  // ═══════════════════════════════════════════
  //  TIER 4 (Levels 8–10)
  // ═══════════════════════════════════════════
  { id: 'shortsword-t4', name: 'Legendary Shortsword', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+6', burden: 'One-Handed', feature: 'Paired: +5 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'round-shield-t4', name: 'Legendary Round Shield', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd4+6', burden: 'One-Handed', feature: 'Protective: +4 to Armor Score', featureKey: 'Protective' },
  { id: 'tower-shield-t4', name: 'Legendary Tower Shield', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+6', burden: 'One-Handed', feature: 'Barrier: +5 to Armor Score; −1 to Evasion.', featureKey: 'Barrier' },
  { id: 'small-dagger-t4', name: 'Legendary Small Dagger', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+6', burden: 'One-Handed', feature: 'Paired: +5 to primary weapon damage to targets within Melee range', featureKey: 'Paired' },
  { id: 'whip-t4', name: 'Legendary Whip', tier: 4, damageType: 'phy', trait: 'Presence', range: 'Very Close', damage: 'd6+6', burden: 'One-Handed', feature: 'Startling: Mark a Stress to crack the whip and force all adversaries within Melee range back to Close range.', featureKey: 'Startling' },
  { id: 'grappler-t4', name: 'Legendary Grappler', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd6+6', burden: 'One-Handed', feature: 'Hooked: On a successful attack, you can pull the target into Melee range.', featureKey: 'Hooked' },
  { id: 'hand-crossbow-t4', name: 'Legendary Hand Crossbow', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+7', burden: 'One-Handed', feature: null, featureKey: null },
  // Tier 4 unique
  { id: 'braveshield-t4', name: 'Braveshield', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd4+6', burden: 'One-Handed', feature: 'Sheltering: When you mark an Armor Slot, it reduces damage for you and all allies within Melee range of you who took the same damage.', featureKey: 'Sheltering' },
  { id: 'knuckle-claws-t4', name: 'Knuckle Claws', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd6+8', burden: 'One-Handed', feature: 'Doubled Up: When you make an attack with your primary weapon, you can deal damage to another target within Melee range.', featureKey: 'Doubled Up' },
  { id: 'primer-shard-t4', name: 'Primer Shard', tier: 4, damageType: 'phy', trait: 'Instinct', range: 'Very Close', damage: 'd4', burden: 'One-Handed', feature: 'Locked On: On a successful attack, your next attack against the same target with your primary weapon automatically succeeds.', featureKey: 'Locked On' }
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
