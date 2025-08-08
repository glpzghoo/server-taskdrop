import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  ssl: { require: true, rejectUnauthorized: false },
});
export const db = drizzle(client, { schema });
