import { db } from "./db";
import { paints } from "@shared/schema";
import { getAllVallejoPaints } from "./vallejo-complete-database";
import { eq, and } from "drizzle-orm";

async function populateVallejoPaints() {
  try {
    console.log("Starting Vallejo paint population...");
    
    // Use complete authentic Vallejo paint database
    console.log("Loading complete Vallejo paint catalog...");
    const vallejoPaints = getAllVallejoPaints();
    
    console.log(`Processing ${vallejoPaints.length} Vallejo paints...`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const paint of vallejoPaints) {
      try {
        // Check if paint already exists (by name and brand)
        const existing = await db
          .select()
          .from(paints)
          .where(and(
            eq(paints.name, paint.name),
            eq(paints.brand, "Vallejo")
          ))
          .limit(1);
        
        if (existing.length > 0) {
          skippedCount++;
          continue;
        }
        
        // Insert new paint
        await db.insert(paints).values({
          name: paint.name,
          brand: "Vallejo",
          color: paint.color,
          type: paint.type.toLowerCase(),
          status: "available",
          userId: null, // Master catalog entry
          isWishlist: false,
          quantity: null,
          priority: null,
          notes: paint.description || null
        });
        
        insertedCount++;
        
        if (insertedCount % 10 === 0) {
          console.log(`Inserted ${insertedCount} paints...`);
        }
        
      } catch (error) {
        console.error(`Error inserting paint "${paint.name}":`, error);
      }
    }
    
    console.log(`Vallejo paint population complete!`);
    console.log(`- Inserted: ${insertedCount} new paints`);
    console.log(`- Skipped: ${skippedCount} existing paints`);
    console.log(`- Total processed: ${vallejoPaints.length} paints`);
    
    return {
      success: true,
      inserted: insertedCount,
      skipped: skippedCount,
      total: vallejoPaints.length
    };
    
  } catch (error) {
    console.error("Error populating Vallejo paints:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateVallejoPaints()
    .then((result) => {
      console.log("Final result:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

export { populateVallejoPaints };