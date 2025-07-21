import { db } from './db';
import { paints } from '@shared/schema';
import { getAllScale75Paints } from './scale75-database';
import { eq, and } from 'drizzle-orm';

async function populateScale75Paints() {
  console.log('Starting Scale75 paint population...');
  
  const scale75Paints = getAllScale75Paints();
  let addedCount = 0;
  let skippedCount = 0;

  for (const paintData of scale75Paints) {
    try {
      // Check if paint already exists
      const [existingPaint] = await db
        .select()
        .from(paints)
        .where(and(eq(paints.name, paintData.name), eq(paints.brand, 'Scale75')))
        .limit(1);

      if (existingPaint) {
        console.log(`Skipped existing: ${paintData.name}`);
        skippedCount++;
        continue;
      }

      // Insert new paint
      await db.insert(paints).values({
        name: paintData.name,
        brand: 'Scale75',
        type: paintData.type,
        color: paintData.color,
        quantity: 0,
        status: 'not_owned',
        isWishlist: false,
        priority: 'medium',
        notes: paintData.description
      });

      console.log(`Added: ${paintData.name} (${paintData.type}) - ${paintData.color}`);
      addedCount++;

    } catch (error) {
      console.error(`Error adding ${paintData.name}:`, error);
    }
  }

  console.log(`Scale75 population complete!`);
  console.log(`Added: ${addedCount} paints`);
  console.log(`Skipped: ${skippedCount} existing paints`);
  console.log(`Total Scale75 paints processed: ${scale75Paints.length}`);
}

// Run the population
populateScale75Paints().then(() => {
  console.log('Scale75 database population finished');
  process.exit(0);
}).catch(error => {
  console.error('Scale75 population failed:', error);
  process.exit(1);
});