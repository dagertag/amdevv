FROM php:8.2-fpm

# Устанавливаем нужные расширения PHP
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Устанавливаем Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Рабочая директория
WORKDIR /var/www/html
