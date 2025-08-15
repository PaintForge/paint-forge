export interface Scale75PaintData {
  name: string;
  type: string;
  color: string;
  productCode: string;
  description?: string;
}

// Scale75 ScaleColor Range (63 colors)
export const SCALE75_SCALECOLOR: Scale75PaintData[] = [
  { name: "Black", type: "ScaleColor", color: "#000000", productCode: "SC-00" },
  { name: "White", type: "ScaleColor", color: "#ffffff", productCode: "SC-01" },
  { name: "Purity White", type: "ScaleColor", color: "#f8f8f8", productCode: "SC-02" },
  { name: "Birch", type: "ScaleColor", color: "#e8dcc0", productCode: "SC-03" },
  { name: "Pale Flesh", type: "ScaleColor", color: "#f4d5a7", productCode: "SC-04" },
  { name: "Basic Flesh", type: "ScaleColor", color: "#e6b896", productCode: "SC-05" },
  { name: "Elf Flesh", type: "ScaleColor", color: "#dfa882", productCode: "SC-06" },
  { name: "Dwarf Flesh", type: "ScaleColor", color: "#d89972", productCode: "SC-07" },
  { name: "Barbarian Flesh", type: "ScaleColor", color: "#c58660", productCode: "SC-08" },
  { name: "Tanned Flesh", type: "ScaleColor", color: "#b5714f", productCode: "SC-09" },
  { name: "Heavy Skintone", type: "ScaleColor", color: "#a55c3e", productCode: "SC-10" },
  { name: "Dark Flesh", type: "ScaleColor", color: "#944832", productCode: "SC-11" },
  { name: "Tenere Yellow", type: "ScaleColor", color: "#f9e71e", productCode: "SC-12" },
  { name: "Creamy Ivory", type: "ScaleColor", color: "#f0e6a2", productCode: "SC-13" },
  { name: "Mojave White", type: "ScaleColor", color: "#e8d5a8", productCode: "SC-14" },
  { name: "Sahara Yellow", type: "ScaleColor", color: "#e6c373", productCode: "SC-15" },
  { name: "Iroko", type: "ScaleColor", color: "#deb152", productCode: "SC-16" },
  { name: "Ochre Yellow", type: "ScaleColor", color: "#d69e31", productCode: "SC-17" },
  { name: "Mars Orange", type: "ScaleColor", color: "#ce8b10", productCode: "SC-18" },
  { name: "Orange Leather", type: "ScaleColor", color: "#c67800", productCode: "SC-19" },
  { name: "Petroleum Grey", type: "ScaleColor", color: "#666666", productCode: "SC-20" },
  { name: "Necro Red", type: "ScaleColor", color: "#8b2635", productCode: "SC-21" },
  { name: "Carmine Red", type: "ScaleColor", color: "#a01e36", productCode: "SC-22" },
  { name: "Blood Red", type: "ScaleColor", color: "#b51e31", productCode: "SC-23" },
  { name: "Ferrari Red", type: "ScaleColor", color: "#c9102c", productCode: "SC-24" },
  { name: "Antares Red", type: "ScaleColor", color: "#dc0228", productCode: "SC-25" },
  { name: "Flat Red", type: "ScaleColor", color: "#cc2936", productCode: "SC-26" },
  { name: "Volcano Orange", type: "ScaleColor", color: "#e64100", productCode: "SC-27" },
  { name: "Peach", type: "ScaleColor", color: "#f25a00", productCode: "SC-28" },
  { name: "Orange Fire", type: "ScaleColor", color: "#ff6d00", productCode: "SC-29" },
  { name: "Citrine Yellow", type: "ScaleColor", color: "#ffb300", productCode: "SC-30" },
  { name: "Harvest Yellow", type: "ScaleColor", color: "#ffd600", productCode: "SC-31" },
  { name: "Lime Green", type: "ScaleColor", color: "#a4c639", productCode: "SC-32" },
  { name: "Goblin Green", type: "ScaleColor", color: "#7cb518", productCode: "SC-33" },
  { name: "Elven Green", type: "ScaleColor", color: "#5aa400", productCode: "SC-34" },
  { name: "Amazon Mud", type: "ScaleColor", color: "#3d7c47", productCode: "SC-35" },
  { name: "Jungle Green", type: "ScaleColor", color: "#005425", productCode: "SC-36" },
  { name: "Caribbean Blue", type: "ScaleColor", color: "#00b9bd", productCode: "SC-37" },
  { name: "Blue Green", type: "ScaleColor", color: "#009688", productCode: "SC-38" },
  { name: "Turquoise", type: "ScaleColor", color: "#00acc1", productCode: "SC-39" },
  { name: "Deep Blue", type: "ScaleColor", color: "#0277bd", productCode: "SC-40" },
  { name: "Atlantic Blue", type: "ScaleColor", color: "#1565c0", productCode: "SC-41" },
  { name: "Blue", type: "ScaleColor", color: "#1976d2", productCode: "SC-42" },
  { name: "Intense Blue", type: "ScaleColor", color: "#2979ff", productCode: "SC-43" },
  { name: "Heavy Blue", type: "ScaleColor", color: "#3f51b5", productCode: "SC-44" },
  { name: "Violet", type: "ScaleColor", color: "#673ab7", productCode: "SC-45" },
  { name: "Royal Purple", type: "ScaleColor", color: "#9c27b0", productCode: "SC-46" },
  { name: "Magenta", type: "ScaleColor", color: "#e91e63", productCode: "SC-47" },
  { name: "Pink", type: "ScaleColor", color: "#ff6090", productCode: "SC-48" },
  { name: "Mauve", type: "ScaleColor", color: "#ad6bad", productCode: "SC-49" },
  { name: "Moonstone Blue", type: "ScaleColor", color: "#546e7a", productCode: "SC-50" },
  { name: "Black Metal", type: "ScaleColor", color: "#37474f", productCode: "SC-51" },
  { name: "Speed Metal", type: "ScaleColor", color: "#90a4ae", productCode: "SC-52" },
  { name: "Chrome", type: "ScaleColor", color: "#cfd8dc", productCode: "SC-53" },
  { name: "Necro Gold", type: "ScaleColor", color: "#b8860b", productCode: "SC-54" },
  { name: "Dwarven Gold", type: "ScaleColor", color: "#daa520", productCode: "SC-55" },
  { name: "Elven Gold", type: "ScaleColor", color: "#ffd700", productCode: "SC-56" },
  { name: "Copper", type: "ScaleColor", color: "#b87333", productCode: "SC-57" },
  { name: "Copper Red", type: "ScaleColor", color: "#cd853f", productCode: "SC-58" },
  { name: "Walnut Brown", type: "ScaleColor", color: "#795548", productCode: "SC-59" },
  { name: "Earth", type: "ScaleColor", color: "#8d6e63", productCode: "SC-60" },
  { name: "Leather Brown", type: "ScaleColor", color: "#a1887f", productCode: "SC-61" },
  { name: "Volcano Mud", type: "ScaleColor", color: "#6d4c41", productCode: "SC-62" }
];

