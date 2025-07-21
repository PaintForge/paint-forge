import * as cheerio from 'cheerio';
import { db } from "./db";
import { paints } from "../shared/schema";

interface ArmyPainterPaint {
  name: string;
  type: string;
  color: string;
  productCode?: string;
  description?: string;
  imageUrl?: string;
}

// Function to extract hex color from various formats
function extractHexColor(colorStr: string): string | null {
  if (!colorStr) return null;
  
  // Direct hex format
  const hexMatch = colorStr.match(/#([0-9A-Fa-f]{6})/);
  if (hexMatch) return hexMatch[0];
  
  // RGB format
  const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
  }
  
  return null;
}

// Scrape a specific product category page
async function scrapePaintCategory(categoryUrl: string, categoryType: string): Promise<ArmyPainterPaint[]> {
  const paints: ArmyPainterPaint[] = [];
  
  try {
    console.log(`Scraping category: ${categoryType} from ${categoryUrl}`);
    
    const response = await fetch(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${categoryUrl}: ${response.status}`);
      return paints;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Look for paint products - adjust selectors based on actual website structure
    $('.product-item, .paint-card, .color-swatch, .product-grid-item').each((index, element) => {
      const $el = $(element);
      
      // Extract paint name
      const name = $el.find('.product-title, .paint-name, h3, h4, .name').first().text().trim() ||
                   $el.find('a').attr('title') ||
                   $el.attr('data-name');
      
      if (!name) return;
      
      // Extract color - look for various color indicators
      let color = null;
      
      // Check for background color style
      const colorElement = $el.find('.color-preview, .swatch, .color-sample, [style*="background"]').first();
      if (colorElement.length) {
        const style = colorElement.attr('style') || '';
        color = extractHexColor(style);
      }
      
      // Check for data attributes
      if (!color) {
        color = $el.attr('data-color') || $el.find('[data-color]').attr('data-color');
        if (color && !color.startsWith('#')) {
          color = extractHexColor(color);
        }
      }
      
      // Extract product code
      const productCode = $el.find('.product-code, .sku').text().trim() ||
                         $el.attr('data-sku') ||
                         $el.attr('data-product-code');
      
      // Extract description
      const description = $el.find('.description, .product-description').text().trim();
      
      // Extract image URL
      const imageUrl = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      
      if (name && color) {
        paints.push({
          name: name.replace(/\s+/g, ' ').trim(),
          type: categoryType,
          color: color,
          productCode: productCode || undefined,
          description: description || undefined,
          imageUrl: imageUrl || undefined
        });
      }
    });
    
    console.log(`Found ${paints.length} paints in ${categoryType}`);
    
  } catch (error) {
    console.error(`Error scraping ${categoryUrl}:`, error);
  }
  
  return paints;
}

// Discover paint categories on the main website
async function discoverPaintCategories(mainUrl: string): Promise<{ url: string; type: string }[]> {
  const categories: { url: string; type: string }[] = [];
  
  try {
    console.log(`Discovering categories from ${mainUrl}`);
    
    const response = await fetch(mainUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch main page: ${response.status}`);
      return categories;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Look for paint category links
    $('a[href*="paint"], a[href*="color"], a[href*="warpaints"], a[href*="speedpaint"]').each((index, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const text = $link.text().trim();
      
      if (href && text && (
        text.toLowerCase().includes('paint') ||
        text.toLowerCase().includes('color') ||
        text.toLowerCase().includes('warpaints') ||
        text.toLowerCase().includes('speedpaint') ||
        text.toLowerCase().includes('primer') ||
        text.toLowerCase().includes('wash') ||
        text.toLowerCase().includes('metallic')
      )) {
        const fullUrl = href.startsWith('http') ? href : `${mainUrl.replace(/\/$/, '')}${href.startsWith('/') ? href : '/' + href}`;
        categories.push({
          url: fullUrl,
          type: text
        });
      }
    });
    
    console.log(`Discovered ${categories.length} potential paint categories`);
    
  } catch (error) {
    console.error(`Error discovering categories:`, error);
  }
  
  return categories;
}

// Main scraping function
export async function scrapeArmyPainterWebsite(): Promise<ArmyPainterPaint[]> {
  const baseUrl = "https://us.thearmypainter.com";
  const allPaints: ArmyPainterPaint[] = [];
  
  // Known category URLs - update based on actual website structure
  const knownCategories = [
    { url: `${baseUrl}/products/warpaints-fanatic`, type: "Warpaints Fanatic" },
    { url: `${baseUrl}/products/speedpaint`, type: "Speedpaint" },
    { url: `${baseUrl}/products/warpaints`, type: "Warpaints" },
    { url: `${baseUrl}/products/colour-primer`, type: "Colour Primer" },
    { url: `${baseUrl}/products/metallic`, type: "Metallic" },
    { url: `${baseUrl}/products/effects`, type: "Effects" },
    { url: `${baseUrl}/products/washes`, type: "Wash" },
    { url: `${baseUrl}/products/air`, type: "Air" }
  ];
  
  // First try known categories
  for (const category of knownCategories) {
    const categoryPaints = await scrapePaintCategory(category.url, category.type);
    allPaints.push(...categoryPaints);
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // If no paints found, try to discover categories
  if (allPaints.length === 0) {
    console.log("No paints found in known categories, attempting discovery...");
    const discoveredCategories = await discoverPaintCategories(baseUrl);
    
    for (const category of discoveredCategories.slice(0, 10)) { // Limit to first 10 discovered
      const categoryPaints = await scrapePaintCategory(category.url, category.type);
      allPaints.push(...categoryPaints);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Total paints scraped: ${allPaints.length}`);
  return allPaints;
}

// Check if paint already exists in database
async function paintExists(name: string, brand: string): Promise<boolean> {
  try {
    const existing = await db.query.paints.findFirst({
      where: (paints, { and, eq, ilike }) => and(
        eq(paints.brand, brand),
        ilike(paints.name, name)
      )
    });
    return !!existing;
  } catch (error) {
    console.error(`Error checking if paint exists:`, error);
    return false;
  }
}

// Add new paints to database
export async function addNewArmyPainterPaints(): Promise<void> {
  console.log("Starting Army Painter website scraping...");
  
  const scrapedPaints = await scrapeArmyPainterWebsite();
  
  if (scrapedPaints.length === 0) {
    console.log("No paints found during scraping.");
    return;
  }
  
  console.log(`Processing ${scrapedPaints.length} scraped paints...`);
  
  let addedCount = 0;
  
  for (const paint of scrapedPaints) {
    try {
      // Check if paint already exists
      const exists = await paintExists(paint.name, "Army Painter");
      
      if (!exists) {
        await db.insert(paints).values({
          name: paint.name,
          brand: "Army Painter",
          type: paint.type,
          color: paint.color,
          quantity: 0,
          status: "not_owned",
          isWishlist: false,
          priority: "medium",
          notes: paint.productCode ? `Product Code: ${paint.productCode}` : paint.description || null,
        });
        
        addedCount++;
        console.log(`Added new paint: ${paint.name} (${paint.type})`);
      }
    } catch (error) {
      console.error(`Error adding paint ${paint.name}:`, error);
    }
  }
  
  console.log(`Scraping complete! Added ${addedCount} new Army Painter paints.`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addNewArmyPainterPaints()
    .then(() => {
      console.log("Army Painter scraping finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Army Painter scraping failed:", error);
      process.exit(1);
    });
}