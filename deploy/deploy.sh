#!/bin/bash
# =============================================================================
# Скрипт деплою / оновлення (запускати на сервері в /var/www/fish-shop)
# =============================================================================

set -e

APP_DIR="/var/www/fish-shop"
cd $APP_DIR

echo "=== [1/6] Отримуємо нові зміни ==="
git pull origin main

echo "=== [2/6] Встановлюємо залежності ==="
npm install --workspaces

echo "=== [3/6] Збираємо бекенд ==="
npm run build --workspace=apps/backend

echo "=== [4/6] Мігруємо базу даних ==="
cd apps/backend
npx prisma migrate deploy
cd $APP_DIR

echo "=== [5/6] Збираємо фронтенд ==="
# ВАЖЛИВО: .env.local або змінні середовища мають бути встановлені ДО збірки
# бо NEXT_PUBLIC_* вбудовуються в час компіляції
npm run build --workspace=apps/frontend

echo "=== [6/6] Перезапускаємо PM2 ==="
# Перший запуск:
#   pm2 start ecosystem.config.js --env production
# Подальші оновлення:
if pm2 describe fish-backend > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js --env production
else
  pm2 start ecosystem.config.js --env production
fi

pm2 save

echo ""
echo "Деплой завершено!"
pm2 status
