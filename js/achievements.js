/**
 * Achievements System
 * Tracks player accomplishments and awards milestone badges.
 * Achievements persist in localStorage independently of save slots.
 */

// ─── Achievement Definitions ────────────────────────────────────────────────

const ACHIEVEMENT_DEFS = [
    // ── Combat ──────────────────────────────────────────────────────────────
    {
        id: 'first_blood',
        title: 'First Blood',
        description: 'Win your first battle.',
        icon: '⚔️',
        category: 'combat',
        condition: (s) => s.battlesWon >= 1
    },
    {
        id: 'veteran_commander',
        title: 'Veteran Commander',
        description: 'Win 25 battles.',
        icon: '🛡️',
        category: 'combat',
        condition: (s) => s.battlesWon >= 25
    },
    {
        id: 'warlord',
        title: 'Warlord',
        description: 'Win 100 battles.',
        icon: '🗡️',
        category: 'combat',
        condition: (s) => s.battlesWon >= 100
    },
    {
        id: 'greek_fire',
        title: 'Greek Fire',
        description: 'Win a battle using a Greek Fire unit.',
        icon: '🔥',
        category: 'combat',
        condition: (s) => s.greekFireVictories >= 1
    },
    {
        id: 'naval_supremacy',
        title: 'Naval Supremacy',
        description: 'Win 10 naval battles.',
        icon: '⚓',
        category: 'combat',
        condition: (s) => s.navalBattlesWon >= 10
    },

    // ── Expansion ────────────────────────────────────────────────────────────
    {
        id: 'first_conquest',
        title: 'First Conquest',
        description: 'Capture your first city.',
        icon: '🏰',
        category: 'expansion',
        condition: (s) => s.citiesCaptured >= 1
    },
    {
        id: 'empire_builder',
        title: 'Empire Builder',
        description: 'Control 10 cities simultaneously.',
        icon: '🏛️',
        category: 'expansion',
        condition: (s) => s.maxCitiesHeld >= 10
    },
    {
        id: 'reconqueror',
        title: 'Reconqueror',
        description: 'Recapture a city previously lost to enemies.',
        icon: '🔄',
        category: 'expansion',
        condition: (s) => s.citiesRecaptured >= 1
    },
    {
        id: 'silk_road',
        title: 'Silk Road',
        description: 'Control 3 cities in the eastern regions (x > 200).',
        icon: '🐪',
        category: 'expansion',
        condition: (s) => s.easternCitiesHeld >= 3
    },

    // ── Technology ───────────────────────────────────────────────────────────
    {
        id: 'scholar',
        title: 'Scholar',
        description: 'Research your first technology.',
        icon: '📚',
        category: 'technology',
        condition: (s) => s.techResearched >= 1
    },
    {
        id: 'renaissance',
        title: 'Byzantine Renaissance',
        description: 'Research every available technology.',
        icon: '🔬',
        category: 'technology',
        // Threshold derived from the tech tree itself so it stays correct as
        // technologies are added or removed. TECHNOLOGY_TREE is defined in
        // state.js, which loads after this file; the lambda is only invoked
        // at runtime, so the lookup is safe.
        condition: (s) => s.totalTechResearched >= Object.keys(TECHNOLOGY_TREE).length
    },
    {
        id: 'master_engineer',
        title: 'Master Engineer',
        description: 'Build 5 roads.',
        icon: '🛤️',
        category: 'technology',
        condition: (s) => s.roadsBuilt >= 5
    },

    // ── Economy ──────────────────────────────────────────────────────────────
    {
        id: 'merchant_prince',
        title: 'Merchant Prince',
        description: 'Accumulate 10,000 gold.',
        icon: '💰',
        category: 'economy',
        condition: (s) => s.maxGoldHeld >= 10000
    },
    {
        id: 'trade_empire',
        title: 'Trade Empire',
        description: 'Establish 3 active trade routes.',
        icon: '🤝',
        category: 'economy',
        condition: (s) => s.maxTradeRoutes >= 3
    },
    {
        id: 'granary',
        title: 'Granary of the East',
        description: 'Accumulate 500 food stockpile.',
        icon: '🌾',
        category: 'economy',
        condition: (s) => s.maxFoodStockpile >= 500
    },

    // ── Diplomacy ────────────────────────────────────────────────────────────
    {
        id: 'peacemaker',
        title: 'Peacemaker',
        description: 'Establish your first truce.',
        icon: '🕊️',
        category: 'diplomacy',
        condition: (s) => s.trucesEstablished >= 1
    },
    {
        id: 'alliance',
        title: 'Alliance of Nations',
        description: 'Form 2 alliances simultaneously.',
        icon: '🤲',
        category: 'diplomacy',
        condition: (s) => s.maxAlliances >= 2
    },

    // ── Progression ──────────────────────────────────────────────────────────
    {
        id: 'survivor',
        title: 'Survivor',
        description: 'Reach turn 50.',
        icon: '⏳',
        category: 'progression',
        condition: (s) => s.maxTurnReached >= 50
    },
    {
        id: 'century',
        title: 'A Century of Rule',
        description: 'Reach turn 100.',
        icon: '📅',
        category: 'progression',
        condition: (s) => s.maxTurnReached >= 100
    },
    {
        id: 'veteran_unit',
        title: 'Elite Corps',
        description: 'Level up a unit to level 5.',
        icon: '🌟',
        category: 'progression',
        condition: (s) => s.maxUnitLevel >= 5
    },
    {
        id: 'quest_complete',
        title: 'Quest Fulfilled',
        description: 'Complete your first quest.',
        icon: '📜',
        category: 'progression',
        condition: (s) => s.questsCompleted >= 1
    },
    {
        id: 'all_quests',
        title: 'Chronicler',
        description: 'Complete 10 quests.',
        icon: '📖',
        category: 'progression',
        condition: (s) => s.questsCompleted >= 10
    },

    // ── Victory ──────────────────────────────────────────────────────────────
    {
        id: 'glory_of_constantinople',
        title: 'Glory of Constantinople',
        description: 'Win a campaign.',
        icon: '👑',
        category: 'victory',
        condition: (s) => s.campaignsWon >= 1
    }
];

