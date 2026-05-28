/**
 * Mod Manager System for 500 A.D.
 * Handles validation, loading, toggling, and merging of external JSON mods.
 */

const MOD_UNSAFE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const MOD_ID_REGEX = /^[a-z0-9_-]+$/;
// Must match the grammar accepted by evaluateModCondition() below.
const MOD_TRIGGER_CONDITION_REGEX = /^\s*(turn|gold|manpower|prestige)\s*(>=|<=|>|<|==)\s*(\d+)\s*$/;

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
            techs: JSON.parse(JSON.stringify(TECHNOLOGY_TREE)),
            recruitmentCatalog: (typeof RECRUITMENT_UNIT_CATALOG !== 'undefined')
                ? RECRUITMENT_UNIT_CATALOG.slice()
                : null
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
        let hadStoredEntry = false;
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw !== null) {
                hadStoredEntry = true;
                const parsed = JSON.parse(raw);
                this.mods = Array.isArray(parsed)
                    ? parsed.filter((mod) => this.validateMod(mod).success)
                    : [];
            }
        } catch (e) {
            console.error('ModManager: failed to load mods from storage', e);
            this.mods = [];
            // Treat parse failure as "no usable stored entry" so a fresh seed runs.
            hadStoredEntry = false;
        }

        // Seed example mods only on first run (no storage key yet). An
        // intentionally-emptied list (stored value is `[]`) stays empty
        // across reloads — matches what the UI's empty-state text promises.
        if (!hadStoredEntry) {
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
     * Return the static catalog of seeded example mods. Used both for the
     * initial seed and for on-demand reinstall when the user has deleted a
     * seeded entry and clicks the corresponding example button.
     */
    getExampleModCatalog() {
        return [
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
                        description: 'Improved distillation of crude oil mixtures buoys imperial coffers from naval contracts and grants steady prestige.',
                        tier: 3,
                        researchTurns: 5,
                        cost: { gold: 320, prestige: 35 },
                        requires: ['siegecraft'],
                        effects: { siegeAttackMultiplier: 1.1, prestigePerTurn: 1 }
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
                        description: 'Formalizes treaties with local chieftains, smoothing diplomacy and increasing manpower available for muster.',
                        tier: 2,
                        researchTurns: 4,
                        cost: { gold: 240, prestige: 28 },
                        requires: ['military_logistics'],
                        effects: { manpowerMultiplier: 1.05, diplomacyAcceptanceBonus: 0.05 }
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
                                subtitle: '-100 gold, +5 tribal trust',
                                summary: 'The chieftain remains loyal, securing the frontiers.',
                                effects: { resources: { gold: -100 }, trust: { tribal: 5 } }
                            },
                            {
                                id: 'refuse_chieftain',
                                title: 'Refuse the demands',
                                subtitle: '-10 prestige, -2 tribal trust',
                                summary: 'Auxiliary morale wavers and diplomatic trust suffers.',
                                effects: { resources: { prestige: -10 }, trust: { tribal: -2 } }
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
    }

    seedExampleMods() {
        this.mods = JSON.parse(JSON.stringify(this.getExampleModCatalog()));
        this.saveToStorage();
    }

    /**
     * Install (or replace) a seeded example mod by id. Returns true when an
     * entry exists in the catalog and was installed, false otherwise.
     */
    installExampleMod(modId) {
        if (this.isCampaignActive()) return false;
        const catalog = this.getExampleModCatalog();
        const example = catalog.find((m) => m.id === modId);
        if (!example) return false;
        const cloned = JSON.parse(JSON.stringify(example));
        const existingIdx = this.mods.findIndex((m) => m.id === modId);
        if (existingIdx >= 0) {
            this.mods[existingIdx] = cloned;
        } else {
            this.mods.push(cloned);
        }
        this.saveToStorage();
        this.applyMods();
        return true;
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
            if (typeof mod.units !== 'object' || Array.isArray(mod.units)) {
                errors.push('Units section must be an object keyed by category.');
            } else {
                for (const cat in mod.units) {
                    if (!['infantry', 'cavalry', 'special', 'naval'].includes(cat)) {
                        errors.push(`Invalid unit category: "${cat}". Must be infantry, cavalry, special, or naval.`);
                        continue;
                    }
                    const categoryUnits = mod.units[cat];
                    if (!categoryUnits || typeof categoryUnits !== 'object' || Array.isArray(categoryUnits)) {
                        errors.push(`Units under "${cat}" must be defined as an object keyed by unit id.`);
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
                        if (!unit.cost || typeof unit.cost !== 'object') {
                            errors.push(`Unit "${unitId}" must have a cost object with numeric gold and manpower.`);
                        } else {
                            ['gold', 'manpower'].forEach((field) => {
                                const v = unit.cost[field];
                                if (!Number.isFinite(v) || v < 0) {
                                    errors.push(`Unit "${unitId}" cost.${field} must be a finite number >= 0.`);
                                }
                            });
                        }
                        if (!unit.stats || typeof unit.stats !== 'object') {
                            errors.push(`Unit "${unitId}" must have a stats object.`);
                        } else {
                            const requiredStats = ['health', 'attack', 'defense', 'movement', 'range'];
                            requiredStats.forEach(stat => {
                                const v = unit.stats[stat];
                                if (!Number.isFinite(v) || v < 0) {
                                    errors.push(`Unit "${unitId}" stat "${stat}" must be a finite number >= 0.`);
                                }
                            });
                        }
                    }
                }
            }
        }

        // Validate buildings if present — must match core CITY_BUILDING_TREE shape (baseCost + buildTurns)
        if (mod.buildings) {
            if (typeof mod.buildings !== 'object' || Array.isArray(mod.buildings)) {
                errors.push('Buildings section must be an object keyed by building id.');
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
                    // Inner `id` is optional (core CITY_BUILDING_TREE entries don't carry one).
                    // If present, it must match the key — applyMods auto-fills from the key otherwise.
                    if (bld.id !== undefined && bld.id !== bldId) {
                        errors.push(`Building ID mismatch: key "${bldId}" does not match internal building.id "${bld.id}".`);
                    }
                    if (!bld.name || typeof bld.name !== 'string') errors.push(`Building "${bldId}" must have a name.`);
                    if (!Number.isFinite(bld.maxLevel) || bld.maxLevel < 1) {
                        errors.push(`Building "${bldId}" must specify a finite maxLevel >= 1.`);
                    }
                    if (!bld.baseCost || typeof bld.baseCost !== 'object') {
                        errors.push(`Building "${bldId}" must have a baseCost object with numeric gold/manpower/prestige.`);
                    } else {
                        ['gold', 'manpower', 'prestige'].forEach((field) => {
                            const v = bld.baseCost[field];
                            if (!Number.isFinite(v) || v < 0) {
                                errors.push(`Building "${bldId}" baseCost.${field} must be a finite number >= 0.`);
                            }
                        });
                    }
                    if (!Number.isFinite(bld.buildTurns) || bld.buildTurns < 1) {
                        errors.push(`Building "${bldId}" must specify a finite buildTurns >= 1.`);
                    }
                }
            }
        }

        // Validate techs if present — must match core TECHNOLOGY_TREE shape (requires array, cost object)
        if (mod.techs) {
            if (typeof mod.techs !== 'object' || Array.isArray(mod.techs)) {
                errors.push('Techs section must be an object keyed by tech id.');
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
                    // Inner `id` and `tier` are optional (core TECHNOLOGY_TREE entries carry
                    // neither); enforce key match only if `id` is explicitly set.
                    if (tech.id !== undefined && tech.id !== techId) {
                        errors.push(`Technology ID mismatch: key "${techId}" does not match internal tech.id "${tech.id}".`);
                    }
                    if (!tech.name || typeof tech.name !== 'string') errors.push(`Technology "${techId}" must have a name.`);
                    if (tech.tier !== undefined && (!Number.isFinite(tech.tier) || tech.tier < 0)) {
                        errors.push(`Technology "${techId}" tier must be a finite number >= 0 when set.`);
                    }
                    if (!Number.isFinite(tech.researchTurns) || tech.researchTurns < 1) {
                        errors.push(`Technology "${techId}" must specify a finite researchTurns >= 1.`);
                    }
                    if (tech.requires !== undefined && !Array.isArray(tech.requires)) {
                        errors.push(`Technology "${techId}" requires must be an array of tech ids (e.g. ["siegecraft"]).`);
                    }
                    if (!tech.cost || typeof tech.cost !== 'object') {
                        errors.push(`Technology "${techId}" must have a cost object with numeric gold/prestige.`);
                    } else {
                        if (!Number.isFinite(tech.cost.gold) || tech.cost.gold < 0) {
                            errors.push(`Technology "${techId}" cost.gold must be a finite number >= 0.`);
                        }
                        if (tech.cost.prestige !== undefined && (!Number.isFinite(tech.cost.prestige) || tech.cost.prestige < 0)) {
                            errors.push(`Technology "${techId}" cost.prestige must be a finite number >= 0 when set.`);
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
                    if (!evt.id || typeof evt.id !== 'string') {
                        errors.push(`Event at index ${idx} must have an id.`);
                    } else if (isModUnsafeKey(evt.id) || !MOD_ID_REGEX.test(evt.id)) {
                        errors.push(`Event id "${evt.id}" is not a safe identifier (lowercase letters, numbers, hyphens, underscores; not __proto__/prototype/constructor).`);
                    }
                    if (!evt.title || typeof evt.title !== 'string') errors.push(`Event "${evt.id || idx}" must have a title.`);
                    if (!evt.description || typeof evt.description !== 'string') errors.push(`Event "${evt.id || idx}" must have a description.`);
                    if (evt.triggerCondition !== undefined) {
                        if (typeof evt.triggerCondition !== 'string') {
                            errors.push(`Event "${evt.id || idx}" triggerCondition must be a string expression (e.g. "turn >= 5").`);
                        } else if (!MOD_TRIGGER_CONDITION_REGEX.test(evt.triggerCondition)) {
                            errors.push(`Event "${evt.id || idx}" triggerCondition "${evt.triggerCondition}" does not match the supported grammar: variable (turn, gold, manpower, or prestige), then one of the operators >=, <=, >, <, ==, then a non-negative integer (e.g. "turn >= 5").`);
                        }
                    }
                    if (evt.triggerTags !== undefined) {
                        if (!Array.isArray(evt.triggerTags)) {
                            errors.push(`Event "${evt.id || idx}" triggerTags must be an array of strings when provided.`);
                        } else if (evt.triggerTags.some((tag) => typeof tag !== 'string')) {
                            errors.push(`Event "${evt.id || idx}" triggerTags entries must all be strings.`);
                        }
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
        if (this.isCampaignActive()) {
            return { success: false, errors: ['Mods cannot be installed or updated while a campaign is in progress. Return to the Main Menu first.'] };
        }
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
     * Campaigns reference live unit/building/tech templates by id (e.g.
     * combat reads `attackerType.stats.range`), so removing a template while
     * the game screen is active can crash gameplay. Block mod toggle/delete
     * in that case — players must change mods from the Main Menu.
     *
     * Note: `gameState.initialized` stays true after `returnToMainMenu()`
     * (which only swaps screens), so the source of truth here is which
     * screen the UI is currently showing.
     */
    isCampaignActive() {
        if (typeof uiManager !== 'undefined' && uiManager && uiManager.currentScreen) {
            return uiManager.currentScreen === 'game';
        }
        return false;
    }

    /**
     * Toggle a mod's active state. Returns 'ok' on success, 'not_found' if
     * the id is unknown, or 'campaign_active' if a campaign is in progress.
     */
    toggleMod(modId) {
        if (this.isCampaignActive()) return 'campaign_active';
        const mod = this.mods.find(m => m.id === modId);
        if (!mod) return 'not_found';
        mod.enabled = !mod.enabled;
        this.saveToStorage();
        this.applyMods();
        return 'ok';
    }

    /**
     * Delete a mod. Returns 'ok' / 'not_found' / 'campaign_active' similar to toggleMod.
     */
    deleteMod(modId) {
        if (this.isCampaignActive()) return 'campaign_active';
        const initialLen = this.mods.length;
        this.mods = this.mods.filter(m => m.id !== modId);
        if (this.mods.length === initialLen) return 'not_found';
        this.saveToStorage();
        this.applyMods();
        return 'ok';
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

        // Reset recruitment catalog so disabled mod units no longer recruit
        if (this.originalData.recruitmentCatalog && typeof RECRUITMENT_UNIT_CATALOG !== 'undefined') {
            RECRUITMENT_UNIT_CATALOG.length = 0;
            RECRUITMENT_UNIT_CATALOG.push(...this.originalData.recruitmentCatalog);
        }

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
                        if (typeof RECRUITMENT_UNIT_CATALOG !== 'undefined' && !RECRUITMENT_UNIT_CATALOG.includes(unitId)) {
                            RECRUITMENT_UNIT_CATALOG.push(unitId);
                        }
                    }
                }
            }

            // Merge buildings — auto-fill missing inner id from the key so
            // mods that follow the core (id-less) shape still resolve.
            if (mod.buildings) {
                for (const bldId in mod.buildings) {
                    if (isModUnsafeKey(bldId)) continue;
                    const cloned = JSON.parse(JSON.stringify(mod.buildings[bldId]));
                    if (cloned && typeof cloned === 'object' && cloned.id === undefined) {
                        cloned.id = bldId;
                    }
                    CITY_BUILDING_TREE[bldId] = cloned;
                }
            }

            // Merge techs — same auto-fill so id-less mod techs still resolve.
            if (mod.techs) {
                for (const techId in mod.techs) {
                    if (isModUnsafeKey(techId)) continue;
                    const cloned = JSON.parse(JSON.stringify(mod.techs[techId]));
                    if (cloned && typeof cloned === 'object' && cloned.id === undefined) {
                        cloned.id = techId;
                    }
                    TECHNOLOGY_TREE[techId] = cloned;
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
     * Get a list of narrative events defined in enabled mods.
     *
     * Event `id` is namespaced as `mod:<modId>:<eventId>` so it can't collide
     * with core dynamic-narrative template ids (or with events from other
     * mods) in the shared cooldown map. The original id is preserved as
     * `sourceId` for display/debugging.
     */
    getEnabledEvents() {
        const events = [];
        const enabledMods = this.mods.filter(m => m.enabled);
        for (const mod of enabledMods) {
            if (Array.isArray(mod.events)) {
                mod.events.forEach(evt => {
                    if (!evt || typeof evt !== 'object' || !evt.id) return;
                    const safeTriggerTags = Array.isArray(evt.triggerTags)
                        ? evt.triggerTags.filter((tag) => typeof tag === 'string')
                        : [];
                    events.push({
                        ...evt,
                        triggerTags: safeTriggerTags,
                        sourceId: evt.id,
                        id: `mod:${mod.id}:${evt.id}`,
                        modId: mod.id,
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
    const match = conditionStr.match(MOD_TRIGGER_CONDITION_REGEX);
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
