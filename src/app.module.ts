import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DbModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthMicroserviceModule } from './modules/microservices/auth/auth-microservice.module';
import { UserMiddleware } from './middlewares/user/user.middleware';
import { AppController } from './app/app.controller';

@Module({
  imports: [DbModule, ConfigModule.forRoot(), AuthMicroserviceModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('*');
  }
}
