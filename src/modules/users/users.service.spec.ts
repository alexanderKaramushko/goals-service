import { TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { createTestingModule } from 'src/helpers/create-testing-module';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
