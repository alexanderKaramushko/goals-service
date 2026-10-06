import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { createTestingApp } from 'src/helpers/create-testing-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
      modules: [AppModule],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/app/health/ready (GET)', async () => {
    await request(app.getHttpServer())
      .get('/app/health/ready')
      .expect(200)
      .expect('OK!');
  });
});
