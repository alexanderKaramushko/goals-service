# Goals Service

Backend-сервис для социальной системы целей и наград.
Он хранит пользователей, цели, шаги и награды, применяет правила жизненного цикла целей и предоставляет HTTP API для работы с ними.

Сервис не выполняет аутентификацию самостоятельно: JWT из cookie проверяется отдельным auth-микросервисом,
после чего пользователь создаётся или обновляется в локальной базе.

## Возможности

Актуальный список задач и планы развития находятся в проекте [GitHub](https://github.com/users/alexanderKaramushko/projects/2).

## Архитектура

Проект следует слоистой схеме:

```text
HTTP request
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
DbService / pg
    ↓
PostgreSQL
```

- `Controller` принимает HTTP-запросы, запускает валидацию DTO и передаёт данные в сервис.
- `Service` содержит бизнес-правила и управляет транзакциями для составных операций.
- `Repository` содержит параметризованный SQL.
- `DbService` управляет пулом соединений `pg`.

Защищённые маршруты используют cookie `jwt`.

## Технологический стек

- Node.js `>=20.11` (Node.js 22 в `.nvmrc` и CI) и TypeScript;
- NestJS 11 и Express;
- PostgreSQL 17 и драйвер `pg`;
- `node-pg-migrate` и SQL-миграции;
- Swagger/OpenAPI через `@nestjs/swagger`;
- `class-validator` и `class-transformer`;
- Day.js для дат и таймзон;
- Jest, Supertest и Testcontainers;
- Docker, Docker Compose и pnpm;
- Docusaurus для проектной документации.

## Быстрый запуск

### Требования

- Node.js `>=20.11`; рекомендуемая версия из `.nvmrc` — `22.14.0`;
- pnpm 10;
- Docker с поддержкой Docker Compose;
- доступный auth-микросервис для проверки JWT.

### Настройка окружения

Скопировать `.env.example` в `.env`:

```bash
cp .env.example .env
```

Основные переменные:

| Переменная                                                     | Назначение                                                                              |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `NODE_ENV`                                                     | Режим запуска приложения                                                                |
| `SERVICE_HOST`, `SERVICE_PORT`                                 | Адрес и порт HTTP-сервера                                                               |
| `POSTGRES_DB_HOST`, `POSTGRES_DB_PORT`                         | Адрес PostgreSQL                                                                        |
| `POSTGRES_DB_NAME`, `POSTGRES_DB_USER`, `POSTGRES_DB_PASSWORD` | Параметры базы данных                                                                   |
| `DATABASE_URL`                                                 | Строка подключения к PostgreSQL; имеет приоритет в приложении и используется миграциями |
| `MICROSERVICE_HOST`, `MICROSERVICE_PORT`                       | Адрес auth-микросервиса                                                                 |
| `MAX_OUTDATED_STEPS_PERCENTAGE`                                | Максимальная допустимая доля просроченных шагов для назначения награды                  |

Установите версию Node.js и зависимости:

```bash
nvm use
pnpm install --frozen-lockfile
```

### Запуск через Docker

Текущий `docker-compose.yml` запускает только PostgreSQL и публикует его на порту `54320` хоста:

```bash
docker compose up -d postgres
pnpm migrate:init
```

После этого приложение запускается локально, как описано ниже. Auth-микросервис в compose-файл не входит и должен быть доступен отдельно.

Остановить локальную базу:

```bash
docker compose down
```

Production-образ приложения собирается из корневого `Dockerfile`:

```bash
docker build -t goals-service .
```

Compose-конфигурации для запуска самого образа приложения в репозитории нет.

### Локальный запуск

После настройки `.env`, запуска PostgreSQL, применения миграций и запуска auth-микросервиса выполните:

```bash
pnpm start:dev
```

#### Туннелирование через tuna

```bash
brew install yuccastream/tap/tuna
tuna config save-token <token>
tuna http 3000
```

#### Отладка

Через сокет в браузере:

1. Запустить приложение с WebSocket для отладки: `pnpm start:debug`.
2. Перейти в `chrome://inspect/#devices`.
3. Нажать **Inspect** рядом с процессом NestJS.

Через подключение к процессу Node.js в VS Code:

1. Запустить приложение командой `pnpm start:debug`.
2. Запустить конфигурацию «Дебаг с подключением к процессу Node JS» на вкладке Run and Debug.
3. Убедиться, что в консоли процесса появилась строка `Debugger attached`.

## Миграции

Миграции находятся в каталоге `migrations/`, пишутся на SQL и используют `DATABASE_URL`.

Применить все ожидающие миграции:

```bash
pnpm migrate:init
```

Откатить последнюю миграцию:

```bash
pnpm migrate:test:down
```

Создать SQL-файл новой миграции:

```bash
pnpm migrate:create -- <migration-name>
```

## Тестирование

```bash
pnpm test:unit
```

Запускает unit-тесты из `src/**/*.spec.ts`.

```bash
pnpm test:e2e
```

Запускает e2e-тесты из `test/`. Тесты бизнес-сценариев поднимают PostgreSQL 17 через Testcontainers, применяют миграции и требуют работающий Docker daemon.

```bash
pnpm test:cov
```

Запускает Jest с отчётом покрытия в `coverage/`.

## Документация

- [Бизнес-правила](https://goals-service-alpha.vercel.app/business/business-rules)
- [Системная спецификация](https://goals-service-alpha.vercel.app/system/system-specification)
- [Модель данных](https://goals-service-alpha.vercel.app/system/data-model)
- [Обзор архитектуры](https://goals-service-alpha.vercel.app/architecture/overview)
- [ADR: E2E-тестирование с Testcontainers](https://goals-service-alpha.vercel.app/architecture/adr/testing)

После локального запуска доступны:

- [Swagger основного API](http://localhost:3000/api/v1/docs);
- [OpenAPI JSON](http://localhost:3000/api/v1/docs-json);
- [Swagger health API](http://localhost:3000/health/docs);
- [health endpoint](http://localhost:3000/api/v1/app/health).

Production-ресурсы:

- [Service](https://goals.melkor-apps.ru/api/v1);
- [Swagger Goals service](https://goals.melkor-apps.ru/api/v1/docs);
- [JSON-api](https://goals.melkor-apps.ru/api/v1/docs-json);
- [Проектная документация (ТЗ)](https://goals-service-alpha.vercel.app);
- [Docker Image](https://hub.docker.com/r/melkor73/goals-service);
- [Open API](https://goals.melkor-apps.ru/api/v1/docs).

Документацию можно открыть локально:

```bash
pnpm --dir docs install --frozen-lockfile
pnpm docs:start
```

## Эксплуатация

Команды ниже предполагают внешнюю production-конфигурацию Docker Compose с
сервисами `goals-service-migrations`, `goals-certbot` и `goals-postgres`. Эта
конфигурация в текущий репозиторий не входит.

Запуск миграций после обновления образа:

```bash
docker compose run --rm goals-service-migrations npx node-pg-migrate --config node-pg-migrate.config.mjs up
```

Продление сертификата:

```bash
docker compose run --rm goals-certbot certonly --webroot --webroot-path=./certbot/www --email a.morgoth.b@gmail.com --agree-tos --no-eff-email -d goals.melkor-apps.ru
```

Автопродление сертификата:

```cron
24 3,15 * * * $HOME/apps/goals-app/cert-renew.sh >> $HOME/apps/goals-app/logs/certbot_cron.log 2>&1
```

Автобэкапы:

```cron
0 3 * * * $HOME/app/goals-app/goals-backup.sh >> $HOME/apps/goals-app/logs/backup.log 2>&1
```

Восстановление бэкапа:

```bash
docker compose exec goals-postgres pg_restore -h localhost -U goals-user -d goals /var/lib/backups/<backup>.dump
```

## Релиз

Релиз выполняется из ветки `main` после успешной сборки CI workflow.

1. Дождаться успешного завершения CI workflow.
2. Выполнить ручной деплой через `deploy` workflow.
3. Создать GitHub Release с релизным Docker-тегом через `release` workflow.
