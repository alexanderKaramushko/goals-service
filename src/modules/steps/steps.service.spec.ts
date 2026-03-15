import { TestingModule } from '@nestjs/testing';
import { StepsService } from './steps.service';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('StepsService', () => {
  let service: StepsService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      providers: [StepsService],
    }).compile();

    service = module.get<StepsService>(StepsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
