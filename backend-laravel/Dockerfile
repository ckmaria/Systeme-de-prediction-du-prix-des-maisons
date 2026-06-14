FROM php:8.3-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-mysql-client \
        git \
        python3 \
        python3-pip \
        python3-venv \
        unzip \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

COPY backend-laravel/composer.json backend-laravel/composer.lock* ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-scripts --optimize-autoloader

COPY backend-laravel/ ./
COPY ia/ /var/www/ia/

RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r /var/www/ia/requirements.txt \
    && /opt/venv/bin/python /var/www/ia/train_model.py \
    && composer dump-autoload --optimize \
    && chmod +x docker-entrypoint.sh

ENV PATH="/opt/venv/bin:${PATH}"

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
