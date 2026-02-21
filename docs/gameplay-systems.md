# Gameplay Systems

## Unit Health Visibility

- Every unit is rendered with a health ring around the token.
- Ring color indicates health state:
  - Green: high health
  - Yellow/Orange: mid health
  - Red: critical health
- A numeric HP value is rendered for each unit directly on the map.

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
