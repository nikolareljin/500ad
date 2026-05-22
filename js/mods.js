/**
 * Mod Manager System for 500 A.D.
 * Handles validation, loading, toggling, and merging of external JSON mods.
 */

class ModManager {
    constructor() {
        this.mods = []; // Array of mod objects: { id, name, description, author, version, enabled, units, buildings, techs, events }
        this.originalData = null;
        this.storageKey = '500ad_mods';
    }

    /**
     * Backup core game template structures to allow clean resets when toggling mods
     */
    backupCoreData() {
        if (this.originalData) return; // Already backed up

        if (typeof UNIT_TYPES === 'undefined' || typeof CITY_BUILDING_TREE === 'undefined' || typeof TECHNOLOGY_TREE === 'undefined') {
            console.warn('ModManager: Core game structures not yet loaded for backup.');
            return;
        }

        this.originalData = {
            units: JSON.parse(JSON.stringify(UNIT_TYPES)),
            buildings: JSON.parse(JSON.stringify(CITY_BUILDING_TREE)),
            techs: JSON.parse(JSON.stringify(TECHNOLOGY_TREE))
        };
        console.log('ModManager: Core game data backed up successfully.');
    }

    /**
     * Initialize Mod Manager, load from localStorage, and apply active mods
     */
    initialize() {
        this.backupCoreData();
        this.loadFromStorage();
        this.applyMods();
    }

