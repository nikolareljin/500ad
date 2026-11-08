# 500 A.D. — Unit Art Prompts (E219)

Authoritative prompts for generating coherent 6th-century unit sprite assets in accordance with Keystone `docs/design/500ad-faction-units.md`.

## Generation Template

```text
Render a coherent sprite for [FACTION], [UNIT], [ROLE], 6th century, side-profile, historical equipment, [COLORS], flat vector, transparent background, crisp outline, 512x512, no background clutter.
```

## Art Guidelines

- **Style:** Flat vector, side-profile, transparent background, crisp outline, 512x512 master resolution.
- **Rules:** No firearms, no modern materials, no fantasy magic; natural skin tones by geography with zero stereotype exaggeration; recognizable at small sizes; off-white instead of pure white.
- **Historical Constraints (from Keystone Corrections):**
  - No 10th-century kite shields (use round and oval shields).
  - No medieval sailed longships (use rowed boats for 6th century).
  - Francisca is a light one-handed throwing axe, not a two-handed battle axe.
  - Anglo-Saxon units use Saxon household warriors (no Danish huscarls).
  - Italo-Roman infantry use late Roman oval shields and spathas (no earlier Principate pilum/gladius/testudo legionary).
  - Slavs fight predominantly on foot; cavalry are light scouts.

---

## Complete Prompt Catalog (43 Units)

### 1. Byzantium (`byzantine`)
- **Palette:** purple, deep red, gold
- **`foederati_horse_archer`**:
  `Render a coherent sprite for Byzantium, Foederati horse archers, horse archer, 6th century, side-profile, historical equipment composite bow short sword light lamellar, purple deep red gold, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`limitanei`**:
  `Render a coherent sprite for Byzantium, Limitanei, garrison, 6th century, side-profile, historical equipment spear shield local armor, purple deep red gold, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 2. Ostrogoths (`ostrogoth`)
- **Palette:** dark blue, silver, iron gray
- **`gothic_heavy_cavalry`**:
  `Render a coherent sprite for Ostrogoths, Gothic heavy cavalry, heavy cavalry, 6th century, side-profile, historical equipment lance sword round shield mail helmet, dark blue silver iron gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`gothic_infantry`**:
  `Render a coherent sprite for Ostrogoths, Gothic infantry, shield infantry, 6th century, side-profile, historical equipment spatha spear round shield mail shirt, dark blue silver iron gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`gothic_royal_guard`**:
  `Render a coherent sprite for Ostrogoths, Gothic royal guard, elite guard, 6th century, side-profile, historical equipment fine armor swords axes ornate round shields, dark blue silver iron gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`gothic_bowmen`**:
  `Render a coherent sprite for Ostrogoths, Gothic bowmen, archer, 6th century, side-profile, historical equipment bow sidearm, dark blue silver iron gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 3. Franks (`frank`)
- **Palette:** brown, dull gold, dark green
- **`frankish_axemen`**:
  `Render a coherent sprite for Franks, Frankish axemen, shock infantry, 6th century, side-profile, historical equipment francisca throwing axe spear round shield leather armor, brown dull gold dark green, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`frankish_spearmen`**:
  `Render a coherent sprite for Franks, Shieldwall spearmen, shield infantry, 6th century, side-profile, historical equipment spear round shield padded armor, brown dull gold dark green, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`leudes_cavalry`**:
  `Render a coherent sprite for Franks, Leudes cavalry, heavy cavalry, 6th century, side-profile, historical equipment lance sword round shield, brown dull gold dark green, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`frankish_skirmishers`**:
  `Render a coherent sprite for Franks, Frankish skirmishers, skirmisher, 6th century, side-profile, historical equipment javelins knife light shield, brown dull gold dark green, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 4. Angles, Saxons, Jutes (`anglo_saxon`)
- **Palette:** rust, ochre, off-white
- **`saxon_household`**:
  `Render a coherent sprite for Angles and Saxons, Saxon household warriors, elite guard, 6th century, side-profile, historical equipment spear sword large round shield mail, rust ochre off-white, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`seax_fighter`**:
  `Render a coherent sprite for Angles and Saxons, Seax fighter, shock infantry, 6th century, side-profile, historical equipment seax knife round shield axe spear, rust ochre off-white, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`saxon_javelin`**:
  `Render a coherent sprite for Angles and Saxons, Javelin skirmisher, skirmisher, 6th century, side-profile, historical equipment javelins sling dagger, rust ochre off-white, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`boat_raider`**:
  `Render a coherent sprite for Angles and Saxons, Raider boat infantry, naval raider, 6th century, side-profile, historical equipment axe shield rowed boat gear, rust ochre off-white, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 5. Levantine Byzantines (`byzantine`, Levant recruitment)
- **Palette:** sand, teal, bronze
- **`syrian_archer`**:
  `Render a coherent sprite for Levantine Byzantines, Syrian archer, archer, 6th century, side-profile, historical equipment composite bow light armor, sand teal bronze, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`levant_scout`**:
  `Render a coherent sprite for Levantine Byzantines, Light cavalry scout, scout cavalry, 6th century, side-profile, historical equipment spear bow light armor, sand teal bronze, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`hillman_skirmisher`**:
  `Render a coherent sprite for Levantine Byzantines, Hillman skirmisher, skirmisher, 6th century, side-profile, historical equipment javelins sling dagger, sand teal bronze, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 6. Byzantine Egyptians (`byzantine`, Egypt recruitment)
- **Palette:** linen, gold, dark red
- **`egyptian_bow_infantry`**:
  `Render a coherent sprite for Byzantine Egyptians, Bow infantry, archer, 6th century, side-profile, historical equipment composite bow short sword shield cloth armor, linen gold dark red, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`egyptian_camel_scout`**:
  `Render a coherent sprite for Byzantine Egyptians, Camel scout, camel, 6th century, side-profile, historical equipment bow spear camel harness, linen gold dark red, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`egyptian_guard`**:
  `Render a coherent sprite for Byzantine Egyptians, Late Roman guard, garrison, 6th century, side-profile, historical equipment shield spear sword armor, linen gold dark red, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 7. Ethiopians (`axum`)
