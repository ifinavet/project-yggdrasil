import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config();

if (!process.env.DATABASE_URL) {
  throw new Error('Database URL is not defined');
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
