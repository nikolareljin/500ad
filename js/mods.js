/**
 * Mod Manager System for 500 A.D.
 * Handles validation, loading, toggling, and merging of external JSON mods.
 */

const MOD_UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const MOD_ID_REGEX = /^[a-z0-9_-]+$/;

function isModUnsafeKey(key) {
    return typeof key !== 'string' || MOD_UNSAFE_KEYS.has(key);
}

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
                const parsed = JSON.parse(raw);
                this.mods = Array.isArray(parsed)
                    ? parsed.filter((mod) => this.validateMod(mod).success)
                    : [];
            }
        } catch (e) {
            console.error('ModManager: failed to load mods from storage', e);
            this.mods = [];
        }

        // If no mods exist (or all stored mods were invalid), seed with example mods.
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
                        baseCost: { gold: 120, manpower: 40, prestige: 1 },
                        buildTurns: 2,
                        requires: { tech: 'siegecraft' }
                    }
                },
                techs: {
                    fire_distillation: {
                        id: 'fire_distillation',
                        name: 'Naphtha Distillation',
                        description: 'Improves distillation of crude oil mixtures, increasing combat strength of all Greek Fire units.',
                        tier: 3,
                        researchTurns: 5,
                        cost: { gold: 320, prestige: 35 },
                        requires: ['siegecraft'],
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
                        baseCost: { gold: 100, manpower: 20, prestige: 0 },
                        buildTurns: 2,
                        requires: { tech: 'military_logistics' }
                    }
                },
                techs: {
                    foederati_treaties: {
                        id: 'foederati_treaties',
                        name: 'Foederati Treaties',
                        description: 'Formalizes treaties with local chieftains, reducing mercenary upkeep.',
                        tier: 2,
                        researchTurns: 4,
                        cost: { gold: 240, prestige: 28 },
                        requires: ['military_logistics'],
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
            },
            {
                id: 'imperial_roads_expansion',
                name: 'Imperial Roads Expansion Mod',
                description: 'Funds a continent-spanning Imperial highway program: a new Highway Depot building, an Engineer Corps unit, and a Roman Surveying tech that boosts movement and trade.',
                author: 'Imperial Bureaucracy',
                version: '1.0.0',
                enabled: false,
                units: {
                    special: {
                        engineer_corps: {
                            id: 'engineer_corps',
                            name: 'Imperial Engineer Corps',
                            type: 'special',
                            category: 'support',
                            description: 'Disciplined road-builders who accelerate movement through friendly provinces.',
                            era: ['early', 'middle', 'late'],
                            cost: { gold: 120, manpower: 60 },
                            upkeep: 5,
                            stats: { health: 70, attack: 4, defense: 6, movement: 3, range: 1 },
                            bonuses: { roadBuildSpeed: 2.0 },
                            icon: 'engineers.png',
                            symbol: '🛠️🛣️'
                        }
                    }
                },
                buildings: {
                    highway_depot: {
                        id: 'highway_depot',
                        name: 'Highway Depot',
                        description: 'A provincial depot that stockpiles paving stone, tools, and post-horses to accelerate road construction.',
                        maxLevel: 3,
                        baseCost: { gold: 140, manpower: 70, prestige: 2 },
                        buildTurns: 3,
                        requires: { tech: 'military_logistics' }
                    }
                },
                techs: {
                    roman_surveying: {
                        id: 'roman_surveying',
                        name: 'Roman Surveying',
                        description: 'Standardized surveying and gromas allow straighter, faster roads — boosting movement and trade income empire-wide.',
                        tier: 2,
                        researchTurns: 3,
                        cost: { gold: 260, prestige: 30 },
                        requires: ['military_logistics'],
                        effects: { movement: 1, tradeIncomeMultiplier: 1.1 }
                    }
                },
                events: [
                    {
                        id: 'quest_imperial_road',
                        type: 'quest',
                        priority: 18,
                        cooldown: 8,
                        triggerCondition: 'turn >= 5',
                        title: 'Petition for the Imperial Road',
                        description: 'A consortium of provincial governors petitions to fund a new section of the Imperial Highway.',
                        choices: [
                            {
                                id: 'road_fund',
                                title: 'Fund the highway expansion',
                                subtitle: '-120 gold, +10 prestige',
                                summary: 'The new road cuts travel times in half and boosts trade revenues.',
                                effects: { resources: { gold: -120, prestige: 10 } }
                            },
                            {
                                id: 'road_defer',
                                title: 'Defer the project to next campaign year',
                                subtitle: '-3 prestige',
                                summary: 'Governors grumble at the delay, but coffers are spared.',
                                effects: { resources: { prestige: -3 } }
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

        if (!mod.id || typeof mod.id !== 'string' || !MOD_ID_REGEX.test(mod.id) || isModUnsafeKey(mod.id)) {
            errors.push('Mod ID must be a safe lowercase string (letters, numbers, hyphens, underscores) and cannot be a reserved key like __proto__, prototype, or constructor.');
        }

        if (!mod.name || typeof mod.name !== 'string' || mod.name.trim() === '') {
            errors.push('Mod Name must be a non-empty string.');
        }

        if (!mod.version || typeof mod.version !== 'string') {
            errors.push('Mod Version must be a valid version string (e.g., "1.0.0").');
        }

        if (mod.enabled !== undefined && typeof mod.enabled !== 'boolean') {
            errors.push('Mod "enabled" must be a boolean (true or false) when set.');
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
                        if (isModUnsafeKey(unitId) || !MOD_ID_REGEX.test(unitId)) {
                            errors.push(`Unit id "${unitId}" is not a safe identifier.`);
                            continue;
                        }
                        const unit = categoryUnits[unitId];
                        if (!unit || typeof unit !== 'object') {
                            errors.push(`Unit "${unitId}" must be an object.`);
                            continue;
                        }
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

        // Validate buildings if present — must match core CITY_BUILDING_TREE shape (baseCost + buildTurns)
        if (mod.buildings) {
            if (typeof mod.buildings !== 'object') {
                errors.push('Buildings section must be an object.');
            } else {
                for (const bldId in mod.buildings) {
                    if (isModUnsafeKey(bldId) || !MOD_ID_REGEX.test(bldId)) {
                        errors.push(`Building id "${bldId}" is not a safe identifier.`);
                        continue;
                    }
                    const bld = mod.buildings[bldId];
                    if (!bld || typeof bld !== 'object') {
                        errors.push(`Building "${bldId}" must be an object.`);
                        continue;
                    }
                    if (bld.id !== bldId) {
                        errors.push(`Building ID mismatch: key "${bldId}" does not match internal building.id "${bld.id}".`);
                    }
                    if (!bld.name || typeof bld.name !== 'string') errors.push(`Building "${bldId}" must have a name.`);
                    if (typeof bld.maxLevel !== 'number' || bld.maxLevel < 1) errors.push(`Building "${bldId}" must specify a numeric maxLevel >= 1.`);
                    if (!bld.baseCost || typeof bld.baseCost !== 'object') {
                        errors.push(`Building "${bldId}" must have a baseCost object with numeric gold/manpower/prestige.`);
                    } else {
                        ['gold', 'manpower', 'prestige'].forEach((field) => {
                            if (typeof bld.baseCost[field] !== 'number') {
                                errors.push(`Building "${bldId}" baseCost.${field} must be a number.`);
                            }
                        });
                    }
                    if (typeof bld.buildTurns !== 'number' || bld.buildTurns < 1) {
                        errors.push(`Building "${bldId}" must specify a numeric buildTurns >= 1.`);
                    }
                }
            }
        }

        // Validate techs if present — must match core TECHNOLOGY_TREE shape (requires array, cost object)
        if (mod.techs) {
            if (typeof mod.techs !== 'object') {
                errors.push('Techs section must be an object.');
            } else {
                for (const techId in mod.techs) {
                    if (isModUnsafeKey(techId) || !MOD_ID_REGEX.test(techId)) {
                        errors.push(`Technology id "${techId}" is not a safe identifier.`);
                        continue;
                    }
                    const tech = mod.techs[techId];
                    if (!tech || typeof tech !== 'object') {
                        errors.push(`Technology "${techId}" must be an object.`);
                        continue;
                    }
                    if (tech.id !== techId) {
                        errors.push(`Technology ID mismatch: key "${techId}" does not match internal tech.id "${tech.id}".`);
                    }
                    if (!tech.name || typeof tech.name !== 'string') errors.push(`Technology "${techId}" must have a name.`);
                    if (typeof tech.tier !== 'number') errors.push(`Technology "${techId}" must have a numeric tier.`);
                    if (typeof tech.researchTurns !== 'number') errors.push(`Technology "${techId}" must have numeric researchTurns.`);
                    if (tech.requires !== undefined && !Array.isArray(tech.requires)) {
                        errors.push(`Technology "${techId}" requires must be an array of tech ids (e.g. ["siegecraft"]).`);
                    }
                    if (!tech.cost || typeof tech.cost !== 'object') {
                        errors.push(`Technology "${techId}" must have a cost object with numeric gold/prestige.`);
                    } else {
                        if (typeof tech.cost.gold !== 'number') errors.push(`Technology "${techId}" cost.gold must be a number.`);
                        if (tech.cost.prestige !== undefined && typeof tech.cost.prestige !== 'number') {
                            errors.push(`Technology "${techId}" cost.prestige must be a number when set.`);
                        }
                    }
                }
            }
        }

        // Validate events if present
        if (mod.events) {
            if (!Array.isArray(mod.events)) {
                errors.push('Events section must be an array.');
            } else {
                mod.events.forEach((evt, idx) => {
                    if (!evt || typeof evt !== 'object') {
                        errors.push(`Event at index ${idx} must be an object.`);
                        return;
                    }
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
                            if (!choice || typeof choice !== 'object') {
                                errors.push(`Event "${evt.id || idx}" choice at index ${choiceIdx} must be an object.`);
                                return;
                            }
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
            enabled: typeof modData.enabled === 'boolean' ? modData.enabled : true,
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
            // Merge units — skip unsafe keys to avoid prototype pollution
            if (mod.units) {
                for (const cat in mod.units) {
                    if (isModUnsafeKey(cat)) continue;
                    if (!UNIT_TYPES[cat]) UNIT_TYPES[cat] = {};
                    for (const unitId in mod.units[cat]) {
                        if (isModUnsafeKey(unitId)) continue;
                        UNIT_TYPES[cat][unitId] = JSON.parse(JSON.stringify(mod.units[cat][unitId]));
                    }
                }
            }

            // Merge buildings
            if (mod.buildings) {
                for (const bldId in mod.buildings) {
                    if (isModUnsafeKey(bldId)) continue;
                    CITY_BUILDING_TREE[bldId] = JSON.parse(JSON.stringify(mod.buildings[bldId]));
                }
            }

            // Merge techs
            if (mod.techs) {
                for (const techId in mod.techs) {
                    if (isModUnsafeKey(techId)) continue;
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
