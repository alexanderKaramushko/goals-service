import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { createDocumentBuilderFactory } from 'src/infra/swagger';
import { SwaggerModule } from '@nestjs/swagger';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { StepsModule } from 'src/modules/steps/steps.module';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from 'src/infra/config/config.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

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
    'health/docs',
    app,
    SwaggerModule.createDocument(app, documentBuilder.build(), {
      include: [AppModule],
    }),
  );

  SwaggerModule.setup(
    'api/v1/docs',
    app,
    SwaggerModule.createDocument(app, secureDocumentBuilder.build(), {
      include: [TargetsModule, StepsModule, RewardsModule, UsersModule],
    }),
  );

  app.enableShutdownHooks();

  await app.listen(
    configService.getOrThrow('SERVICE_PORT', { infer: true }),
    configService.getOrThrow('SERVICE_HOST', { infer: true }),
  );
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
