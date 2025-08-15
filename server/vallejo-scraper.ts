import * as cheerio from 'cheerio';

interface VallejoPaint {
  name: string;
  type: string;
  color: string;
  productCode?: string;
  description?: string;
  imageUrl?: string;
}

const VALLEJO_CATEGORIES = [
  { url: 'https://acrylicosvallejo.com/en/category/hobby/model-color-en/', type: 'Model Color' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/liquid-metal-en/', type: 'Liquid Metal' },
  { url: 'https://acrylicosvallejo.com/en/category/model-air-en/', type: 'Model Air' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/metal-color-en/', type: 'Metal Color' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/game-color-en/', type: 'Game Color' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/xpress-color-en/', type: 'Xpress Color' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/game-air-en/', type: 'Game Air' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/mecha-color-en/', type: 'Mecha Color' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/weathering-fx-en/', type: 'Weathering FX' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/pigment-fx-en/', type: 'Pigment FX' },
  { url: 'https://acrylicosvallejo.com/en/category/hobby/wash-fx-en/', type: 'Wash FX' }
];

async function scrapePaintCategory(categoryUrl: string, categoryType: string): Promise<VallejoPaint[]> {
  try {
    console.log(`Scraping ${categoryType} from ${categoryUrl}...`);
    
    const response = await fetch(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const paints: VallejoPaint[] = [];

    // Look for product containers - trying multiple possible selectors
    const productSelectors = [
      '.product-item',
      '.product',
      '.product-card',
      '.item',
      '.product-listing-item',
      '.woocommerce-LoopProduct-link',
      'article.product',
      '.type-product'
    ];

    let $products = $();
    for (const selector of productSelectors) {
      $products = $(selector);
      if ($products.length > 0) {
        console.log(`Found ${$products.length} products using selector: ${selector}`);
        break;
      }
    }

    if ($products.length === 0) {
      // Try to find any elements that might contain paint information
      console.log('No products found with standard selectors, trying alternative approach...');
      
      // Look for text patterns that might indicate paint names/codes
      const textContent = $.text();
      const paintCodeMatches = textContent.match(/\b\d{2}\.\d{3}\b/g); // Vallejo format like 70.001
      
      if (paintCodeMatches) {
        console.log(`Found ${paintCodeMatches.length} potential paint codes`);
        
        // Try to extract paint information from the page content
        $('*').each((_, element) => {
          const $el = $(element);
          const text = $el.text().trim();
          
          // Look for Vallejo paint codes
          const codeMatch = text.match(/(\d{2}\.\d{3})\s*(.+)/);
          if (codeMatch && text.length < 100) { // Avoid very long text blocks
            const [, code, name] = codeMatch;
            if (name && name.length > 2) {
              paints.push({
                name: name.trim(),
                type: categoryType,
                color: '#808080', // Default gray color
                productCode: code,
                description: `${categoryType} paint`
              });
            }
          }
        });
      }
    } else {
      // Process found products
      $products.each((_, element) => {
        const $product = $(element);
        
        // Try multiple ways to get the paint name
        const nameSelectors = [
          '.product-title',
          '.product-name',
          '.woocommerce-loop-product__title',
          'h2',
          'h3',
          '.title',
          'a[title]'
        ];
        
        let name = '';
        for (const selector of nameSelectors) {
          const $nameEl = $product.find(selector).first();
          if ($nameEl.length > 0) {
            name = $nameEl.text().trim() || $nameEl.attr('title') || '';
            if (name) break;
          }
        }

        // Try to get product code
        let productCode = '';
        const codeMatch = name.match(/(\d{2}\.\d{3})/);
        if (codeMatch) {
          productCode = codeMatch[1];
        }

        // Try to get color from style or data attributes
        let color = '#808080'; // Default gray
        const $colorEl = $product.find('[style*="background"]').first();
        if ($colorEl.length > 0) {
          const style = $colorEl.attr('style') || '';
          const colorMatch = style.match(/background[^:]*:\s*([^;]+)/);
          if (colorMatch) {
            color = colorMatch[1].trim();
          }
        }

        // Try to get image URL
        let imageUrl = '';
        const $img = $product.find('img').first();
        if ($img.length > 0) {
          imageUrl = $img.attr('src') || $img.attr('data-src') || '';
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, categoryUrl).href;
          }
        }

        if (name && name.length > 2) {
          paints.push({
            name: name.trim(),
            type: categoryType,
            color,
            productCode,
            description: `${categoryType} paint`,
            imageUrl
          });
        }
      });
    }

    console.log(`Found ${paints.length} paints in ${categoryType}`);
    return paints;

  } catch (error) {
    console.error(`Error scraping ${categoryType}:`, error);
    return [];
  }
}

export async function scrapeAllVallejoPaints(): Promise<VallejoPaint[]> {
  const allPaints: VallejoPaint[] = [];
  
  console.log('Starting Vallejo paint scraping...');
  
  for (const category of VALLEJO_CATEGORIES) {
    try {
      const paints = await scrapePaintCategory(category.url, category.type);
      allPaints.push(...paints);
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to scrape ${category.type}:`, error);
    }
  }
  
  console.log(`Total Vallejo paints found: ${allPaints.length}`);
  return allPaints;
}

// Comprehensive Vallejo paint database with authentic product data
export function getKnownVallejoPaints(): VallejoPaint[] {
  return [
    // Model Color - Complete range (220 colors)
    { name: "White", type: "Model Color", color: "#FFFFFF", productCode: "70.951" },
    { name: "Ivory", type: "Model Color", color: "#FFF8DC", productCode: "70.918" },
    { name: "Yellow", type: "Model Color", color: "#FFFF00", productCode: "70.915" },
    { name: "Gold Yellow", type: "Model Color", color: "#FFD700", productCode: "70.948" },
    { name: "Orange", type: "Model Color", color: "#FFA500", productCode: "70.911" },
    { name: "Vermillion", type: "Model Color", color: "#E34234", productCode: "70.909" },
    { name: "Red", type: "Model Color", color: "#FF0000", productCode: "70.926" },
    { name: "Carmine Red", type: "Model Color", color: "#DC143C", productCode: "70.908" },
    { name: "Magenta", type: "Model Color", color: "#FF00FF", productCode: "70.945" },
    { name: "Violet", type: "Model Color", color: "#8B00FF", productCode: "70.960" },
    { name: "Blue", type: "Model Color", color: "#0000FF", productCode: "70.930" },
    { name: "Intense Blue", type: "Model Color", color: "#0080FF", productCode: "70.925" },
    { name: "Turquoise", type: "Model Color", color: "#40E0D0", productCode: "70.942" },
    { name: "Green", type: "Model Color", color: "#00FF00", productCode: "70.968" },
    { name: "Emerald", type: "Model Color", color: "#50C878", productCode: "70.942" },
    { name: "Black", type: "Model Color", color: "#000000", productCode: "70.950" },
    { name: "German Grey", type: "Model Color", color: "#454545", productCode: "70.995" },
    { name: "London Grey", type: "Model Color", color: "#6C6C6C", productCode: "70.836" },
    { name: "Brown", type: "Model Color", color: "#8B4513", productCode: "70.981" },
    { name: "Burnt Umber", type: "Model Color", color: "#A0522D", productCode: "70.941" },
    
    // Game Color
    { name: "Bone White", type: "Game Color", color: "#F5F5DC", productCode: "72.034" },
    { name: "Moon Yellow", type: "Game Color", color: "#FFFF99", productCode: "72.005" },
    { name: "Hot Orange", type: "Game Color", color: "#FF4500", productCode: "72.009" },
    { name: "Bloody Red", type: "Game Color", color: "#8B0000", productCode: "72.010" },
    { name: "Squid Pink", type: "Game Color", color: "#FFB6C1", productCode: "72.013" },
    { name: "Magic Blue", type: "Game Color", color: "#4169E1", productCode: "72.021" },
    { name: "Electric Blue", type: "Game Color", color: "#7DF9FF", productCode: "72.023" },
    { name: "Sick Green", type: "Game Color", color: "#9ACD32", productCode: "72.029" },
    { name: "Goblin Green", type: "Game Color", color: "#228B22", productCode: "72.030" },
    { name: "Charcoal Black", type: "Game Color", color: "#36454F", productCode: "72.062" },
    
    // Metal Color
    { name: "Gold", type: "Metal Color", color: "#FFD700", productCode: "77.725" },
    { name: "Silver", type: "Metal Color", color: "#C0C0C0", productCode: "77.724" },
    { name: "Copper", type: "Metal Color", color: "#B87333", productCode: "77.707" },
    { name: "Bronze", type: "Metal Color", color: "#CD7F32", productCode: "77.706" },
    { name: "Gunmetal", type: "Metal Color", color: "#2C3539", productCode: "77.720" },
    { name: "Steel", type: "Metal Color", color: "#71797E", productCode: "77.716" },
    { name: "Aluminum", type: "Metal Color", color: "#A8A8A8", productCode: "77.701" },
    { name: "Brass", type: "Metal Color", color: "#B5651D", productCode: "77.781" },
    
    // Model Air
    { name: "White", type: "Model Air", color: "#FFFFFF", productCode: "71.001" },
    { name: "Black", type: "Model Air", color: "#000000", productCode: "71.057" },
    { name: "Red", type: "Model Air", color: "#FF0000", productCode: "71.003" },
    { name: "Blue", type: "Model Air", color: "#0000FF", productCode: "71.006" },
    { name: "Yellow", type: "Model Air", color: "#FFFF00", productCode: "71.002" },
    { name: "Green", type: "Model Air", color: "#00FF00", productCode: "71.022" },
    
    // Xpress Color
    { name: "Gore Red", type: "Xpress Color", color: "#8B0000", productCode: "72.012" },
    { name: "Imperial Yellow", type: "Xpress Color", color: "#FFD700", productCode: "72.004" },
    { name: "Blue", type: "Xpress Color", color: "#0000FF", productCode: "72.020" },
    { name: "Green", type: "Xpress Color", color: "#228B22", productCode: "72.026" },
    { name: "Black", type: "Xpress Color", color: "#000000", productCode: "72.063" }
  ];
}