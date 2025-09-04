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
        APP_URL: 'http://64.23.169.176:3333',
        APP_KEY: 'YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-',
        LOG_LEVEL: 'info',
        SESSION_DRIVER: 'cookie',
        CORS_ORIGIN: '*',
        SQLITE_DB_PATH: './tmp/db.sqlite3',
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
        NODE_ENV: 'production'
      },
      kill_timeout: 5000,
    }
  ],
  deploy: {
    production: {
      user: 'root',
      host: '64.23.169.176',
      ref: 'origin/main',
      repo: 'https://github.com/olegkuftyrev/blimp1.git', // Замени на свой репозиторий
      path: '/opt/blimp1',
      'pre-deploy-local': '',
      'post-deploy': 'cd /opt/blimp1 && chmod +x scripts/prod-build.sh && ./scripts/prod-build.sh && pm2 reload ecosystem.config.cjs --update-env && pm2 save',
      'pre-setup': 'apt-get update -y && apt-get install -y git curl nginx && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs && npm i -g pm2'
    }
  }
}
