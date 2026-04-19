---
sidebar_position: 8
---

# 8. System design

## Устройство модуля API

- controller знает только про HTTP
- service хранит бизнес-логику
- repository хранит SQL и работу с БД
- DbService оставался низкоуровневой обёрткой над pg

controller -> service -> repository -> DbService.query(sql)