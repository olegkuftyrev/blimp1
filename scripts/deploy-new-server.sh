#!/usr/bin/env bash
set -e

echo "🚀 Deploying to new server (146.190.53.83)..."

# Ensure we have the latest changes
echo "📝 Committing any local changes..."
git add .
git commit -m "Deploy to new server: $(date)" || echo "No changes to commit"

echo "📤 Pushing to GitHub..."
git push origin main

# Deploy to server
echo "🔧 Deploying to server..."
sshpass -p '2vcDpu-4gb-120gb-intel' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@146.190.53.83 "
    echo '📁 Setting up project directory...'
    mkdir -p /opt/blimp1
    
    echo '📥 Cloning repository...'
    cd /opt/blimp1
    git clone https://github.com/olegkuftyrev/blimp1.git . || git pull origin main
    
    echo '🔧 Setting up environment...'
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
"

echo "✅ Deployment completed!"
echo "🌐 App: http://146.190.53.83"
echo "🔌 API: http://146.190.53.83/api/menu-items"
echo "📊 PM2 Status: sshpass -p '2vcDpu-4gb-120gb-intel' ssh root@146.190.53.83 'pm2 status'"
