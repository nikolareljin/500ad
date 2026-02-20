/**
 * Game State Management
 * Centralized state for the Byzantine strategy game
 */

const SCENARIOS = {
    building: 'building_civilization',
    empire: 'managing_empire'
};

const CIVILIZATION_ALIASES = {
    byzantine: 'byzantine',
    arab: 'arab',
    bulgar: 'bulgar',
    frank: 'frank',
    sassanid: 'sassanid',
    enemies: 'byzantine',
    contestants: 'byzantine'
};

const HISTORICAL_TOWN_CONTROL = {
    constantinople: { tribe: 'Byzantine Romans', civilization: 'byzantine', stance: 'core' },
    thessalonica: { tribe: 'Byzantine Greeks', civilization: 'byzantine', stance: 'core' },
    athens: { tribe: 'Byzantine Greeks', civilization: 'byzantine', stance: 'neutral' },
    preslav: { tribe: 'Bulgars', civilization: 'bulgar', stance: 'hostile' },
    nicaea: { tribe: 'Byzantine Anatolians', civilization: 'byzantine', stance: 'core' },
    antioch: { tribe: 'Syriac Christians', civilization: 'byzantine', stance: 'hostile' },
    iconium: { tribe: 'Anatolian Greeks', civilization: 'byzantine', stance: 'neutral' },
    trebizond: { tribe: 'Pontic Greeks', civilization: 'byzantine', stance: 'neutral' },
    tbilisi: { tribe: 'Georgians', civilization: 'sassanid', stance: 'hostile' },
    jerusalem: { tribe: 'Levantine Communities', civilization: 'arab', stance: 'neutral' },
    damascus: { tribe: 'Levantine Arabs', civilization: 'arab', stance: 'hostile' },
    baghdad: { tribe: 'Abbasids', civilization: 'arab', stance: 'core' },
    ctesiphon: { tribe: 'Persians', civilization: 'sassanid', stance: 'core' },
    medina: { tribe: 'Hejaz Arabs', civilization: 'arab', stance: 'core' },
    mecca: { tribe: 'Hejaz Arabs', civilization: 'arab', stance: 'core' },
    sanaa: { tribe: 'Yemeni Arabs', civilization: 'arab', stance: 'neutral' },
    alexandria: { tribe: 'Egyptians', civilization: 'byzantine', stance: 'neutral' },
    fustat: { tribe: 'Egyptian Arabs', civilization: 'arab', stance: 'hostile' },
    carthage: { tribe: 'Berbers', civilization: 'frank', stance: 'hostile' },
    leptis_magna: { tribe: 'Libyans', civilization: 'arab', stance: 'neutral' },
    axum: { tribe: 'Aksumites', civilization: 'byzantine', stance: 'neutral' },
    adulis: { tribe: 'Aksumites', civilization: 'byzantine', stance: 'neutral' },
    rome: { tribe: 'Italo-Romans', civilization: 'frank', stance: 'hostile' },
    ravenna: { tribe: 'Exarchate Romans', civilization: 'byzantine', stance: 'neutral' },
    venice: { tribe: 'Venetians', civilization: 'frank', stance: 'neutral' },
    naples: { tribe: 'Italo-Romans', civilization: 'frank', stance: 'neutral' },
    cartagena: { tribe: 'Visigoths', civilization: 'frank', stance: 'hostile' },
    aachen: { tribe: 'Franks', civilization: 'frank', stance: 'core' },
    paris: { tribe: 'Franks', civilization: 'frank', stance: 'core' },
    london: { tribe: 'Anglo-Saxons', civilization: 'frank', stance: 'neutral' },
    kiev: { tribe: 'Kievan Slavs', civilization: 'bulgar', stance: 'neutral' }
};

