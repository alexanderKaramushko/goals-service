import { TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
