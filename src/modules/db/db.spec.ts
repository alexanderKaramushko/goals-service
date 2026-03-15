import { TestingModule } from '@nestjs/testing';
import { DbService } from './db';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('Db', () => {
  let provider: DbService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      providers: [DbService],
    }).compile();

    provider = module.get<DbService>(DbService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
