import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  await app.listen(process.env.SERVICE_PORT ?? 3002);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
