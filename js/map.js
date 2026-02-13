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
    { id: 'constantinople', name: 'Constantinople', x: 116, y: 32, type: 'capital', importance: 10 },
    { id: 'thessalonica', name: 'Thessalonica', x: 113, y: 33, type: 'city', importance: 8 },
    { id: 'athens', name: 'Athens', x: 113, y: 34, type: 'town', importance: 6 },
    { id: 'preslav', name: 'Preslav', x: 115, y: 31, type: 'city', importance: 7, faction: 'bulgar' },

    // Anatolia & Caucasus
    { id: 'nicaea', name: 'Nicaea', x: 117, y: 33, type: 'city', importance: 7 },
    { id: 'antioch', name: 'Antioch', x: 120, y: 36, type: 'city', importance: 9 },
    { id: 'iconium', name: 'Iconium', x: 118, y: 35, type: 'city', importance: 7 },
    { id: 'trapous', name: 'Trebizond', x: 122, y: 33, type: 'city', importance: 7 },
    { id: 'tbilisi', name: 'Tbilisi', x: 124, y: 33, type: 'town', importance: 6 },

    // Middle East
    { id: 'jerusalem', name: 'Jerusalem', x: 119, y: 39, type: 'city', importance: 10 },
    { id: 'damascus', name: 'Damascus', x: 120, y: 38, type: 'city', importance: 8 },
    { id: 'baghdad', name: 'Baghdad', x: 124, y: 38, type: 'capital', importance: 10, faction: 'arab' },
    { id: 'ctesiphon', name: 'Ctesiphon', x: 124, y: 39, type: 'capital', importance: 10, faction: 'sassanid' },

    // North Africa
    { id: 'alexandria', name: 'Alexandria', x: 117, y: 39, type: 'city', importance: 9 },
    { id: 'carthage', name: 'Carthage', x: 106, y: 35, type: 'city', importance: 8 },
    { id: 'leptis_magna', name: 'Leptis Magna', x: 108, y: 39, type: 'town', importance: 6 },

    // Italy & Western Med
    { id: 'rome', name: 'Rome', x: 107, y: 32, type: 'capital', importance: 10 },
    { id: 'ravenna', name: 'Ravenna', x: 107, y: 31, type: 'city', importance: 8 },
    { id: 'venice', name: 'Venice', x: 107, y: 30, type: 'city', importance: 7 },
    { id: 'naples', name: 'Naples', x: 108, y: 33, type: 'town', importance: 6 },
    { id: 'cartagena', name: 'Cartagena', x: 99, y: 35, type: 'town', importance: 6 },

    // Central & Northern Europe
    { id: 'aachen', name: 'Aachen', x: 103, y: 27, type: 'city', importance: 8, faction: 'frank' },
    { id: 'paris', name: 'Paris', x: 101, y: 27, type: 'city', importance: 7 },
    { id: 'london', name: 'London', x: 100, y: 26, type: 'city', importance: 7 },
    { id: 'kiev', name: 'Kiev', x: 117, y: 27, type: 'city', importance: 7 }
];

const TERRAIN_TYPES = {
    plains: { color: '#C4B896', moveCost: 1, defenseBonus: 0 },
    forest: { color: '#6B8E5F', moveCost: 2, defenseBonus: 0.2 },
    hills: { color: '#A89968', moveCost: 2, defenseBonus: 0.3 },
    mountains: { color: '#8B7355', moveCost: 3, defenseBonus: 0.4 },
    water: { color: '#7BA7C4', moveCost: 999, defenseBonus: 0 },
    city: { color: '#D4AF37', moveCost: 1, defenseBonus: 0.5 }
};

