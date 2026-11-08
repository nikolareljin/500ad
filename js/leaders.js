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
                civilization: 'sassanid',
                years: '531-579 AD',
                era: 'early',
                portrait: 'khosrow_i.png',
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
                civilization: 'ostrogoth',
                years: '541-552 AD',
                era: 'early',
                portrait: 'totila.png',
                stats: { military: 9, economy: 5, diplomacy: 6 },
                abilities: [
                    { name: 'Gothic Resistance', description: '+40% defense in Italy' },
                    { name: 'Liberator', description: 'Lower peasant unrest' }
                ],
                startingResources: { gold: 600, manpower: 900, prestige: 100 },
                bonuses: { homeDefense: 1.4 }
            },
            {
                id: 'theodoric',
                name: 'Theodoric the Great',
                title: 'King of Ostrogoths & Italy',
                faction: 'Ostrogothic Kingdom',
                civilization: 'ostrogoth',
                years: '493-526 AD',
                era: 'early',
                portrait: 'theodoric.png',
                stats: { military: 9, economy: 8, diplomacy: 8 },
                abilities: [
                    { name: 'Civilitas', description: '+30% city defense, +15% gold from Italian towns' },
                    { name: 'Edictum Theodorici', description: '-20% unrest and crime' }
                ],
                startingResources: { gold: 1200, manpower: 900, prestige: 200 },
                bonuses: { cityDefense: 1.3, goldIncome: 1.15 }
            },
            {
                id: 'clovis1',
                name: 'Clovis I',
                title: 'King of the Franks',
                faction: 'Frankish Kingdom',
                civilization: 'frank',
                years: '481-511 AD',
                era: 'early',
                portrait: 'clovis_i.png',
                stats: { military: 9, economy: 7, diplomacy: 7 },
                abilities: [
                    { name: 'Salic Law', description: '+20% manpower from Gaul' },
                    { name: 'Francisca Charge', description: '+25% Frankish axemen shock damage' }
                ],
                startingResources: { gold: 1000, manpower: 1000, prestige: 180 },
                bonuses: { shockDamage: 1.25, manpowerRegen: 1.2 }
            },
            {
                id: 'vigilius',
                name: 'Vigilius',
                title: 'Leader of Roman Senate & Exarchate',
                faction: 'Latin Exarchate',
                civilization: 'latin',
                years: '537-555 AD',
                era: 'early',
                portrait: 'latin_unit_infantry_circle.png',
                stats: { military: 6, economy: 8, diplomacy: 9 },
                abilities: [
                    { name: 'Papal Concordat', description: '+30% prestige from treaties' },
                    { name: 'Patrimonium Petri', description: '+20% grain and food production' }
                ],
                startingResources: { gold: 1100, manpower: 500, prestige: 250 },
                bonuses: { prestigeBonus: 1.3, foodIncome: 1.2 }
            },
            {
                id: 'aethelberht',
                name: 'Aethelberht of Kent',
                title: 'Bretwalda of the English',
                faction: 'Anglo-Saxon Kingdoms',
                civilization: 'anglo_saxon',
                years: '560-616 AD',
                era: 'early',
                portrait: 'aethelberht.png',
                stats: { military: 8, economy: 7, diplomacy: 8 },
                abilities: [
                    { name: 'Law of Aethelberht', description: '+25% town loyalty, +15% taxes' },
                    { name: 'North Sea Mastery', description: '+30% boat raider speed and landing attack' }
                ],
                startingResources: { gold: 800, manpower: 700, prestige: 150 },
                bonuses: { coastalRaidBonus: 1.3, navalSpeed: 1.3 }
            },
            {
                id: 'dobreta',
                name: 'Daurentius (Dobreta)',
                title: 'Knyaz of the Slavs',
                faction: 'Slavic Tribes',
                civilization: 'slav',
                years: '570-590 AD',
                era: 'early',
                portrait: 'dobreta_slav.png',
                stats: { military: 8, economy: 6, diplomacy: 5 },
                abilities: [
                    { name: 'Forest Ambush', description: '+40% attack from forests and hills' },
                    { name: 'Unbowed Freedom', description: '+50% resistance to vassalization' }
                ],
                startingResources: { gold: 600, manpower: 1100, prestige: 120 },
                bonuses: { hillAttack: 1.4, moraleBoost: 1.25 }
            },
            {
                id: 'kaleb',
                name: 'Kaleb of Axum (Elesbaan)',
                title: 'Negus of Aksum',
                faction: 'Kingdom of Axum',
                civilization: 'axum',
                years: '514-540 AD',
                era: 'early',
                portrait: 'kaleb_axum.png',
                stats: { military: 9, economy: 9, diplomacy: 7 },
                abilities: [
                    { name: 'Red Sea Hegemony', description: '+35% gold from maritime trade' },
                    { name: 'Himyarite Crusade', description: '+20% attack in desert terrain' }
                ],
                startingResources: { gold: 1400, manpower: 800, prestige: 220 },
                bonuses: { tradeBoost: 1.35, desertAttack: 1.2 }
            },
            {
                id: 'silko',
                name: 'Silko of Nobatia',
                title: 'King of the Nobatae',
                faction: 'Kingdom of Nobatia',
                civilization: 'nubia',
                years: '536-555 AD',
                era: 'early',
                portrait: 'silko_nubia.png',
                stats: { military: 8, economy: 7, diplomacy: 6 },
                abilities: [
                    { name: 'Triumph of Kalabsha', description: '+30% archer range and damage' },
                    { name: 'Nile Cataracts', description: '+25% defense along rivers' }
                ],
                startingResources: { gold: 750, manpower: 750, prestige: 160 },
                bonuses: { archerPower: 1.3, riverDefense: 1.25 }
            },
            {
                id: 'emperor_wu',
                name: 'Emperor Wu of Liang',
                title: 'Bodhisattva Sovereign',
                faction: 'Liang Dynasty (Silk Road)',
                civilization: 'china',
                years: '502-549 AD',
                era: 'early',
                portrait: 'emperor_wu_china.png',
                stats: { military: 7, economy: 10, diplomacy: 9 },
                abilities: [
                    { name: 'Silk Road Splendor', description: '+50% gold from trade caravans' },
                    { name: 'Imperial Examination', description: '+30% technology research speed' }
                ],
                startingResources: { gold: 2500, manpower: 1200, prestige: 350 },
                bonuses: { goldIncome: 1.5, researchSpeed: 1.3 }
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
                portrait: 'heraclius.png',
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
                civilization: 'arab',
                years: '585-642 AD',
                era: 'early',
                portrait: 'khalid.png',
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
                civilization: 'byzantine',
                portrait: 'bardas_skleros.png',
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
                civilization: 'bulgar',
                years: '997-1014 AD',
                era: 'middle',
                portrait: 'samuel.png',
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
                portrait: 'alexios_i.png',
                stats: { military: 7, economy: 8, diplomacy: 10 },
                abilities: [
                    { name: 'Diplomatic Genius', description: '-30% mercenary costs' },
                    { name: 'Komnenian Reform', description: '+20% elite unit effectiveness' }
                ],
                startingResources: { gold: 1400, manpower: 800, prestige: 200 },
                bonuses: { mercenaryDiscount: 0.7, eliteBoost: 1.2 }
            },
            {
                id: 'romanos4',
                name: 'Romanos IV Diogenes',
                title: 'Emperor of the Romans',
                years: '1068-1071 AD',
                era: 'late',
                portrait: 'romanos_iv.png',
                stats: { military: 8, economy: 6, diplomacy: 5 },
                abilities: [
                    { name: 'Cappadocian Muster', description: '+35% heavy cavalry recruitment' },
                    { name: 'Imperial Vanguard', description: '+25% Tagmata and Varangian attack' }
                ],
                startingResources: { gold: 1100, manpower: 1300, prestige: 180 },
                bonuses: { cavalryAttack: 1.35, eliteAttack: 1.25 }
            }
        ],
        enemies: [
            {
                id: 'alp_arslan',
                name: 'Alp Arslan',
                title: 'The Valiant Lion',
                faction: 'Seljuk Empire',
                civilization: 'arab',
                years: '1063-1072 AD',
                era: 'late',
                portrait: 'alp_arslan.png',
                stats: { military: 10, economy: 7, diplomacy: 6 },
                abilities: [
                    { name: 'Manzikert Tactics', description: '+50% damage against heavy infantry' },
                    { name: 'Turkic Horsemen', description: '+30% horse archer speed' }
                ],
                startingResources: { gold: 1300, manpower: 1600, prestige: 350 },
                bonuses: { antiInfantry: 1.5, cavalrySpeed: 1.3 }
            }
        ]
    },

    // 15th Century (Fall of Constantinople)
    century15: {
        byzantine: [
            {
                id: 'constantine11',
                name: 'Constantine XI Palaiologos',
                title: 'The Marble Emperor',
                years: '1449-1453 AD',
                era: 'late',
                portrait: 'constantine_xi.png',
                stats: { military: 9, economy: 5, diplomacy: 7 },
                abilities: [
                    { name: 'Theodosian Bastion', description: '+60% city defense in Constantinople' },
                    { name: 'To The Last Breath', description: 'Units fight with +50% morale' }
                ],
                startingResources: { gold: 700, manpower: 600, prestige: 300 },
                bonuses: { cityDefense: 1.6, moraleBoost: 1.5 }
            }
        ],
        enemies: [
            {
                id: 'mehmed2',
                name: 'Mehmed II',
                title: 'The Conqueror',
                faction: 'Ottoman Empire',
                civilization: 'ottoman',
                years: '1451-1481 AD',
                era: 'late',
                portrait: 'mehmed_ii.png',
                stats: { military: 10, economy: 9, diplomacy: 8 },
                abilities: [
                    { name: 'Basilica Cannon', description: '+75% siege and artillery damage' },
                    { name: 'Overland Fleet', description: '+40% naval speed and amphibious landing' }
                ],
                startingResources: { gold: 2500, manpower: 3000, prestige: 400 },
                bonuses: { siegeDamage: 1.75, navalSpeed: 1.4 }
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
