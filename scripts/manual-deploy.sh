#!/usr/bin/env bash
set -e

SERVER_IP="10.124.0.2"
SERVER_USER="root"
SERVER_PASS="2vcDpu-4gb-120gb-intel"
PROJECT_DIR="/opt/blimp1"

echo "🚀 Manual Deployment to $SERVER_IP"
echo "=================================="

# Test connection first
echo "🔌 Testing connection to server..."
if ! sshpass -p "$SERVER_PASS" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'Connection successful'"; then
    echo "❌ Cannot connect to server. Please check:"
    echo "   - Server IP: $SERVER_IP"
    echo "   - Server is running"
    echo "   - SSH port 22 is open"
    echo "   - Correct credentials"
    exit 1
fi

echo "✅ Connection successful!"

# Deploy to server
echo "🔧 Deploying to server..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
    echo '📁 Setting up project directory...'
    mkdir -p $PROJECT_DIR
    
    echo '📥 Cloning/updating repository...'
    cd $PROJECT_DIR
    if [ -d '.git' ]; then
        echo 'Updating existing repository...'
        git pull origin main
    else
        echo 'Cloning new repository...'
        git clone https://github.com/olegkuftyrev/blimp1.git .
    fi
    
    echo '🔧 Setting up environment files...'
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
EOF
    
    cat > frontend/.env.local << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://$SERVER_IP:3333
NEXT_PUBLIC_WS_URL=ws://$SERVER_IP:3333
NEXT_PUBLIC_BACKEND_URL=http://$SERVER_IP:3333
EOF
    
    echo 'Making build script executable...'
    chmod +x scripts/prod-build.sh
    
    echo '📦 Installing dependencies and building...'
    ./scripts/prod-build.sh
    
    echo '🚀 Starting services with PM2...'
    pm2 stop all || true
    pm2 delete all || true
    pm2 start ecosystem.config.cjs
    pm2 save
    
    echo '🔧 Setting up PM2 startup script...'
    pm2 startup systemd -u root --hp /root || true
    
    echo '✅ Application deployed successfully!'
"

echo ""
echo "✅ Deployment completed!"
echo "🌐 App: http://$SERVER_IP"
echo "🔌 API: http://$SERVER_IP/api"
echo "📊 PM2 Status: sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "📋 PM2 Logs: sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"
