FROM php:8.2-cli

WORKDIR /app

COPY . .

RUN mkdir -p data
RUN php scripts/init_db.php

EXPOSE 10000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t ."]
