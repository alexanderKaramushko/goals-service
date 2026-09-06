import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { MAX_OUTDATED_STEPS_PERCENTAGE_FALLBACK } from 'src/constants';

export interface EnvironmentVariables {
  NODE_ENV: string;
  SERVICE_HOST: string;
  SERVICE_PORT: number;
  MICROSERVICE_HOST: string;
  MICROSERVICE_PORT: number;
  ISSUER?: string;
  DATABASE_URL?: string;
  POSTGRES_DB_NAME?: string;
  POSTGRES_DB_PORT: number;
  POSTGRES_DB_HOST?: string;
  POSTGRES_DB_USER?: string;
  POSTGRES_DB_PASSWORD?: string;
  MAX_OUTDATED_STEPS_PERCENTAGE: number;
}

export const environmentValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  SERVICE_HOST: Joi.string().trim().default('0.0.0.0'),
  SERVICE_PORT: Joi.number().port().default(3000),
  MICROSERVICE_HOST: Joi.string().trim().default('0.0.0.0'),
  MICROSERVICE_PORT: Joi.number().port().default(3002),
  ISSUER: Joi.string().trim().when('NODE_ENV', {
    is: 'test',
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .optional(),
  POSTGRES_DB_NAME: Joi.string()
    .trim()
    .when('NODE_ENV', {
      is: 'test',
      then: Joi.optional(),
      otherwise: Joi.when('DATABASE_URL', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
    }),
  POSTGRES_DB_PORT: Joi.number().port().default(5432),
  POSTGRES_DB_HOST: Joi.string()
    .trim()
    .when('NODE_ENV', {
      is: 'test',
      then: Joi.optional(),
      otherwise: Joi.when('DATABASE_URL', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
    }),
  POSTGRES_DB_USER: Joi.string()
    .trim()
    .when('NODE_ENV', {
      is: 'test',
      then: Joi.optional(),
      otherwise: Joi.when('DATABASE_URL', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
    }),
  POSTGRES_DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.optional(),
    otherwise: Joi.when('DATABASE_URL', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
  }),
  MAX_OUTDATED_STEPS_PERCENTAGE: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .default(MAX_OUTDATED_STEPS_PERCENTAGE_FALLBACK),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: environmentValidationSchema,
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
