import { db } from "./db";
import { paintBarcodes, paintCatalog } from "../shared/schema";
import { eq } from "drizzle-orm";

interface ParsedPaint {
  name: string;
  brand: string;
  type: string;
  hexColor: string;
  r: number;
  g: number;
  b: number;
  isDiscontinued: boolean;
  barcodes: string[];
  hasSourceColor: boolean;
}

interface WarHubManifestFile {
  path: string;
  kind?: string;
  partition?: string;
}

interface WarHubManifest {
  version?: string;
  files?: WarHubManifestFile[];
}

interface WarHubPaintRecord {
  brand?: string;
  name?: string;
  type?: string;
  range?: string;
  hex?: string;
  status?: string;
  ean?: string | number;
  additionalEans?: Array<string | number>;
}

interface WarHubPaintPartition {
  partition?: {
    label?: string;
  };
  paints?: WarHubPaintRecord[];
}

const WARHUB_BASE_URL = "https://warhub.github.io/warhub-catalog";
const WARHUB_MANIFEST_URL = `${WARHUB_BASE_URL}/manifest.json`;

function normalizedBrand(brand: string): string {
  const value = brand.trim().toLowerCase().replace(/\s+/g, " ");
  const aliases: Record<string, string> = {
    "citadel colour": "citadel",
    "p3 (privateer press)": "p3",
    "vallejo game color": "vallejo",
  };
  return aliases[value] || value;
}

function paintKey(paint: { name: string; brand: string; type: string }): string {
  return [
    normalizedBrand(paint.brand),
    paint.name,
    paint.type,
  ]
    .map(value => value.trim().toLowerCase().replace(/\s+/g, " "))
    .join("|");
}

function normalizeBarcode(value: string | number | undefined): string | null {
  if (value === undefined || value === null) return null;
  const barcode = String(value).trim().replace(/\D/g, "");
  return barcode.length >= 6 ? barcode : null;
}

