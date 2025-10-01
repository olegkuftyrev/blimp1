# Deployment Lessons Learned

## Overview
This document captures the lessons learned during the deployment of the Blimp1 application to Digital Ocean on October 1, 2025.

**Deployment Target:** Ubuntu 22.04 droplet at 137.184.82.40  
**Application Stack:** AdonisJS (Backend) + Next.js (Frontend) + PostgreSQL + Nginx

---

## 1. SSH Key Management

### Issue Encountered
- Initially created SSH key with passphrase (`babayaga`) which couldn't be used in non-interactive deployment scripts
- Key was created in project directory instead of standard `~/.ssh/` location

### Solution
- For automated deployments, create SSH keys WITHOUT passphrase: `ssh-keygen -t ed25519 -f ~/.ssh/key_name -N ""`
- Always store keys in `~/.ssh/` directory with proper permissions:
  - Private key: `chmod 600 ~/.ssh/key_name`
  - Public key: `chmod 644 ~/.ssh/key_name.pub`

### Best Practice
```bash
# Create deployment key without passphrase
ssh-keygen -t ed25519 -f ~/.ssh/project_deploy -N "" -C "project-deploy"

# Add public key to server
ssh-copy-id -i ~/.ssh/project_deploy.pub root@server_ip
```

---

## 2. Database Seeding and Data Validation

### Issue Encountered
Admin user seeder failed with:
```
new row for relation "users" violates check constraint "users_job_title_check"
```

**Root Cause:** Seeder used `jobTitle: 'Owner'` but the database constraint only allows:
- `'Hourly Associate'`
- `'AM'`
- `'Chef'`
- `'SM/GM/TL'`
- `'ACO'`
- `'RDO'`

### Solution
Changed seeder to use a valid enum value (`'RDO'`) instead of arbitrary string.

### Lesson Learned
**Always validate seeder data against database constraints before deployment:**

1. Check enum definitions in migrations:
```typescript
table.enum('job_title', ['Hourly Associate', 'AM', 'Chef', 'SM/GM/TL', 'ACO', 'RDO'])
```

2. Update seeders to match:
```typescript
await User.create({
  jobTitle: 'RDO', // Valid enum value
  // ...
})
```

3. Test seeders in development before production deployment

---

## 3. Frontend API Configuration in Production

### Issue #1: Direct Port Access
**Problem:** Frontend was configured to access backend directly on port 3333:
```
NEXT_PUBLIC_API_URL=http://137.184.82.40:3333
```

**Issue:** Browsers may block mixed content or have firewall issues with non-standard ports

**Solution:** Use Nginx reverse proxy without explicit port:
```
NEXT_PUBLIC_API_URL=http://137.184.82.40
```

### Issue #2: Missing `/api` Prefix in Axios
**Problem:** The axios baseURL configuration didn't append `/api` prefix in production:
```typescript
// WRONG
baseURL: process.env.NEXT_PUBLIC_API_URL || '/api'
// Results in: http://137.184.82.40/auth/sign-in ❌
```

**Fix:**
```typescript
// CORRECT
baseURL: process.env.NODE_ENV === 'production' 
  ? ((process.env.NEXT_PUBLIC_API_URL || '') + '/api')
  : '/api'
// Results in: http://137.184.82.40/api/auth/sign-in ✅
```

### Issue #3: Next.js Environment Variables
**Critical:** Next.js only exposes environment variables to the client if they start with `NEXT_PUBLIC_`

**Requirements for Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend base URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_BACKEND_URL` - Alternative backend URL reference

### Lesson Learned
**Complete Frontend Environment Configuration:**

1. **Development** (uses Next.js proxy):
```env
# No NEXT_PUBLIC_API_URL needed - uses /api proxy
```

2. **Production** (direct backend access):
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://your-server-ip
NEXT_PUBLIC_WS_URL=ws://your-server-ip
NEXT_PUBLIC_BACKEND_URL=http://your-server-ip
```

3. **Axios Configuration Pattern:**
```typescript
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? ((process.env.NEXT_PUBLIC_API_URL || '') + '/api')
    : '/api',
  // ...
})
```

---

## 4. Nginx Reverse Proxy Configuration

