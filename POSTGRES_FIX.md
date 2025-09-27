# 🔧 PostgreSQL Authentication Fix

## Проблема
При деплое на сервер возникает ошибка PostgreSQL: **"client password must be a string"**

## Причина
В конфигурации PM2 (`ecosystem.config.cjs`) и скриптах деплоя отсутствовали переменные окружения для PostgreSQL.

## Решение

### Быстрое исправление (для существующего сервера)
```bash
./scripts/fix-postgres-deploy.sh
```

### Полная переустановка
```bash
./scripts/setup-digital-ocean.sh
```

## Что было исправлено

### 1. `ecosystem.config.cjs`
Добавлены PostgreSQL переменные:
```javascript
env: {
  // ... existing variables ...
  // PostgreSQL configuration
  PG_HOST: 'localhost',
  PG_PORT: '5432',
  PG_USER: 'postgres',
  PG_PASSWORD: 'postgres',
  PG_DB_NAME: 'blimp',
  PG_SSL: 'false'
}
```

### 2. Скрипты деплоя
- `setup-digital-ocean.sh` - добавлена установка PostgreSQL
- `fix-postgres-deploy.sh` - новый скрипт для быстрого исправления

### 3. Документация
- `DEPLOYMENT.md` - обновлены примеры конфигурации
- `deployment-config.md` - добавлены PostgreSQL переменные

## Переменные окружения PostgreSQL

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false
```

## Проверка после деплоя

```bash
# Проверить статус PM2
sshpass -p '2d68ac59e57a73fe9725f095d6' ssh root@146.190.53.83 'pm2 status'

# Проверить логи
sshpass -p '2d68ac59e57a73fe9725f095d6' ssh root@146.190.53.83 'pm2 logs'

# Проверить PostgreSQL
sshpass -p '2d68ac59e57a73fe9725f095d6' ssh root@146.190.53.83 'systemctl status postgresql'
```

## Примечания
- Все переменные окружения теперь настроены правильно
- PostgreSQL автоматически устанавливается и настраивается
- Миграции базы данных запускаются автоматически
- Пароль PostgreSQL: `postgres` (измените в продакшене!)
