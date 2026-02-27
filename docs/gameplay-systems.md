# Gameplay Systems

## Unit Health Visibility

- Units that have recently taken damage are rendered with a temporary health ring around the token.
- Ring color indicates health state:
  - Green: high health
  - Yellow/Orange: mid health
  - Red: critical health
- Numeric HP values are not rendered directly on the map.

## Tactical Combat Layer

- Battles now run through a tactical combat layer when opposing armies engage.
- Tactical combat evaluates four per-unit combat stats each battle:
  - `attack`
  - `defense`
  - `morale`
  - `speed`
- Formations are applied per side with tactical tradeoffs:
  - `line`: balanced
  - `wedge`: higher attack/speed, lower defense
  - `shield_wall`: higher defense/morale, lower attack/speed
- Terrain now affects tactical performance (`plains`, `forest`, `hills`, `mountains`, `city`, `water`) through attack/defense/speed/morale modifiers.
- Combat results include a concise tactical summary and combat log lines for formation matchup, stat context, damage exchange, and outcome.
- Enemy forces use basic tactical AI to select formations based on unit role, health/morale state, battle type, and terrain context.

## Healing and Recharge

Units recover health at end of turn from these sources:

- Friendly towns: strong passive healing.
- Fortified stance: additional passive healing.
- Adjacent support units: `priests` and `healer` contribute healing through `healingRate`.

## Healer Unit

- New unit: `Field Healer` (`healer`).
- Role: support / battlefield recovery.
- Availability: recruitable from developed cities (agriculture or monastic infrastructure).

## Fortifications

- Any unit can use Fortify to create a permanent fort on its tile.
- Forts grant:
  - Defensive combat reduction for defenders on the tile.
  - Defender counter-attack bonus.
- Empty enemy forts must be assaulted before a unit can move into the tile.
- Fort states are persisted in save data.

## Campaign Starts and Era Control

- Campaign starts now center on the selected leader's realm instead of always starting at Constantinople.
- Enemy/alternate-faction leaders can begin from leader-specific historical zones (for example, Italian, Bulgarian, Arab, or Persian theaters).
- Enemy town control varies by selected century through historical control overrides.
- In `Managing an Empire`, player-controlled capital seats can be tracked as `primary` or `secondary` (by realm/leader priority), allowing starts and camera focus to prefer the active primary capital even when multiple historic capitals are controlled.
- Some leaders can start as a field army (nomadic-style start) in `Building the Civilization`, with no initial town under player control.

## Multi-Faction AI Personalities

- Enemy turns are processed by faction identity (for example `arab`, `bulgar`, `frank`, `sassanid`, `tribal`) rather than as one shared AI block.
- Each AI faction uses a personality archetype:
  - `aggressive`
  - `defensive`
  - `opportunistic`
  - `diplomatic`
- Personalities influence strategic priorities for:
  - warfare target pressure
  - border defense/fortification
  - neutral-city expansion
  - resource/infrastructure investment
  - diplomacy hostility and treaty pressure toward the player
- AI factions react to world-state events (especially city captures) via persistent faction intel/threat memory.

## Diplomacy and Trade

- Player diplomacy panel supports:
  - `Propose Truce`
  - `Propose Alliance`
  - `Trade Agreement`
  - `Declare War`
- Diplomacy now tracks:
  - player `reputation` (`-100` to `100`)
  - per-faction treaty status (`war`, `truce`, `alliance`)
  - per-faction trust and hostility pressure
- Trade agreements create faction-linked trade routes that generate turn income (`gold`, optional `prestige` from alliance routes).
- Routes can be raided/disrupted based on hostility and war state; outcomes are recorded as world events and affect reputation.
- AI hostility and tactical target selection now honor treaty outcomes (for example, allied/truce factions avoid direct attacks).

## City Building and Construction

- Cities now support long-form building progression with upgrade levels:
  - `Farms`
  - `Barracks`
  - `Mines`
  - `Workshops`
  - `Temple`
  - `Walls`
- Construction is no longer instant for these projects:
  - each upgrade has explicit multi-turn build time
  - each city can run one active building project at a time
- Building access is tech/prerequisite gated:
  - examples include `Military Logistics`, `Caravan Routes`, `Monastic Scholarship`, and `Siegecraft`
- Building effects are integrated into core systems:
  - resource output (food/gold/manpower/strategic extraction)
  - unit training throughput and city recruitment discounts
  - research progression via temple-linked discount effects
  - city defense growth via walls and garrison reinforcement
