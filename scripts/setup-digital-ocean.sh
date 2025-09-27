#!/usr/bin/env bash
set -euo pipefail

echo "🌊 Digital Ocean Server Setup Script"
echo "=================================="

# Configuration
SERVER_IP="146.190.53.83"
SERVER_USER="root"
SERVER_PASS="2vcDpu-4gb-120gb-intel"
PROJECT_DIR="/opt/blimp1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass is not installed. Please install it:"
        echo "  macOS: brew install sshpass"
        echo "  Ubuntu: sudo apt-get install sshpass"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Test server connectivity
test_connection() {
    print_status "Testing server connectivity..."
    
    if sshpass -p "$SERVER_PASS" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'Connection successful'" &> /dev/null; then
        print_success "Server connection successful"
    else
        print_error "Cannot connect to server. Please check:"
        echo "  - Server IP: $SERVER_IP"
        echo "  - Server credentials"
        echo "  - Network connectivity"
        exit 1
    fi
}

# Install system dependencies on server
install_dependencies() {
    print_status "Installing system dependencies on server..."
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo 'Updating system packages...'
        apt-get update -y
        
        echo 'Installing essential packages...'
        apt-get install -y curl wget git nginx ufw
        
        echo 'Installing Node.js 20.x...'
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        
        echo 'Installing PM2 globally...'
        npm install -g pm2
        
        echo 'Installing PostgreSQL...'
        apt-get install -y postgresql postgresql-contrib
        
        echo 'Starting PostgreSQL service...'
        systemctl start postgresql
        systemctl enable postgresql
        
        echo 'Setting up PostgreSQL database...'
        sudo -u postgres psql -c \"CREATE DATABASE blimp;\"
        sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\"
        
        echo 'Setting up firewall...'
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 3333/tcp
        ufw allow 3000/tcp
        ufw --force enable
        
        echo 'Creating project directory...'
        mkdir -p $PROJECT_DIR
        
        echo 'System setup completed!'
    "
    
    print_success "System dependencies installed"
}

# Setup Nginx reverse proxy
setup_nginx() {
    print_status "Setting up Nginx reverse proxy..."
    
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        cat > /etc/nginx/sites-available/blimp1 << 'EOF'
server {
    listen 80;
    server_name $SERVER_IP;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        
        ln -sf /etc/nginx/sites-available/blimp1 /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        nginx -t
        systemctl enable nginx
        systemctl restart nginx
        
        echo 'Nginx configured successfully!'
    "
    
    print_success "Nginx reverse proxy configured"
}

# Deploy application
deploy_app() {
    print_status "Deploying application..."
    
    # Commit and push local changes
    print_status "Committing local changes..."
    git add .
    git commit -m "Deploy to Digital Ocean: $(date)" || print_warning "No changes to commit"
    git push origin main
    
    # Deploy to server
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        echo 'Cloning/updating repository...'
        cd $PROJECT_DIR
        if [ -d '.git' ]; then
            git pull origin main
        else
            git clone https://github.com/olegkuftyrev/blimp1.git .
        fi
        
        echo 'Setting up environment files...'
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
        
        cat > frontend/.env.local << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://$SERVER_IP:3333
NEXT_PUBLIC_WS_URL=ws://$SERVER_IP:3333
NEXT_PUBLIC_BACKEND_URL=http://$SERVER_IP:3333
EOF
        
        echo 'Making build script executable...'
        chmod +x scripts/prod-build.sh
        
        echo 'Building and starting application...'
        ./scripts/prod-build.sh
        
        echo 'Running database migrations...'
        cd backend
        node ace migration:run
        node ace db:seed
        cd ..
        
        echo 'Starting services with PM2...'
        pm2 stop all || true
        pm2 delete all || true
        pm2 start ecosystem.config.cjs
        pm2 save
        
        echo 'Setting up PM2 startup script...'
        pm2 startup systemd -u root --hp /root || true
        
        echo 'Application deployed successfully!'
    "
    
    print_success "Application deployed"
}

# Show deployment status
show_status() {
    print_status "Deployment Status"
    echo "=================="
    echo "🌐 Application URL: http://$SERVER_IP"
    echo "🔌 API URL: http://$SERVER_IP/api"
    echo "📊 PM2 Status: sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
    echo "📋 PM2 Logs: sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"
    echo "🔄 Restart Services: sshpass -p '$SERVER_PASS' ssh $SERVER_USER@$SERVER_IP 'pm2 restart all'"
    echo ""
    print_success "Deployment completed successfully! 🎉"
}

# Main execution
main() {
    echo ""
    print_status "Starting Digital Ocean deployment setup..."
    echo ""
    
    check_requirements
    test_connection
    install_dependencies
    setup_nginx
    deploy_app
    show_status
}

# Run main function
main "$@"
