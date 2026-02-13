/**
 * Game State Management
 * Centralized state for the Byzantine strategy game
 */

class GameState {
    constructor() {
        this.initialized = false;
        this.currentScreen = 'loading';
        this.selectedLeader = null;
        this.player = null;
        this.turn = 1;
        this.gameMode = 'campaign'; // campaign, skirmish, tutorial
        this.units = [];
        this.buildings = [];
        this.territories = [];
        this.selectedUnit = null;
        this.isPaused = false;
    }

    /**
     * Initialize a new game with selected leader, century, and faction
     */
    initializeGame(leaderId, century, faction) {
        const leader = getLeaderById(leaderId);
        if (!leader) {
            console.error('Leader not found:', leaderId);
            return false;
        }

        this.selectedLeader = leader;
        this.selectedCentury = century;
        this.selectedFaction = faction;

        this.player = {
            name: leader.name,
            leaderId: leaderId,
            faction: faction,
            resources: { ...leader.startingResources },
            bonuses: { ...leader.bonuses },
            territories: [], // Populated during unit creation
            unitsOwned: [],
            buildingsOwned: [],
            techResearched: []
        };

        this.turn = 1;
        this.units = [];
        this.buildings = [];

        // Initialize map
        if (gameMap) {
            gameMap.initializeMap();
        }

        // Create starting units based on faction and era
        this.createStartingUnits(century, faction);

        // Create enemy units based on rival factions in this century
        this.createEnemyUnits(century, faction);

        this.initialized = true;
        return true;
    }