// Scale75 Fantasy & Games Range
export const SCALE75_FANTASY_GAMES: Scale75PaintData[] = [
  { name: "Abyssal Blue", type: "Fantasy & Games", color: "#1a237e", productCode: "SMF-01" },
  { name: "Thrall Flesh", type: "Fantasy & Games", color: "#388e3c", productCode: "SMF-02" },
  { name: "Orc Flesh", type: "Fantasy & Games", color: "#689f38", productCode: "SMF-03" },
  { name: "Goblin Flesh", type: "Fantasy & Games", color: "#827717", productCode: "SMF-04" },
  { name: "Eldar Flesh", type: "Fantasy & Games", color: "#ffa726", productCode: "SMF-05" },
  { name: "Elf Skin", type: "Fantasy & Games", color: "#ffb74d", productCode: "SMF-06" },
  { name: "Dwarf Skin", type: "Fantasy & Games", color: "#d7ccc8", productCode: "SMF-07" },
  { name: "Hobbit Skin", type: "Fantasy & Games", color: "#f8bbd9", productCode: "SMF-08" },
  { name: "Wood Elf Skin", type: "Fantasy & Games", color: "#8bc34a", productCode: "SMF-09" },
  { name: "Undead Flesh", type: "Fantasy & Games", color: "#90a4ae", productCode: "SMF-10" },
  { name: "Zombie Flesh", type: "Fantasy & Games", color: "#78909c", productCode: "SMF-11" },
  { name: "Demon Red", type: "Fantasy & Games", color: "#d32f2f", productCode: "SMF-12" },
  { name: "Dragon Red", type: "Fantasy & Games", color: "#c62828", productCode: "SMF-13" },
  { name: "Beasty Brown", type: "Fantasy & Games", color: "#5d4037", productCode: "SMF-14" },
  { name: "Minotaur Hide", type: "Fantasy & Games", color: "#4e342e", productCode: "SMF-15" },
  { name: "Balrog Skin", type: "Fantasy & Games", color: "#3e2723", productCode: "SMF-16" },
  { name: "Werewolf Fur", type: "Fantasy & Games", color: "#6d4c41", productCode: "SMF-17" },
  { name: "Ogre Flesh", type: "Fantasy & Games", color: "#8d6e63", productCode: "SMF-18" },
  { name: "Troll Hide", type: "Fantasy & Games", color: "#a1887f", productCode: "SMF-19" },
  { name: "Fairy Wings", type: "Fantasy & Games", color: "#e1bee7", productCode: "SMF-20" },
  { name: "Dragon Green", type: "Fantasy & Games", color: "#388e3c", productCode: "SMF-21" },
  { name: "Forest Green", type: "Fantasy & Games", color: "#2e7d32", productCode: "SMF-22" },
  { name: "Magic Blue", type: "Fantasy & Games", color: "#1976d2", productCode: "SMF-23" },
  { name: "Spell Blue", type: "Fantasy & Games", color: "#1565c0", productCode: "SMF-24" },
  { name: "Lightning Yellow", type: "Fantasy & Games", color: "#fbc02d", productCode: "SMF-25" }
];