function parseHexColor(value: string | undefined): { hexColor: string; r: number; g: number; b: number } | null {
  const match = value?.trim().match(/^#?([a-f0-9]{6})$/i);
  if (!match) return null;

  const hex = match[1].toUpperCase();
  return {
    hexColor: `#${hex}`,
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function parseWarHubPaint(record: WarHubPaintRecord, partitionBrand: string): ParsedPaint | null {
  const name = record.name?.trim();
  const brand = record.brand?.trim() || partitionBrand.trim();
  const type = record.type?.trim() || record.range?.trim() || "Unknown";
  const sourceColor = parseHexColor(record.hex);
  const color = sourceColor || { hexColor: "#808080", r: 128, g: 128, b: 128 };

  if (!name || !brand) return null;

  const barcodes = [record.ean, ...(record.additionalEans || [])]
    .map(normalizeBarcode)
    .filter((barcode): barcode is string => barcode !== null);

  return {
    name,
    brand,
    type,
    ...color,
    isDiscontinued: record.status?.toLowerCase() === "discontinued",
    barcodes: [...new Set(barcodes)],
    hasSourceColor: sourceColor !== null,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`WarHub request failed (${response.status}): ${url}`);
  }
  return response.json() as Promise<T>;
}

async function fetchWarHubPaints(): Promise<{ paints: ParsedPaint[]; brands: string[]; version: string }> {
  const manifest = await fetchJson<WarHubManifest>(WARHUB_MANIFEST_URL);
  const partitionFiles = (manifest.files || []).filter(file =>
    file.kind === "paint-catalog-partition" &&
    file.path.startsWith("paints/by-brand/") &&
    file.path.endsWith(".json")
  );

  if (partitionFiles.length === 0) {
    throw new Error("WarHub manifest did not contain any paint partitions");
  }

  const allPaints: ParsedPaint[] = [];
  const importedBrands: string[] = [];

  for (const file of partitionFiles) {
    const partition = await fetchJson<WarHubPaintPartition>(`${WARHUB_BASE_URL}/${file.path}`);
    const partitionBrand = partition.partition?.label || file.partition || "Unknown";
    const paints = (partition.paints || [])
      .map(record => parseWarHubPaint(record, partitionBrand))
      .filter((paint): paint is ParsedPaint => paint !== null);

    if (paints.length > 0) {
      allPaints.push(...paints);
      importedBrands.push(partitionBrand);
      console.log(`Parsed ${paints.length} paints from WarHub: ${partitionBrand}`);
    }
  }

  return {
    paints: allPaints,
    brands: importedBrands,
    version: manifest.version || "unknown",
  };
}

export async function importAllPaints(): Promise<{
  success: boolean;
  count: number;
  added: number;
  updated: number;
  unchanged: number;
  barcodesAdded: number;
  barcodesSkipped: number;
  brands: string[];
  message: string;
}> {
  let source: { paints: ParsedPaint[]; brands: string[]; version: string };

  try {
    source = await fetchWarHubPaints();
  } catch (error) {
    console.error("Error fetching WarHub catalog:", error);
    return {
      success: false,
      count: 0,
      added: 0,
      updated: 0,
      unchanged: 0,
      barcodesAdded: 0,
      barcodesSkipped: 0,
      brands: [],
      message: `WarHub sync failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  if (source.paints.length === 0) {
    return {
      success: false,
      count: 0,
      added: 0,
      updated: 0,
      unchanged: 0,
      barcodesAdded: 0,
      barcodesSkipped: 0,
      brands: [],
      message: "WarHub returned no usable paint records",
    };
  }

  try {
    const existingPaints = await db.select().from(paintCatalog);
    const existingByKey = new Map(existingPaints.map(paint => [paintKey(paint), paint]));
    const sourceByKey = new Map<string, ParsedPaint>();
    const paintsToUpdate: Array<{
      id: number;
      paint: ParsedPaint;
      existing: typeof existingPaints[number];
    }> = [];
    let added = 0;
    let unchanged = 0;

    for (const paint of source.paints) {
      const key = paintKey(paint);
      const priorSourcePaint = sourceByKey.get(key);
      if (priorSourcePaint) {
        priorSourcePaint.barcodes = [...new Set([...priorSourcePaint.barcodes, ...paint.barcodes])];
        continue;
      }
      sourceByKey.set(key, paint);

      const existing = existingByKey.get(key);
      if (!existing) {
        added++;
        continue;
      }

      const hasChanges =
        existing.name !== paint.name ||
        existing.brand !== paint.brand ||
        existing.type !== paint.type ||
        (paint.hasSourceColor && existing.hexColor !== paint.hexColor) ||
        (paint.hasSourceColor && existing.r !== paint.r) ||
        (paint.hasSourceColor && existing.g !== paint.g) ||
        (paint.hasSourceColor && existing.b !== paint.b) ||
        existing.isDiscontinued !== paint.isDiscontinued;

      if (!hasChanges) {
        unchanged++;
        continue;
      }

      paintsToUpdate.push({ id: existing.id, paint, existing });
    }

    const paintsToInsert = [...sourceByKey.values()].filter(paint => !existingByKey.has(paintKey(paint)));
    const batchSize = 100;
    const updateBatchSize = 40;
    for (let i = 0; i < paintsToUpdate.length; i += updateBatchSize) {
      const batch = paintsToUpdate.slice(i, i + updateBatchSize);
      await Promise.all(batch.map(({ id, paint, existing }) =>
        // Keep barcode and createdAt untouched so existing direct and community
        // mappings continue to point at the same catalog ID.
        db.update(paintCatalog)
          .set({
            name: paint.name,
            brand: paint.brand,
            type: paint.type,
            hexColor: paint.hasSourceColor ? paint.hexColor : existing.hexColor,
            r: paint.hasSourceColor ? paint.r : existing.r,
            g: paint.hasSourceColor ? paint.g : existing.g,
            b: paint.hasSourceColor ? paint.b : existing.b,
            isDiscontinued: paint.isDiscontinued,
          })
          .where(eq(paintCatalog.id, id))
      ));
    }

    const updated = paintsToUpdate.length;
    for (let i = 0; i < paintsToInsert.length; i += batchSize) {
      const batch = paintsToInsert.slice(i, i + batchSize)
        .map(({ barcodes: _barcodes, hasSourceColor: _hasSourceColor, ...paint }) => paint);
      await db.insert(paintCatalog).values(batch);
      console.log(`Inserted ${Math.min(i + batch.length, paintsToInsert.length)}/${paintsToInsert.length} new WarHub paints...`);
    }

    // Re-read after inserts so newly created records have their catalog IDs.
    const catalogAfterSync = await db.select().from(paintCatalog);
    const catalogByKey = new Map(catalogAfterSync.map(paint => [paintKey(paint), paint]));
    const existingBarcodeRows = await db.select().from(paintBarcodes);
    const knownBarcodes = new Set(existingBarcodeRows.map(row => row.barcode));
    const directBarcodeOwners = new Map(
      catalogAfterSync
        .filter(paint => paint.barcode)
        .map(paint => [paint.barcode as string, paint.id])
    );
    const barcodeMappings: { barcode: string; catalogId: number }[] = [];
    let barcodesSkipped = 0;

    for (const paint of sourceByKey.values()) {
      const catalogPaint = catalogByKey.get(paintKey(paint));
      if (!catalogPaint) continue;

      for (const barcode of paint.barcodes) {
        const directOwner = directBarcodeOwners.get(barcode);
        if (directOwner !== undefined && directOwner !== catalogPaint.id) {
          barcodesSkipped++;
          continue;
        }
        if (knownBarcodes.has(barcode)) {
          barcodesSkipped++;
          continue;
        }
        knownBarcodes.add(barcode);
        barcodeMappings.push({ barcode, catalogId: catalogPaint.id });
      }
    }

    for (let i = 0; i < barcodeMappings.length; i += batchSize) {
      const batch = barcodeMappings.slice(i, i + batchSize);
      await db.insert(paintBarcodes)
        .values(batch)
        .onConflictDoNothing({ target: paintBarcodes.barcode });
    }

    const total = existingPaints.length + added;
    const message = `WarHub ${source.version} sync complete: ${added} added, ${updated} updated, ${unchanged} unchanged, ${barcodeMappings.length} barcode mappings added. Existing catalog entries, community mappings, and user inventory were preserved.`;
    console.log(message);

    return {
      success: true,
      count: total,
      added,
      updated,
      unchanged,
      barcodesAdded: barcodeMappings.length,
      barcodesSkipped,
      brands: source.brands,
      message,
    };
  } catch (error) {
    console.error("Error merging WarHub catalog:", error);
    return {
      success: false,
      count: 0,
      added: 0,
      updated: 0,
      unchanged: 0,
      barcodesAdded: 0,
      barcodesSkipped: 0,
      brands: [],
      message: `WarHub sync failed while saving: ${error instanceof Error ? error.message : String(error)}`,
    };
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
    console.error("Error getting catalog stats:", error);
    return { totalPaints: 0, brands: [] };
  }
}