- **Palette:** black, gold, red
- **`axumite_cavalry`**:
  `Render a coherent sprite for Ethiopians, Axumite cavalry, scout cavalry, 6th century, side-profile, historical equipment lance sword round shield leather armor iron helmet, black gold red, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`axumite_spearmen`**:
  `Render a coherent sprite for Ethiopians, Axumite spearmen, shield infantry, 6th century, side-profile, historical equipment spear tall hide shield sword armor, black gold red, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`ethiopian_archers`**:
  `Render a coherent sprite for Ethiopians, Ethiopian archers, archer, 6th century, side-profile, historical equipment bow quiver short sword, black gold red, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`axumite_guard`**:
  `Render a coherent sprite for Ethiopians, Royal infantry guard, elite guard, 6th century, side-profile, historical equipment fine armor sword spear, black gold red, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 8. Slavs (`slav`)
- **Palette:** wood brown, pale green, gray
- **`slav_skirmisher`**:
  `Render a coherent sprite for Slavs, Light skirmisher, skirmisher, 6th century, side-profile, historical equipment javelins axe small shield, wood brown pale green gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`slav_scout`**:
  `Render a coherent sprite for Slavs, Slavic mounted scout, scout cavalry, 6th century, side-profile, historical equipment spear bow small shield, wood brown pale green gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`slav_axe_infantry`**:
  `Render a coherent sprite for Slavs, Axe infantry, shock infantry, 6th century, side-profile, historical equipment battle axe shield, wood brown pale green gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`slav_archer`**:
  `Render a coherent sprite for Slavs, Woodland archer, archer, 6th century, side-profile, historical equipment bow dagger, wood brown pale green gray, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 9. Latins (`latin`)
- **Palette:** red, bronze, parchment
- **`italo_roman_infantry`**:
  `Render a coherent sprite for Latins, Italo-Roman infantry, shield infantry, 6th century, side-profile, historical equipment spear spatha oval shield mail, red bronze parchment, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`ballista_crew`**:
  `Render a coherent sprite for Latins, Ballista crew, artillery, 6th century, side-profile, historical equipment ballista tools short sword, red bronze parchment, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`latin_cavalry`**:
  `Render a coherent sprite for Latins, Latin cavalry, scout cavalry, 6th century, side-profile, historical equipment spear sword shield, red bronze parchment, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 10. China (`china`)
- **Palette:** jade, crimson, black, gold
- **`chinese_armored_cavalry`**:
  `Render a coherent sprite for China, Armored cavalry, heavy cavalry, 6th century, side-profile, historical equipment lamellar lance sword bow, jade crimson black gold, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`chinese_crossbow`**:
  `Render a coherent sprite for China, Crossbow infantry, archer, 6th century, side-profile, historical equipment crossbow spear shield armor, jade crimson black gold, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`chinese_polearm`**:
  `Render a coherent sprite for China, Polearm infantry, shield infantry, 6th century, side-profile, historical equipment polearm shield, jade crimson black gold, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`chinese_guard`**:
  `Render a coherent sprite for China, General's guard, elite guard, 6th century, side-profile, historical equipment fine armor multiple weapons, jade crimson black gold, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 11. Arabs (`arab`)
- **Palette:** white, indigo, sand
- **`arab_camel_archer`**:
  `Render a coherent sprite for Arabs, Camel archer, camel, 6th century, side-profile, historical equipment bow sword camel harness, white indigo sand, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`arab_skirmisher`**:
  `Render a coherent sprite for Arabs, Desert skirmisher, skirmisher, 6th century, side-profile, historical equipment javelin sword light shield, white indigo sand, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`arab_spear_cavalry`**:
  `Render a coherent sprite for Arabs, Spear cavalry, scout cavalry, 6th century, side-profile, historical equipment spear sword shield, white indigo sand, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`arab_tribal_elite`**:
  `Render a coherent sprite for Arabs, Tribal elite, elite guard, 6th century, side-profile, historical equipment fine armor spear sword, white indigo sand, flat vector, transparent background, crisp outline, 512x512, no background clutter.`

### 12. Nubians (`nubia`)
- **Palette:** ochre, black, cream
- **`nubian_archer`**:
  `Render a coherent sprite for Nubians, Nubian archer, archer, 6th century, side-profile, historical equipment bow quiver short sword, ochre black cream, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`nubian_spearman`**:
  `Render a coherent sprite for Nubians, Spearman, shield infantry, 6th century, side-profile, historical equipment spear ox-hide shield sidearm, ochre black cream, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`nubian_horseman`**:
  `Render a coherent sprite for Nubians, Desert horseman, scout cavalry, 6th century, side-profile, historical equipment spear shield sword, ochre black cream, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
- **`nubian_retainer`**:
  `Render a coherent sprite for Nubians, Elite retainer, elite guard, 6th century, side-profile, historical equipment fine weapons ornate shield, ochre black cream, flat vector, transparent background, crisp outline, 512x512, no background clutter.`
