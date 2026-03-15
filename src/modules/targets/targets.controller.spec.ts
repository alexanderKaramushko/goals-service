import { TestingModule } from '@nestjs/testing';
import { TargetsController } from './targets.controller';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('TargetsController units', () => {
  let controller: TargetsController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      controllers: [TargetsController],
    }).compile();

    controller = module.get<TargetsController>(TargetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