const CITY_WONDERS = {
    constantinople: 'Hagia Sophia',
    rome: 'Aurelian Walls',
    baghdad: 'House of Wisdom',
    alexandria: 'Library Legacy'
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
                tile.cityId = town.id;
                tile.cityData = {
                    id: town.id,
                    name: town.name,
                    kind: town.type,
                    population: town.type === 'capital' ? 6 : 4,
                    production: {
                        food: town.type === 'capital' ? 5 : 3,
                        industry: town.type === 'capital' ? 4 : 2,
                        gold: town.type === 'capital' ? 5 : 3
                    },
                    infrastructure: {
                        roads: town.type === 'capital' ? 2 : 1,
                        agriculture: town.type === 'capital' ? 2 : 1,
                        industry: town.type === 'capital' ? 2 : 1
                    },
                    wonder: CITY_WONDERS[town.id] || null
                };
                // Don't set owner here, state.js will handle that based on scenario
            }
        });
    }

    getCityTiles(owner = null) {
        const cities = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (!tile?.cityData) continue;
                if (owner && tile.owner !== owner) continue;
                cities.push(tile);
            }
        }
        return cities;
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

        // Center camera on Constantinople in the world projection.
        const constantinople = HISTORIC_TOWNS.find(t => t.id === 'constantinople');
        const constantinopleX = constantinople ? constantinople.x : Math.floor(this.width * 0.58);
        const constantinopleY = constantinople ? constantinople.y : Math.floor(this.height * 0.36);
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
     * Fog alpha for a tile with softened explored/unexplored edges.
     */
    getFogAlpha(x, y) {
        if (!this.isFoggedTile(x, y)) {
            return 0;
        }

        let exploredNeighbors = 0;
        let totalNeighbors = 0;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
                totalNeighbors++;
                if (!this.isFoggedTile(nx, ny)) exploredNeighbors++;
            }
        }

        const edgeFactor = totalNeighbors > 0 ? exploredNeighbors / totalNeighbors : 0;
        // Edge tiles stay lighter, deep unknown gets denser.
        return 0.3 + (1 - edgeFactor) * 0.35;
    }

    /**
     * Draw major river overlays on visible region.
     */
    drawRivers(startX, startY, endX, endY, tileSize) {
        if (typeof MEDITERRANEAN_HEIGHTMAP === 'undefined') return;

        this.ctx.strokeStyle = 'rgba(95, 175, 230, 0.65)';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const height = MEDITERRANEAN_HEIGHTMAP[y]?.[x];
                if (height === undefined || height > 50) continue;

                // Draw river strokes only for inland water, not broad oceans.
                if (height < 40) continue;

                const px = x * tileSize;
                const py = y * tileSize;
                this.ctx.lineWidth = Math.max(1, tileSize * 0.18);
                this.ctx.beginPath();
                this.ctx.moveTo(px + tileSize * 0.15, py + tileSize * 0.5);
                this.ctx.lineTo(px + tileSize * 0.85, py + tileSize * 0.5);
                this.ctx.stroke();
            }
        }
    }

    drawCityInfrastructure(tile, tileSize) {
        if (!tile?.cityData?.infrastructure) return;

        const { roads, agriculture, industry } = tile.cityData.infrastructure;
        const cx = tile.x * tileSize + tileSize / 2;
        const cy = tile.y * tileSize + tileSize / 2;

        if (roads > 0) {
            this.ctx.strokeStyle = 'rgba(180, 150, 95, 0.7)';
            this.ctx.lineWidth = Math.max(1, tileSize * 0.08);
            this.ctx.beginPath();
            this.ctx.moveTo(cx - tileSize * 0.5, cy);
            this.ctx.lineTo(cx + tileSize * 0.5, cy);
            this.ctx.moveTo(cx, cy - tileSize * 0.5);
            this.ctx.lineTo(cx, cy + tileSize * 0.5);
            this.ctx.stroke();
        }

        if (agriculture > 0) {
            // Agriculture: green field stripes.
            this.ctx.strokeStyle = 'rgba(160, 205, 120, 0.9)';
            this.ctx.lineWidth = Math.max(1, tileSize * 0.05);
            for (let i = -1; i <= 1; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(cx - tileSize * 0.22, cy + tileSize * (0.2 + i * 0.06));
                this.ctx.lineTo(cx + tileSize * 0.22, cy + tileSize * (0.2 + i * 0.06));
                this.ctx.stroke();
            }
        }

        if (industry > 0) {
            // Industry: compact forge icon.
            const size = tileSize * 0.16;
            this.ctx.fillStyle = 'rgba(176, 183, 194, 0.95)';
            this.ctx.fillRect(cx - size, cy - size * 0.9, size * 2, size * 1.5);
            this.ctx.fillStyle = 'rgba(130, 137, 150, 0.95)';
            this.ctx.fillRect(cx + size * 0.4, cy - size * 1.4, size * 0.6, size * 0.7);
            this.ctx.fillStyle = 'rgba(236, 186, 95, 0.95)';
            this.ctx.fillRect(cx - size * 0.3, cy - size * 0.3, size * 0.6, size * 0.5);
        }

        // Show surrounding economy around the city.
        const neighborOffsets = [
            { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: -1 }, { x: 1, y: 1 }
        ];

        neighborOffsets.forEach((offset, index) => {
            const nx = tile.x + offset.x;
            const ny = tile.y + offset.y;
            if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) return;
            if (this.isFoggedTile(nx, ny)) return;

            const nTile = this.tiles[ny][nx];
            if (!nTile || nTile.terrain === 'water') return;

            const npx = nx * tileSize + tileSize / 2;
            const npy = ny * tileSize + tileSize / 2;

            if (roads > 1) {
                this.ctx.strokeStyle = 'rgba(190, 160, 100, 0.5)';
                this.ctx.lineWidth = Math.max(1, tileSize * 0.06);
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy);
                this.ctx.lineTo(npx, npy);
                this.ctx.stroke();
            }

            if (agriculture > 1 && index % 2 === 0) {
                this.ctx.fillStyle = 'rgba(168, 215, 132, 0.85)';
                this.ctx.beginPath();
                this.ctx.arc(npx, npy, Math.max(2, tileSize * 0.09), 0, Math.PI * 2);
                this.ctx.fill();
            } else if (industry > 1 && index % 2 === 1) {
                const s = Math.max(2, tileSize * 0.14);
                this.ctx.fillStyle = 'rgba(180, 186, 196, 0.85)';
                this.ctx.fillRect(npx - s / 2, npy - s / 2, s, s);
            }
        });
    }

    drawCityLabels(startX, startY, endX, endY, tileSize) {
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const tile = this.tiles[y][x];
                if (!tile?.cityData) continue;
                if (this.isFoggedTile(x, y) && tile.owner !== 'player') continue;

                const px = x * tileSize + tileSize / 2;
                const py = y * tileSize;
                const isEnemy = tile.owner === 'enemy';
                const cityColor = isEnemy ? '#ff9f9f' : '#f4d03f';

                this.drawCityInfrastructure(tile, tileSize);

                // City name
                this.ctx.font = `${Math.max(10, Math.floor(tileSize * 0.34))}px "Old Standard TT", serif`;
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
                this.ctx.fillText(tile.cityData.name, px + 1, py - 6 + 1);
                this.ctx.fillStyle = cityColor;
                this.ctx.fillText(tile.cityData.name, px, py - 6);

                // Production line
                const p = tile.cityData.production;
                const prodText = `F${p.food} I${p.industry} G${p.gold}`;
                this.ctx.font = `${Math.max(9, Math.floor(tileSize * 0.28))}px "Crimson Text", serif`;
                this.ctx.fillStyle = 'rgba(20, 20, 20, 0.7)';
                this.ctx.fillText(prodText, px + 1, py + tileSize + 11);
                this.ctx.fillStyle = 'rgba(230, 235, 240, 0.92)';
                this.ctx.fillText(prodText, px, py + tileSize + 10);

                // Wonder marker
                if (tile.cityData.wonder) {
                    this.ctx.font = `${Math.max(9, Math.floor(tileSize * 0.26))}px "Crimson Text", serif`;
                    this.ctx.fillStyle = 'rgba(255, 220, 130, 0.95)';
                    this.ctx.fillText(`${tile.cityData.wonder}`, px, py - 20);
                    this.ctx.strokeStyle = 'rgba(255, 220, 130, 0.95)';
                    this.ctx.lineWidth = Math.max(1, tileSize * 0.06);
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py - 28);
                    this.ctx.lineTo(px + 4, py - 24);
                    this.ctx.lineTo(px, py - 20);
                    this.ctx.lineTo(px - 4, py - 24);
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
            }
        }
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

                // Draw subtle grid only on explored tiles to avoid "square earth" look in fog.
                if (!this.isFoggedTile(x, y)) {
                    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(px, py, tileSize, tileSize);
                }

                // Draw ownership overlay
                if (tile.owner) {
                    this.ctx.fillStyle = tile.owner === 'player' ?
                        'rgba(107, 44, 145, 0.25)' : 'rgba(139, 0, 0, 0.25)';
                    this.ctx.fillRect(px, py, tileSize, tileSize);
                }

                // Draw city/building icons
                if (tile.building) {
                    const cx = px + tileSize / 2;
                    const cy = py + tileSize / 2;
                    const size = tileSize * 0.22;
                    this.ctx.strokeStyle = '#d9be6a';
                    this.ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
                    this.ctx.lineWidth = Math.max(1, tileSize * 0.08);
                    if (tile.building === 'capital') {
                        this.ctx.beginPath();
                        this.ctx.moveTo(cx, cy - size);
                        this.ctx.lineTo(cx + size, cy + size);
                        this.ctx.lineTo(cx - size, cy + size);
                        this.ctx.closePath();
                        this.ctx.fill();
                        this.ctx.stroke();
                    } else {
                        this.ctx.fillRect(cx - size, cy - size * 0.8, size * 2, size * 1.6);
                        this.ctx.strokeRect(cx - size, cy - size * 0.8, size * 2, size * 1.6);
                    }
                }

                // Gray fog of war for undiscovered areas with softened boundaries.
                const fogAlpha = this.getFogAlpha(x, y);
                if (fogAlpha > 0) {
                    this.ctx.fillStyle = `rgba(120, 124, 132, ${fogAlpha})`;
                    this.ctx.fillRect(px, py, tileSize, tileSize);
                }
            }
        }

        // Draw river overlays after terrain and fog pass.
        this.drawRivers(startX, startY, endX, endY, tileSize);

        // Draw units (only visible ones)
        if (gameState && gameState.units) {
            gameState.units.forEach(unit => {
                if (unit.position.x >= startX && unit.position.x < endX &&
                    unit.position.y >= startY && unit.position.y < endY) {
                    this.drawUnit(unit);
                }
            });
        }

        // Draw city labels/production/wonders after units for readability.
        this.drawCityLabels(startX, startY, endX, endY, tileSize);

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
        const tile = this.screenToTile(event.clientX, event.clientY);
        if (tile) {
            this.selectTile(tile.x, tile.y);
        }
    }

    /**
     * Handle mouse move event
     */
    handleMouseMove(event) {
        const tile = this.screenToTile(event.clientX, event.clientY);
        if (tile) {
            this.hoveredTile = tile;
            this.render();
        }
    }

    /**
     * Handle touch event
     */
    handleTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const tile = this.screenToTile(touch.clientX, touch.clientY);
        if (tile) {
            this.selectTile(tile.x, tile.y);
        }
    }

    screenToTile(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const mapX = (clientX - rect.left) + this.camera.x;
        const mapY = (clientY - rect.top) + this.camera.y;
        const x = Math.floor(mapX / MAP_CONFIG.tileSize);
        const y = Math.floor(mapY / MAP_CONFIG.tileSize);

        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return { x, y };
    }

    /**
     * Select a tile
     */
    selectTile(x, y) {
        this.selectedTile = { x, y };
        const tile = this.getTile(x, y);

        // Check if there's a unit on this tile
        const unit = gameState.units.find(u => u.position.x === x && u.position.y === y);

        if (unit && unit.owner === 'player') {
            gameState.selectUnit(unit.id);
            if (window.uiManager) {
                window.uiManager.showUnitPanel(unit);
            }
        } else if (gameState.selectedUnit) {
            // Try to move selected unit
            const moved = gameState.moveUnit(gameState.selectedUnit.id, { x, y });
            if (!moved && window.uiManager) {
                window.uiManager.showNotification('Unit cannot move to that tile', 'error');
            }
        } else if (tile?.cityData && window.uiManager) {
            const p = tile.cityData.production;
            const wonderText = tile.cityData.wonder ? ` | Wonder: ${tile.cityData.wonder}` : '';
            window.uiManager.showNotification(
                `${tile.cityData.name} (${tile.owner || 'neutral'}) - F${p.food} I${p.industry} G${p.gold}${wonderText}`,
                'info'
            );
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
