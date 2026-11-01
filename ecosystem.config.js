module.exports = {
  apps: [
    {
      name: 'fish-backend',
      cwd: './apps/backend',
      script: 'node',
      args: 'dist/main.js',
      env_production: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '../../logs/backend-error.log',
      out_file: '../../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'fish-frontend',
      cwd: './apps/frontend',
      script: 'node_modules/.bin/next',
      // 3000 зайнятий іншим сайтом на сервері (fish-erp), тому фронтенд на 3100
      args: 'start -p 3100',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3100,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '../../logs/frontend-error.log',
      out_file: '../../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
