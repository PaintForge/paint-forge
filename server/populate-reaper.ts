import { db } from './db';
import { paints } from '@shared/schema';
import { getAllReaperPaints } from './reaper-database';

async function populateReaperPaints() {
  console.log('Starting Reaper Core Colors population...');
  
  try {
    const reaperPaints = getAllReaperPaints();
    console.log(`Found ${reaperPaints.length} Reaper Core Colors to process`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const paint of reaperPaints) {
      try {
        // Check if paint already exists
        const existingPaints = await db.select().from(paints);
        const existingPaint = existingPaints.find(p => 
          p.name.toLowerCase() === paint.name.toLowerCase() && 
          p.brand.toLowerCase() === 'reaper'
        );
        
        if (!existingPaint) {
          await db.insert(paints).values({
            name: paint.name,
            brand: 'Reaper',
            color: paint.color,
            type: paint.type,
            status: 'available',
            quantity: null,
            userId: null,
            isWishlist: false,
            priority: null,
            notes: paint.description || null
          });
          
          console.log(`✓ Added: ${paint.name} (${paint.productCode}) - ${paint.color}`);
          addedCount++;
        } else {
          console.log(`- Skipped: ${paint.name} (already exists)`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error adding paint ${paint.name}:`, error);
      }
    }
    
    console.log(`\n📊 Reaper Core Colors Population Complete:`);
    console.log(`   • Added: ${addedCount} paints`);
    console.log(`   • Skipped: ${skippedCount} existing paints`);
    console.log(`   • Total processed: ${reaperPaints.length} paints`);
    
  } catch (error) {
    console.error('Error during Reaper paints population:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateReaperPaints()
    .then(() => {
      console.log('✅ Reaper Core Colors population completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Reaper Core Colors population failed:', error);
      process.exit(1);
    });
}

export { populateReaperPaints };