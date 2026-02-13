/**
 * Detailed Geographic Heightmap for Mediterranean World
 * 200x120 pixel-accurate representation
 * 
 * Height values:
 * 0-30: Deep ocean
 * 31-50: Shallow sea/coastal waters
 * 51-80: Lowlands/plains
 * 81-120: Hills
 * 121-180: Mountains
 * 181-255: High mountains
 * 
 * Geographic coverage:
 * West: Atlantic coast (Portugal/Morocco)
 * East: Persia/Caspian Sea
 * North: British Isles/Scandinavia/Ukrainian Steppe
 * South: Sahara Desert/Arabia
 */

// Generate heightmap programmatically for accurate Mediterranean geography
function generateMediterraneanHeightmap() {
    const width = 200;
    const height = 120;
    const map = [];

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const nx = x / width;   // 0-1
            const ny = y / height;  // 0-1

            let elevation = 100; // Default land elevation

            // === WATER BODIES ===

            // Atlantic Ocean (west)
            if (nx < 0.08) {
                elevation = Math.floor(10 + Math.random() * 20);
            }

            // Mediterranean Sea - complex shape
            else if (isMediterraneanSea(nx, ny)) {
                elevation = Math.floor(20 + Math.random() * 25);
            }

            // Black Sea
            else if (nx > 0.58 && nx < 0.70 && ny > 0.22 && ny < 0.32) {
                elevation = Math.floor(25 + Math.random() * 20);
            }

            // Caspian Sea
            else if (nx > 0.85 && nx < 0.93 && ny > 0.28 && ny < 0.42) {
                elevation = Math.floor(15 + Math.random() * 25);
            }

            // Red Sea
            else if (nx > 0.68 && nx < 0.73 && ny > 0.70 && ny < 0.88) {
                elevation = Math.floor(30 + Math.random() * 15);
            }

            // Persian Gulf
            else if (nx > 0.85 && nx < 0.94 && ny > 0.65 && ny < 0.72) {
                elevation = Math.floor(25 + Math.random() * 20);
            }

            // === MOUNTAIN RANGES ===

            // Alps (Central Europe)
            else if (nx > 0.32 && nx < 0.42 && ny > 0.28 && ny < 0.36) {
                const dist = Math.abs(nx - 0.37) + Math.abs(ny - 0.32);
                elevation = Math.floor(200 - dist * 300);
            }

            // Pyrenees (France-Spain)
            else if (nx > 0.08 && nx < 0.16 && ny > 0.42 && ny < 0.48) {
                const dist = Math.abs(ny - 0.45);
                elevation = Math.floor(180 - dist * 400);
            }

            // Apennines (Italy)
            else if (nx > 0.34 && nx < 0.40 && ny > 0.38 && ny < 0.54) {
                const dist = Math.abs(nx - 0.37);
                elevation = Math.floor(150 - dist * 500);
            }

            // Balkans/Dinaric Alps
            else if (nx > 0.42 && nx < 0.52 && ny > 0.34 && ny < 0.46) {
                elevation = Math.floor(120 + Math.random() * 60);
            }

            // Caucasus Mountains
            else if (nx > 0.72 && nx < 0.82 && ny > 0.26 && ny < 0.34) {
                const dist = Math.abs(nx - 0.77) + Math.abs(ny - 0.30);
                elevation = Math.floor(220 - dist * 400);
            }

            // Zagros Mountains (Persia)
            else if (nx > 0.86 && nx < 0.96 && ny > 0.42 && ny < 0.60) {
                const dist = Math.abs(nx - 0.91);
                elevation = Math.floor(180 - dist * 400);
            }

            // Atlas Mountains (North Africa)
            else if (nx > 0.14 && nx < 0.28 && ny > 0.62 && ny < 0.70) {
                const dist = Math.abs(ny - 0.66);
                elevation = Math.floor(160 - dist * 400);
            }

            // Taurus Mountains (Anatolia)
            else if (nx > 0.62 && nx < 0.74 && ny > 0.38 && ny < 0.46) {
                elevation = Math.floor(140 + Math.random() * 40);
            }

            // === DESERTS ===

            // Sahara Desert
            else if (ny > 0.68 && ny < 0.92 && nx > 0.12 && nx < 0.68) {
                elevation = Math.floor(60 + Math.random() * 30);
            }

            // Arabian Desert
            else if (nx > 0.74 && nx < 0.96 && ny > 0.72) {
                elevation = Math.floor(65 + Math.random() * 25);
            }

            // Syrian Desert
            else if (nx > 0.70 && nx < 0.82 && ny > 0.58 && ny < 0.68) {
                elevation = Math.floor(70 + Math.random() * 30);
            }

            // === REGIONS ===

            // British Isles
            else if (nx > 0.12 && nx < 0.24 && ny > 0.08 && ny < 0.22) {
                elevation = Math.floor(75 + Math.random() * 35);
            }

            // Iberian Peninsula
            else if (nx > 0.06 && nx < 0.20 && ny > 0.42 && ny < 0.60) {
                elevation = Math.floor(85 + Math.random() * 40);
            }

            // France/Gaul
            else if (nx > 0.14 && nx < 0.32 && ny > 0.28 && ny < 0.44) {
                elevation = Math.floor(80 + Math.random() * 30);
            }

            // Italy
            else if (nx > 0.32 && nx < 0.42 && ny > 0.36 && ny < 0.56) {
                elevation = Math.floor(90 + Math.random() * 35);
            }

            // Greece/Balkans
            else if (nx > 0.44 && nx < 0.56 && ny > 0.38 && ny < 0.50) {
                elevation = Math.floor(95 + Math.random() * 40);
            }

            // Anatolia (Asia Minor)
            else if (nx > 0.56 && nx < 0.74 && ny > 0.36 && ny < 0.52) {
                elevation = Math.floor(100 + Math.random() * 45);
            }

            // Egypt (Nile Valley)
            else if (nx > 0.62 && nx < 0.70 && ny > 0.70 && ny < 0.86) {
                elevation = Math.floor(70 + Math.random() * 20);
            }

            // Levant (Syria/Palestine)
            else if (nx > 0.68 && nx < 0.76 && ny > 0.54 && ny < 0.70) {
                elevation = Math.floor(85 + Math.random() * 35);
            }

            // Mesopotamia
            else if (nx > 0.76 && nx < 0.88 && ny > 0.56 && ny < 0.70) {
                elevation = Math.floor(75 + Math.random() * 25);
            }

            // Persia
            else if (nx > 0.82 && nx < 0.98 && ny > 0.38 && ny < 0.68) {
                elevation = Math.floor(110 + Math.random() * 50);
            }

            // Ukrainian Steppe
            else if (ny < 0.24 && nx > 0.48) {
                elevation = Math.floor(80 + Math.random() * 20);
            }

            // Central Europe
            else if (nx > 0.28 && nx < 0.52 && ny > 0.18 && ny < 0.34) {
                elevation = Math.floor(90 + Math.random() * 35);
            }

            // North Africa coast
            else if (ny > 0.58 && ny < 0.70 && nx > 0.12 && nx < 0.68) {
                elevation = Math.floor(75 + Math.random() * 30);
            }

            // Add some randomness to make it look natural
            elevation = Math.max(0, Math.min(255, elevation + Math.floor((Math.random() - 0.5) * 10)));

            row.push(elevation);
        }
        map.push(row);
    }

    return map;
}

