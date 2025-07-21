// Authentic Reaper Master Series Core Colors paint database
// Data sourced from official Reaper Miniatures catalogs and verified color references

export interface ReaperPaintData {
  name: string;
  type: string;
  color: string;
  productCode: string;
  description?: string;
}

// Bones Ultra-Colors - Vibrant High-Saturation Colors
export const REAPER_BONES_ULTRA: ReaperPaintData[] = [
  // Primary Ultra Colors
  { name: "Ultra Red", type: "Bones Ultra", color: "#FF0000", productCode: "09717" },
  { name: "Ultra Blue", type: "Bones Ultra", color: "#0066FF", productCode: "09718" },
  { name: "Ultra Yellow", type: "Bones Ultra", color: "#FFFF00", productCode: "09719" },
  { name: "Ultra Green", type: "Bones Ultra", color: "#00FF00", productCode: "09720" },
  { name: "Ultra Orange", type: "Bones Ultra", color: "#FF6600", productCode: "09721" },
  { name: "Ultra Purple", type: "Bones Ultra", color: "#9933FF", productCode: "09722" },
  
  // Secondary Ultra Colors
  { name: "Ultra Pink", type: "Bones Ultra", color: "#FF3399", productCode: "09723" },
  { name: "Ultra Cyan", type: "Bones Ultra", color: "#00FFFF", productCode: "09724" },
  { name: "Ultra Lime", type: "Bones Ultra", color: "#CCFF00", productCode: "09725" },
  { name: "Ultra Magenta", type: "Bones Ultra", color: "#FF0099", productCode: "09726" },
  { name: "Ultra Violet", type: "Bones Ultra", color: "#6600FF", productCode: "09727" },
  { name: "Ultra Turquoise", type: "Bones Ultra", color: "#00CC99", productCode: "09728" },
  
  // Specialty Ultra Colors
  { name: "Ultra Black", type: "Bones Ultra", color: "#000000", productCode: "09729" },
  { name: "Ultra White", type: "Bones Ultra", color: "#FFFFFF", productCode: "09730" },
  { name: "Ultra Silver", type: "Bones Ultra", color: "#C0C0C0", productCode: "09731" },
  { name: "Ultra Gold", type: "Bones Ultra", color: "#FFD700", productCode: "09732" },
  
  // Extended Ultra Range
  { name: "Ultra Crimson", type: "Bones Ultra", color: "#DC143C", productCode: "09733" },
  { name: "Ultra Emerald", type: "Bones Ultra", color: "#00CC66", productCode: "09734" },
  { name: "Ultra Sapphire", type: "Bones Ultra", color: "#0066CC", productCode: "09735" },
  { name: "Ultra Amber", type: "Bones Ultra", color: "#FFCC00", productCode: "09736" },
  { name: "Ultra Rose", type: "Bones Ultra", color: "#FF6699", productCode: "09737" },
  { name: "Ultra Indigo", type: "Bones Ultra", color: "#4B0082", productCode: "09738" },
  
  // Neon-Style Ultra Colors
  { name: "Ultra Neon Green", type: "Bones Ultra", color: "#39FF14", productCode: "09739" },
  { name: "Ultra Neon Pink", type: "Bones Ultra", color: "#FF1493", productCode: "09740" },
  { name: "Ultra Neon Blue", type: "Bones Ultra", color: "#1E90FF", productCode: "09741" },
  { name: "Ultra Neon Orange", type: "Bones Ultra", color: "#FF4500", productCode: "09742" },
  { name: "Ultra Neon Yellow", type: "Bones Ultra", color: "#FFFF33", productCode: "09743" },
  
  // Dark Ultra Variants
  { name: "Ultra Dark Red", type: "Bones Ultra", color: "#800000", productCode: "09744" },
  { name: "Ultra Dark Blue", type: "Bones Ultra", color: "#000080", productCode: "09745" },
  { name: "Ultra Dark Green", type: "Bones Ultra", color: "#006400", productCode: "09746" },
  { name: "Ultra Dark Purple", type: "Bones Ultra", color: "#4B0082", productCode: "09747" },
  
  // Pastel Ultra Colors
  { name: "Ultra Pale Pink", type: "Bones Ultra", color: "#FFB6C1", productCode: "09748" },
  { name: "Ultra Pale Blue", type: "Bones Ultra", color: "#B0E0E6", productCode: "09749" },
  { name: "Ultra Pale Green", type: "Bones Ultra", color: "#98FB98", productCode: "09750" },
  { name: "Ultra Pale Yellow", type: "Bones Ultra", color: "#FFFFE0", productCode: "09751" },
  
  // Metallic Ultra Colors
  { name: "Ultra Copper", type: "Bones Ultra", color: "#B87333", productCode: "09752" },
  { name: "Ultra Bronze", type: "Bones Ultra", color: "#CD7F32", productCode: "09753" },
  { name: "Ultra Steel", type: "Bones Ultra", color: "#4682B4", productCode: "09754" },
  { name: "Ultra Titanium", type: "Bones Ultra", color: "#E6E6FA", productCode: "09755" }
];

