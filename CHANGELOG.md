# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [1.2.2] - 2026-02-22

### Added
- Added a lightweight repo-managed `scripts/git-hooks/pre-commit` hook to guard release branches by requiring `VERSION` to match `release/X.Y.Z` when enabled via `core.hooksPath`.

### Fixed
- Fixed leader selection state reset so starting a new game after changing century/faction requires a fresh ruler selection and does not reuse the previous leader's realm/town setup.
- Fixed GitHub Pages deployment timing by publishing from the `production` tag, so deployed builds reflect the finalized auto-tagged release state.
- Fixed app/save version drift by deriving runtime save versioning from generated `assets/version.js` (backed by `VERSION`) instead of a separate hardcoded JS semver constant.
- Fixed release branch version validation in CI by adding a dedicated `release-version-check` workflow and CI-aware branch-name detection in `scripts/check_release_version.sh`.
- Fixed release auto-tagging reliability by replacing the shared auto-tag workflow with a repo-local workflow that detects merged `release/*` PRs from the merge commit message (with API fallback) before creating release and `production` tags.
- Fixed empire-scenario start anchoring so leader-specific starting capitals (for example, Justinian at Constantinople) remain the primary army/camera focus even when other controlled capital-class cities (such as Rome) are also owned.
- Added primary/secondary capital-role assignment for player-controlled capital seats (with faction-specific capital-seat priority, including fallback seats such as Nicaea), so start anchoring and camera focus can prefer the active primary capital after territorial changes.

## [1.2.1] - 2026-02-22

### Added
- Added leader-specific campaign start zones (including enemy leaders) and local portrait placeholders for additional leaders.
- Added century-based historical town-control overrides so enemy factions control different towns by era.
- Added nomadic field-army starts for selected leaders in the `Building the Civilization` scenario.

### Changed
- Updated new-campaign camera focus to center on the selected side's starting realm (or starting army for no-city starts).
- Updated historical realm footprints to vary by selected leader within the same century (for example, `Belisarius` vs `Justinian`, `Alexios I` vs `Basil II`).

### Fixed
- Fixed enemy-leader campaigns incorrectly opening from Constantinople/Byzantine starting view.
- Fixed non-Byzantine unit names showing `Byzantine ...` labels for enemy/player forces when playing alternate factions.
- Fixed save/load restoration so the selected century is persisted and century-specific town control/core realms remain accurate after loading.
- Fixed duplicate century-core town assignments (including `rome`/`serdica`) that caused ambiguous faction ownership in some empire starts.

## [1.2.0] - 2026-02-22

### Added
- Added a temporary health ring that appears around recently damaged units on the map (green at high health, grading to red at low health).
- Added a new recruitable support unit: `Field Healer` (`healer`) with high adjacent healing output.
- Added unit-built permanent fortifications on map tiles via unit fortify action.
- Added fortification persistence to save/load data.
- Added enemy unit inspection panel with estimated stats and enemy-specific visual cues.
- Added leader portrait rendering in leader selection/detail panels from `assets/images/leaders/`.
- Added GitHub Pages deployment workflow that publishes only the static game runtime files.

### Changed
- Updated `Fortify` action to create/maintain defensive forts, apply fortified stance, and feed turn-based healing.
- Updated combat messaging to include the nearest town context for battle location readability.
- Updated loading screen branding to use the Byzantine eagle SVG emblem/background treatment.
- Updated UI typography to support a local embedded accent font for selected titles/names.

### Fixed
- Fixed unit healing flow by supporting recovery from friendly towns, fortified positions, and adjacent healer/support units.
- Fixed enemy-fort tile movement by requiring assault resolution before entering undefended enemy forts.
- Fixed an attack-action exploit by blocking unit attacks when the selected unit has no movement left.
- Fixed turn processing order so movement resets before automated destination movement is processed.
- Fixed `build_port` validation to check adjacent-water prerequisites before deducting resources.
- Fixed unit action panel behavior where `Move` incorrectly triggered attack logic.
- Fixed reference-map startup behavior by checking asset availability before loading the optional image.
- Fixed docs to match expanded map dimensions (`320x180`, 57,600 tiles) and current geography bounds.
- Fixed continue/load flow to resume ambient music after loading a saved game.
- Fixed transport embark/unload persistence by storing carried unit IDs and normalizing cargo on load.
- Fixed carried units being processed by automation while embarked.
- Fixed minimap territory overlay rendering to reuse realm-grid storage and reduce allocation churn.

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
