import { UsersService } from 'src/modules/users/users.service';
import { UsersRepository } from 'src/modules/users/users.repository';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService({
      createUser: () => [],
    } as unknown as UsersRepository);
  });

  it('сервис вызывается', () => {
    expect(service).toBeDefined();
  });

  it('мапит UserRaw в CreatedUserResponseDto', () => {
    const userRaw = {
      id: '108266036103493388680',
      full_name: 'Test User',
      created_at: '2026-01-01T10:45:30.000Z',
    };

    expect(service.toCreatedResponse(userRaw)).toEqual({
      id: userRaw.id,
      fullName: userRaw.full_name,
      createdAt: userRaw.created_at,
    });
  });
});
