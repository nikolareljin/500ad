/**
 * Combat System
 * Turn-based combat calculations with Byzantine tactics
 */

/**
 * Calculate combat damage between attacker and defender
 */
function calculateCombatDamage(attacker, defender, terrain = 'plains') {
    const attackerType = getUnitById(attacker.typeId);
    const defenderType = getUnitById(defender.typeId);

    if (!attackerType || !defenderType) return { attackerDamage: 0, defenderDamage: 0 };

    // Base attack values
    let attackPower = attacker.stats.attack;
    let defensePower = defender.stats.defense;
    const terrainEffects = gameMap?.getTerrainEffects?.(terrain, {
        unit: attacker,
        attacker,
        defender
    }) || { attackMultiplier: 1, defenseMultiplier: 1 };

    // Apply type bonuses
    if (defenderType.type === 'infantry' && attackerType.bonuses.vsInfantry) {
        attackPower *= attackerType.bonuses.vsInfantry;
    } else if (defenderType.type === 'cavalry' && attackerType.bonuses.vsCavalry) {
        attackPower *= attackerType.bonuses.vsCavalry;
    }

    // Apply defender bonuses
    if (attackerType.type === 'infantry' && defenderType.bonuses.vsInfantry) {
        defensePower *= defenderType.bonuses.vsInfantry;
    } else if (attackerType.type === 'cavalry' && defenderType.bonuses.vsCavalry) {
        defensePower *= defenderType.bonuses.vsCavalry;
    }

    // Apply terrain modifiers
    if (terrain === 'forest' || terrain === 'hills') {
        if (attackerType.bonuses.terrain) {
            attackPower *= attackerType.bonuses.terrain;
        }
    }
    attackPower *= terrainEffects.attackMultiplier || 1;
    defensePower *= terrainEffects.defenseMultiplier || 1;

    // Apply morale
    const attackerMorale = attacker.morale / 100;
    const defenderMorale = defender.morale / 100;
    attackPower *= attackerMorale;
    defensePower *= defenderMorale;

    // Apply level/experience bonuses
    const attackerLevelBonus = 1 + (attacker.level - 1) * 0.1;
    const defenderLevelBonus = 1 + (defender.level - 1) * 0.1;
    attackPower *= attackerLevelBonus;
    defensePower *= defenderLevelBonus;

    // Calculate damage
    const attackerDamage = Math.max(1, Math.floor(attackPower - defensePower * 0.5));
    const defenderDamage = Math.max(1, Math.floor(defender.stats.attack * defenderMorale * 0.7));

    // Add randomness (±20%)
    const randomFactor = () => 0.8 + Math.random() * 0.4;

    return {
        attackerDamage: Math.floor(attackerDamage * randomFactor()),
        defenderDamage: Math.floor(defenderDamage * randomFactor())
    };
}

function applyBattleTypeModifiers(attacker, defender, battleType, terrain, baseDamage) {
    let attackerDamage = baseDamage.attackerDamage;
    let defenderDamage = baseDamage.defenderDamage;

    const attackerEffects = attacker.owner === 'player' ? (gameState.player?.techEffects || {}) : {};
    const defenderEffects = defender.owner === 'player' ? (gameState.player?.techEffects || {}) : {};

    if (battleType === 'siege') {
        attackerDamage = Math.floor(attackerDamage * (attacker.category === 'siege' ? 1.35 : 0.9));
        defenderDamage = Math.floor(defenderDamage * 1.1);
    } else if (battleType === 'ambush') {
        const ambushSide = defender.bonuses?.ambush ? 'defender' : (attacker.bonuses?.ambush ? 'attacker' : 'defender');
        if (ambushSide === 'attacker') {
            attackerDamage = Math.floor(attackerDamage * 1.25);
            defenderDamage = Math.floor(defenderDamage * 0.75);
        } else {
            attackerDamage = Math.floor(attackerDamage * 0.8);
            defenderDamage = Math.floor(defenderDamage * 1.2);
        }
    } else if (battleType === 'naval') {
        const attackerNaval = attacker.type === 'naval' || attacker.bonuses?.waterTraversal;
        const defenderNaval = defender.type === 'naval' || defender.bonuses?.waterTraversal;
        if (attackerNaval && !defenderNaval) attackerDamage = Math.floor(attackerDamage * 1.15);
        if (defenderNaval && !attackerNaval) defenderDamage = Math.floor(defenderDamage * 1.15);
    }

    if (defender.fortified) {
        attackerDamage = Math.floor(attackerDamage * 0.8);
        defenderDamage = Math.floor(defenderDamage * 1.15);
    }

    const defenderTile = gameMap?.getTile(defender.position.x, defender.position.y);
    if (defenderTile?.fort && defenderTile.fort.owner === defender.owner) {
        const defenseBonus = defenderTile.fort.defenseBonus || 0;
        const garrisonBonus = defenderTile.fort.garrisonBonus || 0;
        attackerDamage = Math.floor(attackerDamage * (1 - Math.max(0, Math.min(0.45, defenseBonus))));
        defenderDamage = Math.floor(defenderDamage * (1 + Math.max(0, Math.min(0.35, garrisonBonus))));
    }

    if (attacker.bonuses?.greekFire) {
        // Devastating incendiary effect
        attackerDamage = Math.floor(attackerDamage * 1.6);
        if (defender.type === 'naval' || defenderTile?.cityData) {
            attackerDamage = Math.floor(attackerDamage * 1.4);
        }
    }

    if (attacker.type === 'cavalry') {
        attackerDamage = Math.floor(attackerDamage * (attackerEffects.cavalryAttackMultiplier || 1));
    }
    if (attacker.type === 'naval') {
        attackerDamage = Math.floor(attackerDamage * (attackerEffects.navalAttackMultiplier || 1));
    }
    if (attacker.category === 'siege') {
        attackerDamage = Math.floor(attackerDamage * (attackerEffects.siegeAttackMultiplier || 1));
    }
    if (defender.type === 'cavalry') {
        defenderDamage = Math.floor(defenderDamage * (defenderEffects.cavalryAttackMultiplier || 1));
    }
    if (defender.type === 'naval') {
        defenderDamage = Math.floor(defenderDamage * (defenderEffects.navalAttackMultiplier || 1));
    }

    return {
        attackerDamage: Math.max(1, attackerDamage),
        defenderDamage: Math.max(1, defenderDamage)
    };
}

