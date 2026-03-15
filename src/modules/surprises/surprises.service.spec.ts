import { TestingModule } from '@nestjs/testing';
import { SurprisesService } from './surprises.service';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('SurprisesService', () => {
  let service: SurprisesService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      providers: [SurprisesService],
    }).compile();

    service = module.get<SurprisesService>(SurprisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
