/**
 * Geography heightmap for 500 A.D.
 *
 * The map is focused on the Byzantine strategic theater:
 * Europe, North Africa, Arabian Peninsula, Mesopotamia, and Ethiopia.
 */

const WORLD_MAP_WIDTH = 200;
const WORLD_MAP_HEIGHT = 120;

const GEOGRAPHY_BOUNDS = {
  west: -12,
  east: 56,
  north: 58,
  south: 8
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hash2D(x, y, seed = 1337) {
  let n = x * 374761393 + y * 668265263 + seed * 1013904223;
  n = (n ^ (n >> 13)) * 1274126177;
  n = n ^ (n >> 16);
  return (n >>> 0) / 4294967295;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x, y, scale = 1) {
  const fx = x * scale;
  const fy = y * scale;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const tx = fx - x0;
  const ty = fy - y0;
  const sx = smoothstep(tx);
  const sy = smoothstep(ty);

  const n00 = hash2D(x0, y0);
  const n10 = hash2D(x1, y0);
  const n01 = hash2D(x0, y1);
  const n11 = hash2D(x1, y1);

  const ix0 = n00 * (1 - sx) + n10 * sx;
  const ix1 = n01 * (1 - sx) + n11 * sx;

  return ix0 * (1 - sy) + ix1 * sy;
}

function fbm(x, y) {
  return (
    valueNoise(x, y, 3) * 0.50 +
    valueNoise(x, y, 7) * 0.25 +
    valueNoise(x, y, 13) * 0.15 +
    valueNoise(x, y, 25) * 0.10
  );
}

function gaussian2D(lon, lat, cx, cy, rx, ry) {
  const dx = (lon - cx) / rx;
  const dy = (lat - cy) / ry;
  return Math.exp(-(dx * dx + dy * dy));
}

function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLenSq = abx * abx + aby * aby;
  const t = abLenSq === 0 ? 0 : clamp((apx * abx + apy * aby) / abLenSq, 0, 1);
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  const dx = px - cx;
  const dy = py - cy;
  return Math.sqrt(dx * dx + dy * dy);
}

const RIVER_PATHS = [
  // Nile
  [[31, 25], [31, 22], [31, 19], [32, 16], [33, 13]],
  // Danube
  [[9, 48], [14, 47], [19, 46], [24, 45], [29, 45]],
  // Euphrates
  [[38, 38], [40, 36], [42, 34], [44, 32]],
  // Tigris
  [[43, 38], [44, 36], [45, 34], [46, 31]],
  // Po
  [[8, 45], [10, 45], [12, 45]],
  // Rhone
  [[6, 46], [5, 44], [5, 43]],
  // Dnieper
  [[31, 52], [31, 49], [31, 46]]
];

function isNearRiver(lon, lat) {
  const riverWidthDeg = 0.38;

  for (const river of RIVER_PATHS) {
    for (let i = 0; i < river.length - 1; i++) {
      const [ax, ay] = river[i];
      const [bx, by] = river[i + 1];
      if (distToSegment(lon, lat, ax, ay, bx, by) <= riverWidthDeg) {
        return true;
      }
    }
  }

  return false;
}

function landSignal(lon, lat) {
  let signal = 0;

  // Europe
  signal += gaussian2D(lon, lat, -3, 40, 8, 7) * 1.35;   // Iberia
  signal += gaussian2D(lon, lat, 3, 47, 12, 8) * 1.20;   // France + west Europe
  signal += gaussian2D(lon, lat, 12, 43, 3, 8) * 1.25;   // Italy
  signal += gaussian2D(lon, lat, 22, 44, 9, 6) * 1.25;   // Balkans
  signal += gaussian2D(lon, lat, 31, 50, 18, 9) * 1.15;  // East Europe
  signal += gaussian2D(lon, lat, -2, 54, 6, 5) * 1.05;   // British Isles

  // Byzantine core + Near East
  signal += gaussian2D(lon, lat, 33, 39, 10, 6) * 1.40;  // Anatolia
  signal += gaussian2D(lon, lat, 43, 34, 7, 5) * 1.10;   // Mesopotamia
  signal += gaussian2D(lon, lat, 37, 33, 4, 5) * 1.05;   // Levant
  signal += gaussian2D(lon, lat, 44, 23, 12, 10) * 1.25; // Arabian Peninsula

  // Africa
  signal += gaussian2D(lon, lat, 11, 31, 29, 6) * 1.35;  // North Africa coast band
  signal += gaussian2D(lon, lat, 39, 12, 9, 5) * 1.15;   // Ethiopia/Horn
  signal += gaussian2D(lon, lat, 31, 28, 5, 8) * 1.05;   // Egypt + Nile valley

  return signal;
}

