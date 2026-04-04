import { TestingModule } from '@nestjs/testing';
import { RewardsService } from './rewards.service';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      providers: [RewardsService],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
