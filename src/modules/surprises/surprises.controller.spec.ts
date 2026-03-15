import { TestingModule } from '@nestjs/testing';
import { SurprisesController } from './surprises.controller';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('SurprisesController', () => {
  let controller: SurprisesController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      controllers: [SurprisesController],
    }).compile();

    controller = module.get<SurprisesController>(SurprisesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