function seaCutSignal(lon, lat) {
  let cut = 0;

  // Atlantic/ocean pressure from the west.
  if (lon < -7) {
    cut += ((-7 - lon) / 8) * 2.2;
  }

  // Key seas around the Mediterranean world.
  cut += gaussian2D(lon, lat, 6, 38, 16, 5) * 1.85;   // Western Mediterranean
  cut += gaussian2D(lon, lat, 17, 37, 13, 5) * 1.95;  // Central Mediterranean
  cut += gaussian2D(lon, lat, 28, 35, 12, 5) * 2.05;  // Eastern Mediterranean
  cut += gaussian2D(lon, lat, 21, 40, 4, 3) * 1.40;   // Adriatic
  cut += gaussian2D(lon, lat, 25, 39, 5, 3) * 1.45;   // Aegean
  cut += gaussian2D(lon, lat, 35, 44, 8, 3) * 1.75;   // Black Sea
  cut += gaussian2D(lon, lat, 50, 41, 5, 7) * 1.35;   // Caspian
  cut += gaussian2D(lon, lat, 40, 20, 3, 10) * 1.55;  // Red Sea
  cut += gaussian2D(lon, lat, 50, 27, 4, 3) * 1.45;   // Persian Gulf

  // English Channel / North Sea openings.
  cut += gaussian2D(lon, lat, -2, 51, 4, 2) * 0.85;
  cut += gaussian2D(lon, lat, 3, 54, 5, 3) * 0.65;

  return cut;
}

function mountainSignal(lon, lat) {
  let mountains = 0;

  mountains += gaussian2D(lon, lat, 10, 46, 4, 2) * 1.4;   // Alps
  mountains += gaussian2D(lon, lat, 0, 43, 3, 2) * 1.2;    // Pyrenees
  mountains += gaussian2D(lon, lat, 11, 42, 2, 5) * 0.9;   // Apennines
  mountains += gaussian2D(lon, lat, -4, 32, 9, 3) * 1.0;   // Atlas
  mountains += gaussian2D(lon, lat, 43, 42, 5, 2) * 1.45;  // Caucasus
  mountains += gaussian2D(lon, lat, 35, 38, 6, 2) * 1.0;   // Taurus
  mountains += gaussian2D(lon, lat, 46, 33, 5, 3) * 1.25;  // Zagros
  mountains += gaussian2D(lon, lat, 39, 11, 4, 3) * 1.25;  // Ethiopian Highlands

  return mountains;
}

function aridSignal(lon, lat) {
  return Math.max(
    gaussian2D(lon, lat, 10, 26, 24, 7), // Sahara edge
    gaussian2D(lon, lat, 45, 23, 11, 7)  // Arabian desert
  );
}

function generateWorldHeightmap() {
  const map = [];
  const lonSpan = GEOGRAPHY_BOUNDS.east - GEOGRAPHY_BOUNDS.west;
  const latSpan = GEOGRAPHY_BOUNDS.north - GEOGRAPHY_BOUNDS.south;

  for (let y = 0; y < WORLD_MAP_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WORLD_MAP_WIDTH; x++) {
      const nx = x / (WORLD_MAP_WIDTH - 1);
      const ny = y / (WORLD_MAP_HEIGHT - 1);
      const lon = GEOGRAPHY_BOUNDS.west + nx * lonSpan;
      const lat = GEOGRAPHY_BOUNDS.north - ny * latSpan;

      const n = fbm(nx, ny);
      const land = landSignal(lon, lat);
      const sea = seaCutSignal(lon, lat);
      const mountains = mountainSignal(lon, lat);
      const arid = aridSignal(lon, lat);

      const landScore = land - sea + (n - 0.5) * 0.28;

      let elevation;
      if (landScore < 0.92) {
        const shelf = clamp((0.95 - landScore) * 120, 0, 120);
        elevation = clamp(44 - shelf + n * 10, 2, 50);
      } else {
        const inland = clamp((landScore - 0.92) / 1.15, 0, 1);
        elevation = 55 + inland * 52 + mountains * 72 + n * 8;
        elevation += arid * 6;
      }

      // River carving for inland lowlands.
      if (isNearRiver(lon, lat) && elevation > 55 && elevation < 155) {
        elevation = Math.min(elevation, 48);
      }

      row.push(Math.floor(clamp(elevation, 0, 255)));
    }
    map.push(row);
  }

  return map;
}

function heightToTerrain(height) {
  if (height <= 50) return 'water';
  if (height <= 95) return 'plains';
  if (height <= 145) return 'hills';
  return 'mountains';
}

function heightToColor(height) {
  // Historic-map inspired palette: muted seas + parchment earth tones.
  if (height <= 12) return '#456f7a';      // Deep sea
  if (height <= 24) return '#598791';      // Open sea
  if (height <= 38) return '#76a19f';      // Coastal sea
  if (height <= 50) return '#95b8ad';      // Shallow water/rivers
  if (height <= 70) return '#d2c398';      // Coastal plains
  if (height <= 95) return '#c4b282';      // Plains
  if (height <= 120) return '#af9c73';     // Uplands
  if (height <= 145) return '#9b8765';     // Hills
  if (height <= 190) return '#7d6b55';     // Mountains
  return '#d8d2c6';                         // Snow/high peaks
}

// Keep name for compatibility with existing game code.
const MEDITERRANEAN_HEIGHTMAP = generateWorldHeightmap();
