#!/usr/bin/env bash
# ============================================================================
# Скрипт для выполнения НА СЕРВЕРЕ после SSH логина
# ============================================================================
# Использование:
# 1. ssh root@164.90.147.86
# 2. Скопируйте и выполните команды ниже
# ============================================================================

set -e

echo "🚀 Начинаем деплой Blimp1..."

# ============================================================================
# 1. Установка необходимых пакетов
# ============================================================================
echo "📦 Устанавливаем системные пакеты..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl wget git nginx ufw

# Установка Node.js 20.x
echo "📦 Устанавливаем Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Установка PM2
echo "📦 Устанавливаем PM2..."
npm install -g pm2

# Установка PostgreSQL
echo "📦 Устанавливаем PostgreSQL..."
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Создание базы данных
echo "🗄️  Создаем базу данных..."
sudo -u postgres psql -c "CREATE DATABASE blimp;" 2>/dev/null || echo "База уже существует"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Настройка файрвола
echo "🔥 Настраиваем firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3333/tcp
ufw allow 3000/tcp
ufw --force enable

# ============================================================================
# 2. Клонирование проекта
# ============================================================================
echo "📥 Клонируем проект..."
mkdir -p /opt/blimp1
cd /opt/blimp1

if [ -d ".git" ]; then
    echo "Обновляем существующий репозиторий..."
    git fetch origin
    git reset --hard origin/main
else
    echo "Клонируем новый репозиторий..."
    git clone https://github.com/olegkuftyrev/blimp1.git .
fi

# ============================================================================
# 3. Создание .env файлов
# ============================================================================
echo "⚙️  Создаем .env файлы..."

# Backend .env
cat > /opt/blimp1/backend/.env << 'ENVEOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=http://164.90.147.86:3333
APP_KEY=YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-
LOG_LEVEL=info
SESSION_DRIVER=cookie
CORS_ORIGIN=*
WS_CORS_ORIGIN=*
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false
ADMIN_EMAIL=admin@blimp.com
ADMIN_PASSWORD=AdminBlimp2025!
ENVEOF

echo "✅ Backend .env создан"

# Frontend .env.local
cat > /opt/blimp1/frontend/.env.local << 'ENVEOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://164.90.147.86:3333
NEXT_PUBLIC_WS_URL=ws://164.90.147.86:3333
NEXT_PUBLIC_BACKEND_URL=http://164.90.147.86:3333
ENVEOF

echo "✅ Frontend .env.local создан"

# ============================================================================
# 4. Сборка проекта
# ============================================================================
echo "🔨 Устанавливаем зависимости и собираем проект..."

# Backend
cd /opt/blimp1/backend
echo "📦 Backend dependencies..."
npm ci --production=false

echo "🔨 Building backend..."
node ace build --ignore-ts-errors

echo "🗄️  Running migrations..."
node ace migration:run

echo "🌱 Seeding database (создаем админ аккаунт)..."
node ace db:seed

# Frontend
cd /opt/blimp1/frontend
echo "📦 Frontend dependencies..."
npm ci

echo "🔨 Building frontend..."
npm run build

# ============================================================================
# 5. Создание ecosystem config
# ============================================================================
echo "⚙️  Создаем PM2 конфигурацию..."
cat > /opt/blimp1/ecosystem.config.cjs << 'ECOEOF'
module.exports = {
  apps: [
    {
      name: 'blimp-backend',
      cwd: './backend',
      script: 'node',
      args: 'build/bin/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3333',
        APP_NAME: 'blimp-backend',
        APP_URL: 'http://164.90.147.86:3333',
        APP_KEY: 'YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-',
        LOG_LEVEL: 'info',
        SESSION_DRIVER: 'cookie',
        CORS_ORIGIN: '*',
        WS_CORS_ORIGIN: '*',
        PG_HOST: 'localhost',
        PG_PORT: '5432',
        PG_USER: 'postgres',
        PG_PASSWORD: 'postgres',
        PG_DB_NAME: 'blimp',
        PG_SSL: 'false',
        ADMIN_EMAIL: 'admin@blimp.com',
        ADMIN_PASSWORD: 'AdminBlimp2025!'
      },
      kill_timeout: 5000,
    },
    {
      name: 'blimp-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        NEXT_PUBLIC_API_URL: 'http://164.90.147.86:3333',
        NEXT_PUBLIC_WS_URL: 'ws://164.90.147.86:3333',
        NEXT_PUBLIC_BACKEND_URL: 'http://164.90.147.86:3333'
      },
      kill_timeout: 5000,
    }
  ]
}
ECOEOF

# ============================================================================
# 6. Настройка Nginx
# ============================================================================
echo "🌐 Настраиваем Nginx..."
cat > /etc/nginx/sites-available/blimp1 << 'NGINXEOF'
server {
    listen 80;
    server_name 164.90.147.86;
    
    client_max_body_size 100M;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/blimp1 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

# ============================================================================
# 7. Запуск сервисов через PM2
# ============================================================================
echo "🚀 Запускаем сервисы через PM2..."
cd /opt/blimp1

# Останавливаем старые процессы
pm2 stop all || true
pm2 delete all || true

# Запускаем новые
pm2 start ecosystem.config.cjs
pm2 save

# Настраиваем автозапуск
pm2 startup systemd -u root --hp /root

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ ДЕПЛОЙ ЗАВЕРШЕН УСПЕШНО!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌐 Приложение доступно по адресу:"
echo "   Frontend: http://164.90.147.86"
echo "   Backend:  http://164.90.147.86:3333"
echo ""
echo "👤 Админ аккаунт создан:"
echo "   Email:    admin@blimp.com"
echo "   Password: AdminBlimp2025!"
echo ""
echo "📊 Проверка статуса:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo "════════════════════════════════════════════════════════"



