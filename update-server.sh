#!/usr/bin/env bash
# ============================================================================
# Быстрое обновление на сервере
# ============================================================================
# Выполните это на сервере после: ssh root@164.90.147.86
# ============================================================================

set -e

echo "🔄 Обновляем приложение..."

cd /opt/blimp1

# Получаем последние изменения
echo "📥 Получаем изменения из GitHub..."
git fetch origin
git reset --hard origin/main

# Обновляем зависимости и пересобираем
echo "📦 Обновляем backend зависимости..."
cd backend
npm ci --production=false

echo "🔨 Пересобираем backend..."
node ace build --ignore-ts-errors

echo "🗄️ Применяем миграции..."
node ace migration:run

echo "📦 Обновляем frontend зависимости..."
cd ../frontend
npm ci

echo "🔨 Пересобираем frontend..."
npm run build

# Перезапускаем сервисы
echo "🔄 Перезапускаем сервисы..."
cd /opt/blimp1
pm2 restart all

echo ""
echo "✅ Обновление завершено!"
echo "📊 Статус сервисов:"
pm2 status

echo ""
echo "📋 Логи (последние 20 строк):"
pm2 logs --lines 20

