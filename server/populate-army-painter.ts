import { db } from "./db";
import { paints } from "../shared/schema";
import { getAllArmyPainterPaints } from "./army-painter-database";

async function populateArmyPainterPaints() {
  console.log("Starting Army Painter paint population...");
  
  const armyPainterPaints = getAllArmyPainterPaints();
  console.log(`Loading ${armyPainterPaints.length} Army Painter paints...`);

  let insertedCount = 0;
  const batchSize = 10;

  for (let i = 0; i < armyPainterPaints.length; i += batchSize) {
    const batch = armyPainterPaints.slice(i, i + batchSize);
    
    try {
      for (const paint of batch) {
        await db
          .insert(paints)
          .values({
            name: paint.name,
            brand: "Army Painter",
            type: paint.type,
            color: paint.color,
            quantity: 0,
            status: "not_owned",
            isWishlist: false,
            priority: "medium",
            notes: `Product Code: ${paint.productCode}`,
          })
          .onConflictDoNothing(); // Avoid duplicates
      }
      
      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount} paints...`);
    } catch (error) {
      console.error(`Error inserting batch starting at index ${i}:`, error);
    }
  }

  console.log(`Army Painter paint population complete! Added ${insertedCount} paints.`);
}

// Run the population
populateArmyPainterPaints()
  .then(() => {
    console.log("Army Painter population finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Army Painter population failed:", error);
    process.exit(1);
  });