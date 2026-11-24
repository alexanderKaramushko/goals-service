#!/bin/sh

# Скрипт тестирования пропускной способности (RPS) и задержки запросов (latency)
# На текущий момент нужен для подбора максимального числа соединений в пуле сервера
# Как тестировать:
#   1. Обновляем env-переменную в MAX_POOL_SIZE
#   2. Запускаем скрипт с нужным REQUESTS, CONCURRENCY, ENDPOINT
#   3. Проверяем results.log

# Пример:
# MAX_POOL_SIZE=1, 1 запрос одновременно
# → CPU/DB недогружены
# MAX_POOL_SIZE=5, 5 запросов одновремено
# → RPS растёт
# MAX_POOL_SIZE=10, 10 запросов одновремено
# → RPS еще растёт
# MAX_POOL_SIZE=20, 20 запросов одновремено
# → concurrency растет
# → задержка растет
# → RPS НЕ растет
# ДОСТИГЛИ ПРЕДЕЛА РЕСУРСОВ

RESULTS_FILE="./results.log"
TIME_FILE="./time.log"

# !!! Переменные экспортируем, чтобы были видны в дочернем процессе sh

# Общее количество запросов
export REQUESTS=100
# Сколько запросов одновременно в работе
export CONCURRENCY=20

rm -f "$RESULTS_FILE" "$TIME_FILE"

# Токен доступа
export ACCESS_TOKEN=''
# Тестируемый эндпоинт
export ENDPOINT='http://localhost:3000/api/v1/steps/get-all/200801'

# Делаем $REQUESTS запросов, максимально одновременно $CONCURRENCY
/usr/bin/time -p -o "$TIME_FILE" \
  sh -c '
    seq 1 "$REQUESTS" | xargs -P"$CONCURRENCY" -I{} \
      curl -s -o /dev/null \
        -w "%{http_code} %{time_total}s\n" \
        --cookie "access_token=$ACCESS_TOKEN" \
        -H "x-user-timezone: Europe/Moscow" \
        "$ENDPOINT"
  ' \
  >> "$RESULTS_FILE"

# Берем общее затраченное время
total_time=$(awk '/^real / { print $2 }' "$TIME_FILE")

# Считаем, сколько примерно выполнялся один запрос по времени
rps=$(awk -v requests="$REQUESTS" -v time="$total_time" \
  'BEGIN { printf "%.2f", requests / time }')

{
  echo ""
  echo "Всего запросов: $REQUESTS"
  echo "Параллельно выполняли: $CONCURRENCY"
  echo "Общее время: ${total_time}s"
  echo "RPS (пропускная способность): $rps"
} >> "$RESULTS_FILE"

rm -f "$TIME_FILE"