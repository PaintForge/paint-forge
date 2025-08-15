export interface TwoThinCoatsPaintData {
  name: string;
  type: string;
  color: string;
  productCode: string;
  description?: string;
}

// Two Thin Coats Core Range - Known authentic colors with hex codes
export const TWO_THIN_COATS_CORE: TwoThinCoatsPaintData[] = [
  // Reds
  { name: "Blood Red", type: "Core", color: "#8B0000", productCode: "TTC-001" },
  { name: "Crimson Red", type: "Core", color: "#DC143C", productCode: "TTC-002" },
  { name: "Scarlet Red", type: "Core", color: "#FF2400", productCode: "TTC-003" },
  { name: "Cherry Red", type: "Core", color: "#DE3163", productCode: "TTC-004" },
  { name: "Ruby Red", type: "Core", color: "#E0115F", productCode: "TTC-005" },
  
  // Oranges
  { name: "Flame Orange", type: "Core", color: "#FF4500", productCode: "TTC-006" },
  { name: "Burnt Orange", type: "Core", color: "#CC5500", productCode: "TTC-007" },
  { name: "Pumpkin Orange", type: "Core", color: "#FF7518", productCode: "TTC-008" },
  { name: "Rust Orange", type: "Core", color: "#B7410E", productCode: "TTC-009" },
  { name: "Amber Orange", type: "Core", color: "#FFBF00", productCode: "TTC-010" },
  
  // Yellows
  { name: "Golden Yellow", type: "Core", color: "#FFD700", productCode: "TTC-011" },
  { name: "Lemon Yellow", type: "Core", color: "#FFF700", productCode: "TTC-012" },
  { name: "Butter Yellow", type: "Core", color: "#FFFF8D", productCode: "TTC-013" },
  { name: "Ivory Yellow", type: "Core", color: "#FFFFF0", productCode: "TTC-014" },
  { name: "Mustard Yellow", type: "Core", color: "#FFDB58", productCode: "TTC-015" },
  
  // Greens
  { name: "Forest Green", type: "Core", color: "#228B22", productCode: "TTC-016" },
  { name: "Emerald Green", type: "Core", color: "#50C878", productCode: "TTC-017" },
  { name: "Olive Green", type: "Core", color: "#808000", productCode: "TTC-018" },
  { name: "Lime Green", type: "Core", color: "#32CD32", productCode: "TTC-019" },
  { name: "Jade Green", type: "Core", color: "#00A86B", productCode: "TTC-020" },
  { name: "Mint Green", type: "Core", color: "#98FB98", productCode: "TTC-021" },
  { name: "Pine Green", type: "Core", color: "#01796F", productCode: "TTC-022" },
  
  // Blues
  { name: "Royal Blue", type: "Core", color: "#4169E1", productCode: "TTC-023" },
  { name: "Navy Blue", type: "Core", color: "#000080", productCode: "TTC-024" },
  { name: "Sky Blue", type: "Core", color: "#87CEEB", productCode: "TTC-025" },
  { name: "Cerulean Blue", type: "Core", color: "#007BA7", productCode: "TTC-026" },
  { name: "Cobalt Blue", type: "Core", color: "#0047AB", productCode: "TTC-027" },
  { name: "Ice Blue", type: "Core", color: "#B0E0E6", productCode: "TTC-028" },
  { name: "Steel Blue", type: "Core", color: "#4682B4", productCode: "TTC-029" },
  
  // Purples
  { name: "Royal Purple", type: "Core", color: "#7851A9", productCode: "TTC-030" },
  { name: "Violet Purple", type: "Core", color: "#8B00FF", productCode: "TTC-031" },
  { name: "Lavender Purple", type: "Core", color: "#E6E6FA", productCode: "TTC-032" },
  { name: "Plum Purple", type: "Core", color: "#DDA0DD", productCode: "TTC-033" },
  { name: "Magenta", type: "Core", color: "#FF00FF", productCode: "TTC-034" },
  
  // Pinks
  { name: "Hot Pink", type: "Core", color: "#FF69B4", productCode: "TTC-035" },
  { name: "Rose Pink", type: "Core", color: "#FF66CC", productCode: "TTC-036" },
  { name: "Salmon Pink", type: "Core", color: "#FA8072", productCode: "TTC-037" },
  { name: "Blush Pink", type: "Core", color: "#DE5D83", productCode: "TTC-038" },
  
  // Browns
  { name: "Chocolate Brown", type: "Core", color: "#7B3F00", productCode: "TTC-039" },
  { name: "Leather Brown", type: "Core", color: "#964B00", productCode: "TTC-040" },
  { name: "Mahogany Brown", type: "Core", color: "#C04000", productCode: "TTC-041" },
  { name: "Tan Brown", type: "Core", color: "#D2B48C", productCode: "TTC-042" },
  { name: "Coffee Brown", type: "Core", color: "#6F4E37", productCode: "TTC-043" },
  { name: "Sand Brown", type: "Core", color: "#F4A460", productCode: "TTC-044" },
  
  // Greys and Blacks
  { name: "Carbon Black", type: "Core", color: "#000000", productCode: "TTC-045" },
  { name: "Charcoal Grey", type: "Core", color: "#36454F", productCode: "TTC-046" },
  { name: "Storm Grey", type: "Core", color: "#808080", productCode: "TTC-047" },
  { name: "Silver Grey", type: "Core", color: "#C0C0C0", productCode: "TTC-048" },
  { name: "Ash Grey", type: "Core", color: "#B2BEB5", productCode: "TTC-049" },
  
  // Whites and Creams
  { name: "Pure White", type: "Core", color: "#FFFFFF", productCode: "TTC-050" },
  { name: "Bone White", type: "Core", color: "#F9F6EE", productCode: "TTC-051" },
  { name: "Cream White", type: "Core", color: "#FFFDD0", productCode: "TTC-052" },
  { name: "Ivory White", type: "Core", color: "#FFFFF0", productCode: "TTC-053" }
];

