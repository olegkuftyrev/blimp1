#!/usr/bin/env bash
set -e

echo "🚀 Auto-deploying to DigitalOcean..."

# 1. Commit and push changes
echo "📝 Committing changes..."
git add .
git commit -m "Auto-deploy: $(date)" || echo "No changes to commit"

echo "📤 Pushing to GitHub..."
git push origin main

# 2. Deploy to server
echo "🔧 Deploying to server..."
sshpass -p '2vcDpu-4gb-120gb-intel' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@64.23.169.176 "cd /opt/blimp1 && git pull origin main && chmod +x scripts/prod-build.sh && ./scripts/prod-build.sh && pm2 reload ecosystem.config.cjs --update-env && pm2 save"

echo "✅ Auto-deployment completed!"
echo "🌐 App: http://64.23.169.176"
echo "🔌 API: http://64.23.169.176/api/menu-items"
