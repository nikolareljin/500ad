# Changelog

All notable changes to this project are documented in this file.

## Releases

## [1.17.0] - 2026-03-05

### Added
- Added comprehensive performance monitoring system with profiling tools for frame timing, render operations, AI processing, and territory updates.
- Added performance debug tools accessible via browser console (`window.enablePerformanceMonitoring()`, `window.getPerformanceReport()`).
- Added render caching (`RenderCache`) for territory owner lookups per tile, reducing repeated computation during each frame; cache invalidates automatically on territory change.
- Added batch rendering for terrain, forts, roads, and resources to reduce draw calls.
- Added spatial filtering for unit rendering to skip off-screen units.
- Added AI processing optimizations with batch unit processing and performance timers.
- Added `window.getRenderCacheStats()` debug helper alongside existing monitoring tools.

### Changed
- Optimized map rendering with viewport buffering and three-pass batched draw order (terrain → overlays → fog) for correct rendering with better frame rates on large maps.
- Optimized AI turn processing with faction-level performance tracking and batched unit operations.
- Improved visible tile calculation with small buffer zone for smoother panning experience.
- Enhanced unit filtering to process only visible units during rendering.
- Replaced O(n) per-step unit collision check in AI with a pre-built position `Set` per faction turn, reducing AI turn complexity from O(n²) to O(n).

### Performance
- Reduced rendering overhead by batching similar draw operations together and caching per-tile territory results.
- Improved AI turn performance with O(1) position collision checks via pre-built Set, and per-faction timers.
- Added frame timing metrics to track FPS and identify performance bottlenecks.
- Implemented viewport-based culling to skip rendering of off-screen elements.

## [1.16.1] - 2026-03-05

### Fixed
- Disabled tutorial/onboarding flow for all sessions (new games and existing saves) by overriding persisted tutorial state at load time. Tutorial code remains in the codebase pending a proper implementation in issue #24.
- Removed the "Tutorial & Onboarding" entry from the Game Menu and updated stale notification copy that referenced it.

## [1.16.0] - 2026-03-02

### Added
- Added a modular in-game `Command Overview` rail with dedicated cards for `Resources`, `Faction Intel`, `City Management`, and `Events`.
- Added contextual quick-action buttons in the overview (`Build`, `Recruit`, `Diplomacy`, `Quests`) for faster navigation to core systems.
- Added inline tooltip hints on overview card headers and a toggleable contextual-help panel.

### Changed
- Updated HUD refresh flow to continuously sync overview metrics (stockpiles, faction pressure, city queue pressure, and active event status) as turns and actions progress.
- Updated mobile layout rules so the new overview rail remains readable and actionable on smaller resolutions.

## [1.15.0] - 2026-03-02

### Added
- Added a versioned save envelope format (`schemaVersion`, `format`, `metadata`, `payload`) in `storage.js` to stabilize serialized save structure for future migrations.
- Added legacy save normalization so older flat-save records are automatically wrapped into the new `{ schemaVersion, format, metadata, payload }` envelope on load/import.

### Changed
- Changed save-slot persistence to rewrite loaded legacy saves into the current envelope format after successful deserialization.
- Changed save export/import flows to validate and normalize save format instead of storing raw unvalidated JSON.

### Fixed
- Fixed save-slot robustness by validating slot identifiers before save/load/import operations and rejecting invalid slot inputs with clear failure responses.

## [1.14.0] - 2026-03-01

### Added
- Added unit upgrade-path definitions for core military lines (for example infantry, cavalry, siege, and naval evolutions) so veteran units can promote into stronger variants.
- Added per-city recruitment training queues with turn-based completion, including training-time calculations influenced by barracks level and leader recruitment speed.
- Added recruitment modal details for training duration, upkeep cost, and future upgrade branches to make army planning explicit before spending resources.
- Added a guided tutorial and onboarding flow that walks players through movement, combat, city building, diplomacy, and ending turns.
- Added contextual tutorial hints tied to the active onboarding step to support early-game pacing and discovery of core mechanics.
- Added tutorial replay access from the in-game menu, with explicit skip support during onboarding.

### Changed
- Changed level-up progression to use role-specific growth profiles (infantry/cavalry/special/naval) and promotion hooks once units reach veteran thresholds.
- Changed AI faction garrison spawning to use era-aware and faction-biased unit rosters, then apply turn-based veteran scaling so late campaigns field more advanced armies.
- Changed save data format to persist tutorial onboarding progress so campaigns can resume with correct tutorial state.

## [1.12.0] - 2026-02-28

