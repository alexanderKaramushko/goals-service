import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResultRow } from 'pg';
import type { EnvironmentVariables } from 'src/infra/config/config.module';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {
    const databaseUrl = this.configService.get('DATABASE_URL', {
      infer: true,
    });
    const config = databaseUrl
      ? {
          connectionString: databaseUrl,
        }
      : {
          host: this.configService.getOrThrow('POSTGRES_DB_HOST', {
            infer: true,
          }),
          port: this.configService.getOrThrow('POSTGRES_DB_PORT', {
            infer: true,
          }),
          user: this.configService.getOrThrow('POSTGRES_DB_USER', {
            infer: true,
          }),
          password: this.configService.getOrThrow('POSTGRES_DB_PASSWORD', {
            infer: true,
          }),
          database: this.configService.getOrThrow('POSTGRES_DB_NAME', {
            infer: true,
          }),
        };

    this.pool = new Pool(config);
  }

  async query<T extends QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query<T>(sql, params);

      return result.rows;
    } finally {
      client.release();
    }
  }

  getPoolClient() {
    return this.pool.connect();
  }

  onModuleInit() {
    if (
      this.configService.getOrThrow('NODE_ENV', { infer: true }) ===
      'development'
    ) {
      this.pool.addListener('connect', () => {
        console.log('Успешно подключились к БД');
      });
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
