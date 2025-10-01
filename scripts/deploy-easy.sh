#!/usr/bin/env bash
# ============================================================================
# Easy Deployment Script for Digital Ocean
# ============================================================================
# This script provides a simple, guided deployment process
# Usage: ./scripts/deploy-easy.sh
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC}  $1"
}

# ============================================================================
# Configuration Loading
# ============================================================================

load_config() {
    local config_file="$ROOT_DIR/deploy.config.sh"
    
    if [ -f "$config_file" ]; then
        print_step "Loading configuration from deploy.config.sh..."
        source "$config_file"
        
        # Validate configuration
        if ! validate_config; then
            print_error "Configuration validation failed"
            return 1
        fi
        
        return 0
    else
        print_warning "Configuration file not found: $config_file"
        print_info "Creating from template..."
        
        # Create config from template
        cp "$config_file" "$config_file" 2>/dev/null || true
        
        print_info "Please edit deploy.config.sh with your server details"
        return 1
    fi
}

# ============================================================================
# Interactive Configuration
# ============================================================================

interactive_config() {
    print_header "Interactive Configuration"
    
    read -p "Enter your server IP address: " server_ip
    read -p "Enter SSH user (default: root): " server_user
    server_user=${server_user:-root}
    
    echo ""
    print_info "Authentication method:"
    echo "1) SSH Key (recommended)"
    echo "2) Password"
    read -p "Choose (1 or 2): " auth_method
    
    if [ "$auth_method" = "2" ]; then
        read -sp "Enter SSH password: " server_pass
        echo ""
        export DEPLOY_SERVER_PASS="$server_pass"
    else
        export DEPLOY_SERVER_PASS=""
    fi
    
    export DEPLOY_SERVER_IP="$server_ip"
    export DEPLOY_SERVER_USER="$server_user"
    export DEPLOY_PROJECT_DIR="/opt/blimp1"
    export DEPLOY_BACKEND_PORT="3333"
    export DEPLOY_FRONTEND_PORT="3000"
    export DEPLOY_API_URL="http://${server_ip}:3333"
    export DEPLOY_WS_URL="ws://${server_ip}:3333"
    export DEPLOY_APP_URL="http://${server_ip}"
    
    print_success "Configuration set"
}

# ============================================================================
# SSH Connection Helper
# ============================================================================

ssh_exec() {
    local command="$1"
    
    if [ -n "${DEPLOY_SERVER_PASS:-}" ]; then
        # Use password authentication
        if ! command -v sshpass &> /dev/null; then
            print_error "sshpass is not installed"
            print_info "Install with: brew install sshpass (macOS) or sudo apt install sshpass (Ubuntu)"
            return 1
        fi
        sshpass -p "$DEPLOY_SERVER_PASS" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
            "${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_IP}" "$command"
    else
        # Use SSH key
        ssh -o StrictHostKeyChecking=no "${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_IP}" "$command"
    fi
}

# ============================================================================
# Deployment Steps
# ============================================================================

test_connection() {
    print_step "Testing server connection..."
    
    if ssh_exec "echo 'Connected successfully'" &> /dev/null; then
        print_success "Server connection successful"
        return 0
    else
        print_error "Cannot connect to server"
        print_info "Please check:"
        echo "  - Server IP: ${DEPLOY_SERVER_IP}"
        echo "  - SSH credentials"
        echo "  - Network connectivity"
        return 1
    fi
}

