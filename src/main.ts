import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.SERVICE_PORT ?? 3002);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