function maybeRetreat(unit, enemy, side, options = {}) {
    const requestedSide = options.retreatSide || 'defender';
    if (requestedSide !== side) return { success: false };
    if (!options.attemptRetreat) return { success: false };
    if (unit.currentHealth > unit.stats.health * 0.6) return { success: false };

    const baseChance = 0.45;
    const mobilityBonus = unit.stats.movement >= enemy.stats.movement ? 0.15 : 0;
    const moraleBonus = unit.morale >= 65 ? 0.1 : -0.05;
    const chance = Math.max(0.15, Math.min(0.85, baseChance + mobilityBonus + moraleBonus));
    const roll = Math.random();
    if (roll > chance) return { success: false };

    return {
        success: true,
        side,
        chance,
        roll
    };
}

function executeBattle(attackerId, defenderId, terrain = 'plains', battleType = 'field', options = {}) {
    const attacker = gameState.units.find(u => u.id === attackerId);
    const defender = gameState.units.find(u => u.id === defenderId);

    if (!attacker || !defender) {
        return { success: false, message: 'Invalid units' };
    }

    const distance = Math.abs(attacker.position.x - defender.position.x) +
        Math.abs(attacker.position.y - defender.position.y);
    const attackerType = getUnitById(attacker.typeId);
    const maxRange = attackerType?.stats?.range || 1;
    if (distance > maxRange) {
        return { success: false, message: 'Target out of range' };
    }

    const attackerSnapshot = {
        id: attackerId,
        name: attacker.name || 'Attacker',
        owner: attacker.owner || 'enemy',
        maxHealth: Math.max(1, Number(attacker.stats?.health || 1))
    };
    const defenderSnapshot = {
        id: defenderId,
        name: defender.name || 'Defender',
        owner: defender.owner || 'enemy',
        maxHealth: Math.max(1, Number(defender.stats?.health || 1))
    };

    const baseDamage = calculateCombatDamage(attacker, defender, terrain);
    const adjustedDamage = applyBattleTypeModifiers(attacker, defender, battleType, terrain, baseDamage);
    let attackerDamage = adjustedDamage.attackerDamage;
    let defenderDamage = adjustedDamage.defenderDamage;

    attacker.fortified = false;

    const attackerRetreat = maybeRetreat(attacker, defender, 'attacker', options);
    if (attackerRetreat.success) {
        attackerDamage = Math.floor(attackerDamage * 0.5);
    }
    const defenderRetreat = maybeRetreat(defender, attacker, 'defender', options);
    if (defenderRetreat.success) {
        defenderDamage = Math.floor(defenderDamage * 0.5);
    }

    defender.currentHealth -= attackerDamage;
    attacker.currentHealth -= defenderDamage;

    const defenderDied = defender.currentHealth <= 0;
    const attackerDied = attacker.currentHealth <= 0;
    const attackerHealthAfter = Math.max(0, Math.floor(attacker.currentHealth || 0));
    const defenderHealthAfter = Math.max(0, Math.floor(defender.currentHealth || 0));

    if (!attackerDied) {
        attacker.experience += defenderDied ? 24 : 10;
        checkLevelUp(attacker);
    }
    if (!defenderDied && !attackerDied) {
        defender.experience += 6;
        checkLevelUp(defender);
    }

    if (defenderDied) {
        attacker.morale = Math.min(100, attacker.morale + 12);
    } else {
        attacker.morale = Math.max(0, attacker.morale - 4);
    }

    if (attackerDied) {
        defender.morale = Math.min(100, defender.morale + 12);
    } else {
        defender.morale = Math.max(0, defender.morale - 4);
    }

    if (defenderDied) removeUnit(defenderId);
    if (attackerDied) removeUnit(attackerId);

    const retreat = defenderRetreat.success
        ? defenderRetreat
        : (attackerRetreat.success ? attackerRetreat : { success: false });

    return {
        success: true,
        battleType,
        attackerDamage,
        defenderDamage,
        defenderDied,
        attackerDied,
        retreat,
        attacker: {
            ...attackerSnapshot,
            health: attackerHealthAfter,
            morale: attacker.morale
        },
        defender: {
            ...defenderSnapshot,
            health: defenderHealthAfter,
            morale: defender.morale
        }
    };
}

