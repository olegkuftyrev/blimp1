#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

printf "\n==> Installing dependencies...\n"
(cd "$BACKEND_DIR" && npm ci)
(cd "$FRONTEND_DIR" && npm ci)

printf "\n==> Building backend...\n"
(cd "$BACKEND_DIR" && node ace build --ignore-ts-errors)

printf "\n==> Running migrations...\n"
# Ensure tmp directory exists
mkdir -p "$BACKEND_DIR/tmp"
(cd "$BACKEND_DIR" && node ace migration:run)

printf "\n==> Seeding database...\n"
(cd "$BACKEND_DIR" && node ace db:seed)

printf "\n==> Building frontend...\n"
(cd "$FRONTEND_DIR" && npm run build)

printf "\n==> Done. Use PM2 to start processes: pm2 start ecosystem.config.cjs\n"