const EMPIRE_CORE_TOWNS = {
    byzantine: ['constantinople', 'thessalonica', 'nicaea', 'iconium', 'antioch', 'ravenna', 'alexandria'],
    arab: ['baghdad', 'damascus', 'jerusalem', 'mecca', 'medina', 'fustat', 'sanaa'],
    bulgar: ['preslav', 'kiev'],
    frank: ['aachen', 'paris', 'rome', 'venice', 'london'],
    sassanid: ['ctesiphon', 'tbilisi']
};

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
        this.selectedScenario = SCENARIOS.building;
    }

    /**
     * Initialize a new game with selected leader, century, faction, and scenario
     */
    initializeGame(leaderId, century = '6', faction = 'byzantine', scenario = SCENARIOS.building) {
        const leader = getLeaderById(leaderId);
        if (!leader) {
            console.error('Leader not found:', leaderId);
            return false;
        }
        if (!gameMap) {
            console.error('Map not initialized before starting game');
            return false;
        }

        const civilization = this.resolveCivilization(faction);
        this.selectedLeader = leader;
        this.selectedCentury = century;
        this.selectedFaction = civilization;
        this.selectedScenario = scenario;

        this.player = {
            name: leader.name,
            leaderId: leaderId,
            faction: civilization,
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
        this.setupScenarioTowns(civilization, scenario);
        this.createStartingUnits(civilization, scenario);
        this.createEnemyUnits(scenario);
        gameMap.markTerritoryDirty();
        gameMap.render();

        this.initialized = true;
        return true;
    }

    resolveCivilization(faction) {
        const normalizedFaction = CIVILIZATION_ALIASES[faction] || faction;
        return normalizedFaction;
    }

    getStartingTownForFaction(faction) {
        const preferred = {
            byzantine: 'constantinople',
            arab: 'baghdad',
            bulgar: 'preslav',
            frank: 'aachen',
            sassanid: 'ctesiphon'
        };
        const preferredTown = HISTORIC_TOWNS.find(t => t.id === preferred[faction]);
        if (preferredTown) return preferredTown;
        return HISTORIC_TOWNS.find(t => t.id === 'constantinople') || HISTORIC_TOWNS[0];
    }

    setupScenarioTowns(playerFaction, scenario) {
        const playerEmpireCore = new Set(EMPIRE_CORE_TOWNS[playerFaction] || []);
        const startingTownId = this.getStartingTownForFaction(playerFaction).id;

        HISTORIC_TOWNS.forEach((town) => {
            const tile = gameMap.getTile(town.x, town.y);
            if (!tile?.cityData) return;

            const historical = HISTORICAL_TOWN_CONTROL[town.id] || {
                tribe: 'Local tribe',
                civilization: 'neutral',
                stance: 'neutral'
            };
            tile.cityData.tribe = historical.tribe;
            tile.cityData.historicalCivilization = historical.civilization;
            tile.cityData.historicalStance = historical.stance;
            tile.faction = historical.civilization;
            tile.owner = null;
            const isPlayerCoreTown = (scenario === SCENARIOS.empire && playerEmpireCore.has(town.id))
                || (scenario === SCENARIOS.building && town.id === startingTownId);

            if (isPlayerCoreTown) {
                this.applyTownOwner(town, 'player', playerFaction);
                return;
            }

            if (scenario === SCENARIOS.building) {
                // In the build scenario, many towns remain neutral and may join or resist.
                if (historical.stance === 'hostile') {
                    this.applyTownOwner(town, 'enemy', historical.civilization);
                } else {
                    this.applyTownOwner(town, 'neutral', historical.civilization);
                }
            } else {
                // In the empire scenario, historical rivals start with firm control.
                if (historical.civilization === playerFaction && historical.stance !== 'hostile') {
                    this.applyTownOwner(town, 'player', playerFaction);
                } else if (historical.stance === 'neutral') {
                    this.applyTownOwner(town, 'neutral', historical.civilization);
                } else {
                    this.applyTownOwner(town, 'enemy', historical.civilization);
                }
            }
        });

        if (scenario === SCENARIOS.empire) {
            this.player.resources.gold += 650;
            this.player.resources.manpower += 500;
            this.player.resources.prestige += 80;
        }

        // Rebuild territories from authoritative map ownership to keep state consistent.
        const playerCityTiles = gameMap?.getCityTiles('player') || [];
        this.player.territories = playerCityTiles
            .map(tile => tile.cityData?.id)
            .filter(Boolean);
    }

    applyTownOwner(town, owner, faction) {
        const tile = gameMap.getTile(town.x, town.y);
        if (!tile?.cityData) return;

        tile.owner = owner;
        tile.faction = faction || tile.faction;
        if (owner === 'player') {
            if (!this.player.territories.includes(town.id)) {
                this.player.territories.push(town.id);
            }
            gameMap.revealArea(town.x, town.y, 4);
        } else {
            const idx = this.player.territories.indexOf(town.id);
            if (idx !== -1) this.player.territories.splice(idx, 1);
        }
    }

    isSpawnTileAvailable(x, y) {
        if (!gameMap || x < 0 || x >= gameMap.width || y < 0 || y >= gameMap.height) {
            return false;
        }
        const tile = gameMap?.getTile(x, y);
        if (!tile || tile.terrain === 'water') return false;
        const occupied = this.units.some(u => u.position.x === x && u.position.y === y);
        return !occupied;
    }

    findAvailableSpawnPosition(originX, originY, preferredOffsets = [], maxRadius = 3) {
        for (const offset of preferredOffsets) {
            const x = originX + offset.x;
            const y = originY + offset.y;
            if (this.isSpawnTileAvailable(x, y)) {
                return { x, y };
            }
        }

        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (Math.abs(dx) + Math.abs(dy) > radius) continue;
                    const x = originX + dx;
                    const y = originY + dy;
                    if (this.isSpawnTileAvailable(x, y)) {
                        return { x, y };
                    }
                }
            }
        }

        return null;
    }

    createStartingUnits(faction, scenario) {
        const playerCities = gameMap.getCityTiles('player');
        if (playerCities.length === 0) return;

        const capital = playerCities.find(t => t.cityData?.kind === 'capital') || playerCities[0];
        const startPos = { x: capital.x, y: capital.y };
        const baseUnits = scenario === SCENARIOS.empire
            ? [
                { type: 'skutatoi', count: 5 },
                { type: 'kavallarioi', count: 4 },
                { type: 'archers', count: 3 }
            ]
            : [
                { type: 'skutatoi', count: 3 },
                { type: 'kavallarioi', count: 2 },
                { type: 'archers', count: 2 }
            ];

        baseUnits.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
                const preferredOffset = { x: i % 3 - 1, y: Math.floor(i / 3) - 1 };
                const spawnPos = this.findAvailableSpawnPosition(startPos.x, startPos.y, [preferredOffset], 4);
                if (!spawnPos) continue;
                const unit = createUnit(type, spawnPos, 'player');
                if (!unit) continue;
                unit.faction = faction;
                this.units.push(unit);
                this.player.unitsOwned.push(unit.id);
                gameMap.revealArea(unit.position.x, unit.position.y, 3);
            }
        });

        // Empire scenario starts with distributed garrisons.
        if (scenario === SCENARIOS.empire) {
            playerCities.forEach((city, idx) => {
                if (idx === 0) return;
                const garrisonType = idx % 2 === 0 ? 'skutatoi' : 'archers';
                const spawnPos = this.findAvailableSpawnPosition(
                    city.x,
                    city.y,
                    [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: -1 }],
                    3
                );
                if (!spawnPos) return;
                const garrison = createUnit(garrisonType, spawnPos, 'player');
                if (!garrison) return;
                garrison.faction = faction;
                this.units.push(garrison);
                this.player.unitsOwned.push(garrison.id);
                gameMap.revealArea(garrison.position.x, garrison.position.y, 2);
            });
        }
    }

    spawnFactionArmyAtTown(town, owner, faction, unitCount = 2) {
        const baseTypes = ['skutatoi', 'archers', 'kavallarioi'];
        for (let i = 0; i < unitCount; i++) {
            const x = town.x + (i % 2);
            const y = town.y + 1 + Math.floor(i / 2);
            if (!this.isSpawnTileAvailable(x, y)) continue;
            const unitType = baseTypes[i % baseTypes.length];
            const unit = createUnit(unitType, { x, y }, owner);
            if (!unit) continue;
            unit.faction = faction;
            this.units.push(unit);
        }
    }

    createEnemyUnits(scenario) {
        const enemyCities = gameMap.getCityTiles('enemy');
        const neutralCities = gameMap.getCityTiles('neutral');

        enemyCities.forEach((cityTile) => {
            const town = HISTORIC_TOWNS.find(t => t.x === cityTile.x && t.y === cityTile.y);
            if (!town) return;
            const count = scenario === SCENARIOS.empire ? 3 : 2;
            this.spawnFactionArmyAtTown(town, 'enemy', cityTile.faction || 'tribal', count);
        });

        // In build scenario, some neutral towns have only light tribal defense.
        if (scenario === SCENARIOS.building) {
            neutralCities.forEach((cityTile, index) => {
                if (index % 3 !== 0) return;
                const town = HISTORIC_TOWNS.find(t => t.x === cityTile.x && t.y === cityTile.y);
                if (!town) return;
                this.spawnFactionArmyAtTown(town, 'enemy', cityTile.faction || 'tribal', 1);
            });
        }
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

        // Cannot move onto occupied tile.
        const occupied = this.units.some(u =>
            u.id !== unit.id &&
            u.position.x === newPosition.x &&
            u.position.y === newPosition.y
        );
        if (occupied) return false;

        // Terrain restrictions.
        const destination = gameMap?.getTile(newPosition.x, newPosition.y);
        if (!destination) return false;
        if (destination.terrain === 'water' && unit.type !== 'special') return false;

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
        if (!tile.cityData) return;
        if (tile.owner === unit.owner) return;

        const oldOwner = tile.owner;
        const cityId = tile.cityData.id || `${position.x}_${position.y}`;

        // Neutral towns can join peacefully or resist based on diplomacy.
        if ((oldOwner === 'neutral' || oldOwner === null) && unit.owner === 'player') {
            const diplomacy = this.selectedLeader?.stats?.diplomacy || 5;
            const joinChance = Math.min(0.85, 0.38 + diplomacy * 0.05);
            if (Math.random() <= joinChance) {
                tile.owner = 'player';
                if (!this.player.territories.includes(cityId)) {
                    this.player.territories.push(cityId);
                }
                if (window.uiManager) {
                    uiManager.showNotification(
                        `${tile.cityData.name} (${tile.cityData.tribe || 'local tribe'}) joined your realm`,
                        'success'
                    );
                }
            } else {
                tile.owner = 'enemy';
                this.spawnFactionArmyAtTown(
                    { x: tile.x, y: tile.y, id: cityId },
                    'enemy',
                    tile.faction || 'tribal',
                    2
                );
                if (window.uiManager) {
                    uiManager.showNotification(
                        `${tile.cityData.name} resisted and formed a hostile coalition`,
                        'error'
                    );
                }
            }
        } else {
            tile.owner = unit.owner;
            if (unit.owner === 'player') {
                if (!this.player.territories.includes(cityId)) {
                    this.player.territories.push(cityId);
                }
            } else if (oldOwner === 'player') {
                const index = this.player.territories.indexOf(cityId);
                if (index !== -1) {
                    this.player.territories.splice(index, 1);
                }
            }
            if (window.uiManager && unit.owner === 'player') {
                uiManager.showNotification(`Captured ${tile.cityData.name}`, 'success');
            }
        }

        gameMap.markTerritoryDirty();
        this.checkWinLossConditions();
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

        const cityProduction = this.calculateCityProduction('player');

        this.addResources(
            Math.floor(baseGold * goldBonus) + territoryBonus,
            Math.floor(baseManpower * manpowerBonus) + cityProduction.manpower,
            basePrestige
        );

        // City gold output
        this.addResources(cityProduction.gold, 0, 0);

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
                gold: Math.floor(baseGold * goldBonus) + territoryBonus + cityProduction.gold,
                manpower: Math.floor(baseManpower * manpowerBonus) + cityProduction.manpower,
                prestige: basePrestige
            },
            upkeep: totalUpkeep,
            cityProduction
        };
    }

    calculateCityProduction(owner = 'player') {
        if (!gameMap) return { gold: 0, manpower: 0, food: 0 };

        const cityTiles = gameMap.getCityTiles(owner);
        const totals = { gold: 0, manpower: 0, food: 0 };

        cityTiles.forEach(tile => {
            const p = tile.cityData?.production;
            const infra = tile.cityData?.infrastructure;
            const pop = tile.cityData?.population || 4;
            if (!p) return;
            totals.food += p.food;
            totals.gold += Math.floor(p.gold + (infra?.roads || 0) * 0.8 + pop * 0.35);
            totals.manpower += Math.floor((p.food * 0.35) + (p.industry * 0.7) + (infra?.industry || 0) * 0.6);
        });

        return totals;
    }

    /**
     * Check Win/Loss conditions
     */
    checkWinLossConditions() {
        const playerUnits = this.units.filter(u => u.owner === 'player');
        const enemyUnits = this.units.filter(u => u.owner === 'enemy');

        // Loss: No units left or no player-controlled cities.
        const playerCities = gameMap?.getCityTiles('player') || [];
        const hasNoUnits = playerUnits.length === 0;
        const hasNoCities = playerCities.length === 0;
        if (hasNoUnits || hasNoCities) {
            if (window.uiManager) {
                if (hasNoCities) {
                    uiManager.showGameOver(false, 'Your empire has lost its last city.');
                } else {
                    uiManager.showGameOver(false);
                }
            }
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
            version: '1.1.0',
            timestamp: Date.now(),
            selectedLeader: this.selectedLeader,
            player: this.player,
            turn: this.turn,
            gameMode: this.gameMode,
            selectedScenario: this.selectedScenario,
            units: this.units,
            buildings: this.buildings,
            territories: this.territories,
            cityOwnership: this.captureCityOwnership()
        };
    }

    captureCityOwnership() {
        if (!gameMap) return [];
        return gameMap.getCityTiles().map(tile => ({
            id: tile.cityData?.id || tile.cityId || `${tile.x}_${tile.y}`,
            x: tile.x,
            y: tile.y,
            owner: tile.owner || null,
            faction: tile.faction || null
        }));
    }

    restoreCityOwnership(cityOwnership = []) {
        if (!gameMap) return;
        const scenario = this.selectedScenario || SCENARIOS.building;
        const playerFaction = this.player?.faction || this.selectedFaction || 'byzantine';
        const playerEmpireCore = new Set(EMPIRE_CORE_TOWNS[playerFaction] || []);
        const startingTownId = this.getStartingTownForFaction(playerFaction).id;
        const hasSavedOwnership = Array.isArray(cityOwnership) && cityOwnership.length > 0;

        if (!hasSavedOwnership) {
            console.warn('City ownership data missing in save; restoring ownership from scenario defaults and known player territories.');
        }

        const byId = new Map(cityOwnership
            .filter(city => city?.id)
            .map(city => [city.id, city]));

        const byCoords = new Map(cityOwnership
            .filter(city => Number.isInteger(city?.x) && Number.isInteger(city?.y))
            .map(city => [`${city.x}_${city.y}`, city]));

        HISTORIC_TOWNS.forEach((town) => {
            const tile = gameMap.getTile(town.x, town.y);
            if (!tile?.cityData) return;
            const historical = HISTORICAL_TOWN_CONTROL[town.id] || {
                tribe: 'Local tribe',
                civilization: 'neutral',
                stance: 'neutral'
            };
            tile.cityData.tribe = historical.tribe;
            tile.cityData.historicalCivilization = historical.civilization;
            tile.cityData.historicalStance = historical.stance;
            if (!tile.faction) tile.faction = historical.civilization;

            const saved = byId.get(town.id) || byCoords.get(`${town.x}_${town.y}`);
            if (saved) {
                tile.owner = saved.owner || null;
                if (saved.faction) tile.faction = saved.faction;

                // Mark consumed entries so we can detect stale/unmatched save data.
                if (saved.id && byId.get(saved.id) === saved) {
                    byId.delete(saved.id);
                }
                if (Number.isInteger(saved.x) && Number.isInteger(saved.y)) {
                    const coordKey = `${saved.x}_${saved.y}`;
                    if (byCoords.get(coordKey) === saved) {
                        byCoords.delete(coordKey);
                    }
                }
                return;
            }

            const territories = Array.isArray(this.player?.territories) ? this.player.territories : [];
            const coordKeyUnderscore = `${town.x}_${town.y}`;
            const coordKeyDash = `${town.x}-${town.y}`;
            const hasTerritory = territories.some((entry) => {
                if (entry === town.id) return true;
                if (typeof entry !== 'string') return false;
                return entry === coordKeyUnderscore || entry === coordKeyDash;
            });
            if (hasTerritory) {
                tile.owner = 'player';
                return;
            }

            if (scenario === SCENARIOS.empire) {
                if (playerEmpireCore.has(town.id) || (historical.civilization === playerFaction && historical.stance !== 'hostile')) {
                    tile.owner = 'player';
                } else if (historical.stance === 'neutral') {
                    tile.owner = 'neutral';
                } else {
                    tile.owner = 'enemy';
                }
            } else {
                tile.owner = town.id === startingTownId ? 'player' : (historical.stance === 'hostile' ? 'enemy' : 'neutral');
            }
        });

        if (byId.size > 0 || byCoords.size > 0) {
            const unmatched = [];
            byId.forEach((city) => {
                if (city && !unmatched.includes(city)) unmatched.push(city);
            });
            byCoords.forEach((city) => {
                if (city && !unmatched.includes(city)) unmatched.push(city);
            });
            if (unmatched.length > 0) {
                console.warn(
                    'Some saved city ownership entries could not be restored:',
                    unmatched.map(city => ({
                        id: city.id,
                        x: city.x,
                        y: city.y,
                        owner: city.owner,
                        faction: city.faction
                    }))
                );
            }
        }

        if (this.player) {
            this.player.territories = gameMap
                .getCityTiles('player')
                .map(tile => tile.cityData?.id)
                .filter(Boolean);
        }

        gameMap.getCityTiles('player').forEach(tile => gameMap.revealArea(tile.x, tile.y, 4));
        this.units
            .filter(unit => unit.owner === 'player')
            .forEach(unit => gameMap.revealArea(unit.position.x, unit.position.y, 3));

        gameMap.markTerritoryDirty();
    }

    /**
     * Load game state from saved data
     */
    deserialize(data) {
        const version = String(data?.version || '').trim();
        const versionParts = version.split('.').map(part => Number.parseInt(part, 10));
        const major = versionParts[0];
        const minor = versionParts[1];
        const isSupportedVersion = Number.isInteger(major)
            && Number.isInteger(minor)
            && major === 1
            && (minor === 0 || minor === 1);

        if (!data || !isSupportedVersion) {
            console.error('Invalid save data');
            return false;
        }
        if (!gameMap) {
            console.error('Map must be initialized before loading save data');
            return false;
        }

        this.selectedLeader = data.selectedLeader;
        this.player = data.player;
        this.turn = data.turn;
        this.gameMode = data.gameMode;
        this.selectedScenario = data.selectedScenario || SCENARIOS.building;
        this.units = data.units;
        this.buildings = data.buildings;
        this.territories = data.territories;
        this.restoreCityOwnership(data.cityOwnership || []);
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
            leader: this.selectedLeader.name,
            scenario: this.selectedScenario
        };
    }
}

// Global game state instance
const gameState = new GameState();
