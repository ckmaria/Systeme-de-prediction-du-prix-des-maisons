@echo off
cd /d "%~dp0..\backend-laravel"
composer install
if not exist .env copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