/**
 * Check if coordinates are in Mediterranean Sea
 */
function isMediterraneanSea(nx, ny) {
    // Western Mediterranean (between Spain and North Africa)
    if (nx > 0.18 && nx < 0.34 && ny > 0.52 && ny < 0.64) return true;

    // Tyrrhenian Sea (west of Italy)
    if (nx > 0.30 && nx < 0.38 && ny > 0.44 && ny < 0.56) return true;

    // Central Mediterranean (south of Italy)
    if (nx > 0.34 && nx < 0.46 && ny > 0.50 && ny < 0.62) return true;

    // Adriatic Sea (east of Italy)
    if (nx > 0.38 && nx < 0.46 && ny > 0.38 && ny < 0.50) return true;

    // Ionian Sea
    if (nx > 0.42 && nx < 0.52 && ny > 0.46 && ny < 0.58) return true;

    // Aegean Sea (between Greece and Anatolia)
    if (nx > 0.50 && nx < 0.60 && ny > 0.42 && ny < 0.52) return true;

    // Eastern Mediterranean (south of Anatolia)
    if (nx > 0.54 && nx < 0.70 && ny > 0.48 && ny < 0.64) return true;

    // Levantine Sea
    if (nx > 0.64 && nx < 0.72 && ny > 0.56 && ny < 0.68) return true;

    return false;
}

/**
 * Convert height to terrain type
 */
function heightToTerrain(height) {
    if (height <= 50) return 'water';
    if (height <= 80) return 'plains';
    if (height <= 120) return 'hills';
    return 'mountains';
}

/**
 * Get color from height value
 */
function heightToColor(height) {
    if (height <= 15) return '#0a3d5c';      // Deep ocean
    if (height <= 30) return '#1a5d7a';      // Ocean
    if (height <= 50) return '#4a8fc4';      // Shallow water
    if (height <= 65) return '#d4c4a0';      // Desert/lowland
    if (height <= 80) return '#c4b896';      // Plains
    if (height <= 100) return '#b8c896';     // Fertile plains
    if (height <= 120) return '#a8b968';     // Low hills
    if (height <= 150) return '#98a858';     // Hills
    if (height <= 180) return '#887848';     // Mountains
    return '#786838';                         // High mountains
}

// Generate the heightmap on load
const MEDITERRANEAN_HEIGHTMAP = generateMediterraneanHeightmap();