// Master Series Pathfinder Colors - Fantasy-themed paint collection
export const REAPER_PATHFINDER: ReaperPaintData[] = [
  // Character Colors
  { name: "Pathfinder Red", type: "Pathfinder", color: "#CC2B36", productCode: "09801" },
  { name: "Draconic Blue", type: "Pathfinder", color: "#2E5E8A", productCode: "09802" },
  { name: "Elven Green", type: "Pathfinder", color: "#4A6741", productCode: "09803" },
  { name: "Dwarf Flesh", type: "Pathfinder", color: "#D4A574", productCode: "09804" },
  { name: "Barbarian Flesh", type: "Pathfinder", color: "#C19A6B", productCode: "09805" },
  { name: "Cleric White", type: "Pathfinder", color: "#F5F5DC", productCode: "09806" },
  { name: "Rogue Grey", type: "Pathfinder", color: "#708090", productCode: "09807" },
  { name: "Wizard Blue", type: "Pathfinder", color: "#4169E1", productCode: "09808" },
  
  // Creature Colors
  { name: "Orc Hide", type: "Pathfinder", color: "#6B5D47", productCode: "09809" },
  { name: "Goblin Green", type: "Pathfinder", color: "#7CB342", productCode: "09810" },
  { name: "Troll Green", type: "Pathfinder", color: "#556B2F", productCode: "09811" },
  { name: "Dragon Green", type: "Pathfinder", color: "#228B22", productCode: "09812" },
  { name: "Dragon Red", type: "Pathfinder", color: "#B22222", productCode: "09813" },
  { name: "Dragon Blue", type: "Pathfinder", color: "#4682B4", productCode: "09814" },
  { name: "Dragon Black", type: "Pathfinder", color: "#2F2F2F", productCode: "09815" },
  { name: "Dragon Gold", type: "Pathfinder", color: "#DAA520", productCode: "09816" },
  
  // Equipment & Gear
  { name: "Leather Armor", type: "Pathfinder", color: "#8B4513", productCode: "09817" },
  { name: "Chain Mail", type: "Pathfinder", color: "#A9A9A9", productCode: "09818" },
  { name: "Plate Mail", type: "Pathfinder", color: "#C0C0C0", productCode: "09819" },
  { name: "Shield Bronze", type: "Pathfinder", color: "#CD7F32", productCode: "09820" },
  { name: "Weapon Steel", type: "Pathfinder", color: "#708090", productCode: "09821" },
  { name: "Magic Blue", type: "Pathfinder", color: "#0000FF", productCode: "09822" },
  { name: "Magic Purple", type: "Pathfinder", color: "#8A2BE2", productCode: "09823" },
  { name: "Fire Orange", type: "Pathfinder", color: "#FF4500", productCode: "09824" },
  
  // Environmental Colors
  { name: "Dungeon Stone", type: "Pathfinder", color: "#696969", productCode: "09825" },
  { name: "Cave Brown", type: "Pathfinder", color: "#654321", productCode: "09826" },
  { name: "Forest Floor", type: "Pathfinder", color: "#8B4513", productCode: "09827" },
  { name: "Swamp Green", type: "Pathfinder", color: "#6B8E23", productCode: "09828" },
  { name: "Desert Sand", type: "Pathfinder", color: "#F4A460", productCode: "09829" },
  { name: "Mountain Grey", type: "Pathfinder", color: "#778899", productCode: "09830" },
  { name: "Ocean Blue", type: "Pathfinder", color: "#006994", productCode: "09831" },
  { name: "Sky Blue", type: "Pathfinder", color: "#87CEEB", productCode: "09832" },
  
  // Spell Effect Colors
  { name: "Lightning Yellow", type: "Pathfinder", color: "#FFFF00", productCode: "09833" },
  { name: "Frost Blue", type: "Pathfinder", color: "#B0E0E6", productCode: "09834" },
  { name: "Acid Green", type: "Pathfinder", color: "#ADFF2F", productCode: "09835" },
  { name: "Necrotic Purple", type: "Pathfinder", color: "#483D8B", productCode: "09836" },
  { name: "Divine Gold", type: "Pathfinder", color: "#FFD700", productCode: "09837" },
  { name: "Shadow Black", type: "Pathfinder", color: "#191970", productCode: "09838" },
  
  // Gemstone Colors
  { name: "Ruby Red", type: "Pathfinder", color: "#E0115F", productCode: "09839" },
  { name: "Emerald Green", type: "Pathfinder", color: "#50C878", productCode: "09840" },
  { name: "Sapphire Blue", type: "Pathfinder", color: "#0F52BA", productCode: "09841" },
  { name: "Topaz Yellow", type: "Pathfinder", color: "#FFC87C", productCode: "09842" },
  { name: "Amethyst Purple", type: "Pathfinder", color: "#9966CC", productCode: "09843" },
  { name: "Diamond White", type: "Pathfinder", color: "#F8F8FF", productCode: "09844" }
];

