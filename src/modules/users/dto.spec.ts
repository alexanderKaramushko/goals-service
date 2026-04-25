import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './dto';

async function getValidationMessages(dto: CreateUserDto): Promise<string[]> {
  const errors = await validate(dto);

  return errors.flatMap((error) => Object.values(error.constraints || {}));
}

describe('CreateUserDto', () => {
  const valid: CreateUserDto = {
    name: 'Test User',
    subjectId: '108266036103493388680',
    provider: 'google' as CreateUserDto['provider'],
  };

  it('Валидация пройдена с валидными параметрами', async () => {
    const dto = plainToInstance(CreateUserDto, valid);
    const messages = await getValidationMessages(dto);

    expect(messages).toEqual([]);
  });

  it.each<[string, CreateUserDto, string]>([
    [
      'name',
      {
        ...valid,
        name: '',
      },
      'name should not be empty',
    ],
    [
      'subjectId',
      {
        ...valid,
        subjectId: '',
      },
      'subjectId should not be empty',
    ],
    [
      'provider',
      {
        ...valid,
        provider: '' as CreateUserDto['provider'],
      },
      'provider must be one of the following values: google',
    ],
  ])('Валидация параметра: %s', async (_, data, message) => {
    const dto = plainToInstance(CreateUserDto, data);
    const messages = await getValidationMessages(dto);

    expect(messages).toContain(message);
  });
});