check_server_status() {
    print_step "Checking server status..."
    
    local status=$(ssh_exec "
        if command -v node &> /dev/null; then
            echo 'configured'
        else
            echo 'new'
        fi
    ")
    
    echo "$status"
}

setup_server() {
    print_header "Setting Up Server"
    
    print_step "Installing system dependencies..."
    ssh_exec "
        export DEBIAN_FRONTEND=noninteractive
        apt-get update -y
        apt-get install -y curl wget git nginx ufw
        
        # Install Node.js 20.x
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        fi
        
        # Install PM2
        if ! command -v pm2 &> /dev/null; then
            npm install -g pm2
        fi
        
        # Install PostgreSQL
        if ! command -v psql &> /dev/null; then
            apt-get install -y postgresql postgresql-contrib
            systemctl start postgresql
            systemctl enable postgresql
            
            # Setup database
            sudo -u postgres psql -c \"CREATE DATABASE ${DEPLOY_DB_NAME};\" 2>/dev/null || true
            sudo -u postgres psql -c \"ALTER USER postgres PASSWORD '${DEPLOY_DB_PASS}';\" 2>/dev/null || true
        fi
        
        # Configure firewall
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow ${DEPLOY_BACKEND_PORT}/tcp
        ufw allow ${DEPLOY_FRONTEND_PORT}/tcp
        ufw --force enable
        
        # Create project directory
        mkdir -p ${DEPLOY_PROJECT_DIR}
        mkdir -p ${DEPLOY_PROJECT_DIR}/logs
    "
    
    print_success "Server setup completed"
}

deploy_code() {
    print_header "Deploying Application"
    
    print_step "Syncing code to server..."
    
    # Commit and push if there are changes
    if [ -n "$(git status --porcelain)" ]; then
        print_step "Committing local changes..."
        git add .
        git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
    fi
    
    git push origin ${DEPLOY_BRANCH:-main} || print_warning "Git push failed or not needed"
    
    # Clone or update repository on server
    ssh_exec "
        cd ${DEPLOY_PROJECT_DIR}
        
        if [ -d '.git' ]; then
            echo 'Updating repository...'
            git fetch origin
            git reset --hard origin/${DEPLOY_BRANCH:-main}
        else
            echo 'Cloning repository...'
            git clone ${DEPLOY_REPO_URL} .
        fi
    "
    
    print_success "Code deployed"
}

create_env_files() {
    print_step "Creating environment files..."
    
    ssh_exec "
        # Backend .env
        cat > ${DEPLOY_PROJECT_DIR}/backend/.env << 'ENVEOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=${DEPLOY_BACKEND_PORT}
APP_NAME=blimp-backend
APP_URL=${DEPLOY_API_URL}
APP_KEY=${DEPLOY_APP_KEY:-YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-}
LOG_LEVEL=${DEPLOY_LOG_LEVEL:-info}
SESSION_DRIVER=cookie
CORS_ORIGIN=*
WS_CORS_ORIGIN=*
PG_HOST=${DEPLOY_DB_HOST:-localhost}
PG_PORT=${DEPLOY_DB_PORT:-5432}
PG_USER=${DEPLOY_DB_USER:-postgres}
PG_PASSWORD=${DEPLOY_DB_PASS:-postgres}
PG_DB_NAME=${DEPLOY_DB_NAME:-blimp}
PG_SSL=${DEPLOY_DB_SSL:-false}
ADMIN_EMAIL=${DEPLOY_ADMIN_EMAIL:-admin@blimp.com}
ADMIN_PASSWORD=${DEPLOY_ADMIN_PASSWORD:-SecureAdminPass123!}
ENVEOF

        # Frontend .env.local
        cat > ${DEPLOY_PROJECT_DIR}/frontend/.env.local << 'ENVEOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=${DEPLOY_API_URL}
NEXT_PUBLIC_WS_URL=${DEPLOY_WS_URL}
NEXT_PUBLIC_BACKEND_URL=${DEPLOY_API_URL}
ENVEOF
    "
    
    print_success "Environment files created"
}

build_application() {
    print_step "Building application..."
    
    ssh_exec "
        cd ${DEPLOY_PROJECT_DIR}
        chmod +x scripts/prod-build.sh
        export DB_SEED=${DEPLOY_SEED_DATABASE:-0}
        ./scripts/prod-build.sh
    "
    
    print_success "Application built"
}

start_services() {
    print_step "Starting services with PM2..."
    
    ssh_exec "
        cd ${DEPLOY_PROJECT_DIR}
        
        # Export config for PM2
        export DEPLOY_API_URL='${DEPLOY_API_URL}'
        export DEPLOY_WS_URL='${DEPLOY_WS_URL}'
        export DEPLOY_BACKEND_PORT='${DEPLOY_BACKEND_PORT}'
        export DEPLOY_FRONTEND_PORT='${DEPLOY_FRONTEND_PORT}'
        
        # Stop existing services
        pm2 stop all || true
        pm2 delete all || true
        
        # Start new services
        pm2 start ecosystem.config.js
        pm2 save
        
        # Setup PM2 startup
        pm2 startup systemd -u ${DEPLOY_SERVER_USER} --hp /root || true
    "
    
    print_success "Services started"
}

setup_nginx() {
    print_step "Configuring Nginx..."
    
    ssh_exec "
        cat > /etc/nginx/sites-available/blimp1 << 'NGINXEOF'
server {
    listen 80;
    server_name ${DEPLOY_SERVER_IP};
    
    # Frontend
    location / {
        proxy_pass http://localhost:${DEPLOY_FRONTEND_PORT};
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
        proxy_pass http://localhost:${DEPLOY_BACKEND_PORT};
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
        proxy_pass http://localhost:${DEPLOY_BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
    }
}
NGINXEOF

        ln -sf /etc/nginx/sites-available/blimp1 /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t
        systemctl restart nginx
    "
    
    print_success "Nginx configured"
}

show_summary() {
    print_header "Deployment Complete"
    
    print_success "Application deployed successfully!"
    echo ""
    print_info "Access your application at:"
    echo "  🌐 Main App:  ${DEPLOY_APP_URL}"
    echo "  🔌 Backend:   ${DEPLOY_API_URL}"
    echo ""
    print_info "Useful commands:"
    echo "  📊 Check status:  ./scripts/server-monitor.sh status"
    echo "  📋 View logs:     ./scripts/server-monitor.sh logs"
    echo "  🔄 Restart:       ./scripts/server-monitor.sh restart"
    echo "  🔧 Update:        ./scripts/server-monitor.sh update"
    echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    print_header "🚀 Blimp1 Deployment Tool"
    
    # Try to load config, if not available use interactive mode
    if ! load_config; then
        interactive_config
    fi
    
    # Test connection
    if ! test_connection; then
        print_error "Cannot proceed without server connection"
        exit 1
    fi
    
    # Check if server needs setup
    server_status=$(check_server_status)
    
    if [ "$server_status" = "new" ]; then
        print_warning "Server appears to be new and needs initial setup"
        read -p "Run initial server setup? (yes/no): " do_setup
        
        if [ "$do_setup" = "yes" ]; then
            setup_server
        fi
    else
        print_success "Server is already configured"
    fi
    
    # Deploy application
    deploy_code
    create_env_files
    build_application
    start_services
    
    # Setup Nginx if requested
    if [ "${DEPLOY_SETUP_NGINX:-true}" = "true" ]; then
        setup_nginx
    fi
    
    # Show summary
    show_summary
}

# Run main function
main "$@"

