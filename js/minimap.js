/**
 * Minimap Component
 * Displays a small overview of the entire map with viewport indicator
 */

class Minimap {
    constructor(gameMap) {
        this.gameMap = gameMap;
        this.canvas = null;
        this.ctx = null;
        this.viewportIndicator = null;
        this.scaleX = 0;
        this.scaleY = 0;
        this.width = 0;
        this.height = 0;
        this.isDragging = false;
    }

    /**
     * Initialize the minimap
     */
    initialize() {
        this.canvas = document.getElementById('minimap-canvas');
        this.viewportIndicator = document.getElementById('minimap-viewport');

        if (!this.canvas) {
            console.warn('Minimap canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        this.resize();

        // Setup event listeners
        this.setupEventListeners();

        // Initial render
        this.render();
    }

    /**
     * Setup event listeners for minimap interaction
     */
    setupEventListeners() {
        this.canvas.addEventListener('pointerdown', (event) => {
            this.isDragging = true;
            this.handleMinimapPointer(event);
            this.canvas.setPointerCapture(event.pointerId);
        });

        this.canvas.addEventListener('pointermove', (event) => {
            if (this.isDragging) {
                this.handleMinimapPointer(event);
            }
        });

        this.canvas.addEventListener('pointerup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('pointercancel', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('pointerleave', () => {
            this.isDragging = false;
        });
    }

    /**
     * Sync minimap dimensions with CSS size
     */
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = Math.max(1, Math.floor(rect.width));
        this.height = Math.max(1, Math.floor(rect.height));
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        const worldWidth = this.gameMap.width * MAP_CONFIG.tileSize;
        const worldHeight = this.gameMap.height * MAP_CONFIG.tileSize;
        this.scaleX = this.width / worldWidth;
        this.scaleY = this.height / worldHeight;
    }

    /**
     * Handle pointer input to jump to minimap position
     */
    handleMinimapPointer(event) {
        event.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldX = (x / this.scaleX) - (this.gameMap.canvas.width / 2);
        const worldY = (y / this.scaleY) - (this.gameMap.canvas.height / 2);

        const maxX = (this.gameMap.width * MAP_CONFIG.tileSize) - this.gameMap.canvas.width;
        const maxY = (this.gameMap.height * MAP_CONFIG.tileSize) - this.gameMap.canvas.height;

        this.gameMap.camera.x = Math.max(0, Math.min(maxX, worldX));
        this.gameMap.camera.y = Math.max(0, Math.min(maxY, worldY));

        // Re-render both maps
        this.gameMap.render();
        this.updateViewport();
    }

    /**
     * Render the minimap
     */
    render() {
        if (!this.ctx) return;

        // Clear minimap
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw simplified terrain
        for (let y = 0; y < this.gameMap.height; y++) {
            for (let x = 0; x < this.gameMap.width; x++) {
                const tile = this.gameMap.tiles[y][x];
                if (!tile) continue;

                // Get color from heightmap or terrain
                let color = '#888';
                if (typeof MEDITERRANEAN_HEIGHTMAP !== 'undefined' &&
                    MEDITERRANEAN_HEIGHTMAP[y] &&
                    MEDITERRANEAN_HEIGHTMAP[y][x] !== undefined) {
                    color = heightToColor(MEDITERRANEAN_HEIGHTMAP[y][x]);
                } else {
                    color = TERRAIN_TYPES[tile.terrain].color;
                }

                // Draw pixel
                const px = x * MAP_CONFIG.tileSize * this.scaleX;
                const py = y * MAP_CONFIG.tileSize * this.scaleY;
                const sizeX = Math.max(1, MAP_CONFIG.tileSize * this.scaleX);
                const sizeY = Math.max(1, MAP_CONFIG.tileSize * this.scaleY);

                this.ctx.fillStyle = color;
                this.ctx.fillRect(px, py, sizeX, sizeY);

                // Territory ownership overlay on minimap.
                const controlOwner = tile.owner || this.gameMap.getTerritoryOwnerAt(x, y);
                if (controlOwner && tile.terrain !== 'water') {
                    if (controlOwner === 'player') {
                        this.ctx.fillStyle = 'rgba(122, 52, 167, 0.55)';
                    } else if (controlOwner === 'enemy') {
                        this.ctx.fillStyle = 'rgba(152, 14, 14, 0.55)';
                    } else {
                        this.ctx.fillStyle = 'rgba(54, 128, 88, 0.5)';
                    }
                    this.ctx.fillRect(px, py, sizeX, sizeY);
                }
            }
        }

        // Draw cities/important locations
        if (typeof HISTORIC_TOWNS !== 'undefined') {
            HISTORIC_TOWNS.forEach(town => {
                const px = town.x * MAP_CONFIG.tileSize * this.scaleX;
                const py = town.y * MAP_CONFIG.tileSize * this.scaleY;

                const tile = this.gameMap.getTile(town.x, town.y);
                if (tile?.owner === 'player') this.ctx.fillStyle = '#f4d03f';
                else if (tile?.owner === 'enemy') this.ctx.fillStyle = '#ff9f9f';
                else if (tile?.owner === 'neutral') this.ctx.fillStyle = '#9cd3b0';
                else this.ctx.fillStyle = '#D4AF37';
                this.ctx.fillRect(px - 1, py - 1, 3, 3);
            });
        }

        // Update viewport indicator
        this.updateViewport();
    }

    /**
     * Update viewport indicator position
     */
    updateViewport() {
        if (!this.viewportIndicator) return;

        const vpX = this.gameMap.camera.x * this.scaleX;
        const vpY = this.gameMap.camera.y * this.scaleY;
        const vpWidth = this.gameMap.canvas.width * this.scaleX;
        const vpHeight = this.gameMap.canvas.height * this.scaleY;

        this.viewportIndicator.style.left = `${vpX}px`;
        this.viewportIndicator.style.top = `${vpY}px`;
        this.viewportIndicator.style.width = `${vpWidth}px`;
        this.viewportIndicator.style.height = `${vpHeight}px`;
    }
}

// Global minimap instance
let minimap = null;

/**
 * Initialize minimap
 */
function initializeMinimap() {
    if (gameMap) {
        minimap = new Minimap(gameMap);
        minimap.initialize();
    }
}