const EMPIRE_START_TECH_IDS = new Set(['military_logistics', 'naval_architecture', 'cavalry_tactics', 'irrigation_systems']);

// ─── AchievementManager ─────────────────────────────────────────────────────

class AchievementManager {
    constructor() {
        this._storageKey = '500ad_achievements';
        // Unlocked achievement ids (persisted globally, not per-save)
        this.unlocked = new Set();
        // Lifetime stats used for condition evaluation; persisted to localStorage
        // alongside `unlocked` and accumulated across sessions/campaigns.
        this.stats = this._defaultStats();
        this._cityLookupById = null;
        this._load();
    }

    _defaultStats() {
        return {
            battlesWon: 0,
            navalBattlesWon: 0,
            greekFireVictories: 0,
            citiesCaptured: 0,
            citiesRecaptured: 0,
            maxCitiesHeld: 0,
            easternCitiesHeld: 0,
            techResearched: 0,
            totalTechResearched: 0,
            roadsBuilt: 0,
            maxGoldHeld: 0,
            maxFoodStockpile: 0,
            maxTradeRoutes: 0,
            trucesEstablished: 0,
            maxAlliances: 0,
            maxTurnReached: 0,
            maxUnitLevel: 0,
            questsCompleted: 0,
            campaignsWon: 0,
            playerHeldCityIds: []
        };
    }

    // ── Persistence ──────────────────────────────────────────────────────────

