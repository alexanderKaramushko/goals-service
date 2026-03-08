import { Test, TestingModule } from '@nestjs/testing';
import { SurprisesService } from './surprises.service';

describe('SurprisesService', () => {
  let service: SurprisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurprisesService],
    }).compile();

    service = module.get<SurprisesService>(SurprisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
