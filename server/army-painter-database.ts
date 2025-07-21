export interface ArmyPainterPaintData {
  name: string;
  type: string;
  color: string;
  productCode: string;
  description?: string;
}

export const ARMY_PAINTER_PAINTS: ArmyPainterPaintData[] = [
  // WARPAINTS FANATIC - Core Range
  { name: "Matt White", type: "Warpaints Fanatic", color: "#FFFFFF", productCode: "WP3001" },
  { name: "Matt Black", type: "Warpaints Fanatic", color: "#000000", productCode: "WP3002" },
  { name: "Pure Red", type: "Warpaints Fanatic", color: "#DC143C", productCode: "WP3003" },
  { name: "Dragon Red", type: "Warpaints Fanatic", color: "#B22222", productCode: "WP3004" },
  { name: "Bright Red", type: "Warpaints Fanatic", color: "#FF0000", productCode: "WP3005" },
  { name: "Lava Orange", type: "Warpaints Fanatic", color: "#FF4500", productCode: "WP3006" },
  { name: "Bright Orange", type: "Warpaints Fanatic", color: "#FFA500", productCode: "WP3007" },
  { name: "Desert Yellow", type: "Warpaints Fanatic", color: "#F0E68C", productCode: "WP3008" },
  { name: "Angel Yellow", type: "Warpaints Fanatic", color: "#FFFF00", productCode: "WP3009" },
  { name: "Electric Blue", type: "Warpaints Fanatic", color: "#0080FF", productCode: "WP3010" },
  { name: "Ocean Blue", type: "Warpaints Fanatic", color: "#006994", productCode: "WP3011" },
  { name: "Deep Blue", type: "Warpaints Fanatic", color: "#000080", productCode: "WP3012" },
  { name: "Alien Purple", type: "Warpaints Fanatic", color: "#9932CC", productCode: "WP3013" },
  { name: "Ash Grey", type: "Warpaints Fanatic", color: "#A9A9A9", productCode: "WP3014" },
  { name: "Necromancer Cloak", type: "Warpaints Fanatic", color: "#36454F", productCode: "WP3015" },
  { name: "Grimm Black", type: "Warpaints Fanatic", color: "#2F2F2F", productCode: "WP3016" },
  { name: "Jungle Green", type: "Warpaints Fanatic", color: "#228B22", productCode: "WP3017" },
  { name: "Greenskin", type: "Warpaints Fanatic", color: "#32CD32", productCode: "WP3018" },
  { name: "Goblin Green", type: "Warpaints Fanatic", color: "#ADFF2F", productCode: "WP3019" },
  { name: "Leather Brown", type: "Warpaints Fanatic", color: "#8B4513", productCode: "WP3020" },
  { name: "Dirt Spatter", type: "Warpaints Fanatic", color: "#654321", productCode: "WP3021" },
  { name: "Skeleton Bone", type: "Warpaints Fanatic", color: "#F5DEB3", productCode: "WP3022" },
  { name: "Fur Brown", type: "Warpaints Fanatic", color: "#A0522D", productCode: "WP3023" },
  { name: "Arid Earth", type: "Warpaints Fanatic", color: "#D2691E", productCode: "WP3024" },
  { name: "Peasant Skin", type: "Warpaints Fanatic", color: "#FDBCB4", productCode: "WP3025" },
  { name: "Barbarian Flesh", type: "Warpaints Fanatic", color: "#FFE4C4", productCode: "WP3026" },
  { name: "Tan", type: "Warpaints Fanatic", color: "#D2B48C", productCode: "WP3027" },
  { name: "Kobold Skin", type: "Warpaints Fanatic", color: "#CD853F", productCode: "WP3028" },
  { name: "Banshee Brown", type: "Warpaints Fanatic", color: "#8B7355", productCode: "WP3029" },
  { name: "Plasma Coil Glow", type: "Warpaints Fanatic", color: "#00FFFF", productCode: "WP3030" },

  // WARPAINTS FANATIC - Effects
  { name: "Ash Grey", type: "Warpaints Fanatic Effects", color: "#A9A9A9", productCode: "WP3031" },
  { name: "Glistening Blood", type: "Warpaints Fanatic Effects", color: "#8B0000", productCode: "WP3032" },
  { name: "Disgusting Slime", type: "Warpaints Fanatic Effects", color: "#9ACD32", productCode: "WP3033" },
  { name: "Toxic Mist", type: "Warpaints Fanatic Effects", color: "#ADFF2F", productCode: "WP3034" },
  { name: "Oozing Purple", type: "Warpaints Fanatic Effects", color: "#8A2BE2", productCode: "WP3035" },
  { name: "Prismatic Spray", type: "Warpaints Fanatic Effects", color: "#FF00FF", productCode: "WP3036" },
  { name: "Aegis Suit", type: "Warpaints Fanatic Effects", color: "#4169E1", productCode: "WP3037" },
  { name: "Scaly Hide", type: "Warpaints Fanatic Effects", color: "#228B22", productCode: "WP3038" },
  { name: "Zealot Yellow", type: "Warpaints Fanatic Effects", color: "#FFD700", productCode: "WP3039" },
  { name: "Venom Wyrm", type: "Warpaints Fanatic Effects", color: "#32CD32", productCode: "WP3040" },

  // WARPAINTS FANATIC - Metallics
  { name: "Plate Mail Metal", type: "Warpaints Fanatic Metallics", color: "#C0C0C0", productCode: "WP3041" },
  { name: "Weapon Bronze", type: "Warpaints Fanatic Metallics", color: "#CD7F32", productCode: "WP3042" },
  { name: "Bright Gold", type: "Warpaints Fanatic Metallics", color: "#FFD700", productCode: "WP3043" },
  { name: "Gun Metal", type: "Warpaints Fanatic Metallics", color: "#2C3539", productCode: "WP3044" },
  { name: "Shining Silver", type: "Warpaints Fanatic Metallics", color: "#C0C0C0", productCode: "WP3045" },
  { name: "Greedy Gold", type: "Warpaints Fanatic Metallics", color: "#B8860B", productCode: "WP3046" },
  { name: "Rough Iron", type: "Warpaints Fanatic Metallics", color: "#696969", productCode: "WP3047" },
  { name: "Ancient Bronze", type: "Warpaints Fanatic Metallics", color: "#8B4513", productCode: "WP3048" },
  { name: "Dragon Copper", type: "Warpaints Fanatic Metallics", color: "#B87333", productCode: "WP3049" },
  { name: "Mythril", type: "Warpaints Fanatic Metallics", color: "#E6E6FA", productCode: "WP3050" },

  // WARPAINTS FANATIC - Washes
  { name: "Dark Tone", type: "Warpaints Fanatic Wash", color: "#4A4A4A", productCode: "WP3051" },
  { name: "Strong Tone", type: "Warpaints Fanatic Wash", color: "#8B4513", productCode: "WP3052" },
  { name: "Soft Tone", type: "Warpaints Fanatic Wash", color: "#DEB887", productCode: "WP3053" },
  { name: "Light Tone", type: "Warpaints Fanatic Wash", color: "#F5DEB3", productCode: "WP3054" },
  { name: "Red Tone", type: "Warpaints Fanatic Wash", color: "#8B0000", productCode: "WP3055" },
  { name: "Green Tone", type: "Warpaints Fanatic Wash", color: "#006400", productCode: "WP3056" },
  { name: "Blue Tone", type: "Warpaints Fanatic Wash", color: "#000080", productCode: "WP3057" },
  { name: "Purple Tone", type: "Warpaints Fanatic Wash", color: "#4B0082", productCode: "WP3058" },
  { name: "Military Shader", type: "Warpaints Fanatic Wash", color: "#556B2F", productCode: "WP3059" },
  { name: "Flesh Wash", type: "Warpaints Fanatic Wash", color: "#CD853F", productCode: "WP3060" },

  // SPEEDPAINT - One Coat Coverage
  { name: "Grim Black", type: "Speedpaint", color: "#000000", productCode: "SP1001" },
  { name: "Ash Grey", type: "Speedpaint", color: "#A9A9A9", productCode: "SP1002" },
  { name: "Stone Grey", type: "Speedpaint", color: "#808080", productCode: "SP1003" },
  { name: "Wolf Grey", type: "Speedpaint", color: "#DCDCDC", productCode: "SP1004" },
  { name: "Pallid Bone", type: "Speedpaint", color: "#F5F5DC", productCode: "SP1005" },
  { name: "Skeleton Horde", type: "Speedpaint", color: "#F5DEB3", productCode: "SP1006" },
  { name: "Crusader Skin", type: "Speedpaint", color: "#FDBCB4", productCode: "SP1007" },
  { name: "Tanned Skin", type: "Speedpaint", color: "#D2B48C", productCode: "SP1008" },
  { name: "Barbarian Flesh", type: "Speedpaint", color: "#CD853F", productCode: "SP1009" },
  { name: "Orc Skin", type: "Speedpaint", color: "#6B8E23", productCode: "SP1010" },
  { name: "Goblin Skin", type: "Speedpaint", color: "#9ACD32", productCode: "SP1011" },
  { name: "Zealot Yellow", type: "Speedpaint", color: "#FFD700", productCode: "SP1012" },
  { name: "Lava Orange", type: "Speedpaint", color: "#FF4500", productCode: "SP1013" },
  { name: "Fire Giant Orange", type: "Speedpaint", color: "#FF6347", productCode: "SP1014" },
  { name: "Blood Red", type: "Speedpaint", color: "#DC143C", productCode: "SP1015" },
  { name: "Runic Red", type: "Speedpaint", color: "#B22222", productCode: "SP1016" },
  { name: "Hardened Carapace", type: "Speedpaint", color: "#8B4513", productCode: "SP1017" },
  { name: "Leather Brown", type: "Speedpaint", color: "#A0522D", productCode: "SP1018" },
  { name: "Fur Brown", type: "Speedpaint", color: "#654321", productCode: "SP1019" },
  { name: "Magic Blue", type: "Speedpaint", color: "#4169E1", productCode: "SP1020" },
  { name: "Imperial Blue", type: "Speedpaint", color: "#000080", productCode: "SP1021" },
  { name: "Sea Blue", type: "Speedpaint", color: "#006994", productCode: "SP1022" },
  { name: "Alien Purple", type: "Speedpaint", color: "#9932CC", productCode: "SP1023" },
  { name: "Hive Dweller Purple", type: "Speedpaint", color: "#663399", productCode: "SP1024" },
  { name: "Grim Black", type: "Speedpaint", color: "#2F2F2F", productCode: "SP1025" },

  // COLOUR PRIMER - Base Coats
  { name: "Matt White", type: "Colour Primer", color: "#FFFFFF", productCode: "CP3001" },
  { name: "Matt Black", type: "Colour Primer", color: "#000000", productCode: "CP3002" },
  { name: "Uniform Grey", type: "Colour Primer", color: "#808080", productCode: "CP3003" },
  { name: "Army Green", type: "Colour Primer", color: "#4B5320", productCode: "CP3004" },
  { name: "Crystal Blue", type: "Colour Primer", color: "#4169E1", productCode: "CP3005" },
  { name: "Dragon Red", type: "Colour Primer", color: "#B22222", productCode: "CP3006" },
  { name: "Goblin Green", type: "Colour Primer", color: "#32CD32", productCode: "CP3007" },
  { name: "Skeleton Bone", type: "Colour Primer", color: "#F5DEB3", productCode: "CP3008" },
  { name: "Leather Brown", type: "Colour Primer", color: "#8B4513", productCode: "CP3009" },
  { name: "Desert Yellow", type: "Colour Primer", color: "#F0E68C", productCode: "CP3010" },
  { name: "Plate Mail Metal", type: "Colour Primer", color: "#C0C0C0", productCode: "CP3011" },
  { name: "Gun Metal", type: "Colour Primer", color: "#2C3539", productCode: "CP3012" },
  { name: "Greedy Gold", type: "Colour Primer", color: "#B8860B", productCode: "CP3013" },
  { name: "Weapon Bronze", type: "Colour Primer", color: "#CD7F32", productCode: "CP3014" },
  { name: "Chaos Black", type: "Colour Primer", color: "#1C1C1C", productCode: "CP3015" },

  // AIR - Airbrush Ready
  { name: "Matt White", type: "Air", color: "#FFFFFF", productCode: "AW1001" },
  { name: "Matt Black", type: "Air", color: "#000000", productCode: "AW1002" },
  { name: "Angel Yellow", type: "Air", color: "#FFFF00", productCode: "AW1003" },
  { name: "Lava Orange", type: "Air", color: "#FF4500", productCode: "AW1004" },
  { name: "Pure Red", type: "Air", color: "#DC143C", productCode: "AW1005" },
  { name: "Alien Purple", type: "Air", color: "#9932CC", productCode: "AW1006" },
  { name: "Electric Blue", type: "Air", color: "#0080FF", productCode: "AW1007" },
  { name: "Jungle Green", type: "Air", color: "#228B22", productCode: "AW1008" },
  { name: "Leather Brown", type: "Air", color: "#8B4513", productCode: "AW1009" },
  { name: "Skeleton Bone", type: "Air", color: "#F5DEB3", productCode: "AW1010" },
  { name: "Ash Grey", type: "Air", color: "#A9A9A9", productCode: "AW1011" },
  { name: "Gun Metal", type: "Air", color: "#2C3539", productCode: "AW1012" },
  { name: "Plate Mail Metal", type: "Air", color: "#C0C0C0", productCode: "AW1013" },
  { name: "Bright Gold", type: "Air", color: "#FFD700", productCode: "AW1014" },
  { name: "Weapon Bronze", type: "Air", color: "#CD7F32", productCode: "AW1015" },

  // WARPAINTS - Classic Range
  { name: "Matt White", type: "Warpaints", color: "#FFFFFF", productCode: "WP1001" },
  { name: "Matt Black", type: "Warpaints", color: "#000000", productCode: "WP1002" },
  { name: "Ash Grey", type: "Warpaints", color: "#A9A9A9", productCode: "WP1003" },
  { name: "Uniform Grey", type: "Warpaints", color: "#808080", productCode: "WP1004" },
  { name: "Army Green", type: "Warpaints", color: "#4B5320", productCode: "WP1005" },
  { name: "Angel Green", type: "Warpaints", color: "#32CD32", productCode: "WP1006" },
  { name: "Goblin Green", type: "Warpaints", color: "#ADFF2F", productCode: "WP1007" },
  { name: "Crystal Blue", type: "Warpaints", color: "#4169E1", productCode: "WP1008" },
  { name: "Electric Blue", type: "Warpaints", color: "#0080FF", productCode: "WP1009" },
  { name: "Deep Blue", type: "Warpaints", color: "#000080", productCode: "WP1010" },
  { name: "Alien Purple", type: "Warpaints", color: "#9932CC", productCode: "WP1011" },
  { name: "Wizard Orb", type: "Warpaints", color: "#663399", productCode: "WP1012" },
  { name: "Royal Purple", type: "Warpaints", color: "#6A0DAD", productCode: "WP1013" },
  { name: "Vampire Red", type: "Warpaints", color: "#8B0000", productCode: "WP1014" },
  { name: "Pure Red", type: "Warpaints", color: "#DC143C", productCode: "WP1015" },
  { name: "Dragon Red", type: "Warpaints", color: "#B22222", productCode: "WP1016" },
  { name: "Lava Orange", type: "Warpaints", color: "#FF4500", productCode: "WP1017" },
  { name: "Daemonic Yellow", type: "Warpaints", color: "#FFD700", productCode: "WP1018" },
  { name: "Greenskin", type: "Warpaints", color: "#6B8E23", productCode: "WP1019" },
  { name: "Orc Skin", type: "Warpaints", color: "#8FBC8F", productCode: "WP1020" },
  { name: "Barbarian Flesh", type: "Warpaints", color: "#FDBCB4", productCode: "WP1021" },
  { name: "Tanned Flesh", type: "Warpaints", color: "#D2B48C", productCode: "WP1022" },
  { name: "Skeleton Bone", type: "Warpaints", color: "#F5DEB3", productCode: "WP1023" },
  { name: "Monster Brown", type: "Warpaints", color: "#654321", productCode: "WP1024" },
  { name: "Leather Brown", type: "Warpaints", color: "#8B4513", productCode: "WP1025" },
  { name: "Fur Brown", type: "Warpaints", color: "#A0522D", productCode: "WP1026" },
  { name: "Centaur Brown", type: "Warpaints", color: "#D2691E", productCode: "WP1027" },
  { name: "Desert Yellow", type: "Warpaints", color: "#F0E68C", productCode: "WP1028" },
  { name: "Spaceship Exterior", type: "Warpaints", color: "#36454F", productCode: "WP1029" },
  { name: "Necromancer Cloak", type: "Warpaints", color: "#2F2F2F", productCode: "WP1030" },

  // WARPAINTS FANATIC - Additional Colors (Expanding the range)
  { name: "Matt Primer", type: "Warpaints Fanatic", color: "#E5E5E5", productCode: "WP3061" },
  { name: "Chaotic Red", type: "Warpaints Fanatic", color: "#CD5C5C", productCode: "WP3062" },
  { name: "Phoenix Flames", type: "Warpaints Fanatic", color: "#FF6347", productCode: "WP3063" },
  { name: "Sunburst Yellow", type: "Warpaints Fanatic", color: "#FFD700", productCode: "WP3064" },
  { name: "Venom Wyrm", type: "Warpaints Fanatic", color: "#ADFF2F", productCode: "WP3065" },
  { name: "Elven Blue", type: "Warpaints Fanatic", color: "#4682B4", productCode: "WP3066" },
  { name: "Void Shield", type: "Warpaints Fanatic", color: "#483D8B", productCode: "WP3067" },
  { name: "Vampiric Skin", type: "Warpaints Fanatic", color: "#F5DEB3", productCode: "WP3068" },
  { name: "Troll Claws", type: "Warpaints Fanatic", color: "#8FBC8F", productCode: "WP3069" },
  { name: "Moonstone", type: "Warpaints Fanatic", color: "#F0F8FF", productCode: "WP3070" },

  // SPEEDPAINT - Additional Colors
  { name: "Highlord Blue", type: "Speedpaint", color: "#191970", productCode: "SP1026" },
  { name: "Gravelord Denim", type: "Speedpaint", color: "#4682B4", productCode: "SP1027" },
  { name: "Absolution Green", type: "Speedpaint", color: "#006400", productCode: "SP1028" },
  { name: "Holy White", type: "Speedpaint", color: "#FFFAF0", productCode: "SP1029" },
  { name: "Malefic Black", type: "Speedpaint", color: "#0F0F0F", productCode: "SP1030" },
  { name: "Slaughter Red", type: "Speedpaint", color: "#8B0000", productCode: "SP1031" },
  { name: "Mindstealer Magenta", type: "Speedpaint", color: "#DA70D6", productCode: "SP1032" },
  { name: "Algae Green", type: "Speedpaint", color: "#228B22", productCode: "SP1033" },
  { name: "Peachy Flesh", type: "Speedpaint", color: "#FFCBA4", productCode: "SP1034" },
  { name: "Satchel Brown", type: "Speedpaint", color: "#8B7355", productCode: "SP1035" },

  // EFFECTS WARPAINTS - Special effects range
  { name: "Gloss Varnish", type: "Effects", color: "#TRANSPARENT", productCode: "BR7000" },
  { name: "Anti-Shine Matt Varnish", type: "Effects", color: "#TRANSPARENT", productCode: "BR7001" },
  { name: "Warpaints Mixing Medium", type: "Effects", color: "#TRANSPARENT", productCode: "WP1473" },
  { name: "Disgusting Slime", type: "Effects", color: "#9ACD32", productCode: "WP1478" },
  { name: "Glistening Blood", type: "Effects", color: "#8B0000", productCode: "WP1479" },
  { name: "Oozing Purple", type: "Effects", color: "#8A2BE2", productCode: "WP1480" },
  { name: "Toxic Mist", type: "Effects", color: "#ADFF2F", productCode: "WP1481" },
  { name: "Plasma Coil Glow", type: "Effects", color: "#00FFFF", productCode: "WP1482" },
  { name: "Warpaints Stabilizer", type: "Effects", color: "#TRANSPARENT", productCode: "WP1474" },
  { name: "Quickshade Mixing Medium", type: "Effects", color: "#TRANSPARENT", productCode: "QS1001" },

  // FANATIC EFFECTS - Advanced texture and special effects
  { name: "Crushed Glass", type: "Fanatic Effects", color: "#F0F8FF", productCode: "WP3071" },
  { name: "Warped Reality", type: "Fanatic Effects", color: "#9932CC", productCode: "WP3072" },
  { name: "Xenomorph Poison", type: "Fanatic Effects", color: "#32CD32", productCode: "WP3073" },
  { name: "Energized Lightning", type: "Fanatic Effects", color: "#00BFFF", productCode: "WP3074" },
  { name: "Molten Lava", type: "Fanatic Effects", color: "#FF4500", productCode: "WP3075" },
  { name: "Frozen Tundra", type: "Fanatic Effects", color: "#B0E0E6", productCode: "WP3076" },
  { name: "Acid Burn", type: "Fanatic Effects", color: "#ADFF2F", productCode: "WP3077" },
  { name: "Prismatic Bolt", type: "Fanatic Effects", color: "#FF00FF", productCode: "WP3078" },
  { name: "Spectral Mist", type: "Fanatic Effects", color: "#E6E6FA", productCode: "WP3079" },
  { name: "Void Essence", type: "Fanatic Effects", color: "#2F2F2F", productCode: "WP3080" },

  // BATTLEFIELDS - Texture paints for bases and terrain
  { name: "Battlefield Rocks", type: "Battlefields", color: "#696969", productCode: "BF4111" },
  { name: "Brown Battleground", type: "Battlefields", color: "#8B4513", productCode: "BF4112" },
  { name: "Wasteland Soil", type: "Battlefields", color: "#D2691E", productCode: "BF4113" },
  { name: "Frozen Turf", type: "Battlefields", color: "#F0F8FF", productCode: "BF4114" },
  { name: "Swamp Turf", type: "Battlefields", color: "#556B2F", productCode: "BF4115" },
  { name: "Dead Grass", type: "Battlefields", color: "#BDB76B", productCode: "BF4116" },
  { name: "Jungle Turf", type: "Battlefields", color: "#228B22", productCode: "BF4117" },
  { name: "Desert Sand", type: "Battlefields", color: "#F4A460", productCode: "BF4118" },
  { name: "Highland Turf", type: "Battlefields", color: "#9ACD32", productCode: "BF4119" },
  { name: "Rocky Debris", type: "Battlefields", color: "#A9A9A9", productCode: "BF4120" },

  // WARPAINTS - Additional colors from newer releases
  { name: "Deep Blue", type: "Warpaints", color: "#000080", productCode: "WP1031" },
  { name: "Electric Blue", type: "Warpaints", color: "#0080FF", productCode: "WP1032" },
  { name: "Crystal Blue", type: "Warpaints", color: "#4169E1", productCode: "WP1033" },
  { name: "Fog Grey", type: "Warpaints", color: "#D3D3D3", productCode: "WP1034" },
  { name: "Wolf Grey", type: "Warpaints", color: "#DCDCDC", productCode: "WP1035" },
  { name: "Rough Iron", type: "Warpaints", color: "#696969", productCode: "WP1036" },
  { name: "Gun Metal", type: "Warpaints", color: "#2C3539", productCode: "WP1037" },
  { name: "Plate Mail Metal", type: "Warpaints", color: "#C0C0C0", productCode: "WP1038" },
  { name: "Bright Gold", type: "Warpaints", color: "#FFD700", productCode: "WP1039" },
  { name: "Weapon Bronze", type: "Warpaints", color: "#CD7F32", productCode: "WP1040" },
];

export function getAllArmyPainterPaints(): ArmyPainterPaintData[] {
  return ARMY_PAINTER_PAINTS;
}

export function getArmyPainterPaintsByType(type: string): ArmyPainterPaintData[] {
  return ARMY_PAINTER_PAINTS.filter(paint => paint.type === type);
}

export function searchArmyPainterPaints(query: string): ArmyPainterPaintData[] {
  const searchTerm = query.toLowerCase();
  return ARMY_PAINTER_PAINTS.filter(paint => 
    paint.name.toLowerCase().includes(searchTerm) ||
    paint.type.toLowerCase().includes(searchTerm) ||
    paint.productCode.toLowerCase().includes(searchTerm)
  );
}

export function getArmyPainterPaintByCode(productCode: string): ArmyPainterPaintData | undefined {
  return ARMY_PAINTER_PAINTS.find(paint => paint.productCode === productCode);
}