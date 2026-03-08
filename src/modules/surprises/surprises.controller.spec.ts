import { Test, TestingModule } from '@nestjs/testing';
import { SurprisesController } from './surprises.controller';

describe('SurprisesController', () => {
  let controller: SurprisesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurprisesController],
    }).compile();

    controller = module.get<SurprisesController>(SurprisesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
