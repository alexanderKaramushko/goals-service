import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestingApp } from 'src/helpers/create-testing-app';
import {
  createStepFactory,
  getStepFactory,
  setTargetStatusFactory,
} from './factories';
import { UsersModule } from 'src/modules/users/users.module';
import { TargetsModule } from 'src/modules/targets/targets.module';
import { StepsModule } from 'src/modules/steps/steps.module';
import { createUserFactory } from './factories/users.factory';
import { createTargetFactory } from './factories/targets.factory';
import { UsersRepository } from 'src/modules/users/users.repository';
import { TargetsRepository } from 'src/modules/targets/targets.repository';
import { StepsRepository } from 'src/modules/steps/steps.repository';
import { dayjs } from 'src/helpers/dayjs';
import { StepNotFoundException } from 'src/modules/steps/exceptions/step-not-found.exception';
import { TargetStatus } from 'src/modules/targets/targets.types';
import { TargetNotInStatusException } from 'src/modules/targets/exceptions/target-not-in-status.exception';
import { Provider } from 'src/modules/users/users.types';
import { setupTestDatabase } from './utils/setupTestDatabase';

describe('Steps (e2e) - /DELETE steps/delete/:stepId', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  setupTestDatabase(['targets', 'users']);

  it('Валидация :stepId', async () => {
    app = await createTestingApp({
      modules: [StepsModule],
    });

    await request(app.getHttpServer())
      .delete('/steps/delete/wrongId')
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body.message).toContain(
          'Validation failed (numeric string is expected)',
        );
      });
  });

  it('успешно удаляет шаг у не запущенной цели', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const getStep = getStepFactory(app.get(StepsRepository));

    const [user] = await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: user.id,
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    const [step] = await createStep({
      targetId: target.id,
      title: 'Купить продукты',
      description: 'Составить список и купить продукты',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .delete(`/steps/delete/${step.id}`)
      .expect((res) => {
        expect(res.body.message).not.toBeDefined();
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: step.id });
      });

    const deletedStep = await getStep({
      stepId: step.id,
      userId: user.id,
    });

    expect(deletedStep).toBeUndefined();
  });

  it('ошибка, если шаг не найден', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    await request(app.getHttpServer())
      .delete('/steps/delete/12345')
      .expect((res) => {
        const error = new StepNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если шаг принадлежит цели другого пользователя', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    await createUser({
      name: 'Another User',
      provider: Provider.GOOGLE,
      subjectId: '2',
    });

    const [target] = await createTarget({
      userId: '2',
      title: 'Чужая цель',
      description: 'Эту цель создал другой пользователь',
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    const [step] = await createStep({
      targetId: target.id,
      title: 'Чужой шаг',
      description: 'Этот шаг создал другой пользователь',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .delete(`/steps/delete/${step.id}`)
      .expect((res) => {
        const error = new StepNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it.each<[TargetStatus]>([
    [TargetStatus.Active],
    [TargetStatus.Completed],
    [TargetStatus.Cancelled],
  ])('ошибка, если шаг у цели в статусе %s', async (status) => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));
    const setTargetStatus = setTargetStatusFactory(app.get(TargetsRepository));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    const [step] = await createStep({
      targetId: target.id,
      title: 'Купить продукты',
      description: 'Составить список и купить продукты',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    await setTargetStatus(target.id, status);

    await request(app.getHttpServer())
      .delete(`/steps/delete/${step.id}`)
      .expect((res) => {
        const error = new TargetNotInStatusException(TargetStatus.Created);

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });

  it('ошибка, если шаг уже был удален', async () => {
    app = await createTestingApp(
      {
        modules: [UsersModule, TargetsModule, StepsModule],
      },
      { useRealDbService: true },
    );

    const createUser = createUserFactory(app.get(UsersRepository));
    const createTarget = createTargetFactory(app.get(TargetsRepository));
    const createStep = createStepFactory(app.get(StepsRepository));

    await createUser({
      name: 'Test User',
      provider: Provider.GOOGLE,
      subjectId: '1',
    });

    const [target] = await createTarget({
      userId: '1',
      title: 'Составить план питания',
      description: 'Расписать план питания и составить список продуктов',
      shouldBeCompletedAt: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    });

    const [step] = await createStep({
      targetId: target.id,
      title: 'Купить продукты',
      description: 'Составить список и купить продукты',
      shouldBeCompletedAt: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    });

    await request(app.getHttpServer())
      .delete(`/steps/delete/${step.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/steps/delete/${step.id}`)
      .expect((res) => {
        const error = new StepNotFoundException();

        expect(res.status).toBe(error.getStatus());
        expect(res.body.message).toBe(error.message);
      });
  });
});
