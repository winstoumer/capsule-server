// database/index.ts

import * as postgres from 'postgres'

const port = process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined;

const sql = postgres({
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: port,
  ssl: 'require',
});

export { sql };