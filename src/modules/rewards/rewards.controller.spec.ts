import { TestingModule } from '@nestjs/testing';
import { RewardsController } from './rewards.controller';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('RewardsController', () => {
  let controller: RewardsController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      controllers: [RewardsController],
    }).compile();

    controller = module.get<RewardsController>(RewardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
