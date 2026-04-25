import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRES_DB_HOST,
      port: Number.parseInt(process.env.POSTGRES_DB_PORT, 10),
      user: process.env.POSTGRES_DB_USER,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
    });
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

  onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      this.pool.addListener('connect', () => {
        console.log('Успешно подключились к БД');
      });
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
