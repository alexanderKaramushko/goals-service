import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { createDocumentBuilderFactory } from './infra/swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { TargetModule } from './modules/targets/targets.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  const documentBuilder = createDocumentBuilderFactory({
    title: 'Health service',
    description: 'Health-сервис',
    version: '1.0',
    tag: 'health',
    secure: false,
  });

  const secureDocumentBuilder = createDocumentBuilderFactory({
    title: 'Goals service',
    description: 'Сервис управления целями.',
    version: '1.0',
    tag: 'goals',
    secure: true,
  });

  SwaggerModule.setup(
    'health',
    app,
    SwaggerModule.createDocument(app, documentBuilder.build(), {
      include: [AppModule],
    }),
  );

  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(app, secureDocumentBuilder.build(), {
      include: [TargetModule],
    }),
  );

  await app.listen(process.env.SERVICE_PORT ?? 3002);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
