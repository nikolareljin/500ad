/**
 * Map and Territory Management
 * Hex-grid based tactical map system
 */

const MAP_CONFIG = {
    width: 100,
    height: 60,
    tileSize: 30,
    hexSize: 25,
    viewportWidth: 30, // Number of tiles visible horizontally
    viewportHeight: 20 // Number of tiles visible vertically
};

const HISTORIC_TOWNS = [
    // Balkans & Greece
    { id: 'constantinople', name: 'Constantinople', x: 55, y: 25, type: 'capital', importance: 10 },
    { id: 'thessalonica', name: 'Thessalonica', x: 50, y: 25, type: 'city', importance: 8 },
    { id: 'athens', name: 'Athens', x: 51, y: 30, type: 'town', importance: 6 },
    { id: 'preslav', name: 'Preslav', x: 54, y: 20, type: 'city', importance: 7, faction: 'bulgar' },

    // Anatolia & Caucasus
    { id: 'nicaea', name: 'Nicaea', x: 58, y: 26, type: 'city', importance: 7 },
    { id: 'antioch', name: 'Antioch', x: 68, y: 32, type: 'city', importance: 9 },
    { id: 'iconium', name: 'Iconium', x: 62, y: 29, type: 'city', importance: 7 },
    { id: 'trapous', name: 'Trebizond', x: 72, y: 24, type: 'city', importance: 7 },
    { id: 'tbilisi', name: 'Tbilisi', x: 82, y: 22, type: 'town', importance: 6 },

    // Middle East
    { id: 'jerusalem', name: 'Jerusalem', x: 70, y: 40, type: 'city', importance: 10 },
    { id: 'damascus', name: 'Damascus', x: 71, y: 36, type: 'city', importance: 8 },
    { id: 'baghdad', name: 'Baghdad', x: 85, y: 38, type: 'capital', importance: 10, faction: 'arab' },
    { id: 'ctesiphon', name: 'Ctesiphon', x: 86, y: 39, type: 'capital', importance: 10, faction: 'sassanid' },

    // North Africa
    { id: 'alexandria', name: 'Alexandria', x: 60, y: 48, type: 'city', importance: 9 },
    { id: 'carthage', name: 'Carthage', x: 38, y: 42, type: 'city', importance: 8 },
    { id: 'leptis_magna', name: 'Leptis Magna', x: 45, y: 45, type: 'town', importance: 6 },

    // Italy & Western Med
    { id: 'rome', name: 'Rome', x: 35, y: 25, type: 'capital', importance: 10 },
    { id: 'ravenna', name: 'Ravenna', x: 36, y: 20, type: 'city', importance: 8 },
    { id: 'venice', name: 'Venice', x: 37, y: 18, type: 'city', importance: 7 },
    { id: 'naples', name: 'Naples', x: 36, y: 28, type: 'town', importance: 6 },
    { id: 'cartagena', name: 'Cartagena', x: 15, y: 38, type: 'town', importance: 6 },

    // Central & Northern Europe
    { id: 'aachen', name: 'Aachen', x: 30, y: 10, type: 'city', importance: 8, faction: 'frank' },
    { id: 'paris', name: 'Paris', x: 25, y: 12, type: 'city', importance: 7 },
    { id: 'london', name: 'London', x: 20, y: 5, type: 'city', importance: 7 },
    { id: 'kiev', name: 'Kiev', x: 65, y: 5, type: 'city', importance: 7 }
];

const TERRAIN_TYPES = {
    plains: { color: '#C4B896', moveCost: 1, defenseBonus: 0 },
    forest: { color: '#6B8E5F', moveCost: 2, defenseBonus: 0.2 },
    hills: { color: '#A89968', moveCost: 2, defenseBonus: 0.3 },
    mountains: { color: '#8B7355', moveCost: 3, defenseBonus: 0.4 },
    water: { color: '#7BA7C4', moveCost: 999, defenseBonus: 0 },
    city: { color: '#D4AF37', moveCost: 1, defenseBonus: 0.5 }
};