### Working Configuration
```nginx
server {
    listen 80;
    server_name 137.184.82.40;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Key Points
- Frontend serves on `/` (port 3000 internally)
- Backend API serves on `/api` (port 3333 internally)
- WebSocket serves on `/socket.io` (port 3333 internally)
- All traffic goes through port 80 (Nginx)

---

## 5. PM2 Process Management

### Ecosystem Configuration
```javascript
module.exports = {
  apps: [
    {
      name: 'blimp-backend',
      cwd: './backend',
      script: 'node',
      args: 'build/bin/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: '3333',
        // ... other env vars
      }
    },
    {
      name: 'blimp-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        // ... other env vars
      }
    }
  ]
}
```

### Important Commands
```bash
# Start all apps
pm2 start ecosystem.config.js

# Restart specific app
pm2 restart blimp-frontend

# Restart with new environment variables
pm2 restart blimp-frontend --update-env

# View logs
pm2 logs
pm2 logs blimp-backend --lines 50

# Save current process list
pm2 save

# Enable startup script
pm2 startup systemd
```

### Lesson Learned
- Use `--update-env` flag when restarting after environment variable changes
- Always run `pm2 save` after changes to persist across reboots
- Check logs immediately after restart to catch startup errors

---

## 6. AdonisJS Build Process

### Build Sequence
```bash
# 1. Install dependencies
cd backend && npm ci

# 2. Build TypeScript (creates build/ directory)
node ace build --ignore-ts-errors

# 3. Install production dependencies in build/
cd build && npm ci --omit=dev

# 4. Run migrations from build directory
cd .. && node ace migration:run --force

# 5. Run seeders
node ace db:seed
```

### Important Notes
- Migrations must run from the **source directory** (not build/), using `node ace migration:run`
- Use `--force` flag to skip production confirmation prompts
- The `build/` directory is a standalone copy with its own `node_modules`

---

## 7. Next.js Build Process

### Build Sequence
```bash
# 1. Ensure environment variables are set
cat frontend/.env.local

# 2. Install dependencies
cd frontend && npm ci

# 3. Build for production
npm run build

# 4. Test the build locally (optional)
npm start
```

### Important Notes
- Next.js reads `.env.local` during build time for `NEXT_PUBLIC_*` variables
- Always rebuild after changing environment variables
- Built files go to `.next/` directory
- `npm start` serves the production build (not dev server)

---

## 8. Database Setup

### PostgreSQL Installation (Ubuntu)
```bash
# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Start and enable service
systemctl start postgresql
systemctl enable postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE blimp;"

# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Migrations in Production
```bash
# From backend directory
node ace migration:run --force
```

The `--force` flag bypasses the interactive confirmation in production.

---

## 9. Firewall Configuration

### UFW Setup
```bash
# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow backend port (optional, if not using Nginx)
ufw allow 3333/tcp

# Allow frontend port (optional, if not using Nginx)
ufw allow 3000/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### Lesson Learned
- Always allow SSH (port 22) BEFORE enabling UFW
- If using Nginx reverse proxy, you may not need to expose 3000/3333 publicly
- Use `--force` flag for non-interactive UFW enable

---

## 10. Deployment Checklist

### Pre-Deployment
- [ ] SSH key configured and tested
- [ ] Server has required software (Node.js, PostgreSQL, Nginx, PM2)
- [ ] Firewall rules configured
- [ ] Environment variables prepared
- [ ] Database seeders validated against constraints

### Deployment Steps
1. [ ] Clone repository
2. [ ] Create backend `.env` file
3. [ ] Create frontend `.env.local` file
4. [ ] Install backend dependencies
5. [ ] Build backend
6. [ ] Install backend production dependencies
7. [ ] Run migrations
8. [ ] Run seeders
9. [ ] Install frontend dependencies
10. [ ] Build frontend
11. [ ] Configure Nginx
12. [ ] Start PM2 processes
13. [ ] Save PM2 configuration
14. [ ] Enable PM2 startup script

### Post-Deployment Verification
- [ ] Check PM2 status: `pm2 status`
- [ ] Check Nginx status: `systemctl status nginx`
- [ ] Test backend API: `curl http://server-ip/api/status`
- [ ] Test authentication: `curl -X POST http://server-ip/api/auth/sign-in`
- [ ] Test frontend: Open browser to `http://server-ip`
- [ ] Check logs: `pm2 logs --lines 50`

