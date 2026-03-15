import { TestingModule } from '@nestjs/testing';
import { StepsController } from './steps.controller';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('StepsController', () => {
  let controller: StepsController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      controllers: [StepsController],
    }).compile();

    controller = module.get<StepsController>(StepsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