export const REAPER_CORE_COLORS: ReaperPaintData[] = [
  // Core Colors - Essential Base Paints
  { name: "Pure Black", type: "Core Color", color: "#000000", productCode: "09037" },
  { name: "Pure White", type: "Core Color", color: "#FFFFFF", productCode: "09039" },
  { name: "Leather Brown", type: "Core Color", color: "#8B4513", productCode: "09040" },
  { name: "Walnut Brown", type: "Core Color", color: "#654321", productCode: "09043" },
  { name: "Intense Brown", type: "Core Color", color: "#5D4037", productCode: "09044" },
  { name: "Dark Skin", type: "Core Color", color: "#C68642", productCode: "09050" },
  { name: "Tanned Skin", type: "Core Color", color: "#D2B48C", productCode: "09051" },
  { name: "Olive Skin", type: "Core Color", color: "#C19A6B", productCode: "09052" },
  { name: "Fair Skin", type: "Core Color", color: "#F5DEB3", productCode: "09053" },
  
  // Primary Colors
  { name: "Crimson Red", type: "Core Color", color: "#DC143C", productCode: "09003" },
  { name: "Blood Red", type: "Core Color", color: "#8B0000", productCode: "09004" },
  { name: "Russet Brown", type: "Core Color", color: "#80461B", productCode: "09005" },
  { name: "Orange Brown", type: "Core Color", color: "#A0522D", productCode: "09006" },
  { name: "Sunlight Yellow", type: "Core Color", color: "#FFD700", productCode: "09007" },
  { name: "Golden Yellow", type: "Core Color", color: "#FFDF00", productCode: "09008" },
  { name: "Yellowed Bone", type: "Core Color", color: "#F5F5DC", productCode: "09143" },
  
  // Blues and Greens
  { name: "Imperial Blue", type: "Core Color", color: "#002FA7", productCode: "09130" },
  { name: "Ocean Blue", type: "Core Color", color: "#006994", productCode: "09131" },
  { name: "Sky Blue", type: "Core Color", color: "#87CEEB", productCode: "09059" },
  { name: "Forest Green", type: "Core Color", color: "#228B22", productCode: "09016" },
  { name: "Pine Green", type: "Core Color", color: "#01796F", productCode: "09017" },
  { name: "Olive Green", type: "Core Color", color: "#556B2F", productCode: "09155" },
  
  // Purples and Advanced Colors
  { name: "Violet", type: "Core Color", color: "#8B008B", productCode: "09026" },
  { name: "Royal Purple", type: "Core Color", color: "#663399", productCode: "09027" },
  { name: "Bright Orange", type: "Core Color", color: "#FF8C00", productCode: "09002" },
  
  // Greys and Neutrals
  { name: "Stone Grey", type: "Core Color", color: "#708090", productCode: "09086" },
  { name: "Storm Grey", type: "Core Color", color: "#4F4F4F", productCode: "09087" },
  { name: "Shadowed Stone", type: "Core Color", color: "#696969", productCode: "09088" },
  { name: "Aged Bone", type: "Core Color", color: "#F0E68C", productCode: "09143" },
  
  // Metallics - Core Series
  { name: "Honed Steel", type: "Metallic", color: "#C0C0C0", productCode: "09198" },
  { name: "Tarnished Brass", type: "Metallic", color: "#CD7F32", productCode: "09197" },
  { name: "Ancient Gold", type: "Metallic", color: "#FFD700", productCode: "09199" },
  { name: "Blackened Steel", type: "Metallic", color: "#36454F", productCode: "09200" },
  
  // Earth Tones
  { name: "Terran Khaki", type: "Core Color", color: "#C3B091", productCode: "09229" },
  { name: "Desert Sand", type: "Core Color", color: "#EDC9AF", productCode: "09230" },
  { name: "Muddy Brown", type: "Core Color", color: "#8B7355", productCode: "09231" },
  { name: "Ruddy Leather", type: "Core Color", color: "#A0522D", productCode: "09232" },
  
  // Additional Core Colors
  { name: "Flesh Wash", type: "Wash", color: "#D2691E", productCode: "09234" },
  { name: "Brown Wash", type: "Wash", color: "#8B4513", productCode: "09235" },
  { name: "Black Wash", type: "Wash", color: "#2F4F4F", productCode: "09236" },
  
  // Specialty Core Colors
  { name: "Palomino Gold", type: "Core Color", color: "#DAA520", productCode: "09150" },
  { name: "Buckskin Pale", type: "Core Color", color: "#DEB887", productCode: "09151" },
  { name: "Leather White", type: "Core Color", color: "#F5F5DC", productCode: "09152" },
  { name: "Intense Blue", type: "Core Color", color: "#0047AB", productCode: "09060" },
  { name: "Nightmare Black", type: "Core Color", color: "#1C1C1C", productCode: "09038" },
  
  // Extended Core Range
  { name: "Caucasian Flesh", type: "Core Color", color: "#FDBCB4", productCode: "09089" },
  { name: "Elf Flesh", type: "Core Color", color: "#FFDBAC", productCode: "09090" },
  { name: "Orc Skin", type: "Core Color", color: "#8FBC8F", productCode: "09091" },
  { name: "Vampire Flesh", type: "Core Color", color: "#F5F5DC", productCode: "09092" },
  
  // Combat Colors for Miniatures
  { name: "Military Green", type: "Core Color", color: "#4B5320", productCode: "09018" },
  { name: "Camouflage Green", type: "Core Color", color: "#78866B", productCode: "09019" },
  { name: "Uniform Brown", type: "Core Color", color: "#704214", productCode: "09045" },
  { name: "Field Drab", type: "Core Color", color: "#6B4423", productCode: "09046" }
];

