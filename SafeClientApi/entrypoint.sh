#!/bin/sh
set -e

APP_PORT=${PORT:-3000}

echo "▶ Iniciando API (TypeORM sync das tabelas) na porta $APP_PORT..."
node dist/main.js &
API_PID=$!

echo "⏳ Aguardando porta $APP_PORT ficar disponível..."
RETRIES=30
until nc -z localhost "$APP_PORT" 2>/dev/null || [ $RETRIES -eq 0 ]; do
  RETRIES=$((RETRIES - 1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ API não respondeu a tempo."
  kill $API_PID 2>/dev/null
  exit 1
fi

# Aguarda mais 2s para o TypeORM terminar o sync após a porta abrir
sleep 2

echo "✅ API pronta. Executando seed..."
node dist/database/seed.js || echo "⚠️  Seed finalizado com avisos (dados já existem?)"

echo "▶ API em execução (PID $API_PID)..."
wait $API_PID