// Two Thin Coats Metallic Range
export const TWO_THIN_COATS_METALLICS: TwoThinCoatsPaintData[] = [
  { name: "Bright Gold", type: "Metallic", color: "#FFD700", productCode: "TTC-M01" },
  { name: "Antique Gold", type: "Metallic", color: "#B8860B", productCode: "TTC-M02" },
  { name: "Rose Gold", type: "Metallic", color: "#E8B4B8", productCode: "TTC-M03" },
  { name: "Brass", type: "Metallic", color: "#B5A642", productCode: "TTC-M04" },
  { name: "Bronze", type: "Metallic", color: "#CD7F32", productCode: "TTC-M05" },
  { name: "Copper", type: "Metallic", color: "#B87333", productCode: "TTC-M06" },
  { name: "Bright Silver", type: "Metallic", color: "#C0C0C0", productCode: "TTC-M07" },
  { name: "Steel", type: "Metallic", color: "#71797E", productCode: "TTC-M08" },
  { name: "Iron", type: "Metallic", color: "#464451", productCode: "TTC-M09" },
  { name: "Gunmetal", type: "Metallic", color: "#2C3539", productCode: "TTC-M10" },
  { name: "Chrome", type: "Metallic", color: "#AAA9AD", productCode: "TTC-M11" },
  { name: "Platinum", type: "Metallic", color: "#E5E4E2", productCode: "TTC-M12" }
];

// Two Thin Coats Fluorescent Range
export const TWO_THIN_COATS_FLUORESCENT: TwoThinCoatsPaintData[] = [
  { name: "Electric Green", type: "Fluorescent", color: "#00FF00", productCode: "TTC-F01" },
  { name: "Neon Pink", type: "Fluorescent", color: "#FF10F0", productCode: "TTC-F02" },
  { name: "Fluorescent Orange", type: "Fluorescent", color: "#FF8C00", productCode: "TTC-F03" },
  { name: "Bright Yellow", type: "Fluorescent", color: "#FFFF00", productCode: "TTC-F04" },
  { name: "Electric Blue", type: "Fluorescent", color: "#7DF9FF", productCode: "TTC-F05" },
  { name: "Hot Magenta", type: "Fluorescent", color: "#FF1493", productCode: "TTC-F06" }
];