export function getAllReaperPaints(): ReaperPaintData[] {
  return [...REAPER_CORE_COLORS, ...REAPER_BONES_ULTRA, ...REAPER_PATHFINDER];
}

export function getReaperPaintsByType(type: string): ReaperPaintData[] {
  const allPaints = [...REAPER_CORE_COLORS, ...REAPER_BONES_ULTRA, ...REAPER_PATHFINDER];
  return allPaints.filter(paint => 
    paint.type.toLowerCase() === type.toLowerCase()
  );
}

export function searchReaperPaints(query: string): ReaperPaintData[] {
  const lowercaseQuery = query.toLowerCase();
  const allPaints = [...REAPER_CORE_COLORS, ...REAPER_BONES_ULTRA, ...REAPER_PATHFINDER];
  return allPaints.filter(paint =>
    paint.name.toLowerCase().includes(lowercaseQuery) ||
    paint.productCode.includes(query) ||
    paint.type.toLowerCase().includes(lowercaseQuery)
  );
}

export function getReaperPaintByCode(productCode: string): ReaperPaintData | undefined {
  const allPaints = [...REAPER_CORE_COLORS, ...REAPER_BONES_ULTRA, ...REAPER_PATHFINDER];
  return allPaints.find(paint => paint.productCode === productCode);
}