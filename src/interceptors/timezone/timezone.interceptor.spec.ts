import { of } from 'rxjs';
import { TimezoneInterceptor } from './timezone.interceptor';

describe('TimezoneInterceptor', () => {
  let interceptor: TimezoneInterceptor;

  beforeEach(() => {
    interceptor = new TimezoneInterceptor();
  });

  it('установка таймзоны пользователя в запрос, если передана', () => {
    const request = {
      originalUrl: '/',
      method: 'GET',
      params: undefined,
      query: undefined,
      body: undefined,
      headers: {
        'x-user-timezone': 'Europe/Moscow',
      },
    };

    interceptor.intercept(
      {
        switchToHttp: jest.fn(() => ({
          getRequest: () => request,
          getResponse: () => ({
            statusCode: 200,
          }),
          getNext: () => of(),
        })),
        getType: jest.fn(() => 'http'),
      } as any,
      {
        handle: () => of(),
      },
    );

    expect(request).toEqual({
      ...request,
      userTimezone: 'Europe/Moscow',
    });
  });

  it('установка UTC в запрос, если таймзона пользователя не передана', () => {
    const request = {
      originalUrl: '/',
      method: 'GET',
      params: undefined,
      query: undefined,
      body: undefined,
      headers: {},
    };

    interceptor.intercept(
      {
        switchToHttp: jest.fn(() => ({
          getRequest: () => request,
          getResponse: () => ({
            statusCode: 200,
          }),
          getNext: () => of(),
        })),
        getType: jest.fn(() => 'http'),
      } as any,
      {
        handle: () => of(),
      },
    );

    expect(request).toEqual({
      ...request,
      userTimezone: 'UTC',
    });
  });
});
