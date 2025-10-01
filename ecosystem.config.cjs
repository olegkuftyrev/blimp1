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
        APP_URL: 'http://146.190.53.83:3333',
        APP_KEY: 'YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-',
        LOG_LEVEL: 'info',
        SESSION_DRIVER: 'cookie',
        CORS_ORIGIN: '*',
        WS_CORS_ORIGIN: '*',
        // PostgreSQL configuration
        PG_HOST: 'localhost',
        PG_PORT: '5432',
        PG_USER: 'postgres',
        PG_PASSWORD: 'postgres',
        PG_DB_NAME: 'blimp',
        PG_SSL: 'false'
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
        NEXT_PUBLIC_API_URL: 'http://146.190.53.83:3333',
        NEXT_PUBLIC_WS_URL: 'ws://146.190.53.83:3333',
        NEXT_PUBLIC_BACKEND_URL: 'http://146.190.53.83:3333'
      },
      kill_timeout: 5000,
    }
  ]
}