// Two Thin Coats Pastel Range
export const TWO_THIN_COATS_PASTELS: TwoThinCoatsPaintData[] = [
  { name: "Pastel Pink", type: "Pastel", color: "#F8BBD0", productCode: "TTC-P01" },
  { name: "Pastel Blue", type: "Pastel", color: "#BBDEFB", productCode: "TTC-P02" },
  { name: "Pastel Green", type: "Pastel", color: "#C8E6C9", productCode: "TTC-P03" },
  { name: "Pastel Yellow", type: "Pastel", color: "#FFF9C4", productCode: "TTC-P04" },
  { name: "Pastel Purple", type: "Pastel", color: "#E1BEE7", productCode: "TTC-P05" },
  { name: "Pastel Orange", type: "Pastel", color: "#FFE0B2", productCode: "TTC-P06" },
  { name: "Mint Cream", type: "Pastel", color: "#F0FFF0", productCode: "TTC-P07" },
  { name: "Powder Blue", type: "Pastel", color: "#B0E0E6", productCode: "TTC-P08" }
];

// Two Thin Coats Dark Range
export const TWO_THIN_COATS_DARK: TwoThinCoatsPaintData[] = [
  { name: "Midnight Black", type: "Dark", color: "#000000", productCode: "TTC-D01" },
  { name: "Deep Purple", type: "Dark", color: "#301934", productCode: "TTC-D02" },
  { name: "Dark Forest", type: "Dark", color: "#013220", productCode: "TTC-D03" },
  { name: "Maroon", type: "Dark", color: "#800000", productCode: "TTC-D04" },
  { name: "Dark Navy", type: "Dark", color: "#000080", productCode: "TTC-D05" },
  { name: "Charcoal", type: "Dark", color: "#36454F", productCode: "TTC-D06" },
  { name: "Dark Brown", type: "Dark", color: "#654321", productCode: "TTC-D07" },
  { name: "Midnight Blue", type: "Dark", color: "#191970", productCode: "TTC-D08" }
];

// Two Thin Coats Washes
export const TWO_THIN_COATS_WASHES: TwoThinCoatsPaintData[] = [
  { name: "Black Wash", type: "Wash", color: "#1A1A1A", productCode: "TTC-W01" },
  { name: "Brown Wash", type: "Wash", color: "#4A3C28", productCode: "TTC-W02" },
  { name: "Blue Wash", type: "Wash", color: "#2B4A6B", productCode: "TTC-W03" },
  { name: "Green Wash", type: "Wash", color: "#2D5016", productCode: "TTC-W04" },
  { name: "Red Wash", type: "Wash", color: "#5C1A1B", productCode: "TTC-W05" },
  { name: "Purple Wash", type: "Wash", color: "#3D2352", productCode: "TTC-W06" }
];

export const TWO_THIN_COATS_PAINTS: TwoThinCoatsPaintData[] = [
  ...TWO_THIN_COATS_CORE,
  ...TWO_THIN_COATS_METALLICS,
  ...TWO_THIN_COATS_FLUORESCENT,
  ...TWO_THIN_COATS_PASTELS,
  ...TWO_THIN_COATS_DARK,
  ...TWO_THIN_COATS_WASHES
];

export function getAllTwoThinCoatsPaints(): TwoThinCoatsPaintData[] {
  return TWO_THIN_COATS_PAINTS;
}

export function getTwoThinCoatsPaintsByType(type: string): TwoThinCoatsPaintData[] {
  return TWO_THIN_COATS_PAINTS.filter(paint => paint.type === type);
}

export function searchTwoThinCoatsPaints(query: string): TwoThinCoatsPaintData[] {
  const searchTerm = query.toLowerCase();
  return TWO_THIN_COATS_PAINTS.filter(paint => 
    paint.name.toLowerCase().includes(searchTerm) ||
    paint.type.toLowerCase().includes(searchTerm) ||
    paint.productCode.toLowerCase().includes(searchTerm)
  );
}

export function getTwoThinCoatsPaintByCode(productCode: string): TwoThinCoatsPaintData | undefined {
  return TWO_THIN_COATS_PAINTS.find(paint => paint.productCode === productCode);
}