/**
 * Map and Territory Management
 * Hex-grid based tactical map system
 */

const MAP_CONFIG = {
    width: 200,
    height: 120,
    tileSize: 32,  // Larger tiles for better visibility
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

        // Camera/viewport system (pan only, no zoom)
        this.camera = {
            x: 0,
            y: 0
        };

        // Pan state
        this.isPanning = false;
        this.lastPanX = 0;
        this.lastPanY = 0;

        // Fog of war
        this.fogOfWar = [];

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
     * Generate terrain from detailed geographic heightmap
     */
    generateTerrain(x, y) {
        // Use the detailed Mediterranean heightmap
        if (typeof MEDITERRANEAN_HEIGHTMAP !== 'undefined' &&
            MEDITERRANEAN_HEIGHTMAP[y] &&
            MEDITERRANEAN_HEIGHTMAP[y][x] !== undefined) {
            return heightToTerrain(MEDITERRANEAN_HEIGHTMAP[y][x]);
        }

        // Fallback
        return 'plains';
    }

    /**
     * Check if coordinates are in Mediterranean Sea
     */
    isMediterranean(nx, ny) {
        // Western Mediterranean
        if (nx > 0.25 && nx < 0.42 && ny > 0.50 && ny < 0.65) return true;
        // Central Mediterranean (around Italy)
        if (nx > 0.35 && nx < 0.48 && ny > 0.45 && ny < 0.62) return true;
        // Eastern Mediterranean
        if (nx > 0.45 && nx < 0.68 && ny > 0.48 && ny < 0.68) return true;
        // Aegean Sea
        if (nx > 0.48 && nx < 0.58 && ny > 0.42 && ny < 0.52) return true;
        return false;
    }

    /**
     * Check if coordinates are in Black Sea
     */
    isBlackSea(nx, ny) {
        return nx > 0.55 && nx < 0.72 && ny > 0.28 && ny < 0.38;
    }

    /**
     * Check if coordinates are in Caspian Sea
     */
    isCaspianSea(nx, ny) {
        return nx > 0.82 && nx < 0.92 && ny > 0.32 && ny < 0.48;
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
     * Initialize canvas and controls
     */
    initializeCanvas(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        // Center camera on Byzantine heartland (Constantinople/Anatolia region)
        // Constantinople is approximately at x=110, y=50 in the 200x120 map
        const constantinopleX = 110;
        const constantinopleY = 50;
        this.camera.x = (constantinopleX * MAP_CONFIG.tileSize) - (this.canvas.width / 2);
        this.camera.y = (constantinopleY * MAP_CONFIG.tileSize) - (this.canvas.height / 2);

        // Initialize fog of war (all tiles fogged initially)
        this.initializeFogOfWar();

        this.setupControls();

        // Add event listeners
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
    }

    /**
     * Initialize fog of war
     */
    initializeFogOfWar() {
        this.fogOfWar = [];
        for (let y = 0; y < this.height; y++) {
            this.fogOfWar[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Start with everything fogged
                this.fogOfWar[y][x] = true;
            }
        }
    }

    /**
     * Reveal area around a position (for units/cities)
     */
    revealArea(x, y, radius = 3) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= radius) {
                        this.fogOfWar[ny][nx] = false;
                    }
                }
            }
        }
    }

    /**
     * Check if tile is fogged
     */
    isFoggedTile(x, y) {
        if (!this.fogOfWar[y] || this.fogOfWar[y][x] === undefined) return false;
        return this.fogOfWar[y][x];
    }

    /**
     * Render the map with pan support and fog of war
     */
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        this.ctx.save();

        // Apply camera transformation (pan only)
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Calculate visible tile range
        const tileSize = MAP_CONFIG.tileSize;
        const startX = Math.max(0, Math.floor(this.camera.x / tileSize));
        const startY = Math.max(0, Math.floor(this.camera.y / tileSize));
        const endX = Math.min(this.width, Math.ceil((this.camera.x + this.canvas.width) / tileSize) + 1);
        const endY = Math.min(this.height, Math.ceil((this.camera.y + this.canvas.height) / tileSize) + 1);

        // Render visible tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                if (!tile) continue;

                const px = x * tileSize;
                const py = y * tileSize;

                // Get color from heightmap if available
                let terrainColor = TERRAIN_TYPES[tile.terrain].color;
                if (typeof MEDITERRANEAN_HEIGHTMAP !== 'undefined' &&
                    MEDITERRANEAN_HEIGHTMAP[y] &&
                    MEDITERRANEAN_HEIGHTMAP[y][x] !== undefined) {
                    terrainColor = heightToColor(MEDITERRANEAN_HEIGHTMAP[y][x]);
                }

                // Draw terrain
                this.ctx.fillStyle = terrainColor;
                this.ctx.fillRect(px, py, tileSize, tileSize);

                // Draw subtle grid
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(px, py, tileSize, tileSize);

                // Draw ownership overlay
                if (tile.owner) {
                    this.ctx.fillStyle = tile.owner === 'player' ?
                        'rgba(107, 44, 145, 0.25)' : 'rgba(139, 0, 0, 0.25)';
                    this.ctx.fillRect(px, py, tileSize, tileSize);
                }

                // Draw city/building icons
                if (tile.building) {
                    this.ctx.fillStyle = '#D4AF37';
                    this.ctx.font = `${Math.floor(tileSize * 0.6)}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    const icon = tile.building === 'capital' ? '⭐' : '🏛';
                    this.ctx.fillText(icon, px + tileSize / 2, py + tileSize / 2);
                }

                // Fog of war for undiscovered areas
                if (this.isFoggedTile(x, y)) {
                    this.ctx.fillStyle = 'rgba(40, 40, 40, 0.7)';
                    this.ctx.fillRect(px, py, tileSize, tileSize);
                }
            }
        }

        // Draw units (only visible ones)
        if (gameState && gameState.units) {
            gameState.units.forEach(unit => {
                if (unit.position.x >= startX && unit.position.x < endX &&
                    unit.position.y >= startY && unit.position.y < endY) {
                    this.drawUnit(unit);
                }
            });
        }

        // Draw selection
        if (this.selectedTile) {
            this.renderSelection(this.selectedTile.x, this.selectedTile.y);
        }

        // Draw hover
        if (this.hoveredTile) {
            this.renderHover(this.hoveredTile.x, this.hoveredTile.y);
        }

        // Restore context
        this.ctx.restore();

        // Draw UI overlay
        this.drawUI();
    }

    /**
     * Setup pan controls (no zoom)
     */
    setupControls() {
        // Pan with mouse drag
        this.canvas.addEventListener('mousedown', (e) => {
            this.isPanning = true;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.lastPanX;
                const dy = e.clientY - this.lastPanY;

                this.camera.x -= dx;
                this.camera.y -= dy;

                // Clamp camera to map bounds
                const maxX = (this.width * MAP_CONFIG.tileSize) - this.canvas.width;
                const maxY = (this.height * MAP_CONFIG.tileSize) - this.canvas.height;
                this.camera.x = Math.max(0, Math.min(maxX, this.camera.x));
                this.camera.y = Math.max(0, Math.min(maxY, this.camera.y));

                this.lastPanX = e.clientX;
                this.lastPanY = e.clientY;

                this.render();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPanning = false;
            this.canvas.style.cursor = 'default';
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Draw UI overlay
     */
    drawUI() {
        // Map coordinates display
        const centerX = Math.floor((this.camera.x + this.canvas.width / 2) / MAP_CONFIG.tileSize);
        const centerY = Math.floor((this.camera.y + this.canvas.height / 2) / MAP_CONFIG.tileSize);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 150, 30);
        this.ctx.fillStyle = '#D4AF37';
        this.ctx.font = '14px Crimson Text';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Position: ${centerX}, ${centerY}`, 20, 30);
    }

    /**
     * Draw a unit
     */
    drawUnit(unit) {
        const tileSize = MAP_CONFIG.tileSize;
        const px = unit.position.x * tileSize;
        const py = unit.position.y * tileSize;

        // Unit circle
        this.ctx.fillStyle = unit.owner === 'player' ? '#8E44AD' : '#8B0000';
        this.ctx.beginPath();
        this.ctx.arc(
            px + tileSize / 2,
            py + tileSize / 2,
            tileSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = '#D4AF37';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Icon
        this.ctx.fillStyle = '#F8F9FA';
        this.ctx.font = `${Math.floor(tileSize * 0.4)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const icon = unit.type === 'cavalry' ? '🐎' : '⚔';
        this.ctx.fillText(icon, px + tileSize / 2, py + tileSize / 2);
    }

    /**
     * Render a unit on the map (legacy method)
     */
    renderUnit(unit) {
        this.drawUnit(unit);
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
