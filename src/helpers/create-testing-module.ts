import { InjectionToken, type ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MockMetadata, ModuleMocker } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

export function mockToken(token: InjectionToken) {
  const mockMetadata = moduleMocker.getMetadata(token) as MockMetadata<
    any,
    any
  >;

  const Mock = moduleMocker.generateFromMetadata(
    mockMetadata,
  ) as ObjectConstructor;

  return new Mock();
}

/**
 * @description Хелпер для мокирования внешних зависимостей в юнит-тестах.
 * Мокируем абсолютно все, чтобы обеспечить максимальную изолированность тестов.
 * Для точечного мокирования можно перезаписать useMocker на уровне теста.
 */
export function createTestingModule(moduleMetadata: ModuleMetadata = {}) {
  return Test.createTestingModule(moduleMetadata).useMocker(mockToken);
}
