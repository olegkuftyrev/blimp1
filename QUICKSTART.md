# ⚡ Quick Start - Deploy to Digital Ocean in 5 Minutes

## Prerequisites
- A Digital Ocean droplet with Ubuntu 22.04
- Root SSH access to your server
- Git repository set up

## Step 1: Configure (30 seconds)

Edit `deploy.config.sh`:
```bash
export DEPLOY_SERVER_IP="YOUR_SERVER_IP"      # Your droplet IP
export DEPLOY_SERVER_PASS="YOUR_PASSWORD"     # Or use SSH keys
```

## Step 2: Validate (10 seconds)

```bash
chmod +x scripts/*.sh
./scripts/validate-deployment.sh
```

## Step 3: Deploy (3-5 minutes)

```bash
./scripts/deploy-easy.sh
```

That's it! ✅

## Access Your Application

- **Frontend**: http://YOUR_SERVER_IP
- **Backend**: http://YOUR_SERVER_IP:3333
- **Login**: admin@blimp.com / (your DEPLOY_ADMIN_PASSWORD)

## Common Commands

```bash
# Check status
./scripts/server-monitor.sh status

# View logs
./scripts/server-monitor.sh logs

# Update application
./scripts/server-monitor.sh update

# Restart services
./scripts/server-monitor.sh restart
```

## Need More Details?

See [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) for complete documentation.

## Troubleshooting

**Can't connect?**
```bash
ping YOUR_SERVER_IP
ssh root@YOUR_SERVER_IP
```

**Services not starting?**
```bash
./scripts/server-monitor.sh logs
./scripts/server-monitor.sh restart
```

**Need to reset everything?**
```bash
ssh root@YOUR_SERVER_IP "pm2 delete all && pm2 start /opt/blimp1/ecosystem.config.js"
```

