// ============================================================================
// LEGACY FILE - Use ecosystem.config.js instead
// ============================================================================
// This file is kept for reference only.
// The new deployment system uses ecosystem.config.js
// See DEPLOY_GUIDE.md for updated deployment instructions
// ============================================================================

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
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3333',
        APP_NAME: 'blimp-backend',
        APP_URL: 'http://10.124.0.2:3333',
        APP_KEY: 'YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-',
        LOG_LEVEL: 'info',
        SESSION_DRIVER: 'cookie',
        CORS_ORIGIN: '*',
        WS_CORS_ORIGIN: '*'
      },
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
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://10.124.0.2:3333',
        NEXT_PUBLIC_WS_URL: 'ws://10.124.0.2:3333',
        NEXT_PUBLIC_BACKEND_URL: 'http://10.124.0.2:3333'
      },
      kill_timeout: 5000,
    }
  ],
  deploy: {
    production: {
      user: 'root',
      host: '10.124.0.2',
      ref: 'origin/main',
      repo: 'git@github.com:olegkuftyrev/blimp1.git',
      path: '/opt/blimp1',
      'pre-deploy-local': '',
      'post-deploy': 'cd /opt/blimp1 && chmod +x scripts/prod-build.sh && ./scripts/prod-build.sh && pm2 reload ecosystem.config.cjs --update-env && pm2 save',
      'pre-setup': 'apt-get update -y && apt-get install -y git curl nginx && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs && npm i -g pm2'
    }
  }
}
