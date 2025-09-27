#!/usr/bin/env bash
set -e

echo "🔧 Fixing PostgreSQL configuration on server..."

# Configuration
SERVER_IP="146.190.53.83"
SERVER_USER="root"
SERVER_PASS="2d68ac59e57a73fe9725f095d6"
PROJECT_DIR="/opt/blimp1"

echo "📤 Pushing latest changes to GitHub..."
git add .
git commit -m "Fix PostgreSQL configuration: $(date)" || echo "No changes to commit"
git push origin main

echo "🚀 Deploying PostgreSQL fix to server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$SERVER_USER@$SERVER_IP" "
    echo '📁 Updating repository...'
    cd $PROJECT_DIR
    git pull origin main
    
    echo '🗄️ Installing PostgreSQL if not installed...'
    apt-get update -y
    apt-get install -y postgresql postgresql-contrib || echo 'PostgreSQL already installed'
    
    echo '🔄 Starting PostgreSQL service...'
    systemctl start postgresql
    systemctl enable postgresql
    
    echo '🗃️ Setting up PostgreSQL database...'
    sudo -u postgres psql -c \"CREATE DATABASE blimp;\" || echo 'Database already exists'
    sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\" || echo 'Password already set'
    
    echo '📝 Updating environment files...'
    cat > backend/.env << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=http://$SERVER_IP:3333
APP_KEY=YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-
LOG_LEVEL=info
SESSION_DRIVER=cookie
CORS_ORIGIN=*
WS_CORS_ORIGIN=*
ADMIN_EMAIL=admin@blimp.com
ADMIN_PASSWORD=SecureAdminPass123!
# PostgreSQL configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false
EOF
    
    echo '🏗️ Building application...'
    ./scripts/prod-build.sh
    
    echo '🗄️ Running database migrations...'
    cd backend
    node ace migration:run
    node ace db:seed
    cd ..
    
    echo '🔄 Restarting services...'
    pm2 stop all || true
    pm2 delete all || true
    pm2 start ecosystem.config.cjs
    pm2 save
    
    echo '✅ PostgreSQL configuration fixed!'
"

echo "🎉 PostgreSQL fix deployed successfully!"
echo "🌐 App: http://$SERVER_IP"
echo "📊 Check status: sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "📋 Check logs: sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"