### Added
- Added a true two-layer fog-of-war model with `unexplored` and `explored-but-not-currently-visible` states.
- Added unit and city vision-range rules to drive real-time visibility updates (including extended scout/intel and fortified-capital sight ranges).
- Added exploration discovery mechanics for macro-regions and landmark cities, including resource/prestige rewards and player-facing discovery notifications.
- Added auto-explore automation for `Explorer` and `Merchant Galley` units to reveal fog without constant manual input.

### Changed
- Changed map and minimap rendering to apply visibility-aware fog/shroud overlays instead of a single fog mask.
- Changed enemy visibility behavior so hostile units are only rendered and inspectable when they are in currently visible tiles.

### Fixed
- Fixed information leakage where enemy movement/position could still be observed through explored fog.
- Fixed save/load continuity for exploration by persisting fog exploration state and restoring it with the campaign.
- Fixed unit-move UX by adding explicit move-mode toggling for selected units (`double-click` on desktop, `double-tap` on touch) with clear ON/OFF status feedback.
- Fixed accidental map-tap movement by requiring intentional move-mode arming and allowing quick move-mode cancellation by tapping/clicking the selected unit again.
- Fixed mobile unit control obstruction by converting the unit panel to a compact bottom layout so map movement orders remain usable on small screens.

## [1.11.0] - 2026-02-28

### Added
- Added a full research progression pipeline with per-technology research time, single active-research tracking, and turn-by-turn completion.
- Added technology metadata for explicit unlock mapping across units, city buildings, and infrastructure actions.
- Added a new `Research & Technology Tree` modal with tiered node layout, status chips (`Available`, `Researching`, `Researched`, `Locked`), prerequisite display, unlock summaries, and start-research actions.

### Changed
- Changed research flow so selecting a technology now starts a project (cost paid on start) instead of completing instantly.
- Changed city build-action presentation to show availability/lock reasons (including tech prerequisites and resource/terrain constraints) directly in the build modal.
- Expanded technology effects to include diplomacy/trade integration (`diplomacyAcceptanceBonus`, `tradeIncomeMultiplier`) and applied those effects in diplomacy acceptance and trade-income simulation.

### Fixed
- Fixed unit and infrastructure progression gaps where advanced options could be accessed before their intended technology unlock.
- Fixed save-load compatibility for the new research state by normalizing/sanitizing active research data during deserialization.

## [1.10.0] - 2026-02-28

### Added
- Added a dynamic quest/event system that evaluates turn timing, frontier location pressure, faction relations, resource levels, and player progress.
- Added branching quest/event choices with consequence application for economy, reputation, and faction trust.
- Added a player-facing `Quests` panel in the action bar to review active items and apply choices.
- Added persistent quest/event history log storage in save data.

### Changed
- Updated end-turn flow to generate narrative opportunities during turn simulation and notify players when new items become available.
- Updated biome-event README notes to document active usage by the new dynamic event pipeline.

### Fixed
- Fixed quest/event choice resolution to validate affordability before applying costs, so choices now fail gracefully when required resources are insufficient.
- Fixed dynamic narrative trust-effect handling to ignore unsafe object keys from tampered data during choice application.

## [1.9.1] - 2026-02-27

### Fixed
- Clarified city build-mode UX in the build modal by showing explicit `Mode: AUTO` / `Mode: MANUAL` status in the header and action details.
- Updated auto-build toggle feedback to use explicit build-mode notifications (AUTO/MANUAL) instead of only ON/OFF wording.
- Re-opened the build modal immediately after toggling auto-build so players can verify mode changes without manually reopening the menu.

## [1.9.0] - 2026-02-27

### Added
- Added a tactical combat layer that triggers when armies engage and evaluates `attack`, `defense`, `morale`, and `speed`.
- Added formation systems for `Line`, `Wedge`, and `Shield Wall`, each with tactical tradeoffs.
- Added tactical terrain combat modifiers for `plains`, `forest`, `hills`, `mountains`, `city`, and `water`.
- Added concise combat-log/summary output that reports formation matchup, tactical stat context, damage exchange, and outcome.
- Added basic enemy tactical AI for formation selection based on terrain, unit condition, and battle type.

## [1.8.0] - 2026-02-27

### Added
- Added a city-building progression system with upgradeable building chains: `Farms`, `Barracks`, `Mines`, `Workshops`, `Temple`, and `Walls`.
- Added city construction projects with build-time progression (multi-turn completion) and per-city construction state persistence.
- Added a tech-dependent building tree with prerequisites and level-gated upgrades.

### Changed
- Updated city build UI to include dedicated city-building upgrades (with level, cost, and turns) alongside existing infrastructure actions.
- Updated recruitment in cities to account for city-development effects (training progression and city-based recruitment cost reductions).
- Updated city production to include building-level bonuses for food, manpower, gold, and strategic extraction (stone/iron).

