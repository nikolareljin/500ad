/**
 * Byzantine Military Units
 * Historically accurate units from 6th-15th century
 */

const UNIT_TYPES = {
    // Infantry Units
    infantry: {
        skutatoi: {
            id: 'skutatoi',
            name: 'Skutatoi',
            type: 'infantry',
            category: 'heavy',
            description: 'Heavy infantry armed with large shields and spears',
            era: ['early', 'middle'],
            cost: {
                gold: 80,
                manpower: 50
            },
            upkeep: 5,
            stats: {
                health: 100,
                attack: 12,
                defense: 18,
                movement: 2,
                range: 1
            },
            bonuses: {
                vsInfantry: 1.2,
                vsCavalry: 0.8
            },
            icon: 'skutatoi.png'
        },

        psilos: {
            id: 'psilos',
            name: 'Psilos',
            type: 'infantry',
            category: 'light',
            description: 'Light skirmishers with javelins and slings',
            era: ['early', 'middle'],
            cost: {
                gold: 40,
                manpower: 30
            },
            upkeep: 2,
            stats: {
                health: 60,
                attack: 8,
                defense: 6,
                movement: 3,
                range: 2
            },
            bonuses: {
                vsInfantry: 1.1,
                terrain: 1.3
            },
            icon: 'psilos.png'
        },

        archers: {
            id: 'archers',
            name: 'Byzantine Archers',
            type: 'infantry',
            category: 'ranged',
            description: 'Skilled archers with powerful composite bows',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 60,
                manpower: 40
            },
            upkeep: 3,
            stats: {
                health: 70,
                attack: 14,
                defense: 8,
                movement: 2,
                range: 3
            },
            bonuses: {
                vsInfantry: 1.3,
                vsCavalry: 1.1
            },
            icon: 'archers.png'
        },

        varangian: {
            id: 'varangian',
            name: 'Varangian Guard',
            type: 'infantry',
            category: 'elite',
            description: 'Elite Norse axe-wielding mercenaries, personal guard of the emperor',
            era: ['middle', 'late'],
            cost: {
                gold: 150,
                manpower: 80
            },
            upkeep: 10,
            stats: {
                health: 140,
                attack: 22,
                defense: 20,
                movement: 2,
                range: 1
            },
            bonuses: {
                vsInfantry: 1.4,
                vsCavalry: 1.2,
                morale: 2.0
            },
            icon: 'varangian.png'
        },

        mountain_infantry: {
            id: 'mountain_infantry',
            name: 'Mountain Infantry',
            type: 'infantry',
            category: 'mountain',
            description: 'Rugged troops trained for rough terrain and passes',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 90,
                manpower: 55
            },
            upkeep: 6,
            stats: {
                health: 95,
                attack: 14,
                defense: 16,
                movement: 3,
                range: 1
            },
            bonuses: {
                terrain: 1.5,
                vsInfantry: 1.1
            },
            icon: 'mountain_infantry.png'
        }
    },

    // Cavalry Units
    cavalry: {
        cataphract: {
            id: 'cataphract',
            name: 'Cataphract',
            type: 'cavalry',
            category: 'heavy',
            description: 'Super-heavy armored cavalry, the elite of Byzantine forces',
            era: ['early', 'middle'],
            cost: {
                gold: 200,
                manpower: 100
            },
            upkeep: 15,
            stats: {
                health: 150,
                attack: 28,
                defense: 24,
                movement: 4,
                range: 1
            },
            bonuses: {
                vsInfantry: 1.5,
                vsCavalry: 1.3,
                charge: 2.0
            },
            icon: 'cataphract.png'
        },

        klibanophoroi: {
            id: 'klibanophoroi',
            name: 'Klibanophoroi',
            type: 'cavalry',
            category: 'superheavy',
            description: 'Ultra-heavy cavalry with full armor for rider and horse',
            era: ['middle'],
            cost: {
                gold: 250,
                manpower: 120
            },
            upkeep: 20,
            stats: {
                health: 180,
                attack: 32,
                defense: 28,
                movement: 3,
                range: 1
            },
            bonuses: {
                vsInfantry: 1.7,
                vsCavalry: 1.4,
                charge: 2.5,
                arrowResist: 0.5
            },
            icon: 'klibanophoroi.png'
        },

        kavallarioi: {
            id: 'kavallarioi',
            name: 'Kavallarioi',
            type: 'cavalry',
            category: 'medium',
            description: 'Medium cavalry, backbone of Byzantine armies',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 100,
                manpower: 60
            },
            upkeep: 8,
            stats: {
                health: 100,
                attack: 18,
                defense: 14,
                movement: 5,
                range: 1
            },
            bonuses: {
                vsInfantry: 1.3,
                vsCavalry: 1.0
            },
            icon: 'kavallarioi.png'
        },

        horsearchers: {
            id: 'horsearchers',
            name: 'Horse Archers',
            type: 'cavalry',
            category: 'light',
            description: 'Light cavalry with composite bows, masters of hit-and-run',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 120,
                manpower: 70
            },
            upkeep: 9,
            stats: {
                health: 80,
                attack: 16,
                defense: 10,
                movement: 6,
                range: 3
            },
            bonuses: {
                vsInfantry: 1.4,
                vsCavalry: 0.9,
                mobility: 1.5
            },
            icon: 'horsearchers.png'
        },

        tagmata: {
            id: 'tagmata',
            name: 'Tagmata Cavalry',
            type: 'cavalry',
            category: 'elite',
            description: 'Elite professional cavalry regiments, the emperor\'s finest',
            era: ['middle', 'late'],
            cost: {
                gold: 180,
                manpower: 90
            },
            upkeep: 12,
            stats: {
                health: 130,
                attack: 24,
                defense: 20,
                movement: 5,
                range: 1
            },
            bonuses: {
                vsInfantry: 1.4,
                vsCavalry: 1.3,
                morale: 1.5
            },
            icon: 'tagmata.png'
        },

        camel_riders: {
            id: 'camel_riders',
            name: 'Camel Riders',
            type: 'cavalry',
            category: 'desert',
            description: 'Fast desert cavalry resilient to arid conditions',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 130,
                manpower: 65
            },
            upkeep: 9,
            stats: {
                health: 95,
                attack: 17,
                defense: 12,
                movement: 5,
                range: 1
            },
            bonuses: {
                mobility: 1.35,
                vsCavalry: 1.15
            },
            icon: 'camel_riders.png'
        },

        war_elephants: {
            id: 'war_elephants',
            name: 'War Elephants',
            type: 'cavalry',
            category: 'shock',
            description: 'Massive shock troops with devastating first impact',
            era: ['early', 'middle'],
            cost: {
                gold: 260,
                manpower: 120
            },
            upkeep: 18,
            stats: {
                health: 190,
                attack: 30,
                defense: 20,
                movement: 3,
                range: 1
            },
            bonuses: {
                charge: 2.2,
                vsInfantry: 1.6
            },
            icon: 'war_elephants.png'
        }
    },

    // Special Units
    special: {
        greekfire: {
            id: 'greekfire',
            name: 'Greek Fire Siphon',
            type: 'special',
            category: 'siege',
            description: 'Devastating incendiary weapon, Byzantine secret weapon',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 300,
                manpower: 150
            },
            upkeep: 25,
            stats: {
                health: 60,
                attack: 40,
                defense: 6,
                movement: 1,
                range: 2
            },
            bonuses: {
                vsBuildings: 2.0,
                vsShips: 3.0,
                areaEffect: true
            },
            icon: 'greekfire.png'
        },

        engineers: {
            id: 'engineers',
            name: 'Siege Engineers',
            type: 'special',
            category: 'siege',
            description: 'Expert engineers operating siege equipment',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 150,
                manpower: 80
            },
            upkeep: 10,
            stats: {
                health: 50,
                attack: 30,
                defense: 8,
                movement: 1,
                range: 4
            },
            bonuses: {
                vsBuildings: 2.5,
                vsFortifications: 3.0
            },
            icon: 'engineers.png'
        },

        mangonel: {
            id: 'mangonel',
            name: 'Mangonel Battery',
            type: 'special',
            category: 'siege',
            description: 'Counterweight artillery for sieges and field bombardment',
            era: ['middle', 'late'],
            cost: {
                gold: 220,
                manpower: 100
            },
            upkeep: 14,
            stats: {
                health: 70,
                attack: 34,
                defense: 8,
                movement: 1,
                range: 4
            },
            bonuses: {
                vsBuildings: 2.6,
                areaEffect: true
            },
            icon: 'mangonel.png'
        },

        priests: {
            id: 'priests',
            name: 'Orthodox Priests',
            type: 'special',
            category: 'support',
            description: 'Religious leaders providing morale and healing',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 100,
                manpower: 40
            },
            upkeep: 5,
            stats: {
                health: 40,
                attack: 0,
                defense: 4,
                movement: 2,
                range: 2
            },
            bonuses: {
                moraleBoost: 1.5,
                healingRate: 10
            },
            icon: 'priests.png'
        },

        caravan: {
            id: 'caravan',
            name: 'Caravan',
            type: 'special',
            category: 'economic',
            description: 'Trade convoy that boosts city income when stationed nearby',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 95,
                manpower: 30
            },
            upkeep: 2,
            stats: {
                health: 45,
                attack: 2,
                defense: 4,
                movement: 3,
                range: 1
            },
            bonuses: {
                tradeBoost: 1.3
            },
            icon: 'caravan.png'
        },

        explorer: {
            id: 'explorer',
            name: 'Explorer',
            type: 'special',
            category: 'scout',
            description: 'Long-range reconnaissance specialist',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 70,
                manpower: 25
            },
            upkeep: 2,
            stats: {
                health: 40,
                attack: 6,
                defense: 5,
                movement: 6,
                range: 1
            },
            bonuses: {
                mobility: 1.6,
                vision: 2
            },
            icon: 'explorer.png'
        },

        spy: {
            id: 'spy',
            name: 'Spy',
            type: 'special',
            category: 'intel',
            description: 'Covert intelligence operative with ambush potential',
            era: ['middle', 'late'],
            cost: {
                gold: 120,
                manpower: 20
            },
            upkeep: 3,
            stats: {
                health: 35,
                attack: 10,
                defense: 5,
                movement: 5,
                range: 1
            },
            bonuses: {
                ambush: 1.8
            },
            icon: 'spy.png'
        },

        transport: {
            id: 'transport',
            name: 'River Transport',
            type: 'special',
            category: 'transport',
            description: 'Support vessel for moving men and supplies across water',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 110,
                manpower: 45
            },
            upkeep: 4,
            stats: {
                health: 75,
                attack: 8,
                defense: 8,
                movement: 5,
                range: 1
            },
            bonuses: {
                waterTraversal: true
            },
            icon: 'transport.png'
        }
    },

    naval: {
        dromon: {
            id: 'dromon',
            name: 'Dromon',
            type: 'naval',
            category: 'warship',
            description: 'Byzantine war galley armed for naval combat',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 210,
                manpower: 85
            },
            upkeep: 12,
            stats: {
                health: 130,
                attack: 24,
                defense: 16,
                movement: 6,
                range: 2
            },
            bonuses: {
                vsShips: 1.6,
                waterTraversal: true
            },
            icon: 'dromon.png'
        }
    }
};

