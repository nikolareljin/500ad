# Gameplay Systems

## Unit Health Visibility

- Units that have recently taken damage are rendered with a temporary health ring around the token.
- Ring color indicates health state:
  - Green: high health
  - Yellow/Orange: mid health
  - Red: critical health
- Numeric HP values are not rendered directly on the map.

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
