#!/usr/bin/env bash
set -e

echo "🚀 Deploying to DigitalOcean..."

# Sync files to server
echo "📁 Syncing files..."
sshpass -p '2vcDpu-4gb-120gb-intel' rsync -az --delete --exclude node_modules --exclude .git -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" /Users/olegkuftyrev/Projects/blimp1/ root@64.23.169.176:/opt/blimp1

# Deploy on server
echo "🔧 Building and restarting on server..."
sshpass -p '2vcDpu-4gb-120gb-intel' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@64.23.169.176 "cd /opt/blimp1 && chmod +x scripts/prod-build.sh && ./scripts/prod-build.sh && pm2 reload ecosystem.config.cjs --update-env && pm2 save"

echo "✅ Deployment completed!"
echo "🌐 App: http://64.23.169.176"
echo "🔌 API: http://64.23.169.176/api/menu-items"
