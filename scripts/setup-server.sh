#!/usr/bin/env bash
set -e

echo "🔧 Setting up server with required dependencies..."

sshpass -p '2vcDpu-4gb-120gb-intel' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null root@146.190.53.83 "
    echo '📦 Updating system packages...'
    apt-get update -y
    
    echo '🔧 Installing basic dependencies...'
    apt-get install -y curl git nginx
    
    echo '📥 Installing Node.js 20...'
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    echo '🔧 Installing PM2 globally...'
    npm install -g pm2
    
    echo '✅ Server setup completed!'
    echo 'Node.js version:' \$(node --version)
    echo 'NPM version:' \$(npm --version)
    echo 'PM2 version:' \$(pm2 --version)
"
