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
        // Cavalry penalty in rough terrain
        if (attackerType.type === 'cavalry') {
            attackPower *= 0.8;
        }
    }

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

/**
 * Execute combat between two units
 */
function executeCombat(attackerId, defenderId, terrain = 'plains') {
    const attacker = gameState.units.find(u => u.id === attackerId);
    const defender = gameState.units.find(u => u.id === defenderId);

    if (!attacker || !defender) {
        return { success: false, message: 'Invalid units' };
    }

    // Check if units are adjacent
    const distance = Math.abs(attacker.position.x - defender.position.x) +
        Math.abs(attacker.position.y - defender.position.y);

    const attackerType = getUnitById(attacker.typeId);
    const maxRange = attackerType.stats.range;

    if (distance > maxRange) {
        return { success: false, message: 'Target out of range' };
    }

    // Calculate damage
    const { attackerDamage, defenderDamage } = calculateCombatDamage(attacker, defender, terrain);

    // Apply damage
    defender.currentHealth -= attackerDamage;
    attacker.currentHealth -= defenderDamage;

    // Check for unit death
    const defenderDied = defender.currentHealth <= 0;
    const attackerDied = attacker.currentHealth <= 0;

    // Grant experience
    if (!attackerDied) {
        attacker.experience += defenderDied ? 20 : 10;
        checkLevelUp(attacker);
    }

    if (!defenderDied && !attackerDied) {
        defender.experience += 5;
        checkLevelUp(defender);
    }

    // Update morale
    if (defenderDied) {
        attacker.morale = Math.min(100, attacker.morale + 10);
    } else {
        attacker.morale = Math.max(0, attacker.morale - 5);
    }

    if (attackerDied) {
        defender.morale = Math.min(100, defender.morale + 10);
    } else {
        defender.morale = Math.max(0, defender.morale - 5);
    }

    // Remove dead units
    if (defenderDied) {
        removeUnit(defenderId);
    }
    if (attackerDied) {
        removeUnit(attackerId);
    }

    return {
        success: true,
        attackerDamage,
        defenderDamage,
        defenderDied,
        attackerDied,
        attacker: {
            id: attackerId,
            health: attacker.currentHealth,
            morale: attacker.morale
        },
        defender: {
            id: defenderId,
            health: defender.currentHealth,
            morale: defender.morale
        }
    };
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
