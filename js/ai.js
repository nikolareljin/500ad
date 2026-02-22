/**
 * AI Manager
 * Simple decision making for enemy units
 */

class AIManager {
    constructor() {
        this.thinkingDelay = 500; // ms between actions
    }

    /**
     * Process enemy turn
     */
    async processTurn() {
        console.log('Processing enemy turn...');

        // Find all enemy units
        const enemyUnits = gameState.units.filter(u => u.owner === 'enemy');
        if (enemyUnits.length === 0) {
            console.log('Enemy turn skipped: no enemy units available.');
            return;
        }

        for (const unit of enemyUnits) {
            // Focus map on the unit that is acting
            if (gameMap) {
                gameMap.centerOn(unit.position.x, unit.position.y);
                gameMap.requestRender();
            }

            await this.processUnit(unit);
            // Small delay between unit actions for visual clarity
            await new Promise(resolve => setTimeout(resolve, this.thinkingDelay));
        }

        console.log('Enemy turn completed');
    }

    /**
     * Process a single enemy unit
     */
    async processUnit(unit) {
        if (!unit || unit.currentHealth <= 0) return;
        // 1. Can we attack something nearby?
        const adjacentEnemy = this.findNearbyTarget(unit);
        if (adjacentEnemy) {
            console.log(`AI: ${unit.name} attacking ${adjacentEnemy.name}`);
            const defenderTile = gameMap.getTile(adjacentEnemy.position.x, adjacentEnemy.position.y);
            const terrain = defenderTile?.terrain || 'plains';
            const battleType = defenderTile?.cityData ? 'siege' : (terrain === 'forest' || terrain === 'hills' || terrain === 'mountains' ? 'ambush' : 'field');
            const result = executeBattle(unit.id, adjacentEnemy.id, terrain, battleType, {
                attemptRetreat: true,
                retreatSide: 'defender'
            });
            if (result.success && window.uiManager) {
                window.uiManager.showCombatResult(result);
            }
            return;
        }

        // 2. If no attack possible, move towards nearest player unit or city
        const target = this.findNearestPlayerTarget(unit);
        if (target) {
            const nextStep = this.calculateNextStep(unit.position, target.position);
            if (nextStep) {
                console.log(`AI: ${unit.name} moving from ${unit.position.x},${unit.position.y} to ${nextStep.x},${nextStep.y}`);
                const moved = gameState.moveUnit(unit.id, nextStep);
                if (!moved) {
                    const fallback = this.findAnyPassableNeighbor(unit);
                    if (fallback) {
                        gameState.moveUnit(unit.id, fallback);
                    }
                }

                // After moving, check if we can attack now
                const newAdjacentEnemy = this.findNearbyTarget(unit);
                if (newAdjacentEnemy) {
                    const defenderTile = gameMap.getTile(newAdjacentEnemy.position.x, newAdjacentEnemy.position.y);
                    const terrain = defenderTile?.terrain || 'plains';
                    const battleType = defenderTile?.cityData ? 'siege' : (terrain === 'forest' || terrain === 'hills' || terrain === 'mountains' ? 'ambush' : 'field');
                    const result = executeBattle(unit.id, newAdjacentEnemy.id, terrain, battleType, {
                        attemptRetreat: true,
                        retreatSide: 'defender'
                    });
                    if (result.success && window.uiManager) {
                        window.uiManager.showCombatResult(result);
                    }
                }
            }
        }
    }

    /**
     * Find a player unit within attack range
     */
    findNearbyTarget(unit) {
        const unitType = getUnitById(unit.typeId);
        const range = unitType.stats.range;

        return gameState.units.find(u => {
            if (u.owner === 'player') {
                const dist = Math.abs(u.position.x - unit.position.x) +
                    Math.abs(u.position.y - unit.position.y);
                return dist <= range;
            }
            return false;
        });
    }

    /**
     * Find nearest player unit or capital
     */
    findNearestPlayerTarget(unit) {
        // Find all player units
        const playerUnits = gameState.units.filter(u => u.owner === 'player');

        // Find player cities/buildings (simplified for now - just find city at center if player owned)
        const playerBuildings = [];
        for (let y = 0; y < gameMap.height; y++) {
            for (let x = 0; x < gameMap.width; x++) {
                const tile = gameMap.tiles[y][x];
                if (tile.owner === 'player' && tile.building) {
                    playerBuildings.push({ position: { x, y }, name: 'City' });
                }
            }
        }

        const allTargets = [...playerUnits, ...playerBuildings];
        if (allTargets.length === 0) return null;

        // Sort by distance
        allTargets.sort((a, b) => {
            const distA = Math.abs(a.position.x - unit.position.x) + Math.abs(a.position.y - unit.position.y);
            const distB = Math.abs(b.position.x - unit.position.x) + Math.abs(b.position.y - unit.position.y);
            return distA - distB;
        });

        return allTargets[0];
    }

    /**
     * Simple pathfinding (move one step closer)
     */
    calculateNextStep(current, target) {
        const dx = target.x - current.x;
        const dy = target.y - current.y;

        let nextX = current.x;
        let nextY = current.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            nextX += Math.sign(dx);
        } else {
            nextY += Math.sign(dy);
        }

        // Check if tile is occupied by another unit
        const occupied = gameState.units.some(u => u.position.x === nextX && u.position.y === nextY);
        if (occupied) {
            // Try the other direction if blocked
            if (nextX !== current.x) {
                nextX = current.x;
                nextY += Math.sign(dy) || (Math.random() > 0.5 ? 1 : -1);
            } else {
                nextY = current.y;
                nextX += Math.sign(dx) || (Math.random() > 0.5 ? 1 : -1);
            }
        }

        // Ensure within bounds
        nextX = Math.max(0, Math.min(gameMap.width - 1, nextX));
        nextY = Math.max(0, Math.min(gameMap.height - 1, nextY));

        const tile = gameMap.getTile(nextX, nextY);
        if (!tile) return null;
        const isWater = tile.terrain === 'water';
        if (isWater) return null;

        return { x: nextX, y: nextY };
    }

    findAnyPassableNeighbor(unit) {
        const offsets = [
            { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
        ];
        for (const offset of offsets) {
            const nx = unit.position.x + offset.x;
            const ny = unit.position.y + offset.y;
            if (nx < 0 || nx >= gameMap.width || ny < 0 || ny >= gameMap.height) continue;
            const tile = gameMap.getTile(nx, ny);
            if (!tile || tile.terrain === 'water') continue;
            const occupied = gameState.units.some(u => u.id !== unit.id && u.position.x === nx && u.position.y === ny);
            if (occupied) continue;
            return { x: nx, y: ny };
        }
        return null;
    }
}

// Global AI instance
const aiManager = new AIManager();
window.aiManager = aiManager;
