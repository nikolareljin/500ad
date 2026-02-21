# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Added per-unit health rings on the map (green at high health, grading to red at low health) plus numeric HP labels on each unit.
- Added a new recruitable support unit: `Field Healer` (`healer`) with high adjacent healing output.
- Added unit-built permanent fortifications on map tiles via unit fortify action.
- Added fortification persistence to save/load data.

### Changed
- Updated `Fortify` action to create/maintain defensive forts, apply fortified stance, and feed turn-based healing.
- Updated combat messaging to include the nearest town context for battle location readability.

### Fixed
- Fixed unit healing flow by supporting recovery from friendly towns, fortified positions, and adjacent healer/support units.
- Fixed enemy-fort tile movement by requiring assault resolution before entering undefended enemy forts.

## [1.1.0] - 2026-02-20

### Added
- Added a top-HUD minimap that shows the full world map with a highlighted viewport rectangle.
- Added minimap click and drag navigation to jump the main camera to any area quickly.
- Added responsive minimap sizing logic for desktop and mobile layouts.
- Added deterministic world-scale heightmap generation with continent/ocean shaping and major river carving.
- Added city simulation metadata on map tiles (population, production, infrastructure, wonders).
- Added visible city overlays for names, production, and wonders.
- Added road/agriculture/industry visual overlays in and around city tiles.
- Added working action-bar interactions for `Recruit`, `Build`, and `Technology`.
- Added dynamic city-based per-turn production integration (gold/manpower).
- Added recruitment spawn search for nearest valid adjacent tile.
- Added a polygon-based landmask geography model for Europe, Mediterranean, Mesopotamia, Arabia, and Ethiopia.
- Added city-adjacent terrain safety conversion to prevent key cities from ending up in isolated open-water tiles.
- Added scenario selection with two modes: `Building the Civilization` and `Managing an Empire`.
- Added historical tribe metadata and town ownership setup for scenario initialization.
- Added territory-control overlays and legend on both main map and minimap (player/hostile/neutral).
- Added a root `VERSION` file as canonical release version source.
- Added release scripts:
  - `scripts/version_set.sh`
  - `scripts/check_release_version.sh`
  - `scripts/tag_release.sh`
- Added generated runtime version asset: `assets/version.js`.

### Changed
- Moved minimap placement into the top interface area for constant visibility during play.
- Ensured minimap initialization runs for new game, continue, and load-from-slot flows.
- Reduced top HUD footprint by aligning resources/turn/actions/minimap in a compact row.
- Improved map fog rendering with softer gray transitions instead of hard square masking.
- Updated historic city coordinates and camera centering for global map projection.
- Fixed tile interaction conversion (screen-to-world with camera offset), enabling movement/selection after panning.
- Updated starting unit composition to valid unit IDs so game actions work correctly from turn 1.
- Updated win/loss Constantinople check to use city lookup instead of hardcoded coordinates.
- Rebalanced city economy and build progression costs for slower, more controllable scaling.
- Reworked map generation to follow real regional coastlines instead of synthetic continent blobs.
- Updated terrain rendering to a historic-map style color palette.
- Updated game start/load flow to initialize the map only after the game screen is visible, preventing zero-size canvas rendering.
- Updated save serialization version to `1.1.0` while keeping backward compatibility with older save versions.
- Updated README and in-game About modal to show `1.1.0`.
- Updated selected-unit panel layout to keep content visible with bounded height and internal scrolling.

### Fixed
- Fixed player movement/action flow where clicks targeted wrong tiles after camera panning.
- Fixed action bar no-op behavior by wiring recruit/build/tech handlers.
- Fixed empty-player-army issue caused by invalid initial unit type IDs.
- Fixed regression where Constantinople could render in ocean terrain due to geography mismatch.
- Fixed large map not rendering in some flows due to hidden-screen canvas initialization timing.
- Fixed selected-unit panel overflow where stats/actions were pushed below the visible area.
- Fixed town information visibility by adding tribe labels in city notifications.

### Known Issues
- Coastline detail still uses simplified polygons; fine-grained shoreline/island fidelity can be improved further.
