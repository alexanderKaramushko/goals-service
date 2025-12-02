import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AuthMicroserviceService } from './auth-microservice.service';
import { AUTH_MICROSERVICE } from './tokens';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AUTH_MICROSERVICE,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('MICROSERVICE_HOST');
        const port = configService.get('MICROSERVICE_PORT');

        const microservice = ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host,
            port: Number.parseInt(port as string, 10),
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
export class AuthMicroserviceModule {}
