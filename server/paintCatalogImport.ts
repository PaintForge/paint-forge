import { db } from "./db";
import { paintCatalog } from "@shared/schema";

interface ParsedPaint {
  name: string;
  brand: string;
  type: string;
  hexColor: string;
  r: number;
  g: number;
  b: number;
  isDiscontinued: boolean;
}

const GITHUB_BASE_URL = "https://raw.githubusercontent.com/Arcturus5404/miniature-paints/main/paints";

const BRAND_FILES: Record<string, string> = {
  "Citadel": "Citadel_Colour.md",
  "Vallejo Game Color": "Vallejo.md",
  "Army Painter": "Army_Painter.md",
  "Scale75": "Scale75.md",
  "AK Interactive": "AK.md",
  "Reaper": "Reaper.md",
  "P3": "P3.md",
  "Turbo Dork": "TurboDork.md",
  "Green Stuff World": "GreenStuffWorld.md",
  "Kimera Kolors": "KimeraKolors.md",
};

function parseMarkdownTable(markdown: string, brandName: string): ParsedPaint[] {
  const paints: ParsedPaint[] = [];
  const lines = markdown.split('\n');
  
  let inTable = false;
  let headerParsed = false;
  let hasCodeColumn = false;
  
  for (const line of lines) {
    if (line.startsWith('|Name|') || line.startsWith('| Name |')) {
      inTable = true;
      headerParsed = false;
      hasCodeColumn = line.includes('|Code|');
      continue;
    }
    
    if (line.startsWith('|---') || line.startsWith('| ---')) {
      headerParsed = true;
      continue;
    }
    
    if (inTable && headerParsed && line.startsWith('|')) {
      const parts = line.split('|').filter(p => p.trim() !== '');
      
      const minParts = hasCodeColumn ? 7 : 6;
      if (parts.length >= minParts) {
        let name: string, type: string, r: number, g: number, b: number, hexCol: string;
        
        if (hasCodeColumn) {
          name = parts[0]?.trim() || '';
          type = parts[2]?.trim() || '';
          r = parseInt(parts[3]?.trim() || '0', 10);
          g = parseInt(parts[4]?.trim() || '0', 10);
          b = parseInt(parts[5]?.trim() || '0', 10);
          hexCol = parts[6] || '';
        } else {
          name = parts[0]?.trim() || '';
          type = parts[1]?.trim() || '';
          r = parseInt(parts[2]?.trim() || '0', 10);
          g = parseInt(parts[3]?.trim() || '0', 10);
          b = parseInt(parts[4]?.trim() || '0', 10);
          hexCol = parts[5] || '';
        }
        
        const hexMatch = hexCol.match(/#([A-Fa-f0-9]{6})/);
        const hexColor = hexMatch ? `#${hexMatch[1]}` : `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        const isDiscontinued = type.toLowerCase().includes('discontinued');
        const cleanType = type.replace(/\s*\(discontinued\)/i, '').trim();
        
        if (name && !isNaN(r) && !isNaN(g) && !isNaN(b)) {
          paints.push({
            name,
            brand: brandName,
            type: cleanType || 'Unknown',
            hexColor: hexColor.toUpperCase(),
            r,
            g,
            b,
            isDiscontinued,
          });
        }
      }
    }
  }
  
  return paints;
}

async function fetchBrandPaints(brandName: string, fileName: string): Promise<ParsedPaint[]> {
  try {
    const url = `${GITHUB_BASE_URL}/${fileName}`;
    console.log(`Fetching ${brandName} paints from ${url}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${brandName}: ${response.status}`);
      return [];
    }
    
    const markdown = await response.text();
    const paints = parseMarkdownTable(markdown, brandName);
    console.log(`Parsed ${paints.length} paints from ${brandName}`);
    
    return paints;
  } catch (error) {
    console.error(`Error fetching ${brandName}:`, error);
    return [];
  }
}

export async function importAllPaints(forceRefresh: boolean = false): Promise<{ success: boolean; count: number; brands: string[]; message: string }> {
  const allPaints: ParsedPaint[] = [];
  const importedBrands: string[] = [];
  
  for (const [brandName, fileName] of Object.entries(BRAND_FILES)) {
    const paints = await fetchBrandPaints(brandName, fileName);
    if (paints.length > 0) {
      allPaints.push(...paints);
      importedBrands.push(brandName);
    }
  }
  
  if (allPaints.length === 0) {
    return { success: false, count: 0, brands: [], message: "Failed to fetch any paints from source" };
  }
  
  try {
    const existingPaints = await db.select().from(paintCatalog);
    
    if (existingPaints.length > 0 && !forceRefresh) {
      console.log('Paint catalog already has data, skipping import');
      return { 
        success: true, 
        count: existingPaints.length, 
        brands: importedBrands,
        message: `Catalog already contains ${existingPaints.length} paints. Use force refresh to update.`
      };
    }
    
    if (forceRefresh && existingPaints.length > 0) {
      console.log('Force refresh: clearing existing catalog data...');
      await db.delete(paintCatalog);
      console.log('Catalog cleared.');
    }
    
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < allPaints.length; i += batchSize) {
      const batch = allPaints.slice(i, i + batchSize);
      await db.insert(paintCatalog).values(batch);
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${allPaints.length} paints...`);
    }
    
    console.log(`Successfully imported ${inserted} paints from ${importedBrands.length} brands`);
    return { 
      success: true, 
      count: inserted, 
      brands: importedBrands,
      message: `Successfully imported ${inserted} paints from ${importedBrands.length} brands`
    };
  } catch (error) {
    console.error('Error importing paints:', error);
    return { success: false, count: 0, brands: [], message: `Import failed: ${error}` };
  }
}

export async function getCatalogStats(): Promise<{ totalPaints: number; brands: { name: string; count: number }[] }> {
  try {
    const allPaints = await db.select().from(paintCatalog);
    
    const brandCounts: Record<string, number> = {};
    for (const paint of allPaints) {
      brandCounts[paint.brand] = (brandCounts[paint.brand] || 0) + 1;
    }
    
    const brands = Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalPaints: allPaints.length,
      brands,
    };
  } catch (error) {
    console.error('Error getting catalog stats:', error);
    return { totalPaints: 0, brands: [] };
  }
}
