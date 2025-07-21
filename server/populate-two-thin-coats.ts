import { db } from './db';
import { paints } from '@shared/schema';
import { getAllTwoThinCoatsPaints } from './two-thin-coats-database';
import { eq, and } from 'drizzle-orm';

async function populateTwoThinCoatsPaints() {
  console.log('Starting Two Thin Coats paint population...');
  
  const twoThinCoatsPaints = getAllTwoThinCoatsPaints();
  let addedCount = 0;
  let skippedCount = 0;

  for (const paintData of twoThinCoatsPaints) {
    try {
      // Check if paint already exists
      const [existingPaint] = await db
        .select()
        .from(paints)
        .where(and(eq(paints.name, paintData.name), eq(paints.brand, 'Two Thin Coats')))
        .limit(1);

      if (existingPaint) {
        console.log(`Skipped existing: ${paintData.name}`);
        skippedCount++;
        continue;
      }

      // Insert new paint
      await db.insert(paints).values({
        name: paintData.name,
        brand: 'Two Thin Coats',
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

  console.log(`Two Thin Coats population complete!`);
  console.log(`Added: ${addedCount} paints`);
  console.log(`Skipped: ${skippedCount} existing paints`);
  console.log(`Total Two Thin Coats paints processed: ${twoThinCoatsPaints.length}`);
}

// Run the population
populateTwoThinCoatsPaints().then(() => {
  console.log('Two Thin Coats database population finished');
  process.exit(0);
}).catch(error => {
  console.error('Two Thin Coats population failed:', error);
  process.exit(1);
});