/**
 * Execute combat between two units
 */
function executeCombat(attackerId, defenderId, terrain = 'plains') {
    return executeBattle(attackerId, defenderId, terrain, 'field', { attemptRetreat: false });
}

/**
 * Check if unit should level up
 */
function checkLevelUp(unit) {
    const expNeeded = unit.level * 100;

    if (unit.experience >= expNeeded) {
        unit.level++;
        unit.experience -= expNeeded;

        // Increase stats
        unit.stats.health += 10;
        unit.stats.attack += 2;
        unit.stats.defense += 2;
        unit.currentHealth = unit.stats.health;

        return true;
    }

    return false;
}

/**
 * Remove unit from game
 */
function removeUnit(unitId) {
    const index = gameState.units.findIndex(u => u.id === unitId);
    if (index !== -1) {
        const unit = gameState.units[index];

        // Remove from player's owned units
        if (unit.owner === 'player') {
            const playerIndex = gameState.player.unitsOwned.indexOf(unitId);
            if (playerIndex !== -1) {
                gameState.player.unitsOwned.splice(playerIndex, 1);
            }
        }

        gameState.units.splice(index, 1);
    }
}

/**
 * Calculate combat preview (without executing)
 */
function previewCombat(attackerId, defenderId, terrain = 'plains') {
    const attacker = gameState.units.find(u => u.id === attackerId);
    const defender = gameState.units.find(u => u.id === defenderId);

    if (!attacker || !defender) return null;

    const { attackerDamage, defenderDamage } = calculateCombatDamage(attacker, defender, terrain);

    return {
        attackerDamage,
        defenderDamage,
        attackerSurvives: attacker.currentHealth > defenderDamage,
        defenderSurvives: defender.currentHealth > attackerDamage,
        attackerHealthAfter: Math.max(0, attacker.currentHealth - defenderDamage),
        defenderHealthAfter: Math.max(0, defender.currentHealth - attackerDamage)
    };
}

/**
 * Apply leader bonuses to combat
 */
function applyLeaderBonuses(unit, bonuses) {
    const unitType = getUnitById(unit.typeId);

    // Apply cavalry bonuses
    if (unitType.type === 'cavalry') {
        if (bonuses.cavalryAttack) {
            unit.stats.attack = Math.floor(unit.stats.attack * bonuses.cavalryAttack);
        }
        if (bonuses.cavalryMovement) {
            unit.stats.movement = Math.floor(unit.stats.movement * bonuses.cavalryMovement);
        }
    }

    // Apply infantry bonuses
    if (unitType.type === 'infantry') {
        if (bonuses.infantryDefense) {
            unit.stats.defense = Math.floor(unit.stats.defense * bonuses.infantryDefense);
        }
    }

    // Apply cataphract bonuses
    if (unit.typeId === 'cataphract' || unit.typeId === 'klibanophoroi') {
        if (bonuses.cataphractPower) {
            unit.stats.attack = Math.floor(unit.stats.attack * bonuses.cataphractPower);
            unit.stats.defense = Math.floor(unit.stats.defense * bonuses.cataphractPower);
        }
    }
}

/**
 * Check if position is valid for attack
 */
function canAttack(attackerId, defenderPosition) {
    const attacker = gameState.units.find(u => u.id === attackerId);
    if (!attacker) return false;

    const attackerType = getUnitById(attacker.typeId);
    const distance = Math.abs(attacker.position.x - defenderPosition.x) +
        Math.abs(attacker.position.y - defenderPosition.y);

    return distance <= attackerType.stats.range;
}
