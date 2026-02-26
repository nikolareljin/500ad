# Geography Model

The `500ad` map uses a 320x180 tile projection of an expanded historic theater centered on Byzantine-era strategy regions.

## Bounds and Projection

- West: `-15` (Atlantic approaches west of Iberia)
- East: `92` (Central Asia and northwestern India edge)
- North: `60` (British Isles / northern Europe)
- South: `5` (Horn of Africa / southern Arabia)

Coordinates are converted using an equirectangular-style transform:

- `x = (lon - west) / (east - west) * (width - 1)`
- `y = (north - lat) / (north - south) * (height - 1)`

## Land and Sea Generation

`assets/geography.js` builds terrain from:

- Explicit coastline/land polygons for Europe, North/East Africa, Anatolia, Levant, Mesopotamia, Arabia, Caucasus, Central Asia, Iran, Afghanistan, and northwestern India.
- Distance-to-coast logic for shelf vs deep water outside polygons.
- Regional mountain signals (Alps, Caucasus, Taurus, Zagros, Atlas, Ethiopian Highlands).
- River carving (Nile, Danube, Tigris/Euphrates, Po, Rhone, Dnieper).
- Historic-map inspired terrain palette.

This replaces the prior synthetic continent-blob model that could place key cities on water.

## Generation Modes and Seeds

`js/map.js` now supports a world-generation config with two modes:

- `historical` (default): uses the historic Mediterranean/Old World geography + town/road placement.
- `procedural`: uses seeded noise layers to generate terrain (`water`, `plains`, `forest`, `hills`, `mountains`) and then assigns deterministic biomes (`plains`, `forest`, `desert`, `mountains`, `tundra`).

Both modes use the same grid tile structure (`tiles[y][x]`). Strategic resource placement is deterministic and seed-aware.

Current limitation:

- Procedural mode does not yet generate procedural rivers. River/fertility checks still depend on `MEDITERRANEAN_HEIGHTMAP`, so river-driven humidity/resource/foundation bonuses are effectively historical-map-only behavior for now.

### Runtime Modding Hooks (Browser Console)

- `window.getWorldGenerationConfig()` returns the active normalized generation config.
- `window.setWorldGenerationConfig(overrides)` merges overrides, stores them in `window.WORLD_GENERATION_CONFIG`, and regenerates the map.
- `window.setWorldGenerationConfig(overrides)` is intended for pre-game/testing use. Regenerating during an active session is blocked by default to avoid wiping tile ownership/buildings/forts while leaving turn/unit state intact.

Example:

```js
window.setWorldGenerationConfig({
  mode: 'procedural',
  seed: 'mod-test-1',
  resources: { spacing: 3 },
  climate: { tundraTemperatureThreshold: 0.24 }
});
```

### Biome Metadata

Each land tile can carry:

- `tile.biome` (`plains`, `forest`, `desert`, `mountains`, `tundra`)
- `tile.biomeEventWeights` (event-affinity hints for future event systems)

Biome rules currently affect:

- movement cost (via `GameState.getTerrainMoveCost()` + `gameMap.getBiomeEffects(...)`)
- strategic resource placement weights/richness distribution
- event propensity metadata for future systems

## Performance Notes

- Map rendering is viewport-based and only draws visible tiles plus a small buffer.
- Rendering uses `requestRender()` queueing to avoid unnecessary full-canvas redraw loops.
- Fog-of-war alpha values are cached to reduce per-frame recomputation costs on the larger map.

## Historical Town Placement

`js/map.js` defines towns with `lon/lat` and maps them to tile coordinates at startup.

Safeguard behavior:

- When placing each town, nearby `water` tiles in a 3x3 area are converted to land terrain.
- This prevents city centers such as Constantinople from appearing in isolated open-water cells due to rasterized coastline edges.

## Extending Geography

When adding regions/towns:

1. Extend `GEOGRAPHY_BOUNDS` only if absolutely necessary.
2. Add or refine `LAND_POLYGONS` first.
3. Add town via `historicTown(id, name, lon, lat, type, importance, extra)`.
4. Verify key cities render on land and near correct coastlines.
