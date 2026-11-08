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
            icon: 'skutatoi.png',
            symbol: '🛡️'
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
            icon: 'psilos.png',
            symbol: '🎯'
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
            icon: 'archers.png',
            symbol: '🏹'
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
            icon: 'varangian.png',
            symbol: '🪓'
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
            icon: 'mountain_infantry.png',
            symbol: '🏔️'
        },

        limitanei: {
            id: 'limitanei',
            name: 'Limitanei',
            type: 'infantry',
            category: 'garrison',
            description: 'Frontier garrison troops defending forts and settlements',
            era: ['early', 'middle'],
            cost: { gold: 50, manpower: 40 },
            upkeep: 3,
            stats: { health: 90, attack: 9, defense: 15, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.1, homeDefense: 1.35 },
            icon: 'byzantine_unit_skutatoi_circle.png',
            symbol: '🏰'
        },

        gothic_infantry: {
            id: 'gothic_infantry',
            name: 'Gothic Infantry',
            type: 'infantry',
            category: 'heavy',
            description: 'Ostrogothic heavy line infantry armed with spatha and sturdy shield',
            era: ['early'],
            cost: { gold: 80, manpower: 50 },
            upkeep: 5,
            stats: { health: 100, attack: 12, defense: 18, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.2, vsCavalry: 0.9 },
            icon: 'ostrogoth_unit_infantry_circle.png',
            symbol: '🛡️'
        },

        gothic_royal_guard: {
            id: 'gothic_royal_guard',
            name: 'Gothic Royal Guard',
            type: 'infantry',
            category: 'elite',
            description: 'Household noble bodyguard of the Ostrogothic king with ornate gear',
            era: ['early'],
            cost: { gold: 170, manpower: 40 },
            upkeep: 12,
            stats: { health: 125, attack: 20, defense: 20, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.2, morale: 1.8 },
            icon: 'ostrogoth_unit_infantry_circle.png',
            symbol: '⚔️'
        },

        gothic_bowmen: {
            id: 'gothic_bowmen',
            name: 'Gothic Bowmen',
            type: 'infantry',
            category: 'ranged',
            description: 'Skilled Gothic missile infantry with longbows and sidearms',
            era: ['early'],
            cost: { gold: 60, manpower: 35 },
            upkeep: 3,
            stats: { health: 60, attack: 10, defense: 6, movement: 2, range: 3 },
            bonuses: { vsInfantry: 1.25, vsCavalry: 1.05 },
            icon: 'ostrogoth_unit_infantry_circle.png',
            symbol: '🏹'
        },

        frankish_axemen: {
            id: 'frankish_axemen',
            name: 'Frankish Axemen',
            type: 'infantry',
            category: 'shock',
            description: 'Fierce warriors wielding the deadly francisca throwing axe',
            era: ['early', 'middle'],
            cost: { gold: 75, manpower: 45 },
            upkeep: 5,
            stats: { health: 90, attack: 16, defense: 10, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.3, shockCharge: 1.25 },
            icon: 'frank_unit_axemen_circle.png',
            symbol: '🪓'
        },

        frankish_spearmen: {
            id: 'frankish_spearmen',
            name: 'Shieldwall Spearmen',
            type: 'infantry',
            category: 'heavy',
            description: 'Solid Frankish defensive spear formation',
            era: ['early', 'middle'],
            cost: { gold: 80, manpower: 50 },
            upkeep: 5,
            stats: { health: 100, attack: 12, defense: 18, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.15, vsCavalry: 1.2 },
            icon: 'frank_unit_axemen_circle.png',
            symbol: '🛡️'
        },

        frankish_skirmishers: {
            id: 'frankish_skirmishers',
            name: 'Frankish Skirmishers',
            type: 'infantry',
            category: 'light',
            description: 'Light skirmishers armed with javelins and hunting knives',
            era: ['early'],
            cost: { gold: 40, manpower: 30 },
            upkeep: 2,
            stats: { health: 60, attack: 8, defense: 6, movement: 3, range: 2 },
            bonuses: { terrain: 1.3, vsInfantry: 1.1 },
            icon: 'frank_unit_axemen_circle.png',
            symbol: '🎯'
        },

        saxon_household: {
            id: 'saxon_household',
            name: 'Saxon Household Warriors',
            type: 'infantry',
            category: 'elite',
            description: 'Retainers of the Saxon chieftain with mail and broad shield',
            era: ['early', 'middle'],
            cost: { gold: 170, manpower: 40 },
            upkeep: 12,
            stats: { health: 125, attack: 20, defense: 20, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.15, morale: 1.7 },
            icon: 'anglo_saxon_unit_household_circle.png',
            symbol: '⚔️'
        },

        seax_fighter: {
            id: 'seax_fighter',
            name: 'Seax Fighter',
            type: 'infantry',
            category: 'shock',
            description: 'Aggressive close-quarters raiders armed with the long seax knife and axe',
            era: ['early'],
            cost: { gold: 75, manpower: 45 },
            upkeep: 5,
            stats: { health: 90, attack: 16, defense: 10, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.25, shockCharge: 1.2 },
            icon: 'anglo_saxon_unit_household_circle.png',
            symbol: '🗡️'
        },

        saxon_javelin: {
            id: 'saxon_javelin',
            name: 'Saxon Javelin Skirmisher',
            type: 'infantry',
            category: 'light',
            description: 'Fast woodland skirmishers with javelins and slings',
            era: ['early'],
            cost: { gold: 40, manpower: 30 },
            upkeep: 2,
            stats: { health: 60, attack: 8, defense: 6, movement: 3, range: 2 },
            bonuses: { terrain: 1.3, vsInfantry: 1.1 },
            icon: 'anglo_saxon_unit_household_circle.png',
            symbol: '🎯'
        },

        syrian_archer: {
            id: 'syrian_archer',
            name: 'Syrian Archer',
            type: 'infantry',
            category: 'ranged',
            description: 'Famed Levantine archers renowned throughout the Roman world',
            era: ['early', 'middle'],
            cost: { gold: 60, manpower: 35 },
            upkeep: 3,
            stats: { health: 60, attack: 10, defense: 6, movement: 2, range: 3 },
            bonuses: { vsInfantry: 1.3, vsCavalry: 1.1 },
            icon: 'byzantine_unit_skutatoi_circle.png',
            symbol: '🏹'
        },

        hillman_skirmisher: {
            id: 'hillman_skirmisher',
            name: 'Hillman Skirmisher',
            type: 'infantry',
            category: 'light',
            description: 'Rugged Isaurian and Syrian hill skirmishers',
            era: ['early'],
            cost: { gold: 40, manpower: 30 },
            upkeep: 2,
            stats: { health: 60, attack: 8, defense: 6, movement: 3, range: 2 },
            bonuses: { terrain: 1.45, vsInfantry: 1.1 },
            icon: 'psilos.png',
            symbol: '🎯'
        },

        egyptian_bow_infantry: {
            id: 'egyptian_bow_infantry',
            name: 'Egyptian Bow Infantry',
            type: 'infantry',
            category: 'ranged',
            description: 'Disciplined Nile archers with composite bows and cloth armor',
            era: ['early'],
            cost: { gold: 60, manpower: 35 },
            upkeep: 3,
            stats: { health: 60, attack: 10, defense: 6, movement: 2, range: 3 },
            bonuses: { vsInfantry: 1.25, vsCavalry: 1.1 },
            icon: 'archers.png',
            symbol: '🏹'
        },

        egyptian_guard: {
            id: 'egyptian_guard',
            name: 'Late Roman Guard',
            type: 'infantry',
            category: 'garrison',
            description: 'Veterans of the Dux Thebaidos guarding key river ports',
            era: ['early'],
            cost: { gold: 50, manpower: 40 },
            upkeep: 3,
            stats: { health: 90, attack: 9, defense: 15, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.1, homeDefense: 1.35 },
            icon: 'byzantine_unit_skutatoi_circle.png',
            symbol: '🏰'
        },

        axumite_spearmen: {
            id: 'axumite_spearmen',
            name: 'Axumite Spearmen',
            type: 'infantry',
            category: 'heavy',
            description: 'Axumite infantry with tall hide shields and iron spears',
            era: ['early', 'middle'],
            cost: { gold: 80, manpower: 50 },
            upkeep: 5,
            stats: { health: 100, attack: 12, defense: 18, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.2, vsCavalry: 1.1 },
            icon: 'axum_unit_spearmen_circle.png',
            symbol: '🛡️'
        },

        ethiopian_archers: {
            id: 'ethiopian_archers',
            name: 'Ethiopian Archers',
            type: 'infantry',
            category: 'ranged',
            description: 'Expert highland marksmen armed with long recurve bows',
            era: ['early', 'middle'],
            cost: { gold: 60, manpower: 35 },
            upkeep: 3,
            stats: { health: 60, attack: 10, defense: 6, movement: 2, range: 3 },
            bonuses: { vsInfantry: 1.3, vsCavalry: 1.1 },
            icon: 'axum_unit_spearmen_circle.png',
            symbol: '🏹'
        },

        axumite_guard: {
            id: 'axumite_guard',
            name: 'Royal Infantry Guard',
            type: 'infantry',
            category: 'elite',
            description: 'Noble champions guarding the Negusa Nagast of Aksum',
            era: ['early'],
            cost: { gold: 170, manpower: 40 },
            upkeep: 12,
            stats: { health: 125, attack: 20, defense: 20, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.2, morale: 1.8 },
            icon: 'axum_unit_spearmen_circle.png',
            symbol: '⚔️'
        },

        slav_skirmisher: {
            id: 'slav_skirmisher',
            name: 'Slavic Light Skirmisher',
            type: 'infantry',
            category: 'light',
            description: 'Agile woodland skirmishers fighting with javelins and small shields',
            era: ['early', 'middle'],
            cost: { gold: 40, manpower: 30 },
            upkeep: 2,
            stats: { health: 60, attack: 8, defense: 6, movement: 3, range: 2 },
            bonuses: { terrain: 1.4, vsInfantry: 1.1 },
            icon: 'slav_unit_axe_circle.png',
            symbol: '🎯'
        },

        slav_axe_infantry: {
            id: 'slav_axe_infantry',
            name: 'Slavic Axe Infantry',
            type: 'infantry',
            category: 'shock',
            description: 'Resolute Slavic warriors wielding single-bladed battle axes',
            era: ['early', 'middle'],
            cost: { gold: 75, manpower: 45 },
            upkeep: 5,
            stats: { health: 90, attack: 16, defense: 10, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.3, shockCharge: 1.2 },
            icon: 'slav_unit_axe_circle.png',
            symbol: '🪓'
        },

        slav_archer: {
            id: 'slav_archer',
            name: 'Woodland Archer',
            type: 'infantry',
            category: 'ranged',
            description: 'Slavic forest hunters deadly in ambushes and rough country',
            era: ['early', 'middle'],
            cost: { gold: 60, manpower: 35 },
            upkeep: 3,
            stats: { health: 60, attack: 10, defense: 6, movement: 2, range: 3 },
            bonuses: { terrain: 1.35, vsInfantry: 1.2 },
            icon: 'slav_unit_axe_circle.png',
            symbol: '🏹'
        },

        italo_roman_infantry: {
            id: 'italo_roman_infantry',
            name: 'Italo-Roman Infantry',
            type: 'infantry',
            category: 'heavy',
            description: 'Sub-Roman Italian city militia fighting with spatha, spear, and oval shield',
            era: ['early'],
            cost: { gold: 80, manpower: 50 },
            upkeep: 5,
            stats: { health: 100, attack: 12, defense: 18, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.2, vsCavalry: 1.1 },
            icon: 'latin_unit_infantry_circle.png',
            symbol: '🛡️'
        },

        chinese_crossbow: {
            id: 'chinese_crossbow',
            name: 'Crossbow Infantry',
            type: 'infantry',
            category: 'ranged',
            description: 'Precision mechanical crossbowmen with heavy armor-piercing bolts',
            era: ['early', 'middle', 'late'],
            cost: { gold: 60, manpower: 35 },
            upkeep: 3,
            stats: { health: 60, attack: 10, defense: 6, movement: 2, range: 3 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.2 },
            icon: 'china_unit_crossbow_circle.png',
            symbol: '🏹'
        },

        chinese_polearm: {
            id: 'chinese_polearm',
            name: 'Polearm Infantry',
            type: 'infantry',
            category: 'heavy',
            description: 'Disciplined lines with ji halberds and lacquered shields',
            era: ['early', 'middle', 'late'],
            cost: { gold: 80, manpower: 50 },
            upkeep: 5,
            stats: { health: 100, attack: 12, defense: 18, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.2, vsCavalry: 1.3 },
            icon: 'china_unit_crossbow_circle.png',
            symbol: '🛡️'
        },

        chinese_guard: {
            id: 'chinese_guard',
            name: "General's Guard",
            type: 'infantry',
            category: 'elite',
            description: 'Imperial bodyguard armed with Dao sabres and ornate lamellar',
            era: ['early', 'middle', 'late'],
            cost: { gold: 170, manpower: 40 },
            upkeep: 12,
            stats: { health: 125, attack: 20, defense: 20, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.25, morale: 1.8 },
            icon: 'china_unit_crossbow_circle.png',
            symbol: '⚔️'
        },

        arab_skirmisher: {
            id: 'arab_skirmisher',
            name: 'Desert Skirmisher',
            type: 'infantry',
            category: 'light',
            description: 'Nimble desert warriors throwing javelins before closing with swords',
            era: ['early', 'middle'],
            cost: { gold: 40, manpower: 30 },
            upkeep: 2,
            stats: { health: 60, attack: 8, defense: 6, movement: 3, range: 2 },
            bonuses: { terrain: 1.35, vsInfantry: 1.1 },
            icon: 'arab_unit_camel_riders_circle.png',
            symbol: '🎯'
        },

        arab_tribal_elite: {
            id: 'arab_tribal_elite',
            name: 'Tribal Elite Guard',
            type: 'infantry',
            category: 'elite',
            description: 'Noble Ghassanid and Lakhmid champions with mail and fine steel swords',
            era: ['early', 'middle'],
            cost: { gold: 170, manpower: 40 },
            upkeep: 12,
            stats: { health: 125, attack: 20, defense: 20, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.2, morale: 1.8 },
            icon: 'arab_unit_camel_riders_circle.png',
            symbol: '⚔️'
        },

        nubian_archer: {
            id: 'nubian_archer',
            name: 'Nubian Archer',
            type: 'infantry',
            category: 'ranged',
            description: 'Famous "pupil-smiter" archers renowned for devastating accuracy',
            era: ['early', 'middle'],
            cost: { gold: 60, manpower: 35 },
            upkeep: 3,
            stats: { health: 60, attack: 10, defense: 6, movement: 2, range: 3 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.15 },
            icon: 'nubia_unit_archer_circle.png',
            symbol: '🏹'
        },

        nubian_spearman: {
            id: 'nubian_spearman',
            name: 'Nubian Spearman',
            type: 'infantry',
            category: 'heavy',
            description: 'Resilient warriors holding lines with cow-hide shields and long spears',
            era: ['early', 'middle'],
            cost: { gold: 80, manpower: 50 },
            upkeep: 5,
            stats: { health: 100, attack: 12, defense: 18, movement: 2, range: 1 },
            bonuses: { vsInfantry: 1.2, vsCavalry: 1.1 },
            icon: 'nubia_unit_archer_circle.png',
            symbol: '🛡️'
        },

        nubian_retainer: {
            id: 'nubian_retainer',
            name: 'Elite Retainer',
            type: 'infantry',
            category: 'elite',
            description: 'Chieftain bodyguard with ornate broad shields and curved swords',
            era: ['early'],
            cost: { gold: 170, manpower: 40 },
            upkeep: 12,
            stats: { health: 125, attack: 20, defense: 20, movement: 3, range: 1 },
            bonuses: { vsInfantry: 1.35, vsCavalry: 1.2, morale: 1.8 },
            icon: 'nubia_unit_archer_circle.png',
            symbol: '⚔️'
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
            icon: 'cataphract.png',
            symbol: '🏇'
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
            icon: 'klibanophoroi.png',
            symbol: '🎖️'
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
            icon: 'kavallarioi.png',
            symbol: '🐎'
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
            icon: 'horsearchers.png',
            symbol: '🏇🏹'
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
            icon: 'tagmata.png',
            symbol: '👑'
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
            icon: 'camel_riders.png',
            symbol: '🐪'
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
            icon: 'war_elephants.png',
            symbol: '🐘'
        },

        foederati_horse_archer: {
            id: 'foederati_horse_archer',
            name: 'Foederati Horse Archers',
            type: 'cavalry',
            category: 'horsearcher',
            description: 'Allied Hunnic and nomadic horse archers fighting under Roman eagles',
            era: ['early'],
            cost: { gold: 120, manpower: 60 },
            upkeep: 8,
            stats: { health: 80, attack: 14, defense: 8, movement: 5, range: 2 },
            bonuses: { vsInfantry: 1.25, vsCavalry: 1.1 },
            icon: 'byzantine_unit_cataphract.png',
            symbol: '🏇'
        },

        gothic_heavy_cavalry: {
            id: 'gothic_heavy_cavalry',
            name: 'Gothic Heavy Cavalry',
            type: 'cavalry',
            category: 'heavy',
            description: 'Armored Ostrogothic lancers delivering crushing shock charges',
            era: ['early'],
            cost: { gold: 180, manpower: 90 },
            upkeep: 13,
            stats: { health: 135, attack: 25, defense: 20, movement: 4, range: 1 },
            bonuses: { charge: 1.6, vsInfantry: 1.35 },
            icon: 'ostrogoth_unit_infantry_circle.png',
            symbol: '🐎'
        },

        leudes_cavalry: {
            id: 'leudes_cavalry',
            name: 'Leudes Cavalry',
            type: 'cavalry',
            category: 'heavy',
            description: 'Noble Frankish heavy horsemen bound by oaths of royal allegiance',
            era: ['early', 'middle'],
            cost: { gold: 180, manpower: 90 },
            upkeep: 13,
            stats: { health: 135, attack: 25, defense: 20, movement: 4, range: 1 },
            bonuses: { charge: 1.5, vsInfantry: 1.3 },
            icon: 'frank_unit_axemen_circle.png',
            symbol: '🐎'
        },

        levant_scout: {
            id: 'levant_scout',
            name: 'Levantine Light Scout',
            type: 'cavalry',
            category: 'scout',
            description: 'Fast Syrian cavalry scouts tracking enemy troop movements',
            era: ['early'],
            cost: { gold: 90, manpower: 50 },
            upkeep: 6,
            stats: { health: 85, attack: 13, defense: 9, movement: 5, range: 1 },
            bonuses: { terrain: 1.25, vision: 2 },
            icon: 'byzantine_unit_cataphract.png',
            symbol: '🐎'
        },

        egyptian_camel_scout: {
            id: 'egyptian_camel_scout',
            name: 'Egyptian Camel Scout',
            type: 'cavalry',
            category: 'desert',
            description: 'Dromedary riders scouting the arid Red Sea and Sinai frontiers',
            era: ['early'],
            cost: { gold: 110, manpower: 55 },
            upkeep: 7,
            stats: { health: 90, attack: 14, defense: 9, movement: 4, range: 1 },
            bonuses: { terrain: 1.5, vsCavalry: 1.2 },
            icon: 'arab_unit_camel_riders_circle.png',
            symbol: '🐪'
        },

        axumite_cavalry: {
            id: 'axumite_cavalry',
            name: 'Axumite Cavalry',
            type: 'cavalry',
            category: 'scout',
            description: 'Highland horsemen equipped with iron lances and round bucklers',
            era: ['early'],
            cost: { gold: 90, manpower: 50 },
            upkeep: 6,
            stats: { health: 85, attack: 13, defense: 9, movement: 5, range: 1 },
            bonuses: { terrain: 1.3, vsInfantry: 1.15 },
            icon: 'axum_unit_spearmen_circle.png',
            symbol: '🐎'
        },

        slav_scout: {
            id: 'slav_scout',
            name: 'Slavic Mounted Scout',
            type: 'cavalry',
            category: 'scout',
            description: 'Hardy mounted reconnaissance scouts operating across riverlands and forests',
            era: ['early', 'middle'],
            cost: { gold: 90, manpower: 50 },
            upkeep: 6,
            stats: { health: 85, attack: 13, defense: 9, movement: 5, range: 1 },
            bonuses: { terrain: 1.4, vision: 2 },
            icon: 'slav_unit_axe_circle.png',
            symbol: '🐎'
        },

        latin_cavalry: {
            id: 'latin_cavalry',
            name: 'Latin Cavalry',
            type: 'cavalry',
            category: 'scout',
            description: 'Italian Roman cavalry patrols maintaining roads and city communication',
            era: ['early'],
            cost: { gold: 90, manpower: 50 },
            upkeep: 6,
            stats: { health: 85, attack: 13, defense: 9, movement: 5, range: 1 },
            bonuses: { vsInfantry: 1.15, terrain: 1.1 },
            icon: 'latin_unit_infantry_circle.png',
            symbol: '🐎'
        },

        chinese_armored_cavalry: {
            id: 'chinese_armored_cavalry',
            name: 'Armored Cavalry',
            type: 'cavalry',
            category: 'heavy',
            description: 'Fully barded cataphract cavalry armed with heavy lances and composite bows',
            era: ['early', 'middle', 'late'],
            cost: { gold: 180, manpower: 90 },
            upkeep: 13,
            stats: { health: 135, attack: 25, defense: 20, movement: 4, range: 1 },
            bonuses: { charge: 1.6, vsInfantry: 1.4 },
            icon: 'china_unit_crossbow_circle.png',
            symbol: '🐎'
        },

        arab_camel_archer: {
            id: 'arab_camel_archer',
            name: 'Arab Camel Archer',
            type: 'cavalry',
            category: 'desert',
            description: 'Mounted dromedary archers firing volleys across open sands',
            era: ['early', 'middle'],
            cost: { gold: 110, manpower: 55 },
            upkeep: 7,
            stats: { health: 90, attack: 14, defense: 9, movement: 4, range: 2 },
            bonuses: { terrain: 1.5, vsCavalry: 1.25 },
            icon: 'arab_unit_camel_riders_circle.png',
            symbol: '🐪'
        },

        arab_spear_cavalry: {
            id: 'arab_spear_cavalry',
            name: 'Arab Spear Cavalry',
            type: 'cavalry',
            category: 'scout',
            description: 'Swift nomadic horse lancers raiding flanks and pursuing routed foes',
            era: ['early', 'middle'],
            cost: { gold: 90, manpower: 50 },
            upkeep: 6,
            stats: { health: 85, attack: 13, defense: 9, movement: 5, range: 1 },
            bonuses: { terrain: 1.35, charge: 1.3 },
            icon: 'arab_unit_camel_riders_circle.png',
            symbol: '🐎'
        },

        nubian_horseman: {
            id: 'nubian_horseman',
            name: 'Desert Horseman',
            type: 'cavalry',
            category: 'scout',
            description: 'Swift Nubian desert horsemen skirmishing with light javelins and swords',
            era: ['early', 'middle'],
            cost: { gold: 90, manpower: 50 },
            upkeep: 6,
            stats: { health: 85, attack: 13, defense: 9, movement: 5, range: 1 },
            bonuses: { terrain: 1.35, vsInfantry: 1.1 },
            icon: 'nubia_unit_archer_circle.png',
            symbol: '🐎'
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
            icon: 'greekfire.png',
            symbol: '🔥'
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
            icon: 'engineers.png',
            symbol: '⚙️'
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
            icon: 'mangonel.png',
            symbol: '☄️'
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
            icon: 'priests.png',
            symbol: '☦️'
        },

        healer: {
            id: 'healer',
            name: 'Field Healer',
            type: 'special',
            category: 'support',
            description: 'Dedicated medical support unit for rapid battlefield recovery',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 120,
                manpower: 45
            },
            upkeep: 6,
            stats: {
                health: 45,
                attack: 2,
                defense: 5,
                movement: 3,
                range: 1
            },
            bonuses: {
                healingRate: 16,
                moraleBoost: 1.2
            },
            icon: 'healer.png',
            symbol: '🩹'
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
            icon: 'caravan.png',
            symbol: '💰'
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
            icon: 'explorer.png',
            symbol: '🧭'
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
            icon: 'spy.png',
            symbol: '🕵️'
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
            icon: 'transport.png',
            symbol: '🚣'
        },
        civil_engineers: {
            id: 'civil_engineers',
            name: 'Engineers',
            type: 'special',
            category: 'infrastructure',
            description: 'Specialists in building roads and improving city infrastructure',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 120,
                manpower: 60
            },
            upkeep: 5,
            stats: {
                health: 40,
                attack: 2,
                defense: 4,
                movement: 3,
                range: 1
            },
            bonuses: {
                buildRoad: true,
                improveInfra: true
            },
            icon: 'civil_engineers.png',
            symbol: '🛠️'
        },

        ballista_crew: {
            id: 'ballista_crew',
            name: 'Ballista Crew',
            type: 'special',
            category: 'siege',
            description: 'Precision torsion artillery launching heavy iron bolts against siege engines and walls',
            era: ['early', 'middle'],
            cost: { gold: 160, manpower: 60 },
            upkeep: 10,
            stats: { health: 70, attack: 22, defense: 5, movement: 1, range: 4 },
            bonuses: { siegeDamage: 1.5, vsInfantry: 1.3 },
            icon: 'latin_unit_infantry_circle.png',
            symbol: '🎯'
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
                manpower: 65
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
            icon: 'dromon.png',
            symbol: '⛵'
        },
        dromon_greekfire: {
            id: 'dromon_greekfire',
            name: 'Greek Fire Dromon',
            type: 'naval',
            category: 'warship',
            description: 'Elite warship equipped with the deadly Greek Fire siphon',
            era: ['middle', 'late'],
            cost: {
                gold: 350,
                manpower: 100
            },
            upkeep: 20,
            stats: {
                health: 150,
                attack: 45,
                defense: 20,
                movement: 6,
                range: 3
            },
            bonuses: {
                vsShips: 2.5,
                vsBuildings: 2.0,
                greekFire: true,
                waterTraversal: true
            },
            icon: 'dromon_greekfire.png',
            symbol: '⛵🔥'
        },
        merchant_ship: {
            id: 'merchant_ship',
            name: 'Merchant Galley',
            type: 'naval',
            category: 'transport',
            description: 'Large cargo vessel for transporting goods and troops',
            era: ['early', 'middle', 'late'],
            cost: {
                gold: 180,
                manpower: 50
            },
            upkeep: 6,
            stats: {
                health: 100,
                attack: 5,
                defense: 10,
                movement: 5,
                range: 1
            },
            bonuses: {
                transportCapacity: 3,
                tradeBoost: 1.2,
                waterTraversal: true
            },
            icon: 'merchant_ship.png',
            symbol: '🚢'
        },

        boat_raider: {
            id: 'boat_raider',
            name: 'Raider Boat Infantry',
            type: 'naval',
            category: 'transport',
            description: 'Saxon sea-raiders in rowed vessels landing on hostile coasts for shock attacks',
            era: ['early', 'middle'],
            cost: { gold: 70, manpower: 40 },
            upkeep: 4,
            stats: { health: 75, attack: 12, defense: 8, movement: 3, range: 1 },
            bonuses: { coastalLanding: 1.35, waterTraversal: true },
            icon: 'anglo_saxon_unit_household_circle.png',
            symbol: '⛵'
        }
    }
};

