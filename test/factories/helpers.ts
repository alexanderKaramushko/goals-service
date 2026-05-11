import { Client } from 'pg';

export function clearTables(client: Client, tables: string[]) {
  return client.query(`
    TRUNCATE TABLE
      ${tables.join(',')}
      RESTART IDENTITY CASCADE;
  `);
}
