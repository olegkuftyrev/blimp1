#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/blimp1"
ENV_FILE="$APP_DIR/backend/.env"

PG_USER="blimp"
PG_DB_NAME="blimp"
PG_PASSWORD="Bl1mp_pg_2025_u8Q3fS!7Yw2Kd"

echo "[1/6] Ensure PostgreSQL is installed and running..."
if ! command -v psql >/dev/null 2>&1; then
  apt-get update -y
  DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
  systemctl enable --now postgresql
fi

echo "[2/6] Create role and database if missing..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${PG_USER}'" | grep -q 1 || \
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE \"$PG_USER\" LOGIN PASSWORD '$PG_PASSWORD';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${PG_DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$PG_DB_NAME\" OWNER \"$PG_USER\";"

echo "[3/6] Write backend .env with DB and admin creds..."
mkdir -p "$APP_DIR/backend"
: > "$ENV_FILE"
cat >> "$ENV_FILE" <<EOF
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=http://localhost:3333
APP_KEY=change-me-in-production
LOG_LEVEL=info
SESSION_DRIVER=cookie
CORS_ORIGIN=*
WS_CORS_ORIGIN=*
PG_HOST=localhost
PG_PORT=5432
PG_USER=$PG_USER
PG_PASSWORD=$PG_PASSWORD
PG_DB_NAME=$PG_DB_NAME
ADMIN_EMAIL=oleg@kuftyrev.us
ADMIN_PASSWORD=Panda1337!asd
EOF

echo "[4/6] Build and migrate with admin seed..."
cd "$APP_DIR"
chmod +x scripts/prod-build.sh
DB_SEED=1 ./scripts/prod-build.sh

echo "[5/6] Start via PM2..."
pm2 start ecosystem.config.cjs --update-env || pm2 restart ecosystem.config.cjs --update-env
pm2 save

echo "[6/6] Done. API running; PM2 saved."
