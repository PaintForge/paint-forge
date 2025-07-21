import * as cheerio from 'cheerio';

interface CitadelPaint {
  name: string;
  type: string;
  color: string;
  imageUrl?: string;
  description?: string;
}

// Function to extract paint data from a specific paint category page
async function scrapePaintCategory(categoryUrl: string, categoryType: string): Promise<CitadelPaint[]> {
  try {
    console.log(`Scraping ${categoryType} paints from: ${categoryUrl}`);
    
    const response = await fetch(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${categoryUrl}: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const paints: CitadelPaint[] = [];
    
    // Multiple selector strategies for different possible layouts
    const selectors = [
      // WordPress post/product selectors
      '.post-item, .product-item, .colour-item',
      // Generic card/item selectors
      '.card, .item, .product',
      // List item selectors
      'li[class*="paint"], li[class*="colour"], li[class*="product"]',
      // Article/section selectors
      'article, section[class*="paint"], section[class*="colour"]',
      // WordPress block selectors
      '.wp-block-group, .wp-block-column',
      // Generic container selectors with paint-related content
      'div[class*="paint"], div[class*="colour"], div[class*="product"]'
    ];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        const $element = $(element);
        
        // Extract paint name from various possible elements
        let name = '';
        const nameSelectors = [
          'h1, h2, h3, h4, h5, h6',
          '.title, .name, .product-title, .paint-name',
          '.wp-block-heading',
          'strong, b',
          'a[title]'
        ];
        
        for (const nameSelector of nameSelectors) {
          const foundName = $element.find(nameSelector).first().text().trim();
          if (foundName && foundName.length > 2 && foundName.length < 100) {
            name = foundName;
            break;
          }
        }
        
        // If no name found in children, check element text
        if (!name) {
          const elementText = $element.text().trim();
          if (elementText && elementText.length > 2 && elementText.length < 100 && !elementText.includes('\n')) {
            name = elementText;
          }
        }
        
        // Extract image URL
        const imageUrl = $element.find('img').attr('src') || 
                        $element.find('img').attr('data-src') ||
                        $element.find('img').attr('data-lazy-src');
        
        // Extract color value from various sources
        let color = '#000000';
        
        // Check for style attributes with background colors
        const styleAttr = $element.attr('style') || $element.find('[style*="background"]').attr('style');
        if (styleAttr) {
          const colorMatch = styleAttr.match(/#[0-9a-fA-F]{6}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/);
          if (colorMatch) {
            color = colorMatch[0];
          }
        }
        
        // Check for data attributes
        const dataColor = $element.attr('data-color') || 
                         $element.find('[data-color]').attr('data-color') ||
                         $element.attr('data-bg-color');
        if (dataColor && dataColor.startsWith('#')) {
          color = dataColor;
        }
        
        // Extract description
        const description = $element.find('.description, .excerpt, .summary').first().text().trim();
        
        // Only add if we found a reasonable name
        if (name && name.length > 2 && !name.toLowerCase().includes('cookie') && !name.toLowerCase().includes('menu')) {
          paints.push({
            name: name.replace(/[^\w\s-]/g, '').trim(),
            type: categoryType,
            color,
            imageUrl: imageUrl ? new URL(imageUrl, categoryUrl).href : undefined,
            description: description || undefined
          });
        }
      });
      
      if (paints.length > 0) break; // Stop if we found paints with this selector
    }
    
    // Remove duplicates based on name
    const uniquePaints = paints.filter((paint, index, self) => 
      index === self.findIndex(p => p.name.toLowerCase() === paint.name.toLowerCase())
    );
    
    console.log(`Found ${uniquePaints.length} ${categoryType} paints`);
    return uniquePaints;
    
  } catch (error) {
    console.error(`Error scraping ${categoryType} paints:`, error);
    return [];
  }
}

// Function to discover paint category links from the main page
async function discoverPaintCategories(mainUrl: string): Promise<{ url: string; type: string }[]> {
  try {
    console.log(`Discovering paint categories from: ${mainUrl}`);
    
    const response = await fetch(mainUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch main page: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const categories: { url: string; type: string }[] = [];
    
    // Look for category links - common patterns for paint category navigation
    const categorySelectors = [
      'a[href*="base"]',
      'a[href*="layer"]', 
      'a[href*="shade"]',
      'a[href*="technical"]',
      'a[href*="dry"]',
      'a[href*="contrast"]',
      '.category-link',
      '.paint-category',
      '.colour-category'
    ];
    
    categorySelectors.forEach(selector => {
      $(selector).each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        const text = $link.text().trim().toLowerCase();
        
        if (href && text) {
          const fullUrl = new URL(href, mainUrl).href;
          
          // Determine paint type from link text
          let type = 'Unknown';
          if (text.includes('base')) type = 'Base';
          else if (text.includes('layer')) type = 'Layer';
          else if (text.includes('shade')) type = 'Shade';
          else if (text.includes('technical')) type = 'Technical';
          else if (text.includes('dry')) type = 'Dry';
          else if (text.includes('contrast')) type = 'Contrast';
          
          categories.push({ url: fullUrl, type });
        }
      });
    });
    
    // Remove duplicates
    const uniqueCategories = categories.filter((category, index, self) => 
      index === self.findIndex(c => c.url === category.url)
    );
    
    console.log(`Found ${uniqueCategories.length} paint categories`);
    return uniqueCategories;
    
  } catch (error) {
    console.error('Error discovering paint categories:', error);
    return [];
  }
}

// Main scraping function
export async function scrapeAllCitadelPaints(): Promise<CitadelPaint[]> {
  const mainUrl = 'https://citadelcolour.com/the-paint-range/';
  const allPaints: CitadelPaint[] = [];
  
  try {
    // First, try to discover category pages automatically
    const categories = await discoverPaintCategories(mainUrl);
    
    if (categories.length > 0) {
      // Scrape each discovered category
      for (const category of categories) {
        const categoryPaints = await scrapePaintCategory(category.url, category.type);
        allPaints.push(...categoryPaints);
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      // Fallback: try to scrape the main page directly
      console.log('No categories found, trying to scrape main page directly');
      const mainPagePaints = await scrapePaintCategory(mainUrl, 'Citadel');
      allPaints.push(...mainPagePaints);
    }
    
    console.log(`Total paints scraped: ${allPaints.length}`);
    return allPaints;
    
  } catch (error) {
    console.error('Error in main scraping function:', error);
    return [];
  }
}

// Manual scraping function with known URLs (fallback)
export async function scrapeKnownCitadelCategories(): Promise<CitadelPaint[]> {
  const knownCategories = [
    { url: 'https://citadelcolour.com/the-paint-range/base/', type: 'Base' },
    { url: 'https://citadelcolour.com/the-paint-range/layer/', type: 'Layer' },
    { url: 'https://citadelcolour.com/the-paint-range/shade/', type: 'Shade' },
    { url: 'https://citadelcolour.com/the-paint-range/technical/', type: 'Technical' },
    { url: 'https://citadelcolour.com/the-paint-range/dry/', type: 'Dry' },
    { url: 'https://citadelcolour.com/the-paint-range/contrast/', type: 'Contrast' }
  ];
  
  const allPaints: CitadelPaint[] = [];
  
  for (const category of knownCategories) {
    const categoryPaints = await scrapePaintCategory(category.url, category.type);
    allPaints.push(...categoryPaints);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return allPaints;
}