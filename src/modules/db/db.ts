import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class Db implements OnModuleDestroy, OnModuleInit {
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

  async query<T>(query: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();

    try {
      const res = await client.query(query, params);

      return res.rows as T[];
    } catch (error) {
      throw new Error(`Error executing query: ${error}`);
    } finally {
      // Возвращаем клиент обратно в пул
      client.release();
    }
  }

  onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      this.pool.addListener('connect', () => {
        console.log('Успешно подключились к БД');
      });

      this.pool.addListener('error', (e) => {
        console.log(e);
      });
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
