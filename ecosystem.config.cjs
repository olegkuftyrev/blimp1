module.exports = {
  apps: [
    {
      name: 'blimp-backend',
      cwd: './backend',
      script: 'node',
      args: 'build/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env_file: '.env',
      env: {
        NODE_ENV: 'production'
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
  ]
}