// Scale75 Warfront Range
export const SCALE75_WARFRONT: Scale75PaintData[] = [
  { name: "Panzer Grey", type: "Warfront", color: "#455a64", productCode: "SW-01" },
  { name: "Dunkelgrau", type: "Warfront", color: "#37474f", productCode: "SW-02" },
  { name: "Wehrmacht Grey", type: "Warfront", color: "#546e7a", productCode: "SW-03" },
  { name: "Luftwaffe Blue", type: "Warfront", color: "#263238", productCode: "SW-04" },
  { name: "Kriegsmarine Blue", type: "Warfront", color: "#1a237e", productCode: "SW-05" },
  { name: "Russian Green", type: "Warfront", color: "#2e7d32", productCode: "SW-06" },
  { name: "Soviet Green", type: "Warfront", color: "#388e3c", productCode: "SW-07" },
  { name: "Red Army", type: "Warfront", color: "#d32f2f", productCode: "SW-08" },
  { name: "US Army Green", type: "Warfront", color: "#689f38", productCode: "SW-09" },
  { name: "British Khaki", type: "Warfront", color: "#8bc34a", productCode: "SW-10" },
  { name: "Afrika Korps", type: "Warfront", color: "#ff8f00", productCode: "SW-11" },
  { name: "Desert Yellow", type: "Warfront", color: "#ffc107", productCode: "SW-12" },
  { name: "Tank Crew", type: "Warfront", color: "#5d4037", productCode: "SW-13" },
  { name: "Field Grey", type: "Warfront", color: "#616161", productCode: "SW-14" },
  { name: "Waffen SS", type: "Warfront", color: "#424242", productCode: "SW-15" },
  { name: "Naval Blue", type: "Warfront", color: "#1565c0", productCode: "SW-16" },
  { name: "Pilot Brown", type: "Warfront", color: "#6d4c41", productCode: "SW-17" },
  { name: "Leather Belt", type: "Warfront", color: "#8d6e63", productCode: "SW-18" },
  { name: "Steel", type: "Warfront", color: "#90a4ae", productCode: "SW-19" },
  { name: "Gun Metal", type: "Warfront", color: "#546e7a", productCode: "SW-20" }
];

// Scale75 Drop & Paint Range (sample of known colors)
export const SCALE75_DROP_PAINT: Scale75PaintData[] = [
  { name: "Blood Drop", type: "Drop & Paint", color: "#b71c1c", productCode: "DP-01" },
  { name: "Fire Drop", type: "Drop & Paint", color: "#ff5722", productCode: "DP-02" },
  { name: "Gold Drop", type: "Drop & Paint", color: "#ffc107", productCode: "DP-03" },
  { name: "Silver Drop", type: "Drop & Paint", color: "#9e9e9e", productCode: "DP-04" },
  { name: "Copper Drop", type: "Drop & Paint", color: "#ff8a65", productCode: "DP-05" },
  { name: "Bronze Drop", type: "Drop & Paint", color: "#a1887f", productCode: "DP-06" },
  { name: "Steel Drop", type: "Drop & Paint", color: "#78909c", productCode: "DP-07" },
  { name: "Iron Drop", type: "Drop & Paint", color: "#546e7a", productCode: "DP-08" },
  { name: "Sea Drop", type: "Drop & Paint", color: "#0277bd", productCode: "DP-09" },
  { name: "Sky Drop", type: "Drop & Paint", color: "#03a9f4", productCode: "DP-10" },
  { name: "Forest Drop", type: "Drop & Paint", color: "#388e3c", productCode: "DP-11" },
  { name: "Earth Drop", type: "Drop & Paint", color: "#5d4037", productCode: "DP-12" },
  { name: "Stone Drop", type: "Drop & Paint", color: "#616161", productCode: "DP-13" },
  { name: "Bone Drop", type: "Drop & Paint", color: "#f5f5dc", productCode: "DP-14" },
  { name: "Shadow Drop", type: "Drop & Paint", color: "#212121", productCode: "DP-15" }
];

export const SCALE75_PAINTS: Scale75PaintData[] = [
  ...SCALE75_SCALECOLOR,
  ...SCALE75_FANTASY_GAMES,
  ...SCALE75_WARFRONT,
  ...SCALE75_DROP_PAINT
];

export function getAllScale75Paints(): Scale75PaintData[] {
  return SCALE75_PAINTS;
}

export function getScale75PaintsByType(type: string): Scale75PaintData[] {
  return SCALE75_PAINTS.filter(paint => paint.type === type);
}

export function searchScale75Paints(query: string): Scale75PaintData[] {
  const searchTerm = query.toLowerCase();
  return SCALE75_PAINTS.filter(paint => 
    paint.name.toLowerCase().includes(searchTerm) ||
    paint.type.toLowerCase().includes(searchTerm) ||
    paint.productCode.toLowerCase().includes(searchTerm)
  );
}

export function getScale75PaintByCode(productCode: string): Scale75PaintData | undefined {
  return SCALE75_PAINTS.find(paint => paint.productCode === productCode);
}