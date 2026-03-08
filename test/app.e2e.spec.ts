import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestingModule } from './helpers/createTestingModule';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingModule({
      modules: [AppModule],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/app/health (GET)', async () => {
    await request(app.getHttpServer())
      .get('/app/health')
      .expect(200)
      .expect('OK');
  });
});