### Fixed
- Fixed missing diplomacy combat enforcement so non-war factions can no longer be attacked before declaring war.
- Fixed battle-result notifications to clearly show outcome and post-battle HP for both sides.

## [1.7.0] - 2026-02-26

### Added
- Added a player-facing `Diplomacy & Trade` panel with faction actions for `Propose Truce`, `Propose Alliance`, `Trade Agreement`, and `Declare War`.
- Added persistent diplomacy state (`reputation`, per-faction treaty/trust, and trade routes) to save data and turn simulation.
- Added trade route simulation that generates income from active agreements, with disruption/raid outcomes recorded as world events.

### Changed
- Updated AI targeting behavior to respect non-hostile treaties (`truce`/`alliance`) when deciding direct attacks on player targets.
- Updated AI diplomacy pressure modeling to incorporate treaty outcomes, warfare focus, and hostility/reputation interactions.

### Fixed
- Fixed AI diplomacy/trade integration to use centralized game-state helpers for AI infrastructure upgrades and fortification updates.
- Fixed faction expansion/defense robustness by guarding historical-town lookups and handling spawn fallback paths consistently.
- Fixed diplomacy messaging/consistency issues (formatted faction names, no duplicate treaty hostility application, and no trust/reputation gain when trade-route creation fails).
- Fixed diplomacy/trade state isolation and safety in long campaigns (fresh state on new games, sanitized faction discovery, bounded trade-route reuse/retention, and escaped diplomacy modal content).

## [1.6.0] - 2026-02-26

### Added
- Added multi-faction enemy AI coordination that processes hostile forces by faction identity (for example `arab`, `bulgar`, `frank`, `sassanid`, `tribal`) instead of a single undifferentiated enemy blob.
- Added AI personality profiles (`aggressive`, `defensive`, `opportunistic`, `diplomatic`) with per-faction strategic bias values for warfare, defense, expansion, resource investment, and diplomacy.
- Added persistent AI faction state and world-event memory (`aiFactions`, `aiEvents`) to save data so AI personalities/intel/diplomacy persist across save/load.

### Changed
- Updated enemy turn logic to run faction-level strategic phases (diplomacy, resource investment, expansion, defense) before unit actions.
- Updated enemy target selection to score player units/cities by faction threat context and personality priorities instead of pure nearest-distance behavior.

### Fixed
- Fixed AI state initialization/restoration gaps by rebuilding faction intel from current world state after new-game setup and save load.
- Fixed AI personality behavior default wiring by exposing the shared profile-default helper to `state.js` at runtime.
- Fixed AI expansion event fidelity so `city_captured.cityFaction` reflects the pre-capture faction owner (`oldFaction`) for correct intel attribution.
- Fixed AI faction army-spawn signaling so `spawnFactionArmyAtTown(...)` returns success/failure and AI fallback fortification logic can react correctly.
- Fixed AI faction expansion pacing/economy balance by applying explicit stockpile costs and turn-based expansion limits.
- Fixed AI defense/expansion robustness by guarding direct `HISTORIC_TOWNS` lookups and reusing cached city-tile rebuilds after expansion-state invalidation.
- Fixed AI diplomacy-turn behavior drift by allowing warfare-focused plans to increase hostility pressure while diplomacy-focused plans reduce it.

## [1.5.0] - 2026-02-26

### Added
- Added a seeded world-generation configuration system (`historical` and optional `procedural` modes) with reproducible noise-based terrain/resource generation controls exposed for future modding.
- Added deterministic biome assignment (`plains`, `forest`, `desert`, `mountains`, `tundra`) for land tiles, including per-biome movement/resource/event-weight metadata stored on map tiles.
- Added runtime modding hooks `window.getWorldGenerationConfig()` and `window.setWorldGenerationConfig(...)` to inspect/override generation parameters and regenerate the map.

### Changed
- Updated strategic resource placement to use the world-generation seed/config (spacing, richness thresholds, target ratios) and biome-weighted resource multipliers.
- Updated movement cost calculation to include biome movement modifiers in addition to terrain and road effects.

### Fixed
- Fixed save/load consistency for seeded world-generation overrides by persisting the active generation config in save data and restoring it before map-state reconstruction.
- Prevented runtime world-generation config changes from silently regenerating the map during active sessions (unless explicitly forced by a controlled load/reset flow).
- Hardened procedural world-generation utilities (safe heightmap fallbacks, config merge/parsing guards, stable config comparison, and threshold validation edge cases).

## [1.4.0] - 2026-02-25