    _load() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (Array.isArray(data.unlocked)) {
                this.unlocked = new Set(data.unlocked.filter(id => typeof id === 'string'));
            }
            if (data.stats && typeof data.stats === 'object') {
                const loaded = { ...data.stats };
                // Migrate old key name → new key. If both keys are present
                // (partial migration from an earlier session), keep whichever
                // value is larger so we never regress the lifetime peak.
                if ('goldEarned' in loaded) {
                    const prev = Number(loaded.maxGoldHeld) || 0;
                    const old = Number(loaded.goldEarned) || 0;
                    loaded.maxGoldHeld = Math.max(prev, old);
                    delete loaded.goldEarned;
                }
                // Ensure playerHeldCityIds is always an array of strings
                if (!Array.isArray(loaded.playerHeldCityIds)) {
                    loaded.playerHeldCityIds = [];
                } else {
                    loaded.playerHeldCityIds = loaded.playerHeldCityIds.filter(id => typeof id === 'string');
                }
                this.stats = { ...this._defaultStats(), ...loaded };
            }
        } catch (e) {
            console.warn('Achievements: failed to load', e);
        }
    }

    _save() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify({
                unlocked: [...this.unlocked],
                stats: this.stats
            }));
        } catch (e) {
            console.warn('Achievements: failed to save', e);
        }
    }

    // ── Stats update helpers ─────────────────────────────────────────────────

    /**
     * Sync live game-state derived stats and check for new unlocks.
     * Call this after any significant game event.
     */
    syncFromGameState() {
        if (typeof gameState === 'undefined' || !gameState.initialized) return;

        const gs = gameState;
        const playerTerritories = Array.isArray(gs.player?.territories) ? gs.player.territories : [];

        // Turn
        this.stats.maxTurnReached = Math.max(this.stats.maxTurnReached, gs.turn || 0);

        // Technologies
        const techIds = Array.isArray(gs.player?.techResearched) ? gs.player.techResearched : [];
        const techCount = techIds.length;

        // Total techs ever held (including free start techs) — used for Byzantine Renaissance
        this.stats.totalTechResearched = Math.max(this.stats.totalTechResearched, techCount);

        // Player-actively-researched techs (excluding free scenario start techs) — used for Scholar
        const freeTechCount = gs.selectedScenario === 'managing_empire'
            ? techIds.filter(id => EMPIRE_START_TECH_IDS.has(id)).length
            : 0;
        this.stats.techResearched = Math.max(this.stats.techResearched, Math.max(0, techCount - freeTechCount));

        // Peak gold ever held (NOT cumulative earnings — condition checks this snapshot)
        const currentGold = gs.player?.resources?.gold || 0;
        this.stats.maxGoldHeld = Math.max(this.stats.maxGoldHeld, currentGold);

        // Food stockpile
        const currentFood = gs.player?.resources?.food || 0;
        this.stats.maxFoodStockpile = Math.max(this.stats.maxFoodStockpile, currentFood);

        // Cities held
        const cityCount = gs.player?.territories?.length || 0;
        this.stats.maxCitiesHeld = Math.max(this.stats.maxCitiesHeld, cityCount);

        // Eastern cities (x > 200 on the 320-wide map)
        // Founded city IDs use format 'founded_${x}_${y}_${turn}' — parse x when lookup misses
        const cityLookup = this._getCityLookupById();
        const easternCount = playerTerritories.reduce((count, cityId) => {
            const city = cityLookup.get(cityId);
            if (city) {
                return count + (typeof city.x === 'number' && city.x > 200 ? 1 : 0);
            }
            if (String(cityId).startsWith('founded_')) {
                const x = Number(String(cityId).split('_')[1]);
                return count + (Number.isFinite(x) && x > 200 ? 1 : 0);
            }
            return count;
        }, 0);
        this.stats.easternCitiesHeld = Math.max(this.stats.easternCitiesHeld, easternCount);

        // Accumulate city IDs ever held by the player (for recapture detection across save/load)
        for (const cityId of playerTerritories) {
            if (!this.stats.playerHeldCityIds.includes(cityId)) {
                this.stats.playerHeldCityIds.push(cityId);
            }
        }

        // Unit max level
        const maxLevel = (gs.units || [])
            .filter(u => u.owner === 'player')
            .reduce((m, u) => Math.max(m, u.level || 1), 0);
        this.stats.maxUnitLevel = Math.max(this.stats.maxUnitLevel, maxLevel);

        // Trade routes
        const tradeRoutes = gs.diplomacyState?.tradeRoutes?.filter(r => r.active)?.length || 0;
        this.stats.maxTradeRoutes = Math.max(this.stats.maxTradeRoutes, tradeRoutes);

        // Alliances
        const alliances = Object.values(gs.diplomacyState?.factions || {})
            .filter(f => f.status === 'alliance').length;
        this.stats.maxAlliances = Math.max(this.stats.maxAlliances, alliances);

        // Quests completed — history entries use status:'resolved'|'expired', not boolean flags
        const questsDone = (gs.dynamicNarrativeState?.history || [])
            .filter(e => e.status === 'resolved').length;
        this.stats.questsCompleted = Math.max(this.stats.questsCompleted, questsDone);

        this._checkAll();
        this._save();
    }

    /** Record a battle win. Pass the winning unit for type-specific checks. */
    recordBattleWon(winnerUnit = null) {
        this.stats.battlesWon++;
        if (winnerUnit?.type === 'naval') this.stats.navalBattlesWon++;
        if (winnerUnit?.bonuses?.greekFire || (winnerUnit?.typeId && String(winnerUnit.typeId).includes('greekfire'))) {
            this.stats.greekFireVictories++;
        }
        this._checkAll();
        this._save();
    }

    /** Record a city capture. Pass the tile for recapture detection. */
    recordCityCapture(tile = null, oldOwner = null) {
        this.stats.citiesCaptured++;
        const cityId = tile?.cityData?.id || null;
        if (cityId && this.stats.playerHeldCityIds.includes(cityId)) {
            this.stats.citiesRecaptured++;
        }
        if (cityId && !this.stats.playerHeldCityIds.includes(cityId)) {
            this.stats.playerHeldCityIds.push(cityId);
        }
        this._checkAll();
        this._save();
    }

    /** Record a city joining peacefully (not a conquest — no citiesCaptured increment). */
    recordCityJoined(tile = null) {
        const cityId = tile?.cityData?.id || null;
        if (cityId && !this.stats.playerHeldCityIds.includes(cityId)) {
            this.stats.playerHeldCityIds.push(cityId);
            this._save();
        }
    }

    /** Update peak gold and food peaks immediately on resource gain. */
    syncResourcePeak() {
        if (typeof gameState === 'undefined' || !gameState.initialized) return;
        const resources = gameState.player?.resources || {};
        let changed = false;
        const gold = Number(resources.gold) || 0;
        const food = Number(resources.food) || 0;
        if (gold > this.stats.maxGoldHeld) { this.stats.maxGoldHeld = gold; changed = true; }
        if (food > this.stats.maxFoodStockpile) { this.stats.maxFoodStockpile = food; changed = true; }
        if (changed) { this._checkAll(); this._save(); }
    }

    /** Record the highest level reached by a player unit immediately after level-up. */
    recordUnitLevel(unitOrLevel) {
        const level = typeof unitOrLevel === 'number'
            ? unitOrLevel
            : Number(unitOrLevel?.level || 0);
        if (!Number.isFinite(level) || level <= this.stats.maxUnitLevel) return;
        this.stats.maxUnitLevel = level;
        this._checkAll();
        this._save();
    }

    /** Reset per-campaign transient state. Call at the start of each new campaign. */
    resetForNewCampaign(startingTerritories = []) {
        this.stats.playerHeldCityIds = Array.isArray(startingTerritories)
            ? startingTerritories.filter((cityId) => typeof cityId === 'string')
            : [];
        this._save();
    }

    /** Record a road built. */
    recordRoadBuilt() {
        this.stats.roadsBuilt++;
        this._checkAll();
        this._save();
    }

    /** Record a truce established. */
    recordTruceEstablished() {
        this.stats.trucesEstablished++;
        this._checkAll();
        this._save();
    }

    /** Record a campaign win. */
    recordCampaignWon() {
        this.stats.campaignsWon++;
        this._checkAll();
        this._save();
    }

    // ── Unlock logic ─────────────────────────────────────────────────────────

    _checkAll() {
        for (const def of ACHIEVEMENT_DEFS) {
            if (this.unlocked.has(def.id)) continue;
            try {
                if (def.condition(this.stats)) {
                    this._unlock(def);
                }
            } catch (e) {
                // Silently skip bad condition
            }
        }
    }

    _unlock(def) {
        if (this.unlocked.has(def.id)) return;
        this.unlocked.add(def.id);
        console.log(`Achievement unlocked: ${def.title}`);
        this._showToast(def);
    }

    _showToast(def) {
        if (typeof uiManager === 'undefined') return;
        // Use existing notification system with a special achievement type
        const msg = `🏆 Achievement: ${def.icon} ${def.title}`;
        uiManager.showNotification(msg, 'achievement');
    }

    // ── Queries ──────────────────────────────────────────────────────────────

    getAll() {
        return ACHIEVEMENT_DEFS.map(def => ({
            ...def,
            unlocked: this.unlocked.has(def.id)
        }));
    }

    getUnlockedCount() {
        return this.unlocked.size;
    }

    getTotalCount() {
        return ACHIEVEMENT_DEFS.length;
    }

    /** Group achievements by category for the panel. */
    getByCategory() {
        const categories = {};
        for (const def of ACHIEVEMENT_DEFS) {
            if (!categories[def.category]) categories[def.category] = [];
            categories[def.category].push({
                ...def,
                unlocked: this.unlocked.has(def.id)
            });
        }
        return categories;
    }

    _getCityLookupById() {
        if (this._cityLookupById instanceof Map) {
            return this._cityLookupById;
        }
        const lookup = new Map();
        if (typeof HISTORIC_TOWNS !== 'undefined' && Array.isArray(HISTORIC_TOWNS)) {
            HISTORIC_TOWNS.forEach((town) => {
                if (town?.id) {
                    lookup.set(town.id, town);
                }
            });
        }
        this._cityLookupById = lookup;
        return lookup;
    }
}

// Global singleton
const achievementManager = new AchievementManager();
window.achievementManager = achievementManager;
