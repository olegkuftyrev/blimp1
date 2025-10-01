# 🚀 Complete Deployment Guide for Digital Ocean

This guide provides a streamlined, easy-to-follow process for deploying Blimp1 to Digital Ocean.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment Process](#deployment-process)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)

---

## Prerequisites

### Local Machine Requirements

- **Git**: Version control
- **Node.js**: Version 20.x or later
- **npm**: Package manager
- **SSH Client**: For server access
- **sshpass** (optional): For password-based authentication
  ```bash
  # macOS
  brew install sshpass
  
  # Ubuntu/Debian
  sudo apt-get install sshpass
  ```

### Digital Ocean Droplet

- **OS**: Ubuntu 22.04 LTS (recommended)
- **Size**: Minimum 2GB RAM, 1 vCPU
- **Storage**: 50GB SSD minimum
- **Network**: Public IPv4 enabled
- **Access**: Root SSH access or sudo user

---

## Quick Start

### Option 1: Interactive Deployment (Easiest)

Just run this command and follow the prompts:

```bash
./scripts/deploy-easy.sh
```

The script will:
- Guide you through configuration
- Test server connectivity
- Install all dependencies
- Deploy your application
- Set up monitoring

### Option 2: Configuration File (Recommended for Multiple Environments)

1. **Create configuration file:**
   ```bash
   cp deploy.config.sh deploy.production.config.sh
   ```

2. **Edit configuration:**
   ```bash
   nano deploy.production.config.sh
   ```
   
   Update these essential settings:
   ```bash
   export DEPLOY_SERVER_IP="YOUR_SERVER_IP"
   export DEPLOY_SERVER_PASS="YOUR_PASSWORD"  # Or use SSH keys
   export DEPLOY_ADMIN_PASSWORD="SecurePassword123!"
   ```

3. **Validate configuration:**
   ```bash
   ./scripts/validate-deployment.sh
   ```

4. **Deploy:**
   ```bash
   source deploy.production.config.sh
   ./scripts/deploy-easy.sh
   ```

---

## Configuration

### 1. Deployment Configuration

Edit `deploy.config.sh` with your settings:

```bash
# Server Details
export DEPLOY_SERVER_IP="146.190.53.83"
export DEPLOY_SERVER_USER="root"
export DEPLOY_SERVER_PASS="your-password"  # Or leave empty for SSH keys

# Application URLs (auto-generated from SERVER_IP)
export DEPLOY_BACKEND_PORT="3333"
export DEPLOY_FRONTEND_PORT="3000"

# Database Configuration
export DEPLOY_DB_TYPE="postgres"
export DEPLOY_DB_NAME="blimp"
export DEPLOY_DB_USER="postgres"
export DEPLOY_DB_PASS="secure-password"

# Admin Account
export DEPLOY_ADMIN_EMAIL="admin@blimp.com"
export DEPLOY_ADMIN_PASSWORD="SecureAdminPass123!"

# Deployment Options
export DEPLOY_RUN_MIGRATIONS="true"
export DEPLOY_SEED_DATABASE="false"
export DEPLOY_SETUP_NGINX="true"
```

### 2. Environment Files

The deployment script automatically creates `.env` files, but you can also create them manually:

**Backend** (`backend/.env`):
```bash
cp backend/.env.template backend/.env
# Edit as needed
```

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.template frontend/.env.local
# Edit as needed
```

### 3. SSH Authentication

#### Using SSH Keys (Recommended)

Generate an SSH key if you don't have one:
```bash
ssh-keygen -t rsa -b 4096
```

Copy your public key to the server:
```bash
ssh-copy-id root@YOUR_SERVER_IP
```

Set password to empty in `deploy.config.sh`:
```bash
export DEPLOY_SERVER_PASS=""
```

#### Using Password

Install sshpass and set password in config:
```bash
brew install sshpass  # macOS
export DEPLOY_SERVER_PASS="your-password"
```

---

## Deployment Process

### Step 1: Pre-Deployment Checklist

Run the validation script to ensure everything is ready:

```bash
./scripts/validate-deployment.sh
```

This checks:
- ✓ Required tools installed
- ✓ Project structure intact
- ✓ Configuration files present
- ✓ Git repository status
- ✓ Dependencies installed
- ✓ Server connectivity

### Step 2: Initial Server Setup

If deploying to a fresh server, run:

```bash
./scripts/deploy-easy.sh
```

The script will automatically:
1. Test server connection
2. Install system dependencies (Node.js, PostgreSQL, Nginx)
3. Configure firewall
4. Set up database
5. Clone repository
6. Build application
7. Start services with PM2
8. Configure Nginx reverse proxy

### Step 3: Verify Deployment

After deployment completes, verify services are running:

```bash
./scripts/server-monitor.sh status
```

Check application access:
- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP:3333`
- **Health Check**: `http://YOUR_SERVER_IP/api/status`

### Step 4: Initial Login

Default admin credentials:
- **Email**: `admin@blimp.com`
- **Password**: As set in `DEPLOY_ADMIN_PASSWORD`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

---

## Post-Deployment

### Monitoring

Check application status:
```bash
./scripts/server-monitor.sh status
```

View logs:
```bash
./scripts/server-monitor.sh logs
```

### Updating the Application

When you have new code to deploy:

```bash
# Commit your changes
git add .
git commit -m "Your changes"
git push

# Update on server
./scripts/server-monitor.sh update
```

Or use the quick update script:
```bash
./scripts/deploy-easy.sh
```

### Restarting Services

If services need to be restarted:

```bash
./scripts/server-monitor.sh restart
```

### Database Operations

Access database operations menu:

```bash
./scripts/server-monitor.sh db
```

Options:
1. View database info
2. Backup database
3. Run migrations
4. Seed database
5. Reset database

### Health Check

Run a quick health check:

```bash
./scripts/health-check.sh
```

Or for a quick status:
```bash
./scripts/health-check.sh quick
```

---

## Troubleshooting

### Common Issues

#### 1. Cannot Connect to Server

**Symptoms**: SSH connection fails

**Solutions**:
```bash
# Test connectivity
ping YOUR_SERVER_IP

# Test SSH
ssh -v root@YOUR_SERVER_IP

# Check firewall on server
ufw status
```

#### 2. Services Not Starting

**Symptoms**: PM2 shows services as errored or stopped

**Solutions**:
```bash
# View PM2 logs
./scripts/server-monitor.sh logs

# Check for errors
ssh root@YOUR_SERVER_IP "pm2 logs --err --lines 50"

# Restart services
./scripts/server-monitor.sh restart
```

#### 3. Database Connection Issues

**Symptoms**: Backend can't connect to database

**Solutions**:
```bash
# Check PostgreSQL status
ssh root@YOUR_SERVER_IP "systemctl status postgresql"

# Test database connection
ssh root@YOUR_SERVER_IP "sudo -u postgres psql -c 'SELECT version();'"

# Check environment variables
ssh root@YOUR_SERVER_IP "cd /opt/blimp1/backend && cat .env | grep PG_"
```

#### 4. Build Failures

**Symptoms**: Deployment fails during build step

**Solutions**:
```bash
# Check Node.js version
ssh root@YOUR_SERVER_IP "node --version"

# Manually run build
ssh root@YOUR_SERVER_IP "cd /opt/blimp1 && ./scripts/prod-build.sh"

# Check for out of memory issues
ssh root@YOUR_SERVER_IP "free -h"
```

#### 5. Nginx Configuration Issues

**Symptoms**: Cannot access application via HTTP

**Solutions**:
```bash
# Test Nginx configuration
ssh root@YOUR_SERVER_IP "nginx -t"

# Check Nginx status
ssh root@YOUR_SERVER_IP "systemctl status nginx"

# View Nginx error logs
ssh root@YOUR_SERVER_IP "tail -50 /var/log/nginx/error.log"

# Restart Nginx
ssh root@YOUR_SERVER_IP "systemctl restart nginx"
```

### Getting Help

1. **Check Logs First**:
   ```bash
   ./scripts/server-monitor.sh logs
   ```

2. **Check System Resources**:
   ```bash
   ./scripts/server-monitor.sh status
   ```

3. **View Recent Changes**:
   ```bash
   git log --oneline -10
   ```

---

## Advanced Topics

### SSL/TLS Setup with Let's Encrypt

To enable HTTPS:

1. **Update configuration**:
   ```bash
   export DEPLOY_SETUP_SSL="true"
   export DEPLOY_DOMAIN="your-domain.com"
   export DEPLOY_SSL_EMAIL="your-email@example.com"
   ```

2. **Point your domain to server IP**

3. **Install Certbot on server**:
   ```bash
   ssh root@YOUR_SERVER_IP "
       apt-get install -y certbot python3-certbot-nginx
       certbot --nginx -d your-domain.com -d www.your-domain.com --non-interactive --agree-tos -m your-email@example.com
   "
   ```

4. **Update environment files** to use `https://` URLs

### Custom Domain Setup

1. **Point DNS A record** to your server IP
2. **Update Nginx configuration** with your domain
3. **Update environment variables** in `deploy.config.sh`
4. **Redeploy**:
   ```bash
   ./scripts/deploy-easy.sh
   ```

### Multiple Environments

Create separate config files:

```bash
# Production
cp deploy.config.sh deploy.production.config.sh

# Staging
cp deploy.config.sh deploy.staging.config.sh
```

Deploy to specific environment:
```bash
source deploy.production.config.sh
./scripts/deploy-easy.sh
```

### Database Backups

Set up automated backups:

```bash
ssh root@YOUR_SERVER_IP "
cat > /root/backup-db.sh << 'EOF'
#!/bin/bash
pg_dump -U postgres blimp > /opt/blimp1/backups/db_\$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 days
find /opt/blimp1/backups -name 'db_*.sql' -mtime +7 -delete
EOF

chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo '0 2 * * * /root/backup-db.sh') | crontab -
"
```

### Performance Optimization

#### Enable PM2 Cluster Mode

Edit `ecosystem.config.js`:
```javascript
{
  instances: 'max',  // Use all CPU cores
  exec_mode: 'cluster'
}
```

#### Add Redis for Caching

```bash
ssh root@YOUR_SERVER_IP "
    apt-get install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
"
```

#### Enable Nginx Caching

Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;
proxy_cache my_cache;
```

---

## Security Best Practices

1. **Change Default Passwords**
   - Admin password
   - Database password
   - SSH keys instead of passwords

2. **Configure Firewall**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw deny 3333/tcp  # Don't expose backend directly
   ufw enable
   ```

3. **Regular Updates**
   ```bash
   ./scripts/server-monitor.sh security
   ```

4. **Enable SSL/TLS**
   - Use Let's Encrypt certificates
   - Redirect HTTP to HTTPS

5. **Database Security**
   - Use strong passwords
   - Enable SSL for database connections
   - Regular backups

6. **Monitoring & Logging**
   - Monitor PM2 logs regularly
   - Set up alerts for service failures
   - Review Nginx access logs

---

## Quick Command Reference

```bash
# Deploy/Update
./scripts/deploy-easy.sh                    # Full deployment
./scripts/validate-deployment.sh            # Validate before deploy
./scripts/server-monitor.sh update          # Quick update

# Monitoring
./scripts/server-monitor.sh status          # Check status
./scripts/server-monitor.sh logs            # View logs
./scripts/health-check.sh                   # Health check

# Maintenance
./scripts/server-monitor.sh restart         # Restart services
./scripts/server-monitor.sh db              # Database operations
./scripts/server-monitor.sh security        # Security check

# Manual Server Access
ssh root@YOUR_SERVER_IP                     # Connect to server
ssh root@YOUR_SERVER_IP "pm2 status"       # Check PM2 status
ssh root@YOUR_SERVER_IP "pm2 logs"         # View logs
```

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review server logs
3. Verify configuration settings
4. Check server resources (memory, disk)

---

**Happy Deploying! 🚀**