### Added
- Added deterministic strategic resource node distribution across the world map (`food`, `wood`, `stone`, `iron`, `rare`) with biome/terrain weighting and balanced spacing.
- Added map rendering overlays for resource nodes so strategic deposits are visible during gameplay.
- Added expanded HUD resource tracking for strategic stockpiles (`food`, `wood`, `stone`, `iron`, `rare`) in addition to `gold`, `manpower`, and `prestige`.
- Added reusable terrain-effect profiles and terrain/build suitability checks for city actions (farms, irrigation, forestry, canals).

### Changed
- Updated city production to include nearby terrain context (fertility, river access, coast access) and nearby strategic resources.
- Updated turn income to accumulate strategic stockpiles from city territory/resource access.
- Updated movement and combat terrain calculations to use shared terrain-effect logic, improving consistency between systems.
- Updated city build actions to apply terrain/resource-informed bonuses (for example stronger forts near stone and stronger food output near fertile/resource-rich tiles).
- Updated README documentation to describe strategic resources, terrain effects, and the expanded HUD.

### Fixed
- Fixed duplicate terrain modifier stacking in movement/combat so cavalry and mountain-unit terrain penalties/bonuses are applied once via shared terrain effects (and terrain defense is not double-counted).
- Fixed terrain movement balance regression by preventing shared terrain move-cost multipliers from compounding the base `TERRAIN_TYPES` move costs; shared effects now carry unit-specific movement modifiers only.
- Fixed nearby strategic resource yield scaling so distance/richness can reduce contributions to `0` instead of clamping every in-range node to at least `1`.
- Fixed fortification defense bonuses so built forts apply their defense multiplier on non-city tiles as well (not only in cities).
- Fixed combat fortification bonus stacking by avoiding duplicate fort defense application across shared terrain effects and battle-type fort modifiers.
- Fixed player resource stockpile normalization so loaded core/strategic resources are coerced to non-negative integers (preventing negative/decimal/string values from persisting in the HUD).

## [1.3.0] - 2026-02-24

### Added
- Created a high-resolution, scholarship-based portrait for Khosrow I (Anushiruvan), replacing the previous low-quality placeholder.
- Introduced distinct geometric shapes for on-map unit differentiation: Shields for Infantry, Circles for Cavalry, Hexagons for Naval, and Octagons for Special units.
- Added unique Unicode symbols for all 25+ unit types (e.g., 🪓 for Varangians, 🐘 for War Elephants, 🔥 for Greek Fire) to ensure quick visual identification.
- Categorized historical roads into distinct types: Roman Stone (Gray), Dirt (Brown), and Silk Road Sand (Beige), reflecting geographical and historical context.
- Implemented dynamic connectivity for the road network, creating fluid paths with rounded joins and seamless transitions between tiles.

### Changed
- Refined leader portraits (Alexios I, Alp Arslan, Khalid, Samuel, Totila, and Heraclius) by adding alpha transparency, removing white backgrounds for better UI blending.
- Enhanced the Selected Unit Panel with animated portraits, faction-specific radial gradients, and category-based visual cues (e.g., platinum highlights for Elite units).
- Updated city infrastructure rendering logic to inherit the new stone/dirt road coloring and connectivity improvements.
- Adjusted main menu aesthetics by switching the game subtitle to the accent display font.
- Overhauled unit rendering on the map with depth shadows, linear gradients, and reinforced borders for Heavy and Elite categories.

## [1.2.4] - 2026-02-23

### Changed
- Refreshed README screenshots and walkthrough media to match the current UI (main menu, leader selection, gameplay, technology, and turn-processing screens).
- Updated the README screenshot section layout to use the local `Technology & Research` and `Enemy Turn Processing` captures instead of the older external map-navigation image.

## [1.2.3] - 2026-02-23

### Changed
- Changed the default campaign scenario selection to `Managing an Empire` for new game setup.
- Refactored choice-modal disabled/detail styling from inline styles into reusable CSS classes for maintainability.
- Synced release metadata and runtime version files to `1.2.3`.

### Fixed
- Fixed city recruitment UI to display naval and advanced units as disabled when unavailable (instead of hiding them) and show clear missing requirements such as port access, technology, resources, or adjacent spawn tiles.
- Fixed mobile unit movement flow by hiding the unit panel (while keeping the unit selected) after tapping `Move`, so destination tiles remain tappable on small screens.
- Fixed release auto-tag workflow reruns so tagging can recover after partial failures (for example, when the release tag already exists but `production` still needs updating).
- Fixed release auto-tag fallback PR lookup reliability/permissions by retrying PR association lookup and granting `pull-requests: read` to the workflow.
- Fixed GitHub Pages deploy workflow redundancy by skipping `workflow_run` deployments when the `production` tag does not match the auto-tagged workflow commit.

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
