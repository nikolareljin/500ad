/**
 * Byzantine Leaders Data
 * Historically accurate emperors and generals from 500-1453 AD
 */

const LEADERS = {
    // 6th Century (Justinian Era)
    century6: {
        byzantine: [
            {
                id: 'justinian',
                name: 'Justinian I',
                title: 'The Great',
                years: '527-565 AD',
                era: 'early',
                portrait: 'justinian.png',
                stats: { military: 7, economy: 9, diplomacy: 8 },
                abilities: [
                    { name: 'Reconquest', description: '+20% siege damage, -10% building costs' },
                    { name: 'Corpus Juris Civilis', description: '+15% gold from territories' }
                ],
                startingResources: { gold: 1200, manpower: 600, prestige: 150 },
                bonuses: { siegeDamage: 1.2, buildingCost: 0.9, goldIncome: 1.15 }
            },
            {
                id: 'belisarius',
                name: 'Belisarius',
                title: 'The Legendary General',
                years: '505-565 AD',
                era: 'early',
                portrait: 'belisarius.png',
                stats: { military: 10, economy: 6, diplomacy: 7 },
                abilities: [
                    { name: 'Cavalry Master', description: '+30% cavalry attack and movement' },
                    { name: 'Tactical Genius', description: 'Can win battles while outnumbered 2:1' }
                ],
                startingResources: { gold: 1000, manpower: 800, prestige: 120 },
                bonuses: { cavalryAttack: 1.3, cavalryMovement: 1.3, outnumberedBonus: 0.5 }
            }
        ],
        enemies: [
            {
                id: 'khosrow1',
                name: 'Khosrow I',
                title: 'Anushiruvan',
                faction: 'Sassanid Empire',
                years: '531-579 AD',
                era: 'early',
                stats: { military: 9, economy: 10, diplomacy: 8 },
                abilities: [
                    { name: 'Shahanshah', description: '+25% resource generation' },
                    { name: 'Savaran Cavalry', description: '+20% heavy cavalry power' }
                ],
                startingResources: { gold: 1500, manpower: 700, prestige: 200 },
                bonuses: { resourceIncome: 1.25, cavalryPower: 1.2 }
            },
            {
                id: 'totila',
                name: 'Totila',
                title: 'King of the Ostrogoths',
                faction: 'Ostrogothic Kingdom',
                years: '541-552 AD',
                era: 'early',
                stats: { military: 9, economy: 5, diplomacy: 6 },
                abilities: [
                    { name: 'Gothic Resistance', description: '+40% defense in Italy' },
                    { name: 'Liberator', description: 'Lower peasant unrest' }
                ],
                startingResources: { gold: 600, manpower: 900, prestige: 100 },
                bonuses: { homeDefense: 1.4 }
            }
        ]
    },

    // 7th Century (Heraclian Era)
    century7: {
        byzantine: [
            {
                id: 'heraclius',
                name: 'Heraclius',
                title: 'The Reformer',
                years: '610-641 AD',
                era: 'early',
                stats: { military: 8, economy: 8, diplomacy: 7 },
                abilities: [
                    { name: 'Theme System', description: '+20% manpower regeneration' },
                    { name: 'True Cross', description: '+30% prestige from victories' }
                ],
                startingResources: { gold: 900, manpower: 1000, prestige: 250 },
                bonuses: { manpowerRegen: 1.2, prestigeBonus: 1.3 }
            }
        ],
        enemies: [
            {
                id: 'khalid',
                name: 'Khalid ibn al-Walid',
                title: 'Sword of Allah',
                faction: 'Rashidun Caliphate',
                years: '585-642 AD',
                era: 'early',
                stats: { military: 10, economy: 6, diplomacy: 5 },
                abilities: [
                    { name: 'Desert Warfare', description: '+50% speed in desert' },
                    { name: 'Undefeated', description: '+20% morale to all units' }
                ],
                startingResources: { gold: 800, manpower: 1200, prestige: 300 },
                bonuses: { desertSpeed: 1.5, moraleBoost: 1.2 }
            }
        ]
    },

    // 10th Century (Macedonian Era)
    century10: {
        byzantine: [
            {
                id: 'basil2',
                name: 'Basil II',
                title: 'Bulgar-Slayer',
                years: '976-1025 AD',
                era: 'middle',
                portrait: 'basil_ii.png',
                stats: { military: 10, economy: 8, diplomacy: 5 },
                abilities: [
                    { name: 'Relentless Conquest', description: '+25% attack, -20% unit upkeep' },
                    { name: 'Varangian Shield', description: '+30% Varangian Guard defense' }
                ],
                startingResources: { gold: 2000, manpower: 1500, prestige: 300 },
                bonuses: { unitAttack: 1.25, upkeepReduction: 0.8, eliteDefense: 1.3 }
            }
        ],
        contestants: [
            {
                id: 'bardas_skleros',
                name: 'Bardas Skleros',
                title: 'The Rebel General',
                years: '976-979 AD (Rebellion)',
                era: 'middle',
                stats: { military: 9, economy: 6, diplomacy: 7 },
                abilities: [
                    { name: 'Anatolian Support', description: '+40% recruitment speed in East' },
                    { name: 'Armenian Allies', description: 'Can recruit unique Armenian units' }
                ],
                startingResources: { gold: 1200, manpower: 1100, prestige: 100 },
                bonuses: { recruitmentSpeed: 1.4 }
            }
        ],
        enemies: [
            {
                id: 'samuel',
                name: 'Samuel of Bulgaria',
                title: 'Tsar of the Bulgarians',
                faction: 'First Bulgarian Empire',
                years: '997-1014 AD',
                era: 'middle',
                stats: { military: 8, economy: 7, diplomacy: 6 },
                abilities: [
                    { name: 'Mountain Ambush', description: '+40% attack in hills/mountains' },
                    { name: 'Bulgarian Resilience', description: '+20% health for all units' }
                ],
                startingResources: { gold: 800, manpower: 1400, prestige: 150 },
                bonuses: { hillAttack: 1.4, healthBonus: 1.2 }
            }
        ]
    },

    // 11th Century (Komnenian Era)
    century11: {
        byzantine: [
            {
                id: 'alexios1',
                name: 'Alexios I Komnenos',
                title: 'The Restorer',
                years: '1081-1118 AD',
                era: 'late',
                stats: { military: 7, economy: 8, diplomacy: 10 },
                abilities: [
                    { name: 'Diplomatic Genius', description: '-30% mercenary costs' },
                    { name: 'Komnenian Reform', description: '+20% elite unit effectiveness' }
                ],
                startingResources: { gold: 1400, manpower: 800, prestige: 200 },
                bonuses: { mercenaryDiscount: 0.7, eliteBoost: 1.2 }
            }
        ],
        enemies: [
            {
                id: 'alp_arslan',
                name: 'Alp Arslan',
                title: 'The Valiant Lion',
                faction: 'Seljuk Empire',
                years: '1063-1072 AD',
                era: 'late',
                stats: { military: 10, economy: 7, diplomacy: 6 },
                abilities: [
                    { name: 'Manzikert Tactics', description: '+50% damage against heavy infantry' },
                    { name: 'Turkic Horsemen', description: '+30% horse archer speed' }
                ],
                startingResources: { gold: 1300, manpower: 1600, prestige: 350 },
                bonuses: { antiInfantry: 1.5, cavalrySpeed: 1.3 }
            }
        ]
    }
};

/**
 * Get all available centuries
 */
function getAvailableCenturies() {
    return Object.keys(LEADERS).map(key => key.replace('century', ''));
}

/**
 * Get factions for a specific century
 */
function getFactionsByCentury(century) {
    const data = LEADERS[`century${century}`];
    if (!data) return [];
    return Object.keys(data);
}

/**
 * Get leaders for a specific century and faction
 */
function getLeadersByCenturyAndFaction(century, faction) {
    const data = LEADERS[`century${century}`];
    return data && data[faction] ? data[faction] : [];
}

/**
 * Get a specific leader by ID across all data
 */
function getLeaderById(id) {
    for (const century in LEADERS) {
        for (const faction in LEADERS[century]) {
            const leader = LEADERS[century][faction].find(l => l.id === id);
            if (leader) return leader;
        }
    }
    return null;
}

/**
 * Get all leaders (legacy support)
 */
function getAllLeaders() {
    let all = [];
    for (const century in LEADERS) {
        for (const faction in LEADERS[century]) {
            all = all.concat(LEADERS[century][faction]);
        }
    }
    return all;
}
