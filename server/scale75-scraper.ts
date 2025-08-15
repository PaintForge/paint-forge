import * as cheerio from 'cheerio';
import { db } from './db';
import { paints } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface Scale75Paint {
  name: string;
  type: string;
  color: string;
  productCode?: string;
  description?: string;
  imageUrl?: string;
}

function extractHexColor(colorStr: string): string | null {
  // Look for hex color patterns
  const hexMatch = colorStr.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
  if (hexMatch) {
    return hexMatch[0];
  }
  
  // Look for RGB values and convert to hex
  const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  return null;
}

async function scrapeScale75ProductPage(url: string): Promise<Scale75Paint[]> {
  const paints: Scale75Paint[] = [];
  
  try {
    console.log(`Scraping Scale75 page: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return paints;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Look for product items with various selectors
    const productSelectors = [
      '.product-item',
      '.product',
      '.item',
      '.product-card',
      '.paint-item',
      '[data-product-id]'
    ];
    
    for (const selector of productSelectors) {
      $(selector).each((_, element) => {
        const $element = $(element);
        
        // Extract paint name
        const nameSelectors = [
          '.product-name',
          '.title',
          'h3',
          'h4',
          '.name',
          '[data-name]'
        ];
        
        let name = '';
        for (const nameSelector of nameSelectors) {
          const foundName = $element.find(nameSelector).first().text().trim();
          if (foundName && foundName.length > 2) {
            name = foundName;
            break;
          }
        }
        
        if (!name) {
          const altText = $element.find('img').attr('alt');
          if (altText && altText.length > 2) {
            name = altText.trim();
          }
        }
        
        // Skip if no name found or if it's not a paint product
        if (!name || name.length < 3) return;
        
        // Filter out non-paint items
        const excludeKeywords = ['brush', 'set', 'palette', 'medium', 'varnish', 'primer', 'tool'];
        if (excludeKeywords.some(keyword => name.toLowerCase().includes(keyword))) {
          return;
        }
        
        // Extract color information
        let color = '#000000'; // Default
        
        // Look for color swatches or background colors
        const colorElement = $element.find('.color-swatch, .color, [style*="background"], [data-color]').first();
        if (colorElement.length) {
          const style = colorElement.attr('style') || '';
          const dataColor = colorElement.attr('data-color') || '';
          const bgColor = style.match(/background[^;]*:\s*([^;]+)/i);
          
          if (dataColor) {
            const extractedColor = extractHexColor(dataColor);
            if (extractedColor) color = extractedColor;
          } else if (bgColor) {
            const extractedColor = extractHexColor(bgColor[1]);
            if (extractedColor) color = extractedColor;
          }
        }
        
        // Extract product code
        let productCode = '';
        const codeSelectors = ['.sku', '.product-code', '[data-sku]'];
        for (const codeSelector of codeSelectors) {
          const code = $element.find(codeSelector).text().trim();
          if (code) {
            productCode = code;
            break;
          }
        }
        
        // Determine paint type based on URL and name
        let type = 'Model Color'; // Default
        if (url.includes('scalecolor') || name.toLowerCase().includes('scalecolor')) {
          type = 'ScaleColor';
        } else if (url.includes('fantasy') || name.toLowerCase().includes('fantasy')) {
          type = 'Fantasy & Games';
        } else if (url.includes('warfront') || name.toLowerCase().includes('warfront')) {
          type = 'Warfront';
        } else if (url.includes('drop') || name.toLowerCase().includes('drop')) {
          type = 'Drop & Paint';
        }
        
        // Extract image URL
        const imageUrl = $element.find('img').first().attr('src') || '';
        
        paints.push({
          name,
          type,
          color,
          productCode,
          imageUrl: imageUrl ? new URL(imageUrl, url).href : undefined
        });
      });
      
      if (paints.length > 0) break; // Found products with this selector
    }
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
  }
  
  return paints;
}

async function discoverScale75Categories(): Promise<{ url: string; type: string }[]> {
  const baseUrl = 'https://scale75.com';
  const categories: { url: string; type: string }[] = [];
  
  try {
    console.log('Discovering Scale75 paint categories...');
    const response = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log('Failed to fetch main page, using known categories');
      // Fallback to known categories
      return [
        { url: `${baseUrl}/products/scalecolor`, type: 'ScaleColor' },
        { url: `${baseUrl}/products/fantasy-games`, type: 'Fantasy & Games' },
        { url: `${baseUrl}/products/warfront`, type: 'Warfront' },
        { url: `${baseUrl}/products/drop-paint`, type: 'Drop & Paint' },
        { url: `${baseUrl}/collections/paints`, type: 'Model Color' },
        { url: `${baseUrl}/collections/acrylic-paints`, type: 'Model Color' }
      ];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Look for navigation links to paint categories
    $('a[href*="paint"], a[href*="color"], a[href*="scalecolor"], a[href*="fantasy"], a[href*="warfront"]').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      
      if (href && text) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        
        let type = 'Model Color';
        if (text.toLowerCase().includes('scalecolor')) {
          type = 'ScaleColor';
        } else if (text.toLowerCase().includes('fantasy')) {
          type = 'Fantasy & Games';
        } else if (text.toLowerCase().includes('warfront')) {
          type = 'Warfront';
        } else if (text.toLowerCase().includes('drop')) {
          type = 'Drop & Paint';
        }
        
        categories.push({ url: fullUrl, type });
      }
    });
    
  } catch (error) {
    console.error('Error discovering categories:', error);
  }
  
  // Add known direct URLs as fallback
  const knownUrls = [
    { url: 'https://scale75.com/en/17-scale-color', type: 'ScaleColor' },
    { url: 'https://scale75.com/en/18-fantasy-games', type: 'Fantasy & Games' },
    { url: 'https://scale75.com/en/54-warfront', type: 'Warfront' },
    { url: 'https://scale75.com/collections/scalecolor', type: 'ScaleColor' },
    { url: 'https://scale75.com/collections/fantasy-games', type: 'Fantasy & Games' }
  ];
  
  knownUrls.forEach(known => {
    if (!categories.some(cat => cat.url === known.url)) {
      categories.push(known);
    }
  });
  
  return categories;
}

export async function scrapeAllScale75Paints(): Promise<Scale75Paint[]> {
  console.log('Starting Scale75 paint scraping...');
  const allPaints: Scale75Paint[] = [];
  
  const categories = await discoverScale75Categories();
  console.log(`Found ${categories.length} categories to scrape`);
  
  for (const category of categories) {
    console.log(`Scraping category: ${category.type} from ${category.url}`);
    const categoryPaints = await scrapeScale75ProductPage(category.url);
    
    if (categoryPaints.length > 0) {
      console.log(`Found ${categoryPaints.length} paints in ${category.type}`);
      allPaints.push(...categoryPaints);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Remove duplicates
  const uniquePaints = allPaints.filter((paint, index, arr) => 
    arr.findIndex(p => p.name === paint.name && p.type === paint.type) === index
  );
  
  console.log(`Total unique Scale75 paints found: ${uniquePaints.length}`);
  return uniquePaints;
}

async function paintExists(name: string, brand: string): Promise<boolean> {
  try {
    const [existingPaint] = await db
      .select()
      .from(paints)
      .where(and(eq(paints.name, name), eq(paints.brand, brand)))
      .limit(1);
    
    return !!existingPaint;
  } catch (error) {
    console.error('Error checking paint existence:', error);
    return false;
  }
}

export async function addNewScale75Paints(): Promise<void> {
  console.log('Adding new Scale75 paints to database...');
  
  const scrapedPaints = await scrapeAllScale75Paints();
  let addedCount = 0;
  
  for (const paint of scrapedPaints) {
    try {
      const exists = await paintExists(paint.name, 'Scale75');
      
      if (!exists) {
        await db.insert(paints).values({
          name: paint.name,
          brand: 'Scale75',
          type: paint.type,
          color: paint.color,
          quantity: 0,
          status: 'not_owned',
          isWishlist: false,
          priority: 'medium',
          notes: paint.description
        });
        
        addedCount++;
        console.log(`Added: ${paint.name} (${paint.type}) - ${paint.color}`);
      }
    } catch (error) {
      console.error(`Error adding paint ${paint.name}:`, error);
    }
  }
  
  console.log(`Successfully added ${addedCount} new Scale75 paints to database`);
}