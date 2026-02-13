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

        for (const unit of enemyUnits) {
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
        // 1. Can we attack something nearby?
        const adjacentEnemy = this.findNearbyTarget(unit);
        if (adjacentEnemy) {
            console.log(`AI: ${unit.name} attacking ${adjacentEnemy.name}`);
            const result = executeCombat(unit.id, adjacentEnemy.id);
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
                gameState.moveUnit(unit.id, nextStep);

                // After moving, check if we can attack now
                const newAdjacentEnemy = this.findNearbyTarget(unit);
                if (newAdjacentEnemy) {
                    const result = executeCombat(unit.id, newAdjacentEnemy.id);
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

        return { x: nextX, y: nextY };
    }
}

// Global AI instance
const aiManager = new AIManager();
