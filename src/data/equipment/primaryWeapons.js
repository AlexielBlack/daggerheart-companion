/**
 * @module equipment/primaryWeapons
 * @description Armes primaires SRD Daggerheart — Tiers 1 à 4.
 * Source : SRD_EQUIPMENT.pdf (pages 1–4)
 *
 * Chaque arme a : id, name, tier, damageType (phy|mag), trait, range, damage, burden, feature, featureKey
 */

export const PRIMARY_WEAPONS = [
  // ═══════════════════════════════════════════
  //  TIER 1 (Level 1) — Physical
  // ═══════════════════════════════════════════
  { id: 'broadsword-t1', name: 'Broadsword', tier: 1, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8', burden: 'One-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },
  { id: 'longsword-t1', name: 'Longsword', tier: 1, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd10+3', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'battleaxe-t1', name: 'Battleaxe', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+3', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'greatsword-t1', name: 'Greatsword', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+3', burden: 'Two-Handed', feature: 'Massive : −1 en Évasion ; sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Massive' },
  { id: 'mace-t1', name: 'Mace', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd8+1', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'warhammer-t1', name: 'Warhammer', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd12+3', burden: 'Two-Handed', feature: 'Heavy : −1 en Évasion', featureKey: 'Heavy' },
  { id: 'dagger-t1', name: 'Dagger', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+1', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'quarterstaff-t1', name: 'Quarterstaff', tier: 1, damageType: 'phy', trait: 'Instinct', range: 'Melee', damage: 'd10+3', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'cutlass-t1', name: 'Cutlass', tier: 1, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8+1', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'rapier-t1', name: 'Rapier', tier: 1, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8', burden: 'One-Handed', feature: 'Quick : Quand vous effectuez une attaque, vous pouvez cocher un Stress pour cibler une autre créature à portée.', featureKey: 'Quick' },
  { id: 'halberd-t1', name: 'Halberd', tier: 1, damageType: 'phy', trait: 'Strength', range: 'Very Close', damage: 'd10+2', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },
  { id: 'spear-t1', name: 'Spear', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Very Close', damage: 'd8+3', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'shortbow-t1', name: 'Shortbow', tier: 1, damageType: 'phy', trait: 'Agility', range: 'Far', damage: 'd6+3', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'crossbow-t1', name: 'Crossbow', tier: 1, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+1', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'longbow-t1', name: 'Longbow', tier: 1, damageType: 'phy', trait: 'Agility', range: 'Very Far', damage: 'd8+3', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },

  // ═══ TIER 1 — Magic ═══
  { id: 'arcane-gauntlets-t1', name: 'Arcane Gauntlets', tier: 1, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd10+3', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hallowed-axe-t1', name: 'Hallowed Axe', tier: 1, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd8+1', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'glowing-rings-t1', name: 'Glowing Rings', tier: 1, damageType: 'mag', trait: 'Agility', range: 'Very Close', damage: 'd10+2', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hand-runes-t1', name: 'Hand Runes', tier: 1, damageType: 'mag', trait: 'Instinct', range: 'Very Close', damage: 'd10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'returning-blade-t1', name: 'Returning Blade', tier: 1, damageType: 'mag', trait: 'Finesse', range: 'Close', damage: 'd8', burden: 'One-Handed', feature: 'Returning : Quand cette arme est lancée dans sa portée, elle réapparaît dans votre main immédiatement après l’attaque.', featureKey: 'Returning' },
  { id: 'shortstaff-t1', name: 'Shortstaff', tier: 1, damageType: 'mag', trait: 'Instinct', range: 'Close', damage: 'd8+1', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'dualstaff-t1', name: 'Dualstaff', tier: 1, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd6+3', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'scepter-t1', name: 'Scepter', tier: 1, damageType: 'mag', trait: 'Presence', range: 'Far', damage: 'd6', burden: 'Two-Handed', feature: 'Versatile : Cette arme peut aussi être utilisée avec ces statistiques — Présence, Mêlée, d8.', featureKey: 'Versatile' },
  { id: 'wand-t1', name: 'Wand', tier: 1, damageType: 'mag', trait: 'Knowledge', range: 'Far', damage: 'd6+1', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'greatstaff-t1', name: 'Greatstaff', tier: 1, damageType: 'mag', trait: 'Knowledge', range: 'Very Far', damage: 'd6', burden: 'Two-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },

  // ═══════════════════════════════════════════
  //  TIER 2 (Levels 2–4) — Physical
  // ═══════════════════════════════════════════
  { id: 'broadsword-t2', name: 'Improved Broadsword', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+3', burden: 'One-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },
  { id: 'longsword-t2', name: 'Improved Longsword', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd10+6', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'battleaxe-t2', name: 'Improved Battleaxe', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+6', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'greatsword-t2', name: 'Improved Greatsword', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+6', burden: 'Two-Handed', feature: 'Massive : −1 en Évasion ; sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Massive' },
  { id: 'mace-t2', name: 'Improved Mace', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'warhammer-t2', name: 'Improved Warhammer', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd12+6', burden: 'Two-Handed', feature: 'Heavy : −1 en Évasion', featureKey: 'Heavy' },
  { id: 'dagger-t2', name: 'Improved Dagger', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'quarterstaff-t2', name: 'Improved Quarterstaff', tier: 2, damageType: 'phy', trait: 'Instinct', range: 'Melee', damage: 'd10+6', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'cutlass-t2', name: 'Improved Cutlass', tier: 2, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'rapier-t2', name: 'Improved Rapier', tier: 2, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8+3', burden: 'One-Handed', feature: 'Quick : Quand vous effectuez une attaque, vous pouvez cocher un Stress pour cibler une autre créature à portée.', featureKey: 'Quick' },
  { id: 'halberd-t2', name: 'Improved Halberd', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Very Close', damage: 'd10+5', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },
  { id: 'spear-t2', name: 'Improved Spear', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Very Close', damage: 'd8+6', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'shortbow-t2', name: 'Improved Shortbow', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Far', damage: 'd6+6', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'crossbow-t2', name: 'Improved Crossbow', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+4', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'longbow-t2', name: 'Improved Longbow', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Very Far', damage: 'd8+6', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },
  // Tier 2 unique physical
  { id: 'gilded-falchion-t2', name: 'Gilded Falchion', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+4', burden: 'One-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  { id: 'knuckle-blades-t2', name: 'Knuckle Blades', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+6', burden: 'Two-Handed', feature: 'Brutal : Quand vous obtenez la valeur maximale sur un dé de dégâts, lancez un dé de dégâts supplémentaire.', featureKey: 'Brutal' },
  { id: 'urok-broadsword-t2', name: 'Urok Broadsword', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+3', burden: 'One-Handed', feature: 'Deadly : Quand vous infligez des dégâts Graves, la cible doit cocher un PV supplémentaire.', featureKey: 'Deadly' },
  { id: 'bladed-whip-t2', name: 'Bladed Whip', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Very Close', damage: 'd8+3', burden: 'One-Handed', feature: 'Quick : Quand vous effectuez une attaque, vous pouvez cocher un Stress pour cibler une autre créature à portée.', featureKey: 'Quick' },
  { id: 'steelforged-halberd-t2', name: 'Steelforged Halberd', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Very Close', damage: 'd8+4', burden: 'Two-Handed', feature: 'Scary : Sur une attaque réussie, la cible doit cocher un Stress.', featureKey: 'Scary' },
  { id: 'war-scythe-t2', name: 'War Scythe', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Very Close', damage: 'd8+5', burden: 'Two-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },
  { id: 'blunderbuss-t2', name: 'Blunderbuss', tier: 2, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd8+6', burden: 'Two-Handed', feature: 'Reloading : Après une attaque, lancez un d6. Sur un résultat de 1, vous devez cocher un Stress pour recharger cette arme avant de pouvoir tirer à nouveau.', featureKey: 'Reloading' },
  { id: 'greatbow-t2', name: 'Greatbow', tier: 2, damageType: 'phy', trait: 'Strength', range: 'Far', damage: 'd6+6', burden: 'Two-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  { id: 'finehair-bow-t2', name: 'Finehair Bow', tier: 2, damageType: 'phy', trait: 'Agility', range: 'Very Far', damage: 'd6+5', burden: 'Two-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },

  // ═══ TIER 2 — Magic ═══
  { id: 'arcane-gauntlets-t2', name: 'Improved Arcane Gauntlets', tier: 2, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd10+6', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hallowed-axe-t2', name: 'Improved Hallowed Axe', tier: 2, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'glowing-rings-t2', name: 'Improved Glowing Rings', tier: 2, damageType: 'mag', trait: 'Agility', range: 'Very Close', damage: 'd10+5', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hand-runes-t2', name: 'Improved Hand Runes', tier: 2, damageType: 'mag', trait: 'Instinct', range: 'Very Close', damage: 'd10+3', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'returning-blade-t2', name: 'Improved Returning Blade', tier: 2, damageType: 'mag', trait: 'Finesse', range: 'Close', damage: 'd8+3', burden: 'One-Handed', feature: 'Returning : Quand cette arme est lancée dans sa portée, elle réapparaît dans votre main immédiatement après l’attaque.', featureKey: 'Returning' },
  { id: 'shortstaff-t2', name: 'Improved Shortstaff', tier: 2, damageType: 'mag', trait: 'Instinct', range: 'Close', damage: 'd8+4', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'dualstaff-t2', name: 'Improved Dualstaff', tier: 2, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd6+6', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'scepter-t2', name: 'Improved Scepter', tier: 2, damageType: 'mag', trait: 'Presence', range: 'Far', damage: 'd6+3', burden: 'Two-Handed', feature: 'Versatile : Cette arme peut aussi être utilisée avec ces statistiques — Présence, Mêlée, d8+3.', featureKey: 'Versatile' },
  { id: 'wand-t2', name: 'Improved Wand', tier: 2, damageType: 'mag', trait: 'Knowledge', range: 'Far', damage: 'd6+4', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'greatstaff-t2', name: 'Improved Greatstaff', tier: 2, damageType: 'mag', trait: 'Knowledge', range: 'Very Far', damage: 'd6+3', burden: 'Two-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  // Tier 2 unique magic
  { id: 'ego-blade-t2', name: 'Ego Blade', tier: 2, damageType: 'mag', trait: 'Agility', range: 'Melee', damage: 'd12+4', burden: 'One-Handed', feature: 'Pompous : Vous devez avoir une Présence de 0 ou moins pour utiliser cette arme.', featureKey: 'Pompous' },
  { id: 'casting-sword-t2', name: 'Casting Sword', tier: 2, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd10+4', burden: 'Two-Handed', feature: 'Versatile : Cette arme peut aussi être utilisée avec ces statistiques — Savoir, Loin, d6+3.', featureKey: 'Versatile' },
  { id: 'devouring-dagger-t2', name: 'Devouring Dagger', tier: 2, damageType: 'mag', trait: 'Finesse', range: 'Melee', damage: 'd8+4', burden: 'One-Handed', feature: 'Scary : Sur une attaque réussie, la cible doit cocher un Stress.', featureKey: 'Scary' },
  { id: 'hammer-of-exota-t2', name: 'Hammer of Exota', tier: 2, damageType: 'mag', trait: 'Instinct', range: 'Melee', damage: 'd8+6', burden: 'Two-Handed', feature: 'Eruptive : Sur une attaque réussie contre une cible à portée de Mêlée, tous les autres adversaires à portée Très Proche doivent réussir un jet de réaction (14) ou subir la moitié des dégâts.', featureKey: 'Eruptive' },
  { id: 'yutari-bloodbow-t2', name: 'Yutari Bloodbow', tier: 2, damageType: 'mag', trait: 'Finesse', range: 'Far', damage: 'd6+4', burden: 'Two-Handed', feature: 'Brutal : Quand vous obtenez la valeur maximale sur un dé de dégâts, lancez un dé de dégâts supplémentaire.', featureKey: 'Brutal' },
  { id: 'elder-bow-t2', name: 'Elder Bow', tier: 2, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd6+4', burden: 'Two-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  { id: 'scepter-of-elias-t2', name: 'Scepter of Elias', tier: 2, damageType: 'mag', trait: 'Presence', range: 'Far', damage: 'd6+3', burden: 'One-Handed', feature: 'Invigorating : Sur une attaque réussie, lancez un d4. Sur un résultat de 4, libérez un Stress.', featureKey: 'Invigorating' },
  { id: 'wand-of-enthrallment-t2', name: 'Wand of Enthrallment', tier: 2, damageType: 'mag', trait: 'Presence', range: 'Far', damage: 'd6+4', burden: 'One-Handed', feature: 'Persuasive : Avant un jet de Présence, vous pouvez cocher un Stress pour obtenir un bonus de +2 au résultat.', featureKey: 'Persuasive' },
  { id: 'keepers-staff-t2', name: "Keeper's Staff", tier: 2, damageType: 'mag', trait: 'Knowledge', range: 'Far', damage: 'd6+4', burden: 'Two-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },

  // ═══════════════════════════════════════════
  //  TIER 3 (Levels 5–7) — Physical
  // ═══════════════════════════════════════════
  { id: 'broadsword-t3', name: 'Advanced Broadsword', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+6', burden: 'One-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },
  { id: 'longsword-t3', name: 'Advanced Longsword', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'battleaxe-t3', name: 'Advanced Battleaxe', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'greatsword-t3', name: 'Advanced Greatsword', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: 'Massive : −1 en Évasion ; sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Massive' },
  { id: 'mace-t3', name: 'Advanced Mace', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd8+7', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'warhammer-t3', name: 'Advanced Warhammer', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd12+9', burden: 'Two-Handed', feature: 'Heavy : −1 en Évasion', featureKey: 'Heavy' },
  { id: 'dagger-t3', name: 'Advanced Dagger', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+7', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'quarterstaff-t3', name: 'Advanced Quarterstaff', tier: 3, damageType: 'phy', trait: 'Instinct', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'cutlass-t3', name: 'Advanced Cutlass', tier: 3, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8+7', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'rapier-t3', name: 'Advanced Rapier', tier: 3, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8+6', burden: 'One-Handed', feature: 'Quick : Quand vous effectuez une attaque, vous pouvez cocher un Stress pour cibler une autre créature à portée.', featureKey: 'Quick' },
  { id: 'halberd-t3', name: 'Advanced Halberd', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Very Close', damage: 'd10+8', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },
  { id: 'spear-t3', name: 'Advanced Spear', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Very Close', damage: 'd8+9', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'shortbow-t3', name: 'Advanced Shortbow', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Far', damage: 'd6+9', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'crossbow-t3', name: 'Advanced Crossbow', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+7', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'longbow-t3', name: 'Advanced Longbow', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Very Far', damage: 'd8+9', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },
  // Tier 3 unique physical
  { id: 'flickerfly-blade-t3', name: 'Flickerfly Blade', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+5', burden: 'One-Handed', feature: 'Sharpwing : Obtenez un bonus à vos jets de dégâts égal à votre Agilité.', featureKey: 'Sharpwing' },
  { id: 'bravesword-t3', name: 'Bravesword', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd12+7', burden: 'Two-Handed', feature: 'Brave : −1 en Évasion ; +3 au seuil de dégâts Graves', featureKey: 'Brave' },
  { id: 'hammer-of-wrath-t3', name: 'Hammer of Wrath', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+7', burden: 'Two-Handed', feature: 'Devastating : Avant un jet d’attaque, vous pouvez cocher un Stress pour utiliser un d20 comme dé de dégâts.', featureKey: 'Devastating' },
  { id: 'labrys-axe-t3', name: 'Labrys Axe', tier: 3, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+7', burden: 'Two-Handed', feature: 'Protective : +1 au Score d’armure', featureKey: 'Protective' },
  { id: 'meridian-cutlass-t3', name: 'Meridian Cutlass', tier: 3, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd10+5', burden: 'One-Handed', feature: 'Dueling : Quand aucune autre créature n’est à portée Proche de la cible, obtenez un avantage sur votre jet d’attaque contre elle.', featureKey: 'Dueling' },
  { id: 'retractable-saber-t3', name: 'Retractable Saber', tier: 3, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd10+7', burden: 'One-Handed', feature: 'Retractable : La lame peut être dissimulée dans la garde pour éviter la détection.', featureKey: 'Retractable' },
  { id: 'double-flail-t3', name: 'Double Flail', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Very Close', damage: 'd10+8', burden: 'Two-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  { id: 'talon-blades-t3', name: 'Talon Blades', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Close', damage: 'd10+7', burden: 'Two-Handed', feature: 'Brutal : Quand vous obtenez la valeur maximale sur un dé de dégâts, lancez un dé de dégâts supplémentaire.', featureKey: 'Brutal' },
  { id: 'black-powder-revolver-t3', name: 'Black Powder Revolver', tier: 3, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+8', burden: 'One-Handed', feature: 'Reloading : Après une attaque, lancez un d6. Sur un résultat de 1, vous devez cocher un Stress pour recharger cette arme avant de pouvoir tirer à nouveau.', featureKey: 'Reloading' },
  { id: 'spiked-bow-t3', name: 'Spiked Bow', tier: 3, damageType: 'phy', trait: 'Agility', range: 'Very Far', damage: 'd6+7', burden: 'Two-Handed', feature: 'Versatile : Cette arme peut aussi être utilisée avec ces statistiques — Agilité, Mêlée, d10+5.', featureKey: 'Versatile' },

  // ═══ TIER 3 — Magic ═══
  { id: 'arcane-gauntlets-t3', name: 'Advanced Arcane Gauntlets', tier: 3, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hallowed-axe-t3', name: 'Advanced Hallowed Axe', tier: 3, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd8+7', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'glowing-rings-t3', name: 'Advanced Glowing Rings', tier: 3, damageType: 'mag', trait: 'Agility', range: 'Very Close', damage: 'd10+8', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hand-runes-t3', name: 'Advanced Hand Runes', tier: 3, damageType: 'mag', trait: 'Instinct', range: 'Very Close', damage: 'd10+6', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'returning-blade-t3', name: 'Advanced Returning Blade', tier: 3, damageType: 'mag', trait: 'Finesse', range: 'Close', damage: 'd8+6', burden: 'One-Handed', feature: 'Returning : Quand cette arme est lancée dans sa portée, elle réapparaît dans votre main immédiatement après l’attaque.', featureKey: 'Returning' },
  { id: 'shortstaff-t3', name: 'Advanced Shortstaff', tier: 3, damageType: 'mag', trait: 'Instinct', range: 'Close', damage: 'd8+7', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'dualstaff-t3', name: 'Advanced Dualstaff', tier: 3, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd6+9', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'scepter-t3', name: 'Advanced Scepter', tier: 3, damageType: 'mag', trait: 'Presence', range: 'Far', damage: 'd6+6', burden: 'Two-Handed', feature: 'Versatile : Cette arme peut aussi être utilisée avec ces statistiques — Présence, Mêlée, d8+4.', featureKey: 'Versatile' },
  { id: 'wand-t3', name: 'Advanced Wand', tier: 3, damageType: 'mag', trait: 'Knowledge', range: 'Far', damage: 'd6+7', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'greatstaff-t3', name: 'Advanced Greatstaff', tier: 3, damageType: 'mag', trait: 'Knowledge', range: 'Very Far', damage: 'd6+6', burden: 'Two-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  // Tier 3 unique magic
  { id: 'axe-of-fortunis-t3', name: 'Axe of Fortunis', tier: 3, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd10+8', burden: 'Two-Handed', feature: 'Lucky : Sur une attaque ratée, vous pouvez cocher un Stress pour relancer votre attaque.', featureKey: 'Lucky' },
  { id: 'blessed-anlace-t3', name: 'Blessed Anlace', tier: 3, damageType: 'mag', trait: 'Instinct', range: 'Melee', damage: 'd10+6', burden: 'One-Handed', feature: 'Healing : Pendant le temps libre, libérez automatiquement un Point de vie.', featureKey: 'Healing' },
  { id: 'ghostblade-t3', name: 'Ghostblade', tier: 3, damageType: 'mag', trait: 'Presence', range: 'Melee', damage: 'd10+7', burden: 'One-Handed', feature: 'Otherworldly : Sur une attaque réussie, vous pouvez infliger des dégâts physiques ou magiques.', featureKey: 'Otherworldly' },
  { id: 'runes-of-ruination-t3', name: 'Runes of Ruination', tier: 3, damageType: 'mag', trait: 'Knowledge', range: 'Very Close', damage: 'd20+4', burden: 'One-Handed', feature: 'Painful : Chaque fois que vous réussissez une attaque, vous devez cocher un Stress.', featureKey: 'Painful' },
  { id: 'widogast-pendant-t3', name: 'Widogast Pendant', tier: 3, damageType: 'mag', trait: 'Knowledge', range: 'Close', damage: 'd10+5', burden: 'One-Handed', feature: 'Timebending : Vous choisissez la cible de votre attaque après avoir fait votre jet d’attaque.', featureKey: 'Timebending' },
  { id: 'gilded-bow-t3', name: 'Gilded Bow', tier: 3, damageType: 'mag', trait: 'Finesse', range: 'Far', damage: 'd6+7', burden: 'Two-Handed', feature: 'Self-Correcting : Quand vous obtenez un 1 sur un dé de dégâts, il inflige 6 dégâts à la place.', featureKey: 'Self-Correcting' },
  { id: 'firestaff-t3', name: 'Firestaff', tier: 3, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd6+7', burden: 'Two-Handed', feature: 'Burning : Quand vous obtenez un 6 sur un dé de dégâts, la cible doit cocher un Stress.', featureKey: 'Burning' },
  { id: 'mage-orb-t3', name: 'Mage Orb', tier: 3, damageType: 'mag', trait: 'Knowledge', range: 'Far', damage: 'd6+7', burden: 'One-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  { id: 'ilmaris-rifle-t3', name: "Ilmari's Rifle", tier: 3, damageType: 'mag', trait: 'Finesse', range: 'Very Far', damage: 'd6+6', burden: 'One-Handed', feature: 'Reloading : Après une attaque, lancez un d6. Sur un résultat de 1, vous devez cocher un Stress pour recharger cette arme avant de pouvoir tirer à nouveau.', featureKey: 'Reloading' },

  // ═══════════════════════════════════════════
  //  TIER 4 (Levels 8–10) — Physical
  // ═══════════════════════════════════════════
  { id: 'broadsword-t4', name: 'Legendary Broadsword', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd8+9', burden: 'One-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },
  { id: 'longsword-t4', name: 'Legendary Longsword', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd10+12', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'battleaxe-t4', name: 'Legendary Battleaxe', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+12', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'greatsword-t4', name: 'Legendary Greatsword', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+12', burden: 'Two-Handed', feature: 'Massive : −1 en Évasion ; sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Massive' },
  { id: 'mace-t4', name: 'Legendary Mace', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd8+10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'warhammer-t4', name: 'Legendary Warhammer', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd12+12', burden: 'Two-Handed', feature: 'Heavy : −1 en Évasion', featureKey: 'Heavy' },
  { id: 'dagger-t4', name: 'Legendary Dagger', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'quarterstaff-t4', name: 'Legendary Quarterstaff', tier: 4, damageType: 'phy', trait: 'Instinct', range: 'Melee', damage: 'd10+12', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'cutlass-t4', name: 'Legendary Cutlass', tier: 4, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8+10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'rapier-t4', name: 'Legendary Rapier', tier: 4, damageType: 'phy', trait: 'Presence', range: 'Melee', damage: 'd8+9', burden: 'One-Handed', feature: 'Quick : Quand vous effectuez une attaque, vous pouvez cocher un Stress pour cibler une autre créature à portée.', featureKey: 'Quick' },
  { id: 'halberd-t4', name: 'Legendary Halberd', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Very Close', damage: 'd10+11', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },
  { id: 'spear-t4', name: 'Legendary Spear', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Very Close', damage: 'd8+12', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'shortbow-t4', name: 'Legendary Shortbow', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Far', damage: 'd6+12', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'crossbow-t4', name: 'Legendary Crossbow', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'longbow-t4', name: 'Legendary Longbow', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Very Far', damage: 'd8+12', burden: 'Two-Handed', feature: 'Cumbersome : −1 en Finesse', featureKey: 'Cumbersome' },
  // Tier 4 unique physical
  { id: 'dual-ended-sword-t4', name: 'Dual-Ended Sword', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: 'Quick : Quand vous effectuez une attaque, vous pouvez cocher un Stress pour cibler une autre créature à portée.', featureKey: 'Quick' },
  { id: 'impact-gauntlet-t4', name: 'Impact Gauntlet', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd10+11', burden: 'One-Handed', feature: 'Concussive : Sur une attaque réussie, vous pouvez dépenser un Espoir pour repousser la cible à portée Loin.', featureKey: 'Concussive' },
  { id: 'sledge-axe-t4', name: 'Sledge Axe', tier: 4, damageType: 'phy', trait: 'Strength', range: 'Melee', damage: 'd12+13', burden: 'Two-Handed', feature: 'Destructive : −1 en Agilité ; sur une attaque réussie, tous les adversaires à portée Très Proche doivent cocher un Stress.', featureKey: 'Destructive' },
  { id: 'curved-dagger-t4', name: 'Curved Dagger', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Melee', damage: 'd8+9', burden: 'One-Handed', feature: 'Serrated : Quand vous obtenez un 1 sur un dé de dégâts, il inflige 8 dégâts à la place.', featureKey: 'Serrated' },
  { id: 'extended-polearm-t4', name: 'Extended Polearm', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Very Close', damage: 'd8+10', burden: 'Two-Handed', feature: "Long : L’attaque de cette arme cible tous les adversaires en ligne à portée.", featureKey: 'Long' },
  { id: 'swinging-ropeblade-t4', name: 'Swinging Ropeblade', tier: 4, damageType: 'phy', trait: 'Presence', range: 'Close', damage: 'd8+9', burden: 'Two-Handed', feature: 'Grappling : Sur une attaque réussie, vous pouvez dépenser un Espoir pour Entraver la cible ou l’attirer à portée de Mêlée.', featureKey: 'Grappling' },
  { id: 'ricochet-axes-t4', name: 'Ricochet Axes', tier: 4, damageType: 'phy', trait: 'Agility', range: 'Far', damage: 'd6+11', burden: 'Two-Handed', feature: 'Bouncing : Cochez 1 ou plusieurs Stress pour toucher autant de cibles à portée de l’attaque.', featureKey: 'Bouncing' },
  { id: 'aantari-bow-t4', name: 'Aantari Bow', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Far', damage: 'd6+11', burden: 'Two-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },
  { id: 'hand-cannon-t4', name: 'Hand Cannon', tier: 4, damageType: 'phy', trait: 'Finesse', range: 'Very Far', damage: 'd6+12', burden: 'One-Handed', feature: 'Reloading : Après une attaque, lancez un d6. Sur un 1, vous devez cocher un Stress pour recharger cette arme avant de pouvoir tirer à nouveau.', featureKey: 'Reloading' },

  // ═══ TIER 4 — Magic ═══
  { id: 'arcane-gauntlets-t4', name: 'Legendary Arcane Gauntlets', tier: 4, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd10+12', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hallowed-axe-t4', name: 'Legendary Hallowed Axe', tier: 4, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd8+10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'glowing-rings-t4', name: 'Legendary Glowing Rings', tier: 4, damageType: 'mag', trait: 'Agility', range: 'Very Close', damage: 'd10+11', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'hand-runes-t4', name: 'Legendary Hand Runes', tier: 4, damageType: 'mag', trait: 'Instinct', range: 'Very Close', damage: 'd10+9', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'returning-blade-t4', name: 'Legendary Returning Blade', tier: 4, damageType: 'mag', trait: 'Finesse', range: 'Close', damage: 'd8+9', burden: 'One-Handed', feature: 'Returning : Quand cette arme est lancée dans sa portée, elle réapparaît dans votre main immédiatement après l’attaque.', featureKey: 'Returning' },
  { id: 'shortstaff-t4', name: 'Legendary Shortstaff', tier: 4, damageType: 'mag', trait: 'Instinct', range: 'Close', damage: 'd8+10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'dualstaff-t4', name: 'Legendary Dualstaff', tier: 4, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd8+12', burden: 'Two-Handed', feature: null, featureKey: null },
  { id: 'scepter-t4', name: 'Legendary Scepter', tier: 4, damageType: 'mag', trait: 'Presence', range: 'Far', damage: 'd6+9', burden: 'Two-Handed', feature: 'Versatile : Cette arme peut aussi être utilisée avec ces statistiques — Présence, Mêlée, d8+6.', featureKey: 'Versatile' },
  { id: 'wand-t4', name: 'Legendary Wand', tier: 4, damageType: 'mag', trait: 'Knowledge', range: 'Far', damage: 'd6+10', burden: 'One-Handed', feature: null, featureKey: null },
  { id: 'greatstaff-t4', name: 'Legendary Greatstaff', tier: 4, damageType: 'mag', trait: 'Knowledge', range: 'Very Far', damage: 'd6+9', burden: 'Two-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  // Tier 4 unique magic
  { id: 'sword-of-light-flame-t4', name: 'Sword of Light & Flame', tier: 4, damageType: 'mag', trait: 'Strength', range: 'Melee', damage: 'd10+11', burden: 'Two-Handed', feature: 'Hot : Cette arme tranche à travers les matériaux solides.', featureKey: 'Hot' },
  { id: 'siphoning-gauntlets-t4', name: 'Siphoning Gauntlets', tier: 4, damageType: 'mag', trait: 'Presence', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: 'Lifestealing : Sur une attaque réussie, lancez un d6. Sur un résultat de 6, libérez un Point de vie ou libérez un Stress.', featureKey: 'Lifestealing' },
  { id: 'midas-scythe-t4', name: 'Midas Scythe', tier: 4, damageType: 'mag', trait: 'Knowledge', range: 'Melee', damage: 'd10+9', burden: 'Two-Handed', feature: 'Greedy : Dépensez une poignée d’or pour obtenir un bonus de +1 à votre Maîtrise sur un jet de dégâts.', featureKey: 'Greedy' },
  { id: 'floating-bladeshards-t4', name: 'Floating Bladeshards', tier: 4, damageType: 'mag', trait: 'Instinct', range: 'Close', damage: 'd8+9', burden: 'One-Handed', feature: 'Powerful : Sur une attaque réussie, lancez un dé de dégâts supplémentaire et défaussez le résultat le plus bas.', featureKey: 'Powerful' },
  { id: 'bloodstaff-t4', name: 'Bloodstaff', tier: 4, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd20+7', burden: 'Two-Handed', feature: 'Painful : Chaque fois que vous réussissez une attaque, vous devez cocher un Stress.', featureKey: 'Painful' },
  { id: 'thistlebow-t4', name: 'Thistlebow', tier: 4, damageType: 'mag', trait: 'Instinct', range: 'Far', damage: 'd6+13', burden: 'Two-Handed', feature: 'Reliable : +1 aux jets d’attaque', featureKey: 'Reliable' },
  { id: 'wand-of-essek-t4', name: 'Wand of Essek', tier: 4, damageType: 'mag', trait: 'Knowledge', range: 'Far', damage: 'd8+13', burden: 'One-Handed', feature: 'Timebending : Vous pouvez choisir la cible de votre attaque après avoir fait votre jet d’attaque.', featureKey: 'Timebending' },
  { id: 'magus-revolver-t4', name: 'Magus Revolver', tier: 4, damageType: 'mag', trait: 'Finesse', range: 'Very Far', damage: 'd6+13', burden: 'One-Handed', feature: 'Reloading : Après une attaque, lancez un d6. Sur un résultat de 1, vous devez cocher un Stress pour recharger cette arme avant de pouvoir tirer à nouveau.', featureKey: 'Reloading' },
  { id: 'fusion-gloves-t4', name: 'Fusion Gloves', tier: 4, damageType: 'mag', trait: 'Knowledge', range: 'Very Far', damage: 'd6+9', burden: 'Two-Handed', feature: 'Bonded : Obtenez un bonus à vos jets de dégâts égal à votre niveau.', featureKey: 'Bonded' }
]

/**
 * Retourne les armes primaires par tier.
 * @param {number} tier
 * @returns {Object[]}
 */
export function getPrimaryWeaponsByTier(tier) {
  return PRIMARY_WEAPONS.filter((w) => w.tier === tier)
}

/**
 * Retourne les armes primaires par type de dégâts.
 * @param {string} type - 'phy' ou 'mag'
 * @returns {Object[]}
 */
export function getPrimaryWeaponsByDamageType(type) {
  return PRIMARY_WEAPONS.filter((w) => w.damageType === type)
}

/**
 * Retourne une arme primaire par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getPrimaryWeaponById(id) {
  return PRIMARY_WEAPONS.find((w) => w.id === id) || null
}
