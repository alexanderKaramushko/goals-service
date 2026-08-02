import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { execSync } from 'child_process';
import { clearTables } from '../factories';

type Context = {
  postgresContainer: StartedPostgreSqlContainer | null;
  postgresClient: Client | null;
};

export function setupTestDatabase(tablesToAfterClear: string[]) {
  const context: Context = {
    postgresContainer: null,
    postgresClient: null,
  };

  jest.setTimeout(60000);

  beforeAll(async () => {
    context.postgresContainer = await new PostgreSqlContainer(
      'postgres:17-alpine',
    ).start();

    context.postgresClient = new Client({
      connectionString: context.postgresContainer.getConnectionUri(),
    });

    process.env.DATABASE_URL = context.postgresContainer.getConnectionUri();
    await context.postgresClient.connect();

    execSync('pnpm run migrate:init', {
      env: {
        ...process.env,
        DATABASE_URL: context.postgresContainer.getConnectionUri(),
      },
    });
  });

  afterEach(async () => {
    if (context.postgresClient) {
      await clearTables(context.postgresClient, tablesToAfterClear);
    } else {
      throw new Error('Не найден context.postgresClient');
    }
  });

  afterAll(async () => {
    await context.postgresClient?.end();
    await context.postgresContainer?.stop();
  });

  return context;
}
