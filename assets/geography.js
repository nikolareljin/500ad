/**
 * Geographic world heightmap for 500 A.D.
 * 200x120 equirectangular-style projection with deterministic terrain.
 *
 * Height values:
 * 0-30: Deep ocean
 * 31-50: Shallow water/coastal seas/rivers
 * 51-80: Plains/lowlands
 * 81-120: Hills/highlands
 * 121-180: Mountains
 * 181-255: High mountains/ice peaks
 */

const WORLD_MAP_WIDTH = 200;
const WORLD_MAP_HEIGHT = 120;

/**
 * Deterministic hash-based noise
 */
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
    valueNoise(x, y, 4) * 0.5 +
    valueNoise(x, y, 8) * 0.25 +
    valueNoise(x, y, 16) * 0.15 +
    valueNoise(x, y, 32) * 0.1
  );
}

function gaussian2D(nx, ny, cx, cy, rx, ry) {
  const dx = (nx - cx) / rx;
  const dy = (ny - cy) / ry;
  return Math.exp(-(dx * dx + dy * dy));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

/**
 * Major world river paths in normalized world coordinates.
 * These are stylized to fit 200x120 gameplay resolution.
 */
const WORLD_RIVER_PATHS = [
  // Nile
  [[0.58, 0.70], [0.585, 0.66], [0.59, 0.62], [0.60, 0.58], [0.61, 0.55]],
  // Amazon
  [[0.33, 0.60], [0.30, 0.60], [0.27, 0.61], [0.24, 0.60], [0.21, 0.59]],
  // Mississippi
  [[0.20, 0.28], [0.21, 0.33], [0.21, 0.38], [0.22, 0.44], [0.23, 0.50]],
  // Danube
  [[0.50, 0.30], [0.52, 0.31], [0.54, 0.32], [0.56, 0.32]],
  // Tigris-Euphrates (shared stylized basin)
  [[0.63, 0.43], [0.64, 0.45], [0.65, 0.48], [0.66, 0.51], [0.67, 0.54]],
  // Ganges
  [[0.70, 0.42], [0.72, 0.43], [0.74, 0.44], [0.76, 0.45]],
  // Yangtze
  [[0.78, 0.36], [0.80, 0.37], [0.82, 0.38], [0.84, 0.39], [0.86, 0.40]],
  // Yellow River
  [[0.79, 0.30], [0.81, 0.31], [0.83, 0.32], [0.85, 0.33]]
];

function isNearRiver(nx, ny) {
  const riverWidth = 0.006;

  for (const river of WORLD_RIVER_PATHS) {
    for (let i = 0; i < river.length - 1; i++) {
      const [ax, ay] = river[i];
      const [bx, by] = river[i + 1];
      if (distToSegment(nx, ny, ax, ay, bx, by) <= riverWidth) {
        return true;
      }
    }
  }

  return false;
}

function continentSignal(nx, ny) {
  // Approximate major landmasses with gaussian blobs.
  const northAmerica =
    gaussian2D(nx, ny, 0.17, 0.30, 0.17, 0.18) +
    gaussian2D(nx, ny, 0.22, 0.24, 0.12, 0.10) +
    gaussian2D(nx, ny, 0.11, 0.36, 0.12, 0.14);

  const southAmerica =
    gaussian2D(nx, ny, 0.28, 0.62, 0.09, 0.16) +
    gaussian2D(nx, ny, 0.30, 0.74, 0.06, 0.13);

  const europeAfrica =
    gaussian2D(nx, ny, 0.48, 0.30, 0.13, 0.10) +
    gaussian2D(nx, ny, 0.52, 0.56, 0.11, 0.18) +
    gaussian2D(nx, ny, 0.60, 0.46, 0.07, 0.10);

  const asia =
    gaussian2D(nx, ny, 0.68, 0.30, 0.23, 0.14) +
    gaussian2D(nx, ny, 0.77, 0.35, 0.16, 0.11) +
    gaussian2D(nx, ny, 0.73, 0.48, 0.13, 0.09);

  const australia = gaussian2D(nx, ny, 0.86, 0.72, 0.07, 0.05);
  const greenland = gaussian2D(nx, ny, 0.34, 0.13, 0.06, 0.06);

  // Antarctica as lower-latitude shelf.
  const antarctica = ny > 0.90 ? (ny - 0.90) * 5.5 : 0;

  return (
    northAmerica +
    southAmerica +
    europeAfrica +
    asia +
    australia +
    greenland +
    antarctica
  );
}

function seaCutSignal(nx, ny) {
  let cut = 0;

  // Mediterranean basin
  cut += gaussian2D(nx, ny, 0.57, 0.43, 0.10, 0.06) * 1.0;
  // Black Sea
  cut += gaussian2D(nx, ny, 0.61, 0.33, 0.05, 0.03) * 0.9;
  // Red Sea
  cut += gaussian2D(nx, ny, 0.62, 0.57, 0.03, 0.10) * 0.9;
  // Persian Gulf
  cut += gaussian2D(nx, ny, 0.66, 0.50, 0.03, 0.03) * 0.8;
  // Caribbean
  cut += gaussian2D(nx, ny, 0.22, 0.42, 0.05, 0.03) * 0.7;
  // Gulf of Mexico
  cut += gaussian2D(nx, ny, 0.18, 0.43, 0.05, 0.04) * 0.8;

  return cut;
}

function generateWorldHeightmap() {
  const map = [];

  for (let y = 0; y < WORLD_MAP_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < WORLD_MAP_WIDTH; x++) {
      const nx = x / (WORLD_MAP_WIDTH - 1);
      const ny = y / (WORLD_MAP_HEIGHT - 1);

      const lat = Math.abs((ny - 0.5) * 2); // 0 equator, 1 poles
      const n = fbm(nx, ny);
      const continents = continentSignal(nx, ny);
      const seas = seaCutSignal(nx, ny);
      const landScore = continents - seas + (n - 0.5) * 0.45;

      let elevation;

      if (landScore < 0.72) {
        // Ocean depth with continental shelf behavior.
        const shelf = clamp((0.75 - landScore) * 140, 0, 120);
        elevation = clamp(42 - shelf + n * 10, 2, 50);
      } else {
        // Land elevation with mountain ridges and polar ice.
        const inland = clamp((landScore - 0.72) / 1.2, 0, 1);
        const ridge = Math.pow(clamp((n - 0.45) * 1.8, 0, 1), 1.5);
        elevation = 52 + inland * 68 + ridge * 120;

        // Colder, higher terrain near poles.
        if (lat > 0.82) {
          elevation += (lat - 0.82) * 260;
        }

        // Major desert belts (Sahara/Arabia/Central Asia influences).
        const desertBand = Math.max(
          gaussian2D(nx, ny, 0.53, 0.63, 0.20, 0.08),
          gaussian2D(nx, ny, 0.66, 0.58, 0.15, 0.07)
        );
        elevation += desertBand * 8;
      }

      // Carve major rivers into lowland regions.
      if (isNearRiver(nx, ny) && elevation > 52 && elevation < 150) {
        elevation = Math.min(elevation, 47);
      }

      row.push(Math.floor(clamp(elevation, 0, 255)));
    }
    map.push(row);
  }

  return map;
}

/**
 * Convert height to terrain type
 */
function heightToTerrain(height) {
  if (height <= 50) return 'water';
  if (height <= 85) return 'plains';
  if (height <= 130) return 'hills';
  return 'mountains';
}

/**
 * Get color from height value
 */
function heightToColor(height) {
  if (height <= 12) return '#06273f';      // Abyssal ocean
  if (height <= 24) return '#0b3f63';      // Deep ocean
  if (height <= 38) return '#145f87';      // Open ocean
  if (height <= 50) return '#3f8fba';      // Shelf/coast/waterways
  if (height <= 65) return '#c9bf8e';      // Arid lowland
  if (height <= 85) return '#95ad6e';      // Plains
  if (height <= 110) return '#7f9b61';     // Uplands
  if (height <= 130) return '#6f8850';     // Hills
  if (height <= 165) return '#8a7a5f';     // Mountains
  if (height <= 200) return '#6e6358';     // High mountains
  return '#edf2f6';                         // Snow/ice peaks
}

// Keep name for compatibility with existing game code.
const MEDITERRANEAN_HEIGHTMAP = generateWorldHeightmap();
