import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech');

let pool;
let db;

if (isNeonDatabase) {
  neonConfig.webSocketConstructor = ws;
  const neonPool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  pool = neonPool;
  db = drizzleNeon({ client: neonPool, schema });
} else {
  const pgPool = new PgPool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : false
  });
  pool = pgPool;
  db = drizzlePg(pgPool, { schema });
}

export { pool, db };
