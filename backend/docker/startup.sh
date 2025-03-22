#!/bin/bash

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! nc -z db 3306; do
    sleep 1
done
echo "MySQL is ready!"

# Generate application key if not set
php artisan key:generate --force

# Clear any existing cache
php artisan config:clear
php artisan cache:clear

# Run database migrations and seeders
echo "Running migrations..."
php artisan migrate --force
echo "Running seeders..."
php artisan db:seed --force

# Start PHP-FPM
php-fpm 