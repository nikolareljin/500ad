# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

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

### Fixed
- Fixed player movement/action flow where clicks targeted wrong tiles after camera panning.
- Fixed action bar no-op behavior by wiring recruit/build/tech handlers.
- Fixed empty-player-army issue caused by invalid initial unit type IDs.

### Known Issues
- Global terrain quality still needs another realism pass (coastline precision, inland hydrography, and biome fidelity).
