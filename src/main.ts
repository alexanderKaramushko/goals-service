import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.HOST,
      port: Number.parseInt(process.env.MICROSERVICE_PORT, 10) ?? 3000,
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3002);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
