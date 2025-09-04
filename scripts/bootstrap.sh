#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

info() { printf "\033[1;34m[info]\033[0m %s\n" "$*"; }
success() { printf "\033[1;32m[ok]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }

# 1) Install dependencies
info "Installing dependencies (backend + frontend)..."
(cd "$BACKEND_DIR" && npm install)
(cd "$FRONTEND_DIR" && npm install)
success "Dependencies installed."

# 2) Ensure backend .env exists (copy example or generate minimal defaults)
if [ ! -f "$BACKEND_DIR/.env" ]; then
  if [ -f "$BACKEND_DIR/.env.example" ]; then
    info "Creating backend .env from .env.example..."
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  else
    warn "backend/.env.example not found. Generating minimal backend .env..."
    cat > "$BACKEND_DIR/.env" <<'EOF'
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=http://localhost:3333
APP_KEY=change-me-in-production
LOG_LEVEL=debug
SESSION_DRIVER=cookie
CORS_ORIGIN=*
SQLITE_DB_PATH=./tmp/db.sqlite3
WS_CORS_ORIGIN=*
EOF
  fi
  success "backend/.env ready."
else
  info "backend/.env already exists. Skipping."
fi

# 3) Ensure frontend .env.local exists
if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
  if [ -f "$FRONTEND_DIR/.env.example" ]; then
    info "Creating frontend .env.local from .env.example..."
    cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env.local"
  else
    warn "frontend/.env.example not found. Generating minimal frontend .env.local..."
    cat > "$FRONTEND_DIR/.env.local" <<'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
EOF
  fi
  success "frontend/.env.local ready."
else
  info "frontend/.env.local already exists. Skipping."
fi

# 4) Apply DB migrations and seed (explicitly) before starting servers
info "Running database migrations and seed..."
(cd "$BACKEND_DIR" && npx --yes -- node ace migration:run | cat)
(cd "$BACKEND_DIR" && npx --yes -- node ace db:seed | cat)
success "Database ready."

# 5) Start backend and frontend in background with cleanup
info "Starting backend (dev) and frontend (dev)..."
(cd "$BACKEND_DIR" && npm run dev) &
BACKEND_PID=$!

(cd "$FRONTEND_DIR" && npm run dev) &
FRONTEND_PID=$!

cleanup() {
  info "Shutting down services..."
  if kill -0 "$FRONTEND_PID" 2>/dev/null; then kill "$FRONTEND_PID" || true; fi
  if kill -0 "$BACKEND_PID" 2>/dev/null; then kill "$BACKEND_PID" || true; fi
}
trap cleanup EXIT INT TERM

success "Servers launched."
info "Frontend: http://localhost:3000"
info "Backend:  http://localhost:3333"

# Wait on background jobs
wait