/**
 * Get all units available for a specific era
 */
function getUnitsByEra(era) {
    const units = [];

    for (const category in UNIT_TYPES) {
        for (const unitId in UNIT_TYPES[category]) {
            const unit = UNIT_TYPES[category][unitId];
            if (unit.era.includes(era)) {
                units.push(unit);
            }
        }
    }

    return units;
}

/**
 * Get a specific unit by ID
 */
function getUnitById(id) {
    for (const category in UNIT_TYPES) {
        if (UNIT_TYPES[category][id]) {
            return UNIT_TYPES[category][id];
        }
    }
    return null;
}

/**
 * Get all units of a specific type (infantry, cavalry, special)
 */
function getUnitsByType(type) {
    return UNIT_TYPES[type] ? Object.values(UNIT_TYPES[type]) : [];
}

/**
 * Calculate unit combat effectiveness
 */
function calculateCombatPower(unit, target, terrain = 'plains') {
    let power = unit.stats.attack;

    // Apply bonuses based on target type
    if (target.type === 'infantry' && unit.bonuses.vsInfantry) {
        power *= unit.bonuses.vsInfantry;
    } else if (target.type === 'cavalry' && unit.bonuses.vsCavalry) {
        power *= unit.bonuses.vsCavalry;
    }

    // Apply terrain bonuses
    if (unit.bonuses.terrain && terrain !== 'plains') {
        power *= unit.bonuses.terrain;
    }

    // Apply charge bonus for cavalry
    if (unit.type === 'cavalry' && unit.bonuses.charge) {
        power *= unit.bonuses.charge;
    }

    return Math.floor(power);
}

/**
 * Create a unit instance
 */
function createUnit(unitTypeId, position, owner) {
    const unitType = getUnitById(unitTypeId);
    if (!unitType) return null;

    return {
        id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        typeId: unitTypeId,
        name: unitType.name,
        type: unitType.type,
        category: unitType.category,
        owner: owner,
        position: position,
        stats: { ...unitType.stats },
        currentHealth: unitType.stats.health,
        currentMovement: unitType.stats.movement,
        experience: 0,
        level: 1,
        morale: 100,
        bonuses: { ...unitType.bonuses }
    };
}