class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.canvas = null;
        this.ctx = null;
        this.selectedTile = null;
        this.hoveredTile = null;

        this.initializeMap();
    }

    /**
     * Initialize map with terrain
     */
    initializeMap() {
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = {
                    x,
                    y,
                    terrain: this.generateTerrain(x, y),
                    unit: null,
                    building: null,
                    owner: null,
                    visible: true,
                    explored: false
                };
            }
        }

        // Place historical towns
        this.placeHistoricalTowns();

        // Ensure Constantinople is correctly set up as default start center if needed
        // but generally initialization should be handled by scenario in state.js
    }

    /**
     * Generate terrain based on position
     * Mimics basic Mediterranean geography
     */
    generateTerrain(x, y) {
        // Simple noise-like landmass generation
        const nx = x / this.width;
        const ny = y / this.height;

        // Define Mediterranean basin (water center)
        const medX = 0.5;
        const medY = 0.6;
        const distToMed = Math.sqrt(Math.pow(nx - medX, 2) + Math.pow(ny - medY, 2));

        // Land/Water mask
        let isWater = distToMed < 0.25; // Main Med
        if (nx > 0.6 && nx < 0.8 && ny > 0.4 && ny < 0.5) isWater = true; // Eastern Med/Cyprus area
        if (nx > 0.3 && nx < 0.4 && ny > 0.2 && ny < 0.4) isWater = true; // Tyrrhenian Sea

        // Add random coastline noise
        if (Math.random() > 0.8) isWater = !isWater;

        if (isWater) return 'water';

        // Land terrain
        const rand = Math.random();

        // Northern mountains (Alps, Balkans, Caucasus)
        if (ny < 0.3 && rand > 0.7) return 'mountains';
        if (ny < 0.3 && rand > 0.5) return 'hills';

        // Southern desert (Sahara, Arabia)
        if (ny > 0.75) return rand > 0.8 ? 'mountains' : 'plains'; // simplified to plains for desert for now

        // Forests in central areas
        if (ny > 0.2 && ny < 0.5 && rand > 0.7) return 'forest';

        if (rand > 0.8) return 'hills';
        if (rand > 0.9) return 'mountains';

        return 'plains';
    }

    /**
     * Place historical towns on the map
     */
    placeHistoricalTowns() {
        HISTORIC_TOWNS.forEach(town => {
            if (town.y < this.height && town.x < this.width) {
                const tile = this.tiles[town.y][town.x];
                tile.terrain = 'city';
                tile.building = town.type === 'capital' ? 'capital' : 'town';
                tile.name = town.name;
                tile.importance = town.importance;
                // Don't set owner here, state.js will handle that based on scenario
            }
        });
    }

    /**
     * Initialize canvas
     */
    initializeCanvas(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');

        // Set canvas size
        this.canvas.width = this.width * MAP_CONFIG.tileSize;
        this.canvas.height = this.height * MAP_CONFIG.tileSize;

        // Add event listeners
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
    }

    /**
     * Render the map
     */
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.fillStyle = '#0f1419';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.renderTile(x, y);
            }
        }

        // Draw units
        gameState.units.forEach(unit => {
            this.renderUnit(unit);
        });

        // Draw selection
        if (this.selectedTile) {
            this.renderSelection(this.selectedTile.x, this.selectedTile.y);
        }

        // Draw hover
        if (this.hoveredTile) {
            this.renderHover(this.hoveredTile.x, this.hoveredTile.y);
        }
    }

    /**
     * Render a single tile
     */
    renderTile(x, y) {
        const tile = this.tiles[y][x];
        const terrain = TERRAIN_TYPES[tile.terrain];

        const px = x * MAP_CONFIG.tileSize;
        const py = y * MAP_CONFIG.tileSize;

        // Draw terrain
        this.ctx.fillStyle = terrain.color;
        this.ctx.fillRect(px, py, MAP_CONFIG.tileSize, MAP_CONFIG.tileSize);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(px, py, MAP_CONFIG.tileSize, MAP_CONFIG.tileSize);

        // Draw owner indicator
        if (tile.owner === 'player') {
            this.ctx.fillStyle = 'rgba(107, 44, 145, 0.3)';
            this.ctx.fillRect(px, py, MAP_CONFIG.tileSize, MAP_CONFIG.tileSize);
        } else if (tile.owner === 'enemy') {
            this.ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
            this.ctx.fillRect(px, py, MAP_CONFIG.tileSize, MAP_CONFIG.tileSize);
        }

        // Draw building
        if (tile.building) {
            this.ctx.fillStyle = '#D4AF37';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🏛️', px + MAP_CONFIG.tileSize / 2, py + MAP_CONFIG.tileSize / 2);
        }
    }

    /**
     * Render a unit on the map
     */
    renderUnit(unit) {
        const px = unit.position.x * MAP_CONFIG.tileSize;
        const py = unit.position.y * MAP_CONFIG.tileSize;

        // Draw unit circle
        this.ctx.fillStyle = unit.owner === 'player' ? '#8E44AD' : '#8B0000';
        this.ctx.beginPath();
        this.ctx.arc(
            px + MAP_CONFIG.tileSize / 2,
            py + MAP_CONFIG.tileSize / 2,
            MAP_CONFIG.tileSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Draw unit border
        this.ctx.strokeStyle = '#D4AF37';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw unit icon (simplified)
        this.ctx.fillStyle = '#F8F9FA';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const icon = unit.type === 'cavalry' ? '🐎' : unit.type === 'infantry' ? '⚔️' : '🎯';
        this.ctx.fillText(icon, px + MAP_CONFIG.tileSize / 2, py + MAP_CONFIG.tileSize / 2);

        // Draw health bar
        const healthPercent = unit.currentHealth / unit.stats.health;
        const barWidth = MAP_CONFIG.tileSize - 8;
        const barHeight = 4;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(px + 4, py + MAP_CONFIG.tileSize - 8, barWidth, barHeight);

        this.ctx.fillStyle = healthPercent > 0.5 ? '#10B981' : healthPercent > 0.25 ? '#F59E0B' : '#EF4444';
        this.ctx.fillRect(px + 4, py + MAP_CONFIG.tileSize - 8, barWidth * healthPercent, barHeight);
    }

    /**
     * Render selection highlight
     */
    renderSelection(x, y) {
        const px = x * MAP_CONFIG.tileSize;
        const py = y * MAP_CONFIG.tileSize;

        this.ctx.strokeStyle = '#F4D03F';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(px + 2, py + 2, MAP_CONFIG.tileSize - 4, MAP_CONFIG.tileSize - 4);
    }

    /**
     * Render hover highlight
     */
    renderHover(x, y) {
        const px = x * MAP_CONFIG.tileSize;
        const py = y * MAP_CONFIG.tileSize;

        this.ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        this.ctx.fillRect(px, py, MAP_CONFIG.tileSize, MAP_CONFIG.tileSize);
    }

    /**
     * Handle click event
     */
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / MAP_CONFIG.tileSize);
        const y = Math.floor((event.clientY - rect.top) / MAP_CONFIG.tileSize);

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.selectTile(x, y);
        }
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / MAP_CONFIG.tileSize);
        const y = Math.floor((event.clientY - rect.top) / MAP_CONFIG.tileSize);

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.hoveredTile = { x, y };
            this.render();
        }
    }

    /**
     * Handle touch event
     */
    handleTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((touch.clientX - rect.left) / MAP_CONFIG.tileSize);
        const y = Math.floor((touch.clientY - rect.top) / MAP_CONFIG.tileSize);

        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.selectTile(x, y);
        }
    }

    /**
     * Select a tile
     */
    selectTile(x, y) {
        this.selectedTile = { x, y };

        // Check if there's a unit on this tile
        const unit = gameState.units.find(u => u.position.x === x && u.position.y === y);

        if (unit && unit.owner === 'player') {
            gameState.selectUnit(unit.id);
            if (window.uiManager) {
                window.uiManager.showUnitPanel(unit);
            }
        } else if (gameState.selectedUnit) {
            // Try to move selected unit
            gameState.moveUnit(gameState.selectedUnit.id, { x, y });
        }

        this.render();
    }

    /**
     * Get tile at position
     */
    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[y][x];
        }
        return null;
    }

    /**
     * Get unit at position
     */
    getUnitAt(x, y) {
        return gameState.units.find(u => u.position.x === x && u.position.y === y);
    }
}

// Global map instance
let gameMap = null;

/**
 * Initialize game map
 */
function initializeGameMap() {
    gameMap = new GameMap(MAP_CONFIG.width, MAP_CONFIG.height);
    const canvas = document.getElementById('game-map');
    if (canvas) {
        gameMap.initializeCanvas(canvas);
        gameMap.render();
    }
}
