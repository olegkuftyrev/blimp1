#!/usr/bin/env bash
# Быстрое обновление - запустить НА СЕРВЕРЕ

cd /opt/blimp1
echo "🔄 Получаю обновления..."
git fetch origin
git reset --hard origin/main

echo "📦 Backend..."
cd backend
npm ci --production=false
node ace build --ignore-ts-errors
node ace migration:run

echo "📦 Frontend..."
cd ../frontend
npm ci
npm run build

echo "🔄 Перезапуск..."
cd ..
pm2 restart all

echo "✅ Готово!"
pm2 status

