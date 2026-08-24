#!/bin/bash
# =============================================================================
# Одноразове налаштування сервера (Ubuntu 22.04 LTS)
# Запускати від root або з sudo
# =============================================================================

set -e

DOMAIN="YOUR_DOMAIN"
APP_DIR="/var/www/fish-shop"

echo "=== [1/8] Оновлення пакетів ==="
apt update && apt upgrade -y

echo "=== [2/8] Встановлення Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v

echo "=== [3/8] Встановлення PostgreSQL ==="
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

echo "Створюємо БД та юзера PostgreSQL..."
echo "Введи пароль для юзера fish_user:"
read -s DB_PASS
sudo -u postgres psql -c "CREATE USER fish_user WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -c "CREATE DATABASE fish_shop OWNER fish_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fish_shop TO fish_user;"
echo ""
echo "DATABASE_URL=postgresql://fish_user:${DB_PASS}@localhost:5432/fish_shop"
echo "(запиши цей рядок — потрібен для .env)"

echo "=== [4/8] Встановлення Redis ==="
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
redis-cli ping

echo "=== [5/8] Встановлення Nginx ==="
apt install -y nginx
systemctl enable nginx
systemctl start nginx

echo "=== [6/8] Встановлення PM2 ==="
npm install -g pm2
pm2 startup systemd

echo "=== [7/8] Встановлення Certbot ==="
apt install -y certbot python3-certbot-nginx

echo "=== [8/8] Підготовка директорій ==="
mkdir -p $APP_DIR
mkdir -p /var/www/certbot
mkdir -p /var/log/fish-shop

echo ""
echo "======================================================"
echo "Сервер налаштовано! Наступні кроки:"
echo ""
echo "1. Клонувати репо:"
echo "   cd /var/www && git clone <your-repo-url> fish-shop"
echo ""
echo "2. Налаштувати .env файли (div нижче)"
echo ""
echo "3. Налаштувати nginx:"
echo "   sed -i 's/YOUR_DOMAIN/${DOMAIN}/g' /var/www/fish-shop/deploy/nginx.conf"
echo "   cp /var/www/fish-shop/deploy/nginx.conf /etc/nginx/sites-available/fish-shop"
echo "   ln -sf /etc/nginx/sites-available/fish-shop /etc/nginx/sites-enabled/fish-shop"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "4. SSL сертифікат:"
echo "   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "5. Запустити деплой:"
echo "   cd /var/www/fish-shop && bash deploy/deploy.sh"
echo "======================================================"
