---
sidebar_position: 3
---

# 3. Модели данных (актуально по SQL-миграциям)

## 3.0 Концептуальная модель

**Сущности**: `users`, `targets`, `steps`, `rewards`.

**ER-диаграмма**:

```mermaid
erDiagram
    USERS {
      string id PK
      string full_name
      timestamp created_at "TIMESTAMPTZ, DEFAULT now(), NULL"
    }
    TARGETS {
      int id PK
      string user_id FK
      string title
      string description
      string status "NULL, CHECK (status IN ('created', 'active', 'completed', 'cancelled'))"
      date should_be_completed_at
      date completed_at "NULL"
      timestamp closed_at "NULL"
      timestamp created_at "NULL"
      timestamp updated_at "NULL"
    }
    STEPS {
      int id PK
      int target_id FK "NULL, ON DELETE SET NULL"
      string title
      string description
      date should_be_completed_at
      timestamp closed_at "NULL"
      timestamp created_at "DEFAULT now()"
      date completed_at "NULL"
    }
    REWARDS {
      int id PK
      string user_id FK "NULL"
      int target_id FK "NULL"
      string title
      string description
      string type "CHECK (type IN ('target', 'user'))"
      timestamp created_at
      timestamp accepted_at "NULL"
    }

    USERS ||--o{ TARGETS : has
    TARGETS |o--o{ STEPS : has
    TARGETS |o--o{ REWARDS : reward_for_target
    USERS |o--o{ REWARDS : reward_for_user
```

## 3.1 Статистика

Собирается динамически из данных целей, звёзд, наград.
