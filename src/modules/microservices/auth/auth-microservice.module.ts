import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AuthMicroserviceService } from 'src/modules/microservices/auth/auth-microservice.service';
import { AUTH_MICROSERVICE } from 'src/modules/microservices/auth/tokens';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from 'src/infra/config/config.module';

@Module({
  providers: [
    {
      provide: AUTH_MICROSERVICE,
      useFactory: async (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => {
        const host = configService.getOrThrow('MICROSERVICE_HOST', {
          infer: true,
        });
        const port = configService.getOrThrow('MICROSERVICE_PORT', {
          infer: true,
        });

        const microservice = ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host,
            port,
          },
        });

        await microservice.connect();

        return microservice;
      },
      inject: [ConfigService],
    },
    AuthMicroserviceService,
  ],
  exports: [AuthMicroserviceService],
})
export class AuthMicroServiceModule {}
