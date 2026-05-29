'use strict';

/**
 * ScenarioLoader — loads historical battle scenarios from JSON.
 *
 * Scenarios can be bundled locally (assets/scenarios/*.json) or fetched
 * from the neobyzantine-org Game Export API:
 *   GET https://neobyzantine.org/api/game/scenario/{slug}
 *
 * JSON schema: docs/GAME_DATA_CONTRACT.md in neobyzantine-org repo (schema v1.0).
 */
class ScenarioLoader {
    static SCHEMA_VERSION = '1.0';

    // Allowed origins for remote scenario fetch (prevents SSRF-style abuse)
    static ALLOWED_ORIGINS = [
        'https://neobyzantine.org',
        'http://localhost:8080',
        'http://localhost',
    ];

    // Map scenario faction strings → 500ad faction ids
    static FACTION_MAP = {
        byzantine: 'byzantine',
        roman: 'byzantine',
        seljuk: 'arab',
        ottoman: 'arab',
        arab: 'arab',
        sassanid: 'sassanid',
        persian: 'sassanid',
        frank: 'frank',
        bulgar: 'bulgar',
        slavic: 'bulgar',
        neutral: 'byzantine',
    };

    // Map scenario unit strings → 500ad unit type ids
    static UNIT_MAP = {
        heavy_cavalry: 'cataphract',
        tagmata: 'tagmata',
        archers: 'archer',
        varangian_guard: 'varangian',
        horse_archers: 'horse_archer',
        infantry: 'skutatoi',
        siege: 'siege_engineer',
        navy: 'transport_ship',
    };

    constructor() {
        this._activeScenario = null;
    }

    // ── Loading ────────────────────────────────────────────────────────────

    /**
     * Fetch a scenario JSON from a remote URL.
     * Only fetches from ALLOWED_ORIGINS for security.
     */
    async loadFromUrl(url) {
        const origin = this._parseOrigin(url);
        if (!origin || !ScenarioLoader.ALLOWED_ORIGINS.includes(origin)) {
            throw new Error(`Scenario URL origin not allowed: ${origin}`);
        }

        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Failed to fetch scenario: HTTP ${response.status}`);
        }

        const data = await response.json();
        return this._validate(data);
    }

    /** Parse and validate a scenario JSON string. */
    loadFromJson(jsonString) {
        let data;
        try {
            data = JSON.parse(jsonString);
        } catch {
            throw new Error('Scenario JSON is not valid JSON');
        }
        return this._validate(data);
    }

    /** Load a bundled scenario from assets/scenarios/{id}.json */
    async loadBuiltin(scenarioId) {
        const url = `assets/scenarios/${scenarioId}.json`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Built-in scenario not found: ${scenarioId}`);
        }
        const data = await response.json();
        return this._validate(data);
    }

    // ── Applying ───────────────────────────────────────────────────────────

    /**
     * Apply a loaded GameScenario to the running game.
     * Call after game init — places forces on tiles, sets camera.
     */
    applyScenario(gameState, gameMap, scenario) {
        this._activeScenario = scenario;

        // Center camera on scenario map_center
        if (scenario.map_center) {
            const { tile_x, tile_y } = scenario.map_center;
            if (typeof tile_x === 'number' && typeof tile_y === 'number') {
                gameMap.centerOn(tile_x, tile_y);
            }
        }

        // Place each force on the map
        for (const force of (scenario.forces || [])) {
            this._placeForce(gameState, gameMap, force, scenario.date_year);
        }

        // Store metadata for UI display
        gameState.activeScenario = {
            id: scenario.id,
            title: scenario.title,
            dateYear: scenario.date_year,
            dateDisplay: scenario.date_display,
            neobyzantineUrl: scenario.neobyzantine_event_url,
        };

        console.info(`[ScenarioLoader] Applied scenario: ${scenario.title} (${scenario.date_year})`);
    }

    /**
     * Merge GameMapExport locations into HISTORIC_TOWNS.
     * Imported entries with the same id override hardcoded entries.
     */
    applyMapData(gameMap, mapExport) {
        if (!mapExport.locations || !Array.isArray(mapExport.locations)) return;

        const importedIds = new Set(mapExport.locations.map(l => l.id));

        // Filter out overridden towns from hardcoded list
        const baseList = (typeof HISTORIC_TOWNS !== 'undefined' ? HISTORIC_TOWNS : [])
            .filter(t => !importedIds.has(t.id));

        // Convert imported locations to 500ad town format
        const importedTowns = mapExport.locations.map(loc => ({
            id: loc.id,
            name: loc.name,
            x: loc.tile_x,
            y: loc.tile_y,
            lon: loc.lng,
            lat: loc.lat,
            type: loc.type === 'capital' ? 'capital' : loc.type === 'city' ? 'city' : 'town',
            importance: loc.importance ?? 6,
            cityData: {
                kind: loc.type,
                tribe: ScenarioLoader.FACTION_MAP[loc.faction] ?? 'byzantine',
                historicalCivilization: ScenarioLoader.FACTION_MAP[loc.faction] ?? 'byzantine',
            },
        }));

        // Merge: imported towns take precedence
        gameMap.importedTowns = [...importedTowns, ...baseList];
        console.info(`[ScenarioLoader] Imported ${importedTowns.length} locations from neobyzantine-org`);
    }

    // ── Accessors ──────────────────────────────────────────────────────────

    getActiveScenario() {
        return this._activeScenario;
    }

    clearActiveScenario() {
        this._activeScenario = null;
    }

    // ── Internal ───────────────────────────────────────────────────────────

    _validate(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Scenario must be a JSON object');
        }
        if (data.schema_version && data.schema_version !== ScenarioLoader.SCHEMA_VERSION) {
            console.warn(`[ScenarioLoader] Schema version mismatch: got ${data.schema_version}, expected ${ScenarioLoader.SCHEMA_VERSION}`);
        }
        if (!data.id || typeof data.id !== 'string') {
            throw new Error('Scenario must have a string "id" field');
        }
        if (!data.title || typeof data.title !== 'string') {
            throw new Error('Scenario must have a string "title" field');
        }
        return data;
    }

    _placeForce(gameState, gameMap, force, era) {
        const { tile_x, tile_y } = force.position || {};
        if (typeof tile_x !== 'number' || typeof tile_y !== 'number') return;

        const factionId = ScenarioLoader.FACTION_MAP[force.faction] ?? 'byzantine';
        const isPlayer = factionId === 'byzantine' && gameState.playerFaction === 'byzantine';

        const units = (force.units || ['infantry']).map(unitKey => {
            const unitTypeId = ScenarioLoader.UNIT_MAP[unitKey] ?? 'skutatoi';
            return {
                type: unitTypeId,
                x: tile_x,
                y: tile_y,
                owner: factionId,
                health: 100,
                fromScenario: true,
            };
        });

        // Add units to gameState unit roster
        if (typeof gameState.addUnits === 'function') {
            gameState.addUnits(units);
        } else if (Array.isArray(gameState.units)) {
            gameState.units.push(...units);
        }

        console.info(`[ScenarioLoader] Placed ${units.length} ${factionId} unit(s) at tile (${tile_x}, ${tile_y})`);
    }

    _parseOrigin(url) {
        try {
            const u = new URL(url);
            return u.origin;
        } catch {
            return '';
        }
    }
}

// Export for use in game.js / ui.js
if (typeof window !== 'undefined') {
    window.ScenarioLoader = ScenarioLoader;
}