---

## 11. Common Issues and Solutions

### Issue: 404 on API Calls
**Symptoms:** Frontend works but API calls return 404

**Debug Steps:**
1. Check Nginx logs: `tail -f /var/log/nginx/access.log`
2. Check axios baseURL: Should include `/api` prefix in production
3. Verify Nginx location blocks are correct

**Solution:** Ensure axios configuration appends `/api` to production URL

---

### Issue: "Network Error" on Login
**Symptoms:** Login page loads but submission fails with network error

**Debug Steps:**
1. Open browser DevTools → Network tab
2. Check the request URL - should be `http://server-ip/api/auth/sign-in`
3. If URL is wrong, check frontend environment variables
4. Rebuild frontend after fixing env vars

**Solution:** Fix `NEXT_PUBLIC_API_URL` and rebuild frontend

---

### Issue: PM2 Process Crashes
**Symptoms:** PM2 shows status as "errored" or keeps restarting

**Debug Steps:**
1. Check logs: `pm2 logs app-name --lines 100`
2. Check if port is already in use: `lsof -i :3333`
3. Verify environment variables: `pm2 env 0`

**Solution:** Fix the error shown in logs, restart with `pm2 restart app-name`

---

## 12. Update/Redeploy Process

### Quick Update (Code Changes Only)
```bash
# SSH to server
ssh root@server-ip

# Navigate to project
cd /opt/blimp1

# Pull latest changes
git pull

# If backend changed
cd backend
npm ci
node ace build --ignore-ts-errors
cd build && npm ci --omit=dev
cd ../..

# If migrations changed
cd backend && node ace migration:run --force && cd ..

# If frontend changed
cd frontend
npm ci
npm run build
cd ..

# Restart services
pm2 restart all

# Verify
pm2 status
pm2 logs --lines 20
```

### Full Redeploy
If something is seriously broken, follow the deployment checklist from scratch.

---

## 13. Security Considerations

### Implemented
- ✅ Firewall (UFW) enabled
- ✅ SSH key authentication
- ✅ Backend runs on localhost (not exposed directly)
- ✅ Frontend runs on localhost (not exposed directly)
- ✅ Nginx as reverse proxy

### TODO for Production
- [ ] Use HTTPS with SSL certificate (Let's Encrypt)
- [ ] Change default PostgreSQL password
- [ ] Use strong APP_KEY (generate with `node ace generate:key`)
- [ ] Set up proper logging and monitoring
- [ ] Configure automated backups
- [ ] Set up rate limiting in Nginx
- [ ] Use environment-specific passwords (not hardcoded defaults)
- [ ] Consider using a secrets manager

---

## 14. Monitoring and Maintenance

### Useful Commands
```bash
# Check system resources
htop
df -h  # Disk usage
free -h  # Memory usage

# Check application logs
pm2 logs
pm2 logs blimp-backend --lines 100

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check PostgreSQL
sudo -u postgres psql -d blimp -c "SELECT * FROM restaurants;"

# Restart services
pm2 restart all
systemctl restart nginx
systemctl restart postgresql
```

---

## 15. Key Takeaways

1. **Environment Variables Matter:** Next.js requires `NEXT_PUBLIC_*` prefix for client-side access
2. **Build Configuration is Critical:** Axios baseURL must include `/api` in production
3. **Test Seeders First:** Validate all seeder data against database constraints before deployment
4. **Nginx is Your Friend:** Using reverse proxy simplifies port management and security
5. **PM2 for Process Management:** Reliable way to keep Node.js apps running
6. **Always Document:** Keep track of issues and solutions for future deployments

---

## 16. Resources

- [AdonisJS Deployment Guide](https://docs.adonisjs.com/guides/deployment)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Digital Ocean Server Setup](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04)

---

**Document Version:** 1.0  
**Last Updated:** October 1, 2025  
**Deployed By:** AI Assistant & Oleg Kuftyrev  
**Server:** 137.184.82.40




