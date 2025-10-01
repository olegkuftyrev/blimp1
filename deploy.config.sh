#!/usr/bin/env bash
# ============================================================================
# Deployment Configuration
# ============================================================================
# This file contains all deployment configuration variables.
# Copy this file and customize for different environments.
#
# SECURITY NOTE: This file contains sensitive information.
# - DO NOT commit this file with real credentials
# - Use SSH keys instead of passwords when possible
# - Restrict file permissions: chmod 600 deploy.config.sh
# ============================================================================

# ============================================================================
# Server Configuration
# ============================================================================
export DEPLOY_SERVER_IP="137.184.82.40"          # e.g., "146.190.53.83"
export DEPLOY_SERVER_USER="root"                   # SSH user
export DEPLOY_SERVER_PASS=""                       # Leave empty if using SSH keys
export DEPLOY_SERVER_PORT="22"                     # SSH port

# ============================================================================
# Application Configuration
# ============================================================================
export DEPLOY_PROJECT_DIR="/opt/blimp1"            # Project directory on server
export DEPLOY_REPO_URL="https://github.com/olegkuftyrev/blimp1.git"
export DEPLOY_BRANCH="main"                        # Branch to deploy

# ============================================================================
# Application URLs (will be auto-generated if not set)
# ============================================================================
export DEPLOY_BACKEND_PORT="3333"
export DEPLOY_FRONTEND_PORT="3000"
export DEPLOY_APP_URL="http://${DEPLOY_SERVER_IP}"
export DEPLOY_API_URL="http://${DEPLOY_SERVER_IP}:${DEPLOY_BACKEND_PORT}"
export DEPLOY_WS_URL="ws://${DEPLOY_SERVER_IP}:${DEPLOY_BACKEND_PORT}"

# ============================================================================
# Database Configuration
# ============================================================================
export DEPLOY_DB_TYPE="postgres"                   # postgres or sqlite
export DEPLOY_DB_HOST="localhost"
export DEPLOY_DB_PORT="5432"
export DEPLOY_DB_NAME="blimp"
export DEPLOY_DB_USER="postgres"
export DEPLOY_DB_PASS="postgres"                   # Change in production!
export DEPLOY_DB_SSL="false"

# ============================================================================
# Application Secrets
# ============================================================================
export DEPLOY_APP_KEY="YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-"  # Generate new key for production
export DEPLOY_ADMIN_EMAIL="admin@blimp.com"
export DEPLOY_ADMIN_PASSWORD="SecureAdminPass123!"        # Change in production!

# ============================================================================
# Deployment Options
# ============================================================================
export DEPLOY_RUN_MIGRATIONS="true"                # Run migrations on deploy
export DEPLOY_SEED_DATABASE="false"                # Seed database on deploy
export DEPLOY_BACKUP_BEFORE_DEPLOY="true"          # Backup DB before deploy
export DEPLOY_USE_PM2="true"                       # Use PM2 for process management
export DEPLOY_SETUP_NGINX="true"                   # Setup Nginx reverse proxy
export DEPLOY_SETUP_SSL="false"                    # Setup SSL (requires domain)

# ============================================================================
# SSL Configuration (if DEPLOY_SETUP_SSL=true)
# ============================================================================
export DEPLOY_DOMAIN=""                            # Your domain name
export DEPLOY_SSL_EMAIL=""                         # Email for Let's Encrypt

# ============================================================================
# Monitoring & Logging
# ============================================================================
export DEPLOY_LOG_LEVEL="info"                     # fatal, error, warn, info, debug, trace
export DEPLOY_ENABLE_MONITORING="false"            # Enable PM2 monitoring

# ============================================================================
# Validation
# ============================================================================
validate_config() {
    local errors=0
    
    if [ -z "$DEPLOY_SERVER_IP" ] || [ "$DEPLOY_SERVER_IP" = "YOUR_SERVER_IP" ]; then
        echo "❌ DEPLOY_SERVER_IP is not set"
        errors=$((errors + 1))
    fi
    
    if [ -z "$DEPLOY_SERVER_PASS" ] && [ ! -f "$HOME/.ssh/id_rsa" ]; then
        echo "⚠️  Warning: No SSH password or key found"
    fi
    
    if [ "$DEPLOY_SETUP_SSL" = "true" ] && [ -z "$DEPLOY_DOMAIN" ]; then
        echo "❌ DEPLOY_DOMAIN is required when SSL is enabled"
        errors=$((errors + 1))
    fi
    
    if [ $errors -gt 0 ]; then
        echo ""
        echo "❌ Configuration validation failed with $errors error(s)"
        return 1
    fi
    
    echo "✅ Configuration validated successfully"
    return 0
}