    /**
     * Load mods list from LocalStorage
     */
    loadFromStorage() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                this.mods = JSON.parse(raw);
            }
        } catch (e) {
            console.error('ModManager: failed to load mods from storage', e);
            this.mods = [];
        }

        // If no mods exist, seed with some interesting examples for the user to try
        if (this.mods.length === 0) {
            this.seedExampleMods();
        }
    }

    /**
     * Save mods list to LocalStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.mods));
        } catch (e) {
            console.error('ModManager: failed to save mods to storage', e);
        }
    }

    /**
     * Seed local mods with interesting prepackaged examples
     */
    seedExampleMods() {
        this.mods = [
            {
                id: 'greek_fire_refinery',
                name: 'Greek Fire Refinement Mod',
                description: 'Unlocks a high-tier Alchemy Lab building upgrade, a Greek Fire Refinement research option (+5 attack), and an advanced Imperial Fire Siphon siege unit.',
                author: 'Imperial Bureaucracy',
                version: '1.0.0',
                enabled: false,
                units: {
                    special: {
                        super_siphon: {
                            id: 'super_siphon',
                            name: 'Imperial Fire Siphon',
                            type: 'special',
                            category: 'siege',
                            description: 'A heavy defensive siphon battery that ejects pressurized Greek Fire over long distances.',
                            era: ['early', 'middle', 'late'],
                            cost: { gold: 380, manpower: 160 },
                            upkeep: 22,
                            stats: { health: 90, attack: 55, defense: 10, movement: 1, range: 3 },
                            bonuses: { vsBuildings: 3.0, vsShips: 4.0, areaEffect: true },
                            icon: 'greekfire.png',
                            symbol: '🔥🔱'
                        }
                    }
                },
                buildings: {
                    alchemy_lab: {
                        id: 'alchemy_lab',
                        name: 'Imperial Alchemy Lab',
                        description: 'A fortified laboratory dedicated to chemical warfare and metallurgical experiments. Unlocks advanced siphons and boosts local gold production.',
                        maxLevel: 3,
                        levels: {
                            1: { gold: 120, manpower: 40, prestige: 1, turns: 2, description: '+8 gold generation' },
                            2: { gold: 250, manpower: 80, prestige: 2, turns: 3, description: '+20 gold generation' },
                            3: { gold: 450, manpower: 140, prestige: 4, turns: 5, description: '+45 gold generation, enables training of Imperial Fire Siphons' }
                        }
                    }
                },
                techs: {
                    fire_distillation: {
                        id: 'fire_distillation',
                        name: 'Naphtha Distillation',
                        description: 'Improves distillation of crude oil mixtures, increasing combat strength of all Greek Fire units.',
                        tier: 3,
                        researchTurns: 5,
                        requires: { tech: 'siege_craft' },
                        effects: { combat_attack_bonus: 5, prestige_income: 1 }
                    }
                },
                events: [
                    {
                        id: 'quest_naphtha_leak',
                        type: 'quest',
                        priority: 15,
                        triggerCondition: 'turn >= 3',
                        title: 'Naphtha Warehouse Fire',
                        description: 'A storage warehouse in Constantinople has caught fire, releasing toxic black fumes. How shall we handle it?',
                        choices: [
                            {
                                id: 'leak_quarantine',
                                title: 'Quarantine the harbor sector',
                                subtitle: '-50 gold, +5 prestige',
                                summary: 'The fire is isolated successfully, preserving the fleet but costing harbor trade revenues.',
                                effects: { resources: { gold: -50, prestige: 5 } }
                            },
                            {
                                id: 'leak_suppress',
                                title: 'Deploy army engineers immediately',
                                subtitle: '-40 manpower, +15 prestige',
                                summary: 'Brave engineers extinguish the blaze, suffering casualties but earning citizens admiration.',
                                effects: { resources: { manpower: -40, prestige: 15 } }
                            }
                        ]
                    }
                ]
            },
            {
                id: 'barbarian_auxiliaries',
                name: 'Barbarian Auxiliaries Mod',
                description: 'Enables recruitment of auxiliary tribal warrior units and establishes a Mercenary Outpost building.',
                author: 'N Reljin',
                version: '1.1.0',
                enabled: false,
                units: {
                    infantry: {
                        auxiliary_warrior: {
                            id: 'auxiliary_warrior',
                            name: 'Auxiliary Swordsman',
                            type: 'infantry',
                            category: 'heavy',
                            description: 'Fierce tribal swordsman recruited as mercenary auxiliary.',
                            era: ['early', 'middle'],
                            cost: { gold: 60, manpower: 45 },
                            upkeep: 4,
                            stats: { health: 110, attack: 14, defense: 12, movement: 2, range: 1 },
                            bonuses: { vsInfantry: 1.1 },
                            icon: 'skutatoi.png',
                            symbol: '⚔️🐺'
                        }
                    }
                },
                buildings: {
                    mercenary_camp: {
                        id: 'mercenary_camp',
                        name: 'Mercenary Outpost',
                        description: 'A camp dedicated to hiring local auxiliary tribesmen.',
                        maxLevel: 2,
                        levels: {
                            1: { gold: 100, manpower: 20, prestige: 0, turns: 2, description: 'Enables recruitment of Auxiliary Swordsmen' },
                            2: { gold: 200, manpower: 40, prestige: 1, turns: 4, description: 'Auxiliary recruitment cost reduced by 15%' }
                        }
                    }
                },
                techs: {
                    foederati_treaties: {
                        id: 'foederati_treaties',
                        name: 'Foederati Treaties',
                        description: 'Formalizes treaties with local chieftains, reducing mercenary upkeep.',
                        tier: 2,
                        researchTurns: 4,
                        requires: { tech: 'diplomatic_immunity' },
                        effects: { upkeep_reduction: 10, trust_bonus: 3 }
                    }
                },
                events: [
                    {
                        id: 'chieftain_demand',
                        type: 'event',
                        priority: 20,
                        triggerCondition: 'turn >= 4',
                        title: 'Chieftain Demands Tribute',
                        description: 'A local auxiliary chieftain demands additional gold to keep his warriors under Imperial command.',
                        choices: [
                            {
                                id: 'pay_chieftain',
                                title: 'Pay the tribute',
                                subtitle: '-100 gold, +5 trust',
                                summary: 'The chieftain remains loyal, securing the frontiers.',
                                effects: { resources: { gold: -100 } }
                            },
                            {
                                id: 'refuse_chieftain',
                                title: 'Refuse the demands',
                                subtitle: '-10 prestige, -2 trust',
                                summary: 'Auxiliary morale wavers and diplomatic trust suffers.',
                                effects: { resources: { prestige: -10 } }
                            }
                        ]
                    }
                ]
            }
        ];
        this.saveToStorage();
    }

    /**
     * Validate mod JSON structure
     * Returns { success: true } or { success: false, errors: [...] }
     */
    validateMod(mod) {
        const errors = [];
        if (!mod || typeof mod !== 'object') {
            return { success: false, errors: ['Mod payload must be a valid JSON object.'] };
        }

        if (!mod.id || typeof mod.id !== 'string' || !/^[a-z0-9_-]+$/.test(mod.id)) {
            errors.push('Mod ID must be a unique string containing only lowercase letters, numbers, hyphens, and underscores.');
        }

        if (!mod.name || typeof mod.name !== 'string' || mod.name.trim() === '') {
            errors.push('Mod Name must be a non-empty string.');
        }

        if (!mod.version || typeof mod.version !== 'string') {
            errors.push('Mod Version must be a valid version string (e.g., "1.0.0").');
        }

        // Validate units if present
        if (mod.units) {
            if (typeof mod.units !== 'object') {
                errors.push('Units section must be an object.');
            } else {
                for (const cat in mod.units) {
                    if (!['infantry', 'cavalry', 'special', 'naval'].includes(cat)) {
                        errors.push(`Invalid unit category: "${cat}". Must be infantry, cavalry, special, or naval.`);
                        continue;
                    }
                    const categoryUnits = mod.units[cat];
                    if (typeof categoryUnits !== 'object') {
                        errors.push(`Units under "${cat}" must be defined as an object.`);
                        continue;
                    }
                    for (const unitId in categoryUnits) {
                        const unit = categoryUnits[unitId];
                        if (unit.id !== unitId) {
                            errors.push(`Unit ID mismatch: key "${unitId}" does not match internal unit.id "${unit.id}".`);
                        }
                        if (!unit.name || typeof unit.name !== 'string') errors.push(`Unit "${unitId}" must have a name.`);
                        if (!unit.era || !Array.isArray(unit.era)) errors.push(`Unit "${unitId}" must specify valid eras as an array.`);
                        if (!unit.cost || typeof unit.cost !== 'object') errors.push(`Unit "${unitId}" must have a cost object.`);
                        if (!unit.stats || typeof unit.stats !== 'object') {
                            errors.push(`Unit "${unitId}" must have a stats object.`);
                        } else {
                            const requiredStats = ['health', 'attack', 'defense', 'movement', 'range'];
                            requiredStats.forEach(stat => {
                                if (typeof unit.stats[stat] !== 'number') errors.push(`Unit "${unitId}" stat "${stat}" must be a number.`);
                            });
                        }
                    }
                }
            }
        }

        // Validate buildings if present
        if (mod.buildings) {
            if (typeof mod.buildings !== 'object') {
                errors.push('Buildings section must be an object.');
            } else {
                for (const bldId in mod.buildings) {
                    const bld = mod.buildings[bldId];
                    if (bld.id !== bldId) {
                        errors.push(`Building ID mismatch: key "${bldId}" does not match internal building.id "${bld.id}".`);
                    }
                    if (!bld.name || typeof bld.name !== 'string') errors.push(`Building "${bldId}" must have a name.`);
                    if (typeof bld.maxLevel !== 'number' || bld.maxLevel < 1) errors.push(`Building "${bldId}" must specify a numeric maxLevel >= 1.`);
                    if (!bld.levels || typeof bld.levels !== 'object') {
                        errors.push(`Building "${bldId}" must have a levels object.`);
                    } else {
                        for (let lvl = 1; lvl <= bld.maxLevel; lvl++) {
                            if (!bld.levels[lvl]) errors.push(`Building "${bldId}" is missing details for level ${lvl}.`);
                        }
                    }
                }
            }
        }

        // Validate techs if present
        if (mod.techs) {
            if (typeof mod.techs !== 'object') {
                errors.push('Techs section must be an object.');
            } else {
                for (const techId in mod.techs) {
                    const tech = mod.techs[techId];
                    if (tech.id !== techId) {
                        errors.push(`Technology ID mismatch: key "${techId}" does not match internal tech.id "${tech.id}".`);
                    }
                    if (!tech.name || typeof tech.name !== 'string') errors.push(`Technology "${techId}" must have a name.`);
                    if (typeof tech.tier !== 'number') errors.push(`Technology "${techId}" must have a numeric tier.`);
                    if (typeof tech.researchTurns !== 'number') errors.push(`Technology "${techId}" must have numeric researchTurns.`);
                }
            }
        }

        // Validate events if present
        if (mod.events) {
            if (!Array.isArray(mod.events)) {
                errors.push('Events section must be an array.');
            } else {
                mod.events.forEach((evt, idx) => {
                    if (!evt.id || typeof evt.id !== 'string') errors.push(`Event at index ${idx} must have an id.`);
                    if (!evt.title || typeof evt.title !== 'string') errors.push(`Event "${evt.id || idx}" must have a title.`);
                    if (!evt.description || typeof evt.description !== 'string') errors.push(`Event "${evt.id || idx}" must have a description.`);
                    if (evt.triggerCondition && typeof evt.triggerCondition !== 'string') {
                        errors.push(`Event "${evt.id || idx}" triggerCondition must be a string expression (e.g. "turn >= 5").`);
                    }
                    if (evt.choices && !Array.isArray(evt.choices)) {
                        errors.push(`Event "${evt.id || idx}" choices must be an array.`);
                    } else if (evt.choices) {
                        evt.choices.forEach((choice, choiceIdx) => {
                            if (!choice.id || typeof choice.id !== 'string') {
                                errors.push(`Event "${evt.id || idx}" choice at index ${choiceIdx} must have an id.`);
                            }
                            if (!choice.title || typeof choice.title !== 'string') {
                                errors.push(`Event "${evt.id || idx}" choice "${choice.id || choiceIdx}" must have a title.`);
                            }
                        });
                    }
                });
            }
        }

        return {
            success: errors.length === 0,
            errors
        };
    }

    /**
     * Add or update a mod
     */
    addMod(modData) {
        const validation = this.validateMod(modData);
        if (!validation.success) {
            return validation;
        }

        // Clean values
        const newMod = {
            id: modData.id,
            name: modData.name,
            description: modData.description || '',
            author: modData.author || 'Anonymous',
            version: modData.version,
            enabled: modData.enabled !== undefined ? modData.enabled : true,
            units: modData.units || {},
            buildings: modData.buildings || {},
            techs: modData.techs || {},
            events: modData.events || []
        };

        const existingIdx = this.mods.findIndex(m => m.id === newMod.id);
        if (existingIdx >= 0) {
            this.mods[existingIdx] = newMod;
        } else {
            this.mods.push(newMod);
        }

        this.saveToStorage();
        this.applyMods();

        return { success: true };
    }

    /**
     * Toggle a mod's active state
     */
    toggleMod(modId) {
        const mod = this.mods.find(m => m.id === modId);
        if (mod) {
            mod.enabled = !mod.enabled;
            this.saveToStorage();
            this.applyMods();
            return true;
        }
        return false;
    }

    /**
     * Delete a mod
     */
    deleteMod(modId) {
        const initialLen = this.mods.length;
        this.mods = this.mods.filter(m => m.id !== modId);
        if (this.mods.length !== initialLen) {
            this.saveToStorage();
            this.applyMods();
            return true;
        }
        return false;
    }

    /**
     * Merge all enabled mods into core game data structures
     */
    applyMods() {
        this.backupCoreData();
        if (!this.originalData) return; // Cannot apply without backup

        // Reset to original core structures
        for (const cat in UNIT_TYPES) {
            delete UNIT_TYPES[cat];
        }
        Object.assign(UNIT_TYPES, JSON.parse(JSON.stringify(this.originalData.units)));

        for (const id in CITY_BUILDING_TREE) {
            delete CITY_BUILDING_TREE[id];
        }
        Object.assign(CITY_BUILDING_TREE, JSON.parse(JSON.stringify(this.originalData.buildings)));

        for (const id in TECHNOLOGY_TREE) {
            delete TECHNOLOGY_TREE[id];
        }
        Object.assign(TECHNOLOGY_TREE, JSON.parse(JSON.stringify(this.originalData.techs)));

        // Merge enabled mods
        const enabledMods = this.mods.filter(m => m.enabled);
        console.log(`ModManager: Applying ${enabledMods.length} enabled mods.`);

        for (const mod of enabledMods) {
            // Merge units
            if (mod.units) {
                for (const cat in mod.units) {
                    if (!UNIT_TYPES[cat]) UNIT_TYPES[cat] = {};
                    for (const unitId in mod.units[cat]) {
                        UNIT_TYPES[cat][unitId] = JSON.parse(JSON.stringify(mod.units[cat][unitId]));
                    }
                }
            }

            // Merge buildings
            if (mod.buildings) {
                for (const bldId in mod.buildings) {
                    CITY_BUILDING_TREE[bldId] = JSON.parse(JSON.stringify(mod.buildings[bldId]));
                }
            }

            // Merge techs
            if (mod.techs) {
                for (const techId in mod.techs) {
                    TECHNOLOGY_TREE[techId] = JSON.parse(JSON.stringify(mod.techs[techId]));
                }
            }
        }

        // Notify state or map if running
        if (typeof gameState !== 'undefined' && gameState.initialized) {
            // Update UI views if possible to capture changes in technology and building trees
            if (typeof uiManager !== 'undefined') {
                uiManager.updateHUD();
                if (typeof gameMap !== 'undefined') gameMap.requestRender();
            }
        }
    }

    /**
     * Get a list of narrative events defined in enabled mods
     */
    getEnabledEvents() {
        const events = [];
        const enabledMods = this.mods.filter(m => m.enabled);
        for (const mod of enabledMods) {
            if (Array.isArray(mod.events)) {
                mod.events.forEach(evt => {
                    events.push({
                        ...evt,
                        modName: mod.name
                    });
                });
            }
        }
        return events;
    }
}

// Global ModManager instance
const modManager = new ModManager();
window.modManager = modManager;

// Helper to evaluate basic data-driven trigger conditions safely
function evaluateModCondition(conditionStr, state) {
    if (!conditionStr) return true;
    
    // Support basic variables: turn, gold, manpower, prestige
    const match = conditionStr.match(/^\s*(turn|gold|manpower|prestige)\s*(>=|<=|>|<|==)\s*(\d+)\s*$/);
    if (!match) return false;
    
    const [, variable, operator, valueStr] = match;
    const value = parseInt(valueStr, 10);
    
    let actualVal = 0;
    if (variable === 'turn') actualVal = state.turn;
    else if (variable === 'gold') actualVal = state.player?.resources?.gold || 0;
    else if (variable === 'manpower') actualVal = state.player?.resources?.manpower || 0;
    else if (variable === 'prestige') actualVal = state.player?.resources?.prestige || 0;
    
    switch (operator) {
        case '>=': return actualVal >= value;
        case '<=': return actualVal <= value;
        case '>': return actualVal > value;
        case '<': return actualVal < value;
        case '==': return actualVal === value;
        default: return false;
    }
}
window.evaluateModCondition = evaluateModCondition;
