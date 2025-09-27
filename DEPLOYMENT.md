# 🚀 Digital Ocean Deployment Guide

This guide will help you deploy your Blimp1 project to Digital Ocean.

## 📋 Prerequisites

### Local Machine Requirements
- `git` - Version control
- `sshpass` - For automated SSH connections
  ```bash
  # macOS
  brew install sshpass
  
  # Ubuntu/Debian
  sudo apt-get install sshpass
  ```

### Digital Ocean Droplet
- **OS**: Ubuntu 22.04 LTS
- **Size**: 2GB RAM, 1 vCPU (minimum)
- **Storage**: 50GB SSD
- **Network**: Public IPv4 enabled

## 🏗️ Initial Server Setup

### Option 1: Automated Setup (Recommended)
Run the complete setup script:

```bash
./scripts/setup-digital-ocean.sh
```

This script will:
- ✅ Check requirements
- ✅ Test server connectivity  
- ✅ Install system dependencies (Node.js, PM2, Nginx, etc.)
- ✅ Configure firewall
- ✅ Setup Nginx reverse proxy
- ✅ Deploy your application
- ✅ Start all services

### Option 2: Manual Setup
If you prefer manual setup, follow these steps:

1. **Connect to your server:**
   ```bash
   ssh root@146.190.53.83
   ```

2. **Update system:**
   ```bash
   apt-get update -y
   apt-get upgrade -y
   ```

3. **Install dependencies:**
   ```bash
   # Install Node.js 20.x
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs
   
   # Install PM2 globally
   npm install -g pm2
   
   # Install other tools
   apt-get install -y git nginx ufw
   ```

4. **Configure firewall:**
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 3333/tcp
   ufw allow 3000/tcp
   ufw --force enable
   ```

## 🔄 Deployment Process

### Quick Deploy
For updates and redeployments:

```bash
./scripts/deploy-new-server.sh
```

### Using PM2 Deploy
```bash
# From your local machine
pm2 deploy ecosystem.deploy.js production
```

## 📊 Monitoring & Maintenance

### Server Monitor Script
Use the monitoring script for various operations:

```bash
# Check server status
./scripts/server-monitor.sh status

# View application logs
./scripts/server-monitor.sh logs

# Restart services
./scripts/server-monitor.sh restart

# Update application
./scripts/server-monitor.sh update

# Database operations
./scripts/server-monitor.sh db

# Security check
./scripts/server-monitor.sh security
```

### Manual PM2 Commands
```bash
# Connect to server
sshpass -p '2vcDpu-4gb-120gb-intel' ssh root@146.190.53.83

# Check PM2 status
pm2 status

# View logs
pm2 logs

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Delete all services
pm2 delete all
```

## 🌐 Accessing Your Application

After deployment, your application will be available at:

- **Main Application**: http://146.190.53.83
- **Backend API**: http://146.190.53.83/api
- **WebSocket**: ws://146.190.53.83:3333

## 🔧 Configuration

### Environment Variables
The deployment automatically creates environment files:

**Backend** (`/opt/blimp1/backend/.env`):
```
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=http://146.190.53.83:3333
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
```

**Frontend** (`/opt/blimp1/frontend/.env.local`):
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://146.190.53.83:3333
NEXT_PUBLIC_WS_URL=ws://146.190.53.83:3333
NEXT_PUBLIC_BACKEND_URL=http://146.190.53.83:3333
```

### Nginx Configuration
Nginx is configured as a reverse proxy:
- Frontend (Next.js) on port 3000
- Backend API on port 3333
- WebSocket support enabled

## 🗄️ Database Management

### Backup Database
```bash
./scripts/server-monitor.sh db
# Select option 2 for backup
```

### Reset Database
```bash
./scripts/server-monitor.sh db
# Select option 5 for reset
```

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Use SSH keys** instead of password authentication
3. **Enable SSL/TLS** with Let's Encrypt
4. **Regular security updates**
5. **Monitor logs** for suspicious activity

## 🆘 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check PM2 logs
pm2 logs

# Check system resources
free -h
df -h
```

**Database issues:**
```bash
# Check database file
ls -la /opt/blimp1/backend/tmp/db.sqlite3

# Run migrations
cd /opt/blimp1/backend
node ace migration:run
```

**Nginx issues:**
```bash
# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Getting Help
1. Check application logs: `./scripts/server-monitor.sh logs`
2. Check server status: `./scripts/server-monitor.sh status`
3. Restart services: `./scripts/server-monitor.sh restart`

## 📈 Scaling Considerations

For production scaling:
- Use a proper database (PostgreSQL/MySQL)
- Implement load balancing
- Add SSL certificates
- Set up monitoring (PM2 Plus, New Relic, etc.)
- Use a CDN for static assets
- Implement proper logging and error tracking

---

**Happy Deploying! 🚀**
