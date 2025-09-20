# 🚀 Digital Ocean Deployment Checklist

## Pre-Deployment Checklist

### ✅ Local Preparation
- [ ] All code changes committed and pushed to GitHub
- [ ] Environment variables updated for production
- [ ] Database migrations tested locally
- [ ] Build process tested locally
- [ ] All dependencies up to date

### ✅ Server Requirements
- [ ] Digital Ocean droplet created (Ubuntu 22.04 LTS)
- [ ] Server IP: `146.190.53.83`
- [ ] Root access available
- [ ] SSH connectivity confirmed

### ✅ Tools Installed
- [ ] `sshpass` installed locally
- [ ] `git` available locally
- [ ] SSH client configured

## Deployment Steps

### ✅ Initial Setup (One-time)
```bash
# Run complete setup
./scripts/setup-digital-ocean.sh
```

This will:
- [ ] Install system dependencies (Node.js, PM2, Nginx)
- [ ] Configure firewall
- [ ] Setup Nginx reverse proxy
- [ ] Deploy application
- [ ] Start all services

### ✅ Verification
- [ ] Main app accessible: http://146.190.53.83
- [ ] API accessible: http://146.190.53.83/api
- [ ] WebSocket working
- [ ] Database seeded with test data
- [ ] Admin user can login

### ✅ Health Check
```bash
# Run health check
./scripts/health-check.sh
```

## Post-Deployment Checklist

### ✅ Security
- [ ] Change default admin password
- [ ] Configure SSH keys (optional)
- [ ] Review firewall settings
- [ ] Monitor access logs

### ✅ Monitoring
- [ ] PM2 status shows all services online
- [ ] Application logs show no errors
- [ ] System resources adequate
- [ ] Database accessible

### ✅ Backup
- [ ] Database backup created
- [ ] Configuration files backed up
- [ ] Deployment scripts tested

## Ongoing Maintenance

### ✅ Regular Checks
- [ ] Monitor server resources (memory, disk)
- [ ] Check application logs for errors
- [ ] Verify services are running
- [ ] Update dependencies periodically

### ✅ Updates
```bash
# For application updates
./scripts/server-monitor.sh update

# For system updates
./scripts/server-monitor.sh security
```

## Troubleshooting

### ✅ Common Issues
- [ ] Services not starting → Check PM2 logs
- [ ] Database issues → Run migrations
- [ ] Nginx issues → Check configuration
- [ ] Memory issues → Restart services

### ✅ Useful Commands
```bash
# Check status
./scripts/server-monitor.sh status

# View logs
./scripts/server-monitor.sh logs

# Restart services
./scripts/server-monitor.sh restart

# Database operations
./scripts/server-monitor.sh db
```

## Production Considerations

### ✅ Future Enhancements
- [ ] SSL certificate setup (Let's Encrypt)
- [ ] Database migration to PostgreSQL/MySQL
- [ ] Load balancing for scaling
- [ ] CDN for static assets
- [ ] Monitoring and alerting setup
- [ ] Automated backups
- [ ] Log aggregation

---

## Quick Commands Reference

```bash
# Complete setup (first time)
./scripts/setup-digital-ocean.sh

# Deploy updates
./scripts/deploy-new-server.sh

# Monitor server
./scripts/server-monitor.sh status

# Health check
./scripts/health-check.sh

# View logs
./scripts/server-monitor.sh logs

# Restart services
./scripts/server-monitor.sh restart
```

**Deployment URL**: http://146.190.53.83
**Admin Login**: admin@blimp.com / SecureAdminPass123!
