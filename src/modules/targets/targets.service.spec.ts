import { TestingModule } from '@nestjs/testing';
import { TargetsService } from './targets.service';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('TargetsService', () => {
  let service: TargetsService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      providers: [TargetsService],
    }).compile();

    service = module.get<TargetsService>(TargetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
