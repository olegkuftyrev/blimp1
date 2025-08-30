#!/bin/bash

echo "🚀 Deploying SCST project to DigitalOcean droplet..."

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Add all changes to git
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy: Production ready with PM2 ecosystem config"

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push -u origin main

echo "✅ Deployment script completed!"
echo "🌐 Your project is now available at: https://github.com/olegkuftyrev/blimp1"
echo ""
echo "📋 To deploy on your DigitalOcean droplet:"
echo "1. SSH to your droplet: ssh root@64.23.145.29"
echo "2. Clone the repo: git clone https://github.com/olegkuftyrev/blimp1.git"
echo "3. Install PM2: npm install -g pm2"
echo "4. Start the app: pm2 start ecosystem.config.js --env production"
echo "5. Save PM2 config: pm2 save"
echo "6. Setup PM2 startup: pm2 startup"
