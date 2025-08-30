module.exports = {
  apps: [
    {
      name: 'scst-backend',
      script: 'backend/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '64.23.145.29',
      ref: 'origin/main',
      repo: 'https://github.com/olegkuftyrev/blimp1.git',
      path: '/root/scst',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
