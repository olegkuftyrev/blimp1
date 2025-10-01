/**
 * PM2 Ecosystem Configuration
 * 
 * This file configures PM2 process management for the application.
 * Environment variables are loaded from .env files or deploy.config.sh
 */

module.exports = {
  apps: [
    {
      name: 'blimp-backend',
      cwd: './backend',
      script: 'node',
      args: 'build/bin/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        HOST: process.env.DEPLOY_BACKEND_HOST || '0.0.0.0',
        PORT: process.env.DEPLOY_BACKEND_PORT || '3333',
        APP_NAME: 'blimp-backend',
        APP_URL: process.env.DEPLOY_API_URL || 'http://localhost:3333',
        APP_KEY: process.env.DEPLOY_APP_KEY || 'YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-',
        LOG_LEVEL: process.env.DEPLOY_LOG_LEVEL || 'info',
        SESSION_DRIVER: 'cookie',
        CORS_ORIGIN: '*',
        WS_CORS_ORIGIN: '*',
        // PostgreSQL configuration
        PG_HOST: process.env.DEPLOY_DB_HOST || 'localhost',
        PG_PORT: process.env.DEPLOY_DB_PORT || '5432',
        PG_USER: process.env.DEPLOY_DB_USER || 'postgres',
        PG_PASSWORD: process.env.DEPLOY_DB_PASS || 'postgres',
        PG_DB_NAME: process.env.DEPLOY_DB_NAME || 'blimp',
        PG_SSL: process.env.DEPLOY_DB_SSL || 'false',
        // Admin credentials
        ADMIN_EMAIL: process.env.DEPLOY_ADMIN_EMAIL || 'admin@blimp.com',
        ADMIN_PASSWORD: process.env.DEPLOY_ADMIN_PASSWORD || 'SecureAdminPass123!'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 5000,
    },
    {
      name: 'blimp-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.DEPLOY_FRONTEND_PORT || '3000',
        NEXT_PUBLIC_API_URL: process.env.DEPLOY_API_URL || 'http://localhost:3333',
        NEXT_PUBLIC_WS_URL: process.env.DEPLOY_WS_URL || 'ws://localhost:3333',
        NEXT_PUBLIC_BACKEND_URL: process.env.DEPLOY_API_URL || 'http://localhost:3333'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      kill_timeout: 5000,
    }
  ]
}

