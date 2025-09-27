# Digital Ocean Deployment Configuration

## Server Details
- **IP Address**: 146.190.53.83
- **Root Password**: 2vcDpu-4gb-120gb-intel
- **Project Path**: /opt/blimp1

## Environment Variables

### Backend (.env)
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
```

### Frontend (.env.local)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://146.190.53.83:3333
NEXT_PUBLIC_WS_URL=http://146.190.53.83:3333
NEXT_PUBLIC_BACKEND_URL=http://146.190.53.83:3333
```

## Services
- **Backend**: Port 3333
- **Frontend**: Port 3000
- **PM2**: Process management
- **Nginx**: Reverse proxy (optional)

## Deployment Steps
1. Run `./scripts/deploy-new-server.sh`
2. Check PM2 status: `pm2 status`
3. View logs: `pm2 logs`
4. Restart services: `pm2 restart all`