const FACTION_ROSTERS = {
    byzantine: [
        'skutatoi', 'psilos', 'archers', 'cataphract', 'varangian', 'mountain_infantry',
        'kavallarioi', 'klibanophoroi', 'tagmata', 'foederati_horse_archer', 'limitanei',
        'syrian_archer', 'levant_scout', 'hillman_skirmisher',
        'egyptian_bow_infantry', 'egyptian_camel_scout', 'egyptian_guard',
        'greekfire', 'engineers', 'mangonel', 'priests', 'healer', 'caravan', 'explorer', 'spy',
        'transport', 'civil_engineers', 'dromon', 'dromon_greekfire', 'merchant_ship'
    ],
    ostrogoth: [
        'gothic_heavy_cavalry', 'gothic_infantry', 'gothic_royal_guard', 'gothic_bowmen',
        'skutatoi', 'kavallarioi', 'engineers', 'priests', 'healer', 'caravan', 'explorer'
    ],
    frank: [
        'frankish_axemen', 'frankish_spearmen', 'leudes_cavalry', 'frankish_skirmishers',
        'cataphract', 'kavallarioi', 'engineers', 'priests', 'healer', 'caravan', 'explorer'
    ],
    anglo_saxon: [
        'saxon_household', 'seax_fighter', 'saxon_javelin', 'boat_raider',
        'archers', 'engineers', 'priests', 'healer', 'caravan', 'explorer'
    ],
    slav: [
        'slav_skirmisher', 'slav_scout', 'slav_axe_infantry', 'slav_archer',
        'mountain_infantry', 'healer', 'caravan', 'explorer'
    ],
    latin: [
        'italo_roman_infantry', 'ballista_crew', 'latin_cavalry',
        'skutatoi', 'archers', 'engineers', 'priests', 'healer', 'caravan', 'explorer'
    ],
    axum: [
        'axumite_cavalry', 'axumite_spearmen', 'ethiopian_archers', 'axumite_guard',
        'priests', 'healer', 'caravan', 'explorer'
    ],
    nubia: [
        'nubian_archer', 'nubian_spearman', 'nubian_horseman', 'nubian_retainer',
        'healer', 'caravan', 'explorer'
    ],
    china: [
        'chinese_armored_cavalry', 'chinese_crossbow', 'chinese_polearm', 'chinese_guard',
        'caravan', 'explorer'
    ],
    arab: [
        'arab_camel_archer', 'arab_skirmisher', 'arab_spear_cavalry', 'arab_tribal_elite',
        'camel_riders', 'horsearchers', 'archers', 'kavallarioi', 'healer', 'caravan', 'explorer'
    ],
    sassanid: [
        'horsearchers', 'camel_riders', 'kavallarioi', 'archers', 'war_elephants',
        'engineers', 'healer', 'caravan', 'explorer'
    ],
    bulgar: [
        'mountain_infantry', 'skutatoi', 'archers', 'kavallarioi', 'horsearchers',
        'healer', 'caravan', 'explorer'
    ],
    tribal: [
        'skutatoi', 'archers', 'kavallarioi', 'psilos', 'explorer'
    ]
};