    /**
     * Create starting units for the player based on historical context
     */
    createStartingUnits(century, faction) {
        // Find historical starting town for this faction
        const town = HISTORIC_TOWNS.find(t => t.faction === faction || (faction === 'byzantine' && t.id === 'constantinople'));
        const startPos = town ? { x: town.x, y: town.y } : { x: 55, y: 25 };

        // Take ownership of starting city
        if (gameMap) {
            const tile = gameMap.getTile(startPos.x, startPos.y);
            if (tile) {
                tile.owner = 'player';
                this.player.territories.push(tile.id || `${startPos.x}-${startPos.y}`);

                // Reveal fog of war around starting city
                gameMap.revealArea(startPos.x, startPos.y, 5);
            }
        }

        // Create starting units
        const startingUnits = [
            { type: 'infantry', count: 3 },
            { type: 'cavalry', count: 2 },
            { type: 'archer', count: 2 }
        ];

        startingUnits.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
                const offset = { x: i % 3 - 1, y: Math.floor(i / 3) - 1 };
                const unit = createUnit(
                    type,
                    { x: startPos.x + offset.x, y: startPos.y + offset.y },
                    'player'
                );

                if (unit) {
                    this.units.push(unit);
                    this.player.unitsOwned.push(unit.id);

                    // Reveal fog of war around each starting unit
                    if (gameMap) {
                        gameMap.revealArea(unit.position.x, unit.position.y, 3);
                    }
                }
            }
        });
    }

    /**
     * Create enemy units based on rival factions in the selected century
     */
    createEnemyUnits(century, playerFaction) {
        const factions = getFactionsByCentury(century);
        const rivals = factions.filter(f => f !== playerFaction);

        rivals.forEach(rival => {
            const town = HISTORIC_TOWNS.find(t => t.faction === rival);
            if (!town) return;

            // Set ownership of rival city
            if (gameMap) {
                const tile = gameMap.getTile(town.x, town.y);
                if (tile) {
                    tile.owner = 'enemy';
                    tile.faction = rival;
                }
            }

            const counts = [
                { type: 'skutatoi', count: 2 },
                { type: 'kavallarioi', count: 2 }
            ];

            counts.forEach(({ type, count }) => {
                for (let i = 0; i < count; i++) {
                    const x = town.x + (i % 2);
                    const y = town.y + 1 + Math.floor(i / 2);
                    const unit = createUnit(type, { x, y }, 'enemy');
                    if (unit) {
                        unit.faction = rival;
                        this.units.push(unit);
                    }
                }
            });
        });
    }

    /**
     * Add resources to player
     */
    addResources(gold = 0, manpower = 0, prestige = 0) {
        this.player.resources.gold += gold;
        this.player.resources.manpower += manpower;
        this.player.resources.prestige += prestige;

        // Ensure resources don't go negative
        this.player.resources.gold = Math.max(0, this.player.resources.gold);
        this.player.resources.manpower = Math.max(0, this.player.resources.manpower);
        this.player.resources.prestige = Math.max(0, this.player.resources.prestige);
    }

    /**
     * Spend resources
     */
    spendResources(gold = 0, manpower = 0, prestige = 0) {
        if (this.canAfford(gold, manpower, prestige)) {
            this.addResources(-gold, -manpower, -prestige);
            return true;
        }
        return false;
    }

    /**
     * Check if player can afford costs
     */
    canAfford(gold = 0, manpower = 0, prestige = 0) {
        return this.player.resources.gold >= gold &&
            this.player.resources.manpower >= manpower &&
            this.player.resources.prestige >= prestige;
    }

    /**
     * Recruit a new unit
     */
    recruitUnit(unitTypeId, position) {
        const unitType = getUnitById(unitTypeId);
        if (!unitType) return null;

        // Check if player can afford
        if (!this.canAfford(unitType.cost.gold, unitType.cost.manpower)) {
            return null;
        }

        // Spend resources
        this.spendResources(unitType.cost.gold, unitType.cost.manpower);

        // Create unit
        const unit = createUnit(unitTypeId, position, 'player');
        if (unit) {
            this.units.push(unit);
            this.player.unitsOwned.push(unit.id);
        }

        return unit;
    }

    /**
     * Select a unit
     */
    selectUnit(unitId) {
        const unit = this.units.find(u => u.id === unitId);
        if (unit && unit.owner === 'player') {
            this.selectedUnit = unit;
            return unit;
        }
        return null;
    }

    /**
     * Move selected unit
     */
    moveUnit(unitId, newPosition) {
        const unit = this.units.find(u => u.id === unitId);
        if (!unit) return false;

        // Check if unit has movement remaining
        if (unit.currentMovement <= 0) return false;

        // Calculate distance
        const distance = Math.abs(newPosition.x - unit.position.x) +
            Math.abs(newPosition.y - unit.position.y);

        if (distance <= unit.currentMovement) {
            unit.position = newPosition;
            unit.currentMovement -= distance;

            // Reveal fog of war around new position for player units
            if (unit.owner === 'player' && gameMap) {
                gameMap.revealArea(newPosition.x, newPosition.y, 3);
            }

            // Check for territory capture
            this.captureTerritory(unit, newPosition);

            return true;
        }

        return false;
    }

    /**
     * Capture territory at position
     */
    captureTerritory(unit, position) {
        if (!gameMap) return;

        const tile = gameMap.getTile(position.x, position.y);
        if (!tile) return;

        // Capture if it's a neutral or enemy territory and a city or building
        if (tile.owner !== unit.owner) {
            const oldOwner = tile.owner;
            tile.owner = unit.owner;

            console.log(`${unit.owner} captured territory at ${position.x},${position.y}`);

            // Update player's territory list
            if (unit.owner === 'player') {
                if (!this.player.territories.includes(`${position.x}_${position.y}`)) {
                    this.player.territories.push(`${position.x}_${position.y}`);
                }
            } else if (oldOwner === 'player') {
                const index = this.player.territories.indexOf(`${position.x}_${position.y}`);
                if (index !== -1) {
                    this.player.territories.splice(index, 1);
                }
            }

            // Check win/loss after capture
            this.checkWinLossConditions();
        }
    }

    /**
     * End current turn
     */
    async endTurn() {
        if (this.isPaused) return;

        // If it was player's turn, now it's enemy's turn
        console.log(`Ending turn ${this.turn}`);

        // 1. Process Enemy Turn
        if (window.aiManager) {
            this.isPaused = true; // Pause player input
            await aiManager.processTurn();
            this.isPaused = false;
        }

        // 2. Start New Turn for Player
        this.turn++;

        // Generate resources
        const baseGold = 100;
        const baseManpower = 50;
        const basePrestige = 10;

        // Apply leader bonuses
        const goldBonus = this.player.bonuses.goldIncome || 1.0;
        const manpowerBonus = this.player.bonuses.manpowerRegen || 1.0;

        // Territory bonus
        const territoryBonus = this.player.territories.length * 20;

        this.addResources(
            Math.floor(baseGold * goldBonus) + territoryBonus,
            Math.floor(baseManpower * manpowerBonus),
            basePrestige
        );

        // Reset unit movement
        this.units.forEach(unit => {
            const unitType = getUnitById(unit.typeId);
            if (unitType) {
                unit.currentMovement = unitType.stats.movement;
            }
        });

        // Pay unit upkeep
        let totalUpkeep = 0;
        this.units.forEach(unit => {
            if (unit.owner === 'player') {
                const unitType = getUnitById(unit.typeId);
                if (unitType) {
                    totalUpkeep += unitType.upkeep;
                }
            }
        });

        this.spendResources(totalUpkeep, 0, 0);

        // Check win/loss
        this.checkWinLossConditions();

        return {
            turn: this.turn,
            income: {
                gold: Math.floor(baseGold * goldBonus) + territoryBonus,
                manpower: Math.floor(baseManpower * manpowerBonus),
                prestige: basePrestige
            },
            upkeep: totalUpkeep
        };
    }

    /**
     * Check Win/Loss conditions
     */
    checkWinLossConditions() {
        const playerUnits = this.units.filter(u => u.owner === 'player');
        const enemyUnits = this.units.filter(u => u.owner === 'enemy');

        // Loss: No units left or lost Constantinople
        const constantinople = gameMap.tiles[7][10]; // Assuming center is capital
        if (playerUnits.length === 0 || (constantinople && constantinople.owner === 'enemy')) {
            if (window.uiManager) uiManager.showGameOver(false);
            return 'loss';
        }

        // Win: All enemy units destroyed (simplified)
        if (enemyUnits.length === 0 && this.turn > 5) {
            // Only win after some turns to avoid immediate win if no enemies spawned yet
            if (window.uiManager) uiManager.showGameOver(true);
            return 'win';
        }

        return null;
    }

    /**
     * Serialize game state for saving
     */
    serialize() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            selectedLeader: this.selectedLeader,
            player: this.player,
            turn: this.turn,
            gameMode: this.gameMode,
            units: this.units,
            buildings: this.buildings,
            territories: this.territories
        };
    }

    /**
     * Load game state from saved data
     */
    deserialize(data) {
        if (!data || data.version !== '1.0') {
            console.error('Invalid save data');
            return false;
        }

        this.selectedLeader = data.selectedLeader;
        this.player = data.player;
        this.turn = data.turn;
        this.gameMode = data.gameMode;
        this.units = data.units;
        this.buildings = data.buildings;
        this.territories = data.territories;
        this.initialized = true;

        return true;
    }

    /**
     * Get game statistics
     */
    getStats() {
        return {
            turn: this.turn,
            unitsCount: this.units.filter(u => u.owner === 'player').length,
            territoriesCount: this.player.territories.length,
            resources: { ...this.player.resources },
            leader: this.selectedLeader.name
        };
    }
}

// Global game state instance
const gameState = new GameState();
