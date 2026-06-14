#!/usr/bin/env sh
set -e

if [ ! -f .env ]; then
  cp .env.docker .env
fi

if ! grep -q "^APP_KEY=base64:" .env; then
  php artisan key:generate --force --no-interaction
fi

echo "Attente de MySQL..."
until MYSQL_PWD="${DB_PASSWORD}" mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USERNAME}" --silent; do
  sleep 2
done

php artisan migrate --force

exec "$@"