const UNIT_UPGRADE_PATHS = {
    skutatoi: ['varangian', 'mountain_infantry'],
    psilos: ['archers', 'explorer'],
    archers: ['horsearchers', 'mangonel'],
    kavallarioi: ['cataphract', 'tagmata'],
    horsearchers: ['tagmata'],
    cataphract: ['klibanophoroi'],
    engineers: ['mangonel'],
    transport: ['merchant_ship'],
    dromon: ['dromon_greekfire'],
    priests: ['healer']
};

const UNIT_LEVEL_GROWTH = {
    infantry: { health: 8, attack: 2, defense: 3 },
    cavalry: { health: 10, attack: 3, defense: 2 },
    special: { health: 6, attack: 2, defense: 2 },
    naval: { health: 12, attack: 3, defense: 3 },
    default: { health: 8, attack: 2, defense: 2 }
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

function getUnitGrowthProfile(unitTypeId) {
    const unit = getUnitById(unitTypeId);
    if (!unit) return UNIT_LEVEL_GROWTH.default;
    return UNIT_LEVEL_GROWTH[unit.type] || UNIT_LEVEL_GROWTH.default;
}

function getUnitUpgradePath(unitTypeId) {
    return [...(UNIT_UPGRADE_PATHS[unitTypeId] || [])];
}

function getUnitUpgradeOptions(unit, options = {}) {
    if (!unit) return [];
    const path = getUnitUpgradePath(unit.typeId);
    if (path.length === 0) return [];
    const availableUnits = options.availableUnits instanceof Set ? options.availableUnits : null;
    return path.filter((targetId) => !availableUnits || availableUnits.has(targetId));
}

function getUnitTrainingTurns(unitTypeId, context = {}) {
    const unit = getUnitById(unitTypeId);
    if (!unit) return 0;
    const baseByType = {
        infantry: 0,
        cavalry: 1,
        special: 1,
        naval: 2
    };
    const baseByCategory = {
        // basic infantry categories: immediate recruit
        light: 0,
        heavy: 0,
        ranged: 0,
        // advanced
        elite: 2,
        superheavy: 2,
        siege: 2,
        support: 1,
        scout: 1,
        economic: 1,
        transport: 1,
        warship: 2
    };
    const base = Number.isFinite(unit.trainingTurns)
        ? unit.trainingTurns
        : (baseByCategory[unit.category] ?? baseByType[unit.type] ?? 2);
    const barracksLevel = Math.max(0, Number(context.barracksLevel || 0));
    const recruitmentSpeed = Math.max(1, Number(context.recruitmentSpeed || 1));
    const barracksReduction = Math.min(0.35, barracksLevel * 0.12);
    const leaderReduction = Math.min(0.4, (recruitmentSpeed - 1) * 0.35);
    return Math.max(0, Math.round(base * (1 - barracksReduction - leaderReduction)));
}

function applyUnitPromotion(unit, targetTypeId) {
    const target = getUnitById(targetTypeId);
    if (!unit || !target) return false;

    const maxHealthBefore = Math.max(1, Number(unit.stats?.health || 1));
    const healthRatio = Math.max(0, Math.min(1, Number(unit.currentHealth || 0) / maxHealthBefore));
    const levelBonus = 1 + Math.max(0, Number(unit.level || 1) - 1) * 0.04;

    unit.promotedFrom = unit.typeId;
    unit.typeId = target.id;
    unit.name = target.name;
    unit.type = target.type;
    unit.category = target.category;
    unit.symbol = target.symbol || unit.symbol || '⚔️';
    unit.bonuses = { ...target.bonuses };
    unit.stats = {
        health: Math.max(1, Math.floor((target.stats?.health || 1) * levelBonus)),
        attack: Math.max(1, Math.floor((target.stats?.attack || 1) * levelBonus)),
        defense: Math.max(1, Math.floor((target.stats?.defense || 1) * levelBonus)),
        movement: Math.max(1, Math.floor(target.stats?.movement || 1)),
        range: Math.max(1, Math.floor(target.stats?.range || 1))
    };
    unit.currentHealth = Math.max(1, Math.floor(unit.stats.health * healthRatio));
    unit.currentMovement = unit.stats.movement;
    unit.upgradeHistory = [...(Array.isArray(unit.upgradeHistory) ? unit.upgradeHistory : []), target.id];
    if (typeof gameState?.applyFactionUnitNaming === 'function') {
        gameState.applyFactionUnitNaming(unit, unit.faction);
    }
    return true;
}

function promoteUnitByExperience(unit, options = {}) {
    if (!unit || Number(unit.level || 1) < 3) return false;
    const optionsForUnit = getUnitUpgradeOptions(unit, options);
    if (optionsForUnit.length === 0) return false;
    return applyUnitPromotion(unit, optionsForUnit[0]);
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

    // Apply coastal landing bonus for naval raiders
    if (unit.bonuses.coastalLanding && (terrain === 'coastal' || terrain === 'water')) {
        power *= unit.bonuses.coastalLanding;
    }

    // Apply shock infantry charge bonus
    if (unit.bonuses.shockCharge) {
        power *= unit.bonuses.shockCharge;
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
        destination: null,
        automated: false,
        experience: 0,
        level: 1,
        morale: 100,
        symbol: unitType.symbol || '⚔️',
        bonuses: { ...unitType.bonuses },
        promotedFrom: null,
        upgradeHistory: []
    };
}
