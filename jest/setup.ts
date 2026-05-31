/* eslint-disable @typescript-eslint/no-require-imports */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { loadConfig, register } from 'tsconfig-paths';
import { sample } from 'openapi-sampler';
import { isDeepStrictEqual } from 'node:util';

export default async () => {
  const tsconfig = loadConfig(process.cwd());

  if (tsconfig.resultType === 'failed') {
    throw new Error(`Failed to load tsconfig: ${tsconfig.message}`);
  }

  const unregister = register({
    baseUrl: tsconfig.absoluteBaseUrl,
    paths: tsconfig.paths,
  });

  let app: { close: () => Promise<void> } | undefined;

  try {
    const { SwaggerModule } = require('@nestjs/swagger');
    const { createDocumentBuilderFactory } = require('../src/infra/swagger');
    const { TargetsModule } = require('../src/modules/targets/targets.module');
    const { StepsModule } = require('../src/modules/steps/steps.module');
    const { RewardsModule } = require('../src/modules/rewards/rewards.module');
    const { createTestingApp } = require('../src/helpers/create-testing-app');

    app = await createTestingApp({
      modules: [TargetsModule, StepsModule, RewardsModule],
    });

    const secureDocumentBuilder = createDocumentBuilderFactory({
      title: 'Goals service',
      description: 'Сервис управления целями.',
      version: '1.0',
      tag: 'goals',
      secure: true,
    });

    const schemas = SwaggerModule.createDocument(
      app,
      secureDocumentBuilder.build(),
      {
        include: [TargetsModule, StepsModule, RewardsModule],
      },
    ).components?.schemas;

    const mocksDir = join(process.cwd(), process.env.MOCKS_DIR ?? 'src/mocks');

    mkdirSync(mocksDir, { recursive: true });

    Object.entries(schemas).forEach(([name, schema]) => {
      const mock = sample(schema as any, { skipReadOnly: true });
      const mockPath = path.join(mocksDir, `${name}.json`);

      if (existsSync(mockPath)) {
        const result = readFileSync(mockPath, 'utf-8');

        if (!isDeepStrictEqual(JSON.parse(result), mock)) {
          writeFileSync(mockPath, JSON.stringify(mock));
        }
      } else {
        writeFileSync(mockPath, JSON.stringify(mock));
      }
    });
  } finally {
    if (app) {
      await app.close();
    }

    unregister();
  }
};
