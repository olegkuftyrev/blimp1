#!/usr/bin/env bash
# ============================================================================
# Domain Setup Script for blimp.one
# ============================================================================
# This script updates the server configuration to use the domain name
# Usage: ./setup-domain.sh
# ============================================================================

set -euo pipefail

DOMAIN="blimp.one"
SERVER_IP="137.184.82.40"

echo "🌐 Setting up domain: $DOMAIN"
echo "📍 Server IP: $SERVER_IP"
echo ""

# Update backend .env
echo "📝 Updating backend environment..."
ssh root@$SERVER_IP "cat > /opt/blimp1/backend/.env << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=https://$DOMAIN
APP_KEY=YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-
LOG_LEVEL=info
SESSION_DRIVER=cookie
CORS_ORIGIN=*
WS_CORS_ORIGIN=*
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false
ADMIN_EMAIL=admin@blimp.com
ADMIN_PASSWORD=SecureAdminPass123!
EOF
"

# Update frontend .env.local
echo "📝 Updating frontend environment..."
ssh root@$SERVER_IP "cat > /opt/blimp1/frontend/.env.local << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN
NEXT_PUBLIC_WS_URL=wss://$DOMAIN
NEXT_PUBLIC_BACKEND_URL=https://$DOMAIN
EOF
"

# Update Nginx configuration
echo "📝 Updating Nginx configuration..."
ssh root@$SERVER_IP "cat > /etc/nginx/sites-available/blimp1 << 'NGINXEOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\\\$host\\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (Cloudflare Origin Certificates)
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
    }
}
NGINXEOF
"

echo ""
echo "⚠️  SSL Certificate Setup Required"
echo ""
echo "Option 1: Use Cloudflare Origin Certificate (Recommended)"
echo "  1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server"
echo "  2. Click 'Create Certificate'"
echo "  3. Save the certificate and private key"
echo "  4. Upload to server:"
echo "     ssh root@$SERVER_IP 'mkdir -p /etc/ssl/cloudflare'"
echo "     scp cert.pem root@$SERVER_IP:/etc/ssl/cloudflare/cert.pem"
echo "     scp key.pem root@$SERVER_IP:/etc/ssl/cloudflare/key.pem"
echo ""
echo "Option 2: Use Let's Encrypt (Alternative)"
echo "  Run: ssh root@$SERVER_IP 'apt-get install -y certbot python3-certbot-nginx'"
echo "  Then: ssh root@$SERVER_IP 'certbot --nginx -d $DOMAIN -d www.$DOMAIN'"
echo ""
echo "After SSL setup, rebuild and restart:"
echo "  ssh root@$SERVER_IP 'cd /opt/blimp1/frontend && npm run build'"
echo "  ssh root@$SERVER_IP 'pm2 restart all'"
echo "  ssh root@$SERVER_IP 'nginx -t && systemctl restart nginx'"
echo ""


